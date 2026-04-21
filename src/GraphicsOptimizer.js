/**
 * =====================================
 * GRAPHICS OPTIMIZER
 * =====================================
 * 
 * Sistema de otimização gráfica para mobile.
 * Sprite sheets, compressão, limits.
 */

import Phaser from 'phaser';

const OPTIMIZATION = {
    MAX_PARTICLES: 20,
    MAX_DRAW_CALLS: 50,
    TEXTURE_QUALITY: 'medium',
    USE_SPRITESHEETS: true,
    BATCH_DRAWING: true
};

const SPRITESHEET_SIZE = 128;

export default class GraphicsOptimizer {
    constructor(scene) {
        this.scene = scene;
        
        this.spriteSheets = new Map();
        this.particlePool = [];
        this.activeParticles = 0;
        
        this.drawCallCount = 0;
        this.lastDrawReset = 0;
        
        this.createSpriteSheets();
    }
    
    createSpriteSheets() {
        this.createSnakeSheet();
        this.createFoodSheet();
        this.createTileSheet();
        this.createEffectsSheet();
    }
    
    createSnakeSheet() {
        const size = SPRITESHEET_SIZE;
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        
        const variants = ['head', 'body_0', 'body_1', 'body_2'];
        const colors = [
            { base: 0x3d6a4d, shine: 0x4d7a5d, dark: 0x2d4a2d },
            { base: 0x2d5a3d, shine: 0x3d6a4d, dark: 0x1d4a2d },
            { base: 0x3d6a4d, shine: 0x4d7a5d, dark: 0x2d4a2d },
            { base: 0x1d4a2d, shine: 0x2d5a3d, dark: 0x0d3a1d }
        ];
        
        variants.forEach((variant, index) => {
            const offsetX = (index % 2) * (size / 2);
            const offsetY = Math.floor(index / 2) * (size / 2);
            
            const color = colors[index];
            
            if (variant === 'head') {
                graphics.fillStyle(color.base, 1);
                graphics.fillCircle(offsetX + 16, offsetY + 16, 9);
                
                graphics.fillStyle(color.shine, 0.4);
                graphics.fillCircle(offsetX + 14, offsetY + 14, 4);
                
                graphics.fillStyle(0xeeeeee, 1);
                graphics.fillCircle(offsetX + 13, offsetY + 13, 3);
                graphics.fillCircle(offsetX + 19, offsetY + 13, 3);
                
                graphics.fillStyle(0x111111, 1);
                graphics.fillCircle(offsetX + 13, offsetY + 14, 2);
                graphics.fillCircle(offsetX + 19, offsetY + 14, 2);
                
                graphics.fillStyle(0xffffff, 0.9);
                graphics.fillCircle(offsetX + 12, offsetY + 12, 1);
                graphics.fillCircle(offsetX + 18, offsetY + 12, 1);
            } else {
                graphics.fillStyle(color.base, 1);
                graphics.fillCircle(offsetX + 16, offsetY + 16, 8);
                
                graphics.fillStyle(color.shine, 0.25);
                for (let i = 0; i < 2; i++) {
                    graphics.fillCircle(
                        offsetX + 14 + Math.random() * 4,
                        offsetY + 14 + Math.random() * 4,
                        2
                    );
                }
                
                graphics.fillStyle(color.shine, 0.2);
                graphics.fillCircle(offsetX + 14, offsetY + 14, 2);
            }
            
            graphics.lineStyle(1, color.dark, 0.3);
            graphics.strokeCircle(offsetX + 16, offsetY + 16, variant === 'head' ? 9 : 8);
        });
        
        graphics.generateTexture('snake_spritesheet', size, size);
        graphics.destroy();
        
        this.spriteSheets.set('snake', 'snake_spritesheet');
    }
    
    createFoodSheet() {
        const size = SPRITESHEET_SIZE;
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        
        const foodTypes = [
            { name: 'normal', color: 0xff3355, highlight: 0xffaabb },
            { name: 'slow', color: 0x5599ff, highlight: 0xaaccff },
            { name: 'fast', color: 0xffdd44, highlight: 0xffff88 },
            { name: 'poison', color: 0x44aa44, highlight: 0x88dd88 },
            { name: 'explosive', color: 0xff5500, highlight: 0xffaa44 },
            { name: 'dimensional', color: 0xaa44ff, highlight: 0xdd88ff },
            { name: 'void', color: 0x666666, highlight: 0xaaaaaa }
        ];
        
        foodTypes.forEach((food, index) => {
            const offsetX = (index % 4) * (size / 4);
            const offsetY = Math.floor(index / 4) * (size / 4);
            const centerX = offsetX + 16;
            const centerY = offsetY + 16;
            
            graphics.fillStyle(food.color, 1);
            graphics.fillCircle(centerX, centerY, 7);
            
            graphics.fillStyle(food.highlight, 0.6);
            graphics.fillCircle(centerX - 2, centerY - 2, 4);
            
            graphics.fillStyle(0xffffff, 0.5);
            graphics.fillCircle(centerX - 1, centerY - 3, 1.5);
            
            graphics.lineStyle(1, 0x000000, 0.3);
            graphics.strokeCircle(centerX, centerY, 7);
        });
        
        graphics.generateTexture('food_spritesheet', size, size);
        graphics.destroy();
        
        this.spriteSheets.set('food', 'food_spritesheet');
    }
    
