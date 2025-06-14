
export enum ToastVariant {
  DEFAULT = "default",
  DESTRUCTIVE = "destructive"
}

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}
