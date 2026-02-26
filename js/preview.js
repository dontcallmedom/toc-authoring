/**
 * Preview and visualization of Theory of Change logic chain
 * Shows hierarchical relationships in a compact, readable format
 */

/**
 * Generate a compact preview of the ToC logic chain
 * @param {Object} data - The ToC data model
 * @returns {HTMLElement} - The preview container element
 */
export function generatePreview(data) {
  const container = document.createElement('div');
  container.className = 'preview-container';

  // Title
  const title = document.createElement('h2');
  title.textContent = 'Theory of Change - Logic Chain Preview';
  title.className = 'preview-title';
  container.appendChild(title);

  // Create the hierarchical structure
  const chain = document.createElement('div');
  chain.className = 'logic-chain';

  // Impact level
  const impactSection = createImpactSection(data.impact);
  chain.appendChild(impactSection);

  // Outcomes level
  if (data.outcomes.length > 0) {
    const outcomesSection = createOutcomesSection(data.outcomes);
    chain.appendChild(outcomesSection);
  } else {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'empty-preview';
    emptyMessage.textContent = 'No outcomes defined yet. Add outcomes to see the complete logic chain.';
    chain.appendChild(emptyMessage);
  }

  container.appendChild(chain);

  // Add legend
  const legend = createLegend();
  container.appendChild(legend);

  return container;
}

/**
 * Create impact section
 * @param {Object} impact
 * @returns {HTMLElement}
 */
function createImpactSection(impact) {
  const section = document.createElement('section');
  section.className = 'preview-level impact-level';

  const header = document.createElement('div');
  header.className = 'level-header';

  const badge = document.createElement('span');
  badge.className = 'level-badge impact-badge';
  badge.textContent = 'IMPACT';

  header.appendChild(badge);
  section.appendChild(header);

  const statement = document.createElement('div');
  statement.className = 'level-statement';
  statement.textContent = impact.statement;
  section.appendChild(statement);

  return section;
}

/**
 * Create outcomes section
 * @param {Array} outcomes
 * @returns {HTMLElement}
 */
function createOutcomesSection(outcomes) {
  const section = document.createElement('section');
  section.className = 'preview-level outcomes-level';

  const header = document.createElement('div');
  header.className = 'level-header';

  const badge = document.createElement('span');
  badge.className = 'level-badge outcomes-badge';
  badge.textContent = `OUTCOMES (${outcomes.length})`;

  header.appendChild(badge);
  section.appendChild(header);

  // Create list of outcomes
  const list = document.createElement('ul');
  list.className = 'outcomes-list';

  outcomes.forEach((outcome, index) => {
    const item = createOutcomeItem(outcome, index + 1);
    list.appendChild(item);
  });

  section.appendChild(list);

  return section;
}

/**
 * Create a single outcome item with its outputs and indicators
 * @param {Object} outcome
 * @param {number} index
 * @returns {HTMLElement}
 */
function createOutcomeItem(outcome, index) {
  const item = document.createElement('li');
  item.className = 'outcome-item';

  // Outcome statement
  const outcomeDiv = document.createElement('div');
  outcomeDiv.className = 'outcome-content';

  const outcomeNumber = document.createElement('strong');
  outcomeNumber.className = 'item-number';
  outcomeNumber.textContent = `Outcome ${index}: `;

  const outcomeText = document.createElement('span');
  outcomeText.textContent = outcome.statement || '(No statement provided)';

  outcomeDiv.appendChild(outcomeNumber);
  outcomeDiv.appendChild(outcomeText);
  item.appendChild(outcomeDiv);

  // Outcome indicators (if any)
  if (outcome.indicators.length > 0) {
    const indicatorsDiv = createIndicatorsList(outcome.indicators, 'outcome');
    item.appendChild(indicatorsDiv);
  }

  // Outputs (if any)
  if (outcome.outputs.length > 0) {
    const outputsDiv = createOutputsList(outcome.outputs);
    item.appendChild(outputsDiv);
  }

  return item;
}

/**
 * Create outputs list
 * @param {Array} outputs
 * @returns {HTMLElement}
 */
