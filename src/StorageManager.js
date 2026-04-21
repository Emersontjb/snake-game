/**
 * =====================================
 * STORAGE MANAGER - ARMAZENAMENTO LOCAL
 * =====================================
 */

export default class StorageManager {
    constructor() {
        this.KEY_HIGHSCORE = 'snake-highscore-v1';
    }
    
    getHighScore() {
        try {
            const score = localStorage.getItem(this.KEY_HIGHSCORE);
            return score ? parseInt(score, 10) : 0;
        } catch (e) {
            return 0;
        }
    }
    
    setHighScore(score) {
        try {
            const current = this.getHighScore();
            if (score > current) {
                localStorage.setItem(this.KEY_HIGHSCORE, score.toString());
            }
        } catch (e) {
            console.log('Erro ao salvar high score');
        }
    }
    
    clearHighScore() {
        try {
            localStorage.removeItem(this.KEY_HIGHSCORE);
        } catch (e) {
            console.log('Erro ao limpar high score');
        }
    }
}