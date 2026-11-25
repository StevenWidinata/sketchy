import type { PublicPlayer, RoomState } from "../../../../shared/types";
import { Icon } from "../Icon";

export function Avatar({ player, size = 36 }: { player: Pick<PublicPlayer, "name" | "color">; size?: number }) {
  return (
    <span className="avatar" style={{ background: player.color, width: size, height: size, fontSize: size * 0.44 }} aria-hidden="true">
      {player.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

const fmt = new Intl.NumberFormat();

export function PlayerList({ room, you, showScores = true }: { room: RoomState; you: string | null; showScores?: boolean }) {
  const players = showScores ? [...room.players].sort((a, b) => b.score - a.score) : room.players;
  const inTurn = room.phase === "drawing" || room.phase === "reveal" || room.phase === "choosing";
  return (
    <ol className="players" aria-label="Players">
      {players.map((p, i) => {
        const drawing = inTurn && p.id === room.drawerId;
        return (
          <li key={p.id} className={`player${p.connected ? "" : " is-away"}${p.guessed ? " is-guessed" : ""}${drawing ? " is-drawing" : ""}`}>
            {showScores && <span className="player-rank tabular">{i + 1}</span>}
            <Avatar player={p} />
            <span className="player-main">
              <span className="player-name">
                <span className={p.guessed ? "swipe" : undefined}>{p.name}</span>
                {p.id === you && <span className="player-you">you</span>}
                {p.id === room.hostId && (
                  <span className="player-host" title="Host">
                    <Icon name="crown" size={14} label="Host" />
                  </span>
                )}
              </span>
              {showScores && (
                <span className="player-score tabular">
                  {fmt.format(p.score)} pts
                  {p.gain > 0 && <span className="player-gain">+{fmt.format(p.gain)}</span>}
                </span>
              )}
            </span>
            <span className="player-status">
              {drawing && <Icon name="pencil" size={16} label="Drawing" />}
              {p.guessed && <Icon name="check" size={16} label="Guessed it" />}
              {!p.connected && !drawing && <Icon name="wifiOff" size={16} label="Away" />}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
