"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  ShoppingCart, 
  DollarSign, 
  Calendar, 
  Edit, 
  Trash2,
  Eye,
  Sparkles,
  CheckCircle,
  Circle,
  Clock
} from "lucide-react"
import { ShoppingList } from "@/types"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface ShoppingListCardProps {
  shoppingList: ShoppingList
  onEdit?: (shoppingList: ShoppingList) => void
  onDelete?: (shoppingListId: string) => void
  onViewDetails?: (shoppingList: ShoppingList) => void
  onOptimize?: (shoppingListId: string) => void
  showActions?: boolean
  className?: string
}

export default function ShoppingListCard({ 
  shoppingList, 
  onEdit, 
  onDelete, 
  onViewDetails,
  onOptimize,
  showActions = true,
  className = "" 
}: ShoppingListCardProps) {
  const { data: session } = useSession()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this shopping list?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/shopping-lists/${shoppingList.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete?.(shoppingList.id)
      }
    } catch (error) {
      console.error("Error deleting shopping list:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOptimize = async () => {
    if (!onOptimize) return

    setIsOptimizing(true)
    try {
      await onOptimize(shoppingList.id)
    } finally {
      setIsOptimizing(false)
    }
  }

  const toggleItem = (item: string) => {
    const newCheckedItems = new Set(checkedItems)
    if (newCheckedItems.has(item)) {
      newCheckedItems.delete(item)
    } else {
      newCheckedItems.add(item)
    }
    setCheckedItems(newCheckedItems)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />
      case 'completed': return <CheckCircle className="h-3 w-3" />
      case 'cancelled': return <Circle className="h-3 w-3" />
      default: return <Circle className="h-3 w-3" />
    }
  }

  const startDate = new Date(shoppingList.mealPlan.startDate)
  const endDate = new Date(shoppingList.mealPlan.endDate)
  const completionRate = shoppingList.items.length > 0 
    ? (checkedItems.size / shoppingList.items.length) * 100 
    : 0

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 border-gray-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Shopping List
              </CardTitle>
              <Badge className={getStatusColor(shoppingList.status)}>
                {getStatusIcon(shoppingList.status)}
                <span className="ml-1 capitalize">{shoppingList.status}</span>
              </Badge>
            </div>
            <CardDescription className="text-gray-600">
              <Calendar className="h-4 w-4 inline mr-1" />
              {shoppingList.mealPlan.name} • {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </CardDescription>
          </div>
          {showActions && (
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails?.(shoppingList)}
                className="text-gray-400 hover:text-blue-500 hover:bg-blue-50"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {session?.user?.id && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(shoppingList)}
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
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ShoppingCart className="h-4 w-4" />
            <span>{shoppingList.items.length} items</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>${shoppingList.estimatedCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Completion Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Shopping Progress</span>
            <span>{Math.round(completionRate)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Items Preview */}
        {shoppingList.items.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {shoppingList.items.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={checkedItems.has(item.name)}
                    onCheckedChange={() => toggleItem(item.name)}
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <span className={`${
                    checkedItems.has(item.name) ? 'line-through text-gray-400' : 'text-gray-600'
                  }`}>
                    {item.name} - {item.amount}
                  </span>
                </div>
              ))}
              {shoppingList.items.length > 5 && (
                <p className="text-xs text-gray-400 text-center">
                  +{shoppingList.items.length - 5} more items
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/shopping-lists/${shoppingList.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleOptimize}
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Optimize
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex space-x-2">
          <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
            Mark All Complete
          </Button>
          <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700">
            Share List
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
