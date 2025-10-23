/**
 * スキルカード展開マネージャー
 * クリックでカードを拡大して詳細情報を表示
 */

class SkillCardExpandManager {
    // 定数定義
    static ANIMATION_CONFIG = {
        INITIAL_SCALE: 0.3,
        FINAL_SCALE: 1,
        CLOSE_SCALE: 0.8,
        PANEL_MAX_WIDTH: 700,
        PANEL_WIDTH_VW: 90,
        PANEL_MAX_HEIGHT_VH: 80,
        TRANSITION_DURATION: '0.6s',
        TRANSITION_TIMING: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        DETAILS_FADE_DELAY: 400,
        OVERLAY_REMOVE_DELAY: 300,
        PANEL_REMOVE_DELAY: 500,
        REOPEN_DELAY: 600,
        Z_INDEX: 10001
    };

    static STYLE_CONFIG = {
        HEADER_PADDING: '30px 20px 20px',
        DESC_PADDING: '15px 20px',
        DESC_FONT_SIZE: '0.95rem',
        BORDER_RADIUS: '15px',
        BOX_SHADOW: '0 10px 40px rgba(0, 0, 0, 0.3)',
        BORDER_COLOR: 'rgba(99, 102, 241, 0.2)'
    };

    constructor() {
        this.expandedCard = null;
        this.newPanel = null;
        this.isAnimating = false;
    }

