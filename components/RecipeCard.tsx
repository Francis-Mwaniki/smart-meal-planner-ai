"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Users, 
  Flame, 
  DollarSign, 
  Star, 
  StarOff, 
  Edit, 
  Trash2,
  ChefHat,
  Utensils
} from "lucide-react"
import { Recipe } from "@/types"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface RecipeCardProps {
  recipe: Recipe
  onFavorite?: (recipeId: string) => void
  onEdit?: (recipe: Recipe) => void
  onDelete?: (recipeId: string) => void
  showActions?: boolean
  className?: string
}

export default function RecipeCard({ 
  recipe, 
  onFavorite, 
  onEdit, 
  onDelete, 
  showActions = true,
  className = "" 
}: RecipeCardProps) {
  const { data: session } = useSession()
  const [isFavorite, setIsFavorite] = useState(recipe.isFavorited || false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleFavorite = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/recipes/favorites`, {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipeId: recipe.id }),
      })

      if (response.ok) {
        setIsFavorite(!isFavorite)
        onFavorite?.(recipe.id)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipe?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete?.(recipe.id)
      }
    } catch (error) {
      console.error("Error deleting recipe:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getCuisineColor = (cuisine: string) => {
    return 'bg-blue-100 text-blue-700 border-blue-200'
  }

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 border-gray-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
              {recipe.name}
            </CardTitle>
            <CardDescription className="text-gray-600 line-clamp-2 mt-1">
              {recipe.description}
            </CardDescription>
          </div>
          {showActions && (
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className="text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
              >
                {isFavorite ? (
                  <Star className="h-4 w-4 text-yellow-500" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </Button>
              {session?.user?.id === recipe.userId && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(recipe)}
                    className="text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Recipe Image Placeholder */}
        <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
          <Utensils className="h-8 w-8 text-gray-400" />
        </div>

        {/* Recipe Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} serving{recipe.servings > 1 ? 's' : ''}</span>
          </div>
          {recipe.caloriesPerServing && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Flame className="h-4 w-4" />
              <span>{recipe.caloriesPerServing} cal</span>
            </div>
          )}
          {recipe.cost && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>${recipe.cost.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getDifficultyColor(recipe.difficultyLevel)}>
            {recipe.difficultyLevel}
          </Badge>
          <Badge className={getCuisineColor(recipe.cuisineType)}>
            {recipe.cuisineType}
          </Badge>
          {recipe.dietTags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="border-gray-300 text-gray-700">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button asChild className="flex-1">
            <Link href={`/recipes/${recipe.id}`}>
              <ChefHat className="h-4 w-4 mr-2" />
              View Recipe
            </Link>
          </Button>
          <Button variant="outline" className="flex-1">
            Add to Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
