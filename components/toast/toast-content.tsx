'use client';

interface ToastContentProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function ToastContent({ title, description, icon }: ToastContentProps) {
  return (
    <div className="flex items-start gap-3 w-full">
      {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <h4 className="font-heading text-sm font-semibold">{title}</h4>
        {description && (
          <p className="font-sans text-xs text-muted-foreground mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}