    init() {
        const skills = document.querySelectorAll('.skill');
        
        skills.forEach(skill => {
            skill.style.cursor = 'pointer';
            skill.addEventListener('click', (e) => {
                // パーティクルキャンバスをクリックした場合は無視
                if (e.target.classList.contains('skill-particle-canvas')) return;
                
                this.handleSkillClick(skill);
            });
        });

        // ESCキーで閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.expandedCard) {
                this.closeExpandedCard();
            }
        });
    }

    handleSkillClick(skillElement) {
        if (this.isAnimating) return;

        // 既に展開されている場合は閉じる
        if (this.expandedCard === skillElement) {
            this.closeExpandedCard();
            return;
        }

        // 他のカードが展開されている場合は先に閉じる
        if (this.expandedCard) {
            this.closeExpandedCard();
            setTimeout(() => this.expandCard(skillElement), SkillCardExpandManager.ANIMATION_CONFIG.REOPEN_DELAY);
        } else {
            this.expandCard(skillElement);
        }
    }

    expandCard(skillElement) {
        this.isAnimating = true;
        this.expandedCard = skillElement;

        const skillName = skillElement.querySelector('.skill__name').textContent;
        const skillDetails = window.getSkillDetails ? window.getSkillDetails(skillName) : null;
        
        if (!skillDetails) {
            this.isAnimating = false;
            return;
        }

        // オーバーレイを作成
        const overlay = document.createElement('div');
        overlay.className = 'skill-expand-overlay';
        overlay.addEventListener('click', () => this.closeExpandedCard());
        document.body.appendChild(overlay);

        // 元のカードの位置とサイズを取得
        const rect = skillElement.getBoundingClientRect();

        // 新しいパネルを作成
        const newPanel = document.createElement('div');
        newPanel.className = 'skill-expanded-panel';
        const config = SkillCardExpandManager.ANIMATION_CONFIG;
        
        // アニメーション用のインラインスタイル（動的な値のみ）
        newPanel.style.transform = `translate(-50%, -50%) scale(${config.INITIAL_SCALE})`;
        newPanel.style.width = `min(${config.PANEL_WIDTH_VW}vw, ${config.PANEL_MAX_WIDTH}px)`;
        newPanel.style.maxHeight = `${config.PANEL_MAX_HEIGHT_VH}vh`;
        newPanel.style.zIndex = config.Z_INDEX;
        newPanel.style.borderRadius = SkillCardExpandManager.STYLE_CONFIG.BORDER_RADIUS;
        newPanel.style.boxShadow = SkillCardExpandManager.STYLE_CONFIG.BOX_SHADOW;
        newPanel.style.transition = `all ${config.TRANSITION_DURATION} ${config.TRANSITION_TIMING}`;
        newPanel.style.opacity = '0';

        // 元のカードのヘッダーをコピー
        const headerClone = skillElement.querySelector('.skill__header');
        const descClone = skillElement.querySelector('.skill__description');
        
        if (headerClone) {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'skill-expanded-panel-header';
            headerDiv.innerHTML = headerClone.innerHTML;
            newPanel.appendChild(headerDiv);
        }
        
        if (descClone) {
            const descDiv = document.createElement('div');
            descDiv.className = 'skill-expanded-panel-desc';
            descDiv.textContent = descClone.textContent;
            newPanel.appendChild(descDiv);
        }

        // 詳細コンテンツを作成
        const detailsContent = this.createDetailsContent(skillDetails);
        detailsContent.style.opacity = '0';
        newPanel.appendChild(detailsContent);

        document.body.appendChild(newPanel);
        this.newPanel = newPanel;

        // アニメーション開始
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            
            // パネルを拡大表示
            requestAnimationFrame(() => {
                newPanel.style.transform = `translate(-50%, -50%) scale(${SkillCardExpandManager.ANIMATION_CONFIG.FINAL_SCALE})`;
                newPanel.style.opacity = '1';
                
                // 詳細を表示
                setTimeout(() => {
                    detailsContent.style.transition = 'opacity 0.4s ease';
                    detailsContent.style.opacity = '1';
                    this.isAnimating = false;
                }, SkillCardExpandManager.ANIMATION_CONFIG.DETAILS_FADE_DELAY);
            });
        });
    }

    createDetailsContent(details) {
        const content = document.createElement('div');
        content.className = 'skill-details-content';
        
        content.innerHTML = `
            <div class="skill-details-header">
                <h3 class="skill-details-title">${details.title}</h3>
                <button class="skill-details-close" onclick="window.skillCardExpandManager.closeExpandedCard()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="skill-details-stats">
                <div class="skill-stat">
                    <i class="fas fa-project-diagram"></i>
                    <span>${details.projects}</span>
                </div>
                <div class="skill-stat">
                    <i class="fas fa-chart-line"></i>
                    <span>習熟度 ${details.proficiency}</span>
                </div>
            </div>

            <div class="skill-details-section">
                <h4 class="skill-details-subtitle">
                    <i class="fas fa-star"></i>
                    追加スキル・技術
                </h4>
                <div class="skill-details-grid">
                    ${details.additionalSkills.map(skill => `
                        <div class="skill-detail-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${skill}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="skill-details-footer">
                <p class="skill-details-note">
                    <i class="fas fa-info-circle"></i>
                    継続的に学習・実践を重ねています
                </p>
            </div>
        `;

        return content;
    }

    closeExpandedCard() {
        if (!this.expandedCard || this.isAnimating) return;

        this.isAnimating = true;
        const overlay = document.querySelector('.skill-expand-overlay');
        const newPanel = this.newPanel;
        const config = SkillCardExpandManager.ANIMATION_CONFIG;

        // 新しいパネルをフェードアウト
        if (newPanel) {
            newPanel.style.opacity = '0';
            newPanel.style.transform = `translate(-50%, -50%) scale(${config.CLOSE_SCALE})`;
        }

        // オーバーレイを削除
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), config.OVERLAY_REMOVE_DELAY);
        }

        // パネルを削除
        setTimeout(() => {
            if (newPanel) {
                newPanel.remove();
            }
            this.newPanel = null;
            this.expandedCard = null;
            this.isAnimating = false;
        }, config.PANEL_REMOVE_DELAY);
    }
}

// グローバルインスタンス
window.skillCardExpandManager = new SkillCardExpandManager();
