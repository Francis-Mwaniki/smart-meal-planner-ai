import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Brain, Calendar, ShoppingCart, Users, ChefHat, Sparkles, Rocket, Target } from "lucide-react"
import Link from "next/link"

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_50%)]"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.15),transparent_50%)]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.15),transparent_50%)]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.08),transparent_60%)]"></div>
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-black"></div>
              </div>
              <span className="text-2xl font-playfair font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                SmartMeal AI
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10 font-josefin">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-josefin px-6 py-2 rounded-xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-black"></div>
        <div className="relative container mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Badge className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white border-purple-400/50 px-6 py-3 rounded-full font-josefin shadow-lg">
              <Sparkles className="h-4 w-4 mr-2" />
              Railway Hackathon 2025 Winner
            </Badge>
          </div>

          <h1 className="text-6xl md:text-8xl font-playfair font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-lg">
              AI-Powered
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
              Meal Planning
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed font-montserrat drop-shadow-md">
            Transform your dining experience with intelligent meal recommendations, automated shopping lists, and
            personalized nutrition tracking powered by advanced AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-10 py-4 text-xl rounded-2xl font-josefin shadow-2xl shadow-purple-500/25"
              >
                Start Planning
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-10 py-4 text-xl rounded-2xl font-josefin bg-transparent backdrop-blur-sm"
              >
                View Demo
              </Button>
            </Link>
          </div>

          {/* Floating Elements */}
          <div className="relative">
            <div className="absolute -top-20 -left-20 h-40 w-40 bg-purple-500/30 rounded-full blur-3xl animate-float shadow-2xl shadow-purple-500/20"></div>
            <div className="absolute -top-10 -right-20 h-32 w-32 bg-pink-500/30 rounded-full blur-3xl animate-float shadow-2xl shadow-pink-500/20" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 h-24 w-24 bg-orange-500/30 rounded-full blur-2xl animate-float shadow-2xl shadow-orange-500/20" style={{animationDelay: '4s'}}></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto mt-20">
            <div className="text-center group">
              <div className="text-4xl font-playfair font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">10K+</div>
              <div className="text-gray-400 font-montserrat">Meals Generated</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-playfair font-bold text-white mb-3 group-hover:text-pink-400 transition-colors">95%</div>
              <div className="text-gray-400 font-montserrat">User Satisfaction</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-playfair font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">2.5K</div>
              <div className="text-gray-400 font-montserrat">Active Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black"></div>
        <div className="relative container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-playfair font-bold text-white mb-6">Intelligent Features</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-montserrat">
              Powered by advanced AI and built for the modern lifestyle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-purple-500/30 transition-all duration-500 group hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
              <CardHeader className="p-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/25 group-hover:shadow-2xl group-hover:shadow-purple-500/50">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-playfair text-white mb-4 group-hover:text-purple-300 transition-colors">AI Recommendations</CardTitle>
                <CardDescription className="text-gray-300 font-montserrat text-lg leading-relaxed">
                  Get personalized meal suggestions based on your preferences, dietary restrictions, and nutritional
                  goals using advanced AI.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group hover:scale-105">
              <CardHeader className="p-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/25">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-playfair text-white mb-4">Smart Planning</CardTitle>
                <CardDescription className="text-gray-300 font-montserrat text-lg leading-relaxed">
                  Automatically generate weekly meal plans that fit your schedule, budget, and cooking preferences.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group hover:scale-105">
              <CardHeader className="p-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/25">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-playfair text-white mb-4">Auto Shopping Lists</CardTitle>
                <CardDescription className="text-gray-300 font-montserrat text-lg leading-relaxed">
                  Generate optimized shopping lists with ingredient quantities and cost estimates for maximum
                  efficiency.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group hover:scale-105">
              <CardHeader className="p-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/25">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-playfair text-white mb-4">Family Friendly</CardTitle>
                <CardDescription className="text-gray-300 font-montserrat text-lg leading-relaxed">
                  Plan meals for the whole family with individual dietary preferences and portion control.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group hover:scale-105">
              <CardHeader className="p-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/25">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-playfair text-white mb-4">Quick Deploy</CardTitle>
                <CardDescription className="text-gray-300 font-montserrat text-lg leading-relaxed">
                  One-click deployment on Railway with our pre-configured template and database setup.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group hover:scale-105">
              <CardHeader className="p-8">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/25">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-playfair text-white mb-4">Premium Experience</CardTitle>
                <CardDescription className="text-gray-300 font-montserrat text-lg leading-relaxed">
                  Beautiful, responsive interface with smart notifications and seamless user experience.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-purple-950/30 via-black to-pink-950/30">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl font-playfair font-bold text-white mb-16">Built with Modern Tech</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="h-20 w-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="text-white font-bold text-lg">N</div>
              </div>
              <div className="text-gray-300 font-montserrat">Next.js 14</div>
            </div>
            <div className="text-center group">
              <div className="h-20 w-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="text-white font-bold text-lg">AI</div>
              </div>
              <div className="text-gray-300 font-montserrat">OpenRouter AI</div>
            </div>
            <div className="text-center group">
              <div className="h-20 w-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="text-white font-bold text-lg">R</div>
              </div>
              <div className="text-gray-300 font-montserrat">Railway</div>
            </div>
            <div className="text-center group">
              <div className="h-20 w-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="text-white font-bold text-lg">P</div>
              </div>
              <div className="text-gray-300 font-montserrat">PostgreSQL</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-playfair font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                SmartMeal AI
              </span>
            </div>
            <div className="text-gray-400 font-montserrat text-center md:text-right">
              Built for Railway Hackathon 2025 • Powered by Next.js & AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
