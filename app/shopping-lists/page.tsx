"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Search, Filter, ShoppingCart, RefreshCw, Loader2, ChefHat } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import ShoppingListList from "@/components/ShoppingListList"
import DashboardHeader from "@/components/DashboardHeader"
import { ShoppingList } from "@/types"

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ShoppingListsPage() {
  const { data: session } = useSession()
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    costRange: "all"
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchShoppingLists()
    }
  }, [session])

  const fetchShoppingLists = async (page = 1) => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      
      const response = await fetch(`/api/shopping-lists?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setShoppingLists(data.shoppingLists)
          setPagination(data.pagination)
        }
      }
    } catch (error) {
      console.error("Error fetching shopping lists:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await fetchShoppingLists()
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&type=shopping-lists`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setShoppingLists(data.results.shoppingLists || [])
          setPagination(undefined) // Search results don't have pagination
        }
      }
    } catch (error) {
      console.error("Error searching shopping lists:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({ status: "all", costRange: "all" })
    setSearchQuery("")
    fetchShoppingLists()
  }

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.totalPages) {
      fetchShoppingLists(pagination.page + 1)
    }
  }

  const handleRefresh = () => {
    fetchShoppingLists()
  }

  const handleOptimize = async (shoppingListId: string) => {
    try {
      const response = await fetch(`/api/shopping-lists/${shoppingListId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optimize: true }),
      })

      if (response.ok) {
        // Refresh the shopping lists to show optimized version
        await fetchShoppingLists()
      }
    } catch (error) {
      console.error("Error optimizing shopping list:", error)
    }
  }

  if (isLoading && shoppingLists.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <DashboardHeader 
          showBackButton={true}
          backHref="/dashboard"
          backLabel="Back to Dashboard"
          title="Shopping Lists"
          subtitle="Manage your grocery shopping lists and track expenses"
        />

        <div className="max-w-6xl mx-auto">
          {/* Search and Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search & Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Items</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="search"
                        placeholder="Search shopping lists..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button onClick={handleSearch} size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cost Range Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="cost-filter">Cost Range</Label>
                    <Select value={filters.costRange} onValueChange={(value) => handleFilterChange('costRange', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Costs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Costs</SelectItem>
                        <SelectItem value="low">Under $25</SelectItem>
                        <SelectItem value="medium">$25 - $75</SelectItem>
                        <SelectItem value="high">Over $75</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              {/* Filter Actions */}
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={clearFilters} size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
                
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

                                {/* Shopping Lists */}
           <ShoppingListList
             shoppingLists={shoppingLists}
             pagination={pagination}
             onSearch={handleSearch}
             onLoadMore={handleLoadMore}
             onRefresh={handleRefresh}
             onOptimize={handleOptimize}
             showCreateButton={false}
           />

          {/* Create New Shopping List */}
          {shoppingLists.length === 0 && !isLoading && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-500">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No shopping lists found</h3>
                  <p className="mb-4">
                    Shopping lists are automatically created when you generate meal plans.
                    Generate a meal plan first to see your shopping list here.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard">
                      <ChefHat className="h-4 w-4 mr-2" />
                      Generate Meal Plan
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
