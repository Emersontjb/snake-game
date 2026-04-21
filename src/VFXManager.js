/**
 * =====================================
 * VFX MANAGER - EFEITOS VISUAIS
 * =====================================
 * 
 * Sistema de efeitos visuais otimizado para mobile.
 * 
 * EFEITOS:
 * - Explosões com partículas
 * - Teleporte dimensional
 * - Poeira ao colidir
 * - Brilho em comidas especiais
 */

import Phaser from 'phaser';

// =====================================
// CORES
// =====================================

const COLORS = {
    // Explosão
    FIRE: 0xff4400,
    FIRE_CORE: 0xffaa00,
    FIRE_WHITE: 0xffffff,
    SMOKE: 0x444444,
    
    // Teleporte
    PORTAL: 0xaa44ff,
    PORTAL_CORE: 0xffffff,
    PORTAL_OUTER: 0x6622cc,
    
    // Poeira
    DUST: 0x887766,
    DUST_LIGHT: 0xa99887,
    
    // Brilho especial
    GLOW_GOLD: 0xffdd00,
    GLOW_SILVER: 0xcccccc,
    GLOW_RAINBOW: [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff],
    
    // Snake
    SNAKE_HEAD: 0x00ff88,
    SNAKE_GLOW: 0x00ffaa
};

export default class VFXManager {
    constructor(scene) {
        this.scene = scene;
        
        // Pool de partículas (otimização)
        this.particlePool = [];
        this.maxPoolSize = 30;
        
        // Contador para animações
        this.time = 0;
        
        console.log('✨ VFX Manager criado');
    }
    
    // =====================================
    // EXPLOSÃO COM PARTÍCULAS
    // =====================================
    
    createExplosion(x, y, intensity = 1) {
        // 1. Flash central
        this.createFlash(x, y, 20 * intensity);
        
        // 2. Partículas de fogo
        this.createFireParticles(x, y, 8 * intensity);
        
        // 3. Fumaça
        this.createSmoke(x, y, 5 * intensity);
        
        // 4. Centelhas
        this.createSparks(x, y, 6 * intensity);
    }
    
