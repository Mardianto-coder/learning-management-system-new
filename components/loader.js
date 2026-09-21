/**
 * Component Loader
 * Loads HTML components dynamically into the main page
 */

console.log('[Loader] loader.js script loaded!');

async function loadComponent(componentName, insertPosition = 'beforeend') {
    try {
        const response = await fetch(`components/${componentName}.html`);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${componentName}`);
        }
        const html = await response.text();
        const body = document.body;
        if (body) {
            body.insertAdjacentHTML(insertPosition, html);
        } else {
            console.error('Body element not found');
        }
    } catch (error) {
        console.error(`Error loading component ${componentName}:`, error);
    }
}

// Function to load all components
async function loadAllComponents() {
    console.log('[Loader] Starting to load components...');
    
    // Load navbar first (at the beginning of body)
    console.log('[Loader] Loading navbar...');
    await loadComponent('navbar', 'afterbegin');
    
    // Load auth modal
    console.log('[Loader] Loading auth modal...');
    await loadComponent('auth-modal');
    
    // Load pages
    console.log('[Loader] Loading pages...');
    await loadComponent('home-page');
    await loadComponent('courses-page');
    await loadComponent('student-dashboard');
    await loadComponent('admin-dashboard');
    
    // Load modals
    console.log('[Loader] Loading modals...');
    await loadComponent('modals');
    
    // Wait a bit to ensure DOM is fully updated
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verify critical elements exist before dispatching event
    const homeLink = document.getElementById('homeLink');
    const homePage = document.getElementById('homePage');
    
    console.log('[Loader] Verification - homeLink:', !!homeLink, 'homePage:', !!homePage);
    
    if (homeLink && homePage) {
        console.log('[Loader] All components loaded successfully! Dispatching componentsLoaded event...');
        // Dispatch custom event to signal that components are loaded
        window.dispatchEvent(new CustomEvent('componentsLoaded'));
    } else {
        console.error('[Loader] Components failed to load properly');
        // Retry after a short delay
        setTimeout(() => {
            const retryHomeLink = document.getElementById('homeLink');
            const retryHomePage = document.getElementById('homePage');
            console.log('[Loader] Retry - homeLink:', !!retryHomeLink, 'homePage:', !!retryHomePage);
            if (retryHomeLink && retryHomePage) {
                console.log('[Loader] Components loaded on retry! Dispatching event...');
                window.dispatchEvent(new CustomEvent('componentsLoaded'));
            } else {
                console.error('[Loader] Components still not loaded after retry');
            }
        }, 200);
    }
}

// Load components when DOM is ready
console.log('[Loader] Script loaded. Document readyState:', document.readyState);

if (document.readyState === 'loading') {
    console.log('[Loader] Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[Loader] DOMContentLoaded fired, loading components...');
        loadAllComponents();
    });
} else {
    // DOM already loaded, load components immediately
    console.log('[Loader] DOM already loaded, loading components immediately...');
    loadAllComponents();
}

