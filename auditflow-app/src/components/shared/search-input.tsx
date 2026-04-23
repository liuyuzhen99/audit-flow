import { useEffect, useRef, useState, type ChangeEvent, type ComponentPropsWithoutRef, type CompositionEvent } from "react";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

type SearchInputProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "onChange"> & {
  placeholder: string;
  className?: string;
  inputClassName?: string;
  debounceMs?: number;
  onPendingChange?: (pending: boolean) => void;
  onValueChange?: (value: string) => void;
};

export function SearchInput({
  className,
  debounceMs = 400,
  inputClassName,
  onPendingChange,
  onValueChange,
  placeholder,
  value,
  defaultValue,
  ...props
}: SearchInputProps) {
  const isControlled = value !== undefined;
  const [draftValue, setDraftValue] = useState<string>(() =>
    String(value ?? defaultValue ?? ""),
  );
  const [isComposing, setIsComposing] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const isPendingRef = useRef(false);

  useEffect(() => {
    if (!isControlled || isComposing || isPendingRef.current) {
      return;
    }
    setDraftValue(String(value ?? ""));
  }, [isComposing, isControlled, value]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const setPendingState = (nextPending: boolean) => {
    if (isPendingRef.current === nextPending) {
      return;
    }

    isPendingRef.current = nextPending;
    onPendingChange?.(nextPending);
  };

  const scheduleCommit = (nextValue: string) => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    setPendingState(true);
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      setPendingState(false);
      onValueChange?.(nextValue);
    }, debounceMs);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setDraftValue(nextValue);

    if (!isComposing) {
      scheduleCommit(nextValue);
    }
  };

  const handleCompositionStart = (_event: CompositionEvent<HTMLInputElement>) => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value;
    setIsComposing(false);
    setDraftValue(nextValue);
    scheduleCommit(nextValue);
  };

  return (
    <label
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 shadow-sm outline-none transition-colors focus-within:border-slate-300 focus-within:outline-none focus-within:ring-0",
        className,
      )}
    >
      <Search className="h-4 w-4 text-slate-400" />
      <input
        aria-label={placeholder}
        className={cn(
          "w-full appearance-none border-0 bg-transparent text-sm text-slate-700 shadow-none outline-none ring-0 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
          inputClassName,
        )}
        defaultValue={isControlled ? undefined : defaultValue}
        onChange={handleChange}
        onCompositionEnd={handleCompositionEnd}
        onCompositionStart={handleCompositionStart}
        placeholder={placeholder}
        role="searchbox"
        spellCheck={false}
        style={{
          WebkitAppearance: "none",
          WebkitBoxShadow: "none",
          boxShadow: "none",
          outline: "none",
        }}
        type="text"
        value={draftValue}
        {...props}
      />
    </label>
  );
}
