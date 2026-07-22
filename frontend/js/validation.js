/**
 * js/validation.js
 * ------------------
 * Client-side validation rules. IMPORTANT: this exists purely for fast,
 * friendly user feedback (no round-trip needed to tell someone they
 * left a field blank) — it is NEVER the source of truth for what's
 * valid. The backend (backend/src/validators/student.validator.js)
 * re-validates every request independently, because client-side checks
 * are trivially bypassed (disabled JS, direct API calls, browser
 * devtools) and must never be trusted for security or data integrity.
 */

const StudentValidation = (() => {
  const PHONE_PATTERN = /^\+?[0-9\-\s]{7,20}$/;

  /**
   * Validates one field by name. Returns an error message string, or
   * an empty string if the field is valid.
   */
  function validateField(name, value) {
    const trimmed = (value || '').trim();

    switch (name) {
      case 'fullName':
        if (!trimmed) return 'Full name is required.';
        if (trimmed.length < 2 || trimmed.length > 120) {
          return 'Full name must be between 2 and 120 characters.';
        }
        return '';

      case 'email':
        if (!trimmed) return 'Email is required.';
        // Deliberately simple pattern: full RFC 5322 validation is
        // backend's job; the client only needs to catch obvious typos.
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address.';
        return '';

      case 'phone':
        if (!trimmed) return 'Phone number is required.';
        if (!PHONE_PATTERN.test(trimmed)) return 'Enter a valid phone number (7-20 digits).';
        return '';

      case 'course':
        if (!trimmed) return 'Course is required.';
        if (trimmed.length < 2 || trimmed.length > 100) {
          return 'Course must be between 2 and 100 characters.';
        }
        return '';

      case 'enrollmentDate': {
        if (!trimmed) return 'Enrollment date is required.';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(trimmed) > today) return 'Enrollment date cannot be in the future.';
        return '';
      }

      default:
        return '';
    }
  }

  /**
   * Validates an entire payload object. Returns a map of
   * { fieldName: errorMessage } containing only the fields that failed.
   */
  function validateForm(payload) {
    const errors = {};
    for (const field of ['fullName', 'email', 'phone', 'course', 'enrollmentDate']) {
      const message = validateField(field, payload[field]);
      if (message) errors[field] = message;
    }
    return errors;
  }

  return { validateField, validateForm };
})();
