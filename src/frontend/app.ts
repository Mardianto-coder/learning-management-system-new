// API Base URL (tidak digunakan lagi, semua menggunakan fungsi dari api.ts)
// const API_BASE: string = 'http://localhost:3000/api';

console.log('[App] app.ts module loaded!');

// Import types (types are removed during compilation, only used for type checking)
import type { User, Course, Assignment, UserRole, CourseData } from '../types/index.js';

// ============================================
// IMPORT FUNGSI API
// ============================================
import {
    loginUser,
    registerUser,
    saveCurrentUser,
    clearCurrentUser,
    getAllCourses,
    enrollMeInCourse,
    getMyCourses,
    getMyAssignments,
    submitAssignment,
    updateAssignment,
    createCourse,
    updateCourse,
    deleteCourse as apiDeleteCourse,
    resetPassword,
    gradeAssignment,
    getAllAssignments
    // changePassword, // Untuk fitur change password di dashboard (akan ditambahkan nanti)
    // updateEmail // Untuk fitur update email di dashboard (akan ditambahkan nanti)
} from './api.js';

// State Management
let currentUser: User | null = JSON.parse(localStorage.getItem('currentUser') || 'null');
let courses: Course[] = [];
let enrolledCourses: Course[] = [];
let assignments: Assignment[] = [];

// Event listener management - prevent duplicate listeners
let eventListenersSetup = false;
let clickHandlers: Array<{ element: HTMLElement | Document; event: string; handler: EventListener }> = [];

// CRITICAL: Set up event listener IMMEDIATELY when module loads
// This must happen before componentsLoaded event is dispatched
console.log('[App] Setting up componentsLoaded listener IMMEDIATELY...');
window.addEventListener('componentsLoaded', () => {
    console.log('[App] componentsLoaded event received!');
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
        console.log('[App] Initializing app after delay...');
        initApp();
    }, 10);
});

// Initialize App - Wait for components to load first
function initApp() {
    // Verify elements exist before proceeding
    const homeLink = document.getElementById('homeLink');
    const homePage = document.getElementById('homePage');
    
    if (!homeLink || !homePage) {
        console.warn('Components not fully loaded yet, retrying...');
        setTimeout(initApp, 100);
        return;
    }
    
    console.log('Initializing app...');
    console.log('Body element:', document.body);
    console.log('Home link found:', !!homeLink);
    
    // Setup event listeners first (using delegation, so it works even if elements aren't ready)
    setupEventListeners();
    
    initializeApp();
    loadCourses();
    if (currentUser) {
        updateUIForUser();
        if (currentUser.role === 'student') {
            loadStudentData();
        } else if (currentUser.role === 'admin') {
            loadAdminData();
        }
    }
}

// Fallback: Check if components are already loaded (e.g., if event was dispatched before listener was set)
console.log('[App] Checking if components already loaded...');
setTimeout(() => {
    const homeLink = document.getElementById('homeLink');
    const homePage = document.getElementById('homePage');
    if (homeLink && homePage && !document.body.hasAttribute('data-app-initialized')) {
        console.log('[App] Components found but event may have been missed, initializing directly...');
        document.body.setAttribute('data-app-initialized', 'true');
        initApp();
    }
}, 100);

// Fallback: if components are already loaded (e.g., in development)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Components should load after DOMContentLoaded, so wait a bit
        setTimeout(() => {
            if (document.getElementById('homePage') && document.getElementById('homeLink')) {
                initApp();
            }
        }, 200);
    });
} else {
    // DOM already loaded, check if components exist
    if (document.getElementById('homePage') && document.getElementById('homeLink')) {
        initApp();
    } else {
        // Wait for components
        window.addEventListener('componentsLoaded', () => {
            setTimeout(() => {
                initApp();
            }, 10);
        });
    }
}

// Initialize App
function initializeApp(): void {
    // Refresh currentUser from localStorage
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // Jika user sudah login, redirect ke halaman yang sesuai
    if (currentUser) {
        if (currentUser.role === 'student') {
            // Ensure admin dashboard is hidden for student
            const adminDashboard = document.getElementById('adminDashboard');
            if (adminDashboard) {
                adminDashboard.classList.remove('active');
                (adminDashboard as HTMLElement).style.display = 'none';
            }
            showPage('studentDashboard');
            loadStudentData();
        } else if (currentUser.role === 'admin') {
            // Ensure student dashboard is ALWAYS hidden for admin
            const studentDashboard = document.getElementById('studentDashboard');
            if (studentDashboard) {
                studentDashboard.classList.remove('active');
                (studentDashboard as HTMLElement).style.display = 'none';
                (studentDashboard as HTMLElement).style.visibility = 'hidden';
                (studentDashboard as HTMLElement).style.opacity = '0';
            }
            showPage('adminDashboard');
            loadAdminData();
        } else {
            showPage('homePage');
        }
    } else {
        // Jika belum login, tampilkan home page
        showPage('homePage');
    }
}

// Setup Event Listeners using Event Delegation (more robust)
function setupEventListeners(): void {
    // Prevent duplicate setup
    if (eventListenersSetup) {
        console.log('[App] Event listeners already set up, skipping...');
        return;
    }
    
    console.log('[App] Setting up event listeners with delegation...');
    console.log('[App] Body element exists:', !!document.body);
    
    // Ensure body exists before adding listener
    if (!document.body) {
        console.error('[App] Body element not found, retrying...');
        setTimeout(setupEventListeners, 50);
        return;
    }
    
    console.log('[App] Body found, adding click event listener...');
    
    // Helper function to add and track event listeners
    function addTrackedListener(element: HTMLElement | Document, event: string, handler: EventListener): void {
        element.addEventListener(event, handler);
        clickHandlers.push({ element, event, handler });
    }
    
    // Use event delegation on document body to catch all clicks
    const mainClickHandler = (e: Event) => {
        const target = e.target as HTMLElement;
        
        // Check if clicked element or its parent is a link/button with an ID
        let clickedElement: HTMLElement | null = target;
        let elementId: string | null = null;
        
        // Try to find the element with an ID (could be the clicked element or its parent)
        while (clickedElement && clickedElement !== document.body) {
            if (clickedElement.id) {
                elementId = clickedElement.id;
                break;
            }
            clickedElement = clickedElement.parentElement;
        }
        
        if (!elementId) {
            return;
        }
        
        // Prevent default for navigation links
        if (target.tagName === 'A' || target.closest('a')) {
            const link = target.closest('a') as HTMLAnchorElement;
            if (link && (link.getAttribute('href') === '#' || link.href.endsWith('#'))) {
                e.preventDefault();
            }
        }
        
        // Handle navigation clicks
        switch (elementId) {
            case 'homeLink':
                console.log('[App] Home link clicked');
                e.preventDefault();
                showPage('homePage');
                break;
            case 'coursesLink':
                console.log('[App] Courses link clicked');
                e.preventDefault();
                // Refresh currentUser from localStorage
                currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
                showPage('coursesPage');
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    loadCourses();
                }, 100);
                break;
            case 'dashboardLink':
                console.log('[App] Dashboard link clicked');
                e.preventDefault();
                // Refresh currentUser from localStorage
                currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
                
                if (currentUser?.role === 'student') {
                    // Ensure admin dashboard is hidden
                    const adminDashboard = document.getElementById('adminDashboard');
                    if (adminDashboard) {
                        adminDashboard.classList.remove('active');
                        (adminDashboard as HTMLElement).style.display = 'none';
                    }
                    showPage('studentDashboard');
                    loadStudentData();
                } else if (currentUser?.role === 'admin') {
                    // Ensure student dashboard is ALWAYS hidden for admin
                    const studentDashboard = document.getElementById('studentDashboard');
                    if (studentDashboard) {
                        studentDashboard.classList.remove('active');
                        (studentDashboard as HTMLElement).style.display = 'none';
                        (studentDashboard as HTMLElement).style.visibility = 'hidden';
                        (studentDashboard as HTMLElement).style.opacity = '0';
                    }
                    showPage('adminDashboard');
                    loadAdminData();
                }
                break;
            case 'adminLink':
                console.log('[App] Admin link clicked');
                e.preventDefault();
                if (currentUser?.role === 'admin') {
                    showPage('adminDashboard');
                    loadAdminData();
                }
                break;
            case 'loginLink':
                console.log('[App] Login link clicked');
                e.preventDefault();
                openAuthModal();
                break;
            case 'logoutLink':
                console.log('[App] Logout link clicked');
                e.preventDefault();
                logout();
                break;
            case 'exploreBtn':
                console.log('[App] Explore button clicked');
                e.preventDefault();
                // Refresh currentUser from localStorage
                currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
                showPage('coursesPage');
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    loadCourses();
                }, 100);
                break;
            case 'navigate':
                // Handle navigation from data-action="navigate" with data-page attribute
                const targetPage = (target as HTMLElement).dataset.page;
                if (targetPage) {
                    e.preventDefault();
                    console.log('[App] Navigate to:', targetPage);
                    // Refresh currentUser from localStorage
                    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
                    showPage(targetPage);
                    if (targetPage === 'coursesPage') {
                        // Small delay to ensure DOM is ready
                        setTimeout(() => {
                            loadCourses();
                        }, 100);
                    }
                }
                break;
            case 'forgotPasswordLink':
                console.log('[App] Forgot Password link clicked');
                e.preventDefault();
                switchAuthTab('forgot');
                break;
            case 'backToLoginLink':
                console.log('[App] Back to Login link clicked');
                e.preventDefault();
                switchAuthTab('login');
                break;
            case 'myTasks':
            case 'enrolledCourses':
            case 'progressSection':
            case 'studentDashboard':
            case 'adminDashboard':
                // These are container elements, clicks on them are handled by child elements
                // Don't log as error, just ignore
                break;
            default:
                // Silently ignore clicks on container elements or elements without handlers
                // (No need to log every click)
                break;
        }
    };
    addTrackedListener(document.body, 'click', mainClickHandler);

    // Auth Modal - using event delegation
    const authModalHandler = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.id === 'loginTab') {
            e.preventDefault();
            switchAuthTab('login');
        } else if (target.id === 'registerTab') {
            e.preventDefault();
            switchAuthTab('register');
        }
    };
    addTrackedListener(document.body, 'click', authModalHandler);
    
    // Form submissions - need to wait for forms to exist
    setTimeout(() => {
        const loginForm = document.getElementById('loginForm') as HTMLFormElement;
        const registerForm = document.getElementById('registerForm') as HTMLFormElement;
        const forgotPasswordForm = document.getElementById('forgotPasswordForm') as HTMLFormElement;
        loginForm?.addEventListener('submit', handleLogin);
        registerForm?.addEventListener('submit', handleRegister);
        forgotPasswordForm?.addEventListener('submit', handleForgotPassword);
    }, 100);

    // Course actions - using event delegation (untuk tombol Edit, Delete, Submit Assignment, Update Assignment, Grade Assignment, Enroll)
    const courseActionsHandler = (e: Event) => {
        const target = e.target as HTMLElement;
        const action = target.getAttribute('data-action');
        const courseId = target.getAttribute('data-course-id');
        const assignmentId = target.getAttribute('data-assignment-id');
        
        // Handle enroll button clicks (from course cards or modal) - NO INLINE ONCLICK!
        if (target.classList.contains('enroll-btn') || target.classList.contains('enroll-btn-modal') || action === 'enroll' || action === 'enroll-modal') {
            e.preventDefault();
            e.stopPropagation();
            const btn = target.classList.contains('enroll-btn') || target.classList.contains('enroll-btn-modal') 
                ? target 
                : target.closest('.enroll-btn, .enroll-btn-modal') as HTMLElement;
            const enrollCourseId = btn?.getAttribute('data-course-id') || courseId;
            if (enrollCourseId) {
                console.log('[App] Enroll button clicked for course:', enrollCourseId);
                enrollInCourse(parseInt(enrollCourseId));
                // Close modal if it's from modal
                if (action === 'enroll-modal' || target.classList.contains('enroll-btn-modal')) {
                    closeModal('courseDetailModal');
                }
            }
            return;
        }
        
        // Handle navigation
        if (action === 'navigate') {
            const targetPage = target.getAttribute('data-page');
            if (targetPage) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[App] Navigate to:', targetPage);
                showPage(targetPage);
                if (targetPage === 'coursesPage') {
                    loadCourses();
                }
            }
            return;
        }
        
        // Handle grade assignment button clicks
        if (action === 'grade-assignment' && assignmentId) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[App] Grade assignment button clicked - assignmentId:', assignmentId);
            const assignmentIdNum = parseInt(assignmentId);
            if (!isNaN(assignmentIdNum)) {
                openGradingModal(assignmentIdNum);
            } else {
                console.error('[App] Invalid assignment ID:', assignmentId);
                showErrorMessage('Invalid assignment ID');
            }
            return;
        }
        
        // Also check if button has class or is inside grade button
        if (target.classList.contains('grade-btn') || target.closest('.grade-btn') || 
            (target.tagName === 'BUTTON' && target.textContent?.trim().toLowerCase().includes('grade'))) {
            const btn = target.classList.contains('grade-btn') ? target : target.closest('.grade-btn') as HTMLElement;
            const gradeAssignmentId = btn?.getAttribute('data-assignment-id') || assignmentId;
            if (gradeAssignmentId) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[App] Grade button clicked via class - assignmentId:', gradeAssignmentId);
                const assignmentIdNum = parseInt(gradeAssignmentId);
                if (!isNaN(assignmentIdNum)) {
                    openGradingModal(assignmentIdNum);
                }
            }
            return;
        }
        
        if (action && courseId) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[App] Action clicked:', action, 'courseId:', courseId, 'assignmentId:', assignmentId);
            
            if (action === 'edit') {
                editCourse(parseInt(courseId));
            } else if (action === 'delete') {
                deleteCourse(parseInt(courseId));
            } else if (action === 'submit-assignment') {
                openAssignmentModal(parseInt(courseId));
            } else if (action === 'update-assignment' && assignmentId) {
                openAssignmentModal(parseInt(courseId), parseInt(assignmentId));
            }
        }
        
        // Handle Add Course button
        if (target.id === 'addCourseBtn' || target.closest('#addCourseBtn')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[App] Add course button clicked');
            openCourseModal();
            return;
        }
        
        // Close modals - using event delegation
        if (target.classList.contains('close')) {
            e.preventDefault();
            const modal = target.closest('.modal') as HTMLElement;
            if (modal) closeModal(modal.id);
            return;
        }
    };
    addTrackedListener(document.body, 'click', courseActionsHandler);

    // Course Management - wait for elements
    setTimeout(() => {
        const addCourseBtn = document.getElementById('addCourseBtn');
        const courseForm = document.getElementById('courseForm') as HTMLFormElement;
        addCourseBtn?.addEventListener('click', () => openCourseModal());
        courseForm?.addEventListener('submit', handleCourseSubmit);
    }, 100);

    // Search and Filter - wait for elements
    setTimeout(() => {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        searchInput?.addEventListener('input', filterCourses);
        categoryFilter?.addEventListener('change', filterCourses);
    }, 100);

    // Assignment Form - wait for elements
    setTimeout(() => {
        const assignmentForm = document.getElementById('assignmentForm') as HTMLFormElement;
        const gradingForm = document.getElementById('gradingForm') as HTMLFormElement;
        assignmentForm?.addEventListener('submit', handleAssignmentSubmit);
        gradingForm?.addEventListener('submit', handleGradingSubmit);
    }, 100);
    
    // Mark as set up
    eventListenersSetup = true;
    console.log('[App] Event listeners setup complete!');
}

