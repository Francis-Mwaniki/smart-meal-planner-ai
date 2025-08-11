export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, preferences, startDate } = body

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Get user preferences
    let userPreferences = preferences
    if (!userPreferences) {
      const dbPreferences = await prisma.userPreferences.findUnique({
        where: { userId }
      })
      
      if (!dbPreferences) {
        console.log("No user preferences found, returning error")
        return NextResponse.json(
          { error: "User preferences not found. Please set your preferences first." },
          { status: 400 }
        )
      } else {
        userPreferences = dbPreferences
      }
    }

    // Try to import OpenRouter, but handle missing API key gracefully
    let openRouter: any = null
    try {
      const { openRouter: openRouterClient } = await import("@/lib/openrouter")
      openRouter = openRouterClient
    } catch (error) {
      console.warn("OpenRouter client not available:", error)
    }

    // Generate meal plan using OpenRouter
    let mealPlanData
    if (openRouter) {
      try {
        mealPlanData = await openRouter.generateMealPlan({
          dietType: userPreferences.dietType,
          allergies: userPreferences.allergies,
          budgetWeekly: userPreferences.budgetWeekly,
          peopleCount: userPreferences.peopleCount,
          maxCookingTime: userPreferences.maxCookingTime,
          cuisineTypes: userPreferences.cuisineTypes,
          healthGoals: userPreferences.healthGoals,
          startDate: startDate || new Date().toISOString().split('T')[0]
        })
      } catch (error) {
        console.error("OpenRouter API failed, using fallback meal plan:", error)
        mealPlanData = generateFallbackMealPlan(userPreferences, startDate)
      }
    } else {
      console.log("OpenRouter not available, using fallback meal plan")
      mealPlanData = generateFallbackMealPlan(userPreferences, startDate)
    }

    // Validate the meal plan data structure
    if (!mealPlanData || !mealPlanData.mealPlan || !Array.isArray(mealPlanData.mealPlan) || mealPlanData.mealPlan.length === 0) {
      // Try to find alternative structures
      console.warn("Expected mealPlan structure not found, checking alternatives...")
      
      // Check if the response has a different structure
      if (mealPlanData && typeof mealPlanData === 'object') {
        console.log("Available keys in response:", Object.keys(mealPlanData))
        
        // If the AI returned a different structure, try to adapt it
        if (mealPlanData.days && Array.isArray(mealPlanData.days)) {
          mealPlanData.mealPlan = mealPlanData.days
        } else if (mealPlanData.plan && Array.isArray(mealPlanData.plan)) {
          mealPlanData.mealPlan = mealPlanData.plan
        } else if (mealPlanData.meals && Array.isArray(mealPlanData.meals)) {
          mealPlanData.mealPlan = mealPlanData.meals
        }
      }
      
      // Check again after adaptation
      if (!mealPlanData.mealPlan || !Array.isArray(mealPlanData.mealPlan) || mealPlanData.mealPlan.length === 0) {
        console.error("Invalid meal plan data structure after adaptation:", mealPlanData)
        return NextResponse.json(
          { error: "Failed to generate valid meal plan structure. Please try again." },
          { status: 500 }
        )
      }
    }

    // Log the structure for debugging
    console.log("Generated meal plan structure:", {
      hasMealPlan: !!mealPlanData.mealPlan,
      mealPlanLength: mealPlanData.mealPlan?.length,
      firstDay: mealPlanData.mealPlan?.[0],
      lastDay: mealPlanData.mealPlan?.[mealPlanData.mealPlan.length - 1]
    })

    // Ensure we have at least 1 day of meal plans (be more flexible)
    if (mealPlanData.mealPlan.length < 1) {
      console.error("Insufficient meal plan days:", mealPlanData.mealPlan.length)
      return NextResponse.json(
        { error: "Generated meal plan is incomplete. Please try again." },
        { status: 500 }
      )
    }

    // Validate that each day has a date property
    const firstDay = mealPlanData.mealPlan[0]
    const lastDay = mealPlanData.mealPlan[mealPlanData.mealPlan.length - 1] // Use actual last day instead of hardcoded index
    
    if (!firstDay?.date || !lastDay?.date) {
      console.error("Missing date properties in meal plan:", { firstDay, lastDay })
      return NextResponse.json(
        { error: "Generated meal plan is missing date information. Please try again." },
        { status: 500 }
      )
    }

    // Validate date format and create Date objects
