/*
RECIPE DATA MODULE
==================

This JavaScript file contains all recipe data for the Digital Cookbook.
It provides a centralized data store with structured recipe information.

CONTENTS OUTLINE:
1. Recipe Data Structure - Complete recipe objects with all properties
2. Data Organization - Array of recipe objects for easy iteration
3. Recipe Properties - Standardized structure for each recipe

RECIPE OBJECT STRUCTURE:
Each recipe contains the following properties:
- title: String - Display name of the recipe
- time: String - Total cooking/preparation time
- image: String - Base64 encoded SVG image or image URL
- tags: Array - Category tags for filtering and display
- difficulty: String - Star rating (★☆☆☆☆ format)
- timeline: Array - Cooking steps with timing information
  - step: String - Name of the cooking phase
  - time: String - Duration for this step
- ingredients: Array - List of ingredient objects with separate components
  - quantity: String - Amount/number (e.g., "2¼", "1", "¾")
  - unit: String - Measurement unit (e.g., "cups", "tsp", "large")
  - ingredient: String - Ingredient name (e.g., "all-purpose flour", "eggs")
- instructions: Array - Step-by-step cooking instructions

USAGE:
- Import this file before main.js
- Access recipes using: recipes[index]
- Get recipe count using: recipes.length
- Loop through recipes using: recipes.forEach() or for...of

ADDING NEW RECIPES:
To add a new recipe, create a new object following the existing structure
and add it to the recipes array. Update the dropdown options in index.html
to include the new recipe.

SVG IMAGES:
The images are base64-encoded SVG graphics for consistent display.
Replace with actual image URLs or base64-encoded photos as needed.

INGREDIENT DATA STRUCTURE:
Each ingredient is now an object with three properties:
- quantity: The numeric amount (can include fractions like "2¼")
- unit: The measurement unit (cups, teaspoons, etc.)
- ingredient: The actual ingredient name
This allows for better data manipulation, searching, and display formatting.
*/

