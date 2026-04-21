/**
 * =====================================
 * VISUAL STYLE MANAGER
 * =====================================
 * 
 * Sistema visual completo para jogo estilo Bomberman
 * com estética semi-realista.
 * 
 * CARACTERÍSTICAS:
 * - Texturas procedurales (sem assets externos)
 * - Iluminação dinâmica
 * - Sombras reais
 * - Partículas
 * - Efeitos visuais
 */

import Phaser from 'phaser';

export default class VisualStyleManager {
    constructor(scene) {
        this.scene = scene;
        
        // Paleta de cores
        this.colors = {
            // Ambiente
            ground: 0x3d3d3d,
            groundAlt: 0x4a4a4a,
            
            // Paredes
            wallSolid: 0x5a5a5a,
            wallDestructible: 0x7a6a5a,
            wallCracked: 0x6a5a4a,
            
            // Blocos
            blockLight: 0x6a6a6a,
            blockDark: 0x4a4a4a,
            blockEdge: 0x3a3a3a,
            
            // Detalhes
            dirt: 0x5a4a3a,
            crack: 0x2a2a2a,
            moss: 0x4a5a3a,
            
            // Efeitos
            fire: 0xff6600,
            fireCore: 0xffff00,
            explosion: 0xff4400,
            smoke: 0x333333,
            
            // Iluminação
            ambient: 0x222233,
            lightSource: 0xffaa44,
            shadow: 0x000011
        };
        
        // Criar texturas procedurales
        this.createTextures();
    }
    
    // =====================================
    // TEXTURAS PROCEDURAIS
    // =====================================
    
    createTextures() {
        this.createGroundTexture();
        this.createWallTexture();
        this.createBlockTexture();
        this.createDamageTexture();
    }
    
    createGroundTexture() {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        
        const size = 20;
        
        // Base
        graphics.fillStyle(this.colors.ground, 1);
        graphics.fillRect(0, 0, size, size);
        
        // Ruído (pontos aleatórios)
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const alpha = Math.random() * 0.15;
            graphics.fillStyle(this.colors.groundAlt, alpha);
            graphics.fillCircle(x, y, Math.random() * 2 + 1);
        }
        
        // Linhas de desgaste
        graphics.lineStyle(1, this.colors.blockEdge, 0.1);
        for (let i = 0; i < 3; i++) {
            const x1 = Math.random() * size;
            const y1 = Math.random() * size;
            graphics.moveTo(x1, y1);
            graphics.lineTo(x1 + Math.random() * 4 - 2, y1 + Math.random() * 4 - 2);
        }
        
        graphics.strokePath();
        
