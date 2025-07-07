# Digital Cookbook

A beautiful, interactive cookbook interface that presents recipes in a realistic 3D book format with advanced functionality for browsing, searching, and creating recipes. Features a modern three-button navigation system and comprehensive recipe management capabilities.

## 📖 Overview

The Digital Cookbook creates an immersive reading experience that mimics a real cookbook with modern digital enhancements. It features a 3D book appearance with page-turning animations, interactive checkboxes for instructions, visual cooking timeline, comprehensive search and filtering, and a complete recipe creation system.

## ✨ Current Features

### 🎨 Visual Design
- **3D Book Interface**: Realistic book appearance with page stacks and shadows
- **Interactive Timeline**: Visual cooking timeline showing prep, cooking, and cooling phases with connecting lines and dots
- **Responsive Design**: Seamlessly adapts from desktop side-by-side pages to mobile stacked layout
- **Modern Navigation**: Three-button header system (Table of Contents, Random Recipe, New Recipe)

### 📚 Recipe Management
- **Recipe Browsing**: Easy navigation between multiple recipes with Previous/Next controls
- **Random Recipe**: Discover recipes with the random selection feature
- **Recipe Display**: Each recipe includes image, tags, difficulty rating, and timing information
- **Progress Tracking**: Interactive checkboxes for each instruction step with visual completion styling

### 🔍 Advanced Search & Filtering
- **Split Table of Contents**: Search controls on left page, results on right page
- **Real-time Search**: Live search by recipe title with instant results
- **Tag Filtering**: Multi-select tag filters with Select All/Clear All functionality
- **Smart Sorting**: Sort by alphabetical order, difficulty level, or cooking time
- **Recipe Counter**: Shows filtered results count and search status

### ➕ Recipe Creation System
- **Comprehensive Form**: Split across both pages for optimal space utilization
- **Time Format Support**: Universal HH:MM time format (e.g., 01:30, 00:45) with automatic display conversion
- **Separated Ingredients**: Three-field system (quantity, unit, ingredient) for better data structure
- **Fraction Helper**: Interactive popup with Unicode fraction symbols (½, ¼, ¾, ⅓, ⅔, etc.)
- **Image Support**: Both file upload and URL input with live preview
- **Dynamic Lists**: Add/remove timeline steps, ingredients, and instructions as needed
- **Form Validation**: Comprehensive validation for time format and required fields

### 🎯 Interactive Features
- **Instruction Checklist**: Check off steps as you cook with visual completion states
- **Reset Functionality**: One-click reset for instruction checklist
- **Keyboard Navigation**: Arrow keys for recipe navigation, Ctrl+R to reset checklist, Ctrl+T for Table of Contents
- **Visual Feedback**: Hover effects, transitions, and interactive element styling

## 🏗️ Project Structure

```
digital-cookbook/
├── index.html          # Main HTML structure with 3D book layout
├── styles.css          # Complete styling with responsive design and 3D effects
├── recipes.js          # Recipe data with structured ingredient format
├── main.js             # Interactive functionality and state management
├── future progress     # Development roadmap and planned features
└── README.md           # Project documentation
```

## 📄 Detailed File Descriptions

### `index.html`
Main HTML structure featuring:
- **Document Structure**: Proper HTML5 semantics with mobile viewport support
- **Header Navigation**: Three-button system for main functions
- **3D Book Container**: Left/right page stacks for realistic depth effect
- **Split Layout System**: 
  - Left page: Recipe overview OR Table of Contents controls OR New Recipe form (basic info)
  - Right page: Recipe details OR Table of Contents results OR New Recipe form (timeline/ingredients/instructions)
- **Navigation Controls**: Previous/Next buttons with recipe counter
- **Time Format Support**: HH:MM format inputs with pattern validation
- **Separated Ingredient Inputs**: Quantity, unit, and ingredient name fields
- **Fraction Helper Integration**: Popup system for easy Unicode fraction entry

### `styles.css`
Comprehensive stylesheet featuring:
- **CSS Reset**: Cross-browser consistency foundation
- **3D Visual Effects**: Perspective transforms, gradient backgrounds, realistic shadows
- **Interactive Styling**: Button hover effects, checkbox animations, completion states
- **Timeline Visualization**: Connecting lines, step dots, and content boxes
- **Responsive Framework**: Mobile-first approach with breakpoints for tablets and desktop
- **Form Styling**: Modern input designs with focus states and validation feedback
- **Table of Contents Layout**: Split-screen design with search controls and results
- **Fraction Helper Styling**: Popup positioning, grid layout for fraction buttons
- **Theme Consistency**: Brown color scheme throughout all components

