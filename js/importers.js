/**
 * Import functions for loading Theory of Change data from files
 */

/**
 * Import data from a JSON file
 * @param {File} file - The JSON file to import
 * @param {StorageManager} storage - Storage manager for validation
 * @returns {Promise<Object>} Resolves with parsed data or rejects with error
 */
export function importFromJSON(file, storage) {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      reject(new Error('Invalid file type. Please select a JSON file.'));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('File is too large. Maximum size is 10MB.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonString = e.target.result;
        const data = JSON.parse(jsonString);

        // Validate data structure using storage manager's validation
        if (!storage.isValidData(data)) {
          reject(new Error('Invalid data structure. The JSON file does not match the expected Theory of Change format.'));
          return;
        }

        resolve(data);
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error('Invalid JSON format. The file could not be parsed.'));
        } else {
          reject(error);
        }
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file. Please try again.'));
    };

    reader.readAsText(file);
  });
}

/**
 * Trigger file selection dialog
 * @returns {Promise<File>} Resolves with selected file
 */
export function selectFile() {
  return new Promise((resolve, reject) => {
    const input = document.getElementById('import-file-input');

    if (!input) {
      reject(new Error('File input element not found.'));
      return;
    }

    // Reset input value to allow selecting the same file again
    input.value = '';

    // Set up event listeners
    const handleChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error('No file selected.'));
      }
      // Clean up listener
      input.removeEventListener('change', handleChange);
    };

    const handleCancel = () => {
      reject(new Error('File selection cancelled.'));
      input.removeEventListener('cancel', handleCancel);
    };

    input.addEventListener('change', handleChange);
    input.addEventListener('cancel', handleCancel);

    // Trigger file dialog
    input.click();
  });
}

/**
 * Import ToC data with user confirmation
 * @param {TocDataModel} dataModel - Data model to update
 * @param {StorageManager} storage - Storage manager
 * @param {AccessibilityManager} accessibility - Accessibility manager for announcements
 * @returns {Promise<boolean>} Resolves with success status
 */
export async function importTocData(dataModel, storage, accessibility) {
  try {
    // Check if there's existing data
    const hasData = dataModel.getData().outcomes.length > 0;

    if (hasData) {
      const confirmed = confirm(
        'Importing will replace your current Theory of Change data. ' +
        'Make sure you have exported your current work before proceeding.\n\n' +
        'Do you want to continue?'
      );

      if (!confirmed) {
        accessibility.announce('Import cancelled.');
        return false;
      }
    }

    // Select file
    const file = await selectFile();

    // Import and validate
    const data = await importFromJSON(file, storage);

    // Update data model
    dataModel.setData(data);

    // Save to localStorage
    const saveResult = storage.save();

    if (saveResult.success) {
      accessibility.announce('Theory of Change imported successfully.');
      return true;
    } else {
      throw new Error('Failed to save imported data.');
    }

  } catch (error) {
    console.error('Import error:', error);

    // User-friendly error messages
    let message = 'Failed to import file.';

    if (error.message.includes('cancelled')) {
      // Don't show alert for cancellation
      return false;
    } else if (error.message) {
      message = error.message;
    }

    alert(message);
    accessibility.announce('Import failed.');
    return false;
  }
}

/**
 * Import data from a URL
 * @param {string} url - URL to fetch JSON from (relative or absolute)
 * @param {StorageManager} storage - Storage manager for validation
 * @returns {Promise<Object>} Resolves with parsed data or rejects with error
 */
export async function importFromURL(url, storage) {
  try {
    // Validate URL format (basic check)
    if (!url || typeof url !== 'string' || url.trim() === '') {
      throw new Error('Please enter a valid URL.');
    }

    // Fetch the JSON data
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`File not found: ${url}`);
      } else if (response.status === 403) {
        throw new Error(`Access denied: ${url}`);
      } else {
        throw new Error(`Failed to load from URL (Status: ${response.status})`);
      }
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json') && !contentType.includes('text/')) {
      console.warn('Warning: Content-Type is not JSON, attempting to parse anyway');
    }

    // Parse JSON
    const data = await response.json();

    // Validate data structure
    if (!storage.isValidData(data)) {
      throw new Error('Invalid data structure. The JSON from this URL does not match the expected Theory of Change format.');
    }

    return data;

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format in the fetched file.');
    } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Failed to fetch from URL. Check the URL and your network connection.`);
    } else {
      throw error;
    }
  }
}

/**
 * Import ToC data from URL with confirmation
 * @param {string} url - URL to fetch JSON from
 * @param {TocDataModel} dataModel - Data model to update
 * @param {StorageManager} storage - Storage manager
 * @param {AccessibilityManager} accessibility - Accessibility manager for announcements
 * @returns {Promise<boolean>} Resolves with success status
 */
export async function importTocDataFromURL(url, dataModel, storage, accessibility) {
  try {
    // Check if there's existing data
    const hasData = dataModel.getData().outcomes.length > 0;

    if (hasData) {
      const confirmed = confirm(
        'Importing will replace your current Theory of Change data. ' +
        'Make sure you have exported your current work before proceeding.\n\n' +
        'Do you want to continue?'
      );

      if (!confirmed) {
        accessibility.announce('Import cancelled.');
        return false;
      }
    }

    // Import and validate
    const data = await importFromURL(url, storage);

    // Update data model
    dataModel.setData(data);

    // Save to localStorage
    const saveResult = storage.save();

    if (saveResult.success) {
      accessibility.announce('Theory of Change imported from URL successfully.');
      return true;
    } else {
      throw new Error('Failed to save imported data.');
    }

  } catch (error) {
    console.error('URL import error:', error);

    // User-friendly error messages
    let message = 'Failed to import from URL.';

    if (error.message) {
      message = error.message;
    }

    alert(message);
    accessibility.announce('Import from URL failed.');
    return false;
  }
}
