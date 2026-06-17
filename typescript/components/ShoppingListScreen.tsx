import React, { useState } from "react";
import { Check, Leaf, Container, Milk, Flame, Cookie, HelpCircle, Plus, Trash2, Trash } from "lucide-react";
import { ShoppingItem, Ingredient } from "../types";

interface ShoppingListScreenProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (name: string, amount: string, category: "Produce" | "Pantry" | "Dairy" | "Meat" | "Bakery" | "Other") => void;
  onClearChecked: () => void;
  onClearAll: () => void;
}

export default function ShoppingListScreen({
  items,
  onToggleItem,
  onAddItem,
  onClearChecked,
  onClearAll,
}: ShoppingListScreenProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<"Produce" | "Pantry" | "Dairy" | "Meat" | "Bakery" | "Other">("Produce");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(
      newItemName.trim(),
      newItemAmount.trim() || "Any quantity",
      newItemCategory
    );
    setNewItemName("");
    setNewItemAmount("");
  };

  // Group items by category
  const categories: Array<{
    key: "Produce" | "Pantry" | "Dairy" | "Meat" | "Bakery" | "Other";
    name: string;
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
  }> = [
    { key: "Produce", name: "Produce", icon: <Leaf className="w-5 h-5 text-secondary" />, colorClass: "text-secondary", bgClass: "bg-secondary-container/20" },
    { key: "Pantry", name: "Pantry", icon: <Container className="w-5 h-5 text-primary" />, colorClass: "text-primary", bgClass: "bg-primary-fixed" },
    { key: "Dairy", name: "Dairy", icon: <Milk className="w-5 h-5 text-tertiary" />, colorClass: "text-tertiary", bgClass: "bg-tertiary-fixed" },
    { key: "Meat", name: "Meat", icon: <Flame className="w-5 h-5 text-red-700" />, colorClass: "text-red-750", bgClass: "bg-red-50" },
    { key: "Bakery", name: "Bakery", icon: <Cookie className="w-5 h-5 text-amber-700" />, colorClass: "text-amber-805", bgClass: "bg-amber-50" },
    { key: "Other", name: "Other", icon: <HelpCircle className="w-5 h-5 text-slate-600" />, colorClass: "text-slate-600", bgClass: "bg-slate-100" },
  ];

  const groupedItems = categories.map((cat) => {
    const catItems = items.filter((item) => item.category === cat.key);
    return { ...cat, items: catItems };
  }).filter((group) => group.items.length > 0);

  // Generate dynamic chef tips
  const getChefTip = () => {
    if (items.some((i) => i.name.toLowerCase().includes("tomato"))) {
      return "Always choose seasonal heirloom tomatoes for premium flavor and robust juiciness.";
    }
    if (items.some((i) => i.name.toLowerCase().includes("flour") || i.name.toLowerCase().includes("dough"))) {
      return "For natural sourdough starters, filtered non-chlorinated water keeps the wild yeast highly active.";
    }
    if (items.some((i) => i.name.toLowerCase().includes("steak") || i.name.toLowerCase().includes("meat"))) {
      return "Let your steaks rest completely dry at room temperature before introducing to a roaring hot iron skillet.";
    }
    return "Consolidate flour and grains into dry, airtight glass jars to preserve ultimate milling freshness.";
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto" id="shopping-list-screen-container">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4" id="shopping-header">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">Shopping List</h2>
          <p className="text-base text-on-surface-variant mt-1">
            {items.length === 0
              ? "Your deconstructed grocery shopping bag is currently empty."
              : `Aggregated ingredients deconstructed from recipes.`}
          </p>
        </div>
        {items.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={onClearChecked}
              className="px-4 py-2 text-xs font-bold border border-outline rounded-full text-on-surface hover:bg-surface-container-high transition-all active:scale-95 cursor-pointer"
            >
              Clear Checked
            </button>
            <button
              onClick={onClearAll}
              className="px-4 py-2 text-xs font-bold border border-red-200 text-red-650 bg-red-50 hover:bg-red-100/50 rounded-full transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <Trash className="w-3.5 h-3.5" /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* Categories Grid (Bento style) */}
      <div className="flex flex-col gap-6" id="categories-bento-area">
        {groupedItems.map((group) => (
          <section
            key={group.key}
            className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/10 flex flex-col gap-6"
          >
            {/* Category Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${group.bgClass} flex items-center justify-center shadow-inner`}>
                  {group.icon}
                </div>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${group.colorClass}`}>
                  {group.name}
                </h3>
              </div>
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                {group.items.length} {group.items.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            {/* Category Items list */}
            <ul className="flex flex-col gap-4">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => onToggleItem(item.id)}
                  className="flex items-center justify-between p-1 cursor-pointer select-none group/item"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 border-outline-variant/40 flex items-center justify-center transition-all ${
                        item.checked ? "bg-secondary border-secondary text-white" : "bg-transparent text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-base font-medium text-on-surface ${item.checked ? "line-through opacity-55" : ""}`}>
                        {item.name}
                      </span>
                      {item.recipeName && (
                        <span className="text-2xs text-outline font-semibold uppercase tracking-wider">
                          From: {item.recipeName}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${item.checked ? "opacity-30 line-through" : "text-outline"}`}>
                    {item.amountText}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {items.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center text-on-surface-variant font-medium bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/40">
            <span className="text-3xl mb-2">🍽️</span>
            <p>No active shopping list items.</p>
            <p className="text-xs text-outline mt-1 font-normal">Go back to your dashboard to push parsed recipe ingredients inside.</p>
          </div>
        )}
      </div>

      {/* Form to manual add custom purchases */}
      <section className="bg-surface-container rounded-3xl p-6 custom-shadow flex flex-col gap-4" id="custom-item-card">
        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Add Custom Grocery Item</h3>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 flex flex-col gap-1.5 w-full">
            <label className="text-2xs font-semibold text-outline uppercase tracking-wider">Item Name</label>
            <input
              type="text"
              required
              placeholder="E.g., Salted Butter, Rosemary"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full"
            />
          </div>

          <div className="w-full md:w-32 flex flex-col gap-1.5">
            <label className="text-2xs font-semibold text-outline uppercase tracking-wider">Amount</label>
            <input
              type="text"
              placeholder="E.g., 250g, 1 bunch"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full"
            />
          </div>

          <div className="w-full md:w-40 flex flex-col gap-1.5">
            <label className="text-2xs font-semibold text-outline uppercase tracking-wider">Category</label>
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as any)}
              className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full"
            >
              <option value="Produce">Produce</option>
              <option value="Pantry">Pantry</option>
              <option value="Dairy">Dairy</option>
              <option value="Meat">Meat</option>
              <option value="Bakery">Bakery</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-primary text-on-primary font-bold px-6 py-3.5 rounded-xl cursor-pointer hover:opacity-95 transition-all text-sm flex items-center justify-center gap-1.5 w-full md:w-auto"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      </section>

      {/* Dynamic Visual Break / Farmer market produce Tip */}
      <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-md group" id="shopping-market-banner">
        <img
          alt="Farmer market produce"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102 select-none"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4_VpBBj8QJuywWk2NU2VEmMzzKQ7n1wKIxkjiI1FhCh1B9AM8QxcBGl36nWs-jWKtjiQdCGQQ_hOZWSbyDZmErEV-aFzpdYKHVxM6go0VyNnyGRZ3Am-MLlDWwEzI3Mj4G_5_r7sLdBm5DVrHh2tZNv3hunaixazhxYIVeqH1-ZqFZnXIlAPSBVh5pONmw6LlHWCI70ESdvmXPUJJk1JnfEt7I1OM34QYNA63DSFTRyr_NBFtsJkgKf5-VUq8PuAPjaDpNB5UATY"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-black/30 to-transparent flex flex-col justify-end p-6 select-none">
          <p className="text-primary-container text-xs font-bold uppercase tracking-widest mb-1">
            Chef's Tip
          </p>
          <p className="text-white text-sm font-medium leading-relaxed">
            {getChefTip()}
          </p>
        </div>
      </div>
    </div>
  );
}
