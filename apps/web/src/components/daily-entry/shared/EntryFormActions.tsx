import React from 'react';
import { Button } from '../../common/Button';

interface EntryFormActionsProps {
  onCancel: () => void;
  isEdit?: boolean;
  saveLabel?: string;
  disabled?: boolean;
}

export const EntryFormActions: React.FC<EntryFormActionsProps> = ({
  onCancel,
  isEdit = false,
  saveLabel,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1C2027] dark:border-[#1C2027] light:border-neutral-200">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="font-mono text-xs"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={disabled}
        className="font-mono text-xs bg-[#FF7138] hover:bg-[#FF8352] text-white"
      >
        {saveLabel || (isEdit ? 'Update Entry' : 'Save Entry')}
      </Button>
    </div>
  );
};

