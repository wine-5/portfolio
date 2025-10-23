/**
 * スキルカード展開マネージャー
 * クリックでカードを回転拡大して詳細情報を表示
 */

class SkillCardExpandManager {
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
            setTimeout(() => this.expandCard(skillElement), 600);
        } else {
            this.expandCard(skillElement);
        }
    }

    expandCard(skillElement) {
        console.log('expandCard called', skillElement);
        this.isAnimating = true;
        this.expandedCard = skillElement;

        const skillName = skillElement.querySelector('.skill__name').textContent;
        console.log('skillName:', skillName);
        
        const skillDetails = window.getSkillDetails ? window.getSkillDetails(skillName) : null;
        console.log('skillDetails:', skillDetails);
        
        if (!skillDetails) {
            console.error('skillDetails not found for:', skillName);
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
        newPanel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.3);
            width: min(90vw, 700px);
            max-height: 80vh;
            background: var(--card-bg);
            border: 2px solid var(--primary-color);
            border-radius: 15px;
            z-index: 10001;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            opacity: 0;
        `;

        // 元のカードのヘッダーをコピー
        const headerClone = skillElement.querySelector('.skill__header');
        const descClone = skillElement.querySelector('.skill__description');
        
        if (headerClone) {
            const headerDiv = document.createElement('div');
            headerDiv.style.cssText = `
                padding: 30px 20px 20px;
                text-align: center;
                border-bottom: 1px solid rgba(99, 102, 241, 0.2);
            `;
            headerDiv.innerHTML = headerClone.innerHTML;
            newPanel.appendChild(headerDiv);
        }
        
        if (descClone) {
            const descDiv = document.createElement('div');
            descDiv.style.cssText = `
                padding: 15px 20px;
                text-align: center;
                color: var(--text-secondary);
                font-size: 0.95rem;
            `;
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
                newPanel.style.transform = 'translate(-50%, -50%) scale(1)';
                newPanel.style.opacity = '1';
                
                // 詳細を表示
                setTimeout(() => {
                    detailsContent.style.transition = 'opacity 0.4s ease';
                    detailsContent.style.opacity = '1';
                    this.isAnimating = false;
                }, 400);
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

        // 新しいパネルをフェードアウト
        if (newPanel) {
            newPanel.style.opacity = '0';
            newPanel.style.transform = 'translate(-50%, -50%) scale(0.8)';
        }

        // オーバーレイを削除
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }

        // パネルを削除
        setTimeout(() => {
            if (newPanel) {
                newPanel.remove();
            }
            this.newPanel = null;
            this.expandedCard = null;
            this.isAnimating = false;
        }, 500);
    }
}

// グローバルインスタンス
window.skillCardExpandManager = new SkillCardExpandManager();
