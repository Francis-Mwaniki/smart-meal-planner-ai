export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/search - Search across recipes, meal plans, and content
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') // recipes, meal-plans, all
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      )
    }

    const results: any = {}
    let totalResults = 0

    // Search recipes
    if (type === 'recipes' || type === 'all' || !type) {
      const [recipes, recipeCount] = await Promise.all([
        prisma.recipe.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { ingredients: { path: ['$'], string_contains: query } },
              { dietTags: { has: query.toLowerCase() } },
              { cuisineType: { contains: query, mode: 'insensitive' } }
            ]
          },
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            favorites: {
              where: { userId: session.user.id }
            }
          }
        }),
        prisma.recipe.count({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { ingredients: { path: ['$'], string_contains: query } },
              { dietTags: { has: query.toLowerCase() } },
              { cuisineType: { contains: query, mode: 'insensitive' } }
            ]
          }
        })
      ])

      results.recipes = recipes.map(recipe => ({
        ...recipe,
        isFavorited: recipe.favorites.length > 0,
        favorites: undefined
      }))
      results.recipeCount = recipeCount
      totalResults += recipeCount
    }

    // Search meal plans
    if (type === 'meal-plans' || type === 'all' || !type) {
      const [mealPlans, mealPlanCount] = await Promise.all([
        prisma.mealPlan.findMany({
          where: {
            userId: session.user.id,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { aiPrompt: { contains: query, mode: 'insensitive' } }
            ]
          },
          skip: offset,
          take: limit,
          orderBy: { startDate: 'desc' },
          include: {
            _count: {
              select: {
                items: true,
                shoppingLists: true
              }
            }
          }
        }),
        prisma.mealPlan.count({
          where: {
            userId: session.user.id,
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { aiPrompt: { contains: query, mode: 'insensitive' } }
            ]
          }
        })
      ])

      results.mealPlans = mealPlans
      results.mealPlanCount = mealPlanCount
      totalResults += mealPlanCount
    }

    // Search shopping lists
    if (type === 'shopping-lists' || type === 'all' || !type) {
      const [shoppingLists, shoppingListCount] = await Promise.all([
        prisma.shoppingList.findMany({
          where: {
            mealPlan: {
              userId: session.user.id
            },
            items: { path: ['$'], string_contains: query }
          },
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            mealPlan: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true
              }
            }
          }
        }),
        prisma.shoppingList.count({
          where: {
            mealPlan: {
              userId: session.user.id
            },
            items: { path: ['$'], string_contains: query }
          }
        })
      ])

      results.shoppingLists = shoppingLists
      results.shoppingListCount = shoppingListCount
      totalResults += shoppingListCount
    }

    return NextResponse.json({
      success: true,
      query,
      results,
      totalResults,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalResults / limit)
      }
    })

  } catch (error) {
    console.error("Error performing search:", error)
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    )
  }
}

// POST /api/search - Advanced search with filters
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      query,
      filters = {},
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = body

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      )
    }

    const offset = (page - 1) * limit

    // Build advanced search query for recipes
    const recipeWhere: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    }

    // Apply filters
    if (filters.dietTags && filters.dietTags.length > 0) {
      recipeWhere.dietTags = { hasSome: filters.dietTags }
    }
    if (filters.cuisineType && filters.cuisineType !== 'all') {
      recipeWhere.cuisineType = filters.cuisineType
    }
    if (filters.difficultyLevel && filters.difficultyLevel !== 'all') {
      recipeWhere.difficultyLevel = filters.difficultyLevel
    }
    if (filters.maxCookingTime) {
      recipeWhere.OR = [
        { prepTime: { lte: filters.maxCookingTime } },
        { cookTime: { lte: filters.maxCookingTime } }
      ]
    }
    if (filters.maxCalories) {
      recipeWhere.caloriesPerServing = { lte: filters.maxCalories }
    }

    // Build sort order
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'name') orderBy = { name: 'asc' }
    if (sortBy === 'cookingTime') orderBy = { prepTime: 'asc' }
    if (sortBy === 'calories') orderBy = { caloriesPerServing: 'asc' }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where: recipeWhere,
        skip: offset,
        take: limit,
        orderBy,
        include: {
          favorites: {
            where: { userId: session.user.id }
          }
        }
      }),
      prisma.recipe.count({ where: recipeWhere })
    ])

    const recipesWithUserData = recipes.map(recipe => ({
      ...recipe,
      isFavorited: recipe.favorites.length > 0,
      favorites: undefined
    }))

    return NextResponse.json({
      success: true,
      query,
      filters,
      sortBy,
      results: recipesWithUserData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error performing advanced search:", error)
    return NextResponse.json(
      { error: "Failed to perform advanced search" },
      { status: 500 }
    )
  }
}
