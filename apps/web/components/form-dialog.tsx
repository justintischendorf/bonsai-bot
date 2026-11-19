import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { type ComponentProps, type ComponentType, type ReactNode } from "react";

import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CARD } from "@/lib/styles";
import { cn } from "@/lib/utils";

import { Eyebrow } from "./decor";

export const FORM_DIALOG_CONTENT = cn(
  CARD,
  "fixed max-h-[calc(100dvh-2rem)] gap-6 overflow-x-hidden overflow-y-auto overscroll-contain p-6 ring-white/10 sm:max-w-md sm:p-8",
);

export function FormDialogHeader({
  Icon,
  eyebrow,
  title,
  children,
}: {
  Icon: LucideIcon;
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <DialogHeader className="gap-4">
      <span className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-b from-bonsai-leaf/25 to-bonsai-leaf/0 text-bonsai-leaf-light shadow-[inset_0_1px_0_0_rgb(255_255_255/0.1),0_0_30px_-8px_#4ade8066]">
        <Icon className="size-6" />
      </span>
      <div className="flex flex-col gap-2">
        <Eyebrow>{eyebrow}</Eyebrow>
        <DialogTitle className="text-2xl font-medium tracking-tight text-white">
          {title}
        </DialogTitle>
        {children && (
          <DialogDescription className="leading-relaxed text-pretty text-neutral-400">
            {children}
          </DialogDescription>
        )}
      </div>
    </DialogHeader>
  );
}

export function IconField({
  id,
  label,
  Icon,
  href,
  hrefLabel,
  ...inputProps
}: {
  id: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  href?: string;
  hrefLabel?: string;
} & Omit<ComponentProps<typeof Input>, "id">) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-neutral-200">
          {label}
        </Label>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 rounded-sm text-xs font-medium text-neutral-500 transition-colors outline-none hover:text-bonsai-leaf-light focus-visible:text-bonsai-leaf-light focus-visible:underline"
          >
            {hrefLabel ?? "Öffnen"}
            <ArrowUpRight className="size-3.5" />
          </a>
        )}
      </div>
      <div className="group/input relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within/input:text-bonsai-leaf-light" />
        <Input
          id={id}
          className="h-11 rounded-xl border-white/10 bg-black/40 pr-3.5 pl-10 transition-colors placeholder:text-neutral-600 hover:border-white/20 focus-visible:border-bonsai-leaf-light/60 focus-visible:ring-bonsai-leaf/20 dark:bg-black/40"
          {...inputProps}
        />
      </div>
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 font-mono text-xs tracking-wider text-neutral-500 uppercase">
      <span className="h-px flex-1 bg-white/10" />
      oder
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function FormDialogFooter({ children }: { children: ReactNode }) {
  return (
    <DialogFooter className="mx-0 mb-0 rounded-none border-white/10 bg-transparent px-0 pt-6 pb-0">
      {children}
    </DialogFooter>
  );
}
