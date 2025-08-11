export interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  id: string
  userId: string
  dietaryRestrictions: string[]
  allergies: string[]
  cuisinePreferences: string[]
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced'
  householdSize: number
  budgetRange: 'low' | 'medium' | 'high'
  mealPrepTime: 'quick' | 'moderate' | 'elaborate'
  healthGoals: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Recipe {
  id: string
  name: string
  description: string
  ingredients: string[]
  instructions: string[]
  prepTime: number
  cookTime: number
  servings: number
  caloriesPerServing: number | null
  dietTags: string[]
  cuisineType: string
  difficultyLevel: 'easy' | 'medium' | 'hard'
  cost: number | null
  nutritionInfo: Record<string, any> | null
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
  userId: string
  isFavorited?: boolean
}

export interface MealPlan {
  id: string
  name: string
  startDate: Date
  endDate: Date
  status: 'active' | 'completed' | 'archived'
  totalCost: number | null
  totalCalories: number | null
  aiPrompt?: string
  createdAt: Date
  updatedAt: Date
  userId: string
  items: MealPlanItem[]
  shoppingLists: ShoppingList[]
  _count?: {
    items: number
    shoppingLists: number
  }
}

export interface MealPlanItem {
  id: string
  mealPlanId: string
  recipeId: string
  mealDate: Date
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  servings: number
  notes?: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
  recipe: Recipe
}

export interface ShoppingList {
  id: string
  mealPlanId: string
  items: Array<{
    name: string
    amount: string
    category: string
    estimatedCost: number
    purchased: boolean
  }>
  estimatedCost: number
  actualCost?: number
  status: 'pending' | 'shopping' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
  mealPlan: {
    id: string
    name: string
    startDate: Date
    endDate: Date
  }
}

export interface UserFavorite {
  id: string
  userId: string
  recipeId: string
  createdAt: Date
  recipe: Recipe
}

export interface EmailSubscription {
  id: string
  email: string
  preferences: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface NutritionAnalysis {
  dailyTotals: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
  }
  mealBreakdown: Array<{
    mealType: string
    mealDate: string
    nutrition: {
      calories: number
      protein: number
      carbs: number
      fat: number
    }
  }>
  recommendations: string[]
  healthScore: number
}

export interface ShoppingListOptimization {
  optimizedList: string[]
  totalEstimatedCost: number
  storeRecommendations: string[]
  mealPrepTips: string[]
}

export interface SearchFilters {
  dietTags?: string[]
  cuisineType?: string
  difficultyLevel?: string
  maxCookingTime?: number
  maxCalories?: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: PaginationInfo
}

export interface MealPlanGenerationRequest {
  preferences?: string[]
  dietaryRestrictions?: string[]
  budget?: number
  householdSize?: number
  startDate: string
  endDate: string
  mealTypes?: string[]
}

export interface RecipeRecommendationRequest {
  preferences?: string[]
  dietaryRestrictions?: string[]
  cuisineType?: string
  maxCookingTime?: number
  maxCalories?: number
  excludeIngredients?: string[]
  includeIngredients?: string[]
}
