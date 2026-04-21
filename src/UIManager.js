/**
 * =====================================
 * UI MANAGER - INTERFACE COMPLETA
 * =====================================
 * 
 * Gerencia toda a interface do usuário:
 * - HUD (score, nível)
 * - Menus (início, game over)
 * - Feedback visual (level up)
 * - Orientação responsiva
 */

import GameConfig from './GameConfig.js';

export default class UIManager {
    constructor(scene) {
        this.scene = scene;
        
        this.menuContainer = null;
        this.gameOverContainer = null;
        
        this.scoreText = null;
        this.levelText = null;
        
        this.createHUD();
    }
    
    createHUD() {
        const gameWidth = GameConfig.GAME_WIDTH;
        
        this.hudContainer = this.scene.add.container(0, 0);
        
        const hudBg = this.scene.add.graphics();
        hudBg.fillStyle(0x000000, 0.6);
        hudBg.fillRect(0, 0, gameWidth, 42);
        
        this.scoreText = this.scene.add.text(15, 10, 'SCORE: 0', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#00ff88'
        });
        
        this.levelText = this.scene.add.text(gameWidth - 15, 10, 'NÍVEL: 1', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        this.levelText.setOrigin(1, 0);
        
        this.hudContainer.add([hudBg, this.scoreText, this.levelText]);
    }
    
    updateScore(score) {
        if (this.scoreText) {
            this.scoreText.setText('SCORE: ' + score);
        }
    }
    
    updateLevel(level) {
        if (this.levelText) {
            this.levelText.setText('NÍVEL: ' + level);
        }
    }
    
    showMenu(highScore) {
        this.menuActive = true;
        
        const scene = this.scene;
        const gameWidth = GameConfig.GAME_WIDTH;
        const gameHeight = GameConfig.GAME_HEIGHT;
        
        scene.input.once('pointerdown', () => {
            this.hideMenu();
            scene.startGame();
        });
        
        scene.input.keyboard.once('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                this.hideMenu();
                scene.startGame();
            }
        });
        
        this.menuContainer = scene.add.container(gameWidth / 2, gameHeight / 2);
        
        const overlay = scene.add.rectangle(0, 0, gameWidth, gameHeight, 0x000000, 0);
        
        const panelWidth = 260;
        const panelHeight = 220;
        
        const panel = scene.add.graphics();
        panel.fillStyle(GameConfig.COLORS.UI_PANEL, 0.95);
        panel.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
        panel.lineStyle(3, GameConfig.COLORS.UI_PRIMARY, 1);
        panel.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
        
        const title = scene.add.text(0, -70, '🐍 SNAKE', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#00ff88'
        });
        title.setOrigin(0.5);
        
        const instructions = scene.add.text(0, -20, 'Toque ou Enter\npara jogar', {
            fontSize: '15px',
            fontFamily: 'Arial',
            color: '#aaaaaa',
            align: 'center',
            lineSpacing: 6
        });
        instructions.setOrigin(0.5);
        
        const highScoreText = scene.add.text(0, 30, 'RECORDE: ' + highScore, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#888888'
        });
        highScoreText.setOrigin(0.5);
        
        const playText = scene.add.text(0, 65, '[ COMEÇAR ]', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#00ff88'
        });
        playText.setOrigin(0.5);
        
        scene.tweens.add({
            targets: playText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.menuContainer.add([overlay, panel, title, instructions, highScoreText, playText]);
    }
    
    hideMenu() {
        if (this.menuContainer) {
            this.menuContainer.destroy();
            this.menuContainer = null;
        }
        this.menuActive = false;
    }
    
    showLevelUp(level) {
        const scene = this.scene;
        const gameWidth = GameConfig.GAME_WIDTH;
        const gameHeight = GameConfig.GAME_HEIGHT;
        
        const text = scene.add.text(gameWidth / 2, gameHeight / 2, 'NÍVEL ' + level + '!', {
            fontSize: '28px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#00ff88'
        });
        text.setOrigin(0.5);
        text.setAlpha(0);
        
        scene.tweens.add({
            targets: text,
            alpha: 1,
            y: gameHeight / 2 - 40,
            scale: 1.2,
            duration: 300,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                scene.tweens.add({
                    targets: text,
                    alpha: 0,
                    scale: 1,
                    duration: 400,
                    delay: 800,
                    ease: 'Cubic.easeIn',
                    onComplete: () => text.destroy()
                });
            }
        });
    }
    
    showGameOver(score, highScore) {
        const scene = this.scene;
        const gameWidth = GameConfig.GAME_WIDTH;
        const gameHeight = GameConfig.GAME_HEIGHT;
        
        this.gameOverContainer = scene.add.container(gameWidth / 2, gameHeight / 2);
        
        const overlay = scene.add.rectangle(0, 0, gameWidth, gameHeight, 0x000000, 0);
        
        const panelWidth = 260;
        const panelHeight = 200;
        
        const panel = scene.add.graphics();
        panel.fillStyle(GameConfig.COLORS.UI_PANEL, 0.95);
        panel.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
        panel.lineStyle(3, GameConfig.COLORS.UI_DANGER, 1);
        panel.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
        
        const title = scene.add.text(0, -70, '💀 GAME OVER', {
            fontSize: '26px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ff4757'
        });
        title.setOrigin(0.5);
        
        const scoreText = scene.add.text(0, -25, 'Pontos: ' + score, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        scoreText.setOrigin(0.5);
        
        const isNewRecord = score >= highScore && score > 0;
        const recordText = scene.add.text(0, 15, isNewRecord ? '🎉 NOVO RECORDE!' : 'Recorde: ' + highScore, {
            fontSize: '15px',
            fontFamily: 'Arial',
            color: isNewRecord ? '#00ff88' : '#888888'
        });
        recordText.setOrigin(0.5);
        
        const retryText = scene.add.text(0, 60, 'Toque para\ntentar novamente', {
            fontSize: '13px',
            fontFamily: 'Arial',
            color: '#666666',
            align: 'center',
            lineSpacing: 5
        });
        retryText.setOrigin(0.5);
        
        this.gameOverContainer.add([overlay, panel, title, scoreText, recordText, retryText]);
        
        scene.time.delayedCall(500, () => {
            const restartHandler = () => {
                this.hideGameOver();
                this.showMenu(highScore);
            };
            
            scene.input.once('pointerdown', restartHandler);
            
            scene.input.keyboard.once('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    restartHandler();
                }
            });
        });
    }
    
    hideGameOver() {
        if (this.gameOverContainer) {
            this.gameOverContainer.destroy();
            this.gameOverContainer = null;
        }
    }
}