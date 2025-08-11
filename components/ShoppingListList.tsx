"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ShoppingCart, Plus, RefreshCw, Grid3X3, List } from "lucide-react"
import { ShoppingList, PaginationInfo } from "@/types"
import ShoppingListCard from "./ShoppingListCard"
import Link from "next/link"

interface ShoppingListListProps {
  shoppingLists: ShoppingList[]
  pagination?: PaginationInfo
  onSearch?: (query: string, filters: any) => void
  onLoadMore?: () => void
  onRefresh?: () => void
  onOptimize?: (shoppingListId: string) => void
  showCreateButton?: boolean
  className?: string
}

export default function ShoppingListList({
  shoppingLists,
  pagination,
  onSearch,
  onLoadMore,
  onRefresh,
  onOptimize,
  showCreateButton = true,
  className = ""
}: ShoppingListListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    costRange: "all"
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isSearching, setIsSearching] = useState(false)

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' }
  ]

  const costRangeOptions = [
    { value: 'low', label: 'Under $25', max: 25 },
    { value: 'medium', label: '$25 - $75', min: 25, max: 75 },
    { value: 'high', label: 'Over $75', min: 75 }
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

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({ status: "all", costRange: "all" })
    setSearchQuery("")
  }

  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof typeof filters] !== 'all') || searchQuery.trim() !== ""

  const getFilteredShoppingLists = () => {
    let filtered = [...shoppingLists]

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(list => list.status === filters.status)
    }

    // Cost range filter
    if (filters.costRange && filters.costRange !== 'all') {
      const costRange = costRangeOptions.find(cr => cr.value === filters.costRange)
      if (costRange) {
        filtered = filtered.filter(list => {
          if (costRange.max && !costRange.min) {
            return list.estimatedCost < costRange.max
          } else if (costRange.min && costRange.max) {
            return list.estimatedCost >= costRange.min && list.estimatedCost <= costRange.max
          } else if (costRange.min && !costRange.max) {
            return list.estimatedCost > costRange.min
          }
          return true
        })
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(list => 
        list.mealPlan.name.toLowerCase().includes(query) ||
        list.items.some(item => item.toLowerCase().includes(query))
      )
    }

    return filtered
  }

  const filteredShoppingLists = getFilteredShoppingLists()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shopping Lists</h2>
          <p className="text-gray-600 mt-1">
            {pagination ? `${pagination.total} shopping lists found` : `${filteredShoppingLists.length} shopping lists`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {showCreateButton && (
            <Button asChild>
              <Link href="/shopping-lists/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Shopping List
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
              <Label htmlFor="search" className="sr-only">Search shopping lists</Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shopping lists by meal plan name or items..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                                          <SelectItem value="all">All statuses</SelectItem>
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

            {/* Cost Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cost Range</Label>
              <Select
                value={filters.costRange}
                onValueChange={(value) => handleFilterChange('costRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any cost" />
                </SelectTrigger>
                <SelectContent>
                                          <SelectItem value="all">Any cost</SelectItem>
                  {costRangeOptions.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {filters.status && filters.status !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {statusOptions.find(s => s.value === filters.status)?.label}
                  </Badge>
                )}
                {filters.costRange && filters.costRange !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Cost: {costRangeOptions.find(c => c.value === filters.costRange)?.label}
                  </Badge>
                )}
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
            Page {pagination.page} of {pagination.totalPages} • {pagination.total} total shopping lists
          </div>
        )}
      </div>

      {/* Shopping Lists Grid/List */}
      {filteredShoppingLists.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No shopping lists found</h3>
              <p className="mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your search criteria or filters"
                  : "Get started by creating your first shopping list"
                }
              </p>
              {!hasActiveFilters && showCreateButton && (
                <Button asChild>
                  <Link href="/shopping-lists/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Shopping List
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
          {filteredShoppingLists.map((shoppingList) => (
            <ShoppingListCard
              key={shoppingList.id}
              shoppingList={shoppingList}
              onOptimize={onOptimize}
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
            Load More Shopping Lists
          </Button>
        </div>
      )}
    </div>
  )
}
