import { useId, useState, type FormEvent } from "react";
import { AVATAR_COLORS, LIMITS } from "../../../shared/constants";
import { loadProfile, saveProfile } from "../lib/profile";
import { unlockAudio } from "../lib/sound";
import { createRoom, joinRoom } from "../lib/net";

interface Props {
  navigate: (path: string) => void;
  /** When set, the panel only joins this room (used on invite links). */
  code?: string;
}

export function ProfileFields({
  name,
  color,
  onName,
  onColor,
  nameError,
}: {
  name: string;
  color: string;
  onName: (v: string) => void;
  onColor: (v: string) => void;
  nameError?: string;
}) {
  const id = useId();
  return (
    <>
      <div className="field">
        <label className="field-label" htmlFor={`${id}-name`}>
          Your name
        </label>
        <input
          id={`${id}-name`}
          className="input"
          name="nickname"
          autoComplete="nickname"
          spellCheck={false}
          maxLength={LIMITS.nameMax}
          placeholder="e.g. Rina…"
          value={name}
          onChange={(e) => onName(e.target.value)}
          aria-invalid={!!nameError}
          aria-describedby={nameError ? `${id}-name-err` : undefined}
        />
        {nameError && (
          <p className="field-error" id={`${id}-name-err`}>
            {nameError}
          </p>
        )}
      </div>
      <fieldset className="field">
        <legend className="field-label">Your color</legend>
        <div className="swatches">
          {AVATAR_COLORS.map((c) => (
            <label key={c} className="swatch" style={{ ["--c" as string]: c }}>
              <input type="radio" name={`${id}-color`} value={c} checked={color === c} onChange={() => onColor(c)} aria-label={`Color ${c}`} />
              <span />
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}

export function JoinPanel({ navigate, code: fixedCode }: Props) {
  const initial = loadProfile();
  const [name, setName] = useState(initial.name);
  const [color, setColor] = useState(initial.color);
  const [code, setCode] = useState(fixedCode ?? "");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [nameError, setNameError] = useState<string>();
  const [error, setError] = useState<string>();
  const codeId = useId();

  const ready = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Type a name so friends know who's drawing.");
      return null;
    }
    setNameError(undefined);
    saveProfile({ name: trimmed, color });
    unlockAudio();
    return trimmed;
  };

  const onCreate = async () => {
    const n = ready();
    if (!n) return;
    setBusy("create");
    setError(undefined);
    try {
      const c = await createRoom(n, color);
      navigate(`/r/${c}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  };

  const onJoin = async (e: FormEvent) => {
    e.preventDefault();
    const n = ready();
    if (!n) return;
    const clean = code.trim().toUpperCase();
    if (!/^[A-Z]{5}$/.test(clean)) {
      setError("Room codes are 5 letters, like KQWPT.");
      return;
    }
    setBusy("join");
    setError(undefined);
    try {
      const c = await joinRoom(clean, n, color);
      navigate(`/r/${c}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  };

  return (
    <div className="join-panel">
      <ProfileFields name={name} color={color} onName={setName} onColor={setColor} nameError={nameError} />

      {fixedCode ? (
        <form onSubmit={onJoin} className="join-actions">
          <button type="submit" className="btn btn-primary btn-lg" disabled={busy !== null}>
            {busy === "join" ? "Joining…" : `Join room ${fixedCode}`}
          </button>
        </form>
      ) : (
        <>
          <button type="button" className="btn btn-primary btn-lg join-create" onClick={onCreate} disabled={busy !== null}>
            {busy === "create" ? "Creating room…" : "Create a room"}
          </button>
          <div className="join-or" aria-hidden="true">
            <span>or join a friend</span>
          </div>
          <form onSubmit={onJoin} className="join-code">
            <label htmlFor={codeId} className="visually-hidden">
              Room code
            </label>
            <input
              id={codeId}
              className="input input-code"
              name="room-code"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={LIMITS.roomCodeLength}
              placeholder="Room code, e.g. KQWPT…"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase())}
            />
            <button type="submit" className="btn btn-secondary" disabled={busy !== null}>
              {busy === "join" ? "Joining…" : "Join"}
            </button>
          </form>
        </>
      )}
      <p className="form-error" role="alert" aria-live="polite">
        {error}
      </p>
    </div>
  );
}