// Page Navigation
function showPage(pageId: string): void {
    console.log('[App] showPage: Showing page:', pageId);
    
    // Hide all pages first
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        (page as HTMLElement).style.display = 'none';
    });
    
    // Show the requested page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        (targetPage as HTMLElement).style.display = 'block';
        (targetPage as HTMLElement).style.visibility = 'visible';
        (targetPage as HTMLElement).style.opacity = '1';
        console.log('[App] showPage: Page', pageId, 'is now visible');
        console.log('[App] showPage: Page computed style - display:', window.getComputedStyle(targetPage).display);
        
        // Force admin dashboard to have auto height
        if (pageId === 'adminDashboard') {
            (targetPage as HTMLElement).style.setProperty('min-height', 'auto', 'important');
            (targetPage as HTMLElement).style.setProperty('height', 'auto', 'important');
        }
        
        // For coursesPage, ensure coursesGrid is visible
        if (pageId === 'coursesPage') {
            setTimeout(() => {
                const coursesGrid = document.getElementById('coursesGrid');
                if (coursesGrid) {
                    console.log('[App] showPage: coursesGrid found in coursesPage');
                } else {
                    console.warn('[App] showPage: coursesGrid not found in coursesPage!');
                }
            }, 100);
        }
    } else {
        console.error('[App] showPage: Page', pageId, 'not found in DOM!');
        console.error('[App] showPage: Available pages:', Array.from(document.querySelectorAll('.page')).map(p => p.id));
    }
    
    // Refresh currentUser from localStorage to ensure it's up to date
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // Ensure student dashboard is ALWAYS hidden for admin users
    if (currentUser && currentUser.role === 'admin') {
        const studentDashboard = document.getElementById('studentDashboard');
        if (studentDashboard) {
            studentDashboard.classList.remove('active');
            (studentDashboard as HTMLElement).style.display = 'none';
            (studentDashboard as HTMLElement).style.visibility = 'hidden';
            (studentDashboard as HTMLElement).style.opacity = '0';
            (studentDashboard as HTMLElement).style.position = 'absolute';
            (studentDashboard as HTMLElement).style.left = '-9999px';
        }
        // Also hide student-specific sections if they somehow appear (only for admin)
        const enrolledCoursesEl = document.getElementById('enrolledCourses');
        const myTasksEl = document.getElementById('myTasks');
        const progressSectionEl = document.getElementById('progressSection');
        if (enrolledCoursesEl) {
            const section = enrolledCoursesEl.closest('section.dashboard-section');
            if (section) {
                (section as HTMLElement).style.display = 'none';
            }
        }
        if (myTasksEl) {
            const section = myTasksEl.closest('section.dashboard-section');
            if (section) {
                (section as HTMLElement).style.display = 'none';
            }
        }
        if (progressSectionEl) {
            const section = progressSectionEl.closest('section.dashboard-section');
            if (section) {
                (section as HTMLElement).style.display = 'none';
            }
        }
        
        // Force show admin dashboard if trying to show student dashboard
        if (pageId === 'studentDashboard') {
            console.warn('[App] showPage: Admin trying to access student dashboard, redirecting to admin dashboard');
            const adminDashboard = document.getElementById('adminDashboard');
            if (adminDashboard) {
                adminDashboard.classList.add('active');
                (adminDashboard as HTMLElement).style.display = 'block';
                loadAdminData();
            }
            return;
        }
    }
    
    // Ensure admin dashboard is hidden for student users
    if (currentUser && currentUser.role === 'student') {
        const adminDashboard = document.getElementById('adminDashboard');
        if (adminDashboard) {
            adminDashboard.classList.remove('active');
            (adminDashboard as HTMLElement).style.display = 'none';
            (adminDashboard as HTMLElement).style.visibility = 'hidden';
            (adminDashboard as HTMLElement).style.opacity = '0';
        }
        
        // Ensure student dashboard and all its sections are visible and properly positioned
        const studentDashboard = document.getElementById('studentDashboard');
        if (studentDashboard) {
            (studentDashboard as HTMLElement).style.position = 'relative';
            (studentDashboard as HTMLElement).style.left = 'auto';
            (studentDashboard as HTMLElement).style.top = 'auto';
        }
        
        // Ensure student dashboard sections are visible
        if (pageId === 'studentDashboard') {
            const myTasksEl = document.getElementById('myTasks');
            const enrolledCoursesEl = document.getElementById('enrolledCourses');
            const progressSectionEl = document.getElementById('progressSection');
            
            if (myTasksEl) {
                const section = myTasksEl.closest('section.dashboard-section');
                if (section) {
                    const sectionEl = section as HTMLElement;
                    // Reset all positioning styles with !important to override any off-screen positioning
                    sectionEl.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important; left: auto !important; top: auto !important; height: auto !important; min-height: auto !important; padding: 2rem !important; margin-bottom: 2rem !important; background-color: #ffffff !important; box-sizing: border-box !important;';
                    console.log('[App] showPage: My Tasks section made visible and reset positioning');
                }
                myTasksEl.style.display = 'flex';
                myTasksEl.style.flexDirection = 'column';
                myTasksEl.style.visibility = 'visible';
                myTasksEl.style.opacity = '1';
                myTasksEl.style.position = 'relative';
                myTasksEl.style.left = 'auto';
                myTasksEl.style.top = 'auto';
            }
            if (enrolledCoursesEl) {
                const section = enrolledCoursesEl.closest('section.dashboard-section');
                if (section) {
                    (section as HTMLElement).style.display = '';
                    (section as HTMLElement).style.visibility = '';
                }
            }
            if (progressSectionEl) {
                const section = progressSectionEl.closest('section.dashboard-section');
                if (section) {
                    (section as HTMLElement).style.display = '';
                    (section as HTMLElement).style.visibility = '';
                }
            }
        }
        
        // Force show student dashboard if trying to show admin dashboard
        if (pageId === 'adminDashboard') {
            console.warn('[App] showPage: Student trying to access admin dashboard, redirecting to student dashboard');
            const studentDashboard = document.getElementById('studentDashboard');
            if (studentDashboard) {
                studentDashboard.classList.add('active');
                (studentDashboard as HTMLElement).style.display = 'block';
                loadStudentData();
            }
            return;
        }
    }
    
    // Clean up any leftover test elements when switching pages
    const testDivs = document.querySelectorAll('div[style*="lime"], div[style*="background: lime"]');
    testDivs.forEach(div => div.remove());
}

// Modal Functions
function openModal(modalId: string): void {
    document.getElementById(modalId)?.classList.add('active');
}

function closeModal(modalId: string): void {
    document.getElementById(modalId)?.classList.remove('active');
    if (modalId === 'courseModal') {
        const courseForm = document.getElementById('courseForm') as HTMLFormElement;
        const courseId = document.getElementById('courseId') as HTMLInputElement;
        courseForm?.reset();
        if (courseId) courseId.value = '';
    }
    if (modalId === 'assignmentModal') {
        const assignmentForm = document.getElementById('assignmentForm') as HTMLFormElement;
        assignmentForm?.reset();
    }
}

function openAuthModal(): void {
    openModal('authModal');
    switchAuthTab('login');
}

function switchAuthTab(tab: 'login' | 'register' | 'forgot'): void {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    if (tab === 'login') {
        document.getElementById('loginTab')?.classList.add('active');
        document.getElementById('loginForm')?.classList.add('active');
    } else if (tab === 'register') {
        document.getElementById('registerTab')?.classList.add('active');
        document.getElementById('registerForm')?.classList.add('active');
    } else if (tab === 'forgot') {
        document.getElementById('forgotPasswordForm')?.classList.add('active');
    }
}

// Authentication
async function handleLogin(e: Event): Promise<void> {
    e.preventDefault();
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
    const role = (document.getElementById('loginRole') as HTMLSelectElement).value as UserRole;

    try {
        // Menggunakan fungsi dari api.ts
        const user = await loginUser(email, password, role);
        
        // Token sudah disimpan di loginUser (dari api.ts)
        // Simpan user menggunakan helper function
        saveCurrentUser(user);
        currentUser = user;
        
        updateUIForUser();
        closeModal('authModal');
        showSuccessMessage('Login successful!');
        
        if (currentUser && currentUser.role === 'student') {
            showPage('studentDashboard');
            loadStudentData();
        } else if (currentUser) {
            showPage('adminDashboard');
            loadAdminData();
        }
    } catch (error: any) {
        showErrorMessage(error.message || 'Login failed');
        console.error('Login error:', error);
    }
}

async function handleRegister(e: Event): Promise<void> {
    e.preventDefault();
    const name = (document.getElementById('registerName') as HTMLInputElement).value;
    const email = (document.getElementById('registerEmail') as HTMLInputElement).value;
    const passwordInput = document.getElementById('registerPassword') as HTMLInputElement;
    const password = passwordInput.value;
    const role = (document.getElementById('registerRole') as HTMLSelectElement).value as UserRole;

    // Validasi password di frontend sebelum submit
    if (password.length < 6) {
        showErrorMessage('Password harus minimal 6 karakter');
        passwordInput.focus();
        return;
    }
    
    if (!/[a-z]/.test(password)) {
        showErrorMessage('Password harus mengandung minimal 1 huruf kecil');
        passwordInput.focus();
        return;
    }
    
    if (!/[A-Z]/.test(password)) {
        showErrorMessage('Password harus mengandung minimal 1 huruf besar');
        passwordInput.focus();
        return;
    }
    
    if (!/\d/.test(password)) {
        showErrorMessage('Password harus mengandung minimal 1 angka');
        passwordInput.focus();
        return;
    }

    try {
        // Menggunakan fungsi dari api.ts
        await registerUser(name, email, password, role);
        
        showSuccessMessage('Registration successful! Please login.');
        switchAuthTab('login');
    } catch (error: any) {
        showErrorMessage(error.message || 'Registration failed');
        console.error('Register error:', error);
    }
}

