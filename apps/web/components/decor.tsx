import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Divider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-px bg-linear-to-r from-transparent via-white/15 to-transparent",
        className,
      )}
    />
  );
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex size-2 shrink-0", className)}>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-bonsai-leaf-light opacity-75 motion-reduce:animate-none" />
      <span className="relative inline-flex size-2 rounded-full bg-bonsai-leaf-light" />
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-2 font-mono text-xs tracking-wider text-bonsai-leaf-light uppercase">
      <span aria-hidden className="h-px w-6 bg-bonsai-leaf-light/60" />
      {children}
    </span>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
}: {
  id: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className="text-2xl font-medium tracking-tight text-white sm:text-4xl"
      >
        {title}
      </h2>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  Icon,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  Icon: LucideIcon;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="flex max-w-3xl min-w-0 flex-col gap-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="flex min-w-0 items-center gap-4 text-4xl font-medium tracking-tight text-white sm:text-5xl">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-b from-bonsai-leaf/25 to-bonsai-leaf/0 text-bonsai-leaf-light shadow-[inset_0_1px_0_0_rgb(255_255_255/0.1),0_0_30px_-8px_#4ade8066] sm:size-14">
              <Icon className="size-6 sm:size-7" />
            </span>
            <span className="min-w-0 truncate">{title}</span>
          </h1>
          {children && (
            <p className="text-lg leading-relaxed text-pretty text-neutral-400 [&_strong]:font-medium [&_strong]:text-neutral-100">
              {children}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
