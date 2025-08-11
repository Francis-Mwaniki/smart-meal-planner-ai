export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/recipes - Fetch all recipes with filtering and pagination
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
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build filter conditions
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (cuisineType) where.cuisineType = cuisineType
    if (difficultyLevel) where.difficultyLevel = difficultyLevel
    if (dietTags && dietTags.length > 0) {
      where.dietTags = {
        hasSome: dietTags
      }
    }
    if (maxCookingTime) {
      where.OR = [
        { prepTime: { lte: parseInt(maxCookingTime) } },
        { cookTime: { lte: parseInt(maxCookingTime) } }
      ]
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
        orderBy: { createdAt: 'desc' },
        include: {
          favorites: {
            where: { userId: session.user.id }
          }
        }
      }),
      prisma.recipe.count({ where })
    ])

    // Add user-specific data
    const recipesWithUserData = recipes.map(recipe => ({
      ...recipe,
      isFavorited: recipe.favorites.length > 0,
      favorites: undefined // Remove the favorites array from response
    }))

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

// POST /api/recipes - Create a new recipe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      ingredients,
      instructions,
      prepTime,
      cookTime,
      servings,
      caloriesPerServing,
      dietTags,
      cuisineType,
      difficultyLevel,
      cost,
      nutritionInfo
    } = body

    // Validate required fields
    if (!name || !ingredients || !instructions || !prepTime || !cookTime || !servings) {
      return NextResponse.json(
        { error: "Missing required fields: name, ingredients, instructions, prepTime, cookTime, servings" },
        { status: 400 }
      )
    }

    // Create recipe
    const recipe = await prisma.recipe.create({
      data: {
        name,
        description: description || "",
        ingredients,
        instructions,
        prepTime: parseInt(prepTime),
        cookTime: parseInt(cookTime),
        servings: parseInt(servings),
        caloriesPerServing: caloriesPerServing ? parseInt(caloriesPerServing) : null,
        dietTags: dietTags || [],
        cuisineType: cuisineType || "general",
        difficultyLevel: difficultyLevel || "easy",
        cost: cost ? parseFloat(cost) : null,
        nutritionInfo: nutritionInfo || {}
      }
    })

    return NextResponse.json({
      success: true,
      recipe,
      message: "Recipe created successfully!"
    })

  } catch (error) {
    console.error("Error creating recipe:", error)
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    )
  }
}
