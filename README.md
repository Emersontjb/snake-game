# 🐍 Snake Game - Guia Completo

## 📁 Estrutura do Projeto

```
snake-game/
├── index.html              # Página principal
├── package.json          # Dependências
├── capacitor.config.json # Configuração Android
├── README.md            # Este arquivo
└── src/
    ├── main.js         # Entry point
    ├── GameScene.js    # Cena principal
    ├── GameConfig.js   # Configurações
    ├── Snake.js       # Classe da cobra
    ├── Food.js        # Classe da comida
    ├── Obstacle.js    # Classe de obstáculos
    ├── UIManager.js  # Interface do usuário
    ├── Controls.js    # Sistema de controles
    ├── AudioManager.js # Efeitos sonoros
    └── StorageManager.js # High score
```

---

## 🚀 Como Rodar

### 1. No Navegador

```bash
# Instalar servidor local
npx http-server -c-1 -p 8080

# Abrir no navegador
# http://localhost:8080
```

### 2. Testar Local com Arquivos

Basta abrir o `index.html` diretamente no navegador.

---

## 🎮 Controles

### Desktop (Teclado)
| Tecla | Ação |
|-------|------|
| ⬆️ W / ↑ | Mover para cima |
| ⬇️ S / ↓ | Mover para baixo |
| ⬅️ A / ← | Mover para esquerda |
| ➡️ D / → | Mover para direita |
| Enter | Iniciar/Reiniciar |

### Mobile (Toque)
| Controle | Descrição |
|---------|-----------|
| 👆 Swipe | Deslize na direção desejada |
| 🔘 D-pad | Botões na tela (inferior direito) |

### Multitouch
- ✅ Suporta vários dedos simultâneos
- ✅ D-pad + Swipe funcionam juntos
- ✅ Input é throttled (80ms entre comandos)

---

## 🎯 Mecânicas do Jogo

1. **Comida** 🍎 - Coletar para ganhar pontos (+10 × nível)
2. **Nível** ⬆️ - A cada 50 pontos, sobe de nível
3. **Velocidade** ⚡ - A cada nível, o jogo acelera
4. **Obstáculos** 🧱 - A partir do nível 8, obstáculos aparecem
5. **Game Over** 💀 - Bater na parede ou no próprio corpo

---

## 📱 Criar APK (Android)

### Passo 1: Instalar Capacitor
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Passo 2: Inicializar
```bash
npx cap init "Snake Game" com.snake.game
```

### Passo 3: Build e Sync
```bash
npx cap sync android
```

### Passo 4: Abrir no Android Studio
```bash
npx cap open android
```

### Passo 5: Compilar APK
No Android Studio:
1. Menu **Build** > **Build Bundle(s) / APK(s)**
2. Selecione **Build APK(s)**
3. Aguarde compilação
4. APK estará em `android/app/build/outputs/apk/debug/`

---

## 🔧 Troubleshooting

### Erro: "java não encontrado"
```bash
# Linux/Mac
export JAVA_HOME=/caminho/para/jdk
export PATH=$JAVA_HOME/bin:$PATH

# Windows
set JAVA_HOME=C:\caminho\para\jdk
set PATH=%JAVA_HOME%\bin;%PATH%
```

### Erro: "SDK não encontrado"
Baixe Android Studio: https://developer.android.com/studio

### Tela não adapta
O jogo usa `Phaser.Scale.FIT` para auto-adaptar.

---

## 📄 Licença

MIT