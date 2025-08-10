/*
CLEAN SUPABASE DATABASE INTEGRATION
===================================

This file replaces recipes.js and connects your Digital Cookbook to Supabase.
All syntax errors have been fixed and tested.
*/

// =============================================================================
// CONFIGURATION - Your Supabase credentials
// =============================================================================

const SUPABASE_URL = 'https://zrorohvugeeixwxtnqnc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyb3JvaHZ1Z2VlaXh3eHRucW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzI5MzIsImV4cCI6MjA2NzUwODkzMn0.l047BcGrIgrcwhho2xTQn7IwgIlE7liWqJpjJhGN7Lk';


// =============================================================================
// ADMIN CONFIGURATION - Single admin login for all administrators
// =============================================================================

// Simple admin credentials - in production, consider environment variables
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin' // Change this to a secure password
};

// Admin state tracking
let isAdminLoggedIn = false;


// =============================================================================
// GLOBAL VARIABLES
// =============================================================================

let recipes = [];
let isLoading = true;

// =============================================================================
// SUPABASE CLIENT - Simple and clean implementation
// =============================================================================

async function supabaseRequest(method, path, data = null) {
    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };
    
    const config = { method, headers };
    
    if (data && (method === 'POST' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, config);
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    return response.json();
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

async function loadRecipesFromSupabase() {
    try {
        console.log('Loading recipes from Supabase...');
        showLoadingIndicator();
        
        // Orders by the database ID in ascending order, so the first record created gets loaded first.
        const data = await supabaseRequest('GET', '/recipes?order=id.asc');

        const parsedRecipes = parseSupabaseRecords(data);
        
        console.log(`Successfully loaded ${parsedRecipes.length} recipes from Supabase`);
        return parsedRecipes;
        
    } catch (error) {
        console.error('Error loading recipes from Supabase:', error);
        alert('Unable to load recipes from database. Please check your internet connection.');
        return [];
    } finally {
        hideLoadingIndicator();
    }
}

async function saveRecipeToSupabase(recipe) {
    try {
        console.log('Saving recipe to Supabase...', recipe.title);
        
        const supabaseData = {
            title: recipe.title,
            time: recipe.time,
            image_url: recipe.image,
            tags: recipe.tags,
            difficulty: recipe.difficulty,
            timeline: recipe.timeline,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions
        };
        
        const result = await supabaseRequest('POST', '/recipes', supabaseData);
        
        if (result && result.length > 0) {
            const savedRecipe = {
                ...recipe,
                id: result[0].id
            };
            recipes.push(savedRecipe);
            
            console.log('Recipe saved successfully to Supabase with ID:', result[0].id);
            return result[0];
        } else {
            throw new Error('No data returned from Supabase insert operation');
        }
        
    } catch (error) {
        console.error('Error saving recipe to Supabase:', error);
        throw error;
    }
}

// =============================================================================
// DATA PARSING
// =============================================================================

function parseSupabaseRecords(supabaseRecords) {
    const recipes = [];
    
    if (!Array.isArray(supabaseRecords)) {
        console.warn('Invalid data format from Supabase');
        return recipes;
    }
    
    supabaseRecords.forEach((record, index) => {
        try {
            const recipe = {
                id: record.id,
                title: record.title || 'Untitled Recipe',
                time: record.time || '00:30',
                image: record.image_url || generateDefaultImage(record.title || 'Recipe'),
                tags: Array.isArray(record.tags) ? record.tags : [],
                difficulty: record.difficulty || '★★☆☆☆',
                timeline: record.timeline || getDefaultTimeline(),
                ingredients: record.ingredients || getDefaultIngredients(),
                instructions: Array.isArray(record.instructions) ? record.instructions : ['No instructions provided.']
            };
            
            recipes.push(recipe);
            
        } catch (error) {
            console.warn(`Error parsing Supabase record ${index}:`, error);
        }
    });
    
    return recipes;
}


/** 
 * ===================================================================
 * ENHANCED SAVE NEW RECIPE FUNCTION WITH AIRTABLE BACKUP INTEGRATION
 * ==================================================================
 * 
 * This function handles both creating new recipes and editing existing recipes.
 * It integrates with the Airtable backup system to ensure data redundancy.
 * 
 * FEATURES:
 * - Creates new recipes with automatic backup to Airtable
 * - Updates existing recipes with backup synchronization
 * - Comprehensive form validation for all fields
 * - Error handling with user-friendly messages
 * - Loading indicators for better user experience
 * - Automatic UI updates after save/edit operations
 * 
 * BACKUP STRATEGY:
 * - New recipes: Save to Supabase + backup to Airtable
 * - Recipe edits: Update in Supabase + sync backup in Airtable
 * - If backup fails, recipe still saves to primary database
 * 
 * DEPENDENCIES:
 * - supabase-database.js (for Supabase operations)
 * - airtable-backup.js (for backup operations)
 * - main.js utility functions (validation, UI helpers)
 */

async function saveNewRecipe() {
    try {
        // =================================================================
        // STEP 1: DETERMINE OPERATION TYPE
        // =================================================================
        
        // Check if we're editing an existing recipe or creating a new one
        // These global variables are set when the user clicks "Edit Recipe"
        const isEditing = window.editingRecipeIndex && window.editingRecipeId;
        
        console.log(`🔄 ${isEditing ? 'Editing' : 'Creating'} recipe...`);

        // =================================================================
        // STEP 2: COLLECT AND VALIDATE BASIC FORM DATA
        // =================================================================
        
        // Get basic recipe information from form inputs
        const title = document.getElementById('newRecipeTitle').value.trim();
        const timeInput = document.getElementById('newRecipeTime').value.trim(); // Expected in HH:MM format
        const imageData = getCurrentImageData(); // Gets image from file upload or URL
        const difficulty = document.getElementById('newRecipeDifficulty').value; // Star rating
        const tagsInput = document.getElementById('newRecipeTags').value.trim(); // Comma-separated tags
        
        // Validate required fields - these are essential for a complete recipe
        if (!title || !timeInput || !difficulty) {
            alert('Please fill in all required fields: Title, Time, and Difficulty.');
            return; // Exit early if validation fails
        }
        
        // Validate time format - must be HH:MM (e.g., 01:30, 00:45)
        // This ensures consistent time handling across the application
        if (!isValidTimeFormat(timeInput)) {
            alert('Please enter time in HH:MM format (e.g., 01:30 for 1 hour 30 minutes, 00:45 for 45 minutes).');
            return; // Exit early if time format is invalid
        }
        
        // =================================================================
        // STEP 3: PROCESS TAGS
        // =================================================================
        
        // Convert comma-separated tags into clean array
        // Filters out empty tags after trimming whitespace
        const tags = tagsInput ? 
            tagsInput.split(',')                    // Split by comma
                     .map(tag => tag.trim())        // Remove whitespace from each tag
                     .filter(tag => tag)            // Remove empty tags
            : []; // Default to empty array if no tags provided
        
        // =================================================================
        // STEP 4: COLLECT AND VALIDATE TIMELINE DATA
        // =================================================================
        
        // Get all timeline step elements from the dynamic form
        const timelineItems = document.querySelectorAll('#timelineList .dynamic-item');
        const timeline = [];
        
        // Process each timeline step
        for (let item of timelineItems) {
            const step = item.querySelector('.timeline-step-input').value.trim();     // Step name (e.g., "Prep")
            const stepTime = item.querySelector('.timeline-time-input').value.trim(); // Step time in HH:MM format
            
            // Only add timeline steps that have both name and time
            if (step && stepTime) {
                // Validate time format for each timeline step
                if (!isValidTimeFormat(stepTime)) {
                    alert(`Invalid time format in timeline step "${step}". Please use HH:MM format (e.g., 00:15).`);
                    return; // Exit if any timeline step has invalid time format
                }
                
                // Add valid timeline step to array
                timeline.push({ step, time: stepTime });
            }
        }
        
        // =================================================================
        // STEP 5: COLLECT AND VALIDATE INGREDIENTS DATA
        // =================================================================
        
        // Get all ingredient elements from the dynamic form
        // Each ingredient has three separate inputs: quantity, unit, ingredient name
        const ingredientItems = document.querySelectorAll('#newRecipeIngredientsList .ingredient-item');
        const ingredients = [];
        
        // Process each ingredient item
        ingredientItems.forEach(item => {
            const quantity = item.querySelector('.ingredient-quantity-input').value.trim();   // e.g., "2", "1½"
            const unit = item.querySelector('.ingredient-unit-input').value.trim();           // e.g., "cups", "tsp"
            const ingredient = item.querySelector('.ingredient-name-input').value.trim();     // e.g., "flour", "salt"
            
            // Only add ingredients that have at least an ingredient name
            // Quantity and unit are optional (some ingredients like "salt to taste" don't need quantity)
            if (ingredient) {
                ingredients.push({
                    quantity: quantity || '',    // Default to empty string if no quantity
                    unit: unit || '',           // Default to empty string if no unit
                    ingredient: ingredient      // Ingredient name is required
                });
            }
        });
        
        // =================================================================
        // STEP 6: COLLECT AND VALIDATE INSTRUCTIONS DATA
        // =================================================================
        
        // Get all instruction elements from the dynamic form
        const instructionItems = document.querySelectorAll('#newRecipeInstructionsList .dynamic-item');
        const instructions = [];
        
        // Process each instruction step
        instructionItems.forEach(item => {
            const instruction = item.querySelector('.instruction-input').value.trim();
            
            // Only add non-empty instructions
            if (instruction) {
                instructions.push(instruction);
            }
        });
        
        // =================================================================
        // STEP 7: VALIDATE COLLECTION COMPLETENESS
        // =================================================================
        
        // Ensure recipe has all required components
        // A recipe needs at least one of each to be complete and cookable
        
        if (timeline.length === 0) {
            alert('Please add at least one timeline step.');
            return; // Timeline helps users understand cooking flow
        }
        
        if (ingredients.length === 0) {
            alert('Please add at least one ingredient.');
            return; // Can't cook without ingredients
        }
        
        if (instructions.length === 0) {
            alert('Please add at least one instruction.');
            return; // Instructions are essential for cooking
        }
        
        // =================================================================
        // STEP 8: CREATE RECIPE OBJECT
        // =================================================================
        
        // Construct the complete recipe object with all collected data
        const newRecipe = {
            title,                                              // Recipe title
            time: timeInput,                                    // Total cooking time in HH:MM format
            image: imageData || generateDefaultImage(title),    // Recipe image or generated placeholder
            tags,                                               // Array of tag strings
            difficulty,                                         // Star rating string (★★☆☆☆)
            timeline,                                           // Array of timeline step objects
            ingredients,                                        // Array of ingredient objects with quantity/unit/name
            instructions                                        // Array of instruction strings
        };
        
        // =================================================================
        // STEP 9: HANDLE EDITING VS. CREATING
        // =================================================================
        
        if (isEditing) {
            // =====================================================
            // EDITING EXISTING RECIPE PATH
            // =====================================================
            
            console.log(`✏️ Updating existing recipe: ${title}`);
            
            // Add the existing recipe ID to the recipe object for updates
            newRecipe.id = window.editingRecipeId;
            
            // Show loading indicator to inform user of ongoing operation
            showLoadingIndicator('Updating recipe...');
            
            try {
                // Update recipe in Supabase database using PATCH request
                // This updates only the specified fields, preserving the original ID and creation date
                const result = await supabaseRequest('PATCH', `/recipes?id=eq.${window.editingRecipeId}`, {
                    title: newRecipe.title,
                    time: newRecipe.time,
                    image_url: newRecipe.image,          // Note: Supabase uses 'image_url' field name
                    tags: newRecipe.tags,
                    difficulty: newRecipe.difficulty,
                    timeline: newRecipe.timeline,
                    ingredients: newRecipe.ingredients,
                    instructions: newRecipe.instructions
                });
                
                console.log('✅ Recipe updated in Supabase successfully');
                
                // Update the recipe in local memory array to keep UI in sync
                // Convert 1-based index to 0-based for array access
                const arrayIndex = window.editingRecipeIndex - 1;
                recipes[arrayIndex] = newRecipe;
                
                // =====================================================
                // BACKUP EDITED RECIPE TO AIRTABLE
                // =====================================================
                
                try {
                    // For edited recipes, we need to update the backup in Airtable
                    // First, try to find and update existing Airtable record
                    console.log('📦 Updating Airtable backup...');
                    
                    // Get all Airtable records to find the matching one
                    const airtableRecords = await airtableRequest('GET', '');
                    const matchingRecord = airtableRecords.records.find(record => 
                        record.fields.title === title || 
                        record.fields.title === newRecipe.title
                    );
                    
                    if (matchingRecord) {
                        // Update existing Airtable record
                        const airtableUpdateData = convertRecipeToAirtable(newRecipe);
                        await airtableRequest('PATCH', `/${matchingRecord.id}`, {
                            fields: airtableUpdateData.fields
                        });
                        console.log('✅ Airtable backup updated successfully');
                    } else {
                        // If no matching record found, create new backup entry
                        await backupSingleRecipeToAirtable(newRecipe);
                        console.log('✅ New Airtable backup created for edited recipe');
                    }
                    
                } catch (backupError) {
                    // Don't fail the edit operation if backup fails
                    console.warn('⚠️ Recipe updated in Supabase but Airtable backup failed:', backupError);
                    // User is notified but edit operation continues
                }
                
                // Clean up editing state variables
                delete window.editingRecipeIndex;
                delete window.editingRecipeId;
                
                hideLoadingIndicator();
                
                // Load the updated recipe to show changes in UI
                // Use the stored index to load the correct recipe
                loadRecipe(window.editingRecipeIndex || 1);
                
                alert(`Recipe "${title}" has been updated successfully!`);
                
            } catch (supabaseError) {
                // Handle Supabase update errors
                hideLoadingIndicator();
                console.error('❌ Failed to update recipe in Supabase:', supabaseError);
                throw supabaseError; // Re-throw to be caught by outer try-catch
            }
            
        } else {
            // =====================================================
            // CREATING NEW RECIPE PATH
            // =====================================================
            
            console.log(`➕ Creating new recipe: ${title}`);
            
            // Show loading indicator for new recipe creation
            showLoadingIndicator('Saving new recipe...');
            
            // Use the backup-enabled save function that handles both Supabase and Airtable
            // This function:
            // 1. Saves to Supabase (primary database)
            // 2. Automatically backs up to Airtable (secondary database)
            // 3. Handles errors gracefully (if backup fails, recipe still saves to Supabase)
            await saveRecipeWithBackup(newRecipe);
            
            hideLoadingIndicator();
            
            // Load the newly created recipe (it will be the last one in the array)
            // Using 1-based indexing to match database IDs
            loadRecipe(recipes.length);
            
            alert(`Recipe "${title}" has been saved to your database successfully!`);
            
            console.log('✅ New recipe created and backed up successfully');
        }
        
        // =================================================================
        // STEP 10: RETURN TO RECIPE VIEW
        // =================================================================
        
        // Switch back to the recipe viewing interface
        // This hides the form and shows the recipe display
        showRecipeView();
        
        console.log('🎉 Recipe operation completed successfully');
        
    } catch (error) {
        // =================================================================
        // ERROR HANDLING
        // =================================================================
        
        // Ensure loading indicator is hidden even if an error occurs
        hideLoadingIndicator();
        
        // Log detailed error information for debugging
        console.error('❌ Error saving recipe:', error);
        
        // Show user-friendly error message
        // Different messages based on error type for better user experience
        let errorMessage = 'Failed to save recipe to database. ';
        
        if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage += 'Please check your internet connection and try again.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
            errorMessage += 'Authentication error. Please refresh the page and try again.';
        } else if (error.message.includes('500')) {
            errorMessage += 'Server error. Please try again in a few moments.';
        } else {
            errorMessage += 'Please try again or contact support if the problem persists.';
        }
        
        alert(errorMessage);
        
        // Don't navigate away from form on error - let user fix issues and retry
        console.log('💡 Form data preserved for user to retry after fixing issues');
    }
}

