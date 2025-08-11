'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchFilters, ApiResponse, Recipe, MealPlan, ShoppingList, PaginationInfo } from '@/types';

interface SearchResultsProps {
  initialQuery?: string;
  initialFilters?: SearchFilters;
}

export default function SearchResults({ initialQuery = '', initialFilters = {} }: SearchResultsProps) {
  const { data: session } = useSession();
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    difficultyLevel: 'all',
    cuisineType: 'all',
    ...initialFilters
  });
  const [results, setResults] = useState<{
    recipes: Recipe[];
    mealPlans: MealPlan[];
    shoppingLists: ShoppingList[];
  }>({ recipes: [], mealPlans: [], shoppingLists: [] });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'recipes' | 'mealPlans' | 'shoppingLists'>('all');

  const searchTypes = [
    { value: 'all', label: 'All', count: results.recipes.length + results.mealPlans.length + results.shoppingLists.length },
    { value: 'recipes', label: 'Recipes', count: results.recipes.length },
    { value: 'mealPlans', label: 'Meal Plans', count: results.mealPlans.length },
    { value: 'shoppingLists', label: 'Shopping Lists', count: results.shoppingLists.length },
  ];

  const performSearch = async (searchQuery: string, searchFilters: SearchFilters, page: number = 1) => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchFilters.difficulty && { difficulty: searchFilters.difficulty }),
        ...(searchFilters.cuisine && { cuisine: searchFilters.cuisine }),
        ...(searchFilters.maxCookingTime && { maxCookingTime: searchFilters.maxCookingTime.toString() }),
        ...(searchFilters.maxCalories && { maxCalories: searchFilters.maxCalories.toString() }),
        ...(searchFilters.status && { status: searchFilters.status }),
        ...(searchFilters.maxCost && { maxCost: searchFilters.maxCost.toString() }),
      });

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data: ApiResponse<{
          recipes: Recipe[];
          mealPlans: MealPlan[];
          shoppingLists: ShoppingList[];
          pagination: PaginationInfo;
        }> = await response.json();
        
        if (data.success) {
          setResults(data.data);
          setPagination(data.data.pagination);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      performSearch(query.trim(), filters, 1);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (query.trim()) {
      performSearch(query.trim(), newFilters, 1);
    }
  };

  const handlePageChange = (page: number) => {
    if (query.trim()) {
      performSearch(query.trim(), filters, page);
    }
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      difficultyLevel: 'all',
      cuisineType: 'all'
    };
    setFilters(clearedFilters);
    if (query.trim()) {
      performSearch(query.trim(), clearedFilters, 1);
    }
  };

  useEffect(() => {
    if (initialQuery && session?.user?.id) {
      performSearch(initialQuery, initialFilters);
    }
  }, [initialQuery, initialFilters, session?.user?.id]);

  const renderRecipeCard = (recipe: Recipe) => (
    <Card key={recipe.id} className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{recipe.name}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{recipe.cuisine}</Badge>
          <Badge variant="outline">{recipe.difficulty}</Badge>
          {recipe.dietTags?.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
          <span>👥 {recipe.servings} servings</span>
          <span>🔥 {recipe.calories} cal</span>
        </div>
      </CardContent>
    </Card>
  );

  const renderMealPlanCard = (mealPlan: MealPlan) => (
    <Card key={mealPlan.id} className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{mealPlan.name}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant={mealPlan.status === 'active' ? 'default' : 'secondary'}>
            {mealPlan.status}
          </Badge>
          <Badge variant="outline">
            {new Date(mealPlan.startDate).toLocaleDateString()} - {new Date(mealPlan.endDate).toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          {mealPlan.description || 'No description available'}
        </p>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>🍽️ {mealPlan.totalMeals} meals</span>
          <span>🔥 {mealPlan.totalCalories} cal</span>
          <span>💰 ${mealPlan.totalCost}</span>
        </div>
      </CardContent>
    </Card>
  );

  const renderShoppingListCard = (shoppingList: ShoppingList) => (
    <Card key={shoppingList.id} className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{shoppingList.name}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant={shoppingList.status === 'active' ? 'default' : 'secondary'}>
            {shoppingList.status}
          </Badge>
          {shoppingList.mealPlanId && (
            <Badge variant="outline">Meal Plan</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          {shoppingList.items?.length || 0} items
        </p>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>📝 {shoppingList.items?.length || 0} items</span>
          <span>💰 ${shoppingList.estimatedCost}</span>
        </div>
      </CardContent>
    </Card>
  );

  const renderResults = () => {
    if (activeTab === 'all') {
      return (
        <div className="space-y-6">
          {results.recipes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Recipes ({results.recipes.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.recipes.map(renderRecipeCard)}
              </div>
            </div>
          )}
          {results.mealPlans.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Meal Plans ({results.mealPlans.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.mealPlans.map(renderMealPlanCard)}
              </div>
            </div>
          )}
          {results.shoppingLists.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Shopping Lists ({results.shoppingLists.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.shoppingLists.map(renderShoppingListCard)}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'recipes') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.recipes.map(renderRecipeCard)}
        </div>
      );
    }

    if (activeTab === 'mealPlans') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.mealPlans.map(renderMealPlanCard)}
        </div>
      );
    }

    if (activeTab === 'shoppingLists') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.shoppingLists.map(renderShoppingListCard)}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search-query">Search</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="search-query"
                placeholder="Search recipes, meal plans, shopping lists..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={filters.difficulty || ''} onValueChange={(value) => handleFilterChange('difficulty', value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Any difficulty" />
              </SelectTrigger>
              <SelectContent>
                                        <SelectItem value="all">Any difficulty</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cuisine">Cuisine</Label>
            <Select value={filters.cuisine || ''} onValueChange={(value) => handleFilterChange('cuisine', value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Any cuisine" />
              </SelectTrigger>
              <SelectContent>
                                        <SelectItem value="all">Any cuisine</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="mexican">Mexican</SelectItem>
                <SelectItem value="asian">Asian</SelectItem>
                <SelectItem value="american">American</SelectItem>
                <SelectItem value="mediterranean">Mediterranean</SelectItem>
                <SelectItem value="indian">Indian</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="maxCookingTime">Max Time (min)</Label>
            <Input
              id="maxCookingTime"
              type="number"
              placeholder="Any time"
              value={filters.maxCookingTime || ''}
              onChange={(e) => handleFilterChange('maxCookingTime', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          <div>
            <Label htmlFor="maxCalories">Max Calories</Label>
            <Input
              id="maxCalories"
              type="number"
              placeholder="Any calories"
              value={filters.maxCalories || ''}
              onChange={(e) => handleFilterChange('maxCalories', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                                        <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="maxCost">Max Cost ($)</Label>
            <Input
              id="maxCost"
              type="number"
              placeholder="Any cost"
              value={filters.maxCost || ''}
              onChange={(e) => handleFilterChange('maxCost', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={clearFilters} size="sm">
            Clear Filters
          </Button>
          <div className="text-sm text-muted-foreground">
            {pagination.total > 0 && (
              <>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results Tabs */}
      {pagination.total > 0 && (
        <div className="border-b">
          <div className="flex space-x-8">
            {searchTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setActiveTab(type.value as any)}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === type.value
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {type.label} ({type.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Searching...</p>
        </div>
      ) : pagination.total === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {query.trim() ? 'No results found for your search.' : 'Enter a search query to get started.'}
          </p>
        </div>
      ) : (
        <div>
          {renderResults()}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                  if (pageNum > pagination.totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
