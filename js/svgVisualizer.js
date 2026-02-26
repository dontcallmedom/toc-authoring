/**
 * SVG Visualizer for Theory of Change Logic Chain
 * Creates accessible, compact SVG representations showing relationships
 */

/**
 * Generate SVG visualization of the ToC
 * @param {Object} data - The ToC data model
 * @returns {SVGElement} - SVG element with visualization
 */
export function generateSVGVisualization(data) {
  // Configuration
  const config = {
    width: 1200,
    levelHeight: 180,
    itemWidth: 200,
    itemHeight: 80,
    horizontalGap: 40,
    verticalGap: 20,
    padding: 20,
    colors: {
      impact: '#1976d2',
      outcome: '#388e3c',
      output: '#f57c00',
      connection: '#999',
      indicator: '#666'
    }
  };

  // Collect all unique outputs (detecting shared ones)
  const outputsMap = new Map(); // key: output statement, value: {output, outcomeIds[]}

  data.outcomes.forEach(outcome => {
    outcome.outputs.forEach(output => {
      const key = output.statement.trim().toLowerCase();
      if (outputsMap.has(key)) {
        outputsMap.get(key).outcomeIds.push(outcome.id);
      } else {
        outputsMap.set(key, {
          output: output,
          outcomeIds: [outcome.id]
        });
      }
    });
  });

  const uniqueOutputs = Array.from(outputsMap.values());

  // Calculate dimensions
  const maxItemsPerRow = Math.max(data.outcomes.length, uniqueOutputs.length, 1);
  const totalWidth = Math.max(
    config.width,
    maxItemsPerRow * (config.itemWidth + config.horizontalGap) + config.padding * 2
  );
  const totalHeight = config.levelHeight * 3 + config.padding * 2;

  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', totalWidth);
  svg.setAttribute('height', totalHeight);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Theory of Change logic chain visualization');
  svg.classList.add('toc-svg-visualization');

  // Add title for accessibility
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  title.textContent = 'Theory of Change showing impact, outcomes, and outputs with their relationships';
  svg.appendChild(title);

  // Add description for accessibility
  const desc = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
  desc.textContent = `Visualization showing ${data.outcomes.length} outcomes supporting the impact statement, with ${uniqueOutputs.length} unique outputs.`;
  svg.appendChild(desc);

  // Create definitions for markers
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'arrowhead');
  marker.setAttribute('markerWidth', '10');
  marker.setAttribute('markerHeight', '10');
  marker.setAttribute('refX', '9');
  marker.setAttribute('refY', '3');
  marker.setAttribute('orient', 'auto');
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('points', '0 0, 10 3, 0 6');
  polygon.setAttribute('fill', config.colors.connection);
  marker.appendChild(polygon);
  defs.appendChild(marker);
  svg.appendChild(defs);

  // Layer 1: Impact
  const impactY = config.padding + config.itemHeight / 2;
  const impactX = totalWidth / 2;
  const impactNode = createNode(
    impactX - config.itemWidth / 2,
    config.padding,
    config.itemWidth * 1.5,
    config.itemHeight,
    data.impact.statement,
    config.colors.impact,
    'Impact',
    0
  );
  svg.appendChild(impactNode.group);

  // Layer 2: Outcomes
  const outcomesY = config.padding + config.levelHeight + config.itemHeight / 2;
  const outcomeNodes = [];
  const outcomeSpacing = totalWidth / (data.outcomes.length + 1);

  data.outcomes.forEach((outcome, index) => {
    const x = outcomeSpacing * (index + 1) - config.itemWidth / 2;
    const y = config.padding + config.levelHeight;
    const indicatorCount = outcome.indicators.length;

    const node = createNode(
      x,
      y,
      config.itemWidth,
      config.itemHeight,
      outcome.statement,
      config.colors.outcome,
      'Outcome',
      indicatorCount
    );
    svg.appendChild(node.group);

    outcomeNodes.push({
      id: outcome.id,
      x: x + config.itemWidth / 2,
      y: y + config.itemHeight,
      node: node
    });

    // Draw connection from impact to outcome
    const connection = createConnection(
      impactX,
      impactY + config.itemHeight / 2,
      x + config.itemWidth / 2,
      y,
      config.colors.connection
    );
    svg.insertBefore(connection, impactNode.group);
  });

  // Layer 3: Outputs
  const outputsY = config.padding + config.levelHeight * 2;
  const outputNodes = [];
  const outputSpacing = totalWidth / (uniqueOutputs.length + 1);

  uniqueOutputs.forEach((outputData, index) => {
    const x = outputSpacing * (index + 1) - config.itemWidth / 2;
    const y = outputsY;
    const output = outputData.output;
    const indicatorCount = output.indicators.length;

    // Check if shared across multiple outcomes
    const isShared = outputData.outcomeIds.length > 1;
    const label = isShared ? `Output (shared across ${outputData.outcomeIds.length} outcomes)` : 'Output';

    const node = createNode(
      x,
      y,
      config.itemWidth,
      config.itemHeight,
      output.statement,
      config.colors.output,
      label,
      indicatorCount,
      isShared
    );
    svg.appendChild(node.group);

    outputNodes.push({
      outcomeIds: outputData.outcomeIds,
      x: x + config.itemWidth / 2,
      y: y,
      node: node
    });

    // Draw connections from outcomes to this output
    outputData.outcomeIds.forEach(outcomeId => {
      const outcomeNode = outcomeNodes.find(n => n.id === outcomeId);
      if (outcomeNode) {
        const connection = createConnection(
          outcomeNode.x,
          outcomeNode.y,
          x + config.itemWidth / 2,
          y,
          config.colors.connection,
          isShared
        );
        // Insert before first node to keep connections in back
        svg.insertBefore(connection, svg.firstChild.nextSibling);
      }
    });
  });

  return svg;
}

