export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/meal-plans - Fetch user's meal plans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build filter conditions
    const where: any = { userId: session.user.id }
    
    if (status) where.status = status
    if (startDate) where.startDate = { gte: new Date(startDate) }
    if (endDate) where.endDate = { lte: new Date(endDate) }

    // Get meal plans with pagination
    const [mealPlans, total] = await Promise.all([
      prisma.mealPlan.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: {
          items: {
            include: {
              recipe: true
            },
            orderBy: {
              mealDate: 'asc'
            }
          },
          shoppingLists: true,
          _count: {
            select: {
              items: true,
              shoppingLists: true
            }
          }
        }
      }),
      prisma.mealPlan.count({ where })
    ])

    return NextResponse.json({
      success: true,
      mealPlans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching meal plans:", error)
    return NextResponse.json(
      { error: "Failed to fetch meal plans" },
      { status: 500 }
    )
  }
}

// POST /api/meal-plans - Create a new meal plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      startDate,
      endDate,
      items,
      shoppingList
    } = body

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: name, startDate, endDate" },
        { status: 400 }
      )
    }

    // Create meal plan
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: session.user.id,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "active"
      }
    })

    // Create meal plan items if provided
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await prisma.mealPlanItem.create({
          data: {
            mealPlanId: mealPlan.id,
            recipeId: item.recipeId,
            mealDate: new Date(item.mealDate),
            mealType: item.mealType,
            servings: item.servings || 1,
            notes: item.notes
          }
        })
      }
    }

    // Create shopping list if provided
    if (shoppingList) {
      await prisma.shoppingList.create({
        data: {
          mealPlanId: mealPlan.id,
          items: shoppingList.items || [],
          estimatedCost: shoppingList.estimatedCost || 0,
          status: "pending"
        }
      })
    }

    // Fetch the complete meal plan with items
    const completeMealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlan.id },
      include: {
        items: {
          include: {
            recipe: true
          }
        },
        shoppingLists: true
      }
    })

    return NextResponse.json({
      success: true,
      mealPlan: completeMealPlan,
      message: "Meal plan created successfully!"
    })

  } catch (error) {
    console.error("Error creating meal plan:", error)
    return NextResponse.json(
      { error: "Failed to create meal plan" },
      { status: 500 }
    )
  }
}
