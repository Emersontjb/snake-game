/**
 * =====================================
 * FOOD - CLASSE DA COMIDA COM ANIMAÇÃO
 * =====================================
 */

import GameConfig from './GameConfig.js';

export default class Food {
    constructor(scene) {
        this.scene = scene;
        this.x = 0;
        this.y = 0;
        
        this.graphics = scene.add.graphics();
        this.glowGraphics = scene.add.graphics();
        this.visible = false;
        
        this.animationPhase = 0;
    }
    
    spawn(x, y) {
        this.x = x;
        this.y = y;
        this.visible = true;
        
        this.scene.tweens.add({
            targets: this,
            scale: 1,
            duration: GameConfig.ANIMATIONS.FOOD_SPAWN_DURATION,
            ease: 'Back.easeOut'
        });
        
        this.render();
    }
    
    update(time) {
        if (!this.visible) return;
        
        this.animationPhase += 0.1;
        this.render();
    }
    
    render() {
        if (!this.visible) return;
        
        const size = GameConfig.GRID_SIZE;
        const padding = 3;
        const foodSize = size - padding * 2;
        
        const pulse = Math.sin(this.animationPhase) * 0.15 + 0.85;
        const glowSize = foodSize / 2 + 4 + Math.sin(this.animationPhase * 2) * 2;
        
        this.glowGraphics.clear();
        this.glowGraphics.fillStyle(GameConfig.COLORS.FOOD_GLOW, 0.25 * pulse);
        this.glowGraphics.fillCircle(
            this.x + size / 2,
            this.y + size / 2,
            glowSize
        );
        
        this.graphics.clear();
        this.graphics.fillStyle(GameConfig.COLORS.FOOD, 1);
        this.graphics.fillCircle(
            this.x + size / 2,
            this.y + size / 2,
            foodSize / 2
        );
        
        this.graphics.fillStyle(GameConfig.COLORS.FOOD_SHINE, 0.6);
        this.graphics.fillCircle(
            this.x + size / 2 - 2,
            this.y + size / 2 - 2,
            foodSize / 4
        );
    }
    
    getX() { return this.x; }
    getY() { return this.y; }
    
    destroy() {
        this.graphics.destroy();
        this.glowGraphics.destroy();
    }
}