# 🐯 Bichos & Ossos

> **Um jogo estilo *Survivor / Roguelite 2D* de alta performance desenvolvido em JavaScript puro (Vanilla JS), HTML5 Canvas e Web Audio API.**

![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange?style=for-the-badge&logo=html5)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-blueviolet?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Completo-brightgreen?style=for-the-badge)

---

## 📖 Visão Geral

**Bichos & Ossos** é um jogo de ação e sobrevivência contra hordas infinitas de monstros em tempo real. Inspirado nos clássicos do gênero *survivor-like*, o jogador controla animais com habilidades e características únicas que enfrentam ondas crescentes de inimigos mortos-vivos, atiradores de ossos, aranhas e chefes colossais.

O jogo foi construído inteiramente com tecnologias web nativas, sem dependência de engines externas (como Phaser ou Unity), implementando do zero sua própria engine de física 2D, sistema de partículas, particionamento espacial e síntese de áudio procedural.

---

## 🎮 Mecânicas de Jogo

### 1. Loop Central
- **Ataque Automático:** O personagem detecta e mira automaticamente nos alvos dentro do seu raio de visão/alcance.
- **Habilidades Ativas (Custo em SP):**
  - **Dash:** Disparada rápida para reposicionamento e fuga, garantindo quadros de invulnerabilidade.
  - **Impacto:** Explosão de dano em área com pulsos duplos de choque.
  - **Berserk:** Aumento drástico temporário de velocidade de ataque, movimento e multiplicador de dano.
  - **Brindes (⭐):** Itens consumíveis especiais acumulados durante a partida que concedem aprimoramentos instantâneos.
- **Armas Passivas:** Até 3 armas ativas simultâneas com evolução contínua (ex: *Aura Dourada*, *Garras Afiadas*, *Cometa Cadente*, *Orbe Arcano*, *Presa Retornável*, *Machado Giratório*, *Pavio Curto*, *Esporos Explosivos*, *Clone Instável*, etc.).
- **Dificuldade Escalonável:** A dificuldade do jogo aumenta organicamente com o tempo e com os eventos de hordas a cada 60 segundos.

### 2. Esquema Duplo de Controles
Configurável a qualquer momento nas opções de jogo:
| Ação | Modo Mouse + QWET (Padrão) | Modo Teclado (WASD) |
| :--- | :--- | :--- |
| **Mover Personagem** | Seguir o Cursor do Mouse | `W`, `A`, `S`, `D` |
| **Dash (Invulnerável)** | `Q` ou Botão no HUD | `Shift` ou Botão no HUD |
| **Impacto (Dano em Área)** | `W` ou Botão no HUD | `Q` ou Botão no HUD |
| **Berserk (Fúria)** | `E` ou Botão no HUD | `E` ou Botão no HUD |
| **Usar Brinde (Upgrade ⭐)** | `T` ou Atalho no HUD | `T` ou Atalho no HUD |
| **Pausar Jogo** | `ESC` ou Botão Pausar | `ESC` ou Botão Pausar |

---

## 🏗️ Arquitetura e Engenharia de Software

O projeto é estruturado em módulos claros e desacoplados, combinando orientacão a objetos, tabelas de dados desacopladas e processamento contínuo em tick de tempo (`dt` / delta time):

```
Bichos&Ossos/
├── index.html          # Markup do jogo, interfaces HUD e telas sobrepostas (overlays)
├── style.css           # Tema visual "Ouro Gótico", animações CSS3, fontes e layouts
├── definitions.js      # Tabelas de dados mestras: Armas, Skins, Inimigos, Itens, Conquistas
├── utils.js            # Matemática, helpers de áudio WebAudio, persistência LocalStorage
├── classes.js          # Entidades (Player, Enemy, Projectile, Collectible, SpatialGrid, etc.)
├── logic.js            # Algoritmos de colisão, spawning, firing logic de armas e DPS
├── main.js             # Game loop principal, gerenciamento de estado e ciclo de vida
├── assets/
│   ├── sounds/         # Trilha sonora BGM (.ogg / .mp3)
│   └── sprites/        # Spritesheets e ilustrações (skins, inimigos, efeitos, coletáveis)
└── icon.png / icon.ico # Identidade visual do projeto
```

### ⚡ Otimizações Críticas de Performance

Para suportar centenas de projéteis e milhares de entidades simultâneas a 60 FPS estáveis no Canvas:

1. **Particionamento Espacial (`SpatialGrid`):**
   - O plano de jogo 2D é dividido em células quadradas (`GRID_CELL_SIZE = 90`).
   - Consultas de colisão e busca de alvos próximos executam em complexidade **$O(1)$ amortizado**, testando apenas a célula atual e as 8 vizinhas imediatas, em vez de um algoritmo ingênuo $O(N^2)$.
   - Os índices da grade utilizam array unidimensional flat `row * width + col`.

