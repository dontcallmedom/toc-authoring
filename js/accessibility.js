/**
 * Accessibility Manager
 * Handles focus management, ARIA announcements, and keyboard navigation
 */

export class AccessibilityManager {
  constructor() {
    this.announcer = document.getElementById('announcements');
    this.lastFocusedElement = null;
  }

  /**
   * Announce a message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - 'polite' or 'assertive'
   */
  announce(message, priority = 'polite') {
    if (!this.announcer) return;

    this.announcer.textContent = message;
    this.announcer.setAttribute('aria-live', priority);

    // Clear after 5 seconds to prevent stale announcements
    setTimeout(() => {
      this.announcer.textContent = '';
    }, 5000);
  }

  /**
   * Focus an element and scroll it into view
   * @param {HTMLElement} element
   */
  focusElement(element) {
    if (!element) return;

    this.lastFocusedElement = element;

    // Ensure element is focusable
    if (!element.hasAttribute('tabindex') &&
        !element.matches('a, button, input, textarea, select')) {
      element.setAttribute('tabindex', '-1');
    }

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  /**
   * Find the previous focusable element (for deletion flows)
   * @param {HTMLElement} element - Element being deleted
   * @returns {HTMLElement|null}
   */
  findPreviousFocusable(element) {
    const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(document.querySelectorAll(focusableSelector));

    // Try to find a focusable element within the element being deleted
    const elementFocusables = Array.from(element.querySelectorAll(focusableSelector));
    if (elementFocusables.length > 0) {
      const currentIndex = focusableElements.indexOf(elementFocusables[0]);
      if (currentIndex > 0) {
        return focusableElements[currentIndex - 1];
      }
    }

    // Fallback to first focusable element
    return focusableElements[0] || null;
  }

  /**
   * Find the next focusable sibling (for navigation)
   * @param {HTMLElement} element
   * @returns {HTMLElement|null}
   */
  findNextFocusable(element) {
    const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(document.querySelectorAll(focusableSelector));

    const elementFocusables = Array.from(element.querySelectorAll(focusableSelector));
    if (elementFocusables.length > 0) {
      const currentIndex = focusableElements.indexOf(elementFocusables[elementFocusables.length - 1]);
      if (currentIndex < focusableElements.length - 1) {
        return focusableElements[currentIndex + 1];
      }
    }

    return null;
  }

  /**
   * Update ARIA label dynamically
   * @param {HTMLElement} element
   * @param {string} newLabel
   */
  updateAriaLabel(element, newLabel) {
    if (element) {
      element.setAttribute('aria-label', newLabel);
    }
  }

  /**
   * Set error state on a form field
   * @param {string} fieldId
   * @param {string} errorMessage
   */
  setFieldError(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const errorId = `${fieldId}-error`;

    let errorElement = document.getElementById(errorId);
    if (!errorElement) {
      errorElement = document.createElement('p');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      field.parentNode.appendChild(errorElement);
    }

    errorElement.textContent = errorMessage;
    field.setAttribute('aria-describedby', errorId);
    field.setAttribute('aria-invalid', 'true');
  }

  /**
   * Clear error state from a form field
   * @param {string} fieldId
   */
  clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const errorId = `${fieldId}-error`;
    const errorElement = document.getElementById(errorId);

    if (errorElement) {
      errorElement.remove();
    }

    field.removeAttribute('aria-describedby');
    field.removeAttribute('aria-invalid');
  }

  /**
   * Get a descriptive label for an outcome card
   * @param {number} index - 1-based outcome index
   * @returns {string}
   */
  getOutcomeLabel(index) {
    return `Outcome ${index}`;
  }

  /**
   * Set up keyboard navigation enhancements
   */
  setupKeyboardNavigation() {
    // Add keyboard shortcuts if needed in the future
    // For now, native tab navigation should work with semantic HTML
  }
}