// Main recipe data array - contains all available recipes
const recipes = [
    // Recipe 1: Chocolate Chip Cookies
    {
        title: "Chocolate Chip Cookies",
        time: "45 mins",
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNURDIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjkwIiByPSI0MCIgZmlsbD0iI0QyNjkxRSIvPgo8Y2lyY2xlIGN4PSIxMzAiIGN5PSI3NSIgcj0iNCIgZmlsbD0iIzY1NDMyMSIvPgo8Y2lyY2xlIGN4PSIxNzAiIGN5PSI4NSIgcj0iNCIgZmlsbD0iIzY1NDMyMSIvPgo8Y2lyY2xlIGN4PSIxNDAiIGN5PSIxMDUiIHI9IjMiIGZpbGw9IiM2NTQzMjEiLz4KPHN2ZyB4PSIxMzAiIHk9IjcwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiPgo8dGV4dCB4PSIyMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNSIgZmlsbD0iIzY1NDMyMSI+8J+NqjwvdGV4dD4KPC9zdmc+Cjx0ZXh0IHg9IjE1MCIgeT0iMTYwIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM4QjQ1MTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc3R5bGU9Iml0YWxpYyI+RnJlc2hseSBCYWtlZCBDb29raWVzPC90ZXh0Pgo8L3N2Zz4K",
        tags: ["Dessert", "Baking", "Sweet"],
        difficulty: "★★☆☆☆",
        timeline: [
            { step: "Prep", time: "15 min" },
            { step: "Bake", time: "12 min" },
            { step: "Cool", time: "10 min" }
        ],
        // Updated ingredients structure with separate quantity, unit, and ingredient components
        ingredients: [
            { quantity: "2¼", unit: "cups", ingredient: "all-purpose flour" },
            { quantity: "1", unit: "tsp", ingredient: "baking soda" },
            { quantity: "1", unit: "tsp", ingredient: "salt" },
            { quantity: "1", unit: "cup", ingredient: "butter, softened" },
            { quantity: "¾", unit: "cup", ingredient: "granulated sugar" },
            { quantity: "¾", unit: "cup", ingredient: "packed brown sugar" },
            { quantity: "2", unit: "large", ingredient: "eggs" },
            { quantity: "2", unit: "tsp", ingredient: "vanilla extract" },
            { quantity: "2", unit: "cups", ingredient: "chocolate chips" }
        ],
        instructions: [
            "Preheat oven to 375°F. Line baking sheets with parchment paper.",
            "In a bowl, whisk together flour, baking soda, and salt.",
            "In a large bowl, cream butter and both sugars until light and fluffy.",
            "Beat in eggs and vanilla extract until well combined.",
            "Gradually mix in flour mixture until just combined. Stir in chocolate chips.",
            "Drop rounded tablespoons of dough onto prepared baking sheets.",
            "Bake for 9-11 minutes until golden brown. Cool on baking sheet for 5 minutes."
        ]
    },

    // Recipe 2: Homemade Pizza
    {
        title: "Homemade Pizza",
        time: "2 hours",
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNURDIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjkwIiByPSI2MCIgZmlsbD0iI0ZGRDcwMCIvPgo8Y2lyY2xlIGN4PSIxMzAiIGN5PSI3NSIgcj0iOCIgZmlsbD0iI0ZGNDUwMCIvPgo8Y2lyY2xlIGN4PSIxNzAiIGN5PSI4NSIgcj0iNiIgZmlsbD0iI0ZGNDUwMCIvPgo8Y2lyY2xlIGN4PSIxNDAiIGN5PSIxMDUiIHI9IjciIGZpbGw9IiNGRjQ1MDAiLz4KPHN2ZyB4PSIxMjAiIHk9IjcwIiB3aWR0aD0iNjAiIGhlaWdodD0iNDAiPgo8dGV4dCB4PSIzMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNSIgZmlsbD0iI0ZGNDUwMCI+8J+NlTwvdGV4dD4KPC9zdmc+Cjx0ZXh0IHg9IjE1MCIgeT0iMTYwIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM4QjQ1MTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc3R5bGU9Iml0YWxpYyI+SG9tZW1hZGUgUGl6emE8L3RleHQ+Cjwvc3ZnPgo=",
        tags: ["Dinner", "Italian", "Comfort Food"],
        difficulty: "★★★☆☆",
        timeline: [
            { step: "Dough", time: "1 hr" },
            { step: "Prep", time: "30 min" },
            { step: "Bake", time: "15 min" }
        ],
        // Updated ingredients structure with separate quantity, unit, and ingredient components
        ingredients: [
            { quantity: "3", unit: "cups", ingredient: "all-purpose flour" },
            { quantity: "1", unit: "tsp", ingredient: "salt" },
            { quantity: "1", unit: "tbsp", ingredient: "sugar" },
            { quantity: "1", unit: "packet", ingredient: "active dry yeast" },
            { quantity: "1", unit: "cup", ingredient: "warm water" },
            { quantity: "2", unit: "tbsp", ingredient: "olive oil" },
            { quantity: "1", unit: "cup", ingredient: "pizza sauce" },
            { quantity: "2", unit: "cups", ingredient: "mozzarella cheese" },
            { quantity: "", unit: "", ingredient: "Toppings of choice" }
        ],
        instructions: [
            "Dissolve yeast in warm water with sugar. Let stand for 5 minutes until foamy.",
            "In a large bowl, combine flour and salt. Add yeast mixture and olive oil.",
            "Mix until a dough forms, then knead for 8-10 minutes until smooth.",
            "Place in oiled bowl, cover, and let rise for 1 hour until doubled.",
            "Punch down dough and roll out on floured surface to desired thickness.",
            "Transfer to pizza stone or baking sheet. Add sauce and toppings.",
            "Bake at 475°F for 12-15 minutes until crust is golden and cheese is bubbly."
        ]
    },

    // Recipe 3: Beef Stew
    {
        title: "Beef Stew",
        time: "3 hours",
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNURDIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjkwIiByPSI1MCIgZmlsbD0iIzhCNDUxMyIvPgo8Y2lyY2xlIGN4PSIxMzUiIGN5PSI4MCIgcj0iNiIgZmlsbD0iI0ZGNjM0NyIvPgo8Y2lyY2xlIGN4PSIxNjUiIGN5PSI4NSIgcj0iNSIgZmlsbD0iI0ZGNjM0NyIvPgo8Y2lyY2xlIGN4PSIxNDUiIGN5PSIxMDAiIHI9IjQiIGZpbGw9IiNGRkE1MDAiLz4KPHN2ZyB4PSIxMjUiIHk9IjcwIiB3aWR0aD0iNTAiIGhlaWdodD0iNDAiPgo8dGV4dCB4PSIyNSIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNSIgZmlsbD0iI0ZGRkZGRiI+8J+NsjwvdGV4dD4KPC9zdmc+Cjx0ZXh0IHg9IjE1MCIgeT0iMTYwIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM4QjQ1MTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc3R5bGU9Iml0YWxpYyI+SGVhcnR5IEJlZWYgU3RldzwvdGV4dD4KPC9zdmc+",
        tags: ["Dinner", "Comfort Food", "Slow Cook"],
        difficulty: "★★★★☆",
        timeline: [
            { step: "Prep", time: "30 min" },
            { step: "Brown", time: "15 min" },
            { step: "Simmer", time: "2 hrs" }
        ],
        // Updated ingredients structure with separate quantity, unit, and ingredient components
        ingredients: [
            { quantity: "2", unit: "lbs", ingredient: "beef chuck, cubed" },
            { quantity: "3", unit: "tbsp", ingredient: "flour" },
            { quantity: "2", unit: "tbsp", ingredient: "oil" },
            { quantity: "1", unit: "", ingredient: "onion, diced" },
            { quantity: "3", unit: "", ingredient: "carrots, sliced" },
            { quantity: "3", unit: "", ingredient: "potatoes, cubed" },
            { quantity: "4", unit: "cups", ingredient: "beef broth" },
            { quantity: "2", unit: "tsp", ingredient: "thyme" },
            { quantity: "", unit: "", ingredient: "Salt and pepper to taste" }
        ],
        instructions: [
            "Season beef with salt and pepper, then coat with flour.",
            "Heat oil in a large pot and brown beef on all sides.",
            "Add onion and cook until softened, about 5 minutes.",
            "Add broth, thyme, and bring to a boil.",
            "Reduce heat, cover, and simmer for 1.5 hours.",
            "Add carrots and potatoes, simmer for 30 minutes more.",
            "Season with salt and pepper before serving."
        ]
    }
];

// Export recipes for use in other modules (if using ES6 modules)
// Uncomment the line below if using ES6 modules:
// export { recipes };