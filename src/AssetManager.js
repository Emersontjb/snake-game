/**
 * =====================================
 * ASSET MANAGER
 * =====================================
 * 
 * Sistema de assets semi-realistas
 * Estilo arena Bomberman
 * Perspectiva top-down
 */

import Phaser from 'phaser';

const TILE_SIZE = 20;

export default class AssetManager {
    constructor(scene) {
        this.scene = scene;
        this.created = false;
    }
    
    createAll() {
        if (this.created) return;
        
        this.createFloorTiles();
        this.createWallTiles();
        this.createBlocks();
        this.createObstacles();
        this.createItems();
        
        this.created = true;
        console.log('🎨 Assets criados');
    }
    
    // =====================================
    // FLOOR TILES
    // =====================================
    
    createFloorTiles() {
        const variants = 4;
        
        for (let v = 0; v < variants; v++) {
            const graphics = this.scene.make.graphics();
            
            if (v === 0) this.drawDirtFloor(graphics, v);
            else if (v === 1) this.drawConcreteFloor(graphics, v);
            else if (v === 2) this.drawStoneFloor(graphics, v);
            else this.drawMetalFloor(graphics, v);
            
            graphics.generateTexture(`floor_${v}`, TILE_SIZE, TILE_SIZE);
            graphics.destroy();
        }
    }
    
    drawDirtFloor(g, seed) {
        const colors = {
            base: 0x4a3c2a,
            dark: 0x3a2c1a,
            light: 0x5a4c3a,
            speckle: 0x5a4c3a
        };
        
        g.fillStyle(colors.base, 1);
        g.fillRect(0, 0, 20, 20);
        
        g.fillStyle(colors.dark, 0.4);
        for (let i = 0; i < 8; i++) {
            const x = (Math.sin(seed * 7 + i * 3) * 0.5 + 0.5) * 16 + 2;
            const y = (Math.cos(seed * 5 + i * 2) * 0.5 + 0.5) * 16 + 2;
            g.fillCircle(x, y, 1 + (i % 2));
        }
        
        g.fillStyle(colors.light, 0.25);
        g.fillCircle(4, 4, 2);
        g.fillCircle(14, 14, 2);
        g.fillCircle(16, 6, 1);
        
        g.lineStyle(1, colors.dark, 0.3);
        g.strokeRect(0.5, 0.5, 19, 19);
    }
    
    drawConcreteFloor(g, seed) {
        const colors = {
            base: 0x606060,
            dark: 0x505050,
            light: 0x707070,
            crack: 0x404040
        };
        
        g.fillStyle(colors.base, 1);
        g.fillRect(0, 0, 20, 20);
        
        g.lineStyle(0.5, colors.crack, 0.4);
        g.beginPath();
        g.moveTo(3 + seed, 0);
        g.lineTo(5 + seed, 20);
        g.strokePath();
        
        g.beginPath();
        g.moveTo(12, 3 + seed);
        g.lineTo(20, 5 + seed);
        g.strokePath();
        
        g.fillStyle(colors.light, 0.2);
        g.fillRect(2, 2, 6, 2);
        g.fillRect(10, 12, 4, 2);
        
        g.lineStyle(1, colors.dark, 0.5);
        g.strokeRect(0.5, 0.5, 19, 19);
    }
    
    drawStoneFloor(g, seed) {
        const colors = {
            base: 0x555555,
            dark: 0x404040,
            moss: 0x4a5a3a,
            light: 0x666666
        };
        
        g.fillStyle(colors.base, 1);
        g.fillRect(0, 0, 20, 20);
        
        g.lineStyle(1, colors.dark, 0.6);
        g.moveTo(10, 0);
        g.lineTo(10, 20);
        g.moveTo(0, 10);
        g.lineTo(20, 10);
        g.strokePath();
        
        g.fillStyle(colors.moss, 0.3);
        g.fillCircle(3, 3, 2);
        g.fillCircle(15, 16, 2);
        
        g.fillStyle(colors.light, 0.3);
        g.fillCircle(8, 8, 1.5);
        g.fillCircle(14, 4, 1);
        
        g.lineStyle(1, colors.dark, 0.4);
        g.strokeRect(0.5, 0.5, 19, 19);
    }
    
    drawMetalFloor(g, seed) {
        const colors = {
            base: 0x3a3a4a,
            dark: 0x2a2a3a,
            light: 0x5a5a6a,
            rust: 0x6a4a3a
        };
        
        g.fillStyle(colors.base, 1);
        g.fillRect(0, 0, 20, 20);
        
        g.lineStyle(0.5, colors.dark, 0.7);
        for (let i = 0; i < 4; i++) {
            const x = i * 5 + 2;
            g.moveTo(x, 0);
            g.lineTo(x, 20);
        }
        g.strokePath();
        
        g.lineStyle(0.5, colors.dark, 0.7);
        g.moveTo(0, 10);
        g.lineTo(20, 10);
        g.strokePath();
        
        g.fillStyle(colors.light, 0.4);
        g.fillCircle(5, 5, 1);
        g.fillCircle(15, 5, 1);
        
        g.lineStyle(1, colors.dark, 0.6);
        g.strokeRect(0.5, 0.5, 19, 19);
    }
    
