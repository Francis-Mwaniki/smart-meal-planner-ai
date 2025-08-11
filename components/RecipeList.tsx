"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Grid3X3, List, Plus, RefreshCw } from "lucide-react"
import { Recipe, SearchFilters, PaginationInfo } from "@/types"
import RecipeCard from "./RecipeCard"
import Link from "next/link"

interface RecipeListProps {
  recipes: Recipe[]
  pagination?: PaginationInfo
  onSearch?: (query: string, filters: SearchFilters) => void
  onLoadMore?: () => void
  onRefresh?: () => void
  showCreateButton?: boolean
  className?: string
}

export default function RecipeList({
  recipes,
  pagination,
  onSearch,
  onLoadMore,
  onRefresh,
  showCreateButton = true,
  className = ""
}: RecipeListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({
    difficultyLevel: 'all',
    cuisineType: 'all'
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isSearching, setIsSearching] = useState(false)

  const difficultyLevels = ['easy', 'medium', 'hard']
  const cuisineTypes = [
    'italian', 'mexican', 'chinese', 'indian', 'japanese', 'french', 
    'mediterranean', 'american', 'thai', 'greek', 'spanish', 'korean'
  ]
  const dietTags = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 
    'paleo', 'low-carb', 'high-protein', 'low-fat', 'pescatarian'
  ]

  const handleSearch = async () => {
    if (!onSearch) return
    
    setIsSearching(true)
    try {
      await onSearch(searchQuery, filters)
    } finally {
      setIsSearching(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery("")
  }

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery.trim() !== ""

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recipes</h2>
          <p className="text-gray-600 mt-1">
            {pagination ? `${pagination.total} recipes found` : `${recipes.length} recipes`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {showCreateButton && (
            <Button asChild>
              <Link href="/recipes/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Recipe
              </Link>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search & Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex space-x-3">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search recipes</Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes by name, ingredients, or description..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Difficulty Level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Difficulty</Label>
              <Select
                value={filters.difficultyLevel || ""}
                onValueChange={(value) => handleFilterChange('difficultyLevel', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any difficulty" />
                </SelectTrigger>
                <SelectContent>
                                          <SelectItem value="all">Any difficulty</SelectItem>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      <span className="capitalize">{level}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cuisine Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cuisine</Label>
              <Select
                value={filters.cuisineType || ""}
                onValueChange={(value) => handleFilterChange('cuisineType', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any cuisine" />
                </SelectTrigger>
                <SelectContent>
                                          <SelectItem value="all">Any cuisine</SelectItem>
                  {cuisineTypes.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      <span className="capitalize">{cuisine}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Max Cooking Time */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Max Time (min)</Label>
              <Input
                type="number"
                min="0"
                placeholder="No limit"
                value={filters.maxCookingTime || ""}
                onChange={(e) => handleFilterChange('maxCookingTime', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            {/* Max Calories */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Max Calories</Label>
              <Input
                type="number"
                min="0"
                placeholder="No limit"
                value={filters.maxCalories || ""}
                onChange={(e) => handleFilterChange('maxCalories', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Search: "{searchQuery}"
                  </Badge>
                )}
                {Object.entries(filters).map(([key, value]) => (
                  value && (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {value}
                    </Badge>
                  )
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {pagination && (
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages} • {pagination.total} total recipes
          </div>
        )}
      </div>

      {/* Recipes Grid/List */}
      {recipes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No recipes found</h3>
              <p className="mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your search criteria or filters"
                  : "Get started by creating your first recipe"
                }
              </p>
              {!hasActiveFilters && showCreateButton && (
                <Button asChild>
                  <Link href="/recipes/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Recipe
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              className={viewMode === 'list' ? "flex-row" : ""}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {pagination && pagination.page < pagination.totalPages && onLoadMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            className="px-8"
          >
            Load More Recipes
          </Button>
        </div>
      )}
    </div>
  )
}