### `recipes.js`
Structured data module containing:
- **Recipe Objects**: Standardized structure with title, time, image, tags, difficulty
- **Timeline Data**: Step-by-step cooking phases with time information
- **Separated Ingredients**: Objects with quantity, unit, and ingredient properties for better data manipulation
- **Base64 SVG Images**: Consistent placeholder images with custom recipe graphics
- **Backward Compatibility**: Supports both old string format and new object format for ingredients

### `main.js`
Core functionality module featuring:
- **Time Format Utilities**: Conversion between HH:MM format and human-readable display
- **Ingredient Formatting**: Functions to handle separated ingredient components
- **Recipe Loading**: Dynamic content population and timeline generation
- **View Management**: State tracking for recipe/TOC/form views
- **Search & Filter Logic**: Real-time filtering, sorting, and result display
- **Form Management**: Dynamic list handling, validation, and data collection
- **Image Handling**: File upload, URL input, and preview functionality
- **Fraction Helper**: Interactive popup system for Unicode fraction insertion
- **Event Handling**: Keyboard shortcuts, button interactions, and state changes

## 🚀 Getting Started

### Quick Setup
1. **Download Files**: Save all files in the same directory
2. **Open in Browser**: Open `index.html` in any modern web browser
3. **Explore Features**: Use the three header buttons to navigate between functions

### Navigation Guide
- **Table of Contents**: Browse all recipes with search and filtering
- **Random Recipe**: Discover a random recipe from your collection
- **New Recipe**: Create and add your own recipes to the collection
- **Previous/Next**: Navigate between recipes in normal view
- **Keyboard Shortcuts**: Use arrow keys, Ctrl+R (reset), Ctrl+T (TOC)

### Adding Your First Recipe
1. Click "New Recipe" in the header
2. Fill in basic information (title, time in HH:MM format, difficulty)
3. Add timeline steps with HH:MM format times
4. Add ingredients using the three-field system (quantity, unit, ingredient)
5. Use the fraction helper for quantities like ½, ¼, ¾
6. Add step-by-step instructions
7. Upload an image or provide a URL
8. Click "Save Recipe" to add to your collection

## 📱 Browser Compatibility

### Fully Supported
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Android Chrome 90+

### Required Features
- CSS Grid and Flexbox support
- ES6 JavaScript (arrow functions, const/let, template literals)
- CSS Custom Properties (CSS variables)
- File API for image uploads
- HTML5 form validation

## 🎨 Customization Options

### Adding Recipe Data
Add new recipes to the `recipes` array in `recipes.js`:
```javascript
{
    title: "Recipe Name",
    time: "01:30", // HH:MM format
    image: "image-url-or-base64",
    tags: ["Tag1", "Tag2"],
    difficulty: "★★★☆☆",
    timeline: [
        { step: "Prep", time: "00:15" },
        { step: "Cook", time: "01:00" }
    ],
    ingredients: [
        { quantity: "2", unit: "cups", ingredient: "flour" },
        { quantity: "1", unit: "tsp", ingredient: "salt" }
    ],
    instructions: ["Step 1", "Step 2"]
}
```

### Styling Customization
- **Colors**: Modify CSS custom properties in `:root` selector
- **Typography**: Change font families in body and heading selectors
- **Layout**: Adjust container dimensions and responsive breakpoints
- **Animations**: Modify transition durations and transform effects

### Feature Extensions
- **New Tags**: Add tags to recipes and they'll automatically appear in filters
- **Custom Images**: Replace SVG placeholders with actual recipe photos
- **Additional Fields**: Extend recipe structure for serving size, nutrition, etc.

## 🔧 Technical Architecture

### State Management
- **Current View Tracking**: 'recipe', 'toc', 'newRecipe' states
- **Recipe Index Management**: Navigation between recipe entries
- **Form State**: Dynamic list management for timeline, ingredients, instructions
- **Search State**: Filter criteria, sort options, and result caching

### Data Flow
1. **Recipe Loading**: Index selection → data retrieval → DOM population
2. **Search System**: Input changes → filter application → result rendering
3. **Form Submission**: Data collection → validation → recipe array update
4. **View Switching**: State change → element visibility toggle → content update

