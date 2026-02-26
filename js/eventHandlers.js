/**
 * Event Handlers with event delegation
 * Manages all user interactions
 */

import { debounce } from './utils.js';
import { exportToJSON, exportToMarkdown } from './exporters.js';
import { importTocData, importTocDataFromURL } from './importers.js';
import { showPreviewModal } from './preview.js';

export class EventHandlers {
  constructor(dataModel, domBuilder, accessibility, storage, app) {
    this.dataModel = dataModel;
    this.domBuilder = domBuilder;
    this.accessibility = accessibility;
    this.storage = storage;
    this.app = app; // Reference to main app for view switching

    this.setupEventListeners();
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Click events with delegation
    document.addEventListener('click', (e) => this.handleClick(e));

    // Input events with debouncing
    document.addEventListener('input', debounce((e) => this.handleInput(e), 500));
  }

  /**
   * Handle all click events
   * @param {Event} e
   */
  handleClick(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    switch (action) {
      case 'add-outcome':
        this.handleAddOutcome();
        break;
      case 'delete-outcome':
        this.handleDeleteOutcome(target.dataset.outcomeId);
        break;
      case 'add-outcome-indicator':
        this.handleAddOutcomeIndicator(target.dataset.outcomeId);
        break;
      case 'delete-outcome-indicator':
        this.handleDeleteOutcomeIndicator(target.dataset.outcomeId, target.dataset.indicatorId);
        break;
      case 'add-output':
        this.handleAddOutput(target.dataset.outcomeId);
        break;
      case 'delete-output':
        this.handleDeleteOutput(target.dataset.outcomeId, target.dataset.outputId);
        break;
      case 'add-output-indicator':
        this.handleAddOutputIndicator(target.dataset.outcomeId, target.dataset.outputId);
        break;
      case 'delete-output-indicator':
        this.handleDeleteOutputIndicator(target.dataset.outcomeId, target.dataset.outputId, target.dataset.indicatorId);
        break;
      case 'save':
        this.handleSave();
        break;
      case 'switch-to-preview':
        this.handleSwitchToPreview();
        break;
      case 'switch-to-edit':
        this.handleSwitchToEdit();
        break;
      case 'switch-to-text':
        this.handleSwitchVisualization('text');
        break;
      case 'switch-to-diagram':
        this.handleSwitchVisualization('diagram');
        break;
      case 'import-json':
        this.handleImportJSON();
        break;
      case 'import-url':
        this.handleImportURL();
        break;
      case 'preview-chain':
        this.handlePreviewChain();
        break;
      case 'export-json':
        this.handleExportJSON();
        break;
      case 'export-markdown':
        this.handleExportMarkdown();
        break;
    }
  }

  /**
   * Handle all input events
   * @param {Event} e
   */
  handleInput(e) {
    const target = e.target;

    // Outcome statement
    if (target.classList.contains('outcome-statement')) {
      const outcomeId = target.dataset.outcomeId;
      this.dataModel.updateOutcomeStatement(outcomeId, target.value);
    }

    // Output statement
    if (target.classList.contains('output-statement')) {
      const outcomeId = target.dataset.outcomeId;
      const outputId = target.dataset.outputId;
      this.dataModel.updateOutputStatement(outcomeId, outputId, target.value);
    }

    // Outcome indicator
    if (target.dataset.indicatorId && target.dataset.outcomeId && !target.dataset.outputId) {
      const outcomeId = target.dataset.outcomeId;
      const indicatorId = target.dataset.indicatorId;
      this.dataModel.updateOutcomeIndicator(outcomeId, indicatorId, target.value);
    }

    // Output indicator
    if (target.dataset.indicatorId && target.dataset.outputId) {
      const outcomeId = target.dataset.outcomeId;
      const outputId = target.dataset.outputId;
      const indicatorId = target.dataset.indicatorId;
      this.dataModel.updateOutputIndicator(outcomeId, outputId, indicatorId, target.value);
    }
  }

  /**
   * Add a new outcome
   */
  handleAddOutcome() {
    const outcomeId = this.dataModel.addOutcome();
    const container = document.getElementById('outcomes-container');
    const outcomeElement = this.domBuilder.renderOutcome(outcomeId);

    container.appendChild(outcomeElement);

    // Focus on the new outcome's statement textarea
    const textarea = outcomeElement.querySelector('.outcome-statement');
    this.accessibility.focusElement(textarea);
    this.accessibility.announce('Outcome added. Focus moved to outcome statement field.');
  }

