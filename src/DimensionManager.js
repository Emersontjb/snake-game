/**
 * =====================================
 * DIMENSION MANAGER
 * =====================================
 * 
 * Sistema de dimensões alternativas.
 * атмосфера única com cores e efeitos.
 */

import Phaser from 'phaser';

const DIMENSIONS = {
    NORMAL: {
        name: 'Normal',
        
        // Cores do cenário
        background: 0x1a1a2e,
        wall: 0x2d2d4a,
        wallDark: 0x1d1d2a,
        floor: 0x252540,
        floorPattern: 0x2a2a45,
        
        // Cores da cobra
        snakeHead: 0x3d6a4d,
        snakeBody: [0x2d5a3d, 0x3d6a4d, 0x1d4a2d],
        snakeEye: 0xeeeeee,
        snakePupil: 0x111111,
        
        // Iluminação
        ambient: { r: 0.08, g: 0.1, b: 0.12 },
        ambientIntensity: 0.4,
        playerGlow: 0x44ff88,
        foodGlow: 0xff4466,
        
        // Partículas
        particleColor: 0x4466aa,
        particleCount: 5,
        
        // Efeitos
        distortion: false,
        waveEffect: false,
        vignette: true,
        
        // UI
        uiColor: 0x4488ff,
        uiText: '#ffffff'
    },
    
    QUANTUM: {
        name: 'Quantum',
        
        background: 0x0a0a1a,
        wall: 0x1a0a3a,
        wallDark: 0x0a0a1a,
        floor: 0x100520,
        floorPattern: 0x150830,
        
        snakeHead: 0x6644ff,
        snakeBody: [0x4422ff, 0x6633ff, 0x2211ff],
        snakeEye: 0xaaaaff,
        snakePupil: 0x000033,
        
        ambient: { r: 0.04, g: 0.02, b: 0.08 },
        ambientIntensity: 0.3,
        playerGlow: 0x8844ff,
        foodGlow: 0xff44ff,
        
        particleColor: 0x6644ff,
        particleCount: 8,
        
        distortion: true,
        waveEffect: true,
        vignette: true,
        
        uiColor: 0x8844ff,
        uiText: '#cc88ff'
    },
    
    NEON: {
        name: 'Neon',
        
        background: 0x001015,
        wall: 0x003040,
        wallDark: 0x001525,
        floor: 0x002030,
        floorPattern: 0x003545,
        
        snakeHead: 0x00ffff,
        snakeBody: [0x00aaaa, 0x00dddd, 0x008888],
        snakeEye: 0xffffff,
        snakePupil: 0x003333,
        
        ambient: { r: 0.0, g: 0.05, b: 0.05 },
        ambientIntensity: 0.25,
        playerGlow: 0x00ffff,
        foodGlow: 0xff00ff,
        
        particleColor: 0x00ffff,
        particleCount: 10,
        
        distortion: true,
        waveEffect: false,
        vignette: false,
        
        uiColor: 0x00ffff,
        uiText: '#00ffff'
    },
    
    CORROSIVE: {
        name: 'Corrosive',
        
        background: 0x0a1a0a,
        wall: 0x1a2a0a,
        wallDark: 0x0a1a0a,
        floor: 0x101a10,
        floorPattern: 0x1a2515,
        
        snakeHead: 0x88ff00,
        snakeBody: [0x66cc00, 0x88ff00, 0x44aa00],
        snakeEye: 0xccff88,
        snakePupil: 0x112200,
        
        ambient: { r: 0.02, g: 0.06, b: 0.02 },
        ambientIntensity: 0.35,
        playerGlow: 0xaaff00,
        foodGlow: 0x00ff66,
        
        particleColor: 0x66ff00,
        particleCount: 12,
        
        distortion: true,
        waveEffect: true,
        vignette: true,
        
        uiColor: 0x88ff00,
        uiText: '#aaff00'
    },
    
    VOID: {
        name: 'Void',
        
        background: 0x000000,
        wall: 0x111111,
        wallDark: 0x000000,
        floor: 0x050505,
        floorPattern: 0x0a0a0a,
        
        snakeHead: 0x444444,
        snakeBody: [0x333333, 0x444444, 0x222222],
        snakeEye: 0x666666,
        snakePupil: 0x000000,
        
        ambient: { r: 0.0, g: 0.0, b: 0.0 },
        ambientIntensity: 0.15,
        playerGlow: 0x333333,
        foodGlow: 0xffffff,
        
        particleColor: 0x222222,
        particleCount: 3,
        
        distortion: false,
        waveEffect: false,
        vignette: true,
        
        uiColor: 0x666666,
        uiText: '#888888'
    }
};

const DIMENSION_WEIGHTS = [
    { dim: 'NORMAL', weight: 70 },
    { dim: 'QUANTUM', weight: 15 },
    { dim: 'NEON', weight: 8 },
    { dim: 'CORROSIVE', weight: 5 },
    { dim: 'VOID', weight: 2 }
];

export default class DimensionManager {
    constructor(scene) {
        this.scene = scene;
        
        this.currentDimension = 'NORMAL';
        this.config = DIMENSIONS.NORMAL;
        
        this.overlay = null;
        this.particles = [];
        this.distortionGraphics = null;
        this.time = 0;
    }
    
    setDimension(dimensionName) {
        if (!DIMENSIONS[dimensionName]) {
            console.warn(`Dimensão ${dimensionName} não encontrada`);
            return;
        }
        
        this.currentDimension = dimensionName;
        this.config = DIMENSIONS[dimensionName];
        
        this.applyDimension();
    }
    
