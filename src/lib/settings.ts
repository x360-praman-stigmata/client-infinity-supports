// Settings utility functions for easy access throughout the application

interface AppSetting {
  id: number;
  key: string;
  value: string | null;
  type: string;
  category: string;
  label: string;
  description?: string;
  isRequired: boolean;
  defaultValue?: string;
  validation?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GroupedSettings {
  [category: string]: AppSetting[];
}

// Cache for settings to avoid repeated API calls
let settingsCache: GroupedSettings | any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all settings from the API
 */
export async function fetchSettings(forceRefresh = false): Promise<GroupedSettings> {
  const now = Date.now();
  
  // Return cached settings if still valid and not forcing refresh
  if (!forceRefresh && settingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return settingsCache;
  }

  try {
    const response = await fetch('/api/settings');
    
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    const data = await response.json();
    settingsCache = data.settings || {};
    cacheTimestamp = now;
    
    return settingsCache;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return settingsCache || {};
  }
}


export async function fetchFormSpecificSettings(forceRefresh = false): Promise<GroupedSettings> {
  const now = Date.now();
  
  // Return cached settings if still valid and not forcing refresh
  if (!forceRefresh && settingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return settingsCache;
  }

  try {
    const response = await fetch('/api/settings?forms=true');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Settings API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch settings: ${response.status} ${response.statusText}`);
    }

    console.log('Fetched form-specific settings:', response);

    const data = await response.json();
    settingsCache = data.settings || {};
    cacheTimestamp = now;
    
    return settingsCache;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return settingsCache || {};
  }
}
/**
 * Get a specific setting value by key
 */
export async function getSetting(key: string, defaultValue?: string): Promise<string | null> {
  const settings = await fetchSettings();
  
  // Search through all categories for the setting
  for (const category of Object.values(settings)) {
    const setting = category.find(s => s.key === key);
    if (setting) {
      return setting.value || setting.defaultValue || defaultValue || null;
    }
  }
  
  return defaultValue || null;
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(category: string): Promise<AppSetting[]> {
  const settings = await fetchSettings();
  return settings[category] || [];
}

/**
 * Get form metadata settings (commonly used)
 */
export async function getFormMetadata(): Promise<{
  companyWebsite: string | null;
  reviewDate: string | null;
}> {
  const [companyWebsite, reviewDate] = await Promise.all([
    getSetting('company_website'),
    getSetting('review_date')
  ]);

  return {
    companyWebsite,
    reviewDate
  };
}

/**
 * Get email configuration settings
 */
export async function getEmailSettings(): Promise<{
  fromEmail: string | null;
  appId: string | null;
}> {
  const [fromEmail, appId] = await Promise.all([
    getSetting('from_email'),
    getSetting('email_app_id')
  ]);

  return {
    fromEmail,
    appId
  };
}

/**
 * Check if email settings are configured
 */
export async function isEmailConfigured(): Promise<boolean> {
  const emailSettings = await getEmailSettings();
  return !!(emailSettings.fromEmail && emailSettings.appId);
}

/**
 * Update a single setting
 */
export async function updateSetting(key: string, value: string): Promise<boolean> {
  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        settings: [{ key, value }] 
      })
    });

    if (response.ok) {
      // Clear cache to force refresh on next fetch
      settingsCache = null;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating setting:', error);
    return false;
  }
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(settings: Array<{ key: string; value: string }>): Promise<boolean> {
  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings })
    });

    if (response.ok) {
      // Clear cache to force refresh on next fetch
      settingsCache = null;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
}

/**
 * Validate setting value based on type and validation rules
 */
export function validateSettingValue(setting: AppSetting, value: string): { isValid: boolean; error?: string } {
  // Required field validation
  if (setting.isRequired && (!value || value.trim() === '')) {
    return { isValid: false, error: `${setting.label} is required` };
  }

  // Type-specific validation
  switch (setting.type) {
    case 'url':
      if (value && !isValidUrl(value)) {
        return { isValid: false, error: 'Please enter a valid URL' };
      }
      break;
      
    case 'email':
      if (value && !isValidEmail(value)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
      break;
      
    case 'number':
      if (value && isNaN(Number(value))) {
        return { isValid: false, error: 'Please enter a valid number' };
      }
      break;
      
    case 'date':
      if (value && !isValidDate(value)) {
        return { isValid: false, error: 'Please enter a valid date' };
      }
      break;
  }

  // Custom validation rules (if provided as JSON)
  if (setting.validation) {
    try {
      const rules = JSON.parse(setting.validation);
      
      if (rules.minLength && value.length < rules.minLength) {
        return { isValid: false, error: `Minimum length is ${rules.minLength} characters` };
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        return { isValid: false, error: `Maximum length is ${rules.maxLength} characters` };
      }
      
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
        return { isValid: false, error: rules.patternError || 'Invalid format' };
      }
      
    } catch (error) {
      console.warn('Invalid validation rules JSON:', setting.validation);
    }
  }

  return { isValid: true };
}

// Helper validation functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDate(date: string): boolean {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

/**
 * Clear settings cache (useful after updates)
 */
export function clearSettingsCache(): void {
  settingsCache = null;
  cacheTimestamp = 0;
}

/**
 * Get default settings for initialization
 */
export function getDefaultSettings(): Array<Omit<AppSetting, 'id' | 'createdAt' | 'updatedAt'>> {
  return [
    {
      key: 'company_website',
      value: '',
      type: 'url',
      category: 'form_metadata',
      label: 'Company Website',
      description: 'Company website URL that appears on forms',
      isRequired: true,
      defaultValue: '',
      validation: JSON.stringify({
        pattern: '^https?://.+',
        patternError: 'URL must start with http:// or https://'
      }),
      sortOrder: 1,
      isActive: true
    },
    {
      key: 'review_date',
      value: new Date().toISOString().split('T')[0],
      type: 'date',
      category: 'form_metadata',
      label: 'Review Date',
      description: 'Default review date for forms',
      isRequired: true,
      defaultValue: new Date().toISOString().split('T')[0],
      sortOrder: 2,
      isActive: true
    },
    {
      key: 'from_email',
      value: '',
      type: 'email',
      category: 'email_settings',
      label: 'From Email Address',
      description: 'Email address used as sender for all outgoing emails',
      isRequired: true,
      defaultValue: '',
      validation: JSON.stringify({
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        patternError: 'Please enter a valid email address'
      }),
      sortOrder: 1,
      isActive: true
    },
    {
      key: 'email_app_id',
      value: '',
      type: 'password',
      category: 'email_settings',
      label: 'Email Service App ID',
      description: 'Secret App ID or API key for email service integration (e.g., SendGrid, Mailgun, AWS SES)',
      isRequired: true,
      defaultValue: '',
      validation: JSON.stringify({
        minLength: 10,
        maxLength: 200
      }),
      sortOrder: 2,
      isActive: true
    },
    {
      key: 'company_name',
      value: '',
      type: 'string',
      category: 'company',
      label: 'Company Name',
      description: 'Official company name',
      isRequired: true,
      defaultValue: '',
      validation: JSON.stringify({
        minLength: 2,
        maxLength: 100
      }),
      sortOrder: 1,
      isActive: true
    },
    {
      key: 'company_address',
      value: '',
      type: 'string',
      category: 'company',
      label: 'Company Address',
      description: 'Company physical address',
      isRequired: false,
      defaultValue: '',
      sortOrder: 2,
      isActive: true
    },
    {
      key: 'support_email',
      value: '',
      type: 'email',
      category: 'company',
      label: 'Support Email',
      description: 'Email address for customer support',
      isRequired: false,
      defaultValue: '',
      sortOrder: 3,
      isActive: true
    }
  ];
}
