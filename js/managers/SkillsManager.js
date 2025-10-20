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
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.skills.forEach(skill => {
            skill.classList.add('fade-in');
            observer.observe(skill);
        });
    }
}