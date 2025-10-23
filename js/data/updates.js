class UpdatesData {
    constructor() {
        this.updatesData = null;
        this.isLoaded = false;
    }

    async load(lang = 'ja') {
        if (this.isLoaded) return this.updatesData;

        try {
            const response = await fetch(`json/locales/${lang}/updates.json`);
            if (!response.ok) {
                throw new Error(`Failed to load updates: ${response.status}`);
            }
            this.updatesData = await response.json();
            this.isLoaded = true;
            console.log('Updates loaded:', this.updatesData.length, 'items');
            return this.updatesData;
        } catch (error) {
            console.error('Error loading updates:', error);
            this.updatesData = [];
            this.isLoaded = true;
            return this.updatesData;
        }
    }

    getAllUpdates() {
        return this.updatesData || [];
    }

    getRecentUpdates(count = 5) {
        if (!this.updatesData) return [];
        return this.updatesData.slice(0, count);
    }

    isReady() {
        return this.isLoaded;
    }
}

const updatesData = new UpdatesData();
window.updatesData = updatesData;

// UPDATES_DATAは動的に取得されるように変更
Object.defineProperty(window, 'UPDATES_DATA', {
    get() {
        return updatesData.getAllUpdates();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = updatesData;
}
