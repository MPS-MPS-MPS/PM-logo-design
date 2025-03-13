class CrossRefClient {
    constructor() {
        // Required configuration
        this.baseUrl = 'https://api.crossref.org/works';
        this.email = 'matthewspiller1997@gmail.com'; // REQUIRED: Replace with real contact email
        this.appInfo = {
            name: 'PaperMate',
            version: '1.0',
            url: 'http://localhost:5501', // Update this when deployed
        };

        // Rate limiting and backoff settings
        this.minRequestInterval = 100; // Max 10 requests/second
        this.lastRequestTime = 0;
        this.consecutiveFailures = 0;
        this.maxRetries = 3;

        // Cache settings
        this.cache = new Map();
        this.cacheTimeout = 3600000; // 1 hour for search results
        this.detailCache = new Map(); // Separate cache for paper details
        this.detailCacheTimeout = 86400000; // 24 hours for paper details

        this.timeout = 10000;
    }

    async searchPapers(query, options = {}) {
        try {
            const params = new URLSearchParams({
                'query.bibliographic': query,
                rows: options.limit || 10,
                offset: options.offset || 0,
                mailto: this.email
            });

            const url = `${this.baseUrl}?${params}`;
            const data = await this.makeRequest(url);

            if (!data.message?.items) {
                throw new Error('Invalid search results received');
            }

            return {
                items: data.message.items.map(item => ({
                    title: item.title?.[0] || 'Untitled',
                    authors: (item.author || []).map(author => ({
                        name: author.given ? `${author.given} ${author.family}` : author.family || 'Unknown Author'
                    })),
                    published: item['published-print']?.['date-parts']?.[0]?.[0] || 
                              item['published-online']?.['date-parts']?.[0]?.[0] || 
                              null,
                    citations: item['is-referenced-by-count'] || 0,
                    doi: item.DOI
                })),
                total: data.message['total-results']
            };
        } catch (error) {
            console.error('Search error:', error);
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    async makeRequest(url) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': `PaperMate/1.0 (${this.email})`
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw error;
        }
    }

    async enforceRateLimit() {
        const now = Date.now();
        const elapsed = now - this.lastRequestTime;
        if (elapsed < this.minRequestInterval) {
            await new Promise(resolve => 
                setTimeout(resolve, this.minRequestInterval - elapsed)
            );
        }
        this.lastRequestTime = now;
    }

    transformResults(response) {
        if (!response?.message?.items) {
            return { items: [], total: 0 };
        }

        return {
            items: response.message.items.map(item => ({
                doi: item.DOI,
                title: item.title?.[0] || '',
                authors: (item.author || []).map(a => ({
                    name: `${a.given || ''} ${a.family || ''}`.trim(),
                    orcid: a.ORCID
                })),
                published: item['published-print']?.['date-parts']?.[0]?.[0],
                citations: item['is-referenced-by-count'] || 0,
                type: item.type
            })),
            total: response.message['total-results'] || 0
        };
    }

    sanitizeHtml(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    getFromCache(key, cacheMap = this.cache) {
        const cached = cacheMap.get(key);
        if (!cached) return null;
        
        const timeout = cacheMap === this.detailCache ? 
            this.detailCacheTimeout : this.cacheTimeout;
            
        if (Date.now() - cached.timestamp > timeout) {
            cacheMap.delete(key);
            return null;
        }
        return cached.data;
    }

    cacheResult(key, data, cacheMap = this.cache) {
        cacheMap.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    async getPaperByDOI(doi) {
        try {
            const encodedDOI = encodeURIComponent(doi);
            const url = `${this.baseUrl}/${encodedDOI}`;
            const data = await this.makeRequest(url);
            
            // Log raw data for debugging
            console.log('Raw CrossRef response:', data);

            if (!data.message) {
                throw new Error('Invalid paper data received');
            }

            const formattedData = {
                title: data.message.title?.[0] || 'Untitled',
                authors: (data.message.author || []).map(author => ({
                    name: author.given ? `${author.given} ${author.family}` : author.family || 'Unknown Author',
                    orcid: author.ORCID || null
                })),
                published: {
                    date: data.message['published-print']?.['date-parts']?.[0]?.[0] || 
                          data.message['published-online']?.['date-parts']?.[0]?.[0] || 
                          data.message['created']?.['date-parts']?.[0]?.[0] || 
                          null
                },
                'is-referenced-by-count': data.message['is-referenced-by-count'] || 0,
                'references-count': data.message['references-count'] || 0,
                abstract: data.message.abstract || null,
                url: data.message.URL || `https://doi.org/${data.message.DOI}`,
                doi: data.message.DOI
            };

            // Log formatted data for debugging
            console.log('Formatted paper data:', formattedData);
            return formattedData;
        } catch (error) {
            console.error('Error fetching paper:', error);
            throw error;
        }
    }

    transformPaperDetail(item) {
        return {
            doi: item.DOI,
            title: item.title?.[0] || 'Untitled',
            authors: (item.author || []).map(a => ({
                name: `${a.given || ''} ${a.family || ''}`.trim(),
                orcid: a.ORCID
            })),
            abstract: item.abstract || '',
            published: item['published-print']?.['date-parts']?.[0]?.[0],
            journal: item['container-title']?.[0],
            citations: item['is-referenced-by-count'] || 0,
            references: item['reference-count'] || 0,
            url: item.URL,
            type: item.type
        };
    }
}

// Export for use in modules
export const crossrefClient = new CrossRefClient(); 