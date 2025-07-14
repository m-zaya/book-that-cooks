/*
CONFIGURED AIRTABLE BACKUP INTEGRATION FOR DIGITAL COOKBOOK
===========================================================

This file is ready to use with your specific Airtable credentials.
Your credentials have been configured below - just add this file to your project!

CREDENTIALS CONFIGURED:
- Base ID: apprupawmVvS3Mups
- Personal Access Token: Configured and ready
- Table Name: Recipes

NEXT STEPS:
1. Save this file as 'airtable-backup.js' in your project folder
2. Add the CSS styles to your styles.css file
3. Include the script tag in your index.html
4. Update your main.js saveNewRecipe function
5. Test the connection with the admin panel
*/

// =============================================================================
// AIRTABLE CONFIGURATION - Pre-configured with your credentials
// =============================================================================

const AIRTABLE_CONFIG = {
    // Your Personal Access Token - keep this secure!
    personalAccessToken: 'pathaPHVPRnNd01Dw.bf2e476b410fa9df8e8d7f5b6f62f9db8f5dd49d9b393f5b7f3443f964af7fe2',
    
    // Your Base ID
    baseId: 'apprupawmVvS3Mups',
    
    // Name of your table in Airtable (case sensitive)
    tableName: 'Recipes'
};

// =============================================================================
// AIRTABLE API FUNCTIONS - Core backup functionality
// =============================================================================

/**
 * Makes authenticated requests to Airtable API using Personal Access Token
 * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
 * @param {string} endpoint - API endpoint path
 * @param {Object} data - Request body data (for POST/PATCH)
 * @returns {Object} API response data
 */