    getRandomDimension() {
        const totalWeight = DIMENSION_WEIGHTS.reduce((sum, d) => sum + d.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const dim of DIMENSION_WEIGHTS) {
            random -= dim.weight;
            if (random <= 0) {
                return dim.dim;
            }
        }
        
        return 'NORMAL';
    }
    
    applyDimension() {
        this.updateBackground();
        this.updateWalls();
        this.createOverlay();
        this.createParticles();
        
        if (this.config.distortion) {
            this.createDistortionEffect();
        }
    }
    
    updateBackground() {
        if (this.scene && this.scene.cameras) {
            const bg = `#${this.config.background.toString(16).padStart(6, '0')}`;
            this.scene.cameras.main.setBackgroundColor(bg);
        }
    }
    
    updateWalls() {
        if (this.scene && this.scene.tileMap) {
            this.scene.tileMap.updateColors(this.config);
        }
    }
    
    createOverlay() {
        if (this.overlay) {
            this.overlay.destroy();
        }
        
        this.overlay = this.scene.add.graphics();
        this.overlay.setDepth(150);
        this.overlay.setAlpha(0);
        
        if (this.config.vignette) {
            this.renderVignette();
        }
        
        this.scene.tweens.add({
            targets: this.overlay,
            alpha: 1,
            duration: 500,
            ease: 'Quad.easeOut'
        });
    }
    
    renderVignette() {
        const width = 300;
        const height = 220;
        
        for (let i = 5; i >= 0; i--) {
            const alpha = 0.15 - i * 0.02;
            const radius = 40 + i * 25;
            
            this.overlay.fillStyle(0x000000, alpha);
            
            this.overlay.fillCircle(width / 2, height / 2, radius);
        }
    }
    
    createParticles() {
        this.clearParticles();
        
        if (!this.config.distortion && !this.config.waveEffect) return;
        
        const count = this.config.particleCount;
        
        for (let i = 0; i < count; i++) {
            const particle = this.scene.add.graphics();
            
            const x = Math.random() * 300;
            const y = Math.random() * 220;
            
            particle.fillStyle(this.config.particleColor, 0.3);
            particle.fillCircle(x, y, 1 + Math.random() * 2);
            
            particle.setDepth(5);
            particle.setAlpha(0);
            
            this.particles.push({
                graphics: particle,
                x: x,
                y: y,
                speed: 0.2 + Math.random() * 0.5,
                amplitude: 5 + Math.random() * 15,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    clearParticles() {
        this.particles.forEach(p => {
            if (p.graphics) p.graphics.destroy();
        });
        this.particles = [];
    }
    
    createDistortionEffect() {
        if (this.distortionGraphics) {
            this.distortionGraphics.destroy();
        }
        
        this.distortionGraphics = this.scene.add.graphics();
        this.distortionGraphics.setDepth(4);
        
        this.waveOffset = 0;
    }
    
    update(time, delta) {
        this.time += delta * 0.001;
        
        if (this.config.waveEffect && this.distortionGraphics) {
            this.updateWaveEffect();
        }
        
        this.updateParticles(time);
    }
    
    updateWaveEffect() {
        if (!this.distortionGraphics) return;
        
        this.distortionGraphics.clear();
        
        const config = this.config;
        const time = this.time;
        
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 11; y++) {
                const screenX = x * 20 + 10;
                const screenY = y * 20 + 10;
                
                const wave = Math.sin(time * 2 + x * 0.3 + y * 0.2) * 2;
                
                if (Math.abs(wave) > 0.5) {
                    const alpha = Math.abs(wave) * 0.1;
                    this.distortionGraphics.fillStyle(config.particleColor, alpha);
                    this.distortionGraphics.fillCircle(screenX + wave, screenY, 3);
                }
            }
        }
    }
    
    updateParticles(time) {
        this.particles.forEach(p => {
            p.y -= p.speed;
            
            if (p.y < -10) {
                p.y = 230;
                p.x = Math.random() * 300;
            }
            
            const waveX = Math.sin(time * 2 + p.phase) * p.amplitude;
            
            const g = p.graphics;
            g.x = waveX;
            g.y = p.y;
            
            const flicker = 0.2 + Math.sin(time * 3 + p.phase) * 0.15;
            g.setAlpha(flicker);
        });
    }
    
    getSnakeColors() {
        return {
            head: this.config.snakeHead,
            body: this.config.snakeBody,
            eye: this.config.snakeEye,
            pupil: this.config.snakePupil
        };
    }
    
    getLightingConfig() {
        return {
            ambient: { ...this.config.ambient },
            ambientIntensity: this.config.ambientIntensity,
            playerGlow: this.config.playerGlow,
            foodGlow: this.config.foodGlow
        };
    }
    
    getUIColors() {
        return {
            color: this.config.uiColor,
            text: this.config.uiText
        };
    }
    
    transitionTo(newDimension, duration = 1000) {
        const oldConfig = this.config;
        const oldDimension = this.currentDimension;
        
        this.setDimension(newDimension);
        
        const newConfig = this.config;
        
        this.scene.tweens.add({
            targets: this.scene.cameras.main,
            scrollX: 0,
            duration: duration,
            ease: 'Quad.easeInOut'
        });
        
        if (this.scene.lighting) {
            this.scene.lighting.updateConfig(newConfig);
        }
    }
    
    destroy() {
        this.clearParticles();
        
        if (this.overlay) this.overlay.destroy();
        if (this.distortionGraphics) this.distortionGraphics.destroy();
    }
}