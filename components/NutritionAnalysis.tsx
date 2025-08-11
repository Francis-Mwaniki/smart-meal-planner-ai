'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { NutritionAnalysis as NutritionAnalysisType, MealPlan, ApiResponse } from '@/types';

interface NutritionAnalysisProps {
  mealPlanId?: string;
  initialMeals?: string;
}

export default function NutritionAnalysis({ mealPlanId, initialMeals = '' }: NutritionAnalysisProps) {
  const { data: session } = useSession();
  const [meals, setMeals] = useState(initialMeals);
  const [selectedMealPlanId, setSelectedMealPlanId] = useState(mealPlanId || '');
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [analysis, setAnalysis] = useState<NutritionAnalysisType | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<NutritionAnalysisType[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMealPlans();
      fetchHistory();
    }
  }, [session?.user?.id]);

  const fetchMealPlans = async () => {
    try {
      const response = await fetch('/api/meal-plans');
      if (response.ok) {
        const data: ApiResponse<MealPlan[]> = await response.json();
        if (data.success) {
          setMealPlans(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/nutrition/analyze');
      if (response.ok) {
        const data: ApiResponse<NutritionAnalysisType[]> = await response.json();
        if (data.success) {
          setHistory(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching nutrition history:', error);
    }
  };

  const analyzeNutrition = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const payload = selectedMealPlanId
        ? { mealPlanId: selectedMealPlanId }
        : { meals: meals.trim() };

      const response = await fetch('/api/nutrition/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data: ApiResponse<NutritionAnalysisType> = await response.json();
        if (data.success) {
          setAnalysis(data.data);
          fetchHistory(); // Refresh history
        }
      }
    } catch (error) {
      console.error('Nutrition analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNutrientColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatNutrientValue = (value: number, unit: string) => {
    return `${value.toFixed(1)}${unit}`;
  };

  const renderNutrientBar = (current: number, recommended: number, unit: string, name: string) => {
    const percentage = Math.min((current / recommended) * 100, 100);
    return (
      <div key={name} className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{name}</span>
          <span className="text-muted-foreground">
            {formatNutrientValue(current, unit)} / {formatNutrientValue(recommended, unit)}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="text-xs text-muted-foreground">
          {percentage.toFixed(1)}% of daily recommended value
        </div>
      </div>
    );
  };

  const renderAnalysisResults = () => {
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysis.totalCalories}</div>
              <p className="text-xs text-muted-foreground">kcal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Protein</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysis.protein}g</div>
              <p className="text-xs text-muted-foreground">
                {((analysis.protein / analysis.recommendedProtein) * 100).toFixed(1)}% of daily value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Carbs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysis.carbohydrates}g</div>
              <p className="text-xs text-muted-foreground">
                {((analysis.carbohydrates / analysis.recommendedCarbs) * 100).toFixed(1)}% of daily value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysis.fat}g</div>
              <p className="text-xs text-muted-foreground">
                {((analysis.fat / analysis.recommendedFat) * 100).toFixed(1)}% of daily value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Nutrition Bars */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Nutrition Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderNutrientBar(analysis.protein, analysis.recommendedProtein, 'g', 'Protein')}
            {renderNutrientBar(analysis.carbohydrates, analysis.recommendedCarbs, 'g', 'Carbohydrates')}
            {renderNutrientBar(analysis.fat, analysis.recommendedFat, 'g', 'Fat')}
            {renderNutrientBar(analysis.fiber, analysis.recommendedFiber, 'g', 'Fiber')}
            {renderNutrientBar(analysis.sugar, analysis.recommendedSugar, 'g', 'Sugar')}
            {renderNutrientBar(analysis.sodium, analysis.recommendedSodium, 'mg', 'Sodium')}
          </CardContent>
        </Card>

        {/* Vitamins and Minerals */}
        <Card>
          <CardHeader>
            <CardTitle>Vitamins & Minerals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analysis.vitamins?.map((vitamin) => (
                <div key={vitamin.name} className="text-center">
                  <div className="text-lg font-semibold">{vitamin.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {vitamin.amount} {vitamin.unit}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {vitamin.percentage}% DV
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Score */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {analysis.healthScore}/100
              </div>
              <div className="text-muted-foreground">
                {analysis.healthScore >= 80 && 'Excellent! Your meal is well-balanced.'}
                {analysis.healthScore >= 60 && analysis.healthScore < 80 && 'Good! Some areas could be improved.'}
                {analysis.healthScore < 60 && 'Consider adding more variety and nutrients.'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Analysis Info */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Analyzed on:</span>
                <span className="ml-2 text-muted-foreground">
                  {new Date(analysis.analyzedAt).toLocaleString()}
                </span>
              </div>
              {analysis.mealPlanId && (
                <div>
                  <span className="font-medium">Meal Plan:</span>
                  <span className="ml-2 text-muted-foreground">
                    {mealPlans.find(mp => mp.id === analysis.mealPlanId)?.name || 'Unknown'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderHistory = () => {
    if (history.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Previous Analyses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{item.mealPlanId ? 'Meal Plan Analysis' : 'Meal Analysis'}</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {new Date(item.analyzedAt).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg font-bold text-primary">{item.healthScore}/100</div>
                <div className="text-sm text-muted-foreground">
                  {item.totalCalories} calories
                </div>
                <div className="flex gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">
                    P: {item.protein}g
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    C: {item.carbohydrates}g
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    F: {item.fat}g
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meal-plan">Analyze Meal Plan</Label>
              <Select value={selectedMealPlanId} onValueChange={setSelectedMealPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a meal plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No meal plan selected</SelectItem>
                  {mealPlans.map((mealPlan) => (
                    <SelectItem key={mealPlan.id} value={mealPlan.id}>
                      {mealPlan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="meals">Or Enter Meals Manually</Label>
              <Textarea
                id="meals"
                placeholder="Describe the meals you want to analyze (e.g., 'Grilled chicken with rice and vegetables')"
                value={meals}
                onChange={(e) => setMeals(e.target.value)}
                disabled={!!selectedMealPlanId}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={analyzeNutrition} disabled={loading || (!selectedMealPlanId && !meals.trim())}>
              {loading ? 'Analyzing...' : 'Analyze Nutrition'}
            </Button>
            <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? 'Hide History' : 'Show History'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Section */}
      {showHistory && renderHistory()}

      {/* Analysis Results */}
      {analysis && renderAnalysisResults()}

      {/* Instructions */}
      {!analysis && !showHistory && (
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                • <strong>Select a meal plan:</strong> Choose from your existing meal plans to analyze their nutritional content
              </p>
              <p>
                • <strong>Manual input:</strong> Describe the meals you want to analyze in detail
              </p>
              <p>
                • <strong>Get insights:</strong> Receive detailed nutritional breakdown, health scores, and AI-powered recommendations
              </p>
              <p>
                • <strong>Track progress:</strong> View your nutrition analysis history to monitor your dietary patterns
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
