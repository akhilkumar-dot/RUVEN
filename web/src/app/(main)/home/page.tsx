import { Suspense } from "react";
import HomeClient from "./HomeClient";

export const instant = false;

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#A24BFF] border-t-transparent animate-spin" />
        </div>
      }
    >
      <HomeClient />
    </Suspense>
  );
}