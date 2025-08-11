"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  Clock, 
  Users, 
  Flame, 
  DollarSign, 
  Edit, 
  Trash2,
  Eye,
  ShoppingCart,
  ChefHat,
  CheckCircle,
  Circle
} from "lucide-react"
import { MealPlan } from "@/types"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface MealPlanCardProps {
  mealPlan: MealPlan
  onEdit?: (mealPlan: MealPlan) => void
  onDelete?: (mealPlanId: string) => void
  onViewDetails?: (mealPlan: MealPlan) => void
  showActions?: boolean
  className?: string
}

export default function MealPlanCard({ 
  mealPlan, 
  onEdit, 
  onDelete, 
  onViewDetails,
  showActions = true,
  className = "" 
}: MealPlanCardProps) {
  const { data: session } = useSession()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this meal plan?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/meal-plans/${mealPlan.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete?.(mealPlan.id)
      }
    } catch (error) {
      console.error("Error deleting meal plan:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'archived': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Circle className="h-3 w-3 fill-green-500 text-green-500" />
      case 'completed': return <CheckCircle className="h-3 w-3 fill-blue-500 text-blue-500" />
      case 'archived': return <Circle className="h-3 w-3 fill-gray-500 text-gray-500" />
      default: return <Circle className="h-3 w-3 fill-gray-500 text-gray-500" />
    }
  }

  const startDate = new Date(mealPlan.startDate)
  const endDate = new Date(mealPlan.endDate)
  const today = new Date()
  const isActive = mealPlan.status === 'active'
  
  const progress = isActive ? Math.min(
    Math.max(
      ((today.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100,
      0
    ),
    100
  ) : 0

  const totalMeals = mealPlan.items.length
  const completedMeals = mealPlan.items.filter(item => item.completed).length
  const completionRate = totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0

  const totalCalories = mealPlan.items.reduce((total, item) => {
    return total + ((item.recipe.caloriesPerServing || 0) * item.servings)
  }, 0)

  const totalCost = mealPlan.items.reduce((total, item) => {
    return total + ((item.recipe.cost || 0) * item.servings)
  }, 0)

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 border-gray-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {mealPlan.name}
              </CardTitle>
              <Badge className={getStatusColor(mealPlan.status)}>
                {getStatusIcon(mealPlan.status)}
                <span className="ml-1 capitalize">{mealPlan.status}</span>
              </Badge>
            </div>
            <CardDescription className="text-gray-600">
              <Calendar className="h-4 w-4 inline mr-1" />
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </CardDescription>
          </div>
          {showActions && (
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails?.(mealPlan)}
                className="text-gray-400 hover:text-blue-500 hover:bg-blue-50"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {session?.user?.id === mealPlan.userId && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(mealPlan)}
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
        {/* Progress Bar */}
        {isActive && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Week Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ChefHat className="h-4 w-4" />
            <span>{totalMeals} meals</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4" />
            <span>{completedMeals} completed</span>
          </div>
          {totalCalories > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Flame className="h-4 w-4" />
              <span>{totalCalories.toFixed(0)} cal</span>
            </div>
          )}
          {totalCost > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>${totalCost.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Completion Rate */}
        {totalMeals > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Completion Rate</span>
              <span>{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/meal-plans/${mealPlan.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          <Button variant="outline" className="flex-1">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Shopping List
          </Button>
        </div>

        {/* Recent Meals Preview */}
        {mealPlan.items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Meals</h4>
            <div className="space-y-2">
              {mealPlan.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      item.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-gray-600 capitalize">{item.mealType}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {new Date(item.mealDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {mealPlan.items.length > 3 && (
                <p className="text-xs text-gray-400 text-center">
                  +{mealPlan.items.length - 3} more meals
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
