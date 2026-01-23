class UpdatesData {
    constructor() {
        this.updatesData = null;
        this.isLoaded = false;
        this.currentLang = null;
        this.basePath = this.detectBasePath();
    }

    detectBasePath() {
        const path = window.location.pathname;
        if (path === '/' || path.endsWith('/index.html') || path.endsWith('/Portfolio/')) {
            return '';
        }
        if (path.includes('/pages/')) {
            return '../../';
        }
        return '';
    }

    async load(lang = 'ja') {
        // 同じ言語ならスキップ
        if (this.isLoaded && this.currentLang === lang) {
            return this.updatesData;
        }

        try {
            const response = await fetch(`${this.basePath}json/locales/${lang}/updates.json`);
            if (!response.ok) {
                throw new Error(`Failed to load updates: ${response.status}`);
            }
            this.updatesData = await response.json();
            this.isLoaded = true;
            this.currentLang = lang;
            return this.updatesData;
        } catch (error) {
            this.updatesData = [];
            this.isLoaded = true;
            this.currentLang = lang;
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
