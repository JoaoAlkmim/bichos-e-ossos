# 🤝 Guia de Contribuição e Estudo — Bichos & Ossos

Seja muito bem-vindo ao projeto **Bichos & Ossos**! 🐯💀

Este é um projeto de código aberto, mantido com paixão para a comunidade. Seu objetivo é servir tanto como um jogo divertido quanto como um **recurso educacional prático e limpo** de desenvolvimento de jogos em HTML5 Canvas, física 2D e Web Audio API em JavaScript nativo (sem frameworks pesados).

---

## 🎯 Filosofia do Código

1. **Zero Build, Zero Config:** O jogo roda diretamente abrindo o `index.html` ou através de qualquer servidor HTTP simples.
2. **Alta Performance:** O jogo foi projetado para sustentar centenas de entidades a 60 FPS estáveis.
3. **Modularidade e Extensibilidade:** Adicionar novas armas, skins, classes e inimigos é feito de forma desacoplada através da API `GameRegistry`.

---

## 🛠️ Como Executar o Projeto Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/JoaoAlkmim/bichos-e-ossos.git
   cd bichos-e-ossos
   ```
2. Inicie qualquer servidor local de sua preferência:
   ```bash
   # Com Node.js:
   npx serve .
   
   # Com Python:
   python -m http.server 8000
   
   # Ou use a extensão 'Live Server' no VS Code
   ```
3. Acesse `http://localhost:8000` (ou a porta indicada) no seu navegador.

---

## 🗺️ Visão Geral da Arquitetura

O ciclo de vida do jogo é orquestrado no `main.js` através de um loop contínuo baseado em `requestAnimationFrame` com cálculo de delta time (`dt`):

```
       [Entrada do Jogador] (Mouse / Teclado)
                 │
                 ▼
       ┌────────────────────────┐
       │   gameLoop(dt) 60fps   │
       └────────────────────────┘
                 │
       ┌─────────┴──────────────┬────────────────────────┐
       ▼                        ▼                        ▼
[Atualização Física]     [SpatialGrid Update]    [Lógica de Combate]
- Player.update()        - Limpa células          - checkCollisions()
- Enemy.update()         - Insere entidades       - updatePassiveWeapons()
- Projectile.update()                             - Spawning & Hordas
       │                                                 │
       └────────────────────────┬────────────────────────┘
                                │
                                ▼
                       ┌────────────────┐
                       │   drawGame()   │  (Renderização no Canvas)
                       └────────────────┘
```

### Principais Arquivos:
- `definitions.js`: Constantes, atributos base e tabelas de dados mestras.
- `registry.js`: Sistema `GameRegistry` para registrar conteúdos customizados.
- `classes.js`: Classes com POO (`Player`, `Enemy`, `Projectile`, `SpatialGrid`, `Particle`).
- `logic.js`: Detecção de colisões espaciais e disparo de projéteis.
- `ui.js`: Gerenciamento do DOM, HUDs, menus e toasts de aprimoramento.
- `utils.js`: Helpers matemáticos, sintetizador de áudio procedural e salvamento local.

---

## 🚀 Guia de Modding: Criando Conteúdo com o `GameRegistry`

O jogo inclui o utilitário global `GameRegistry`, permitindo estender o jogo sem precisar modificar as regras centrais.

### 1. Como Criar uma Nova Arma Passiva (5 minutos)

Para registrar uma nova arma, basta chamar `GameRegistry.registerWeapon(id, definition, onFireHandler)`:

