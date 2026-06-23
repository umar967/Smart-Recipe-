import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PlusCircle,
  LayoutGrid,
  ShoppingBag,
  Shield,
  Menu,
  X,
  ChefHat,
  ChevronRight,
  Sparkles,
  BookOpen,
  Info
} from "lucide-react";
import { Recipe, Ingredient, ShoppingItem } from "./types";
import { PRESETS } from "./presets";
import { deconstructRecipe } from "./ml/deconstructRecipe";
import InputScreen from "./components/InputScreen";
import DashboardScreen from "./components/DashboardScreen";
import ShoppingListScreen from "./components/ShoppingListScreen";

// Preconstruct initial mocking items to reflect the mockups out of the box
const DEFAULT_SHOPPING_ITEMS: ShoppingItem[] = [
  { id: "init-1", name: "Organic Heirloom Tomatoes", amountText: "3 large", category: "Produce", checked: false, recipeName: "Tuscan Garlic Pasta" },
  { id: "init-2", name: "Fresh Sweet Basil", amountText: "1 bunch", category: "Produce", checked: false, recipeName: "Tuscan Garlic Pasta" },
  { id: "init-3", name: "Cloves of Garlic", amountText: "6 cloves", category: "Produce", checked: true, recipeName: "Tuscan Garlic Pasta" },
  { id: "init-4", name: "Baby Spinach", amountText: "250g", category: "Produce", checked: false, recipeName: "Tuscan Garlic Pasta" },
  { id: "init-5", name: "Cold Pressed Olive Oil", amountText: "500ml", category: "Pantry", checked: false, recipeName: "Tuscan Garlic Pasta" },
  { id: "init-6", name: "Arborio Rice", amountText: "1kg", category: "Pantry", checked: false, recipeName: "Mushroom Risotto" },
  { id: "init-7", name: "Unsalted Grass-fed Butter", amountText: "250g", category: "Dairy", checked: false, recipeName: "Tuscan Garlic Pasta" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"input" | "dashboard" | "shopping-list">("input");
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [recipeHistory, setRecipeHistory] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedActive = localStorage.getItem("smart_active_recipe");
      const storedHistory = localStorage.getItem("smart_recipe_history");
      const storedShopping = localStorage.getItem("smart_shopping_list");

      if (storedActive) {
        setActiveRecipe(JSON.parse(storedActive));
      } else {
        // default first-use experience matches Artisanal Sourdough mockup
        setActiveRecipe(PRESETS[0].fallbackRecipe);
      }

      if (storedHistory) {
         setRecipeHistory(JSON.parse(storedHistory));
      } else {
         setRecipeHistory([PRESETS[0].fallbackRecipe]);
      }

      if (storedShopping) {
        setShoppingList(JSON.parse(storedShopping));
      } else {
        setShoppingList(DEFAULT_SHOPPING_ITEMS);
      }
    } catch (_) {
      setActiveRecipe(PRESETS[0].fallbackRecipe);
      setRecipeHistory([PRESETS[0].fallbackRecipe]);
      setShoppingList(DEFAULT_SHOPPING_ITEMS);
    }
  }, []);

  // Save shopping list to local storage
  const saveShoppingList = (list: ShoppingItem[]) => {
    setShoppingList(list);
    localStorage.setItem("smart_shopping_list", JSON.stringify(list));
  };

  // Process manual or pre-filled unstructured recipe
  const handleDeconstruct = async (recipeText: string, customName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await deconstructRecipe(recipeText);

      const generatedRecipe: Recipe = {
        ...data,
        id: `recipe-${Date.now()}`,
        recipeName: customName || data.recipeName,
        createdAt: new Date().toISOString()
      };

      // Set active
      setActiveRecipe(generatedRecipe);
      localStorage.setItem("smart_active_recipe", JSON.stringify(generatedRecipe));

      // Append to history
      const nextHistory = [generatedRecipe, ...recipeHistory.filter((r) => r.recipeName !== generatedRecipe.recipeName)];
      setRecipeHistory(nextHistory);
      localStorage.setItem("smart_recipe_history", JSON.stringify(nextHistory));

      // Redirect direct to Dashboard screen
      setActiveTab("dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while deconstructing the recipe on-device.");
    } finally {
      setLoading(false);
    }
  };

  // Add ingredients of current active plan to Shopping list
  const handleAddToShoppingList = (ingredients: Ingredient[], recipeName: string) => {
    const freshItems: ShoppingItem[] = ingredients.map((ing, idx) => ({
      id: `${Date.now()}-${idx}-${ing.name.substring(0, 5)}`,
      name: ing.name,
      amountText: ing.amountText,
      category: ing.category,
      checked: false,
      recipeName,
    }));

    // Filter out duplicates (based on name & category) and combine values, or keep separate
    // We append nicely:
    const updatedList = [...shoppingList, ...freshItems];
    saveShoppingList(updatedList);
  };

  const handleToggleShoppingItem = (id: string) => {
    const updated = shoppingList.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveShoppingList(updated);
  };

  const handleAddCustomShoppingItem = (
    name: string,
    amount: string,
    category: "Produce" | "Pantry" | "Dairy" | "Meat" | "Bakery" | "Other"
  ) => {
    const newItem: ShoppingItem = {
      id: `custom-${Date.now()}`,
      name,
      amountText: amount,
      category,
      checked: false,
      recipeName: "Custom Add-On",
    };
    saveShoppingList([newItem, ...shoppingList]);
  };

  const handleClearCheckedShoppingItems = () => {
    const filtered = shoppingList.filter((item) => !item.checked);
    saveShoppingList(filtered);
  };

  const handleClearAllShoppingItems = () => {
    saveShoppingList([]);
  };

  // Swap active recipe from Sidebar History
  const handleSelectHistoryRecipe = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    localStorage.setItem("smart_active_recipe", JSON.stringify(recipe));
    setActiveTab("dashboard");
    setSidebarOpen(false);
  };

  const handleDeleteHistoryRecipe = (recipeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recipeHistory.filter((r) => r.id !== recipeId);
    setRecipeHistory(updated);
    localStorage.setItem("smart_recipe_history", JSON.stringify(updated));

    if (activeRecipe?.id === recipeId) {
      const fallback = updated.length > 0 ? updated[0] : PRESETS[0].fallbackRecipe;
      setActiveRecipe(fallback);
      localStorage.setItem("smart_active_recipe", JSON.stringify(fallback));
    }
  };

  return (
    <div className="min-h-screen pb-32 overflow-x-hidden flex flex-col text-on-surface" id="cooking-app-root">
      {/* Top Application Bar */}
      <header className="fixed top-0 left-0 w-full z-40 bg-surface shadow-sm border-b border-outline-variant/15 px-6 py-4 flex items-center justify-between" id="app-header-bar">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-primary hover:bg-surface-container p-2 rounded-full transition-all active:scale-90 duration-200 cursor-pointer"
            title="Open Recipe History Library"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary shrink-0 animate-bounce" />
            <h1 className="text-lg md:text-xl font-bold text-primary tracking-tight">
              Smart Recipe Constructor
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-full border border-outline-variant/20 select-none">
          <Shield className="w-4 h-4 text-secondary shrink-0" />
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Secure
          </span>
        </div>
      </header>

      {/* Slideout recipes drawer/history sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />

            {/* Sidebar drawer panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-surface-container-lowest shadow-2xl z-50 flex flex-col p-6 overflow-y-auto"
            >
              {/* Header drawer */}
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  <span className="text-base font-bold text-on-surface uppercase tracking-wider">Plan Library</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-surface-container cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              {/* History menu */}
              <div className="flex flex-col gap-6 flex-1">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold text-outline-variant uppercase tracking-widest px-1">
                    Recipe History ({recipeHistory.length})
                  </h3>
                  {recipeHistory.length === 0 ? (
                    <p className="text-xs text-on-surface-variant opacity-75 italic px-2">
                      No constructed plans in library yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {recipeHistory.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectHistoryRecipe(item)}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group ${
                            activeRecipe?.id === item.id
                              ? "bg-primary-container/10 border-l-4 border-primary text-primary"
                              : "hover:bg-surface-container-low text-on-surface"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <BookOpen className="w-4.5 h-4.5 shrink-0 opacity-70" />
                            <span className="text-sm font-semibold truncate group-hover:text-primary">
                              {item.recipeName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteHistoryRecipe(item.id, e)}
                            className="p-1.5 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer transition-all"
                            title="Remove plan"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preset quick shortcuts inside drawer */}
                <div className="flex flex-col gap-2 mt-auto">
                  <div className="border-t border-outline-variant/15 pt-4">
                    <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" /> Direct Demo Load
                    </h3>
                    <p className="text-2xs text-on-surface-variant/80 mb-3">Loadfallback presets offline:</p>
                    <div className="flex flex-col gap-1.5">
                      {PRESETS.map((p) => (
                        <button
                          key={`drawer-${p.name}`}
                          type="button"
                          onClick={() => {
                            setActiveRecipe(p.fallbackRecipe);
                            localStorage.setItem("smart_active_recipe", JSON.stringify(p.fallbackRecipe));
                            const inHistory = recipeHistory.find(rh => rh.recipeName === p.fallbackRecipe.recipeName);
                            if (!inHistory) {
                              const nextH = [p.fallbackRecipe, ...recipeHistory];
                              setRecipeHistory(nextH);
                              localStorage.setItem("smart_recipe_history", JSON.stringify(nextH));
                            }
                            setActiveTab("dashboard");
                            setSidebarOpen(false);
                          }}
                          className="flex items-center justify-between text-left text-xs font-semibold p-2.5 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors"
                        >
                          <span>{p.name}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Stage Area with animation wrap */}
      <main className="flex-grow pt-24 pb-32 px-5">
        <AnimatePresence mode="wait">
          {activeTab === "input" && (
            <motion.div
              key="input-screen"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <InputScreen
                onDeconstruct={handleDeconstruct}
                loading={loading}
                error={error}
              />
            </motion.div>
          )}

          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard-screen"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeRecipe ? (
                <DashboardScreen
                  recipe={activeRecipe}
                  onAddToShoppingList={handleAddToShoppingList}
                />
              ) : (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-4 max-w-sm mx-auto">
                  <ChefHat className="w-12 h-12 text-outline-variant animate-pulse" />
                  <p className="font-semibold text-lg text-on-surface-variant">No Active Cooking Plan</p>
                  <p className="text-sm text-outline">Paste or load preset recipe in the Input menu to construct your sous-chef plan.</p>
                  <button
                    onClick={() => setActiveTab("input")}
                    className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-full text-xs hover:opacity-95 cursor-pointer active:scale-95 transition-all"
                  >
                    Go Parse Recipe
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "shopping-list" && (
            <motion.div
              key="shopping">
              <ShoppingListScreen
                items={shoppingList}
                onToggleItem={handleToggleShoppingItem}
                onAddItem={handleAddCustomShoppingItem}
                onClearChecked={handleClearCheckedShoppingItems}
                onClearAll={handleClearAllShoppingItems}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar at Bottom */}
      <nav className="fixed bottom-0 left-0 w-full z-40 bg-surface-container-lowest border-t border-outline-variant/20 shadow-lg flex justify-around items-center px-4 pt-2.5 pb-6" id="bottom-navbar">
        {/* Tab 1: Input */}
        <button
          onClick={() => setActiveTab("input")}
          className={`flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-full cursor-pointer transition-all ${
            activeTab === "input"
              ? "bg-primary-container text-on-primary-container scale-105"
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <PlusCircle className={`w-5.5 h-5.5 ${activeTab === "input" ? "stroke-[2.5px]" : ""}`} />
          <span className="text-2xs font-bold uppercase tracking-widest">Input</span>
        </button>

        {/* Tab 2: Dashboard */}
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-full cursor-pointer transition-all ${
            activeTab === "dashboard"
              ? "bg-primary-container text-on-primary-container scale-105"
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <LayoutGrid className={`w-5.5 h-5.5 ${activeTab === "dashboard" ? "stroke-[2.5px]" : ""}`} />
          <span className="text-2xs font-bold uppercase tracking-widest">Dashboard</span>
        </button>

        {/* Tab 3: Shopping List */}
        <button
          onClick={() => setActiveTab("shopping-list")}
          className={`flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-full cursor-pointer transition-all ${
            activeTab === "shopping-list"
              ? "bg-primary-container text-on-primary-container scale-105"
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <ShoppingBag className={`w-5.5 h-5.5 ${activeTab === "shopping-list" ? "stroke-[2.5px]" : ""}`} />
          <span className="text-2xs font-bold uppercase tracking-widest">Shopping</span>
        </button>
      </nav>
    </div>
  );
}
