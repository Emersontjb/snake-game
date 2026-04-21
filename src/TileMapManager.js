/**
 * =====================================
 * TILEMAP MANAGER
 * =====================================
 * 
 * Sistema completo de tilemap para jogo estilo Bomberman
 * com texturas realistas e variação visual.
 * 
 * CARACTERÍSTICAS:
 * - Grid estruturado (15x11)
 * - Múltiplos tipos de tiles
 * - Texturas procedurais
 * - Variação visual (seed-based)
 * - Camadas (chão, obstáculos, efeitos)
 * - Destructible blocks
 */

import Phaser from 'phaser';
import GameConfig from './GameConfig.js';

// =====================================
// TIPOS DE TILES
// =====================================

export const TILES = {
    EMPTY: 0,
    GROUND: 1,
    WALL_INDESTRUCTIBLE: 2,
    WALL_DESTRUCTIBLE: 3,
    WALL_METAL: 4,
    WALL_STONE: 5,
    WALL_WOOD: 6,
    WALL_DIRT: 7,
    BOMB: 8,
    EXPLOSION: 9,
    PLAYER: 10
};

// =====================================
// PALETA DE CORES
// =====================================

const COLORS = {
    // Chão
    GROUND: [0x3a3a3a, 0x3d3d3d, 0x404040],
    GROUND_ALT: [0x454545, 0x484848, 0x4a4a4a],
    
    // Pedra (indestrutível)
    STONE: [0x5a5a5a, 0x5c5c5c, 0x5e5e5e],
    STONE_DARK: [0x4a4a4a, 0x4c4c4c],
    STONE_LIGHT: [0x6a6a6a, 0x6c6c6c],
    
    // Metal
    METAL: [0x6a6a7a, 0x6c6c7c, 0x6e6e7e],
    METAL_RUST: [0x7a5a4a, 0x7c5c4c],
    METAL_SHINE: [0x8a8a9a, 0x9a9aaa],
    
    // Madeira
    WOOD: [0x7a5a3a, 0x7c5c3c, 0x7e5e3e],
    WOOD_DARK: [0x6a4a2a, 0x6c4c2c],
    WOOD_LIGHT: [0x8a6a4a, 0x8c6c4c],
    
    // Terra
    DIRT: [0x5a4a3a, 0x5c4c3c, 0x5e4e3e],
    DIRT_MOSS: [0x4a5a3a, 0x5a6a4a],
    DIRT_ROCK: [0x4a4a4a, 0x5a5a5a],
    
    // Destrutível (bloco)
    BLOCK: [0x8a7a6a, 0x8c7c6c],
    BLOCK_BRICK: [0x7a6a5a, 0x7c6c5c],
    BLOCK_CRUNCH: [0x6a5a4a, 0x6c5c4c]
};

export default class TileMapManager {
    constructor(scene) {
        this.scene = scene;
        
        // Dimensões do grid
        this.gridWidth = 15;
        this.gridHeight = 11;
        this.tileSize = 20;
        
        // Camadas
        this.groundLayer = [];
        this.objectLayer = [];
        this.effectLayer = [];
        
        // Containers
        this.groundContainer = null;
        this.objectContainer = null;
        this.effectContainer = null;
        
        // Seed para variação
        this.seed = Date.now();
        
        // Inicializar
        this.create();
    }
    
    create() {
        // Containers para camadas
        this.groundContainer = this.scene.add.container(0, 0);
        this.groundContainer.setDepth(0);
        
        this.objectContainer = this.scene.add.container(0, 0);
        this.objectContainer.setDepth(10);
        
        this.effectContainer = this.scene.add.container(0, 0);
        this.effectContainer.setDepth(100);
        
        // Gerar texturas
        this.generateTextures();
        
        // Inicializar camadas
        this.initLayers();
    }
    
    initLayers() {
        for (let y = 0; y < this.gridHeight; y++) {
            this.groundLayer[y] = [];
            this.objectLayer[y] = [];
            this.effectLayer[y] = [];
            
            for (let x = 0; x < this.gridWidth; x++) {
                this.groundLayer[y][x] = null;
                this.objectLayer[y][x] = null;
                this.effectLayer[y][x] = null;
            }
        }
    }
    
    // =====================================
    // SISTEMA DE SEED
    // =====================================
    
    seededRandom(x, y, index = 0) {
        const seed = this.seed + x * 1000 + y * 100 + index;
        const n = Math.sin(seed) * 10000;
        return n - Math.floor(n);
    }
    
