/**
 * =====================================
 * CONTROLS - GERENCIADOR DE CONTROLES
 * =====================================
 * 
 * Gerencia controles teclado e touch:
 * - Desktop: WASD e setas
 * - Mobile: Swipe e botões na tela
 */

import GameConfig from './GameConfig.js';

export default class Controls {
    constructor(scene) {
        this.scene = scene;
        this.direction = null;
        this.swipeStartX = 0;
        this.swipeStartY = 0;
        this.swipeMinDistance = 30;
        
        this.setupKeyboard();
        this.setupTouch();
        this.createMobileButtons();
    }
    
    setupKeyboard() {
        // Teclado
        this.scene.input.keyboard.on('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.direction = { ...GameConfig.DIRECTIONS.UP };
                    break;
                    
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.direction = { ...GameConfig.DIRECTIONS.DOWN };
                    break;
                    
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.direction = { ...GameConfig.DIRECTIONS.LEFT };
                    break;
                    
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.direction = { ...GameConfig.DIRECTIONS.RIGHT };
                    break;
            }
        });
    }
    
    setupTouch() {
        // Swipe
        this.scene.input.on('pointerdown', (pointer) => {
            this.swipeStartX = pointer.x;
            this.swipeStartY = pointer.y;
        });
        
        this.scene.input.on('pointerup', (pointer) => {
            const deltaX = pointer.x - this.swipeStartX;
            const deltaY = pointer.y - this.swipeStartY;
            
            // Verificar se é swipe (movimento rápido)
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            if (absDeltaX > this.swipeMinDistance || absDeltaY > this.swipeMinDistance) {
                if (absDeltaX > absDeltaY) {
                    // Horizontal
                    this.direction = deltaX > 0 ? 
                        { ...GameConfig.DIRECTIONS.RIGHT } : 
                        { ...GameConfig.DIRECTIONS.LEFT };
                } else {
                    // Vertical
                    this.direction = deltaY > 0 ? 
                        { ...GameConfig.DIRECTIONS.DOWN } : 
                        { ...GameConfig.DIRECTIONS.UP };
                }
            }
        });
    }
    
    createMobileButtons() {
        // Detectar se é mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        ) || 'ontouchstart' in window;
        
        if (!isMobile) return;
        
        const gameWidth = GameConfig.GAME_WIDTH;
        const gameHeight = GameConfig.GAME_HEIGHT;
        const btnSize = 50;
        const btnSpacing = 10;
        
        // Container para botões (será adicionado depois)
        this.buttonsContainer = this.scene.add.container(0, 0);
        this.buttonsContainer.setScrollFactor(0);
        this.buttonsContainer.setDepth(100);
        
        // Botões direcionais
        const directions = [
            { dir: GameConfig.DIRECTIONS.UP, x: gameWidth / 2, y: gameHeight - btnSize * 3, symbol: '▲' },
            { dir: GameConfig.DIRECTIONS.DOWN, x: gameWidth / 2, y: gameHeight - btnSize, symbol: '▼' },
            { dir: GameConfig.DIRECTIONS.LEFT, x: gameWidth / 2 - btnSize - btnSpacing, y: gameHeight - btnSize * 2, symbol: '◀' },
            { dir: GameConfig.DIRECTIONS.RIGHT, x: gameWidth / 2 + btnSize + btnSpacing, y: gameHeight - btnSize * 2, symbol: '▶' }
        ];
        
        directions.forEach(({ dir, x, y, symbol }) => {
            // Botão visual
            const btn = this.scene.add.graphics();
            btn.fillStyle(0x00ff88, 0.3);
            btn.fillCircle(0, 0, btnSize / 2);
            btn.lineStyle(2, 0x00ff88, 1);
            btn.strokeCircle(0, 0, btnSize / 2);
            btn.setPosition(x, y);
            
            // Ícone
            const text = this.scene.add.text(x, y, symbol, {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#00ff88'
            });
            text.setOrigin(0.5);
            
            // Hit area
            const hitArea = this.scene.add.zone(x, y, btnSize, btnSize);
            this.scene.physics.add.existing(hitArea, false);
            
            // Eventos
            hitArea.setInteractive();
            
            hitArea.on('pointerdown', () => {
                this.direction = { ...dir };
                btn.clear();
                btn.fillStyle(0x00ff88, 0.6);
                btn.fillCircle(0, 0, btnSize / 2);
                btn.lineStyle(2, 0x00ff88, 1);
                btn.strokeCircle(0, 0, btnSize / 2);
            });
            
            hitArea.on('pointerup', () => {
                btn.clear();
                btn.fillStyle(0x00ff88, 0.3);
                btn.fillCircle(0, 0, btnSize / 2);
                btn.lineStyle(2, 0x00ff88, 1);
                btn.strokeCircle(0, 0, btnSize / 2);
            });
            
            this.buttonsContainer.add([btn, text, hitArea]);
        });
    }
    
    getDirection() {
        const dir = this.direction;
        this.direction = null;
        return dir;
    }
}