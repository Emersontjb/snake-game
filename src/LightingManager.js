/**
 * =====================================
 * LIGHTING MANAGER
 * =====================================
 * 
 * Sistema de iluminação otimizado para mobile.
 * 
 * CARACTERÍSTICAS:
 * - Luz ambiente configurável
 * - Fontes de luz dinâmicas
 * - Sombras rápidas
 * - Destaque de personagem
 * - WebGL-ready (Phaser)
 * - Mobile-first
 */

import Phaser from 'phaser';

// =====================================
// CONSTANTES
// =====================================

const LIGHT_PRESETS = {
    // Ambiente padrão (suave)
    DEFAULT: {
        ambient: { r: 0.15, g: 0.15, b: 0.2 },
        ambientIntensity: 0.6
    },
    
    // Estilo minecraft/dungeon
    DUNGEON: {
        ambient: { r: 0.1, g: 0.1, b: 0.15 },
        ambientIntensity: 0.4
    },
    
    // Estilo underground
    UNDERGROUND: {
        ambient: { r: 0.05, g: 0.05, b: 0.08 },
        ambientIntensity: 0.3
    },
    
    // Estilo noturno
    NIGHT: {
        ambient: { r: 0.05, g: 0.05, b: 0.15 },
        ambientIntensity: 0.2
    }
};

export default class LightingManager {
    constructor(scene, config = LIGHT_PRESETS.DEFAULT) {
        this.scene = scene;
        
        // Config
        this.config = config;
        
        // Camadas de iluminação
        this.lightsContainer = null;
        this.lightSources = [];
        
        // Performance
        this.activeLights = 0;
        this.maxLights = 4; // Mobile limit
        
        // Criar sistema
        this.create();
    }
    
    create() {
        // Container de iluminação
        this.lightsContainer = this.scene.add.container(0, 0);
        this.lightsContainer.setDepth(50); // Acima do jogo
        this.lightsContainer.setAlpha(0);
        
        // Fundo de iluminção (overlay)
        this.ambientLight = this.scene.add.graphics();
        this.renderAmbientLight();
        this.lightsContainer.add(this.ambientLight);
        
        //Sprite do jogador para destaque
        this.playerGlow = null;
        
        console.log('💡 Sistema de iluminação criado');
    }
    
    // =====================================
    // LUZ AMBIENTE
    // =====================================
    
    renderAmbientLight() {
        const { width, height } = this.scene.scale;
        
        this.ambientLight.clear();
        
        // Cor ambiente
        const c = this.config.ambient;
        const intensity = this.config.ambientIntensity;
        
        this.ambientLight.fillStyle(
            Phaser.Display.Color.GetColor(
                c.r * 255,
                c.g * 255,
                c.b * 255
            ),
            1 - intensity
        );
        this.ambientLight.fillRect(0, 0, width, height);
    }
    
    // =====================================
    // FONTE DE LUZ (otimizada)
    // =====================================
    
    createLightSource(x, y, radius = 60, color = 0xffaa66, intensity = 1) {
        // Limit para mobile
        if (this.activeLights >= this.maxLights) {
            return null;
        }
        
        const light = this.scene.add.graphics();
        
        // Círculo externo (escuro)
        light.fillStyle(color, intensity * 0.3);
        light.fillCircle(x, y, radius);
        
        // Círculo médio
        light.fillStyle(color, intensity * 0.15);
        light.fillCircle(x, y, radius * 0.7);
        
        // Centro brilhante
        light.fillStyle(0xffffff, intensity * 0.2);
        light.fillCircle(x, y, radius * 0.3);
        
        // Configurar blend
        light.setBlendMode(Phaser.BlendModes.SCREEN);
        
        this.lightsContainer.add(light);
        this.lightSources.push({
            graphics: light,
            x: x,
            y: y,
            radius: radius,
            intensity: intensity
        });
        
        this.activeLights++;
        
        return light;
    }
    
    // =====================================
    // LUZ DO JOGADOR (destaque)
    // =====================================
    
