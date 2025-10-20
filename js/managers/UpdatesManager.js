/* ===================================
   更新履歴管理クラス
   =================================== */
class UpdatesManager {
    constructor() {
        this.timelineContainer = document.getElementById('updates-timeline');
        this.lastUpdatedElement = document.getElementById('last-updated-date');
        this.updates = UPDATES_DATA; // 外部データを参照
    }

    init() {
        this.updateLastModifiedDate();
        this.renderUpdateHistory();
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
        if (!this.timelineContainer) return;

        this.timelineContainer.innerHTML = this.updates.map(update => 
            this.createUpdateItem(update)
        ).join('');
    }

    createUpdateItem(update) {
        const date = new Date(update.date);
        const formattedDate = date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        return `
            <div class="update-item fade-in">
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