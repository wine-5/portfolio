/**
 * スキルカード展開マネージャー
 * クリックでカードを回転拡大して詳細情報を表示
 */

class SkillCardExpandManager {
    constructor() {
        this.expandedCard = null;
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
        this.isAnimating = true;
        this.expandedCard = skillElement;

        const skillName = skillElement.querySelector('.skill__name').textContent;
        const skillDetails = window.getSkillDetails(skillName);

        // オーバーレイを作成
        const overlay = document.createElement('div');
        overlay.className = 'skill-expand-overlay';
        overlay.addEventListener('click', () => this.closeExpandedCard());
        document.body.appendChild(overlay);

        // 元の位置とサイズを記録
        const rect = skillElement.getBoundingClientRect();
        const originalTransform = skillElement.style.transform;
        
        // カードを固定位置に
        skillElement.style.position = 'fixed';
        skillElement.style.top = `${rect.top}px`;
        skillElement.style.left = `${rect.left}px`;
        skillElement.style.width = `${rect.width}px`;
        skillElement.style.height = `${rect.height}px`;
        skillElement.style.zIndex = '10000';
        skillElement.style.margin = '0';

        // 詳細コンテンツを作成（非表示）
        const detailsContent = this.createDetailsContent(skillDetails);
        detailsContent.style.opacity = '0';
        skillElement.appendChild(detailsContent);

        // アニメーション開始
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            
            // X軸回転しながら中央に拡大
            skillElement.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            skillElement.style.transform = 'translate(-50%, -50%) rotateX(360deg) scale(1.5)';
            skillElement.style.top = '50%';
            skillElement.style.left = '50%';
            skillElement.style.width = 'min(80vw, 600px)';
            skillElement.style.height = 'auto';
            skillElement.classList.add('skill--expanded');

            // 回転中に詳細を表示
            setTimeout(() => {
                detailsContent.style.transition = 'opacity 0.5s ease';
                detailsContent.style.opacity = '1';
                this.isAnimating = false;
            }, 400);
        });

        // データを保存
        skillElement.dataset.originalTransform = originalTransform;
        skillElement.dataset.originalTop = rect.top;
        skillElement.dataset.originalLeft = rect.left;
        skillElement.dataset.originalWidth = rect.width;
        skillElement.dataset.originalHeight = rect.height;
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
        const skillElement = this.expandedCard;
        const detailsContent = skillElement.querySelector('.skill-details-content');
        const overlay = document.querySelector('.skill-expand-overlay');

        // 詳細コンテンツをフェードアウト
        if (detailsContent) {
            detailsContent.style.opacity = '0';
        }

        // オーバーレイを削除
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }

        // 元の位置に戻る（逆回転）
        setTimeout(() => {
            skillElement.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            skillElement.style.transform = `translate(0, 0) rotateX(-360deg) scale(1) ${skillElement.dataset.originalTransform || ''}`;
            skillElement.style.top = `${skillElement.dataset.originalTop}px`;
            skillElement.style.left = `${skillElement.dataset.originalLeft}px`;
            skillElement.style.width = `${skillElement.dataset.originalWidth}px`;
            skillElement.style.height = `${skillElement.dataset.originalHeight}px`;
            skillElement.classList.remove('skill--expanded');

            // アニメーション完了後に元のスタイルに戻す
            setTimeout(() => {
                skillElement.style.position = '';
                skillElement.style.top = '';
                skillElement.style.left = '';
                skillElement.style.width = '';
                skillElement.style.height = '';
                skillElement.style.zIndex = '';
                skillElement.style.transform = skillElement.dataset.originalTransform || '';
                skillElement.style.margin = '';
                
                if (detailsContent) {
                    detailsContent.remove();
                }

                this.expandedCard = null;
                this.isAnimating = false;
            }, 800);
        }, 100);
    }
}

// グローバルインスタンス
window.skillCardExpandManager = new SkillCardExpandManager();
