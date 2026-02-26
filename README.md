# Theory of Change Authoring Tool

A client-side web application for authoring Theory of Change (ToC) chains of logic. This tool helps individual contributors build a clear path from impact statements to outcomes and outputs, with measurable indicators at each level.

## Features

- **Preview-First Interface**: Default view shows your complete ToC logic chain hierarchically
- **Dual Visualization**: Toggle between Text View (hierarchical) and Diagram View (SVG graphic)
- **Shared Output Detection**: Diagram automatically highlights outputs supporting multiple outcomes
- **Dual-Mode**: Toggle between Preview mode (visualization) and Edit mode (authoring)
- **URL Import**: Load ToC data from URLs (relative or absolute) via UI or query string
- **File Import**: Import from local JSON files
- **Auto-save**: Automatically saves your work to browser localStorage (edit mode)
- **Export**: Download as JSON or Markdown formats
- **Client-side only**: All data stays in your browser - no server required
- **Fully accessible**: WCAG 2.1 AA compliant, keyboard navigable, screen reader friendly
- **Modern browsers**: Built with vanilla JavaScript ES6+ modules

## Getting Started

### Running the Application

1. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
2. That's it! No build step or server required.

### Using the Application

#### Preview Mode (Default)

The application starts in **Preview mode**, showing your Theory of Change as a hierarchical visualization:

1. **Load from URL**: Enter a URL (relative like `./data.json` or absolute) and click "Load"
2. **Import from File**: Click "Import from File" to select a local JSON file
3. **Toggle Visualization**: Switch between "Text View" (hierarchical list) and "Diagram View" (SVG graphic)
4. **View Logic Chain**: See your complete ToC with impact → outcomes → outputs → indicators
5. **Switch to Edit**: Click the "Edit" button in the header to modify your ToC

#### Edit Mode

Switch to **Edit mode** to author or modify your ToC:

1. **Impact Statement**: The top section shows the pre-set impact statement
2. **Add Outcomes**: Click "Add Outcome" to create outcomes that support the impact
3. **Add Indicators**: Within each outcome, add indicators to measure progress
4. **Add Outputs**: Within each outcome, add outputs (activities) that support it
5. **Output Indicators**: Each output can have its own measurable indicators
6. **Auto-save**: Your work is automatically saved as you type (2-second delay)
7. **Manual Save**: Click "Save Progress" to save immediately
8. **Export**: Download as JSON or Markdown
9. **Switch to Preview**: Click the "Preview" button to see your ToC visualized

## Data Structure

### Hierarchy

```
Impact Statement (pre-set)
└── Outcomes (user-defined)
    ├── Outcome Indicators (user-defined)
    └── Outputs (user-defined)
        └── Output Indicators (user-defined)
```

### JSON Format

```json
{
  "version": "1.0",
  "lastModified": "2026-02-26T10:30:00.000Z",
  "impact": {
    "id": "impact-1",
    "statement": "Communities achieve sustainable food security..."
  },
  "outcomes": [
    {
      "id": "uuid",
      "statement": "Increased agricultural productivity",
      "indicators": [
        {
          "id": "uuid",
          "description": "20% increase in crop yields"
        }
      ],
      "outputs": [
        {
          "id": "uuid",
          "statement": "Farmer training programs delivered",
          "indicators": [
            {
              "id": "uuid",
              "description": "500 farmers trained"
            }
          ]
        }
      ]
    }
  ]
}
```

## Accessibility Features

### Keyboard Navigation

- **Tab**: Move forward through interactive elements
- **Shift+Tab**: Move backward through interactive elements
- **Enter/Space**: Activate buttons
- **Skip link**: Press Tab on page load to skip to main content

### Screen Reader Support

- All buttons have descriptive labels
- Changes are announced via ARIA live regions
- Semantic HTML structure (headings, landmarks, lists)
- Focus moves logically when adding/deleting items

### Visual Accessibility

- High contrast focus indicators (3px solid, 3:1 contrast ratio)
- Respects `prefers-reduced-motion` setting
- Respects `prefers-contrast` setting
- Clear visual hierarchy

## Browser Compatibility

### Minimum Requirements

Modern browsers with support for:
- ES6+ JavaScript (const, let, arrow functions, classes, modules)
- `crypto.randomUUID()`
- `localStorage`
- Blob API
- CSS Grid and Flexbox

### Tested Browsers

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Data Storage

### LocalStorage

- **Key**: `toc-authoring-data`
- **Auto-save**: 2 seconds after last change
- **Manual save**: Click "Save Progress" button
- **Capacity**: ~5-10MB (sufficient for hundreds of outcomes)

### Data Persistence

✅ **Data persists between sessions**
✅ **Data survives page refresh**
❌ **Data is lost when clearing browser data**
❌ **Data is not synced across devices**

**Important**: Always export your ToC regularly as a backup!

### Private Browsing

localStorage may be disabled in private/incognito mode. The app will warn you if storage is unavailable.

