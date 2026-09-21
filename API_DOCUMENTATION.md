# API Documentation

## Teknologi API yang Digunakan

### 1. **Frontend - Fetch API (Browser Native)**
Frontend menggunakan **Fetch API** yang merupakan native browser API untuk melakukan HTTP requests.

**Lokasi:** `src/frontend/app.ts`
```typescript
const API_BASE: string = 'http://localhost:3000/api';

// Contoh penggunaan
const response = await fetch(`${API_BASE}/courses`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
});
```

**Fitur:**
- Native browser API (tidak perlu library tambahan)
- Promise-based (async/await)
- Support untuk GET, POST, PUT, DELETE
- Support untuk headers dan body

### 2. **Backend - Express.js REST API**
Backend menggunakan **Express.js** untuk membuat REST API server.

**Lokasi:** `src/backend/server.ts`
- Framework: Express.js
- Middleware: CORS, Body Parser
- Port: 3000 (default)

## API Endpoints

Base URL: `http://localhost:3000/api`

### 🔐 Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" | "admin"
}

Response:
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

#### 2. Login User
```http
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "password123",
  "role": "student" | "admin"
}

Response:
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### 📚 Course Endpoints

#### 3. Get All Courses
```http
GET /api/courses

Response:
{
  "courses": [
    {
      "id": 1,
      "title": "Introduction to Web Development",
      "description": "...",
      "category": "programming",
      "duration": 40,
      "createdAt": "2025-11-26T..."
    }
  ]
}
```

#### 4. Get Course by ID
```http
GET /api/courses/:id

Response:
{
  "course": {
    "id": 1,
    "title": "...",
    "description": "...",
    "category": "programming",
    "duration": 40
  }
}
```

#### 5. Create Course (Admin Only)
```http
POST /api/courses
Authorization: Bearer <user_id>
Content-Type: application/json

Body:
{
  "title": "New Course",
  "description": "Course description",
  "category": "programming" | "design" | "business" | "language",
  "duration": 40
}

Response:
{
  "message": "Course created successfully",
  "course": { ... }
}
```

#### 6. Update Course (Admin Only)
```http
PUT /api/courses/:id
Authorization: Bearer <user_id>
Content-Type: application/json

Body:
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "programming",
  "duration": 50
}

Response:
{
  "message": "Course updated successfully",
  "course": { ... }
}
```

#### 7. Delete Course (Admin Only)
```http
DELETE /api/courses/:id
Authorization: Bearer <user_id>

Response:
{
  "message": "Course deleted successfully"
}
```

### 🎓 Enrollment Endpoints

#### 8. Enroll in Course (Student Only)
```http
POST /api/courses/:id/enroll
Authorization: Bearer <user_id>

Response:
{
  "message": "Enrolled successfully"
}
```

### 👨‍🎓 Student Endpoints

#### 9. Get Student's Enrolled Courses
```http
GET /api/students/:id/courses
Authorization: Bearer <user_id>

Response:
{
  "courses": [
    {
      "id": 1,
      "title": "...",
      "description": "...",
      "category": "programming",
      "duration": 40
    }
  ]
}
```

#### 10. Get Student's Assignments
```http
GET /api/students/:id/assignments
Authorization: Bearer <user_id>

Response:
{
  "assignments": [
    {
      "id": 1,
      "studentId": 1,
      "courseId": 1,
      "title": "Assignment 1",
      "content": "...",
      "status": "submitted" | "pending" | "graded",
      "submittedAt": "2025-11-26T...",
      "courseTitle": "Introduction to Web Development"
    }
  ]
}
```

### 📝 Assignment Endpoints

#### 11. Submit Assignment (Student Only)
```http
POST /api/assignments
Authorization: Bearer <user_id>
Content-Type: application/json

Body:
{
  "courseId": 1,
  "title": "Assignment Title",
  "content": "Assignment content..."
}

Response:
{
  "message": "Assignment submitted successfully",
  "assignment": {
    "id": 1,
    "studentId": 1,
    "courseId": 1,
    "title": "Assignment Title",
    "content": "...",
    "status": "submitted",
    "submittedAt": "2025-11-26T..."
  }
}
```

#### 12. Update Assignment (Student Only)
```http
PUT /api/assignments/:id
Authorization: Bearer <user_id>
Content-Type: application/json

Body:
{
  "title": "Updated Title",
  "content": "Updated content..."
}

Response:
{
  "message": "Assignment updated successfully",
  "assignment": { ... }
}
```

#### 13. Get Assignment by ID
```http
GET /api/assignments/:id
Authorization: Bearer <user_id>

Response:
{
  "assignment": {
    "id": 1,
    "studentId": 1,
    "courseId": 1,
    "title": "...",
    "content": "...",
    "status": "submitted",
    "submittedAt": "..."
  }
}
```

## Authentication

### Cara Authentication
- Menggunakan **Bearer Token** sederhana
- Token = User ID (dalam format: `Bearer <user_id>`)
- Header: `Authorization: Bearer 1`

**Contoh:**
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${currentUser.id}`
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "message": "Course not found"
}
```

## Data Storage

**Saat ini:** In-memory (data hilang saat server restart)
- Users: Array di memory
- Courses: Array di memory
- Enrollments: Array di memory
- Assignments: Array di memory

**Untuk Production:** Perlu database (MongoDB, PostgreSQL, dll)

## CORS Configuration

Backend sudah dikonfigurasi untuk menerima request dari semua origin:
```typescript
app.use(cors()); // Allow all origins
```

## Testing API

### Menggunakan cURL:
```bash
# Get all courses
curl http://localhost:3000/api/courses

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123","role":"student"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123","role":"student"}'
```

### Menggunakan Browser:
Buka Developer Tools (F12) → Console:
```javascript
// Get courses
fetch('http://localhost:3000/api/courses')
  .then(res => res.json())
  .then(data => console.log(data));
```

## Summary

- **Frontend API:** Fetch API (Browser Native)
- **Backend API:** Express.js REST API
- **External API:** Tidak ada (semua API custom dibuat sendiri)
- **Authentication:** Simple Bearer Token (User ID)
- **Data Storage:** In-memory (untuk development)

