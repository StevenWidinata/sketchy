/** Line icons in one style: 24px grid, 1.75 stroke, round caps. Decorative by default. */
const PATHS: Record<string, string> = {
  pencil: "M15.2 4.8a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z M13.5 6.5l3 3",
  eraser: "m7 21-4.3-4.3a1.5 1.5 0 0 1 0-2.1L13.6 3.7a1.5 1.5 0 0 1 2.1 0l4.6 4.6a1.5 1.5 0 0 1 0 2.1L10 21 M22 21H7 M5 12l7 7",
  bucket: "M19 11 11 3 3.6 10.4a2 2 0 0 0 0 2.8l5.2 5.2a2 2 0 0 0 2.8 0Z M5 2l5 5 M2 13h15 M22 20a2 2 0 1 1-4 0c0-1.6 2-3 2-3s2 1.4 2 3Z",
  undo: "M9 14 4 9l5-5 M4 9h10.5a5.5 5.5 0 0 1 0 11H11",
  trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  like: "M7 10v12 M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9Z",
  dislike: "M17 14V2 M9 18.1 10 14H4.2a2 2 0 0 1-1.9-2.6l2.3-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.8a2 2 0 0 0-1.8 1.1L12 22a3.1 3.1 0 0 1-3-3.9Z",
  volume: "M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5Z M16 9a5 5 0 0 1 0 6 M19.4 18.4a9 9 0 0 0 0-12.8",
  mute: "M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5Z M22 9l-6 6 M16 9l6 6",
  copy: "M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2",
  check: "M20 6 9 17l-5-5",
  leave: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  crown: "M11.6 3.3a.5.5 0 0 1 .9 0l2.9 5.6a1 1 0 0 0 1.5.3l4.3-3.7a.5.5 0 0 1 .8.5l-2.8 10.3a1 1 0 0 1-1 .7H5.8a1 1 0 0 1-1-.7L2 6a.5.5 0 0 1 .8-.5l4.3 3.7a1 1 0 0 0 1.5-.3Z M5 21h14",
  send: "M14.5 21.7a.5.5 0 0 0 .9 0L22 2.6a.5.5 0 0 0-.6-.6L2.3 8.6a.5.5 0 0 0 0 .9l8 3.2a2 2 0 0 1 1.1 1.1Z M21.9 2.1 10.9 13.1",
  play: "M6 3.9a1 1 0 0 1 1.5-.9l12.4 8.1a1 1 0 0 1 0 1.7L7.5 20.9A1 1 0 0 1 6 20.1Z",
  pause: "M14 4h4v16h-4Z M6 4h4v16H6Z",
  download: "M12 15V3 M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5",
  close: "M18 6 6 18 M6 6l12 12",
  link: "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7 M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
  chat: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z",
  replay: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.7 2.7L3 8 M3 3v5h5",
  wifiOff: "M12 20h.01 M8.5 16.4a5 5 0 0 1 7 0 M2 8.8a15 15 0 0 1 4.2-2.6 M10.7 5.1A15 15 0 0 1 22 8.8 M5 12.9a10 10 0 0 1 5.2-2.7 M19 12.9a10 10 0 0 0-2.4-1.7 M2 2l20 20",
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, label }: { name: IconName; size?: number; label?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
