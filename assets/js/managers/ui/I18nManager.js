/**
 * 多言語化管理クラス
 * 言語の検出、切り替え、翻訳文字列の管理を行う
 */

class I18nManager {
    constructor() {
        this.translations = {};
        this.supportedLanguages = ['ja', 'en', 'zh'];
        this.defaultLanguage = 'ja';
        this.currentLang = this.detectLanguage();
    }

    /**
     * ユーザーの言語を検出
     * 優先順位: URLパラメータ > LocalStorage > ブラウザ設定 > デフォルト
     */
    detectLanguage() {
        // URLパラメータから取得
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.isSupported(urlLang)) {
            return urlLang;
        }

        // LocalStorageから取得
        const storedLang = localStorage.getItem('language');
        if (storedLang && this.isSupported(storedLang)) {
            return storedLang;
        }

        // ブラウザの言語設定から取得
        const browserLang = navigator.language.split('-')[0];
        if (this.isSupported(browserLang)) {
            return browserLang;
        }

        return this.defaultLanguage;
    }

    /**
     * 言語がサポートされているか確認
     */
    isSupported(lang) {
        return this.supportedLanguages.includes(lang);
    }

    /**
     * 翻訳データを読み込む
     */
    async loadTranslations(lang = this.currentLang) {
        if (!this.isSupported(lang)) {
            console.warn(`Language ${lang} is not supported. Using default: ${this.defaultLanguage}`);
            lang = this.defaultLanguage;
        }

        try {
            const modules = [
                'common',
                'sections',
                'skillDetails',
                'projects',
                'updates',
                'timeline'
            ];

            const promises = modules.map(async (module) => {
                try {
                    const response = await fetch(`json/locales/${lang}/${module}.json`);
                    if (!response.ok) {
                        throw new Error(`Failed to load ${module}: ${response.status}`);
                    }
                    return { module, data: await response.json() };
                } catch (error) {
                    console.warn(`Could not load ${module} for ${lang}:`, error);
                    return { module, data: null };
                }
            });

            const results = await Promise.all(promises);
            
            this.translations[lang] = {};
            results.forEach(({ module, data }) => {
                if (data) {
                    this.translations[lang][module] = data;
                }
            });

            return true;
        } catch (error) {
            console.error('Error loading translations:', error);
            return false;
        }
    }

    /**
     * 言語を切り替える
     */
    async switchLanguage(lang) {
        if (!this.isSupported(lang)) {
            console.error(`Language ${lang} is not supported`);
            return false;
        }

        // 翻訳データを読み込む
        if (!this.translations[lang]) {
            await this.loadTranslations(lang);
        }

        this.currentLang = lang;
        localStorage.setItem('language', lang);
        
        // HTML lang属性を更新
        document.documentElement.lang = lang;
        
        // 翻訳を適用
        this.applyTranslations();
        
        // イベント発火
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));

        return true;
    }

    /**
     * 翻訳をページに適用
     */
    applyTranslations() {
        // data-i18n属性を持つ要素を翻訳
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        });

        // data-i18n-placeholder属性を持つ要素のプレースホルダーを翻訳
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation && translation !== key) {
                element.placeholder = translation;
            }
        });

        // data-i18n-title属性を持つ要素のtitleを翻訳
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.t(key);
            if (translation && translation !== key) {
                element.title = translation;
            }
        });

        // セクションタイトルを更新
        this.updateSectionTitles();
    }

    /**
     * セクションタイトルを更新
     */
    updateSectionTitles() {
        const sections = {
            'games': 'sections.games.title',
            'skills': 'sections.skills.title',
            'about': 'sections.about.title',
            'connect': 'sections.contact.title',
            'update-history': 'sections.updates.title'
        };

        Object.entries(sections).forEach(([id, key]) => {
            const section = document.getElementById(id);
            if (section) {
                const titleElement = section.querySelector('.section__title');
                if (titleElement) {
                    const translation = this.t(key);
                    if (translation && translation !== key) {
                        titleElement.textContent = translation;
                    }
                }
            }
        });
        
        // Aboutセクションの詳細な説明を更新
        this.updateAboutSection();
    }

    /**
     * Aboutセクションの内容を更新
     */
    updateAboutSection() {
        const aboutSection = document.getElementById('about');
        if (!aboutSection) return;

        // 説明文を更新
        const descriptionElement = aboutSection.querySelector('.about__description');
        if (descriptionElement) {
            const fullDesc = this.t('sections.about.fullDescription');
            const socialText = this.t('sections.about.socialText');
            
            if (fullDesc && fullDesc !== 'sections.about.fullDescription') {
                // 改行を<br>に変換
                const lines = fullDesc.split('\n');
                descriptionElement.innerHTML = lines.map(line => line).join('<br>') + 
                                              '<br><br>' + socialText;
            }
        }

        // タイムラインボタンのテキストを更新
        const timelineButton = aboutSection.querySelector('.about__timeline-button');
        if (timelineButton) {
            const buttonText = this.t('sections.about.timelineButton');
            if (buttonText && buttonText !== 'sections.about.timelineButton') {
                const icon = timelineButton.querySelector('i');
                timelineButton.innerHTML = '';
                if (icon) timelineButton.appendChild(icon.cloneNode(true));
                timelineButton.appendChild(document.createTextNode('\n                                ' + buttonText + '\n                            '));
            }
        }

        // タイムラインの説明を更新
        const timelineDesc = aboutSection.querySelector('.about__timeline-description');
        if (timelineDesc) {
            const descText = this.t('sections.about.timelineDescription');
            if (descText && descText !== 'sections.about.timelineDescription') {
                timelineDesc.textContent = descText;
            }
        }
        
        // Contactセクションの説明を更新
        this.updateContactSection();
    }

    /**
     * Contactセクションの内容を更新
     */
    updateContactSection() {
        const contactSection = document.getElementById('connect');
        if (!contactSection) return;

        // 説明文を更新
        const descriptionElement = contactSection.querySelector('.contact__description');
        if (descriptionElement) {
            const desc = this.t('sections.contact.description');
            
            if (desc && desc !== 'sections.contact.description') {
                // 改行を<br>に変換
                const lines = desc.split('\n');
                descriptionElement.innerHTML = lines.map(line => line).join('<br>');
            }
        }
    }

    /**
     * 翻訳テキストを取得
     * @param {string} key - 'module.key' または 'module.key.subkey' 形式
     * @param {object} params - 置換パラメータ
     */
    t(key, params = {}) {
        const parts = key.split('.');
        
        if (parts.length < 2) {
            console.warn(`Invalid translation key format: ${key}`);
            return key;
        }

        const module = parts[0]; // 'sections', 'common', etc.
        const keyPath = parts.slice(1); // ['games', 'title'] など

        // 翻訳データを取得
        let text = this.translations[this.currentLang]?.[module];
        
        // キーパスを辿る
        for (const k of keyPath) {
            if (text && typeof text === 'object') {
                text = text[k];
            } else {
                text = undefined;
                break;
            }
        }
        
        // フォールバック: デフォルト言語を試す
        if (!text && this.currentLang !== this.defaultLanguage) {
            let fallbackText = this.translations[this.defaultLanguage]?.[module];
            for (const k of keyPath) {
                if (fallbackText && typeof fallbackText === 'object') {
                    fallbackText = fallbackText[k];
                } else {
                    fallbackText = undefined;
                    break;
                }
            }
            text = fallbackText;
        }

        // フォールバック: キーをそのまま返す
        if (!text) {
            console.warn(`Translation not found: ${key}`);
            return key;
        }

        // パラメータ置換
        return this.replaceParams(text, params);
    }

    /**
     * パラメータを置換
     */
    replaceParams(text, params) {
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * 現在の言語を取得
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * サポート言語一覧を取得
     */
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }

    /**
     * 言語名を取得
     */
    getLanguageName(lang) {
        const names = {
            'ja': '日本語',
            'en': 'English',
            'zh': '中文'
        };
        return names[lang] || lang;
    }

    /**
     * 言語切り替えボタンを作成
     */
    createLanguageSwitcher(container) {
        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';
        switcher.innerHTML = `
            <button class="language-switcher__button" aria-label="言語切り替え">
                <span class="language-switcher__current">${this.getLanguageName(this.currentLang)}</span>
                <svg class="language-switcher__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
                </svg>
            </button>
            <div class="language-switcher__dropdown">
                ${this.supportedLanguages.map(lang => `
                    <button class="language-switcher__option ${lang === this.currentLang ? 'active' : ''}" 
                            data-lang="${lang}">
                        ${this.getLanguageName(lang)}
                    </button>
                `).join('')}
            </div>
        `;

        // イベントリスナーを追加
        const button = switcher.querySelector('.language-switcher__button');
        const dropdown = switcher.querySelector('.language-switcher__dropdown');
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            switcher.classList.toggle('active');
        });

        // ドロップダウン外をクリックで閉じる
        document.addEventListener('click', () => {
            switcher.classList.remove('active');
        });

        // 言語選択
        switcher.querySelectorAll('.language-switcher__option').forEach(option => {
            option.addEventListener('click', async (e) => {
                e.stopPropagation();
                const lang = option.dataset.lang;
                if (lang !== this.currentLang) {
                    await this.switchLanguage(lang);
                    // ボタンのテキストを更新
                    button.querySelector('.language-switcher__current').textContent = this.getLanguageName(lang);
                    // アクティブ状態を更新
                    switcher.querySelectorAll('.language-switcher__option').forEach(opt => {
                        opt.classList.toggle('active', opt.dataset.lang === lang);
                    });
                }
            });
        });

        if (container instanceof HTMLElement) {
            container.appendChild(switcher);
        } else if (typeof container === 'string') {
            const target = document.querySelector(container);
            if (target) {
                target.appendChild(switcher);
            }
        }

        return switcher;
    }
}

// グローバルインスタンス作成
const i18n = new I18nManager();
window.i18n = i18n;

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}
