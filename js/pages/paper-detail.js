import { crossrefClient } from '../api/crossref-client.js';

class PaperDetail {
    constructor() {
        // Get DOI from URL parameters
        const params = new URLSearchParams(window.location.search);
        this.doi = params.get('doi');
        
        // Update selectors to match new structure
        this.paperDetails = document.querySelector('.paper-details');
        this.paperCoverSection = document.querySelector('.paper-cover-section');
        
        // Load paper details if DOI exists
        if (this.doi) {
            this.loadPaperDetails();
        }
    }

    async loadPaperDetails() {
        try {
            this.showLoading();
            const rawPaper = await crossrefClient.getPaperByDOI(this.doi);
            
            // Log the raw data to check citation structure
            console.log('Raw paper data:', rawPaper);
            
            // Ensure paper has all required properties with defaults
            const validatedPaper = {
                title: rawPaper?.title || 'Untitled Paper',
                authors: rawPaper?.authors || [],
                published: {
                    date: rawPaper?.published?.['date-parts']?.[0]?.[0] || 
                          rawPaper?.published?.date || 
                          null
                },
                metrics: {
                    citations: rawPaper['is-referenced-by-count'] || 0,
                    references: rawPaper['references-count'] || 0
                },
                abstract: rawPaper?.abstract || null,
                url: rawPaper?.url || '#'
            };

            console.log('Validated paper data:', validatedPaper);
            this.updatePageContent(validatedPaper);
        } catch (error) {
            console.error('Error loading paper:', error);
            this.showError('Failed to load paper details');
        }
    }

    updatePageContent(paper) {
        if (this.paperDetails) {
            const publishedDate = paper.published.date ? 
                paper.published.date : 
                'Date unknown';

            // Update paper details section
            this.paperDetails.innerHTML = `
                <h1 class="paper-title">${paper.title}</h1>
                <div class="paper-authors">
                    ${paper.authors.length > 0 ? 
                        `by ${paper.authors.map(author => `
                            <a href="${author.orcid || '#'}">${author.name}</a>
                        `).join(', ')}` : 
                        'Authors not available'
                    }
                </div>
                <div class="paper-meta">
                    <div class="rating-section">
                        <div class="stars">
                            <span class="star filled">★</span>
                            <span class="star filled">★</span>
                            <span class="star filled">★</span>
                            <span class="star filled">★</span>
                            <span class="star">★</span>
                        </div>
                        <span class="rating-label">PM Rating</span>
                    </div>
                    <div class="meta-info">
                        <span>Published ${publishedDate}</span>
                        <span>•</span>
                        <span>${paper.metrics.citations} Citations</span>
                    </div>
                </div>

                <div class="abstract-section">
                    <h2>Abstract</h2>
                    <p>${paper.abstract || 'N/A'}</p>
                </div>

                <div class="reviews-section">
                    <h2>Recent Reviews</h2>
                    <p class="no-reviews-message">No reviews yet. Be the first to review this paper!</p>
                </div>
            `;

            // Update cover section with consistent citation count
            if (this.paperCoverSection) {
                this.paperCoverSection.innerHTML = `
                    <img src="../assets/journ-physics.jpeg" alt="Journal Cover" class="paper-cover">
                    <div class="quick-actions">
                        <a href="${paper.url}" class="primary-btn" target="_blank">Full Text →</a>
                        <div class="quick-stats">
                            <div class="stat-item">
                                <span class="stat-value">201</span>
                                <span class="stat-label">Readers</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${paper.metrics.citations}</span>
                                <span class="stat-label">Citations</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${paper.metrics.references}</span>
                                <span class="stat-label">References</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // Remove loading state
        const container = document.querySelector('.paper-container');
        if (container) {
            container.classList.remove('loading');
        }

        // Update page title
        document.title = `${paper.title} - PaperMate`;
    }

    showLoading() {
        const container = document.querySelector('.paper-container');
        if (container) {
            container.classList.add('loading');
        }
    }

    showError(message) {
        if (this.paperDetails) {
            this.paperDetails.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                </div>
            `;
        }
        
        // Remove loading state
        const container = document.querySelector('.paper-container');
        if (container) {
            container.classList.remove('loading');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PaperDetail();
});

export { PaperDetail };