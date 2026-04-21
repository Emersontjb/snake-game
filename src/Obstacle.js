/**
 * =====================================
 * OBSTACLE - OBSTÁCULOS
 * =====================================
 */

import GameConfig from './GameConfig.js';

export default class Obstacle {
    static create(scene, x, y) {
        const size = GameConfig.GRID_SIZE;
        const padding = 2;
        
        const graphics = scene.add.graphics();
        
        graphics.fillStyle(GameConfig.COLORS.OBSTACLE, 1);
        graphics.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2);
        
        graphics.fillStyle(GameConfig.COLORS.OBSTACLE_BORDER, 0.3);
        graphics.fillRect(x + padding, y + padding, size - padding * 2, 3);
        
        return { x, y, graphics };
    }
    
    static destroy(obstacle) {
        if (obstacle.graphics) {
            obstacle.graphics.destroy();
        }
    }
}