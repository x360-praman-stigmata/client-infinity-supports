"use client";

import { useEffect, useCallback, useState } from 'react';
import { useToast } from '@/components/ui/Toast';

interface EnhancedFormWrapperProps {
  children: React.ReactNode;
  onSave: (isSubmit?: boolean) => Promise<void>;
  hasUnsavedChanges: boolean;
  autoSaveInterval?: number; // Auto-save every X seconds
  enableKeyboardShortcuts?: boolean;
}

export default function EnhancedFormWrapper({
  children,
  onSave,
  hasUnsavedChanges,
  autoSaveInterval = 30000, // 30 seconds
  enableKeyboardShortcuts = true
}: EnhancedFormWrapperProps) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const { showToast } = useToast();

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges || !autoSaveInterval) return;

    const autoSaveTimer = setTimeout(async () => {
      if (hasUnsavedChanges) {
        setIsAutoSaving(true);
        try {
          await onSave(false);
          setLastSaved(new Date());
          showToast({
            type: 'success',
            title: 'Auto-saved',
            message: 'Your changes have been automatically saved',
            duration: 2000
          });
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsAutoSaving(false);
        }
      }
    }, autoSaveInterval);

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, autoSaveInterval, onSave, showToast]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    if (!enableKeyboardShortcuts) return;

    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      try {
        await onSave(false);
        setLastSaved(new Date());
        showToast({
          type: 'success',
          title: 'Saved',
          message: 'Form saved successfully',
          duration: 2000
        });
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Save Failed',
          message: 'Failed to save form',
          duration: 3000
        });
      }
    }
  }, [onSave, enableKeyboardShortcuts, showToast]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Warn before page unload if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div className="relative">
      {/* Status indicator */}
      <div className="fixed top-4 right-4 z-40">
        {isAutoSaving && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center gap-2">
            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Auto-saving...
          </div>
        )}
        
        {hasUnsavedChanges && !isAutoSaving && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
            Unsaved changes
          </div>
        )}
        
        {lastSaved && !hasUnsavedChanges && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
            Saved {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Keyboard shortcuts help */}
      {enableKeyboardShortcuts && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-75">
            Ctrl+S to save
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
