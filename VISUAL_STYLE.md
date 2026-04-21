# 🎨 Guia de Implementação Visual - Estilo Bomberman

Este guia explica como implementar visualmente um jogo estilo Bomberman com estética semi-realista em HTML5/Phaser.

---

## 📐 VISÃO GERAL

### Câmera e Projeção

O jogo usa uma **câmera top-down** com leve inclinação (pseudo-isométrica).

```
    ┌─────────────────────────────┐
    │                           │
    │      CÂMERA TOP-DOWN       │
    │                           │
    │    ┌───┬───┬───┬───┬───┐   │
    │    │ 1 │ 2 │ 3 │ 4 │ 5 │   │
    │    ├───┼───┼───┼───┼───┤   │
    │    │ 6 │ 7 │ 8 │ 9 │10 │   │
    │    └───┴───┴───┴───┴───┘   │
    │         GRID (15x11)       │
    └─────────────────────────────┘
```

### Configuração Phaser

```javascript
const config = {
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 300,   // 15 tiles × 20px
        height: 220   // 11 tiles × 20px
    },
    render: {
        pixelArt: false,        // Suavizar texturas
        antialias: true,      // Bordas suaves
        roundPixels: true    // Pixels arredondados
    }
};
```

---

## 🧱 ESTRUTURA DO MAPA

### Grid (15 colunas × 11 linhas)

| Tipo | Valor | Descrição |
|------|-------|-----------|
| EMPTY | 0 | Espaço vazio |
| WALL_SOLID | 1 | Parede indestrutível |
| WALL_BLOCK | 2 | Bloco destrutível |
| BOMB | 3 | Bomba |
| FIRE | 4 | Explosão |

### Padrão do Mapa (Estilo Bomberman)

```
███████████████████
█P  ░░░  █  ░░░  █░░░
████  ██  █  ██  ████
█░░  ░░░██░░██░░░░░░█
█  █████  █  █████  █
█░░██░░░░░  ░░░░██░░█
████  ████████  ████
█░░░░  ░░░  ░░░  ░░░█
███  ██  ░░  ██  ███
█░░░░░░  ░░  ░░░░░░░█
███████████████████

Legenda:
█ = WALL_SOLID (indestrutível)
░ = WALL_BLOCK (destrutível)
P = Jogador (início)
```

---

## 🎨 TEXTURAS PROCEDURAIS

### Por Que Texturas Procedurais?

| Alternativa | Problema |
|------------|----------|
| **Imagens externas** | Requisição HTTP, tamanho, carregamento |
| **Base64 inline** | Texto longo, parse lento |
| **Canvas gerado** | ✅ Rápido, leve, sem rede |

### Gerar Texturas com Graphics

```javascript
// Criar textura em runtime
const graphics = this.scene.make.graphics({ x: 0, y: 0 });

// Desenhar parede
graphics.fillStyle(0x5a5a5a, 1);
graphics.fillRect(0, 0, 20, 20);

// Detalhes
graphics.lineStyle(1, 0x6a6a6a, 0.5);
graphics.strokeRect(0, 0, 20, 20);

// Gerar textura
graphics.generateTexture('wall', 20, 20);
graphics.destroy();

// Usar
const wall = this.add.image(x, y, 'wall');
```

### Texturas para Mobile

Para **otimizar mobile**, use **cores sólidas com mínimos detalhes**:

```javascript
// Mobile-friendly (simplificado)
graphics.fillStyle(0x5a5a5a, 1);
graphics.fillRect(0, 0, 20, 20);
graphics.lineStyle(2, 0x4a4a4a, 1);
graphics.strokeRect(1, 1, 18, 18);

// Desktop (mais detalhes)
if (!isMobile) {
    // Ruído
    for (let i = 0; i < 8; i++) {
        graphics.fillStyle(0x6a6a6a, Math.random() * 0.2);
        graphics.fillCircle(Math.random() * 20, Math.random() * 20, 1);
    }
}
```

---

## 💡 ILUMINAÇÃO DINÂMICA

### Técnicas

#### 1. Luz Ambiente (Simples)

```javascript
// Fundo escuro
this.scene.cameras.main.setBackgroundColor(0x1a1a2e);

// Tiles mais escuros nas bordas
graphics.fillStyle(0x3a3a3a, 1);  // Sombra
graphics.fillRect(0, 0, 20, 20);
```

#### 2. Pontos de Luz (Bombeiros, Luzes)

```javascript
createLightSource(x, y, radius) {
    const light = this.scene.add.graphics();
    
    // Gradiente radial simulado
    light.fillStyle(0xffaa44, 0.4);
    light.fillCircle(x, y, radius);
    
    light.fillStyle(0xffaa44, 0.2);
    light.fillCircle(x, y, radius * 0.6);
    
    light.setBlendMode(Phaser.BlendModes.ADD);
    light.setDepth(100);
    
    return light;
}
```

