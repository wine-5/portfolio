/**
 * ニュース管理クラス
 * お知らせ・メンテナンス情報・リリース情報の表示を管理
 */

class NewsManager {
    constructor() {
        this.newsData = null;
        this.isLoaded = false;
        this.currentLang = 'ja';
    }

    /**
     * ニュースデータを読み込む
     */
    async load(lang = 'ja') {
        this.currentLang = lang;
        
        try {
            const response = await fetch(`json/locales/${lang}/news.json`);
            if (!response.ok) {
                throw new Error(`Failed to load news: ${response.status}`);
            }
            this.newsData = await response.json();
            this.isLoaded = true;
            return this.newsData;
        } catch (error) {
            // ニュース読み込みエラーハンドリング
            this.newsData = [];
            this.isLoaded = true;
            return [];
        }
    }

    /**
     * 全ニュースを取得
     */
    getAllNews() {
        return this.newsData || [];
    }

    /**
     * 有効なニュースのみ取得（期限切れを除外）
     */
    getActiveNews() {
        if (!this.newsData) return [];
        
        const now = new Date();
        return this.newsData.filter(news => {
            if (!news.expireDate) return true;
            return new Date(news.expireDate) > now;
        });
    }

    /**
     * 優先度別にニュースを取得
     */
    getNewsByPriority(priority) {
        return this.getActiveNews().filter(news => news.priority === priority);
    }

    /**
     * 高優先度のニュースを取得
     */
    getHighPriorityNews() {
        return this.getNewsByPriority('high');
    }

    /**
     * タイプ別にニュースを取得
     */
    getNewsByType(type) {
        return this.getActiveNews().filter(news => news.type === type);
    }

    /**
     * バナー表示するニュースを取得
     */
    getBannerNews() {
        return this.getActiveNews()
            .filter(news => news.showBanner)
            .sort((a, b) => {
                // 優先度順: high > medium > low
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
    }

    /**
     * 最新のニュースを取得
     */
    getRecentNews(count = 5) {
        return this.getActiveNews()
            .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
            .slice(0, count);
    }

    /**
     * IDでニュースを取得
     */
    getNewsById(id) {
        if (!this.newsData) return null;
        return this.newsData.find(news => news.id === id);
    }

    /**
     * ニュースバナーを作成して表示
     */
    createBanner(containerSelector = 'body') {
        const bannerNews = this.getBannerNews();
        if (bannerNews.length === 0) return null;

        const container = document.querySelector(containerSelector);
        if (!container) return null;

        // 既存のバナーを削除
        const existingBanner = document.querySelector('.news-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        const news = bannerNews[0]; // 最優先のニュースを表示

        const banner = document.createElement('div');
        banner.className = `news-banner news-banner--${news.priority}`;
        banner.innerHTML = `
            <div class="news-banner__content">
                <span class="news-banner__icon">${news.icon}</span>
                <div class="news-banner__text">
                    <strong class="news-banner__title">${news.title}</strong>
                    <p class="news-banner__description">${news.description}</p>
                </div>
                ${news.link ? `<a href="${news.link}" class="news-banner__link">詳細 →</a>` : ''}
                <button class="news-banner__close" aria-label="閉じる">×</button>
            </div>
        `;

        // 閉じるボタンのイベント
        const closeBtn = banner.querySelector('.news-banner__close');
        closeBtn.addEventListener('click', () => {
            banner.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => banner.remove(), 300);
            
            // LocalStorageに閉じた記録を保存
            localStorage.setItem(`news-banner-closed-${news.id}`, 'true');
        });

        // 既に閉じられていないかチェック
        if (localStorage.getItem(`news-banner-closed-${news.id}`) === 'true') {
            return null;
        }

        container.insertBefore(banner, container.firstChild);
        
        // アニメーション
        setTimeout(() => {
            banner.style.animation = 'slideDown 0.3s ease-out';
        }, 100);

        return banner;
    }

    /**
     * ニュースセクションをレンダリング
     */
    renderNewsSection(containerId = 'news-section') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const news = this.getRecentNews();
        if (news.length === 0) {
            container.innerHTML = '<p class="news-empty">現在お知らせはありません</p>';
            return;
        }

        const newsHTML = news.map(item => `
            <div class="news-item news-item--${item.type}">
                <div class="news-item__header">
                    <span class="news-item__icon">${item.icon}</span>
                    <span class="news-item__type">${this.getTypeLabel(item.type)}</span>
                    <span class="news-item__priority news-item__priority--${item.priority}">
                        ${this.getPriorityLabel(item.priority)}
                    </span>
                    <time class="news-item__date">${this.formatDate(item.publishDate)}</time>
                </div>
                <h3 class="news-item__title">${item.title}</h3>
                <p class="news-item__description">${item.description}</p>
                ${item.link ? `<a href="${item.link}" class="news-item__link">詳細を見る →</a>` : ''}
            </div>
        `).join('');

        container.innerHTML = `<div class="news-grid">${newsHTML}</div>`;
    }

    /**
     * タイプラベルを取得
     */
    getTypeLabel(type) {
        const labels = {
            maintenance: 'メンテナンス',
            release: 'リリース',
            announcement: 'お知らせ'
        };
        return labels[type] || type;
    }

    /**
     * 優先度ラベルを取得
     */
    getPriorityLabel(priority) {
        const labels = {
            high: '重要',
            medium: '通常',
            low: '情報'
        };
        return labels[priority] || priority;
    }

    /**
     * 日付をフォーマット
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(this.currentLang === 'ja' ? 'ja-JP' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * データが読み込まれているかチェック
     */
    isReady() {
        return this.isLoaded;
    }
}

// グローバルインスタンス作成
const newsManager = new NewsManager();
window.newsManager = newsManager;

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsManager;
}
