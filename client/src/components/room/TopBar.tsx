import { useEffect, useRef, useState } from "react";
import type { RoomState, WordChoice } from "../../../../shared/types";
import { categoryName } from "../../../../shared/words";
import { play } from "../../lib/sound";
import { useGame } from "../../lib/store";
import { Logo } from "../Logo";
import { LeaveButton, SoundToggle } from "./RoomHeader";

/** Seconds left in the current phase, corrected for server clock skew. */
export function useSecondsLeft(room: RoomState): number {
  const offset = useGame((s) => s.clockOffset);
  const calc = () => (room.phaseEndsAt ? Math.max(0, (room.phaseEndsAt - (Date.now() + offset)) / 1000) : 0);
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    setLeft(calc());
    const id = setInterval(() => setLeft(calc()), 200);
    return () => clearInterval(id);
  }, [room.phaseEndsAt, offset]);
  return left;
}

export function Timer({ room }: { room: RoomState }) {
  const left = useSecondsLeft(room);
  const whole = Math.ceil(left);
  const last = useRef(whole);
  const urgent = room.phase === "drawing" && whole <= 10 && whole > 0;

  useEffect(() => {
    if (urgent && whole !== last.current) play("tick");
    last.current = whole;
  }, [whole, urgent]);

  const share = room.phaseDuration ? left / room.phaseDuration : 0;
  const r = 19;
  const c = 2 * Math.PI * r;
  return (
    <div className={`timer${urgent ? " is-urgent" : ""}`} role="timer" aria-label={`${whole} seconds left`}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={r} className="timer-track" />
        <circle cx="24" cy="24" r={r} className="timer-fill" strokeDasharray={c} strokeDashoffset={c * (1 - share)} />
      </svg>
      <span className="timer-num tabular" aria-hidden="true">
        {whole}
      </span>
    </div>
  );
}

export function WordHint({ room, myWord }: { room: RoomState; myWord: WordChoice | null }) {
  const lang = room.settings.language;
  if (room.phase === "choosing") {
    return <p className="hint-status">Choosing a word…</p>;
  }
  const word = room.revealWord ?? myWord?.word;
  const pattern = word ? [...word] : room.hint?.pattern;
  const categoryId = room.hint?.categoryId ?? myWord?.categoryId;
  if (!pattern) return null;
  const letters = pattern.filter((ch) => ch !== " " && ch !== "-").length;
  return (
    <div className="hint">
      {categoryId && <span className="category-chip">{categoryName(categoryId, lang)}</span>}
      <span className={`tiles${word ? " is-known" : ""}`} aria-label={word ? `The word is ${word}` : `Hidden word, ${letters} letters`}>
        {pattern.map((ch, i) =>
          ch === " " ? (
            <span key={i} className="tile-gap" />
          ) : ch === "-" ? (
            <span key={i} className="tile-sep">-</span>
          ) : (
            <span key={i} className={`tile${ch !== "_" ? " is-shown" : ""}`} aria-hidden="true">
              {ch === "_" ? "" : ch}
            </span>
          ),
        )}
      </span>
      <span className="tile-count tabular" aria-hidden="true">
        {letters}
      </span>
    </div>
  );
}

export function TopBar({ room, myWord, onLeave }: { room: RoomState; myWord: WordChoice | null; onLeave: () => void }) {
  return (
    <header className="topbar">
      <h1 className="visually-hidden">
        Room {room.code}, round {room.round} of {room.settings.rounds}
      </h1>
      <div className="topbar-start">
        <span className="topbar-logo">
          <Logo size={26} />
        </span>
        <span className="round tabular">
          Round {room.round} of {room.settings.rounds}
        </span>
      </div>
      <div className="topbar-mid">
        <WordHint room={room} myWord={myWord} />
      </div>
      <div className="topbar-end">
        {(room.phase === "drawing" || room.phase === "choosing") && <Timer room={room} />}
        <SoundToggle />
        <LeaveButton onLeave={onLeave} compact confirm />
      </div>
    </header>
  );
}
