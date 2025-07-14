// =============================================================================
// SUPABASE COMPATIBILITY - Add this to the TOP of main.js
// =============================================================================

// Override initializeApp to wait for database
function initializeApp() {
    if (typeof isLoading !== 'undefined' && isLoading) {
        setTimeout(initializeApp, 100);
        return;
    }
    
    if (typeof recipes === 'undefined') {
        setTimeout(initializeApp, 100);
        return;
    }
    
    console.log(`🕧 Initializing app with ${recipes.length} recipes from Supabase`);
    
    if (recipes.length === 0) {
        showNewRecipeForm();
        return;
    }
    
    currentRecipeIndex = 1; // Set initial index
    loadRecipe(1);
    setupEventListeners();
    showRecipeView();
    
    console.log('✔ Digital Cookbook initialized successfully with Supabase backend');
}

// =============================================================================
// Your existing main.js code continues below...
// But REMOVE the saveNewRecipe() function since it's handled by supabase-database.js
// =============================================================================

/*
MAIN JAVASCRIPT FUNCTIONALITY
==============================

This file contains all interactive functionality for the Digital Cookbook.
It manages recipe loading, user interactions, dynamic content updates, and the new
three-button navigation system (Table of Contents, Random Recipe, New Recipe).
Updated to support split Table of Contents layout with controls on left and results on right.
Updated to support universal HH:MM time format throughout the application.
Updated to support separated ingredient components (quantity, unit, ingredient).

NOTE: The saveNewRecipe() function has been REMOVED from this file because
it's now handled by supabase-database.js to ensure recipes are saved permanently
to the Supabase database instead of just local memory.
*/

// =============================================================================
// 1. GLOBAL VARIABLES - State management and tracking
// =============================================================================

// Current recipe index tracker (starts with first recipe)
let currentRecipeIndex = 0;

// Current view state tracker ('recipe', 'toc', 'newRecipe')
let currentView = 'recipe';

// =============================================================================
// 2. TIME FORMATTING UTILITY FUNCTIONS - Convert between HH:MM and display formats
// =============================================================================

/**
 * Converts HH:MM time format to human-readable display format
 * @param {string} timeStr - Time in HH:MM format (e.g., "01:30", "00:45")
 * @returns {string} Human-readable time (e.g., "1 hr 30 min", "45 min")
 */
function formatTimeForDisplay(timeStr) {
    // Handle legacy format - if it doesn't match HH:MM, return as-is
    if (!timeStr || !timeStr.includes(':')) {
        return timeStr;
    }
    
    const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
    
    if (isNaN(hours) || isNaN(minutes)) {
        return timeStr; // Return original if parsing fails
    }
    
    let result = '';
    
    if (hours > 0) {
        result += `${hours} hr`;
        if (minutes > 0) {
            result += ` ${minutes} min`;
        }
    } else {
        result = `${minutes} min`;
    }
    
    return result;
}

/**
 * Converts time string to total minutes for comparison/sorting
 * @param {string} timeStr - Time in HH:MM format or legacy format
 * @returns {number} Total minutes
 */
function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    
    // Handle HH:MM format
    if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
        if (!isNaN(hours) && !isNaN(minutes)) {
            return hours * 60 + minutes;
        }
    }
    
    // Handle legacy formats like "45 mins", "2 hours", "1.5 hrs"
    const timeMatch = timeStr.toLowerCase().match(/(\d+\.?\d*)\s*(hr|hour|min|minute)/);
    if (timeMatch) {
        const value = parseFloat(timeMatch[1]);
        const unit = timeMatch[2];
        if (unit.startsWith('hr') || unit.startsWith('hour')) {
            return Math.round(value * 60);
        } else {
            return Math.round(value);
        }
    }
    
    return 0; // Default fallback
}

// =============================================================================
// 3. INGREDIENT FORMATTING UTILITY FUNCTIONS - Handle separated components
// =============================================================================

/**
 * Formats ingredient object into display string
 * @param {Object} ingredient - Ingredient object with quantity, unit, ingredient properties
 * @returns {string} Formatted ingredient string for display
 */
function formatIngredientForDisplay(ingredient) {
    if (!ingredient) return '';
    
    // Handle both old string format and new object format for backward compatibility
    if (typeof ingredient === 'string') {
        return ingredient;
    }
    
    const { quantity, unit, ingredient: name } = ingredient;
    
    // Build the display string with proper spacing
    let result = '';
    
    if (quantity && quantity.trim()) {
        result += quantity.trim();
    }
    
    if (unit && unit.trim()) {
        if (result) result += ' ';
        result += unit.trim();
    }
    
    if (name && name.trim()) {
        if (result) result += ' ';
        result += name.trim();
    }
    
    return result || 'Unknown ingredient';
}

/**
 * Validates ingredient object has required components
 * @param {Object} ingredient - Ingredient object to validate
 * @returns {boolean} True if ingredient has at least an ingredient name
 */
function isValidIngredient(ingredient) {
    if (!ingredient) return false;
    
    // For backward compatibility with string format
    if (typeof ingredient === 'string') {
        return ingredient.trim().length > 0;
    }
    
    // For new object format, require at least the ingredient name
    return ingredient.ingredient && ingredient.ingredient.trim().length > 0;
}

// =============================================================================
// 4. RECIPE LOADING FUNCTIONS - Dynamic content population
// =============================================================================

