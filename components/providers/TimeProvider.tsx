"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type TimeOfDay = "day" | "night";

/** Hours (6–21) at which the page flips between the day and dusk themes. */
export const DUSK_AT = 18.4;
export const DAY_HOUR = 10.5;
export const NIGHT_HOUR = 20.3;

type TimeCtx = {
  /** Discrete theme used by CSS tokens. */
  time: TimeOfDay;
  /** Continuous time of day, 6 (sunrise) … 21 (night). Drives the 3D scene. */
  hour: number;
  setHour: (h: number) => void;
  toggle: () => void;
  set: (t: TimeOfDay) => void;
};

const Ctx = createContext<TimeCtx>({
  time: "day",
  hour: DAY_HOUR,
  setHour: () => {},
  toggle: () => {},
  set: () => {},
});

const KEY = "rearco-time";

export function TimeProvider({ children }: { children: React.ReactNode }) {
  const [hour, setHourState] = useState(DAY_HOUR);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "night") setHourState(NIGHT_HOUR);
    } catch {}
  }, []);

  const time: TimeOfDay = hour >= DUSK_AT ? "night" : "day";

  useEffect(() => {
    document.documentElement.dataset.time = time;
    try {
      localStorage.setItem(KEY, time);
    } catch {}
  }, [time]);

  const setHour = useCallback((h: number) => setHourState(Math.min(21, Math.max(6, h))), []);
  const set = useCallback((t: TimeOfDay) => setHourState(t === "night" ? NIGHT_HOUR : DAY_HOUR), []);
  const toggle = useCallback(() => setHourState((h) => (h >= DUSK_AT ? DAY_HOUR : NIGHT_HOUR)), []);

  const value = useMemo(() => ({ time, hour, setHour, toggle, set }), [time, hour, setHour, toggle, set]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTime = () => useContext(Ctx);
