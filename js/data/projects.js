class ProjectsData {
    constructor() {
        this.projectsData = null;
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
            const response = await fetch(`${this.basePath}json/locales/${lang}/projects.json`);
            if (!response.ok) {
                throw new Error(`Failed to load projects: ${response.status}`);
            }
            this.projectsData = await response.json();
            this.isLoaded = true;
            this.currentLang = lang;
        } catch (error) {
            this.projectsData = [];
            this.isLoaded = true;
            this.currentLang = lang;
        }
    }

    getAllProjects() {
        return this.projectsData || [];
    }

    getProjectsByCategory(category) {
        if (!this.projectsData) return [];
        return this.projectsData.filter(project => project.category === category);
    }

    getProjectsByYear(year) {
        if (!this.projectsData) return [];
        return this.projectsData.filter(project => project.year === year);
    }

    getProjectById(id) {
        if (!this.projectsData) return null;
        return this.projectsData.find(project => project.id === id);
    }

    isReady() {
        return this.isLoaded;
    }
}

const projectsData = new ProjectsData();
window.projectsData = projectsData;

Object.defineProperty(window, 'PROJECTS_DATA', {
    get() {
        return projectsData.getAllProjects();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = projectsData;
}
