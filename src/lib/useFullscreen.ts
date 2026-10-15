import { useCallback, useEffect, useState } from "react";

export function useFullscreen(target: () => Element | null) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enter = useCallback(() => {
    const el = target();
    if (el && !document.fullscreenElement) el.requestFullscreen().catch(() => {});
  }, [target]);

  const exit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) exit();
    else enter();
  }, [enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}
