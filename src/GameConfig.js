/**
 * =====================================
 * GAME CONFIG - CONFIGURAÇÕES
 * =====================================
 * 
 * Todas as constantes e configurações
 * do jogo em um único arquivo.
 */

const GameConfig = {
    // Resolução do jogo
    GAME_WIDTH: 400,
    GAME_HEIGHT: 600,
    
    // Tamanho da grid
    GRID_SIZE: 20,
    
    // Margem das bordas
    MARGIN: 20,
    
    // Posição inicial da cobra
    INITIAL_X: 200,
    INITIAL_Y: 300,
    
    // Velocidade base (ms entre movimentos)
    BASE_MOVE_INTERVAL: 120,
    
    // Pontos por comida
    POINTS_PER_FOOD: 10,
    
    // Score para subir de nível
    SCORE_PER_LEVEL: 50,
    
    // Máximo de obstáculos
    MAX_OBSTACLES: 10,
    
    // Cores do jogo
    COLORS: {
        SNAKE_HEAD: 0x00ff88,
        SNAKE_BODY: 0x00dd66,
        SNAKE_BODY_ALT: 0x00aa55,
        FOOD: 0xff6b6b,
        FOOD_GLOW: 0xff8888,
        OBSTACLE: 0x666688,
        UI_PRIMARY: 0x00ff88,
        UI_SECONDARY: 0xffffff,
        UI_BACKGROUND: 0x1a1a2e,
        UI_PANEL: 0x2a2a4e
    },
    
    // Direções
    DIRECTIONS: {
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 },
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 }
    }
};

// Exportar para ES6 modules
export default GameConfig;