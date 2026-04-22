/**
 * =====================================
 * GAME SCENE - SNAKE CLÁSSICO
 * =====================================
 * Movimento estilo Snake,
 * corpo segmentado,
 * crescimento,
 * comidas especiais
 */

import SnakeVisualManager from './SnakeVisualManager.js';
import FoodManager from './FoodManager.js';
import DimensionManager from './DimensionManager.js';
import GraphicsOptimizer from './GraphicsOptimizer.js';
import TileMapManager from './TileMapManager.js';
import LightingManager from './LightingManager.js';
import Controls from './Controls.js';
import AudioManager from './AudioManager.js';
import UIManager from './UIManager.js';

const COLORS = {
    PLAYER: 0x3d6a4d,
    PLAYER_DETAIL: 0x4d7a5d
};

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        this.tileMap = null;
        this.lighting = null;
        this.visualManager = null;
        this.dimensionManager = null;
        this.graphicsOptimizer = null;
        
        this.snake = [];
        this.snakeContainer = null;
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.lastMove = 0;
        this.baseMoveInterval = 150;
        this.currentMoveInterval = 150;
        
        this.foodManager = null;
        
        this.score = 0;
        this.highScore = 0;
        this.gameOver = false;
        this.isRunning = false;
        
        this.activeEffects = [];
        this.motionTime = 0;
    }
    
    create() {
        console.log('🐍 Inicializando Snake...');
        
        this.highScore = this.getHighScore();
        
        this.tileMap = new TileMapManager(this);
        this.tileMap.buildMap();
        
        this.lighting = new LightingManager(this, {
            ambient: { r: 0.08, g: 0.1, b: 0.12 },
            ambientIntensity: 0.4
        });
        this.lighting.enable();
        
        this.visualManager = new SnakeVisualManager(this);
        
        this.graphicsOptimizer = new GraphicsOptimizer(this);
        
        this.dimensionManager = new DimensionManager(this);
        this.dimensionManager.setDimension('NORMAL');
        
        this.foodManager = new FoodManager(this);
        
        this.controls = new Controls(this);
        this.audioManager = new AudioManager(this);
        this.uiManager = new UIManager(this);
        
        this.createInitialSnake();
        this.foodManager.spawn();
        
        this.uiManager.showMenu(this.highScore);
        this.setupControls();
        
        console.log('🐍 Jogo pronto!');
    }
    
    createInitialSnake() {
        const startX = 5;
        const startY = 5;
        
        this.snakeContainer = this.add.container(0, 0);
        this.snakeContainer.setDepth(20);
        
        this.snake = [];
        
        for (let i = 2; i >= 0; i--) {
            const segment = this.createSnakeSegment(i === 0 ? 'head' : 'body', i);
            const x = startX - i;
            const y = startY;
            
            segment.setPosition(x * 20 + 10, y * 20 + 10);
            this.snakeContainer.add(segment);
            
            this.snake.push({
                gridX: x,
                gridY: y,
                sprite: segment,
                type: i === 0 ? 'head' : 'body'
            });
        }
        
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        this.lighting.updatePlayerGlow(
            this.snake[0].sprite.x,
            this.snake[0].sprite.y,
            true
        );
    }
    
    createSnakeSegment(type, index) {
        const container = this.add.container(0, 0);
        
        const shadow = this.add.ellipse(1.5, 2.5, 15, 8, 0x000000, 0.28);
        shadow.setBlendMode(Phaser.BlendModes.MULTIPLY);
        
        const segmentSprite = this.visualManager.createSegment(type, index);
        segmentSprite.setDisplaySize(18, 18);
        
        container.add([shadow, segmentSprite]);
        container.segmentSprite = segmentSprite;
        container.shadowSprite = shadow;
        container.setDepth(20);
        
        return container;
    }
    
    update(time, delta) {
        if (this.gameOver || !this.isRunning) return;
        
        this.motionTime += delta;
        
        const inputDir = this.controls.getDirection();
        
        if (inputDir) {
            if (inputDir.x !== -this.direction.x || inputDir.y !== -this.direction.y) {
                this.nextDirection = { ...inputDir };
            }
        }
        
        const moveInterval = Math.max(80, this.currentMoveInterval);
        
        if (time > this.lastMove + moveInterval) {
            this.lastMove = time;
            this.moveSnake();
        }
        
        this.updateEffects(time, delta);
        
        if (this.dimensionManager) {
            this.dimensionManager.update(time, delta);
        }
        
        if (this.graphicsOptimizer) {
            this.graphicsOptimizer.updateParticles(delta);
        }
        
        this.applyRealisticMotion();
    }
    
    moveSnake() {
        this.direction = { ...this.nextDirection };
        
        const head = this.snake[0];
        const newX = head.gridX + this.direction.x;
        const newY = head.gridY + this.direction.y;
        
        if (!this.tileMap.isWalkable(newX, newY)) {
            this.endGame();
            return;
        }
        
        for (let i = 1; i < this.snake.length; i++) {
            if (this.snake[i].gridX === newX && this.snake[i].gridY === newY) {
                this.endGame();
                return;
            }
        }
        
        const targetX = newX * 20 + 10;
        const targetY = newY * 20 + 10;
        
        const foodData = this.foodManager.currentFood;
        const ateFood = (foodData && foodData.gridX === newX && foodData.gridY === newY);
        
        if (ateFood) {
            this.handleFoodConsumption(foodData);
        }
        
        if (ateFood && foodData.config.grow) {
            const newSegment = this.createSnakeSegment('body', this.snake.length - 1);
            const tail = this.snake[this.snake.length - 1];
            newSegment.setPosition(tail.sprite.x, tail.sprite.y);
            this.snakeContainer.add(newSegment);
            
            this.snake.push({
                gridX: tail.gridX,
                gridY: tail.gridY,
                sprite: newSegment,
                type: 'body'
            });
        }
        
        for (let i = this.snake.length - 1; i > 0; i--) {
            this.snake[i].gridX = this.snake[i - 1].gridX;
            this.snake[i].gridY = this.snake[i - 1].gridY;
        }
        
        this.snake[0].gridX = newX;
        this.snake[0].gridY = newY;
        
        const moveDuration = this.currentMoveInterval * 0.8;
        
        this.tweens.add({
            targets: this.snake[0].sprite,
            x: targetX,
            y: targetY,
            duration: moveDuration,
            ease: 'Linear'
        });
        
        for (let i = 1; i < this.snake.length; i++) {
            const targetSegX = this.snake[i].gridX * 20 + 10;
            const targetSegY = this.snake[i].gridY * 20 + 10;
            
            this.tweens.add({
                targets: this.snake[i].sprite,
                x: targetSegX,
                y: targetSegY,
                duration: moveDuration,
                ease: 'Linear'
            });
        }
        
        if (ateFood) {
            this.lighting.updatePlayerGlow(targetX, targetY, true);
        }
        
        this.updateHeadRotation();
    }
    
    handleFoodConsumption(foodData) {
        const config = foodData.config;
        
        this.score += config.score;
        if (this.score < 0) this.score = 0;
        this.uiManager.updateScore(this.score);
        
        if (config.duration !== 0) {
            this.applySpeedEffect(config.duration);
        }
        
        if (config.explodeRadius > 0) {
            this.createExplosionAt(foodData.gridX, foodData.gridY, config.explodeRadius);
        }
        
        if (config.teleport) {
            this.teleportRandom();
        }
        
        if (config.changeDimension) {
            this.changeDimension();
        }
        
        this.foodManager.consume();
        this.foodManager.spawn();
        
        this.audioManager.play('eat');
    }
    
    changeDimension() {
        const newDim = this.dimensionManager.getRandomDimension();
        
        this.dimensionManager.transitionTo(newDim, 800);
        
        this.cameras.main.shake(200, 0.005);
        
        this.createDimensionChangeEffect();
    }
    
    createDimensionChangeEffect() {
        const flash = this.add.graphics();
        
        flash.fillStyle(0xffffff, 0.4);
        flash.fillRect(0, 0, this.scale.width, this.scale.height);
        
        flash.setDepth(200);
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            ease: 'Quad.easeOut',
            onComplete: () => flash.destroy()
        });
    }
    
    applySpeedEffect(duration) {
        const effect = {
            type: 'speed',
            duration: duration,
            startTime: Date.now(),
            originalInterval: this.baseMoveInterval
        };
        
        if (duration < 0) {
            this.currentMoveInterval = Math.max(50, this.baseMoveInterval * 1.5);
        } else {
            this.currentMoveInterval = Math.min(300, this.baseMoveInterval * 0.5);
        }
        
        this.activeEffects.push(effect);
    }
    
    createExplosionAt(gridX, gridY, radius) {
        const directions = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];
        
        directions.forEach(dir => {
            for (let i = 0; i <= radius; i++) {
                if (i === 0 && (dir.x !== 0 || dir.y !== 0)) continue;
                
                const targetX = gridX + dir.x * i;
                const targetY = gridY + dir.y * i;
                
                if (targetX < 0 || targetX >= 15 || targetY < 0 || targetY >= 11) break;
                
                const tile = this.tileMap.getTile(targetX, targetY);
                
                if (tile && tile.type === 1) break;
                
                if (i <= radius) {
                    this.createExplosionEffect(targetX, targetY);
                }
            }
        });
        
        this.cameras.main.shake(150, 0.01);
    }
    
    createExplosionEffect(gridX, gridY) {
        const x = gridX * 20 + 10;
        const y = gridY * 20 + 10;
        
        const flash = this.add.graphics();
        flash.fillStyle(0xffffff, 0.9);
        flash.fillCircle(x, y, 15);
        flash.setDepth(100);
        
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 2,
            duration: 200,
            onComplete: () => flash.destroy()
        });
        
        const fire = this.add.graphics();
        fire.fillStyle(0xff6600, 0.8);
        fire.fillCircle(x, y, 12);
        fire.fillStyle(0xffaa00, 0.6);
        fire.fillCircle(x, y, 8);
        fire.setDepth(101);
        
        this.tweens.add({
            targets: fire,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            onComplete: () => fire.destroy()
        });
        
        this.score += 10;
        this.uiManager.updateScore(this.score);
    }
    
    teleportRandom() {
        const validPositions = [];
        
        for (let x = 1; x < 14; x++) {
            for (let y = 1; y < 10; y++) {
                if (this.tileMap.isWalkable(x, y)) {
                    let onSnake = false;
                    for (const seg of this.snake) {
                        if (seg.gridX === x && seg.gridY === y) {
                            onSnake = true;
                            break;
                        }
                    }
                    if (!onSnake) {
                        validPositions.push({ x, y });
                    }
                }
            }
        }
        
        if (validPositions.length > 0) {
            const pos = validPositions[Math.floor(Math.random() * validPositions.length)];
            
            const targetX = pos.x * 20 + 10;
            const targetY = pos.y * 20 + 10;
            
            this.tweens.add({
                targets: this.snake[0].sprite,
                alpha: 0,
                scale: 0.5,
                duration: 150,
                onComplete: () => {
                    this.snake[0].gridX = pos.x;
                    this.snake[0].gridY = pos.y;
                    this.snake[0].sprite.setPosition(targetX, targetY);
                    
                    for (let i = 1; i < this.snake.length; i++) {
                        const prev = this.snake[i - 1];
                        this.snake[i].gridX = prev.gridX;
                        this.snake[i].gridY = prev.gridY;
                        this.snake[i].sprite.setPosition(
                            prev.gridX * 20 + 10,
                            prev.gridY * 20 + 10
                        );
                    }
                    
                    this.tweens.add({
                        targets: this.snake[0].sprite,
                        alpha: 1,
                        scale: 1,
                        duration: 150
                    });
                    
                    this.lighting.updatePlayerGlow(targetX, targetY, true);
                }
            });
        }
    }
    
    updateEffects(time, delta) {
        const now = Date.now();
        
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            
            if (now > effect.startTime + effect.duration) {
                this.currentMoveInterval = this.baseMoveInterval;
                this.activeEffects.splice(i, 1);
            }
        }
    }
    
    updateHeadRotation() {
        const head = this.snake[0].sprite;
        
        const rotationMap = {
            '1,0': 0,
            '-1,0': Math.PI,
            '0,-1': -Math.PI / 2,
            '0,1': Math.PI / 2
        };
        
        const key = `${this.direction.x},${this.direction.y}`;
        const targetRotation = rotationMap[key] || 0;
        
        head.rotation = targetRotation;
    }
    
    applyRealisticMotion() {
        if (!this.snake || this.snake.length === 0) return;
        
        const speedFactor = Phaser.Math.Clamp(150 / this.currentMoveInterval, 0.8, 1.8);
        const breathe = Math.sin(this.motionTime * 0.005) * 0.02 * speedFactor;
        
        this.snake.forEach((segment, index) => {
            const isHead = index === 0;
            const phase = this.motionTime * 0.006 - index * 0.5;
            const wave = Math.sin(phase) * 0.035 * speedFactor;
            const pulse = Math.sin(this.motionTime * 0.004 + index * 0.25) * 0.012;
            
            const scaleX = 1 + wave + (isHead ? breathe : pulse);
            const scaleY = 1 - wave * 0.5 + (isHead ? pulse : 0);
            segment.sprite.setScale(scaleX, scaleY);
            
            if (segment.sprite.shadowSprite) {
                segment.sprite.shadowSprite.setAlpha(0.2 + Math.abs(wave) * 0.6);
                segment.sprite.shadowSprite.setScale(1 + Math.abs(wave) * 0.5, 1);
            }
            
            if (isHead && segment.sprite.segmentSprite) {
                segment.sprite.segmentSprite.setTint(
                    COLORS.PLAYER,
                    COLORS.PLAYER_DETAIL,
                    COLORS.PLAYER_DETAIL,
                    COLORS.PLAYER
                );
            }
        });
    }
    
    endGame() {
        if (this.gameOver) return;
        
        this.gameOver = true;
        this.isRunning = false;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.setHighScore(this.highScore);
        }
        
        this.audioManager.play('gameover');
        
        this.cameras.main.shake(300, 0.015);
        
        this.uiManager.showGameOver(this.score, this.highScore);
    }
    
    startGame() {
        if (this.isRunning) return;
        
        this.uiManager.hideMenu();
        
        this.score = 0;
        this.gameOver = false;
        this.isRunning = true;
        this.baseMoveInterval = 150;
        this.currentMoveInterval = 150;
        this.activeEffects = [];
        
        this.snakeContainer.destroy();
        
        this.dimensionManager.setDimension('NORMAL');
        
        if (this.graphicsOptimizer) {
            this.graphicsOptimizer.clearAllParticles();
        }
        
        this.createInitialSnake();
        
        if (this.foodManager) {
            this.foodManager.destroy();
        }
        this.foodManager = new FoodManager(this);
        this.foodManager.spawn();
        
        this.uiManager.updateScore(0);
        
        this.audioManager.play('start');
    }
    
    setupControls() {
        this.input.keyboard.on('keydown', (e) => {
            if (e.key === 'Enter' && (this.gameOver || !this.isRunning)) {
                this.startGame();
            }
        });
        
        this.input.on('pointerdown', () => {
            if (this.gameOver || !this.isRunning) {
                this.startGame();
            }
        });
    }
    
    getHighScore() {
        try {
            return parseInt(localStorage.getItem('snake-highscore') || '0', 10);
        } catch {
            return 0;
        }
    }
    
    setHighScore(score) {
        try {
            localStorage.setItem('snake-highscore', score.toString());
        } catch {}
    }
    
    shutdown() {
        if (this.tileMap) this.tileMap.destroy();
        if (this.lighting) this.lighting.destroy();
        if (this.visualManager) this.visualManager.destroy();
        if (this.foodManager) this.foodManager.destroy();
        if (this.dimensionManager) this.dimensionManager.destroy();
        if (this.graphicsOptimizer) this.graphicsOptimizer.destroy();
    }
}
