/**
 * ゲームカルーセル統合マネージャー
 * 責任: ゲームカルーセルとメインアプリケーションの統合
 * SOLID: インターフェース分離・依存性逆転
 */
class GameCarouselManager {
    constructor() {
        this.carousel = null;
        this.projectsData = null;
    }

    /**
     * 初期化
     */
    async init() {
        try {
            // ゲームデータを取得
            const games = await this.getGameData();
            
            if (games.length === 0) {
                console.warn('No games found for carousel');
                return;
            }

            // カルーセルコンテナを取得
            const container = document.querySelector('.hero__carousel-container');
            if (!container) {
                console.warn('Carousel container not found');
                return;
            }

            // カルーセルをインスタンス化
            this.carousel = new GameCarousel('.hero__carousel-container');

            // 依存オブジェクトをインジェクション
            const dependencies = {
                renderer: new GameCarouselRenderer(container, {
                    animationDuration: 600,
                    autoPlayInterval: 0,
                    perspective: 2000,
                    radiusX: 450,
                    radiusZ: 200,
                    itemSize: 140
                }),
                interaction: null, // 自動作成
                transition: null   // 自動作成
            };

            // 初期化
            this.carousel.init(games, dependencies);

            // 言語変更イベントをリッスン
            window.addEventListener('languageChanged', (e) => {
                this.onLanguageChanged(e.detail.lang);
            });

        } catch (error) {
            console.error('GameCarouselManager initialization failed:', error);
        }
    }

    /**
     * ゲームデータを取得
     * @private
     */
    async getGameData() {
        try {
            if (!window.projectsData) {
                return [];
            }

            // 言語を取得（i18nマネージャーから）
            const lang = (window.i18n && window.i18n.getCurrentLanguage) 
                ? window.i18n.getCurrentLanguage() 
                : 'ja';
            
            // データをロード
            await window.projectsData.load(lang);
            
            // すべてのプロジェクトを取得
            const allProjects = window.projectsData.getAllProjects();
            
            // ゲームカテゴリーのみをフィルター
            return allProjects.filter(project => project.category === 'game');

        } catch (error) {
            console.error('Failed to get game data:', error);
            return [];
        }
    }

    /**
     * 言語変更時の処理
     */
    async onLanguageChanged(lang) {
        try {
            const games = await this.getGameData();
            if (this.carousel && games.length > 0) {
                this.carousel.games = games;
                this.carousel.render();
            }
        } catch (error) {
            console.error('Language change handling failed:', error);
        }
    }

    /**
     * クリーンアップ
     */
    destroy() {
        if (this.carousel) {
            this.carousel.destroy();
            this.carousel = null;
        }
    }
}

// グローバルインスタンス
window.gameCarouselManager = new GameCarouselManager();
