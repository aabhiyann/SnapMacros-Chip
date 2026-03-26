import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: logs, error } = await supabase
            .from("food_logs")
            .select("description, calories, protein, carbs, fat, meal_type, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Build CSV
        const header = "Date,Time,Food,Calories,Protein (g),Carbs (g),Fat (g),Meal Type";
        const rows = (logs ?? []).map(log => {
            const d = new Date(log.created_at);
            const date = d.toLocaleDateString("en-US");
            const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
            const food = `"${(log.description ?? "").replace(/"/g, '""')}"`;
            return [date, time, food, log.calories, log.protein, log.carbs, log.fat, log.meal_type ?? "other"].join(",");
        });

        const csv = [header, ...rows].join("\n");
        const filename = `snapmacros-${new Date().toISOString().split("T")[0]}.csv`;

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (e) {
        const message = e instanceof Error ? e.message : "Server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
