/**
 * =====================================
 * GAME SCENE - COMPLETO COM TILEMAP + LIGHTING
 * =====================================
 */

import TILES from './TileMapManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        this.tileMap = null;
        this.lighting = null;
        
        this.player = null;
        this.bombs = [];
        
        this.score = 0;
        this.highScore = 0;
        this.gameOver = false;
        this.isRunning = false;
        
        this.lastMove = 0;
    }
    
    create() {
        console.log('🎮 Inicializando jogo...');
        
        // High score
        this.highScore = this.getHighScore();
        
        // Tilemap
        this.tileMap = new (require('./TileMapManager.js').default)(this);
        this.tileMap.buildMap();
        
        // Iluminação
        this.lighting = new (require('./LightingManager.js').default)(this, {
            ambient: { r: 0.1, g: 0.1, b: 0.15 },
            ambientIntensity: 0.5
        });
        this.lighting.enable();
        
        // Controles
        this.controls = new (require('./Controls.js').default)(this);
        
        // Áudio
        this.audioManager = new (require('./AudioManager.js').default)(this);
        
        // UI
        this.uiManager = new (require('./UIManager.js').default)(this);
        
        // Jogador
        this.createPlayer();
        
        // Menu inicial
        this.uiManager.showMenu(this.highScore);
        
        // Setup controls
        this.setupControls();
        
        console.log('🎮 Jogo pronto!');
    }
    
    createPlayer() {
        const x = 1 * 20 + 10;
        const y = 1 * 20 + 10;
        
        const player = this.add.graphics();
        
        // Sombra
        player.fillStyle(0x000022, 0.5);
        player.fillCircle(x + 2, y + 2, 8);
        
        // Corpo
        player.fillStyle(COLORS.PLAYER, 1);
        player.fillCircle(x, y, 8);
        
        // Capacete
        player.fillStyle(COLORS.PLAYER_DETAIL, 1);
        player.fillCircle(x, y - 2, 5);
        
        // Visor
        player.fillStyle(0x2a2a6a, 1);
        player.fillCircle(x, y - 2, 3);
        
        player.setDepth(20);
        
        this.player = {
            gridX: 1,
            gridY: 1,
            sprite: player,
            x: x,
            y: y
        };
        
        // Glow do jogador
        this.lighting.updatePlayerGlow(x, y, true);
    }
    
    update(time, delta) {
        if (this.gameOver || !this.isRunning) return;
        
        // Input
        const direction = this.controls.getDirection();
        
        if (direction) {
            const moveInterval = Math.max(50, 120 - this.score / 100 * 5);
            
            if (time > this.lastMove + moveInterval) {
                this.lastMove = time;
                
                const newX = this.player.gridX + direction.x;
                const newY = this.player.gridY + direction.y;
                
                if (this.tileMap.isWalkable(newX, newY)) {
                    this.movePlayer(newX, newY);
                }
            }
        }
        
        // Atualizar bombas
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            bomb.time += delta;
            
            if (bomb.time > 3000 && !bomb.exploded) {
                bomb.exploded = true;
                this.explodeBomb(bomb.gridX, bomb.gridY);
                
                if (bomb.lightRef && bomb.lightRef.stopPulse) {
                    bomb.lightRef.stopPulse();
                }
            }
        }
    }
    
    movePlayer(gridX, gridY) {
        this.player.gridX = gridX;
        this.player.gridY = gridY;
        
        const targetX = gridX * 20 + 10;
        const targetY = gridY * 20 + 10;
        
        this.scene.tweens.add({
            targets: this.player.sprite,
            x: targetX,
            y: targetY,
            duration: 70,
            ease: 'Linear',
            onComplete: () => {
                this.player.x = targetX;
                this.player.y = targetY;
                this.lighting.updatePlayerGlow(targetX, targetY, true);
            }
        });
    }
    
    placeBomb() {
        if (this.gameOver || !this.isRunning) return;
        
        const gridX = this.player.gridX;
        const gridY = this.player.gridY;
        
        // Verificar se já tem bomba
        if (this.bombs.some(b => b.gridX === gridX && b.gridY === gridY)) return;
        
        const x = gridX * 20 + 10;
        const y = gridY * 20 + 10;
        
        const bomb = this.add.graphics();
        bomb.fillStyle(0x2a2a2a, 1);
        bomb.fillCircle(x, y, 9);
        bomb.fillStyle(0x4a4a4a, 1);
        bomb.fillCircle(x, y, 7);
        bomb.fillStyle(0x6a6a6a, 0.8);
        bomb.fillCircle(x, y, 4);
        
        bomb.setDepth(15);
        
        // Luz da bomba
        const lightRef = this.lighting.createBombLight(x, y);
        
        // Animação pulsar
        this.scene.tweens.add({
            targets: bomb,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 150,
            yoyo: true,
            repeat: 20
        });
        
        this.bombs.push({
            gridX, gridY,
            sprite: bomb,
            time: 0,
            exploded: false,
            lightRef
        });
    }
    
    explodeBomb(gridX, gridY) {
        const range = 2;
        
        const directions = [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];
        
        directions.forEach(dir => {
            for (let i = 0; i <= range; i++) {
                if (i === 0 && (dir.x !== 0 || dir.y !== 0)) continue;
                
                const targetX = gridX + dir.x * i;
                const targetY = gridY + dir.y * i;
                
                if (targetX < 0 || targetX >= 15 || targetY < 0 || targetY >= 11) break;
                
                const tile = this.tileMap.getTile(targetX, targetY);
                
                if (tile && tile.type === TILES.WALL_INDESTRUCTIBLE) break;
                
                if (tile && tile.type === TILES.WALL_DESTRUCTIBLE) {
                    this.tileMap.removeBlock(targetX, targetY);
                    if (i > 0) {
                        this.endGame();
                    }
                    break;
                }
                
                if (i <= range) {
                    this.createExplosion(targetX, targetY);
                }
            }
        });
        
        // Remover bomba original
        const bombIndex = this.bombs.findIndex(b => b.gridX === gridX && b.gridY === gridY);
        if (bombIndex !== -1) {
            this.bombs[bombIndex].sprite.destroy();
            this.bombs.splice(bombIndex, 1);
        }
        
        // Câmera shake
        this.cameras.main.shake(150, 0.01);
        
        // Efeito de luz
        this.lighting.createExplosionLight(gridX * 20 + 10, gridY * 20 + 10);
    }
    
    createExplosion(gridX, gridY) {
        const x = gridX * 20 + 10;
        const y = gridY * 20 + 10;
        
        // Flash
        const flash = this.add.graphics();
        flash.fillStyle(0xffffff, 0.9);
        flash.fillCircle(x, y, 15);
        flash.setDepth(100);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 2,
            duration: 200,
            onComplete: () => flash.destroy()
        });
        
        // Fogo
        const fire = this.add.graphics();
        fire.fillStyle(0xff6600, 0.8);
        fire.fillCircle(x, y, 12);
        fire.fillStyle(0xffaa00, 0.6);
        fire.fillCircle(x, y, 8);
        fire.setDepth(101);
        
        this.scene.tweens.add({
            targets: fire,
            alpha: 0,
            scale: 1.5,
            duration: 300,
            onComplete: () => fire.destroy()
        });
        
        // Score
        this.score += 10;
        this.uiManager.updateScore(this.score);
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
        this.cameras.main.shake(500, 0.03);
        this.uiManager.showGameOver(this.score, this.highScore);
    }
    
    startGame() {
        if (this.isRunning) return;
        
        this.uiManager.hideMenu();
        
        this.score = 0;
        this.gameOver = false;
        this.isRunning = true;
        
        // Reset jogador
        this.player.gridX = 1;
        this.player.gridY = 1;
        this.player.sprite.setPosition(30, 30);
        this.lighting.updatePlayerGlow(30, 30, true);
        
        // Remover bombas
        this.bombs.forEach(b => b.sprite.destroy());
        this.bombs.length = 0;
        
        // Rebuild map
        this.tileMap.destroy();
        this.tileMap = new (require('./TileMapManager.js').default)(this);
        this.tileMap.buildMap();
        this.tileMap.removeBlock(1, 1);
        this.tileMap.removeBlock(1, 2);
        this.tileMap.removeBlock(2, 1);
        
        this.uiManager.updateScore(0);
        this.audioManager.play('start');
    }
    
    setupControls() {
        this.input.keyboard.on('keydown', (e) => {
            if (e.key === ' ' && !this.gameOver && this.isRunning) {
                this.placeBomb();
            }
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
            return parseInt(localStorage.getItem('bomber-highscore') || '0', 10);
        } catch {
            return 0;
        }
    }
    
    setHighScore(score) {
        try {
            localStorage.setItem('bomber-highscore', score.toString());
        } catch {}
    }
    
    shutdown() {
        if (this.tileMap) this.tileMap.destroy();
        if (this.lighting) this.lighting.destroy();
    }
}