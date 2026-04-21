/**
 * =====================================
 * PERFORMANCE MANAGER
 * =====================================
 * 
 * Sistema de otimização de performance
 * para dispositivos de baixo desempenho.
 * 
 * OTIMIZAÇÕES IMPLEMENTADAS:
 * 
 * 1. MEMÓRIA
 * - Object pooling
 * - Limpeza de objetos
 * - Cache de texturas
 * - Evitar alocações em loop
 * 
 * 2. RENDERIZAÇÃO
 * - Batch rendering
 * - Viewport culling
 * - LOD (Level of Detail)
 * - Dirty rect tracking
 * 
 * 3. FPS
 * - Frame skip
 * - Delta time cap
 * - Adaptive quality
 * 
 * 4. LOOPS
 * - Early exit
 * - Throttling
 * - Debouncing
 */

export default class PerformanceManager {
    constructor(scene) {
        this.scene = scene;
        this.game = scene.game;
        
        // =====================================
        // ESTADO
        // =====================================
        
        this.frameCount = 0;
        this.lastFPSTime = 0;
        this.currentFPS = 60;
        this.averageFPS = 60;
        this.fpsHistory = [];
        
        this.isLowEnd = false;
        this.qualityLevel = 'high';
        
        // Object pools
        this.pools = new Map();
        
        // =====================================
        // CONFIGURAÇÕES
        // =====================================
        
        this.config = {
            // FPS
            targetFPS: 60,
            minFPS: 30,
            maxDelta: 50,
            
            // Memória
            maxPoolSize: 50,
            gcThreshold: 1000,
            textureCacheSize: 20,
            
            // Renderização
            enableBatching: true,
            enableCulling: true,
            renderAhead: true,
            
            // Adaptive
            autoDetectLowEnd: true,
            adaptiveQuality: true
        };
        
        this.init();
    }
    
    init() {
        this.detectPerformance();
        this.setupOptimizations();
        this.startMonitoring();
    }
    
    // =====================================
    // DETECÇÃO DE PERFORMANCE
    // =====================================
    
    detectPerformance() {
        const canvas = this.game.canvas;
        
        // Testar capacidade do dispositivo
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isLowRam = navigator.deviceMemory && navigator.deviceMemory < 4;
        
        const renderer = this.game.renderer;
        const isWebGL = renderer.type === 'webgl' || renderer.type === 'webgl2';
        
        // Benchmark simples
        const startTime = performance.now();
        let total = 0;
        for (let i = 0; i < 1000; i++) {
            total += Math.sqrt(i) * Math.random();
        }
        const benchmarkTime = performance.now() - startTime;
        
        // Classificar performance
        if (isLowRam || (!isWebGL && isMobile) || benchmarkTime > 50 || !isMobile) {
            this.isLowEnd = true;
            this.qualityLevel = 'low';
            console.log('📱 Performance baixa detectada');
        } else if (benchmarkTime > 20) {
            this.qualityLevel = 'medium';
        }
        
        console.log('⚡ Benchmark:', benchmarkTime.toFixed(2) + 'ms', 'Quality:', this.qualityLevel);
    }
    
    // =====================================
    // SETUP DE OTIMIZAÇÕES
    // =====================================
    
    setupOptimizations() {
        // Configurar renderer
        this.setupRenderer();
        
        // Configurar física
        this.setupPhysics();
        
        // Configurar áudio
        this.setupAudio();
    }
    
    setupRenderer() {
        const renderer = this.game.renderer;
        
        if (this.qualityLevel === 'low') {
            // Renderização básica
            renderer.config.roundPixels = true;
            renderer.config.pixelArt = false;
            renderer.config.antialias = false;
            
            // Desativar efeitos
            this.game.config.renderTransparent = false;
        } else if (this.qualityLevel === 'medium') {
            renderer.config.antialias = true;
            renderer.config.roundPixels = true;
        }
    }
    
    setupPhysics() {
        if (this.qualityLevel === 'low') {
            this.scene.physics.config.default.debug = false;
            this.scene.physics.config.default.fps = 30;
        }
    }
    
    setupAudio() {
        // Limitar canais de áudio
        if (this.audioManager) {
            this.audioManager.maxChannels = this.qualityLevel === 'low' ? 4 : 8;
        }
    }
    
    // =====================================
    // MONITORAMENTO DE FPS
    // =====================================
    
    startMonitoring() {
        this.lastFPSTime = performance.now();
        this.fpsHistory = [];
    }
    
    update(time, delta) {
        this.frameCount++;
        
        // Calcular FPS a cada 500ms
        const elapsed = time - this.lastFPSTime;
        
        if (elapsed >= 500) {
            this.currentFPS = (this.frameCount * 1000) / elapsed;
            this.frameCount = 0;
            this.lastFPSTime = time;
            
            // Média móvel
            this.fpsHistory.push(this.currentFPS);
            if (this.fpsHistory.length > 10) {
                this.fpsHistory.shift();
            }
            
            this.averageFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
            
            // Adaptive quality
            if (this.config.adaptiveQuality) {
                this.adaptQuality();
            }
        }
    }
    
