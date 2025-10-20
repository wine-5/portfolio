/* ===================================
   タイムライン管理クラス（スクロールドリブン版）
   =================================== */
class TimelineManager {
    constructor() {
        this.timelineContainer = document.getElementById('timeline-container');
        this.timelineData = typeof TIMELINE_DATA !== 'undefined' ? TIMELINE_DATA : [];
        this.scrollTriggers = [];
    }

    init() {
        console.log('TimelineManager init called');
        console.log('Timeline container:', this.timelineContainer);
        console.log('Timeline data length:', this.timelineData.length);
        
        if (!this.timelineContainer) {
            console.warn('Timeline container not found');
            return;
        }
        
        // メインページかタイムライン専用ページかを判定
        const isMainPage = document.getElementById('games') !== null;
        
        if (isMainPage) {
            console.log('Rendering simple timeline for main page');
            this.renderSimpleTimeline();
        } else {
            // タイムライン専用ページの場合
            if (!this.timelineData.length) return;
            this.renderScrollTimeline();
            this.setupScrollTriggers();
        }
    }

    renderSimpleTimeline() {
        console.log('renderSimpleTimeline called, data length:', this.timelineData.length);
        
        // 実際のタイムラインデータを使用し、フォールバックデータも用意
        const fallbackData = [
            {
                title: 'ElementBattle',
                description: '記念すべき初作品のカードゲーム',
                date: '2025-01-16',
                type: 'project',
                technologies: ['HTML', 'CSS', 'JavaScript']
            },
            {
                title: 'Split',
                description: '初めてのチーム開発',
                date: '2024-10-01',
                type: 'project',
                technologies: ['HTML', 'CSS', 'JavaScript', 'Git']
            },
            {
                title: 'たかし、人生ベット中',
                description: '学内ゲームジャム優勝作品',
                date: '2025-09-01',
                type: 'project',
                technologies: ['Unity', 'C#']
            },
            {
                title: '専門学校入学',
                description: 'ゲーム開発の学習を開始',
                date: '2024-04-01',
                type: 'milestone',
                technologies: []
            }
        ];
        
        const dataToUse = this.timelineData.length > 0 ? this.timelineData : fallbackData;
        console.log('Using data:', dataToUse);
        
        // 重要なマイルストーンのみを表示（最新4つ）
        const importantEvents = [...dataToUse]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4);
        
        console.log('Important events:', importantEvents);
        
        const timelineHTML = `
            <div class="simple-timeline">
                ${importantEvents.map((item, index) => this.createSimpleTimelineItem(item, index)).join('')}
            </div>
        `;
        
