/*
MAIN JAVASCRIPT FUNCTIONALITY
==============================

This file contains all interactive functionality for the Digital Cookbook.
It manages recipe loading, user interactions, dynamic content updates, and the new
three-button navigation system (Table of Contents, Random Recipe, New Recipe).
*/

// =============================================================================
// 1. GLOBAL VARIABLES - State management and tracking
// =============================================================================

// Current recipe index tracker (starts with first recipe)
let currentRecipeIndex = 0;

// Current view state tracker ('recipe', 'toc', 'newRecipe')
let currentView = 'recipe';

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

    // Switch back to recipe view if we're in a different view
    showRecipeView();

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
// 5. VIEW MANAGEMENT - Toggle between recipe, TOC, and form views
// =============================================================================

/**
 * Shows the main recipe view and hides other views
 */
function showRecipeView() {
    // Hide table of contents
    document.getElementById('tableOfContents').classList.add('hidden');
    document.getElementById('recipeView').classList.remove('hidden');
    
    // Hide new recipe form LEFT side
    document.getElementById('newRecipeFormLeft').classList.add('hidden');
    
    // Hide new recipe form RIGHT side  
    document.getElementById('newRecipeFormRight').classList.add('hidden');
    document.getElementById('recipeDetailsView').classList.remove('hidden');
    
    // Show navigation controls
    document.querySelector('.nav-controls').style.display = 'flex';
    
    currentView = 'recipe';
}

/**
 * Shows the table of contents view and hides recipe content
 */
function showTOCView() {
    // Show table of contents
    document.getElementById('recipeView').classList.add('hidden');
    document.getElementById('tableOfContents').classList.remove('hidden');
    
    // Hide new recipe form LEFT side
    document.getElementById('newRecipeFormLeft').classList.add('hidden');
    
    // Hide new recipe form RIGHT side
    document.getElementById('newRecipeFormRight').classList.add('hidden');
    document.getElementById('recipeDetailsView').classList.remove('hidden');
    
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
    // Hide table of contents from left page  
    document.getElementById('tableOfContents').classList.add('hidden');
    // Show new recipe form LEFT SIDE on left page
    document.getElementById('newRecipeFormLeft').classList.remove('hidden');
    
    // Hide recipe details from right page
    document.getElementById('recipeDetailsView').classList.add('hidden');
    // Show new recipe form RIGHT SIDE on right page
    document.getElementById('newRecipeFormRight').classList.remove('hidden');
    
    // Hide navigation controls (not relevant for form)
    document.querySelector('.nav-controls').style.display = 'none';
    
    currentView = 'newRecipe';
}

// =============================================================================
// 6. TABLE OF CONTENTS FUNCTIONS - Generate and handle recipe index
// =============================================================================

/**
 * Shows the table of contents with all available recipes
 */
function showTableOfContents() {
    showTOCView();
    generateTagFilters();
    updateTableOfContents();
}

/**
 * Generates tag filter checkboxes
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
 * Updates the table of contents with current sorting and filtering
 */
function updateTableOfContents() {
    const sortBy = document.getElementById('tocSortBy').value;
    const selectedTags = getSelectedTags();

    let filteredRecipes = recipes.filter((recipe) => {
        if (selectedTags.length === 0) return true;
        return recipe.tags.some(tag => selectedTags.includes(tag));
    }).map((recipe) => {
        return {
            ...recipe,
            originalIndex: recipes.indexOf(recipe)
        };
    });

    filteredRecipes.sort((a, b) => {
        switch (sortBy) {
            case 'alphabetical':
                return a.title.localeCompare(b.title);
            case 'difficulty':
                const getDifficultyValue = (stars) => stars.split('★').length - 1;
                return getDifficultyValue(a.difficulty) - getDifficultyValue(b.difficulty);
            case 'time':
                const getTimeValue = (timeStr) => {
                    const match = timeStr.match(/(\d+)/);
                    return match ? parseInt(match[1]) : 0;
                };
                return getTimeValue(a.time) - getTimeValue(b.time);
            default:
                return 0;
        }
    });

    document.getElementById('recipeCount').textContent =
        `Showing ${filteredRecipes.length} of ${recipes.length} recipes`;

    generateFilteredTableOfContents(filteredRecipes);
}

/**
 * Gets the currently selected tags
 */
