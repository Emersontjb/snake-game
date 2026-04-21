/**
 * =====================================
 * SNAKE VISUAL MANAGER
 * =====================================
 * 
 * Sistema visual realista para a cobra.
 * 
 * CARACTERÍSTICAS:
 * - Corpo segmentado
 * - Textura de escamas (leve)
 * - Movimento fluido
 * - Animação ao mover
 * - Destaque do cenário
 * - Estilo semi-realista
 */

import Phaser from 'phaser';

// =====================================
// CORES
// =====================================

const SNAKE_COLORS = {
    // Corpo principal
    BODY_MAIN: 0x2d5a3d,
    BODY_ALT: 0x3d6a4d,
    BODY_DARK: 0x1d4a2d,
    
    // Escamas (detalhes)
    SCALE_LIGHT: 0x4d7a5d,
    SCALE_DARK: 0x1d3a2d,
    SCALE_SHINE: 0x5d8a6d,
    
    // Cabeça
    HEAD_MAIN: 0x3d6a4d,
    HEAD_DARK: 0x2d4a2d,
    HEAD_SHINE: 0x4d7a5d,
    
    // Olhos
    EYE_WHITE: 0xeeeeee,
    EYE_PUPIL: 0x111111,
    EYE_REFLECTION: 0xffffff,
    
    // Detalhes
    MOUTH: 0x1a1a1a,
    TONGUE: 0xcc3333,
    
    // Sombra
    SHADOW: 0x000011,
    SHADOW_ALPHA: 0.5,
    
    // Destaque (glow)
    GLOW: 0x44ff88,
    GLOW_ALPHA: 0.15
};

export default class SnakeVisualManager {
    constructor(scene) {
        this.scene = scene;
        
        // Config
        this.tileSize = 20;
        
        // Criar texturas
        this.createTextures();
        
        console.log('🐍 Texturas da cobra criadas');
    }
    
    // =====================================
    // TEXTURAS PROCEDURAIS
    // =====================================
    
    createTextures() {
        // Criar corpo da cobra
        this.createBodyTexture();
        
        // Criar cabeça
        this.createHeadTexture();
    }
    
    createBodyTexture() {
        const size = this.tileSize;
        
        // Variações do corpo
        for (let variation = 0; variation < 3; variation++) {
            const graphics = this.scene.make.graphics({ x: 0, y: 0 });
            
            // Cor base com variação
            const baseColor = variation === 0 ? SNAKE_COLORS.BODY_MAIN :
                           variation === 1 ? SNAKE_COLORS.BODY_ALT : SNAKE_COLORS.BODY_DARK;
            
            // Base arredondada (segmento)
            graphics.fillStyle(baseColor, 1);
            graphics.fillRoundedRect(1, 1, size - 2, size - 2, 4);
            
            // Escamas (padrão)
            graphics.fillStyle(SNAKE_COLORS.SCALE_DARK, 0.3);
            
            // Escamas em diagonal
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if ((i + j) % 2 === 0) {
                        graphics.fillCircle(
                            4 + i * 6 + Math.random() * 2,
                            4 + j * 6 + Math.random() * 2,
                            2
                        );
                    }
                }
            }
            
            // Brilho sutil nas escamas
            graphics.fillStyle(SNAKE_COLORS.SCALE_SHINE, 0.2);
            graphics.fillCircle(size * 0.3, size * 0.3, 2);
            
            // Sombra interna (3D sutil)
            graphics.fillStyle(SNAKE_COLORS.BODY_DARK, 0.2);
            graphics.fillRect(2, size - 4, size - 4, 2);
            
            // Borda sutil
            graphics.lineStyle(1, SNAKE_COLORS.BODY_DARK, 0.3);
            graphics.strokeRoundedRect(1, 1, size - 2, size - 2, 4);
            
