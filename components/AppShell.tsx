import { Chip } from "@/components/Chip";
import { Nav } from "@/components/Nav";

export interface AppShellProps {
  children: React.ReactNode;
  chipEmotion?: "happy" | "hype" | "shocked" | "laughing" | "sad" | "on_fire" | "thinking" | "sleepy";
}

export function AppShell({ children, chipEmotion = "happy" }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-elevated bg-card">
        <h1 className="font-heading text-lg font-bold text-text">SnapMacros</h1>
        <Chip emotion={chipEmotion} size={48} />
      </header>
      <main className="flex-1 pb-20">{children}</main>
      <Nav />
    </div>
  );
}