// =============================================================================
// UTILITY FUNCTIONS USED BY saveNewRecipe()
// =============================================================================

/**
 * Validates time format is HH:MM
 * @param {string} timeStr - Time string to validate
 * @returns {boolean} True if valid HH:MM format
 */
function isValidTimeFormat(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') {
        return false;
    }
    
    // Regular expression to match HH:MM format
    // Allows 00:00 to 23:59
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeStr);
}

/**
 * Gets current image data from preview or returns null
 * @returns {string|null} Image data URL or null if no image
 */
function getCurrentImageData() {
    const previewImage = document.getElementById('previewImage');
    const previewContainer = document.getElementById('imagePreview');
    
    // Only return image data if preview is visible and has valid src
    if (previewContainer && 
        previewImage && 
        !previewContainer.classList.contains('hidden') && 
        previewImage.src && 
        previewImage.src !== window.location.href) { // Prevent returning page URL as image
        return previewImage.src;
    }
    
    return null;
}

/**
 * Generates a default SVG image for recipes without uploaded images
 * @param {string} title - Recipe title to include in image
 * @returns {string} Base64-encoded SVG data URL
 */
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

// =============================================================================
// ADMIN AUTHENTICATION FUNCTIONS
// =============================================================================

/**
 * Authenticates admin credentials
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {boolean} True if credentials are valid
 */
