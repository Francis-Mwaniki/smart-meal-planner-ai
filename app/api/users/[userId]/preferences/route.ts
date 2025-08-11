export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.id !== params.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: params.userId }
    })

    if (!preferences) {
      return NextResponse.json({ 
        preferences: {
          dietType: "balanced",
          allergies: [],
          budgetWeekly: 100,
          peopleCount: 1,
          maxCookingTime: 30,
          cuisineTypes: [],
          healthGoals: ["maintenance"]
        }
      })
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.id !== params.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      dietType,
      allergies,
      budgetWeekly,
      peopleCount,
      maxCookingTime,
      cuisineTypes,
      healthGoals
    } = body

    // Validate input
    if (!dietType || !Array.isArray(allergies) || !budgetWeekly || !peopleCount || !maxCookingTime || !Array.isArray(cuisineTypes) || !Array.isArray(healthGoals)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate diet types
    const validDietTypes = ["vegetarian", "vegan", "keto", "paleo", "mediterranean", "balanced", "low-carb", "high-protein"]
    if (!validDietTypes.includes(dietType)) {
      return NextResponse.json(
        { error: "Invalid diet type" },
        { status: 400 }
      )
    }

    // Validate health goals
    const validHealthGoals = ["weight_loss", "muscle_gain", "maintenance", "heart_health", "diabetes_management", "energy_boost"]
    if (!healthGoals.every(goal => validHealthGoals.includes(goal))) {
      return NextResponse.json(
        { error: "Invalid health goals" },
        { status: 400 }
      )
    }

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: params.userId },
      update: {
        dietType,
        allergies,
        budgetWeekly: parseFloat(budgetWeekly),
        peopleCount: parseInt(peopleCount),
        maxCookingTime: parseInt(maxCookingTime),
        cuisineTypes,
        healthGoals
      },
      create: {
        userId: params.userId,
        dietType,
        allergies,
        budgetWeekly: parseFloat(budgetWeekly),
        peopleCount: parseInt(peopleCount),
        maxCookingTime: parseInt(maxCookingTime),
        cuisineTypes,
        healthGoals
      }
    })

    return NextResponse.json({ 
      success: true, 
      preferences,
      message: "Preferences updated successfully" 
    })
  } catch (error) {
    console.error("Error updating user preferences:", error)
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.id !== params.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    
    // Only update provided fields
    const updateData: any = {}
    
    if (body.dietType !== undefined) updateData.dietType = body.dietType
    if (body.allergies !== undefined) updateData.allergies = body.allergies
    if (body.budgetWeekly !== undefined) updateData.budgetWeekly = parseFloat(body.budgetWeekly)
    if (body.peopleCount !== undefined) updateData.peopleCount = parseInt(body.peopleCount)
    if (body.maxCookingTime !== undefined) updateData.maxCookingTime = parseInt(body.maxCookingTime)
    if (body.cuisineTypes !== undefined) updateData.cuisineTypes = body.cuisineTypes
    if (body.healthGoals !== undefined) updateData.healthGoals = body.healthGoals

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      )
    }

    const preferences = await prisma.userPreferences.update({
      where: { userId: params.userId },
      data: updateData
    })

    return NextResponse.json({ 
      success: true, 
      preferences,
      message: "Preferences updated successfully" 
    })
  } catch (error) {
    console.error("Error updating user preferences:", error)
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    )
  }
}