2. **Object Pooling & Pre-warming:**
   - Pré-alocação e reutilização contínua de memória para:
     - Inimigos (`EnemyPool`)
     - Projéteis (`ProjectilePool`)
     - Coletáveis (`CollectiblePool`)
     - Partículas (`ParticlePool`)
     - Textos Flutuantes (`FloatingTextPool`)
     - Linhas de Ataque (`AttackLinePool`)
   - O pooling elimina coletas periódicas do **Garbage Collector (GC)** do navegador, prevenindo quedas bruscas de taxa de quadros (micro-stutters).
   - Rotinas de **Pre-warming** executam ciclos de `init()`, `update()` e `draw()` fora da tela na inicialização para aquecer o motor JIT do JavaScript.

3. **Colisões Inimigo-Inimigo Escalonadas:**
   - A resolução de sobreposição de corpos físicos entre inimigos é distribuída entre múltiplos quadros através de hash de identificação (`enemyCheckSlot`), suavizando o custo computacional por frame.

4. **Motor de Áudio Híbrido:**
   - **SFX Procedural:** Sons sintetizados em tempo real via **Web Audio API** usando osciladores (`OscillatorNode`) e curvas de atenuação de ganho lineares (`GainNode`), sem latência de decodificação de arquivo.
   - **BGM Stream:** Áudio em loop contínuo sincronizado com controles mestre de volume e mudo.

---

## 📈 Sistemas de Progressão e Meta-Game

- **Seleção de Especialização de Classe:** Durante a partida, o jogador pode evoluir seu personagem base ("Aprendiz") para classes especializadas:
  - ⚔️ **Espadachim:** Maior poder de destruição de curto alcance.
  - 🏹 **Arqueiro:** Projéteis de longo alcance com ampla visibilidade.
  - 🧙 **Mago:** Foco em projéteis adicionais e dispersão de disparos.
  - 🛡️ **Defensor:** Sobrevivência ampliada com pool massivo de vida.
  - 🗡️ **Assassino:** Especialista em dano crítico e golpes letais.
  - 💰 **Mercador:** Focado em coleta ampla de gemas e tesouros.
- **Loja Permanente (Meta-Upgrades):** Gemas coletadas persistem entre partidas no banco global para compra de melhorias definitivas de dano, vida, crítico, regeneração de SP e sorte.
- **Guarda-Roupa de Skins:** Múltiplas skins com traços passivos únicos (Tigre, Vaca, Porco, Sapo, Urso, Coelho, Cachorro, Macaco, e as skins premium Palhaço, Alien, Robô e Abóbora). Cada skin desbloqueada concede bônus passivo acumulativo de XP para todas as partidas futuras.
- **Códice & Conquistas:** Enciclopédia no jogo catalogando inimigos, armas e itens descobertos, além de dezenas de conquistas maestras desbloqueáveis.

---

## 🚀 Como Executar

### Opção 1: Jogar no Navegador (Local)
1. Clone o repositório ou baixe os arquivos:
   ```bash
   git clone https://github.com/JoaoAlkmim/bichos-e-ossos.git
   cd bichos-e-ossos
   ```
2. Abra o arquivo `index.html` em qualquer navegador web moderno (Google Chrome, Firefox, Edge, Opera, Safari).
3. *(Opcional / Recomendado)* Use uma extensão como o **Live Server** no VSCode ou inicie um servidor HTTP local:
   ```bash
   npx serve .
   # ou
   python -m http.server 8000
   ```

### Opção 2: GitHub Pages (Online)
O repositório está pronto para ser publicado diretamente no **GitHub Pages**:
1. No repositório no GitHub, vá em **Settings** > **Pages**.
2. Em **Build and deployment** > **Branch**, selecione `main` e a pasta `/ (root)`.
3. Clique em **Save**. O jogo estará acessível publicamente via link web!

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Canvas:** Renderização gráfica 2D em 60 FPS com buffer de contexto.
- **JavaScript Moderno (ES6+):** Classes nativas, arrow functions, modules e estruturas de dados otimizadas.
- **Web Audio API:** Geração procedural de ondas sonoras e envelopes de áudio.
- **TailwindCSS & CSS3:** Estilização de HUD, overlays dinâmicos, paleta pixel art e responsividade.
- **LocalStorage API:** Persistência local de dados de meta-progresso, histórico, conquistas e configurações.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---

*Desenvolvido com dedicação por [João Alkmim](https://github.com/JoaoAlkmim).*
