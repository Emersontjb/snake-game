# 💡 Sistema de Iluminação - Guia Técnico

Este documento explica como implementar um sistema de iluminação realista e performático para jogos 2D/2.5D em HTML5/Phaser.

---

## 📊 VISÃO GERAL

### Abordagens de Iluminação

| Abordagem | Qualidade | Performance | Recomendado |
|----------|-----------|-------------|-------------|
| **Nenhuma** | ❌ | ✅✅✅ | Não recomendado |
| **Overlay simples** | ❌ | ✅✅✅ | Apenas cores ruins |
| **Círculos de luz** | ✅ | ✅✅ | **✅ Melhor** |
| **Multiplicação** | ✅✅ | ✅ | Bom |
| **Shaders customizados** | ✅✅✅ | ❌ | Desktop only |

Este sistema usa **círculos de luz叠加** - a abordagem mais performática para mobile.

---

## 🎯 IMPLEMENTAÇÃO

### 1. Configuração Base

```javascript
const LIGHT_PRESETS = {
    DEFAULT: {
        ambient: { r: 0.15, g: 0.15, b: 0.2 },  // RGB normalizado (0-1)
        ambientIntensity: 0.6                       // 0-1, mais escuro = menor
    },
    
    DUNGEON: {
        ambient: { r: 0.1, g: 0.1, b: 0.15 },
        ambientIntensity: 0.4
    },
    
    UNDERGROUND: {
        ambient: { r: 0.05, g: 0.05, b: 0.08 },
        ambientIntensity: 0.3
    }
};
```

### 2. Camada de Luz Ambiente

```javascript
createAmbientOverlay() {
    // Fundo escuro com cor ambiente
    this.ambientLight.fillStyle(
        Phaser.Display.Color.GetColor(r * 255, g * 255, b * 255),
        1 - intensity
    );
    this.ambientLight.fillRect(0, 0, width, height);
}
```

**Resultado:**
- Cena mais escura que o normal
- Gives sensação de caverna/dungeon
- глаза se acostumam com escuro conforme jogam

### 3. Fontes de Luz Dinâmicas

```javascript
createLightSource(x, y, radius, color, intensity) {
    // Círculo externo (esmaece ambiente)
    light.fillStyle(color, intensity * 0.3);
    light.fillCircle(x, y, radius);
    
    // Círculo médio
    light.fillStyle(color, intensity * 0.15);
    light.fillCircle(x, y, radius * 0.7);
    
    // Centro brilhante
    light.fillStyle(0xffffff, intensity * 0.2);
    light.fillCircle(x, y, radius * 0.3);
    
    // Blend mode CRÍTICO para efeito
    light.setBlendMode(Phaser.BlendModes.SCREEN);
}
```

**Blend Modes Suportados:**

| Mode | Efeito | Uso |
|------|--------|-----|
| `ADD` | Aditiva (brilho) | Fogo, mágica |
| `SCREEN` | Tela (claro) | Luzes normais |
| `MULTIPLY` | Multiplicar (escuro) | Sombras |
| `OVERLAY` | Sobreposição | Efeitos |

### 4. Destaque do Personagem

```javascript
updatePlayerGlow(x, y) {
    // Sombra ao redor do jogador
    this.playerGlow.fillStyle(0x000022, 0.6);
    this.playerGlow.fillCircle(x + offset, y + offset, size + 4);
    
    // Brilho azul sutil
    this.playerGlow.fillStyle(0x6666aa, 0.15);
    this.playerGlow.fillCircle(x, y - 2, size);
}
```

---

## 🔥 EXPLOSÕES E EFEITOS

### Explosão Completa

```javascript
createExplosionLight(x, y) {
    // 1. Flash branco (instantâneo)
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 0.8);
    flash.fillCircle(x, y, 40);
    flash.setBlendMode(Phaser.BlendModes.ADD);
    
    this.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 2,
        duration: 200,
        onComplete: () => flash.destroy()
    });
    
    // 2. Luz dinâmica (fade out)
    const light = this.createLightSource(x, y, 80, 0xff6600, 0.8);
    
    this.tweens.add({
        targets: light,
        alpha: 0,
        duration: 300,
        onComplete: () => {
            light.destroy();
            this.activeLights--;
        }
    });
}
```

---

## 📱 PERFORMANCE MOBILE

### Limites Importantes

```javascript
// Mobile limit
this.maxLights = 4;  // Máximo de luzes dinâmicas ativas

// Verificar antes de criar luz
if (this.activeLights >= this.maxLights) {
    return null;  // Não criar mais luzes
}
```

### Checklist de Performance

- [ ] Limitar luzes ativas (max 4-6)
- [ ] Usar BlendMode.SCREEN ou ADD
- [ ] Não recriar luzes (reutilizar)
- [ ] Cleanup após uso
- [ ] Evitar shaders customizados

### Detecção de Dispositivo

```javascript
const isMobile = /Android|iPhone/i.test(navigator.userAgent);
const isLowRam = navigator.deviceMemory && navigator.deviceMemory < 4;

if (isMobile || isLowRam) {
    // Modo simplificado
    config.ambientIntensity = 0.3;
    config.maxLights = 2;
} else {
    // Modo detalhado
    config.ambientIntensity = 0.6;
    config.maxLights = 6;
}
```

---

## 🎨 PRESETS DE ILUMINAÇÃO

| Preset | Ambiente | Intensidade | Uso |
|--------|----------|-------------|-----|
| `DEFAULT` | Caverna suave | 0.6 | Geral |
| `DUNGEON` | Dungeon | 0.4 | Labirintos |
| `UNDERGROUND` | Mining | 0.3 | Minas |
| `NIGHT` | Noturno | 0.2 | Horror |

---

## 🔧 CORES DE LUZ

### Cores Comuns

| Cor | Hex | Uso |
|-----|-----|-----|
| Fogo | 0xff6600 | Explosões |
| Lâmpada | 0xffaa44 | Artificial |
| Mística | 0xaa66ff | Mágica |
| Gelada | 0x66aaff | Gelo |
| Verde | 0x66ff66 | Veneno |

---

## 📁 ESTRUTURA

```javascript
// Arquivo: src/LightingManager.js

export default class LightingManager {
    constructor(scene, config) {
        // Inicializar sistema
    }
    
    create() {
        // Criar container e overlay
    }
    
    createLightSource(x, y, radius, color, intensity) {
        // Círculo com blend
    }
    
    createExplosionLight(x, y) {
        // Flash + luz dinâmica
    }
    
    updatePlayerGlow(x, y) {
        // Sombra + brilho
    }
    
    destroy() {
        // Cleanup
    }
}
```

---

## ✅ RESULTADO ESPERADO

### Imagem Antes/Depois

**Sem iluminação:**
```
████████████
████████████
████████████
██P      ██  <- Jogador mal visível
████████████
████████████
```

**Com iluminação:**
```
▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓   ▓▓▓
▓▓    ●    ▓▓  <- Jogador com brilho
▓▓▓▓   ▓▓▓
▓▓▓▓▓▓▓▓▓▓▓▓
```

Legenda:
- █ = Escuro ambiente
- ▓ = Área esclarecida
- ● = Jogador com glow

---

## 📚 Referências

- [Phaser Blend Modes](https://phaser.io/docs/3.60/Phaser.BlendModes)
- [2D Lighting Techniques](https://en.wikipedia.org/wiki/Lighting_in_the_Middle_of_the_image)