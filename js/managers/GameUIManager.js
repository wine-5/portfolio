class GameUIManager {
    constructor() {
        this.levelUpShown = false;
    }

    init() {
        this.addSkillLevelSystem();
        this.addProgressBars();
        this.setupLevelUpAnimations();
    }

    addSkillLevelSystem() {
        const skills = document.querySelectorAll('.skill');
        
        skills.forEach((skill, index) => {
            const level = Math.floor(Math.random() * 50) + 50; // 50-100
            const exp = Math.floor(Math.random() * 100);
            
            // レベル表示を追加
            const levelBadge = document.createElement('div');
            levelBadge.className = 'skill-level-badge';
            levelBadge.innerHTML = `
                <span class="level-number">Lv.${level}</span>
                <div class="exp-bar">
                    <div class="exp-fill" style="width: ${exp}%"></div>
                </div>
                <span class="exp-text">${exp}/100 EXP</span>
            `;
            
            const header = skill.querySelector('.skill__header');
            if (header) {
                header.appendChild(levelBadge);
            }
            
            // ホバー時にレベルアップアニメーション（30%の確率）
            skill.addEventListener('mouseenter', () => {
                if (Math.random() > 0.7) {
                    this.showLevelUpAnimation(skill, level + 1);
                }
            });
        });
    }

    showLevelUpAnimation(skillElement, newLevel) {
        // 既にレベルアップアニメーション中なら無視
        if (skillElement.querySelector('.level-up-overlay')) return;

        const levelUpOverlay = document.createElement('div');
        levelUpOverlay.className = 'level-up-overlay';
        levelUpOverlay.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-flash"></div>
                <div class="level-up-text">LEVEL UP!</div>
                <div class="level-up-number">${newLevel}</div>
                <div class="level-up-particles"></div>
            </div>
        `;
        
        skillElement.style.position = 'relative';
        skillElement.appendChild(levelUpOverlay);
        
        // パーティクル生成
        this.createLevelUpParticles(levelUpOverlay.querySelector('.level-up-particles'));
        
        // アニメーション後に削除
        setTimeout(() => {
            levelUpOverlay.style.opacity = '0';
            setTimeout(() => levelUpOverlay.remove(), 500);
        }, 2000);
        
        // レベルアップサウンド（オプション）
        this.playLevelUpSound();
    }

    createLevelUpParticles(container) {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'level-up-particle';
            
            // ランダムな方向
            const angle = (Math.PI * 2 * i) / 20;
            const distance = 100 + Math.random() * 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.animationDelay = `${Math.random() * 0.5}s`;
            
            container.appendChild(particle);
        }
    }

    addProgressBars() {
        const aboutSection = document.querySelector('.about__content');
        if (!aboutSection) return;
        
        const hpMpBars = document.createElement('div');
        hpMpBars.className = 'game-stats';
        hpMpBars.innerHTML = `
            <div class="stat-bar hp-bar">
                <div class="stat-label">
                    <i class="fas fa-heart"></i>
                    <span>HP (開発体力)</span>
                </div>
                <div class="stat-bar-container">
                    <div class="stat-bar-fill hp-fill" data-value="85"></div>
                    <span class="stat-value">850/1000</span>
                </div>
            </div>
            <div class="stat-bar mp-bar">
                <div class="stat-label">
                    <i class="fas fa-fire"></i>
                    <span>MP (創造力)</span>
                </div>
                <div class="stat-bar-container">
                    <div class="stat-bar-fill mp-fill" data-value="95"></div>
                    <span class="stat-value">950/1000</span>
                </div>
            </div>
            <div class="stat-bar exp-bar-game">
                <div class="stat-label">
                    <i class="fas fa-star"></i>
                    <span>EXP (開発経験値)</span>
                </div>
                <div class="stat-bar-container">
                    <div class="stat-bar-fill exp-fill" data-value="75"></div>
                    <span class="stat-value">7500/10000</span>
                </div>
            </div>
        `;
        
        aboutSection.insertBefore(hpMpBars, aboutSection.firstChild);
        
        // バーアニメーション
        this.animateStatBars();
    }

    animateStatBars() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const fills = entry.target.querySelectorAll('.stat-bar-fill');
                    fills.forEach(fill => {
                        const value = fill.getAttribute('data-value');
                        setTimeout(() => {
                            fill.style.width = `${value}%`;
                        }, 300);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        const statBars = document.querySelector('.game-stats');
        if (statBars) observer.observe(statBars);
    }

    setupLevelUpAnimations() {
        // スキルセクションが表示されたときにランダムでレベルアップ演出
        const skillsSection = document.querySelector('.skills');
        if (!skillsSection) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.levelUpShown) {
                    this.levelUpShown = true;
                    setTimeout(() => {
                        const skills = document.querySelectorAll('.skill');
                        if (skills.length > 0) {
                            const randomSkill = skills[Math.floor(Math.random() * skills.length)];
                            this.showLevelUpAnimation(randomSkill, Math.floor(Math.random() * 50) + 50);
                        }
                    }, 1000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(skillsSection);
    }

    playLevelUpSound() {
        // オプション: レベルアップ音を再生
        // Web Audio APIを使って簡単なビープ音を生成
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 880; // A5
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            // Audio APIが使えない場合は無視
        }
    }
}
