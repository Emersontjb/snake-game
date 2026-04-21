# 🐍 Snake Game - Guia de Instalação

## Estrutura do Projeto

```
snake-game/
├── index.html              # Arquivo principal
├── package.json            # Dependências
├── capacitor.config.json  # Configuração Capacitor
└── src/
    ├── main.js            # Entry point
    ├── GameScene.js      # Cena principal
    ├── GameConfig.js     # Configurações
    ├── Snake.js          # Classe da cobra
    ├── Food.js           # Classe da comida
    ├── Obstacle.js      # Classe de obstáculos
    ├── UIManager.js     # Interface
    ├── Controls.js      # Controles (teclado + touch)
    ├── AudioManager.js  # Sons
    └── StorageManager.js # High score
```

---

## 🚀 Como Rodar

### 1. No Navegador (Local)

```bash
# Instalar dependências
npm install

# Rodar servidor local
npm start
```

Acesse: http://localhost:8080

### 2. Deploy no GitHub Pages

O projeto está configurado para GitHub Pages.

---

## 📱 Como Criar APK (Android)

### Pré-requisitos

- Node.js instalado
- Java JDK 11+
- Android SDK

### Passo a Passo

```bash
# 1. Criar pasta do projeto (se não tiver)
npm install

# 2. Criar projeto Android
npx cap init "Snake Game" com.snake.game

# 3. Instalar dependências Android
npm install @capacitor/android

# 4. Build do projeto
npm run build

# 5. Sincronizar com Android
npx cap sync android

# 6. Abrir Android Studio
npx cap open android
```

### No Android Studio

1. Clique em **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
2. Aguarde compilação
3. APK estará em: `android/app/build/outputs/apk/debug/`

---

## 🎮 Controles

### Desktop
- **Setas** ou **WASD** para mover
- Clique para iniciar/reiniciar

### Mobile
- **Swipe** para mudar direção
- Botões aparecem na tela (mobile)

---

## 🎯 Mecânicas do Jogo

- Colete a **comida vermelha** (+10 pontos)
- A cada 50 pontos, **sobe de nível**
- A cada 3 níveis, **obstáculos aparecem**
- Não bata nas paredes ou no próprio corpo!

---

## 🔧 Troubleshooting

### Erro: "java não encontrado"
```bash
# No Linux/Mac
export JAVA_HOME=/caminho/para/jdk

# No Windows
set JAVA_HOME=C:\caminho\para\jdk
```

### Erro: "SDK não encontrado"
Baixe em: https://developer.android.com/studio

### Problema de build
```bash
# Limpar cache
rm -rf node_modules
npm install
```

---

## 📄 Licença

MIT