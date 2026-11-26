import { useEffect, useMemo, useRef, useState } from "react";
import type { RoomState, WordChoice } from "../../../../shared/types";
import { categoryName } from "../../../../shared/words";
import { burst } from "../../lib/confetti";
import { chooseWord, react as sendReaction } from "../../lib/net";
import { useGame } from "../../lib/store";
import { useKeyboardOpen } from "../../lib/viewport";
import { Icon } from "../Icon";
import { InteractiveRaccoon } from "../InteractiveRaccoon";
import type { RaccoonMood } from "../Raccoon";
import { Board } from "./Board";
import { Chat } from "./Chat";
import { Avatar, PlayerList } from "./PlayerList";
import { TopBar, useSecondsLeft } from "./TopBar";

const fmt = new Intl.NumberFormat();

export function Game({ onLeave }: { onLeave: () => void }) {
  const room = useGame((s) => s.room)!;
  const you = useGame((s) => s.you);
  const choices = useGame((s) => s.choices);
  const myWord = useGame((s) => s.myWord);
  const myCorrectAt = useGame((s) => s.myCorrectAt);
  const [tab, setTab] = useState<"chat" | "players">("chat");
  const isDrawer = room.drawerId === you;
  const me = room.players.find((p) => p.id === you);
  const drawer = room.players.find((p) => p.id === room.drawerId);
  const left = useSecondsLeft(room);

  // On a phone, typing a guess opens the keyboard: switch to a compact layout so the drawing stays in view.
  const gameRef = useRef<HTMLDivElement>(null);
  const [chatFocused, setChatFocused] = useState(false);
  const keyboardOpen = useKeyboardOpen(gameRef);
  const typing = chatFocused && keyboardOpen;
  useEffect(() => {
    if (typing) window.scrollTo(0, 0);
  }, [typing]);

  // Celebrate your own correct guess.
  const stageRef = useRef<HTMLDivElement>(null);
  const [cheering, setCheering] = useState(false);
  useEffect(() => {
    if (!myCorrectAt) return;
    const r = stageRef.current?.getBoundingClientRect();
    burst(r ? r.left + r.width / 2 : undefined, r ? r.top + r.height / 2 : undefined);
    setCheering(true);
    const t = setTimeout(() => setCheering(false), 2600);
    return () => clearTimeout(t);
  }, [myCorrectAt]);

  const mood: RaccoonMood = useMemo(() => {
    if (cheering) return "cheer";
    if (room.phase === "choosing") return "think";
    if (room.phase === "drawing" && left <= 10) return "panic";
    if (room.phase === "reveal") {
      if (room.endReason === "all-guessed") return "cheer";
      if (!room.players.some((p) => p.guessed)) return "sad";
    }
    return "idle";
  }, [cheering, room.phase, room.endReason, room.players, left]);

  const placeholder =
    room.phase !== "drawing"
      ? "Say something…"
      : isDrawer || me?.guessed
        ? "Chat with solvers…"
        : "Type your guess…";

  const boardLabel =
    room.phase === "drawing" && drawer ? `${drawer.name}'s drawing` : "Drawing canvas";

  return (
    <div className={`game${typing ? " is-typing" : ""}`} ref={gameRef}>
      <TopBar room={room} myWord={myWord} onLeave={onLeave} />

      <aside className="game-players" aria-label="Scoreboard">
        <PlayerList room={room} you={you} />
      </aside>

      <main className="game-stage" ref={stageRef}>
        <div className="stage-inner">
          <Board canDraw={isDrawer && room.phase === "drawing"} label={boardLabel} />
          <Overlay room={room} you={you} choices={choices} isDrawer={isDrawer} />
          <div className="stage-raccoon">
            <InteractiveRaccoon mood={mood} disabled={isDrawer && room.phase === "drawing"} />
          </div>
          {room.phase === "drawing" && !isDrawer && <Reactions room={room} />}
          {room.phase === "drawing" && isDrawer && myWord && (
            <p className="drawer-note">
              Draw <strong>{myWord.word}</strong>. No letters or numbers.
            </p>
          )}
        </div>
      </main>

      <aside className="game-chat" aria-label="Chat">
        <div className="mobile-tabs" role="tablist" aria-label="Side panel">
          <button type="button" role="tab" aria-selected={tab === "chat"} className={`mobile-tab${tab === "chat" ? " is-on" : ""}`} onClick={() => setTab("chat")}>
            <Icon name="chat" size={16} />
            Chat
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "players"}
            className={`mobile-tab${tab === "players" ? " is-on" : ""}`}
            onClick={() => setTab("players")}
          >
            <Icon name="users" size={16} />
            Scores
          </button>
        </div>
        <div className={`mobile-players${tab === "players" ? " is-on" : ""}`}>
          <PlayerList room={room} you={you} />
        </div>
        <div className={`chat-wrap${tab === "chat" ? " is-on" : ""}`}>
          <Chat placeholder={placeholder} onFocusChange={setChatFocused} />
        </div>
      </aside>
    </div>
  );
}

