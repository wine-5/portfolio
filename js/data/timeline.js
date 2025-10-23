class TimelineData {
    constructor() {
        this.timelineData = null;
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
            return;
        }

        try {
            const response = await fetch(`${this.basePath}json/locales/${lang}/timeline.json`);
            if (!response.ok) {
                throw new Error(`Failed to load timeline: ${response.status}`);
            }
            this.timelineData = await response.json();
            this.isLoaded = true;
            this.currentLang = lang;
        } catch (error) {
            console.error('Error loading timeline:', error);
            this.timelineData = [];
            this.isLoaded = true;
            this.currentLang = lang;
        }
    }

    getAllItems() {
        return this.timelineData || [];
    }

    getItemById(id) {
        if (!this.timelineData) return null;
        return this.timelineData.find(item => item.id === id);
    }

    getItemsByType(type) {
        if (!this.timelineData) return [];
        return this.timelineData.filter(item => item.type === type);
    }

    getProjectItems() {
        return this.getItemsByType('project');
    }

    getMilestoneItems() {
        return this.getItemsByType('milestone');
    }

    isReady() {
        return this.isLoaded;
    }
}

const timelineData = new TimelineData();
window.timelineData = timelineData;

Object.defineProperty(window, 'TIMELINE_DATA', {
    get() {
        return timelineData.getAllItems();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = timelineData;
}
