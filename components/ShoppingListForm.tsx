"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, X, ShoppingCart, DollarSign, Sparkles } from "lucide-react"
import { ShoppingList, MealPlan } from "@/types"
import { useSession } from "next-auth/react"

interface ShoppingListFormProps {
  shoppingList?: ShoppingList
  mealPlans?: MealPlan[]
  onSubmit: (shoppingList: Partial<ShoppingList>) => void
  onCancel: () => void
  onOptimize?: (shoppingListId: string) => void
  isLoading?: boolean
}

export default function ShoppingListForm({
  shoppingList,
  mealPlans = [],
  onSubmit,
  onCancel,
  onOptimize,
  isLoading = false
}: ShoppingListFormProps) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    mealPlanId: shoppingList?.mealPlanId || "",
    status: shoppingList?.status || 'pending' as const,
    estimatedCost: shoppingList?.estimatedCost || 0
  })
  
  const [items, setItems] = useState<string[]>(
    shoppingList?.items || []
  )

  const [newItem, setNewItem] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.mealPlanId) {
      newErrors.mealPlanId = "Meal plan is required"
    }
    
    if (items.length === 0) {
      newErrors.items = "At least one item is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const submitData = {
      ...formData,
      items,
      estimatedCost: Number(formData.estimatedCost)
    }

    onSubmit(submitData)
  }

  const addItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      setItems([...items, newItem.trim()])
      setNewItem("")
    }
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem()
    }
  }

  const handleOptimize = async () => {
    if (onOptimize && shoppingList?.id) {
      await onOptimize(shoppingList.id)
    }
  }

  const selectedMealPlan = mealPlans.find(mp => mp.id === formData.mealPlanId)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5" />
          <span>{shoppingList ? 'Edit Shopping List' : 'Create New Shopping List'}</span>
        </CardTitle>
        <CardDescription>
          Manage your shopping list items and track your grocery expenses
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meal Plan Selection */}
          <div className="space-y-2">
            <Label htmlFor="mealPlanId">Associated Meal Plan *</Label>
            <Select
              value={formData.mealPlanId}
              onValueChange={(value) => setFormData({ ...formData, mealPlanId: value })}
            >
              <SelectTrigger className={errors.mealPlanId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a meal plan" />
              </SelectTrigger>
              <SelectContent>
                {mealPlans.map((mealPlan) => (
                  <SelectItem key={mealPlan.id} value={mealPlan.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{mealPlan.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(mealPlan.startDate).toLocaleDateString()} - {new Date(mealPlan.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.mealPlanId && <p className="text-sm text-red-500">{errors.mealPlanId}</p>}
            
            {selectedMealPlan && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-blue-900">Selected Meal Plan:</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    {selectedMealPlan.items?.length || 0} meals
                  </Badge>
                </div>
                <p className="text-blue-700 mt-1">
                  {selectedMealPlan.name} • {new Date(selectedMealPlan.startDate).toLocaleDateString()} - {new Date(selectedMealPlan.endDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center space-x-2">
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Shopping Items</Label>
              {shoppingList?.id && onOptimize && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOptimize}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>AI Optimize</span>
                </Button>
              )}
            </div>

            {errors.items && (
              <p className="text-sm text-red-500">{errors.items}</p>
            )}

            {/* Add New Item */}
            <div className="flex space-x-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new item (e.g., 2 lbs chicken breast)"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                disabled={!newItem.trim()}
                className="px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Items List */}
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No items added yet. Start adding items to your shopping list.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700 flex-1">{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cost Estimation */}
          <div className="space-y-2">
            <Label htmlFor="estimatedCost" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Estimated Total Cost</span>
            </Label>
            <Input
              id="estimatedCost"
              type="number"
              min="0"
              step="0.01"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              className="w-32"
            />
            <p className="text-sm text-gray-500">
              Enter your estimated total cost for all items
            </p>
          </div>

          {/* Quick Actions */}
          {items.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItems([...items].sort())}
                className="text-xs"
              >
                Sort Alphabetically
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItems([])}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear All Items
              </Button>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || items.length === 0}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {shoppingList ? 'Update List' : 'Create List'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
