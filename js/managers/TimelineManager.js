/* ===================================
   タイムライン管理クラス（スクロールドリブン版）
   =================================== */
class TimelineManager {
    constructor() {
        this.timelineContainer = document.getElementById('timeline-container');
        this.timelineData = window.TIMELINE_DATA || [];
        this.scrollTriggers = [];
    }

    init() {
        if (!this.timelineContainer) return;
        
        // メインページかタイムライン専用ページかを判定
        const isMainPage = document.getElementById('games') !== null;
        
        if (isMainPage) {
            this.renderSimpleTimeline();
        } else {
            // タイムライン専用ページの場合
            if (!this.timelineData.length) return;
            this.renderScrollTimeline();
            this.setupScrollTriggers();
        }
    }

    renderSimpleTimeline() {
        if (!this.timelineData.length) return;
        
        // 重要なマイルストーンのみを表示（最新4つ）
        const importantEvents = [...this.timelineData]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4);
        
        const timelineHTML = `
            <div class="simple-timeline">
                ${importantEvents.map((item, index) => this.createSimpleTimelineItem(item, index)).join('')}
            </div>
        `;
        
        this.timelineContainer.innerHTML = timelineHTML;
    }

    createSimpleTimelineItem(item, index) {
        const typeConfig = this.getProjectTypeConfig(item.type);
        
        return `
            <div class="simple-timeline-item" data-index="${index}">
                <div class="simple-timeline-icon" style="background: ${typeConfig.color};">
                    <i class="${typeConfig.icon}"></i>
                </div>
                <div class="simple-timeline-content">
                    <div class="simple-timeline-date">${this.formatDate(item.date)}</div>
                    <h4 class="simple-timeline-title">${item.title}</h4>
                    <p class="simple-timeline-description">${item.description}</p>
                    ${item.technologies ? `
                        <div class="simple-timeline-technologies">
                            ${item.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderScrollTimeline() {
        const sortedData = [...this.timelineData].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const timelineHTML = `
            <div class="scroll-timeline">
                <!-- プログレスライン -->
                <div class="timeline-progress-line">
                    <div class="timeline-progress-fill" id="timeline-progress"></div>
                </div>
                
                <!-- タイムラインアイテム -->
                ${sortedData.map((item, index) => this.createScrollTimelineItem(item, index)).join('')}
            </div>
        `;
        
        this.timelineContainer.innerHTML = timelineHTML;
    }

    createScrollTimelineItem(item, index) {
        const isLeft = index % 2 === 0;
        const typeConfig = this.getProjectTypeConfig(item.type);
        
        return `
            <div class="scroll-timeline-item ${isLeft ? 'scroll-timeline-item--left' : 'scroll-timeline-item--right'}" 
                 data-index="${index}">
                
                <!-- ノード -->
                <div class="scroll-timeline-node" 
                     style="background: ${typeConfig.color}; border-color: ${typeConfig.color};">
                    <i class="${typeConfig.icon}"></i>
                    <div class="timeline-node-pulse" style="background: ${typeConfig.color}"></div>
                </div>
                
                <!-- カード -->
                <div class="scroll-timeline-card">
                    <div class="timeline-card-content">
                        <div class="timeline-card__header">
                            <h3 class="timeline-card__title">${item.title}</h3>
                            <div class="timeline-card__date">
                                <i class="fas fa-calendar"></i>
                                ${this.formatDate(item.date)}
                            </div>
                        </div>
                        
                        <div class="timeline-card__body">
                            <p class="timeline-card__description">${item.description}</p>
                            
                            ${item.technologies && item.technologies.length ? `
                                <div class="timeline-card__tech">
                                    ${item.technologies.map(tech => 
                                        `<span class="tech-tag" style="border-color: ${typeConfig.color}; color: ${typeConfig.color};">${tech}</span>`
                                    ).join('')}
                                </div>
                            ` : ''}
                            
                            <div class="timeline-card__details">
                                ${item.achievement ? `
                                    <div class="timeline-detail timeline-detail--award">
                                        <i class="fas fa-trophy"></i>
                                        <span>${item.achievement}</span>
                                    </div>
                                ` : ''}
                                
                                ${item.duration ? `
                                    <div class="timeline-detail timeline-detail--duration">
                                        <i class="fas fa-clock"></i>
                                        <span>${this.formatDuration(item.duration)}</span>
                                    </div>
                                ` : ''}
                                
                                ${item.status ? `
                                    <div class="timeline-detail timeline-detail--status">
                                        <i class="fas fa-info-circle"></i>
                                        <span>${item.status}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- カード装飾 -->
                    <div class="timeline-card-decoration" style="background: ${typeConfig.color}"></div>
                </div>
            </div>
        `;
    }

    setupScrollTriggers() {
        // プログレスラインの更新
        this.setupProgressLine();
        
        // アイテムのアニメーション
        this.setupItemAnimations();
        
        // スクロールイベント
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // 初期表示
        this.handleScroll();
    }

    setupProgressLine() {
        this.progressLine = document.getElementById('timeline-progress');
        this.timelineElement = document.querySelector('.scroll-timeline');
    }

    setupItemAnimations() {
        this.timelineItems = document.querySelectorAll('.scroll-timeline-item');
        
        // Intersection Observer を使用してアニメーション制御
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-100px 0px -100px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('scroll-timeline-item--visible');
                    
                    // ノードのアニメーション
                    const node = entry.target.querySelector('.scroll-timeline-node');
                    const pulse = entry.target.querySelector('.timeline-node-pulse');
                    
                    setTimeout(() => {
                        node.classList.add('node-activated');
                        pulse.classList.add('pulse-animation');
                    }, 200);
                }
            });
        }, observerOptions);
        
        this.timelineItems.forEach(item => {
            this.observer.observe(item);
        });
    }

    handleScroll() {
        if (!this.timelineElement || !this.progressLine) return;
        
        const timelineRect = this.timelineElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // プログレスラインの更新
        const timelineStart = timelineRect.top + window.pageYOffset;
        const timelineHeight = this.timelineElement.offsetHeight;
        const scrollProgress = Math.max(0, Math.min(1, 
            (window.pageYOffset - timelineStart + windowHeight * 0.5) / timelineHeight
        ));
        
        this.progressLine.style.height = `${scrollProgress * 100}%`;
        
        // パララックス効果（軽微）
        this.timelineItems.forEach((item, index) => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.top + itemRect.height / 2;
            const distanceFromCenter = (windowHeight / 2) - itemCenter;
            const parallaxOffset = distanceFromCenter * 0.05; // 軽微なパララックス
            
            item.style.transform = `translateY(${parallaxOffset}px)`;
        });
    }

    getProjectTypeConfig(type) {
        const configs = {
            milestone: { 
                color: '#10b981', 
                icon: 'fas fa-flag',
                label: '入学'
            },
            game: { 
                color: '#6366f1', 
                icon: 'fas fa-gamepad',
                label: 'ゲーム'
            },
            web: { 
                color: '#06b6d4', 
                icon: 'fas fa-code',
                label: 'ウェブ'
            },
            award: { 
                color: '#f59e0b', 
                icon: 'fas fa-trophy',
                label: '受賞'
            },
            jam: {
                color: '#ec4899',
                icon: 'fas fa-bolt',
                label: 'ゲームジャム'
            }
        };
        
        return configs[type] || { color: '#8b5cf6', icon: 'fas fa-star', label: 'プロジェクト' };
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short'
        });
    }

    formatDuration(days) {
        if (days < 7) return `${days}日`;
        if (days < 30) return `${Math.round(days / 7)}週間`;
        if (days < 365) return `${Math.round(days / 30)}ヶ月`;
        return `${Math.round(days / 365)}年`;
    }
}