    // =====================================
    // WALL TILES
    // =====================================
    
    createWallTiles() {
        const walls = [
            { name: 'wall_destructible', base: 0x8b5a2b, height: 0x6b4a1b },
            { name: 'wall_indestructible', base: 0x4a4a5a, height: 0x3a3a4a },
            { name: 'wall_metal', base: 0x5a5a6a, height: 0x4a4a5a },
            { name: 'wall_wood', base: 0x6b4422, height: 0x5b3412 }
        ];
        
        walls.forEach(wall => {
            const g = this.scene.make.graphics();
            this.drawWallTile(g, wall.base, wall.height);
            g.generateTexture(wall.name, TILE_SIZE, TILE_SIZE);
            g.destroy();
        });
    }
    
    drawWallTile(g, baseColor, topColor) {
        g.fillStyle(baseColor, 1);
        g.fillRect(2, 2, 16, 16);
        
        g.fillStyle(topColor, 0.8);
        g.fillRect(3, 3, 14, 12);
        
        g.fillStyle(0x000000, 0.3);
        g.fillRect(3, 14, 14, 3);
        
        g.lineStyle(1.5, 0x000000, 0.4);
        g.strokeRect(2, 2, 16, 16);
        
        g.fillStyle(0xffffff, 0.15);
        g.fillRect(4, 4, 3, 2);
    }
    
    // =====================================
    // BLOCKS
    // =====================================
    
    createBlocks() {
        const blocks = [
            { name: 'crate', base: 0x8b6914, accent: 0x6b4914 },
            { name: 'barrel', base: 0x4a4a4a, accent: 0x3a3a3a },
            { name: 'statue', base: 0x6a5a4a, accent: 0x5a4a3a },
            { name: 'bomb', base: 0x2a2a2a, accent: 0x3a3a3a }
        ];
        
        blocks.forEach(block => {
            const g = this.scene.make.graphics();
            this.drawBlock(g, block.base, block.accent);
            g.generateTexture(block.name, TILE_SIZE, TILE_SIZE);
            g.destroy();
        });
    }
    
    drawBlock(g, baseColor, accentColor) {
        g.fillStyle(baseColor, 1);
        g.fillRect(3, 3, 14, 14);
        
        g.fillStyle(accentColor, 0.8);
        g.fillRect(4, 4, 12, 10);
        
        g.fillStyle(baseColor, 1);
        g.fillRect(4, 4, 2, 14);
        g.fillRect(14, 4, 2, 14);
        
        g.fillStyle(0x000000, 0.4);
        g.fillRect(3, 15, 14, 2);
        g.fillRect(15, 3, 2, 14);
        
        g.lineStyle(1.5, 0x000000, 0.5);
        g.strokeRect(3, 3, 14, 14);
    }
    
    // =====================================
    // OBSTACLES
    // =====================================
    
    createObstacles() {
        const obstacles = [
            { name: 'spikes', type: 'hazard' },
            { name: 'fire', type: 'hazard' },
            { name: 'ice', type: 'hazard' },
            { name: 'oil', type: 'hazard' },
            { name: 'teleporter', type: 'special' },
            { name: 'checkpoint', type: 'special' }
        ];
        
        obstacles.forEach(obs => {
            const g = this.scene.make.graphics();
            if (obs.type === 'hazard') this.drawHazard(g, obs.name);
            else this.drawSpecialObstacle(g, obs.name);
            g.generateTexture(obs.name, TILE_SIZE, TILE_SIZE);
            g.destroy();
        });
    }
    
    drawHazard(g, type) {
        if (type === 'spikes') {
            g.fillStyle(0x4a4a4a, 1);
            g.fillRect(4, 4, 12, 12);
            
            g.fillStyle(0x8a8a8a, 1);
            for (let i = 0; i < 4; i++) {
                const x = 4 + i * 4;
                g.fillTriangle(x + 1, 14, x + 3, 6, x + 5, 14);
            }
            
            g.fillStyle(0x6a6a6a, 0.8);
            g.fillCircle(10, 10, 2);
            
        } else if (type === 'fire') {
            g.fillStyle(0x2a1a0a, 1);
            g.fillCircle(10, 10, 8);
            
            g.fillStyle(0xff4400, 1);
            g.fillCircle(10, 10, 5);
            
            g.fillStyle(0xffaa00, 0.8);
            g.fillCircle(9, 9, 3);
            
            g.fillStyle(0xffffaa, 0.6);
            g.fillCircle(8, 8, 1.5);
            
        } else if (type === 'ice') {
            g.fillStyle(0xaaccee, 1);
            g.fillCircle(10, 10, 8);
            
            g.fillStyle(0xffffff, 0.7);
            g.fillCircle(7, 7, 4);
            g.fillCircle(12, 12, 2);
            
            g.fillStyle(0x88aacc, 0.8);
            g.fillCircle(10, 10, 3);
            
        } else if (type === 'oil') {
            g.fillStyle(0x1a1a0a, 1);
            g.fillCircle(10, 10, 8);
            
            g.fillStyle(0x2a2a1a, 1);
            g.fillCircle(10, 10, 6);
            
            g.fillStyle(0x3a3a2a, 0.6);
            g.fillCircle(7, 8, 2);
            g.fillCircle(12, 11, 2);
        }
        
        g.lineStyle(1, 0x000000, 0.4);
        g.strokeCircle(10, 10, 8);
    }
    
