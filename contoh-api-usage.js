/**
 * CONTOH PENGGUNAAN API - LMS Platform
 * File ini berisi contoh-contoh praktis untuk mengambil data dari API
 * 
 * Cara menggunakan:
 * 1. Pastikan server berjalan: npm start
 * 2. Buka browser console (F12)
 * 3. Copy-paste fungsi yang diinginkan
 * 4. Panggil fungsi tersebut
 */

// ============================================
// 1. GET ALL COURSES (Tanpa Login)
// ============================================
async function getAllCourses() {
    try {
        console.log('📚 Mengambil semua courses...');
        const response = await fetch('http://localhost:3000/api/courses');
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Berhasil! Total courses:', data.courses.length);
            console.table(data.courses);
            return data.courses;
        } else {
            console.error('❌ Error:', data.message);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
        console.log('💡 Pastikan server berjalan di http://localhost:3000');
    }
}

// Jalankan: getAllCourses()


// ============================================
// 2. GET COURSE BY ID
// ============================================
async function getCourseById(courseId) {
    try {
        console.log(`📖 Mengambil course ID: ${courseId}...`);
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Berhasil!');
            console.log('Course:', data.course);
            return data.course;
        } else {
            console.error('❌ Error:', data.message);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// Jalankan: getCourseById(1)


// ============================================
// 3. REGISTER USER BARU
// ============================================
async function registerUser(name, email, password, role = 'student') {
    try {
        console.log(`👤 Mendaftarkan user: ${email}...`);
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
            console.log('✅ Registrasi berhasil!');
            console.log('User ID:', data.user.id);
            console.log('User:', data.user);
            return data.user;
        } else {
            console.error('❌ Registrasi gagal:', data.message);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// Jalankan: registerUser('John Doe', 'john@example.com', 'password123', 'student')


// ============================================
// 4. LOGIN USER
// ============================================
async function loginUser(email, password, role = 'student') {
    try {
        console.log(`🔐 Login sebagai: ${email}...`);
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
            console.log('✅ Login berhasil!');
            console.log('User ID:', data.user.id);
            console.log('User:', data.user);
            
            // Simpan ke localStorage
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            console.log('💾 User disimpan ke localStorage');
            
            return data.user;
        } else {
            console.error('❌ Login gagal:', data.message);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// Jalankan: loginUser('john@example.com', 'password123', 'student')


// ============================================
// 5. GET CURRENT USER (Dari localStorage)
// ============================================
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        const user = JSON.parse(userStr);
        console.log('👤 Current User:', user);
        return user;
    } else {
        console.log('⚠️ Tidak ada user yang login');
        return null;
    }
}

// Jalankan: getCurrentUser()


// ============================================
// 6. ENROLL IN COURSE (Student Only)
// ============================================
async function enrollInCourse(courseId) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        console.error('❌ Silakan login terlebih dahulu!');
        return;
    }
    
    if (currentUser.role !== 'student') {
        console.error('❌ Hanya student yang bisa enroll!');
        return;
    }
    
    try {
        console.log(`🎓 Enrolling in course ID: ${courseId}...`);
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}/enroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.id}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Enroll berhasil!', data.message);
            return true;
        } else {
            console.error('❌ Enroll gagal:', data.message);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// Jalankan: enrollInCourse(1)


// ============================================
// 7. GET STUDENT'S ENROLLED COURSES
// ============================================
async function getMyCourses() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        console.error('❌ Silakan login terlebih dahulu!');
        return;
    }
    
    try {
        console.log(`📚 Mengambil courses untuk student ID: ${currentUser.id}...`);
        const response = await fetch(`http://localhost:3000/api/students/${currentUser.id}/courses`, {
            headers: {
                'Authorization': `Bearer ${currentUser.id}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Berhasil! Total enrolled courses:', data.courses.length);
            console.table(data.courses);
            return data.courses;
        } else {
            console.error('❌ Error:', data.message);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// Jalankan: getMyCourses()


// ============================================
// 8. GET STUDENT'S ASSIGNMENTS
// ============================================
async function getMyAssignments() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        console.error('❌ Silakan login terlebih dahulu!');
        return;
    }
    
    try {
        console.log(`📝 Mengambil assignments untuk student ID: ${currentUser.id}...`);
        const response = await fetch(`http://localhost:3000/api/students/${currentUser.id}/assignments`, {
            headers: {
                'Authorization': `Bearer ${currentUser.id}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Berhasil! Total assignments:', data.assignments.length);
            console.table(data.assignments);
            return data.assignments;
        } else {
            console.error('❌ Error:', data.message);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// Jalankan: getMyAssignments()


// ============================================
// 9. SUBMIT ASSIGNMENT
// ============================================
async function submitAssignment(courseId, title, content) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        console.error('❌ Silakan login terlebih dahulu!');
        return;
    }
    
    if (currentUser.role !== 'student') {
        console.error('❌ Hanya student yang bisa submit assignment!');
        return;
    }
    
    try {
        console.log(`📤 Submitting assignment untuk course ID: ${courseId}...`);
        const response = await fetch('http://localhost:3000/api/assignments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.id}`
            },
            body: JSON.stringify({
                courseId: courseId,
                title: title,
                content: content,
                studentId: currentUser.id
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Assignment submitted!');
            console.log('Assignment ID:', data.assignment.id);
            console.log('Assignment:', data.assignment);
            return data.assignment;
        } else {
            console.error('❌ Submission gagal:', data.message);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// Jalankan: submitAssignment(1, 'Assignment 1', 'Ini adalah konten assignment saya')


// ============================================
// 10. CREATE COURSE (Admin Only)
// ============================================
async function createCourse(title, description, category, duration) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        console.error('❌ Silakan login terlebih dahulu!');
        return;
    }
    
    if (currentUser.role !== 'admin') {
        console.error('❌ Hanya admin yang bisa create course!');
        return;
    }
    
    try {
        console.log(`➕ Creating course: ${title}...`);
        const response = await fetch('http://localhost:3000/api/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.id}`
            },
            body: JSON.stringify({
                title: title,
                description: description,
                category: category, // 'programming', 'design', 'business', 'language'
                duration: duration
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Course created!');
            console.log('Course ID:', data.course.id);
            console.log('Course:', data.course);
            return data.course;
        } else {
            console.error('❌ Create gagal:', data.message);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// Jalankan: createCourse('New Course', 'Description', 'programming', 40)


// ============================================
// 11. UPDATE COURSE (Admin Only)
// ============================================
async function updateCourse(courseId, title, description, category, duration) {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
        console.error('❌ Hanya admin yang bisa update course!');
        return;
    }
    
    try {
        console.log(`✏️ Updating course ID: ${courseId}...`);
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.id}`
            },
            body: JSON.stringify({
                title: title,
                description: description,
                category: category,
                duration: duration
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Course updated!');
            console.log('Course:', data.course);
            return data.course;
        } else {
            console.error('❌ Update gagal:', data.message);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// Jalankan: updateCourse(1, 'Updated Title', 'Updated Description', 'programming', 50)


// ============================================
// 12. DELETE COURSE (Admin Only)
// ============================================
async function deleteCourse(courseId) {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
        console.error('❌ Hanya admin yang bisa delete course!');
        return;
    }
    
    if (!confirm(`Yakin ingin menghapus course ID ${courseId}?`)) {
        console.log('❌ Dibatalkan');
        return;
    }
    
    try {
        console.log(`🗑️ Deleting course ID: ${courseId}...`);
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser.id}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Course deleted!', data.message);
            return true;
        } else {
            const data = await response.json();
            console.error('❌ Delete gagal:', data.message);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// Jalankan: deleteCourse(1)


// ============================================
// 13. QUICK TEST - Workflow Lengkap
// ============================================
async function quickTest() {
    console.log('🧪 === QUICK TEST WORKFLOW ===\n');
    
    // 1. Get all courses
    console.log('1️⃣ Get all courses:');
    await getAllCourses();
    console.log('\n');
    
    // 2. Register user
    console.log('2️⃣ Register user:');
    const user = await registerUser('Test User', 'test@example.com', '123456', 'student');
    console.log('\n');
    
    // 3. Login
    console.log('3️⃣ Login:');
    await loginUser('test@example.com', '123456', 'student');
    console.log('\n');
    
    // 4. Enroll in course
    console.log('4️⃣ Enroll in course:');
    await enrollInCourse(1);
    console.log('\n');
    
    // 5. Get my courses
    console.log('5️⃣ Get my enrolled courses:');
    await getMyCourses();
    console.log('\n');
    
    // 6. Submit assignment
    console.log('6️⃣ Submit assignment:');
    await submitAssignment(1, 'Test Assignment', 'This is a test assignment content');
    console.log('\n');
    
    // 7. Get my assignments
    console.log('7️⃣ Get my assignments:');
    await getMyAssignments();
    console.log('\n');
    
    console.log('✅ Test selesai!');
}

// Jalankan: quickTest()


// ============================================
// EXPORT FUNCTIONS (Untuk digunakan di console)
// ============================================
// Copy semua fungsi di atas ke browser console untuk digunakan