/**
 * Create a node (box) in the visualization
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Node width
 * @param {number} height - Node height
 * @param {string} text - Full text content
 * @param {string} color - Fill color
 * @param {string} label - Type label
 * @param {number} indicatorCount - Number of indicators
 * @param {boolean} isShared - Whether output is shared
 * @returns {Object} - Group element and dimensions
 */
function createNode(x, y, width, height, text, color, label, indicatorCount = 0, isShared = false) {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.classList.add('toc-node');

  // Rectangle
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', width);
  rect.setAttribute('height', height);
  rect.setAttribute('rx', 4);
  rect.setAttribute('fill', color);
  rect.setAttribute('stroke', isShared ? '#d32f2f' : color);
  rect.setAttribute('stroke-width', isShared ? 3 : 1);
  rect.setAttribute('opacity', 0.9);
  group.appendChild(rect);

  // Truncated text (max 60 chars)
  const truncatedText = text.length > 60 ? text.substring(0, 57) + '...' : text;

  // Type label
  const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  labelText.setAttribute('x', x + width / 2);
  labelText.setAttribute('y', y + 20);
  labelText.setAttribute('text-anchor', 'middle');
  labelText.setAttribute('fill', '#fff');
  labelText.setAttribute('font-size', '12');
  labelText.setAttribute('font-weight', 'bold');
  labelText.textContent = label;
  group.appendChild(labelText);

  // Main text (wrapped)
  const words = truncatedText.split(' ');
  const lines = [];
  let currentLine = '';
  const maxCharsPerLine = 30;

  words.forEach(word => {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);

  const maxLines = 2;
  const displayLines = lines.slice(0, maxLines);

  displayLines.forEach((line, i) => {
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('x', x + width / 2);
    textEl.setAttribute('y', y + 38 + i * 14);
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('fill', '#fff');
    textEl.setAttribute('font-size', '11');
    textEl.textContent = line + (i === maxLines - 1 && lines.length > maxLines ? '...' : '');
    group.appendChild(textEl);
  });

  // Indicator count badge
  if (indicatorCount > 0) {
    const badgeX = x + width - 15;
    const badgeY = y + 5;

    const badge = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    badge.setAttribute('cx', badgeX);
    badge.setAttribute('cy', badgeY);
    badge.setAttribute('r', 10);
    badge.setAttribute('fill', '#fff');
    badge.setAttribute('opacity', 0.9);
    group.appendChild(badge);

    const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    badgeText.setAttribute('x', badgeX);
    badgeText.setAttribute('y', badgeY + 4);
    badgeText.setAttribute('text-anchor', 'middle');
    badgeText.setAttribute('fill', color);
    badgeText.setAttribute('font-size', '10');
    badgeText.setAttribute('font-weight', 'bold');
    badgeText.textContent = indicatorCount;
    group.appendChild(badgeText);

    // Tooltip for indicator count
    const badgeTitle = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    badgeTitle.textContent = `${indicatorCount} indicator${indicatorCount > 1 ? 's' : ''}`;
    badge.appendChild(badgeTitle);
  }

  // Full text tooltip
  const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  titleEl.textContent = text;
  rect.appendChild(titleEl);

  return { group, x, y, width, height };
}

/**
 * Create a connection line between nodes
 * @param {number} x1 - Start X
 * @param {number} y1 - Start Y
 * @param {number} x2 - End X
 * @param {number} y2 - End Y
 * @param {string} color - Line color
 * @param {boolean} isShared - Whether this is a shared connection
 * @returns {SVGElement} - Path element
 */
function createConnection(x1, y1, x2, y2, color, isShared = false) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  // Calculate control points for bezier curve
  const midY = (y1 + y2) / 2;
  const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

  path.setAttribute('d', d);
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', isShared ? 2.5 : 1.5);
  path.setAttribute('fill', 'none');
  path.setAttribute('opacity', isShared ? 0.8 : 0.5);
  path.setAttribute('marker-end', 'url(#arrowhead)');

  if (isShared) {
    path.setAttribute('stroke-dasharray', '5,5');
  }

  path.classList.add('toc-connection');

  return path;
}

/**
 * Render SVG visualization inline
 * @param {Object} dataModel - The data model
 * @param {string} containerId - Container element ID
 */
export function renderSVGVisualization(dataModel, containerId = 'svg-visualization-container') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }

  // Clear existing content
  container.innerHTML = '';

  // Generate SVG
  const svg = generateSVGVisualization(dataModel.getData());

  // Add to container
  container.appendChild(svg);
}
