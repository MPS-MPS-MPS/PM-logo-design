class PaperClient {
    constructor() {
        this.devClient = new CrossrefDev();
    }

    async searchPapers(query) {
        return this.devClient.searchPapers(query);
    }
}

// Make it available globally without using require/module.exports
window.PaperClient = PaperClient;