let parsedStartDate: Date, parsedEndDate: Date
try {
  parsedStartDate = new Date(firstDay.date)
  parsedEndDate = new Date(lastDay.date)
      
      // Check if dates are valid
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new Error("Invalid date format")
      }
    } catch (dateError) {
      console.error("Invalid date format in meal plan:", { 
        firstDayDate: firstDay.date, 
        lastDayDate: lastDay.date,
        error: dateError 
      })
      return NextResponse.json(
        { error: "Generated meal plan contains invalid date format. Please try again." },
        { status: 500 }
      )
    }

    // Create meal plan in database
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId,
        name: `Meal Plan - ${new Date().toLocaleDateString()}`,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        totalCost: mealPlanData.totalCost || 0,
        totalCalories: mealPlanData.totalCalories || 0,
        aiPrompt: JSON.stringify(userPreferences),
        status: "active"
      }
    })

    // Create recipes and meal plan items
    const createdRecipes: any[] = []
    const mealPlanItems: any[] = []

    for (const day of mealPlanData.mealPlan) {
      // Validate day structure
      if (!day.date || !day.meals || typeof day.meals !== 'object') {
        console.warn(`Skipping invalid day structure:`, day)
        continue
      }
      
      // Validate date format
      let dayDate: Date
      try {
        dayDate = new Date(day.date)
        if (isNaN(dayDate.getTime())) {
          console.warn(`Skipping day with invalid date:`, day.date)
          continue
        }
      } catch (dateError) {
        console.warn(`Skipping day with date parsing error:`, day.date, dateError)
        continue
      }
      
      for (const [mealType, meal] of Object.entries(day.meals)) {
        if (meal && typeof meal === 'object' && 'name' in meal) {
          // Create or find recipe
          let recipe = await prisma.recipe.findFirst({
            where: { name: meal.name }
          })

          if (!recipe) {
            recipe = await prisma.recipe.create({
              data: {
                name: meal.name,
                description: meal.description || "",
                ingredients: meal.ingredients || {},
                instructions: meal.instructions || [],
                prepTime: meal.prepTime || 0,
                cookTime: meal.cookTime || 0,
                servings: 1,
                caloriesPerServing: meal.calories || 0,
                dietTags: meal.dietTags || [],
                cuisineType: meal.cuisineType || "general",
                difficultyLevel: meal.difficulty || "easy",
                cost: meal.cost || 0,
                nutritionInfo: meal.nutrition || {}
              }
            })
            createdRecipes.push(recipe)
          }

          // Create meal plan item
          const mealPlanItem = await prisma.mealPlanItem.create({
            data: {
              mealPlanId: mealPlan.id,
              recipeId: recipe.id,
              mealDate: dayDate,
              mealType: mealType,
              servings: userPreferences.peopleCount,
              notes: `AI Generated - ${day.day || 'Unknown'} ${mealType}`
            }
          })
          mealPlanItems.push(mealPlanItem)
        }
      }
    }

    // Create shopping list with validation
    let shoppingListItems = []
    
    // Handle different shopping list formats from AI response
    if (mealPlanData.shoppingList) {
      if (Array.isArray(mealPlanData.shoppingList)) {
        // If it's an array, use it directly
        shoppingListItems = mealPlanData.shoppingList
      } else if (typeof mealPlanData.shoppingList === 'object') {
        // If it's an object with categories, flatten it into an array
        shoppingListItems = Object.entries(mealPlanData.shoppingList).flatMap(([category, items]) => {
          if (typeof items === 'object' && items !== null) {
            return Object.entries(items).map(([item, amount]) => ({
              name: item,
              amount: amount,
              category: category,
              estimatedCost: 0, // Will be calculated
              purchased: false
            }))
          }
          return []
        })
      }
    }
    
    // If no shopping list from AI, create one from the meal plan ingredients
    if (shoppingListItems.length === 0) {
      const ingredientMap = new Map()
      
      for (const day of mealPlanData.mealPlan) {
        if (day.meals) {
          for (const [mealType, meal] of Object.entries(day.meals)) {
            if (meal && typeof meal === 'object' && meal.ingredients) {
              for (const [ingredient, amount] of Object.entries(meal.ingredients)) {
                const key = ingredient.toLowerCase()
                if (ingredientMap.has(key)) {
                  ingredientMap.set(key, {
                    name: ingredient,
                    amount: `${ingredientMap.get(key).amount} + ${amount}`,
                    category: 'general',
                    estimatedCost: 0,
                    purchased: false
                  })
                } else {
                  ingredientMap.set(key, {
                    name: ingredient,
                    amount: amount,
                    category: 'general',
                    estimatedCost: 0,
                    purchased: false
                  })
                }
              }
            }
          }
        }
      }
      
      shoppingListItems = Array.from(ingredientMap.values())
    }
    
    const shoppingList = await prisma.shoppingList.create({
      data: {
        mealPlanId: mealPlan.id,
        items: shoppingListItems,
        estimatedCost: mealPlanData.totalCost || 0,
        status: "pending"
      }
    })

    return NextResponse.json({
      success: true,
      mealPlan: {
        ...mealPlan,
        items: mealPlanItems,
        shoppingList
      },
      generatedRecipes: createdRecipes.length,
      totalMeals: mealPlanItems.length,
      message: "Meal plan generated successfully!"
    })

  } catch (error) {
    console.error("Error generating meal plan:", error)
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes("OpenRouter API key is required")) {
        return NextResponse.json(
          { error: "OpenRouter API key is not configured. Please contact the administrator." },
          { status: 500 }
        )
      }
      
      if (error.message.includes("OpenRouter")) {
        return NextResponse.json(
          { error: "Failed to generate meal plan. Please try again." },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    )
  }
}