            graphics.generateTexture('snake_body_' + variation, size, size);
            graphics.destroy();
        }
    }
    
    createHeadTexture() {
        const size = this.tileSize;
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        
        // Cabeça mais escura
        graphics.fillStyle(SNAKE_COLORS.HEAD_MAIN, 1);
        graphics.fillRoundedRect(1, 1, size - 2, size - 2, 5);
        
        // Escamas maiores na cabeça
        graphics.fillStyle(SNAKE_COLORS.SCALE_DARK, 0.3);
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                graphics.fillCircle(
                    5 + i * 8,
                    5 + j * 8,
                    3
                );
            }
        }
        
        // Brilho na cabeça
        graphics.fillStyle(SNAKE_COLORS.HEAD_SHINE, 0.3);
        graphics.fillCircle(size * 0.3, size * 0.35, 3);
        
        // Olhos (grandes e realistas)
        const eyeOffsetX = 5;
        const eyeY = size * 0.4;
        
        // Olho branco
        graphics.fillStyle(SNAKE_COLORS.EYE_WHITE, 1);
        graphics.fillCircle(size / 2 - eyeOffsetX, eyeY, 4);
        graphics.fillCircle(size / 2 + eyeOffsetX, eyeY, 4);
        
        // Pupila
        graphics.fillStyle(SNAKE_COLORS.EYE_PUPIL, 1);
        graphics.fillCircle(size / 2 - eyeOffsetX, eyeY + 1, 2.5);
        graphics.fillCircle(size / 2 + eyeOffsetX, eyeY + 1, 2.5);
        
        // Reflexo
        graphics.fillStyle(SNAKE_COLORS.EYE_REFLECTION, 0.8);
        graphics.fillCircle(size / 2 - eyeOffsetX - 1, eyeY - 1, 1);
        graphics.fillCircle(size / 2 + eyeOffsetX - 1, eyeY - 1, 1);
        
        // Boca
        graphics.lineStyle(1.5, SNAKE_COLORS.MOUTH, 1);
        graphics.beginPath();
        graphics.arc(size / 2, size * 0.75, 4, 0.2, Math.PI - 0.2);
        graphics.strokePath();
        
        // Sombra
        graphics.fillStyle(SNAKE_COLORS.BODY_DARK, 0.2);
        graphics.fillRect(2, size - 3, size - 4, 2);
        
        // Borda
        graphics.lineStyle(1, SNAKE_COLORS.HEAD_DARK, 0.4);
        graphics.strokeRoundedRect(1, 1, size - 2, size - 2, 5);
        
        graphics.generateTexture('snake_head', size, size);
        graphics.destroy();
    }
    
    // =====================================
    // CRIAR COBRA VISUAL
    // =====================================
    
    createSnake(x, y) {
        const container = this.scene.add.container(x, y);
        container.setDepth(20);
        
        // Segmentos
        const segments = [];
        
        // Criar corpo inicial (3 segmentos)
        for (let i = 0; i < 3; i++) {
            const segment = this.createSegment(i === 0 ? 'head' : 'body', i);
            segment.setPosition(i * this.tileSize, 0);
            container.add(segment);
            segments.push(segment);
        }
        
        // Sombra
        const shadow = this.scene.add.graphics();
        shadow.fillStyle(SNAKE_COLORS.SHADOW, SNAKE_COLORS.SHADOW_ALPHA);
        shadow.fillRoundedRect(2, 2, this.tileSize * 3 - 4, this.tileSize - 4, 4);
        shadow.setDepth(-1);
        container.addAt(shadow, 0);
        
        // Glow de destaque
        const glow = this.scene.add.graphics();
        glow.fillStyle(SNAKE_COLORS.GLOW, SNAKE_COLORS.GLOW_ALPHA);
        glow.fillRoundedRect(-2, -2, this.tileSize + 4, this.tileSize + 4, 6);
        glow.setDepth(-2);
        container.addAt(glow, 0);
        
        return {
            container,
            segments,
            glow,
            direction: { x: 1, y: 0 }
        };
    }
    
    createSegment(type = 'body', index = 0) {
        const variation = index % 3;
        
        let texture = type === 'head' ? 'snake_head' : 'snake_body_' + variation;
        
        const sprite = this.scene.add.image(0, 0, texture);
        
        return sprite;
    }
    
    // =====================================
    // ATUALIZAR COBRA
    // =====================================
    
    updateSnake(snakeData, segments, direction) {
        // Atualizar direção visual
        snakeData.direction = direction;
        
        // Animação de movimento
        segments.forEach((segment, index) => {
            // Leve ondulação baseada no índice
            const wave = Math.sin(Date.now() / 100 + index * 0.5) * 0.03;
            segment.setScale(1 + wave, 1 - wave);
            
            // Olhos seguem a direção
            if (index === 0 && segment.texture) {
                // Rotation based on direction
            }
        });
    }
    
    // =====================================
    // CRIAR COMIDA ESPECIAL
    // =====================================
    
    createFood(type = 'normal') {
        const x = this.tileSize / 2;
        const y = this.tileSize / 2;
        
        const container = this.scene.add.container(x, y);
        container.setDepth(15);
        
        // shapes base
        let baseColor, detailColor;
        
        switch (type) {
            case 'gold':
                baseColor = 0xffaa00;
                detailColor = 0xffdd44;
                break;
            case 'silver':
                baseColor = 0xaaaaaa;
                detailColor = 0xcccccc;
                break;
            case 'speed':
                baseColor = 0x44aaff;
                detailColor = 0x88ccff;
                break;
            case 'slow':
                baseColor = 0xaa44aa;
                detailColor = 0xcc88cc;
                break;
            default:
                baseColor = 0xff6644;
                detailColor = 0xff8866;
        }
        
        // Corpo
        const food = this.scene.add.graphics();
        
        // Sombra
        food.fillStyle(0x000000, 0.3);
        food.fillCircle(2, 2, 8);
        
        // Base
        food.fillStyle(baseColor, 1);
        food.fillCircle(0, 0, 8);
        
        // Brilho
        food.fillStyle(detailColor, 0.8);
        food.fillCircle(-2, -2, 4);
        
        // Outline
        food.lineStyle(1.5, 0x000000, 0.5);
        food.strokeCircle(0, 0, 8);
        
        container.add(food);
        
        // Glow
        const glow = this.scene.add.graphics();
        glow.fillStyle(baseColor, 0.3);
        glow.fillCircle(0, 0, 12);
        
        container.addAt(glow, 0);
        
        // Animação
        this.scene.tweens.add({
            targets: container,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        return container;
    }
    
    // =====================================
    // DESTROY
    // =====================================
    
    destroy() {
        // Limpar texturas
        ['snake_head', 'snake_body_0', 'snake_body_1', 'snake_body_2'].forEach(name => {
            if (this.scene.textures.exists(name)) {
                this.scene.textures.remove(name);
            }
        });
    }
}