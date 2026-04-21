# 🗺️ Tilemap Manager - Sistema de Mapas Realista

Este documento descreve o sistema de tilemap implementado para criar mapas estilo Bomberman com texturas realistas.

---

## 📐 ARQUITETURA DO SISTEMA

### Estrutura de Camadas

```
┌─────────────────────────────────────────┐
│           EFFECT CONTAINER              │  Depth: 100+
│         (efeitos, partículas)            │
├─────────────────────────────────────────┤
│          OBJECT CONTAINER                │  Depth: 10+
│     (paredes, blocos, bombas)           │
├─────────────────────────────────────────┤
│          GROUND CONTAINER               │  Depth: 0
│         (chão, texturas base)          │
└─────────────────────────────────────────┘
```

### Grid do Jogo

| Dimensão | Tamanho |
|----------|---------|
| **Largura** | 15 tiles |
| **Altura** | 11 tiles |
| **Tile** | 20×20 pixels |
| **Total** | 300×220 pixels |

---

## 🧱 TIPOS DE TILES

### Tiles do Chão

| Tipo | Textura | Descrição |
|------|---------|----------|
| `GEMPTY` | - | Espaço vazio |
| `GROUND` | `ground_X` | Piso de concreto |

### Tiles de Parede

| Tipo | Textura | Descrição |
|------|---------|-----------|
| `WALL_INDESTRUCTIBLE` | `stone_X` | Pedra sólida (não quebrável) |
| `WALL_DESTRUCTIBLE` | `block_X` | Bloco de tijolo (quebrável) |
| `WALL_METAL` | `metal_X` | Metal enferrujado |
| `WALL_STONE` | `stone_X` | Pedra (alternativa) |
| `WALL_WOOD` | `wood_X` | Madeira |
| `WALL_DIRT` | (via chão) | Terra/vegetação |

### Tiles Especiais

| Tipo | Textura | Descrição |
|------|---------|-----------|
| `BOMB` | (gerado) | Bomba do jogador |
| `EXPLOSION` | (gerado) | Explos��o |
| `PLAYER` | (gerado) | Jogador |

---

## 🎨 SISTEMA DE VARIAÇÃO

### Por Que Variação?

Tiles 100% idênticos criam um padrão repetitivo e artificial. O sistema de variação adiciona:

- **4 variações de chão** (cores diferentes)
- **3 variações de pedra** (detalhes diferentes)
- **3 variações de metal** (brilho/ferrugem)
- **3 variações de madeira** (veios diferentes)
- **3 variações de bloco** (manchas diferentes)

### Seed-Based Random

```javascript
// Gera número pseudo-aleatório baseado em posição
seededRandom(x, y, index) {
    const seed = this.seed + x * 1000 + y * 100 + index;
    const n = Math.sin(seed) * 10000;
    return n - Math.floor(n);
}

// Obtém variação (0, 1, ou 2)
getVariation(x, y, variations = 3) {
    return Math.floor(this.seededRandom(x, y) * variations);
}
```

**Benefício:** A mesma posição sempre gera a mesma variação, garantindo consistência quando o mapa é reconstruído.

---

## 🎨 TEXTURAS PROCEDURAIS

### Técnicas de Geração

#### 1. Chão (ConcreteTexture)

```javascript
// Base com cor variada
graphics.fillStyle(baseColor, 1);
graphics.fillRect(0, 0, size, size);

// Pontos de detalhe (pedrinhas)
for (let i = 0; i < numDetails; i++) {
    graphics.fillStyle(color, alpha);
    graphics.fillCircle(x, y, radius);
}

// Linhas de desgaste
graphics.lineStyle(1, color, alpha);
graphics.moveTo(0, y);
graphics.lineTo(size, y);
graphics.strokePath();
```

#### 2. Pedra (StoneTexture)

```javascript
// Rachaduras
for (let i = 0; i < numCracks; i++) {
    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
}
graphics.strokePath();

// Manchas
graphics.fillCircle(x, y, radius);
```

#### 3. Metal (MetalTexture)

```javascript
// Brilho diagonal
graphics.moveTo(0, size);
graphics.lineTo(size * 0.7, 0);
graphics.strokePath();

// Ferrugem (manchas)
graphics.fillCircle(x, y, radius);
```

#### 4. Madeira (WoodTexture)

```javascript
// Veios da madeira
for (let i = 0; i < numGrains; i++) {
    graphics.moveTo(0, y);
    for (let j = 0; j < 3; j++) {
        graphics.lineTo(x + offset, y + curve);
    }
}
graphics.strokePath();
```

#### 5. Bloco Tijolo (BlockTexture)

```javascript
// Padrão tijolo
graphics.moveTo(0, size * 0.33);
graphics.lineTo(size, size * 0.33);
graphics.moveTo(0, size * 0.66);
graphics.lineTo(size, size * 0.66);
// Verticais alternadas
graphics.moveTo(size * 0.5, 0);
graphics.lineTo(size * 0.5, size * 0.33);
```

### Borda 3D (todas as texturas)

```javascript
drawBlockBorder(graphics, size, lightColor, darkColor) {
    // Highlight superior
    graphics.lineStyle(2, lightColor, 0.6);
    graphics.moveTo(1, 1);
    graphics.lineTo(size - 1, 1);
    graphics.lineTo(size - 1, size - 3);
    
    // Sombra inferior
    graphics.lineStyle(2, darkColor, 0.8);
    graphics.moveTo(size - 1, size - 1);
    graphics.lineTo(1, size - 1);
    graphics.lineTo(1, 1);
    
    graphics.strokePath();
}
```

---

## 🏗️ GERAÇÃO DO MAPA

### Padrão Base

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

