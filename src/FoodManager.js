/**
 * =====================================
 * FOOD MANAGER
 * =====================================
 * 
 * Sistema de comidas com identidades visuais únicas.
 * Estilo semi-realista.
 */

import Phaser from 'phaser';

const FOOD_TYPES = {
    NORMAL: {
        name: 'Normal',
        color: 0xff3355,
        glowColor: 0xff5577,
        highlight: 0xffaabb,
        particles: 0xff6688,
        radius: 7,
        score: 10,
        duration: 0,
        grow: true,
        explodeRadius: 0,
        changeDimension: false,
        teleport: false,
        description: '+10 pontos'
    },
    SLOW: {
        name: 'Slow',
        color: 0x5599ff,
        glowColor: 0x77aaff,
        highlight: 0xaaccff,
        particles: 0x66aaff,
        radius: 8,
        score: 15,
        duration: 5000,
        grow: true,
        explodeRadius: 0,
        changeDimension: false,
        teleport: false,
        description: 'Rápidez -50%'
    },
    FAST: {
        name: 'Fast',
        color: 0xffdd44,
        glowColor: 0xffee66,
        highlight: 0xffff88,
        particles: 0xffcc33,
        radius: 6,
        score: 20,
        duration: -3000,
        grow: true,
        explodeRadius: 0,
        changeDimension: false,
        teleport: false,
        description: 'Velocidade +50%'
    },
    POISON: {
        name: 'Poison',
        color: 0x44aa44,
        glowColor: 0x66cc66,
        highlight: 0x88dd88,
        particles: 0x55bb55,
        radius: 8,
        score: -30,
        duration: 3000,
        grow: false,
        explodeRadius: 0,
        changeDimension: false,
        teleport: false,
        description: '-30 pontos'
    },
    EXPLOSIVE: {
        name: 'Explosive',
        color: 0xff5500,
        glowColor: 0xff7722,
        highlight: 0xffaa44,
        particles: 0xff4400,
        radius: 9,
        score: 50,
        duration: 0,
        grow: false,
        explodeRadius: 1,
        changeDimension: false,
        teleport: false,
        description: 'Explosão'
    },
    DIMENSIONAL: {
        name: 'Dimensional',
        color: 0xaa44ff,
        glowColor: 0xcc66ff,
        highlight: 0xdd88ff,
        particles: [0xaa44ff, 0x44aaff, 0xff44aa],
        radius: 7,
        score: 100,
        duration: 0,
        grow: true,
        explodeRadius: 0,
        changeDimension: true,
        teleport: true,
        description: 'Portal'
    },
    VOID: {
        name: 'Void',
        color: 0x666666,
        glowColor: 0x888888,
        highlight: 0xaaaaaa,
        particles: [0x333333, 0x555555, 0x777777],
        radius: 7,
        score: 25,
        duration: 0,
        grow: true,
        explodeRadius: 0,
        changeDimension: true,
        teleport: false,
        description: 'Mudança'
    }
};

const FOOD_WEIGHTS = [
    { type: 'NORMAL', weight: 55 },
    { type: 'SLOW', weight: 12 },
    { type: 'FAST', weight: 12 },
    { type: 'POISON', weight: 5 },
    { type: 'EXPLOSIVE', weight: 3 },
    { type: 'DIMENSIONAL', weight: 3 },
    { type: 'VOID', weight: 5 },
    { type: 'NEON', weight: 2 },
    { type: 'QUANTUM', weight: 2 },
    { type: 'CORROSIVE', weight: 1 }
];

export default class FoodManager {
    constructor(scene, snakeRef = null) {
        this.scene = scene;
        this._snakeRef = snakeRef;
        
        this.currentFood = null;
        this.currentType = null;
        
        this.lights = [];
        this.particles = [];
    }
    
    get snake() {
        if (this._snakeRef) return this._snakeRef;
        if (this.scene && this.scene.snake) return this.scene.snake;
        return [];
    }
    
    spawn(specificType = null) {
        if (this.currentFood) {
            this.cleanup();
        }
        
        let type = specificType;
        
        if (!type) {
            type = this.getRandomType();
        }
        
        const config = FOOD_TYPES[type];
        
        const validPosition = this.findValidPosition();
        
        if (!validPosition) return null;
        
        this.currentType = type;
        
        const x = validPosition.x * 20 + 10;
        const y = validPosition.y * 20 + 10;
        
        this.currentFood = {
            gridX: validPosition.x,
            gridY: validPosition.y,
            type: type,
            config: config,
            x: x,
            y: y
        };
        
        this.createVisual(x, y, config);
        this.createGlow(x, y, config);
        this.createParticles(x, y, config);
        
        return this.currentFood;
    }
    
