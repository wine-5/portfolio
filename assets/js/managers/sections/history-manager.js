/* ===================================
   履歴ページマネージャー
   =================================== */
class HistoryManager {
    constructor() {
        this.timelineContainer = null;
    }

    async init() {
        this.timelineContainer = document.getElementById('history-timeline');
        
        if (!this.timelineContainer) {
            console.error('HistoryManager: Timeline container not found');
            return;
        }
        
        // updatesDataの読み込みを待つ
        if (window.updatesData) {
            if (!window.updatesData.isLoaded) {
                console.log('HistoryManager: Waiting for updates data to load...');
                const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'ja';
                await window.updatesData.load(currentLang);
            }
        } else {
            console.error('HistoryManager: updatesData object not found');
            return;
        }
        
        // UPDATES_DATAの確認
        const updates = window.UPDATES_DATA;
        if (!updates || updates.length === 0) {
            console.error('HistoryManager: No updates data available');
            return;
        }
        
        console.log('HistoryManager: Rendering timeline with', updates.length, 'updates');
        this.renderHistoryTimeline();
    }

    renderHistoryTimeline() {
        try {
            // 更新履歴データを日付順（新しい順）でソート
            const sortedUpdates = [...window.UPDATES_DATA].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            const timelineHTML = sortedUpdates.map((update) => {
                const formattedDate = this.formatDate(update.date);
                
                return `
                    <div class="history-item">
                        <div class="history-item__date">${formattedDate}</div>
                        <h3 class="history-item__title">${update.title}</h3>
                        <p class="history-item__description">${update.description}</p>
                    </div>
                `;
            }).join('');
            
            this.timelineContainer.innerHTML = timelineHTML;
            
        } catch (error) {
            console.error('HistoryManager: Error rendering timeline:', error);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}.${month}.${day}`;
    }
}