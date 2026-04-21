/**
 * =====================================
 * GAME CONFIG - CONFIGURAÇÕES COMPLETAS
 * =====================================
 * 
 * Todas as constantes e configurações centralizadas
 */

const GameConfig = {
    // =====================================
    // RESOLUÇÃO DO JOGO
    // =====================================
    GAME_WIDTH: 400,
    GAME_HEIGHT: 600,
    GRID_SIZE: 20,
    MARGIN: 20,
    
    // =====================================
    // POSIÇÃO INICIAL DA COBRA
    // =====================================
    INITIAL_X: 200,
    INITIAL_Y: 300,
    
    // =====================================
    // VELOCIDADE (ms entre movimentos)
    // =====================================
    BASE_MOVE_INTERVAL: 120,
    MIN_MOVE_INTERVAL: 50,
    SPEED_INCREMENT: 5,
    
    // =====================================
    // PONTUAÇÃO
    // =====================================
    POINTS_PER_FOOD: 10,
    SCORE_PER_LEVEL: 50,
    BONUS_PER_LEVEL: 25,
    
    // =====================================
    // OBSTÁCULOS
    // =====================================
    MAX_OBSTACLES: 15,
    OBSTACLES_PER_LEVEL: 2,
    MAX_OBSTACLE_LEVEL: 8,
    
    // =====================================
    // CORES
    // =====================================
    COLORS: {
        // Cobra
        SNAKE_HEAD: 0x00ff88,
        SNAKE_BODY: 0x00dd66,
        SNAKE_BODY_ALT: 0x00aa55,
        
        // Comer
        FOOD: 0xff4757,
        FOOD_GLOW: 0xff6b7a,
        FOOD_SHINE: 0xffffff,
        
        // Obstáculo
        OBSTACLE: 0x5a5a7a,
        OBSTACLE_BORDER: 0x7a7a9a,
        
        // Fundo
        BG_TOP: 0x1a1a2e,
        BG_BOTTOM: 0x0f0f1a,
        GRID: 0x252540,
        
        // UI
        UI_PRIMARY: 0x00ff88,
        UI_SECONDARY: 0xffffff,
        UI_PANEL: 0x2a2a4e,
        UI_DANGER: 0xff4757,
        UI_WARNING: 0xffbe76
    },
    
    // =====================================
    // DIREÇÕES
    // =====================================
    DIRECTIONS: {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 },
        NONE: { x: 0, y: 0 }
    },
    
    // =====================================
    // ANIMAÇÕES
    // =====================================
    ANIMATIONS: {
        FOOD_PULSE_DURATION: 300,
        FOOD_SPAWN_DURATION: 200,
        UI_FADE_DURATION: 300,
        LEVEL_UP_DURATION: 1500
    },
    
    // =====================================
    // INPUT
    // =====================================
    INPUT_COOLDOWN: 80,
    SWIPE_THRESHOLD: 20,
    
    // =====================================
    // DEBUG
    // =====================================
    DEBUG: false
};

export default GameConfig;