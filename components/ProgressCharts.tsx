"use client";

/**
 * Heavy chart components for the progress page — split into their own file
 * so they can be React.lazy-loaded, keeping recharts out of the initial bundle.
 */
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    ReferenceLine, Cell, PieChart, Pie,
} from "recharts";

interface DailySummary {
    date: string;
    total_calories: number;
    total_protein?: number;
    total_carbs?: number;
    total_fat?: number;
}

interface DayData {
    dayStr: string;
    dateStr: string;
    isToday: boolean;
    calories: number;
    target: number;
    state: "none" | "over" | "hit" | "under";
    pct: number;
}

interface BarShapeProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
}

function GradientBar(props: BarShapeProps) {
    const { x = 0, y = 0, width = 0, height = 0, fill = "#2A2A3D" } = props;
    if (height === 0) return null;
    return <rect x={x} y={y} width={width} height={height} rx={6} ry={6} fill={fill} opacity={0.9} />;
}

interface WeeklyChartProps {
    last7: DayData[];
    calTarget: number;
}

export function WeeklyChart({ last7, calTarget }: WeeklyChartProps) {
    return (
        <div className="bg-[#13131C] border border-[#2A2A3D] rounded-[20px] p-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                    <XAxis
                        dataKey="dayStr"
                        stroke="#56566F"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        fontFamily="DM Sans"
                    />
                    <YAxis
                        stroke="#56566F"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, "dataMax"]}
                        fontFamily="DM Sans"
                    />
                    <Tooltip
                        cursor={{ fill: "#2A2A3D", opacity: 0.4, radius: 6 }}
                        contentStyle={{
                            backgroundColor: "#13131C",
                            border: "1px solid #2A2A3D",
                            borderRadius: "12px",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                            fontFamily: "DM Sans",
                        }}
                        itemStyle={{ color: "white", fontWeight: "bold" }}
                        labelStyle={{ color: "#9898B3", fontSize: "12px" }}
                    />
                    <ReferenceLine
                        y={calTarget}
                        stroke="#4F9EFF"
                        strokeDasharray="4 4"
                        strokeOpacity={0.5}
                    />
                    <Bar dataKey="calories" radius={[6, 6, 0, 0]} maxBarSize={28} shape={<GradientBar />}>
                        {last7.map((entry, i) => {
                            let fill = "#2A2A3D";
                            if (entry.state === "hit")   fill = "#34D8BC";
                            if (entry.state === "under") fill = "#4F9EFF";
                            if (entry.state === "over")  fill = "#FF6B6B";
                            return <Cell key={i} fill={fill} opacity={entry.isToday ? 1 : 0.7} />;
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

interface MacroDonutProps {
    summaries: DailySummary[];
}

export function MacroDonut({ summaries }: MacroDonutProps) {
    const logged = summaries.filter(s => s.total_calories && s.total_calories > 0);
    if (logged.length === 0) return null;

    const avg = {
        protein: logged.reduce((s, d) => s + (d.total_protein ?? 0), 0) / logged.length,
        carbs:   logged.reduce((s, d) => s + (d.total_carbs   ?? 0), 0) / logged.length,
        fat:     logged.reduce((s, d) => s + (d.total_fat     ?? 0), 0) / logged.length,
    };
    const total = avg.protein * 4 + avg.carbs * 4 + avg.fat * 9;
    if (total === 0) return null;

    const pieData = [
        { name: "Protein", value: Math.round(avg.protein * 4 / total * 100), color: "#7C6FFF" },
        { name: "Carbs",   value: Math.round(avg.carbs   * 4 / total * 100), color: "#34D8BC" },
        { name: "Fat",     value: Math.round(avg.fat     * 9 / total * 100), color: "#FFC84A" },
    ];

    return (
        <div className="px-5 mb-8">
            <h3 className="font-['Bricolage_Grotesque'] font-bold text-white text-[18px] mb-4">Avg Macro Split</h3>
            <div className="bg-[#13131C] border border-[#2A2A3D] rounded-[20px] p-4 flex items-center gap-4">
                <div className="w-[100px] h-[100px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={28}
                                outerRadius={46}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {pieData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    {pieData.map(d => (
                        <div key={d.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="font-['DM_Sans'] text-[13px] text-[#9898B3]">{d.name}</span>
                            </div>
                            <span className="font-['DM_Sans'] font-bold text-white text-[13px]">{d.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