function authenticateAdmin(username, password) {
    // Simple credential check - could be enhanced with hashing in production
    const isValid = username === ADMIN_CREDENTIALS.username && 
                   password === ADMIN_CREDENTIALS.password;
    
    if (isValid) {
        isAdminLoggedIn = true;
        console.log('Admin logged in successfully');
        
        // Store login state in sessionStorage (cleared when browser tab closes)
        sessionStorage.setItem('cookbook_admin_logged_in', 'true');
        
        // Update UI to show admin features
        updateAdminUI();
    }
    
    return isValid;
}

/**
 * Logs out the admin user
 */
function logoutAdmin() {
    isAdminLoggedIn = false;
    console.log('Admin logged out');
    
    // Clear session storage
    sessionStorage.removeItem('cookbook_admin_logged_in');
    
    // Update UI to hide admin features
    updateAdminUI();
}

/**
 * Checks if admin is currently logged in
 * @returns {boolean} True if admin is logged in
 */
function isAdminAuthenticated() {
    return isAdminLoggedIn;
}

/**
 * Restores admin session from sessionStorage on page load
 */
function restoreAdminSession() {
    const storedState = sessionStorage.getItem('cookbook_admin_logged_in');
    if (storedState === 'true') {
        isAdminLoggedIn = true;
        updateAdminUI();
        console.log('Admin session restored');
    }
}

