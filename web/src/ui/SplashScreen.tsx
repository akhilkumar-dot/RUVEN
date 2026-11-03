"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BridgeLogo } from "@/ui/BridgeLogo";

interface SplashScreenProps {
  onFinish?: () => void;
  persistent?: boolean;
}

/**
 * SplashScreen — Redesigned according to the FounderBridge luxury OLED design system:
 * 1. Deep OLED black (#000000) with atmospheric purple/pink radial glow
 * 2. Signature white circular bridge badge wrapped in a glowing gradient ring
 * 3. Crisp white "FounderBridge" wordmark
 * 4. Elegant muted tagline "Connect · Collaborate · Launch" with themed dot accents
 * 5. Signature glowing gradient loader bar (#A24BFF → #FF3D81 → #FF8A3D)
 */
export function SplashScreen({ onFinish, persistent = false }: SplashScreenProps) {
  const [phase, setPhase] = useState<"logo" | "title" | "tagline" | "done">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("title"), 400);
    const t2 = setTimeout(() => setPhase("tagline"), 900);
    if (persistent) return;
    const t3 = setTimeout(() => setPhase("done"), 3200);
    const t4 = setTimeout(() => onFinish?.(), 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish, persistent]);

  return (
    <AnimatePresence>
      {phase !== "done" ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[var(--z-splash)] flex flex-col items-center justify-center bg-black overflow-hidden select-none"
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle line-art background texture */}
          <div className="absolute inset-0 texture-overlay opacity-30 pointer-events-none" />

          {/* Atmospheric ambient glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 42%, rgba(162, 75, 255, 0.16) 0%, rgba(255, 61, 129, 0.06) 35%, transparent 70%)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Signature Badge with glowing gradient ring */}
            <motion.div
              initial={{ scale: 0.65, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 20,
              }}
              className="relative mb-7"
            >
              {/* Outer pulsing glow */}
              <div
                className="absolute -inset-3 rounded-full blur-2xl opacity-40 animate-pulse pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, #A24BFF 0%, #FF3D81 50%, #FF8A3D 100%)",
                }}
              />

              {/* Gradient border ring */}
              <div
                className="relative p-[2.5px] rounded-full shadow-[0_0_40px_rgba(162,75,255,0.35)]"
                style={{
                  background:
                    "linear-gradient(135deg, #A24BFF 0%, #FF3D81 50%, #FF8A3D 100%)",
                }}
              >
                {/* Ruven logo badge */}
                <div className="w-24 h-24 rounded-3xl bg-black border border-[#2A2A2E] flex items-center justify-center shadow-2xl overflow-hidden">
                  <BridgeLogo size={88} />
                </div>
              </div>
            </motion.div>

            {/* Wordmark */}
            <AnimatePresence>
              {(phase === "title" || phase === "tagline") && (
                <motion.h1
                  key="wordmark"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="text-white text-[38px] md:text-[42px] font-bold tracking-tight text-center mb-2"
                >
                  Ruven
                </motion.h1>
              )}
            </AnimatePresence>

            {/* Tagline */}
            <AnimatePresence>
              {phase === "tagline" && (
                <motion.p
                  key="tagline"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[#A1A1A6] text-[12px] md:text-[13px] font-medium tracking-[0.25em] uppercase text-center"
                >
                  Connect <span className="text-[#A24BFF] mx-1">·</span> Collaborate{" "}
                  <span className="text-[#FF3D81] mx-1">·</span> Launch
                </motion.p>
              )}
            </AnimatePresence>

            {/* Signature glowing gradient loader bar */}
            <AnimatePresence>
              {phase === "tagline" && (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="mt-8 w-[200px] h-[3.5px] rounded-full bg-white/10 overflow-hidden relative shadow-[0_0_24px_rgba(162,75,255,0.45)]"
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #A24BFF 0%, #FF3D81 50%, #FF8A3D 100%)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.9, ease: [0.22, 1, 0.36, 1] }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
