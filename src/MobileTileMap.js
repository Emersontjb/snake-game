/**
 * =====================================
 * MOBILE TILEMAP (OTIMIZADO)
 * =====================================
 * 
 * Sistema de tilemap otimizado para mobile:
 * - Grid claramente visível
 * - Texturas simplificadas
 * - Sem shaders pesados
 * - Renderização rápida
 */

import Phaser from 'phaser';

// =====================================
// CONSTANTES SIMPLIFICADAS
// =====================================

export const TILES = {
    EMPTY: 0,
    GROUND: 1,
    WALL_SOLID: 2,
    WALL_BLOCK: 3,
    BOMB: 4,
    EXPLOSION: 5
};

const COLORS = {
    GROUND: 0x2a2a2a,
    GROUND_GRID: 0x3a3a3a,
    GRID_LINE: 0x353535,
    
    WALL: 0x5a5a5a,
    WALL_BORDER: 0x4a4a4a,
    
    BLOCK: 0x7a6a5a,
    BLOCK_BRICK: 0x6a5a4a,
    
    BOMB: 0x2a2a2a,
    BOMB_DETAIL: 0x4a4a4a,
    
    EXPLOSION: 0xff5500,
    EXPLOSION_CORE: 0xffaa00,
    
    PLAYER: 0x4a4a9a,
    PLAYER_DETAIL: 0x6a6aaa
};

// =====================================
// CLASSE PRINCIPAL
// =====================================

export default class MobileTileMap {
    constructor(scene) {
        this.scene = scene;
        
        this.gridWidth = 15;
        this.gridHeight = 11;
        this.tileSize = 20;
        
        this.map = [];
        
        this.create();
    }
    
    create() {
        // Criar texturas simples (optimizado para mobile)
        this.createSimpleTextures();
        
        // Inicializar mapa
        this.initMap();
    }
    
    // =====================================
    // TEXTURAS SIMPLES (MOBILE)
    // =====================================
    
    createSimpleTextures() {
        const size = this.tileSize;
        
        // Chão com grid visible
        const groundGraphics = this.scene.make.graphics({ x: 0, y: 0 });
        groundGraphics.fillStyle(COLORS.GROUND, 1);
        groundGraphics.fillRect(0, 0, size, size);
        
        // Grid lines (importante para gameplay!)
        groundGraphics.lineStyle(1, COLORS.GRID_LINE, 1);
        groundGraphics.strokeRect(0, 0, size, size);
        
        groundGraphics.generateTexture('ground', size, size);
        groundGraphics.destroy();
        
        // Parede sólida
        const wallGraphics = this.scene.make.graphics({ x: 0, y: 0 });
        wallGraphics.fillStyle(COLORS.WALL, 1);
        wallGraphics.fillRect(0, 0, size, size);
        
        // Borda
        wallGraphics.lineStyle(2, COLORS.WALL_BORDER, 1);
        wallGraphics.strokeRect(1, 1, size - 2, size - 2);
        
        wallGraphics.generateTexture('wall', size, size);
        wallGraphics.destroy();
        
        // Bloco destrutível
        const blockGraphics = this.scene.make.graphics({ x: 0, y: 0 });
        blockGraphics.fillStyle(COLORS.BLOCK, 1);
        blockGraphics.fillRect(0, 0, size, size);
        
        // Padrão tijelo simples
        blockGraphics.lineStyle(1, COLORS.BLOCK_BRICK, 0.5);
        blockGraphics.moveTo(0, size * 0.5);
        blockGraphics.lineTo(size, size * 0.5);
        blockGraphics.moveTo(size * 0.5, 0);
        blockGraphics.lineTo(size * 0.5, size * 0.5);
        blockGraphics.strokePath();
        
        // Borda sutil
        blockGraphics.lineStyle(1, COLORS.WALL_BORDER, 0.5);
        blockGraphics.strokeRect(1, 1, size - 2, size - 2);
        
        blockGraphics.generateTexture('block', size, size);
        blockGraphics.destroy();
        
        console.log('🎨 Texturas mobile criadas');
    }
    
