"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 180;

export function useScrollDock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setVisible(window.scrollY > SHOW_AFTER_PX);
        frame = 0;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return visible;
}