    createFlash(x, y, radius) {
        const flash = this.scene.add.graphics();
        
        // Flash branco
        flash.fillStyle(0xffffff, 0.9);
        flash.fillCircle(x, y, radius);
        
        flash.setDepth(100);
        
        // Animação: escala + fade
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 150,
            ease: 'Cubic.easeOut',
            onComplete: () => flash.destroy()
        });
    }
    
    createFireParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            const particle = this.scene.add.graphics();
            
            // Cor aleatória entre fogo
            const colors = [COLORS.FIRE, COLORS.FIRE_CORE, COLORS.FIRE_WHITE];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const size = 3 + Math.random() * 4;
            
            particle.fillStyle(color, 0.9);
            particle.fillCircle(0, 0, size);
            
            particle.setPosition(x, y);
            particle.setDepth(50);
            
            // Direção aleatória
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 40;
            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance - Math.random() * 30;
            
            // Animação
            this.scene.tweens.add({
                targets: particle,
                x: targetX,
                y: targetY,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 200 + Math.random() * 200,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }
    
    createSmoke(x, y, count) {
        for (let i = 0; i < count; i++) {
            const smoke = this.scene.add.graphics();
            
            smoke.fillStyle(COLORS.SMOKE, 0.5);
            smoke.fillCircle(0, 0, 4 + Math.random() * 4);
            
            smoke.setPosition(x, y);
            smoke.setDepth(40);
            
            const targetY = y - 20 - Math.random() * 20;
            
            this.scene.tweens.add({
                targets: smoke,
                y: targetY,
                alpha: 0,
                scaleX: 2,
                scaleY: 2,
                duration: 400 + Math.random() * 300,
                onComplete: () => smoke.destroy()
            });
        }
    }
    
    createSparks(x, y, count) {
        for (let i = 0; i < count; i++) {
            const spark = this.scene.add.graphics();
            
            spark.fillStyle(0xffcc00, 1);
            spark.fillRect(-1, -1, 2, 4);
            
            spark.setPosition(x, y);
            spark.setDepth(60);
            spark.setRotation(Math.random() * Math.PI);
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 50;
            
            this.scene.tweens.add({
                targets: spark,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                rotation: spark.rotation + Math.random() * 4 - 2,
                duration: 150 + Math.random() * 100,
                onComplete: () => spark.destroy()
            });
        }
    }
    
    // =====================================
    // TELEPORTE DIMENSIONAL
    // =====================================
    
    createTeleportEffect(x, y, callback) {
        // 1. Anel de portal
        this.createPortalRing(x, y);
        
        // 2. Partículas deportal
        this.createPortalParticles(x, y);
        
        // 3. Screen flash
        this.createTeleportFlash(x, y);
        
        // 4. Callback após efeito
        this.scene.time.delayedCall(300, callback);
    }
    
    createPortalRing(x, y) {
        // Anel crescente
        const ring = this.scene.add.graphics();
        
        ring.lineStyle(3, COLORS.PORTAL, 1);
        ring.strokeCircle(x, y, 5);
        
        ring.setDepth(100);
        
        // Crescer
        this.scene.tweens.add({
            targets: ring,
            scaleX: 8,
            scaleY: 8,
            alpha: 0,
            duration: 400,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });
        
        // Segundo anel
        const ring2 = this.scene.add.graphics();
        ring2.lineStyle(2, COLORS.PORTAL_OUTER, 0.8);
        ring2.strokeCircle(x, y, 3);
        
        this.scene.tweens.add({
            targets: ring2,
            scaleX: 10,
            scaleY: 10,
            alpha: 0,
            duration: 500,
            ease: 'Cubic.easeOut',
            onComplete: () => ring2.destroy()
        });
    }
    
    createPortalParticles(x, y) {
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.scene.add.graphics();
            
            const color = i % 2 === 0 ? COLORS.PORTAL : COLORS.PORTAL_CORE;
            particle.fillStyle(color, 0.9);
            particle.fillCircle(0, 0, 2 + Math.random() * 2);
            
            particle.setPosition(x, y);
            particle.setDepth(101);
            
            // Mover em espiral
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 5;
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * radius * 3,
                y: y + Math.sin(angle) * radius * 3,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 350,
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }
    
    createTeleportFlash(x, y) {
        // Flash de tela
        const camera = this.scene.cameras.main;
        
        this.scene.cameras.main.flash(200, 170, 68, 255, false);
    }
    
    // =====================================
    // POEIRA AO COLIDIR
    // =====================================
    
    createDustCloud(x, y, direction) {
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const dust = this.scene.add.graphics();
            
            const color = Math.random() > 0.5 ? COLORS.DUST : COLORS.DUST_LIGHT;
            dust.fillStyle(color, 0.6);
            dust.fillCircle(0, 0, 2 + Math.random() * 3);
            
            dust.setPosition(x, y);
            dust.setDepth(30);
            
            // Direção baseada no impacto
            let angle;
            if (direction === 'left') {
                angle = Math.PI + (Math.random() - 0.5);
            } else if (direction === 'right') {
                angle = (Math.random() - 0.5);
            } else if (direction === 'up') {
                angle = -Math.PI / 2 + (Math.random() - 0.5);
            } else {
                angle = Math.PI / 2 + (Math.random() - 0.5);
            }
            
            const distance = 15 + Math.random() * 25;
            
            this.scene.tweens.add({
                targets: dust,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                duration: 300 + Math.random() * 150,
                onComplete: () => dust.destroy()
            });
        }
    }
    
    createWallImpact(x, y, direction) {
        // Impacto visual
        const impact = this.scene.add.graphics();
        
        impact.fillStyle(0xffffff, 0.5);
        impact.fillCircle(x, y, 8);
        
        impact.setDepth(25);
        
        this.scene.tweens.add({
            targets: impact,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 100,
            onComplete: () => impact.destroy()
        });
        
        // Poeira
        this.createDustCloud(x, y, direction);
    }
    
    // =====================================
    // BRILHO EM COMIDA ESPECIAL
    // =====================================
    
    createGlowEffect(sprite, type = 'gold') {
        // Anel de brilho
        const glow = this.scene.add.graphics();
        
        let color;
        switch (type) {
            case 'gold':
                color = COLORS.GLOW_GOLD;
                break;
            case 'silver':
                color = COLORS.GLOW_SILVER;
                break;
            case 'rainbow':
                color = COLORS.GLOW_RAINBOW[0];
                break;
            default:
                color = COLORS.GLOW_GOLD;
        }
        
        glow.fillStyle(color, 0.3);
        glow.fillCircle(0, 0, 15);
        
        glow.setPosition(sprite.x, sprite.y);
        glow.setDepth(sprite.depth - 1);
        
        // Animação de pulsar
        const tween = this.scene.tweens.add({
            targets: glow,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Rainbow effect
        if (type === 'rainbow') {
            this.scene.tweens.addCounter({
                from: 0,
                to: 5,
                duration: 1000,
                repeat: -1,
                onUpdate: (tween) => {
                    const index = Math.floor(tween.getValue()) % 6;
                    glow.clear();
                    glow.fillStyle(COLORS.GLOW_RAINBOW[index], 0.3);
                    glow.fillCircle(0, 0, 15);
                }
            });
        }
        
        return {
            glow: glow,
            stop: () => {
                tween.stop();
                glow.destroy();
            }
        };
    }
    
    // =====================================
    // FOOD SPECIAL EFFECTS
    // =====================================
    
    createFoodCollectEffect(x, y) {
        // Anel
        const ring = this.scene.add.graphics();
        ring.lineStyle(2, COLORS.SNAKE_GLOW, 1);
        ring.strokeCircle(x, y, 5);
        ring.setDepth(50);
        
        this.scene.tweens.add({
            targets: ring,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 300,
            onComplete: () => ring.destroy()
        });
        
        // Partículas
        for (let i = 0; i < 4; i++) {
            const particle = this.scene.add.graphics();
            particle.fillStyle(COLORS.SNAKE_GLOW, 0.8);
            particle.fillCircle(0, 0, 2);
            particle.setPosition(x, y);
            
            const angle = (i / 4) * Math.PI * 2;
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 15,
                y: y + Math.sin(angle) * 15,
                alpha: 0,
                duration: 200,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    // =====================================
    // SNAKE EFFECTS
    // =====================================
    
    createTrailEffect(x, y) {
        const trail = this.scene.add.graphics();
        
        trail.fillStyle(COLORS.SNAKE_GLOW, 0.3);
        trail.fillCircle(0, 0, 4);
        
        trail.setPosition(x, y);
        trail.setDepth(5);
        
        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 200,
            onComplete: () => trail.destroy()
        });
    }
    
    createDeathEffect(x, y) {
        // Múltiplas explosões
        for (let i = 0; i < 3; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                this.createExplosion(
                    x + (Math.random() - 0.5) * 20,
                    y + (Math.random() - 0.5) * 20,
                    0.5
                );
            });
        }
        
        // Screen shake
        this.scene.cameras.main.shake(300, 0.02);
    }
    
    // =====================================
    // CLEANUP
    // =====================================
    
    destroy() {
        // Limpar partículas
        this.particlePool.length = 0;
    }
}