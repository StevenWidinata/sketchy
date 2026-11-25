import { useEffect, useId, useRef } from "react";
import "../styles/raccoon.css";

export type RaccoonMood = "idle" | "think" | "cheer" | "panic" | "dance" | "wave" | "sad";

const FUR = "#8e919b";
const DARK = "#24252b";
const LIGHT = "#ece8de";
const INK = "#111216";
const TAIL = "M140 208C176 210 210 188 214 150C217 124 208 102 194 98C181 95 174 108 179 124C185 146 176 170 142 180Z";

interface Props {
  mood?: RaccoonMood;
  /** Eyes and head follow the pointer. */
  follow?: boolean;
  size?: number | string;
  className?: string;
  /** Accessible name; omit when the raccoon is decoration next to text that says the same. */
  label?: string;
}

export function Raccoon({ mood = "idle", follow = false, size = 220, className = "", label }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const uid = "rc" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const el = ref.current;
    if (!follow || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.4);
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.min(1, dist / 400);
        el.style.setProperty("--px", `${((dx / dist) * 3.5 * pull).toFixed(2)}px`);
        el.style.setProperty("--py", `${((dy / dist) * 3 * pull).toFixed(2)}px`);
        el.style.setProperty("--hr", `${Math.max(-6, Math.min(6, dx / 90)).toFixed(2)}deg`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [follow]);

  return (
    <svg
      ref={ref}
      className={`rc rc--${mood} ${className}`}
      viewBox="20 24 212 222"
      width={size}
      height={typeof size === "number" ? size * (222 / 212) : undefined}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <ellipse cx="114" cy="236" rx="70" ry="7" fill="#000" opacity="0.35" />
      <g className="rc-all">
        <g className="rc-tail">
          <defs>
            <clipPath id={`${uid}-tail`}>
              <path d={TAIL} />
            </clipPath>
          </defs>
          <path d={TAIL} fill={FUR} />
          <g clipPath={`url(#${uid}-tail)`} fill={DARK}>
            <path d="M150 168L196 150L204 168L156 190Z" />
            <path d="M176 132L214 118L220 136L182 150Z" />
            <path d="M180 96L222 92L222 112L186 116Z" />
          </g>
          <path d={TAIL} fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </g>

        <g className="rc-body">
          <ellipse cx="110" cy="182" rx="54" ry="46" fill={FUR} stroke={INK} strokeWidth="4" />
          <ellipse cx="110" cy="192" rx="33" ry="30" fill={LIGHT} />
          <ellipse cx="84" cy="224" rx="17" ry="9" fill={DARK} stroke={INK} strokeWidth="4" />
          <ellipse cx="136" cy="224" rx="17" ry="9" fill={DARK} stroke={INK} strokeWidth="4" />
        </g>

        <g className="rc-arm-l">
          <ellipse cx="66" cy="182" rx="12" ry="21" transform="rotate(22 66 182)" fill={FUR} stroke={INK} strokeWidth="4" />
          <circle cx="60" cy="199" r="10" fill={DARK} stroke={INK} strokeWidth="4" />
        </g>

        <g className="rc-head">
          <g className="rc-ear-l">
            <ellipse cx="62" cy="58" rx="20" ry="24" transform="rotate(-28 62 58)" fill={FUR} stroke={INK} strokeWidth="4" />
            <ellipse cx="64" cy="61" rx="10" ry="13" transform="rotate(-28 64 61)" fill={DARK} />
          </g>
          <g className="rc-ear-r">
            <ellipse cx="158" cy="58" rx="20" ry="24" transform="rotate(28 158 58)" fill={FUR} stroke={INK} strokeWidth="4" />
            <ellipse cx="156" cy="61" rx="10" ry="13" transform="rotate(28 156 61)" fill={DARK} />
          </g>
          <path
            d="M110 50C152 50 178 74 182 102C184 114 190 124 184 128C176 132 168 140 154 146C140 152 124 154 110 154C96 154 80 152 66 146C52 140 44 132 36 128C30 124 36 114 38 102C42 74 68 50 110 50Z"
            fill={FUR}
            stroke={INK}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <ellipse cx="84" cy="74" rx="15" ry="7" fill={LIGHT} />
          <ellipse cx="136" cy="74" rx="15" ry="7" fill={LIGHT} />
          <ellipse cx="110" cy="126" rx="34" ry="24" fill={LIGHT} />
          <path
            d="M44 100C52 82 74 80 90 88C100 93 104 96 110 96C116 96 120 93 130 88C146 80 168 82 176 100C170 116 152 120 136 114C124 110 118 106 110 106C102 106 96 110 84 114C68 120 50 116 44 100Z"
            fill={DARK}
          />
          <g className="rc-eyes">
            <circle cx="86" cy="99" r="11" fill="#fff" />
            <circle cx="134" cy="99" r="11" fill="#fff" />
            <g className="rc-pupils">
              <circle cx="86" cy="100" r="6" fill={INK} />
              <circle cx="134" cy="100" r="6" fill={INK} />
              <circle cx="88.5" cy="97.5" r="2" fill="#fff" />
              <circle cx="136.5" cy="97.5" r="2" fill="#fff" />
            </g>
          </g>
          <ellipse cx="110" cy="119" rx="9" ry="6" fill={INK} />
          <ellipse cx="107" cy="117" rx="3" ry="1.6" fill="#fff" opacity="0.6" />
          <path className="rc-mouth rc-mouth-calm" d="M100 129Q105 135 110 129Q115 135 120 129" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path className="rc-mouth rc-mouth-open" d="M98 128Q110 148 122 128Z" fill="#5a2630" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path className="rc-mouth rc-mouth-sad" d="M100 134Q110 126 120 134" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path
            className="rc-sweat"
            d="M172 62C176 70 180 76 176 81C172 85 165 82 167 75C168 71 170 67 172 62Z"
            fill="#7cc8ff"
            stroke={INK}
            strokeWidth="2.5"
          />
        </g>

        <path
          className="rc-scribble"
          d="M182 232C188 224 194 238 200 230C205 223 210 236 218 228"
          fill="none"
          stroke="var(--lime, #d4ff3f)"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={1}
        />

        <g className="rc-arm-r">
          <ellipse cx="164" cy="172" rx="11" ry="20" transform="rotate(-50 164 172)" fill={FUR} stroke={INK} strokeWidth="4" />
          <g transform="translate(178 182) rotate(60)">
            <rect x="-45" y="-7" width="13" height="14" rx="3" fill="var(--lime, #d4ff3f)" stroke={INK} strokeWidth="3" />
            <rect x="-33" y="-7" width="8" height="14" fill="#c9c6bd" stroke={INK} strokeWidth="3" />
            <rect x="-25" y="-7" width="50" height="14" fill="#ffd23f" stroke={INK} strokeWidth="3" />
            <path d="M-25 0H25" stroke="#e0a800" strokeWidth="2" />
            <path d="M25 -7L43 0L25 7Z" fill="#f2c9a0" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            <path d="M36 -2.7L43 0L36 2.7Z" fill={INK} />
          </g>
          <circle cx="176" cy="181" r="10" fill={DARK} stroke={INK} strokeWidth="4" />
        </g>
      </g>
    </svg>
  );
}
