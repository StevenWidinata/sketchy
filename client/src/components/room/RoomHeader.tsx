import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { isMuted, onMuteChange, setMuted } from "../../lib/sound";
import { Icon } from "../Icon";
import { Logo } from "../Logo";

export function SoundToggle() {
  const muted = useSyncExternalStore(onMuteChange, isMuted);
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={() => setMuted(!muted)}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      aria-pressed={muted}
    >
      <Icon name={muted ? "mute" : "volume"} />
    </button>
  );
}

/** Leaving a running game costs your score, so it takes a second click within 3 seconds. */
export function LeaveButton({ onLeave, compact, confirm }: { onLeave: () => void; compact?: boolean; confirm?: boolean }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  const click = () => (confirm && !armed ? setArmed(true) : onLeave());
  // One element throughout, so keyboard focus stays put while it asks for confirmation.
  const iconOnly = compact && !armed;
  return (
    <button
      type="button"
      className={iconOnly ? "icon-btn" : `btn btn-ghost${armed ? " leave-confirm" : ""}`}
      onClick={click}
      aria-label={iconOnly ? "Leave room" : undefined}
    >
      <Icon name="leave" />
      {armed ? "Leave game? Click again" : iconOnly ? null : "Leave"}
    </button>
  );
}

export function RoomHeader({ onLeave, children }: { onLeave: () => void; children?: ReactNode }) {
  return (
    <header className="room-header">
      <a href="/" className="logo-link" aria-label="Sketchy home" onClick={(e) => (e.preventDefault(), onLeave())}>
        <Logo size={28} />
      </a>
      <div className="room-header-mid">{children}</div>
      <div className="room-header-end">
        <SoundToggle />
        <LeaveButton onLeave={onLeave} />
      </div>
    </header>
  );
}
