// API client functions for interacting with the backend

// Form API functions
export async function getForms() {
  const response = await fetch('/api/forms');
  if (!response.ok) {
    throw new Error('Failed to fetch forms');
  }
  return response.json();
}

export async function getFormVersions(formKey: string) {
  const response = await fetch(`/api/forms?formKey=${encodeURIComponent(formKey)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch form versions');
  }
  return response.json();
}

export async function getForm(id: number) {
  const response = await fetch(`/api/forms/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch form');
  }
  return response.json();
}

export async function createForm(formData: {
  formKey: string;
  title: string;
  schema: any;
}) {
  const response = await fetch('/api/forms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create form');
  }
  
  return response.json();
}

export async function getClients(options?: {
  search?: string;
  filters?: {
    state?: string;
    sex?: string;
    hasNdis?: boolean;
    hasDisability?: boolean;
  };
  page?: number;
  pageSize?: number;
}) {
  let url = '/api/clients';
  const params = new URLSearchParams();

  // Add search parameter
  if (options?.search) {
    params.append('search', options.search);
  }

  // Add filter parameters
  if (options?.filters) {
    if (options.filters.state) params.append('state', options.filters.state);
    if (options.filters.sex) params.append('sex', options.filters.sex);
    if (options.filters.hasNdis !== undefined) params.append('hasNdis', String(options.filters.hasNdis));
    if (options.filters.hasDisability !== undefined) params.append('hasDisability', String(options.filters.hasDisability));
  }

  // Add pagination parameters
  if (options?.page !== undefined) params.append('page', String(options.page));
  if (options?.pageSize !== undefined) params.append('pageSize', String(options.pageSize));

  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  return response.json();
}

export async function getClient(id: number) {
  const response = await fetch(`/api/clients/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch client');
  }
  return response.json();
}

export async function createClient(clientData: {
  name?: string;
  email?: string;
  phone?: string;
  commonFields?: {
    age?: number;
    sex?: string;
    street?: string;
    state?: string;
    postCode?: string;
    dob?: string;
    ndis?: string;
    disability?: string;
    address?: string;
    surname?: string
  };
}) {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create client');
  }
  
  return response.json();
}

export async function updateClient(id: number, clientData: {
  name: string;
  email?: string;
  phone?: string;
  commonFields?: {
    age?: number;
    sex?: string;
    street?: string;
    state?: string;
    postCode?: string;
    dob?: string;
    ndis?: string;
    disability?: string;
    address?: string;
  };
}) {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update client');
  }
  
  return response.json();
}

export async function deleteClient(id: number) {
  const response = await fetch(`/api/clients/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete client');
  }
  
  return response.json();
}

// Staff API functions
export async function getStaff(options?: { search?: string; page?: number; pageSize?: number }) {
  let url = '/api/staff';
  const params = new URLSearchParams();
  if (options?.search) params.append('search', options.search);
  if (options?.page !== undefined) params.append('page', String(options.page));
  if (options?.pageSize !== undefined) params.append('pageSize', String(options.pageSize));
  const qs = params.toString();
  if (qs) url += `?${qs}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch staff');
  return res.json();
}

export async function createStaff(staffData: {
  firstName: string;
  surname: string;
  email: string;
  phone?: string;
}) {
  const res = await fetch('/api/staff', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staffData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create staff');
  }
  return res.json();
}

export async function generateStaffLink(staffId: number) {
  const res = await fetch(`/api/staff/${staffId}/generate-link`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate link');
  }
  return res.json();
}

export async function getStaffById(id: number) {
  const res = await fetch(`/api/staff/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch staff');
  }
  return res.json();
}

export async function deleteStaff(id: number) {
  const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete staff');
  }
  return res.json();
}

// Client Forms API functions
export async function getClientForms(clientId: number) {
  const response = await fetch(`/api/clients/${clientId}/forms`);
  if (!response.ok) {
    throw new Error('Failed to fetch client forms');
  }
  return response.json();
}

export async function getClientFormAssignments(clientId: number) {
  const response = await fetch(`/api/clients/${clientId}/form-assignments`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch client form assignments');
  }
  return response.json();
}

// export async function assignFormToClient(clientId: number, data: {
//   formId: number;
//   expiresAt: string; // ISO date string
// }) {
//   const response = await fetch(`/api/clients/${clientId}/forms/assign`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
//   });
  
//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error.error || 'Failed to assign form');
//   }
  
//   return response.json();
// }

export async function assignFormBatchToClient(clientId: number, data: {
  formIds: number[];
  expiresAt: string; // ISO date string
}) {
  const response = await fetch(`/api/clients/${clientId}/forms/assign-batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to assign form batch');
  }
  
  return response.json();
}

export async function getClientFormSubmission(clientId: number, formId: number) {
  const response = await fetch(`/api/clients/${clientId}/forms/${formId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch form submission');
  }
  return response.json();
}

export async function saveClientFormSubmission(clientId: number, formId: number, data: {
  data: any;
  isSubmitted?: boolean;
}) {
  const response = await fetch(`/api/clients/${clientId}/forms/${formId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save form submission');
  }
  
  return response.json();
}

// Form Access API functions
export async function getFormBatchByToken(token: string, passcode?: string) {
  let url = `/api/forms/access/${token}`;
  if (passcode) {
    url += `?passcode=${encodeURIComponent(passcode)}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to access forms');
  }
  
  return response.json();
}

export async function updateCommonFields(token: string, commonFieldsData: any, passcode?: string) {
  let url = `/api/forms/access/${token}/common-fields`;
  if (passcode) {
    url += `?passcode=${encodeURIComponent(passcode)}`;
  }
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commonFieldsData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update common fields');
  }
  
  return response.json();
}

export async function getFormDataByToken(
  batchToken: string,
  formId: number,
  passcode?: string
) {
  const url = `/api/forms/view/${batchToken}/data?formId=${formId}&passcode=${encodeURIComponent(passcode || "")}`;
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch form data");
  }
  return res.json();
}

export async function saveFormDataByToken(
  batchToken: string,
  { formId, data, isSubmitted }: { formId: number, data: any, isSubmitted?: boolean },
  passcode?: string
) {
  const url = `/api/forms/view/${batchToken}/data?passcode=${encodeURIComponent(passcode || "")}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formId, data, isSubmitted }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to save form data");
  }
  return res.json();
}

// PDF Generation
export function generatePdfUrl(options: {
  formKey?: string;
  formId?: number;
  clientId?: number;
  download?: boolean;
}) {
  const params = new URLSearchParams();
  
  if (options.formKey) {
    params.append('formKey', options.formKey);
  }
  
  if (options.formId) {
    params.append('formId', options.formId.toString());
  }
  
  if (options.clientId) {
    params.append('clientId', options.clientId.toString());
  }
  
  if (options.download) {
    params.append('download', 'true');
  }
  
  return `/api/generate-pdf?${params.toString()}`;
}
// Form Schema API functions
export async function getFormSchemaById(formId: number) {
  const response = await fetch(`/api/forms/schema/${formId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch form schema');
  }
  return response.json();
}