    getVariation(x, y, variations = 3) {
        return Math.floor(this.seededRandom(x, y) * variations);
    }
    
    // =====================================
    // GERAÇÃO DE TEXTURAS
    // =====================================
    
    generateTextures() {
        // Texturas de chão
        this.generateGroundTextures();
        
        // Texturas de paredes
        this.generateWallTextures();
        
        // Texturas de blocos
        this.generateBlockTextures();
        
        console.log('🎨 Texturas geradas:', this.scene.textures.exists('ground_0'));
    }
    
    generateGroundTextures() {
        const size = this.tileSize;
        
        for (let variation = 0; variation < 4; variation++) {
            const graphics = this.scene.make.graphics({ x: 0, y: 0 });
            
            // Cor base com variação
            const baseColor = COLORS.GROUND[variation % COLORS.GROUND.length];
            const altColor = COLORS.GROUND_ALT[variation % COLORS.GROUND_ALT.length];
            
            // Preencher base
            graphics.fillStyle(baseColor, 1);
            graphics.fillRect(0, 0, size, size);
            
            // Detalhes (pedras pequenas)
            const numDetails = 8 + Math.floor(this.seededRandom(variation, 0) * 8);
            for (let i = 0; i < numDetails; i++) {
                const px = Math.floor(this.seededRandom(variation, i, 1) * (size - 4)) + 2;
                const py = Math.floor(this.seededRandom(variation, i, 2) * (size - 4)) + 2;
                const pr = this.seededRandom(variation, i, 3) * 2 + 1;
                
                graphics.fillStyle(
                    this.seededRandom(variation, i, 4) > 0.5 ? baseColor : altColor,
                    0.3 + this.seededRandom(variation, i, 5) * 0.3
                );
                graphics.fillCircle(px, py, pr);
            }
            
            // Linhas de desgaste (raro)
            if (this.seededRandom(variation, 10) > 0.7) {
                graphics.lineStyle(1, altColor, 0.2);
                const y1 = this.seededRandom(variation, 11) * size;
                graphics.moveTo(0, y1);
                graphics.lineTo(size, y1);
                graphics.strokePath();
            }
            
            graphics.generateTexture('ground_' + variation, size, size);
            graphics.destroy();
        }
    }
    
    generateWallTextures() {
        const size = this.tileSize;
        const types = ['stone', 'metal', 'wood'];
        const colors = [COLORS.STONE, COLORS.METAL, COLORS.WOOD];
        
        types.forEach((type, typeIndex) => {
            for (let variation = 0; variation < 3; variation++) {
                const graphics = this.scene.make.graphics({ x: 0, y: 0 });
                
                const baseColor = colors[typeIndex][variation % colors[typeIndex].length];
                const darkColor = typeIndex === 1 ? 
                    COLORS.METAL_RUST[variation % 2] : 
                    (typeIndex === 0 ? COLORS.STONE_DARK : COLORS.WOOD_DARK)[variation % 2];
                const lightColor = typeIndex === 1 ?
                    COLORS.METAL_SHINE[variation % 2] :
                    (typeIndex === 0 ? COLORS.STONE_LIGHT : COLORS.WOOD_LIGHT)[variation % 2];
                
                // Base
                graphics.fillStyle(baseColor, 1);
                graphics.fillRect(0, 0, size, size);
                
                // Textura específica por tipo
                if (typeIndex === 0) {
                    // Pedra: rachaduras e textura irregular
                    this.drawStoneDetails(graphics, size, variation);
                } else if (typeIndex === 1) {
                    // Metal: brilho e ferrugem
                    this.drawMetalDetails(graphics, size, variation);
                } else {
                    // Madeira: veios
                    this.drawWoodDetails(graphics, size, variation);
                }
                
                // Borda 3D
                this.drawBlockBorder(graphics, size, lightColor, darkColor);
                
                graphics.generateTexture(type + '_' + variation, size, size);
                graphics.destroy();
            }
        });
    }
    
    drawStoneDetails(graphics, size, seed) {
        // Rachaduras
        const numCracks = 2 + Math.floor(this.seededRandom(seed, 20) * 3);
        graphics.lineStyle(1, 0x3a3a3a, 0.4);
        
        for (let i = 0; i < numCracks; i++) {
            const x = this.seededRandom(seed, i, 1) * size;
            const y = this.seededRandom(seed, i, 2) * size;
            graphics.moveTo(x, y);
            graphics.lineTo(
                x + (this.seededRandom(seed, i, 3) * 6 - 3),
                y + (this.seededRandom(seed, i, 4) * 6 - 3)
            );
        }
        graphics.strokePath();
        
        // Manchas
        for (let i = 0; i < 3; i++) {
            if (this.seededRandom(seed, i, 10) > 0.6) {
                graphics.fillStyle(0x4a4a4a, 0.2);
                graphics.fillCircle(
                    this.seededRandom(seed, i, 11) * size,
                    this.seededRandom(seed, i, 12) * size,
                    this.seededRandom(seed, i, 13) * 3 + 1
                );
            }
        }
    }
    
