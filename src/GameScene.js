/**
 * =====================================
 * GAMES SCENE - CENA PRINCIPAL COMPLETA
 * =====================================
 * 
 * Contém toda a lógica do jogo Snake:
 * - Movimentação
 * - Colisão
 * - Comida
 * - Obstáculos
 * - Score
 * - Controles
 * - UI
 */

import GameConfig from './GameConfig.js';
import Snake from './Snake.js';
import Food from './Food.js';
import Obstacle from './Obstacle.js';
import UIManager from './UIManager.js';
import Controls from './Controls.js';
import AudioManager from './AudioManager.js';
import StorageManager from './StorageManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        this.snake = null;
        this.food = null;
        this.obstacles = null;
        this.uiManager = null;
        this.controls = null;
        this.audioManager = null;
        this.storageManager = null;
        
        this.score = 0;
        this.highScore = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.isRunning = false;
        
        this.lastMove = 0;
    }
    
    create() {
        console.log('🎮Criando cena do jogo...');
        
        this.storageManager = new StorageManager();
        this.highScore = this.storageManager.getHighScore();
        
        this.audioManager = new AudioManager(this);
        this.uiManager = new UIManager(this);
        this.controls = new Controls(this);
        
        this.createBackground();
        this.createBorders();
        
        this.snake = new Snake(this, GameConfig.INITIAL_X, GameConfig.INITIAL_Y);
        this.food = new Food(this);
        
        this.obstacles = [];
        
        this.uiManager.showMenu(this.highScore);
        
        console.log('🎮Jogo criado com sucesso!');
    }
    
    createBackground() {
        const bg = this.add.graphics();
        bg.fillGradientStyle(
            GameConfig.COLORS.BG_TOP, GameConfig.COLORS.BG_TOP,
            GameConfig.COLORS.BG_BOTTOM, GameConfig.COLORS.BG_BOTTOM,
            1
        );
        bg.fillRect(0, 0, GameConfig.GAME_WIDTH, GameConfig.GAME_HEIGHT);
        
        const gridGraphics = this.add.graphics();
        gridGraphics.lineStyle(1, GameConfig.COLORS.GRID, 0.2);
        
        for (let x = 0; x <= GameConfig.GAME_WIDTH; x += GameConfig.GRID_SIZE) {
            gridGraphics.moveTo(x, 0);
            gridGraphics.lineTo(x, GameConfig.GAME_HEIGHT);
        }
        
        for (let y = 0; y <= GameConfig.GAME_HEIGHT; y += GameConfig.GRID_SIZE) {
            gridGraphics.moveTo(0, y);
            gridGraphics.lineTo(GameConfig.GAME_WIDTH, y);
        }
        
        gridGraphics.strokePath();
    }
    
    createBorders() {
        const graphics = this.add.graphics();
        graphics.lineStyle(3, GameConfig.COLORS.UI_PRIMARY, 1);
        graphics.strokeRect(
            GameConfig.MARGIN / 2,
            GameConfig.MARGIN / 2,
            GameConfig.GAME_WIDTH - GameConfig.MARGIN,
            GameConfig.GAME_HEIGHT - GameConfig.MARGIN
        );
    }
    
    update(time, delta) {
        if (this.gameOver || this.paused) return;
        
        if (this.food && this.food.visible) {
            this.food.update(time);
        }
        
        const direction = this.controls.getDirection();
        if (direction) {
            this.snake.setDirection(direction);
        }
        
        const moveInterval = Math.max(
            GameConfig.MIN_MOVE_INTERVAL,
            GameConfig.BASE_MOVE_INTERVAL - (this.level - 1) * GameConfig.SPEED_INCREMENT
        );
        
        if (time > this.lastMove + moveInterval) {
            this.lastMove = time;
            this.updateGame();
        }
    }
    
    updateGame() {
        if (!this.isRunning || this.gameOver) return;
        
        const result = this.snake.move();
        
        if (result.collision) {
            this.endGame();
            return;
        }
        
        if (result.ateFood) {
            this.collectFood();
        }
        
        if (this.checkObstacleCollision()) {
            this.endGame();
        }
    }
    
    collectFood() {
        this.score += GameConfig.POINTS_PER_FOOD * this.level;
        
        this.audioManager.play('eat');
        
        const newLevel = Math.floor(this.score / GameConfig.SCORE_PER_LEVEL) + 1;
        
        if (newLevel > this.level) {
            this.levelUp(newLevel);
        }
        
        this.uiManager.updateScore(this.score);
        this.spawnFood();
    }
    
    levelUp(newLevel) {
        this.level = newLevel;
        
        this.audioManager.play('levelup');
        
        if (this.level >= GameConfig.MAX_OBSTACLE_LEVEL) {
            this.spawnObstacle();
        }
        
        this.uiManager.showLevelUp(this.level);
    }
    
    spawnFood() {
        let validPosition = false;
        let x, y;
        let attempts = 0;
        const maxAttempts = 100;
        
        while (!validPosition && attempts < maxAttempts) {
            attempts++;
            
            x = Phaser.Math.Between(
                GameConfig.MARGIN,
                GameConfig.GAME_WIDTH - GameConfig.MARGIN - GameConfig.GRID_SIZE
            );
            y = Phaser.Math.Between(
                GameConfig.MARGIN,
                GameConfig.GAME_HEIGHT - GameConfig.MARGIN - GameConfig.GRID_SIZE
            );
            
            x = Math.round(x / GameConfig.GRID_SIZE) * GameConfig.GRID_SIZE;
            y = Math.round(y / GameConfig.GRID_SIZE) * GameConfig.GRID_SIZE;
            
            validPosition = !this.snake.collidesWithBody(x, y) && !this.snake.collidesWithHead(x, y);
            
            for (const obs of this.obstacles) {
                if (obs.x === x && obs.y === y) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        if (validPosition) {
            this.food.spawn(x, y);
        }
    }
    
    spawnObstacle() {
        if (this.obstacles.length >= GameConfig.MAX_OBSTACLES) return;
        
        let validPosition = false;
        let x, y;
        let attempts = 0;
        
        while (!validPosition && attempts < 50) {
            attempts++;
            
            x = Phaser.Math.Between(
                GameConfig.MARGIN,
                GameConfig.GAME_WIDTH - GameConfig.MARGIN - GameConfig.GRID_SIZE
            );
            y = Phaser.Math.Between(
                GameConfig.MARGIN,
                GameConfig.GAME_HEIGHT - GameConfig.MARGIN - GameConfig.GRID_SIZE
            );
            
            x = Math.round(x / GameConfig.GRID_SIZE) * GameConfig.GRID_SIZE;
            y = Math.round(y / GameConfig.GRID_SIZE) * GameConfig.GRID_SIZE;
            
            validPosition = !this.snake.collidesWithBody(x, y) &&
                          !this.snake.collidesWithHead(x, y) &&
                          !(this.food.x === x && this.food.y === y);
            
            const head = this.snake.getHead();
            const dist = Math.abs(x - head.x) + Math.abs(y - head.y);
            if (dist < GameConfig.GRID_SIZE * 3) {
                validPosition = false;
            }
        }
        
        if (validPosition) {
            this.obstacles.push(Obstacle.create(this, x, y));
        }
    }
    
    checkObstacleCollision() {
        const head = this.snake.getHead();
        
        for (const obs of this.obstacles) {
            if (head.x === obs.x && head.y === obs.y) {
                return true;
            }
        }
        
        return false;
    }
    
    endGame() {
        if (this.gameOver) return;
        
        this.gameOver = true;
        this.isRunning = false;
        
        this.audioManager.play('gameover');
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.storageManager.setHighScore(this.highScore);
        }
        
        this.uiManager.showGameOver(this.score, this.highScore);
        
        console.log('💀Game Over! Score:', this.score);
    }
    
    startGame() {
        if (this.isRunning && !this.gameOver) return;
        
        if (this.uiManager) {
            this.uiManager.hideMenu();
        }
        
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.isRunning = true;
        
        this.obstacles.forEach(obs => {
            if (obs.graphics) obs.graphics.destroy();
        });
        this.obstacles = [];
        
        this.snake.reset(GameConfig.INITIAL_X, GameConfig.INITIAL_Y);
        this.spawnFood();
        
        this.uiManager.updateScore(0);
        this.uiManager.updateLevel(1);
        
        this.audioManager.play('start');
        
        console.log('🚀Jogo iniciado!');
    }
    
    onMenuClick() {
        if (this.gameOver || !this.isRunning) {
            this.startGame();
        }
    }
}