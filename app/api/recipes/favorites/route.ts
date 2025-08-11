import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { userId, recipeId } = await request.json()

    if (!userId || !recipeId) {
      return NextResponse.json({ error: "User ID and Recipe ID are required" }, { status: 400 })
    }

    // Toggle favorite
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    })

    if (existingFavorite) {
      // Remove from favorites
      await prisma.userFavorite.delete({
        where: {
          userId_recipeId: {
            userId,
            recipeId,
          },
        },
      })
      return NextResponse.json({ success: true, favorited: false })
    } else {
      // Add to favorites
      await prisma.userFavorite.create({
        data: {
          userId,
          recipeId,
        },
      })
      return NextResponse.json({ success: true, favorited: true })
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      include: {
        recipe: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(favorites.map((fav) => fav.recipe))
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
