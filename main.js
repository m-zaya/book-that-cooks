/*
MAIN JAVASCRIPT FUNCTIONALITY
==============================

This file contains all interactive functionality for the Digital Cookbook.
It manages recipe loading, user interactions, and dynamic content updates.

CONTENTS OUTLINE:
1. Global Variables - Current recipe tracking and state management
2. Recipe Loading Functions - Dynamic content population
3. Timeline Generation - Creates interactive cooking timeline
4. Navigation Functions - Recipe browsing and selection
5. Interactive Features - Checkbox handling and user interactions
6. Event Listeners - Dropdown changes and user input handling
7. Initialization - Page setup and default content loading

MAIN FUNCTIONS:
- loadRecipe(index): Loads and displays a specific recipe
- generateTimeline(timeline): Creates the cooking timeline visualization  
- nextRecipe(): Navigates to the next recipe
- previousRecipe(): Navigates to the previous recipe
- resetChecklist(): Resets all instruction checkboxes
- updateRecipeCounter(): Updates the recipe counter display

INTERACTIVE FEATURES:
- Recipe dropdown selection
- Navigation buttons with disabled states
- Interactive instruction checkboxes with completion styling
- Responsive timeline generation
- Dynamic content updates without page refresh

DEPENDENCIES:
- recipes.js: Must be loaded before this file for recipe data access
- DOM elements: Requires specific HTML structure from index.html

USAGE:
- Include this file after recipes.js and the HTML structure
- Functions are automatically bound to onclick events in HTML
- Page initializes with the first recipe on load
*/

// =============================================================================
// 1. GLOBAL VARIABLES - State management and tracking
// =============================================================================

// Current recipe index tracker (starts with first recipe)
let currentRecipeIndex = 0;

// =============================================================================
// 2. RECIPE LOADING FUNCTIONS - Dynamic content population
// =============================================================================

/**
 * Main function to load and display a recipe
 * @param {number} index - Index of the recipe to load from recipes array
 */
function loadRecipe(index) {
    // Validate index to prevent errors
    if (index < 0 || index >= recipes.length) {
        console.error('Invalid recipe index:', index);
        return;
    }

    // Get the recipe object from the data array
    const recipe = recipes[index];
    
    // Update basic recipe information
    document.getElementById('recipeTitle').textContent = recipe.title;
    document.getElementById('recipeTime').textContent = recipe.time;
    document.getElementById('recipeImage').src = recipe.image;
    document.getElementById('recipeDifficulty').textContent = recipe.difficulty;
    
    // Update recipe tags
    updateRecipeTags(recipe.tags);
    
    // Generate and update timeline
    generateTimeline(recipe.timeline);
    
    // Update ingredients list
    updateIngredientsList(recipe.ingredients);
    
    // Update instructions list
    updateInstructionsList(recipe.instructions);
    
    // Update recipe selector dropdown
    document.getElementById('recipeSelect').value = index;
    
    // Update navigation counter
    updateRecipeCounter();
    
    // Store current index
    currentRecipeIndex = index;
}

/**
 * Updates the recipe tags display
 * @param {Array} tags - Array of tag strings
 */
function updateRecipeTags(tags) {
    const tagsContainer = document.getElementById('recipeTags');
    tagsContainer.innerHTML = '';
    
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
    });
}

/**
 * Updates the ingredients list
 * @param {Array} ingredients - Array of ingredient strings
 */
function updateIngredientsList(ingredients) {
    const ingredientsContainer = document.getElementById('ingredientsList');
    ingredientsContainer.innerHTML = '';
    
    ingredients.forEach(ingredient => {
        const listItem = document.createElement('li');
        listItem.textContent = ingredient;
        ingredientsContainer.appendChild(listItem);
    });
}

/**
 * Updates the instructions list with interactive checkboxes
 * @param {Array} instructions - Array of instruction strings
 */
function updateInstructionsList(instructions) {
    const instructionsContainer = document.getElementById('instructionsList');
    instructionsContainer.innerHTML = '';
    
    instructions.forEach((instruction, index) => {
        const instructionItem = document.createElement('div');
        instructionItem.className = 'instruction-item';
        
        // Create checkbox for step completion
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'instruction-checkbox';
        checkbox.id = `step${index + 1}`;
        
        // Add change event listener for completion styling
        checkbox.addEventListener('change', function() {
            toggleInstructionCompletion(instructionItem, this.checked);
        });
        
        // Create step number circle
        const stepNumber = document.createElement('div');
        stepNumber.className = 'instruction-number';
        stepNumber.textContent = index + 1;
        
        // Create instruction text
        const instructionText = document.createElement('div');
        instructionText.className = 'instruction-text';
        instructionText.textContent = instruction;
        
        // Assemble the instruction item
        instructionItem.appendChild(checkbox);
        instructionItem.appendChild(stepNumber);
        instructionItem.appendChild(instructionText);
        
        instructionsContainer.appendChild(instructionItem);
    });
}

