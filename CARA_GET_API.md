# Cara Get/Fetch API di LMS Platform

## 📌 Base URL
```
http://localhost:3000/api
```

## 🔧 Metode yang Digunakan: Fetch API

Aplikasi ini menggunakan **Fetch API** (native browser API) untuk mengambil data dari backend.

---

## 📝 Contoh-contoh Penggunaan

### 1. **GET Request (Mengambil Data)**

#### a. Get All Courses (Tanpa Authentication)
```javascript
async function getCourses() {
    try {
        const response = await fetch('http://localhost:3000/api/courses');
        const data = await response.json();
        console.log('Courses:', data.courses);
        return data.courses;
    } catch (error) {
        console.error('Error:', error);
    }
}
```

#### b. Get Course by ID
```javascript
async function getCourseById(courseId) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
        const data = await response.json();
        console.log('Course:', data.course);
        return data.course;
    } catch (error) {
        console.error('Error:', error);
    }
}
```

#### c. Get Student's Enrolled Courses (Dengan Authentication)
```javascript
async function getStudentCourses(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/students/${userId}/courses`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userId}`
            }
        });
        const data = await response.json();
        console.log('Enrolled Courses:', data.courses);
        return data.courses;
    } catch (error) {
        console.error('Error:', error);
    }
}
```

#### d. Get Student's Assignments
```javascript
async function getStudentAssignments(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/students/${userId}/assignments`, {
            headers: {
                'Authorization': `Bearer ${userId}`
            }
        });
        const data = await response.json();
        console.log('Assignments:', data.assignments);
        return data.assignments;
    } catch (error) {
        console.error('Error:', error);
    }
}
```

---

### 2. **POST Request (Mengirim Data)**

#### a. Register User
```javascript
async function registerUser(name, email, password, role) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                role: role // 'student' atau 'admin'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Registration successful:', data);
            return data.user;
        } else {
            console.error('Registration failed:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
```

#### b. Login User
```javascript
async function loginUser(email, password, role) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                role: role
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Login successful:', data);
            // Simpan user ke localStorage
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            return data.user;
        } else {
            console.error('Login failed:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
```

#### c. Enroll in Course (Student Only)
```javascript
async function enrollInCourse(courseId, userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}/enroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userId}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Enrolled successfully:', data.message);
            return true;
        } else {
            console.error('Enrollment failed:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
```

#### d. Submit Assignment
```javascript
async function submitAssignment(courseId, title, content, userId) {
    try {
        const response = await fetch('http://localhost:3000/api/assignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userId}`
            },
            body: JSON.stringify({
                courseId: courseId,
                title: title,
                content: content,
                studentId: userId
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Assignment submitted:', data);
            return data.assignment;
        } else {
            console.error('Submission failed:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
```

---

### 3. **PUT Request (Update Data)**

#### a. Update Course (Admin Only)
```javascript
async function updateCourse(courseId, courseData, userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userId}`
            },
            body: JSON.stringify(courseData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Course updated:', data);
            return data.course;
        } else {
            console.error('Update failed:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
```

#### b. Update Assignment
```javascript
async function updateAssignment(assignmentId, title, content, userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/assignments/${assignmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userId}`
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('Assignment updated:', data);
            return data.assignment;
        } else {
            console.error('Update failed:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
```

---

### 4. **DELETE Request (Hapus Data)**

#### a. Delete Course (Admin Only)
```javascript
async function deleteCourse(courseId, userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userId}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Course deleted:', data.message);
            return true;
        } else {
            const data = await response.json();
            console.error('Delete failed:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
```

---

## 🔐 Authentication

Untuk endpoint yang memerlukan authentication, gunakan header:
```javascript
headers: {
    'Authorization': `Bearer ${userId}`
}
```

**Catatan:** Token authentication saat ini menggunakan User ID (bukan JWT).

---

## 📋 Template Umum Fetch API

### GET Request
```javascript
async function getData(url, token = null) {
    try {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Request failed');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

### POST/PUT Request
```javascript
async function sendData(url, method, body, token = null) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(url, {
            method: method, // 'POST' atau 'PUT'
            headers: headers,
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Request failed');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

---

## 🧪 Testing di Browser Console

Buka Developer Tools (F12) → Console, lalu jalankan:

```javascript
// Get all courses
fetch('http://localhost:3000/api/courses')
    .then(res => res.json())
    .then(data => console.log(data));

// Get course by ID
fetch('http://localhost:3000/api/courses/1')
    .then(res => res.json())
    .then(data => console.log(data));

// Register user
fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: '123456',
        role: 'student'
    })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## ⚠️ Error Handling

Selalu gunakan try-catch untuk menangani error:

```javascript
async function safeApiCall(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        // Handle error (show message to user, etc.)
        throw error;
    }
}
```

---

## 📚 Semua Endpoint yang Tersedia

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user

### Courses
- `GET /api/courses` - Get semua courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/:id` - Update course (Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)

### Enrollment
- `POST /api/courses/:id/enroll` - Enroll in course (Student)

### Student
- `GET /api/students/:id/courses` - Get enrolled courses
- `GET /api/students/:id/assignments` - Get student assignments

### Assignments
- `POST /api/assignments` - Submit assignment (Student)
- `PUT /api/assignments/:id` - Update assignment (Student)
- `GET /api/assignments/:id` - Get assignment details

---

## 💡 Tips

1. **Pastikan server berjalan** di `http://localhost:3000`
2. **Gunakan async/await** untuk kode yang lebih bersih
3. **Selalu handle error** dengan try-catch
4. **Check response.ok** sebelum menggunakan data
5. **Gunakan Developer Tools** untuk debugging network requests

---

## 🔗 Referensi

- Lihat implementasi lengkap di: `src/frontend/app.ts`
- Dokumentasi API lengkap: `API_DOCUMENTATION.md`
- Backend server: `src/backend/server.ts`

