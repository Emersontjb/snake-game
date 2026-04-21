/**
 * =====================================
 * SNAKE GAME - ARQUIVO PRINCIPAL
 * =====================================
 * 
 * Este é o ponto de entrada do jogo.
 * Configura o Phaser e inicia a cena principal.
 */

import Phaser from 'phaser';
import GameScene from './GameScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    
    // Detectar plataforma
    platform: {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    },
    
    // Resolução do jogo
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600
    },
    
    // Configurações de renderização
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true
    },
    
    // Física simples
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    
    // Cenas do jogo
    scene: [GameScene],
    
    // FPS desejado
    fps: {
        target: 60,
        forceSetTimeOut: false
    }
};

// Criar instância do jogo
const game = new Phaser.Game(config);

// Exportar para debug
export { game };

// Log para desenvolvimento
console.log('🐍 Snake Game carregado!');
console.log(`📱 Plataforma: ${config.platform.isMobile ? 'Mobile' : 'Desktop'}`);