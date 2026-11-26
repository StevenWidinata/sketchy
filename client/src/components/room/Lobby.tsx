import { useEffect, useId, useState } from "react";
import { LIMITS, SETTING_OPTIONS, TIMING } from "../../../../shared/constants";
import type { Settings } from "../../../../shared/types";
import { CATEGORIES, DEFAULT_CATEGORY_IDS } from "../../../../shared/words";

const NORMAL = CATEGORIES.filter((c) => !c.hard);
const HARD = CATEGORIES.filter((c) => c.hard);
import { startGame, updateSettings } from "../../lib/net";
import { toast, useGame } from "../../lib/store";
import { Icon } from "../Icon";
import { InteractiveRaccoon } from "../InteractiveRaccoon";
import { PlayerList } from "./PlayerList";
import { RoomHeader } from "./RoomHeader";
import { Segmented } from "./Segmented";

const update = (patch: Partial<Settings>) => void updateSettings(patch);

export function Lobby({ onLeave }: { onLeave: () => void }) {
  const room = useGame((s) => s.room)!;
  const you = useGame((s) => s.you);
  const isHost = room.hostId === you;
  const s = room.settings;
  const host = room.players.find((p) => p.id === room.hostId);
  const connected = room.players.filter((p) => p.connected).length;
  const link = `${window.location.origin}/r/${room.code}`;
  const [copied, setCopied] = useState(false);
  const ids = useId();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast(`Copy this link: ${link}`);
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: "Join my Sketchy room", text: `Join my drawing game, room ${room.code}`, url: link });
    } catch {
      /* dismissed */
    }
  };

  // No pick means the default set: every normal category, none of the hard ones.
  const allCategories = s.categories.length === 0;
  const isOn = (id: string) => (allCategories ? DEFAULT_CATEGORY_IDS.includes(id) : s.categories.includes(id));
  const toggleCategory = (id: string) => {
    const current = allCategories ? DEFAULT_CATEGORY_IDS : s.categories;
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
    const isDefault = next.length === DEFAULT_CATEGORY_IDS.length && next.every((c) => DEFAULT_CATEGORY_IDS.includes(c));
    update({ categories: isDefault || next.length === 0 ? [] : next });
  };
  const chip = (c: (typeof CATEGORIES)[number]) => (
    <li key={c.id}>
      <label className={`cat-chip${isOn(c.id) ? " is-on" : ""}${s.customOnly ? " is-muted" : ""}`}>
        <input type="checkbox" checked={isOn(c.id)} onChange={() => toggleCategory(c.id)} disabled={!isHost || s.customOnly} />
        <span className="cat-check" aria-hidden="true">
          <Icon name="check" size={14} />
        </span>
        {c.name[s.language]}
      </label>
    </li>
  );

  const notReady =
    connected < LIMITS.playersMin
      ? "Waiting for at least one more player"
      : s.customOnly && s.customWords.length < s.wordChoices
        ? `Add at least ${s.wordChoices} custom words`
        : null;

  return (
    <div className="lobby" data-paper>
      <RoomHeader onLeave={onLeave}>
        <span className="room-code-chip">
          Room <strong translate="no">{room.code}</strong>
        </span>
      </RoomHeader>

      <main className="lobby-main" data-paper>
        <section className="lobby-side" aria-labelledby={`${ids}-invite`} data-paper>
          <div className="invite">
            <div className="invite-text">
              <h1 id={`${ids}-invite`} className="lobby-title">
                Room <span translate="no">{room.code}</span>
              </h1>
              <p className="lobby-sub">Send friends this link, or tell them the code.</p>
            </div>
            <InteractiveRaccoon mood="wave" size={104} className="invite-raccoon" />
          </div>
          <div className="invite-link">
            <span className="invite-url" translate="no">
              {link.replace(/^https?:\/\//, "")}
            </span>
            <button type="button" className="btn btn-secondary" onClick={copy}>
              <Icon name={copied ? "check" : "copy"} />
              {copied ? "Copied" : "Copy link"}
            </button>
            {"share" in navigator && (
              <button type="button" className="icon-btn" onClick={share} aria-label="Share invite link">
                <Icon name="link" />
              </button>
            )}
          </div>

          <div className="lobby-players" data-paper>
            <h2 className="panel-title">
              Players <span className="panel-count tabular">{room.players.length} of {s.maxPlayers}</span>
            </h2>
            <PlayerList room={room} you={you} showScores={false} />
          </div>
        </section>

        <section className="lobby-settings sketch" aria-labelledby={`${ids}-settings`}>
          <h2 id={`${ids}-settings`} className="panel-title">
            Game settings
            {!isHost && <span className="panel-note">Only {host?.name ?? "the host"} can change these</span>}
          </h2>

          <fieldset className="settings-grid" disabled={!isHost}>
            <div className="setting">
              <span className="setting-label" id={`${ids}-rounds`}>Rounds</span>
              <Segmented label="Rounds" options={SETTING_OPTIONS.rounds} value={s.rounds} onChange={(v) => update({ rounds: v })} disabled={!isHost} />
            </div>
            <div className="setting">
              <span className="setting-label">Mode</span>
              <Segmented
                label="Mode"
                options={["classic", "speed"] as const}
                value={s.mode}
                format={(v) => (v === "classic" ? "Classic" : "Speed round")}
                onChange={(v) => update({ mode: v })}
                disabled={!isHost}
              />
            </div>
            <div className="setting">
              <span className="setting-label">Draw time</span>
              {s.mode === "speed" ? (
                <p className="setting-fixed">{TIMING.speedSeconds} s per turn, letter hints come sooner</p>
              ) : (
                <Segmented
                  label="Draw time"
                  options={SETTING_OPTIONS.drawTime}
                  value={s.drawTime}
                  format={(v) => `${v}s`}
                  onChange={(v) => update({ drawTime: v })}
                  disabled={!isHost}
                />
              )}
            </div>
            <div className="setting">
              <span className="setting-label">Words to pick from</span>
              <Segmented label="Words to pick from" options={SETTING_OPTIONS.wordChoices} value={s.wordChoices} onChange={(v) => update({ wordChoices: v })} disabled={!isHost} />
            </div>
            <div className="setting">
              <span className="setting-label">Word language</span>
              <Segmented
                label="Word language"
                options={["en", "id"] as const}
                value={s.language}
                format={(v) => (v === "en" ? "English" : "Bahasa Indonesia")}
                onChange={(v) => update({ language: v })}
                disabled={!isHost}
              />
            </div>
            <div className="setting">
              <label className="setting-label" htmlFor={`${ids}-max`}>
                Max players
              </label>
              <select
                id={`${ids}-max`}
                className="input setting-select"
                value={s.maxPlayers}
                onChange={(e) => update({ maxPlayers: Number(e.target.value) })}
                disabled={!isHost}
              >
                {Array.from({ length: LIMITS.playersMax - LIMITS.playersMin + 1 }, (_, i) => i + LIMITS.playersMin).map((n) => (
                  <option key={n} value={n} disabled={n < room.players.length}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          <div className="setting setting-wide">
            <div className="setting-row">
              <span className="setting-label">Categories</span>
              <span className="setting-hint">
                {allCategories ? `All ${NORMAL.length} categories` : `${s.categories.length} of ${CATEGORIES.length} picked`}
                {isHost && !allCategories && (
                  <button type="button" className="link-btn" onClick={() => update({ categories: [] })}>
                    Reset
                  </button>
                )}
              </span>
            </div>
            <ul className="cat-grid" aria-label="Categories">
              {NORMAL.map(chip)}
            </ul>
            <p className="cat-subhead" id={`${ids}-hard`}>
              Harder to draw <span>off unless you tick them</span>
            </p>
            <ul className="cat-grid" aria-labelledby={`${ids}-hard`}>
              {HARD.map(chip)}
            </ul>
          </div>

          <CustomWords isHost={isHost} words={s.customWords} customOnly={s.customOnly} />
        </section>
      </main>

      <footer className="lobby-foot">
        {isHost ? (
          <>
            <p className="lobby-foot-note" aria-live="polite">
              {notReady ?? `${connected} players ready`}
            </p>
            <button type="button" className="btn btn-primary btn-lg" disabled={!!notReady} onClick={() => void startGame()}>
              Start game
            </button>
          </>
        ) : (
          <p className="lobby-foot-note">
            Waiting for {host?.name ?? "the host"} to start the game
          </p>
        )}
      </footer>
    </div>
  );
}

function CustomWords({ isHost, words, customOnly }: { isHost: boolean; words: string[]; customOnly: boolean }) {
  const [text, setText] = useState(words.join(", "));
  const [dirty, setDirty] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!dirty) setText(words.join(", "));
  }, [words, dirty]);

  const commit = () => {
    if (!dirty) return;
    setDirty(false);
    update({ customWords: text.split(/[,\n]/).map((w) => w.trim()).filter(Boolean) });
  };

  return (
    <div className="setting setting-wide">
      <div className="setting-row">
        <label className="setting-label" htmlFor={`${id}-words`}>
          Custom words
        </label>
        <span className="setting-hint tabular">
          {words.length} of {LIMITS.customWordsMax}
        </span>
      </div>
      {isHost ? (
        <textarea
          id={`${id}-words`}
          className="input textarea"
          rows={3}
          autoComplete="off"
          spellCheck={false}
          placeholder="Separate words with commas, e.g. office plant, Rina's cat, karaoke night…"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setDirty(true);
          }}
          onBlur={commit}
        />
      ) : (
        <p id={`${id}-words`} className="custom-readonly">
          {words.length ? words.join(", ") : "No custom words added"}
        </p>
      )}
      <label className={`check${!isHost ? " is-disabled" : ""}`}>
        <input type="checkbox" checked={customOnly} disabled={!isHost} onChange={(e) => update({ customOnly: e.target.checked })} />
        <span className="check-box" aria-hidden="true">
          <Icon name="check" size={14} />
        </span>
        Play with custom words only
      </label>
    </div>
  );
}
