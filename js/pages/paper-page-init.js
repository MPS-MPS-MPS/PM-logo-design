import { PaperSearch } from '../paper-search.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        new PaperSearch();
        console.log('PaperSearch initialized successfully');
    } catch (error) {
        console.error('Failed to initialize PaperSearch:', error);
    }
});