// Fallback meal plan generator for when OpenRouter is not available
function generateFallbackMealPlan(userPreferences: any, startDate?: string) {
  const today = new Date()
  const fallbackDate = startDate || today.toISOString().split('T')[0]
  
  // Generate 3 days of fallback meals
  const days = ["Day 1", "Day 2", "Day 3"]
  const mealPlan = days.map((day, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)
    const dayDate = date.toISOString().split('T')[0]
    
    return {
      day: day,
      date: dayDate,
      meals: {
        breakfast: {
          name: index % 2 === 0 ? "Oatmeal with Berries" : "Greek Yogurt Parfait",
          description: index % 2 === 0 ? "Healthy breakfast with oats, berries, and honey" : "Creamy yogurt with granola and fresh fruit",
          ingredients: index % 2 === 0 
            ? { "oats": "1 cup", "berries": "1/2 cup", "honey": "1 tbsp" }
            : { "greek yogurt": "1 cup", "granola": "1/2 cup", "berries": "1/2 cup" },
          instructions: index % 2 === 0 
            ? ["Cook oats", "Add berries", "Drizzle with honey"]
            : ["Layer yogurt", "Add granola", "Top with berries"],
          prepTime: 5,
          cookTime: index % 2 === 0 ? 10 : 0,
          calories: index % 2 === 0 ? 300 : 280,
          cost: index % 2 === 0 ? 2.50 : 3.00,
          difficulty: "easy",
          dietTags: ["vegetarian", "healthy"],
          nutrition: index % 2 === 0 
            ? { protein: 10, carbs: 55, fat: 5, fiber: 8 }
            : { protein: 18, carbs: 45, fat: 8, fiber: 6 }
        },
        lunch: {
          name: index % 3 === 0 ? "Grilled Chicken Salad" : index % 3 === 1 ? "Quinoa Bowl" : "Turkey Wrap",
          description: index % 3 === 0 ? "Fresh salad with grilled chicken breast" : index % 3 === 1 ? "Nutritious quinoa with vegetables" : "Lean turkey in whole grain wrap",
          ingredients: index % 3 === 0 
            ? { "chicken breast": "4 oz", "lettuce": "2 cups", "tomatoes": "1/2 cup" }
            : index % 3 === 1
            ? { "quinoa": "1/2 cup", "vegetables": "1 cup", "olive oil": "1 tbsp" }
            : { "turkey": "3 oz", "whole grain wrap": "1", "vegetables": "1/2 cup" },
          instructions: index % 3 === 0 
            ? ["Grill chicken", "Chop vegetables", "Combine and serve"]
            : index % 3 === 1
            ? ["Cook quinoa", "Steam vegetables", "Combine with olive oil"]
            : ["Warm wrap", "Add turkey and vegetables", "Roll and serve"],
          prepTime: 10,
          cookTime: index % 3 === 0 ? 15 : index % 3 === 1 ? 20 : 5,
          calories: index % 3 === 0 ? 400 : index % 3 === 1 ? 350 : 380,
          cost: index % 3 === 0 ? 6.00 : index % 3 === 1 ? 4.50 : 5.50,
          difficulty: "easy",
          dietTags: index % 3 === 0 ? ["high-protein", "low-carb"] : index % 3 === 1 ? ["vegetarian", "gluten-free"] : ["balanced", "portable"],
          nutrition: index % 3 === 0 
            ? { protein: 35, carbs: 15, fat: 20, fiber: 5 }
            : index % 3 === 1
            ? { protein: 12, carbs: 60, fat: 15, fiber: 8 }
            : { protein: 25, carbs: 45, fat: 12, fiber: 6 }
        },
        dinner: {
          name: index % 4 === 0 ? "Salmon with Vegetables" : index % 4 === 1 ? "Pasta Primavera" : index % 4 === 2 ? "Beef Stir Fry" : "Vegetarian Curry",
          description: index % 4 === 0 ? "Baked salmon with roasted vegetables" : index % 4 === 1 ? "Fresh pasta with seasonal vegetables" : index % 4 === 2 ? "Lean beef with colorful vegetables" : "Spiced vegetables with rice",
          ingredients: index % 4 === 0 
            ? { "salmon": "6 oz", "broccoli": "1 cup", "carrots": "1 cup" }
            : index % 4 === 1
            ? { "pasta": "2 oz", "vegetables": "1.5 cups", "olive oil": "1 tbsp" }
            : index % 4 === 2
            ? { "beef": "4 oz", "vegetables": "1.5 cups", "soy sauce": "1 tbsp" }
            : { "vegetables": "2 cups", "rice": "1/2 cup", "coconut milk": "1/4 cup" },
          instructions: index % 4 === 0 
            ? ["Season salmon", "Roast vegetables", "Bake salmon"]
            : index % 4 === 1
            ? ["Cook pasta", "Sauté vegetables", "Combine with olive oil"]
            : index % 4 === 2
            ? ["Stir fry beef", "Add vegetables", "Season with soy sauce"]
            : ["Cook rice", "Sauté vegetables", "Add coconut milk and spices"],
          prepTime: 15,
          cookTime: index % 4 === 0 ? 20 : index % 4 === 1 ? 15 : index % 4 === 2 ? 12 : 25,
          calories: index % 4 === 0 ? 450 : index % 4 === 1 ? 380 : index % 4 === 2 ? 420 : 320,
          cost: index % 4 === 0 ? 8.50 : index % 4 === 1 ? 5.00 : index % 4 === 2 ? 7.00 : 4.50,
          difficulty: index % 4 === 0 ? "medium" : "easy",
          dietTags: index % 4 === 0 ? ["omega-3", "healthy"] : index % 4 === 1 ? ["vegetarian"] : index % 4 === 2 ? ["high-protein"] : ["vegetarian", "vegan"],
          nutrition: index % 4 === 0 
            ? { protein: 40, carbs: 20, fat: 25, fiber: 8 }
            : index % 4 === 1
            ? { protein: 12, carbs: 65, fat: 15, fiber: 8 }
            : index % 4 === 2
            ? { protein: 35, carbs: 25, fat: 18, fiber: 6 }
            : { protein: 8, carbs: 55, fat: 12, fiber: 10 }
        }
      }
    }
  })
  
  return {
    mealPlan,
    shoppingList: [
      { name: "berries", amount: "2 cups", category: "produce", estimatedCost: 4.00, purchased: false },
      { name: "lettuce", amount: "4 cups", category: "produce", estimatedCost: 3.00, purchased: false },
      { name: "tomatoes", amount: "2 cups", category: "produce", estimatedCost: 3.00, purchased: false },
      { name: "broccoli", amount: "3 cups", category: "produce", estimatedCost: 4.50, purchased: false },
      { name: "carrots", amount: "3 cups", category: "produce", estimatedCost: 2.00, purchased: false },
      { name: "vegetables", amount: "4 cups", category: "produce", estimatedCost: 5.00, purchased: false },
      { name: "chicken breast", amount: "12 oz", category: "proteins", estimatedCost: 6.00, purchased: false },
      { name: "salmon", amount: "6 oz", category: "proteins", estimatedCost: 8.00, purchased: false },
      { name: "beef", amount: "8 oz", category: "proteins", estimatedCost: 7.00, purchased: false },
      { name: "turkey", amount: "6 oz", category: "proteins", estimatedCost: 5.00, purchased: false },
      { name: "oats", amount: "3 cups", category: "pantry", estimatedCost: 2.00, purchased: false },
      { name: "honey", amount: "2 tbsp", category: "pantry", estimatedCost: 1.00, purchased: false },
      { name: "quinoa", amount: "2 cups", category: "pantry", estimatedCost: 3.00, purchased: false },
      { name: "pasta", amount: "4 oz", category: "pantry", estimatedCost: 1.50, purchased: false },
      { name: "rice", amount: "1 cup", category: "pantry", estimatedCost: 1.00, purchased: false },
      { name: "olive oil", amount: "3 tbsp", category: "pantry", estimatedCost: 2.00, purchased: false },
      { name: "soy sauce", amount: "2 tbsp", category: "pantry", estimatedCost: 1.00, purchased: false },
      { name: "coconut milk", amount: "1/2 cup", category: "pantry", estimatedCost: 2.00, purchased: false },
      { name: "greek yogurt", amount: "3 cups", category: "dairy", estimatedCost: 6.00, purchased: false },
      { name: "granola", amount: "2 cups", category: "dairy", estimatedCost: 4.00, purchased: false }
    ],
    totalCost: 65.00,
    totalCalories: 8050,
    nutritionalSummary: {
      avgProtein: 32,
      avgCarbs: 45,
      avgFat: 20,
      avgFiber: 8
    },
    tips: [
      "Buy ingredients in bulk to save money",
      "Prepare meals in advance for busy days",
      "Use seasonal vegetables for better prices",
      "Cook grains in batches for the week"
    ],
    prepAdvice: "Cook grains and proteins in advance, store in containers for easy meal assembly. Chop vegetables ahead of time and store in airtight containers."
  }
}
