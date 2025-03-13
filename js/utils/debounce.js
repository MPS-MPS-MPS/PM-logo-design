// Define the function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for ES modules
export { debounce };

// For non-module compatibility
if (typeof window !== 'undefined') {
    window.debounce = debounce;
}