/**
 * Main function to load and display a recipe
 * @param {number} index - Index of the recipe to load from recipes array
 */
function loadRecipe(index) {
    // Validate index to prevent errors (1-based indexing to match database IDs)
    if (index < 1 || index > recipes.length) {
        console.error('Invalid recipe index:', index);
        return;
    }

    // Switch back to recipe view if we're in a different view
    showRecipeView();

    // Convert 1-based index to 0-based for array access
    const arrayIndex = index - 1;

    // Get the recipe object from the data array
    const recipe = recipes[arrayIndex];
    
    // Update basic recipe information
    document.getElementById('recipeTitle').textContent = recipe.title;
    
    // Convert HH:MM time format to human-readable display
    document.getElementById('recipeTime').textContent = formatTimeForDisplay(recipe.time);
    
    document.getElementById('recipeImage').src = recipe.image;
    document.getElementById('recipeDifficulty').textContent = recipe.difficulty;
    
    // Update recipe tags
    updateRecipeTags(recipe.tags);
    
    // Generate and update timeline
    generateTimeline(recipe.timeline);
    
    // Update ingredients list with separated component support
    updateIngredientsList(recipe.ingredients);
    
    // Update instructions list
    updateInstructionsList(recipe.instructions);
    
    // Update navigation counter
    updateRecipeCounter();
    
    // ALWAYS update currentRecipeIndex to ensure consistency
    // This ensures the index always matches what's being displayed
    currentRecipeIndex = index;
    
    // Update navigation counter AFTER setting the index
    updateRecipeCounter();
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
 * Updates the ingredients list with support for separated components
 * @param {Array} ingredients - Array of ingredient objects or strings
 */
function updateIngredientsList(ingredients) {
    const ingredientsContainer = document.getElementById('ingredientsList');
    ingredientsContainer.innerHTML = '';
    
    ingredients.forEach(ingredient => {
        const listItem = document.createElement('li');
        // Use formatting function to handle both old and new ingredient formats
        listItem.textContent = formatIngredientForDisplay(ingredient);
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
// 5. TIMELINE GENERATION - Interactive cooking timeline creation
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
        
        // Convert HH:MM time format to human-readable display for timeline steps
        const displayTime = formatTimeForDisplay(timelineStep.time);
        
        stepElement.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-step-content">
                <div class="timeline-step-name">${timelineStep.step}</div>
                <div class="timeline-step-time">${displayTime}</div>
            </div>
        `;
        
        timelineContainer.appendChild(stepElement);
    });
}

// =============================================================================
// 6. NAVIGATION FUNCTIONS - Recipe browsing and selection
// =============================================================================

/**
 * Navigates to the next recipe
 * Using 1-based indexing to match Supabase IDs
 */
function nextRecipe() {
    // Move to next recipe, wrap around to first if at end
    const nextIndex = currentRecipeIndex >= recipes.length ? 1 : currentRecipeIndex + 1;
    // Let loadRecipe() handle updating currentRecipeIndex for consistency
    loadRecipe(nextIndex);
}

/**
 * Navigates to the previous recipe
 */
function previousRecipe() {
    // Move to previous recipe, wrap around to last if at beginning
    const prevIndex = currentRecipeIndex <= 1 ? recipes.length : currentRecipeIndex - 1;
    // Let loadRecipe() handle updating currentRecipeIndex for consistency
    loadRecipe(prevIndex);
}

/**
 * Updates the recipe counter display
 */
function updateRecipeCounter() {
    const counter = document.getElementById('recipeCounter');
    // Ensure we have valid recipes array before displaying
    if (recipes && recipes.length > 0) {
        counter.textContent = `${currentRecipeIndex} of ${recipes.length}`;
    } else {
        counter.textContent = 'No recipes';
    }
}

// =============================================================================
// 7. VIEW MANAGEMENT - Toggle between recipe, TOC, and form views
// =============================================================================

/**
 * Shows the main recipe view and hides other views
 */
function showRecipeView() {
    // Hide table of contents CONTROLS (left page)
    document.getElementById('tableOfContentsControls').classList.add('hidden');
    document.getElementById('recipeView').classList.remove('hidden');
    
    // Hide table of contents RESULTS (right page)
    document.getElementById('tableOfContentsResults').classList.add('hidden');
    document.getElementById('recipeDetailsView').classList.remove('hidden');
    
    // Hide new recipe form LEFT side
    document.getElementById('newRecipeFormLeft').classList.add('hidden');
    
    // Hide new recipe form RIGHT side  
    document.getElementById('newRecipeFormRight').classList.add('hidden');
    
    // Show navigation controls
    document.querySelector('.nav-controls').style.display = 'flex';
    
    currentView = 'recipe';
}

/**
 * Shows the table of contents view with controls on left and results on right
 */
function showTOCView() {
    // Hide recipe view from left page
    document.getElementById('recipeView').classList.add('hidden');
    // Show table of contents CONTROLS on left page
    document.getElementById('tableOfContentsControls').classList.remove('hidden');
    
    // Hide recipe details from right page
    document.getElementById('recipeDetailsView').classList.add('hidden');
    // Show table of contents RESULTS on right page
    document.getElementById('tableOfContentsResults').classList.remove('hidden');
    
    // Hide new recipe form LEFT side
    document.getElementById('newRecipeFormLeft').classList.add('hidden');
    
    // Hide new recipe form RIGHT side
    document.getElementById('newRecipeFormRight').classList.add('hidden');
    
    // Hide navigation controls (not relevant for TOC)
    document.querySelector('.nav-controls').style.display = 'none';
    
    currentView = 'toc';
}

/**
 * Shows the new recipe form split across both pages and hides other content
 */
function showNewRecipeView() {
    // Hide recipe view from left page
    document.getElementById('recipeView').classList.add('hidden');
    // Hide table of contents CONTROLS from left page  
    document.getElementById('tableOfContentsControls').classList.add('hidden');
    // Show new recipe form LEFT SIDE on left page
    document.getElementById('newRecipeFormLeft').classList.remove('hidden');
    
    // Hide recipe details from right page
    document.getElementById('recipeDetailsView').classList.add('hidden');
    // Hide table of contents RESULTS from right page
    document.getElementById('tableOfContentsResults').classList.add('hidden');
    // Show new recipe form RIGHT SIDE on right page
    document.getElementById('newRecipeFormRight').classList.remove('hidden');
    
    // Hide navigation controls (not relevant for form)
    document.querySelector('.nav-controls').style.display = 'none';
    
    currentView = 'newRecipe';
}

// =============================================================================
// 8. TABLE OF CONTENTS FUNCTIONS - Generate and handle recipe index with search
// =============================================================================

/**
 * Shows the table of contents with search controls on left and results on right
 */
function showTableOfContents() {
    showTOCView();
    generateTagFilters();
    updateTableOfContents();
    
    // Clear and focus the search bar when TOC opens
    const searchBar = document.getElementById('recipeSearchBar');
    if (searchBar) {
        searchBar.value = '';
        // Small delay to ensure the page is visible before focusing
        setTimeout(() => searchBar.focus(), 100);
    }
}

/**
 * Generates tag filter checkboxes in the left page controls
 */
function generateTagFilters() {
    const tagFiltersContainer = document.getElementById('tagFilters');
    
    const allTags = new Set();
    recipes.forEach(recipe => {
        recipe.tags.forEach(tag => allTags.add(tag));
    });
    
    const sortedTags = Array.from(allTags).sort();
    tagFiltersContainer.innerHTML = '';
    
    sortedTags.forEach(tag => {
        const filterElement = document.createElement('label');
        filterElement.className = 'tag-filter';
        
        filterElement.innerHTML = `
            <input type="checkbox" value="${tag}" checked onchange="updateTableOfContents()">
            <span>${tag}</span>
        `;
        
        tagFiltersContainer.appendChild(filterElement);
    });
}

/**
 * Updates the table of contents with current search, sorting and filtering
 */
function updateTableOfContents() {
    const sortBy = document.getElementById('tocSortBy').value;
    const selectedTags = getSelectedTags();
    const searchTerm = getSearchTerm();

    // Filter recipes based on search term and selected tags
    let filteredRecipes = recipes.filter((recipe) => {
        // Search filter - check if title contains search term (case insensitive)
        const matchesSearch = searchTerm === '' || 
            recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Tag filter - if no tags selected, show all; otherwise check for tag overlap
        const matchesTags = selectedTags.length === 0 || 
            recipe.tags.some(tag => selectedTags.includes(tag));
        
        return matchesSearch && matchesTags;
    }).map((recipe) => {
        return {
            ...recipe,
            originalIndex: recipes.indexOf(recipe)
        };
    });

    // Sort filtered recipes
    filteredRecipes.sort((a, b) => {
        switch (sortBy) {
            case 'alphabetical':
                return a.title.localeCompare(b.title);
            case 'difficulty':
                const getDifficultyValue = (stars) => stars.split('★').length - 1;
                return getDifficultyValue(a.difficulty) - getDifficultyValue(b.difficulty);
            case 'time':
                // Updated to use parseTimeToMinutes for proper HH:MM comparison
                const getTimeValue = (timeStr) => {
                    return parseTimeToMinutes(timeStr);
                };
                return getTimeValue(a.time) - getTimeValue(b.time);
            default:
                return 0;
        }
    });

    // Update recipe count display
    const searchMessage = searchTerm ? ` matching "${searchTerm}"` : '';
    document.getElementById('recipeCount').textContent =
        `Showing ${filteredRecipes.length} of ${recipes.length} recipes${searchMessage}`;

    generateFilteredTableOfContents(filteredRecipes);
}

/**
 * Gets the currently selected tags from checkboxes
 */
function getSelectedTags() {
    const checkboxes = document.querySelectorAll('#tagFilters input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Gets the current search term from the search bar
 */
function getSearchTerm() {
    const searchBar = document.getElementById('recipeSearchBar');
    return searchBar ? searchBar.value.trim() : '';
}

/**
 * Generates the filtered table of contents results on the right page
 */
function generateFilteredTableOfContents(recipesToShow) {
    const tocContainer = document.getElementById('tocRecipesList');
    tocContainer.innerHTML = '';
    
    if (recipesToShow.length === 0) {
        // Show "no results" message when no recipes match
        const noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results-message';
        noResultsMessage.innerHTML = `
            <div class="no-results-icon">🔍</div>
            <div class="no-results-text">No recipes found</div>
            <div class="no-results-suggestion">Try adjusting your search or filters</div>
        `;
        tocContainer.appendChild(noResultsMessage);
        return;
    }
    
    recipesToShow.forEach((recipe) => {
        const tocEntry = document.createElement('div');
        tocEntry.className = 'toc-recipe';
        tocEntry.onclick = () => loadRecipe(recipe.originalIndex + 1);
        
        // Convert HH:MM time format to human-readable display for TOC entries
        const displayTime = formatTimeForDisplay(recipe.time);
        
        tocEntry.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" class="toc-recipe-image">
            <div class="toc-recipe-info">
                <div class="toc-recipe-title">${recipe.title}</div>
                <div class="toc-recipe-meta">
                    <span>⏱️ ${displayTime}</span>
                    <span>${recipe.difficulty}</span>
                    <span>${recipe.tags.join(', ')}</span>
                </div>
            </div>
        `;
        
        tocContainer.appendChild(tocEntry);
    });
}

/**
 * Select all tag filters
 */
function selectAllTags() {
    document.querySelectorAll('#tagFilters input[type="checkbox"]').forEach(cb => {
        cb.checked = true;
    });
    updateTableOfContents();
}

/**
 * Clear all tag filters
 */
function clearAllTags() {
    document.querySelectorAll('#tagFilters input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    updateTableOfContents();
}

// =============================================================================
// 9. RANDOM RECIPE FUNCTION
// =============================================================================

/**
 * Selects and displays a random recipe
 * Using 1-based indexing to match Supabase IDs
 */
function showRandomRecipe() {
    const randomIndex = Math.floor(Math.random() * recipes.length) + 1;

    // Check if the random index is the same as the current recipe index
    if (randomIndex === currentRecipeIndex) {
        // Update index to new recipe
        currentRecipeIndex = randomIndex + 1; 

        loadRecipe(randomIndex + 1); // Increment to ensure we load a different recipe
    }
    else {
        // Force update currentRecipeIndex and reload recipe even if it's the same
        // This ensures the display always refreshes
        currentRecipeIndex = randomIndex;
        loadRecipe(randomIndex);
    }
}

// =============================================================================
// 10. NEW RECIPE FORM FUNCTIONS - Updated to use Supabase backend
// =============================================================================

/**
 * Shows the new recipe form
 */
function showNewRecipeForm() {
    showNewRecipeView();
    clearNewRecipeForm();
}

/**
 * Clears all fields in the new recipe form
 */
function clearNewRecipeForm() {
    document.getElementById('newRecipeTitle').value = '';
    document.getElementById('newRecipeTime').value = '';
    document.getElementById('newRecipeImage').value = '';
    document.getElementById('newRecipeDifficulty').value = '';
    document.getElementById('newRecipeTags').value = '';
    
    if (document.getElementById('imageFileInput')) {
        document.getElementById('imageFileInput').value = '';
    }
    
    hideImagePreview();
    resetTimelineList();
    resetIngredientsList();
    resetInstructionsList();
}

/**
 * Resets form lists
 */
function resetTimelineList() {
    const timelineList = document.querySelector('#timelineList');
    timelineList.innerHTML = `
        <div class="dynamic-item">
            <input type="text" placeholder="Step - ex: Prep" class="form-input timeline-step-input">
            <input type="text" placeholder="HH:MM" 
                   class="form-input timeline-time-input"
                   pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                   title="Enter time in HH:MM format (e.g., 00:15 for 15 minutes)">
            <button type="button" class="remove-btn" onclick="removeTimelineItem(this)">Remove</button>
        </div>
    `;
}

function resetIngredientsList() {
    const ingredientsList = document.querySelector('#newRecipeIngredientsList');
    // Updated to include separated ingredient input fields with fraction helper
    ingredientsList.innerHTML = `
        <div class="dynamic-item ingredient-item">
            <div class="quantity-input-container">
                <input type="text" placeholder="Qty" class="form-input ingredient-quantity-input" 
                       title="Enter quantity (e.g., 2, 1½, ¾) - click for fraction help"
                       onfocus="showFractionHelper(this)" 
                       onblur="hideFractionHelper(this)">
                <div class="fraction-helper hidden">
                    <div class="fraction-helper-title">Common Fractions:</div>
                    <div class="fraction-buttons">
                        <button type="button" class="fraction-btn" onclick="insertFraction(this, '½')">½</button>
                        <button type="button" class="fraction-btn" onclick="insertFraction(this, '¼')">¼</button>
                        <button type="button" class="fraction-btn" onclick="insertFraction(this, '¾')">¾</button>
                        <button type="button" class="fraction-btn" onclick="insertFraction(this, '⅓')">⅓</button>
                        <button type="button" class="fraction-btn" onclick="insertFraction(this, '⅔')">⅔</button>
                    </div>
                </div>
            </div>
            <input type="text" placeholder="Unit" class="form-input ingredient-unit-input" title="Enter unit (e.g., cups, tsp, tbsp, large)">
            <input type="text" placeholder="Ingredient" class="form-input ingredient-name-input" title="Enter ingredient name (e.g., flour, eggs, salt)">
            <button type="button" class="remove-btn" onclick="removeIngredientItem(this)">Remove</button>
        </div>
    `;
}

function resetInstructionsList() {
    const instructionsList = document.querySelector('#newRecipeInstructionsList');
    instructionsList.innerHTML = `
        <div class="dynamic-item">
            <textarea placeholder="Instruction step" class="form-textarea instruction-input" rows="2"></textarea>
            <button type="button" class="remove-btn" onclick="removeInstructionItem(this)">Remove</button>
        </div>
    `;
}

/**
 * Dynamic list management functions - Updated with HH:MM time format for timeline and separated ingredients
 */
function addTimelineItem() {
    const timelineList = document.querySelector('#timelineList');
    const newItem = document.createElement('div');
    newItem.className = 'dynamic-item';
    newItem.innerHTML = `
        <input type="text" placeholder="Step - ex: Prep" class="form-input timeline-step-input">
        <input type="text" placeholder="HH:MM" 
               class="form-input timeline-time-input"
               pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
               title="Enter time in HH:MM format (e.g., 00:15 for 15 minutes)">
        <button type="button" class="remove-btn" onclick="removeTimelineItem(this)">Remove</button>
    `;
    timelineList.appendChild(newItem);
}

function removeTimelineItem(button) {
    const timelineList = document.querySelector('#timelineList');
    if (timelineList.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert('You must have at least one timeline step.');
    }
}

// Updated ingredient functions to support separated input fields and fraction helper
function addIngredientItem() {
    const ingredientsList = document.querySelector('#newRecipeIngredientsList');
    const newItem = document.createElement('div');
    newItem.className = 'dynamic-item ingredient-item';
    // Updated to include three separate input fields with fraction helper for quantity
    newItem.innerHTML = `
        <div class="quantity-input-container">
            <input type="text" placeholder="Qty" class="form-input ingredient-quantity-input" 
                   title="Enter quantity (e.g., 2, 1½, ¾) - click for fraction help"
                   onfocus="showFractionHelper(this)" 
                   onblur="hideFractionHelper(this)">
            <div class="fraction-helper hidden">
                <div class="fraction-helper-title">Common Fractions:</div>
                <div class="fraction-buttons">
                    <button type="button" class="fraction-btn" onclick="insertFraction(this, '½')">½</button>
                    <button type="button" class="fraction-btn" onclick="insertFraction(this, '¼')">¼</button>
                    <button type="button" class="fraction-btn" onclick="insertFraction(this, '¾')">¾</button>
                    <button type="button" class="fraction-btn" onclick="insertFraction(this, '⅓')">⅓</button>
                    <button type="button" class="fraction-btn" onclick="insertFraction(this, '⅔')">⅔</button>
                </div>
            </div>
        </div>
        <input type="text" placeholder="Unit" class="form-input ingredient-unit-input" title="Enter unit (e.g., cups, tsp, tbsp, large)">
        <input type="text" placeholder="Ingredient" class="form-input ingredient-name-input" title="Enter ingredient name (e.g., flour, eggs, salt)">
        <button type="button" class="remove-btn" onclick="removeIngredientItem(this)">Remove</button>
    `;
    ingredientsList.appendChild(newItem);
}

function removeIngredientItem(button) {
    const ingredientsList = document.querySelector('#newRecipeIngredientsList');
    if (ingredientsList.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert('You must have at least one ingredient.');
    }
}

function addInstructionItem() {
    const instructionsList = document.querySelector('#newRecipeInstructionsList');
    const newItem = document.createElement('div');
    newItem.className = 'dynamic-item';
    newItem.innerHTML = `
        <textarea placeholder="Instruction step" class="form-textarea instruction-input" rows="2"></textarea>
        <button type="button" class="remove-btn" onclick="removeInstructionItem(this)">Remove</button>
    `;
    instructionsList.appendChild(newItem);
}

function removeInstructionItem(button) {
    const instructionsList = document.querySelector('#newRecipeInstructionsList');
    if (instructionsList.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert('You must have at least one instruction.');
    }
}

/**
 * Time validation helper function for HH:MM format
 * @param {string} timeStr - Time string to validate
 * @returns {boolean} True if valid HH:MM format
 */
function isValidTimeFormat(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') {
        return false;
    }
    
    // Check if format matches HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeStr);
}

// =============================================================================
// NOTE: saveNewRecipe() function has been REMOVED from this file
// It's now handled by supabase-database.js to ensure recipes are saved 
// permanently to the Supabase database instead of just local memory
// =============================================================================

function generateDefaultImage(title) {
    const svg = `
        <svg width="300" height="180" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="180" fill="#F5F5DC"/>
            <circle cx="150" cy="90" r="40" fill="#D2691E"/>
            <text x="150" y="100" font-family="Georgia, serif" font-size="16" fill="#8B4513" text-anchor="middle" font-weight="bold">${title.substring(0, 20)}</text>
            <text x="150" y="160" font-family="Georgia, serif" font-size="12" fill="#8B4513" text-anchor="middle" font-style="italic">Custom Recipe</text>
        </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

function cancelNewRecipe() {
    if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
        showRecipeView();
    }
}

// =============================================================================
// 11. IMAGE HANDLING FUNCTIONS
// =============================================================================

function handleImageUpload(input) {
    const file = input.files[0];
    
    if (!file) {
        hideImagePreview();
        return;
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF, or WebP)');
        input.value = '';
        hideImagePreview();
        return;
    }
    
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
        alert('Image file is too large. Please select an image smaller than 5MB.');
        input.value = '';
        hideImagePreview();
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageDataUrl = e.target.result;
        // Clear the URL input when file is uploaded - prevents conflicts between file and URL inputs
        document.getElementById('newRecipeImage').value = '';
        showImagePreview(imageDataUrl);
    };
    
    reader.onerror = function() {
        alert('Error reading the image file. Please try again.');
        input.value = '';
        hideImagePreview();
    };
    
    reader.readAsDataURL(file);
}

function handleImageURL(input) {
    const imageUrl = input.value.trim();
    
    if (!imageUrl) {
        hideImagePreview();
        return;
    }
    
    // Clear the file input when URL is entered - prevents conflicts between file and URL inputs
    if (document.getElementById('imageFileInput')) {
        document.getElementById('imageFileInput').value = '';
    }
    
    showImagePreview(imageUrl);
}

function showImagePreview(imageSrc) {
    const previewContainer = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    
    if (previewContainer && previewImage) {
        // CRITICAL FIX: Clear any existing error handlers to prevent conflicts
        // This prevents old event handlers from firing when we change the image
        previewImage.onerror = null;
        previewImage.onload = null;
        
        // Set up new error handler BEFORE setting the src
        // This ensures we handle loading errors for the new image
        previewImage.onerror = function() {
            alert('Unable to load the image. Please check the URL or try a different image.');
            hideImagePreview();
        };
        
        // Set up success handler to show preview only when image loads successfully
        previewImage.onload = function() {
            // Image loaded successfully, show the preview container
            previewContainer.classList.remove('hidden');
        };
        
        // Set the image source LAST - this may trigger onload or onerror
        previewImage.src = imageSrc;
    }
}

function hideImagePreview() {
    const previewContainer = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    
    if (previewContainer && previewImage) {
        // CRITICAL FIX: Remove event handlers BEFORE clearing src to prevent infinite loops
        // This is the main fix - prevents onerror from firing when we set src to empty string
        previewImage.onerror = null;
        previewImage.onload = null;
        
        // Hide the container first
        previewContainer.classList.add('hidden');
        
        // Clear the src LAST - now safe because no error handler will fire
        previewImage.src = '';
    }
}

function removeImage() {
    if (document.getElementById('imageFileInput')) {
        document.getElementById('imageFileInput').value = '';
    }
    document.getElementById('newRecipeImage').value = '';
    hideImagePreview();
}

function getCurrentImageData() {
    const previewImage = document.getElementById('previewImage');
    const previewContainer = document.getElementById('imagePreview');
    
    // Only return image data if preview is visible and has valid src
    if (previewContainer && 
        previewImage && 
        !previewContainer.classList.contains('hidden') && 
        previewImage.src && 
        previewImage.src !== window.location.href) { // NEW: Prevent returning page URL as image
        return previewImage.src;
    }
    
    return null;
}

// =============================================================================
// 12. INTERACTIVE FEATURES
// =============================================================================

function resetChecklist() {
    const checkboxes = document.querySelectorAll('.instruction-checkbox');
    const instructionItems = document.querySelectorAll('.instruction-item');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    instructionItems.forEach(item => {
        item.classList.remove('completed');
    });
}

// =============================================================================
// 13. FRACTION HELPER FUNCTIONS - Easy fraction symbol insertion
// =============================================================================

/**
 * Shows the fraction helper popup when quantity input is focused
 * @param {HTMLElement} input - The quantity input field that was focused
 */
function showFractionHelper(input) {
    // Find the fraction helper within the same container
    const container = input.closest('.quantity-input-container');
    if (container) {
        const helper = container.querySelector('.fraction-helper');
        if (helper) {
            // Store reference to the input for later use
            helper.dataset.targetInput = input.id || 'temp_' + Date.now();
            if (!input.id) {
                input.id = helper.dataset.targetInput;
            }
            
            // Show the helper with a small delay to ensure focus is established
            setTimeout(() => {
                helper.classList.remove('hidden');
                
                // Check if helper would go off the right edge of the screen
                const helperRect = helper.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                
                if (helperRect.right > viewportWidth - 10) {
                    // Position to the right instead
                    helper.classList.add('align-right');
                } else {
                    helper.classList.remove('align-right');
                }
            }, 100);
        }
    }
}

/**
 * Hides the fraction helper popup when quantity input loses focus
 * @param {HTMLElement} input - The quantity input field that lost focus
 */
function hideFractionHelper(input) {
    // Find the fraction helper within the same container
    const container = input.closest('.quantity-input-container');
    if (container) {
        const helper = container.querySelector('.fraction-helper');
        if (helper) {
            // Add a delay to allow clicking on fraction buttons before hiding
            setTimeout(() => {
                // Only hide if the input is still not focused and no button is being clicked
                if (document.activeElement !== input && !helper.contains(document.activeElement)) {
                    helper.classList.add('hidden');
                }
            }, 150);
        }
    }
}

/**
 * Inserts a fraction symbol into the quantity input field
 * @param {HTMLElement} button - The fraction button that was clicked
 * @param {string} fraction - The fraction symbol to insert
 */
function insertFraction(button, fraction) {
    // Find the associated input field
    const helper = button.closest('.fraction-helper');
    if (helper && helper.dataset.targetInput) {
        const input = document.getElementById(helper.dataset.targetInput);
        if (input) {
            // Get current cursor position or use end of text
            const start = input.selectionStart || input.value.length;
            const end = input.selectionEnd || input.value.length;
            
            // Insert the fraction at cursor position
            const currentValue = input.value;
            const newValue = currentValue.substring(0, start) + fraction + currentValue.substring(end);
            
            input.value = newValue;
            
            // Set cursor position after the inserted fraction
            const newPosition = start + fraction.length;
            input.focus();
            input.setSelectionRange(newPosition, newPosition);
            
            // Keep the helper visible for multiple selections
            // Users can click multiple fractions or click outside to hide
        }
    }
}

// =============================================================================
// 14. ADMIN AUTHENTICATION HANDLERS
// =============================================================================

/**
 * Handles admin button clicks - shows login modal or logs out
 */
function handleAdminClick() {
    if (isAdminAuthenticated()) {
        // Admin is logged in, so log them out
        logoutAdmin();
    } else {
        // Admin is not logged in, show login modal
        showAdminModal();
    }
}

/**
 * Shows the admin login modal
 */
function showAdminModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Focus on username field for better UX
        setTimeout(() => {
            const usernameField = document.getElementById('adminUsername');
            if (usernameField) usernameField.focus();
        }, 100);
    }
}

/**
 * Closes the admin login modal
 */
function closeAdminModal() {
    const modal = document.getElementById('adminLoginModal');
    const errorMessage = document.getElementById('adminLoginError');
    
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // Clear form and hide error message
    const form = document.getElementById('adminLoginForm');
    if (form) form.reset();
    
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
}

/**
 * Handles admin login form submission
 */
function handleAdminLogin(event) {
    event.preventDefault(); // Prevent form from submitting normally
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorMessage = document.getElementById('adminLoginError');
    
    // Attempt authentication using function from supabase-database.js
    if (authenticateAdmin(username, password)) {
        // Login successful - close modal and clear form
        closeAdminModal();
        console.log('Admin login successful');
    } else {
        // Login failed - show error message
        if (errorMessage) {
            errorMessage.classList.remove('hidden');
        }
        
        // Clear password field for security
        const passwordField = document.getElementById('adminPassword');
        if (passwordField) {
            passwordField.value = '';
            passwordField.focus();
        }
    }
}

// =============================================================================
// 15. DELETE RECIPE FUNCTION - Admin only
// =============================================================================

/**
 * Edits the currently displayed recipe (admin only)
 */
function editCurrentRecipe() {
    // Double-check admin authentication
    if (!isAdminAuthenticated()) {
        alert('Admin authentication required to edit recipes.');
        return;
    }
    
    // Safety check - ensure we have a valid recipe
    if (!recipes || recipes.length === 0 || currentRecipeIndex < 1 || currentRecipeIndex > recipes.length) {
        alert('No recipe to edit.');
        return;
    }
    
    // Get current recipe
    const currentRecipe = recipes[currentRecipeIndex - 1]; // Convert to 0-based index
    
    console.log('Editing recipe:', currentRecipe.title);
    
    // Switch to new recipe form view
    showNewRecipeView();
    
    // Populate form with current recipe data
    populateFormWithRecipe(currentRecipe);
    
    // Store the recipe being edited for later use
    window.editingRecipeIndex = currentRecipeIndex;
    window.editingRecipeId = currentRecipe.id;
}

/**
 * Populates the new recipe form with existing recipe data
 * @param {Object} recipe - The recipe object to populate form with
 */
function populateFormWithRecipe(recipe) {
    // Basic information
    document.getElementById('newRecipeTitle').value = recipe.title || '';
    document.getElementById('newRecipeTime').value = recipe.time || '';
    document.getElementById('newRecipeDifficulty').value = recipe.difficulty || '';
    document.getElementById('newRecipeTags').value = recipe.tags ? recipe.tags.join(', ') : '';
    
    // Handle image
    if (recipe.image) {
        document.getElementById('newRecipeImage').value = recipe.image;
        showImagePreview(recipe.image);
    } else {
        hideImagePreview();
    }
    
    // Populate timeline
    populateTimelineList(recipe.timeline || []);
    
    // Populate ingredients
    populateIngredientsList(recipe.ingredients || []);
    
    // Populate instructions
    populateInstructionsList(recipe.instructions || []);
}

/**
 * Helper function to populate timeline list
 */
function populateTimelineList(timeline) {
    const timelineList = document.querySelector('#timelineList');
    timelineList.innerHTML = '';
    
    timeline.forEach((step, index) => {
        const newItem = document.createElement('div');
        newItem.className = 'dynamic-item';
        newItem.innerHTML = `
            <input type="text" placeholder="Step - ex: Prep" class="form-input timeline-step-input" value="${step.step || ''}">
            <input type="text" placeholder="HH:MM" 
                   class="form-input timeline-time-input"
                   pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                   title="Enter time in HH:MM format (e.g., 00:15 for 15 minutes)"
                   value="${step.time || ''}">
            <button type="button" class="remove-btn" onclick="removeTimelineItem(this)">Remove</button>
        `;
        timelineList.appendChild(newItem);
    });
    
    // Add empty item if none exist
    if (timeline.length === 0) {
        addTimelineItem();
    }
}

/**
 * Helper function to populate ingredients list
 */
function populateIngredientsList(ingredients) {
    const ingredientsList = document.querySelector('#newRecipeIngredientsList');
    ingredientsList.innerHTML = '';
    
    ingredients.forEach((ingredient, index) => {
        const newItem = document.createElement('div');
        newItem.className = 'dynamic-item ingredient-item';
        
        // Handle both old string format and new object format
        let quantity = '', unit = '', name = '';
        if (typeof ingredient === 'string') {
            name = ingredient;
        } else {
            quantity = ingredient.quantity || '';
            unit = ingredient.unit || '';
            name = ingredient.ingredient || '';
        }
        
        newItem.innerHTML = `
            <div class="quantity-input-container">
                <input type="text" placeholder="Qty" class="form-input ingredient-quantity-input" 
                       title="Enter quantity (e.g., 2, 1½, ¾) - click for fraction help"
                       onfocus="showFractionHelper(this)" 
                       onblur="hideFractionHelper(this)"
                       value="${quantity}">
                <div class="fraction-helper hidden">
                    <div class="fraction-helper-title">Common Fractions:</div>
                    <div class="fraction-buttons">
                        <button type="button" class="fraction-btn" onclick="insertFraction(this, '½')">½</button>
                        <button type="button" class="fraction-btn" onclick="insertFraction(this, '¼')">¼</button>
                        <button type="button" class="fraction-btn" onclick="insertFraction(this, '¾')">¾</button>
                        <button type="button" class="fraction-btn" onclick="insertFraction(this, '⅓')">⅓</button>
                        <button type="button" class="fraction-btn" onclick="insertFraction(this, '⅔')">⅔</button>
                    </div>
                </div>
            </div>
            <input type="text" placeholder="Unit" class="form-input ingredient-unit-input" 
                   title="Enter unit (e.g., cups, tsp, tbsp, large)" value="${unit}">
            <input type="text" placeholder="Ingredient" class="form-input ingredient-name-input" 
                   title="Enter ingredient name (e.g., flour, eggs, salt)" value="${name}">
            <button type="button" class="remove-btn" onclick="removeIngredientItem(this)">Remove</button>
        `;
        ingredientsList.appendChild(newItem);
    });
    
    // Add empty item if none exist
    if (ingredients.length === 0) {
        addIngredientItem();
    }
}

/**
 * Helper function to populate instructions list
 */
function populateInstructionsList(instructions) {
    const instructionsList = document.querySelector('#newRecipeInstructionsList');
    instructionsList.innerHTML = '';
    
    instructions.forEach((instruction, index) => {
        const newItem = document.createElement('div');
        newItem.className = 'dynamic-item';
        newItem.innerHTML = `
            <textarea placeholder="Instruction step" class="form-textarea instruction-input" rows="2">${instruction || ''}</textarea>
            <button type="button" class="remove-btn" onclick="removeInstructionItem(this)">Remove</button>
        `;
        instructionsList.appendChild(newItem);
    });
    
    // Add empty item if none exist
    if (instructions.length === 0) {
        addInstructionItem();
    }
}

/**
 * Deletes the currently displayed recipe (admin only)
 */
async function deleteCurrentRecipe() {
    // Double-check admin authentication
    if (!isAdminAuthenticated()) {
        alert('Admin authentication required to delete recipes.');
        return;
    }
    
    // Safety check - ensure we have a valid recipe
    if (!recipes || recipes.length === 0 || currentRecipeIndex < 1 || currentRecipeIndex > recipes.length) {
        alert('No recipe to delete.');
        return;
    }
    
    // Get current recipe info for confirmation
    const currentRecipe = recipes[currentRecipeIndex - 1]; // Convert to 0-based index
    const recipeName = currentRecipe ? currentRecipe.title : 'this recipe';
    
    // Confirm deletion with user
    const confirmDelete = confirm(`Are you sure you want to permanently delete "${recipeName}"?\n\nThis action cannot be undone.`);
    
    if (!confirmDelete) {
        return; // User cancelled
    }
    
    try {
        // Show loading indicator
        showLoadingIndicator();
        
        // Delete from Supabase database if recipe has an ID
        if (currentRecipe.id) {
            console.log('Deleting recipe from Supabase:', currentRecipe.title);
            
            // Make DELETE request to Supabase
            const response = await fetch(`${SUPABASE_URL}/rest/v1/recipes?id=eq.${currentRecipe.id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to delete recipe from database: ${response.status}`);
            }
            
            console.log('Recipe deleted from Supabase successfully');
        }
        
        // Remove from local recipes array
        recipes.splice(currentRecipeIndex - 1, 1); // Remove from array
        
        // Handle navigation after deletion
        if (recipes.length === 0) {
            // No recipes left - show new recipe form
            hideLoadingIndicator();
            alert('All recipes have been deleted. You can add a new recipe.');
            showNewRecipeForm();
            return;
        }
        
        // Adjust current index if necessary
        if (currentRecipeIndex > recipes.length) {
            currentRecipeIndex = recipes.length; // Go to last recipe
        }
        
        // Load the recipe at the current index
        loadRecipe(currentRecipeIndex);
        
        hideLoadingIndicator();
        
        // Show success message
        alert(`Recipe "${recipeName}" has been deleted successfully.`);
        
    } catch (error) {
        hideLoadingIndicator();
        console.error('Error deleting recipe:', error);
        alert(`Failed to delete recipe: ${error.message}\n\nPlease try again or check your internet connection.`);
    }
}

// =============================================================================
// 16. EVENT LISTENERS AND INITIALIZATION
// =============================================================================

function setupEventListeners() {
    document.addEventListener('keydown', function(event) {
        if (currentView !== 'recipe') return;
        
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
            case 't':
            case 'T':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    showTableOfContents();
                }
                break;
        }
    });
}

// =============================================================================
// NOTE: This initializeApp function is now called by supabase-database.js
// after the database connection is established and recipes are loaded
// =============================================================================

// Initialize when DOM is ready - but wait for Supabase
document.addEventListener('DOMContentLoaded', initializeApp);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}