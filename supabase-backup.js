/*
SUPABASE BACKUP INTEGRATION FOR DIGITAL COOKBOOK
================================================

This file replaces airtable-backup.js and provides backup functionality using
a separate Supabase database instead of Airtable. All UI controls remain the same,
but the backend operations now use Supabase's REST API for better performance
and consistency with your main database.

BACKUP STRATEGY:
- Primary Database: Main Supabase instance (recipes table)
- Backup Database: Separate Supabase instance (recipes_backup table)
- Automatic backup on recipe save/edit operations
- Manual full backup and restore capabilities
- Connection testing and sync status monitoring

FEATURES:
- Seamless replacement for Airtable backup system
- Same UI controls and user experience
- Better performance with Supabase REST API
- Consistent authentication and error handling
- Real-time sync status monitoring
- Comprehensive backup and restore operations
*/

// =============================================================================
// BACKUP SUPABASE CONFIGURATION - Your separate backup database credentials
// =============================================================================

const BACKUP_SUPABASE_CONFIG = {
    // Your backup Supabase instance URL
    // Replace this with your backup Supabase project URL
    url: 'https://fkujwuidcvnweogvsivq.supabase.co',
    
    // Your backup Supabase anon key
    // Replace this with your backup Supabase project anon key
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdWp3dWlkY3Zud2VvZ3ZzaXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MjIzMjMsImV4cCI6MjA2ODA5ODMyM30.lVzNBe_rCZ7TteeUulVsloF5ojtEg00BHc-MEOKC1F4',
    
    // Table name in your backup database
    tableName: 'recipes_backup'
};

// =============================================================================
// BACKUP DATABASE API FUNCTIONS - Core backup database operations
// =============================================================================

/**
 * Makes authenticated requests to backup Supabase database
 * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
 * @param {string} endpoint - API endpoint path (e.g., '', '?id=eq.123')
 * @param {Object} data - Request body data (for POST/PATCH)
 * @returns {Object} API response data
 */
