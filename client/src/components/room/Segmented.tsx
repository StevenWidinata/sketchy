import { useRef, type KeyboardEvent } from "react";

interface Props<T extends string | number> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
  disabled?: boolean;
}

/** A radio group drawn as joined buttons, with arrow-key support. */
export function Segmented<T extends string | number>({ label, options, value, onChange, format = String, disabled }: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent, i: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + options.length) % options.length;
    onChange(options[next]);
    refs.current[next]?.focus();
  };

  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((opt, i) => {
        const checked = opt === value;
        return (
          <button
            key={String(opt)}
            ref={(el) => void (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className={`segmented-opt${checked ? " is-on" : ""}`}
            disabled={disabled}
            onClick={() => onChange(opt)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {format(opt)}
          </button>
        );
      })}
    </div>
  );
}
