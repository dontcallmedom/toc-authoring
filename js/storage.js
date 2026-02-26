/**
 * Storage Manager for localStorage persistence
 * Handles save, load, validation, and error handling
 */

const STORAGE_KEY = 'toc-authoring-data';
const AUTOSAVE_DELAY = 2000; // 2 seconds

export class StorageManager {
  constructor(dataModel) {
    this.dataModel = dataModel;
    this.autosaveTimer = null;

    // Subscribe to model changes for auto-save
    this.dataModel.subscribe((changeType, payload) => {
      this.scheduleAutosave();
    });
  }

  /**
   * Load data from localStorage
   * @returns {Object|null} Parsed data or null if not found/invalid
   */
  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        console.log('No saved data found, using defaults');
        return null;
      }

      const parsed = JSON.parse(stored);

      // Validate structure
      if (!this.isValidData(parsed)) {
        console.error('Invalid data structure, using defaults');
        this.backup(stored); // Save corrupted data for debugging
        return null;
      }

      console.log('Data loaded successfully');
      return parsed;

    } catch (error) {
      console.error('Error loading data:', error);
      this.handleLoadError(error);
      return null;
    }
  }

  /**
   * Save data to localStorage
   * @returns {Object} Result object with success status
   */
  save() {
    try {
      const data = this.dataModel.getData();
      data.lastModified = new Date().toISOString();

      const jsonString = JSON.stringify(data);

      // Check storage quota (approximate - 5MB limit)
      if (jsonString.length > 5000000) {
        throw new Error('Data exceeds storage limit');
      }

      localStorage.setItem(STORAGE_KEY, jsonString);
      console.log('Data saved successfully');

      return { success: true, timestamp: data.lastModified };

    } catch (error) {
      console.error('Error saving data:', error);

      if (error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded();
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule auto-save with debouncing
   */
  scheduleAutosave() {
    clearTimeout(this.autosaveTimer);

    this.autosaveTimer = setTimeout(() => {
      const result = this.save();
      if (result.success) {
        this.showSaveIndicator('Auto-saved');
      }
    }, AUTOSAVE_DELAY);
  }

  /**
   * Validate data structure
   * @param {Object} data
   * @returns {boolean}
   */
  isValidData(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.version) return false;
    if (!data.impact || !data.impact.statement) return false;
    if (!Array.isArray(data.outcomes)) return false;

    // Validate each outcome
    for (const outcome of data.outcomes) {
      if (!outcome.id || !Array.isArray(outcome.indicators) || !Array.isArray(outcome.outputs)) {
        return false;
      }

      // Validate outputs within outcomes
      for (const output of outcome.outputs) {
        if (!output.id || !Array.isArray(output.indicators)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Backup corrupted data
   * @param {string} corruptedData
   */
  backup(corruptedData) {
    try {
      const backupKey = `${STORAGE_KEY}-backup-${Date.now()}`;
      localStorage.setItem(backupKey, corruptedData);
      console.log(`Backup saved to ${backupKey}`);
    } catch (error) {
      console.error('Could not save backup:', error);
    }
  }

  /**
   * Handle load errors
   * @param {Error} error
   */
  handleLoadError(error) {
    const message = 'Could not load saved data. Starting with empty form.';
    alert(message);
  }

  /**
   * Handle quota exceeded errors
   */
  handleQuotaExceeded() {
    const message = 'Storage quota exceeded. Please export your data and reduce content size.';
    alert(message);
  }

  /**
   * Show save indicator
   * @param {string} message
   */
  showSaveIndicator(message) {
    const indicator = document.getElementById('save-indicator');
    if (indicator) {
      indicator.textContent = message;
      indicator.classList.add('visible');

      setTimeout(() => {
        indicator.classList.remove('visible');
      }, 2000);
    }
  }

  /**
   * Clear all data (useful for testing/reset)
   */
  clear() {
    if (confirm('Clear all data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  }

  /**
   * Export current localStorage state (debugging)
   * @returns {string|null}
   */
  exportRaw() {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('Raw localStorage data:', stored);
    return stored;
  }

  /**
   * Check if localStorage is available
   * @returns {boolean}
   */
  static isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
}