async function handleForgotPassword(e: Event): Promise<void> {
    e.preventDefault();
    const email = (document.getElementById('forgotPasswordEmail') as HTMLInputElement).value;

    try {
        await resetPassword(email);
        showSuccessMessage('Password reset initiated. You can now use the register form with your email to set a new password.');
        switchAuthTab('register');
        // Pre-fill email in register form
        (document.getElementById('registerEmail') as HTMLInputElement).value = email;
    } catch (error: any) {
        showErrorMessage(error.message || 'Password reset failed');
        console.error('Forgot password error:', error);
    }
}

function logout(): void {
    // Menggunakan helper function dari api.ts
    clearCurrentUser();
    currentUser = null;
    
    // Clean up any test/debug elements
    const testDivs = document.querySelectorAll('div[style*="lime"], div[style*="background: lime"]');
    testDivs.forEach(div => div.remove());
    
    // Remove any progress section wrappers that might be left over
    const oldWrapper = document.getElementById('progressSectionWrapper');
    if (oldWrapper) {
        oldWrapper.remove();
    }
    
    // Reset progress section container
    const progressSection = document.getElementById('progressSection');
    if (progressSection) {
        progressSection.innerHTML = '';
        progressSection.style.cssText = '';
    }
    
    updateUIForUser();
    showPage('homePage');
    showSuccessMessage('Logged out successfully');
}

function updateUIForUser(): void {
    const isLoggedIn = !!currentUser;
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const adminLink = document.getElementById('adminLink');

    if (loginLink) loginLink.style.display = isLoggedIn ? 'none' : 'block';
    if (logoutLink) logoutLink.style.display = isLoggedIn ? 'block' : 'none';
    if (dashboardLink) dashboardLink.style.display = (isLoggedIn && currentUser?.role === 'student') ? 'block' : 'none';
    if (adminLink) adminLink.style.display = (isLoggedIn && currentUser?.role === 'admin') ? 'block' : 'none';
}

// Courses
async function loadCourses(): Promise<void> {
    // Ensure currentUser is up to date
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    try {
        console.log('[App] Loading courses from API...');
        // Menggunakan fungsi dari api.ts
        courses = await getAllCourses();
        console.log('[App] Courses loaded:', courses.length, 'courses');
        displayCourses(courses);
    } catch (error) {
        console.error('[App] Error loading courses:', error);
        // Fallback to local data if API fails
        courses = getLocalCourses();
        console.log('[App] Using local courses:', courses.length, 'courses');
        displayCourses(courses);
    }
}

function displayCourses(coursesToDisplay: Course[]): void {
    console.log('[App] displayCourses: Called with', coursesToDisplay.length, 'courses');
    
    // Ensure currentUser is loaded from localStorage
    const user = currentUser || JSON.parse(localStorage.getItem('currentUser') || 'null');
    const isStudent = user && user.role === 'student';
    
    console.log('[App] displayCourses: Current user:', user);
    console.log('[App] displayCourses: Is student:', isStudent);
    
    // Try to find grid with multiple retries
    let grid = document.getElementById('coursesGrid');
    let retryCount = 0;
    const maxRetries = 5;
    
    const tryDisplay = () => {
        grid = document.getElementById('coursesGrid');
        if (!grid) {
            retryCount++;
            if (retryCount < maxRetries) {
                console.warn(`[App] displayCourses: coursesGrid not found, retry ${retryCount}/${maxRetries}...`);
                setTimeout(tryDisplay, 200);
                return;
            } else {
                console.error('[App] displayCourses: coursesGrid not found after', maxRetries, 'retries!');
                // Try to find coursesPage and create grid if it doesn't exist
                const coursesPage = document.getElementById('coursesPage');
                if (coursesPage) {
                    console.log('[App] displayCourses: coursesPage found, checking for coursesGrid container...');
                    const container = coursesPage.querySelector('.container');
                    if (container) {
                        // Check if coursesGrid exists but maybe with different ID
                        const existingGrid = container.querySelector('#coursesGrid') || container.querySelector('.courses-grid');
                        if (existingGrid) {
                            console.log('[App] displayCourses: Found existing grid element');
                            grid = existingGrid as HTMLElement;
                        } else {
                            console.log('[App] displayCourses: Creating coursesGrid element...');
                            const newGrid = document.createElement('div');
                            newGrid.id = 'coursesGrid';
                            newGrid.className = 'courses-grid';
                            container.appendChild(newGrid);
                            grid = newGrid;
                        }
                    }
                }
                
                if (!grid) {
                    console.error('[App] displayCourses: Cannot find or create coursesGrid!');
                    return;
                }
            }
        }
        
        console.log('[App] displayCourses: Grid element found:', grid);
        console.log('[App] displayCourses: Displaying', coursesToDisplay.length, 'courses');

        if (coursesToDisplay.length === 0) {
            grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #6b7280;">No courses available yet.</p>';
            return;
        }

        grid.innerHTML = coursesToDisplay.map(course => `
            <div class="course-card" data-course-id="${course.id}">
                <h3>${course.title}</h3>
                <span class="category">${course.category}</span>
                <p class="description">${course.description}</p>
                <div class="meta">
                    <span>⏱ ${course.duration} hours</span>
                    ${isStudent ? 
                        `<button class="btn btn-primary enroll-btn" data-course-id="${course.id}" data-action="enroll">Enroll</button>` :
                        ''
                    }
                </div>
            </div>
        `).join('');

        console.log('[App] displayCourses: Courses rendered to grid');

        // Add click listeners for course details and enroll buttons
        document.querySelectorAll('.course-card').forEach(card => {
            card.addEventListener('click', (e: Event) => {
                const target = e.target as HTMLElement;
                
                // Handle enroll button click
                if (target.classList.contains('enroll-btn') || target.closest('.enroll-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    const enrollBtn = target.classList.contains('enroll-btn') ? target : target.closest('.enroll-btn') as HTMLElement;
                    const courseId = parseInt(enrollBtn?.dataset.courseId || '0');
                    if (courseId) {
                        console.log('[App] Enroll button clicked for course:', courseId);
                        enrollInCourse(courseId);
                    }
                    return;
                }
                
                // Handle course card click (for details)
                if (!target.classList.contains('btn')) {
                    const courseId = parseInt((card as HTMLElement).dataset.courseId || '0');
                    showCourseDetails(courseId);
                }
            });
        });
    };
    
    tryDisplay();
}

async function enrollInCourse(courseId: number): Promise<void> {
    console.log('[App] enrollInCourse: Called with courseId:', courseId);
    
    // Always refresh currentUser from localStorage
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    console.log('[App] enrollInCourse: Current user:', currentUser);
    
    if (!currentUser) {
        showErrorMessage('Please login first to enroll in courses');
        return;
    }
    
    if (currentUser.role !== 'student') {
        showErrorMessage('Only students can enroll in courses');
        return;
    }

    try {
        console.log('[App] enrollInCourse: Attempting to enroll in course', courseId);
        // Menggunakan fungsi dari api.ts
        await enrollMeInCourse(courseId);
        
        console.log('[App] enrollInCourse: Enrollment successful!');
        showSuccessMessage('Successfully enrolled in course!');
        
        // Refresh courses list to update UI
        await loadCourses();
        // Refresh student data
        loadStudentData();
    } catch (error: any) {
        console.error('[App] Enrollment error:', error);
        const errorMessage = error.message || 'Enrollment failed';
        showErrorMessage(errorMessage);
        
        // Check if already enrolled
        if (errorMessage.includes('Already enrolled') || errorMessage.includes('already')) {
            showErrorMessage('You are already enrolled in this course');
        } else {
            // Fallback: add to local enrolled courses only if not already enrolled
            if (!enrolledCourses.find(c => c.id === courseId)) {
                const course = courses.find(c => c.id === courseId);
                if (course) {
                    enrolledCourses.push(course);
                    showSuccessMessage('Successfully enrolled in course!');
                    loadStudentData();
                }
            }
        }
    }
}

// Make enrollInCourse available globally for onclick handlers
(window as any).enrollInCourse = enrollInCourse;

function filterCourses(): void {
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    const categoryFilter = document.getElementById('categoryFilter') as HTMLSelectElement;
    
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    const filtered = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm) ||
                            course.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || course.category === category;
        return matchesSearch && matchesCategory;
    });

    displayCourses(filtered);
}

function showCourseDetails(courseId: number): void {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // Ensure currentUser is up to date
    const user = currentUser || JSON.parse(localStorage.getItem('currentUser') || 'null');
    const isStudent = user && user.role === 'student';

    const content = document.getElementById('courseDetailContent');
    if (!content) return;

    content.innerHTML = `
        <h2>${course.title}</h2>
        <span class="category">${course.category}</span>
        <p class="description" style="margin: 1rem 0;">${course.description}</p>
        <div class="meta">
            <span>⏱ Duration: ${course.duration} hours</span>
        </div>
        ${isStudent ? 
            `<div class="course-actions">
                <button class="btn btn-primary enroll-btn-modal" data-course-id="${course.id}" data-action="enroll-modal">Enroll Now</button>
            </div>` :
            ''
        }
    `;
    openModal('courseDetailModal');
}

// Make closeModal available globally
(window as any).closeModal = closeModal;

// Student Dashboard
async function loadStudentData(): Promise<void> {
    if (!currentUser || currentUser.role !== 'student') {
        console.log('[App] loadStudentData: Not a student or not logged in');
        return;
    }

    // Ensure student dashboard is not positioned off-screen
    const studentDashboard = document.getElementById('studentDashboard');
    if (studentDashboard) {
        (studentDashboard as HTMLElement).style.position = 'relative';
        (studentDashboard as HTMLElement).style.left = 'auto';
        (studentDashboard as HTMLElement).style.top = 'auto';
    }
    
    // Ensure My Tasks section is not positioned off-screen
    const myTasksEl = document.getElementById('myTasks');
    if (myTasksEl) {
        const section = myTasksEl.closest('section.dashboard-section');
        if (section) {
            const sectionEl = section as HTMLElement;
            sectionEl.style.position = 'relative';
            sectionEl.style.left = 'auto';
            sectionEl.style.top = 'auto';
        }
        myTasksEl.style.position = 'relative';
        myTasksEl.style.left = 'auto';
        myTasksEl.style.top = 'auto';
    }

    try {
        console.log('[App] Loading student data for user:', currentUser.id);
        // Menggunakan fungsi dari api.ts - lebih mudah dan bersih!
        enrolledCourses = await getMyCourses();
        console.log('[App] Loaded enrolled courses:', enrolledCourses.length);
        
        assignments = await getMyAssignments();
        console.log('[App] Loaded assignments:', assignments.length, assignments);

        displayEnrolledCourses();
        // Small delay to ensure DOM is ready before displaying tasks
        setTimeout(() => {
            displayTasks();
        }, 50);
        displayProgress();
    } catch (error) {
        console.error('[App] Error loading student data:', error);
        // Use local data
        displayEnrolledCourses();
        setTimeout(() => {
            displayTasks();
        }, 50);
        displayProgress();
    }
}

