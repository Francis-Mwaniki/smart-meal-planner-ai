export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.id !== params.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "active"

    const mealPlans = await prisma.mealPlan.findMany({
      where: {
        userId: params.userId,
        status,
      },
      include: {
        items: {
          include: {
            recipe: true,
          },
          orderBy: {
            mealDate: "asc",
          },
        },
        shoppingLists: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: mealPlans
    })
  } catch (error) {
    console.error("Error fetching meal plans:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