#### 3. Sombreamento deTiles

```javascript
// Sombra abaixo de cada bloco
function drawBlock(x, y, height) {
    graphics.fillStyle(0x000011, 0.5);
    graphics.fillRect(x, y + height - 3, width, 3);
}
```

---

## 🌑 SOMBRAS EM TEMPO REAL

### Técnicas Mobile-Friendly

| Técnica | Qualidade | Performance | Uso |
|---------|-----------|--------------|-----|
| **Sombra simples** | Baixa | ✅ Excelente | Todos tiles |
| **Sombra por projetil** | Média | ✅ Boa | Player |
| **Shadow map** | Alta | ❌ Lenta | Desktop only |
| **PCF shadow** | Alta | ❌❌ Lenta | Não usar |

### Implementação Simplificada

```javascript
// Sombra simples (sempre)
drawShadow(x, y, width, height) {
    graphics.fillStyle(0x000000, 0.4);
    graphics.fillRect(x + 2, y + 2, width, height);
}

// Highlight (topo)
drawHighlight(x, y, width, height) {
    graphics.lineStyle(1, 0x888888, 0.3);
    graphics.moveTo(x, y);
    graphics.lineTo(x + width, y);
}
```

---

## ✨ PARTÍCULAS

### Sistema de Partículas do Phaser

```javascript
const particles = this.scene.add.particles(0, 0, 'particle', {
    speed: { min: 50, max: 150 },
    angle: { min: 0, max: 360 },
    scale: { start: 0.5, end: 0 },
    lifespan: 500,
    quantity: 1,
    tint: 0xff6600,
    blendMode: 'ADD'
});
```

### Efeitos Customizados

```javascript
createDustEffect(x, y) {
    for (let i = 0; i < 5; i++) {
        const dust = this.scene.add.graphics();
        dust.fillStyle(0x8a7a6a, 0.5);
        dust.fillCircle(
            x + Math.random() * 20,
            y + Math.random() * 20,
            Math.random() * 3
        );
        
        this.scene.tweens.add({
            targets: dust,
            y: y - 20,
            alpha: 0,
            duration: 500,
            onComplete: () => dust.destroy()
        });
    }
}

createExplosionEffect(x, y) {
    // Flash
    const flash = this.scene.add.graphics();
    flash.fillStyle(0xffffff, 0.9);
    flash.fillCircle(x, y, 30);
    
    this.scene.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 2,
        duration: 150,
        onComplete: () => flash.destroy()
    });
    
    // Partículas de fogo
    for (let i = 0; i < 8; i++) {
        const particle = this.scene.add.graphics();
        particle.fillStyle(0xff6600, 0.8);
        particle.fillCircle(x, y, Math.random() * 5);
        
        this.scene.tweens.add({
            targets: particle,
            x: x + Math.random() * 60 - 30,
            y: y + Math.random() * 60 - 30,
            alpha: 0,
            duration: 300,
            onComplete: () => particle.destroy()
        });
    }
}
```

---

## 🎮 PERFORMANCE PARA MOBILE

### Checklist de Otimização

- [ ] Texturas procedurais (sem HTTP)
- [ ] Cores sólidas com mínimos detalhes
- [ ] BlendModes simples (normal/ADD)
- [ ] Sem sombras complexas
- [ ] Partículas limitadas (< 50)
- [ ] Graphics pooling
- [ ] Dirty flags para render

### Detecção de Dispositivo

```javascript
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
const isLowRam = navigator.deviceMemory && navigator.deviceMemory < 4;

if (isMobile || isLowRam) {
    // Modo simplificado
    createSimpleTextures();
} else {
    // Modo detalhado
    createDetailedTextures();
}
```

---

## 📂 ESTRUTURA FINAL

```
snake-game/src/
├── main.js              # Entry point
├── GameScene.js         # Cena com mapa Bomberman
├── VisualStyleManager.js # Texturas, luzes, partículas
├── PerformanceManager.js # Otimizações
├── Controls.js        # Swipe + D-pad
├── AudioManager.js     # Sons
└── GameConfig.js       # Configurações
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Testar texturas** no navegador
2. **Ajustar cores** para melhor contraste
3. **Adicionar spritesheet** se necessário
4. **Testar performance** em dispositivo real
5. **Ajustar para APK** com Capacitor

---

## 📚 REFERÊNCIAS

- [Phaser Graphics](https://phaser.io/docs/3.60/Phaser.GameObjects.Graphics)
- [Phaser Particles](https://phaser.io/docs/3.60/Phaser.GameObjects.Particles)
- [Blend Modes](https://phaser.io/docs/3.60/Phaser.BlendModes)