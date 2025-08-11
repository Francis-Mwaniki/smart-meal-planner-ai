import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { openRouter } from "@/lib/openrouter"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST /api/nutrition/analyze - Analyze nutritional content of meals
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { mealPlanId, meals, analysisType = "daily" } = body

    if (!meals && !mealPlanId) {
      return NextResponse.json(
        { error: "Either meals array or mealPlanId is required" },
        { status: 400 }
      )
    }

    let mealsToAnalyze = meals

    // If mealPlanId is provided, fetch meals from database
    if (mealPlanId && !meals) {
      const mealPlan = await prisma.mealPlan.findFirst({
        where: {
          id: mealPlanId,
          userId: session.user.id
        },
        include: {
          items: {
            include: {
              recipe: true
            },
            orderBy: {
              mealDate: 'asc'
            }
          }
        }
      })

      if (!mealPlan) {
        return NextResponse.json(
          { error: "Meal plan not found or access denied" },
          { status: 404 }
        )
      }

      mealsToAnalyze = mealPlan.items.map(item => ({
        name: item.recipe.name,
        mealType: item.mealType,
        mealDate: item.mealDate,
        servings: item.servings,
        caloriesPerServing: item.recipe.caloriesPerServing,
        nutritionInfo: item.recipe.nutritionInfo,
        ingredients: item.recipe.ingredients
      }))
    }

    // Analyze nutrition using AI
    let nutritionAnalysis
    if (openRouter) {
      try {
        nutritionAnalysis = await openRouter.generateNutritionalAnalysis(mealsToAnalyze)
      } catch (error) {
        console.error("OpenRouter nutrition analysis failed, using basic calculation:", error)
        nutritionAnalysis = generateFallbackNutritionAnalysis(mealsToAnalyze)
      }
    } else {
      console.log("OpenRouter not available, using basic calculation")
      nutritionAnalysis = generateFallbackNutritionAnalysis(mealsToAnalyze)
    }

    // Store analysis results if mealPlanId is provided
    if (mealPlanId) {
      await prisma.mealPlan.update({
        where: { id: mealPlanId },
        data: {
          totalCalories: nutritionAnalysis.dailyTotals.calories
        }
      })
    }

    return NextResponse.json({
      success: true,
      analysis: nutritionAnalysis,
      message: "Nutritional analysis completed successfully!"
    })

  } catch (error) {
    console.error("Error analyzing nutrition:", error)
    
    if (error instanceof Error && error.message.includes("OpenRouter")) {
      return NextResponse.json(
        { error: "Failed to analyze nutrition. Please try again." },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to analyze nutrition" },
      { status: 500 }
    )
  }
}

// GET /api/nutrition/analyze - Get nutrition history for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build filter conditions
    const where: any = { userId: session.user.id }
    
    if (startDate) where.startDate = { gte: new Date(startDate) }
    if (endDate) where.endDate = { lte: new Date(endDate) }

    // Get meal plans with nutrition data
    const [mealPlans, total] = await Promise.all([
      prisma.mealPlan.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { startDate: 'desc' },
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          totalCalories: true,
          totalCost: true,
          items: {
            select: {
              mealType: true,
              mealDate: true,
              servings: true,
              recipe: {
                select: {
                  name: true,
                  caloriesPerServing: true,
                  nutritionInfo: true
                }
              }
            }
          }
        }
      }),
      prisma.mealPlan.count({ where })
    ])

    // Calculate nutrition summaries
    const nutritionHistory = mealPlans.map(plan => {
      const dailyNutrition = plan.items.reduce((acc, item) => {
        const calories = (item.recipe.caloriesPerServing || 0) * item.servings
        return acc + calories
      }, 0)

      return {
        ...plan,
        totalNutrition: {
          calories: dailyNutrition,
          averageDailyCalories: dailyNutrition / 7 // Assuming 7-day meal plans
        }
      }
    })

    return NextResponse.json({
      success: true,
      nutritionHistory,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Error fetching nutrition history:", error)
    return NextResponse.json(
      { error: "Failed to fetch nutrition history" },
      { status: 500 }
    )
  }
}

// Fallback nutrition analysis generator for when OpenRouter is not available
function generateFallbackNutritionAnalysis(mealsToAnalyze: any[]) {
  const totalCalories = mealsToAnalyze.reduce((sum, meal) => sum + (meal.calories || 0), 0)
  const totalProtein = mealsToAnalyze.reduce((sum, meal) => {
    const protein = meal.nutritionInfo?.protein || 0
    return sum + protein
  }, 0)
  
  return {
    dailyTotals: {
      calories: totalCalories,
      protein: totalProtein,
      carbs: 0, // Would need more complex calculation
      fat: 0,   // Would need more complex calculation
      fiber: 0  // Would need more complex calculation
    },
    mealBreakdown: mealsToAnalyze.map(meal => ({
      name: meal.name,
      calories: meal.calories || 0,
      nutrition: meal.nutritionInfo || {}
    })),
    recommendations: ["AI analysis unavailable", "Consider consulting a nutritionist for detailed analysis"],
    analysisNotes: "Basic calculation due to AI service unavailability"
  }
}
