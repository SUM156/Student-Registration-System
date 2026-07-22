/**
 * js/api.js
 * -----------
 * The ONLY file that calls `fetch()`. Every other JS file talks to the
 * backend through the functions exposed here, never to `fetch` or a
 * raw URL directly — that's what makes it possible to change the API
 * base URL, add auth headers later, or swap the transport entirely
 * without touching ui.js or main.js.
 */

const StudentApi = (() => {
  // In a real deployment this would come from a build-time config or
  // a <meta> tag rather than being hardcoded — see README "Deployment"
  // for how to point this at a deployed backend URL.
  const BASE_URL = 'http://localhost:3000/api';

  /**
   * Wraps fetch with consistent JSON parsing and error normalization.
   * Always resolves with the parsed body; throws an Error with a
   * user-facing `.message` on any non-2xx response.
   */
  async function request(path, options = {}) {
    let response;
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
    } catch (networkError) {
      // fetch() itself throws only on network-level failure (offline,
      // DNS, CORS preflight rejection) — distinct from an HTTP error
      // status, which is handled below.
      throw new Error('Network error — could not reach the server. Is the backend running?');
    }

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(body.message || `Request failed with status ${response.status}`);
      error.details = body.details || [];
      error.status = response.status;
      throw error;
    }

    return body;
  }

  return {
    /** @returns {Promise<object>} the created student */
    createStudent(payload) {
      return request('/students', { method: 'POST', body: JSON.stringify(payload) });
    },

    /** @returns {Promise<object>} { students, pagination } */
    listStudents({ page = 1, limit = 10, course = '', search = '' } = {}) {
      const params = new URLSearchParams({ page, limit });
      if (course) params.set('course', course);
      if (search) params.set('search', search);
      return request(`/students?${params.toString()}`);
    },

    /** @returns {Promise<object>} the student with the given id */
    getStudent(id) {
      return request(`/students/${id}`);
    },

    /** @returns {Promise<object>} the updated student */
    updateStudent(id, payload) {
      return request(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    },

    /** @returns {Promise<object>} { id } of the deleted student */
    deleteStudent(id) {
      return request(`/students/${id}`, { method: 'DELETE' });
    },
  };
})();