    drawMetalDetails(graphics, size, seed) {
        // Brilho diagonal
        graphics.lineStyle(2, 0xaaaaaa, 0.3);
        graphics.moveTo(0, size);
        graphics.lineTo(size * 0.7, 0);
        graphics.strokePath();
        
        // Ferrugem (manchas)
        const numRust = Math.floor(this.seededRandom(seed, 30) * 4);
        for (let i = 0; i < numRust; i++) {
            graphics.fillStyle(COLORS.METAL_RUST[i % 2], 0.3);
            graphics.fillCircle(
                this.seededRandom(seed, i, 21) * size,
                this.seededRandom(seed, i, 22) * size,
                this.seededRandom(seed, i, 23) * 4 + 2
            );
        }
    }
    
    drawWoodDetails(graphics, size, seed) {
        // Veios da madeira
        graphics.lineStyle(1, COLORS.WOOD_DARK[0], 0.4);
        
        const numGrains = 3 + Math.floor(this.seededRandom(seed, 40) * 3);
        for (let i = 0; i < numGrains; i++) {
            const y = (i / numGrains) * size;
            graphics.moveTo(0, y);
            
            let x = 0;
            for (let j = 0; j < 3; j++) {
                x += this.seededRandom(seed, i, j, 1) * size * 0.4;
                graphics.lineTo(x, y + (this.seededRandom(seed, i, j, 2) * 2 - 1));
            }
        }
        graphics.strokePath();
    }
    
    drawBlockBorder(graphics, size, lightColor, darkColor) {
        // Highlight superior
        graphics.lineStyle(2, lightColor, 0.6);
        graphics.moveTo(1, 1);
        graphics.lineTo(size - 1, 1);
        graphics.lineTo(size - 1, size - 3);
        
        // Sombra inferior
        graphics.lineStyle(2, darkColor, 0.8);
        graphics.moveTo(size - 1, size - 1);
        graphics.lineTo(1, size - 1);
        graphics.lineTo(1, 1);
        
        graphics.strokePath();
    }
    
    generateBlockTextures() {
        const size = this.tileSize;
        
        // Bloco tijolo destrutível
        for (let variation = 0; variation < 3; variation++) {
            const graphics = this.scene.make.graphics({ x: 0, y: 0 });
            
            const baseColor = COLORS.BLOCK[variation % 2];
            
            // Base
            graphics.fillStyle(baseColor, 1);
            graphics.fillRect(0, 0, size, size);
            
            // Padrão tijolo
            graphics.lineStyle(1, COLORS.BLOCK_BRICK[variation % 2], 0.5);
            
            // Linhas horizontais
            graphics.moveTo(0, size * 0.33);
            graphics.lineTo(size, size * 0.33);
            graphics.moveTo(0, size * 0.66);
            graphics.lineTo(size, size * 0.66);
            
            // Linhas verticais alternadas
            graphics.moveTo(size * 0.5, 0);
            graphics.lineTo(size * 0.5, size * 0.33);
            graphics.moveTo(size * 0.25, size * 0.33);
            graphics.lineTo(size * 0.25, size * 0.66);
            graphics.moveTo(size * 0.75, size * 0.33);
            graphics.lineTo(size * 0.75, size * 0.66);
            
            graphics.strokePath();
            
            // Borda
            this.drawBlockBorder(
                graphics, size,
                COLORS.BLOCK[variation % 2],
                COLORS.BLOCK_CRUNCH[variation % 2]
            );
            
            // Manchas de sujeira
            for (let i = 0; i < 4; i++) {
                graphics.fillStyle(COLORS.DIRT[variation % 3], 0.3);
                graphics.fillCircle(
                    this.seededRandom(variation, i, 31) * size,
                    this.seededRandom(variation, i, 32) * size,
                    this.seededRandom(variation, i, 33) * 3
                );
            }
            
            graphics.generateTexture('block_' + variation, size, size);
            graphics.destroy();
        }
    }
    