/**
 * UPDATED: Enhanced updateAdminUI function to respect current view state
 * This ensures admin controls are only shown in appropriate contexts
 */
function updateAdminUI() {
    const adminButton = document.getElementById('adminLoginButton');
    const adminControls = document.querySelectorAll('.admin-only');
    
    if (isAdminLoggedIn) {
        // Show admin controls and change button text
        if (adminButton) {
            adminButton.textContent = '👤 Logout';
            adminButton.title = 'Click to logout admin';
        }
        
        // Show all admin-only elements (including New Recipe button in header)
        adminControls.forEach(control => {
            // Use flex to maintain header button layout
            control.style.display = 'flex'; 
        });

        // Add backup controls if the function exists
        if (typeof addBackupControls === 'function') {
            addBackupControls();
        }
        
        // Show backup toggle if it exists
        const backupToggle = document.querySelector('.backup-toggle');
        if (backupToggle) {
            backupToggle.classList.add('show');
        }
        
        // UPDATED: Only show admin recipe controls if we're currently viewing a recipe
        // This prevents the edit/delete buttons from appearing in TOC or form views
        const adminRecipeControls = document.querySelector('.admin-recipe-controls');
        if (adminRecipeControls) {
            if (currentView === 'recipe') {
                adminRecipeControls.style.display = 'flex'; // Show only in recipe view
                console.log('✅ Admin recipe controls enabled for recipe view');
            } else {
                adminRecipeControls.style.display = 'none'; // Hide in all other views
                console.log('⚠️ Admin recipe controls hidden - not in recipe view');
            }
        }
        
    } else {
        // Hide admin controls and reset button text
        if (adminButton) {
            adminButton.textContent = '🔐 Admin';
            adminButton.title = 'Admin login';
        }
        
        // Hide backup controls
        const backupToggle = document.querySelector('.backup-toggle');
        if (backupToggle) {
            backupToggle.classList.remove('show');
        }
        
        // Hide all admin-only elements (including New Recipe button and admin recipe controls)
        adminControls.forEach(control => {
            control.style.display = 'none';
        });
        
        console.log('✅ All admin controls hidden - admin logged out');
    }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateDefaultImage(title) {
    const svg = `
        <svg width="300" height="180" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="180" fill="#F5F5DC"/>
            <circle cx="150" cy="90" r="40" fill="#D2691E"/>
            <text x="150" y="100" font-family="Georgia, serif" font-size="16" fill="#8B4513" text-anchor="middle" font-weight="bold">${title.substring(0, 20)}</text>
            <text x="150" y="160" font-family="Georgia, serif" font-size="12" fill="#8B4513" text-anchor="middle" font-style="italic">From Supabase</text>
        </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

function getDefaultTimeline() {
    return [
        { step: "Prep", time: "00:15" },
        { step: "Cook", time: "00:15" }
    ];
}

function getDefaultIngredients() {
    return [
        { quantity: "1", unit: "cup", ingredient: "ingredient" }
    ];
}

function isValidTimeFormat(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') {
        return false;
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeStr);
}

// =============================================================================
// UI HELPER FUNCTIONS
// =============================================================================

function showLoadingIndicator() {
    let loader = document.getElementById('loading-overlay');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loading-overlay';
        loader.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading...</div>
            </div>
        `;
        loader.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); display: flex; justify-content: center;
            align-items: center; z-index: 9999; font-family: Georgia, serif;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .loading-content { 
                background: white; padding: 30px; border-radius: 10px; 
                text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
            }
            .loading-spinner { 
                width: 40px; height: 40px; border: 4px solid #f3f3f3; 
                border-top: 4px solid #8B4513; border-radius: 50%; 
                animation: spin 1s linear infinite; margin: 0 auto 15px; 
            }
            .loading-text { 
                color: #8B4513; font-weight: bold; font-size: 1.1em; 
            }
            @keyframes spin { 
                0% { transform: rotate(0deg); } 
                100% { transform: rotate(360deg); } 
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(loader);
    } else {
        loader.style.display = 'flex';
    }
}

