/**
 * js/main.js
 * ------------
 * The orchestration layer: listens for user events (form submit,
 * search, pagination, edit/delete clicks) and coordinates
 * StudentApi (network), StudentValidation (client-side checks), and
 * StudentUI (rendering) to carry out each action. No fetch calls, no
 * direct DOM manipulation, and no validation rules live in this file —
 * it only calls out to the three modules that own those concerns.
 */

(() => {
  const state = {
    page: 1,
    limit: 10,
    course: '',
    search: '',
    knownCourses: new Set(),
  };

  let searchDebounceId = null;

  /** Fetches the current page of students from the API and renders it. */
  async function loadStudents() {
    try {
      const { data } = await StudentApi.listStudents({
        page: state.page,
        limit: state.limit,
        course: state.course,
        search: state.search,
      });

      data.students.forEach((student) => state.knownCourses.add(student.course));

      StudentUI.renderStudentsTable(data.students);
      StudentUI.renderPagination(data.pagination);
      StudentUI.renderCourseOptions([...state.knownCourses].sort());
    } catch (error) {
      StudentUI.showToast(error.message, 'error');
    }
  }

  /** Handles the create/update form submission. */
  async function handleFormSubmit(event) {
    event.preventDefault();
    StudentUI.clearAllFieldErrors();

    const payload = StudentUI.readFormPayload();
    const clientErrors = StudentValidation.validateForm(payload);

    if (Object.keys(clientErrors).length > 0) {
      Object.entries(clientErrors).forEach(([field, message]) => StudentUI.showFieldError(field, message));
      StudentUI.showToast('Please fix the highlighted fields.', 'error');
      return;
    }

    const studentId = StudentUI.elements.studentIdField.value;
    StudentUI.setSubmitting(true);

    try {
      if (studentId) {
        await StudentApi.updateStudent(studentId, payload);
        StudentUI.showToast('Student updated successfully.', 'success');
      } else {
        await StudentApi.createStudent(payload);
        StudentUI.showToast('Student registered successfully.', 'success');
      }
      StudentUI.resetFormToCreateMode();
      await loadStudents();
    } catch (error) {
      // Field-level errors (400) are shown next to their inputs;
      // anything else (409 duplicate email, network error) goes to the toast.
      if (Array.isArray(error.details) && error.details.length > 0) {
        error.details.forEach((detail) => StudentUI.showFieldError(detail.field, detail.message));
      }
      StudentUI.showToast(error.message, 'error');
    } finally {
      StudentUI.setSubmitting(false);
    }
  }

  /** Handles clicks on the table's Edit/Delete action buttons (event delegation). */
  async function handleTableClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const { action, id } = button.dataset;

    if (action === 'edit') {
      try {
        const { data: student } = await StudentApi.getStudent(id);
        StudentUI.populateFormForEdit(student);
      } catch (error) {
        StudentUI.showToast(error.message, 'error');
      }
      return;
    }

    if (action === 'delete') {
      const row = button.closest('tr');
      const studentName = row.querySelector('td')?.textContent || 'this student';
      const confirmed = await StudentUI.confirmDelete(studentName);
      if (!confirmed) return;

      try {
        await StudentApi.deleteStudent(id);
        StudentUI.showToast('Student deleted successfully.', 'success');
        await loadStudents();
      } catch (error) {
        StudentUI.showToast(error.message, 'error');
      }
    }
  }

  function handleSearchInput(event) {
    clearTimeout(searchDebounceId);
    // Debounce so we don't fire an API request on every keystroke —
    // waits for a short pause in typing before searching.
    searchDebounceId = setTimeout(() => {
      state.search = event.target.value.trim();
      state.page = 1;
      loadStudents();
    }, 350);
  }

  function handleCourseFilterChange(event) {
    state.course = event.target.value;
    state.page = 1;
    loadStudents();
  }

  function handlePrevPage() {
    if (state.page > 1) {
      state.page -= 1;
      loadStudents();
    }
  }

  function handleNextPage() {
    state.page += 1;
    loadStudents();
  }

  function handleCancelEdit() {
    StudentUI.resetFormToCreateMode();
  }

  /** Clears a field's error message as the user types, for immediate feedback. */
  function attachLiveFieldValidation() {
    ['fullName', 'email', 'phone', 'course', 'enrollmentDate'].forEach((fieldName) => {
      const input = document.getElementById(fieldName);
      input.addEventListener('blur', () => {
        const message = StudentValidation.validateField(fieldName, input.value);
        StudentUI.showFieldError(fieldName, message);
      });
    });
  }

  function init() {
    StudentUI.elements.form.addEventListener('submit', handleFormSubmit);
    StudentUI.elements.cancelEditBtn.addEventListener('click', handleCancelEdit);
    StudentUI.elements.tableBody.addEventListener('click', handleTableClick);
    document.getElementById('search-input').addEventListener('input', handleSearchInput);
    StudentUI.elements.courseFilter.addEventListener('change', handleCourseFilterChange);
    StudentUI.elements.prevPageBtn.addEventListener('click', handlePrevPage);
    StudentUI.elements.nextPageBtn.addEventListener('click', handleNextPage);

    attachLiveFieldValidation();
    loadStudents();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
