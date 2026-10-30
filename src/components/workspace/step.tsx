import type { ReactNode } from 'react';

interface StepProps {
  number: number;
  title: string;
  description?: string;
  children: ReactNode;
}

/** Numbered section of a multi-step form (merge / create). */
export function Step({ number, title, description, children }: StepProps) {
  return (
    <section className="space-y-3">
      <header className="flex items-start gap-3">
        <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
          {number}
        </span>
        <div>
          <h3 className="leading-6 font-semibold">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </header>
      <div className="sm:pl-9">{children}</div>
    </section>
  );
}
