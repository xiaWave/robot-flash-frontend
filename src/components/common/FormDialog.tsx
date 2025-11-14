import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit?: () => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  disabled?: boolean;
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  preventCloseOnSubmit?: boolean;
}

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitText = '确定',
  cancelText = '取消',
  loading = false,
  disabled = false,
  width = 'md',
  preventCloseOnSubmit = false,
}: FormDialogProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && !loading && !disabled) {
      await onSubmit();
      if (!preventCloseOnSubmit) {
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={widthClasses[width]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            {children}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {cancelText}
            </Button>
            
            {onSubmit && (
              <Button
                type="submit"
                disabled={disabled || loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {submitText}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}