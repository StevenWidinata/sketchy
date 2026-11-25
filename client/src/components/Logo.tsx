export function RaccoonHead({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="30 28 160 130" aria-hidden="true" focusable="false">
      <ellipse cx="62" cy="58" rx="20" ry="24" transform="rotate(-28 62 58)" fill="#8e919b" stroke="#111216" strokeWidth="6" />
      <ellipse cx="158" cy="58" rx="20" ry="24" transform="rotate(28 158 58)" fill="#8e919b" stroke="#111216" strokeWidth="6" />
      <path
        d="M110 50C152 50 178 74 182 102C184 114 190 124 184 128C176 132 168 140 154 146C140 152 124 154 110 154C96 154 80 152 66 146C52 140 44 132 36 128C30 124 36 114 38 102C42 74 68 50 110 50Z"
        fill="#8e919b"
        stroke="#111216"
        strokeWidth="6"
      />
      <ellipse cx="110" cy="126" rx="34" ry="24" fill="#ece8de" />
      <path
        d="M44 100C52 82 74 80 90 88C100 93 104 96 110 96C116 96 120 93 130 88C146 80 168 82 176 100C170 116 152 120 136 114C124 110 118 106 110 106C102 106 96 110 84 114C68 120 50 116 44 100Z"
        fill="#24252b"
      />
      <circle cx="86" cy="99" r="10" fill="#fff" />
      <circle cx="134" cy="99" r="10" fill="#fff" />
      <circle cx="87" cy="100" r="5.5" fill="#111216" />
      <circle cx="135" cy="100" r="5.5" fill="#111216" />
      <ellipse cx="110" cy="120" rx="9" ry="6" fill="#111216" />
    </svg>
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="logo" translate="no">
      <RaccoonHead size={size} />
      <span className="logo-word">Sketchy</span>
    </span>
  );
}
