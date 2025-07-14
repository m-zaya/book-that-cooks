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

// =============================================================================
// ENHANCED SAVE FUNCTION - Replaces the one in main.js
// =============================================================================

async function saveNewRecipe() {
    try {
        // Check if we're editing an existing recipe
        const isEditing = window.editingRecipeIndex && window.editingRecipeId;

        // Get form data
        const title = document.getElementById('newRecipeTitle').value.trim();
        const timeInput = document.getElementById('newRecipeTime').value.trim();
        const imageData = getCurrentImageData();
        const difficulty = document.getElementById('newRecipeDifficulty').value;
        const tagsInput = document.getElementById('newRecipeTags').value.trim();
        
        // Validation
        if (!title || !timeInput || !difficulty) {
            alert('Please fill in all required fields: Title, Time, and Difficulty.');
            return;
        }
        
        if (!isValidTimeFormat(timeInput)) {
            alert('Please enter time in HH:MM format (e.g., 01:30 for 1 hour 30 minutes, 00:45 for 45 minutes).');
            return;
        }
        
        // Collect form data
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        // Collect timeline data
        const timelineItems = document.querySelectorAll('#timelineList .dynamic-item');
        const timeline = [];
        for (let item of timelineItems) {
            const step = item.querySelector('.timeline-step-input').value.trim();
            const stepTime = item.querySelector('.timeline-time-input').value.trim();
            
            if (step && stepTime) {
                if (!isValidTimeFormat(stepTime)) {
                    alert(`Invalid time format in timeline step "${step}". Please use HH:MM format (e.g., 00:15).`);
                    return;
                }
                timeline.push({ step, time: stepTime });
            }
        }
        
        // Collect ingredients data
        const ingredientItems = document.querySelectorAll('#newRecipeIngredientsList .ingredient-item');
        const ingredients = [];
        ingredientItems.forEach(item => {
            const quantity = item.querySelector('.ingredient-quantity-input').value.trim();
            const unit = item.querySelector('.ingredient-unit-input').value.trim();
            const ingredient = item.querySelector('.ingredient-name-input').value.trim();
            
            if (ingredient) {
                ingredients.push({
                    quantity: quantity || '',
                    unit: unit || '',
                    ingredient: ingredient
                });
            }
        });
        
        // Collect instructions data
        const instructionItems = document.querySelectorAll('#newRecipeInstructionsList .dynamic-item');
        const instructions = [];
        instructionItems.forEach(item => {
            const instruction = item.querySelector('.instruction-input').value.trim();
            if (instruction) {
                instructions.push(instruction);
            }
        });
        
        // Validate collections
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
        
        // Create recipe object
        const newRecipe = {
            title,
            time: timeInput,
            image: imageData || generateDefaultImage(title),
            tags,
            difficulty,
            timeline,
            ingredients,
            instructions
        };
        
        if (isEditing) {
            // Update existing recipe
            newRecipe.id = window.editingRecipeId;
            
            // Update in Supabase
            showLoadingIndicator();
            const result = await supabaseRequest('PATCH', `/recipes?id=eq.${window.editingRecipeId}`, {
                title: newRecipe.title,
                time: newRecipe.time,
                image_url: newRecipe.image,
                tags: newRecipe.tags,
                difficulty: newRecipe.difficulty,
                timeline: newRecipe.timeline,
                ingredients: newRecipe.ingredients,
                instructions: newRecipe.instructions
            });
            
            // Update local array
            const arrayIndex = window.editingRecipeIndex - 1;
            recipes[arrayIndex] = newRecipe;
            
            // Clean up editing state
            delete window.editingRecipeIndex;
            delete window.editingRecipeId;
            
            hideLoadingIndicator();
            
            // Load the updated recipe
            loadRecipe(window.editingRecipeIndex || 1);
            
            alert(`Recipe "${title}" has been updated successfully!`);
        } else {
            // Save new recipe (existing code)
            showLoadingIndicator();
            await saveRecipeToSupabase(newRecipe);
            hideLoadingIndicator();
            
            // Load the new recipe
            loadRecipe(recipes.length);
            
            alert(`Recipe "${title}" has been saved to your database successfully!`);
        }
        
        // Return to recipe view
        showRecipeView();
        
    } catch (error) {
        hideLoadingIndicator();
        console.error('Error saving recipe:', error);
        alert('Failed to save recipe to database. Please check your internet connection and try again.');
    }
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
 * Updates the UI to show/hide admin features based on login status
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
        
        // Show all admin-only elements (including New Recipe button)
        adminControls.forEach(control => {
            // Use flex to maintain header button layout
            control.style.display = 'flex'; 
        });
    } else {
        // Hide admin controls and reset button text
        if (adminButton) {
            adminButton.textContent = '🔐 Admin';
            adminButton.title = 'Admin login';
        }
        
        // Hide all admin-only elements (including New Recipe button)
        adminControls.forEach(control => {
            control.style.display = 'none';
        });
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
                <div class="loading-text">Working with database...</div>
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