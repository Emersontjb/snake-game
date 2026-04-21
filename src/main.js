/**
 * =====================================
 * SNAKE GAME - ENTRY POINT COM RESPOSTA COMPLETA
 * =====================================
 * 
 * Ponto de entrada com suporte responsivo nativo Phaser.
 */

import GameScene from './GameScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    
    // =====================================
    // ESCALA RESPONSIVA (PHASER NATIVO)
    // =====================================
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600,
        resizeInterval: 200,
        refreshEvent: 'onDomResize'
    },
    
    // =====================================
    // RENDERIZAÇÃO
    // =====================================
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true,
        powerPreference: 'high-performance',
        backgroundColor: '#1a1a2e'
    },
    
    // =====================================
    // FÍSICA
    // =====================================
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    
    // =====================================
    // CENAS
    // =====================================
    scene: [GameScene],
    
    // =====================================
    // FPS
    // =====================================
    fps: {
        target: 60,
        forceSetTimeOut: false,
        panicMax: 120
    },
    
    // =====================================
    // DOM
    // =====================================
    dom: {
        createContainer: true,
        pool: true
    }
};

// =====================================
// CRIAR JOGO
// =====================================

const game = new Phaser.Game(config);

// =====================================
// RESPONSIVE HELPERS
// =====================================

const Responsive = {
    // Obter escala atual
    getScale() {
        return game.loop.deltaRatio;
    },
    
    // Obter tamanho do jogo
    getGameSize() {
        return { width: 400, height: 600 };
    },
    
    // Obter tamanho da tela
    getDisplaySize() {
        return {
            width: game.canvas.width,
            height: game.canvas.height
        };
    },
    
    // Obter escala visual
    getDisplayScale() {
        return {
            x: game.canvas.width / 400,
            y: game.canvas.height / 600
        };
    },
    
    // Verificar plataforma
    isMobile() {
        return window.innerWidth < 768 || 'ontouchstart' in window;
    },
    
    isTablet() {
        return window.innerWidth >= 768 && window.innerWidth < 1024;
    },
    
    isDesktop() {
        return window.innerWidth >= 1024;
    },
    
    isPortrait() {
        return window.innerHeight > window.innerWidth;
    },
    
    isLandscape() {
        return window.innerWidth > window.innerHeight;
    },
    
    // Fullscreen
    async enterFullscreen() {
        try {
            await document.documentElement.requestFullscreen();
        } catch (e) {
            try {
                await document.documentElement.webkitRequestFullscreen();
            } catch (e2) {}
        }
    },
    
    async exitFullscreen() {
        try {
            await document.exitFullscreen();
        } catch (e) {
            try {
                await document.webkitExitFullscreen();
            } catch (e2) {}
        }
    },
    
    toggleFullscreen() {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    },
    
    isFullscreen() {
        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement
        );
    },
    
    // Converter coordenadas
    screenToGame(screenX, screenY) {
        const rect = game.canvas.getBoundingClientRect();
        const scaleX = 400 / rect.width;
        const scaleY = 600 / rect.height;
        
        return {
            x: (screenX - rect.left) * scaleX,
            y: (screenY - rect.top) * scaleY
        };
    },
    
    gameToScreen(gameX, gameY) {
        const rect = game.canvas.getBoundingClientRect();
        
        return {
            x: rect.left + (gameX / 400) * rect.width,
            y: rect.top + (gameY / 600) * rect.height
        };
    },
    
    // Obter hit area do canvas
    getCanvasBounds() {
        return game.canvas.getBoundingClientRect();
    }
};

// =====================================
// EVENTOS DE RESIZE
// =====================================

let resizeTimeout;

function handleResize() {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    
    resizeTimeout = setTimeout(() => {
        game.scale.refresh();
        
        const bounds = Responsive.getCanvasBounds();
        
        console.log('📐 Resize:', {
            window: `${window.innerWidth}x${window.innerHeight}`,
            canvas: `${game.canvas.width}x${game.canvas.height}`,
            display: `${bounds.width.toFixed(0)}x${bounds.height.toFixed(0)}`,
            scale: Responsive.getDisplayScale()
        });
    }, 150);
}

// =====================================
// LISTENERS
// =====================================

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100);
});

document.addEventListener('fullscreenchange', handleResize);
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        handleResize();
    }
});

// =====================================
// LOG INICIAL
// =====================================

console.log('🐍 Snake Game carregado!');
console.log('📱', Responsive.isMobile() ? 'Mobile' : 'Desktop');
console.log('📐', `${window.innerWidth}x${window.innerHeight}`);
console.log('🖥️ Displayscale:`, Responsive.getDisplayScale());