### Performance Features
- **Lightweight Animations**: CSS-only transitions for smooth interactions
- **Efficient DOM Updates**: Minimal manipulation with targeted element updates
- **Responsive Images**: Automatic scaling and aspect ratio maintenance
- **Mobile Optimization**: Touch-friendly controls and stacked layout

## 🔮 Future Development Plans

### Planned Features (In Progress)
- **Clickable Tags**: Click any tag to filter recipes by that tag automatically
- **Fraction Helper Enhancement**: Add X button to close fraction helper popup
- **Recipe Editing**: Edit button for existing recipes with pre-populated form
- **Advanced Timeline**: Curved timeline layout for recipes with 3+ steps

### Potential Enhancements
- **Recipe Import/Export**: JSON file support for recipe sharing
- **Measurement Conversion**: Automatic conversion between metric and imperial
- **Recipe Scaling**: Adjust ingredient quantities for different serving sizes
- **Print Functionality**: Print-friendly recipe layout
- **Recipe Notes**: Personal notes and modifications for each recipe
- **Recipe Rating**: Star rating system for user favorites
- **Meal Planning**: Weekly meal planning with recipe integration
- **Shopping Lists**: Generate ingredient lists from selected recipes

### Technical Improvements
- **Local Storage**: Save user preferences and custom recipes locally
- **Recipe Categories**: Enhanced organization beyond tags
- **Advanced Search**: Full-text search through instructions and ingredients
- **Recipe Suggestions**: Related recipe recommendations
- **Batch Operations**: Select multiple recipes for actions

## 🎯 Use Cases

### Personal Cooking
- **Recipe Collection**: Organize family recipes and cooking discoveries
- **Meal Preparation**: Interactive cooking with step-by-step guidance
- **Recipe Discovery**: Random selection for meal planning inspiration

### Educational
- **Cooking Classes**: Interactive recipe display for instruction
- **Culinary Schools**: Structured recipe format for consistent teaching
- **Food Blogs**: Embeddable recipe display for websites

### Professional
- **Restaurant Development**: Recipe standardization and training
- **Catering Planning**: Recipe scaling and timeline management
- **Food Photography**: Consistent recipe presentation format

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper comments
4. Test across browsers and devices
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Submit a pull request

### Code Standards
- **HTML**: Semantic markup with accessibility considerations
- **CSS**: Mobile-first responsive design with consistent naming
- **JavaScript**: ES6+ features with comprehensive commenting
- **Comments**: Detailed explanations for complex functionality

### Testing Checklist
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive layout (iOS Safari, Android Chrome)
- [ ] Keyboard navigation functionality
- [ ] Form validation and error handling
- [ ] Image upload and preview features
- [ ] Search and filter accuracy

## 📄 License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute according to the license terms.

## 🆘 Troubleshooting

### Common Issues

**Images Not Displaying**
- Check image URLs for accessibility
- Verify base64 encoding for embedded images
- Ensure image files are in supported formats (JPG, PNG, GIF, WebP)

**Form Validation Errors**
- Time format must be HH:MM (e.g., 01:30, 00:45)
- All ingredient entries require at least an ingredient name
- Timeline steps need both step name and time

**Layout Issues on Mobile**
- Verify viewport meta tag is present
- Check for horizontal scroll issues
- Test touch interactions on mobile devices

**JavaScript Functionality**
- Ensure `recipes.js` loads before `main.js`
- Check browser console for error messages
- Verify browser supports required ES6 features

**Search Not Working**
- Clear browser cache and reload
- Check for JavaScript errors in console
- Verify recipe data structure matches expected format

### Browser Developer Tools Usage
- **Inspect Elements**: Check styling and layout issues
- **Console Tab**: Monitor JavaScript errors and debug output
- **Network Tab**: Verify resource loading (images, scripts)
- **Device Simulation**: Test responsive layout at different screen sizes

### Performance Optimization
- **Image Optimization**: Compress images for faster loading
- **CSS Minification**: Reduce file size for production use
- **JavaScript Optimization**: Consider bundling for larger deployments

## 📧 Support

For questions, bug reports, or feature requests:
- Check the troubleshooting section first
- Review existing issues in the project repository
- Create a new issue with detailed description and steps to reproduce
- Include browser version and device information for bug reports

---

*Happy cooking with your Digital Cookbook! 🍳👨‍🍳👩‍🍳*