import Link from "next/link";
import { MacroRings } from "@/components/MacroRings";
import { createClient } from "@/lib/supabase/server";
import { DEMO_USER_ID } from "@/lib/auth";

export const revalidate = 30; // 30s cache

export default async function HomePage() {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: summary } = await supabase
    .from("daily_summaries")
    .select("*")
    .eq("user_id", DEMO_USER_ID)
    .eq("date", today)
    .maybeSingle();

  // Targets (Usually from user profile, hardcoded for demo)
  const targets = { calories: 2200, protein: 160, carbs: 200, fat: 70 };

  const displayData = {
    calories: { current: summary?.total_calories || 0, target: targets.calories },
    protein: { current: summary?.total_protein || 0, target: targets.protein },
    carbs: { current: summary?.total_carbs || 0, target: targets.carbs },
    fat: { current: summary?.total_fat || 0, target: targets.fat },
  };

  return (
    <div className="p-4 flex flex-col items-center pb-24">
      <section className="w-full flex justify-center mb-8 mt-4">
        <MacroRings
          size={240}
          strokeWidth={16}
          calories={displayData.calories}
          protein={displayData.protein}
          carbs={displayData.carbs}
          fat={displayData.fat}
        />
      </section>

      <section className="w-full rounded-xl bg-card border border-elevated p-6 mb-4 flex flex-col items-center text-center">
        <h2 className="font-heading text-xl font-bold text-text mb-2">Ready for a meal?</h2>
        <p className="text-text-secondary text-sm mb-6">
          Snap a photo to instantly log your macros.
        </p>
        <Link
          href="/log"
          className="touch-target inline-flex items-center justify-center min-h-[48px] px-8 rounded-full bg-primary text-white font-bold tracking-wide hover:opacity-90 transition-opacity w-full sm:w-auto"
        >
          📷 Snap Food
        </Link>
      </section>

      <div className="w-full grid grid-cols-2 gap-4">
        <Link
          href="/meals"
          className="rounded-xl bg-card border border-elevated p-4 flex flex-col items-center justify-center hover:bg-elevated transition-colors"
        >
          <span className="text-2xl mb-2">🍽️</span>
          <span className="font-medium text-text mt-1">Meal History</span>
        </Link>
        <Link
          href="/roast"
          className="rounded-xl bg-card border border-elevated p-4 flex flex-col items-center justify-center hover:bg-elevated transition-colors"
        >
          <span className="text-2xl mb-2">🔥</span>
          <span className="font-medium text-text mt-1">Weekly Roast</span>
        </Link>
      </div>
    </div>
  );
}
