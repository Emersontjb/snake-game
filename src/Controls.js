/**
 * =====================================
 * CONTROLS - CONTROLES MOBILE/TECLADO
 * =====================================
 * 
 * Sistema de controles otimizado para mobile:
 * - Swipe detection com threshold adaptativo
 * - Botões D-pad na tela
 * - Suporte a multitouch
 * - Debounce para evitar inputs duplicados
 * - Otimizado para baixo desempenho
 */

import GameConfig from './GameConfig.js';

export default class Controls {
    constructor(scene) {
        this.scene = scene;
        
        // Estado do input
        this.direction = null;
        this.pendingDirection = null;
        
        // Swipe
        this.swipeStart = null;
        this.lastSwipeDirection = null;
        this.swipeThreshold = 20;
        
        // D-pad
        this.dpadContainer = null;
        this.dpadButtons = [];
        this.activeTouches = new Map();
        this.lastInputTime = 0;
        this.inputCooldown = 80;
        
        // Detectar plataforma
        this.isMobile = this.detectMobile();
        
        // Setup
        this.setupKeyboard();
        
        if (this.isMobile) {
            this.setupTouch();
            this.createDpad();
        }
    }
    
    detectMobile() {
        return (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window && navigator.maxTouchPoints > 0) ||
            window.innerWidth < 768
        );
    }
    
    // =====================================
    // SETUP TECLADO (DESKTOP)
    // =====================================
    
    setupKeyboard() {
        this.scene.input.keyboard.on('keydown', (event) => {
            if (Date.now() - this.lastInputTime < this.inputCooldown) return;
            
            let dir = null;
            
            switch (event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                case '8':
                    dir = { ...GameConfig.DIRECTIONS.UP };
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                case '2':
                    dir = { ...GameConfig.DIRECTIONS.DOWN };
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                case '4':
                    dir = { ...GameConfig.DIRECTIONS.LEFT };
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                case '6':
                    dir = { ...GameConfig.DIRECTIONS.RIGHT };
                    break;
                case ' ':
                case 'Enter':
                    event.preventDefault();
                    break;
            }
            
            if (dir) {
                this.setDirection(dir);
                event.preventDefault();
            }
        });
    }
    
    // =====================================
    // SETUP TOUCH COM SUPORTE A MULTITOUCH
    // =====================================
    
    setupTouch() {
        const canvas = this.scene.game.canvas;
        
        // Usar pointer events nativa do Phaser
        this.scene.input.on('pointerdown', (pointer) => {
            if (this.dpadContainer && this.isInsideDpad(pointer.position)) {
                return;
            }
            
            // Iniciar swipe
            this.swipeStart = {
                x: pointer.x,
                y: pointer.y,
                id: pointer.id
            };
        });
        
        this.scene.input.on('pointermove', (pointer) => {
            if (!this.swipeStart) return;
            if (Date.now() - this.lastInputTime < this.inputCooldown) return;
            if (pointer.id !== this.swipeStart.id) return;
            
            // Processar swipe gesture
            this.processSwipe(pointer.x, pointer.y);
        });
        
        this.scene.input.on('pointerup', (pointer) => {
            if (pointer.id === this.swipeStart?.id) {
                this.swipeStart = null;
            }
        });
        
        this.scene.input.on('pointercancel', (pointer) => {
            if (pointer.id === this.swipeStart?.id) {
                this.swipeStart = null;
            }
        });
    }
    
    processSwipe(currentX, currentY) {
        if (!this.swipeStart) return;
        
        const deltaX = currentX - this.swipeStart.x;
        const deltaY = currentY - this.swipeStart.y;
        
        // Threshold adaptativo (5% da tela)
        const threshold = Math.max(
            this.swipeThreshold,
            Math.min(window.innerWidth, window.innerHeight) * 0.08
        );
        
        if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
            return;
        }
        
        let dir = null;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            dir = deltaX > 0 ? 
                { ...GameConfig.DIRECTIONS.RIGHT } : 
                { ...GameConfig.DIRECTIONS.LEFT };
        } else {
            dir = deltaY > 0 ? 
                { ...GameConfig.DIRECTIONS.DOWN } : 
                { ...GameConfig.DIRECTIONS.UP };
        }
        
        if (dir && (!this.lastSwipeDirection || dir.x !== this.lastSwipeDirection.x || dir.y !== this.lastSwipeDirection.y)) {
            this.setDirection(dir);
            this.lastSwipeDirection = dir;
            this.swipeStart = null;
            
            // Resetar última direção após movimento completo
            this.scene.time.delayedCall(200, () => {
                this.lastSwipeDirection = null;
            });
        }
    }
    
    isInsideDpad(pos) {
        if (!this.dpadContainer) return false;
        
        const bounds = this.dpadContainer.getBounds();
        return (
            pos.x >= bounds.x && pos.x <= bounds.x + bounds.width &&
            pos.y >= bounds.y && pos.y <= bounds.y + bounds.height
        );
    }
    
    // =====================================
    // D-PAD OPTIMIZADO
    // =====================================
    
    createDpad() {
        const scene = this.scene;
        const gameWidth = GameConfig.GAME_WIDTH;
        const gameHeight = GameConfig.GAME_HEIGHT;
        
        const canvas = scene.game.canvas;
        const canvasWidth = canvas.clientWidth;
        const canvasHeight = canvas.clientHeight;
        
        const scaleX = canvasWidth / gameWidth;
        const scaleY = canvasHeight / gameHeight;
        
        const btnSize = Math.min(55, canvasWidth * 0.13);
        const btnSpacing = 6;
        const btnY = gameHeight - btnSize * 1.8;
        const btnX = gameWidth - btnSize * 1.8;
        
        this.dpadContainer = scene.add.container(btnX, btnY);
        this.dpadContainer.setScrollFactor(0);
        this.dpadContainer.setDepth(999);
        this.dpadContainer.setAlpha(0.75);
        
        const buttons = [
            { dir: { x: 0, y: -1 }, dx: 0, dy: -1, symbol: '▲' },
            { dir: { x: 0, y: 1 }, dx: 0, dy: 1, symbol: '▼' },
            { dir: { x: -1, y: 0 }, dx: -1, dy: 0, symbol: '◀' },
            { dir: { x: 1, y: 0 }, dx: 1, dy: 0, symbol: '▶' }
        ];
        
        buttons.forEach(({ dir, dx, dy, symbol }) => {
            const bx = btnSize * 0.55 + dx * (btnSize + btnSpacing);
            const by = btnSize * 0.55 + dy * (btnSize + btnSpacing);
            
            const btn = scene.add.graphics();
            this.drawButton(btn, bx, by, btnSize, false);
            
            const text = scene.add.text(bx, by, symbol, {
                fontSize: (btnSize * 0.35) + 'px',
                fontFamily: 'Arial',
                color: '#00ff88'
            });
            text.setOrigin(0.5);
            
            const zone = scene.add.zone(bx, by, btnSize * 0.9, btnSize * 0.9);
            zone.setInteractive({
                useHandCursor: false,
                draggable: false
            });
            
            let isPressed = false;
            
            const onDown = () => {
                if (Date.now() - this.lastInputTime < this.inputCooldown) return;
                isPressed = true;
                this.setDirection({ ...dir });
                this.drawButton(btn, bx, by, btnSize, true);
            };
            
            const onUp = () => {
                isPressed = false;
                this.drawButton(btn, bx, by, btnSize, false);
            };
            
            zone.on('pointerdown', onDown);
            zone.on('pointerup', onUp);
            zone.on('pointerout', onUp);
            zone.on('pointercancel', onUp);
            
            this.dpadContainer.add([zone, btn, text]);
            this.dpadButtons.push({ zone, btn, bx, by, btnSize });
        });
        
        // Central D-pad visual
        const centerX = btnSize * 0.55;
        const centerY = btnSize * 0.55;
        const centerDot = scene.add.graphics();
        centerDot.fillStyle(0x00ff88, 0.4);
        centerDot.fillCircle(0, 0, btnSize * 0.2);
        centerDot.setPosition(centerX, centerY);
        this.dpadContainer.add(centerDot);
    }
    
    drawButton(graphics, x, y, size, pressed) {
        graphics.clear();
        
        if (pressed) {
            graphics.fillStyle(0x00ff88, 0.7);
            graphics.fillCircle(0, 0, size * 0.45);
            graphics.lineStyle(3, 0x00ff88, 1);
            graphics.strokeCircle(0, 0, size * 0.45);
        } else {
            graphics.fillStyle(0x00ff88, 0.25);
            graphics.fillCircle(0, 0, size * 0.45);
            graphics.lineStyle(2, 0x00ff88, 0.8);
            graphics.strokeCircle(0, 0, size * 0.45);
        }
    }
    
    // =====================================
    // SET DIRECTION COM THROTTLE
    // =====================================
    
    setDirection(dir) {
        if (Date.now() - this.lastInputTime < this.inputCooldown) {
            this.pendingDirection = { ...dir };
            return;
        }
        
        if (this.direction) {
            if (dir.x === -this.direction.x && dir.y === -this.direction.y) {
                this.pendingDirection = { ...dir };
                return;
            }
        }
        
        this.direction = { ...dir };
        this.lastInputTime = Date.now();
    }
    
    getDirection() {
        if (this.pendingDirection && Date.now() - this.lastInputTime >= this.inputCooldown) {
            this.direction = { ...this.pendingDirection };
            this.pendingDirection = null;
        }
        
        const dir = this.direction;
        this.direction = null;
        return dir;
    }
    
    // =====================================
    // CLEANUP
    // =====================================
    
    destroy() {
        if (this.dpadContainer) {
            this.dpadContainer.destroy();
        }
        this.dpadButtons = [];
        this.activeTouches.clear();
    }
}