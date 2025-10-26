/* ===================================
   タイムライン管理クラス（スクロールドリブン版）
   =================================== */

// 定数定義
const TIMELINE_CONFIG = {
    INIT_RETRY_DELAY: 500,
    SIMPLE_TIMELINE_MAX_EVENTS: 4,
    MAX_INIT_RETRIES: 10  // 最大リトライ回数
};

class TimelineManager {
    constructor() {
        // DOM要素の取得は初期化時に行う
        this.timelineContainer = null;
        this.timelineData = [];
        this.scrollTriggers = [];
        this.isInitialized = false;
        this.initRetryCount = 0;  // リトライカウンター
    }

    ensureDataAndDOM() {
        // DOM要素の確認
        if (!this.timelineContainer) {
            this.timelineContainer = document.getElementById('timeline-container');
            if (!this.timelineContainer) {
                console.warn('TimelineManager: timeline-container element not found');
            }
        }
        
        // データの確認
        // 1. timelineDataオブジェクトから取得を試みる
        if ((!this.timelineData || this.timelineData.length === 0) && window.timelineData) {
            this.timelineData = window.timelineData.getAllItems();
        }
        
        // 2. グローバルTIMELINE_DATAから取得を試みる
        if ((!this.timelineData || this.timelineData.length === 0) && typeof TIMELINE_DATA !== 'undefined') {
            this.timelineData = TIMELINE_DATA;
        }
        
        const hasData = this.timelineData && this.timelineData.length > 0;
        const hasContainer = !!this.timelineContainer;
        
        if (!hasData) {
            console.warn('TimelineManager: No timeline data available');
        }
        
        return hasContainer && hasData;
    }

    init() {
        if (this.isInitialized) {
            return;
        }
        
        // データとDOMの確認
        if (!this.ensureDataAndDOM()) {
            // 最大リトライ回数をチェック
            if (this.initRetryCount >= TIMELINE_CONFIG.MAX_INIT_RETRIES) {
                console.error('Failed to initialize TimelineManager after maximum retries');
                this.showErrorMessage();
                return;
            }
            
            this.initRetryCount++;
            console.warn(`Failed to ensure data and DOM - retrying (${this.initRetryCount}/${TIMELINE_CONFIG.MAX_INIT_RETRIES}) in ${TIMELINE_CONFIG.INIT_RETRY_DELAY}ms`);
            setTimeout(() => this.init(), TIMELINE_CONFIG.INIT_RETRY_DELAY);
            return;
        }
        
        // メインページかタイムライン専用ページかを判定
        const isMainPage = document.getElementById('games') !== null;
        
        try {
            if (isMainPage) {
                this.renderSimpleTimeline();
            } else {
                this.renderScrollTimeline();
                this.setupScrollTriggers();
            }
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Error during timeline initialization:', error);
            this.showErrorMessage();
        }
    }

    showErrorMessage() {
        if (this.timelineContainer) {
            this.timelineContainer.innerHTML = `
                <div class="timeline-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>タイムラインの読み込みに失敗しました</h3>
                    <p>データの読み込み中に問題が発生しました。ページを再読み込みしてください。</p>
                    <button onclick="location.reload()" class="btn-reload">
                        <i class="fas fa-redo"></i> ページを再読み込み
                    </button>
                </div>
            `;
        }
    }

    renderSimpleTimeline() {
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
        
        // 重要なマイルストーンのみを表示（最新4つ）
        const importantEvents = [...dataToUse]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, TIMELINE_CONFIG.SIMPLE_TIMELINE_MAX_EVENTS);
        
        const timelineHTML = `
            <div class="simple-timeline">
                ${importantEvents.map((item, index) => this.createSimpleTimelineItem(item, index)).join('')}
            </div>
        `;
        
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
        // データが空の場合はフォールバックデータを使用
        let dataToUse = this.timelineData;
        if (!dataToUse || dataToUse.length === 0) {
            dataToUse = [
                {
                    id: 'school-start',
                    title: '専門学校入学',
                    type: 'milestone',
                    date: '2024-04-01',
                    description: 'ゲーム開発の学習を開始',
                    color: '#10b981',
                    icon: '🎓'
                },
                {
                    id: 'element-battle',
                    title: 'ElementBattle',
                    type: 'project',
                    date: '2025-01-16',
                    duration: 30,
                    description: '記念すべき初作品のカードゲーム',
                    technologies: ['HTML', 'CSS', 'JavaScript'],
                    color: '#6366f1',
                    icon: '🃏'
                }
            ];
        }
        
        const sortedData = [...dataToUse].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        try {
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
            
        } catch (error) {
            console.error('Error generating timeline HTML:', error);
            
            // エラーの場合はシンプルなメッセージを表示
            this.timelineContainer.innerHTML = `
                <div class="timeline-error">
                    <h3>タイムライン読み込み中...</h3>
                    <p>少々お待ちください</p>
                </div>
            `;
        }
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
        
        // タイムラインの境界を計算
        this.updateTimelineBounds();
        
        // スクロールイベント（パッシブリスナー使用）
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        window.addEventListener('resize', this.updateTimelineBounds.bind(this), { passive: true });
        
        // 初期表示
        this.handleScroll();
    }

    updateTimelineBounds() {
        if (this.timelineElement) {
            const rect = this.timelineElement.getBoundingClientRect();
            this.timelineTop = this.timelineElement.offsetTop;
            this.timelineHeight = this.timelineElement.offsetHeight;
            this.timelineBottom = this.timelineTop + this.timelineHeight;
        }
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
        
        // タイムラインセクション全体を基準にした計算に変更
        const timelineSection = document.getElementById('timeline');
        const sectionTop = timelineSection ? timelineSection.offsetTop : timelineTop;
        const sectionHeight = timelineSection ? timelineSection.offsetHeight : this.timelineHeight;
        const sectionBottom = sectionTop + sectionHeight;
        
        // より長いスクロール範囲を設定（終点を延長）
        const effectiveStart = sectionTop - windowHeight * 0.2;
        const effectiveEnd = sectionBottom + windowHeight * 0.3; // 終点を延長
        
        if (viewportTop >= effectiveStart) {
            if (viewportTop <= effectiveEnd) {
                // タイムラインエリア内でのプログレス計算
                const effectiveProgress = (viewportTop - effectiveStart) / (effectiveEnd - effectiveStart);
                scrollProgress = Math.max(0, Math.min(1, effectiveProgress));
            } else {
                // タイムライン終了後は100%
                scrollProgress = 1;
            }
        }
        
        // セクションの終端近くでは強制的に100%にする
        if (viewportTop >= sectionBottom - windowHeight * 0.5) {
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