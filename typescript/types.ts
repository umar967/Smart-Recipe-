export interface Ingredient {
  name: string;
  amountText: string;
  numericValue: number | null;
  unit: string;
  category: "Produce" | "Pantry" | "Dairy" | "Meat" | "Bakery" | "Other";
  checked?: boolean; // client-side checked state
}

export interface CookingStep {
  stepNumber: number;
  title: string;
  description: string;
  timerDuration: number | null; // seconds
}

export interface Recipe {
  id: string;
  recipeName: string;
  yieldText: string;
  ingredients: Ingredient[];
  steps: CookingStep[];
  imageUrl?: string;
  createdAt?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amountText: string;
  category: "Produce" | "Pantry" | "Dairy" | "Meat" | "Bakery" | "Other";
  checked: boolean;
  recipeName: string; // origin recipe
}