function getSelectedTags() {
    const checkboxes = document.querySelectorAll('#tagFilters input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Generates the filtered table of contents
 */
function generateFilteredTableOfContents(recipesToShow) {
    const tocContainer = document.getElementById('tocRecipesList');
    tocContainer.innerHTML = '';
    
    recipesToShow.forEach((recipe) => {
        const tocEntry = document.createElement('div');
        tocEntry.className = 'toc-recipe';
        tocEntry.onclick = () => loadRecipe(recipe.originalIndex);
        
        tocEntry.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" class="toc-recipe-image">
            <div class="toc-recipe-info">
                <div class="toc-recipe-title">${recipe.title}</div>
                <div class="toc-recipe-meta">
                    <span>⏱️ ${recipe.time}</span>
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
// 7. RANDOM RECIPE FUNCTION
// =============================================================================

/**
 * Selects and displays a random recipe
 */
function showRandomRecipe() {
    const randomIndex = Math.floor(Math.random() * recipes.length);
    loadRecipe(randomIndex);
}

// =============================================================================
// 8. NEW RECIPE FORM FUNCTIONS
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
            <input type="text" placeholder="Step name (e.g., Prep)" class="form-input timeline-step-input">
            <input type="text" placeholder="Time (e.g., 15 min)" class="form-input timeline-time-input">
            <button type="button" class="remove-btn" onclick="removeTimelineItem(this)">Remove</button>
        </div>
    `;
}

function resetIngredientsList() {
    const ingredientsList = document.querySelector('#newRecipeIngredientsList');
    ingredientsList.innerHTML = `
        <div class="dynamic-item">
            <input type="text" placeholder="Ingredient with measurement" class="form-input ingredient-input">
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
 * Dynamic list management functions
 */
function addTimelineItem() {
    const timelineList = document.querySelector('#timelineList');
    const newItem = document.createElement('div');
    newItem.className = 'dynamic-item';
    newItem.innerHTML = `
        <input type="text" placeholder="Step name (e.g., Prep)" class="form-input timeline-step-input">
        <input type="text" placeholder="Time (e.g., 15 min)" class="form-input timeline-time-input">
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

function addIngredientItem() {
    const ingredientsList = document.querySelector('#newRecipeIngredientsList');
    const newItem = document.createElement('div');
    newItem.className = 'dynamic-item';
    newItem.innerHTML = `
        <input type="text" placeholder="Ingredient with measurement" class="form-input ingredient-input">
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
 * Saves a new recipe
 */
function saveNewRecipe() {
    const title = document.getElementById('newRecipeTitle').value.trim();
    const time = document.getElementById('newRecipeTime').value.trim();
    const imageData = getCurrentImageData();
    const difficulty = document.getElementById('newRecipeDifficulty').value;
    const tagsInput = document.getElementById('newRecipeTags').value.trim();
    
    if (!title || !time || !difficulty) {
        alert('Please fill in all required fields: Title, Time, and Difficulty.');
        return;
    }
    
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // Collect timeline data
    const timelineItems = document.querySelectorAll('#timelineList .dynamic-item');
    const timeline = [];
    timelineItems.forEach(item => {
        const step = item.querySelector('.timeline-step-input').value.trim();
        const stepTime = item.querySelector('.timeline-time-input').value.trim();
        if (step && stepTime) {
            timeline.push({ step, time: stepTime });
        }
    });
    
    // Collect ingredients
    const ingredientItems = document.querySelectorAll('#newRecipeIngredientsList .dynamic-item');
    const ingredients = [];
    ingredientItems.forEach(item => {
        const ingredient = item.querySelector('.ingredient-input').value.trim();
        if (ingredient) {
            ingredients.push(ingredient);
        }
    });
    
    // Collect instructions
    const instructionItems = document.querySelectorAll('#newRecipeInstructionsList .dynamic-item');
    const instructions = [];
    instructionItems.forEach(item => {
        const instruction = item.querySelector('.instruction-input').value.trim();
        if (instruction) {
            instructions.push(instruction);
        }
    });
    
    if (timeline.length === 0) {
        alert('Please add at least one timeline step.');
        return;
    }
    if (ingredients.length === 0) {
        alert('Please add at least one ingredient.');
        return;
    }
    if (instructions.length === 0) {
        alert('Please add at least one instruction.');
        return;
    }
    
    const newRecipe = {
        title,
        time,
        image: imageData || generateDefaultImage(title),
        tags,
        difficulty,
        timeline,
        ingredients,
        instructions
    };
    
    recipes.push(newRecipe);
    loadRecipe(recipes.length - 1);
    alert(`Recipe "${title}" has been added successfully!`);
}

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
// 9. IMAGE HANDLING FUNCTIONS
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
// 10. INTERACTIVE FEATURES
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
// 11. EVENT LISTENERS AND INITIALIZATION
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

function initializeApp() {
    loadRecipe(0);
    setupEventListeners();
    showRecipeView();
    
    console.log('Digital Cookbook initialized successfully');
    console.log(`Loaded ${recipes.length} recipes`);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}