    drawSpecialObstacle(g, type) {
        if (type === 'teleporter') {
            g.fillStyle(0x2a0a3a, 1);
            g.fillCircle(10, 10, 8);
            
            g.fillStyle(0x6a2aaa, 0.9);
            g.fillCircle(10, 10, 6);
            
            g.fillStyle(0xaa4aaa, 0.7);
            g.fillCircle(8, 8, 3);
            g.fillCircle(12, 12, 2);
            
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const x = 10 + Math.cos(angle) * 3;
                const y = 10 + Math.sin(angle) * 3;
                g.fillStyle(0xcc88cc, 0.8);
                g.fillCircle(x, y, 1);
            }
            
        } else if (type === 'checkpoint') {
            g.fillStyle(0x2a4a2a, 1);
            g.fillCircle(10, 10, 8);
            
            g.fillStyle(0x4a8a4a, 1);
            g.fillCircle(10, 10, 5);
            
            g.fillStyle(0x8aff8a, 0.8);
            g.fillTriangle(7, 8, 13, 8, 10, 12);
            
            g.lineStyle(0.5, 0xffffff, 0.5);
            g.strokeCircle(10, 10, 3);
        }
        
        g.lineStyle(1, 0x000000, 0.4);
        g.strokeCircle(10, 10, 8);
    }
    
    // =====================================
    // ITEMS
    // =====================================
    
    createItems() {
        const items = [
            { name: 'bomb_item', color: 0x2a2a2a },
            { name: 'fire_item', color: 0xff4400 },
            { name: 'speed_item', color: 0x44aaff },
            { name: 'kick_item', color: 0x8a6a4a },
            { name: 'remote_item', color: 0x6a4a8a },
            { name: 'shield_item', color: 0x4488ff },
            { name: 'ghost_item', color: 0x88ff88 },
            { name: 'extra_item', color: 0xffff44 }
        ];
        
        items.forEach(item => {
            const g = this.scene.make.graphics();
            this.drawItem(g, item.color);
            g.generateTexture(item.name, TILE_SIZE, TILE_SIZE);
            g.destroy();
        });
    }
    
    drawItem(g, baseColor) {
        const darker = (baseColor >> 1) & 0x7f7f7f;
        
        g.fillStyle(baseColor, 1);
        g.fillCircle(10, 10, 7);
        
        g.fillStyle(darker, 0.8);
        g.fillCircle(10, 10, 5);
        
        g.fillStyle(0xffffff, 0.4);
        g.fillCircle(7, 7, 2);
        
        g.lineStyle(1, darker, 0.6);
        g.strokeCircle(10, 10, 7);
        
        g.fillStyle(0x000000, 0.3);
        g.fillCircle(10, 10, 7);
        g.fillStyle(baseColor, 1);
        g.fillCircle(10, 10, 6);
    }
    
    // =====================================
    // CONSISTENCY HELPERS
    // =====================================
    
    applyStyle(graphics, type, variant = 0) {
        const styles = {
            arena: {
                floor: 'floor_0',
                wall: 'wall_indestructible',
                crate: 'crate'
            },
            dungeon: {
                floor: 'floor_2',
                wall: 'wall_indestructible',
                crate: 'barrel'
            },
            factory: {
                floor: 'floor_3',
                wall: 'wall_metal',
                crate: 'barrel'
            },
            ruins: {
                floor: 'floor_1',
                wall: 'wall_wood',
                crate: 'crate'
            }
        };
        
        return styles[type]?.[variant] || styles.arena[variant];
    }
    
    destroy() {
        const textures = [
            'floor_0', 'floor_1', 'floor_2', 'floor_3',
            'wall_destructible', 'wall_indestructible', 'wall_metal', 'wall_wood',
            'crate', 'barrel', 'statue', 'bomb',
            'spikes', 'fire', 'ice', 'oil', 'teleporter', 'checkpoint',
            'bomb_item', 'fire_item', 'speed_item', 'kick_item',
            'remote_item', 'shield_item', 'ghost_item', 'extra_item'
        ];
        
        textures.forEach(name => {
            if (this.scene.textures.exists(name)) {
                this.scene.textures.remove(name);
            }
        });
        
        this.created = false;
    }
}