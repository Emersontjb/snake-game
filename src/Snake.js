/**
 * =====================================
 * SNAKE - CLASSE DA COBRA
 * =====================================
 * 
 * Gerencia a cobra: corpo, movimento,
 * crescimento e rendering completo.
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
        
        this.addSegment(startX, startY);
        this.addSegment(startX, startY + GameConfig.GRID_SIZE);
        this.addSegment(startX, startY + GameConfig.GRID_SIZE * 2);
        
        this.render();
    }
    
    addSegment(x, y) {
        this.segments.push({
            x: x,
            y: y,
            targetX: x,
            targetY: y,
            scale: 1
        });
        
        this.scene.tweens.add({
            targets: this.segments[this.segments.length - 1],
            scale: 1,
            duration: 100,
            from: 0
        });
    }
    
    setDirection(dir) {
        if (dir.x === 0 && dir.y === 0) return;
        
        if (dir.x === -this.direction.x && dir.y === -this.direction.y && 
            (dir.x !== 0 || dir.y !== 0)) {
            return;
        }
        
        this.nextDirection = { ...dir };
    }
    
    move() {
        const head = this.segments[0];
        
        this.direction = { ...this.nextDirection };
        
        const newX = head.x + this.direction.x * GameConfig.GRID_SIZE;
        const newY = head.y + this.direction.y * GameConfig.GRID_SIZE;
        
        let collision = false;
        let ateFood = false;
        
        for (let i = 1; i < this.segments.length; i++) {
            if (this.segments[i].x === newX && this.segments[i].y === newY) {
                collision = true;
                break;
            }
        }
        
        if (newX < GameConfig.MARGIN || 
            newX >= GameConfig.GAME_WIDTH - GameConfig.MARGIN ||
            newY < GameConfig.MARGIN || 
            newY >= GameConfig.GAME_HEIGHT - GameConfig.MARGIN) {
            collision = true;
        }
        
        const food = this.scene.food;
        if (food && food.visible && food.x === newX && food.y === newY) {
            ateFood = true;
        }
        
        if (!collision) {
            for (let i = this.segments.length - 1; i > 0; i--) {
                this.segments[i].x = this.segments[i - 1].x;
                this.segments[i].y = this.segments[i - 1].y;
            }
            
            this.segments[0].x = newX;
            this.segments[0].y = newY;
            
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
        
        const gridSize = GameConfig.GRID_SIZE;
        
        this.segments.forEach((segment, i) => {
            const isHead = i === 0;
            const isEven = i % 2 === 0;
            
            const color = isHead ? 
                GameConfig.COLORS.SNAKE_HEAD : 
                (isEven ? GameConfig.COLORS.SNAKE_BODY : GameConfig.COLORS.SNAKE_BODY_ALT);
            
            const padding = isHead ? 2 : 1;
            const size = gridSize - padding * 2;
            
            this.graphics.fillStyle(color, segment.scale || 1);
            
            this.graphics.fillRect(
                segment.x + padding,
                segment.y + padding,
                size,
                size
            );
            
            if (isHead) {
                this.graphics.lineStyle(2, 0xffffff, 0.6);
                this.graphics.strokeRect(
                    segment.x + padding,
                    segment.y + padding,
                    size,
                    size
                );
                
                this.drawEyes(segment.x, segment.y, gridSize);
            }
        });
    }
    
    drawEyes(x, y, size) {
        const eyeSize = 3;
        const offset = 5;
        const centerX = size / 2;
        const centerY = size / 2;
        
        let eye1X, eye1Y, eye2X, eye2Y;
        
        if (this.direction.y === -1) {
            eye1X = centerX - offset;
            eye1Y = centerY - offset;
            eye2X = centerX + offset;
            eye2Y = centerY - offset;
        } else if (this.direction.y === 1) {
            eye1X = centerX - offset;
            eye1Y = centerY + offset;
            eye2X = centerX + offset;
            eye2Y = centerY + offset;
        } else if (this.direction.x === -1) {
            eye1X = centerX - offset;
            eye1Y = centerY - offset;
            eye2X = centerX - offset;
            eye2Y = centerY + offset;
        } else {
            eye1X = centerX + offset;
            eye1Y = centerY - offset;
            eye2X = centerX + offset;
            eye2Y = centerY + offset;
        }
        
        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(x + eye1X, y + eye1Y, eyeSize, eyeSize);
        this.graphics.fillRect(x + eye2X, y + eye2Y, eyeSize, eyeSize);
        
        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillRect(x + eye1X + 1, y + eye1Y + 1, eyeSize - 2, eyeSize - 2);
        this.graphics.fillRect(x + eye2X + 1, y + eye2Y + 1, eyeSize - 2, eyeSize - 2);
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
        return this.segments[0].x === x && this.segments[0].y === y;
    }
    
    getHead() {
        return this.segments[0];
    }
    
    getBody() {
        return this.segments;
    }
    
    getLength() {
        return this.segments.length;
    }
    
    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
        }
    }
}