function createOutputsList(outputs) {
  const container = document.createElement('div');
  container.className = 'outputs-container';

  const header = document.createElement('div');
  header.className = 'subsection-header';
  header.innerHTML = '<span class="arrow">↳</span> <strong>Outputs:</strong>';
  container.appendChild(header);

  const list = document.createElement('ul');
  list.className = 'outputs-list';

  outputs.forEach((output, index) => {
    const item = document.createElement('li');
    item.className = 'output-item';

    const outputDiv = document.createElement('div');
    outputDiv.className = 'output-content';

    const outputNumber = document.createElement('span');
    outputNumber.className = 'item-number';
    outputNumber.textContent = `${index + 1}. `;

    const outputText = document.createElement('span');
    outputText.textContent = output.statement || '(No statement provided)';

    outputDiv.appendChild(outputNumber);
    outputDiv.appendChild(outputText);
    item.appendChild(outputDiv);

    // Output indicators (if any)
    if (output.indicators.length > 0) {
      const indicatorsDiv = createIndicatorsList(output.indicators, 'output');
      item.appendChild(indicatorsDiv);
    }

    list.appendChild(item);
  });

  container.appendChild(list);

  return container;
}

/**
 * Create indicators list
 * @param {Array} indicators
 * @param {string} type - 'outcome' or 'output'
 * @returns {HTMLElement}
 */
function createIndicatorsList(indicators, type) {
  const container = document.createElement('div');
  container.className = `indicators-container ${type}-indicators`;

  const header = document.createElement('div');
  header.className = 'subsection-header indicators-header';
  header.innerHTML = '<span class="arrow">→</span> <em>Indicators:</em>';
  container.appendChild(header);

  const list = document.createElement('ul');
  list.className = 'indicators-list-preview';

  indicators.forEach((indicator) => {
    const item = document.createElement('li');
    item.className = 'indicator-item-preview';
    item.textContent = indicator.description || '(No description)';
    list.appendChild(item);
  });

  container.appendChild(list);

  return container;
}

/**
 * Create legend explaining the structure
 * @returns {HTMLElement}
 */
function createLegend() {
  const legend = document.createElement('div');
  legend.className = 'preview-legend';

  legend.innerHTML = `
    <h3>Reading the Logic Chain</h3>
    <ul>
      <li><strong>Impact</strong> - The ultimate goal or change you want to achieve</li>
      <li><strong>Outcomes</strong> - Intermediate results that lead to the impact</li>
      <li><strong>Outputs</strong> (↳) - Activities or deliverables that enable outcomes</li>
      <li><strong>Indicators</strong> (→) - Measurable signs of progress</li>
    </ul>
  `;

  return legend;
}

/**
 * Show preview in a modal dialog
 * @param {Object} dataModel - The data model containing ToC data
 * @param {AccessibilityManager} accessibility - For announcements
 */
export function showPreviewModal(dataModel, accessibility) {
  // Create modal backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'preview-modal-title');

  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'modal-content preview-modal';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'modal-close';
  closeBtn.setAttribute('aria-label', 'Close preview');
  closeBtn.innerHTML = '<span aria-hidden="true">×</span>';
  closeBtn.addEventListener('click', () => closePreviewModal(backdrop, accessibility));

  modal.appendChild(closeBtn);

  // Generate preview content
  const preview = generatePreview(dataModel.getData());
  // Update title ID for aria-labelledby
  const titleElement = preview.querySelector('.preview-title');
  if (titleElement) {
    titleElement.id = 'preview-modal-title';
  }
  modal.appendChild(preview);

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  // Focus on close button
  setTimeout(() => {
    closeBtn.focus();
  }, 100);

  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closePreviewModal(backdrop, accessibility);
    }
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closePreviewModal(backdrop, accessibility);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Announce to screen readers
  accessibility.announce('Logic chain preview opened. Press Escape to close.');
}

/**
 * Close the preview modal
 * @param {HTMLElement} backdrop
 * @param {AccessibilityManager} accessibility
 */
function closePreviewModal(backdrop, accessibility) {
  backdrop.remove();
  accessibility.announce('Preview closed.');
}

/**
 * Render preview in a container (non-modal version for main view)
 * @param {Object} dataModel - The data model containing ToC data
 * @param {string} containerId - ID of container element to render into
 */
export function renderPreviewInline(dataModel, containerId = 'preview-content-container') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  // Clear existing content
  container.innerHTML = '';

  // Generate preview content
  const preview = generatePreview(dataModel.getData());

  // Remove the title (it's redundant in inline view)
  const title = preview.querySelector('.preview-title');
  if (title) {
    title.remove();
  }

  // Add to container
  container.appendChild(preview);
}
