/* ===================================
   スキル管理クラス
   =================================== */
class SkillsManager {
    constructor() {
        this.skills = document.querySelectorAll('.skill');
    }

    init() {
        this.setupSkillAnimation();
    }

    setupSkillAnimation() {
        let animatedCount = 0; // アニメーション済みのスキル数
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skill = entry.target;
                    
                    // 連鎖アニメーション（0.1秒ずつ遅延）
                    setTimeout(() => {
                        skill.classList.add('skill-visible');
                    }, animatedCount * 100);
                    
                    animatedCount++;
                    
                    // 一度アニメーションしたら監視を停止
                    observer.unobserve(skill);
                }
            });
        }, { 
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        this.skills.forEach(skill => {
            observer.observe(skill);
        });
    }
}