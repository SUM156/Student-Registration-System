/**
 * src/utils/ApiResponse.js
 * -------------------------
 * A single, consistent JSON envelope for every successful response:
 *   { success: true, message: "...", data: ... }
 * A frontend (or any API consumer) can then write ONE response-parsing
 * path instead of guessing the shape per endpoint. Paired with
 * ApiError for the failure case, every response this API sends has a
 * predictable, documented shape (see docs/API.md).
 */
class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

module.exports = ApiResponse;