## Loading Data from URLs

### Query String Parameters

You can load a ToC automatically by providing a URL parameter:

```
index.html?url=./w3c-impact-framework-toc.json
index.html?url=https://example.com/toc.json
index.html?data=./my-toc.json
index.html?source=https://example.com/data.json
```

**Supported parameter names**: `url`, `data`, or `source`

**URL types**:
- **Relative URLs**: `./file.json`, `../data/toc.json`, `subfolder/data.json`
- **Absolute URLs**: `https://example.com/toc.json`, `http://localhost:3000/api/toc`

**Use cases**:
- **Share your ToC**: Send a link like `index.html?url=https://yourserver.com/toc.json`
- **Quick loading**: Bookmark links to frequently used ToCs
- **Documentation**: Link to example ToCs in your docs
- **Testing**: Load test data automatically during development

### Manual URL Import

In Preview mode, you can also:
1. Enter a URL in the "Load from URL" field
2. Click the "Load" button
3. View the imported ToC immediately

**CORS Note**: When loading from external domains, the server must support CORS. Local/relative URLs don't have this restriction.

## Logic Chain Visualization

The preview mode provides two complementary ways to visualize your Theory of Change: a hierarchical **Text View** and a graphical **Diagram View**. Both show the complete relationships between impact, outcomes, outputs, and indicators.

### Visualization Types

Use the visualization toggle buttons in Preview mode to switch between views:

#### Text View (Default)

A compact, hierarchical text representation showing the logical flow of your ToC.

**Structure:**
- **IMPACT** - Displayed at the top in blue
- **OUTCOMES** - Each outcome shown with its number and statement (green border)
  - **Indicators** (→) - Measurable signs of progress for each outcome
  - **Outputs** (↳) - Activities supporting each outcome
    - **Indicators** (→) - Measurable signs of progress for each output

**Visual Indicators:**
- Outcomes have a green left border
- Outputs are nested and indented under their outcomes
- Indicators are shown with bullet points
- Arrows show the flow: ↳ for outputs, → for indicators

**Example:**
```
IMPACT
People around the world experience a single, unified Web...

OUTCOMES (4)

Outcome 1: Open Web standards are implemented consistently...
  → Cross-implementation conformance test pass rates increase
  → Reduction in implementation-specific compatibility issues

  ↳ Outputs:
    1. Working Groups publish open, royalty-free Web standards
       → Number of W3C Recommendations published
    2. Interoperability test suites are developed
       → Test coverage of standardized features
```

#### Diagram View (SVG)

An interactive graphical representation showing the logic chain as connected boxes across three layers.

**Three-Layer Structure:**
1. **Impact** (Top) - Blue box centered at the top
2. **Outcomes** (Middle) - Green boxes distributed horizontally
3. **Outputs** (Bottom) - Orange boxes distributed horizontally

**Visual Elements:**
- **Colored Boxes**: Impact (blue), Outcomes (green), Outputs (orange)
- **Connection Lines**: Bezier curves showing relationships from impact → outcomes → outputs
- **Indicator Badges**: White circles in top-right corner showing count of indicators (e.g., "3")
- **Shared Outputs**: Red dashed border and thicker dashed connection lines
- **Text Truncation**: Long statements automatically wrapped and truncated with "..."
- **Hover Tooltips**: Full text shown on hover for truncated content

**Detecting Shared Outputs:**

The diagram automatically detects when the same output supports multiple outcomes (based on matching statement text). Shared outputs are highlighted with:
- Red border (3px) instead of orange
- Dashed connection lines from all related outcomes
- Label showing "Output (shared across N outcomes)"

**Accessibility:**
- Full SVG with `role="img"` and `aria-label`
- `<title>` and `<desc>` elements for screen readers
- Tooltips on all elements showing full content
- Indicator count badges include descriptive titles

### How to Use

**Switching Views:**
1. Open Preview mode (click "Preview" button in header)
2. Use the visualization toggle: "Text View" or "Diagram View"
3. Toggle between views as needed to explore your ToC

**Benefits:**

**Text View:**
- Compact and readable
- Easy to scan hierarchically
- Better for detailed review
- Works well for screen readers
- Printable format

**Diagram View:**
- Visual overview at a glance
- Relationship mapping is clearer
- Identifies shared outputs immediately
- Shows proportions (e.g., many outputs per outcome)
- More engaging for presentations

### Use Cases

- **Quick Overview**: See your entire ToC structure at a glance
- **Relationship Mapping**: Understand how outputs support outcomes
- **Shared Output Detection**: Identify outputs supporting multiple outcomes
- **Completeness Check**: Spot outcomes missing outputs or indicators
- **Presentation Ready**: Use diagram for stakeholder discussions
- **Documentation**: Use text view for detailed documentation
- **Analysis**: Count indicators, assess distribution of outputs

## Example Data

The repository includes a sample ToC file: `w3c-impact-framework-toc.json`

