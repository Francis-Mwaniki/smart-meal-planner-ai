export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/recipes/[recipeId] - Get a specific recipe
export async function GET(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: params.recipeId },
      include: {
        favorites: {
          where: { userId: session.user.id }
        }
      }
    })

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    // Add user-specific data
    const recipeWithUserData = {
      ...recipe,
      isFavorited: recipe.favorites.length > 0,
      favorites: undefined // Remove the favorites array from response
    }

    return NextResponse.json({
      success: true,
      recipe: recipeWithUserData
    })

  } catch (error) {
    console.error("Error fetching recipe:", error)
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    )
  }
}

// PUT /api/recipes/[recipeId] - Update a recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: params.recipeId }
    })

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
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

    // Update recipe
    const updatedRecipe = await prisma.recipe.update({
      where: { id: params.recipeId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(ingredients && { ingredients }),
        ...(instructions && { instructions }),
        ...(prepTime && { prepTime: parseInt(prepTime) }),
        ...(cookTime && { cookTime: parseInt(cookTime) }),
        ...(servings && { servings: parseInt(servings) }),
        ...(caloriesPerServing !== undefined && { 
          caloriesPerServing: caloriesPerServing ? parseInt(caloriesPerServing) : null 
        }),
        ...(dietTags && { dietTags }),
        ...(cuisineType && { cuisineType }),
        ...(difficultyLevel && { difficultyLevel }),
        ...(cost !== undefined && { 
          cost: cost ? parseFloat(cost) : null 
        }),
        ...(nutritionInfo && { nutritionInfo })
      }
    })

    return NextResponse.json({
      success: true,
      recipe: updatedRecipe,
      message: "Recipe updated successfully!"
    })

  } catch (error) {
    console.error("Error updating recipe:", error)
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    )
  }
}

// DELETE /api/recipes/[recipeId] - Delete a recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: params.recipeId }
    })

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    // Delete recipe (this will cascade to related records)
    await prisma.recipe.delete({
      where: { id: params.recipeId }
    })

    return NextResponse.json({
      success: true,
      message: "Recipe deleted successfully!"
    })

  } catch (error) {
    console.error("Error deleting recipe:", error)
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    )
  }
}
