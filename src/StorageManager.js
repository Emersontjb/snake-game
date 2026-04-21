/**
 * =====================================
 * STORAGE MANAGER - ARMAZENAMENTO
 * =====================================
 * 
 * Gerencia o armazenamento local
 * (localStorage) paraHigh Score.
 */

export default class StorageManager {
    constructor() {
        this.KEY = 'snake-game-highscore';
    }
    
    getHighScore() {
        try {
            const score = localStorage.getItem(this.KEY);
            return score ? parseInt(score, 10) : 0;
        } catch (e) {
            return 0;
        }
    }
    
    setHighScore(score) {
        try {
            localStorage.setItem(this.KEY, score.toString());
        } catch (e) {
            console.log('Erro ao salvar score');
        }
    }
    
    clearHighScore() {
        try {
            localStorage.removeItem(this.KEY);
        } catch (e) {
            console.log('Erro ao limpar score');
        }
    }
}