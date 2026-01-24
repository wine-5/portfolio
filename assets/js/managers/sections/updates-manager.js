/* ===================================
   更新履歴管理クラス
   =================================== */
class UpdatesManager {
    constructor() {
        // 簡素化されたレイアウトでは更新履歴は表示しません
        this.timelineContainer = null;
        this.lastUpdatedElement = document.getElementById('last-updated-date');
        this.updates = [];
        this.isInitialized = false;
    }

    async init() {
        // updatesDataがまだロードされていない場合はロードを待つ
        if (window.updatesData && !window.updatesData.isReady()) {
            const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ja';
            await window.updatesData.load(lang);
        }
        
        // updatesDataから直接取得
        if (window.updatesData && window.updatesData.isReady()) {
            this.updates = window.updatesData.getAllUpdates();
        } else if (typeof UPDATES_DATA !== 'undefined' && UPDATES_DATA.length > 0) {
            this.updates = UPDATES_DATA;
        } else {
            // 更新データ不大5フォールバック適用
            this.updates = [
                {
                    date: '2025-10-23',
                    title: 'ポートフォリオサイト更新',
                    description: 'サイト機能の改善と新機能の実装を行いました。'
                }
            ];
        }
        
        if (!this.updates || this.updates.length === 0) {
            // 更新データ空エラーハンドリング
            return;
        }
        
        this.updateLastModifiedDate();
        this.isInitialized = true;
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
            // タイムラインコンテナ不在
            return;
        }

        try {
            const updatesHTML = this.updates.map(update => 
                this.createUpdateItem(update)
            ).join('');
            
            this.timelineContainer.innerHTML = updatesHTML;
            
        } catch (error) {
            // 更新鞶歴レンダリングエラー
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