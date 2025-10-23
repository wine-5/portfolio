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
            const skillName = skill.querySelector('.skill__name').textContent;
            
            // 経験値計算ユーティリティを使用
            const experience = window.skillExpCalculator.getSkillExperience(skillName);
            const expPercentage = window.skillExpCalculator.getExperiencePercentage(experience.totalMonths);
            const level = Math.floor(experience.totalMonths / 2) + 1; // 2ヶ月で1レベル
            
            // レベル表示を追加（初期状態は非表示）
            const levelBadge = document.createElement('div');
            levelBadge.className = 'skill-level-badge';
            levelBadge.style.opacity = '0';
            levelBadge.style.transform = 'translateY(20px)';
            levelBadge.innerHTML = `
                <span class="level-number">Lv.${level}</span>
                <div class="exp-bar">
                    <div class="exp-fill" style="width: 0%"></div>
                </div>
                <span class="exp-text">${experience.text}</span>
            `;
            
            const header = skill.querySelector('.skill__header');
            if (header) {
                header.appendChild(levelBadge);
            }
            
            // スクロールで表示アニメーション
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            levelBadge.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                            levelBadge.style.opacity = '1';
                            levelBadge.style.transform = 'translateY(0)';
                            
                            // EXPバーアニメーション
                            const expFill = levelBadge.querySelector('.exp-fill');
                            setTimeout(() => {
                                expFill.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                                expFill.style.width = `${expPercentage}%`;
                            }, 500);
                        }, index * 150); // 順番に表示
                        observer.unobserve(skill);
                    }
                });
            }, { threshold: 0.3 });
            
            observer.observe(skill);
            
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
                    <div class="stat-bar-fill hp-fill" data-value="90"></div>
                    <span class="stat-value">900/1000</span>
                </div>
            </div>
            <div class="stat-bar mp-bar">
                <div class="stat-label">
                    <i class="fas fa-fire"></i>
                    <span>MP (創造力)</span>
                </div>
                <div class="stat-bar-container">
                    <div class="stat-bar-fill mp-fill" data-value="0"></div>
                    <span class="stat-value">0/1000</span>
                </div>
            </div>
            <div class="stat-bar exp-bar-game">
                <div class="stat-label">
                    <i class="fas fa-star"></i>
                    <span>EXP (開発経験値)</span>
                </div>
                <div class="stat-bar-container">
                    <div class="stat-bar-fill exp-fill" data-value="0"></div>
                    <span class="stat-value">0/10000</span>
                </div>
            </div>
        `;
        
        // 左下に配置（grid-areaで制御）
        hpMpBars.style.gridColumn = '1';
        hpMpBars.style.gridRow = '2';
        
        aboutSection.appendChild(hpMpBars);
        
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
