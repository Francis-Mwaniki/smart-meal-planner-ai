-- Insert sample recipes
INSERT INTO recipes (name, description, ingredients, instructions, prep_time, cook_time, servings, calories_per_serving, diet_tags, difficulty_level, image_url) VALUES
('Greek Yogurt Parfait', 'A healthy and delicious breakfast parfait with Greek yogurt, berries, and granola', 
 '{"Greek yogurt": "1 cup", "Mixed berries": "1/2 cup", "Granola": "1/4 cup", "Honey": "1 tbsp"}',
 'Layer Greek yogurt, berries, and granola in a glass. Drizzle with honey and serve immediately.',
 5, 0, 1, 280, ARRAY['vegetarian', 'gluten-free'], 'easy', '/placeholder.svg?height=300&width=400'),

('Mediterranean Quinoa Bowl', 'A nutritious bowl packed with quinoa, vegetables, and Mediterranean flavors',
 '{"Quinoa": "1 cup", "Cherry tomatoes": "1 cup", "Cucumber": "1 medium", "Red onion": "1/4 cup", "Feta cheese": "1/4 cup", "Olive oil": "2 tbsp", "Lemon juice": "2 tbsp", "Oregano": "1 tsp"}',
 'Cook quinoa according to package directions. Dice vegetables and combine with cooked quinoa. Whisk olive oil, lemon juice, and oregano. Toss with quinoa mixture and top with feta.',
 15, 15, 2, 420, ARRAY['vegetarian', 'mediterranean'], 'easy', '/placeholder.svg?height=300&width=400'),

('Grilled Chicken with Roasted Vegetables', 'Lean protein with colorful roasted vegetables',
 '{"Chicken breast": "4 oz", "Broccoli": "1 cup", "Bell peppers": "1 cup", "Zucchini": "1 medium", "Olive oil": "2 tbsp", "Garlic": "2 cloves", "Herbs": "1 tsp"}',
 'Season chicken and grill for 6-8 minutes per side. Toss vegetables with olive oil and garlic, roast at 425°F for 20 minutes. Serve together.',
 10, 25, 1, 380, ARRAY['high-protein', 'low-carb'], 'medium', '/placeholder.svg?height=300&width=400'),

('Avocado Toast with Poached Egg', 'A trendy and nutritious breakfast option',
 '{"Whole grain bread": "2 slices", "Avocado": "1 large", "Eggs": "2 large", "Lemon juice": "1 tbsp", "Salt": "to taste", "Pepper": "to taste", "Red pepper flakes": "pinch"}',
 'Toast bread. Mash avocado with lemon juice, salt, and pepper. Poach eggs in simmering water for 3-4 minutes. Top toast with avocado and poached egg.',
 10, 8, 1, 320, ARRAY['vegetarian', 'high-protein'], 'medium', '/placeholder.svg?height=300&width=400'),

('Asian Lettuce Wraps', 'Light and flavorful lettuce wraps with Asian-inspired filling',
 '{"Ground turkey": "1 lb", "Butter lettuce": "1 head", "Water chestnuts": "1 can", "Green onions": "3 stalks", "Soy sauce": "3 tbsp", "Sesame oil": "1 tbsp", "Ginger": "1 tbsp", "Garlic": "2 cloves"}',
 'Cook ground turkey with garlic and ginger. Add water chestnuts, soy sauce, and sesame oil. Serve in lettuce cups topped with green onions.',
 15, 12, 4, 220, ARRAY['low-carb', 'high-protein'], 'easy', '/placeholder.svg?height=300&width=400'),

('Salmon with Sweet Potato', 'Omega-3 rich salmon with roasted sweet potato',
 '{"Salmon fillet": "6 oz", "Sweet potato": "1 large", "Asparagus": "1 bunch", "Olive oil": "2 tbsp", "Lemon": "1 whole", "Dill": "1 tbsp", "Salt": "to taste", "Pepper": "to taste"}',
 'Roast sweet potato at 400°F for 25 minutes. Season salmon and bake for 12-15 minutes. Steam asparagus for 5 minutes. Serve with lemon and dill.',
 10, 25, 1, 450, ARRAY['high-protein', 'omega-3'], 'medium', '/placeholder.svg?height=300&width=400'),

('Smoothie Bowl', 'A refreshing and nutritious smoothie bowl topped with fresh fruits',
 '{"Frozen berries": "1 cup", "Banana": "1 large", "Greek yogurt": "1/2 cup", "Almond milk": "1/4 cup", "Granola": "1/4 cup", "Fresh berries": "1/4 cup", "Coconut flakes": "1 tbsp"}',
 'Blend frozen berries, banana, yogurt, and almond milk until thick. Pour into bowl and top with granola, fresh berries, and coconut flakes.',
 8, 0, 1, 350, ARRAY['vegetarian', 'antioxidant-rich'], 'easy', '/placeholder.svg?height=300&width=400'),

('Caprese Salad with Chicken', 'Classic Caprese salad enhanced with grilled chicken',
 '{"Chicken breast": "4 oz", "Fresh mozzarella": "4 oz", "Tomatoes": "2 large", "Fresh basil": "1/4 cup", "Balsamic glaze": "2 tbsp", "Olive oil": "2 tbsp", "Salt": "to taste", "Pepper": "to taste"}',
 'Grill seasoned chicken breast. Slice tomatoes and mozzarella. Arrange with basil leaves, add sliced chicken. Drizzle with olive oil and balsamic glaze.',
 15, 10, 1, 380, ARRAY['high-protein', 'mediterranean'], 'easy', '/placeholder.svg?height=300&width=400'),

('Vegetarian Stir Fry', 'Colorful vegetable stir fry with tofu and Asian flavors',
 '{"Firm tofu": "8 oz", "Mixed vegetables": "3 cups", "Soy sauce": "3 tbsp", "Sesame oil": "1 tbsp", "Garlic": "3 cloves", "Ginger": "1 tbsp", "Brown rice": "1 cup cooked", "Green onions": "2 stalks"}',
 'Press and cube tofu. Stir fry tofu until golden. Add vegetables, garlic, and ginger. Stir fry for 5-7 minutes. Add soy sauce and sesame oil. Serve over rice.',
 15, 12, 2, 320, ARRAY['vegetarian', 'vegan', 'high-protein'], 'medium', '/placeholder.svg?height=300&width=400'),

('Thai Green Curry', 'Aromatic and spicy Thai curry with vegetables and coconut milk',
 '{"Green curry paste": "2 tbsp", "Coconut milk": "1 can", "Chicken thigh": "1 lb", "Thai eggplant": "1 cup", "Bell peppers": "1 cup", "Thai basil": "1/4 cup", "Fish sauce": "2 tbsp", "Brown sugar": "1 tbsp", "Jasmine rice": "1 cup cooked"}',
 'Cook curry paste in pan for 1 minute. Add coconut milk and bring to simmer. Add chicken and cook 10 minutes. Add vegetables and simmer 8 minutes. Season with fish sauce and sugar. Serve over rice with basil.',
 20, 25, 4, 420, ARRAY['spicy', 'thai', 'coconut'], 'medium', '/placeholder.svg?height=300&width=400');

-- Insert sample user (for demo purposes)
INSERT INTO users (email, name, password_hash) VALUES
('demo@smartmeal.ai', 'Demo User', '$2b$10$example_hash_here');

-- Insert sample user preferences
INSERT INTO user_preferences (user_id, diet_type, allergies, budget_weekly, people_count, max_cooking_time) VALUES
(1, 'balanced', ARRAY['nuts'], 75.00, 2, 45);
