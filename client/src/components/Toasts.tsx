import { useGame } from "../lib/store";

export function Toasts() {
  const toasts = useGame((s) => s.toasts);
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.message}
        </div>
      ))}
    </div>
  );
}
