/**
 * =====================================
 * SNAKE - CLASSE DA COBRA
 * =====================================
 * 
 * Gerencia a cobra: corpo, movimento,
 * crescimento e rendering.
 */

import GameConfig from './GameConfig.js';

export default class Snake {
    constructor(scene, startX, startY) {
        this.scene = scene;
        this.segments = [];
        this.direction = { ...GameConfig.DIRECTIONS.UP };
        this.nextDirection = { ...GameConfig.DIRECTIONS.UP };
        this.graphics = scene.add.graphics();
        
        this.reset(startX, startY);
    }
    
    reset(startX, startY) {
        this.segments = [];
        this.direction = { ...GameConfig.DIRECTIONS.UP };
        this.nextDirection = { ...GameConfig.DIRECTIONS.UP };
        
        // Criar corpo inicial (cabeça + 2 segmentos)
        this.addSegment(startX, startY); // Cabeça
        this.addSegment(startX, startY + GameConfig.GRID_SIZE); // Corpo 1
        this.addSegment(startX, startY + GameConfig.GRID_SIZE * 2); // Corpo 2
        
        this.render();
    }
    
    addSegment(x, y) {
        this.segments.push({
            x: x,
            y: y,
            targetX: x,
            targetY: y
        });
    }
    
    setDirection(dir) {
        // Não permitir 180 graus
        if (dir.x === -this.direction.x && dir.y === -this.direction.y && 
            (dir.x !== 0 || dir.y !== 0)) {
            return;
        }
        
        this.nextDirection = dir;
    }
    
    move() {
        const head = this.segments[0];
        
        // Usar direção pendente
        this.direction = { ...this.nextDirection };
        
        // Calcular nova posição da cabeça
        const newX = head.x + this.direction.x * GameConfig.GRID_SIZE;
        const newY = head.y + this.direction.y * GameConfig.GRID_SIZE;
        
        // Verificar colisão com própria corpo
        let collision = false;
        let ateFood = false;
        
        for (let i = 1; i < this.segments.length; i++) {
            if (this.segments[i].x === newX && this.segments[i].y === newY) {
                collision = true;
                break;
            }
        }
        
        // Verificar colisão com parede
        if (newX < GameConfig.MARGIN || 
            newX >= GameConfig.GAME_WIDTH - GameConfig.MARGIN ||
            newY < GameConfig.MARGIN || 
            newY >= GameConfig.GAME_HEIGHT - GameConfig.MARGIN) {
            collision = true;
        }
        
        // Verificar se comeu comida
        const food = this.scene.food;
        if (food && food.visible && food.x === newX && food.y === newY) {
            ateFood = true;
        }
        
        if (!collision) {
            // Mover corpo (de traz para frente)
            for (let i = this.segments.length - 1; i > 0; i--) {
                this.segments[i].x = this.segments[i - 1].x;
                this.segments[i].y = this.segments[i - 1].y;
            }
            
            // Nova cabeça
            this.segments[0].x = newX;
            this.segments[0].y = newY;
            
            // Crescer se comeu
            if (ateFood) {
                const tail = this.segments[this.segments.length - 1];
                this.addSegment(tail.x, tail.y);
            }
        }
        
        this.render();
        
        return { collision, ateFood };
    }
    
    render() {
        this.graphics.clear();
        
        // Renderizar cada segmento
        this.segments.forEach((segment, i) => {
            const isHead = i === 0;
            const isEven = i % 2 === 0;
            
            const color = isHead ? 
                GameConfig.COLORS.SNAKE_HEAD : 
                (isEven ? GameConfig.COLORS.SNAKE_BODY : GameConfig.COLORS.SNAKE_BODY_ALT);
            
            // Desenhar segmento
            this.graphics.fillStyle(color, 1);
            
            const padding = isHead ? 2 : 1;
            const size = GameConfig.GRID_SIZE - padding * 2;
            
            this.graphics.fillRect(
                segment.x + padding,
                segment.y + padding,
                size,
                size
            );
            
            // Borda para destaque
            if (isHead) {
                this.graphics.lineStyle(2, 0xffffff, 0.5);
                this.graphics.strokeRect(
                    segment.x + padding,
                    segment.y + padding,
                    size,
                    size
                );
                
                // Olhos
                this.graphics.fillStyle(0xffffff, 1);
                const eyeSize = 3;
                const eyeOffset = 5;
                
                // Olho direito
                this.graphics.fillRect(
                    segment.x + GameConfig.GRID_SIZE / 2 + eyeOffset - eyeSize / 2,
                    segment.y + eyeOffset,
                    eyeSize,
                    eyeSize
                );
                
                // Olho esquerdo
                this.graphics.fillRect(
                    segment.x + GameConfig.GRID_SIZE / 2 - eyeOffset - eyeSize / 2,
                    segment.y + eyeOffset,
                    eyeSize,
                    eyeSize
                );
            }
        });
    }
    
    collidesWithBody(x, y) {
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
    
    destroy() {
        this.graphics.destroy();
    }
}