This file contains the W3C Impact Framework with:
- 4 outcomes related to open Web standards
- 5 outputs supporting these outcomes
- Multiple indicators for outcomes and outputs

**To load it**:
```
# Via query string
index.html?url=./w3c-impact-framework-toc.json

# Or use the UI
1. Open index.html
2. Enter "./w3c-impact-framework-toc.json" in the URL field
3. Click "Load"
```

## Import & Export

### Import Methods

#### 1. URL Import (Preview Mode)

Load ToC data from a URL:

**Via UI**:
1. In Preview mode, enter a URL in the "Load from URL" field
2. Click "Load"
3. Data is fetched, validated, and displayed

**Via Query String** (automatic on page load):
```
index.html?url=./w3c-impact-framework-toc.json
```

**Supported URLs**:
- Relative: `./data.json`, `../folder/file.json`
- Absolute: `https://example.com/toc.json`
- Local server: `http://localhost:3000/api/toc`

**Requirements**:
- URL must return valid JSON
- JSON must match ToC data structure
- External URLs require CORS support

#### 2. File Import

Upload a JSON file from your computer:

**Process**:
1. Click "Import from File" button (Preview mode) or "Import from JSON" (Edit mode)
2. Select a `.json` file from your computer
3. Confirm replacement if existing data present
4. Data is validated and loaded

**Supported file types**: `.json` files exported from this application

### JSON Export

- Full data structure with all metadata
- Can be re-imported using the Import button
- Filename: `theory-of-change-YYYY-MM-DD-HHMMSS.json`

### Markdown Export

- Human-readable documentation format
- Hierarchical structure using headings
- Numbered lists for indicators
- Filename: `theory-of-change-YYYY-MM-DD-HHMMSS.md`

Example Markdown output:

```markdown
# Theory of Change

*Generated: February 26, 2026*

---

## Impact Statement

Communities achieve sustainable food security and improved nutrition outcomes

---

## Outcomes

### Outcome 1

Increased agricultural productivity

**Indicators:**

1. 20% increase in crop yields
2. 15% reduction in post-harvest losses

**Outputs:**

#### Output 1.1

Farmer training programs delivered

*Indicators:*

- 500 farmers trained
- 80% knowledge retention rate

---
```

## Architecture

### File Structure

```
/
├── index.html                 # Main HTML structure
├── css/
│   ├── layout.css            # Layout and responsive design
│   ├── styles.css            # Visual styles and typography
│   └── accessibility.css     # Accessibility features
├── js/
│   ├── app.js                # Application initialization
│   ├── dataModel.js          # Data structure and state management
│   ├── storage.js            # localStorage operations
│   ├── domBuilder.js         # Dynamic DOM generation
│   ├── eventHandlers.js      # User interaction handling
│   ├── accessibility.js      # Focus management and ARIA
│   ├── importers.js          # JSON import functionality
│   ├── exporters.js          # JSON and Markdown export
│   ├── preview.js            # Text-based logic chain visualization
│   ├── svgVisualizer.js      # SVG diagram visualization
│   └── utils.js              # Utility functions
└── README.md                  # This file
```

### Design Patterns

- **Observer Pattern**: Data model notifies components of changes
- **Event Delegation**: Single listeners handle all dynamic content
- **Separation of Concerns**: Each module has a single responsibility
- **Semantic HTML First**: ARIA only as supplement to semantic elements

## Development

### No Build Process

This application uses native ES6 modules - no build step required!

### Making Changes

1. Edit files directly
2. Refresh browser to see changes
3. Check browser console for errors

### Debugging

- Open browser DevTools (F12)
- Check Console tab for errors and logs
- Use localStorage inspector to view saved data
- Use Accessibility inspector to verify ARIA

## Troubleshooting

### Data not saving

- Check browser console for errors
- Verify localStorage is available (not in private mode)
- Check if storage quota is exceeded (unlikely with text data)

### Import not working

**File Import:**
- Ensure the file is a valid JSON file exported from this application
- Check browser console for specific error messages
- Verify the file isn't corrupted (try opening in a text editor)
- Make sure the file size is under 10MB

**URL Import:**
- Verify the URL is correct and accessible
- Check browser console for network errors
- For external URLs, ensure the server supports CORS
- For relative URLs, ensure the file exists at that path
- Test the URL directly in browser to verify it returns JSON
- Check for typos in query string parameter: `?url=./file.json`

### Export not working

- Check browser console for errors
- Verify pop-up blocker isn't blocking downloads
- Try different browser if issue persists

### Accessibility issues

- Test with keyboard only (no mouse)
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Check focus indicators are visible
- Verify announcements are working

## Future Enhancements

Potential features for future versions:

- Multiple impact statements
- Output linking (shared references across outcomes)
- Undo/redo functionality
- PDF export
- Templates for common outcomes/outputs
- Cloud sync option
- Import from JSON file

## License

This project is provided as-is for use in authoring Theory of Change documents.

## Support

For issues or questions, please refer to the code comments in each JavaScript file for detailed implementation notes.