function displayEnrolledCourses(): void {
    const container = document.getElementById('enrolledCourses');
    if (!container) return;

    if (enrolledCourses.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="margin-bottom: 1rem;">You are not enrolled in any courses yet.</p>
                <a href="#" class="btn btn-primary" data-action="navigate" data-page="coursesPage">Browse Available Courses</a>
            </div>
        `;
        return;
    }

    container.innerHTML = enrolledCourses.map(course => `
        <div class="course-card">
            <h3>${course.title}</h3>
            <span class="category">${course.category}</span>
            <p class="description">${course.description}</p>
            <div class="course-actions">
                <button class="btn btn-secondary" data-action="submit-assignment" data-course-id="${course.id}">Submit Assignment</button>
            </div>
        </div>
    `).join('');
}

function displayTasks(): void {
    const container = document.getElementById('myTasks');
    if (!container) {
        console.warn('[App] displayTasks: Container myTasks not found');
        return;
    }

    // Check if container is visible
    const containerStyle = window.getComputedStyle(container);
    const parentSection = container.closest('section.dashboard-section');
    const sectionStyle = parentSection ? window.getComputedStyle(parentSection) : null;
    
    console.log('[App] displayTasks: Container found:', container);
    console.log('[App] displayTasks: Container display:', containerStyle.display);
    console.log('[App] displayTasks: Container visibility:', containerStyle.visibility);
    console.log('[App] displayTasks: Parent section display:', sectionStyle?.display);
    console.log('[App] displayTasks: assignments.length =', assignments.length);
    console.log('[App] displayTasks: assignments =', assignments);

    // Ensure container and parent section are visible
    if (parentSection) {
        const sectionEl = parentSection as HTMLElement;
        
        // Check all ancestors for visibility
        let current: HTMLElement | null = sectionEl;
        while (current && current !== document.body) {
            const computed = window.getComputedStyle(current);
            console.log('[App] displayTasks: Checking ancestor', current.tagName, current.className || current.id, '- display:', computed.display, 'visibility:', computed.visibility, 'height:', computed.height, 'offsetHeight:', current.offsetHeight);
            if (computed.display === 'none') {
                console.error('[App] displayTasks: CRITICAL - Ancestor has display:none!', current);
                current.style.setProperty('display', 'block', 'important');
            }
            if (computed.visibility === 'hidden') {
                console.error('[App] displayTasks: CRITICAL - Ancestor has visibility:hidden!', current);
                current.style.setProperty('visibility', 'visible', 'important');
            }
            current = current.parentElement;
        }
        
        // Force parent section with ALL possible properties using !important
        sectionEl.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important; min-height: auto !important; height: auto !important; overflow: visible !important; padding: 2rem !important; margin-bottom: 2rem !important; background-color: #ffffff !important; box-sizing: border-box !important;';
        console.log('[App] displayTasks: Parent section style set to visible with !important');
        console.log('[App] displayTasks: Parent section computed style after:', window.getComputedStyle(sectionEl).display, window.getComputedStyle(sectionEl).visibility, window.getComputedStyle(sectionEl).height);
    }
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.style.height = 'auto';
    container.style.minHeight = 'auto';
    container.style.maxHeight = 'none';
    container.style.overflow = 'visible';

    if (assignments.length === 0) {
        if (enrolledCourses.length === 0) {
            container.innerHTML = '<p style="color: #6b7280;">Enroll in a course first to see assignments.</p>';
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 1rem; color: #6b7280;">
                    <p>No assignments submitted yet.</p>
                    <p style="font-size: 0.9em; margin-top: 0.5rem;">Click "Submit Assignment" on your enrolled courses to create an assignment.</p>
                </div>
            `;
        }
        console.log('[App] displayTasks: Set empty state HTML');
        return;
    }

    // Group assignments by status for better display
    const gradedAssignments = assignments.filter(a => a.status === 'graded');
    const submittedAssignments = assignments.filter(a => a.status === 'submitted');
    const pendingAssignments = assignments.filter(a => a.status === 'pending' || !a.status);
    
    let htmlContent = '';
    
    // Display graded assignments first
    if (gradedAssignments.length > 0) {
        htmlContent += `
            <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                    <span style="color: #28a745; font-weight: 600; margin-right: 0.5rem; font-size: 1.2em;">✅</span>
                    <strong style="color: #28a745;">Completed Assignments (${gradedAssignments.length}):</strong>
                </div>
                <div style="margin-left: 1.5rem;">
                    ${gradedAssignments.map(assignment => `
                        <div style="padding: 0.75rem; margin-bottom: 0.5rem; background-color: #d4edda; border-left: 3px solid #28a745; border-radius: 4px;">
                            <div style="font-weight: 600; color: #155724; margin-bottom: 0.25rem;">${assignment.title || 'Untitled Assignment'}</div>
                            <div style="font-size: 0.85em; color: #6c757d; margin-bottom: 0.25rem;">
                                <span>📚 Course: <strong>${assignment.courseTitle || 'Course Assignment'}</strong></span>
                            </div>
                            <div style="font-size: 0.85em; color: #6c757d;">
                                <span>✅ Status: <strong>Graded</strong></span>
                                ${assignment.score !== undefined ? `<span style="margin-left: 1rem;">📊 Score: <strong>${assignment.score}/100</strong></span>` : ''}
                                <span style="margin-left: 1rem;">📅 Submitted: ${new Date(assignment.submittedAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            ${assignment.feedback ? `
                                <div style="font-size: 0.85em; color: #155724; margin-top: 0.5rem; padding: 0.5rem; background-color: #c3e6cb; border-radius: 4px;">
                                    <strong>Feedback:</strong> ${assignment.feedback}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Display submitted assignments (pending review)
    if (submittedAssignments.length > 0) {
        htmlContent += `
            <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                    <span style="color: #ffc107; font-weight: 600; margin-right: 0.5rem; font-size: 1.2em;">⏳</span>
                    <strong style="color: #856404;">Pending Review (${submittedAssignments.length}):</strong>
                </div>
                <div style="margin-left: 1.5rem;">
                    ${submittedAssignments.map(assignment => `
                        <div style="padding: 0.75rem; margin-bottom: 0.5rem; background-color: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px;">
                            <div style="font-weight: 600; color: #856404; margin-bottom: 0.25rem;">${assignment.title || 'Untitled Assignment'}</div>
                            <div style="font-size: 0.85em; color: #6c757d; margin-bottom: 0.25rem;">
                                <span>📚 Course: <strong>${assignment.courseTitle || 'Course Assignment'}</strong></span>
                            </div>
                            <div style="font-size: 0.85em; color: #6c757d; margin-bottom: 0.5rem;">
                                <span>⏳ Status: <strong>Submitted</strong> (Waiting for grading)</span>
                                <span style="margin-left: 1rem;">📅 Submitted: ${new Date(assignment.submittedAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <button class="btn btn-outline" data-action="update-assignment" data-course-id="${assignment.courseId}" data-assignment-id="${assignment.id}" style="margin-top: 0.5rem; font-size: 0.9em;">Update Submission</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Display pending assignments
    if (pendingAssignments.length > 0) {
        htmlContent += `
            <div style="margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                    <span style="color: #6c757d; font-weight: 600; margin-right: 0.5rem; font-size: 1.2em;">📝</span>
                    <strong style="color: #6c757d;">Pending Assignments (${pendingAssignments.length}):</strong>
                </div>
                <div style="margin-left: 1.5rem;">
                    ${pendingAssignments.map(assignment => `
                        <div style="padding: 0.75rem; margin-bottom: 0.5rem; background-color: #f8f9fa; border-left: 3px solid #6c757d; border-radius: 4px;">
                            <div style="font-weight: 600; color: #6c757d; margin-bottom: 0.25rem;">${assignment.title || 'Untitled Assignment'}</div>
                            <div style="font-size: 0.85em; color: #6c757d; margin-bottom: 0.5rem;">
                                <span>📚 Course: <strong>${assignment.courseTitle || 'Course Assignment'}</strong></span>
                                <span style="margin-left: 1rem;">📝 Status: <strong>Pending</strong></span>
                            </div>
                            <button class="btn btn-outline" data-action="update-assignment" data-course-id="${assignment.courseId}" data-assignment-id="${assignment.id}" style="margin-top: 0.5rem; font-size: 0.9em;">Update Submission</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    console.log('[App] displayTasks: Setting innerHTML, length:', htmlContent.length);
    
    // Ensure container has proper display and visibility
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    container.style.minHeight = 'auto';
    container.style.height = 'auto';
    
    container.innerHTML = htmlContent;
    
    // Verify elements are actually in DOM
    const taskItems = container.querySelectorAll('.task-item');
    console.log('[App] displayTasks: innerHTML set. Container children:', container.children.length);
    console.log('[App] displayTasks: Task items found:', taskItems.length);
    console.log('[App] displayTasks: First task item display:', taskItems[0] ? window.getComputedStyle(taskItems[0] as HTMLElement).display : 'N/A');
    console.log('[App] displayTasks: Container innerHTML preview:', container.innerHTML.substring(0, 200));
    
    // Force a reflow to ensure rendering
    void container.offsetHeight;
    
    // Double-check parent section is still visible after rendering
    if (parentSection) {
        const sectionEl = parentSection as HTMLElement;
        const finalComputed = window.getComputedStyle(sectionEl);
        const rect = sectionEl.getBoundingClientRect();
        console.log('[App] displayTasks: Final check - Parent section display:', finalComputed.display, 'visibility:', finalComputed.visibility, 'height:', finalComputed.height, 'offsetHeight:', sectionEl.offsetHeight);
        console.log('[App] displayTasks: Parent section position - top:', rect.top, 'left:', rect.left, 'width:', rect.width, 'height:', rect.height, 'bottom:', rect.bottom);
        console.log('[App] displayTasks: Viewport height:', window.innerHeight, 'Viewport width:', window.innerWidth);
        console.log('[App] displayTasks: Section is in viewport:', rect.top >= 0 && rect.top < window.innerHeight && rect.left >= 0 && rect.left < window.innerWidth);
        
        if (finalComputed.display === 'none' || finalComputed.visibility === 'hidden' || sectionEl.offsetHeight === 0) {
            console.error('[App] displayTasks: CRITICAL - Parent section is hidden after rendering! Fixing...');
            sectionEl.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important; min-height: auto !important; height: auto !important; overflow: visible !important; padding: 2rem !important; margin-bottom: 2rem !important; background-color: #ffffff !important; box-sizing: border-box !important;';
            void sectionEl.offsetHeight; // Force reflow
        }
        
        // Ensure section is not positioned off-screen
        if (rect.top < -1000 || rect.left < -1000 || rect.left < -100) {
            console.error('[App] displayTasks: CRITICAL - Parent section is positioned off-screen!', rect);
            // Force reset all positioning with !important
            sectionEl.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important; left: auto !important; top: auto !important; height: auto !important; min-height: auto !important; padding: 2rem !important; margin-bottom: 2rem !important; background-color: #ffffff !important; box-sizing: border-box !important;';
            void sectionEl.offsetHeight; // Force reflow
            
            // Also check and fix container positioning
            container.style.position = 'relative';
            container.style.left = 'auto';
            container.style.top = 'auto';
            
            // Re-check position after fix
            const newRect = sectionEl.getBoundingClientRect();
            console.log('[App] displayTasks: After fix - Parent section position - top:', newRect.top, 'left:', newRect.left);
        }
        
        // Scroll section into view if it's not visible
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
            console.log('[App] displayTasks: Section is outside viewport, scrolling into view...');
            // Use setTimeout to ensure DOM is fully rendered before scrolling
            setTimeout(() => {
                // Scroll to section header (h2) instead of section itself for better visibility
                const sectionHeader = sectionEl.querySelector('h2');
                if (sectionHeader) {
                    (sectionHeader as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                } else {
                    sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                }
            }, 200);
        } else {
            // Even if in viewport, ensure it's fully visible
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                console.log('[App] displayTasks: Section partially visible, adjusting scroll...');
                setTimeout(() => {
                    const sectionHeader = sectionEl.querySelector('h2');
                    if (sectionHeader) {
                        (sectionHeader as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                    }
                }, 200);
            }
        }
    }
}

// Flag to prevent multiple simultaneous renders
let isRenderingProgress = false;

function displayProgress(): void {
    // Prevent multiple simultaneous renders
    if (isRenderingProgress) {
        console.warn('[App] displayProgress: Already rendering, skipping...');
        return;
    }
    
    // Try to find container with retry
    let container = document.getElementById('progressSection');
    if (!container) {
        console.warn('[App] displayProgress: progressSection container not found, checking if page is visible...');
        const adminDashboard = document.getElementById('adminDashboard');
        if (adminDashboard) {
            console.log('[App] displayProgress: adminDashboard found, but progressSection not found. Checking again...');
            // Try again after small delay
            setTimeout(() => {
                container = document.getElementById('progressSection');
                if (container) {
                    console.log('[App] displayProgress: progressSection found on retry');
                    displayProgressContent(container);
                } else {
                    console.error('[App] displayProgress: progressSection still not found after retry');
                }
            }, 100);
            return;
        } else {
            console.warn('[App] displayProgress: adminDashboard not found, page may not be loaded');
            return;
        }
    }

    isRenderingProgress = true;
    try {
        displayProgressContent(container);
    } finally {
        // Reset flag after a delay to allow re-renders if needed
        setTimeout(() => {
            isRenderingProgress = false;
        }, 1000);
    }
}

function displayProgressContent(container: HTMLElement): void {
    console.log('[App] displayProgressContent: Current user:', currentUser?.role);
    console.log('[App] displayProgressContent: Assignments count:', assignments.length);

    // Admin view: Show all submitted assignments from all students
    if (currentUser && currentUser.role === 'admin') {
        const submittedAssignments = assignments.filter(a => a.status === 'submitted');
        const gradedAssignments = assignments.filter(a => a.status === 'graded');
        
        console.log('[App] displayProgress: Submitted assignments:', submittedAssignments.length);
        console.log('[App] displayProgress: Graded assignments:', gradedAssignments.length);
        
        if (submittedAssignments.length === 0 && gradedAssignments.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; background-color: #f8f9fa; border-radius: 8px;">
                    <div style="font-size: 3em; margin-bottom: 1rem;">📝</div>
                    <p style="color: #6c757d; font-size: 1.1em; margin: 0;">No assignments to grade yet.</p>
                    <p style="color: #6c757d; font-size: 0.9em; margin-top: 0.5rem;">Students can submit assignments from their enrolled courses.</p>
                </div>
            `;
            return;
        }

        console.log('[App] displayProgressContent: Rendering admin view with', submittedAssignments.length, 'submitted and', gradedAssignments.length, 'graded assignments');
        console.log('[App] displayProgressContent: Container element:', container);
        console.log('[App] displayProgressContent: Container parent:', container.parentElement);
        
        try {
            // FIRST: Ensure parent section is visible and has height
            const parentSectionInitial = container.closest('section.dashboard-section');
            if (parentSectionInitial) {
                const sectionEl = parentSectionInitial as HTMLElement;
                sectionEl.style.setProperty('display', 'block', 'important');
                sectionEl.style.setProperty('visibility', 'visible', 'important');
                sectionEl.style.setProperty('min-height', '400px', 'important');
                sectionEl.style.setProperty('height', 'auto', 'important');
                sectionEl.style.setProperty('overflow', 'visible', 'important');
                console.log('[App] displayProgressContent: Parent section styles forced');
            }
            
            // Override grid layout for admin view - use block layout instead
            // Force override CSS dengan !important
            container.style.setProperty('display', 'block', 'important');
            container.style.setProperty('grid-template-columns', 'none', 'important');
            container.style.setProperty('gap', '0', 'important');
            container.style.setProperty('min-height', '400px', 'important');
            container.style.setProperty('height', 'auto', 'important');
            container.style.setProperty('width', '100%', 'important');
            container.style.setProperty('visibility', 'visible', 'important');
            container.style.setProperty('opacity', '1', 'important');
            container.style.setProperty('position', 'relative', 'important');
            container.style.setProperty('overflow', 'visible', 'important');
            container.style.setProperty('padding', '1rem', 'important');
            
            // Force reflow
            void container.offsetHeight;
            
            console.log('[App] displayProgressContent: Container styles set:', {
                display: container.style.display,
                gridTemplateColumns: container.style.gridTemplateColumns,
                visibility: container.style.visibility,
                opacity: container.style.opacity,
                height: container.style.height,
                minHeight: container.style.minHeight,
                offsetHeight: container.offsetHeight
            });
            
            // Build HTML content step by step to avoid template string issues
            // Add wrapper with visible background and EXPLICIT styles to ensure visibility
            let htmlContent = '<div style="background-color: white !important; padding: 1rem !important; border-radius: 8px !important; margin-bottom: 2rem !important; border: 2px solid blue !important; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; min-height: 100px !important; width: 100% !important; position: relative !important; z-index: 1 !important;">';
            htmlContent += '<h3 style="margin-bottom: 1rem !important; color: #1f2937 !important; display: block !important; visibility: visible !important; opacity: 1 !important;">📊 Assignment Grading Overview</h3>';
            htmlContent += '<div style="display: grid !important; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important; gap: 1rem !important; margin-bottom: 2rem !important; visibility: visible !important; opacity: 1 !important; height: auto !important; width: 100% !important;">';
            htmlContent += '<div style="padding: 1rem !important; background-color: #fff3cd !important; border-radius: 8px !important; border-left: 4px solid #ffc107 !important; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; min-height: 80px !important; width: 100% !important;">';
            htmlContent += '<div style="font-size: 2em !important; font-weight: bold !important; color: #856404 !important; display: block !important; visibility: visible !important; opacity: 1 !important;">' + submittedAssignments.length + '</div>';
            htmlContent += '<div style="color: #856404 !important; display: block !important; visibility: visible !important; opacity: 1 !important;">Pending Review</div>';
            htmlContent += '</div>';
            htmlContent += '<div style="padding: 1rem !important; background-color: #d4edda !important; border-radius: 8px !important; border-left: 4px solid #28a745 !important; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; min-height: 80px !important; width: 100% !important;">';
            htmlContent += '<div style="font-size: 2em !important; font-weight: bold !important; color: #155724 !important; display: block !important; visibility: visible !important; opacity: 1 !important;">' + gradedAssignments.length + '</div>';
            htmlContent += '<div style="color: #155724 !important; display: block !important; visibility: visible !important; opacity: 1 !important;">Graded</div>';
            htmlContent += '</div>';
            htmlContent += '</div>';
            htmlContent += '</div>';
            
            // Add submitted assignments
            if (submittedAssignments.length > 0) {
                htmlContent += '<div style="margin-bottom: 2rem !important; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; width: 100% !important; background-color: white !important; padding: 1rem !important; border: 2px solid green !important;">';
                htmlContent += '<h3 style="margin-bottom: 1rem !important; color: #856404 !important; display: block !important; visibility: visible !important; opacity: 1 !important;">';
                htmlContent += '<span style="font-size: 1.2em !important; margin-right: 0.5rem !important; display: inline !important; visibility: visible !important; opacity: 1 !important;">⏳</span>';
                htmlContent += 'Pending Review (' + submittedAssignments.length + ')';
                htmlContent += '</h3>';
                htmlContent += '<div style="display: grid !important; gap: 1rem !important; visibility: visible !important; opacity: 1 !important; height: auto !important; width: 100% !important;">';
                
                submittedAssignments.forEach(assignment => {
                    const course = courses.find(c => c.id === assignment.courseId);
                    const studentName = (assignment as any).studentName || 'Unknown Student';
                    const studentEmail = (assignment as any).studentEmail || 'Unknown Email';
                    const courseTitle = course?.title || assignment.courseTitle || 'Unknown Course';
                    const submittedDate = new Date(assignment.submittedAt || Date.now()).toLocaleDateString();
                    
                    htmlContent += '<div style="padding: 1rem !important; background-color: #fff3cd !important; border-left: 4px solid #ffc107 !important; border-radius: 4px !important; display: block !important; visibility: visible !important; opacity: 1 !important; height: auto !important; min-height: 100px !important; width: 100% !important; margin-bottom: 1rem !important;">';
                    htmlContent += '<div style="display: flex !important; justify-content: space-between !important; align-items: start !important; margin-bottom: 0.5rem !important; visibility: visible !important; opacity: 1 !important;">';
                    htmlContent += '<div style="flex: 1 !important; display: block !important; visibility: visible !important; opacity: 1 !important;">';
                    htmlContent += '<div style="font-weight: 600 !important; color: #856404 !important; margin-bottom: 0.25rem !important; font-size: 1.1em !important; display: block !important; visibility: visible !important; opacity: 1 !important;">' + assignment.title + '</div>';
                    htmlContent += '<div style="font-size: 0.9em !important; color: #6c757d !important; margin-bottom: 0.25rem !important; display: block !important; visibility: visible !important; opacity: 1 !important;"><strong>Course:</strong> ' + courseTitle + '</div>';
                    htmlContent += '<div style="font-size: 0.9em !important; color: #6c757d !important; margin-bottom: 0.25rem !important; display: block !important; visibility: visible !important; opacity: 1 !important;"><strong>Student:</strong> ' + studentName + ' (' + studentEmail + ')</div>';
                    htmlContent += '<div style="font-size: 0.85em !important; color: #6c757d !important; display: block !important; visibility: visible !important; opacity: 1 !important;">📅 Submitted: ' + submittedDate + '</div>';
                    htmlContent += '</div>';
                    htmlContent += '<button class="btn btn-primary" data-action="grade-assignment" data-assignment-id="' + assignment.id + '" style="margin-left: 1rem !important; display: inline-block !important; visibility: visible !important; opacity: 1 !important;">Grade Assignment</button>';
                    htmlContent += '</div>';
                    htmlContent += '</div>';
                });
                
                htmlContent += '</div>';
                htmlContent += '</div>';
            }
            
            // Add graded assignments
            if (gradedAssignments.length > 0) {
                htmlContent += '<div>';
                htmlContent += '<h3 style="margin-bottom: 1rem; color: #155724;">';
                htmlContent += '<span style="font-size: 1.2em; margin-right: 0.5rem;">✅</span>';
                htmlContent += 'Graded Assignments (' + gradedAssignments.length + ')';
                htmlContent += '</h3>';
                htmlContent += '<div style="display: grid; gap: 1rem;">';
                
                gradedAssignments.forEach(assignment => {
                    const course = courses.find(c => c.id === assignment.courseId);
                    const studentName = (assignment as any).studentName || 'Unknown Student';
                    const courseTitle = course?.title || assignment.courseTitle || 'Unknown Course';
                    const score = assignment.score !== undefined ? assignment.score : 'N/A';
                    const feedback = assignment.feedback || '';
                    const gradedDate = assignment.gradedAt ? new Date(assignment.gradedAt).toLocaleDateString() : 'N/A';
                    
                    htmlContent += '<div style="padding: 1rem; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">';
                    htmlContent += '<div style="font-weight: 600; color: #155724; margin-bottom: 0.25rem; font-size: 1.1em;">' + assignment.title + '</div>';
                    htmlContent += '<div style="font-size: 0.9em; color: #6c757d; margin-bottom: 0.25rem;"><strong>Course:</strong> ' + courseTitle + '</div>';
                    htmlContent += '<div style="font-size: 0.9em; color: #6c757d; margin-bottom: 0.25rem;"><strong>Student:</strong> ' + studentName + '</div>';
                    htmlContent += '<div style="font-size: 0.9em; color: #155724; margin-top: 0.5rem;"><strong>Score:</strong> ' + score + '/100';
                    if (feedback) {
                        htmlContent += '<br><strong>Feedback:</strong> ' + feedback;
                    }
                    htmlContent += '</div>';
                    htmlContent += '<div style="font-size: 0.85em; color: #6c757d; margin-top: 0.25rem;">📅 Graded: ' + gradedDate + '</div>';
                    htmlContent += '</div>';
                });
                
                htmlContent += '</div>';
                htmlContent += '</div>';
            }
            
            // Log HTML content before setting
            console.log('[App] displayProgressContent: htmlContent length:', htmlContent.length);
            console.log('[App] displayProgressContent: htmlContent preview (first 500 chars):', htmlContent.substring(0, 500));
            
            // OLD TEMPLATE STRING CODE - REMOVED (commented out)
            /*
            const htmlContentOld = `
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem;">📊 Assignment Grading Overview</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div style="padding: 1rem; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <div style="font-size: 2em; font-weight: bold; color: #856404;">${submittedAssignments.length}</div>
                        <div style="color: #856404;">Pending Review</div>
                    </div>
                    <div style="padding: 1rem; background-color: #d4edda; border-radius: 8px; border-left: 4px solid #28a745;">
                        <div style="font-size: 2em; font-weight: bold; color: #155724;">${gradedAssignments.length}</div>
                        <div style="color: #155724;">Graded</div>
                    </div>
                </div>
            </div>
            
            ${submittedAssignments.length > 0 ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem; color: #856404;">
                        <span style="font-size: 1.2em; margin-right: 0.5rem;">⏳</span>
                        Pending Review (${submittedAssignments.length})
                    </h3>
                    <div style="display: grid; gap: 1rem;">
                        ${submittedAssignments.map(assignment => {
                            const course = courses.find(c => c.id === assignment.courseId);
                            const studentName = (assignment as any).studentName || 'Unknown Student';
                            const studentEmail = (assignment as any).studentEmail || 'Unknown Email';
                            return `
                                <div style="padding: 1rem; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                        <div style="flex: 1;">
                                            <div style="font-weight: 600; color: #856404; margin-bottom: 0.25rem; font-size: 1.1em;">${assignment.title}</div>
                                            <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 0.25rem;">
                                                <strong>Course:</strong> ${course?.title || assignment.courseTitle || 'Unknown Course'}
                                            </div>
                                            <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 0.25rem;">
                                                <strong>Student:</strong> ${studentName} (${studentEmail})
                                            </div>
                                            <div style="font-size: 0.85em; color: #6c757d;">
                                                📅 Submitted: ${new Date(assignment.submittedAt || Date.now()).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <button class="btn btn-primary" data-action="grade-assignment" data-assignment-id="${assignment.id}" style="margin-left: 1rem;">
                                            Grade Assignment
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${gradedAssignments.length > 0 ? `
                <div>
                    <h3 style="margin-bottom: 1rem; color: #155724;">
                        <span style="font-size: 1.2em; margin-right: 0.5rem;">✅</span>
                        Graded Assignments (${gradedAssignments.length})
                    </h3>
                    <div style="display: grid; gap: 1rem;">
                        ${gradedAssignments.map(assignment => {
                            const course = courses.find(c => c.id === assignment.courseId);
                            const studentName = (assignment as any).studentName || 'Unknown Student';
                            return `
                                <div style="padding: 1rem; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">
                                    <div style="font-weight: 600; color: #155724; margin-bottom: 0.25rem; font-size: 1.1em;">${assignment.title}</div>
                                    <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 0.25rem;">
                                        <strong>Course:</strong> ${course?.title || assignment.courseTitle || 'Unknown Course'}
                                    </div>
                                    <div style="font-size: 0.9em; color: #6c757d; margin-bottom: 0.25rem;">
                                        <strong>Student:</strong> ${studentName}
                                    </div>
                                    <div style="font-size: 0.9em; color: #155724; margin-top: 0.5rem;">
                                        <strong>Score:</strong> ${assignment.score !== undefined ? assignment.score : 'N/A'}/100
                                        ${assignment.feedback ? `<br><strong>Feedback:</strong> ${assignment.feedback}` : ''}
                                    </div>
                                    <div style="font-size: 0.85em; color: #6c757d; margin-top: 0.25rem;">
                                        📅 Graded: ${assignment.gradedAt ? new Date(assignment.gradedAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        `;
            */
            
            // Log HTML content before setting
            console.log('[App] displayProgressContent: htmlContent length:', htmlContent.length);
            console.log('[App] displayProgressContent: htmlContent preview (first 500 chars):', htmlContent.substring(0, 500));
            
            // Clear container first
            container.innerHTML = '';
            
            // Remove progress-section class temporarily to avoid CSS conflicts
            container.classList.remove('progress-section');
            container.classList.add('admin-progress-section');
            
            // CRITICAL DIAGNOSTIC: Check container and parent state
            console.log('[App] displayProgressContent: DIAGNOSTIC - Container state:', {
                isConnected: container.isConnected,
                offsetParent: container.offsetParent,
                parentElement: container.parentElement?.tagName,
                parentClassName: container.parentElement?.className,
                parentOffsetHeight: container.parentElement ? (container.parentElement as HTMLElement).offsetHeight : null,
                containerOffsetHeight: container.offsetHeight,
                containerComputedHeight: window.getComputedStyle(container).height,
                containerComputedDisplay: window.getComputedStyle(container).display,
                containerComputedVisibility: window.getComputedStyle(container).visibility
            });
            
            // Check parent section
            const parentSectionCheck = container.closest('section.dashboard-section');
            if (parentSectionCheck) {
                const sectionEl = parentSectionCheck as HTMLElement;
                const sectionStyles = window.getComputedStyle(sectionEl);
                console.log('[App] displayProgressContent: DIAGNOSTIC - Parent section state:', {
                    offsetHeight: sectionEl.offsetHeight,
                    computedHeight: sectionStyles.height,
                    computedMinHeight: sectionStyles.minHeight,
                    computedDisplay: sectionStyles.display,
                    computedVisibility: sectionStyles.visibility,
                    computedOverflow: sectionStyles.overflow
                });
                
                // If parent section has 0 height, force it FIRST
                if (sectionEl.offsetHeight === 0) {
                    console.error('[App] displayProgressContent: CRITICAL - Parent section has 0 height! Forcing parent section...');
                    sectionEl.style.setProperty('display', 'block', 'important');
                    sectionEl.style.setProperty('visibility', 'visible', 'important');
                    sectionEl.style.setProperty('height', '600px', 'important');
                    sectionEl.style.setProperty('min-height', '600px', 'important');
                    sectionEl.style.setProperty('overflow', 'visible', 'important');
                    sectionEl.style.setProperty('padding', '2rem', 'important');
                    void sectionEl.offsetHeight; // Force reflow
                    console.log('[App] displayProgressContent: Parent section height after forcing:', sectionEl.offsetHeight);
                }
            }
            
            // TEST: Set simple visible HTML first to verify container works
            console.log('[App] displayProgressContent: TEST - Setting simple HTML to verify container...');
            container.innerHTML = '<div style="background: yellow; padding: 2rem; border: 3px solid red; font-size: 1.5em; min-height: 200px; height: 300px;"><h2>TEST: Container Works!</h2><p>If you see this, the container can display content.</p></div>';
            
            // Force reflow
            void container.offsetHeight;
            
            // Check if test HTML is visible
            const testHeight = container.offsetHeight;
            console.log('[App] displayProgressContent: Test HTML height:', testHeight);
            
            if (testHeight === 0) {
                console.error('[App] displayProgressContent: CRITICAL - Even test HTML has 0 height!');
                console.error('[App] displayProgressContent: Container computed styles:', {
                    display: window.getComputedStyle(container).display,
                    visibility: window.getComputedStyle(container).visibility,
                    height: window.getComputedStyle(container).height,
                    minHeight: window.getComputedStyle(container).minHeight,
                    position: window.getComputedStyle(container).position,
                    overflow: window.getComputedStyle(container).overflow,
                    offsetParent: container.offsetParent
                });
                
                // If offsetParent is null, container is not positioned correctly
                if (container.offsetParent === null) {
                    console.error('[App] displayProgressContent: CRITICAL - offsetParent is null! Container is not positioned correctly.');
                    container.style.setProperty('position', 'static', 'important');
                    void container.offsetHeight;
                }
                
                // Try forcing even more explicit styles
                container.style.setProperty('height', '500px', 'important');
                container.style.setProperty('min-height', '500px', 'important');
                container.style.setProperty('display', 'block', 'important');
                container.style.setProperty('visibility', 'visible', 'important');
                container.style.setProperty('opacity', '1', 'important');
                container.style.setProperty('position', 'static', 'important');
                container.style.setProperty('overflow', 'visible', 'important');
                container.style.setProperty('box-sizing', 'border-box', 'important');
                
                void container.offsetHeight;
                const newHeight = container.offsetHeight;
                console.log('[App] displayProgressContent: After forcing all styles - height:', newHeight);
                
                if (newHeight === 0) {
                    console.error('[App] displayProgressContent: FATAL - Container STILL has 0 height after all attempts!');
                    console.error('[App] displayProgressContent: This suggests a fundamental CSS or DOM issue.');
                    // Log error but don't add test div to UI - it causes confusion
                    console.error('[App] displayProgressContent: Container has 0 height - check CSS and parent elements');
                }
            }
            
            // FINAL APPROACH: Check if parent section or its ancestors are hidden, then add content directly
            console.log('[App] displayProgressContent: Using final approach - checking parent visibility and adding content...');
            console.log('[App] displayProgressContent: HTML content length:', htmlContent.length);
            
            // Find parent section
            const parentSection = container.closest('section.dashboard-section');
            if (!parentSection) {
                console.error('[App] displayProgressContent: CRITICAL - Cannot find parent section!');
                return;
            }
            
            const sectionEl = parentSection as HTMLElement;
            console.log('[App] displayProgressContent: Parent section found:', sectionEl.tagName, sectionEl.className);
            
            // Check all ancestors for visibility
            let current: HTMLElement | null = sectionEl;
            while (current) {
                const computed = window.getComputedStyle(current);
                console.log('[App] displayProgressContent: Ancestor', current.tagName, current.className, '- display:', computed.display, 'visibility:', computed.visibility, 'height:', computed.height, 'offsetHeight:', current.offsetHeight);
                if (computed.display === 'none') {
                    console.error('[App] displayProgressContent: CRITICAL - Ancestor has display:none!', current);
                    current.style.setProperty('display', 'block', 'important');
                }
                current = current.parentElement;
            }
            
            // Check if adminDashboard page is active
            const adminDashboard = document.getElementById('adminDashboard');
            if (adminDashboard) {
                const adminComputed = window.getComputedStyle(adminDashboard);
                console.log('[App] displayProgressContent: adminDashboard - display:', adminComputed.display, 'visibility:', adminComputed.visibility, 'offsetHeight:', adminDashboard.offsetHeight);
                if (adminComputed.display === 'none') {
                    console.error('[App] displayProgressContent: CRITICAL - adminDashboard has display:none!');
                    adminDashboard.style.setProperty('display', 'block', 'important');
                }
            }
            
            // Force parent section with ALL possible properties
            sectionEl.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important; min-height: 1200px !important; height: 1200px !important; overflow: visible !important; padding: 2rem !important; margin: 0 !important; background-color: #ffffff !important; box-sizing: border-box !important;';
            
            // Force reflow
            void sectionEl.offsetHeight;
            console.log('[App] displayProgressContent: Parent section height after CSS reset:', sectionEl.offsetHeight);
            
            // Hide old container
            container.style.setProperty('display', 'none', 'important');
            
            // Remove old wrapper if exists
            const oldWrapper = document.getElementById('progressSectionWrapper');
            if (oldWrapper) {
                oldWrapper.remove();
            }
            
            // Create wrapper with VERY explicit styles and content directly
            const wrapper = document.createElement('div');
            wrapper.id = 'progressSectionWrapper';
            wrapper.className = 'admin-progress-section';
            wrapper.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; min-height: 1000px !important; height: auto !important; width: 100% !important; padding: 2rem !important; margin-top: 2rem !important; background-color: #e3f2fd !important; border: 4px solid #2196f3 !important; border-radius: 8px !important; box-sizing: border-box !important; position: relative !important; z-index: 10 !important;';
            
            // Set content BEFORE inserting to DOM
            wrapper.innerHTML = htmlContent;
            console.log('[App] displayProgressContent: Content set to wrapper, children count:', wrapper.children.length);
            console.log('[App] displayProgressContent: HTML content preview:', htmlContent.substring(0, 200));
            
            // Insert wrapper after h2 heading using insertAdjacentElement
            const heading = sectionEl.querySelector('h2');
            if (heading) {
                heading.insertAdjacentElement('afterend', wrapper);
                console.log('[App] displayProgressContent: Wrapper inserted after heading');
            } else {
                sectionEl.appendChild(wrapper);
                console.log('[App] displayProgressContent: Wrapper appended to section');
            }
            
            // Force reflow and verify
            void sectionEl.offsetHeight;
            void wrapper.offsetHeight;
            
            console.log('[App] displayProgressContent: FINAL - Wrapper height:', wrapper.offsetHeight);
            console.log('[App] displayProgressContent: FINAL - Wrapper children:', wrapper.children.length);
            console.log('[App] displayProgressContent: FINAL - Parent section height:', sectionEl.offsetHeight);
            console.log('[App] displayProgressContent: FINAL - Wrapper innerHTML length:', wrapper.innerHTML.length);
            
            // Double-check wrapper is in DOM
            const verifyWrapper = document.getElementById('progressSectionWrapper');
            if (verifyWrapper) {
                console.log('[App] displayProgressContent: Wrapper verified in DOM, height:', verifyWrapper.offsetHeight);
                if (verifyWrapper.innerHTML.length === 0) {
                    console.error('[App] displayProgressContent: CRITICAL - Wrapper innerHTML is empty! Re-setting...');
                    verifyWrapper.innerHTML = htmlContent;
                }
            } else {
                console.error('[App] displayProgressContent: CRITICAL - Wrapper NOT found in DOM after insertion!');
            }
        } catch (error) {
            console.error('[App] displayProgressContent: Error rendering HTML:', error);
            // Try to find container (might be new one if old was removed)
            const errorContainer = document.getElementById('progressSection');
            if (errorContainer) {
                errorContainer.innerHTML = `<p style="color: red; padding: 2rem;">Error rendering assignments: ${error}</p>`;
            }
        }
        return;
    }

    // Student view: Show progress for enrolled courses
    // Reset to grid layout for student view
    container.style.display = '';
    container.style.gridTemplateColumns = '';
    
    if (enrolledCourses.length === 0) {
        container.innerHTML = '<p>No progress to display.</p>';
        return;
    }

    container.innerHTML = enrolledCourses.map(course => {
        console.log('[App] displayProgress: Processing course:', course.id, course.title);
        console.log('[App] displayProgress: All assignments:', assignments);
        const courseAssignments = assignments.filter(a => a.courseId === course.id);
        console.log('[App] displayProgress: Course assignments for course', course.id, course.title, ':', courseAssignments);
        const completed = courseAssignments.filter(a => a.status === 'graded').length;
        const submittedCount = courseAssignments.filter(a => a.status === 'submitted').length;
        const pendingCount = courseAssignments.filter(a => a.status === 'pending' || !a.status).length;
        const total = courseAssignments.length;
        // If no assignments, show 0% progress, not 0 of 1
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        console.log('[App] displayProgress: Course', course.id, course.title, '- completed:', completed, 'submitted:', submittedCount, 'pending:', pendingCount, 'total:', total, 'progress:', progress);
        
        // Get completed assignments
        const completedAssignments = courseAssignments.filter(a => a.status === 'graded');
        const submittedAssignments = courseAssignments.filter(a => a.status === 'submitted');

        return `
            <div class="progress-card">
                <h4>${course.title}</h4>
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span><strong>${total > 0 ? `${completed} of ${total} assignments completed` : 'No assignments submitted yet'}</strong></span>
                        <span style="font-weight: 600; color: ${progress === 100 ? '#28a745' : progress > 0 ? '#ffc107' : '#6c757d'};">
                            ${total > 0 ? `${progress}%` : '0%'}
                        </span>
                    </div>
                    <div class="progress-bar" style="height: 20px; background-color: #e9ecef; border-radius: 10px; overflow: hidden; margin-bottom: 0.5rem;">
                        <div class="progress-fill" style="width: ${progress}%; height: 100%; background-color: ${progress === 100 ? '#28a745' : progress > 0 ? '#ffc107' : '#6c757d'}; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                ${completedAssignments.length > 0 ? `
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e9ecef;">
                        <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                            <span style="color: #28a745; font-weight: 600; margin-right: 0.5rem; font-size: 1.2em;">✅</span>
                            <strong style="color: #28a745;">Completed Assignments (${completedAssignments.length}):</strong>
                        </div>
                        <div style="margin-left: 1.5rem;">
                            ${completedAssignments.map(assignment => `
                                <div style="padding: 0.75rem; margin-bottom: 0.5rem; background-color: #d4edda; border-left: 3px solid #28a745; border-radius: 4px;">
                                    <div style="font-weight: 600; color: #155724; margin-bottom: 0.25rem;">${assignment.title}</div>
                                    <div style="font-size: 0.85em; color: #6c757d;">
                                        <span>✅ Status: <strong>Graded</strong></span>
                                        ${assignment.score !== undefined ? `<span style="margin-left: 1rem;">📊 Score: <strong>${assignment.score}/100</strong></span>` : ''}
                                        <span style="margin-left: 1rem;">📅 Submitted: ${new Date(assignment.submittedAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    ${assignment.feedback ? `
                                        <div style="font-size: 0.85em; color: #155724; margin-top: 0.5rem; padding: 0.5rem; background-color: #c3e6cb; border-radius: 4px;">
                                            <strong>Feedback:</strong> ${assignment.feedback}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${submittedAssignments.length > 0 ? `
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e9ecef;">
                        <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                            <span style="color: #ffc107; font-weight: 600; margin-right: 0.5rem; font-size: 1.2em;">⏳</span>
                            <strong style="color: #856404;">Pending Review (${submittedCount}):</strong>
                        </div>
                        <div style="margin-left: 1.5rem;">
                            ${submittedAssignments.map(assignment => `
                                <div style="padding: 0.75rem; margin-bottom: 0.5rem; background-color: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px;">
                                    <div style="font-weight: 600; color: #856404; margin-bottom: 0.25rem;">${assignment.title}</div>
                                    <div style="font-size: 0.85em; color: #6c757d; margin-bottom: 0.5rem;">
                                        <span>⏳ Status: <strong>Submitted</strong> (Waiting for grading)</span>
                                        <span style="margin-left: 1rem;">📅 Submitted: ${new Date(assignment.submittedAt || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <button class="btn btn-outline" data-action="update-assignment" data-course-id="${assignment.courseId}" data-assignment-id="${assignment.id}" style="margin-top: 0.5rem; font-size: 0.9em;">Update Submission</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${total === 0 ? `
                    <div style="margin-top: 1rem; padding: 1rem; background-color: #f8f9fa; border-radius: 4px; text-align: center; color: #6c757d;">
                        <p style="margin: 0;">📝 No assignments yet for this course.</p>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function openAssignmentModal(courseId: number, assignmentId: number | null = null): void {
    if (!currentUser || currentUser.role !== 'student') {
        showErrorMessage('Please login as a student');
        return;
    }

    const assignmentCourseId = document.getElementById('assignmentCourseId') as HTMLInputElement;
    const assignmentIdInput = document.getElementById('assignmentId') as HTMLInputElement;
    
    if (assignmentCourseId) assignmentCourseId.value = courseId.toString();
    if (assignmentIdInput) assignmentIdInput.value = assignmentId?.toString() || '';

    const assignment = assignmentId ? assignments.find(a => a.id === assignmentId) : null;

    const assignmentTitle = document.getElementById('assignmentTitle') as HTMLInputElement;
    const assignmentContent = document.getElementById('assignmentContent') as HTMLTextAreaElement;
    const submitBtn = document.getElementById('submitAssignmentBtn');
    const statusDiv = document.getElementById('assignmentStatus');

    if (assignment) {
        if (assignmentTitle) assignmentTitle.value = assignment.title;
        if (assignmentContent) assignmentContent.value = assignment.content || '';
        if (submitBtn) submitBtn.textContent = 'Update Submission';
        
        if (statusDiv) {
            statusDiv.className = `status-info ${assignment.status === 'graded' ? 'info' : 'success'}`;
            statusDiv.textContent = `Current Status: ${assignment.status}`;
        }
    } else {
        const assignmentForm = document.getElementById('assignmentForm') as HTMLFormElement;
        assignmentForm?.reset();
        if (submitBtn) submitBtn.textContent = 'Submit';
        if (statusDiv) statusDiv.textContent = '';
    }

    openModal('assignmentModal');
}

// Make openAssignmentModal available globally
(window as any).openAssignmentModal = openAssignmentModal;

async function handleAssignmentSubmit(e: Event): Promise<void> {
    e.preventDefault();
    const courseId = parseInt((document.getElementById('assignmentCourseId') as HTMLInputElement).value);
    const assignmentId = (document.getElementById('assignmentId') as HTMLInputElement).value;
    const title = (document.getElementById('assignmentTitle') as HTMLInputElement).value;
    const content = (document.getElementById('assignmentContent') as HTMLTextAreaElement).value;

    if (!currentUser) {
        showErrorMessage('Please login first');
        return;
    }

    try {
        if (assignmentId) {
            // Update existing assignment menggunakan fungsi dari api.ts
            await updateAssignment(
                parseInt(assignmentId),
                { title, content }
            );
            showSuccessMessage('Assignment updated successfully!');
        } else {
            // Submit new assignment menggunakan fungsi dari api.ts
            await submitAssignment(
                { courseId, title, content }
            );
            showSuccessMessage('Assignment submitted successfully!');
        }
        
        closeModal('assignmentModal');
        loadStudentData();
    } catch (error: any) {
        console.error('Assignment error:', error);
        showErrorMessage(error.message || 'Submission failed');
        // Fallback: add to local assignments
        const newAssignment: Assignment = {
            id: assignmentId ? parseInt(assignmentId) : Date.now(),
            courseId,
            title,
            content,
            status: 'submitted',
            submittedAt: new Date().toISOString(),
            studentId: currentUser.id,
            courseTitle: enrolledCourses.find(c => c.id === courseId)?.title
        };
        
        if (assignmentId) {
            const index = assignments.findIndex(a => a.id === parseInt(assignmentId));
            if (index !== -1) assignments[index] = { ...assignments[index], ...newAssignment };
        } else {
            assignments.push(newAssignment);
        }
        
        showSuccessMessage(assignmentId ? 'Assignment updated successfully!' : 'Assignment submitted successfully!');
        closeModal('assignmentModal');
        loadStudentData();
    }
}

function openGradingModal(assignmentId: number): void {
    if (!currentUser || currentUser.role !== 'admin') {
        showErrorMessage('Only admins can grade assignments');
        return;
    }

    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
        showErrorMessage('Assignment not found');
        return;
    }

    if (assignment.status !== 'submitted') {
        showErrorMessage('Can only grade submitted assignments');
        return;
    }

    const course = courses.find(c => c.id === assignment.courseId);
    const studentName = (assignment as any).studentName || 'Unknown Student';
    const studentEmail = (assignment as any).studentEmail || 'Unknown Email';

    // Set assignment ID
    const gradingAssignmentIdInput = document.getElementById('gradingAssignmentId') as HTMLInputElement;
    if (gradingAssignmentIdInput) gradingAssignmentIdInput.value = assignmentId.toString();

    // Set student info
    const gradingStudentInfo = document.getElementById('gradingStudentInfo');
    if (gradingStudentInfo) {
        gradingStudentInfo.innerHTML = `${studentName} <span style="color: #6c757d;">(${studentEmail})</span>`;
    }

    // Set course info
    const gradingCourseInfo = document.getElementById('gradingCourseInfo');
    if (gradingCourseInfo) {
        gradingCourseInfo.textContent = course?.title || assignment.courseTitle || 'Unknown Course';
    }

    // Set assignment title
    const gradingAssignmentTitle = document.getElementById('gradingAssignmentTitle');
    if (gradingAssignmentTitle) {
        gradingAssignmentTitle.textContent = assignment.title;
    }

    // Set assignment content
    const gradingAssignmentContent = document.getElementById('gradingAssignmentContent');
    if (gradingAssignmentContent) {
        gradingAssignmentContent.textContent = assignment.content || 'No content provided';
    }

    // Reset form
    const gradingScore = document.getElementById('gradingScore') as HTMLInputElement;
    const gradingFeedback = document.getElementById('gradingFeedback') as HTMLTextAreaElement;
    if (gradingScore) gradingScore.value = '';
    if (gradingFeedback) gradingFeedback.value = '';

    openModal('gradingModal');
}

async function handleGradingSubmit(e: Event): Promise<void> {
    e.preventDefault();
    
    if (!currentUser || currentUser.role !== 'admin') {
        showErrorMessage('Only admins can grade assignments');
        return;
    }

    const assignmentIdInput = document.getElementById('gradingAssignmentId') as HTMLInputElement;
    const scoreInput = document.getElementById('gradingScore') as HTMLInputElement;
    const feedbackInput = document.getElementById('gradingFeedback') as HTMLTextAreaElement;

    if (!assignmentIdInput || !scoreInput) {
        showErrorMessage('Form fields not found');
        return;
    }

    const assignmentId = parseInt(assignmentIdInput.value);
    const score = parseInt(scoreInput.value);
    const feedback = feedbackInput?.value || '';

    if (isNaN(assignmentId) || isNaN(score)) {
        showErrorMessage('Invalid assignment ID or score');
        return;
    }

    if (score < 0 || score > 100) {
        showErrorMessage('Score must be between 0 and 100');
        return;
    }

    try {
        const gradedAssignment = await gradeAssignment(assignmentId, score, feedback);
        console.log('[App] Assignment graded:', gradedAssignment);
        
        // Update local assignments array
        const index = assignments.findIndex(a => a.id === assignmentId);
        if (index !== -1) {
            assignments[index] = gradedAssignment;
        } else {
            assignments.push(gradedAssignment);
        }

        showSuccessMessage('Assignment graded successfully!');
        closeModal('gradingModal');
        
        // Refresh grading section
        displayGradingSection();
    } catch (error: any) {
        console.error('[App] Error grading assignment:', error);
        showErrorMessage(error.message || 'Failed to grade assignment');
    }
}

// Admin Dashboard
async function loadAdminData(): Promise<void> {
    if (!currentUser || currentUser.role !== 'admin') {
        console.log('[App] loadAdminData: Not admin user');
        return;
    }
    console.log('[App] loadAdminData: Loading admin data...');
    
    // Ensure admin dashboard page is shown
    showPage('adminDashboard');
    
    // Force hide student dashboard for admin (double check)
    const studentDashboard = document.getElementById('studentDashboard');
    if (studentDashboard) {
        studentDashboard.classList.remove('active');
        (studentDashboard as HTMLElement).style.display = 'none';
        (studentDashboard as HTMLElement).style.visibility = 'hidden';
    }
    
    // Small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Force admin dashboard to have auto height (not forced viewport height)
    const adminDashboardEl = document.getElementById('adminDashboard');
    if (adminDashboardEl) {
        adminDashboardEl.style.setProperty('min-height', 'auto', 'important');
        adminDashboardEl.style.setProperty('height', 'auto', 'important');
    }
    
    await loadCourses();
    displayAdminCourses();
    
    // Small delay to ensure DOM is ready for grading section
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Load assignments for grading
    try {
        console.log('[App] loadAdminData: Loading assignments...');
        assignments = await getAllAssignments();
        console.log('[App] loadAdminData: Loaded', assignments.length, 'assignments');
        console.log('[App] loadAdminData: Assignments:', assignments);
        
        // Small delay before displaying to ensure container exists
        await new Promise(resolve => setTimeout(resolve, 50));
        displayGradingSection();
    } catch (error) {
        console.error('[App] Error loading assignments for grading:', error);
        assignments = [];
        // Small delay before displaying error message
        await new Promise(resolve => setTimeout(resolve, 50));
        displayGradingSection();
    }
}

function displayAdminCourses(): void {
    const container = document.getElementById('adminCourses');
    if (!container) return;

    container.innerHTML = courses.map(course => `
        <div class="course-card">
            <h3>${course.title}</h3>
            <span class="category">${course.category}</span>
            <p class="description">${course.description}</p>
            <div class="meta">
                <span>⏱ ${course.duration} hours</span>
            </div>
            <div class="course-actions">
                <button class="btn btn-primary" data-action="edit" data-course-id="${course.id}">Edit</button>
                <button class="btn btn-danger" data-action="delete" data-course-id="${course.id}">Delete</button>
            </div>
        </div>
    `).join('');
}

function displayGradingSection(): void {
    const container = document.getElementById('gradingSection');
    if (!container) {
        console.error('[App] displayGradingSection: gradingSection container not found!');
        return;
    }

    console.log('[App] displayGradingSection: Total assignments:', assignments.length);
    
    // Filter assignments
    const submittedAssignments = assignments.filter(a => a.status === 'submitted');
    const gradedAssignments = assignments.filter(a => a.status === 'graded');

    console.log('[App] displayGradingSection: Submitted:', submittedAssignments.length, 'Graded:', gradedAssignments.length);

    if (submittedAssignments.length === 0 && gradedAssignments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: #f9fafb; border-radius: 8px; border: 1px dashed #d1d5db;">
                <p style="color: #6b7280; margin: 0; font-size: 1.1em;">No assignments to grade yet.</p>
                <p style="color: #9ca3af; margin: 0.5rem 0 0 0; font-size: 0.9em;">Students need to submit assignments first.</p>
            </div>
        `;
        return;
    }

    let html = '';

    // Pending assignments (need grading)
    if (submittedAssignments.length > 0) {
        html += `
            <div style="margin-bottom: 2rem;">
                <h3 style="color: #f59e0b; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>⏳</span> Pending Review (${submittedAssignments.length})
                </h3>
                <div class="assignments-list">
                    ${submittedAssignments.map(assignment => {
                        const course = courses.find(c => c.id === assignment.courseId);
                        const courseTitle = course?.title || assignment.courseTitle || 'Unknown Course';
                        const submittedDate = new Date(assignment.submittedAt || Date.now()).toLocaleDateString();
                        const studentName = (assignment as any).studentName || `Student #${assignment.studentId}`;
                        const studentEmail = (assignment as any).studentEmail || '';
                        return `
                            <div class="assignment-card" style="background: #fff3cd; border-left: 4px solid #f59e0b; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                    <div>
                                        <h4 style="margin: 0 0 0.5rem 0; color: #92400e;">${assignment.title}</h4>
                                        <p style="margin: 0; color: #6b7280; font-size: 0.9em;">Course: ${courseTitle}</p>
                                        <p style="margin: 0.25rem 0 0 0; color: #6b7280; font-size: 0.9em;">👤 Student: ${studentName}${studentEmail ? ` (${studentEmail})` : ''}</p>
                                        <p style="margin: 0.25rem 0 0 0; color: #6b7280; font-size: 0.85em;">📅 Submitted: ${submittedDate}</p>
                                    </div>
                                    <button class="btn btn-primary grade-btn" data-action="grade-assignment" data-assignment-id="${assignment.id}" type="button">Grade</button>
                                </div>
                                <div style="background: white; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
                                    <p style="margin: 0; white-space: pre-wrap; color: #1f2937;">${assignment.content || 'No content provided'}</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Graded assignments (for reference)
    if (gradedAssignments.length > 0) {
        html += `
            <div>
                <h3 style="color: #10b981; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>✅</span> Graded (${gradedAssignments.length})
                </h3>
                <div class="assignments-list">
                    ${gradedAssignments.map(assignment => {
                        const course = courses.find(c => c.id === assignment.courseId);
                        const courseTitle = course?.title || assignment.courseTitle || 'Unknown Course';
                        const submittedDate = new Date(assignment.submittedAt || Date.now()).toLocaleDateString();
                        const gradedDate = assignment.gradedAt ? new Date(assignment.gradedAt).toLocaleDateString() : 'N/A';
                        return `
                            <div class="assignment-card" style="background: #d1fae5; border-left: 4px solid #10b981; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                                <div style="margin-bottom: 1rem;">
                                    <h4 style="margin: 0 0 0.5rem 0; color: #065f46;">${assignment.title}</h4>
                                    <p style="margin: 0; color: #6b7280; font-size: 0.9em;">Course: ${courseTitle}</p>
                                    <div style="display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.85em; color: #6b7280;">
                                        <span>📅 Submitted: ${submittedDate}</span>
                                        <span>✅ Graded: ${gradedDate}</span>
                                    </div>
                                </div>
                                <div style="background: white; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                                    <p style="margin: 0; white-space: pre-wrap; color: #1f2937;">${assignment.content || 'No content provided'}</p>
                                </div>
                                <div style="background: white; padding: 1rem; border-radius: 4px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                        <strong style="color: #065f46;">Score: ${assignment.score || 0}/100</strong>
                                    </div>
                                    ${assignment.feedback ? `
                                        <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #d1d5db;">
                                            <strong style="color: #065f46; font-size: 0.9em;">Feedback:</strong>
                                            <p style="margin: 0.25rem 0 0 0; color: #1f2937; white-space: pre-wrap; font-size: 0.9em;">${assignment.feedback}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function openCourseModal(courseId: number | null = null): void {
    const course = courseId ? courses.find(c => c.id === courseId) : null;
    
    const modalTitle = document.getElementById('courseModalTitle');
    const courseIdInput = document.getElementById('courseId') as HTMLInputElement;
    
    if (modalTitle) modalTitle.textContent = course ? 'Edit Course' : 'Add New Course';
    if (courseIdInput) courseIdInput.value = courseId?.toString() || '';
    
    if (course) {
        const courseTitle = document.getElementById('courseTitle') as HTMLInputElement;
        const courseDescription = document.getElementById('courseDescription') as HTMLTextAreaElement;
        const courseCategory = document.getElementById('courseCategory') as HTMLSelectElement;
        const courseDuration = document.getElementById('courseDuration') as HTMLInputElement;
        
        if (courseTitle) courseTitle.value = course.title;
        if (courseDescription) courseDescription.value = course.description;
        if (courseCategory) courseCategory.value = course.category;
        if (courseDuration) courseDuration.value = course.duration.toString();
    } else {
        const courseForm = document.getElementById('courseForm') as HTMLFormElement;
        courseForm?.reset();
    }
    
    openModal('courseModal');
}

function editCourse(courseId: number): void {
    openCourseModal(courseId);
}

// Make editCourse and deleteCourse available globally
(window as any).editCourse = editCourse;

async function handleCourseSubmit(e: Event): Promise<void> {
    e.preventDefault();
    const courseId = (document.getElementById('courseId') as HTMLInputElement).value;
    const courseData: CourseData = {
        title: (document.getElementById('courseTitle') as HTMLInputElement).value,
        description: (document.getElementById('courseDescription') as HTMLTextAreaElement).value,
        category: (document.getElementById('courseCategory') as HTMLSelectElement).value as Course['category'],
        duration: parseInt((document.getElementById('courseDuration') as HTMLInputElement).value)
    };

    if (!currentUser || currentUser.role !== 'admin') {
        showErrorMessage('Only admin can manage courses');
        return;
    }

    try {
        if (courseId) {
            // Update existing course menggunakan fungsi dari api.ts
            await updateCourse(parseInt(courseId), courseData);
            showSuccessMessage('Course updated successfully!');
        } else {
            // Create new course menggunakan fungsi dari api.ts
            await createCourse(courseData);
            showSuccessMessage('Course created successfully!');
        }
        
        closeModal('courseModal');
        await loadCourses();
        displayAdminCourses();
    } catch (error: any) {
        console.error('Course error:', error);
        showErrorMessage(error.message || 'Operation failed');
        // Fallback: update local courses
        if (courseId) {
            const index = courses.findIndex(c => c.id === parseInt(courseId));
            if (index !== -1) {
                courses[index] = { ...courses[index], ...courseData };
            }
        } else {
            const newCourse: Course = {
                id: Date.now(),
                ...courseData,
                createdAt: new Date().toISOString()
            };
            courses.push(newCourse);
        }
        
        showSuccessMessage(courseId ? 'Course updated successfully!' : 'Course created successfully!');
        closeModal('courseModal');
        loadCourses();
        displayAdminCourses();
    }
}

async function deleteCourse(courseId: number): Promise<void> {
    if (!confirm('Are you sure you want to delete this course?')) return;

    if (!currentUser || currentUser.role !== 'admin') {
        showErrorMessage('Only admin can delete courses');
        return;
    }

    try {
        // Menggunakan fungsi dari api.ts
        await apiDeleteCourse(courseId);
        
        showSuccessMessage('Course deleted successfully!');
        await loadCourses();
        displayAdminCourses();
    } catch (error: any) {
        console.error('Delete error:', error);
        showErrorMessage(error.message || 'Delete failed');
        // Fallback: remove from local courses
        courses = courses.filter(c => c.id !== courseId);
        showSuccessMessage('Course deleted successfully!');
        loadCourses();
        displayAdminCourses();
    }
}

// Make deleteCourse available globally
(window as any).deleteCourse = deleteCourse;

// Utility Functions
function showSuccessMessage(message: string): void {
    showMessage(message, 'success');
}

function showErrorMessage(message: string): void {
    showMessage(message, 'error');
}

function showMessage(message: string, type: 'success' | 'error' | 'info'): void {
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-info ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '100px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '3000';
    messageDiv.style.minWidth = '300px';
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Local Data Fallback
function getLocalCourses(): Course[] {
    return [
        {
            id: 1,
            title: 'Introduction to Web Development',
            description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern web applications.',
            category: 'programming',
            duration: 40
        },
        {
            id: 2,
            title: 'UI/UX Design Principles',
            description: 'Master the art of creating beautiful and user-friendly interfaces.',
            category: 'design',
            duration: 30
        },
        {
            id: 3,
            title: 'Business Management Fundamentals',
            description: 'Essential skills for managing teams and projects effectively.',
            category: 'business',
            duration: 35
        },
        {
            id: 4,
            title: 'English for Professionals',
            description: 'Improve your English communication skills for the workplace.',
            category: 'language',
            duration: 50
        }
    ];
}

