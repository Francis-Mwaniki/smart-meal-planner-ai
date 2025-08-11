export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { openRouter } from "@/lib/openrouter"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      mealType, 
      preferences, 
      maxResults = 5,
      difficultyLevel,
      maxCalories,
      availableIngredients 
    } = body

    if (!mealType) {
      return NextResponse.json({ error: "Meal type is required" }, { status: 400 })
    }

    // Get user preferences if not provided
    let userPreferences = preferences
    if (!userPreferences) {
      const dbPreferences = await prisma.userPreferences.findUnique({
        where: { userId: session.user.id }
      })
      
      if (!dbPreferences) {
        return NextResponse.json(
          { error: "User preferences not found. Please set your preferences first." },
          { status: 400 }
        )
      }
      
      userPreferences = dbPreferences
    }

    // Generate recipe recommendations using OpenRouter
    let recipeData
    if (openRouter) {
      try {
        recipeData = await openRouter.generateRecipeRecommendations({
          dietType: userPreferences.dietType,
          allergies: userPreferences.allergies,
          cuisineTypes: userPreferences.cuisineTypes,
          maxCookingTime: userPreferences.maxCookingTime,
          mealType,
          difficultyLevel: difficultyLevel || "easy",
          maxCalories,
          ingredients: availableIngredients
        })
      } catch (error) {
        console.error("OpenRouter recipe recommendations failed, using fallback recipes:", error)
        recipeData = generateFallbackRecipes()
      }
    } else {
      console.log("OpenRouter not available, using fallback recipes")
      recipeData = generateFallbackRecipes()
    }

    // Limit results if specified
    const limitedRecipes = maxResults ? recipeData.slice(0, maxResults) : recipeData

    // Check which recipes already exist in database
    const existingRecipes = await prisma.recipe.findMany({
      where: {
        name: {
          in: limitedRecipes.map((r: any) => r.name)
        }
      }
    })

    const existingNames = existingRecipes.map(r => r.name)

    // Create new recipes that don't exist
    const newRecipes = []
    for (const recipe of limitedRecipes) {
      if (!existingNames.includes(recipe.name)) {
        try {
          const newRecipe = await prisma.recipe.create({
            data: {
              name: recipe.name,
              description: recipe.description || "",
              ingredients: recipe.ingredients || {},
              instructions: recipe.instructions || [],
              prepTime: recipe.prepTime || 0,
              cookTime: recipe.cookTime || 0,
              servings: recipe.servings || 4,
              caloriesPerServing: recipe.caloriesPerServing || 0,
              dietTags: recipe.dietTags || [],
              cuisineType: recipe.cuisineType || "general",
              difficultyLevel: recipe.difficulty || "easy",
              cost: recipe.cost || 0,
              nutritionInfo: recipe.nutrition || {}
            }
          })
          newRecipes.push(newRecipe)
        } catch (error) {
          console.error(`Error creating recipe ${recipe.name}:`, error)
        }
      }
    }

    // Combine existing and new recipes
    const allRecipes = [...existingRecipes, ...newRecipes]

    // Add user-specific data
    const recipesWithUserData = await Promise.all(
      allRecipes.map(async (recipe) => {
        // Check if user has favorited this recipe
        const isFavorited = await prisma.userFavorite.findUnique({
          where: {
            userId_recipeId: {
              userId: session.user.id,
              recipeId: recipe.id
            }
          }
        })

        // Get recipe rating (placeholder for future implementation)
        const rating = 0
        const ratingCount = 0

        return {
          ...recipe,
          isFavorited: !!isFavorited,
          rating,
          ratingCount,
          canMake: this.checkRecipeAvailability(recipe, availableIngredients || [])
        }
      })
    )

    return NextResponse.json({
      success: true,
      recipes: recipesWithUserData,
      total: recipesWithUserData.length,
      newRecipesCreated: newRecipes.length,
      message: "Recipe recommendations generated successfully!"
    })

  } catch (error) {
    console.error("Error generating recipe recommendations:", error)
    
    if (error instanceof Error && error.message.includes("OpenRouter")) {
      return NextResponse.json(
        { error: "Failed to generate recipe recommendations. Please try again." },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to generate recipe recommendations" },
      { status: 500 }
    )
  }
}

