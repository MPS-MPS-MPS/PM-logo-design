class CrossrefDev {
    constructor() {
        // Access the global samplePapers array
        this.papers = window.samplePapers || [];
        console.log('Loaded sample papers:', this.papers.length);
    }

    async searchPapers(query) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Search through existing papers
        const results = this.papers.filter(paper => {
            const title = paper.message.title?.[0]?.toLowerCase() || '';
            const authors = paper.message.author?.map(a => 
                `${a.given} ${a.family}`.toLowerCase()
            ).join(' ') || '';
            
            query = query.toLowerCase();
            return title.includes(query) || authors.includes(query);
        });

        console.log(`Found ${results.length} results for "${query}"`);
        return { items: results };
    }

    async getPaperByDOI(doi) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.papers.find(paper => paper.message.DOI === doi);
    }
}

window.CrossrefDev = CrossrefDev;
