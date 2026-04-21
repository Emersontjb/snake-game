/**
 * =====================================
 * SNAKE GAME - ENTRY POINT
 * =====================================
 * 
 * Ponto de entrada do jogo.
 * Configura Phaser e inicia a cena.
 */

import GameScene from './GameScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600
    },
    
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true
    },
    
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    
    scene: [GameScene],
    
    fps: {
        target: 60,
        forceSetTimeOut: false
    }
};

const game = new Phaser.Game(config);

console.log('🐍 Snake Game carregado!');

window.addEventListener('load', () => {
    console.log('📱 Dispositivo:', 
        /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
    );
    console.log('📐 Tela:', window.innerWidth, 'x', window.innerHeight);
});