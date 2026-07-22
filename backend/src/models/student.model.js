/**
 * src/models/student.model.js
 * ------------------------------
 * The ONLY file in the backend that writes raw SQL. Controllers never
 * touch `pool.query` directly — they call these named functions
 * instead. This is what makes it possible to, say, later swap MySQL
 * for PostgreSQL by rewriting this one file, or to unit-test a
 * controller by mocking this module, without either change touching
 * the other layer.
 *
 * Why hand-written SQL instead of an ORM (Sequelize/Prisma):
 * For a single-table CRUD domain like this, an ORM's main value —
 * managing complex relationships and migrations across many tables —
 * isn't yet needed, and every query here is simple enough to be more
 * transparent as plain, reviewable SQL than as ORM-generated queries a
 * reader would have to mentally translate. All queries use PARAMETERIZED
 * placeholders (`?`) — never string-concatenated SQL — which is what
 * actually prevents SQL injection; that protection doesn't come from
 * using an ORM, it comes from parameterization, which mysql2 gives you
 * either way. Revisit this decision if the schema grows multiple
 * related tables (see docs/ARCHITECTURE.md, "Future Roadmap").
 */

const { pool } = require('../config/database');

/**
 * @typedef {Object} Student
 * @property {number} id
 * @property {string} full_name
 * @property {string} email
 * @property {string} phone
 * @property {string} course
 * @property {string} enrollment_date
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * Inserts a new student row.
 * @param {{fullName: string, email: string, phone: string, course: string, enrollmentDate: string}} data
 * @returns {Promise<Student>} the newly created row
 */
async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO students (full_name, email, phone, course, enrollment_date)
     VALUES (?, ?, ?, ?, ?)`,
    [data.fullName, data.email, data.phone, data.course, data.enrollmentDate]
  );
  return findById(result.insertId);
}

/**
 * Fetches one student by primary key.
 * @param {number} id
 * @returns {Promise<Student|null>}
 */
async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM students WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

/**
 * Fetches one student by email (used for the pre-insert duplicate check).
 * @param {string} email
 * @returns {Promise<Student|null>}
 */
async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM students WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

/**
 * Lists students with optional filtering, search, and pagination.
 * @param {{page: number, limit: number, course?: string, search?: string}} options
 * @returns {Promise<{rows: Student[], total: number}>}
 */
async function findAll({ page, limit, course, search }) {
  const conditions = [];
  const params = [];

  if (course) {
    conditions.push('course = ?');
    params.push(course);
  }
  if (search) {
    // Matches partial name OR email — a %LIKE% query is fine at this
    // table size; a full-text index would only be worth adding if this
    // table grew into the hundreds of thousands of rows.
    conditions.push('(full_name LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT * FROM students ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM students ${whereClause}`, params);

  return { rows, total: countRows[0].total };
}

/**
 * Partially updates a student. Only columns present in `data` are
 * updated — this supports PATCH semantics on the API.
 * @param {number} id
 * @param {Partial<{fullName: string, email: string, phone: string, course: string, enrollmentDate: string}>} data
 * @returns {Promise<Student|null>}
 */
async function update(id, data) {
  const columnMap = {
    fullName: 'full_name',
    email: 'email',
    phone: 'phone',
    course: 'course',
    enrollmentDate: 'enrollment_date',
  };

  const setClauses = [];
  const params = [];

  for (const [key, column] of Object.entries(columnMap)) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      setClauses.push(`${column} = ?`);
      params.push(data[key]);
    }
  }

  if (setClauses.length === 0) {
    // Nothing to update — caller (controller) should have already
    // rejected an empty payload; this is a defensive last resort.
    return findById(id);
  }

  params.push(id);
  await pool.query(`UPDATE students SET ${setClauses.join(', ')} WHERE id = ?`, params);
  return findById(id);
}

/**
 * Deletes a student by id.
 * @param {number} id
 * @returns {Promise<boolean>} true if a row was deleted
 */
async function remove(id) {
  const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { create, findById, findByEmail, findAll, update, remove };
