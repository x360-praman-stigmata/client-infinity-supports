# BackToFormsModal Integration Guide

## ✅ **All Requirements Implemented:**

### 1. **Re-open Download Modal** ✅

- **Download Now button** already exists in `FormLockWrapper.tsx` (lines 114-122)
- When user cancels the download modal, they can click "Download Now" in the locked form area to re-open it

### 2. **Persistent Download Tracking** ✅

- Database tracking is already implemented in `StaffFormDownload` table
- `FormLockWrapper` checks download status on mount and only shows modal if not downloaded
- Once downloaded, the modal won't appear again even if user returns to the form

### 3. **Common "Back to Forms" Confirmation Modal** ✅

- Created reusable `BackToFormsModal` component
- Integrated in Employee Welcome and Pre-Employment Medical forms as examples

## **Integration Steps for Other Forms:**

### **Step 1: Add Imports**

```tsx
import BackToFormsModal from "@/components/ui/BackToFormsModal";
import { useToast } from "@/components/ui/Toast";
```

### **Step 2: Add State Variables**

```tsx
const { showToast } = useToast();
const [showBackModal, setShowBackModal] = useState(false);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
```

### **Step 3: Update Back Button**

```tsx
<button
  onClick={() => setShowBackModal(true)}
  className="px-4 py-2 text-gray-600 hover:text-gray-800"
>
  ← Back to Forms
</button>
```

### **Step 4: Add Modal Component**

```tsx
{
  /* Back to Forms Confirmation Modal */
}
<BackToFormsModal
  isOpen={showBackModal}
  onClose={() => setShowBackModal(false)}
  onSaveAndExit={() => {
    handleSave(false);
    setShowBackModal(false);
    router.push(`/staff/onboard/${token}`);
  }}
  onDiscardAndExit={() => {
    setShowBackModal(false);
    router.push(`/staff/onboard/${token}`);
  }}
  formName="Your Form Name"
  hasUnsavedChanges={hasUnsavedChanges}
/>;
```

### **Step 5: Track Unsaved Changes (Optional)**

```tsx
// Add useEffect to monitor form data changes
useEffect(() => {
  const hasChanges = Object.keys(formData).some((key) => {
    const value = formData[key];
    return value !== undefined && value !== null && value !== "";
  });
  setHasUnsavedChanges(hasChanges);
}, [formData]);

// Reset hasUnsavedChanges when saving
const handleSave = async (isSubmit = false) => {
  // ... existing save logic ...
  if (success) {
    setHasUnsavedChanges(false);
  }
};
```

## **Forms to Update:**

- ✅ Employee Welcome (completed)
- ✅ Pre-Employment Medical (completed)
- ⏳ Vehicle Safety Inspection
- ⏳ Support Worker
- ⏳ Super Choice Form
- ⏳ Orientation
- ⏳ NDIS Workforce
- ⏳ NDIS Code of Conduct
- ⏳ Government Tax
- ⏳ Fair Work Information
- ⏳ Employee Details
- ⏳ Conflict of Interest
- ⏳ Casual Employment Information
- ⏳ Bullying Training
- ⏳ Bullying Harassment Welcome
- ⏳ Bullying Harassment
- ⏳ Acknowledgement Edit

## **Features:**

### **Download Modal Behavior:**

1. **First Visit**: Shows download modal
2. **Cancel Modal**: **User is redirected back to form list** (cannot access form without downloading)
3. **Download PDF**: Form unlocks and user can fill it out
4. **After Download**: Modal never shows again (tracked in database)
5. **Return Visit**: Form unlocks immediately if previously downloaded

**Important**: If user cancels the download modal, they are automatically redirected to the form list page. They cannot access the locked form until they download the PDF.

**Bonus**: After form completion, users can still download the PDF again if they deleted it from their local storage.

### **Back to Forms Modal:**

1. **No Changes**: Direct navigation to forms list
2. **Has Changes**: Shows confirmation modal with 3 options:
   - **Save & Back to Forms**: Saves draft and navigates
   - **Don't Save & Back to Forms**: Discards changes and navigates
   - **Cancel**: Returns to form

### **Form Locking:**

- Only applies to forms that require PDF download (like Employee Welcome)
- Other forms work normally without download requirements
- `FormLockWrapper` component handles all download logic automatically

### **For Forms with Download Requirements:**

When using `FormLockWrapper`, add the `onCancelDownload` prop:

```tsx
<FormLockWrapper
  staffId={staff.id}
  formKey={formConfig.key}
  formName={formConfig.name}
  pdfUrl={formConfig.pdfUrl}
  isFormComplete={isFormComplete}
  onCancelDownload={() => router.push(`/staff/onboard/${token}`)}
>
  {/* Your form component */}
</FormLockWrapper>
```

This ensures that when users cancel the download modal, they are redirected back to the form list instead of staying on a locked form.

### **Download Button for Completed Forms:**

For forms that require PDF downloads, add a download button in the completed form view so users can re-download the PDF if they deleted it locally:

```tsx
import FormDownloadButton from "@/components/ui/FormDownloadButton";

// In your form view component (when form is complete)
<FormDownloadButton
  pdfUrl="/path/to/your/form.pdf"
  fileName="Your Form Name.pdf"
  formName="Your Form Name"
  description="Download the complete document for your records"
/>;
```

This provides a permanent download option for users who completed the form but need to re-download the PDF.

### **Pre-filling Form Data:**

For forms that need to pre-fill data from the database (like staff names), implement loading states and data fetching:

```tsx
const [dataLoading, setDataLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      setDataLoading(true);
      const response = await fetch(`/api/staff/onboard/${token}`);
      const result = await response.json();

      // Pre-fill with staff data
      const staffName = result.staff
        ? `${result.staff.firstName} ${result.staff.surname}`.trim()
        : "";

      // Load saved form data or use staff data
      if (result.submissions?.form_key) {
        setData({
          ...result.submissions.form_key,
          fullName: result.submissions.form_key.fullName || staffName,
        });
      } else {
        setData({ fullName: staffName /* other fields */ });
      }
    } finally {
      setDataLoading(false);
    }
  };
  loadData();
}, [token]);

// Show loading state
if (dataLoading) {
  return <LoadingSpinner />;
}
```

This ensures forms are pre-filled with relevant data and show proper loading states.
