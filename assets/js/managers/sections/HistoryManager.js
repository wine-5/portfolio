/* ===================================
   履歴ページマネージャー
   =================================== */
class HistoryManager {
    constructor() {
        this.timelineContainer = null;
    }

    init() {
        console.log('HistoryManager: Initializing...');
        console.log('HistoryManager: Looking for element with ID "history-timeline"');
        
        this.timelineContainer = document.getElementById('history-timeline');
        console.log('HistoryManager: Timeline container found:', !!this.timelineContainer);
        
        if (!this.timelineContainer) {
            console.error('HistoryManager: Timeline container not found');
            // デバッグ用: 利用可能な要素を確認
            const allElements = document.querySelectorAll('[id]');
            console.log('Available elements with IDs:', Array.from(allElements).map(el => el.id));
            return;
        }
        
        if (typeof UPDATES_DATA === 'undefined') {
            console.error('HistoryManager: UPDATES_DATA not found');
            console.log('HistoryManager: Available global variables:', Object.keys(window));
            return;
        }
        
        console.log('HistoryManager: UPDATES_DATA found, length:', UPDATES_DATA.length);
        console.log('HistoryManager: First update:', UPDATES_DATA[0]);
        this.renderHistoryTimeline();
    }

    renderHistoryTimeline() {
        try {
            console.log('HistoryManager: Rendering timeline...');
            
            // 更新履歴データを日付順（新しい順）でソート
            const sortedUpdates = [...UPDATES_DATA].sort((a, b) => new Date(b.date) - new Date(a.date));
            console.log('HistoryManager: Sorted updates:', sortedUpdates.length);
            
            const timelineHTML = sortedUpdates.map((update, index) => {
                const formattedDate = this.formatDate(update.date);
                console.log(`HistoryManager: Processing update ${index + 1}:`, update.title);
                
                return `
                    <div class="history-item">
                        <div class="history-item__date">${formattedDate}</div>
                        <h3 class="history-item__title">${update.title}</h3>
                        <p class="history-item__description">${update.description}</p>
                    </div>
                `;
            }).join('');
            
            this.timelineContainer.innerHTML = timelineHTML;
            console.log('HistoryManager: Timeline rendered successfully');
            
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