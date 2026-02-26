/**
 * Theory of Change Authoring Application
 * Main application initialization and orchestration
 */

import { TocDataModel } from './dataModel.js';
import { StorageManager } from './storage.js';
import { DomBuilder } from './domBuilder.js';
import { AccessibilityManager } from './accessibility.js';
import { EventHandlers } from './eventHandlers.js';
import { renderPreviewInline } from './preview.js';
import { renderSVGVisualization } from './svgVisualizer.js';
import { importFromURL } from './importers.js';

class TocApplication {
  constructor() {
    // Check for localStorage availability
    if (!StorageManager.isAvailable()) {
      alert('localStorage is not available. Your data will not be saved.');
    }

    // Initialize components
    this.dataModel = new TocDataModel();
    this.accessibility = new AccessibilityManager();
    this.domBuilder = new DomBuilder(this.dataModel, this.accessibility);
    this.storage = new StorageManager(this.dataModel);
    this.currentView = 'preview'; // Default view

    // Check for URL parameter
    const urlParam = this.getURLParameter();

    // Initialize based on URL parameter or saved data
    this.initialize(urlParam);
  }

  /**
   * Get URL parameter for data source
   * @returns {string|null} URL from query string or null
   */
  getURLParameter() {
    const params = new URLSearchParams(window.location.search);
    // Support multiple parameter names for flexibility
    return params.get('url') || params.get('data') || params.get('source');
  }

  /**
   * Initialize application with data
   * @param {string|null} urlParam - Optional URL to load data from
   */
  async initialize(urlParam) {
    try {
      if (urlParam) {
        // Load from URL parameter
        console.log(`Loading ToC from URL: ${urlParam}`);
        const data = await importFromURL(urlParam, this.storage);
        this.dataModel.setData(data);
        this.storage.save();
        this.accessibility.announce('Theory of Change loaded from URL.');
      } else {
        // Load from localStorage
        const savedData = this.storage.load();
        if (savedData) {
          this.dataModel.setData(savedData);
        }
      }

      // Initial render
      this.render();

      // Initialize event handlers (must be after render)
      this.eventHandlers = new EventHandlers(
        this.dataModel,
        this.domBuilder,
        this.accessibility,
        this.storage,
        this
      );

      // Setup beforeunload warning
      this.setupBeforeUnload();

      // Log application ready
      console.log('Theory of Change Authoring Tool initialized');

    } catch (error) {
      console.error('Initialization error:', error);
      alert(`Failed to load data from URL: ${error.message}\n\nStarting with empty ToC.`);

      // Fall back to empty or saved data
      const savedData = this.storage.load();
      if (savedData) {
        this.dataModel.setData(savedData);
      }

      this.render();

      // Initialize event handlers
      this.eventHandlers = new EventHandlers(
        this.dataModel,
        this.domBuilder,
        this.accessibility,
        this.storage,
        this
      );

      this.setupBeforeUnload();
    }
  }

  /**
   * Render the application (both views)
   */
  render() {
    // Render preview view (text)
    this.renderPreview();

    // Render SVG visualization
    this.renderSVG();

    // Render edit view
    this.renderEdit();
  }

  /**
   * Render preview view (text)
   */
  renderPreview() {
    renderPreviewInline(this.dataModel);
  }

  /**
   * Render SVG visualization
   */
  renderSVG() {
    renderSVGVisualization(this.dataModel);
  }

  /**
   * Render edit view
   */
  renderEdit() {
    // Render impact statement
    const impactElement = document.getElementById('impact-statement');
    if (impactElement) {
      impactElement.textContent = this.dataModel.data.impact.statement;
    }

    // Render all outcomes
    this.domBuilder.renderAllOutcomes();

    // Show welcome message if no outcomes
    if (this.dataModel.data.outcomes.length === 0) {
      this.showEmptyState();
    }
  }

  /**
   * Switch between preview and edit views
   * @param {string} view - 'preview' or 'edit'
   */
  switchView(view) {
    const previewView = document.getElementById('preview-view');
    const editView = document.getElementById('edit-view');
    const previewBtn = document.getElementById('view-preview-btn');
    const editBtn = document.getElementById('view-edit-btn');

    if (view === 'preview') {
      previewView.classList.add('active');
      editView.classList.remove('active');
      previewBtn.classList.add('active');
      editBtn.classList.remove('active');
      previewBtn.setAttribute('aria-pressed', 'true');
      editBtn.setAttribute('aria-pressed', 'false');
      this.currentView = 'preview';

      // Re-render preview to show latest data
      this.renderPreview();

      this.accessibility.announce('Switched to preview mode.');
    } else if (view === 'edit') {
      previewView.classList.remove('active');
      editView.classList.add('active');
      previewBtn.classList.remove('active');
      editBtn.classList.add('active');
      previewBtn.setAttribute('aria-pressed', 'false');
      editBtn.setAttribute('aria-pressed', 'true');
      this.currentView = 'edit';

      // Re-render edit view to show latest data
      this.renderEdit();

      this.accessibility.announce('Switched to edit mode.');
    }
  }

  /**
   * Show empty state message
   */
  showEmptyState() {
    const container = document.getElementById('outcomes-container');
    if (!container) return;

    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <p>No outcomes yet. Click "Add Outcome" to get started.</p>
    `;
    container.appendChild(emptyState);
  }

  /**
   * Setup beforeunload warning for unsaved changes
   */
  setupBeforeUnload() {
    window.addEventListener('beforeunload', (e) => {
      // Only warn in edit mode
      if (this.currentView !== 'edit') return;

      // Compare current data with saved data
      const currentData = JSON.stringify(this.dataModel.data);
      const savedData = localStorage.getItem('toc-authoring-data');

      if (currentData !== savedData) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    });
  }
}

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.tocApp = new TocApplication();
  });
} else {
  window.tocApp = new TocApplication();
}
