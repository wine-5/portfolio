/* ===================================
   タイムライン管理クラス
   =================================== */
class TimelineManager {
    constructor() {
        this.timelineContainer = document.getElementById('timeline-container');
        this.timelineData = TIMELINE_DATA;
        this.svgNamespace = 'http://www.w3.org/2000/svg';
    }

    init() {
        if (!this.timelineContainer) return;
        this.renderTimeline();
    }

    calculateDatePosition(dateStr) {
        const date = new Date(dateStr);
        const startDate = new Date('2024-04-01'); // 入学日
        const currentDate = new Date();
        
        const totalDuration = currentDate - startDate;
        const itemDuration = date - startDate;
        
        // 0-100%の位置で返す
        return Math.max(0, Math.min(100, (itemDuration / totalDuration) * 100));
    }

    calculateEndPosition(item) {
        if (!item.duration) return this.calculateDatePosition(item.date);
        
        const startDate = new Date(item.date);
        const endDate = new Date(startDate.getTime() + (item.duration * 24 * 60 * 60 * 1000));
        return this.calculateDatePosition(endDate.toISOString().split('T')[0]);
    }

    createTimelineItem(item, index) {
        const startPos = this.calculateDatePosition(item.date);
        const endPos = this.calculateEndPosition(item);
        const yPos = 50 + (index % 2) * 100; // 上下に交互配置
        
        const isMilestone = item.type === 'milestone';
        const hasAward = item.award;
        const hasStatus = item.status;

        return `
            <div class="timeline-item ${isMilestone ? 'timeline-item--milestone' : 'timeline-item--project'}" 
                 style="left: ${startPos}%; top: ${yPos}px;"
                 data-start="${startPos}" data-end="${endPos}">
                
                <!-- アイコンとノード -->
                <div class="timeline-node" style="background-color: ${item.color};">
                    <span class="timeline-icon">${item.icon}</span>
                </div>
                
                <!-- 期間バー（プロジェクトのみ） -->
                ${!isMilestone ? `
                    <div class="timeline-duration-bar" 
                         style="width: ${Math.max(2, endPos - startPos)}%; background-color: ${item.color};">
                    </div>
                ` : ''}
                
                <!-- カード -->
                <div class="timeline-card">
                    <div class="timeline-card__header">
                        <h4 class="timeline-card__title">${item.title}</h4>
                        <span class="timeline-card__date">${this.formatDate(item.date)}</span>
                        ${hasAward ? `<div class="timeline-card__award">🏆 ${item.award}</div>` : ''}
                        ${hasStatus ? `<div class="timeline-card__status">${item.status}</div>` : ''}
                    </div>
                    
                    <p class="timeline-card__description">${item.description}</p>
                    
                    ${item.technologies ? `
                        <div class="timeline-card__tech">
                            ${item.technologies.map(tech => 
                                `<span class="timeline-card__tech-tag">${tech}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                    
                    ${item.duration ? `
                        <div class="timeline-card__duration">
                            開発期間: ${this.formatDuration(item.duration)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    createTimelineConnections() {
        let connections = '';
        const sortedData = [...this.timelineData].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        for (let i = 0; i < sortedData.length - 1; i++) {
            const current = sortedData[i];
            const next = sortedData[i + 1];
            
            const currentPos = this.calculateEndPosition(current);
            const nextPos = this.calculateDatePosition(next.date);
            
            const currentY = 50 + (i % 2) * 100 + 25; // ノードの中心
            const nextY = 50 + ((i + 1) % 2) * 100 + 25;
            
            const width = Math.abs(nextPos - currentPos);
            const height = Math.abs(nextY - currentY);
            
            connections += `
                <svg class="timeline-connection" style="
                    left: ${currentPos}%; 
                    top: ${Math.min(currentY, nextY)}px;
                    width: ${width}%;
                    height: ${height + 4}px;
                ">
                    <path d="M 0 ${currentY < nextY ? 2 : height + 2} 
                           Q ${width * 0.3} ${currentY < nextY ? 2 : height + 2}
                           ${width * 0.7} ${currentY < nextY ? height + 2 : 2}
                           ${width} ${currentY < nextY ? height + 2 : 2}"
                          stroke="#6366f1" 
                          stroke-width="2" 
                          fill="none"
                          stroke-dasharray="5,5">
                        <animate attributeName="stroke-dashoffset" 
                                 values="10;0" 
                                 dur="2s" 
                                 repeatCount="indefinite"/>
                    </path>
                </svg>
            `;
        }
        
        return connections;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDuration(days) {
        if (days < 7) return `${days}日間`;
        if (days < 30) return `${Math.round(days / 7)}週間`;
        return `${Math.round(days / 30)}ヶ月`;
    }

    renderTimeline() {
        const sortedData = [...this.timelineData].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const timelineHTML = `
            <div class="timeline-wrapper">
                <!-- メインライン -->
                <div class="timeline-main-line"></div>
                
                <!-- 年月表示 -->
                <div class="timeline-dates">
                    <div class="timeline-date timeline-date--start">2024年4月</div>
                    <div class="timeline-date timeline-date--current">現在 (${new Date().getFullYear()}年${new Date().getMonth() + 1}月)</div>
                </div>
                
                <!-- 接続線 -->
                ${this.createTimelineConnections()}
                
                <!-- タイムラインアイテム -->
                ${sortedData.map((item, index) => this.createTimelineItem(item, index)).join('')}
            </div>
        `;
        
        this.timelineContainer.innerHTML = timelineHTML;
        
        // アニメーション適用
        setTimeout(() => {
            const items = this.timelineContainer.querySelectorAll('.timeline-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('timeline-item--visible');
                }, index * 200);
            });
        }, 300);
    }
}