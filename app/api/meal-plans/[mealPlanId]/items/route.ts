import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/meal-plans/[mealPlanId]/items - Get all items for a meal plan
export async function GET(
  request: NextRequest,
  { params }: { params: { mealPlanId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify meal plan belongs to user
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: params.mealPlanId,
        userId: session.user.id
      }
    })

    if (!mealPlan) {
      return NextResponse.json(
        { error: "Meal plan not found or access denied" },
        { status: 404 }
      )
    }

    // Get meal plan items
    const items = await prisma.mealPlanItem.findMany({
      where: { mealPlanId: params.mealPlanId },
      include: {
        recipe: true
      },
      orderBy: [
        { mealDate: 'asc' },
        { mealType: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      items
    })

  } catch (error) {
    console.error("Error fetching meal plan items:", error)
    return NextResponse.json(
      { error: "Failed to fetch meal plan items" },
      { status: 500 }
    )
  }
}

// POST /api/meal-plans/[mealPlanId]/items - Add new item to meal plan
export async function POST(
  request: NextRequest,
  { params }: { params: { mealPlanId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify meal plan belongs to user
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: params.mealPlanId,
        userId: session.user.id
      }
    })

    if (!mealPlan) {
      return NextResponse.json(
        { error: "Meal plan not found or access denied" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      recipeId,
      mealDate,
      mealType,
      servings = 1,
      notes
    } = body

    // Validate required fields
    if (!recipeId || !mealDate || !mealType) {
      return NextResponse.json(
        { error: "Missing required fields: recipeId, mealDate, mealType" },
        { status: 400 }
      )
    }

    // Verify recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    })

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      )
    }

    // Create meal plan item
    const item = await prisma.mealPlanItem.create({
      data: {
        mealPlanId: params.mealPlanId,
        recipeId,
        mealDate: new Date(mealDate),
        mealType,
        servings: parseInt(servings),
        notes
      },
      include: {
        recipe: true
      }
    })

    return NextResponse.json({
      success: true,
      item,
      message: "Meal plan item added successfully!"
    })

  } catch (error) {
    console.error("Error adding meal plan item:", error)
    return NextResponse.json(
      { error: "Failed to add meal plan item" },
      { status: 500 }
    )
  }
}

// PUT /api/meal-plans/[mealPlanId]/items - Update meal plan items in bulk
export async function PUT(
  request: NextRequest,
  { params }: { params: { mealPlanId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify meal plan belongs to user
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: params.mealPlanId,
        userId: session.user.id
      }
    })

    if (!mealPlan) {
      return NextResponse.json(
        { error: "Meal plan not found or access denied" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items must be an array" },
        { status: 400 }
      )
    }

    // Update items in transaction
    const updatedItems = await prisma.$transaction(
      items.map(item => 
        prisma.mealPlanItem.update({
          where: { id: item.id },
          data: {
            ...(item.recipeId && { recipeId: item.recipeId }),
            ...(item.mealDate && { mealDate: new Date(item.mealDate) }),
            ...(item.mealType && { mealType: item.mealType }),
            ...(item.servings && { servings: parseInt(item.servings) }),
            ...(item.notes !== undefined && { notes: item.notes }),
            ...(item.completed !== undefined && { completed: item.completed })
          }
        })
      )
    )

    return NextResponse.json({
      success: true,
      items: updatedItems,
      message: "Meal plan items updated successfully!"
    })

  } catch (error) {
    console.error("Error updating meal plan items:", error)
    return NextResponse.json(
      { error: "Failed to update meal plan items" },
      { status: 500 }
    )
  }
}
