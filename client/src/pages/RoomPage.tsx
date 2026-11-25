import { useEffect, useRef, useState } from "react";
import { JoinPanel } from "../components/JoinPanel";
import { Logo } from "../components/Logo";
import { Raccoon } from "../components/Raccoon";
import { Game } from "../components/room/Game";
import { Lobby } from "../components/room/Lobby";
import { Podium } from "../components/room/Podium";
import { loadProfile } from "../lib/profile";
import { joinRoom, leaveRoom } from "../lib/net";
import { useGame } from "../lib/store";
import "../styles/room.css";

type Status = { kind: "joining" } | { kind: "gate" } | { kind: "error"; message: string } | { kind: "ready" };

export function RoomPage({ code, navigate }: { code: string; navigate: (path: string) => void }) {
  const room = useGame((s) => s.room);
  const connected = useGame((s) => s.connected);
  const [status, setStatus] = useState<Status>(() => {
    if (room?.code === code) return { kind: "ready" };
    return loadProfile().name ? { kind: "joining" } : { kind: "gate" };
  });
  const started = useRef(false);

  useEffect(() => {
    if (status.kind !== "joining" || started.current) return;
    started.current = true;
    const p = loadProfile();
    joinRoom(code, p.name, p.color)
      .then(() => setStatus({ kind: "ready" }))
      .catch((e: Error) => setStatus({ kind: "error", message: e.message }));
  }, [code, status.kind]);

  useEffect(() => {
    document.title = `Room ${code} · Sketchy`;
    return () => {
      document.title = "Sketchy: draw badly, guess fast";
    };
  }, [code]);

  const leave = () => {
    leaveRoom();
    navigate("/");
  };

  if (status.kind === "gate" || status.kind === "error") {
    return (
      <div className="gate">
        <header className="gate-head">
          <a href="/" className="logo-link" aria-label="Sketchy home">
            <Logo />
          </a>
        </header>
        <main className="gate-main">
          <Raccoon mood={status.kind === "error" ? "sad" : "wave"} size={150} />
          {status.kind === "gate" ? (
            <>
              <h1 className="gate-title">You're invited to room {code}</h1>
              <p className="gate-sub">Pick a name and a color, then jump in.</p>
              <div className="gate-panel">
                <JoinPanel navigate={() => setStatus({ kind: "ready" })} code={code} />
              </div>
            </>
          ) : (
            <>
              <h1 className="gate-title">Can't join room {code}</h1>
              <p className="gate-sub">{status.message}</p>
              <a href="/" className="btn btn-primary btn-lg" onClick={(e) => (e.preventDefault(), navigate("/"))}>
                Back to home
              </a>
            </>
          )}
        </main>
      </div>
    );
  }

  if (status.kind === "ready" && !room) {
    return (
      <div className="gate">
        <main className="gate-main">
          <Raccoon mood="sad" size={150} />
          <h1 className="gate-title">You're no longer in room {code}</h1>
          <p className="gate-sub">You may have been away too long, or the room closed.</p>
          <div className="gate-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => {
                started.current = false;
                setStatus({ kind: "joining" });
              }}
            >
              Join again
            </button>
            <a href="/" className="btn btn-secondary btn-lg" onClick={(e) => (e.preventDefault(), navigate("/"))}>
              Back to home
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (status.kind === "joining" || !room) {
    return (
      <div className="gate">
        <main className="gate-main" aria-busy="true">
          <Raccoon mood="think" size={150} />
          <p className="gate-sub">Joining room {code}…</p>
        </main>
      </div>
    );
  }

  return (
    <>
      {!connected && (
        <div className="offline-banner" role="status">
          Connection lost. Reconnecting…
        </div>
      )}
      {room.phase === "lobby" ? <Lobby onLeave={leave} /> : room.phase === "podium" ? <Podium onLeave={leave} /> : <Game onLeave={leave} />}
    </>
  );
}