  /**
   * Delete an outcome
   * @param {string} outcomeId
   */
  handleDeleteOutcome(outcomeId) {
    if (!confirm('Delete this outcome and all its outputs?')) {
      return;
    }

    const outcomeElement = document.querySelector(`[data-outcome-id="${outcomeId}"]`);
    const previousFocusable = this.accessibility.findPreviousFocusable(outcomeElement);

    this.dataModel.deleteOutcome(outcomeId);
    outcomeElement.remove();

    // Re-render all outcomes to update numbering
    this.domBuilder.renderAllOutcomes();

    // Restore focus
    const addOutcomeBtn = document.getElementById('add-outcome-btn');
    this.accessibility.focusElement(previousFocusable || addOutcomeBtn);
    this.accessibility.announce('Outcome deleted.');
  }

  /**
   * Add an outcome indicator
   * @param {string} outcomeId
   */
  handleAddOutcomeIndicator(outcomeId) {
    const indicatorId = this.dataModel.addOutcomeIndicator(outcomeId);

    // Re-render the outcome to show the new indicator
    const outcomeElement = document.querySelector(`[data-outcome-id="${outcomeId}"]`);
    const newOutcomeElement = this.domBuilder.renderOutcome(outcomeId);
    outcomeElement.replaceWith(newOutcomeElement);

    // Focus on the new indicator input
    const indicatorInput = newOutcomeElement.querySelector(`[data-indicator-id="${indicatorId}"]`);
    this.accessibility.focusElement(indicatorInput);
    this.accessibility.announce('Indicator added. Focus moved to indicator field.');
  }

  /**
   * Delete an outcome indicator
   * @param {string} outcomeId
   * @param {string} indicatorId
   */
  handleDeleteOutcomeIndicator(outcomeId, indicatorId) {
    const indicatorElement = document.querySelector(`[data-indicator-id="${indicatorId}"]`).closest('li');
    const previousFocusable = this.accessibility.findPreviousFocusable(indicatorElement);

    this.dataModel.deleteOutcomeIndicator(outcomeId, indicatorId);

    // Re-render the outcome
    const outcomeElement = document.querySelector(`[data-outcome-id="${outcomeId}"]`);
    const newOutcomeElement = this.domBuilder.renderOutcome(outcomeId);
    outcomeElement.replaceWith(newOutcomeElement);

    // Restore focus
    this.accessibility.focusElement(previousFocusable);
    this.accessibility.announce('Indicator deleted.');
  }

  /**
   * Add an output
   * @param {string} outcomeId
   */
  handleAddOutput(outcomeId) {
    const outputId = this.dataModel.addOutput(outcomeId);

    // Re-render the outcome
    const outcomeElement = document.querySelector(`[data-outcome-id="${outcomeId}"]`);
    const newOutcomeElement = this.domBuilder.renderOutcome(outcomeId);
    outcomeElement.replaceWith(newOutcomeElement);

    // Focus on the new output's statement textarea
    const outputTextarea = newOutcomeElement.querySelector(`[data-output-id="${outputId}"]`);
    this.accessibility.focusElement(outputTextarea);
    this.accessibility.announce('Output added. Focus moved to output statement field.');
  }

  /**
   * Delete an output
   * @param {string} outcomeId
   * @param {string} outputId
   */
  handleDeleteOutput(outcomeId, outputId) {
    if (!confirm('Delete this output?')) {
      return;
    }

    const outputElement = document.querySelector(`[data-output-id="${outputId}"]`);
    const previousFocusable = this.accessibility.findPreviousFocusable(outputElement);

    this.dataModel.deleteOutput(outcomeId, outputId);

    // Re-render the outcome
    const outcomeElement = document.querySelector(`[data-outcome-id="${outcomeId}"]`);
    const newOutcomeElement = this.domBuilder.renderOutcome(outcomeId);
    outcomeElement.replaceWith(newOutcomeElement);

    // Restore focus
    this.accessibility.focusElement(previousFocusable);
    this.accessibility.announce('Output deleted.');
  }

  /**
   * Add an output indicator
   * @param {string} outcomeId
   * @param {string} outputId
   */
  handleAddOutputIndicator(outcomeId, outputId) {
    const indicatorId = this.dataModel.addOutputIndicator(outcomeId, outputId);

    // Re-render the outcome
    const outcomeElement = document.querySelector(`[data-outcome-id="${outcomeId}"]`);
    const newOutcomeElement = this.domBuilder.renderOutcome(outcomeId);
    outcomeElement.replaceWith(newOutcomeElement);

    // Focus on the new indicator input
    const indicatorInput = newOutcomeElement.querySelector(`[data-indicator-id="${indicatorId}"]`);
    this.accessibility.focusElement(indicatorInput);
    this.accessibility.announce('Indicator added. Focus moved to indicator field.');
  }

