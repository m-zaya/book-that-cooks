# Digital Cookbook

A beautiful, interactive cookbook interface that presents recipes in a realistic 3D book format. Perfect for displaying cooking recipes with a tactile, book-like experience.

## 📖 Overview

The Digital Cookbook creates an immersive reading experience that mimics a real cookbook. It features a 3D book appearance with page-turning animations, interactive checkboxes for instructions, and a visual cooking timeline.

## ✨ Features

- **3D Book Interface**: Realistic book appearance with page stacks and shadows
- **Interactive Timeline**: Visual cooking timeline showing prep, cooking, and cooling phases
- **Progress Tracking**: Checkboxes for each instruction step with completion styling
- **Recipe Navigation**: Easy browsing between multiple recipes
- **Responsive Design**: Adapts beautifully from desktop to mobile devices
- **Visual Recipe Cards**: Each recipe includes image, tags, difficulty rating, and timing
- **Keyboard Navigation**: Arrow keys for recipe navigation, Ctrl+R to reset checklist

## 🏗️ Project Structure

```
digital-cookbook/
├── index.html          # Main HTML structure and layout
├── styles.css          # Complete styling and responsive design
├── recipes.js          # Recipe data and content management
├── main.js             # Interactive functionality and event handling
└── README.md           # Project documentation
```

## 📄 File Descriptions

### `index.html`
Main HTML structure containing:
- Document structure with proper HTML5 semantics
- Recipe selector dropdown
- 3D book container with left/right page stacks
- Recipe overview page (left): title, image, tags, timeline
- Recipe details page (right): ingredients and instructions
- Navigation controls and page numbers

### `styles.css`
Complete stylesheet featuring:
- CSS reset for cross-browser consistency
- 3D perspective transforms for book effect
- Gradient backgrounds and shadow effects
- Interactive element styling (buttons, checkboxes)
- Timeline visualization styles
- Mobile-responsive media queries
- Smooth transitions and hover animations

### `recipes.js`
Recipe data module containing:
- Structured recipe objects with standardized properties
- Base64-encoded SVG images for consistent display
- Recipe metadata (title, time, difficulty, tags)
- Cooking timeline data
- Ingredients and step-by-step instructions

### `main.js`
Interactive functionality including:
- Recipe loading and content population
- Timeline generation and visualization
- Navigation between recipes
- Instruction checkbox handling
- Event listeners for user interactions
- Keyboard navigation support

## 🚀 Getting Started

1. **Download Files**: Save all four files in the same directory
2. **Open in Browser**: Open `index.html` in any modern web browser
3. **Explore Recipes**: Use the dropdown or navigation buttons to browse recipes
4. **Interactive Cooking**: Check off instruction steps as you cook

## 📱 Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Support**: iOS Safari, Android Chrome
- **Features Used**: CSS Grid, Flexbox, CSS Custom Properties, ES6 JavaScript

## 🎨 Customization

### Adding New Recipes

1. **Edit `recipes.js`**: Add a new recipe object to the `recipes` array
2. **Update Dropdown**: Add corresponding `<option>` in `index.html`
3. **Recipe Structure**:
```javascript
{
    title: "Recipe Name",
    time: "Total Time",
    image: "image-url-or-base64",
    tags: ["Tag1", "Tag2"],
    difficulty: "★★★☆☆",
    timeline: [
        { step: "Prep", time: "15 min" },
        { step: "Cook", time: "30 min" }
    ],
    ingredients: ["Ingredient 1", "Ingredient 2"],
    instructions: ["Step 1", "Step 2"]
}
```

### Styling Customization

- **Colors**: Modify CSS custom properties in `styles.css`
- **Fonts**: Change `font-family` in the body selector
- **Layout**: Adjust container dimensions and responsive breakpoints
- **Animations**: Modify transition durations and effects

### Image Customization

- Replace base64 SVG images with actual photos
- Maintain 300x180px aspect ratio for best display
- Use high-quality images for better visual appeal

## 🔧 Technical Features

### 3D Effects
- CSS perspective transforms for realistic book depth
- Multiple shadow layers for page stack illusion
- Gradient backgrounds simulating paper texture

### Interactive Elements
- Checkbox state management with visual feedback
- Smooth transitions for user interactions
- Hover effects on buttons and interactive elements

### Responsive Design
- Mobile-first approach with progressive enhancement
- Flexible layout adapting from side-by-side to stacked pages
- Touch-friendly navigation on mobile devices

### Performance
- Lightweight CSS-only animations
- Efficient DOM manipulation
- Minimal JavaScript footprint

## 🎯 Use Cases

- **Personal Recipe Collection**: Store and organize your favorite recipes
- **Cooking Classes**: Interactive recipe display for teaching
- **Restaurant Menus**: Elegant recipe presentation
- **Food Blogs**: Embed in websites for recipe sharing
- **Meal Planning**: Visual recipe browsing and selection

## 🤝 Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across different browsers and devices
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Images not displaying**: Check image URLs or base64 encoding
**Layout broken on mobile**: Verify viewport meta tag in HTML
**JavaScript errors**: Ensure recipes.js loads before main.js
**Styling issues**: Check for CSS syntax errors and browser compatibility

### Browser Developer Tools

Use browser developer tools to:
- Inspect element styling
- Debug JavaScript functionality
- Test responsive layouts
- Monitor console for errors

## 📧 Support

For questions or issues, please check the troubleshooting section or create an issue in the project repository.