    addPlayerGlow(targetSprite) {
        if (this.playerGlow) {
            this.playerGlow.destroy();
        }
        
        // Glow suave ao redor do jogador
        this.playerGlow = this.scene.add.graphics();
        
        this.lightsContainer.add(this.playerGlow);
        
        return this.playerGlow;
    }
    
    updatePlayerGlow(x, y, active = true) {
        if (!active) {
            if (this.playerGlow) {
                this.playerGlow.clear();
            }
            return;
        }
        
        if (!this.playerGlow) {
            this.addPlayerGlow();
        }
        
        this.playerGlow.clear();
        
        // Sombra ao redor do jogador
        const offset = 2;
        const size = 18;
        
        // Sombra suave (preto)
        this.playerGlow.fillStyle(0x000022, 0.6);
        this.playerGlow.fillCircle(x + offset, y + offset, size + 4);
        
        // Destaque sutil (azulado)
        this.playerGlow.fillStyle(0x6666aa, 0.15);
        this.playerGlow.fillCircle(x, y - 2, size);
        
        // Borda sutil
        this.playerGlow.lineStyle(1, 0x6666aa, 0.3);
        this.playerGlow.strokeCircle(x, y, size);
    }
    
    // =====================================
    // LUZ DE EXPLOSÃO
    // =====================================
    
    createExplosionLight(x, y) {
        //Flash rápido
        const flash = this.scene.add.graphics();
        flash.fillStyle(0xffffff, 0.8);
        flash.fillCircle(x, y, 40);
        flash.setBlendMode(Phaser.BlendModes.ADD);
        flash.setDepth(100);
        
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 2,
            duration: 200,
            onComplete: () => flash.destroy()
        });
        
        // Luz dinâmica temporária
        const light = this.createLightSource(x, y, 80, 0xff6600, 0.8);
        
        if (light) {
            // Fade out
            this.scene.tweens.add({
                targets: light,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    if (light.parentContainer) {
                        light.parentContainer.remove(light);
                    }
                    light.destroy();
                    this.activeLights--;
                }
            });
        }
    }
    
    // =====================================
    // LUZ DE BOMBA
    // =====================================
    
    createBombLight(x, y) {
        const light = this.createLightSource(x, y, 40, 0xffaa44, 0.5);
        
        if (light) {
            // Pulsar
            const tween = this.scene.tweens.add({
                targets: light,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 300,
                yoyo: true,
                repeat: 10
            });
            
            return {
                light: light,
                stopPulse: () => {
                    tween.stop();
                }
            };
        }
        
        return null;
    }
    
    // =====================================
    // TOGGLE LIGTHS
    // =====================================
    
    enable() {
        if (this.lightsContainer) {
            this.lightsContainer.setVisible(true);
        }
    }
    
    disable() {
        if (this.lightsContainer) {
            this.lightsContainer.setVisible(false);
        }
    }
    
    // =====================================
    // CLEANUP
    // =====================================
    
    destroy() {
        // Limpar luzes
        this.lightSources.forEach(source => {
            if (source.graphics) {
                source.graphics.destroy();
            }
        });
        this.lightSources = [];
        
        if (this.playerGlow) {
            this.playerGlow.destroy();
        }
        
        if (this.lightsContainer) {
            this.lightsContainer.destroy();
        }
        
        if (this.ambientLight) {
            this.ambientLight.destroy();
        }
    }
}

// =====================================
// LIGHT FILTERS (alternativo)
// =====================================
// Para devices que suportam shaders

export function createLightingFilter(type = 'vignette') {
    switch (type) {
        case 'vignette':
            return {
                kerneldx: [
                    0, 0, 0, 0, 0,
                    0, 1, 2, 1, 0,
                    0, 2, -8, 2, 0,
                    0, 1, 2, 1, 0,
                    0, 0, 0, 0, 0
                ],
                kerneldy: [0],
                source: [0]
            };
            
        case 'soft':
            return {
                kerneldx: [
                    0, 0, 0, 0, 0,
                    0, 1, 1, 1, 0,
                    0, 1, 2, 1, 0,
                    0, 1, 1, 1, 0,
                    0, 0, 0, 0, 0
                ],
                kerneldy: [0],
                source: [0]
            };
            
        default:
            return null;
    }
}