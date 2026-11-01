"use client";

import { useState } from "react";
import { TopBar } from "@/ui/TopBar";
import { BentoGrid, BentoCard } from "@/ui/BentoCard";
import { BottomDock, FloatingActionStack } from "@/ui/BottomDock";

// ── Mock data — replaced by real API in Phase 1 ──────────────
const MOCK_FEATURED = {
  name: "Freya Sinclair",
  photoUrl: null, // real photo from API in Phase 2
  statValue: "10.3M",
  colorSeed: "Freya Sinclair",
};

const MOCK_CARDS = [
  { name: "Sienna Voss",     statValue: "9.8M",  colorSeed: "Sienna Voss" },
  { name: "Lysander Thorne", statValue: "7.45M", colorSeed: "Lysander Thorne" },
  { name: "Dorian Voss",     statValue: "9.7M",  colorSeed: "Dorian Voss" },
  { name: "Luna Frey",       statValue: "4.1M",  colorSeed: "Luna Frey" },
];

const HOME_TABS = [
  { key: "feed",     label: "Feed" },
  { key: "founders", label: "Founders" },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="min-h-dvh bg-black flex flex-col">
      {/* Top bar */}
      <TopBar
        unreadCount={9}
        onMenuOpen={() => {}}
        onSearchOpen={() => {}}
        onNotificationsOpen={() => {}}
      />

      {/* Scrollable content */}
      <main
        className="flex-1 overflow-y-auto pb-[calc(80px+env(safe-area-inset-bottom,0px))]"
        id="main-content"
      >
        <div className="px-3 pt-3 max-w-[430px] mx-auto">
          {/* Bento grid — matches reference screen 1 */}
          <BentoGrid>
            {/* Hero card — full width (col-span-2) */}
            <BentoCard
              variant="hero"
              name={MOCK_FEATURED.name}
              photoUrl={MOCK_FEATURED.photoUrl}
              statValue={MOCK_FEATURED.statValue}
              statLabel="connections"
              colorSeed={MOCK_FEATURED.colorSeed}
              onClick={() => {}}
            />

            {/* Half cards — 2-column grid */}
            {MOCK_CARDS.slice(0, 2).map((card) => (
              <BentoCard
                key={card.name}
                variant="half"
                name={card.name}
                statValue={card.statValue}
                colorSeed={card.colorSeed}
                onClick={() => {}}
              />
            ))}

            {/* Third row — two more half cards */}
            {MOCK_CARDS.slice(2, 4).map((card) => (
              <BentoCard
                key={card.name}
                variant="half"
                name={card.name}
                statValue={card.statValue}
                colorSeed={card.colorSeed}
                onClick={() => {}}
              />
            ))}
          </BentoGrid>

          {/* Detail card peek — matches reference screen 3 */}
          <div className="mt-3">
            <BentoCard
              variant="detail"
              name="Dorian Voss"
              statValue="9.7M"
              colorSeed="detail-lavender"
              color="#9A6BB8"
              headline="Eat a lemon without making a face"
              meta="$500 per creator"
              onClick={() => {}}
            />
          </div>

          {/* Spacer so content isn't hidden by dock */}
          <div className="h-6" />
        </div>
      </main>

      {/* Floating action stack */}
      <FloatingActionStack
        onTodayMeetups={() => {}}
        onQuickPost={() => {}}
        onVerifiedStatus={() => {}}
        verifiedCount={2}
      />

      {/* Bottom dock */}
      <BottomDock
        activeTab={activeTab}
        tabs={HOME_TABS}
        onTabChange={setActiveTab}
        onCreateOpen={() => {}}
        userName="Aarav Reddy"
        onProfileOpen={() => {}}
      />
    </div>
  );
}