█ = WALL_INDESTRUCTIBLE (pedra)
░ = WALL_DESTRUCTIBLE (tijolo, aleatório)
P = PLAYER spawn
```

### Algoritmo

```javascript
generateInternalGrid() {
    // Cantos seguros
    const safeZones = [
        {x: 1, y: 1}, {x: 2, y: 1}, {x: 1, y: 2},
        {x: 1, y: 3}, {x: 2, y: 2}
    ];
    
    for (y = 1; y < height - 1; y++) {
        for (x = 1; x < width - 1; x++) {
            if (isSafe(x, y)) continue;
            if (seededRandom(x, y) < 0.35) {
                addBlock(x, y);  // 35% de chance
            }
        }
    }
}
```

---

## 🎭 DECORAÇÕES

### Sistema de Decoração

Decoração é aplicada automaticamente em posições específicas para adicionar vida ao mapa:

```javascript
addDecorations() {
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            if (objectLayer[y][x].type === WALL_DESTRUCTIBLE) {
                if (seededRandom(x, y) > 0.7) {
                    addGroundDecoration(x, y);
                }
            }
        }
    }
}

addGroundDecoration(x, y) {
    // Manchas de terra/vegetação embaixo do bloco
    for (let i = 0; i < numSpots; i++) {
        decoration.fillStyle(mossColor, 0.4);
        decoration.fillCircle(offsetX, offsetY, radius);
    }
}
```

### Tipos de Decoração

| Tipo | Descrição | Ocorrência |
|------|----------|-------------|
| **Mossa** | Manchas verdes | Raro (30%) |
| **Terra** | Manchas marrons | Frequente (70%) |
| **Sujeira** | Pontos escuros | Comum (50%) |

---

## ✨ EFEITOS VISUAIS

### Destruição de Blocos

```javascript
createDestructionEffect(gridX, gridY) {
    // Partículas de escombros
    for (let i = 0; i < 6; i++) {
        particle.fillRect(0, 0, size, size);
        tween.add({
            x: targetX + randomOffset,
            y: targetY + randomOffset,
            alpha: 0,
            angle: randomRotation,
            duration: 400
        });
    }
    
    // Poeira
    for (let i = 0; i < 4; i++) {
        dust.fillCircle(0, 0, size);
        tween.add({
            y: y - 15,
            alpha: 0,
            duration: 500
        });
    }
}
```

### Explosões

```javascript
createExplosion(gridX, gridY) {
    // Flash branco
    flash.fillStyle(0xffffff, 0.9);
    flash.fillCircle(x, y, 15);
    tween.add({ alpha: 0, scale: 2, duration: 200 });
    
    // Fogo
    fire.fillStyle(0xff6600, 0.8);
    fire.fillCircle(x, y, 12);
    fire.fillStyle(0xffff00, 0.6);
    fire.fillCircle(x, y, 8);
    tween.add({ alpha: 0, scale: 1.5, duration: 300 });
}
```

---

## 📊 PERFORMANCE

### Checklist de Otimização

| Técnica | Impacto | Implementação |
|---------|---------|---------------|
| Texturas procedurais | ✅ HTTP zero | Graphics.generateTexture() |
| Seed-based random | ✅ Consistência | Sem Math.random() no render |
| Containers separados | ✅ Organização | Camadas por depth |
| Dirty flags | ✅ Render | Só redesenha se mudou |
| Pooling de partículas | ✅ Memória | Reutilização |

### Detecção de Mobile

```javascript
const isMobile = /Android|iPhone/i.test(navigator.userAgent);
const isLowRam = navigator.deviceMemory && navigator.deviceMemory < 4;

if (isMobile || isLowRam) {
    // Simplificar texturas
    createSimpleTextures();
} else {
    // Texturas completas
    createDetailedTextures();
}
```

---

## 🔧 API PÚBLICA

### Métodos Principais

```javascript
// Construir mapa completo
tileMap.buildMap();

// Verificar walkability
tileMap.isWalkable(gridX, gridY);  // true/false

// Remover bloco
tileMap.removeBlock(gridX, gridY);

// Obter tile
tileMap.getTile(gridX, gridY);  // {type, sprite, health}

// Limpar mapa
tileMap.destroy();
```

### Exemplo de Uso

```javascript
// Verificar movimento
if (tileMap.isWalkable(newX, newY)) {
    player.gridX = newX;
    player.gridY = newY;
    animatePlayer();
}

// Destruir bloco
if (tileMap.isDestructible(targetX, targetY)) {
    tileMap.removeBlock(targetX, targetY);
    score += 10;
}
```

---

## 📁 ESTRUTURA DE ARQUIVOS

```
snake-game/src/
├── TileMapManager.js     # Sistema de tilemap
├── GameScene.js          # Cena do jogo
├── VisualStyleManager.js # Estilos e efeitos
├── Controls.js          # Controles
├── AudioManager.js     # Áudio
├── UIManager.js         # UI
└── GameConfig.js        # Configurações
```

---

## 🚀 FUTURAS MELHORIAS

- [ ] Spritesheet animado para bombas
- [ ] Sistema de Power-ups
- [ ] Inimigos com IA
- [ ] Multiple mapas
- [ ] Editor de mapas
- [ ] Import/Export de mapas
- [ ] Tilesets customizáveis
- [ ] Iluminação dinâmica
- [ ] Sistema de día/noite

---

## 📚 REFERÊNCIAS

- [Phaser Graphics](https://phaser.io/docs/3.60/Phaser.GameObjects.Graphics)
- [Procedural Generation](https://en.wikipedia.org/wiki/Procedural_generation)
- [Tile Map Editor](https://en.wikipedia.org/wiki/Tile_mapper)