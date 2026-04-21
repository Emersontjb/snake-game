/**
 * =====================================
 * SNAKE - VERSÃO OTIMIZADA
 * =====================================
 * 
 * Cobra com otimizações:
 * - Batch rendering
 * - Cache de rendering
 * - Dirty flag
 * - Object pooling ready
 */

import GameConfig from './GameConfig.js';

export default class Snake {
    constructor(scene, startX, startY) {
        this.scene = scene;
        
        // Segmentos da cobra
        this.segments = [];
        
        // Direção atual
        this.direction = { ...GameConfig.DIRECTIONS.UP };
        this.nextDirection = { ...GameConfig.DIRECTIONS.UP };
        
        // =====================================
        // OTIMIZAÇÃO: Graphics único
        // =====================================
        this.graphics = scene.add.graphics();
        this.isDirty = true;
        
        // =====================================
        // OTIMIZAÇÃO: Cache de cores
        // =====================================
        this.colors = {
            head: GameConfig.COLORS.SNAKE_HEAD,
            body: GameConfig.COLORS.SNAKE_BODY,
            bodyAlt: GameConfig.COLORS.SNAKE_BODY_ALT
        };
        
        // Iniciar cobra
        this.reset(startX, startY);
    }
    
    reset(startX, startY) {
        // Limpar segmentos
        this.segments.length = 0;
        
        // Resetar direção
        this.direction = { ...GameConfig.DIRECTIONS.UP };
        this.nextDirection = { ...GameConfig.DIRECTIONS.UP };
        
        // Criar segmentos iniciais
        this.addSegment(startX, startY);
        this.addSegment(startX, startY + GameConfig.GRID_SIZE);
        this.addSegment(startX, startY + GameConfig.GRID_SIZE * 2);
        
        this.isDirty = true;
        this.render();
    }
    
    addSegment(x, y) {
        // Otimização: não criar objeto se não necessário
        this.segments.push({
            x: x,
            y: y
        });
    }
    
    setDirection(dir) {
        if (!dir || (dir.x === 0 && dir.y === 0)) return;
        
        // Não permitir reversal
        if (dir.x === -this.direction.x && dir.y === -this.direction.y) {
            return;
        }
        
        this.nextDirection = { ...dir };
        this.isDirty = true;
    }
    
    move() {
        const head = this.segments[0];
        
        // Atualizar direção
        this.direction = { ...this.nextDirection };
        
        const newX = head.x + this.direction.x * GameConfig.GRID_SIZE;
        const newY = head.y + this.direction.y * GameConfig.GRID_SIZE;
        
        let collision = false;
        let ateFood = false;
        
        // Verificar colisão com corpo
        // Otimização: early exit
        for (let i = 1; i < this.segments.length; i++) {
            if (this.segments[i].x === newX && this.segments[i].y === newY) {
                collision = true;
                break;
            }
        }
        
        // Verificar parede
        if (!collision) {
            if (newX < GameConfig.MARGIN || 
                newX >= GameConfig.GAME_WIDTH - GameConfig.MARGIN ||
                newY < GameConfig.MARGIN || 
                newY >= GameConfig.GAME_HEIGHT - GameConfig.MARGIN) {
                collision = true;
            }
        }
        
        // Verificar comida
        const food = this.scene.food;
        if (!collision && food && food.visible && food.x === newX && food.y === newY) {
            ateFood = true;
        }
        
        // Mover cobra
        if (!collision) {
            // Otimização: mover de trás para frente
            for (let i = this.segments.length - 1; i > 0; i--) {
                this.segments[i].x = this.segments[i - 1].x;
                this.segments[i].y = this.segments[i - 1].y;
            }
            
            this.segments[0].x = newX;
            this.segments[0].y = newY;
            
            // Crescer
            if (ateFood) {
                const tail = this.segments[this.segments.length - 1];
                this.addSegment(tail.x, tail.y);
            }
        }
        
        this.isDirty = true;
        this.render();
        
        return { collision, ateFood };
    }
    
    render() {
        if (!this.isDirty) return;
        
        const graphics = this.graphics;
        const gridSize = GameConfig.GRID_SIZE;
        
        // Otimização: clear apenas se necessário
        graphics.clear();
        
        const colors = this.colors;
        const len = this.segments.length;
        
        // Otimização: batch rendering
        // Desenhar todos os segmentos de uma vez
        for (let i = 0; i < len; i++) {
            const segment = this.segments[i];
            const isHead = i === 0;
            const isEven = i % 2 === 0;
            
            const color = isHead ? colors.head : (isEven ? colors.body : colors.bodyAlt);
            
            const padding = isHead ? 2 : 1;
            const size = gridSize - padding * 2;
            
            graphics.fillStyle(color, 1);
            graphics.fillRect(
                segment.x + padding,
                segment.y + padding,
                size,
                size
            );
            
            // Olhos (apenas cabeça)
            if (isHead) {
                this.drawEyes(segment.x, segment.y, gridSize);
            }
        }
        
        this.isDirty = false;
    }
    
    drawEyes(x, y, size) {
        const g = this.graphics;
        const eyeSize = 3;
        const offset = 5;
        const cx = size / 2;
        const cy = size / 2;
        
        let ex1, ey1, ex2, ey2;
        
        if (this.direction.y === -1) {
            ex1 = cx - offset; ey1 = cy - offset;
            ex2 = cx + offset; ey2 = cy - offset;
        } else if (this.direction.y === 1) {
            ex1 = cx - offset; ey1 = cy + offset;
            ex2 = cx + offset; ey2 = cy + offset;
        } else if (this.direction.x === -1) {
            ex1 = cx - offset; ey1 = cy - offset;
            ex2 = cx - offset; ey2 = cy + offset;
        } else {
            ex1 = cx + offset; ey1 = cy - offset;
            ex2 = cx + offset; ey2 = cy + offset;
        }
        
        g.fillStyle(0xffffff, 1);
        g.fillRect(x + ex1, y + ey1, eyeSize, eyeSize);
        g.fillRect(x + ex2, y + ey2, eyeSize, eyeSize);
    }
    
    // =====================================
    // OTIMIZAÇÃO: Cache checks
    // =====================================
    
    collidesWithBody(x, y) {
        // Otimização: early return
        for (let i = 1; i < this.segments.length; i++) {
            if (this.segments[i].x === x && this.segments[i].y === y) {
                return true;
            }
        }
        return false;
    }
    
    collidesWithHead(x, y) {
        const head = this.segments[0];
        return head.x === x && head.y === y;
    }
    
    getHead() {
        return this.segments[0];
    }
    
    getLength() {
        return this.segments.length;
    }
    
    // =====================================
    // OTIMIZAÇÃO: Mark dirty
    // =====================================
    
    markDirty() {
        this.isDirty = true;
    }
    
    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
        }
        this.segments.length = 0;
    }
}