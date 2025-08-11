/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: any
    }
  }>
}

export interface MealPlanRequest {
  dietType?: string
  allergies: string[]
  budgetWeekly?: number
  peopleCount: number
  maxCookingTime: number
  cuisineTypes: string[]
  healthGoals: string[]
  mealCount?: number // breakfast, lunch, dinner, snacks
  startDate?: string
}

export interface RecipeRecommendationRequest {
  dietType?: string
  allergies: string[]
  cuisineTypes: string[]
  maxCookingTime: number
  mealType: string
  difficultyLevel?: string
  maxCalories?: number
  ingredients?: string[] // available ingredients
}

export interface ShoppingListRequest {
  mealPlanId: string
  items: Array<{
    name: string
    amount: string
    category: string
    estimatedCost: number
    purchased: boolean
  }>
}

export class OpenRouterClient {
  private apiKey: string
  private baseUrl = "https://openrouter.ai/api/v1"
  private model = "mistralai/mistral-small-3.2-24b-instruct:free" // Using Mixtral model

  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("OpenRouter API key is required. Please set the OPENROUTER_API_KEY environment variable.")
    }
    this.apiKey = apiKey
  }

  // Remove markdown fences and extract a balanced JSON object/array, then parse
  private sanitizeAndParseJson(raw: string): any {
    if (typeof raw !== "string") return raw

    const stripped = raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim()

    // Try direct parse first
    try {
      return JSON.parse(stripped)
    } catch {}

    // Extract first balanced JSON object/array
    const balanced = this.extractFirstBalancedJson(stripped)
    if (balanced) {
      try {
        return JSON.parse(balanced)
      } catch {}
    }

    // As a last resort, try removing trailing commas
    const withoutTrailingCommas = (balanced ?? stripped)
      .replace(/,\s*([}\]])/g, "$1")
    try {
      return JSON.parse(withoutTrailingCommas)
    } catch (err) {
      throw new Error(`Unable to parse JSON from model response: ${(err as Error).message}`)
    }
  }

  // Finds the first balanced {...} or [...] block in a string
  private extractFirstBalancedJson(text: string): string | null {
    const openers = new Set(["{", "["])
    const closers: Record<string, string> = {"}": "{", "]": "["}
    const stack: string[] = []
    let startIndex = -1

    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      if (openers.has(ch)) {
        if (stack.length === 0) startIndex = i
        stack.push(ch)
      } else if (ch === "}" || ch === "]") {
        if (stack.length === 0) continue
        const expected = closers[ch]
        const last = stack[stack.length - 1]
        if (last === expected) {
          stack.pop()
          if (stack.length === 0 && startIndex !== -1) {
            return text.slice(startIndex, i + 1)
          }
        }
      }
    }
    return null
  }

  async generateMealPlan(preferences: MealPlanRequest) {
    console.log("Generating meal plan with OpenRouter API key:", this.apiKey ? `${this.apiKey.substring(0, 8)}...` : "NOT SET")
    
    // Add a small delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const prompt = `Generate a 3-day meal plan for ${preferences.peopleCount} people.
    
    Diet: ${preferences.dietType || "balanced"}
    Allergies: ${preferences.allergies.join(", ") || "none"}
    Budget: $${preferences.budgetWeekly || 100}/week
    Max cooking time: ${preferences.maxCookingTime} min
    Cuisines: ${preferences.cuisineTypes.join(", ") || "any"}
    Health goals: ${preferences.healthGoals.join(", ") || "maintenance"}
    
    Include breakfast, lunch, and dinner only (no snacks to reduce complexity).
    Return ONLY a JSON object with this structure:
    {
      "mealPlan": [
        {
          "day": "Day 1",
          "date": "${preferences.startDate || "2024-01-01"}",
          "meals": {
            "breakfast": {
              "name": "Recipe Name",
              "description": "Brief description",
              "ingredients": {"ingredient": "amount"},
              "instructions": ["step 1", "step 2"],
              "prepTime": 10,
              "cookTime": 15,
              "calories": 350,
              "cost": 4.50,
              "difficulty": "easy",
              "dietTags": ["vegetarian"]
            }
          }
        }
      ]
    }`

    try {
      console.log("Making request to OpenRouter API...")
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: "You are a professional nutritionist and meal planning expert with 20+ years of experience. You specialize in creating personalized, practical, and delicious meal plans that meet specific dietary and budgetary requirements. Always respond with valid, well-structured JSON only. Ensure all recipes are realistic, achievable, and nutritionally balanced.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      })

      console.log("OpenRouter API response status:", response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("OpenRouter API error response:", errorText)
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
      }

      const data: OpenRouterResponse = await response.json()
      console.log("Full OpenRouter response data:", JSON.stringify(data, null, 2))
      
      const content = data.choices[0]?.message?.content

      if (!content) {
        console.error("No content in OpenRouter response:", data)
        throw new Error("No content received from OpenRouter")
      }

      // Check if the response is truncated (incomplete JSON)
      if (typeof content === 'string' && content.length > 0) {
        const trimmedContent = content.trim()
        const lastChar = trimmedContent.charAt(trimmedContent.length - 1)
        
        // If the response doesn't end with a proper JSON closing, it's likely truncated
        if (!trimmedContent.endsWith('}') && !trimmedContent.endsWith(']')) {
          console.warn("Response appears to be truncated. Last character:", lastChar)
          console.warn("Content length:", content.length)
          console.warn("Full truncated content:", content)
          
          // Try to retry with a shorter prompt to get a complete response
          console.log("Attempting to retry with simplified prompt...")
          
          // Create a much simpler prompt for retry
          const retryPrompt = `Create a simple 3-day meal plan for ${preferences.peopleCount} people.
          Diet: ${preferences.dietType || "balanced"}
          Allergies: ${preferences.allergies.join(", ") || "none"}
          
          Return ONLY this JSON structure:
          {"mealPlan":[{"day":"Day 1","date":"${preferences.startDate || "2024-01-01"}","meals":{"breakfast":{"name":"Recipe","description":"Description","ingredients":{"item":"amount"},"instructions":["step1"],"prepTime":10,"cookTime":15,"calories":300,"cost":3.00,"difficulty":"easy","dietTags":["balanced"]}}}]}`
          
          // Make a retry request with the simplified prompt
          const retryResponse = await fetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: this.model,
              messages: [
                {
                  role: "system",
                  content: "You are a meal planning expert. Return ONLY valid JSON, no other text.",
                },
                {
                  role: "user",
                  content: retryPrompt,
                },
              ],
              temperature: 0.3,
              max_tokens: 4000,
            }),
          })
          
          if (!retryResponse.ok) {
            throw new Error("Retry request failed")
          }
          
          const retryData = await retryResponse.json()
          const retryContent = retryData.choices[0]?.message?.content
          if (!retryContent) throw new Error("Retry response had no content")

          try {
            const retryMealPlanData = this.sanitizeAndParseJson(String(retryContent))
            console.log("Successfully parsed retry response")
            return retryMealPlanData
          } catch (retryParseError) {
            console.error("Failed to parse retry response:", retryParseError)
            throw new Error("Both original and retry responses failed to parse")
          }
        }
      }

      // Log the raw response for debugging
      if (typeof content === 'string') {
        console.log("OpenRouter raw response:", content.substring(0, 500) + "...")
      }

      // The content might be a string that needs to be parsed, or it might already be an object
      let mealPlanData: any
      
      console.log("Content type:", typeof content)
      console.log("Content length:", typeof content === 'string' ? content.length : 'N/A')
      
      if (typeof content === 'string') {
        mealPlanData = this.sanitizeAndParseJson(content)
        console.log("Successfully parsed model content")
      } else {
        // Content is already an object
        mealPlanData = content
        console.log("Content is already a parsed object")
      }

      // Log the full structure for debugging
      console.log("Full meal plan data structure:", JSON.stringify(mealPlanData, null, 2))

      // Validate the parsed data structure
      if (!mealPlanData || typeof mealPlanData !== 'object') {
        console.error("mealPlanData is not an object:", typeof mealPlanData, mealPlanData)
        throw new Error("Invalid meal plan data structure received")
      }

      // Check if the response has the expected structure or if we need to adapt it
      let finalMealPlanData = mealPlanData
      
      // If the AI returned the meal plan directly without wrapping it in a mealPlan property
      if (mealPlanData.mealPlan && Array.isArray(mealPlanData.mealPlan)) {
        // Standard structure - use as is
        finalMealPlanData = mealPlanData
        console.log("Using standard mealPlan structure")
      } else if (Array.isArray(mealPlanData)) {
        // AI returned array directly - wrap it
        finalMealPlanData = { mealPlan: mealPlanData }
        console.log("Wrapped array response in mealPlan property")
      } else if (mealPlanData.days && Array.isArray(mealPlanData.days)) {
        // AI used 'days' instead of 'mealPlan'
        finalMealPlanData = { mealPlan: mealPlanData.days }
        console.log("Adapted 'days' property to 'mealPlan'")
      } else if (mealPlanData.plan && Array.isArray(mealPlanData.plan)) {
        // AI used 'plan' instead of 'mealPlan'
        finalMealPlanData = { mealPlan: mealPlanData.plan }
        console.log("Adapted 'plan' property to 'mealPlan'")
      } else if (mealPlanData.meals && Array.isArray(mealPlanData.meals)) {
        // AI used 'meals' instead of 'mealPlan'
        finalMealPlanData = { mealPlan: mealPlanData.meals }
        console.log("Adapted 'meals' property to 'mealPlan'")
      } else {
        // Try to find any array in the response that might be meal plan data
        const possibleArrays = Object.entries(mealPlanData)
          .filter(([key, value]) => Array.isArray(value) && (value as any[]).length > 0)
          .map(([key, value]) => ({ key, value: value as any[], length: (value as any[]).length }))
        
        if (possibleArrays.length > 0) {
          console.log("Found potential meal plan arrays:", possibleArrays)
          // Use the first array that looks like it has meal plan data
          const bestCandidate = possibleArrays.find(({ value }) => 
            value[0] && typeof value[0] === 'object' && 
            ((value[0] as any).meals || (value[0] as any).day || (value[0] as any).date)
          ) || possibleArrays[0]
          
          finalMealPlanData = { mealPlan: bestCandidate.value }
          console.log(`Using '${bestCandidate.key}' property as meal plan with ${bestCandidate.length} items`)
        } else {
          console.error("Unable to find valid meal plan structure in response:", mealPlanData)
          throw new Error("Generated meal plan is missing required structure")
        }
      }

      // Final validation
      if (!finalMealPlanData.mealPlan || !Array.isArray(finalMealPlanData.mealPlan)) {
        console.error("Final meal plan data validation failed:", finalMealPlanData)
        throw new Error("Generated meal plan is missing required structure")
      }

      console.log("Successfully validated meal plan structure with", finalMealPlanData.mealPlan.length, "days")
      return finalMealPlanData
    } catch (error) {
      console.error("Error generating meal plan:", error)
      throw new Error("Failed to generate meal plan")
    }
  }

  async generateRecipeRecommendations(preferences: RecipeRecommendationRequest) {
    const prompt = `Recommend 5 ${preferences.mealType} recipes based on these requirements:
    
    DIETARY REQUIREMENTS:
    - Diet: ${preferences.dietType || "balanced"}
    - Avoid: ${preferences.allergies.join(", ") || "none"}
    - Cuisines: ${preferences.cuisineTypes.join(", ") || "any"}
    - Max cooking time: ${preferences.maxCookingTime} minutes
    - Difficulty level: ${preferences.difficultyLevel || "easy"}
    - Max calories per serving: ${preferences.maxCalories || "unlimited"}
    - Available ingredients: ${preferences.ingredients?.join(", ") || "any"}
    
    REQUIREMENTS:
    - Each recipe should be unique and diverse
    - Include nutritional information
    - Provide realistic cooking times
    - Consider seasonal availability
    - Ensure recipes are achievable for home cooks
    
    Return a JSON array of recipes with this structure:
    [
      {
        "name": "Recipe Name",
        "description": "Brief description",
        "ingredients": {"ingredient": "amount"},
        "instructions": ["step 1", "step 2"],
        "prepTime": 10,
        "cookTime": 15,
        "totalTime": 25,
        "servings": 4,
        "caloriesPerServing": 350,
        "difficulty": "easy",
        "dietTags": ["vegetarian", "gluten-free"],
        "cuisineType": "italian",
        "cost": 4.50,
        "nutrition": {
          "protein": 15,
          "carbs": 45,
          "fat": 12,
          "fiber": 8
        },
        "tips": ["tip 1", "tip 2"]
      }
    ]`

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { 
              role: "system", 
              content: "You are a culinary expert and recipe developer with extensive knowledge of global cuisines, dietary restrictions, and cooking techniques. You create practical, delicious recipes that home cooks can successfully prepare. Always respond with valid, well-structured JSON only." 
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 4000,
        }),
      })

      const data: OpenRouterResponse = await response.json()
      const content = data.choices[0]?.message?.content
      return content || []
    } catch (error) {
      console.error("Error generating recipe recommendations:", error)
      throw new Error("Failed to generate recipe recommendations")
    }
  }

  async generateShoppingListOptimization(request: ShoppingListRequest) {
    const prompt = `Optimize this shopping list for cost efficiency and organization:
    
    CURRENT SHOPPING LIST:
    ${JSON.stringify(request.items, null, 2)}
    
    OPTIMIZATION REQUIREMENTS:
    - Group items by store section (produce, dairy, meat, pantry, etc.)
    - Suggest bulk buying opportunities
    - Identify potential substitutions for expensive items
    - Estimate total cost
    - Provide shopping tips and organization advice
    - Consider seasonal availability and sales
    
    Return a JSON response with this structure:
    {
      "optimizedList": {
        "produce": [{"name": "item", "amount": "amount", "estimatedCost": 2.50, "notes": "Buy organic if on sale"}],
        "dairy": [...],
        "meat": [...],
        "pantry": [...],
        "frozen": [...]
      },
      "totalEstimatedCost": 45.75,
      "costSavings": 12.25,
      "bulkBuyingOpportunities": ["item 1", "item 2"],
      "substitutions": [{"original": "item", "substitution": "alternative", "savings": 3.50}],
      "shoppingTips": ["tip 1", "tip 2"],
      "storeOrganization": "Suggested shopping route and organization"
    }`

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { 
              role: "system", 
              content: "You are a shopping and meal planning expert who specializes in cost optimization, efficient shopping strategies, and smart grocery planning. You help families save money while maintaining healthy eating habits. Always respond with valid, well-structured JSON only." 
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 3000,
        }),
      })

      const data: OpenRouterResponse = await response.json()
      const content = data.choices[0]?.message?.content
      return content || {}
    } catch (error) {
      console.error("Error optimizing shopping list:", error)
      throw new Error("Failed to optimize shopping list")
    }
  }

  async generateNutritionalAnalysis(meals: any[]) {
    const prompt = `Analyze the nutritional content of these meals and provide insights:
    
    MEALS TO ANALYZE:
    ${JSON.stringify(meals, null, 2)}
    
    ANALYSIS REQUIREMENTS:
    - Calculate total daily nutritional values
    - Identify nutritional gaps or excesses
    - Suggest improvements for balance
    - Compare to recommended daily values
    - Provide health insights and recommendations
    
    Return a JSON response with this structure:
    {
      "dailyTotals": {
        "calories": 1850,
        "protein": 120,
        "carbs": 200,
        "fat": 65,
        "fiber": 25,
        "sugar": 45,
        "sodium": 1800
      },
      "recommendedValues": {
        "calories": 2000,
        "protein": 150,
        "carbs": 250,
        "fat": 65,
        "fiber": 28,
        "sugar": 50,
        "sodium": 2300
      },
      "analysis": {
        "gaps": ["fiber", "vitamin D"],
        "excesses": ["sodium"],
        "balance": "good",
        "score": 8.5
      },
      "recommendations": ["recommendation 1", "recommendation 2"],
      "healthInsights": "Overall analysis and health impact assessment"
    }`

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { 
              role: "system", 
              content: "You are a registered dietitian and nutrition expert with advanced knowledge of nutritional science, dietary guidelines, and health optimization. You provide evidence-based nutritional analysis and practical recommendations. Always respond with valid, well-structured JSON only." 
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 3000,
        }),
      })

      const data: OpenRouterResponse = await response.json()
      const content = data.choices[0]?.message?.content
      return content || {}
    } catch (error) {
      console.error("Error analyzing nutrition:", error)
      throw new Error("Failed to analyze nutrition")
    }
  }

  async generateMealVariations(recipe: any, preferences: any) {
    const prompt = `Generate 3 variations of this recipe to accommodate different preferences:
    
    ORIGINAL RECIPE:
    ${JSON.stringify(recipe, null, 2)}
    
    PREFERENCES TO ACCOMMODATE:
    ${JSON.stringify(preferences, null, 2)}
    
    REQUIREMENTS:
    - Maintain the core concept and flavor profile
    - Adapt for different dietary needs
    - Provide ingredient substitutions
    - Adjust cooking methods if needed
    - Keep similar nutritional profiles
    
    Return a JSON response with this structure:
    {
      "variations": [
        {
          "name": "Variation Name",
          "description": "What makes this variation unique",
          "ingredients": {"ingredient": "amount"},
          "instructions": ["step 1", "step 2"],
          "dietTags": ["vegetarian", "gluten-free"],
          "substitutions": {"original": "substitution"},
          "nutritionalChanges": "Brief description of nutritional differences"
        }
      ],
      "tips": ["tip 1", "tip 2"],
      "adaptationNotes": "General guidance for recipe adaptation"
    }`

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { 
              role: "system", 
              content: "You are a creative chef and recipe developer who excels at adapting recipes for different dietary needs while maintaining flavor and quality. You understand ingredient substitutions, cooking techniques, and how to preserve the essence of a dish across variations. Always respond with valid, well-structured JSON only." 
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 3000,
        }),
      })

      const data: OpenRouterResponse = await response.json()
      const content = data.choices[0]?.message?.content
      return content || {}
    } catch (error) {
      console.error("Error generating meal variations:", error)
      throw new Error("Failed to generate meal variations")
    }
  }
}

export const openRouter = (() => {
  const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey || apiKey.trim() === "") {
    console.warn("OpenRouter API key not found. Set OPENROUTER_API_KEY environment variable to enable AI features.")
    return null
  }
  
  try {
    return new OpenRouterClient(apiKey)
  } catch (error) {
    console.error("Failed to initialize OpenRouter client:", error)
    return null
  }
})()
