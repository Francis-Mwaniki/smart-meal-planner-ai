import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { people, budget, dietType, allergies, cookingTime } = body

    // Simulate AI meal plan generation
    // In a real implementation, this would call OpenAI API or similar
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate processing time

    const sampleMealPlan = {
      id: Date.now(),
      meals: [
        {
          day: "Monday",
          breakfast: "Greek Yogurt Parfait",
          lunch: "Mediterranean Quinoa Bowl",
          dinner: "Grilled Chicken with Roasted Vegetables",
          calories: 1080,
        },
        {
          day: "Tuesday",
          breakfast: "Avocado Toast with Poached Egg",
          lunch: "Asian Lettuce Wraps",
          dinner: "Salmon with Sweet Potato",
          calories: 990,
        },
        {
          day: "Wednesday",
          breakfast: "Smoothie Bowl",
          lunch: "Caprese Salad with Chicken",
          dinner: "Vegetarian Stir Fry",
          calories: 1050,
        },
        {
          day: "Thursday",
          breakfast: "Greek Yogurt Parfait",
          lunch: "Thai Green Curry",
          dinner: "Grilled Chicken with Roasted Vegetables",
          calories: 1120,
        },
        {
          day: "Friday",
          breakfast: "Avocado Toast with Poached Egg",
          lunch: "Mediterranean Quinoa Bowl",
          dinner: "Salmon with Sweet Potato",
          calories: 1190,
        },
        {
          day: "Saturday",
          breakfast: "Smoothie Bowl",
          lunch: "Asian Lettuce Wraps",
          dinner: "Thai Green Curry",
          calories: 990,
        },
        {
          day: "Sunday",
          breakfast: "Greek Yogurt Parfait",
          lunch: "Caprese Salad with Chicken",
          dinner: "Vegetarian Stir Fry",
          calories: 1050,
        },
      ],
      shoppingList: [
        "Greek yogurt (32 oz)",
        "Mixed berries (2 lbs)",
        "Granola (1 box)",
        "Honey (1 jar)",
        "Quinoa (2 lbs)",
        "Cherry tomatoes (2 lbs)",
        "Cucumber (4 pieces)",
        "Red onion (2 pieces)",
        "Feta cheese (8 oz)",
        "Olive oil (1 bottle)",
        "Lemons (6 pieces)",
        "Chicken breast (2 lbs)",
        "Broccoli (3 heads)",
        "Bell peppers (6 pieces)",
        "Zucchini (4 pieces)",
        "Whole grain bread (1 loaf)",
        "Avocados (6 pieces)",
        "Eggs (1 dozen)",
        "Ground turkey (1 lb)",
        "Butter lettuce (2 heads)",
        "Water chestnuts (2 cans)",
        "Green onions (1 bunch)",
        "Soy sauce (1 bottle)",
        "Sesame oil (1 bottle)",
        "Fresh ginger (1 piece)",
        "Garlic (2 bulbs)",
        "Salmon fillets (1.5 lbs)",
        "Sweet potatoes (4 large)",
        "Asparagus (2 bunches)",
        "Fresh dill (1 package)",
      ],
      totalCost: Number.parseFloat(budget) * 0.85, // Use 85% of budget
      avgCalories: 1067,
      preferences: {
        people: Number.parseInt(people),
        budget: Number.parseFloat(budget),
        dietType,
        allergies,
        cookingTime: Number.parseInt(cookingTime),
      },
    }

    return NextResponse.json(sampleMealPlan)
  } catch (error) {
    console.error("Error generating meal plan:", error)
    return NextResponse.json({ error: "Failed to generate meal plan" }, { status: 500 })
  }
}