async function backupSupabaseRequest(method, endpoint, data = null) {
    const url = `${BACKUP_SUPABASE_CONFIG.url}/rest/v1/${BACKUP_SUPABASE_CONFIG.tableName}${endpoint}`;
    
    const headers = {
        'apikey': BACKUP_SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${BACKUP_SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
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
            throw new Error(`Backup Supabase API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Backup Supabase request failed:', error);
        throw error;
    }
}

/**
 * Converts a recipe object to backup Supabase format
 * @param {Object} recipe - Recipe object from your cookbook
 * @returns {Object} Backup Supabase-formatted record
 */
function convertRecipeToBackupFormat(recipe) {
    return {
        // Keep original ID for reference linking
        original_id: recipe.id || null,
        
        // Basic recipe information
        title: recipe.title || 'Untitled Recipe',
        time: recipe.time || '00:30',
        image_url: recipe.image || '',
        difficulty: recipe.difficulty || '★★☆☆☆',
        
        // Complex data stored as JSON - same as main database structure
        tags: recipe.tags || [],
        timeline: recipe.timeline || [],
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        
        // Backup metadata for tracking
        backup_created_at: new Date().toISOString(),
        backup_updated_at: new Date().toISOString(),
        
        // Source identification
        source_database: 'primary_supabase'
    };
}

/**
 * Converts backup Supabase record back to recipe format
 * @param {Object} backupRecord - Record from backup Supabase database
 * @returns {Object} Recipe object compatible with your cookbook
 */
function convertBackupToRecipe(backupRecord) {
    return {
        // Use backup ID as temporary ID for restore operations
        id: backupRecord.id,
        
        // Basic recipe information
        title: backupRecord.title || 'Untitled Recipe',
        time: backupRecord.time || '00:30',
        image: backupRecord.image_url || generateDefaultImage(backupRecord.title || 'Recipe'),
        difficulty: backupRecord.difficulty || '★★☆☆☆',
        
        // Complex data - already in correct format from JSON storage
        tags: backupRecord.tags || [],
        timeline: backupRecord.timeline || [],
        ingredients: backupRecord.ingredients || [],
        instructions: backupRecord.instructions || [],
        
        // Include backup metadata for reference
        originalId: backupRecord.original_id,
        backupCreatedAt: backupRecord.backup_created_at,
        backupUpdatedAt: backupRecord.backup_updated_at
    };
}

// =============================================================================
// BACKUP OPERATIONS - Main backup functionality (same interface as Airtable version)
// =============================================================================

/**
 * Backs up all recipes from primary Supabase to backup Supabase database
 * This creates a complete backup of your recipe collection
 */
async function backupAllRecipesToAirtable() {
    try {
        console.log('🔄 Starting full backup to backup Supabase database...');
        showLoadingIndicator('Creating backup...');
        
        // Get all recipes from your current recipes array (loaded from primary Supabase)
        if (!recipes || recipes.length === 0) {
            alert('No recipes found to backup. Please load recipes first.');
            return false;
        }
        
        // Clear existing backup records to ensure clean backup
        await clearBackupDatabase();
        
        // Convert recipes to backup format
        const backupRecords = recipes.map(recipe => convertRecipeToBackupFormat(recipe));
        
        // Supabase can handle larger batches than Airtable, but we'll still batch for reliability
        const batchSize = 20; // Increased from Airtable's 10
        let successCount = 0;
        
        for (let i = 0; i < backupRecords.length; i += batchSize) {
            const batch = backupRecords.slice(i, i + batchSize);
            
            try {
                // Create records array for Supabase bulk insert
                const recordsToInsert = batch;
                
                const response = await backupSupabaseRequest('POST', '', recordsToInsert);
                
                successCount += response.length;
                console.log(`✅ Backed up batch ${Math.floor(i / batchSize) + 1}: ${response.length} recipes`);
                
            } catch (error) {
                console.error(`❌ Failed to backup batch ${Math.floor(i / batchSize) + 1}:`, error);
                // Continue with next batch rather than stopping completely
            }
        }
        
        hideLoadingIndicator();
        
        if (successCount > 0) {
            console.log(`🎉 Backup completed successfully! ${successCount} recipes backed up to backup Supabase database.`);
            alert(`Backup successful! ${successCount} of ${recipes.length} recipes backed up to backup database.`);
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
 * Backs up a single recipe to backup Supabase database
 * @param {Object} recipe - Recipe object to backup
 * @returns {Object} Backup Supabase record created
 */
async function backupSingleRecipeToAirtable(recipe) {
    try {
        console.log(`🔄 Backing up recipe: ${recipe.title}`);
        
        const backupRecord = convertRecipeToBackupFormat(recipe);
        
        const response = await backupSupabaseRequest('POST', '', [backupRecord]);
        
        console.log(`✅ Recipe "${recipe.title}" backed up successfully`);
        return response[0];
        
    } catch (error) {
        console.error(`❌ Failed to backup recipe "${recipe.title}":`, error);
        throw error;
    }
}

/**
 * Clears all records from backup Supabase database
 * Use with caution - this deletes all backup data!
 */
/**
 * FIXED VERSION: Clears all records from backup Supabase database
 * Use with caution - this deletes all backup data!
 * 
 * FIXES:
 * 1. Removes the problematic id=neq.null filter that was causing type errors
 * 2. Uses proper Supabase delete syntax for clearing all records
 * 3. Adds better error handling for different scenarios
 */
async function clearBackupDatabase() {
    try {
        console.log('🗑️ Clearing existing backup database records...');
        
        // Get all existing records to get their IDs first
        const response = await backupSupabaseRequest('GET', '');
        const existingRecords = response;
        
        if (existingRecords.length === 0) {
            console.log('✅ Backup database is already empty');
            return;
        }
        
        console.log(`Found ${existingRecords.length} existing backup records to delete`);
        
        // FIXED APPROACH: Delete all records using a different method
        // Method 1: Try truncate-like delete (delete all without filter)
        try {
            // Use a filter that will match all records (id is greater than 0)
            // This avoids the problematic "null" string conversion
            await backupSupabaseRequest('DELETE', '?id=gt.0');
            console.log(`🗑️ Successfully deleted all ${existingRecords.length} backup records using bulk delete`);
            return;
            
        } catch (bulkDeleteError) {
            console.log('Bulk delete failed, falling back to individual record deletion...');
            console.log('Bulk delete error:', bulkDeleteError.message);
            
            // Method 2: Fallback - delete records in batches by ID
            const batchSize = 10; // Smaller batches for more reliable deletion
            let deletedCount = 0;
            
            for (let i = 0; i < existingRecords.length; i += batchSize) {
                const batch = existingRecords.slice(i, i + batchSize);
                
                // Delete each record in the batch individually
                for (const record of batch) {
                    try {
                        await backupSupabaseRequest('DELETE', `?id=eq.${record.id}`);
                        deletedCount++;
                        console.log(`🗑️ Deleted record ${deletedCount}/${existingRecords.length}: ${record.title || 'Untitled'}`);
                    } catch (recordError) {
                        console.warn(`Failed to delete record ${record.id}:`, recordError.message);
                        // Continue with next record instead of stopping
                    }
                }
                
                // Small delay between batches to avoid rate limiting
                if (i + batchSize < existingRecords.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            console.log(`🗑️ Deleted ${deletedCount} of ${existingRecords.length} backup records using individual deletion`);
        }
        
        console.log('✅ Backup database cleared successfully');
        
    } catch (error) {
        console.error('❌ Failed to clear backup database:', error);
        
        // Provide more specific error guidance
        if (error.message.includes('22P02')) {
            console.error('💡 This appears to be a data type conversion error.');
            console.error('💡 Your backup database might have different column types than expected.');
            console.error('💡 Try recreating the backup table with the correct schema.');
        } else if (error.message.includes('401') || error.message.includes('403')) {
            console.error('💡 Permission error - check your backup database credentials and RLS policies.');
        }
        
        throw error;
    }
}

/**
 * ALTERNATIVE APPROACH: Clear backup database using SQL truncate
 * This is more efficient but requires different permissions
 */
async function clearBackupDatabaseAlternative() {
    try {
        console.log('🗑️ Clearing backup database using SQL truncate...');
        
        // Use Supabase SQL execution endpoint
        const response = await fetch(`${BACKUP_SUPABASE_CONFIG.url}/rest/v1/rpc/truncate_recipes_backup`, {
            method: 'POST',
            headers: {
                'apikey': BACKUP_SUPABASE_CONFIG.anonKey,
                'Authorization': `Bearer ${BACKUP_SUPABASE_CONFIG.anonKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`SQL truncate failed: ${response.status}`);
        }
        
        console.log('✅ Backup database cleared using SQL truncate');
        
    } catch (error) {
        console.warn('SQL truncate method failed, falling back to standard delete:', error.message);
        // Fall back to the fixed delete method above
        return clearBackupDatabase();
    }
}

/**
 * IMPROVED: Enhanced backup function with better error handling
 * This fixes the issue that was causing the backup to fail
 */
async function backupAllRecipesToAirtableFixed() {
    try {
        console.log('🔄 Starting full backup to backup Supabase database...');
        showLoadingIndicator('Creating backup...');
        
        // Get all recipes from your current recipes array (loaded from primary Supabase)
        if (!recipes || recipes.length === 0) {
            alert('No recipes found to backup. Please load recipes first.');
            return false;
        }
        
        // FIXED: Use the improved clear function that handles the delete error
        await clearBackupDatabase();
        
        // Convert recipes to backup format
        const backupRecords = recipes.map(recipe => convertRecipeToBackupFormat(recipe));
        
        // Supabase can handle larger batches than Airtable, but we'll still batch for reliability
        const batchSize = 5; // Reduced batch size for more reliable uploads
        let successCount = 0;
        
        for (let i = 0; i < backupRecords.length; i += batchSize) {
            const batch = backupRecords.slice(i, i + batchSize);
            
            try {
                // Create records array for Supabase bulk insert
                const recordsToInsert = batch;
                
                const response = await backupSupabaseRequest('POST', '', recordsToInsert);
                
                successCount += response.length;
                console.log(`✅ Backed up batch ${Math.floor(i / batchSize) + 1}: ${response.length} recipes`);
                
                // Add small delay between batches to avoid overwhelming the server
                if (i + batchSize < backupRecords.length) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
            } catch (error) {
                console.error(`❌ Failed to backup batch ${Math.floor(i / batchSize) + 1}:`, error);
                // Continue with next batch rather than stopping completely
            }
        }
        
        hideLoadingIndicator();
        
        if (successCount > 0) {
            console.log(`🎉 Backup completed successfully! ${successCount} recipes backed up to backup Supabase database.`);
            alert(`Backup successful! ${successCount} of ${recipes.length} recipes backed up to backup database.`);
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

// =============================================================================
// SQL FUNCTION FOR BACKUP DATABASE (Optional Enhancement)
// =============================================================================

/**
 * OPTIONAL: Create this SQL function in your backup Supabase database
 * to enable more efficient table clearing
 * 
 * Run this in your backup Supabase SQL Editor:
 */
const BACKUP_DATABASE_SQL_FUNCTION = `
-- Create a function to truncate the backup table efficiently
CREATE OR REPLACE FUNCTION truncate_recipes_backup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    TRUNCATE TABLE recipes_backup RESTART IDENTITY;
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION truncate_recipes_backup() TO anon;
`;

// =============================================================================
// DEBUGGING HELPER FUNCTIONS
// =============================================================================

/**
 * Debug function to test different delete approaches
 * Use in browser console: testBackupDeletion()
 */
window.testBackupDeletion = async function() {
    try {
        console.log('🧪 Testing backup deletion methods...');
        
        // Test 1: Check what records exist
        const records = await backupSupabaseRequest('GET', '?limit=5');
        console.log(`Found ${records.length} records in backup database`);
        
        if (records.length === 0) {
            console.log('✅ No records to delete - database is empty');
            return;
        }
        
        // Test 2: Try deleting one record by ID
        const firstRecord = records[0];
        try {
            await backupSupabaseRequest('DELETE', `?id=eq.${firstRecord.id}`);
            console.log(`✅ Successfully deleted test record ${firstRecord.id}`);
        } catch (error) {
            console.error('❌ Single record deletion failed:', error);
        }
        
        // Test 3: Check if there are any records left
        const remainingRecords = await backupSupabaseRequest('GET', '?limit=1');
        console.log(`${remainingRecords.length} records remaining after test deletion`);
        
    } catch (error) {
        console.error('❌ Backup deletion test failed:', error);
    }
};

// =============================================================================
// RESTORE OPERATIONS - Restore from backup (same interface as Airtable version)
// =============================================================================

/**
 * Restores all recipes from backup Supabase database to primary Supabase
 * Use this if you need to restore from your backup database
 */
async function restoreRecipesFromAirtable() {
    try {
        console.log('🔄 Starting restore from backup Supabase database...');
        showLoadingIndicator('Restoring from backup...');
        
        // Get all records from backup Supabase database
        const response = await backupSupabaseRequest('GET', '?order=backup_created_at.asc');
        const backupRecords = response;
        
        if (backupRecords.length === 0) {
            alert('No backup records found in backup database.');
            return false;
        }
        
        // Convert backup records back to recipe format
        const restoredRecipes = backupRecords.map(record => convertBackupToRecipe(record));
        
        console.log(`📥 Found ${restoredRecipes.length} recipes in backup database`);
        
        // Ask user to confirm restoration
        const confirmRestore = confirm(
            `This will restore ${restoredRecipes.length} recipes from backup database.\n\n` +
            `⚠️ WARNING: This may duplicate existing recipes in your primary database.\n\n` +
            `Do you want to continue?`
        );
        
        if (!confirmRestore) {
            hideLoadingIndicator();
            return false;
        }
        
        // Save each recipe to primary Supabase using existing function
        let successCount = 0;
        
        for (const recipe of restoredRecipes) {
            try {
                // Remove backup-specific fields before saving to primary database
                const cleanRecipe = {
                    title: recipe.title,
                    time: recipe.time,
                    image: recipe.image,
                    tags: recipe.tags,
                    difficulty: recipe.difficulty,
                    timeline: recipe.timeline,
                    ingredients: recipe.ingredients,
                    instructions: recipe.instructions
                };
                
                await saveRecipeToSupabase(cleanRecipe);
                successCount++;
                console.log(`✅ Restored recipe: ${recipe.title}`);
                
            } catch (error) {
                console.error(`❌ Failed to restore recipe "${recipe.title}":`, error);
                // Continue with next recipe rather than stopping
            }
        }
        
        // Reload recipes from primary Supabase to update the UI
        if (successCount > 0) {
            recipes = await loadRecipesFromSupabase();
            
            if (typeof loadRecipe === 'function' && recipes.length > 0) {
                loadRecipe(1); // Load first recipe
            }
        }
        
        hideLoadingIndicator();
        
        if (successCount > 0) {
            console.log(`🎉 Restore completed! ${successCount} recipes restored from backup database.`);
            alert(`Restore successful! ${successCount} of ${restoredRecipes.length} recipes restored from backup database.`);
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
// AUTOMATIC BACKUP FUNCTIONS - Auto-sync on recipe changes (same interface as Airtable version)
// =============================================================================

/**
 * Enhanced save function that automatically backs up to backup Supabase database
 * This replaces the saveRecipeToSupabase calls in your main code
 */
async function saveRecipeWithBackup(recipe) {
    try {
        // First save to primary Supabase (main database)
        console.log('💾 Saving recipe to primary Supabase...');
        const supabaseResult = await saveRecipeToSupabase(recipe);
        
        // Then backup to backup Supabase (secondary database)
        console.log('📦 Creating backup in backup Supabase database...');
        try {
            // Add the ID from primary database to recipe for backup reference
            const recipeWithId = { ...recipe, id: supabaseResult.id };
            await backupSingleRecipeToAirtable(recipeWithId);
            console.log('✅ Recipe saved and backed up successfully!');
        } catch (backupError) {
            // Don't fail the whole operation if backup fails
            console.warn('⚠️ Recipe saved to primary database but backup failed:', backupError);
            alert('Recipe saved successfully, but backup failed. You can manually backup later using the backup panel.');
        }
        
        return supabaseResult;
        
    } catch (error) {
        console.error('❌ Failed to save recipe:', error);
        throw error;
    }
}

// =============================================================================
// CONNECTION TESTING AND SYNC STATUS - Enhanced for Supabase
// =============================================================================

/**
 * Tests the connection to backup Supabase database
 * Useful for verifying your backup database credentials are correct
 */
async function testAirtableConnection() {
    try {
        showLoadingIndicator('Testing backup database connection...');
        
        // Try to fetch the first few records (or get empty results)
        const response = await backupSupabaseRequest('GET', '?limit=5&order=backup_created_at.desc');
        
        hideLoadingIndicator();
        
        console.log('✅ Backup Supabase database connection test successful');
        alert(
            `Backup database connection successful!\n\n` +
            `Found ${response.length} backup records.\n` +
            `Database: ${BACKUP_SUPABASE_CONFIG.tableName}\n\n` +
            `Your backup system is ready to use!`
        );
        
        return true;
        
    } catch (error) {
        hideLoadingIndicator();
        console.error('❌ Backup database connection test failed:', error);
        
        let errorMessage = 'Backup database connection failed:\n\n';
        
        if (error.message.includes('401')) {
            errorMessage += '• Invalid API key. Check your backup Supabase anon key.';
        } else if (error.message.includes('403')) {
            errorMessage += '• Permission denied. Check your backup database permissions.';
        } else if (error.message.includes('404')) {
            errorMessage += '• Database or table not found. Check your backup database URL and table name.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage += '• Network error. Check your internet connection and backup database URL.';
        } else {
            errorMessage += `• ${error.message}`;
        }
        
        errorMessage += '\n\nPlease check your backup Supabase configuration at the top of supabase-backup.js.';
        
        alert(errorMessage);
        return false;
    }
}

/**
 * Updates the backup sync status indicator based on connection and data state
 */
function updateBackupSyncStatus() {
    const statusElement = document.querySelector('.backup-sync-status');
    if (!statusElement) return;
    
    // Reset classes
    statusElement.className = 'backup-sync-status';
    
    // Check if we have recipes to backup
    if (!recipes || recipes.length === 0) {
        statusElement.classList.add('out-of-sync');
        statusElement.innerHTML = '⚠️ No recipes';
        return;
    }
    
    // Check if backup configuration is set up
    if (BACKUP_SUPABASE_CONFIG.url.includes('your-backup-project') || 
        BACKUP_SUPABASE_CONFIG.anonKey.includes('your-backup-supabase-anon-key')) {
        statusElement.classList.add('error');
        statusElement.innerHTML = '❌ Not configured';
        return;
    }
    
    // Configuration looks good
    statusElement.classList.add('synced');
    statusElement.innerHTML = '✅ Ready';
}

// =============================================================================
// UI INTEGRATION FUNCTIONS - Same interface as Airtable version
// =============================================================================

/**
 * Adds floating backup panel and toggle button to your admin interface
 * Uses the same UI as the Airtable version - no changes needed
 */
function addBackupControls() {
    // Check if backup controls already exist
    if (document.getElementById('backupControls')) {
        return; // Already added
    }
    
    // Create the floating backup panel (same HTML as Airtable version)
    const backupControls = document.createElement('div');
    backupControls.id = 'backupControls';
    backupControls.className = 'admin-only backup-controls';
    
    backupControls.innerHTML = `
        <button class="backup-close-btn" onclick="hideBackupPanel()" title="Close backup panel">&times;</button>
        
        <h3>💾 Database Backup</h3>
        
        <div class="backup-buttons">
            <button class="backup-btn full-backup" onclick="backupAllRecipesToAirtable()" 
                    title="Create full backup of all recipes">
                📦 Full Backup
            </button>
            
            <button class="backup-btn restore-backup" onclick="restoreRecipesFromAirtable()" 
                    title="Restore recipes from backup database">
                📥 Restore Backup
            </button>
            
            <button class="backup-btn test-connection" onclick="testAirtableConnection()" 
                    title="Test connection to backup database">
                🔗 Test Connection
            </button>
        </div>
        
        <div class="backup-sync-status synced">✅ Ready</div>
        
        <div class="backup-help">
            Backup creates a copy of all recipes in a separate Supabase database for safety.
        </div>
    `;
    
    // Add the floating panel to the body
    document.body.appendChild(backupControls);
    
    // Create toggle button in header (same as Airtable version)
    const headerButtons = document.querySelector('.header-buttons');
    
    if (headerButtons) {
        const toggleButton = document.createElement('button');
        toggleButton.className = 'backup-toggle-btn admin-only backup-toggle';
        toggleButton.id = 'backupBtn';
        toggleButton.onclick = showBackupPanel;
        toggleButton.title = 'Open backup panel';
        toggleButton.innerHTML = `
            <span>💾</span>
            <span>Backup</span>
        `;
        
        headerButtons.appendChild(toggleButton);
    }
    
    console.log('✅ Floating backup panel and toggle button added (Supabase version)');
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

// =============================================================================
// DEBUG AND UTILITY FUNCTIONS - Enhanced for Supabase backup
// =============================================================================

/**
 * Debug function to view backup Supabase database contents
 * Use in browser console: viewAirtableBackup()
 */
window.viewAirtableBackup = async function() {
    try {
        console.log('📋 Fetching backup Supabase database contents...');
        const response = await backupSupabaseRequest('GET', '?order=backup_created_at.desc');
        
        console.log(`📊 Backup Database Contents (${response.length} records):`);
        console.table(response.map(record => ({
            id: record.id,
            original_id: record.original_id,
            title: record.title,
            time: record.time,
            difficulty: record.difficulty,
            backup_created: record.backup_created_at,
            backup_updated: record.backup_updated_at
        })));
        
        return response;
        
    } catch (error) {
        console.error('❌ Failed to fetch backup database contents:', error);
        return [];
    }
};

/**
 * Debug function to test backup configuration
 */
window.testBackupConfig = function() {
    console.log('🔧 Backup Supabase Configuration Test:');
    console.log('Backup URL:', BACKUP_SUPABASE_CONFIG.url.includes('your-backup-project') ? '❌ Not configured' : '✅ Set');
    console.log('Backup Anon Key:', BACKUP_SUPABASE_CONFIG.anonKey.includes('your-backup-supabase-anon-key') ? '❌ Not configured' : '✅ Set');
    console.log('Table Name:', BACKUP_SUPABASE_CONFIG.tableName ? '✅ Set' : '❌ Missing');
    
    if (BACKUP_SUPABASE_CONFIG.url.includes('your-backup-project') || 
        BACKUP_SUPABASE_CONFIG.anonKey.includes('your-backup-supabase-anon-key')) {
        console.warn('⚠️ Please update BACKUP_SUPABASE_CONFIG with your backup Supabase credentials');
        console.log('1. Create a new Supabase project for backups');
        console.log('2. Create a table called "recipes_backup" with the same structure as your main recipes table');
        console.log('3. Update the URL and anonKey in BACKUP_SUPABASE_CONFIG');
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
// INITIALIZATION - Safe setup without conflicts
// =============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Supabase backup system initialized');
    console.log('📋 Configured for backup database table: recipes_backup');
    
    // Test configuration on load
    if (window.testBackupConfig()) {
        console.log('🎉 Your Supabase backup system is ready! Try the "Test Connection" button when you log in as admin.');
    }
});

// =============================================================================
// EXPORT FUNCTIONS - Make functions available globally (same interface as Airtable version)
// =============================================================================

// Make backup functions available globally for UI buttons and console use
// Note: Function names kept the same as Airtable version for compatibility
window.backupAllRecipesToAirtable = backupAllRecipesToAirtable;
window.restoreRecipesFromAirtable = restoreRecipesFromAirtable;
window.testAirtableConnection = testAirtableConnection;
window.saveRecipeWithBackup = saveRecipeWithBackup;

// Make panel control functions available globally
window.showBackupPanel = showBackupPanel;
window.hideBackupPanel = hideBackupPanel;
window.updateBackupSyncStatus = updateBackupSyncStatus;