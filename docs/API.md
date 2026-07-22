# Student Registration System API Documentation

## Base URL

```
http://localhost:3000/api
```

---

# Authentication

Currently authentication is not implemented.

All endpoints are publicly accessible.

Future versions will support JWT Authentication.

---

# Response Format

Successful Response

```json
{
    "success": true,
    "message": "Operation successful",
    "data": {}
}
```

Error Response

```json
{
    "success": false,
    "message": "Validation failed"
}
```

---

# Endpoints

---

## 1. Get All Students

### GET

```
GET /students
```

### Success Response

```json
[
    {
        "id":1,
        "full_name":"Ali Raza",
        "email":"ali@example.com",
        "phone":"+92-300-1234567",
        "course":"BS Computer Science",
        "enrollment_date":"2026-01-15"
    }
]
```

---

## 2. Get Student By ID

### GET

```
GET /students/:id
```

Example

```
GET /students/1
```

---

## 3. Register Student

### POST

```
POST /students
```

Request Body

```json
{
    "full_name":"Sumair Ahmed",
    "email":"dsumairahmed@gmail.com",
    "phone":"3423159267",
    "course":"BS Artificial Intelligence",
    "enrollment_date":"2024-07-22"
}
```

Success

```json
{
    "success": true,
    "message": "Student registered successfully."
}
```

---

## 4. Update Student

### PATCH

```
PATCH /students/:id
```

Example

```
PATCH /students/1
```

Request Body

```json
{
    "course":"BS AI"
}
```

---

## 5. Delete Student

### DELETE

```
DELETE /students/:id
```

Example

```
DELETE /students/1
```

---

# Status Codes

| Code | Meaning |
|------|----------|
|200|Success|
|201|Created|
|400|Validation Error|
|404|Not Found|
|409|Duplicate Email|
|500|Internal Server Error|

---

# Validation Rules

## Full Name

- Required
- Minimum 3 characters

## Email

- Required
- Valid email
- Unique

## Phone

- Required

## Course

- Required

## Enrollment Date

- Required
- Valid Date

---

# Example Flow

```
POST /students

↓

Validation

↓

Database Insert

↓

201 Created

↓

GET /students

↓

Updated Student List
```

---

# Future API

Future releases will include

- JWT Authentication
- Login
- Register
- User Roles
- Pagination
- Sorting
- Swagger Documentation