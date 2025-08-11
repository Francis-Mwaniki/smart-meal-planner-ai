"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Loader2 } from "lucide-react"
import { Recipe } from "@/types"

interface RecipeFormProps {
  recipe?: Recipe | null
  onSubmit: (recipeData: Partial<Recipe>) => void
  onCancel: () => void
  isLoading?: boolean
}

const DIET_TAGS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 
  'low-carb', 'high-protein', 'low-fat', 'heart-healthy', 'diabetic-friendly'
]

const CUISINE_TYPES = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 
  'Thai', 'Mediterranean', 'French', 'Greek', 'Spanish', 'Korean',
  'Vietnamese', 'Middle Eastern', 'African', 'Caribbean'
]

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard']

export default function RecipeForm({ 
  recipe, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: RecipeFormProps) {
  const [formData, setFormData] = useState({
    name: recipe?.name || '',
    description: recipe?.description || '',
    ingredients: recipe?.ingredients || [''],
    instructions: recipe?.instructions || [''],
    prepTime: recipe?.prepTime?.toString() || '',
    cookTime: recipe?.cookTime?.toString() || '',
    servings: recipe?.servings?.toString() || '4',
    caloriesPerServing: recipe?.caloriesPerServing?.toString() || '',
    dietTags: recipe?.dietTags || [],
    cuisineType: recipe?.cuisineType || '',
    difficultyLevel: recipe?.difficultyLevel || 'medium',
    cost: recipe?.cost?.toString() || '',
    nutritionInfo: recipe?.nutritionInfo || {}
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Recipe name is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (formData.ingredients.length === 0 || formData.ingredients.every(i => !i.trim())) {
      newErrors.ingredients = 'At least one ingredient is required'
    }
    if (formData.instructions.length === 0 || formData.instructions.every(i => !i.trim())) {
      newErrors.instructions = 'At least one instruction is required'
    }
    if (!formData.prepTime || parseInt(formData.prepTime) < 0) {
      newErrors.prepTime = 'Valid prep time is required'
    }
    if (!formData.cookTime || parseInt(formData.cookTime) < 0) {
      newErrors.cookTime = 'Valid cook time is required'
    }
    if (!formData.servings || parseInt(formData.servings) < 1) {
      newErrors.servings = 'Valid servings count is required'
    }
    if (!formData.cuisineType) {
      newErrors.cuisineType = 'Cuisine type is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const recipeData = {
      ...formData,
      prepTime: parseInt(formData.prepTime),
      cookTime: parseInt(formData.cookTime),
      servings: parseInt(formData.servings),
      caloriesPerServing: formData.caloriesPerServing ? parseInt(formData.caloriesPerServing) : null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      nutritionInfo: formData.nutritionInfo
    }

    onSubmit(recipeData)
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }))
  }

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const updateIngredient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? value : ingredient
      )
    }))
  }

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }))
  }

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) => 
        i === index ? value : instruction
      )
    }))
  }

  const toggleDietTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      dietTags: prev.dietTags.includes(tag)
        ? prev.dietTags.filter(t => t !== tag)
        : [...prev.dietTags, tag]
    }))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{recipe ? 'Edit Recipe' : 'Create New Recipe'}</CardTitle>
        <CardDescription>
          {recipe ? 'Update your recipe details' : 'Add a new recipe to your collection'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Recipe Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Chicken Caesar Salad"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cuisineType">Cuisine Type *</Label>
              <Select
                value={formData.cuisineType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, cuisineType: value }))}
              >
                <SelectTrigger className={errors.cuisineType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select cuisine type" />
                </SelectTrigger>
                <SelectContent>
                  {CUISINE_TYPES.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cuisineType && <p className="text-sm text-red-500">{errors.cuisineType}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your recipe..."
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Recipe Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prepTime">Prep Time (min) *</Label>
              <Input
                id="prepTime"
                type="number"
                value={formData.prepTime}
                onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                min="0"
                className={errors.prepTime ? 'border-red-500' : ''}
              />
              {errors.prepTime && <p className="text-sm text-red-500">{errors.prepTime}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cookTime">Cook Time (min) *</Label>
              <Input
                id="cookTime"
                type="number"
                value={formData.cookTime}
                onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                min="0"
                className={errors.cookTime ? 'border-red-500' : ''}
              />
              {errors.cookTime && <p className="text-sm text-red-500">{errors.cookTime}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="servings">Servings *</Label>
              <Input
                id="servings"
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                min="1"
                className={errors.servings ? 'border-red-500' : ''}
              />
              {errors.servings && <p className="text-sm text-red-500">{errors.servings}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficultyLevel">Difficulty</Label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficultyLevel: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caloriesPerServing">Calories per Serving</Label>
              <Input
                id="caloriesPerServing"
                type="number"
                value={formData.caloriesPerServing}
                onChange={(e) => setFormData(prev => ({ ...prev, caloriesPerServing: e.target.value }))}
                min="0"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost per Serving ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                min="0"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Diet Tags */}
          <div className="space-y-3">
            <Label>Dietary Tags</Label>
            <div className="flex flex-wrap gap-2">
              {DIET_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={formData.dietTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer hover:bg-blue-100 ${
                    formData.dietTags.includes(tag) 
                      ? 'bg-blue-500 text-white' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                  onClick={() => toggleDietTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Ingredients *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addIngredient}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Ingredient
              </Button>
            </div>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  placeholder={`Ingredient ${index + 1}`}
                  className={errors.ingredients && !ingredient.trim() ? 'border-red-500' : ''}
                />
                {formData.ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.ingredients && <p className="text-sm text-red-500">{errors.ingredients}</p>}
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Instructions *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInstruction}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center mt-2">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <Textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    rows={2}
                    className={errors.instructions && !instruction.trim() ? 'border-red-500' : ''}
                  />
                </div>
                {formData.instructions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 mt-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.instructions && <p className="text-sm text-red-500">{errors.instructions}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {recipe ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                recipe ? 'Update Recipe' : 'Create Recipe'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