/**
 * Toggles the completion state of an instruction
 * @param {HTMLElement} instructionItem - The instruction container element
 * @param {boolean} completed - Whether the instruction is completed
 */
function toggleInstructionCompletion(instructionItem, completed) {
    if (completed) {
        instructionItem.classList.add('completed');
    } else {
        instructionItem.classList.remove('completed');
    }
}

// =============================================================================
// 3. TIMELINE GENERATION - Interactive cooking timeline creation
// =============================================================================

/**
 * Generates the interactive cooking timeline
 * @param {Array} timeline - Array of timeline step objects {step, time}
 */
function generateTimeline(timeline) {
    const timelineContainer = document.getElementById('recipeTimeline');
    timelineContainer.innerHTML = '';
    
    // Create the connecting line
    const timelineLine = document.createElement('div');
    timelineLine.className = 'timeline-line';
    timelineContainer.appendChild(timelineLine);
    
    // Create the starting dot
    const startDot = document.createElement('div');
    startDot.className = 'timeline-start-dot';
    timelineContainer.appendChild(startDot);
    
    // Generate timeline steps
    timeline.forEach((timelineStep, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'timeline-step';
        
        stepElement.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-step-content">
                <div class="timeline-step-name">${timelineStep.step}</div>
                <div class="timeline-step-time">${timelineStep.time}</div>
            </div>
        `;
        
        timelineContainer.appendChild(stepElement);
    });
}

// =============================================================================
// 4. NAVIGATION FUNCTIONS - Recipe browsing and selection
// =============================================================================

/**
 * Navigates to the next recipe
 */
function nextRecipe() {
    const nextIndex = (currentRecipeIndex + 1) % recipes.length;
    loadRecipe(nextIndex);
}

/**
 * Navigates to the previous recipe
 */
function previousRecipe() {
    const prevIndex = currentRecipeIndex === 0 ? recipes.length - 1 : currentRecipeIndex - 1;
    loadRecipe(prevIndex);
}

/**
 * Updates the recipe counter display
 */
function updateRecipeCounter() {
    const counter = document.getElementById('recipeCounter');
    counter.textContent = `${currentRecipeIndex + 1} of ${recipes.length}`;
}

// =============================================================================
// 5. INTERACTIVE FEATURES - User interaction handlers
// =============================================================================

/**
 * Resets all instruction checkboxes to unchecked state
 */
function resetChecklist() {
    // Find all instruction checkboxes
    const checkboxes = document.querySelectorAll('.instruction-checkbox');
    const instructionItems = document.querySelectorAll('.instruction-item');
    
    // Uncheck all checkboxes and remove completed styling
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    instructionItems.forEach(item => {
        item.classList.remove('completed');
    });
}

/**
 * Handles recipe selection from dropdown
 * @param {Event} event - The change event from the select element
 */
function handleRecipeSelection(event) {
    const selectedIndex = parseInt(event.target.value);
    loadRecipe(selectedIndex);
}

// =============================================================================
// 6. EVENT LISTENERS - DOM event binding
// =============================================================================

/**
 * Sets up all event listeners when the page loads
 */
function setupEventListeners() {
    // Recipe selector dropdown change event
    const recipeSelect = document.getElementById('recipeSelect');
    if (recipeSelect) {
        recipeSelect.addEventListener('change', handleRecipeSelection);
    }
    
    // Keyboard navigation support
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                previousRecipe();
                break;
            case 'ArrowRight':
                event.preventDefault();
                nextRecipe();
                break;
            case 'r':
            case 'R':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    resetChecklist();
                }
                break;
        }
    });
}

// =============================================================================
// 7. INITIALIZATION - Page setup and default loading
// =============================================================================

/**
 * Initializes the application when the DOM is loaded
 */
function initializeApp() {
    // Load the first recipe by default
    loadRecipe(0);
    
    // Set up event listeners
    setupEventListeners();
    
    // Add any additional initialization logic here
    console.log('Digital Cookbook initialized successfully');
    console.log(`Loaded ${recipes.length} recipes`);
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeApp);

// Alternative initialization for older browsers
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded
    initializeApp();
}