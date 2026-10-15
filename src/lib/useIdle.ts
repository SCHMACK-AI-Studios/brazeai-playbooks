import { useEffect, useRef, useState } from "react";

/** True once the pointer/keyboard has been still for `delay`ms — used to auto-hide presentation controls. */
export function useIdle(delay = 2500): boolean {
  const [idle, setIdle] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function reset() {
      setIdle(false);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setIdle(true), delay);
    }
    reset();
    window.addEventListener("pointermove", reset);
    window.addEventListener("keydown", reset);
    window.addEventListener("touchstart", reset);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("pointermove", reset);
      window.removeEventListener("keydown", reset);
      window.removeEventListener("touchstart", reset);
    };
  }, [delay]);

  return idle;
}
