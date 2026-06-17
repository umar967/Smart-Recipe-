import React, { useState } from "react";
import { Sparkles, Clipboard, ChefHat, HelpCircle } from "lucide-react";
import { PRESETS } from "../presets";

interface InputScreenProps {
  onDeconstruct: (text: string, presetName?: string) => void;
  loading: boolean;
  error: string | null;
}

export default function InputScreen({ onDeconstruct, loading, error }: InputScreenProps) {
  const [recipeText, setRecipeText] = useState("");

  const handlePresetSelect = (rawText: string) => {
    setRecipeText(rawText);
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setRecipeText(text);
        }
      } else {
        alert("Clipboard access is restricted in this environment. Please paste manually using Ctrl+V or Cmd+V.");
      }
    } catch (err) {
      alert("Please paste your text manually into the input box.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeText.trim()) return;
    onDeconstruct(recipeText);
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto" id="input-screen-container">
      {/* Welcome Hero Section */}
      <section className="flex flex-col gap-2" id="hero-title-section">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface">Ready to cook?</h2>
        <p className="text-base text-on-surface-variant leading-relaxed">
          Paste a complex recipe below, and your sophisticated sous-chef will break it down into effortless steps with dynamic scaling and timers.
        </p>
      </section>

      {/* Input Form Area Container */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 custom-shadow flex flex-col gap-6" id="input-card-container">
        <form onSubmit={handleSubmit} className="relative flex flex-col gap-6">
          <div className="relative">
            <h3 className="block font-semibold text-sm text-primary uppercase tracking-wider mb-3">
              Recipe Content
            </h3>
            <div className="relative">
              <textarea
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 font-normal text-base text-on-surface placeholder-outline/65 focus:ring-2 focus:ring-primary-container focus:outline-none transition-all resize-none min-h-[220px]"
                id="recipe-input"
                placeholder="E.g., 500g of flour, 2 eggs, whisk until smooth, bake for 30 minutes..."
                value={recipeText}
                onChange={(e) => setRecipeText(e.target.value)}
                disabled={loading}
              />
              
              {/* Quick paste helper button */}
              <button
                type="button"
                onClick={handlePaste}
                title="Paste from clipboard"
                className="absolute top-4 right-4 p-2 text-primary bg-surface-container hover:bg-surface-container-high active:scale-95 rounded-xl transition-all cursor-pointer"
              >
                <Clipboard className="w-5 h-5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm flex items-start gap-2 border border-error/10" id="error-box">
              <HelpCircle className="w-5 h-5 shrink-0 mt-0.5 text-error" />
              <div>
                <p className="font-semibold">Deconstruction Error</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-secondary-container/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-secondary shrink-0 animate-pulse" />
              <span className="text-sm font-semibold text-on-secondary-container">
                AI-powered deconstruction enabled
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !recipeText.trim()}
              className={`w-full py-5 rounded-full font-semibold text-lg shadow-md transition-all duration-200 flex items-center justify-center gap-3 select-none active:scale-98 cursor-pointer ${
                loading
                  ? "bg-primary/50 text-white cursor-not-allowed"
                  : recipeText.trim()
                  ? "bg-primary text-on-primary hover:opacity-95 shadow-lg active:scale-95"
                  : "bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed"
              }`}
              id="deconstruct-recipe-btn"
            >
              <ChefHat className={`w-6 h-6 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Deconstructing Recipe..." : "Deconstruct Recipe"}
            </button>
          </div>
        </form>
      </div>

      {/* Culinary Presets Carousel */}
      <section className="flex flex-col gap-3" id="presets-section">
        <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">
          Or load a sophisticated culinary preset:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="presets-grid">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              disabled={loading}
              onClick={() => handlePresetSelect(preset.rawText)}
              className={`group text-left p-5 bg-surface-container-lowest border rounded-2xl custom-shadow hover:border-primary-container/40 hover:-translate-y-0.5 transition-all outline-none duration-150 cursor-pointer ${
                recipeText === preset.rawText ? "border-primary-container ring-1 ring-primary-container" : "border-outline-variant/20"
              }`}
            >
              <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors mb-1">
                {preset.name}
              </h4>
              <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Visual Inspiration Card */}
      <div className="relative w-full h-48 rounded-3xl overflow-hidden custom-shadow" id="inspiration-banner">
        <img
          alt="Kitchen Scene"
          className="w-full h-full object-cover select-none"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAth5uh-PcqE5QNxglNjcAk0cwqfO1gfzBEbqc1kFLL3IU02PeWfB5NWBQq504u5m19WbI6x8pi1EYKN4PTPoXwRrB895Qus20tznQ3vu-67vRYqkc92ulEl9dcHZDAVjPwpPtmHl9grbrwxxoYTcEFCdLbaeQKtXV9ODq_tvLfMzDUsyi2QpfNR-NyQc1lIV5VRgxB6Ocg6X8CvFLSXeNe6nGqJrUMD5ko5KfEQLqNOKeet0FS5u47eIQwEVmDdpz9VYnr_VFxsds"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6 select-none">
          <p className="text-white text-sm font-medium italic leading-relaxed">
            "Cooking is at once child's play and adult joy."
          </p>
        </div>
      </div>
    </div>
  );
}
