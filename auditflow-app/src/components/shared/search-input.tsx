import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

type SearchInputProps = {
  placeholder: string;
  className?: string;
};

export function SearchInput({ placeholder, className }: SearchInputProps) {
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
        className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        placeholder={placeholder}
        type="search"
      />
    </label>
  );
}
