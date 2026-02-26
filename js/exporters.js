/**
 * Export functions for JSON and Markdown formats
 */

import { downloadFile, getTimestamp, formatDate } from './utils.js';

/**
 * Export data as JSON
 * @param {TocDataModel} dataModel
 */
export function exportToJSON(dataModel) {
  try {
    const jsonString = dataModel.toJSON();
    const filename = `theory-of-change-${getTimestamp()}.json`;
    downloadFile(jsonString, filename, 'application/json');
    return true;
  } catch (error) {
    console.error('Error exporting JSON:', error);
    alert('Failed to export JSON file. Please try again.');
    return false;
  }
}

/**
 * Export data as Markdown
 * @param {TocDataModel} dataModel
 */
export function exportToMarkdown(dataModel) {
  try {
    const markdown = generateMarkdown(dataModel.getData());
    const filename = `theory-of-change-${getTimestamp()}.md`;
    downloadFile(markdown, filename, 'text/markdown');
    return true;
  } catch (error) {
    console.error('Error exporting Markdown:', error);
    alert('Failed to export Markdown file. Please try again.');
    return false;
  }
}

/**
 * Generate Markdown content from data
 * @param {Object} data
 * @returns {string}
 */
function generateMarkdown(data) {
  let markdown = '';

  // Title and metadata
  markdown += '# Theory of Change\n\n';
  markdown += `*Generated: ${formatDate(new Date())}*\n\n`;
  if (data.lastModified) {
    markdown += `*Last modified: ${formatDate(data.lastModified)}*\n\n`;
  }
  markdown += '---\n\n';

  // Impact Statement
  markdown += '## Impact Statement\n\n';
  markdown += `${data.impact.statement}\n\n`;
  markdown += '---\n\n';

  // Outcomes
  if (data.outcomes.length > 0) {
    markdown += '## Outcomes\n\n';

    data.outcomes.forEach((outcome, outcomeIndex) => {
      markdown += `### Outcome ${outcomeIndex + 1}\n\n`;

      if (outcome.statement) {
        markdown += `${outcome.statement}\n\n`;
      } else {
        markdown += '*No statement provided*\n\n';
      }

      // Outcome Indicators
      if (outcome.indicators.length > 0) {
        markdown += '**Indicators:**\n\n';
        outcome.indicators.forEach((indicator, indicatorIndex) => {
          const description = indicator.description || '*No description*';
          markdown += `${indicatorIndex + 1}. ${description}\n`;
        });
        markdown += '\n';
      }

      // Outputs
      if (outcome.outputs.length > 0) {
        markdown += '**Outputs:**\n\n';

        outcome.outputs.forEach((output, outputIndex) => {
          markdown += `#### Output ${outcomeIndex + 1}.${outputIndex + 1}\n\n`;

          if (output.statement) {
            markdown += `${output.statement}\n\n`;
          } else {
            markdown += '*No statement provided*\n\n';
          }

          // Output Indicators
          if (output.indicators.length > 0) {
            markdown += '*Indicators:*\n\n';
            output.indicators.forEach((indicator, indicatorIndex) => {
              const description = indicator.description || '*No description*';
              markdown += `- ${description}\n`;
            });
            markdown += '\n';
          }
        });
      }

      markdown += '---\n\n';
    });
  } else {
    markdown += '## Outcomes\n\n';
    markdown += '*No outcomes defined yet*\n\n';
  }

  return markdown;
}

/**
 * Preview Markdown in a new window (useful for debugging)
 * @param {TocDataModel} dataModel
 */
export function previewMarkdown(dataModel) {
  const markdown = generateMarkdown(dataModel.getData());
  const previewWindow = window.open('', '_blank');
  previewWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Theory of Change Preview</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          max-width: 800px;
          margin: 2rem auto;
          padding: 0 1rem;
          line-height: 1.6;
        }
        pre {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <h1>Markdown Preview</h1>
      <pre>${escapeHtml(markdown)}</pre>
    </body>
    </html>
  `);
  previewWindow.document.close();
}

/**
 * Escape HTML for safe display
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
