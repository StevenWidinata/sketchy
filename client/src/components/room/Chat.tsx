import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { LIMITS } from "../../../../shared/constants";
import { sendChat } from "../../lib/net";
import { useGame } from "../../lib/store";
import { Icon } from "../Icon";

export function Chat({ placeholder, compact }: { placeholder: string; compact?: boolean }) {
  const lines = useGame((s) => s.chat);
  const listRef = useRef<HTMLOListElement>(null);
  const stick = useRef(true);
  const [text, setText] = useState("");

  const onScroll = () => {
    const el = listRef.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    void sendChat(t);
    setText("");
    stick.current = true;
  };

  return (
    <div className={`chat${compact ? " is-compact" : ""}`}>
      <ol className="chat-log" ref={listRef} onScroll={onScroll} role="log" aria-live="polite" aria-label="Chat and guesses">
        {lines.length === 0 && <li className="chat-empty">Guesses and messages show up here.</li>}
        {lines.map((l) => (
          <li key={l.id} className={`chat-line is-${l.kind}${l.solvedOnly ? " is-solved" : ""}`}>
            {l.kind === "chat" ? (
              <>
                <span className="chat-dot" style={{ background: l.color }} aria-hidden="true" />
                <span className="chat-name">{l.name}</span>
                <span className="chat-text">{l.text}</span>
                {l.solvedOnly && <span className="visually-hidden">(only players who guessed can see this)</span>}
              </>
            ) : l.kind === "correct" ? (
              <>
                <Icon name="check" size={16} />
                <span className="swipe">{l.text}</span>
              </>
            ) : (
              <span className="chat-text">{l.text}</span>
            )}
          </li>
        ))}
      </ol>
      <form className="chat-form" onSubmit={send}>
        <label htmlFor="chat-input" className="visually-hidden">
          {placeholder}
        </label>
        <input
          id="chat-input"
          className="input chat-input"
          name="guess"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="send"
          maxLength={LIMITS.chatMax}
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="icon-btn chat-send" aria-label="Send" disabled={!text.trim()}>
          <Icon name="send" />
        </button>
      </form>
    </div>
  );
}
