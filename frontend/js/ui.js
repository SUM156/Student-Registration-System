/**
 * js/ui.js
 * ----------
 * All direct DOM reads/writes live here. main.js decides WHEN to
 * refresh the UI (after a successful create/update/delete); this file
 * decides HOW to render it. Keeping the two separate means the
 * rendering logic can be unit-tested or swapped (e.g. for a framework)
 * without touching the event-handling/business flow in main.js.
 */

const StudentUI = (() => {
  const elements = {
    toast: document.getElementById('toast'),
    form: document.getElementById('student-form'),
    formModeLabel: document.getElementById('form-mode-label'),
    studentIdField: document.getElementById('student-id'),
    submitBtn: document.getElementById('submit-btn'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    tableBody: document.getElementById('students-table-body'),
    emptyState: document.getElementById('empty-state'),
    courseFilter: document.getElementById('course-filter'),
    paginationLabel: document.getElementById('pagination-label'),
    prevPageBtn: document.getElementById('prev-page-btn'),
    nextPageBtn: document.getElementById('next-page-btn'),
    confirmDialog: document.getElementById('confirm-dialog'),
  };

  let toastTimeoutId = null;

  /** Shows a temporary, screen-reader-announced status message. */
  function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.className = `toast toast--${type}`;

    clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
      elements.toast.textContent = '';
      elements.toast.className = 'toast';
    }, 4000);
  }

  /** Escapes user-supplied text before it is ever inserted as HTML,
   *  preventing stored/reflected XSS via a student's name, course, etc.
   *  Never build row HTML by concatenating raw field values directly. */
  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
  }

  function formatDate(isoDateString) {
    if (!isoDateString) return '—';
    const date = new Date(isoDateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /** Renders one <tr> for a student row, including its action buttons. */
  function renderStudentRow(student) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(student.full_name)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(student.phone)}</td>
      <td>${escapeHtml(student.course)}</td>
      <td>${formatDate(student.enrollment_date)}</td>
      <td>
        <div class="row-actions">
          <button type="button" class="btn btn--secondary btn--icon" data-action="edit" data-id="${student.id}" aria-label="Edit ${escapeHtml(student.full_name)}">✏️ Edit</button>
          <button type="button" class="btn btn--danger btn--icon" data-action="delete" data-id="${student.id}" aria-label="Delete ${escapeHtml(student.full_name)}">🗑️ Delete</button>
        </div>
      </td>
    `;
    return row;
  }

  /** Renders the full student table body from a list of student records. */
  function renderStudentsTable(students) {
    elements.tableBody.innerHTML = '';

    if (students.length === 0) {
      elements.emptyState.hidden = false;
      return;
    }
    elements.emptyState.hidden = true;

    const fragment = document.createDocumentFragment();
    students.forEach((student) => fragment.appendChild(renderStudentRow(student)));
    elements.tableBody.appendChild(fragment);
  }

  /** Updates the pagination label and enables/disables prev/next buttons. */
  function renderPagination({ page, totalPages }) {
    elements.paginationLabel.textContent = `Page ${page} of ${Math.max(totalPages, 1)}`;
    elements.prevPageBtn.disabled = page <= 1;
    elements.nextPageBtn.disabled = page >= totalPages;
  }

  /** Populates the course filter <select> with a de-duplicated list. */
  function renderCourseOptions(courses) {
    const currentValue = elements.courseFilter.value;
    elements.courseFilter.innerHTML = '<option value="">All courses</option>';
    courses.forEach((course) => {
      const option = document.createElement('option');
      option.value = course;
      option.textContent = course;
      elements.courseFilter.appendChild(option);
    });
    elements.courseFilter.value = currentValue;
  }

  /** Displays a field-level validation error under its input. */
  function showFieldError(fieldName, message) {
    const input = document.getElementById(fieldName);
    const errorEl = document.getElementById(`${fieldName}-error`);
    if (errorEl) errorEl.textContent = message;
    if (input) {
      input.setAttribute('data-touched', 'true');
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
  }

  function clearAllFieldErrors() {
    document.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
    document.querySelectorAll('[data-touched]').forEach((el) => el.removeAttribute('data-touched'));
  }

  /** Switches the form into "create" mode (default state). */
  function resetFormToCreateMode() {
    elements.form.reset();
    elements.studentIdField.value = '';
    elements.formModeLabel.textContent = 'Register New Student';
    elements.submitBtn.textContent = 'Register Student';
    elements.cancelEditBtn.hidden = true;
    clearAllFieldErrors();
  }

  /** Switches the form into "edit" mode and pre-fills it with a student's data. */
  function populateFormForEdit(student) {
    elements.studentIdField.value = student.id;
    document.getElementById('fullName').value = student.full_name;
    document.getElementById('email').value = student.email;
    document.getElementById('phone').value = student.phone;
    document.getElementById('course').value = student.course;
    document.getElementById('enrollmentDate').value = student.enrollment_date;

    elements.formModeLabel.textContent = `Editing: ${student.full_name}`;
    elements.submitBtn.textContent = 'Save Changes';
    elements.cancelEditBtn.hidden = false;
    clearAllFieldErrors();
    elements.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Reads the current form values into a plain payload object. */
  function readFormPayload() {
    return {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      course: document.getElementById('course').value,
      enrollmentDate: document.getElementById('enrollmentDate').value,
    };
  }

  function setSubmitting(isSubmitting) {
    elements.submitBtn.disabled = isSubmitting;
    elements.submitBtn.textContent = isSubmitting
      ? 'Saving…'
      : elements.studentIdField.value
      ? 'Save Changes'
      : 'Register Student';
  }

  /** Opens the native confirm dialog and resolves true/false with the user's choice. */
  function confirmDelete(studentName) {
    document.getElementById('confirm-dialog-message').textContent =
      `Are you sure you want to delete ${studentName}? This cannot be undone.`;
    elements.confirmDialog.showModal();

    return new Promise((resolve) => {
      elements.confirmDialog.addEventListener(
        'close',
        () => resolve(elements.confirmDialog.returnValue === 'confirm'),
        { once: true }
      );
    });
  }

  return {
    elements,
    showToast,
    renderStudentsTable,
    renderPagination,
    renderCourseOptions,
    showFieldError,
    clearAllFieldErrors,
    resetFormToCreateMode,
    populateFormForEdit,
    readFormPayload,
    setSubmitting,
    confirmDelete,
  };
})();
