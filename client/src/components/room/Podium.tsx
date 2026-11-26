import { useEffect, useRef, useState } from "react";
import { CANVAS } from "../../../../shared/constants";
import type { GalleryItem } from "../../../../shared/types";
import { categoryName } from "../../../../shared/words";
import { onColor } from "../../lib/accent";
import { burst } from "../../lib/confetti";
import { renderAll, renderUpTo, timelineLength } from "../../lib/drawing";
import { playAgain } from "../../lib/net";
import { useGame } from "../../lib/store";
import { Icon } from "../Icon";
import { Raccoon } from "../Raccoon";
import { Avatar } from "./PlayerList";
import { RoomHeader } from "./RoomHeader";

const fmt = new Intl.NumberFormat();

export function Podium({ onLeave }: { onLeave: () => void }) {
  const room = useGame((s) => s.room)!;
  const you = useGame((s) => s.you);
  const gallery = useGame((s) => s.gallery);
  const [open, setOpen] = useState<GalleryItem | null>(null);
  const ranked = [...room.players].sort((a, b) => b.score - a.score);
  const [first, second, third] = ranked;
  const isHost = room.hostId === you;
  const host = room.players.find((p) => p.id === room.hostId);
  const tie = second && first && second.score === first.score;

  useEffect(() => {
    const t = setTimeout(() => burst(window.innerWidth / 2, window.innerHeight * 0.35, 140), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="podium-page" data-paper>
      <RoomHeader onLeave={onLeave}>
        <span className="room-code-chip">Final scores</span>
      </RoomHeader>

      <main className="podium-main" data-paper>
        <section className="podium-hero" aria-labelledby="podium-title" data-paper>
          <h1 id="podium-title" className="podium-title">
            {first ? (tie ? "It's a tie at the top" : `${first.name} wins`) : "Game over"}
          </h1>
          <div className="podium-stage">
            <div className="podium-raccoon">
              <Raccoon mood="dance" size="100%" />
            </div>
            <ol className="podium-blocks">
              {[second, first, third].map((p, i) =>
                p ? (
                  <li key={p.id} className={`podium-col place-${[2, 1, 3][i]}`}>
                    <Avatar player={p} size={[48, 64, 44][i]} />
                    <span className="podium-name">{p.name}</span>
                    <span className="podium-score tabular">{fmt.format(p.score)}</span>
                    <span
                      className={`podium-block sketch${i === 1 ? "" : " sketch-alt"}`}
                      aria-hidden="true"
                      style={i === 1 ? { ["--block" as string]: p.color, ["--on-block" as string]: onColor(p.color) } : undefined}
                    >
                      {[2, 1, 3][i]}
                    </span>
                    <span className="visually-hidden">Place {[2, 1, 3][i]}</span>
                  </li>
                ) : (
                  <li key={i} className="podium-col is-empty" aria-hidden="true" />
                ),
              )}
            </ol>
          </div>

          {ranked.length > 3 && (
            <ol className="rest-list" start={4}>
              {ranked.slice(3).map((p, i) => (
                <li key={p.id}>
                  <span className="tabular rest-rank">{i + 4}</span>
                  <Avatar player={p} size={28} />
                  <span className="rest-name">{p.name}</span>
                  <span className="tabular rest-score">{fmt.format(p.score)}</span>
                </li>
              ))}
            </ol>
          )}

          <div className="podium-actions">
            {isHost ? (
              <button type="button" className="btn btn-primary btn-lg" onClick={() => void playAgain()}>
                Play again
              </button>
            ) : (
              <p className="lobby-foot-note">Waiting for {host?.name ?? "the host"} to start another game</p>
            )}
          </div>
        </section>

        {gallery.length > 0 && (
          <section className="gallery" aria-labelledby="gallery-title" data-paper>
            <h2 id="gallery-title" className="section-title section-title-sm">
              Drawings from this game
            </h2>
            <ul className="gallery-grid">
              {gallery.map((g, i) => (
                <li key={g.id}>
                  <button type="button" className={`gallery-item sketch${i % 2 ? " sketch-alt" : ""}`} onClick={() => setOpen(g)}>
                    <Thumb item={g} />
                    <span className="gallery-word">{g.word}</span>
                    <span className="gallery-meta">Drawn by {g.drawerName}</span>
                    <span className="gallery-meta">{categoryName(g.categoryId, room.settings.language)}</span>
                    <span className="gallery-play" aria-hidden="true">
                      <Icon name="play" size={16} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {open && <Replay item={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Thumb({ item }: { item: GalleryItem }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d", { willReadFrequently: true });
    if (ctx) renderAll(ctx, item.actions);
  }, [item]);
  return <canvas ref={ref} width={CANVAS.width} height={CANVAS.height} className="thumb" aria-hidden="true" />;
}

function Replay({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const total = timelineLength(item.actions);

  useEffect(() => {
    const d = dialogRef.current;
    // No close() in cleanup: StrictMode re-runs this effect, and closing fires onClose.
    if (d && !d.open) d.showModal();
  }, []);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    if (!playing) {
      renderUpTo(ctx, item.actions, progress);
      return;
    }
    // Play the whole drawing in about 6 seconds, however long it took to draw.
    const perMs = total / 6000;
    const start = performance.now() - progress / perMs;
    let frame = 0;
    const step = (now: number) => {
      const units = Math.min(total, (now - start) * perMs);
      renderUpTo(ctx, item.actions, units);
      setProgress(units);
      if (units >= total) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [playing, item]);

  const download = () => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (ctx) renderAll(ctx, item.actions);
    setProgress(total);
    setPlaying(false);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `sketchy-${item.word.replace(/\s+/g, "-")}.png`;
    a.click();
  };

  const done = progress >= total;

  return (
    <dialog ref={dialogRef} className="replay" onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()} aria-labelledby="replay-title">
      <div className="replay-inner">
        <header className="replay-head">
          <div>
            <h2 id="replay-title" className="replay-title">
              {item.word}
            </h2>
            <p className="replay-meta">Drawn by {item.drawerName}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close replay">
            <Icon name="close" />
          </button>
        </header>
        <canvas ref={ref} width={CANVAS.width} height={CANVAS.height} className="replay-canvas" role="img" aria-label={`Timelapse of ${item.drawerName}'s drawing of ${item.word}`} />
        <div className="replay-bar">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (done) setProgress(0);
              setPlaying((p) => (done ? true : !p));
            }}
          >
            <Icon name={done ? "replay" : playing ? "pause" : "play"} />
            {done ? "Replay" : playing ? "Pause" : "Play"}
          </button>
          <span className="replay-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${total ? progress / total : 1})` }} />
          </span>
          <button type="button" className="btn btn-primary" onClick={download}>
            <Icon name="download" />
            Save PNG
          </button>
        </div>
      </div>
    </dialog>
  );
}
