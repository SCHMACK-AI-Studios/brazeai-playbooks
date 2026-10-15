import { useCallback, useEffect, useState } from "react";

const KEY = "schmack-playbooks:timer";

interface TimerState {
  /** Epoch ms when the current running stretch began, or null while paused. */
  runningSince: number | null;
  /** Milliseconds banked from earlier stretches. */
  banked: number;
}

function read(): TimerState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as TimerState;
  } catch {
    // Fall through to a fresh timer.
  }
  return { runningSince: null, banked: 0 };
}

function write(s: TimerState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // The timer still runs for this page; it just will not survive a refresh.
  }
}

export function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Elapsed talk time for the presenter view. It is stored as timestamps
 * rather than a ticking counter, so a refresh of the presenter window
 * mid-talk carries on from the right time instead of restarting at 00:00.
 * It starts itself on the first forward press, or from the Start button.
 */
export function usePresenterTimer() {
  const [state, setState] = useState<TimerState>(read);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const update = useCallback((next: TimerState) => {
    write(next);
    setState(next);
  }, []);

  const elapsed = state.banked + (state.runningSince ? now - state.runningSince : 0);
  const running = state.runningSince !== null;

  const start = useCallback(() => {
    const s = read();
    if (s.runningSince === null) update({ ...s, runningSince: Date.now() });
  }, [update]);

  const pause = useCallback(() => {
    const s = read();
    if (s.runningSince !== null) update({ runningSince: null, banked: s.banked + Date.now() - s.runningSince });
  }, [update]);

  const reset = useCallback(() => update({ runningSince: null, banked: 0 }), [update]);

  return { elapsed, running, start, pause, reset };
}
