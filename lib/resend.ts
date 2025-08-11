import { Resend } from "resend"

// Lazy-load Resend client to prevent instantiation during build
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not set")
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const resend = getResendClient()
    const { data, error } = await resend.emails.send({
      from: "SmartMeal AI <noreply@smartmeal.ai>",
      to: [email],
      subject: "Welcome to SmartMeal AI! 🍽️",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0;">SmartMeal AI</h1>
            <p style="color: #6b7280; margin: 5px 0;">AI-Powered Meal Planning</p>
          </div>
          
          <h2 style="color: #1f2937;">Welcome, ${name}! 👋</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for joining SmartMeal AI! We're excited to help you revolutionize your meal planning with the power of artificial intelligence.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">What you can do now:</h3>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li>🎯 Set your dietary preferences and goals</li>
              <li>🤖 Generate AI-powered meal plans</li>
              <li>🛒 Get smart shopping lists</li>
              <li>📊 Track your nutrition and budget</li>
              <li>❤️ Save your favorite recipes</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Planning Meals
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Need help? Reply to this email or visit our support center.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending welcome email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return { success: false, error }
  }
}

export async function sendMealPlanEmail(email: string, name: string, mealPlan: any) {
  try {
    const resend = getResendClient()
    const { data, error } = await resend.emails.send({
      from: "SmartMeal AI <noreply@smartmeal.ai>",
      to: [email],
      subject: "Your New Meal Plan is Ready! 🍽️",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed; text-align: center;">Your Meal Plan is Ready!</h1>
          
          <p>Hi ${name},</p>
          
          <p>Your AI-generated meal plan for the week is ready! Here's a quick overview:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>This Week's Plan:</h3>
            <ul>
              ${mealPlan.mealPlan
                ?.slice(0, 3)
                .map(
                  (day: any) => `
                <li><strong>${day.day}:</strong> ${day.meals.breakfast?.name}, ${day.meals.lunch?.name}, ${day.meals.dinner?.name}</li>
              `,
                )
                .join("")}
              ${mealPlan.mealPlan?.length > 3 ? "<li>...and more!</li>" : ""}
            </ul>
            
            <p><strong>Total Budget:</strong> $${mealPlan.totalCost}</p>
            <p><strong>Daily Calories:</strong> ~${Math.round(mealPlan.totalCalories / 7)}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Full Plan
            </a>
          </div>
        </div>
      `,
    })

    return { success: !error, data, error }
  } catch (error) {
    console.error("Error sending meal plan email:", error)
    return { success: false, error }
  }
}

export async function sendShoppingListEmail(email: string, name: string, shoppingList: any) {
  try {
    const resend = getResendClient()
    const { data, error } = await resend.emails.send({
      from: "SmartMeal AI <noreply@smartmeal.ai>",
      to: [email],
      subject: "Your Shopping List is Ready! 🛒",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7c3aed; text-align: center;">Shopping List Ready!</h1>
          
          <p>Hi ${name},</p>
          
          <p>Your smart shopping list has been generated based on your meal plan:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${Object.entries(shoppingList)
              .map(
                ([category, items]: [string, any]) => `
              <h4 style="color: #7c3aed; text-transform: capitalize;">${category}:</h4>
              <ul>
                ${Object.entries(items)
                  .slice(0, 5)
                  .map(
                    ([item, amount]) => `
                  <li>${item}: ${amount}</li>
                `,
                  )
                  .join("")}
              </ul>
            `,
              )
              .join("")}
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/shopping" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Shopping List
            </a>
          </div>
        </div>
      `,
    })

    return { success: !error, data, error }
  } catch (error) {
    console.error("Error sending shopping list email:", error)
    return { success: false, error }
  }
}
