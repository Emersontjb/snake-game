/**
 * =====================================
 * UI MANAGER - GERENCIADOR DE UI
 * =====================================
 * 
 * Gerencia toda a interface do usuário:
 * - HUD (score, nível)
 * - Menus
 * - Feedback visual
 */

import GameConfig from './GameConfig.js';

export default class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.menuActive = false;
        this.menuContainer = null;
        this.scoreText = null;
        this.levelText = null;
        this.hudContainer = null;
        
        this.createHUD();
    }
    
    createHUD() {
        const gameWidth = GameConfig.GAME_WIDTH;
        
        // Container do HUD
        this.hudContainer = this.scene.add.container(0, 0);
        
        // Fundo do HUD
        const hudBg = this.scene.add.graphics();
        hudBg.fillStyle(0x000000, 0.7);
        hudBg.fillRect(0, 0, gameWidth, 45);
        
        this.hudContainer.add(hudBg);
        
        // Score
        this.scoreText = this.scene.add.text(20, 12, 'SCORE: 0', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#00ff88'
        });
        
        this.hudContainer.add(this.scoreText);
        
        // Level
        this.levelText = this.scene.add.text(gameWidth - 20, 12, 'NÍVEL: 1', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        this.levelText.setOrigin(1, 0);
        
        this.hudContainer.add(this.levelText);
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
        
        const gameWidth = GameConfig.GAME_WIDTH;
        const gameHeight = GameConfig.GAME_HEIGHT;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;
        
        // Container do menu
        this.menuContainer = this.scene.add.container(centerX, centerY);
        
        // Fundo semi-transparente
        const overlay = this.scene.add.rectangle(0, 0, gameWidth, gameHeight, 0x000000, 0.8);
        
        // Painel do menu
        const panelWidth = 280;
        const panelHeight = 250;
        const panel = this.scene.add.graphics();
        panel.fillStyle(GameConfig.COLORS.UI_PANEL, 1);
        panel.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
        panel.lineStyle(3, GameConfig.COLORS.UI_PRIMARY, 1);
        panel.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
        
        // Título
        const title = this.scene.add.text(0, -90, '🐍 SNAKE', {
            fontSize: '36px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#00ff88'
        });
        title.setOrigin(0.5);
        
        // Instruções
        const instructions = this.scene.add.text(0, -30, 'Toque ou clique\npara jogar!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 10
        });
        instructions.setOrigin(0.5);
        
        // High Score
        const highScoreText = this.scene.add.text(0, 50, 'RECORDE: ' + highScore, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#888888'
        });
        highScoreText.setOrigin(0.5);
        
        // Botão (visual)
        const playBtn = this.scene.add.text(0, 85, '[ JOGAR ]', {
            fontSize: '22px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#00ff88'
        });
        playBtn.setOrigin(0.5);
        
        // Animação do botão
        this.scene.tweens.add({
            targets: playBtn,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Adicionar ao container
        this.menuContainer.add([overlay, panel, title, instructions, highScoreText, playBtn]);
    }
    
    hideMenu() {
        if (this.menuContainer) {
            this.menuContainer.destroy();
            this.menuContainer = null;
        }
        this.menuActive = false;
    }
    
    showLevelUp(level) {
        const centerX = GameConfig.GAME_WIDTH / 2;
        const centerY = GameConfig.GAME_HEIGHT / 2;
        
        const text = this.scene.add.text(centerX, centerY, 'NÍVEL ' + level + '!', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#00ff88'
        });
        text.setOrigin(0.5);
        text.setAlpha(0);
        
        this.scene.tweens.add({
            targets: text,
            alpha: 1,
            y: centerY - 50,
            duration: 300,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: text,
                    alpha: 0,
                    duration: 500,
                    delay: 500,
                    ease: 'Cubic.easeIn',
                    onComplete: () => text.destroy()
                });
            }
        });
    }
    
    showGameOver(score, highScore) {
        const gameWidth = GameConfig.GAME_WIDTH;
        const gameHeight = GameConfig.GAME_HEIGHT;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;
        
        // Container
        const container = this.scene.add.container(centerX, centerY);
        
        // Fundo
        const overlay = this.scene.add.rectangle(0, 0, gameWidth, gameHeight, 0x000000, 0.85);
        
        // Painel
        const panelWidth = 280;
        const panelHeight = 220;
        const panel = this.scene.add.graphics();
        panel.fillStyle(GameConfig.COLORS.UI_PANEL, 1);
        panel.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
        panel.lineStyle(3, 0xff6b6b, 1);
        panel.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
        
        // Título
        const title = this.scene.add.text(0, -85, 'GAME OVER', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ff6b6b'
        });
        title.setOrigin(0.5);
        
        // Score
        const scoreText = this.scene.add.text(0, -30, 'Pontuação: ' + score, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        scoreText.setOrigin(0.5);
        
        // High Score
        const isNewRecord = score >= highScore;
        const highScoreText = this.scene.add.text(0, 15, isNewRecord ? '🎉 NOVO RECORDE!' : 'Recorde: ' + highScore, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: isNewRecord ? '#00ff88' : '#888888'
        });
        highScoreText.setOrigin(0.5);
        
        // Instruções
        const retryText = this.scene.add.text(0, 70, 'Toque para tentar\nnovamente', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#888888',
            align: 'center',
            lineSpacing: 8
        });
        retryText.setOrigin(0.5);
        
        container.add([overlay, panel, title, scoreText, highScoreText, retryText]);
        
        // Listener para restart
        this.scene.time.delayedCall(500, () => {
            this.scene.input.once('pointerdown', () => {
                container.destroy();
                this.scene.showMenu();
            });
        });
    }
}