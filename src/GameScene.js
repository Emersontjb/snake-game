/**
 * =====================================
 * GAMES SCENE - CENA PRINCIPAL
 * =====================================
 * 
 * Contém toda a lógica do jogo Snake:
 * - Movimentação
 * - Colisão
 * - Comida
 * - Obstáculos
 * - Score
 * - Controles
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
    }
    
    create() {
        // Carregar alto score salvo
        this.storageManager = new StorageManager();
        this.highScore = this.storageManager.getHighScore();
        
        // Inicializar gerenciadores
        this.audioManager = new AudioManager(this);
        this.uiManager = new UIManager(this);
        this.controls = new Controls(this);
        
        // Criar fundo do jogo
        this.createBackground();
        
        // Criar bordas
        this.createBorders();
        
        // Criar cobra inicial
        this.snake = new Snake(this, GameConfig.INITIAL_X, GameConfig.INITIAL_Y);
        
        // Criar comida inicial
        this.food = new Food(this);
        this.spawnFood();
        
        // Grupo de obstáculos
        this.obstacles = this.physics.add.group();
        
        // Menu inicial
        this.showMenu();
        
        // Log
        console.log('🎮 Jogo inicializado!');
    }
    
    createBackground() {
        // Fundo gradiente escuro
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        bg.fillRect(0, 0, GameConfig.GAME_WIDTH, GameConfig.GAME_HEIGHT);
        
        // Grid sutil
        const gridGraphics = this.add.graphics();
        gridGraphics.lineStyle(1, 0x2a2a4e, 0.3);
        
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
        graphics.lineStyle(3, 0x00ff88, 1);
        graphics.strokeRect(2, 2, GameConfig.GAME_WIDTH - 4, GameConfig.GAME_HEIGHT - 4);
    }
    
    showMenu() {
        this.paused = true;
        this.uiManager.showMenu(this.highScore);
        
        // Configurar clique para iniciar
        this.time.delayedCall(100, () => {
            this.input.once('pointerdown', () => {
                if (this.uiManager.menuActive) {
                    this.startGame();
                }
            });
        });
    }
    
    startGame() {
        this.uiManager.hideMenu();
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.isRunning = true;
        
        this.uiManager.updateScore(this.score);
        this.uiManager.updateLevel(this.level);
        
        // Resetar cobra
        this.snake.reset(GameConfig.INITIAL_X, GameConfig.INITIAL_Y);
        
        // Spawnar comida
        this.spawnFood();
        
        // Tocar som
        this.audioManager.play('start');
    }
    
    spawnFood() {
        let validPosition = false;
        let x, y;
        
        while (!validPosition) {
            x = Phaser.Math.Between(GameConfig.MARGIN, GameConfig.GAME_WIDTH - GameConfig.MARGIN - GameConfig.GRID_SIZE);
            y = Phaser.Math.Between(GameConfig.MARGIN, GameConfig.GAME_HEIGHT - GameConfig.MARGIN - GameConfig.GRID_SIZE);
            
            // Alinhar à grid
            x = Math.round(x / GameConfig.GRID_SIZE) * GameConfig.GRID_SIZE;
            y = Math.round(y / GameConfig.GRID_SIZE) * GameConfig.GRID_SIZE;
            
            // Verificar se não está na cobra
            validPosition = !this.snake.collidesWithBody(x, y);
            
            // Verificar se não está em obstáculos
            if (validPosition) {
                this.obstacles.children.entries.forEach(obs => {
                    if (obs.x === x && obs.y === y) {
                        validPosition = false;
                    }
                });
            }
        }
        
        this.food.spawn(x, y);
    }
    
    update(time, delta) {
        if (this.gameOver || this.paused) return;
        
        // Processar controles
        const direction = this.controls.getDirection();
        if (direction) {
            this.snake.setDirection(direction);
        }
        
        // Loop de movimento baseado no nível
        const moveInterval = Math.max(50, GameConfig.BASE_MOVE_INTERVAL - (this.level - 1) * 5);
        
        if (time > this.lastMove + moveInterval) {
            this.lastMove = time;
            this.updateGame();
        }
    }
    
    updateGame() {
        // Mover cobra
        const result = this.snake.move();
        
        if (result.collision) {
            this.endGame();
            return;
        }
        
        // Verificar coleta de comida
        if (result.ateFood) {
            this.collectFood();
        }
        
        // Verificar colisão com obstáculos
        if (this.checkObstacleCollision()) {
            this.endGame();
        }
    }
    
    collectFood() {
        this.score += GameConfig.POINTS_PER_FOOD * this.level;
        this.uiManager.updateScore(this.score);
        
        this.audioManager.play('eat');
        
        // Verificar level up
        const newLevel = Math.floor(this.score / GameConfig.SCORE_PER_LEVEL) + 1;
        if (newLevel > this.level) {
            this.levelUp(newLevel);
        }
        
        // Spawnar nova comida
        this.spawnFood();
    }
    
    levelUp(newLevel) {
        this.level = newLevel;
        this.uiManager.updateLevel(this.level);
        
        this.audioManager.play('levelup');
        
        // Adicionar obstáculo a cada 3 níveis
        if (this.level % 3 === 0) {
            this.spawnObstacle();
        }
        
        // Mostrar feedback
        this.uiManager.showLevelUp(this.level);
    }
    
    spawnObstacle() {
        let validPosition = false;
        let x, y;
        let attempts = 0;
        
        while (!validPosition && attempts < 50) {
            x = Phaser.Math.Between(GameConfig.MARGIN, GameConfig.GAME_WIDTH - GameConfig.MARGIN - GameConfig.GRID_SIZE);
            y = Phaser.Math.Between(GameConfig.MARGIN, GameConfig.GAME_HEIGHT - GameConfig.MARGIN - GameConfig.GRID_SIZE);
            
            x = Math.round(x / GameConfig.GRID_SIZE) * GameConfig.GRID_SIZE;
            y = Math.round(y / GameConfig.GRID_SIZE) * GameConfig.GRID_SIZE;
            
            validPosition = !this.snake.collidesWithBody(x, y) &&
                        !(this.food.x === x && this.food.y === y) &&
                        !this.snake.collidesWithHead(x, y);
            
            attempts++;
        }
        
        if (validPosition) {
            Obstacle.create(this, x, y, this.obstacles);
        }
    }
    
    checkObstacleCollision() {
        let collision = false;
        
        this.obstacles.children.entries.forEach(obs => {
            if (this.snake.collidesWithHead(obs.x, obs.y)) {
                collision = true;
            }
        });
        
        return collision;
    }
    
    endGame() {
        this.gameOver = true;
        this.isRunning = false;
        
        this.audioManager.play('gameover');
        
        // Salvar high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.storageManager.setHighScore(this.highScore);
        }
        
        this.uiManager.showGameOver(this.score, this.highScore);
    }
}