    initMap() {
        for (let y = 0; y < this.gridHeight; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.map[y][x] = null;
            }
        }
    }
    
    // =====================================
    // CONSTRUÇÃO DO MAPA
    // =====================================
    
    buildMap() {
        //Limpar existente
        this.clearMap();
        
        // Criar chão com grid visible
        this.createGround();
        
        // Criar paredes
        this.createBorderWalls();
        
        // Criar grid interno
        this.createInternalWalls();
    }
    
    clearMap() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.map[y][x] && this.map[y][x].sprite) {
                    this.map[y][x].sprite.destroy();
                }
            }
        }
        this.initMap();
    }
    
    createGround() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                // NÃO criar sprite para chão
                // Usar fundo único com grid lines
            }
        }
    }
    
    createBorderWalls() {
        for (let x = 0; x < this.gridWidth; x++) {
            this.addWall(x, 0);
            this.addWall(x, this.gridHeight - 1);
        }
        
        for (let y = 1; y < this.gridHeight - 1; y++) {
            this.addWall(0, y);
            this.addWall(this.gridWidth - 1, y);
        }
    }
    
    createInternalWalls() {
        // Grid estilo Bomberman (paredes fixas)
        for (let x = 2; x < this.gridWidth - 2; x += 2) {
            for (let y = 2; y < this.gridHeight - 2; y += 2) {
                this.addWall(x, y);
            }
        }
        
        // Blocos aleatórios (destrutíveis)
        for (let x = 1; x < this.gridWidth - 1; x++) {
            for (let y = 1; y < this.gridHeight - 1; y++) {
                // Área segura do jogador
                if ((x <= 2 && y <= 2) || (x >= this.gridWidth - 3 && y >= this.gridHeight - 3)) {
                    continue;
                }
                
                // Pular se já tem parede
                if (this.map[y][x] && this.map[y][x].type === TILES.WALL_SOLID) {
                    continue;
                }
                
                // Chance de bloco
                if (Math.random() < 0.35) {
                    this.addBlock(x, y);
                }
            }
        }
    }
    
    addWall(gridX, gridY) {
        if (this.map[gridY][gridX]) return;
        
        const sprite = this.scene.add.image(
            gridX * this.tileSize,
            gridY * this.tileSize,
            'wall'
        );
        
        this.map[gridY][gridX] = {
            type: TILES.WALL_SOLID,
            sprite: sprite
        };
    }
    
    addBlock(gridX, gridY) {
        if (this.map[gridY][gridX]) return;
        
        const sprite = this.scene.add.image(
            gridX * this.tileSize,
            gridY * this.tileSize,
            'block'
        );
        
        this.map[gridY][gridX] = {
            type: TILES.WALL_BLOCK,
            sprite: sprite,
            health: 1
        };
    }
    
    removeBlock(gridX, gridY) {
        const tile = this.map[gridY][gridX];
        if (!tile || tile.type !== TILES.WALL_BLOCK) return;
        
        tile.sprite.destroy();
        this.map[gridY][gridX] = null;
    }
    
    // =====================================
    // GAMEPLAY HELPERS
    // =====================================
    
    isWalkable(gridX, gridY) {
        if (gridX < 0 || gridX >= this.gridWidth ||
            gridY < 0 || gridY >= this.gridHeight) return false;
        
        return !this.map[gridY][gridX];
    }
    
    canDestroy(gridX, gridY) {
        const tile = this.map[gridY][gridX];
        return tile && tile.type === TILES.WALL_BLOCK;
    }
    
    destroy() {
        this.clearMap();
        
        // Remover texturas
        ['ground', 'wall', 'block'].forEach(name => {
            if (this.scene.textures.exists(name)) {
                this.scene.textures.remove(name);
            }
        });
    }
}