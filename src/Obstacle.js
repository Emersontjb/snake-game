/**
 * =====================================
 * OBSTACLE - CLASSE DO OBSTÁCULO
 * =====================================
 * 
 * Gerencia obstáculos estáticos
 * que aparecem no jogo.
 */

import GameConfig from './GameConfig.js';

export default class Obstacle {
    static create(scene, x, y, group) {
        const size = GameConfig.GRID_SIZE;
        const padding = 2;
        
        const graphics = scene.add.graphics();
        
        graphics.fillStyle(GameConfig.COLORS.OBSTACLE, 1);
        graphics.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2);
        
        // Detalhe
        graphics.fillStyle(0x8888aa, 0.5);
        graphics.fillRect(x + padding, y + padding, size - padding * 2, 3);
        
        return {
            x: x,
            y: y,
            graphics: graphics
        };
    }
}