        console.log('Setting timeline HTML');
        this.timelineContainer.innerHTML = timelineHTML;
    }

    createSimpleTimelineItem(item, index) {
        const defaultColor = '#667eea';
        const defaultIcon = 'fas fa-gamepad';
        
        // 安全にtypeConfigを取得
        let typeConfig;
        try {
            typeConfig = this.getProjectTypeConfig(item.type);
        } catch (e) {
            typeConfig = { color: defaultColor, icon: defaultIcon };
        }
        
        // 安全に日付をフォーマット
        let formattedDate;
        try {
            formattedDate = this.formatDate(item.date);
        } catch (e) {
            formattedDate = item.date;
        }
        
        return `
            <div class="simple-timeline-item" data-index="${index}" style="--index: ${index};">
                <div class="simple-timeline-icon" style="background: ${typeConfig.color};">
                    <i class="${typeConfig.icon}"></i>
                </div>
                <div class="simple-timeline-content">
                    <div class="simple-timeline-date">${formattedDate}</div>
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
        
        // Intersection Observer を使用してアニメーション制御（改善版）
        const observerOptions = {
            threshold: [0, 0.1, 0.3, 0.5, 0.7, 1],
            rootMargin: '-50px 0px -50px 0px' // より早めにトリガー
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const item = entry.target;
                const index = parseInt(item.dataset.index);
                
                if (entry.isIntersecting) {
                    // アイテムが見えるようになったら表示
                    setTimeout(() => {
                        item.classList.add('scroll-timeline-item--visible');
                        
                        // ノードのアニメーション
                        const node = item.querySelector('.scroll-timeline-node');
                        const pulse = item.querySelector('.timeline-node-pulse');
                        
                        if (node && pulse) {
                            setTimeout(() => {
                                node.classList.add('node-activated');
                                pulse.classList.add('pulse-animation');
                            }, 300);
                        }
                    }, index * 100); // 順次表示のためのディレイ
                } else if (entry.intersectionRatio < 0.1) {
                    // 完全に見えなくなったら非表示（リセット可能）
                    item.classList.remove('scroll-timeline-item--visible');
                    
                    const node = item.querySelector('.scroll-timeline-node');
                    const pulse = item.querySelector('.timeline-node-pulse');
                    
                    if (node && pulse) {
                        node.classList.remove('node-activated');
                        pulse.classList.remove('pulse-animation');
                    }
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
        const timelineStart = timelineRect.top + window.pageYOffset;
        const timelineHeight = this.timelineElement.offsetHeight;
        
        // タイムライン全体の表示状況を計算
        const viewportTop = window.pageYOffset;
        const viewportBottom = viewportTop + windowHeight;
        const timelineTop = timelineStart;
        const timelineBottom = timelineStart + timelineHeight;
        
        // プログレスラインの更新（改善版）
        let scrollProgress = 0;
        
        if (viewportTop >= timelineTop - windowHeight * 0.5 && viewportTop <= timelineBottom) {
            // タイムラインエリア内でのプログレス計算
            const effectiveStart = timelineTop - windowHeight * 0.5;
            const effectiveEnd = timelineBottom - windowHeight * 0.5;
            const effectiveProgress = (viewportTop - effectiveStart) / (effectiveEnd - effectiveStart);
            scrollProgress = Math.max(0, Math.min(1, effectiveProgress));
        } else if (viewportTop > timelineBottom - windowHeight * 0.5) {
            // タイムライン終了後は100%
            scrollProgress = 1;
        }
        
        this.progressLine.style.height = `${scrollProgress * 100}%`;
        
        // 個別アイテムの進行状況を更新
        this.updateItemProgress();
        
        // 軽微なパララックス効果
        this.applyParallaxEffect();
    }

    updateItemProgress() {
        const windowHeight = window.innerHeight;
        const scrollY = window.pageYOffset;
        
        this.timelineItems.forEach((item, index) => {
            const itemRect = item.getBoundingClientRect();
            const itemTop = itemRect.top + scrollY;
            const itemCenter = itemTop + itemRect.height / 2;
            
            // アイテムがビューポートの中央に近いかチェック
            const viewportCenter = scrollY + windowHeight / 2;
            const distanceFromCenter = Math.abs(itemCenter - viewportCenter);
            const maxDistance = windowHeight / 2;
            
            // 中央に近いほど強いエフェクト
            const proximity = Math.max(0, 1 - distanceFromCenter / maxDistance);
            
            // ノードのスケール調整
            const node = item.querySelector('.scroll-timeline-node');
            if (node) {
                const scale = 0.8 + (proximity * 0.4); // 0.8から1.2の間
                node.style.transform = `scale(${scale})`;
            }
        });
    }

    applyParallaxEffect() {
        const windowHeight = window.innerHeight;
        
        this.timelineItems.forEach((item, index) => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.top + itemRect.height / 2;
            const distanceFromCenter = (windowHeight / 2) - itemCenter;
            const parallaxOffset = distanceFromCenter * 0.02; // より軽微なパララックス
            
            const card = item.querySelector('.scroll-timeline-card');
            if (card) {
                card.style.transform = `translateY(${parallaxOffset}px)`;
            }
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