// Helper function to check if user can make a recipe with available ingredients
function checkRecipeAvailability(recipe: any, availableIngredients: string[]): boolean {
  if (!availableIngredients || availableIngredients.length === 0) return true
  
  const recipeIngredients = Object.keys(recipe.ingredients || {})
  const availableLower = availableIngredients.map(i => i.toLowerCase())
  
  // Check if at least 70% of ingredients are available
  const availableCount = recipeIngredients.filter(ingredient => 
    availableLower.some(available => 
      available.includes(ingredient.toLowerCase()) || 
      ingredient.toLowerCase().includes(available)
    )
  ).length
  
  return (availableCount / recipeIngredients.length) >= 0.7
}

// Fallback recipe generator for when OpenRouter is not available
function generateFallbackRecipes() {
  return [
    {
      name: "Simple Pasta",
      description: "Basic pasta with olive oil and herbs",
      ingredients: { "pasta": "8 oz", "olive oil": "2 tbsp", "herbs": "1 tsp" },
      instructions: ["Boil pasta", "Drain and toss with oil and herbs"],
      prepTime: 5,
      cookTime: 15,
      servings: 4,
      caloriesPerServing: 300,
      difficulty: "easy",
      dietTags: ["vegetarian"],
      cuisineType: "italian",
      cost: 3.00,
      nutrition: { protein: 10, carbs: 55, fat: 8, fiber: 3 }
    },
    {
      name: "Grilled Cheese",
      description: "Classic grilled cheese sandwich",
      ingredients: { "bread": "2 slices", "cheese": "2 oz", "butter": "1 tbsp" },
      instructions: ["Butter bread", "Add cheese", "Grill until golden"],
      prepTime: 3,
      cookTime: 8,
      servings: 1,
      caloriesPerServing: 350,
      difficulty: "easy",
      dietTags: ["vegetarian"],
      cuisineType: "american",
      cost: 2.50,
      nutrition: { protein: 15, carbs: 30, fat: 20, fiber: 8 }
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mealType = searchParams.get('mealType')
    const cuisineType = searchParams.get('cuisineType')
    const difficultyLevel = searchParams.get('difficultyLevel')
    const dietTags = searchParams.get('dietTags')?.split(',')
    const maxCookingTime = searchParams.get('maxCookingTime')
    const maxCalories = searchParams.get('maxCalories')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build filter conditions
    const where: any = {}
    
    if (mealType) where.mealType = mealType
    if (cuisineType) where.cuisineType = cuisineType
    if (difficultyLevel) where.difficultyLevel = difficultyLevel
    if (dietTags && dietTags.length > 0) {
      where.dietTags = {
        hasSome: dietTags
      }
    }
    if (maxCookingTime) {
      where.totalTime = {
        lte: parseInt(maxCookingTime)
      }
    }
    if (maxCalories) {
      where.caloriesPerServing = {
        lte: parseInt(maxCalories)
      }
    }

    // Get recipes with pagination
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.recipe.count({ where })
    ])

    // Add user-specific data
    const recipesWithUserData = await Promise.all(
      recipes.map(async (recipe) => {
        const isFavorited = await prisma.userFavorite.findUnique({
          where: {
            userId_recipeId: {
              userId: session.user.id,
              recipeId: recipe.id
            }
          }
        })

        return {
          ...recipe,
          isFavorited: !!isFavorited
        }
      })
    )

    return NextResponse.json({
      success: true,
      recipes: recipesWithUserData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching recipes:", error)
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    )
  }
}
