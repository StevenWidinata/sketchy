import { useEffect, useState, type RefObject } from "react";

const PHONE = "(max-width: 960px)";

/**
 * Follows the part of the screen the keyboard doesn't cover.
 * Writes `--vvh` (visible height) and `--vv-top` (how far the browser panned down) on `el`,
 * and returns true while an on-screen keyboard is open on a phone-sized screen.
 *
 * iPhones keep the page height when the keyboard opens and pan the view instead; Android browsers
 * shrink it. Comparing against the tallest visible height seen so far catches both.
 */
export function useKeyboardOpen(el: RefObject<HTMLElement | null>): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    const node = el.current;
    if (!vv || !node) return;
    const phone = window.matchMedia(PHONE);
    let tallest = vv.height;
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        tallest = Math.max(tallest, vv.height);
        node.style.setProperty("--vvh", `${Math.round(vv.height)}px`);
        node.style.setProperty("--vv-top", `${Math.round(vv.offsetTop)}px`);
        setOpen(phone.matches && vv.height < tallest * 0.8);
      });
    };
    const reset = () => {
      // A rotated phone has a new full height.
      tallest = vv.height;
      update();
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("orientationchange", reset);
    phone.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("orientationchange", reset);
      phone.removeEventListener("change", reset);
    };
  }, [el]);

  return open;
}
