import { AppShell } from "@/components/AppShell";
import { Chip } from "@/components/Chip";

export default function Loading() {
  return (
    <AppShell>
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="animate-pulse">
           <Chip emotion="thinking" size={80} />
        </div>
      </div>
    </AppShell>
  );
}