/* ===================================
   更新履歴管理クラス
   =================================== */
class UpdatesManager {
    constructor() {
        // 簡素化されたレイアウトでは更新履歴は表示しません
        this.timelineContainer = null;
        this.lastUpdatedElement = document.getElementById('last-updated-date');
        
        // データの安全な取得
        if (typeof UPDATES_DATA !== 'undefined') {
            this.updates = UPDATES_DATA;
        } else {
            console.warn('UPDATES_DATA not found, using fallback data');
            this.updates = [
                {
                    date: '2025-10-21',
                    title: 'ポートフォリオサイト更新',
                    description: 'サイト機能の改善と新機能の実装を行いました。'
                }
            ];
        }
        
        console.log('UpdatesManager constructor - Updates count:', this.updates.length);
        
        // 緊急対応: DOM読み込み完了後に再初期化を試行
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (!this.isInitialized) {
                    console.log('Forcing UpdatesManager initialization...');
                    this.forceInit();
                }
            }, 500);
        });
        
        this.isInitialized = false;
    }

    init() {
        console.log('UpdatesManager init called (simplified version)');
        console.log('Last updated element:', this.lastUpdatedElement);
        console.log('Updates data:', this.updates);
        
        if (!this.updates || this.updates.length === 0) {
            console.error('Updates data is empty');
            return;
        }
        
        console.log('Updating last modified date...');
        this.updateLastModifiedDate();
        
        console.log('UpdatesManager initialization completed');
        this.isInitialized = true;
    }

    forceInit() {
        console.log('Force initialization of UpdatesManager');
        
        // DOM要素を強制的に再取得
        this.timelineContainer = document.getElementById('updates-timeline');
        this.lastUpdatedElement = document.getElementById('last-updated-date');
        
        if (!this.timelineContainer) {
            console.error('Still cannot find updates-timeline element');
            
            // 最後の手段: 既存のHTMLコンテンツをそのまま残す
            const existingContainer = document.querySelector('.updates__timeline');
            if (existingContainer && existingContainer.innerHTML.trim() !== '') {
                console.log('Found existing HTML content, keeping it');
                return;
            }
            
            // それでもダメな場合は、手動でHTML挿入
            const updatesSection = document.querySelector('.updates__history');
            if (updatesSection) {
                console.log('Manually inserting updates HTML');
                const timelineDiv = updatesSection.querySelector('.updates__timeline') || 
                                  updatesSection.appendChild(document.createElement('div'));
                timelineDiv.className = 'updates__timeline';
                timelineDiv.id = 'updates-timeline';
                this.timelineContainer = timelineDiv;
            }
        }
        
        if (this.timelineContainer) {
            this.updateLastModifiedDate();
            this.renderUpdateHistory();
            this.isInitialized = true;
            console.log('Force initialization completed successfully');
        } else {
            console.error('Force initialization failed - no container found');
        }
    }

    updateLastModifiedDate() {
        if (!this.lastUpdatedElement || this.updates.length === 0) return;
        
        const latestUpdate = this.updates[0];
        const date = new Date(latestUpdate.date);
        const formatOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        
        this.lastUpdatedElement.textContent = date.toLocaleDateString('ja-JP', formatOptions);
    }

    renderUpdateHistory() {
        if (!this.timelineContainer) {
            console.error('Timeline container is missing, cannot render updates');
            return;
        }

        console.log('Rendering', this.updates.length, 'update items');
        
        try {
            const updatesHTML = this.updates.map(update => 
                this.createUpdateItem(update)
            ).join('');
            
            console.log('Generated updates HTML length:', updatesHTML.length);
            this.timelineContainer.innerHTML = updatesHTML;
            
            // DOM更新後にコンテナの状態を確認
            setTimeout(() => {
                console.log('Updates container after render:', this.timelineContainer.innerHTML.length > 0 ? 'Has content' : 'Empty');
            }, 100);
            
        } catch (error) {
            console.error('Error rendering update history:', error);
            this.timelineContainer.innerHTML = '<p class="update-error">更新履歴の読み込み中にエラーが発生しました。</p>';
        }
    }

    createUpdateItem(update) {
        const date = new Date(update.date);
        const formattedDate = date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        return `
            <div class="update-item">
                <div class="update-item__date">${formattedDate}</div>
                <div class="update-item__content">
                    <h4 class="update-item__title">${update.title}</h4>
                    <p class="update-item__description">${update.description}</p>
                </div>
            </div>
        `;
    }

    // 新しい更新を追加するメソッド（将来的な拡張用）
    addUpdate(update) {
        this.updates.unshift(update);
        this.updateLastModifiedDate();
        this.renderUpdateHistory();
    }
}