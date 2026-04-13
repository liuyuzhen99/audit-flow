import type { ComponentPropsWithoutRef } from "react";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

type SearchInputProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  placeholder: string;
  className?: string;
  inputClassName?: string;
};

export function SearchInput({ className, inputClassName, placeholder, ...props }: SearchInputProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 shadow-sm",
        className,
      )}
    >
      <Search className="h-4 w-4 text-slate-400" />
      <input
        aria-label={placeholder}
        className={cn(
          "w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400",
          inputClassName,
        )}
        placeholder={placeholder}
        type="search"
        {...props}
      />
    </label>
  );
}
