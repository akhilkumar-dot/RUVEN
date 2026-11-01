"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BridgeLogo } from "@/ui/BridgeLogo";

interface SplashScreenProps {
  onFinish: () => void;
}

/**
 * SplashScreen — three beats matching the prototype:
 * 1. Logo pops in (scale from 0.5 + rotate)
 * 2. "FounderBridge" wordmark fades up
 * 3. Tagline "Connect · Collaborate · Launch" fades up
 * Then a thin gradient loader fills across, and onFinish is called.
 */
export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<"logo" | "title" | "tagline" | "done">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("title"),   600);
    const t2 = setTimeout(() => setPhase("tagline"), 1200);
    const t3 = setTimeout(() => setPhase("done"),    3400);
    const t4 = setTimeout(() => onFinish(),          3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {phase !== "done" ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[var(--z-splash)] flex flex-col items-center justify-center gap-3"
          style={{
            background: "radial-gradient(circle at 50% 40%, #0b2a7a 0%, #000 70%)",
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <BridgeLogo size={96} strokeColor="#fff" accentColor="#60a5fa" />
          </motion.div>

          {/* Wordmark */}
          <AnimatePresence>
            {(phase === "title" || phase === "tagline") && (
              <motion.h1
                key="wordmark"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="text-white text-[36px] font-bold tracking-wide"
              >
                FounderBridge
              </motion.h1>
            )}
          </AnimatePresence>

          {/* Tagline */}
          <AnimatePresence>
            {phase === "tagline" && (
              <motion.p
                key="tagline"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="text-[#9db8ff] text-[15px] tracking-widest"
              >
                Connect · Collaborate · Launch
              </motion.p>
            )}
          </AnimatePresence>

          {/* Gradient loader bar */}
          <AnimatePresence>
            {phase === "tagline" && (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-5 w-[190px] h-[4px] rounded-full bg-white/20 overflow-hidden"
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #A24BFF, #FF3D81, #FF8A3D)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.0, ease: "linear" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