        graphics.generateTexture('ground', size, size);
        graphics.destroy();
    }
    
    createWallTexture() {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        
        const size = 20;
        
        // Base
        graphics.fillStyle(this.colors.wallSolid, 1);
        graphics.fillRect(0, 0, size, size);
        
        // Borda superior clara (luz)
        graphics.lineStyle(1, this.colors.blockLight, 0.8);
        graphics.moveTo(1, 1);
        graphics.lineTo(size - 1, 1);
        graphics.lineTo(size - 1, size - 3);
        
        // Borda inferior escura (sombra)
        graphics.lineStyle(2, this.colors.blockDark, 1);
        graphics.moveTo(1, size - 1);
        graphics.lineTo(1, size - 3);
        graphics.lineTo(size - 1, size - 3);
        
        graphics.strokePath();
        
        // Textura (ruído)
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * (size - 2) + 1;
            const y = Math.random() * (size - 2) + 1;
            graphics.fillStyle(this.colors.dirt, Math.random() * 0.1);
            graphics.fillCircle(x, y, Math.random() * 2);
        }
        
        // Rachaduras
        for (let i = 0; i < 2; i++) {
            const startX = Math.random() * size;
            const startY = Math.random() * size;
            graphics.lineStyle(1, this.colors.crack, 0.3);
            graphics.moveTo(startX, startY);
            graphics.lineTo(startX + Math.random() * 6 - 3, startY + Math.random() * 6 - 3);
        }
        
        graphics.strokePath();
        
        graphics.generateTexture('wall', size, size);
        graphics.destroy();
    }
    
    createBlockTexture() {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        
        const size = 20;
        
        // Base
        graphics.fillStyle(this.colors.wallDestructible, 1);
        graphics.fillRect(0, 0, size, size);
        
        // Tijolos (linhas)
        graphics.lineStyle(1, this.colors.wallCracked, 0.5);
        
        // Horizontal
        graphics.moveTo(0, size * 0.33);
        graphics.lineTo(size, size * 0.33);
        graphics.moveTo(0, size * 0.66);
        graphics.lineTo(size, size * 0.66);
        
        // Verticais alternadas
        graphics.moveTo(size * 0.5, 0);
        graphics.lineTo(size * 0.5, size * 0.33);
        graphics.moveTo(size * 0.25, size * 0.33);
        graphics.lineTo(size * 0.25, size * 0.66);
        graphics.moveTo(size * 0.75, size * 0.33);
        graphics.lineTo(size * 0.75, size * 0.66);
        
        graphics.strokePath();
        
        // Borda 3D
        graphics.lineStyle(1, this.colors.blockLight, 0.5);
        graphics.moveTo(1, 1);
        graphics.lineTo(size - 1, 1);
        
        graphics.lineStyle(1, this.colors.blockDark, 0.8);
        graphics.moveTo(1, size - 1);
        graphics.lineTo(size - 1, size - 1);
        
        graphics.strokePath();
        
        // Manchas
        for (let i = 0; i < 4; i++) {
            graphics.fillStyle(this.colors.dirt, Math.random() * 0.15);
            graphics.fillCircle(
                Math.random() * size,
                Math.random() * size,
                Math.random() * 3
            );
        }
        
        graphics.generateTexture('block', size, size);
        graphics.destroy();
    }
    
    createDamageTexture() {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        
        const size = 20;
        
        // Base danificada
        graphics.fillStyle(this.colors.wallDestructible, 1);
        graphics.fillRect(0, 0, size, size);
        
        // Buracos/rachaduras
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = Math.random() * 4 + 2;
            graphics.fillStyle(this.colors.crack, 0.8);
            graphics.fillCircle(x, y, r);
        }
        
        // Escombros
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const w = Math.random() * 3 + 1;
            const h = Math.random() * 2 + 1;
            graphics.fillStyle(this.colors.wallSolid, 0.5);
            graphics.fillRect(x, y, w, h);
        }
        
        graphics.generateTexture('damage', size, size);
        graphics.destroy();
    }
    
    // =====================================
    // ILUMINAÇÃO
    // =====================================
    
    createLightSource(x, y, radius, intensity = 1) {
        const graphics = this.scene.add.graphics();
        
        // Círculo de luz
        graphics.fillStyle(this.colors.lightSource, intensity * 0.3);
        graphics.fillCircle(x, y, radius);
        
        // Brilho interno
        graphics.fillStyle(0xffffff, intensity * 0.2);
        graphics.fillCircle(x, y, radius * 0.5);
        
        return graphics;
    }
    
    // =====================================
    // SOMBRAS
    // =====================================
    
    createShadowObject(x, y, width, height, offsetX = 2, offsetY = 2) {
        const graphics = this.scene.add.graphics();
        
        graphics.fillStyle(this.colors.shadow, 0.6);
        graphics.fillRect(x + offsetX, y + offsetY, width, height);
        
        return graphics;
    }
    
    // =====================================
    // PARTÍCULAS
    // =====================================
    
    createParticleEmitter(config) {
        const particles = this.scene.add.particles(0, 0, 'particle', {
            speed: config.speed || 100,
            angle: config.angle || { min: 0, max: 360 },
            scale: config.scale || { start: 0.5, end: 0 },
            lifespan: config.lifespan || 500,
            quantity: config.quantity || 1,
            gravityY: config.gravity || 0,
            tint: config.tint || 0xffffff,
            blendMode: config.blendMode || 'ADD',
            frequency: config.frequency || 100,
            on: config.on !== false
        });
        
        return particles;
    }
    
    // =====================================
    // EFEITOS VISUAIS
    // =====================================
    
    createExplosionEffect(x, y) {
        // Flash
        const flash = this.scene.add.graphics();
        flash.fillStyle(0xffffff, 0.8);
        flash.fillCircle(x + 10, y + 10, 25);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 1.5,
            duration: 150,
            onComplete: () => flash.destroy()
        });
        
        // Fumaça
        const smoke = this.scene.add.graphics();
        smoke.fillStyle(this.colors.smoke, 0.6);
        smoke.fillCircle(x + 10, y + 10, 15);
        
        this.scene.tweens.add({
            targets: smoke,
            alpha: 0,
            scale: 2,
            y: y - 20,
            duration: 500,
            onComplete: () => smoke.destroy()
        });
        
        // Partículas de fogo
        for (let i = 0; i < 8; i++) {
            const particle = this.scene.add.graphics();
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 20;
            particle.fillStyle(
                Math.random() > 0.5 ? this.colors.fire : this.colors.fireCore,
                0.8
            );
            particle.fillCircle(x + 10, y + 10, Math.random() * 4 + 2);
            
            this.scene.tweens.add({
                targets: particle,
                x: x + 10 + Math.cos(angle) * dist,
                y: y + 10 + Math.sin(angle) * dist,
                alpha: 0,
                scale: 0,
                duration: 300 + Math.random() * 200,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    createDustEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            const dust = this.scene.add.graphics();
            dust.fillStyle(this.colors.dirt, 0.4);
            dust.fillCircle(x + Math.random() * 20, y + Math.random() * 20, Math.random() * 3);
            
            this.scene.tweens.add({
                targets: dust,
                y: y - 10 - Math.random() * 10,
                alpha: 0,
                duration: 400 + Math.random() * 200,
                onComplete: () => dust.destroy()
            });
        }
    }
    
    // =====================================
    // BLEND MODES
    // =====================================
    
    getAdditiveBlend() {
        return Phaser.BlendModes.ADD;
    }
    
    getMultiplyBlend() {
        return Phaser.BlendModes.MULTIPLY;
    }
    
    // =====================================
    // FILTROS
    // =====================================
    
    createGlowFilter() {
        return {
            kerneldx: [0, 0, 0, 0, 1, 0, 0, 0, 0],
            kerneldy: [0, 0, 0, 0, 1, 0, 0, 0, 0],
            source: [0, 0, 0, 0, 1, 0, 0, 0, 0]
        };
    }
    
    // =====================================
    // CAMERA EFFECTS
    // =====================================
    
    shakeCamera(intensity = 0.01, duration = 100) {
        this.scene.cameras.main.shake(duration, intensity);
    }
    
    flashCamera(color = 0xffffff, duration = 100) {
        this.scene.cameras.main.flash(duration, color, false);
    }
    
    // =====================================
    // CLEANUP
    // =====================================
    
    destroy() {
        // Limpar texturas
        const textures = ['ground', 'wall', 'block', 'damage'];
        textures.forEach(name => {
            if (this.scene.textures.exists(name)) {
                this.scene.textures.remove(name);
            }
        });
    }
}