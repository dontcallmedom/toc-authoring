/**
 * Data Model for Theory of Change
 * Implements observer pattern for state management
 */

export class TocDataModel {
  constructor(initialData = null) {
    this.data = initialData || this.getDefaultStructure();
    this.listeners = [];
  }

  /**
   * Subscribe to data changes
   * @param {Function} callback - Called when data changes with (changeType, payload)
   */
  subscribe(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners of a change
   * @param {string} changeType - Type of change (e.g., 'outcome-added')
   * @param {Object} payload - Data about the change
   */
  notify(changeType, payload) {
    this.listeners.forEach(listener => listener(changeType, payload));
  }

  /**
   * Get default data structure
   */
  getDefaultStructure() {
    return {
      version: "1.0",
      lastModified: new Date().toISOString(),
      impact: {
        id: "impact-1",
        statement: "People around the world experience and enjoy a single, unified Web that works consistently across devices, browsers, and platforms, ensuring users can freely choose the tools they want to interact with the Web."
      },
      outcomes: []
    };
  }

  /**
   * Add a new outcome
   * @returns {string} The ID of the new outcome
   */
  addOutcome() {
    const outcome = {
      id: crypto.randomUUID(),
      statement: "",
      indicators: [],
      outputs: []
    };
    this.data.outcomes.push(outcome);
    this.data.lastModified = new Date().toISOString();
    this.notify('outcome-added', { outcomeId: outcome.id });
    return outcome.id;
  }

  /**
   * Delete an outcome
   * @param {string} outcomeId
   */
  deleteOutcome(outcomeId) {
    const index = this.data.outcomes.findIndex(o => o.id === outcomeId);
    if (index !== -1) {
      this.data.outcomes.splice(index, 1);
      this.data.lastModified = new Date().toISOString();
      this.notify('outcome-deleted', { outcomeId });
    }
  }

  /**
   * Update outcome statement
   * @param {string} outcomeId
   * @param {string} statement
   */
  updateOutcomeStatement(outcomeId, statement) {
    const outcome = this.data.outcomes.find(o => o.id === outcomeId);
    if (outcome) {
      outcome.statement = statement;
      this.data.lastModified = new Date().toISOString();
      this.notify('outcome-updated', { outcomeId, field: 'statement' });
    }
  }

  /**
   * Get an outcome by ID
   * @param {string} outcomeId
   * @returns {Object|null}
   */
  getOutcome(outcomeId) {
    return this.data.outcomes.find(o => o.id === outcomeId) || null;
  }

  /**
   * Add an indicator to an outcome
   * @param {string} outcomeId
   * @returns {string} The ID of the new indicator
   */
  addOutcomeIndicator(outcomeId) {
    const outcome = this.getOutcome(outcomeId);
    if (outcome) {
      const indicator = {
        id: crypto.randomUUID(),
        description: ""
      };
      outcome.indicators.push(indicator);
      this.data.lastModified = new Date().toISOString();
      this.notify('outcome-indicator-added', { outcomeId, indicatorId: indicator.id });
      return indicator.id;
    }
    return null;
  }

  /**
   * Update outcome indicator description
   * @param {string} outcomeId
   * @param {string} indicatorId
   * @param {string} description
   */
  updateOutcomeIndicator(outcomeId, indicatorId, description) {
    const outcome = this.getOutcome(outcomeId);
    if (outcome) {
      const indicator = outcome.indicators.find(i => i.id === indicatorId);
      if (indicator) {
        indicator.description = description;
        this.data.lastModified = new Date().toISOString();
        this.notify('outcome-indicator-updated', { outcomeId, indicatorId });
      }
    }
  }

  /**
   * Delete an outcome indicator
   * @param {string} outcomeId
   * @param {string} indicatorId
   */
  deleteOutcomeIndicator(outcomeId, indicatorId) {
    const outcome = this.getOutcome(outcomeId);
    if (outcome) {
      const index = outcome.indicators.findIndex(i => i.id === indicatorId);
      if (index !== -1) {
        outcome.indicators.splice(index, 1);
        this.data.lastModified = new Date().toISOString();
        this.notify('outcome-indicator-deleted', { outcomeId, indicatorId });
      }
    }
  }

  /**
   * Add an output to an outcome
   * @param {string} outcomeId
   * @returns {string} The ID of the new output
   */
  addOutput(outcomeId) {
    const outcome = this.getOutcome(outcomeId);
    if (outcome) {
      const output = {
        id: crypto.randomUUID(),
        statement: "",
        indicators: []
      };
      outcome.outputs.push(output);
      this.data.lastModified = new Date().toISOString();
      this.notify('output-added', { outcomeId, outputId: output.id });
      return output.id;
    }
    return null;
  }

  /**
   * Update output statement
   * @param {string} outcomeId
   * @param {string} outputId
   * @param {string} statement
   */
  updateOutputStatement(outcomeId, outputId, statement) {
    const outcome = this.getOutcome(outcomeId);
    if (outcome) {
      const output = outcome.outputs.find(o => o.id === outputId);
      if (output) {
        output.statement = statement;
        this.data.lastModified = new Date().toISOString();
        this.notify('output-updated', { outcomeId, outputId, field: 'statement' });
      }
    }
  }

  /**
   * Delete an output
   * @param {string} outcomeId
   * @param {string} outputId
   */
  deleteOutput(outcomeId, outputId) {
    const outcome = this.getOutcome(outcomeId);
    if (outcome) {
      const index = outcome.outputs.findIndex(o => o.id === outputId);
      if (index !== -1) {
        outcome.outputs.splice(index, 1);
        this.data.lastModified = new Date().toISOString();
        this.notify('output-deleted', { outcomeId, outputId });
      }
    }
  }

  /**
   * Get an output by ID
   * @param {string} outcomeId
   * @param {string} outputId
   * @returns {Object|null}
   */
  getOutput(outcomeId, outputId) {
    const outcome = this.getOutcome(outcomeId);
    if (outcome) {
      return outcome.outputs.find(o => o.id === outputId) || null;
    }
    return null;
  }

  /**
   * Add an indicator to an output
   * @param {string} outcomeId
   * @param {string} outputId
   * @returns {string} The ID of the new indicator
   */
  addOutputIndicator(outcomeId, outputId) {
    const output = this.getOutput(outcomeId, outputId);
    if (output) {
      const indicator = {
        id: crypto.randomUUID(),
        description: ""
      };
      output.indicators.push(indicator);
      this.data.lastModified = new Date().toISOString();
      this.notify('output-indicator-added', { outcomeId, outputId, indicatorId: indicator.id });
      return indicator.id;
    }
    return null;
  }

  /**
   * Update output indicator description
   * @param {string} outcomeId
   * @param {string} outputId
   * @param {string} indicatorId
   * @param {string} description
   */
  updateOutputIndicator(outcomeId, outputId, indicatorId, description) {
    const output = this.getOutput(outcomeId, outputId);
    if (output) {
      const indicator = output.indicators.find(i => i.id === indicatorId);
      if (indicator) {
        indicator.description = description;
        this.data.lastModified = new Date().toISOString();
        this.notify('output-indicator-updated', { outcomeId, outputId, indicatorId });
      }
    }
  }

  /**
   * Delete an output indicator
   * @param {string} outcomeId
   * @param {string} outputId
   * @param {string} indicatorId
   */
  deleteOutputIndicator(outcomeId, outputId, indicatorId) {
    const output = this.getOutput(outcomeId, outputId);
    if (output) {
      const index = output.indicators.findIndex(i => i.id === indicatorId);
      if (index !== -1) {
        output.indicators.splice(index, 1);
        this.data.lastModified = new Date().toISOString();
        this.notify('output-indicator-deleted', { outcomeId, outputId, indicatorId });
      }
    }
  }

  /**
   * Convert data to JSON string
   * @returns {string}
   */
  toJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Get all data
   * @returns {Object}
   */
  getData() {
    return this.data;
  }

  /**
   * Set all data (used when loading from storage)
   * @param {Object} data
   */
  setData(data) {
    this.data = data;
    this.notify('data-loaded', {});
  }
}
