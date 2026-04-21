# ✨ Efeitos Visuais (VFX) - Guia Técnico

Sistema de efeitos visuais otimizado para mobile.

---

## 📊 Resumo

| Efeito | Partículas | Performance | Uso |
|--------|------------|--------------|-----|
| **Explosão** | ~25 | ✅ Rápido | Morte |
| **Teleporte** | ~15 | ✅ Médio | Power-up |
| **Poeira** | ~8 | ✅ Rápido | Colisão |
| **Brilho** | 1 | ✅ Rápido | Comida especial |

---

## 🎯 Efeitos Implementados

### 1. Explosão

```javascript
vfx.createExplosion(x, y, intensity);
```

**Componentes:**
- Flash branco central
- Partículas de fogo (laranja/amarelo)
- Fumaça subindo
- Centelhas

**Duração:** 200-400ms

### 2. Teleporte Dimensional

```javascript
vfx.createTeleportEffect(x, y, () => {
    // Callback após teleporte
    player.x = newX;
    player.y = newY;
});
```

**Componentes:**
- Anel de portal crescente
- Partículas em espiral
- Flash de tela

**Duração:** 400ms

### 3. Poeira ao Colidir

```javascript
vfx.createWallImpact(x, y, 'right');
```

**Direções:**
- `'left'`, `'right'`, `'up'`, `'down'`

**Duração:** 300ms

### 4. Brilho Especial

```javascript
// Tipos: 'gold', 'silver', 'rainbow'
const glow = vfx.createGlowEffect(sprite, 'rainbow');

// Para parar
glow.stop();
```

---

## 🚀 Performance Mobile

### Limites

| Recurso | Limite |
|---------|--------|
| Partículas/explosão | 25 |
| Tamanho máximo | 50 |
| Duração máxima | 500ms |

### Otimizações

- ✅ Graphics simples (fillCircle/fillRect)
- ✅ Tweens reutilizáveis
- ✅ Cleanup automático
- ✅ Sem shaders
- ✅ Sem physics

---

## 📁 API

```javascript
// Criar VFX
const vfx = new VFXManager(scene);

// Explosão
vfx.createExplosion(x, y);

// Teleporte
vfx.createTeleportEffect(x, y, callback);

// Poeira
vfx.createWallImpact(x, y, 'up');

// Brilho
const glow = vfx.createGlowEffect(sprite, 'gold');
glow.stop();

// Coletar comida
vfx.createFoodCollectEffect(x, y);

// Morte
vfx.createDeathEffect(x, y);
```

---

## 🎨 Cores

```javascript
const COLORS = {
    FIRE: 0xff4400,
    FIRE_CORE: 0xffaa00,
    SMOKE: 0x444444,
    
    PORTAL: 0xaa44ff,
    PORTAL_CORE: 0xffffff,
    
    DUST: 0x887766,
    
    GLOW_GOLD: 0xffdd00,
    GLOW_SILVER: 0xcccccc
};
```