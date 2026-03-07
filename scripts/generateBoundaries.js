const fs = require('fs');

const loadingCode = `import { AppShell } from "@/components/AppShell";
import Chip from "@/components/Chip";

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
}`;

const errorCode = `"use client";

import { AppShell } from "@/components/AppShell";
import Chip from "@/components/Chip";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <AppShell>
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Chip emotion="sad" size={100} />
        <h2 className="text-white font-['Bricolage_Grotesque'] text-[24px] font-bold mt-6 mb-2">Something went wrong</h2>
        <p className="text-[#A0A0B8] font-['DM_Sans'] mb-8 max-w-[280px]">
          Even the best incubators have bad days.
        </p>
        <button
          onClick={() => reset()}
          className="bg-[#2A2A3A] hover:bg-[#323246] transition-colors text-white px-8 py-3 rounded-xl font-bold font-['DM_Sans']"
        >
          Try again
        </button>
      </div>
    </AppShell>
  );
}`;

['dashboard', 'progress', 'profile', 'snap'].forEach(route => {
    const dir = `app/${route}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/loading.tsx`, loadingCode);
    fs.writeFileSync(`${dir}/error.tsx`, errorCode);
});
