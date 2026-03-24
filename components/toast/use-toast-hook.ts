'use client';

import { toast as sonnerToast, ExternalToast } from 'sonner';

export function useToast() {
  const toast = {
    success: (message: string, options?: ExternalToast) => {
      sonnerToast.success(message, options);
    },
    
    error: (message: string, options?: ExternalToast) => {
      sonnerToast.error(message, options);
    },
    
    info: (message: string, options?: ExternalToast) => {
      sonnerToast.info(message, options);
    },
    
    warning: (message: string, options?: ExternalToast) => {
      sonnerToast.warning(message, options);
    },
    
    loading: (message: string, options?: ExternalToast) => {
      return sonnerToast.loading(message, options);
    },
    
    promise: <T,>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      }
    ) => {
      return sonnerToast.promise(promise, options);
    },
    
    custom: (element: React.ReactElement, options?: ExternalToast) => {
      return sonnerToast.custom(() => element, options);
    },
    
    dismiss: (id?: string | number) => {
      sonnerToast.dismiss(id);
    },
  };
  
  return { toast };
}