async function airtableRequest(method, endpoint, data = null) {
    const url = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}${endpoint}`;
    
    const headers = {
        // Using Personal Access Token instead of deprecated API key
        'Authorization': `Bearer ${AIRTABLE_CONFIG.personalAccessToken}`,
        'Content-Type': 'application/json'
    };
    
    const config = { method, headers };
    
    // Add request body for POST and PATCH requests
    if (data && (method === 'POST' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Airtable request failed:', error);
        throw error;
    }
}

/**
 * Converts a recipe object to Airtable format
 * @param {Object} recipe - Recipe object from your cookbook
 * @returns {Object} Airtable-formatted record
 */
function convertRecipeToAirtable(recipe) {
    return {
        fields: {
            title: recipe.title || 'Untitled Recipe',
            time: recipe.time || '00:30',
            image_url: recipe.image || '',
            
            // Convert arrays to JSON strings for Airtable storage
            tags: JSON.stringify(recipe.tags || []),
            difficulty: recipe.difficulty || '★★☆☆☆',
            timeline: JSON.stringify(recipe.timeline || []),
            ingredients: JSON.stringify(recipe.ingredients || []),
            instructions: JSON.stringify(recipe.instructions || []),
            
            // Add timestamps for tracking
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    };
}

/**
 * Converts Airtable record back to recipe format
 * @param {Object} airtableRecord - Record from Airtable
 * @returns {Object} Recipe object compatible with your cookbook
 */
function convertAirtableToRecipe(airtableRecord) {
    const fields = airtableRecord.fields;
    
    return {
        id: airtableRecord.id, // Airtable record ID for updates
        title: fields.title || 'Untitled Recipe',
        time: fields.time || '00:30',
        image: fields.image_url || generateDefaultImage(fields.title || 'Recipe'),
        
        // Parse JSON strings back to arrays
        tags: fields.tags ? JSON.parse(fields.tags) : [],
        difficulty: fields.difficulty || '★★☆☆☆',
        timeline: fields.timeline ? JSON.parse(fields.timeline) : [],
        ingredients: fields.ingredients ? JSON.parse(fields.ingredients) : [],
        instructions: fields.instructions ? JSON.parse(fields.instructions) : []
    };
}

// =============================================================================
// BACKUP OPERATIONS - Main backup functionality
// =============================================================================

/**
 * Backs up all recipes from Supabase to Airtable
 * This creates a complete backup of your recipe collection
 */
async function backupAllRecipesToAirtable() {
    try {
        console.log('🔄 Starting full backup to Airtable...');
        showLoadingIndicator('Creating backup...');
        
        // Get all recipes from your current recipes array (loaded from Supabase)
        if (!recipes || recipes.length === 0) {
            alert('No recipes found to backup. Please load recipes first.');
            return false;
        }
        
        // Clear existing Airtable records to ensure clean backup
        await clearAirtableTable();
        
        // Convert recipes to Airtable format
        const airtableRecords = recipes.map(recipe => convertRecipeToAirtable(recipe));
        
        // Airtable has a limit of 10 records per request, so we batch them
        const batchSize = 10;
        let successCount = 0;
        
        for (let i = 0; i < airtableRecords.length; i += batchSize) {
            const batch = airtableRecords.slice(i, i + batchSize);
            
            try {
                const response = await airtableRequest('POST', '', {
                    records: batch
                });
                
                successCount += response.records.length;
                console.log(`✅ Backed up batch ${Math.floor(i / batchSize) + 1}: ${response.records.length} recipes`);
                
            } catch (error) {
                console.error(`❌ Failed to backup batch ${Math.floor(i / batchSize) + 1}:`, error);
                // Continue with next batch rather than stopping completely
            }
        }
        
        hideLoadingIndicator();
        
        if (successCount > 0) {
            console.log(`🎉 Backup completed successfully! ${successCount} recipes backed up to Airtable.`);
            alert(`Backup successful! ${successCount} of ${recipes.length} recipes backed up to Airtable.`);
            return true;
        } else {
            throw new Error('No recipes were successfully backed up');
        }
        
    } catch (error) {
        hideLoadingIndicator();
        console.error('❌ Backup failed:', error);
        alert(`Backup failed: ${error.message}`);
        return false;
    }
}

/**
 * Backs up a single recipe to Airtable
 * @param {Object} recipe - Recipe object to backup
 * @returns {Object} Airtable record created
 */
async function backupSingleRecipeToAirtable(recipe) {
    try {
        console.log(`🔄 Backing up recipe: ${recipe.title}`);
        
        const airtableRecord = convertRecipeToAirtable(recipe);
        
        const response = await airtableRequest('POST', '', {
            records: [airtableRecord]
        });
        
        console.log(`✅ Recipe "${recipe.title}" backed up successfully`);
        return response.records[0];
        
    } catch (error) {
        console.error(`❌ Failed to backup recipe "${recipe.title}":`, error);
        throw error;
    }
}

/**
 * Clears all records from Airtable table
 * Use with caution - this deletes all backup data!
 */
async function clearAirtableTable() {
    try {
        console.log('🗑️ Clearing existing Airtable records...');
        
        // Get all existing records
        const response = await airtableRequest('GET', '');
        const existingRecords = response.records;
        
        if (existingRecords.length === 0) {
            console.log('✅ Airtable table is already empty');
            return;
        }
        
        // Delete records in batches (Airtable limit: 10 per request)
        const batchSize = 10;
        
        for (let i = 0; i < existingRecords.length; i += batchSize) {
            const batch = existingRecords.slice(i, i + batchSize);
            const recordIds = batch.map(record => record.id);
            
            // Create query string for batch delete
            const deleteParams = recordIds.map(id => `records[]=${id}`).join('&');
            
            await airtableRequest('DELETE', `?${deleteParams}`);
            console.log(`🗑️ Deleted batch ${Math.floor(i / batchSize) + 1}: ${recordIds.length} records`);
        }
        
        console.log('✅ Airtable table cleared successfully');
        
    } catch (error) {
        console.error('❌ Failed to clear Airtable table:', error);
        throw error;
    }
}

// =============================================================================
// RESTORE OPERATIONS - Restore from backup
// =============================================================================

/**
 * Restores all recipes from Airtable backup to Supabase
 * Use this if you need to restore from your Airtable backup
 */
async function restoreRecipesFromAirtable() {
    try {
        console.log('🔄 Starting restore from Airtable backup...');
        showLoadingIndicator('Restoring from backup...');
        
        // Get all records from Airtable
        const response = await airtableRequest('GET', '');
        const airtableRecords = response.records;
        
        if (airtableRecords.length === 0) {
            alert('No backup records found in Airtable.');
            return false;
        }
        
        // Convert Airtable records back to recipe format
        const restoredRecipes = airtableRecords.map(record => convertAirtableToRecipe(record));
        
        console.log(`📥 Found ${restoredRecipes.length} recipes in Airtable backup`);
        
        // Ask user to confirm restoration
        const confirmRestore = confirm(
            `This will restore ${restoredRecipes.length} recipes from Airtable backup.\n\n` +
            `⚠️ WARNING: This may duplicate existing recipes in your Supabase database.\n\n` +
            `Do you want to continue?`
        );
        
        if (!confirmRestore) {
            hideLoadingIndicator();
            return false;
        }
        
        // Save each recipe to Supabase using existing function
        let successCount = 0;
        
        for (const recipe of restoredRecipes) {
            try {
                await saveRecipeToSupabase(recipe);
                successCount++;
                console.log(`✅ Restored recipe: ${recipe.title}`);
                
            } catch (error) {
                console.error(`❌ Failed to restore recipe "${recipe.title}":`, error);
                // Continue with next recipe rather than stopping
            }
        }
        
        // Reload recipes from Supabase to update the UI
        if (successCount > 0) {
            recipes = await loadRecipesFromSupabase();
            
            if (typeof loadRecipe === 'function' && recipes.length > 0) {
                loadRecipe(1); // Load first recipe
            }
        }
        
        hideLoadingIndicator();
        
        if (successCount > 0) {
            console.log(`🎉 Restore completed! ${successCount} recipes restored from Airtable.`);
            alert(`Restore successful! ${successCount} of ${restoredRecipes.length} recipes restored from Airtable backup.`);
            return true;
        } else {
            throw new Error('No recipes were successfully restored');
        }
        
    } catch (error) {
        hideLoadingIndicator();
        console.error('❌ Restore failed:', error);
        alert(`Restore failed: ${error.message}`);
        return false;
    }
}

// =============================================================================
// AUTOMATIC BACKUP FUNCTIONS - Auto-sync on recipe changes
// =============================================================================

/**
 * Enhanced save function that automatically backs up to Airtable
 * This replaces the saveRecipeToSupabase calls in your main code
 */
async function saveRecipeWithBackup(recipe) {
    try {
        // First save to Supabase (primary database)
        console.log('💾 Saving recipe to Supabase...');
        const supabaseResult = await saveRecipeToSupabase(recipe);
        
        // Then backup to Airtable (secondary database)
        console.log('📦 Creating Airtable backup...');
        try {
            await backupSingleRecipeToAirtable(recipe);
            console.log('✅ Recipe saved and backed up successfully!');
        } catch (backupError) {
            // Don't fail the whole operation if backup fails
            console.warn('⚠️ Recipe saved to Supabase but Airtable backup failed:', backupError);
            alert('Recipe saved successfully, but backup to Airtable failed. You can manually backup later.');
        }
        
        return supabaseResult;
        
    } catch (error) {
        console.error('❌ Failed to save recipe:', error);
        throw error;
    }
}

// =============================================================================
// UI INTEGRATION FUNCTIONS - Add floating backup panel
// =============================================================================

/**
 * Adds floating backup panel and toggle button to your admin interface
 * Creates a separate floating panel that doesn't interfere with main navigation
 */
function addBackupControls() {
    // Check if backup controls already exist
    if (document.getElementById('backupControls')) {
        return; // Already added
    }
    
    // =================================================================
    // CREATE FLOATING BACKUP PANEL
    // =================================================================
    
    // Create the floating backup panel
    const backupControls = document.createElement('div');
    backupControls.id = 'backupControls';
    backupControls.className = 'admin-only backup-controls';
    
    backupControls.innerHTML = `
        <button class="backup-close-btn" onclick="hideBackupPanel()" title="Close backup panel">&times;</button>
        
        <h3>🗄️ Database Backup</h3>
        
        <div class="backup-buttons">
            <button class="backup-btn full-backup" onclick="backupAllRecipesToAirtable()" 
                    title="Create full backup of all recipes">
                📦 Full Backup
            </button>
            
            <button class="backup-btn restore-backup" onclick="restoreRecipesFromAirtable()" 
                    title="Restore recipes from Airtable backup">
                📥 Restore Backup
            </button>
            
            <button class="backup-btn test-connection" onclick="testAirtableConnection()" 
                    title="Test connection to Airtable">
                🔗 Test Connection
            </button>
        </div>
        
        <div class="backup-sync-status synced">✅ Ready</div>
        
        <div class="backup-help">
            Backup creates a copy of all recipes in Airtable for safety.
        </div>
    `;
    
    // Add the floating panel to the body (not inside other containers)
    document.body.appendChild(backupControls);
    
    // =================================================================
    // CREATE TOGGLE BUTTON IN HEADER
    // =================================================================
    
    // Find the header buttons container
    const headerButtons = document.querySelector('.header-buttons');
    
    if (headerButtons) {
        // Create toggle button to show/hide the floating panel
        const toggleButton = document.createElement('button');
        toggleButton.className = 'backup-toggle-btn admin-only backup-toggle';
        toggleButton.onclick = showBackupPanel;
        toggleButton.title = 'Open backup panel';
        toggleButton.innerHTML = `
            <span>🗄️</span>
            <span>Backup</span>
        `;
        
        // Add toggle button to header
        headerButtons.appendChild(toggleButton);
    }
    
    console.log('✅ Floating backup panel and toggle button added');
}

/**
 * Shows the floating backup panel with animation
 */
function showBackupPanel() {
    const backupPanel = document.getElementById('backupControls');
    if (backupPanel) {
        backupPanel.classList.add('show');
        
        // Update sync status when panel opens
        updateBackupSyncStatus();
    }
}

/**
 * Hides the floating backup panel with animation
 */
function hideBackupPanel() {
    const backupPanel = document.getElementById('backupControls');
    if (backupPanel) {
        backupPanel.classList.remove('show');
    }
}

/**
 * Updates the backup sync status indicator
 */
function updateBackupSyncStatus() {
    const statusElement = document.querySelector('.backup-sync-status');
    if (!statusElement) return;
    
    // Reset classes
    statusElement.className = 'backup-sync-status';
    
    // Check if we have recipes and can test connection
    if (!recipes || recipes.length === 0) {
        statusElement.classList.add('out-of-sync');
        statusElement.innerHTML = '⚠️ No recipes';
        return;
    }
    
    // Test connection status (simplified check)
    if (AIRTABLE_CONFIG.personalAccessToken && AIRTABLE_CONFIG.baseId) {
        statusElement.classList.add('synced');
        statusElement.innerHTML = '✅ Ready';
    } else {
        statusElement.classList.add('error');
        statusElement.innerHTML = '❌ Not configured';
    }
}

/**
 * Tests the connection to Airtable
 * Useful for verifying your credentials are correct
 */
async function testAirtableConnection() {
    try {
        showLoadingIndicator('Testing Airtable connection...');
        
        // Try to fetch the first record (or get empty results)
        const response = await airtableRequest('GET', '?maxRecords=1');
        
        hideLoadingIndicator();
        
        console.log('✅ Airtable connection test successful');
        alert(`Airtable connection successful!\n\nFound ${response.records.length} backup records.\n\nYour backup system is ready to use!`);
        
        return true;
        
    } catch (error) {
        hideLoadingIndicator();
        console.error('❌ Airtable connection test failed:', error);
        
        let errorMessage = 'Airtable connection failed:\n\n';
        
        if (error.message.includes('401')) {
            errorMessage += '• Invalid Personal Access Token. Check your Airtable PAT.';
        } else if (error.message.includes('403')) {
            errorMessage += '• Permission denied. Check your PAT permissions for this base.';
        } else if (error.message.includes('404')) {
            errorMessage += '• Base or table not found. Check your Base ID and table name.';
        } else {
            errorMessage += `• ${error.message}`;
        }
        
        errorMessage += '\n\nPlease check your Airtable configuration.';
        
        alert(errorMessage);
        return false;
    }
}

// =============================================================================
// ENHANCED ADMIN FUNCTIONS - Integration with existing admin system
// =============================================================================

/**
 * Enhanced admin UI update function that manages floating backup panel
 * This integrates with your existing admin system safely
 */
function updateAdminUIWithBackup() {
    // Add backup controls if admin is logged in
    if (typeof isAdminAuthenticated === 'function' && isAdminAuthenticated()) {
        addBackupControls();
        
        // Show backup toggle button
        const backupToggle = document.querySelector('.backup-toggle');
        if (backupToggle) {
            backupToggle.classList.add('show');
        }
        
        // Update sync status
        updateBackupSyncStatus();
    } else {
        // Hide backup controls if admin is not logged in
        hideBackupPanel();
        
        // Hide backup toggle button
        const backupToggle = document.querySelector('.backup-toggle');
        if (backupToggle) {
            backupToggle.classList.remove('show');
        }
    }
}

// =============================================================================
// DEBUG AND UTILITY FUNCTIONS
// =============================================================================

/**
 * Debug function to view Airtable backup contents
 * Use in browser console: viewAirtableBackup()
 */
window.viewAirtableBackup = async function() {
    try {
        console.log('📋 Fetching Airtable backup contents...');
        const response = await airtableRequest('GET', '');
        
        console.log(`📊 Airtable Backup Contents (${response.records.length} records):`);
        console.table(response.records.map(record => ({
            id: record.id,
            title: record.fields.title,
            time: record.fields.time,
            difficulty: record.fields.difficulty,
            created: record.fields.created_at
        })));
        
        return response.records;
        
    } catch (error) {
        console.error('❌ Failed to fetch Airtable backup:', error);
        return [];
    }
};

/**
 * Debug function to test configuration
 */
window.testBackupConfig = function() {
    console.log('🔧 Backup Configuration Test:');
    console.log('Personal Access Token:', AIRTABLE_CONFIG.personalAccessToken ? '✅ Set' : '❌ Missing');
    console.log('Base ID:', AIRTABLE_CONFIG.baseId ? '✅ Set' : '❌ Missing');
    console.log('Table Name:', AIRTABLE_CONFIG.tableName ? '✅ Set' : '❌ Missing');
    
    if (!AIRTABLE_CONFIG.personalAccessToken || !AIRTABLE_CONFIG.baseId) {
        console.warn('⚠️ Please update AIRTABLE_CONFIG with your Personal Access Token and Base ID');
        return false;
    }
    
    console.log('✅ Configuration looks good! Try testAirtableConnection() to verify it works.');
    return true;
};

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
            <text x="150" y="160" font-family="Georgia, serif" font-size="12" fill="#8B4513" text-anchor="middle" font-style="italic">From Backup</text>
        </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

// =============================================================================
// INITIALIZATION - Safe setup without infinite recursion
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Airtable backup system initialized');
    console.log('📋 Configured for Base ID: apprupawmVvS3Mups');
    
    // Test configuration on load
    if (window.testBackupConfig()) {
        console.log('🎉 Your Airtable backup system is ready! Try the "Test Connection" button when you log in as admin.');
    }
});

// =============================================================================
// EXPORT FUNCTIONS - Make functions available globally
// =============================================================================

// Make backup functions available globally for UI buttons and console use
window.backupAllRecipesToAirtable = backupAllRecipesToAirtable;
window.restoreRecipesFromAirtable = restoreRecipesFromAirtable;
window.testAirtableConnection = testAirtableConnection;
window.saveRecipeWithBackup = saveRecipeWithBackup;

// Make panel control functions available globally
window.showBackupPanel = showBackupPanel;
window.hideBackupPanel = hideBackupPanel;
window.updateBackupSyncStatus = updateBackupSyncStatus;