"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description?: string;
}

export default function LogPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<MacroResult | null>(null);
  const [mealName, setMealName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setMealName("");

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      await analyzeImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64: string, mimeType: string) => {
    setAnalyzing(true);
    try {
      const res = await fetch(api("/api/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType: mimeType }),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await res.json();
      setResult(data.macros);
      setMealName(data.description || "My Meal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const saveLog = async () => {
    if (!result || !mealName) return;
    setSaving(true);
    try {
      const res = await fetch(api("/api/log"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_name: mealName,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
        }),
      });

      if (!res.ok) throw new Error("Failed to save log");

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 pb-24 max-w-md mx-auto">
      <h2 className="font-heading text-2xl font-bold text-text mb-6">Log a meal</h2>

      <div className="space-y-6">
        {/* Camera Upload Area */}
        {!imagePreview && (
          <div
            className="rounded-2xl bg-card border-2 border-dashed border-elevated p-8 text-center cursor-pointer hover:bg-elevated/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-4xl mb-4">📷</div>
            <p className="text-text font-medium mb-2">Snap or upload a photo</p>
            <p className="text-text-secondary text-sm">Claude Vision will analyze the macros instantly.</p>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
        />

        {/* Image Preview & Results */}
        {imagePreview && (
          <div className="space-y-6">
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-bg border border-elevated">
              <Image
                src={imagePreview}
                alt="Meal preview"
                fill
                className="object-cover"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm">
                  <div className="animate-spin text-4xl mb-4">🤔</div>
                  <p className="text-white font-medium">Analyzing with AI...</p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            {result && !analyzing && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <label className="block text-text-secondary text-sm mb-1">Meal Name</label>
                  <input
                    type="text"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    className="w-full premium-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card border border-elevated p-4 rounded-xl">
                    <div className="text-text-secondary text-xs uppercase font-bold tracking-wider mb-1">Calories</div>
                    <div className="text-2xl font-heading text-primary">{result.calories}</div>
                  </div>
                  <div className="bg-card border border-elevated p-4 rounded-xl">
                    <div className="text-text-secondary text-xs uppercase font-bold tracking-wider mb-1">Protein</div>
                    <div className="text-2xl font-heading text-success">{result.protein}g</div>
                  </div>
                  <div className="bg-card border border-elevated p-4 rounded-xl">
                    <div className="text-text-secondary text-xs uppercase font-bold tracking-wider mb-1">Carbs</div>
                    <div className="text-2xl font-heading text-warning">{result.carbs}g</div>
                  </div>
                  <div className="bg-card border border-elevated p-4 rounded-xl">
                    <div className="text-text-secondary text-xs uppercase font-bold tracking-wider mb-1">Fat</div>
                    <div className="text-2xl font-heading text-danger">{result.fat}g</div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setResult(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-elevated text-text font-medium hover:bg-elevated/80 transition-colors"
                  >
                    Retake
                  </button>
                  <button
                    onClick={saveLog}
                    disabled={saving}
                    className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Log"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
