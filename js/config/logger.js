/* ===================================
   ログ出力管理（デバッグ・本番環境対応）
   =================================== */

class Logger {
    constructor() {
        // 本番環境判定（GitHub Pagesまたはカスタムドメイン）
        this.isProduction = location.hostname !== 'localhost' && 
                           location.hostname !== '127.0.0.1' && 
                           location.hostname !== '' &&
                           !location.hostname.includes('192.168.');
        
        // ログレベル設定
        this.logLevel = this.isProduction ? 'error' : 'debug';
    }

    log(...args) {
        if (!this.isProduction || this.logLevel === 'debug') {
            console.log(...args);
        }
    }

    warn(...args) {
        if (this.logLevel === 'debug' || this.logLevel === 'warn') {
            console.warn(...args);
        }
    }

    error(...args) {
        console.error(...args);
    }

    debug(...args) {
        if (this.logLevel === 'debug') {
            console.log('[DEBUG]', ...args);
        }
    }
}

// グローバルインスタンス
const logger = new Logger();