    // =====================================
    // CONSTRUÇÃO DO MAPA
    // =====================================
    
    buildMap() {
        // Limpar mapa existente
        this.clearMap();
        
        // Gerar chão
        this.generateGround();
        
        // Gerar paredes externas
        this.generateBorderWalls();
        
        // Gerar grid interno (estilo Bomberman)
        this.generateInternalGrid();
        
        // Adicionar variação decorativa
        this.addDecorations();
    }
    
    clearMap() {
        // Limpar camadas
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.groundLayer[y][x]) {
                    this.groundLayer[y][x].destroy();
                    this.groundLayer[y][x] = null;
                }
                if (this.objectLayer[y][x]) {
                    this.objectLayer[y][x].destroy();
                    this.objectLayer[y][x] = null;
                }
            }
        }
    }
    
    generateGround() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const variation = this.getVariation(x, y, 4);
                const sprite = this.scene.add.image(
                    x * this.tileSize,
                    y * this.tileSize,
                    'ground_' + variation
                );
                this.groundContainer.add(sprite);
                this.groundLayer[y][x] = sprite;
            }
        }
    }
    
    generateBorderWalls() {
        const types = ['stone', 'metal', 'stone'];
        const pattern = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
        
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (pattern[y][x] === 1) {
                    this.addWall(x, y, types[(x + y) % 3]);
                }
            }
        }
    }
    
    generateInternalGrid() {
        // Cantos seguros para jogador
        const safeZones = [
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 2, y: 2 }
        ];
        
        const isSafe = (x, y) => {
            return safeZones.some(s => s.x === x && s.y === y);
        };
        
        // Cantos inferiores direitos
        const safeZones2 = [
            { x: 13, y: 9 },
            { x: 12, y: 9 },
            { x: 13, y: 8 },
            { x: 13, y: 7 },
            { x: 12, y: 8 }
        ];
        
        const isSafe2 = (x, y) => {
            return safeZones2.some(s => s.x === x && s.y === y);
        };
        
        // Gerar blocos destrutíveis aleatórios
        for (let y = 1; y < this.gridHeight - 1; y++) {
            for (let x = 1; x < this.gridWidth - 1; x++) {
                // Pular se já é parede
                if (this.objectLayer[y][x]) continue;
                
                // Pular zonas seguras
                if (isSafe(x, y) || isSafe2(x, y)) continue;
                
                // 35% de chance de bloco destrutível
                if (this.seededRandom(x, y, 100) < 0.35) {
                    const variation = this.getVariation(x, y, 3);
                    this.addBlock(x, y, variation);
                }
            }
        }
    }
    
    addDecorations() {
        // Adicionar detalhes decorativos ao chão
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                // Solo embaixo de blocos destrutíveis
                if (this.objectLayer[y][x] && this.objectLayer[y][x].type === TILES.WALL_DESTRUCTIBLE) {
                    // Manchas de terra
                    if (this.seededRandom(x, y, 200) > 0.7) {
                        this.addGroundDecoration(x, y);
                    }
                }
            }
        }
    }
    
    addGroundDecoration(gridX, gridY) {
        const x = gridX * this.tileSize + this.tileSize / 2;
        const y = gridY * this.tileSize + this.tileSize / 2;
        
        const decoration = this.scene.add.graphics();
        
        // Manchas de terra/vegetação
        const numSpots = 2 + Math.floor(this.seededRandom(gridX, gridY, 201) * 3);
        
        for (let i = 0; i < numSpots; i++) {
            decoration.fillStyle(
                this.seededRandom(gridX, gridY, 202 + i) > 0.5 ? 
                    COLORS.DIRT_MOSS[0] : 
                    COLORS.GROUND_ALT[0],
                0.4
            );
            decoration.fillCircle(
                (this.seededRandom(gridX, gridY, 203 + i) - 0.5) * 10,
                (this.seededRandom(gridX, gridY, 204 + i) - 0.5) * 10,
                this.seededRandom(gridX, gridY, 205 + i) * 3 + 1
            );
        }
        
        decoration.setPosition(x, y);
        decoration.setBlendMode(Phaser.BlendModes.OVERLAY);
        this.effectContainer.add(decoration);
    }
    
    // =====================================
    // ADIÇÃO DE TILES
    // =====================================
    
    addWall(gridX, gridY, type = 'stone') {
        if (gridX < 0 || gridX >= this.gridWidth ||
            gridY < 0 || gridY >= this.gridHeight) return;
        
        const variation = this.getVariation(gridX, gridY, 3);
        const sprite = this.scene.add.image(
            gridX * this.tileSize,
            gridY * this.tileSize,
            type + '_' + variation
        );
        
        this.objectContainer.add(sprite);
        this.objectLayer[gridY][gridX] = {
            type: type === 'stone' ? TILES.WALL_INDESTRUCTIBLE : TILES.WALL_METAL,
            sprite: sprite
        };
    }
    
    addBlock(gridX, gridY, variation = 0) {
        if (gridX < 0 || gridX >= this.gridWidth ||
            gridY < 0 || gridY >= this.gridHeight) return;
        
        if (this.objectLayer[gridY][gridX]) return;
        
        const sprite = this.scene.add.image(
            gridX * this.tileSize,
            gridY * this.tileSize,
            'block_' + variation
        );
        
        this.objectContainer.add(sprite);
        this.objectLayer[gridY][gridX] = {
            type: TILES.WALL_DESTRUCTIBLE,
            sprite: sprite,
            health: 1
        };
    }
    
    removeBlock(gridX, gridY) {
        if (gridX < 0 || gridX >= this.gridWidth ||
            gridY < 0 || gridY >= this.gridHeight) return;
        
        const tile = this.objectLayer[gridY][gridX];
        if (!tile || tile.type !== TILES.WALL_DESTRUCTIBLE) return;
        
        // Efeito de destruição
        this.createDestructionEffect(gridX, gridY);
        
        // Remover
        tile.sprite.destroy();
        this.objectLayer[gridY][gridX] = null;
    }
    
    createDestructionEffect(gridX, gridY) {
        const x = gridX * this.tileSize;
        const y = gridY * this.tileSize;
        
        // Partículas de escombros
        for (let i = 0; i < 6; i++) {
            const particle = this.scene.add.graphics();
            particle.fillStyle(COLORS.BLOCK[0], 0.8);
            particle.fillRect(0, 0, 4 + Math.random() * 3, 4 + Math.random() * 3);
            
            const startX = x + Math.random() * this.tileSize;
            const startY = y + Math.random() * this.tileSize;
            particle.setPosition(startX, startY);
            this.effectContainer.add(particle);
            
            this.scene.tweens.add({
                targets: particle,
                x: startX + (Math.random() - 0.5) * 40,
                y: startY + Math.random() * 30 + 10,
                alpha: 0,
                angle: Math.random() * 360,
                duration: 400 + Math.random() * 200,
                onComplete: () => particle.destroy()
            });
        }
        
        // Poeira
        for (let i = 0; i < 4; i++) {
            const dust = this.scene.add.graphics();
            dust.fillStyle(COLORS.DIRT[0], 0.5);
            dust.fillCircle(0, 0, 2 + Math.random() * 3);
            
            const dustX = x + this.tileSize / 2;
            const dustY = y + this.tileSize / 2;
            dust.setPosition(dustX, dustY);
            this.effectContainer.add(dust);
            
            this.scene.tweens.add({
                targets: dust,
                x: dustX + (Math.random() - 0.5) * 20,
                y: dustY - 15 - Math.random() * 10,
                alpha: 0,
                duration: 500,
                onComplete: () => dust.destroy()
            });
        }
    }
    
    // =====================================
    // GETTERS
    // =====================================
    
    getTile(gridX, gridY) {
        if (gridX < 0 || gridX >= this.gridWidth ||
            gridY < 0 || gridY >= this.gridHeight) return null;
        
        return this.objectLayer[gridY][gridX];
    }
    
    isWalkable(gridX, gridY) {
        const tile = this.getTile(gridX, gridY);
        return !tile;
    }
    
    isDestructible(gridX, gridY) {
        const tile = this.getTile(gridX, gridY);
        return tile && tile.type === TILES.WALL_DESTRUCTIBLE;
    }
    
    // =====================================
    // CLEANUP
    // =====================================
    
    destroy() {
        // Limpar texturas
        ['ground_0', 'ground_1', 'ground_2', 'ground_3',
         'stone_0', 'stone_1', 'stone_2',
         'metal_0', 'metal_1', 'metal_2',
         'wood_0', 'wood_1', 'wood_2',
         'block_0', 'block_1', 'block_2'
        ].forEach(name => {
            if (this.scene.textures.exists(name)) {
                this.scene.textures.remove(name);
            }
        });
        
        // Limpar containers
        if (this.groundContainer) this.groundContainer.destroy();
        if (this.objectContainer) this.objectContainer.destroy();
        if (this.effectContainer) this.effectContainer.destroy();
    }
}