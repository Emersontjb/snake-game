/**
 * =====================================
 * GAME SCENE - BOMBERMAN STYLE
 * =====================================
 * 
 * Jogo com estética semi-realista
 * estilo Bomberman.
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
import VisualStyleManager from './VisualStyleManager.js';

// =====================================
// CONSTANTES DO BOMBERMAN
// =====================================

const TILE_SIZE = 20;
const GRID_WIDTH = 15;
const GRID_HEIGHT = 11;

const TILES = {
    EMPTY: 0,
    WALL_SOLID: 1,
    WALL_BLOCK: 2,
    BOMB: 3,
    FIRE: 4,
    PLAYER: 5,
    ENEMY: 6
};

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // =====================================
        // COMPONENTES
        // =====================================
        
        this.grid = [];
        this.walls = [];
        this.blocks = [];
        this.bombs = [];
        this.explosions = [];
        
        this.player = null;
        
        this.visualManager = null;
        
        this.score = 0;
        this.highScore = 0;
        this.lives = 3;
        this.level = 1;
        this.gameOver = false;
        this.isRunning = false;
        
        this.lastMove = 0;
    }
    
    create() {
        console.log('🎨 Criando estilo Bomberman...');
        
        // Inicializar gerenciadores
        this.storageManager = new StorageManager();
        this.highScore = this.storageManager.getHighScore();
        
        this.audioManager = new AudioManager(this);
        this.uiManager = new UIManager(this);
        this.controls = new Controls(this);
        this.performance = new PerformanceManager(this);
        
        // =====================================
        // VISUAL STYLE
        // =====================================
        
        this.visualManager = new VisualStyleManager(this);
        
        // =====================================
        // CRIAR MAPA
        // =====================================
        
        this.createMap();
        
        // =====================================
        // CRIAR JOGADOR
        // =====================================
        
        this.createPlayer();
        
        // =====================================
        // MOSTRAR MENU
        // =====================================
        
        this.uiManager.showMenu(this.highScore);
        
        console.log('🎨 Estilo aplicado!');
    }
    
    // =====================================
    // MAPA DO JOGO
    // =====================================
    
    createMap() {
        const gridWidth = GRID_WIDTH;
        const gridHeight = GRID_HEIGHT;
        
        // Inicializar grid
        for (let y = 0; y < gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < gridWidth; x++) {
                this.grid[y][x] = TILES.EMPTY;
            }
        }
        
        // Criar paredes da fronteira
        for (let x = 0; x < gridWidth; x++) {
            this.addWall(x, 0);
            this.addWall(x, gridHeight - 1);
        }
        
        for (let y = 1; y < gridHeight - 1; y++) {
            this.addWall(0, y);
            this.addWall(gridWidth - 1, y);
        }
        
        // Criar grade interna (estilo Bomberman)
        for (let x = 1; x < gridWidth - 1; x++) {
            for (let y = 1; y < gridHeight - 1; y++) {
                if (x % 2 === 0 && y % 2 === 0) {
                    this.addWall(x, y);
                } else if (Math.random() < 0.4) {
                    // 40% de chance de bloco destrutível
                    if (x > 1 || y > 1) {
                        this.addBlock(x, y);
                    }
                }
            }
        }
        
        // Área segura para jogador (canto superior esquerdo)
        this.clearArea(1, 1);
        this.clearArea(2, 1);
        this.clearArea(1, 2);
    }
    
    addWall(gridX, gridY) {
        const x = gridX * TILE_SIZE;
        const y = gridY * TILE_SIZE;
        
        const wall = this.add.graphics();
        
        // Usar textura criada
        if (this.visualManager && this.scene.textures.exists('wall')) {
            wall.setTexture('wall');
            wall.setPosition(x, y);
        } else {
            // Fallback: desenhar manualmente
            wall.fillStyle(0x5a5a5a, 1);
            wall.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            
            // Borda 3D
            wall.lineStyle(1, 0x6a6a6a, 0.8);
            wall.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        }
        
        this.walls.push({ x: gridX, y: gridY, sprite: wall });
        this.grid[gridY][gridX] = TILES.WALL_SOLID;
    }
    
    addBlock(gridX, gridY) {
        const x = gridX * TILE_SIZE;
        const y = gridY * TILE_SIZE;
        
        const block = this.add.graphics();
        
        if (this.visualManager && this.scene.textures.exists('block')) {
            block.setTexture('block');
            block.setPosition(x, y);
        } else {
            // Estilo Tijolo
            block.fillStyle(0x7a6a5a, 1);
            block.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            
            // Linhas de tijolo
            block.lineStyle(1, 0x6a5a4a, 0.5);
            block.moveTo(x, y + TILE_SIZE * 0.33);
            block.lineTo(x + TILE_SIZE, y + TILE_SIZE * 0.33);
            block.moveTo(x, y + TILE_SIZE * 0.66);
            block.lineTo(x + TILE_SIZE, y + TILE_SIZE * 0.66);
            block.strokePath();
            
            // Borda 3D
            block.lineStyle(1, 0x6a6a6a, 0.5);
            block.moveTo(x + 1, y + 1);
            block.lineTo(x + TILE_SIZE - 1, y + 1);
            block.lineStyle(1, 0x4a4a4a, 0.8);
            block.lineTo(x + TILE_SIZE - 1, y + TILE_SIZE - 1);
            block.lineTo(x + 1, y + TILE_SIZE - 1);
            block.strokePath();
        }
        
        this.blocks.push({ x: gridX, y: gridY, sprite: block, health: 1 });
        this.grid[gridY][gridX] = TILES.WALL_BLOCK;
    }
    
    clearArea(gridX, gridY) {
        this.grid[gridY][gridX] = TILES.EMPTY;
    }
    
    // =====================================
    // JOGADOR
    // =====================================
    
    createPlayer() {
        const x = TILE_SIZE;
        const y = TILE_SIZE;
        
        const player = this.add.graphics();
        
        // Corpo (círculo com sombre)
        player.fillStyle(0x3a3a8a, 1);
        player.fillCircle(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 2 - 2);
        
        // Sombra
        player.fillStyle(0x000022, 0.4);
        player.fillCircle(x + TILE_SIZE / 2 + 2, y + TILE_SIZE / 2 + 2, TILE_SIZE / 2 - 2);
        
        // Detalhe (capacete/lua)
        player.fillStyle(0x5a5aaa, 1);
        player.fillCircle(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE / 4);
        
        player.setDepth(10);
        
        this.player = { x: 1, y: 1, sprite: player };
    }
    
    // =====================================
    // UPDATE
    // =====================================
    
    update(time, delta) {
        if (this.gameOver) return;
        
        // Cap delta
        delta = Math.min(delta, 50);
        
        // Monitorar performance
        this.performance.update(time, delta);
        
        // Movimento do jogador
        this.handlePlayerInput(time);
        
        // Atualizar bombas
        this.updateBombs(time);
        
        // Atualizar explosões
        this.updateExplosions(time);
    }
    
    handlePlayerInput(time) {
        const direction = this.controls.getDirection();
        
        if (!direction) return;
        
        const moveInterval = 150;
        
        if (time > this.lastMove + moveInterval) {
            this.lastMove = time;
            
            const newX = this.player.x + direction.x;
            const newY = this.player.y + direction.y;
            
            // Verificar colisão
            if (this.canMoveTo(newX, newY)) {
                this.movePlayer(newX, newY);
            }
        }
    }
    
    canMoveTo(gridX, gridY) {
        if (gridX < 0 || gridX >= GRID_WIDTH) return false;
        if (gridY < 0 || gridY >= GRID_HEIGHT) return false;
        
        const tile = this.grid[gridY][gridX];
        return tile === TILES.EMPTY;
    }
    
    movePlayer(gridX, gridY) {
        // Atualizar posição lógica
        this.player.x = gridX;
        this.player.y = gridY;
        
        // Atualizar posição visual
        const x = gridX * TILE_SIZE;
        const y = gridY * TILE_SIZE;
        
        this.scene.tweens.add({
            targets: this.player.sprite,
            x: x,
            y: y,
            duration: 80,
            ease: 'Linear'
        });
        
        // Efeito de poeira
        if (this.visualManager) {
            this.visualManager.createDustEffect(x, y);
        }
    }
    
    // =====================================
    // BOMBAS
    // =====================================
    
    placeBomb() {
        const gridX = this.player.x;
        const gridY = this.player.y;
        
        const x = gridX * TILE_SIZE + TILE_SIZE / 2;
        const y = gridY * TILE_SIZE + TILE_SIZE / 2;
        
        const bomb = this.add.graphics();
        bomb.fillStyle(0x1a1a1a, 1);
        bomb.fillCircle(x, y, TILE_SIZE / 2 - 2);
        bomb.fillStyle(0x4a4a4a, 1);
        bomb.fillCircle(x, y, TILE_SIZE / 3 - 2);
        bomb.fillStyle(0x666666, 0.8);
        bomb.fillCircle(x, y, TILE_SIZE / 5);
        
        bomb.setDepth(5);
        
        // Animação de pulsar
        this.tweens.add({
            targets: bomb,
            scale: 1.2,
            duration: 200,
            yoyo: true,
            repeat: 4
        });
        
        // explosion após 3 segundos
        this.time.delayedCall(3000, () => {
            this.explodeBomb(gridX, gridY);
            bomb.destroy();
        });
        
        this.bombs.push({
            x: gridX,
            y: gridY,
            sprite: bomb,
            range: 2
        });
    }
    
    explodeBomb(gridX, gridY) {
        const range = 2;
        
        // Remover bomba
        const bombIndex = this.bombs.findIndex(b => b.x === gridX && b.y === gridY);
        if (bombIndex !== -1) {
            this.bombs.splice(bombIndex, 1);
        }
        
        // Criar explosão
        this.createExplosion(gridX, gridY);
        
        // Direções da explosão
        const directions = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];
        
        directions.forEach(dir => {
            for (let i = 1; i <= range; i++) {
                const targetX = gridX + dir.x * i;
                const targetY = gridY + dir.y * i;
                
                // Parar se atingir borda
                if (targetX < 0 || targetX >= GRID_WIDTH ||
                    targetY < 0 || targetY >= GRID_HEIGHT) break;
                
                const tile = this.grid[targetY][targetX];
                
                if (tile === TILES.WALL_SOLID) break;
                
                if (tile === TILES.WALL_BLOCK) {
                    this.destroyBlock(targetX, targetY);
                    break;
                }
                
                if (i <= range) {
                    this.createExplosion(targetX, targetY);
                }
            }
        });
        
        // Câmera shake
        if (this.visualManager) {
            this.visualManager.shakeCamera(0.01, 200);
        }
    }
    
    createExplosion(gridX, gridY) {
        const x = gridX * TILE_SIZE + TILE_SIZE / 2;
        const y = gridY * TILE_SIZE + TILE_SIZE / 2;
        
        const explosion = this.add.graphics();
        explosion.fillStyle(0xff4400, 0.9);
        explosion.fillCircle(x, y, TILE_SIZE / 2);
        explosion.fillStyle(0xffff00, 0.7);
        explosion.fillCircle(x, y, TILE_SIZE / 3);
        explosion.setDepth(15);
        
        this.explosions.push({
            x: gridX,
            y: gridY,
            sprite: explosion,
            time: 0
        });
        
        // Efeito visual
        if (this.visualManager) {
            this.visualManager.createExplosionEffect(x - TILE_SIZE / 2, y - TILE_SIZE / 2);
        }
    }
    
    destroyBlock(gridX, gridY) {
        const blockIndex = this.blocks.findIndex(b => b.x === gridX && b.y === gridY);
        
        if (blockIndex !== -1) {
            const block = this.blocks[blockIndex];
            
            if (this.visualManager) {
                this.visualManager.createExplosionEffect(
                    block.sprite.x,
                    block.sprite.y
                );
            }
            
            block.sprite.destroy();
            this.blocks.splice(blockIndex, 1);
        }
        
        this.grid[gridY][gridX] = TILES.EMPTY;
    }
    
    updateBombs(time) {
        // Atualizar animação das bombas
    }
    
    updateExplosions(time) {
        // Remover explosões antigas
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const exp = this.explosions[i];
            exp.time += 16;
            
            if (exp.time > 300) {
                exp.sprite.destroy();
                this.explosions.splice(i, 1);
            }
        }
    }
    
    // =====================================
    // CONTROLS
    // =====================================
    
    enableBombControl() {
        const input = this.input;
        
        // Espaço para plantar bomba (desktop)
        input.keyboard.on('keydown', (event) => {
            if (event.key === ' ' && this.isRunning) {
                this.placeBomb();
            }
        });
        
        // Toque longo para bomba (mobile)
        if (this.controls && this.controls.isMobile) {
            // Adicionar gesture de long press
        }
    }
    
    // =====================================
    // GAME OVER / RESTART
    // =====================================
    
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
        this.lives = 3;
        this.level = 1;
        this.gameOver = false;
        this.isRunning = true;
        
        // Resetar posição
        this.player.x = 1;
        this.player.y = 1;
        this.player.sprite.setPosition(TILE_SIZE, TILE_SIZE);
        
        this.uiManager.updateScore(this.score);
        
        this.audioManager.play('start');
        
        this.enableBombControl();
    }
    
    // =====================================
    // CLEANUP
    // =====================================
    
    shutdown() {
        // Limpar gráficos
        this.walls.forEach(w => w.sprite.destroy());
        this.blocks.forEach(b => b.sprite.destroy());
        this.bombs.forEach(b => b.sprite.destroy());
        this.explosions.forEach(e => e.sprite.destroy());
        
        this.walls.length = 0;
        this.blocks.length = 0;
        this.bombs.length = 0;
        this.explosions.length = 0;
        
        if (this.visualManager) {
            this.visualManager.destroy();
        }
    }
}