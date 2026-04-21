/**
 * =====================================
 * FOOD - CLASSE DA COMIDA
 * =====================================
 * 
 * Gerencia a comida: rendering,
 * animação e efeito visual.
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
    }
    
    spawn(x, y) {
        this.x = x;
        this.y = y;
        this.visible = true;
        
        // Animação de spawn
        this.scale = 0;
        this.scene.tweens.add({
            targets: this,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
        
        this.render();
    }
    
    render() {
        if (!this.visible) return;
        
        const size = GameConfig.GRID_SIZE;
        const padding = 3;
        const foodSize = size - padding * 2;
        
        // Glow (efeito de brilho pulsante)
        this.glowGraphics.clear();
        this.glowGraphics.fillStyle(GameConfig.COLORS.FOOD_GLOW, 0.3);
        this.glowGraphics.fillCircle(
            this.x + size / 2,
            this.y + size / 2,
            foodSize / 2 + 4 + Math.sin(this.scene.time.now / 200) * 2
        );
        
        // Corpo da comida
        this.graphics.clear();
        this.graphics.fillStyle(GameConfig.COLORS.FOOD, 1);
        this.graphics.fillCircle(
            this.x + size / 2,
            this.y + size / 2,
            foodSize / 2
        );
        
        // Brilho central
        this.graphics.fillStyle(0xffffff, 0.5);
        this.graphics.fillCircle(
            this.x + size / 2 - 2,
            this.y + size / 2 - 2,
            foodSize / 4
        );
    }
    
    getX() {
        return this.x;
    }
    
    getY() {
        return this.y;
    }
    
    destroy() {
        this.graphics.destroy();
        this.glowGraphics.destroy();
    }
}

//工厂函数 para criar comida estática (para o Obstacle)
Food.create = function(scene, x, y, group) {
    const food = group.create(x, y, null);
    food.setSize(GameConfig.GRID_SIZE - 4, GameConfig.GRID_SIZE - 4);
    
    const graphics = scene.add.graphics();
    graphics.fillStyle(GameConfig.COLORS.FOOD, 1);
    graphics.fillCircle(
        x + GameConfig.GRID_SIZE / 2,
        y + GameConfig.GRID_SIZE / 2,
        (GameConfig.GRID_SIZE - 4) / 2
    );
    
    return food;
};