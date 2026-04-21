/**
 * =====================================
 * SNAKE GAME - ENTRY POINT OTIMIZADO
 * =====================================
 * 
 * Ponto de entrada com configurações
 * de performance otimizadas.
 */

import GameScene from './GameScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    
    // =====================================
    // ESCALA RESPONSIVA
    // =====================================
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600,
        resizeInterval: 250
    },
    
    // =====================================
    // RENDERIZAÇÃO OTIMIZADA
    // =====================================
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true,
        powerPreference: 'high-performance',
        backgroundColor: '#1a1a2e',
        
        // WebGL options
        webgl: {
            antialias: true,
            alpha: false,
            premultipliedAlpha: false,
            failIfMajorPerformanceCaveat: false
        }
    },
    
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 },
            debugBodyColor: 0x00ff88
        }
    },
    
    scene: [GameScene],
    
    // =====================================
    // FPS OTIMIZADO
    // =====================================
    fps: {
        target: 60,
        forceSetTimeOut: false,
        panicMax: 120
    },
    
    // =====================================
    // SETTINGS EXTRAS
    // =====================================
    fpsLimit: 60,
    autoFocus: true,
    canvas2D: {
        willReadFrequently: false
    }
};

const game = new Phaser.Game(config);

// =====================================
// DETECÇÃO E LOG
// =====================================

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const isLowRam = navigator.deviceMemory && navigator.deviceMemory < 4;

console.log('🐍 Snake Game carregado!');
console.log('📱 Dispositivo:', isMobile ? 'Mobile' : 'Desktop');
console.log('💾 RAM:', navigator.deviceMemory ? navigator.deviceMemory + 'GB' : 'Desconhecida');
console.log('⚡ Renderer:', game.renderer.type);

// =====================================
// FULLSCREEN TOGGLE (opcional)
// =====================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) {
            document.exitFullscreen?.();
        } else {
            document.documentElement.requestFullscreen?.();
        }
    }
});

// =====================================
// PREVENIR ZOOM INDESEJADO
// =====================================

document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('gesturestart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
});

// =====================================
// CLEANUP AO FECHAR
// =====================================

window.addEventListener('beforeunload', () => {
    game.destroy(true);
});