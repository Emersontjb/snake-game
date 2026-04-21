/**
 * =====================================
 * AUDIO MANAGER - SONS SINTETIZADOS
 * =====================================
 * 
 * Efeitos sonoros usando Web Audio API
 * (síntese - sem dependência de arquivos)
 */

export default class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.audioContext = null;
        this.enabled = true;
        
        this.initAudio();
    }
    
    initAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
            }
        } catch (e) {
            console.log('Web Audio não disponível');
            this.enabled = false;
        }
    }
    
    play(type) {
        if (!this.enabled || !this.audioContext) return;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        const now = this.audioContext.currentTime;
        
        switch (type) {
            case 'eat':
                this.playEat(oscillator, gainNode, now);
                break;
            case 'gameover':
                this.playGameOver(oscillator, gainNode, now);
                break;
            case 'levelup':
                this.playLevelUp(oscillator, gainNode, now);
                break;
            case 'start':
                this.playStart(oscillator, gainNode, now);
                break;
            case 'move':
                this.playMove(oscillator, gainNode, now);
                break;
        }
    }
    
    playEat(osc, gain, now) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
    }
    
    playGameOver(osc, gain, now) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    }
    
    playLevelUp(osc, gain, now) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.setValueAtTime(450, now + 0.08);
        osc.frequency.setValueAtTime(550, now + 0.16);
        osc.frequency.setValueAtTime(700, now + 0.24);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
    }
    
    playStart(osc, gain, now) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
    }
    
    playMove(osc, gain, now) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
    }
}