/**
 * =====================================
 * GAME SCENE - BOMBERMAN STYLE COM TILEMAP
 * =====================================
 * 
 * Jogo estilo Bomberman com tile map realista.
 */

import TILES from './TileMapManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        this.tileMap = null;
        
        this.player = null;
        this.bombs = [];
        this.explosions = [];
        
        this.score = 0;
        this.highScore = 0;
        this.gameOver = false;
        this.isRunning = false;
        
        this.lastMove = 0;
    }
    
    create() {
        console.log('🎨 Criando mapa realista...');
        
        // Storage para high score
        this.highScore = this.getHighScore();
        
        // Criar tile map
        this.tileMap = new (require('./TileMapManager.js').default)(this);
        this.tileMap.buildMap();
        
        // Criar controles
        this.controls = new (require('./Controls.js').default)(this);
        
        // Criar gerenciador de áudio
        this.audioManager = new (require('./AudioManager.js').default)(this);
        
        // UI
        this.uiManager = new (require('./UIManager.js').default)(this);
        
        // Criar jogador
        this.createPlayer();
        
        // Mostrar menu
        this.uiManager.showMenu(this.highScore);
        
        console.log('🎨 Mapa créé com sucesso!');
    }
    
    createPlayer() {
        const startX = 1 * 20 + 10;
        const startY = 1 * 20 + 10;
        
        const player = this.add.graphics();
        
        // Sombra
        player.fillStyle(0x000022, 0.5);
        player.fillCircle(startX + 2, startY + 2, 8);
        
        // Corpo (circulo)
        player.fillStyle(0x4a4aaa, 1);
        player.fillCircle(startX, startY, 8);
        
        // Detalhe (capacete)
        player.fillStyle(0x6a6aaa, 1);
        player.fillCircle(startX, startY - 2, 5);
        
        // Visor
        player.fillStyle(0x2a2a6a, 1);
        player.fillCircle(startX, startY - 2, 3);
        
        player.setDepth(20);
        
        this.player = {
            gridX: 1,
            gridY: 1,
            sprite: player,
            x: startX,
            y: startY
        };
    }
    
    update(time, delta) {
        if (this.gameOver) return;
        
        if (!this.isRunning) return;
        
        // Input do jogador
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
            }
        }
    }
    
    movePlayer(gridX, gridY) {
        const oldX = this.player.gridX;
        const oldY = this.player.gridY;
        
        // Atualizar posição
        this.player.gridX = gridX;
        this.player.gridY = gridY;
        
        // Animar visual
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
            }
        });
        
        // Efeito de poeira
        this.createDustEffect(oldX * 20 + 10, oldY * 20 + 10);
    }
    
    createDustEffect(x, y) {
        for (let i = 0; i < 3; i++) {
            const dust = this.add.graphics();
            dust.fillStyle(0x8a7a6a, 0.4);
            dust.fillCircle(
                x + (Math.random() - 0.5) * 10,
                y + (Math.random() - 0.5) * 10,
                Math.random() * 3
            );
            
            this.tweens.add({
                targets: dust,
                y: y - 10,
                alpha: 0,
                duration: 300,
                onComplete: () => dust.destroy()
            });
        }
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
        
        // Animação de pulsar
        this.tweens.add({
            targets: bomb,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 150,
            yoyo: true,
            repeat: 20
        });
        
        this.bombs.push({
            gridX: gridX,
            gridY: gridY,
            sprite: bomb,
            time: 0,
            exploded: false
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
                
                // Verificar limites
                if (targetX < 0 || targetX >= 15 || targetY < 0 || targetY >= 11) break;
                
                const tile = this.tileMap.getTile(targetX, targetY);
                
                if (tile && tile.type === TILES.WALL_INDESTRUCTIBLE) break;
                
                if (tile && tile.type === TILES.WALL_DESTRUCTIBLE) {
                    this.tileMap.removeBlock(targetX, targetY);
                    
                    if (i > 0) {
                        this.player.gridX = targetX;
                        this.player.gridY = targetY;
                        this.endGame();
                    }
                    break;
                }
                
                // Criar explosão visual
                if (i <= range) {
                    this.createExplosion(targetX, targetY);
                }
            }
        });
        
        // Remover bomba
        const bombIndex = this.bombs.findIndex(b => b.gridX === gridX && b.gridY === gridY);
        if (bombIndex !== -1) {
            this.bombs[bombIndex].sprite.destroy();
            this.bombs.splice(bombIndex, 1);
        }
        
        // Câmera shake
        this.cameras.main.shake(150, 0.01);
        
        // Verificar se jogador foi atingido
        this.bombs.forEach(bomb => {
            // Explosão atinge jogador?
        });
    }
    
    createExplosion(gridX, gridY) {
        const x = gridX * 20 + 10;
        const y = gridY * 20 + 10;
        
        // Flash
        const flash = this.add.graphics();
        flash.fillStyle(0xffffff, 0.9);
        flash.fillCircle(x, y, 15);
        flash.setDepth(50);
        
        this.tweens.add({
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
        fire.fillStyle(0xffff00, 0.6);
        fire.fillCircle(x, y, 8);
        fire.setDepth(51);
        
        this.tweens.add({
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
        
        this.uiManager.showGameOver(this.score, this.highScore);
        
        //屏幕shake kuat
        this.cameras.main.shake(500, 0.03);
    }
    
    startGame() {
        if (this.isRunning) return;
        
        this.uiManager.hideMenu();
        
        this.score = 0;
        this.gameOver = false;
        this.isRunning = true;
        
        // Resetar posição do jogador
        this.player.gridX = 1;
        this.player.gridY = 1;
        this.player.sprite.setPosition(30, 30);
        
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
    
    // High Score
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
    
    // Controls
    enableControls() {
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
    
    shutdown() {
        // Cleanup
    }
}