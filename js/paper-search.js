import { crossrefClient } from './api/crossref-client.js';
import { debounce } from './utils/debounce.js';

class PaperSearch {
    constructor() {
        console.log('Initializing PaperSearch...');
        this.searchInput = document.getElementById('search-bar');
        this.resultsContainer = document.querySelector('.results-container');
        this.isLoading = false;
        
        if (!this.searchInput || !this.resultsContainer) {
            console.error('Required elements not found');
            return;
        }
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Debounced search handler
        this.searchInput.addEventListener('input', 
            debounce(async (e) => this.handleSearch(e), 500)
        );

        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && 
                !this.resultsContainer.contains(e.target)) {
                this.hideResults();
            }
        });

        // Handle result selection
        this.resultsContainer.addEventListener('click', (e) => {
            const resultItem = e.target.closest('.result-item');
            if (resultItem) {
                const doi = resultItem.dataset.doi;
                if (doi) {
                    window.location.href = `/pages/paper-detail.html?doi=${encodeURIComponent(doi)}`;
                }
            }
        });
    }

    async handleSearch(event) {
        const query = this.searchInput.value.trim();
        
        if (query.length < 3) {
            this.hideResults();
            return;
        }

        try {
            this.showLoading();
            
            const { items, total } = await crossrefClient.searchPapers(query, {
                rows: 10,
                sort: 'relevance',
                order: 'desc'
            });

            this.displayResults(items, total);

        } catch (error) {
            console.error('Search error:', error);
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    displayResults(items, total) {
        if (!items.length) {
            this.resultsContainer.innerHTML = '<div class="no-results">No papers found</div>';
            this.showResults();
            return;
        }

        this.resultsContainer.innerHTML = items.map(paper => `
            <a href="/pages/paper-detail.html?doi=${encodeURIComponent(paper.doi)}" 
               class="result-item">
                <h3>${paper.title}</h3>
                <p class="authors">${paper.authors.map(a => a.name).join(', ')}</p>
                <div class="meta">
                    <span class="year">${paper.published || 'N/A'}</span>
                    <span class="citations">${paper.citations} citations</span>
                </div>
            </a>
        `).join('');

        this.showResults();
    }

    showLoading() {
        this.isLoading = true;
        this.searchInput.classList.add('loading');
        this.resultsContainer.innerHTML = `
            <div class="loading-results">
                <div class="spinner"></div>
                <span>Searching...</span>
            </div>
        `;
        this.showResults();
    }

    hideLoading() {
        this.isLoading = false;
        this.searchInput.classList.remove('loading');
    }

    showError(message) {
        this.resultsContainer.innerHTML = `
            <div class="error-message">
                ${message || 'An error occurred while searching'}
            </div>
        `;
        this.showResults();
    }

    showResults() {
        this.resultsContainer.style.display = 'block';
    }

    hideResults() {
        this.resultsContainer.style.display = 'none';
    }
}

// Export the class
export { PaperSearch };