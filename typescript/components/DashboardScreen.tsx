import React, { useState, useEffect } from "react";
import { Timer, Check, RotateCcw, Play, Pause, ShoppingBag, Plus, Sparkles, ChefHat } from "lucide-react";
import { Recipe, Ingredient } from "../types";

interface DashboardScreenProps {
  recipe: Recipe;
  onAddToShoppingList: (ingredients: Ingredient[], recipeName: string) => void;
}

export default function DashboardScreen({ recipe, onAddToShoppingList }: DashboardScreenProps) {
  const [scale, setScale] = useState<number>(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [timers, setTimers] = useState<Record<number, { remaining: number; status: "idle" | "running" | "paused" }>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [addedToCart, setAddedToCart] = useState<boolean>(false);

  // Initialize timers when recipe changes
  useEffect(() => {
    const initialTimers: typeof timers = {};
    recipe.steps.forEach((step) => {
      if (step.timerDuration && step.timerDuration > 0) {
        initialTimers[step.stepNumber] = {
          remaining: step.timerDuration,
          status: "idle",
        };
      }
    });
    setTimers(initialTimers);
    setCheckedIngredients({});
    setCompletedSteps({});
    setAddedToCart(false);
  }, [recipe]);

  // Timers countdown ticker effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        let changed = false;

        Object.keys(next).forEach((numStr) => {
          const num = parseInt(numStr);
          if (next[num].status === "running") {
            changed = true;
            if (next[num].remaining > 0) {
              next[num] = {
                ...next[num],
                remaining: next[num].remaining - 1,
              };
            } else {
              next[num] = {
                ...next[num],
                status: "idle", // Reset to idle on completion
              };
              // Automatically mark step as completed when timer finishes!
              setCompletedSteps((prevSteps) => ({ ...prevSteps, [num]: true }));
              
              // Direct playful voice synthetic call or simple beep if permitted
              try {
                if (window.speechSynthesis) {
                  const utterance = new SpeechSynthesisUtterance(`Timer for step ${recipe.steps.find(s => s.stepNumber === num)?.title || num} is done!`);
                  utterance.volume = 0.5;
                  window.speechSynthesis.speak(utterance);
                }
              } catch (_) {}
            }
          }
        });

        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [recipe]);

  // Handle ticking ingredients off
  const toggleIngredient = (idx: number, name: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [`${idx}-${name}`]: !prev[`${idx}-${name}`],
    }));
  };

  // Helper to format timers (seconds to MM:SS)
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Helper to calculate and format dynamic scaled values
  const getScaledAmount = (ing: Ingredient) => {
    if (ing.numericValue === null || ing.numericValue === undefined) {
      return ing.amountText;
    }
    const scaledVal = ing.numericValue * scale;
    // Pretty print floats
    const rounded = Math.round(scaledVal * 100) / 100;
    return `${rounded}${ing.unit || ""}`;
  };

  const handleTimerAction = (stepNumber: number, action: "start" | "pause" | "reset") => {
    setTimers((prev) => {
      const stepTimer = prev[stepNumber];
      if (!stepTimer) return prev;

      let nextStatus = stepTimer.status;
      let nextRemaining = stepTimer.remaining;

      if (action === "start") nextStatus = "running";
      if (action === "pause") nextStatus = "paused";
      if (action === "reset") {
        nextStatus = "idle";
        nextRemaining = recipe.steps.find((s) => s.stepNumber === stepNumber)?.timerDuration || 0;
      }

      return {
        ...prev,
        [stepNumber]: { remaining: nextRemaining, status: nextStatus },
      };
    });
  };

  // Checkbox steps completion tracking
  const toggleStepCompleted = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const completedStepsCount = Object.values(completedSteps).filter(Boolean).length;
  const totalStepsWithTimers = recipe.steps.length;

  const handleSendToShoppingList = () => {
    // Only send ingredients not yet prep-checked (unchecked = need to buy)
    const uncheckedIngredients = recipe.ingredients.filter((ing, idx) => {
      const idKey = `${idx}-${ing.name}`;
      return !checkedIngredients[idKey];
    });
    const scaledIngredients = uncheckedIngredients.map((ing) => ({
      ...ing,
      amountText: getScaledAmount(ing),
    }));
    onAddToShoppingList(scaledIngredients, recipe.recipeName);
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col gap-10 max-w-2xl mx-auto" id="dashboard-screen-container">
      {/* Recipe Large Card with image */}
      <section className="relative h-64 w-full rounded-[32px] overflow-hidden custom-shadow" id="dashboard-hero">
        <img
          className="w-full h-full object-cover select-none"
          src={
            recipe.imageUrl ||
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAMH0AoMeNhqkc5P6saAPQrgkeFGj0vjiL4zrt_OfzBgUPIgdZ2zCQ8xUAAZcoYx-b55Y085_as691DFHmHDC4aQuOCPL4KBIXa6-GsCLfP7ynptkNkCy6SGBZ4w1rbbFlHbplfwndQKx_tivmwbF5jW8Tjdg-YmuUOuiGXDvDkCE1EOcLQ975KPV6xE_POLaS2pfuVQtbQNGqtrzGDlmCibhATM7da6-yj0EDCy1yvhkxfVgPfjfkRN70RejoD_IoNCaRpkEN2SX4"
          }
          alt={recipe.recipeName}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-6 select-none">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-primary-container uppercase tracking-widest flex items-center gap-1">
              <ChefHat className="w-4.5 h-4.5 animate-pulse" /> Active Sous-Chef Plan
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">{recipe.recipeName}</h2>
          </div>
        </div>
      </section>

      {/* Yield Servings Scaler */}
      <section className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-surface-container-lowest p-6 rounded-3xl custom-shadow" id="yield-scaler-card">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-outline uppercase tracking-widest">Adjust Recipe Yield</span>
          <span className="text-lg font-bold text-primary">Multiplier: {scale}x ({recipe.yieldText})</span>
        </div>
        <div className="flex gap-2 p-1 bg-surface-container rounded-full w-fit">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                scale === s ? "bg-primary text-on-primary shadow-sm" : "bg-transparent text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </section>

      {/* Ingredients List */}
      <section className="flex flex-col gap-4" id="dashboard-ingredients-list">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-on-surface">Prep Ingredients ({recipe.ingredients.length})</h3>
          <button
            onClick={handleSendToShoppingList}
            className={`px-4 py-2 text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer transition-all ${
              addedToCart
                ? "bg-secondary text-white"
                : "bg-primary/10 text-primary hover:bg-primary/15"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {addedToCart ? "Added to Cart!" : "Send to Shopping List"}
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {recipe.ingredients.map((ing, idx) => {
            const idKey = `${idx}-${ing.name}`;
            const isChecked = !!checkedIngredients[idKey];
            return (
              <div
                key={idKey}
                onClick={() => toggleIngredient(idx, ing.name)}
                className={`flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl custom-shadow border border-outline-variant/10 cursor-pointer select-none active:scale-99 transition-all ${
                  isChecked ? "opacity-60" : "opacity-100 hover:border-outline-variant/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-outline-variant/40 flex items-center justify-center transition-all ${
                      isChecked ? "bg-secondary border-secondary text-white" : "bg-transparent text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                  <span className={`text-base font-medium text-on-surface ${isChecked ? "line-through opacity-70" : ""}`}>
                    {ing.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-primary bg-primary-container/10 px-3 py-1 rounded-full">
                  {getScaledAmount(ing)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cooking Steps (Timeline) */}
      <section className="flex flex-col gap-5" id="dashboard-timeline-steps">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-on-surface">Execution Steps</h3>
          <span className="text-xs font-medium text-secondary bg-secondary-container/20 px-3 py-1 rounded-full">
            {completedStepsCount} of {totalStepsWithTimers} Done
          </span>
        </div>

        <div className="flex flex-col gap-8 relative pl-6" id="timeline-flow">
          {recipe.steps.map((step, idx) => {
            const isPast = completedSteps[step.stepNumber];
            const isCurrent = !isPast && (idx === 0 || completedSteps[recipe.steps[idx - 1].stepNumber]);
            const timerState = timers[step.stepNumber];
            
            return (
              <div key={step.stepNumber} className="relative flex flex-col gap-3">
                {/* Visual Connector Vertical Line */}
                {idx !== recipe.steps.length - 1 && (
                  <div
                    className={`absolute -left-[17px] top-6 w-0.5 h-[calc(100%+32px)] ${
                      isPast ? "bg-secondary" : "border-l-2 border-dashed border-outline-variant/40"
                    }`}
                  />
                )}

                {/* Timeline Circular node */}
                <button
                  type="button"
                  onClick={() => toggleStepCompleted(step.stepNumber)}
                  className={`absolute -left-[24px] top-1.5 w-4 h-4 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                    isPast
                      ? "bg-secondary border-secondary scale-110"
                      : isCurrent
                      ? "bg-surface-bright border-primary scale-110"
                      : "bg-surface-container-high border-outline-variant/50"
                  }`}
                  title="Mark finished"
                />

                {/* Step Card body */}
                <div
                  className={`flex flex-col gap-4 p-6 rounded-3xl custom-shadow border transition-all ${
                    isPast
                      ? "bg-surface-container-low/70 border-secondary/10 opacity-70"
                      : isCurrent
                      ? "bg-surface-container-lowest border-primary-container/40"
                      : "bg-surface-container-lowest/60 border-outline-variant/10 opacity-80"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <span
                      onClick={() => toggleStepCompleted(step.stepNumber)}
                      className={`text-xs font-bold uppercase tracking-widest cursor-pointer select-none hover:text-primary transition-colors ${
                        isPast ? "text-secondary" : "text-primary"
                      }`}
                    >
                      Step {step.stepNumber}: {step.title}
                    </span>

                    {/* Step Timer Badge */}
                    {timerState && (
                      <div
                        className={`flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1 ${
                          timerState.status === "running"
                            ? "bg-error-container text-on-error-container animate-pulse"
                            : isPast
                            ? "bg-secondary/10 text-secondary"
                            : "bg-primary-container/10 text-primary"
                        }`}
                      >
                        <Timer className="w-3.5 h-3.5" />
                        <span>{formatTime(timerState.remaining)}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-base text-on-surface-variant leading-relaxed font-normal">
                    {step.description}
                  </p>

                  {/* Operational Timer Controls */}
                  {timerState && (
                    <div className="flex items-center gap-3 pt-2">
                      {timerState.status === "running" ? (
                        <button
                          type="button"
                          onClick={() => handleTimerAction(step.stepNumber, "pause")}
                          className="flex-1 py-3 text-xs font-bold rounded-full border border-outline text-on-surface hover:bg-surface-container active:scale-97 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          <Pause className="w-4 h-4" /> Pause Timer
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleTimerAction(step.stepNumber, "start")}
                          className="flex-1 py-3 text-xs font-bold rounded-full bg-secondary text-on-secondary hover:opacity-95 active:scale-97 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-4 h-4" /> {timerState.status === "paused" ? "Run Timer" : "Start Timer"}
                        </button>
                      )}

                      {timerState.remaining !== step.timerDuration && (
                        <button
                          type="button"
                          onClick={() => handleTimerAction(step.stepNumber, "reset")}
                          className="p-3 rounded-full border border-outline text-on-surface hover:bg-surface-container active:scale-95 cursor-pointer transition-all"
                          title="Reset Timer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