```javascript
GameRegistry.registerWeapon('bumerangueFogo', {
    name: 'Bumerangue de Fogo',
    emoji: '🪃',
    maxLevel: 5,
    stats: [
        { description: 'Lança 1 bumerangue incandescente (100% dano).', cooldown: 3.0, damage: 1.0, distance: 160 },
        { description: 'Dano aumentado para 120%. Cooldown -0.5s.', cooldown: 2.5, damage: 1.2, distance: 180 },
        { description: 'Lança 2 bumerangues.', cooldown: 2.5, damage: 1.2, distance: 190 },
        { description: 'Dano aumentado para 140%.', cooldown: 2.0, damage: 1.4, distance: 200 },
        { description: 'Lança 3 bumerangues perfurantes.', cooldown: 1.8, damage: 1.6, distance: 220 }
    ]
}, (weapon, stats, dt) => {
    // Exemplo de lógica de disparo
    playBeep(450, 0.1, 'sawtooth', 0.6); // Efeito sonoro sintetizado
    
    // Pega o projétil do pool
    const p = projectilePool.find(p => !p.isAlive);
    if (p) {
        const angle = Math.atan2(player.moveDirectionY || 0, player.moveDirectionX || 1);
        p.init(
            player.x, player.y, angle, 6,
            player.currentBaseDamage * stats.damage,
            '#ff5722', 14, true, 'NORMAL', 5, true, stats.distance
        );
        projectiles.push(p);
    }
});
```

A nova arma aparecerá automaticamente nas opções de **Level Up** e no **Códice**!

---

### 2. Como Criar uma Nova Skin Jogável

```javascript
GameRegistry.registerSkin({
    id: '🦊',
    name: 'Raposa Astuta',
    description: '<strong>Velocidade & Sagacidade:</strong> +20% Velocidade de Movimento e +10% Ganho de XP.',
    isPremium: false, // ou true para a loja premium
    onApply: (player) => {
        // Modifica atributos da instância do jogador
        player.moveSpeed *= 1.2;
        player.currentMoveSpeed *= 1.2;
        player.xpGainMultiplier += 0.10;
    }
});
```

A skin estará instantaneamente disponível na **Loja de Skins** do menu principal e concederá bônus permanente de XP ao ser desbloqueada.

---

### 3. Como Criar uma Nova Especialização de Classe (Nível 5)

```javascript
GameRegistry.registerClass({
    name: "Classe: Ilusionista",
    description: "Mestre dos reflexos. Inicia com um Clone Instável e +20% de Esquiva.",
    emoji: '🎭',
    apply: () => {
        player.addPassiveWeapon('cloneInstavel');
        player.dashInvulnBonus += 0.05;
        player.hasClass = true;
        player.className = "Ilusionista";
        player.classIcon = "🎭";
    },
    getContext: () => `<span class='text-purple-300'>ESPECIALISTA EM ILUSÃO</span>`
});
```

---

## ⚡ Regras de Ouro de Performance

Ao contribuir com código para o loop principal, siga estas diretrizes:

1. **Evite `new` dentro de loops:** Não crie novos objetos (`{}` ou `new Array()`) dentro do `update()` ou `draw()`. Reutilize instâncias existentes através dos pools (`projectilePool`, `enemyPool`, `particlePool`).
2. **Utilize o `SpatialGrid`:** Para encontrar inimigos próximos a uma posição, nunca itere pelo array global `enemies`. Use sempre:
   ```javascript
   const nearbyEnemies = spatialGrid.getNearby(x, y);
   ```
3. **Use Distância ao Quadrado:** Prefira `distanceSquared(x1, y1, x2, y2)` em vez de `distance()` para comparações de raio, economizando chamadas caras de `Math.sqrt`.

---

## 📬 Como Enviar sua Contribuição

1. Faça um **Fork** do repositório no GitHub.
2. Crie uma branch para sua funcionalidade:
   ```bash
   git checkout -b feature/nova-arma-bumerangue
   ```
3. Faça commit das suas alterações com mensagens claras:
   ```bash
   git commit -m "feat: adiciona nova arma bumerangue de fogo com GameRegistry"
   ```
4. Envie para o seu repositório remoto:
   ```bash
   git push origin feature/nova-arma-bumerangue
   ```
5. Abra um **Pull Request (PR)** explicando a novidade!

---

Agradecemos imensamente por ajudar a construir o universo de **Bichos & Ossos**! 🚀

