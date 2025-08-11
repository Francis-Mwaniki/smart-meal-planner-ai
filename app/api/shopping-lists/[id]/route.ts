import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try to find by shopping list ID first
    let shoppingList = await prisma.shoppingList.findUnique({
      where: { id: params.id },
      include: {
        mealPlan: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    // If not found, try to find by meal plan ID
    if (!shoppingList) {
      shoppingList = await prisma.shoppingList.findFirst({
        where: { mealPlanId: params.id },
        include: {
          mealPlan: {
            include: {
              user: {
                select: { id: true, name: true }
              }
            }
          }
        }
      })
    }

    if (!shoppingList) {
      return NextResponse.json({ error: "Shopping list not found" }, { status: 404 })
    }

    // Check if user owns this shopping list or meal plan
    if (shoppingList.mealPlan.user.id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ success: true, shoppingList })
  } catch (error) {
    console.error("Error fetching shopping list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify meal plan ownership
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!mealPlan) {
      return NextResponse.json({ error: "Meal plan not found" }, { status: 404 })
    }

    if (mealPlan.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { items, estimatedCost, status = "pending" } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 })
    }

    // Create or update shopping list
    const shoppingList = await prisma.shoppingList.upsert({
      where: { mealPlanId: params.id },
      update: {
        items,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        status
      },
      create: {
        mealPlanId: params.id,
        items,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        status
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { optimize, ...updateData } = body

    if (optimize) {
      // AI optimization logic
      try {
        // Import OpenRouter client
        const { openRouter } = await import("@/lib/openrouter")
        
        // Try to find shopping list by ID or meal plan ID
        let shoppingList = await prisma.shoppingList.findUnique({
          where: { id: params.id }
        })

        if (!shoppingList) {
          shoppingList = await prisma.shoppingList.findFirst({
            where: { mealPlanId: params.id }
          })
        }

        if (!shoppingList) {
          return NextResponse.json({ error: "Shopping list not found" }, { status: 404 })
        }

        // Check ownership
        const mealPlan = await prisma.mealPlan.findUnique({
          where: { id: shoppingList.mealPlanId },
          select: { userId: true }
        })

        if (!mealPlan || mealPlan.userId !== session.user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
        
        if (openRouter) {
          // Call AI optimization
          const optimizedData = await openRouter.generateShoppingListOptimization({
            items: shoppingList.items,
            budget: shoppingList.estimatedCost
          })

          // Update with optimized data
          const updatedShoppingList = await prisma.shoppingList.update({
            where: { id: shoppingList.id },
            data: {
              items: optimizedData.items || shoppingList.items,
              estimatedCost: optimizedData.estimatedCost || shoppingList.estimatedCost,
              status: "optimized"
            }
          })

          return NextResponse.json({ 
            success: true, 
            shoppingList: updatedShoppingList,
            message: "Shopping list optimized successfully"
          })
        } else {
          // Fallback optimization without AI
          const updatedShoppingList = await prisma.shoppingList.update({
            where: { id: shoppingList.id },
            data: {
              status: "optimized"
            }
          })

          return NextResponse.json({ 
            success: true, 
            shoppingList: updatedShoppingList,
            message: "Shopping list status updated (AI not available)"
          })
        }
      } catch (error) {
        console.error("Error during AI optimization:", error)
        // Fallback: just update status
        let shoppingList = await prisma.shoppingList.findUnique({
          where: { id: params.id }
        })

        if (!shoppingList) {
          shoppingList = await prisma.shoppingList.findFirst({
            where: { mealPlanId: params.id }
          })
        }

        if (shoppingList) {
          const updatedShoppingList = await prisma.shoppingList.update({
            where: { id: shoppingList.id },
            data: { status: "optimized" }
          })

          return NextResponse.json({ 
            success: true, 
            shoppingList: updatedShoppingList,
            message: "Shopping list status updated (optimization failed)"
          })
        }

        return NextResponse.json({ error: "Shopping list not found" }, { status: 404 })
      }
    } else {
      // Regular update - try to find by shopping list ID or meal plan ID
      let shoppingList = await prisma.shoppingList.findUnique({
        where: { id: params.id }
      })

      if (!shoppingList) {
        shoppingList = await prisma.shoppingList.findFirst({
          where: { mealPlanId: params.id }
        })
      }

      if (!shoppingList) {
        return NextResponse.json({ error: "Shopping list not found" }, { status: 404 })
      }

      // Check ownership
      const mealPlan = await prisma.mealPlan.findUnique({
        where: { id: shoppingList.mealPlanId },
        select: { userId: true }
      })

      if (!mealPlan || mealPlan.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const updatedShoppingList = await prisma.shoppingList.update({
        where: { id: shoppingList.id },
        data: updateData
      })

      return NextResponse.json({ success: true, shoppingList: updatedShoppingList })
    }
  } catch (error) {
    console.error("Error updating shopping list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try to find by shopping list ID or meal plan ID
    let shoppingList = await prisma.shoppingList.findUnique({
      where: { id: params.id }
    })

    if (!shoppingList) {
      shoppingList = await prisma.shoppingList.findFirst({
        where: { mealPlanId: params.id }
      })
    }

    if (!shoppingList) {
      return NextResponse.json({ error: "Shopping list not found" }, { status: 404 })
    }

    // Check ownership
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: shoppingList.mealPlanId },
      select: { userId: true }
    })

    if (!mealPlan || mealPlan.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { items, estimatedCost, actualCost, status } = body

    // Build update data
    const updateData: any = {}
    if (items !== undefined) updateData.items = items
    if (estimatedCost !== undefined) updateData.estimatedCost = parseFloat(estimatedCost)
    if (actualCost !== undefined) updateData.actualCost = parseFloat(actualCost)
    if (status !== undefined) updateData.status = status

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const updatedShoppingList = await prisma.shoppingList.update({
      where: { id: shoppingList.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      shoppingList: updatedShoppingList,
      message: "Shopping list updated successfully!"
    })
  } catch (error) {
    console.error("Error updating shopping list:", error)
    return NextResponse.json(
      { error: "Failed to update shopping list" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try to find by shopping list ID or meal plan ID
    let shoppingList = await prisma.shoppingList.findUnique({
      where: { id: params.id }
    })

    if (!shoppingList) {
      shoppingList = await prisma.shoppingList.findFirst({
        where: { mealPlanId: params.id }
      })
    }

    if (!shoppingList) {
      return NextResponse.json({ error: "Shopping list not found" }, { status: 404 })
    }

    // Check ownership
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: shoppingList.mealPlanId },
      select: { userId: true }
    })

    if (!mealPlan || mealPlan.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.shoppingList.delete({
      where: { id: shoppingList.id }
    })

    return NextResponse.json({ success: true, message: "Shopping list deleted successfully!" })
  } catch (error) {
    console.error("Error deleting shopping list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
