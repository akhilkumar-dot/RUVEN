import { MainAuthGuard } from "@/ui/MainAuthGuard";

/**
 * (main)/layout.tsx - Server Component layout for all protected main-app routes.
 *
 * `instant = false` is required here: the auth gate renders a spinner instead of
 * the child page during the static shell, so the page segment is dropped from
 * rendering and Next.js cannot validate instant navigation for it. The config
 * can only live in a Server Component module, which is why the guard itself
 * lives in `@/ui/MainAuthGuard`.
 */
export const instant = false;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainAuthGuard>{children}</MainAuthGuard>;
}