    getRandomType() {
        const totalWeight = FOOD_WEIGHTS.reduce((sum, f) => sum + f.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const food of FOOD_WEIGHTS) {
            random -= food.weight;
            if (random <= 0) {
                return food.type;
            }
        }
        
        return 'NORMAL';
    }
    
    findValidPosition() {
        const gridWidth = 13;
        const gridHeight = 9;
        
        for (let attempts = 0; attempts < 50; attempts++) {
            const x = Math.floor(Math.random() * gridWidth) + 1;
            const y = Math.floor(Math.random() * gridHeight) + 1;
            
            if (this.isPositionValid(x, y)) {
                return { x, y };
            }
        }
        
        return null;
    }
    
    isPositionValid(x, y) {
        const tileMap = this.scene.tileMap;
        
        if (!tileMap || !tileMap.isWalkable(x, y)) {
            return false;
        }
        
        const snake = this.scene.snake;
        
        if (snake) {
            for (const segment of snake) {
                if (segment.gridX === x && segment.gridY === y) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    createVisual(x, y, config) {
        const graphics = this.scene.add.graphics();
        
        switch (config.name) {
            case 'Normal':
                this.drawNormal(graphics, x, y, config);
                break;
            case 'Slow':
                this.drawSlow(graphics, x, y, config);
                break;
            case 'Fast':
                this.drawFast(graphics, x, y, config);
                break;
            case 'Poison':
                this.drawPoison(graphics, x, y, config);
                break;
            case 'Explosive':
                this.drawExplosive(graphics, x, y, config);
                break;
            case 'Dimensional':
                this.drawDimensional(graphics, x, y, config);
                break;
        }
        
        graphics.setDepth(15);
        
        this.currentFood.graphics = graphics;
    }
    
    drawNormal(g, x, y, c) {
        g.fillStyle(c.color, 1);
        g.fillCircle(x, y, c.radius);
        
        g.fillStyle(c.highlight, 0.7);
        g.fillCircle(x - 2, y - 2, 3);
        
        g.fillStyle(0xffffff, 0.5);
        g.fillCircle(x - 1, y - 3, 1.5);
        
        g.lineStyle(1.5, 0x000000, 0.3);
        g.strokeCircle(x, y, c.radius);
    }
    
    drawSlow(g, x, y, c) {
        g.fillStyle(c.color, 1);
        g.fillCircle(x, y, c.radius);
        
        g.fillStyle(0x3377ff, 0.8);
        g.fillCircle(x, y, c.radius - 3);
        
        g.fillStyle(c.highlight, 0.6);
        g.fillCircle(x - 2, y - 3, 3);
        
        g.lineStyle(1, 0x2244aa, 0.5);
        g.strokeCircle(x, y, c.radius);
        
        g.lineStyle(1.5, 0xffffff, 0.4);
        g.strokeCircle(x - 2, y - 2, 2);
    }
    
    drawFast(g, x, y, c) {
        g.fillStyle(c.color, 1);
        g.fillCircle(x, y, c.radius);
        
        g.fillStyle(0xffaa00, 0.7);
        g.fillCircle(x, y, c.radius - 2);
        
        g.fillStyle(c.highlight, 0.8);
        g.fillCircle(x - 1, y - 2, 2);
        
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const px = x + Math.cos(angle) * 4;
            const py = y + Math.sin(angle) * 4;
            g.fillStyle(0xffffaa, 0.6);
            g.fillCircle(px, py, 1.5);
        }
        
        g.lineStyle(1, 0xcc9900, 0.6);
        g.strokeCircle(x, y, c.radius);
    }
    
    drawPoison(g, x, y, c) {
        g.fillStyle(0x225522, 1);
        g.fillCircle(x, y, c.radius);
        
        g.fillStyle(c.color, 1);
        g.fillCircle(x, y, c.radius - 1);
        
        g.fillStyle(0x66cc66, 0.7);
        g.fillCircle(x - 3, y, 2);
        g.fillCircle(x + 3, y, 2);
        g.fillCircle(x, y - 3, 2);
        g.fillCircle(x, y + 3, 2);
        
        g.fillStyle(0x88ff88, 0.6);
        g.fillCircle(x, y - 2, 2);
        
        g.lineStyle(1.5, 0x114411, 0.7);
        g.strokeCircle(x, y, c.radius);
    }
    
    drawExplosive(g, x, y, c) {
        g.fillStyle(0x220000, 1);
        g.fillCircle(x, y, c.radius);
        
        g.fillStyle(c.color, 1);
        g.fillCircle(x, y, c.radius - 2);
        
        g.fillStyle(0xff0000, 0.8);
        g.fillCircle(x, y, c.radius - 4);
        
        g.fillStyle(c.highlight, 0.9);
        g.fillCircle(x, y - 2, 3);
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + Date.now() / 500;
            const px = x + Math.cos(angle) * 5;
            const py = y + Math.sin(angle) * 5;
            g.fillStyle(0xffaa00, 0.7);
            g.fillCircle(px, py, 2);
        }
        
        g.lineStyle(1.5, 0xaa2200, 0.8);
        g.strokeCircle(x, y, c.radius);
    }
    
    drawDimensional(g, x, y, c) {
        g.fillStyle(0x220033, 1);
        g.fillCircle(x, y, c.radius + 1);
        
        g.fillStyle(0x6600aa, 1);
        g.fillCircle(x, y, c.radius);
        
        const gradient = g;
        
        for (let i = 0; i < 3; i++) {
            const offset = (i - 1) * 3;
            const alpha = 0.5 + i * 0.2;
            gradient.fillStyle(0xaa44ff, alpha);
            gradient.fillCircle(x + offset, y, 3);
        }
        
        g.fillStyle(0xcc88ff, 0.7);
        g.fillCircle(x - 2, y - 2, 2);
        
        g.lineStyle(1.5, 0x6600cc, 0.6);
        g.strokeCircle(x, y, c.radius);
        
        this.scene.tweens.add({
            targets: { value: 0 },
            value: Math.PI * 2,
            duration: 2000,
            repeat: -1,
            onUpdate: (tween) => {
                if (this.currentFood && this.currentFood.graphics) {
                    const angle = tween.getValue();
                    this.currentFood.graphics.rotation = angle * 0.5;
                }
            }
        });
    }
    
    createGlow(x, y, config) {
        const glow = this.scene.add.graphics();
        
        glow.fillStyle(config.glowColor, 0.25);
        glow.fillCircle(x, y, config.radius + 8);
        
        glow.fillStyle(config.glowColor, 0.15);
        glow.fillCircle(x, y, config.radius + 15);
        
        glow.setDepth(14);
        
        this.currentFood.glow = glow;
        
        const tween = this.scene.tweens.add({
            targets: glow,
            alpha: 0.6,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.currentFood.glowTween = tween;
    }
    
    createParticles(x, y, config) {
        const particleCount = 6;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.scene.add.graphics();
            
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = config.radius + 4;
            
            const px = x + Math.cos(angle) * distance;
            const py = y + Math.sin(angle) * distance;
            
            particle.fillStyle(config.particles, 0.7);
            particle.fillCircle(px, py, 2);
            
            particle.setDepth(16);
            
            this.particles.push(particle);
            
            this.scene.tweens.add({
                targets: { angle: angle },
                angle: angle + Math.PI * 2,
                duration: 1500 + i * 100,
                repeat: -1,
                ease: 'Linear',
                onUpdate: (tween) => {
                    if (this.particles[i]) {
                        const currentAngle = tween.getValue();
                        const newX = x + Math.cos(currentAngle) * distance;
                        const newY = y + Math.sin(currentAngle) * distance;
                        this.particles[i].x = newX - (this.particles[i].x - (this.particles[i].oldX || px));
                        this.particles[i].oldX = newX;
                        this.particles[i].y = newY - (this.particles[i].y - (this.particles[i].oldY || py));
                        this.particles[i].oldY = newY;
                    }
                }
            });
        }
    }
    
    consume() {
        if (!this.currentFood) return null;
        
        const result = {
            type: this.currentFood.type,
            config: this.currentFood.config,
            gridX: this.currentFood.gridX,
            gridY: this.currentFood.gridY
        };
        
        this.createConsumptionEffect(
            this.currentFood.x,
            this.currentFood.y,
            this.currentFood.config
        );
        
        this.cleanup();
        
        return result;
    }
    
    createConsumptionEffect(x, y, config) {
        const flash = this.scene.add.graphics();
        
        flash.fillStyle(config.highlight, 0.9);
        flash.fillCircle(x, y, config.radius + 5);
        
        flash.setDepth(50);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 300,
            onComplete: () => flash.destroy()
        });
        
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.graphics();
            
            particle.fillStyle(config.particles, 0.8);
            particle.fillCircle(x, y, 3);
            
            particle.setDepth(51);
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = 20;
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0.3,
                duration: 400,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }
    
    cleanup() {
        if (this.currentFood) {
            if (this.currentFood.graphics) {
                this.currentFood.graphics.destroy();
            }
            if (this.currentFood.glow) {
                this.currentFood.glow.destroy();
            }
            if (this.currentFood.glowTween) {
                this.currentFood.glowTween.stop();
            }
        }
        
        this.particles.forEach(p => {
            if (p) p.destroy();
        });
        this.particles = [];
        
        this.currentFood = null;
        this.currentType = null;
    }
    
    destroy() {
        this.cleanup();
    }
}