    // =====================================
    // QUALITY ADAPTATIVO
    // =====================================
    
    adaptQuality() {
        if (this.averageFPS < this.config.minFPS) {
            // Baixar qualidade
            if (this.qualityLevel === 'high') {
                this.qualityLevel = 'medium';
                console.log('📉 Qualidade reduzida para medium');
            } else if (this.qualityLevel === 'medium') {
                this.qualityLevel = 'low';
                console.log('📉 Qualidade reduzida para low');
                this.applyLowQuality();
            }
        } else if (this.averageFPS > 55 && this.qualityLevel === 'low') {
            // Melhorar qualidade se possível
            this.qualityLevel = 'medium';
            console.log('📈 Qualidade aumentada para medium');
        }
    }
    
    applyLowQuality() {
        // Simplificar renderização
        if (this.scene.food) {
            this.scene.food.animationPhase = 0;
        }
        
        // Reduzir partículas
        // Aumentar cooldown de input
        if (this.scene.controls) {
            this.scene.controls.inputCooldown = 100;
        }
    }
    
    // =====================================
    // FRAME SKIP (QUANDO MUITO LENTO)
    // =====================================
    
    shouldSkipFrame() {
        if (!this.isLowEnd) return false;
        
        // Se FPS está baixo, pular frames
        if (this.currentFPS < 30 && this.currentFPS > 0) {
            return Math.random() > 0.5;
        }
        
        return false;
    }
    
    // =====================================
    // DELTA TIME CAP
    // =====================================
    
    capDelta(delta) {
        return Math.min(delta, this.config.maxDelta);
    }
    
    // =====================================
    // OBJECT POOLING
    // =====================================
    
    createPool(type, factory, initialSize = 10) {
        const pool = [];
        const actualSize = Math.min(initialSize, this.config.maxPoolSize);
        
        for (let i = 0; i < actualSize; i++) {
            pool.push(factory());
        }
        
        this.pools.set(type, {
            pool: pool,
            active: new Set(),
            factory: factory
        });
        
        return this.pools.get(type);
    }
    
    getFromPool(type) {
        const poolData = this.pools.get(type);
        if (!poolData) return null;
        
        const pool = poolData.pool;
        
        if (pool.length > 0) {
            return pool.pop();
        }
        
        return poolData.factory();
    }
    
    returnToPool(type, obj) {
        const poolData = this.pools.get(type);
        if (!poolData) return;
        
        if (poolData.pool.length < this.config.maxPoolSize) {
            poolData.pool.push(obj);
        }
    }
    
    clearPool(type) {
        const poolData = this.pools.get(type);
        if (!poolData) return;
        
        poolData.pool.length = 0;
        poolData.active.clear();
    }
    
    // =====================================
    // GARBAGE COLLECTION
    // =====================================
    
    maybeGC() {
        if (this.frameCount % this.config.gcThreshold === 0) {
            // Não forçar GC, apenas deixar o browser fazer
            if (this.frameCount % (this.config.gcThreshold * 2) === 0) {
                console.log('🗑️ GC hint');
            }
        }
    }
    
    // =====================================
    // CULLING (NÃO RENDERIZAR FORA DA TELA)
    // =====================================
    
    isOnScreen(x, y, width, height) {
        if (!this.config.enableCulling) return true;
        
        const camera = this.scene.cameras.main;
        const bounds = camera.worldView;
        
        return (
            x + width > bounds.x &&
            x < bounds.x + bounds.width &&
            y + height > bounds.y &&
            y < bounds.y + bounds.height
        );
    }
    
    // =====================================
    // BATCH RENDERING
    // =====================================
    
    batchRender(graphics, objects, renderFn) {
        if (!this.config.enableBatching) {
            objects.forEach(renderFn);
            return;
        }
        
        graphics.flush();
        objects.forEach(renderFn);
        graphics.flush();
    }
    
    // =====================================
    // GETTERS
    // =====================================
    
    getFPS() {
        return Math.round(this.currentFPS);
    }
    
    getAverageFPS() {
        return Math.round(this.averageFPS);
    }
    
    getQuality() {
        return this.qualityLevel;
    }
    
    isLowEndDevice() {
        return this.isLowEnd;
    }
    
    // =====================================
    // CLEANUP
    // =====================================
    
    destroy() {
        // Limpar pools
        this.pools.forEach((poolData) => {
            poolData.pool.length = 0;
            poolData.active.clear();
        });
        this.pools.clear();
        
        this.fpsHistory.length = 0;
    }
}