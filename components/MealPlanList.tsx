/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Calendar, Plus, RefreshCw, Grid3X3, List } from "lucide-react"
import { MealPlan, PaginationInfo } from "@/types"
import MealPlanCard from "./MealPlanCard"
import Link from "next/link"

interface MealPlanListProps {
  mealPlans: MealPlan[]
  pagination?: PaginationInfo
  onSearch?: (query: string, filters: any) => void
  onLoadMore?: () => void
  onRefresh?: () => void
  showCreateButton?: boolean
  className?: string
}

export default function MealPlanList({
  mealPlans,
  pagination,
  onSearch,
  onLoadMore,
  onRefresh,
  showCreateButton = true,
  className = ""
}: MealPlanListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all"
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isSearching, setIsSearching] = useState(false)

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-700 border-gray-200' }
  ]

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'next-week', label: 'Next Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'next-month', label: 'Next Month' }
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
    setFilters({ status: "all", dateRange: "all" })
    setSearchQuery("")
  }

  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof typeof filters] !== 'all') || searchQuery.trim() !== ""

  const getFilteredMealPlans = () => {
    let filtered = [...mealPlans]

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(plan => plan.status === filters.status)
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(plan => {
            const startDate = new Date(plan.startDate)
            const endDate = new Date(plan.endDate)
            return startDate <= today && endDate >= today
          })
          break
        case 'this-week':
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          filtered = filtered.filter(plan => {
            const startDate = new Date(plan.startDate)
            const endDate = new Date(plan.endDate)
            return startDate <= weekEnd && endDate >= weekStart
          })
          break
        case 'next-week':
          const nextWeekStart = new Date(today)
          nextWeekStart.setDate(today.getDate() + (7 - today.getDay()))
          const nextWeekEnd = new Date(nextWeekStart)
          nextWeekEnd.setDate(nextWeekStart.getDate() + 6)
          filtered = filtered.filter(plan => {
            const startDate = new Date(plan.startDate)
            const endDate = new Date(plan.endDate)
            return startDate <= nextWeekEnd && endDate >= nextWeekStart
          })
          break
        case 'this-month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          filtered = filtered.filter(plan => {
            const startDate = new Date(plan.startDate)
            const endDate = new Date(plan.endDate)
            return startDate <= monthEnd && endDate >= monthStart
          })
          break
        case 'next-month':
          const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)
          const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0)
          filtered = filtered.filter(plan => {
            const startDate = new Date(plan.startDate)
            const endDate = new Date(plan.endDate)
            return startDate <= nextMonthEnd && endDate >= nextMonthStart
          })
          break
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(plan => 
        plan.name.toLowerCase().includes(query) ||
        (plan.aiPrompt && plan.aiPrompt.toLowerCase().includes(query))
      )
    }

    return filtered
  }

  const filteredMealPlans = getFilteredMealPlans()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meal Plans</h2>
          <p className="text-gray-600 mt-1">
            {pagination ? `${pagination.total} meal plans found` : `${filteredMealPlans.length} meal plans`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {showCreateButton && (
            <Button asChild>
              <Link href="/meal-plans/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Meal Plan
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
              <Label htmlFor="search" className="sr-only">Search meal plans</Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search meal plans by name or AI prompt..."
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

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Range</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => handleFilterChange('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All dates" />
                </SelectTrigger>
                <SelectContent>
                                          <SelectItem value="all">All dates</SelectItem>
                  {dateRangeOptions.map((range) => (
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
                {filters.dateRange && filters.dateRange !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Date: {dateRangeOptions.find(d => d.value === filters.dateRange)?.label}
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
            Page {pagination.page} of {pagination.totalPages} • {pagination.total} total meal plans
          </div>
        )}
      </div>

      {/* Meal Plans Grid/List */}
      {filteredMealPlans.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No meal plans found</h3>
              <p className="mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your search criteria or filters"
                  : "Get started by creating your first meal plan"
                }
              </p>
              {!hasActiveFilters && showCreateButton && (
                <Button asChild>
                  <Link href="/meal-plans/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Meal Plan
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
          {filteredMealPlans.map((mealPlan) => (
            <MealPlanCard
              key={mealPlan.id}
              mealPlan={mealPlan}
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
            Load More Meal Plans
          </Button>
        </div>
      )}
    </div>
  )
}