function Overlay({ room, you, choices, isDrawer }: { room: RoomState; you: string | null; choices: WordChoice[] | null; isDrawer: boolean }) {
  const drawer = room.players.find((p) => p.id === room.drawerId);
  const lang = room.settings.language;

  if (room.phase === "choosing") {
    if (isDrawer && choices) {
      return (
        <div className="overlay">
          <div className="overlay-card picker sketch">
            <h2 className="overlay-title">Your turn. Pick a word to draw</h2>
            <ul className="picker-list">
              {choices.map((c, i) => (
                <li key={c.word} style={{ animationDelay: `${i * 90}ms` }}>
                  <button type="button" className={`pick sketch${i % 2 ? " sketch-alt" : ""}`} onClick={() => void chooseWord(i)}>
                    <span className="pick-cat">{categoryName(c.categoryId, lang)}</span>
                    <span className="pick-word">{c.word}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="overlay-foot">If you don't pick, the first word is chosen for you.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="overlay">
        <div className="overlay-card waiting sketch">
          {drawer && <Avatar player={drawer} size={48} />}
          <h2 className="overlay-title">{drawer?.name ?? "Someone"} is picking a word</h2>
          <p className="overlay-foot">Get your guessing fingers ready.</p>
        </div>
      </div>
    );
  }

  if (room.phase === "reveal") {
    const gains = room.players.filter((p) => p.gain > 0).sort((a, b) => b.gain - a.gain);
    const reason =
      room.endReason === "all-guessed"
        ? "Everyone got it"
        : room.endReason === "drawer-left"
          ? `${drawer?.name ?? "The drawer"} left the room`
          : "Time's up";
    return (
      <div className="overlay">
        <div className="overlay-card reveal sketch">
          <p className="reveal-reason">{reason}</p>
          {room.revealWord ? (
            <>
              <p className="reveal-label">The word was</p>
              <p className="reveal-word">{room.revealWord}</p>
            </>
          ) : (
            <p className="reveal-label">This turn is skipped</p>
          )}
          {gains.length > 0 && (
            <ul className="reveal-gains">
              {gains.map((p) => (
                <li key={p.id}>
                  <Avatar player={p} size={24} />
                  <span className="reveal-name">
                    {p.name}
                    {p.id === you && " (you)"}
                    {p.id === room.drawerId && <span className="reveal-role"> drew it</span>}
                  </span>
                  <span className="reveal-pts tabular">+{fmt.format(p.gain)}</span>
                </li>
              ))}
            </ul>
          )}
          {(room.reactions.likes > 0 || room.reactions.dislikes > 0) && (
            <p className="reveal-reactions tabular">
              <Icon name="like" size={16} /> {room.reactions.likes}
              <Icon name="dislike" size={16} /> {room.reactions.dislikes}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
}

function Reactions({ room }: { room: RoomState }) {
  const [mine, setMine] = useState<"like" | "dislike" | null>(null);
  useEffect(() => setMine(null), [room.drawerId, room.round]);
  const react = (kind: "like" | "dislike") => {
    setMine(kind);
    void sendReaction(kind);
  };
  return (
    <div className="reactions" role="group" aria-label="Rate this drawing">
      <button type="button" className={`react-btn${mine === "like" ? " is-on" : ""}`} aria-pressed={mine === "like"} onClick={() => react("like")}>
        <Icon name="like" size={18} />
        <span className="tabular">{room.reactions.likes}</span>
        <span className="visually-hidden">Like this drawing</span>
      </button>
      <button
        type="button"
        className={`react-btn${mine === "dislike" ? " is-on" : ""}`}
        aria-pressed={mine === "dislike"}
        onClick={() => react("dislike")}
      >
        <Icon name="dislike" size={18} />
        <span className="tabular">{room.reactions.dislikes}</span>
        <span className="visually-hidden">Dislike this drawing</span>
      </button>
    </div>
  );
}