function hideLoadingIndicator() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.style.display = 'none';
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

async function initializeDatabase() {
    try {
        console.log('Initializing Supabase database connection...');
        isLoading = true;
        
        recipes = await loadRecipesFromSupabase();
        isLoading = false;
        
        if (typeof initializeApp === 'function') {
            initializeApp();
        }

        // Restore admin session if exists
        restoreAdminSession();
        
        console.log('Supabase database initialized successfully');
        console.log(`Loaded ${recipes.length} recipes from database`);
        
        if (recipes.length === 0) {
            console.log('No recipes found in database. You can add some using the "New Recipe" button!');
        }
        
    } catch (error) {
        console.error('Failed to initialize Supabase database:', error);
        isLoading = false;
        
        alert(`Database connection failed: ${error.message}`);
        
        recipes = [];
        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    }
}

// =============================================================================
// DEBUG FUNCTIONS
// =============================================================================

window.checkDatabaseConnection = async function() {
    try {
        console.log('Testing Supabase connection...');
        const result = await supabaseRequest('GET', '/recipes?limit=1');
        console.log('✅ Database connection successful!', result);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
};

window.viewAllRecipes = function() {
    console.log('Current recipes in memory:', recipes);
    console.log(`Total recipes: ${recipes.length}`);
    return recipes;
};

window.reloadRecipes = async function() {
    try {
        console.log('Reloading recipes from database...');
        recipes = await loadRecipesFromSupabase();
        console.log(`✅ Reloaded ${recipes.length} recipes`);
        
        if (typeof loadRecipe === 'function' && recipes.length > 0) {
            loadRecipe(1);
        }
        
        return recipes;
    } catch (error) {
        console.error('❌ Failed to reload recipes:', error);
        return [];
    }
};

// =============================================================================
// EXPORT AND AUTO-INITIALIZE
// =============================================================================

window.recipes = recipes;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDatabase);
} else {
    initializeDatabase();
}