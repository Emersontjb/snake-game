/**
 * =====================================
 * GAME SCENE - VERSÃO OTIMIZADA
 * =====================================
 * 
 * Cena com todas as otimizações:
 * - Object pooling
 * - Dirty rendering
 * - Delta cap
 * - Frame skip
 * - Batch rendering
 */

import GameConfig from './GameConfig.js';
import Snake from './Snake.js';
import Food from './Food.js';
import Obstacle from './Obstacle.js';
import UIManager from './UIManager.js';
import Controls from './Controls.js';
import AudioManager from './AudioManager.js';
import StorageManager from './StorageManager.js';
import PerformanceManager from './PerformanceManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // =====================================
        // COMPONENTES
        // =====================================
        this.snake = null;
        this.food = null;
        this.obstacles = null;
        this.uiManager = null;
        this.controls = null;
        this.audioManager = null;
        this.storageManager = null;
        this.performance = null;
        
        // =====================================
        // ESTADO DO JOGO
        // =====================================
        this.score = 0;
        this.highScore = 0;
        this.level = 1;
        this.gameOver = false;
        this.isRunning = false;
        
        this.lastMove = 0;
        
        // =====================================
        // OTIMIZAÇÃO: CACHE
        // =====================================
        this.cachedDirection = null;
        this.lastMoveInterval = GameConfig.BASE_MOVE_INTERVAL;
    }
    
    create() {
        console.log('🎮 Criando cena (otimizada)...');
        
        // =====================================
        // INICIALIZAR GERENCIADORES
        // =====================================
        this.storageManager = new StorageManager();
        this.highScore = this.storageManager.getHighScore();
        
        this.audioManager = new AudioManager(this);
        this.uiManager = new UIManager(this);
        this.controls = new Controls(this);
        this.performance = new PerformanceManager(this);
        
        // =====================================
        // CRIAR ELEMENTOS DO JOGO
        // =====================================
        this.createBackground();
        this.createBorders();
        
        this.snake = new Snake(this, GameConfig.INITIAL_X, GameConfig.INITIAL_Y);
        this.food = new Food(this);
        
        // Array otimizado para obstáculos
        this.obstacles = [];
        
        // =====================================
        // MOSTRAR MENU
        // =====================================
        this.uiManager.showMenu(this.highScore);
        
        console.log('🎮 Jogo pronto!');
        console.log('📱 Quality:', this.performance.getQuality());
    }
    
    createBackground() {
        // =====================================
        // OTIMIZAÇÃO:一次性 renderizar fundo
        // =====================================
        const bg = this.add.graphics();
        
        // Gradiente simples (não usa gradients do canvas para mobile)
        bg.fillStyle(GameConfig.COLORS.BG_TOP, 1);
        bg.fillRect(0, 0, GameConfig.GAME_WIDTH, GameConfig.GAME_HEIGHT);
        
        // Grid
        const grid = this.add.graphics();
        grid.lineStyle(1, GameConfig.COLORS.GRID, 0.15);
        
        for (let x = 0; x <= GameConfig.GAME_WIDTH; x += GameConfig.GRID_SIZE) {
            grid.moveTo(x, 0);
            grid.lineTo(x, GameConfig.GAME_HEIGHT);
        }
        
        for (let y = 0; y <= GameConfig.GAME_HEIGHT; y += GameConfig.GRID_SIZE) {
            grid.moveTo(0, y);
            grid.lineTo(GameConfig.GAME_WIDTH, y);
        }
        
        grid.strokePath();
    }
    
    createBorders() {
        const border = this.add.graphics();
        border.lineStyle(3, GameConfig.COLORS.UI_PRIMARY, 1);
        border.strokeRect(
            1,
            1,
            GameConfig.GAME_WIDTH - 2,
            GameConfig.GAME_HEIGHT - 2
        );
    }
    
    // =====================================
    // UPDATE OTIMIZADO
    // =====================================
    
    update(time, delta) {
        // Não fazer nada se game over
        if (this.gameOver) return;
        
        // =====================================
        // OTIMIZAÇÃO: Cap de delta
        // =====================================
        delta = this.performance.capDelta(delta);
        
        // =====================================
        // OTIMIZAÇÃO: Frame skip
        // =====================================
        if (this.performance.shouldSkipFrame()) {
            return;
        }
        
        // =====================================
        // ATUALIZAR PERFORMANCE
        // =====================================
        this.performance.update(time, delta);
        
        // =====================================
        // OTIMIZAÇÃO: Cache da direção
        // =====================================
        const direction = this.controls.getDirection();
        if (direction) {
            this.cachedDirection = direction;
        }
        
        // =====================================
        // MOVER COBRA
        // =====================================
        if (direction) {
            this.snake.setDirection(direction);
        }
        
        // Calcular intervalo baseado no nível
        this.lastMoveInterval = Math.max(
            GameConfig.MIN_MOVE_INTERVAL,
            GameConfig.BASE_MOVE_INTERVAL - (this.level - 1) * GameConfig.SPEED_INCREMENT
        );
        
        if (time > this.lastMove + this.lastMoveInterval) {
            this.lastMove = time;
            this.updateGame();
        }
        
        // =====================================
        // OTIMIZAÇÃO: Não atualizar comida se invisível
        // =====================================
        if (this.food && this.food.visible) {
            this.food.update(time);
        }
    }
    
    updateGame() {
        if (!this.isRunning || this.gameOver) return;
        
        // Mover cobra
        const result = this.snake.move();
        
        if (result.collision) {
            this.endGame();
            return;
        }
        
        if (result.ateFood) {
            this.collectFood();
        }
        
        // Verificar obstáculos
        if (this.checkObstacleCollision()) {
            this.endGame();
        }
    }
    
    collectFood() {
        // =====================================
        // OTIMIZAÇÃO: Pontuação local
        // =====================================
        const points = GameConfig.POINTS_PER_FOOD * this.level;
        this.score += points;
        
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
        
        // Spawnar obstáculo
        if (this.level >= GameConfig.MAX_OBSTACLE_LEVEL) {
            this.spawnObstacle();
        }
        
        this.uiManager.showLevelUp(this.level);
    }
    
    // =====================================
    // OTIMIZAÇÃO: Spawn otimizado
    // =====================================
    
    spawnFood() {
        const maxAttempts = 50;
        let attempts = 0;
        let x, y;
        let valid = false;
        
        // Otimização: early return
        while (!valid && attempts < maxAttempts) {
            attempts++;
            
            x = Math.round(
                Phaser.Math.Between(GameConfig.MARGIN, GameConfig.GAME_WIDTH - GameConfig.MARGIN - GameConfig.GRID_SIZE) / 
                GameConfig.GRID_SIZE
            ) * GameConfig.GRID_SIZE;
            
            y = Math.round(
                Phaser.Math.Between(GameConfig.MARGIN, GameConfig.GAME_HEIGHT - GameConfig.MARGIN - GameConfig.GRID_SIZE) / 
                GameConfig.GRID_SIZE
            ) * GameConfig.GRID_SIZE;
            
            valid = !this.snake.collidesWithBody(x, y) && !this.snake.collidesWithHead(x, y);
            
            for (const obs of this.obstacles) {
                if (obs.x === x && obs.y === y) {
                    valid = false;
                    break;
                }
            }
        }
        
        if (valid) {
            this.food.spawn(x, y);
        }
    }
    
    spawnObstacle() {
        if (this.obstacles.length >= GameConfig.MAX_OBSTACLES) return;
        
        let valid = false;
        let x, y;
        let attempts = 0;
        
        while (!valid && attempts < 30) {
            attempts++;
            
            x = Math.round(
                Phaser.Math.Between(GameConfig.MARGIN, GameConfig.GAME_WIDTH - GameConfig.MARGIN - GameConfig.GRID_SIZE) / 
                GameConfig.GRID_SIZE
            ) * GameConfig.GRID_SIZE;
            
            y = Math.round(
                Phaser.Math.Between(GameConfig.MARGIN, GameConfig.GAME_HEIGHT - GameConfig.MARGIN - GameConfig.GRID_SIZE) / 
                GameConfig.GRID_SIZE
            ) * GameConfig.GRID_SIZE;
            
            const head = this.snake.getHead();
            const dist = Math.abs(x - head.x) + Math.abs(y - head.y);
            
            valid = dist >= GameConfig.GRID_SIZE * 3 &&
                    !this.snake.collidesWithBody(x, y) &&
                    !this.snake.collidesWithHead(x, y) &&
                    !(this.food.x === x && this.food.y === y);
        }
        
        if (valid) {
            const obstacle = Obstacle.create(this, x, y);
            this.obstacles.push(obstacle);
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
    }
    
    startGame() {
        if (this.isRunning && !this.gameOver) return;
        
        this.uiManager.hideMenu();
        
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.isRunning = true;
        
        // Limpar obstáculos
        for (const obs of this.obstacles) {
            Obstacle.destroy(obs);
        }
        this.obstacles.length = 0;
        
        this.snake.reset(GameConfig.INITIAL_X, GameConfig.INITIAL_Y);
        this.spawnFood();
        
        this.uiManager.updateScore(0);
        this.uiManager.updateLevel(1);
        
        this.audioManager.play('start');
    }
    
    onMenuClick() {
        if (this.gameOver || !this.isRunning) {
            this.startGame();
        }
    }
    
    // =====================================
    // OTIMIZAÇÃO: Cleanup
    // =====================================
    
    shutdown() {
        // Limpar tudo
        if (this.obstacles) {
            for (const obs of this.obstacles) {
                Obstacle.destroy(obs);
            }
            this.obstacles.length = 0;
        }
        
        if (this.performance) {
            this.performance.destroy();
        }
    }
}