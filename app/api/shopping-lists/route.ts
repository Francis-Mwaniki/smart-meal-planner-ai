import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { openRouter } from "@/lib/openrouter"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/shopping-lists - Fetch user's shopping lists
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build filter conditions
    const where: any = {
      mealPlan: {
        userId: session.user.id
      }
    }
    
    if (status) where.status = status

    // Get shopping lists with pagination
    const [shoppingLists, total] = await Promise.all([
      prisma.shoppingList.findMany({
        where,
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
      prisma.shoppingList.count({ where })
    ])

    return NextResponse.json({
      success: true,
      shoppingLists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching shopping lists:", error)
    return NextResponse.json(
      { error: "Failed to fetch shopping lists" },
      { status: 500 }
    )
  }
}

// POST /api/shopping-lists - Create a new shopping list
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      mealPlanId,
      items,
      estimatedCost,
      status = "pending"
    } = body

    // Validate required fields
    if (!mealPlanId || !items) {
      return NextResponse.json(
        { error: "Missing required fields: mealPlanId, items" },
        { status: 400 }
      )
    }

    // Verify meal plan belongs to user
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: mealPlanId,
        userId: session.user.id
      }
    })

    if (!mealPlan) {
      return NextResponse.json(
        { error: "Meal plan not found or access denied" },
        { status: 404 }
      )
    }

    // Create shopping list
    const shoppingList = await prisma.shoppingList.create({
      data: {
        mealPlanId,
        items,
        estimatedCost: estimatedCost || 0,
        status
      },
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
    })

    return NextResponse.json({
      success: true,
      shoppingList,
      message: "Shopping list created successfully!"
    })

  } catch (error) {
    console.error("Error creating shopping list:", error)
    return NextResponse.json(
      { error: "Failed to create shopping list" },
      { status: 500 }
    )
  }
}

// POST /api/shopping-lists/optimize - Optimize shopping list using AI
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { shoppingListId, optimizationPreferences } = body

    if (!shoppingListId) {
      return NextResponse.json(
        { error: "Shopping list ID is required" },
        { status: 400 }
      )
    }

    // Get shopping list and verify ownership
    const shoppingList = await prisma.shoppingList.findFirst({
      where: {
        id: shoppingListId,
        mealPlan: {
          userId: session.user.id
        }
      },
      include: {
        mealPlan: true
      }
    })

    if (!shoppingList) {
      return NextResponse.json(
        { error: "Shopping list not found or access denied" },
        { status: 404 }
      )
    }

    // Optimize shopping list using AI
    let optimizedData
    if (openRouter) {
      try {
        optimizedData = await openRouter.generateShoppingListOptimization({
          items: shoppingList.items,
          preferences: optimizationPreferences || {}
        })
      } catch (error) {
        console.error("OpenRouter optimization failed, using original data:", error)
        // Fallback: return original data with some basic optimization
        optimizedData = {
          optimizedList: shoppingList.items,
          totalEstimatedCost: shoppingList.estimatedCost,
          optimizationNotes: "AI optimization unavailable, using original list"
        }
      }
    } else {
      console.log("OpenRouter not available, using original data")
      optimizedData = {
        optimizedList: shoppingList.items,
        totalEstimatedCost: shoppingList.estimatedCost,
        optimizationNotes: "AI optimization unavailable, using original list"
      }
    }

    // Update shopping list with optimized data
    const updatedShoppingList = await prisma.shoppingList.update({
      where: { id: shoppingListId },
      data: {
        items: optimizedData.optimizedList,
        estimatedCost: optimizedData.totalEstimatedCost
      }
    })

    return NextResponse.json({
      success: true,
      shoppingList: updatedShoppingList,
      optimization: optimizedData,
      message: "Shopping list optimized successfully!"
    })

  } catch (error) {
    console.error("Error optimizing shopping list:", error)
    return NextResponse.json(
      { error: "Failed to optimize shopping list" },
      { status: 500 }
    )
  }
}