  /**
   * Delete an output indicator
   * @param {string} outcomeId
   * @param {string} outputId
   * @param {string} indicatorId
   */
  handleDeleteOutputIndicator(outcomeId, outputId, indicatorId) {
    const indicatorElement = document.querySelector(`[data-indicator-id="${indicatorId}"]`).closest('li');
    const previousFocusable = this.accessibility.findPreviousFocusable(indicatorElement);

    this.dataModel.deleteOutputIndicator(outcomeId, outputId, indicatorId);

    // Re-render the outcome
    const outcomeElement = document.querySelector(`[data-outcome-id="${outcomeId}"]`);
    const newOutcomeElement = this.domBuilder.renderOutcome(outcomeId);
    outcomeElement.replaceWith(newOutcomeElement);

    // Restore focus
    this.accessibility.focusElement(previousFocusable);
    this.accessibility.announce('Indicator deleted.');
  }

  /**
   * Save manually
   */
  handleSave() {
    const result = this.storage.save();
    if (result.success) {
      this.storage.showSaveIndicator('Saved successfully');
      this.accessibility.announce('Data saved successfully.');
    } else {
      alert('Failed to save data. Please try again.');
      this.accessibility.announce('Failed to save data.');
    }
  }

  /**
   * Export as JSON
   */
  handleExportJSON() {
    const success = exportToJSON(this.dataModel);
    if (success) {
      this.accessibility.announce('Data exported as JSON.');
    }
  }

  /**
   * Export as Markdown
   */
  handleExportMarkdown() {
    const success = exportToMarkdown(this.dataModel);
    if (success) {
      this.accessibility.announce('Data exported as Markdown.');
    }
  }

  /**
   * Import from JSON file
   */
  async handleImportJSON() {
    const success = await importTocData(this.dataModel, this.storage, this.accessibility);
    if (success) {
      // Re-render both views
      if (this.app) {
        this.app.render();
      } else {
        this.domBuilder.renderAllOutcomes();
      }

      // Focus on the first outcome if in edit mode
      if (this.app && this.app.currentView === 'edit') {
        const firstOutcome = document.querySelector('.outcome-statement');
        const addOutcomeBtn = document.getElementById('add-outcome-btn');
        this.accessibility.focusElement(firstOutcome || addOutcomeBtn);
      }
    }
  }

  /**
   * Import from URL
   */
  async handleImportURL() {
    const urlInput = document.getElementById('import-url-input');
    const url = urlInput ? urlInput.value.trim() : '';

    if (!url) {
      alert('Please enter a URL.');
      return;
    }

    const success = await importTocDataFromURL(url, this.dataModel, this.storage, this.accessibility);
    if (success) {
      // Re-render both views
      if (this.app) {
        this.app.render();
      }

      // Clear the input
      if (urlInput) {
        urlInput.value = '';
      }

      // Stay in preview mode to see the loaded data
      if (this.app && this.app.currentView !== 'preview') {
        this.app.switchView('preview');
      }
    }
  }

  /**
   * Switch to preview view
   */
  handleSwitchToPreview() {
    if (this.app) {
      this.app.switchView('preview');
    }
  }

  /**
   * Switch to edit view
   */
  handleSwitchToEdit() {
    if (this.app) {
      this.app.switchView('edit');
    }
  }

  /**
   * Show preview of logic chain (modal - for backward compatibility)
   */
  handlePreviewChain() {
    showPreviewModal(this.dataModel, this.accessibility);
  }

  /**
   * Switch between text and diagram visualizations
   * @param {string} type - 'text' or 'diagram'
   */
  handleSwitchVisualization(type) {
    const textContainer = document.getElementById('preview-content-container');
    const diagramContainer = document.getElementById('svg-visualization-container');
    const textBtn = document.getElementById('view-text-btn');
    const diagramBtn = document.getElementById('view-diagram-btn');

    if (type === 'text') {
      textContainer?.classList.add('active');
      diagramContainer?.classList.remove('active');
      textBtn?.classList.add('active');
      diagramBtn?.classList.remove('active');
      textBtn?.setAttribute('aria-pressed', 'true');
      diagramBtn?.setAttribute('aria-pressed', 'false');
      this.accessibility.announce('Switched to text view.');
    } else if (type === 'diagram') {
      textContainer?.classList.remove('active');
      diagramContainer?.classList.add('active');
      textBtn?.classList.remove('active');
      diagramBtn?.classList.add('active');
      textBtn?.setAttribute('aria-pressed', 'false');
      diagramBtn?.setAttribute('aria-pressed', 'true');

      // Re-render diagram to ensure it's up to date
      if (this.app) {
        this.app.renderSVG();
      }

      this.accessibility.announce('Switched to diagram view.');
    }
  }
}