    createTileSheet() {
        const size = 64;
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        
        const tiles = [
            { name: 'floor', base: 0x252540, pattern: 0x2a2a45 },
            { name: 'wall', base: 0x2d2d4a, pattern: 0x1d1d2a },
            { name: 'wall_indestructible', base: 0x1d1d2a, pattern: 0x0d0d1a }
        ];
        
        tiles.forEach((tile, index) => {
            const offsetX = index * 21;
            
            graphics.fillStyle(tile.base, 1);
            graphics.fillRect(offsetX, 0, 20, 20);
            
            graphics.fillStyle(tile.pattern, 0.3);
            for (let i = 0; i < 3; i++) {
                graphics.fillRect(offsetX + 3 + i * 6, 3 + i * 6, 2, 2);
            }
            
            graphics.lineStyle(1, tile.pattern, 0.5);
            graphics.strokeRect(offsetX, 0, 20, 20);
        });
        
        graphics.generateTexture('tile_spritesheet', 64, 20);
        graphics.destroy();
        
        this.spriteSheets.set('tile', 'tile_spritesheet');
    }
    
    createEffectsSheet() {
        const size = 64;
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        
        for (let i = 0; i < 4; i++) {
            const x = i * 16;
            const alpha = 1 - i * 0.2;
            
            graphics.fillStyle(0xffffff, alpha * 0.7);
            graphics.fillCircle(x + 8, 8, 8 - i * 1.5);
        }
        
        graphics.generateTexture('effect_flash', 64, 16);
        graphics.destroy();
        
        graphics.clear();
        
        for (let i = 0; i < 4; i++) {
            const x = i * 8;
            const color = i < 2 ? 0xff6600 : 0xffaa00;
            const alpha = 1 - i * 0.3;
            
            graphics.fillStyle(color, alpha * 0.8);
            graphics.fillCircle(x + 4, 4, 6 - i);
        }
        
        graphics.generateTexture('effect_fire', 32, 8);
        graphics.destroy();
        
        this.spriteSheets.set('flash', 'effect_flash');
        this.spriteSheets.set('fire', 'effect_fire');
    }
    
    getSpriteSheet(name) {
        return this.spriteSheets.get(name) || null;
    }
    
    spawnParticle(x, y, color, options = {}) {
        if (this.activeParticles >= OPTIMIZATION.MAX_PARTICLES) {
            return this.recycleParticle();
        }
        
        const particle = this.scene.add.graphics();
        
        const size = options.size || 2;
        const alpha = options.alpha || 0.8;
        
        particle.fillStyle(color, alpha);
        particle.fillCircle(0, 0, size);
        
        particle.setPosition(x, y);
        particle.setDepth(25);
        
        this.particlePool.push({
            graphics: particle,
            vx: options.vx || 0,
            vy: options.vy || 0,
            life: options.life || 500,
            maxLife: options.life || 500,
            gravity: options.gravity || 0,
            fade: options.fade !== false
        });
        
        this.activeParticles++;
        this.drawCallCount++;
        
        return particle;
    }
    
    recycleParticle() {
        if (this.particlePool.length === 0) return null;
        
        const i = Math.floor(Math.random() * this.particlePool.length);
        const particle = this.particlePool[i];
        
        if (particle.graphics) {
            particle.graphics.destroy();
        }
        
        this.particlePool.splice(i, 1);
        
        return null;
    }
    
    updateParticles(delta) {
        const now = Date.now();
        
        if (now - this.lastDrawReset > 1000) {
            this.drawCallCount = 0;
            this.lastDrawReset = now;
        }
        
        for (let i = this.particlePool.length - 1; i >= 0; i--) {
            const p = this.particlePool[i];
            
            p.life -= delta;
            
            if (p.life <= 0) {
                if (p.graphics) {
                    p.graphics.destroy();
                }
                this.particlePool.splice(i, 1);
                this.activeParticles--;
                continue;
            }
            
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.vy += p.gravity;
            
            p.graphics.x += p.vx;
            p.graphics.y += p.vy;
            
            if (p.fade) {
                p.graphics.setAlpha(p.life / p.maxLife);
            }
        }
    }
    
    clearAllParticles() {
        this.particlePool.forEach(p => {
            if (p.graphics) {
                p.graphics.destroy();
            }
        });
        
        this.particlePool = [];
        this.activeParticles = 0;
    }
    
    getDrawCallCount() {
        return this.drawCallCount;
    }
    
    isOverDrawLimit() {
        return this.drawCallCount > OPTIMIZATION.MAX_DRAW_CALLS;
    }
    
    destroy() {
        this.clearAllParticles();
        
        const textures = ['snake_spritesheet', 'food_spritesheet', 'tile_spritesheet', 'effect_flash', 'effect_fire'];
        
        textures.forEach(name => {
            if (this.scene.textures.exists(name)) {
                this.scene.textures.remove(name);
            }
        });
        
        this.spriteSheets.clear();
    }
}