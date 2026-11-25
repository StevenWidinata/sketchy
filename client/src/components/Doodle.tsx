/** Hand-drawn doodles for the landing page cards. Each path draws itself in when `drawn` toggles on. */
export const DOODLES = {
  giraffe: {
    paths: [
      "M52 104L54 74Q56 62 68 62L92 62Q101 62 102 53L105 26Q106 16 114 16Q122 16 122 25L117 31Q111 33 111 40L109 64Q107 76 97 78L95 104",
      "M62 78L60 104M86 79L84 104",
      "M106 18L101 11M116 15L118 8",
      "M70 68a4 4 0 1 0 8 0a4 4 0 1 0-8 0M86 70a3 3 0 1 0 6 0a3 3 0 1 0-6 0M104 46a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
      "M54 70Q44 72 42 84",
    ],
  },
  rocket: {
    paths: [
      "M80 12Q101 32 101 62L101 86L59 86L59 62Q59 32 80 12Z",
      "M59 68L43 90L59 86M101 68L117 90L101 86",
      "M71 44a9 9 0 1 0 18 0a9 9 0 1 0-18 0",
      "M70 94Q74 108 80 112Q86 108 90 94",
    ],
  },
  pizza: {
    paths: [
      "M28 30Q80 8 132 30L80 108Z",
      "M35 40Q80 21 125 40",
      "M64 52a7 7 0 1 0 14 0a7 7 0 1 0-14 0M88 50a6 6 0 1 0 12 0a6 6 0 1 0-12 0M74 76a6 6 0 1 0 12 0a6 6 0 1 0-12 0",
    ],
  },
  house: {
    paths: [
      "M28 60L80 20L132 60",
      "M42 50L42 104L118 104L118 50",
      "M70 104L70 76L90 76L90 104",
      "M96 62L110 62L110 76L96 76Z",
      "M104 36L104 22L114 22L114 44",
    ],
  },
  octopus: {
    paths: [
      "M50 62Q48 22 80 20Q112 22 110 62Q109 72 100 72L60 72Q51 72 50 62Z",
      "M58 72Q48 88 58 100M72 72Q66 94 78 104M88 72Q94 94 84 104M102 72Q112 88 102 100",
      "M66 48a5 5 0 1 0 10 0a5 5 0 1 0-10 0M86 48a5 5 0 1 0 10 0a5 5 0 1 0-10 0",
      "M74 60Q80 64 86 60",
    ],
  },
  guitar: {
    paths: [
      "M30 86a24 24 0 1 0 48 0a24 24 0 1 0-48 0",
      "M50 62a16 16 0 1 0 32 0a16 16 0 1 0-32 0",
      "M49 82a6 6 0 1 0 12 0a6 6 0 1 0-12 0",
      "M64 70L126 16M120 10L132 22",
      "M40 96L56 80",
    ],
  },
  umbrella: {
    paths: [
      "M22 62Q80 0 138 62Q124 52 109 62Q95 52 80 62Q65 52 51 62Q37 52 22 62Z",
      "M80 62L80 102Q80 112 70 112Q61 112 61 103",
      "M80 6L80 14",
    ],
  },
  kite: {
    paths: [
      "M80 8L108 46L80 88L52 46Z",
      "M80 8L80 88M52 46L108 46",
      "M80 88Q68 98 80 104Q92 110 82 118",
      "M76 98L70 94M84 108L90 104",
    ],
  },
} as const;

export type DoodleName = keyof typeof DOODLES;

export function Doodle({ name, drawn = true, delay = 0 }: { name: DoodleName; drawn?: boolean; delay?: number }) {
  return (
    <svg className={`doodle${drawn ? " is-drawn" : ""}`} viewBox="0 0 160 120" aria-hidden="true" focusable="false">
      {DOODLES[name].paths.map((d, i) => (
        <path key={i} d={d} pathLength={1} style={{ animationDelay: `${delay + i * 220}ms` }} />
      ))}
    </svg>
  );
}
