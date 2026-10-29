// main.js
        // --- Setup Firebase (Não está em uso, mantido para aderência/futuro) ---
        //import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        //import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        //import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Configuração do Firebase (pode ser preenchida por um script externo)
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        let db, auth, userId;
        let isAuthReady = false;
		
		//Variaveis de mouse para cursos custom
		let mouseX = 0;
        let mouseY = 0;
        let isMouseOnCanvas = false;
		
		//Ajuste forçado de fonte p/ se erro
		let computedFontName = 'sans-serif'; // Valor padrão caso algo falhe
		
		//Cor do BG padrão
		let cachedBgColor = '#1a1a2e'; // Valor padrão caso o CSS falhe
		
        // Objeto padrão para os upgrades permanentes
        let metaUpgrades = {
            totalGrapesBank: 0,
            bonusHp: 0,         // Nível de HP
            bonusDmg: 0,        // Nível de Dano
            bonusSpRegen: 0,    // Nível de Regen. SP
            bonusMoveSpeed: 0,  // Nível de Vel. Mov.
            bonusCritChance: 0, // Nível de Chance Crítica
            bonusCollectionRange: 0,
            startBonusPowerup: 0,
            startBonusReroll: 0,
            bonusBrindeChance: 0,
            bonusXPGain: 0,          // Nível de Ganho de XP
            bonusProjectiles: 0,       // Nível de Projéteis Bônus
            bonusSpecialDropChance: 0, // Nível de Chance de Drop Especial
            startDifficultyBonus: 0, // Nível de Dificuldade Bônus
            bonusLuck: 0,               // Nível de Sorte (Divertido)
			bonusGemologo: 0,            // Nível de Gemólogo
            
            // --- PROPRIEDADES DA LOJA DE SKINS ---
            unlockedSkins: ['🐯'], // Armazena os emojis das skins desbloqueadas
            selectedSkin: '🐯',   // O emoji da skin atualmente selecionada
            skinXpBonus: 0,       // Bônus de XP acumulado (0.05 por skin comprada)
            
            // --- NOVAS PROPRIEDADES (CÓDICE E CONQUISTAS) ---
            unlockedEnemies: [],      // IDs dos inimigos (ex: 'PADRAO')
            unlockedWeapons: [],      // IDs das armas (ex: 'auraDourada')
            unlockedItems: [],        // IDs dos itens (ex: 'Gema')
            unlockedAchievements: []  // IDs das conquistas (ex: 'PE_LEVE')
        };

        // Elementos da Loja (serão definidos no 'onload')
        // --- Variáveis da Loja Unificada ---
        let storeScreen, storeGrapesBankDisplay, metaUpgradeOptions,
            storeCloseBtn, openStoreBtn, openMetaStoreGameoverBtn,
            tabBtnMeta, tabBtnSkins, metaContent, skinContent,
            skinStoreOptions, skinXpBonusContainer, skinXpBonusDisplay,
            storeTitleText, resetMetaUpgradesBtn;
        
        // --- NOVOS ELEMENTOS (CÓDICE E CONQUISTAS) ---
        let codexScreen, openCodexBtn, codexCloseBtn, tabBtnEnemies, tabBtnWeapons, tabBtnItems,
            codexEnemiesContent, codexWeaponsContent, codexItemsContent,
            codexEnemiesGrid, codexWeaponsGrid, codexItemsGrid;
            
        let achievementsScreen, openAchievementsBtn, achievementsCloseBtn, achievementsList;

        /**
         * Carrega os upgrades salvos do localStorage.
         */
        function loadMetaUpgrades() {
            try {
                const savedData = localStorage.getItem(META_SAVE_KEY);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    // Mescla os dados salvos com o padrão (para o caso de novos upgrades/skins/códice)
                    metaUpgrades = { ...metaUpgrades, ...parsedData };
                    
                    // Garante que os arrays existam se o save for antigo
                    if (!metaUpgrades.unlockedSkins) metaUpgrades.unlockedSkins = ['🐯'];
                    if (!metaUpgrades.selectedSkin) metaUpgrades.selectedSkin = '🐯';
                    if (!metaUpgrades.skinXpBonus) metaUpgrades.skinXpBonus = 0;
                    
                    // --- Garante que os arrays de Códice/Conquistas existam ---
                    if (!metaUpgrades.unlockedEnemies) metaUpgrades.unlockedEnemies = [];
                    if (!metaUpgrades.unlockedWeapons) metaUpgrades.unlockedWeapons = [];
                    if (!metaUpgrades.unlockedItems) metaUpgrades.unlockedItems = [];
                    if (!metaUpgrades.unlockedAchievements) metaUpgrades.unlockedAchievements = [];
                    
                }
            } catch (e) {
                console.error("Falha ao carregar meta-upgrades:", e);
                // Reseta se os dados estiverem corrompidos
                localStorage.removeItem(META_SAVE_KEY);
            }
        }

        /**
         * Salva os upgrades atuais no localStorage.
         */
        function saveMetaUpgrades() {
            try {
                localStorage.setItem(META_SAVE_KEY, JSON.stringify(metaUpgrades));
            } catch (e) {
                console.error("Falha ao salvar meta-upgrades:", e);
            }
        }

        /**
         * Preenche a loja com as opções de upgrade.
         */
        function populateMetaUpgradeScreen() {
            // Garante que os dados estejam atualizados
            loadMetaUpgrades(); 
            
            // Usa o display de gemas unificado
            storeGrapesBankDisplay.textContent = metaUpgrades.totalGrapesBank;
            metaUpgradeOptions.innerHTML = ''; // Limpa opções antigas

            META_UPGRADE_LIST.forEach(upgrade => {
                const currentLevel = metaUpgrades[upgrade.id] || 0;
                const isMaxed = currentLevel >= upgrade.maxLevel;
                const cost = isMaxed ? 0 : upgrade.getCost(currentLevel);
                const canAfford = metaUpgrades.totalGrapesBank >= cost;

                const itemDiv = document.createElement('div');
                itemDiv.className = 'meta-upgrade-item';

                let buttonHTML;
                if (isMaxed) {
                    buttonHTML = `<button class="meta-upgrade-button maxed" disabled>MAX</button>`;
                } else {
                    // Adiciona 'data-upgrade-id' para o event listener
                    buttonHTML = `
                        <button 
                            class="meta-upgrade-button ${!canAfford ? 'disabled' : ''}" 
                            ${!canAfford ? 'disabled' : ''}
                            data-upgrade-id="${upgrade.id}"
                        >
                            Comprar ( ${cost} 💠 )
                        </button>
                    `;
                }

                itemDiv.innerHTML = `
                    <div class="meta-upgrade-info">
                        <h4>${upgrade.name}</h4>
                        <p>${upgrade.description}</p>
                        <p class="level">Nível: ${currentLevel} / ${upgrade.maxLevel}</p>
                    </div>
                    ${buttonHTML}
                `;
                metaUpgradeOptions.appendChild(itemDiv);
            });
        }

        // --- Variáveis Globais do Jogo ---
        
        // Elementos do Canvas
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        
        // --- Controle de Volume ---

        let masterVolume = 0.3; // Volume padrão
        let isMuted = false;

        
        // --- Controle de Movimento ---
        let controlScheme = 'mouse'; // 'mouse' ou 'wasd'

        let keysPressed = {}; // Para rastrear WASD

        // --- Elementos de UI dos Controles ---
        let setControlsMouseBtn, setControlsWasdBtn;
        let dashLabel, impactLabel, berserkLabel;
        let pauseControlsText;

        // Botões de Utilidade
        const pauseBtn = document.getElementById('pause-btn');
        
        // Elementos do HUD (para feedbacks visuais)
        const dmgDisplay = document.getElementById('dmg-display');
        const aspdDisplay = document.getElementById('aspd-display');
        const msDisplay = document.getElementById('ms-display');
        const xpBar = document.getElementById('xp-bar');
        const statusHud = document.getElementById('status-hud');
        const hpBarBg = document.getElementById('hp-bar-bg');
        const spBarBg = document.getElementById('sp-bar-bg');

        // Slots de Armas Passivas
        let passiveWeaponSlot1, passiveWeaponSlot2, passiveWeaponSlot3;
        
        // Botões de Habilidade
        const dashBtn = document.getElementById('dash-btn');
        const impactBtn = document.getElementById('impact-btn');
        const berserkBtn = document.getElementById('berserk-btn');
        
        // Cache para tooltips
        let dashTooltipText, impactTooltipText, berserkTooltipText;
        
        // Alerta de Inimigo Especial
        const specialEnemyAlert = document.getElementById('special-enemy-alert');
        const specialEnemyAlertText = document.getElementById('special-enemy-alert-text');
        
        // Elementos da Tela de Level Up
        let rerollBtn;
   
        // Container de Toasts (Brindes/Upgrades)
        const upgradeToastContainer = document.getElementById('upgrade-toast-container');
        
        // Elementos do Tutorial
        let tutorialTipScreen, tutorialTipTitle, tutorialTipText, tutorialTipCloseBtn;
        let hasSeenShooterTip = false;
        let hasSeenEliteTip = false;
        let hasSeenPadraoTip = false;
        let hasSeenGhostTip = false;
        let hasSeenZumbiTip = false;
        let hasSeenChefeTip = false;
        let hasSeenAranhaTip = false;
		let hasSeenZumbeteTip = false;

        let isFirstGame = true; // Flag de onboarding
        
        // --- Variáveis de Estado do Jogo ---
        let gameState = 'MENU'; // MENU, PLAYING, PAUSED, LEVEL_UP, LEVEL_UP_TRANSITION, GAME_OVER
        let lastTime = 0;
        let gameTime = 0; 
        let animationId = null; 

        // Timer de Hit-Stop
        let hitStopTimer = 0;

        // Temporizador para o flash de dano na tela
        let damageFlashTimer = 0; 

        // Nível de "tremor" da câmera
        let cameraShake = 0; 
             
        // Indicador visual da habilidade "Impacto"
        let impactIndicator = { active: false, duration: 0.1, timer: 0, x: 0, y: 0, radius: 100, color: 'orange' };
        
        // Indicador visual da arma "Aura Dourada"
		let auraIndicator = {
			active: false,
			timer: 0,      // Duração atual do efeito visual
			duration: 0.3, // Duração total do fade out (0.3s)
			x: 0, y: 0,    // Posição
			radius: 0,      // Raio (será definido pela arma)
            color: 'rgba(245, 189, 31, 0.7)' // Cor Padrão (Ouro)
		};
        
        // --- INDICADOR DE AURA ---
        // Indicador visual da arma "Bardo Amaldiçoado" (separado)
        let debuffAuraIndicator = { 
            active: false, 
            timer: 0, 
            duration: 0.3, 
            x: 0, y: 0, 
            radius: 0, 
            color: 'rgba(168, 85, 247, 0.7)' // Cor Padrão (Roxo)
        };
		
        // Indicador visual do alvo do ataque automático
        let currentTargetCoords = { x: null, y: null, duration: 0, timer: 0 }; 
        
        // Coordenadas do clique de movimento
        let movementTarget = { x: null, y: null, time: 0 };
        
        // --- Arrays de Entidades ---
        let dashTrail = []; // Rastro da habilidade "Dash" (APENAS ATIVOS)
        let particles = []; // Partículas de dano, morte, etc.
        let attackLines = []; // Linhas de ataque (normais e críticas) (APENAS ATIVOS)
        let enemies = [];
        let projectiles = [];
        let collectibles = []; 
        let groundEffects = [];
        let floatingTexts = []; // Textos flutuantes (dano, curas, etc.)

        // --- Obstáculos e Destrutíveis ---
        let obstacles = [];
        let destructibles = [];
        let freeRerolls = 0; // Para o meta-upgrade

        // --- Object Pools ---
        let particlePool = [];
        let floatingTextPool = [];
		let projectilePool = [];
        let attackLinePool = [];
        let dashTrailPool = [];
		
		// --- NOVOS POOLS (precisam ser definidos antes de initGame) ---
		let enemyPool = []; 
		let collectiblePool = [];

        // Pools de DOM (para conquistas e brindes)
        let achievementPool = [];

        let toastPool = [];
        
        // --- Cache do HUD ---
        let hudCache = {};
        
        // --- Spatial Grid ---
        let spatialGrid; // APENAS DECLARADO AQUI
        
        // --- Variáveis Globais de Jogo ---
        
        let player; // Será instanciado em initGame()
		
		// === VARIÁVEIS DO BACKGROUND ===
        let starLayers = [];
    
        // --- Variáveis de Lógica do Jogo ---
        let difficulty = 1.0; // Multiplicador de dificuldade
        let dpsValue = 0; // Valor de DPS exibido no HUD
        let damageHistory = []; // Histórico de dano para cálculo de DPS
        let enemySpawnTimer = 2.1; // Temporizador para próximo spawn de inimigo
        let defeatedCounterForElite = 0; // Contador para spawn de Elites
        let bossSpawnTimer = 180; // Timer para o Chefe (3 minutos)
        let lowHpSoundTimer = 0; // Timer para controlar o som de HP baixo

        let hordeTimer = HORDE_INTERVAL;
      
        function spawnParticles(x, y, count, color, minSize, maxSize, minVel, maxVel, lifetime) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * (maxVel - minVel) + minVel;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                const size = Math.random() * (maxSize - minSize) + minSize;
                
                // Pega do pool ou cria novo
                let p = particlePool.pop();
                if (p) {
                    p.init(x, y, color, size, vx, vy, lifetime);
                } else {
                    p = new Particle(x, y, color, size, vx, vy, lifetime);
                }
                particles.push(p);
            }
        }
        
        // --- Sistema de Linhas de Ataque (OTIMIZADO COM POOLING) ---
        function createAttackLine(x1, y1, x2, y2, isCrit) {
            let line = attackLinePool.pop(); // Pega do pool
            
            if (!line) {
                // Pool estourou, cria um novo (não será reciclado)
                line = {}; 
            }
            
            // Reseta o objeto
            line.x1 = x1;
            line.y1 = y1;
            line.x2 = x2;
            line.y2 = y2;
            line.duration = 0.15;
            line.color = isCrit ? 'yellow' : '#06f79a';
            line.lineWidth = isCrit ? 4 : 2;
            line.isCrit = isCrit;
            line.time = 0;
            
            attackLines.push(line); // Adiciona à lista ATIVA
        }

        // --- Funções Principais de Gerenciamento do Jogo ---    
        // Ajusta o tamanho do canvas à janela
        function resizeCanvas() {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            // Centraliza o jogador se for a primeira inicialização
            if (player && player.x === 0) {
                player.x = canvas.width / 2;
                player.y = canvas.height / 2;
            }
            // Recria a grade espacial com o novo tamanho (se já existir)
            if (spatialGrid) {
                 // Esta linha só existe para o redimensionamento durante o jogo (se a grid já foi criada em initGame)
                 spatialGrid = new SpatialGrid(canvas.width, canvas.height, GRID_CELL_SIZE); 
            }
        }

        // Reseta o estado do jogo para um novo jogo
   
		function initGame() {
            resizeCanvas(); 
            
            // --- NOVO TRECHO CRÍTICO: CRIAÇÃO DA GRADE ESPACIAL ---
            // Deve ser criada aqui, onde a classe SpatialGrid já foi definida.
            spatialGrid = new SpatialGrid(canvas.width, canvas.height, GRID_CELL_SIZE);
            
            // Limpa arrays de entidades ATIVAS
            dashTrail = []; 
            attackLines = [];
            enemies = [];
            projectiles = [];
            collectibles = [];
            groundEffects = [];
            obstacles = [];
            destructibles = [];
            particles = [];
            floatingTexts = [];
			playerClones = []; // Limpa o array de clones
            
			// --- NOVO: Pool de Inimigos ---
			enemyPool = []; 
			console.log(`Pré-populando e aquecendo ${INITIAL_ENEMY_POOL_SIZE} inimigos...`);
			for (let i = 0; i < INITIAL_ENEMY_POOL_SIZE; i++) {
				// Cria um inimigo 'PADRAO' e o coloca fora da tela
				const e = new Enemy(-1000, -1000, 'PADRAO', 1, 1.0); 
				e.isAlive = false; 
				enemyPool.push(e); 
			}
			console.log("Pool de inimigos pronto.");

			// --- NOVO: Pool de Coletáveis ---
			collectiblePool = []; 
			console.log(`Pré-populando e aquecendo ${INITIAL_COLLECTIBLE_POOL_SIZE} coletáveis...`);
			for (let i = 0; i < INITIAL_COLLECTIBLE_POOL_SIZE; i++) {
				// Cria um coletável 'XP_GEM' e o coloca fora da tela
				const c = new Collectible(-1000, -1000, 'XP_GEM'); 
				c.isCollected = true; // Marca como coletado/inativo
				collectiblePool.push(c); 
			}
			console.log("Pool de coletáveis pronto.");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		
			// --- Pool de Partículas ---
            particlePool = []; // Limpa
            const INITIAL_PARTICLE_POOL_SIZE = 10000; // <--- EDITE ESTE NÚMERO SE QUISER
			console.log(`Pré-populando e aquecendo ${INITIAL_PARTICLE_POOL_SIZE} partículas...`);
            for (let i = 0; i < INITIAL_PARTICLE_POOL_SIZE; i++) {
                // Cria uma partícula com valores padrão
                const p = new Particle(0, 0, 'white', 1, 0, 0, 0.1);

                // --- PRE-WARMING ---
                p.x = -1000; // Fora da tela
                p.y = -1000;
                p.update(0.016); // Chama update
                p.draw();        // Chama draw

                p.isAlive = false; // Marca como inativa para o pool
                particlePool.push(p); // Adiciona ao pool
            }
            console.log("Pool de partículas pronto.");
            // Limpa qualquer "lixo" que o p.draw() possa ter deixado
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // --- Pool de Texto Flutuante ---
            floatingTextPool = []; // Limpa
            const INITIAL_FTEXT_POOL_SIZE = 100; // Ajuste se necessário
            for (let i = 0; i < INITIAL_FTEXT_POOL_SIZE; i++) {
                 // Cria um objeto simples para o pool de texto
                 const ft = {
                    x: 0, y: 0, text: '', type: '',
                    time: 0, duration: 1,
                    vx: 0, vy: 0, isAlive: false // Importante marcar como inativo
                };
                floatingTextPool.push(ft);
            }
			// Pool de Projéteis (da otimização anterior)
			projectilePool = [];
			const INITIAL_PROJECTILE_POOL_SIZE = 10000;
			console.log(`Pré-populando e aquecendo ${INITIAL_PROJECTILE_POOL_SIZE} projéteis...`); // Adicionado log
			for (let i = 0; i < INITIAL_PROJECTILE_POOL_SIZE; i++) {
				const p = new Projectile(0, 0, 0, 0, 0, 'red', 10, false, 'NORMAL', 0, false, 0); // <-- MODIFICADO (Arma 2)

				// --- INÍCIO DO PRE-WARMING ---
				p.x = -1000;
				p.y = -1000;

				// === Aquecer init() ===
                // *** init() agora aceita `pierce` ***
				p.init(-1000, -1000, 0, 5, 1, 'red', 10, false, 'NORMAL', 0, false, 0); // <-- MODIFICADO (Arma 2)

				p.update(0.016);
				p.draw();

				// === Aquecer interação com SpatialGrid ===
				// Insere temporariamente para aquecer as funções da grid
				spatialGrid.insert(p);

				p.isAlive = false;
				projectilePool.push(p);
			}
			// === Limpar a grid APÓS o loop de aquecimento ===
			spatialGrid.clear();
			console.log("Pool de projéteis pronto."); // Adicionado log
			// Limpa qualquer "lixo" que o p.draw() possa ter deixado no canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Pré-popula o pool de Linhas de Ataque
            attackLinePool = [];
			console.log(`Pré-populando ${ATTACK_LINE_POOL_SIZE} linhas de ataque...`);
            for (let i = 0; i < ATTACK_LINE_POOL_SIZE; i++) {
                attackLinePool.push({
                    x1: 0, y1: 0, x2: 0, y2: 0,
                    time: 0, duration: 0.15, isCrit: false, color: 'white', lineWidth: 2
                });
            }
            console.log("Pool de linhas de ataque pronto.");
            // Pré-popula o pool de Rastro do Dash
            dashTrailPool = [];
            for (let i = 0; i < DASH_TRAIL_POOL_SIZE; i++) {
                dashTrailPool.push({
                    x: 0, y: 0, time: 0, duration: 0.1, size: 20
                });
            }

            // Pré-popula os pools de DOM
            achievementPool = [];
            for (let i = 0; i < ACHIEVEMENT_POOL_SIZE; i++) {
                const div = document.createElement('div');
                div.className = 'achievement';
                achievementPool.push(div);
            }

            toastPool = [];
            for (let i = 0; i < TOAST_POOL_SIZE; i++) {
                const div = document.createElement('div');
                div.className = 'upgrade-toast';
                toastPool.push(div);
            }

            // Reseta controles e movimento
            movementTarget.x = null;
            movementTarget.y = null;
            keysPressed = {}; // Reseta teclas pressionadas

            // Reseta variáveis de estado
            difficulty = 1.0;

            // --- Carrega Metaprogressão e Instancia o Jogador ---
            loadMetaUpgrades(); // Carrega os dados salvos (incluindo skins)
            player = new Player(metaUpgrades); // Instancia o jogador COM os bônus E a skin

            // Reseta variáveis de estado (após aplicar bônus)
            gameTime = 0;
            dpsValue = 0;
            damageHistory = [];
            enemySpawnTimer = 2.1;
            defeatedCounterForElite = 0;
            bossSpawnTimer = 180;
            hordeTimer = HORDE_INTERVAL;
            currentTargetCoords.x = null;
            currentTargetCoords.y = null;
            damageFlashTimer = 0;
            cameraShake = 0;

            // Reseta flags de tutorial
            hasSeenShooterTip = false;
            hasSeenEliteTip = false;
            hasSeenPadraoTip = false;
            hasSeenGhostTip = false;
            hasSeenZumbiTip = false;
            hasSeenChefeTip = false;
            hasSeenAranhaTip = false;
			hasSeenZumbeteTip = false;

            // --- Resetar Conquistas ---
			// --- RESET NOVAS CONQUISTAS ---
            canGetReacaoEmCadeia = true;
            canGetPontoFraco = true;
            daggerCritStreak = 0;
            canGetDetonacaoFungica = true;
            canGetMultiplicacaoCelular = true;

            canGetArmaPavioCurto = true;
            canGetArmaAdagaCerteira = true;
            canGetArmaEsporosExplosivos = true;
            canGetArmaCloneInstavel = true;
            // --- FIM RESET ---
            // Contadores
            killsDuringBerserk = 0;
            consecutiveCrits = 0;
            grapesCollectedInWindow = 0;
            grapeCollectionTimer = 0;
            killsWithMaxSP = 0;
            zumbiKillTimer = 0;
            zumbiKillsInWindow = 0;
            shootersDefeatedInRow = 0;
            wasHitByProjectile = false;

            // --- Contadores de Conquista ---
            destructiblesDestroyed = 0;
            gemsCollectedThisGame = 0;
            powerupsCollectedThisGame = 0;
            bossesKilledThisGame = 0;

            // Flags de conquistas Early-game
            canGetEsquivaPerfeita = true;
            canGetPorUmFio = true;
            canGetComboPerfeito = true;
            canGetReservaDePoder = true;
            canGetCaçadorSelvagem = true;
            canGetExterminadorHordas = true;
            canGetIntocavel = true;
            canGetPeLeve = true;
            canGetMaratonista = true;
            canGetImprudente = true;
            canGetEconomista = true;
            hasUsedSP = false;
            // Mid-game
            canGetEspecialista = true;
            canGetDestruidor = true;
            canGetDefensorDaHorda = true;
			canGetColecionadorAvido = true;
            canGetSortudo = true;
            // End-game
            canGetMestreDeClasse = true;
            canGetInvencivel = true;
            canGetDeusDaGuerra = true;
            canGetCeifador = true;
            canGetCarrasco = true;
            // Novas Flags de Armas
            canGetArmaAuraDourada = true;
            canGetArmaGarrasAfiadas = true;
            canGetArmaOrbeArcano = true;
            canGetArmaCometaCadente = true;
            canGetArmaChaoConsagrado = true;
            canGetArmaPulsoCinetico = true;
            canGetArmaEspinhosTraseiros = true;
            canGetArmaVarinhaMagica = true;
            canGetArmaCoringaSelvagem = true;
            canGetArmaPresaRetornavel = true;
            canGetArmaBardo = true;
            canGetArmaLaminas = true;
            canGetArmaAlquimista = true;
            canGetArmaJogador = true;
            canGetArmaLenhador = true;
            canGetArmaHemomante = true;

            // Conquista de uso
            canGetRetornoCerteiro = true;

            canGetPrecisaoLetal = true; // Adicionando a flag que faltava
            canGetCacadorElite = true;  // Adicionando a flag que faltava

            // Reseta o combo tracker (que agora está no player)
            player.comboTimer = 0;
            player.comboTracker = { q: false, w: false, e: false };

            // Reseta feedbacks visuais
            document.getElementById('game-container').classList.remove('berserk-active');
            document.getElementById('game-container').classList.remove('game-level-up');
            statusHud.classList.remove('low-hp-pulse');
            spBarBg.classList.remove('low-sp-pulse');
            hpBarBg.classList.remove('hp-full-glow');
            spBarBg.classList.remove('sp-full-glow');
            impactIndicator.active = false;
            // --- Resetar indicador de debuff ---
            debuffAuraIndicator.active = false;

            spatialGrid.clear();

            // Popula o mapa
            for(let i = 0; i < 5; i++) {
                const x = Math.random() * canvas.width * 0.8 + (canvas.width * 0.1);
                const y = Math.random() * canvas.height * 0.8 + (canvas.height * 0.1);
                if (distanceSquared(x, y, player.x, player.y) > 150*150) {
                    obstacles.push(new Obstacle(x, y, 30, Math.random() < 0.5 ? '⚰️' : '🪨'));
                }
            }
            for(let i = 0; i < 10; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                 if (distanceSquared(x, y, player.x, player.y) > 100*100) {
                    destructibles.push(new Destructible(x, y, 20, Math.random() < 0.5 ? '🏺' : '🏺', 50 * difficulty));
                 }
            }

			// === GERA AS CAMADAS DE ESTRELAS ===
            starLayers = []; // Limpa camadas antigas
            const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--main-bg');
            const goldColor = getComputedStyle(document.documentElement).getPropertyValue('--action-color');

            // Camada 1: Distante, lenta, muitas estrelas (brancas/lavanda)
            let layer1 = { stars: [], parallax: 0.1, color: '#f0f0f8', size: 1 };
            for (let i = 0; i < 400; i++) {
                layer1.stars.push({
                    x: Math.random() * STAR_WORLD_SIZE,
                    y: Math.random() * STAR_WORLD_SIZE
                });
            }
            starLayers.push(layer1);

            // Camada 2: Média, velocidade média (brancas/lavanda)
            let layer2 = { stars: [], parallax: 0.2, color: '#f0f0f8', size: 1.5 };
            for (let i = 0; i < 200; i++) {
                layer2.stars.push({
                    x: Math.random() * STAR_WORLD_SIZE,
                    y: Math.random() * STAR_WORLD_SIZE
                });
            }
            starLayers.push(layer2);

            // Camada 3: Próxima, "rápida", estrelas douradas (temático)
            let layer3 = { stars: [], parallax: 0.4, color: goldColor, size: 1.5 };
            for (let i = 0; i < 100; i++) {
                layer3.stars.push({
                    x: Math.random() * STAR_WORLD_SIZE,
                    y: Math.random() * STAR_WORLD_SIZE
                });
            }
            starLayers.push(layer3);
            // =======================================

            hudCache = {};

            hudCache.weapon1 = null; // Cache para slot 1 de arma
            hudCache.weapon2 = null; // Cache para slot 2 de arma
			hudCache.weapon3 = null; // Cache para slot 3 de arma

            // Limpa explicitamente os slots de armas passivas no HUD ao iniciar a partida
            if (passiveWeaponSlot1) { // Verifica se os elementos existem
                passiveWeaponSlot1.innerHTML = '<span class="tooltip-text"></span>'; // --- Garante que o span do tooltip exista
                passiveWeaponSlot1.style.borderColor = `var(--hud-border)`;
            }
            if (passiveWeaponSlot2) {
                passiveWeaponSlot2.innerHTML = '<span class="tooltip-text"></span>'; // --- Garante que o span do tooltip exista
                passiveWeaponSlot2.style.borderColor = `var(--hud-border)`;
            }
			if (passiveWeaponSlot3) {
				passiveWeaponSlot3.innerHTML = '<span class="tooltip-text"></span>'; // --- Garante que o span do tooltip exista
				passiveWeaponSlot3.style.borderColor = `var(--hud-border)`;
			}
        }

        // Inicia o loop do jogo
        function startGame() {
            document.getElementById('start-screen').classList.remove('visible');
            document.getElementById('game-over-screen').classList.remove('visible');
            document.getElementById('game-container').classList.remove('game-level-up');

			// ---> Reiniciar e Tocar BGM <---
			const bgmAudioRef = document.getElementById('bgm-audio');
			if (bgmAudioRef) {
				bgmAudioRef.currentTime = 0; // Reinicia a música do início
				if (!isMuted) { // Só toca se não estiver mudo
					bgmAudioRef.play().catch(e => console.error("Erro ao tocar BGM Gameplay:", e));
				}
			}

            gameState = 'PLAYING';
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);

            // Mostra tutorial no primeiro jogo
            if (isFirstGame) {
                isFirstGame = false;
                setTimeout(() => {
                    if (gameState === 'PLAYING') {
                        // Tutorial dinâmico baseado no modo de controle
                        const moveText = (controlScheme === 'wasd')
                            ? "Mova-se com **WASD**."
                            : "Mova-se **clicando** no mapa.";
                        const abilityText = (controlScheme === 'wasd')
                            ? "Use **Shift, Q, E** para habilidades e **T** para Brindes."
                            : "Use **Q, W, E** para habilidades e **T** para Brindes.";

                        showTutorialTip("Controles Básicos",
                            `${moveText}<br>Seu ${player.skin} ataca automaticamente.<br>${abilityText} **P** pausa o jogo.`
                        );
                    }
                }, 2000);
            }

            // Atualiza texto dos botões
            pauseBtn.textContent = 'PAUSAR';
            // Atualiza o texto de TODOS os botões de tela cheia
            const text = document.fullscreenElement ? 'SAIR T. CHEIA' : 'TELA CHEIA';
            // document.getElementById('fullscreen-btn').textContent = text; // REMOVIDO
            document.getElementById('fullscreen-btn-settings').textContent = text;
        }

        // Encerra o jogo e mostra a tela de Game Over
        function gameOver() {
			// Som de "Falha" (Tom Menor descendente)
            playBeep(200, 0.3, 'sawtooth', 1.0);
            setTimeout(() => playBeep(180, 0.2, 'sawtooth', 0.9), 100);
            setTimeout(() => playBeep(160, 0.4, 'sawtooth', 0.8), 200);

            gameState = 'GAME_OVER';
            cancelAnimationFrame(animationId);
            document.getElementById('final-score').textContent = player.enemiesDefeated;

            // Salva as Gemas no banco
            loadMetaUpgrades();
            metaUpgrades.totalGrapesBank += player.grapes;
            saveMetaUpgrades();
            document.getElementById('game-over-grapes-bank').textContent = metaUpgrades.totalGrapesBank;

            // Stats na Tela de Game Over
            document.getElementById('game-over-stats-time').textContent = hudCache.time || '00:00';
            document.getElementById('game-over-stats-defeated').textContent = player.enemiesDefeated;
            document.getElementById('game-over-stats-level').textContent = player.level;
            document.getElementById('game-over-stats-difficulty').textContent = `${(difficulty * 100).toFixed(1)}%`;

            const gameOverScreen = document.getElementById('game-over-screen');
            gameOverScreen.classList.add('visible');
            document.getElementById('game-container').classList.add('game-level-up');
        }

        // Alterna o estado de Pausa
        function togglePause(forcedState = null) {
            // Não permite pausar se o tutorial estiver ativo ou em outra tela
            // Checa a loja, códice e conquistas
            if (gameState === 'LEVEL_UP' || gameState === 'GAME_OVER' || gameState === 'MENU' ||
                tutorialTipScreen.classList.contains('visible') ||
                document.getElementById('settings-screen').classList.contains('visible') ||
                storeScreen.classList.contains('visible') ||
                codexScreen.classList.contains('visible') ||
                achievementsScreen.classList.contains('visible')) {
                return;
            }

			const gameContainer = document.getElementById('game-container');

            // Força um estado (usado pelo tutorial) ou alterna
            if (forcedState !== null) {
                gameState = forcedState ? 'PAUSED' : 'PLAYING';
            } else {
                gameState = gameState === 'PAUSED' ? 'PLAYING' : 'PAUSED';
            }

            const isPaused = gameState === 'PAUSED';
			const bgmAudioRef = document.getElementById('bgm-audio'); // Pega a referência

            // Adiciona som de transição
            if (isPaused) {
                playBeep(500, 0.1, 'sine', 0.4);
            } else {
                playBeep(400, 0.1, 'sine', 0.4);
            }

			// ---> Pausar/Retomar BGM <---
			if (bgmAudioRef) { // Se o elemento de áudio existe
				if (isPaused) {
					bgmAudioRef.pause(); // Pausa a música
				} else {
					// Só toca se NÃO estiver mudo
					if (!isMuted) {
						bgmAudioRef.play().catch(e => console.error("Erro ao retomar BGM:", e)); // Retoma a música
					}
				}
			}

            const pauseScreen = document.getElementById('pause-screen');

            pauseScreen.classList.toggle('visible', isPaused);
            pauseBtn.textContent = isPaused ? 'RETORNAR' : 'PAUSAR';

			gameContainer.classList.toggle('game-paused', isPaused);

            // Stats na Pausa
            if (isPaused) {
                document.getElementById('pause-stats-time').textContent = hudCache.time || '00:00';
                document.getElementById('pause-stats-defeated').textContent = player.enemiesDefeated;
                document.getElementById('pause-stats-grapes').textContent = player.grapes;
                document.getElementById('pause-stats-dps').textContent = dpsValue.toFixed(1);
                document.getElementById('pause-stats-level').textContent = player.level;
            }

            // Se está voltando a jogar, reinicia o loop
            if (!isPaused && gameState === 'PLAYING') {
                lastTime = performance.now();
                requestAnimationFrame(gameLoop);
            }
        }

        // Aplica o efeito de um aprimoramento selecionado
        // Esta função agora é um wrapper para o método do player
        function applyUpgrade(upgrade) {
            player.applyUpgrade(upgrade);
        }

        // Mostra o "Toast" (notificação) de brinde (OTIMIZADO COM POOLING)
        function showUpgradeToast(upgrade) {
              const div = toastPool.pop(); // Pega do pool
              if (!div) return; // Pool esgotado, ignora

              // Limpa classes antigas (importante para pooling de DOM)
              div.className = 'upgrade-toast';

              // Define um emoji com base na categoria
              let emoji = '✨';
              if (upgrade.category === 'ofensivo') emoji = '💥';
              else if (upgrade.category === 'defensivo') emoji = '❤️';
              else if (upgrade.category === 'utilidade') emoji = '👟';
              else if (upgrade.category === 'critico') emoji = '🎯';
              else if (upgrade.category === 'especial') emoji = '📈';
              else if (upgrade.category === 'arma') emoji = upgrade.emoji || '⚔️';

              div.innerHTML = `${emoji} BRINDE! ${upgrade.name}`;
              div.classList.add(`category-${upgrade.category || 'default'}`);

              upgradeToastContainer.appendChild(div);

              // Animação de entrada
              setTimeout(() => div.classList.add('show'), 50);

              const DURATION = 3000; // 3 segundos

              // Animação de saída e remoção
              setTimeout(() => {
                div.classList.remove('show');
                div.classList.add('hide');
                setTimeout(() => {
                    div.remove(); // Remove do DOM
                    toastPool.push(div); // Devolve ao pool
                }, 400);
              }, DURATION);
        }

        /**
         * Gera as opções de CLASSE na tela de Level Up
         */
        function generateClassOptions() {
            const optionsContainer = document.getElementById('upgrade-options');
            optionsContainer.innerHTML = ''; // Limpa opções antigas

            const titleEl = document.getElementById('level-up-screen').querySelector('h1');
            const skipBtn = document.getElementById('skip-upgrade-button');

            CLASS_UPGRADES.forEach(upgrade => {
                const div = document.createElement('div');

                const category = upgrade.category || 'default';
                const categoryName = UPGRADE_CATEGORY_NAMES[category] || 'BÔNUS';
                const emoji = upgrade.emoji || '✨';

                div.className = `upgrade-option hover:shadow-lg category-${category}`;

                // Pega o texto de contexto dinâmico
                const contextText = upgrade.getContext ? upgrade.getContext() : "";

                div.innerHTML = `
                    <span class="upgrade-category-tag tag-${category}">${categoryName}</span>
                    <p class="text-lg font-bold text-white">${emoji} ${upgrade.name}</p>
                    <p class="text-sm text-gray-300 mt-2 px-2">
                        ${upgrade.description}
                        <br><span class="text-sm text-yellow-300">${contextText}</span>
                    </p>
                `;

                // Define o clique para aplicar a CLASSE
                div.onclick = () => {
                    playBeep(800, 0.1, 'square', 0.8); // Som de seleção

                    player.applyUpgrade(upgrade); // Usa o método do player

                    player.level++;
                    player.xp = 0;
                    player.xpNeeded = getXPNeeded(player.level);

                    document.getElementById('level-up-screen').classList.remove('visible');

                    // Reseta a UI para o próximo level up padrão
                    titleEl.textContent = 'NOVO NÍVEL! Escolha um Aprimoramento:';
                    if (rerollBtn) rerollBtn.style.display = '';
                    skipBtn.style.display = '';

                    document.getElementById('game-container').classList.remove('game-level-up');

                    // Retoma o jogo
                    gameState = 'PLAYING';
                    lastTime = performance.now();
                    requestAnimationFrame(gameLoop);
                };
                optionsContainer.appendChild(div);
            });
        }

        // --- Funções de Dano e Habilidades ---

        /**
         * Verifica se uma habilidade pode ser usada.
         * @param {number} cost - O custo de SP da habilidade.
         * @param {number} cooldown - O timer de cooldown atual da habilidade.
         * @returns {boolean} - True se a habilidade puder ser usada.
         */
        function canUseAbility(cost, cooldown) {
            return player.sp >= cost && cooldown <= 0;
        }

        // Retorna o texto de feedback para tooltips dinâmicos
        function getAbilityFeedbackText(cost, cooldown, maxCd) {
            if (cooldown > 0) {
                return `<span class="text-red-400">CD: Próximo uso em ${cooldown.toFixed(1)}s</span>`;
            }
            if (player.sp < cost) {
                return `<span class="text-red-400">SP: Não há SP suficiente (Faltam ${Math.round(cost - player.sp)})</span>`;
            }
            return ''; // Cache será usado
        }

        // --- Game Loop Principal ---
        
        // === Sistema de Conquistas ===
        const achievementContainer = document.getElementById('achievement-container');
        let activeAchievements = [];
        let enemiesWithoutDamage = 0;
        let consecutiveUpgrades = 0;
        let lastHp = 100;
        let killsDuringBerserk = 0; 
        let consecutiveCrits = 0;   
        let grapesCollectedInWindow = 0; 
        let grapeCollectionTimer = 0;    
        let killsWithMaxSP = 0;
        let zumbiKillTimer = 0;
        let zumbiKillsInWindow = 0;
        let shootersDefeatedInRow = 0;
        let wasHitByProjectile = false;     
        // --- Contadores de Conquista ---
        let destructiblesDestroyed = 0;
        let gemsCollectedThisGame = 0;
        let powerupsCollectedThisGame = 0;
        let bossesKilledThisGame = 0;
		// Atividades
        let canGetEsquivaPerfeita = true;
        let canGetPorUmFio = true;
        let canGetComboPerfeito = true;
        let canGetReservaDePoder = true;
        let canGetCaçadorSelvagem = true;
        let canGetExterminadorHordas = true;
        let canGetIntocavel = true;
        let canGetPeLeve = true;
        let canGetMaratonista = true;
        let canGetImprudente = true;
        let canGetEconomista = true;
        let hasUsedSP = false;
		let canGetFuriaIncontrolavel = true;
        // Mid-game
        let canGetEspecialista = true;
        let canGetDestruidor = true;
        let canGetDefensorDaHorda = true;
        let canGetColecionadorAvido = true;
        let canGetSortudo = true;
        // End-game
        let canGetMestreDeClasse = true;
        let canGetInvencivel = true;
        let canGetDeusDaGuerra = true;
        let canGetCeifador = true;
        let canGetCarrasco = true;
        // Novas Flags de Armas
        let canGetArmaAuraDourada = true;
        let canGetArmaGarrasAfiadas = true;
        let canGetArmaOrbeArcano = true;
        let canGetArmaCometaCadente = true;
        let canGetArmaChaoConsagrado = true;
        let canGetArmaPulsoCinetico = true;
        let canGetArmaEspinhosTraseiros = true;
        let canGetArmaVarinhaMagica = true;
        let canGetArmaCoringaSelvagem = true;
        let canGetArmaPresaRetornavel = true;
        let canGetArmaBardo = true;
        let canGetArmaLaminas = true;
        let canGetArmaAlquimista = true;
        let canGetArmaJogador = true;
        let canGetArmaLenhador = true;
        let canGetArmaHemomante = true;   
        // Conquista de uso
        let canGetRetornoCerteiro = true;      
        // Outras Flags
        let canGetPrecisaoLetal = true;
        let canGetImpactoMassivo = true;
        let canGetCacadorElite = true;
		// --- NOVAS FLAGS/CONTADORES DE CONQUISTA ---
        let canGetReacaoEmCadeia = true;
        let canGetPontoFraco = true;
        let daggerCritStreak = 0; // Contador para Ponto Fraço
        let canGetDetonacaoFungica = true;
        let canGetMultiplicacaoCelular = true;

        let canGetArmaPavioCurto = true;
        let canGetArmaAdagaCerteira = true;
        let canGetArmaEsporosExplosivos = true;
        let canGetArmaCloneInstavel = true;
		
// O coração do jogo, executado a cada frame
function gameLoop(currentTime) {
    // Para o loop se o jogo não estiver em 'PLAYING'
    if (gameState !== 'PLAYING') {
        // Se estiver na transição de Level Up, congela o jogo mas continua desenhando.
        if (gameState === 'LEVEL_UP_TRANSITION') {
            animationId = requestAnimationFrame(gameLoop);
            drawGame();
            updateHUDs(0);
            return;
        }

        if (gameState === 'PAUSED') {
            updateHUDs(); // Continua atualizando HUDs na pausa para cooldowns visuais
        }
        return;
    }

    animationId = requestAnimationFrame(gameLoop);

    // Lógica do Hit-Stop
    if (hitStopTimer > 0) {
        hitStopTimer -= (currentTime - lastTime);
        lastTime = currentTime;
        // Desenha o frame atual congelado durante o hit-stop
        drawGame();
        updateHUDs(0); // Atualiza HUD sem delta time
        return;
    }

    const deltaTime = Math.min(0.05, (currentTime - lastTime) / 1000); // Limita o deltaTime para evitar saltos
    lastTime = currentTime;

    gameTime += deltaTime;
    difficulty += deltaTime * 0.012;

    updateDPS();

    // --- Atualiza Cooldowns e Buffs ---
    player.attackTimer = Math.max(0, player.attackTimer - deltaTime);
    player.dashCooldown = Math.max(0, player.dashCooldown - deltaTime);
    player.impactCooldown = Math.max(0, player.impactCooldown - deltaTime);
    player.berserkCooldown = Math.max(0, player.berserkCooldown - deltaTime);
    damageFlashTimer = Math.max(0, damageFlashTimer - deltaTime);
    lowHpSoundTimer = Math.max(0, lowHpSoundTimer - deltaTime);

    // *** ATUALIZA ARMAS PASSIVAS ***
    updatePassiveWeapons(deltaTime);

    // Timers de Coletáveis Especiais
    if (player.magnetTimer > 0) {
        player.magnetTimer -= deltaTime;
        if (player.magnetTimer <= 0) {
            player.isMagnetActive = false;
        }
    }
    if (player.lightningTimer > 0) {
        player.lightningTimer -= deltaTime;
        if (player.lightningTimer <= 0) {
            player.isLightningActive = false;
        }
    }

    // Timer de Lentidão (Slow)
    if (player.slowTimer > 0) {
        player.slowTimer -= deltaTime;
        if (player.slowTimer <= 0) {
            player.isSlowed = false;
        }
    }

    // Cooldowns (Aprimoramentos / Conquistas)
    player.reacaoAdrenalCooldown = Math.max(0, player.reacaoAdrenalCooldown - deltaTime);

    // Combo Timer (Conquista)
    if (player.comboTimer > 0) {
        player.comboTimer -= deltaTime;
        if (player.comboTimer <= 0) {
            player.comboTracker = { q: false, w: false, e: false };
        }
    }
    // Zumbi Kill Timer (Conquista)
    if (zumbiKillTimer > 0) {
        zumbiKillTimer -= deltaTime;
        if (zumbiKillTimer <= 0) {
            zumbiKillsInWindow = 0;
        }
    }

    // Buffs Dinâmicos (Foco Total)
    let focoBuff = 1.0;
    if (player.focoTotalBonus > 0 && player.sp === player.maxSp) {
        focoBuff += player.focoTotalBonus;
    }

    // Recalcula stats (considerando Berserk e Foco Total)
    if (player.isBerserk) {
        player.currentAttackSpeed = (player.attackSpeed * 3) * focoBuff;
        player.currentBaseDamage = (player.baseDamage * 1.6) * focoBuff;
    } else {
        player.currentAttackSpeed = player.attackSpeed * focoBuff;
        player.currentBaseDamage = player.baseDamage * focoBuff;
    }

    // Camera Shake Decay
    if (cameraShake > 0) {
        cameraShake = Math.max(0, cameraShake - deltaTime * 10);
    }

    // CONQUISTA: Colheita Rápida Timer
    if (grapeCollectionTimer > 0) {
        grapeCollectionTimer -= deltaTime;
        if (grapeCollectionTimer <= 0) {
            grapesCollectedInWindow = 0;
        }
    }

    // Regeneração de SP
    player.sp = Math.min(player.maxSp, player.sp + player.spRegen * deltaTime);

    // Duração do Berserk
    if (player.isBerserk) {
        player.berserkDuration -= deltaTime;
        if (player.berserkDuration <= 0) {
            player.isBerserk = false;
            document.getElementById('game-container').classList.remove('berserk-active');

            // Reseta a velocidade de movimento (considerando Reação Adrenal)
            if (player.isReacaoAdrenalActive) {
                player.currentMoveSpeed = player.moveSpeed * (1.0 + player.reacaoAdrenalMoveSpeedBuff); // Corrigido 'this' para 'player'
            } else {
                player.currentMoveSpeed = player.moveSpeed;
            }

            // CONQUISTA: Fúria Incontrolável
            if (killsDuringBerserk >= 15 && canGetFuriaIncontrolavel) {
                showAchievement("👹 Fúria Incontrolável! 15+ abates durante o Berserk!", 0.10, 3, 'FURIA_INCONTROLAVEL');
                canGetFuriaIncontrolavel = false;
            }
            killsDuringBerserk = 0; // Reseta contador após Berserk
        }
    }

    // Duração Reação Adrenal
    if (player.isReacaoAdrenalActive) {
        player.reacaoAdrenalTimer -= deltaTime;
        if (player.reacaoAdrenalTimer <= 0) {
            player.isReacaoAdrenalActive = false;
            // Só reseta a velocidade se o Berserk NÃO estiver ativo
            if (!player.isBerserk) {
                player.currentMoveSpeed = player.moveSpeed;
            }
        }
    }

    // Duração do indicador visual do Impacto
    if (impactIndicator.active) {
        impactIndicator.timer -= deltaTime;
        if (impactIndicator.timer <= 0) {
            impactIndicator.active = false;
        }
    }

    // Duração do indicador visual da aura dourada
    if (auraIndicator.active) {
        auraIndicator.timer -= deltaTime;
        if (auraIndicator.timer <= 0) {
            auraIndicator.active = false;
        }
    }

    // --- Atualiza aura de debuff ---
    if (debuffAuraIndicator.active) {
        debuffAuraIndicator.timer -= deltaTime;
        if (debuffAuraIndicator.timer <= 0) {
            debuffAuraIndicator.active = false;
        }
    }

    // Duração do indicador visual do alvo de ataque
    if (currentTargetCoords.timer > 0) {
        currentTargetCoords.timer -= deltaTime;
    } else {
        currentTargetCoords.x = null;
        currentTargetCoords.y = null;
    }

    // --- Atualiza Entidades ---

    // Atualiza e recicla partículas
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(deltaTime);
        if (!p.isAlive) {
            particles.splice(i, 1);
            // Devolve ao pool apenas se não estiver cheio
            if (particlePool.length < 100000) { // Usa o tamanho definido em initGame
                particlePool.push(p);
            }
        }
    }

    // Atualiza e recicla linhas de ataque
    for (let i = attackLines.length - 1; i >= 0; i--) {
        const line = attackLines[i];
        line.time += deltaTime;
        if (line.time >= line.duration) {
            attackLines.splice(i, 1);
            if (attackLinePool.length < ATTACK_LINE_POOL_SIZE) {
                 attackLinePool.push(line);
            }
        }
    }

    // Lógica de Movimento do Jogador (baseado em clique OU wasd)
    let dx = 0, dy = 0;
    const wasDashing = player.dashDuration > 0; // Verifica ANTES de decrementar dashDuration

    // --- Suporte a Controles Touch (Joystick) e Gamepad via InputManager ---
    let inputVector = { dx: 0, dy: 0, isOverriding: false };
    if (typeof InputManager !== 'undefined') {
        InputManager.pollGamepad();
        inputVector = InputManager.getMovementVector();
    }

    if (inputVector.isOverriding) {
        dx = inputVector.dx;
        dy = inputVector.dy;
        movementTarget.x = null;
        movementTarget.y = null;
    } else if (controlScheme === 'wasd') {
        // Normaliza WASD para evitar movimento diagonal mais rápido
        let moveX = 0;
        let moveY = 0;
        if (keysPressed['w']) moveY -= 1;
        if (keysPressed['s']) moveY += 1;
        if (keysPressed['a']) moveX -= 1;
        if (keysPressed['d']) moveX += 1;

        if (moveX !== 0 || moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            dx = moveX / length;
            dy = moveY / length;
        } else {
            dx = 0;
            dy = 0;
        }
        movementTarget.x = null; // Garante que o clique seja ignorado
        movementTarget.y = null;
    } else { // 'mouse'
        if (movementTarget.x !== null) {
            const distToTargetSq = distanceSquared(player.x, player.y, movementTarget.x, movementTarget.y);
            // Ajusta a distância mínima para parar (evita tremer no destino)
            const stopDistanceSq = (player.currentMoveSpeed * deltaTime * 1.5) ** 2; // Um pouco maior que 1 frame

            if (distToTargetSq > stopDistanceSq) {
                const angle = Math.atan2(movementTarget.y - player.y, movementTarget.x - player.x);
                dx = Math.cos(angle);
                dy = Math.sin(angle);
            } else {
                // Chegou perto o suficiente, para
                player.x = movementTarget.x;
                player.y = movementTarget.y;
                movementTarget.x = null;
                movementTarget.y = null;
                dx = 0; // Para de registrar movimento
                dy = 0;
            }
        } else {
             dx = 0; // Sem clique, sem movimento
             dy = 0;
        }
    }

    // Aplica o movimento
    if (dx !== 0 || dy !== 0) {
        let currentSpeed = wasDashing ? player.currentMoveSpeed * 6 : player.currentMoveSpeed;

        if (player.isSlowed) {
            currentSpeed *= 0.5;
        }

        // Movimento já está normalizado
        player.x += dx * currentSpeed * deltaTime * 60;
        player.y += dy * currentSpeed * deltaTime * 60;
    }

    // Atualiza a direção do movimento para armas direcionais
    if (dx !== 0 || dy !== 0) {
        player.moveDirectionX = dx;
        player.moveDirectionY = dy;
    } // Se parado, mantém a última direção registrada

    // Limita o jogador às bordas do canvas
    player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, player.x));
    player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, player.y));

    // Colisão do Jogador com Obstáculo
    checkEntityObstacleCollision(player);

    // Atualiza o rastro do Dash (com pooling)
    if (wasDashing) {
        // Cria rastro apenas se estiver se movendo
        if (dx !== 0 || dy !== 0) {
             let trail = dashTrailPool.pop();
             if (trail) {
                 trail.x = player.x;
                 trail.y = player.y;
                 trail.time = 0;
                 trail.duration = 0.1 * player.dashDistanceMultiplier;
                 trail.size = player.size;
                 dashTrail.push(trail);
             }
        }

        player.dashDuration -= deltaTime; // Decrementa a duração do dash AQUI

        // Lógica da "Aterrissagem Impactante" (Só acontece QUANDO o dash ACABA)
        if (player.aterrissagemImpactanteMultiplier > 0 && player.dashDuration <= 0) {
            playBeep(200, 0.1, 'sawtooth', 0.8);
            spawnParticles(player.x, player.y, 10, 'rgba(255, 255, 255, 0.7)', 4, 8, 5, 12, 0.5);

            const nearbyEnemies = spatialGrid.getNearby(player.x, player.y);
            const shockwaveRadius = 75;
            const shockwaveRadiusSq = shockwaveRadius * shockwaveRadius;
            const shockwaveBaseDamage = (player.baseDamage * player.aterrissagemImpactanteMultiplier) * player.getDynamicDamageMultiplier();

            nearbyEnemies.forEach(target => {
                // Verifica se é um alvo válido (tem takeDamage e está vivo) E dentro do raio
                if (typeof target.takeDamage === 'function' && target.isAlive && distanceSquared(player.x, player.y, target.x, target.y) < shockwaveRadiusSq) {

                    let finalShockwaveDamage = shockwaveBaseDamage;
                    // Aplica Abate apenas em inimigos (target.type)
                    if (target.type && (target.hp / target.maxHp < player.abateThreshold)) {
                        finalShockwaveDamage *= 1.5;
                    }

                    target.takeDamage(finalShockwaveDamage, false); // Causa o dano

                    // Gatilho OnHit apenas para inimigos
                    if (target.type) {
                        player.triggerOnHitEffects();
                    }
                }
            });
        }
    }

    // Atualiza e recicla o rastro do dash
    for (let i = dashTrail.length - 1; i >= 0; i--) {
        const trail = dashTrail[i];
        trail.time += deltaTime;
        if (trail.time >= trail.duration) {
            const removedTrail = dashTrail.splice(i, 1)[0];
            if (dashTrailPool.length < DASH_TRAIL_POOL_SIZE) {
                dashTrailPool.push(removedTrail);
            }
        }
    }

    // --- Atualiza Outras Entidades ---
    // Limpa a grade e atualiza inimigos
    spatialGrid.clear();
    enemies.forEach(enemy => {
        enemy.update(deltaTime);
        if (enemy.isAlive) {
            spatialGrid.insert(enemy);
        }
    });

    // Adiciona destrutíveis à grade
    destructibles.forEach(d => {
        if (d.isAlive) {
            spatialGrid.insert(d);
        }
    });

    // Loop único para atualizar, checar limites e reciclar projéteis
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.update(deltaTime);
        // Verifica se saiu MUITO da tela para reciclar
        const margin = 100; // Margem maior para projéteis que retornam
        const isOutOfBounds = p.x < -margin || p.x > canvas.width + margin || p.y < -margin || p.y > canvas.height + margin;

        if (!p.isAlive || isOutOfBounds) {
            if (isOutOfBounds && p.isAlive) { // Só spawna partículas se estava vivo
                spawnParticles(p.x, p.y, 3, p.color, 2, 4, 1, 2, 0.3);
            }
            projectiles.splice(i, 1);
            // Devolve ao pool apenas se não estiver cheio
            if (projectilePool.length < INITIAL_PROJECTILE_POOL_SIZE) {
                 projectilePool.push(p);
            }
        } else {
            spatialGrid.insert(p); // Insere projéteis vivos na grade
        }
    }

    // --- DEVOLUÇÃO DE INIMIGOS AO POOL (Usando loop reverso e splice) ---
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!e.isAlive) {
            // DEVOLVE AO POOL (se o pool não estiver cheio)
            if (enemyPool.length < INITIAL_ENEMY_POOL_SIZE) {
                // Não precisa resetar aqui, o init() faz isso ao pegar do pool
                enemyPool.push(e);
            }
            enemies.splice(i, 1); // Remove o inimigo do array 'enemies' na posição 'i'
        }
    }


    // Atualiza coletáveis (atração magnética)
    collectibles.forEach(c => c.update(deltaTime));

    // Atualiza e filtra efeitos de chão
    groundEffects.forEach(g => g.update(deltaTime));
    groundEffects = groundEffects.filter(g => g.isAlive); // Filter aqui é ok, são poucos

    // Remove destrutíveis mortos (Filter ok, são poucos)
    destructibles = destructibles.filter(d => d.isAlive);

    // --- Lógica de Spawn de Inimigos ---
    enemySpawnTimer -= deltaTime;
    if (enemySpawnTimer <= 0) {
        // Aumenta a chance de Atirador/Aranha com o tempo
        const shooterChance = Math.min(0.4, 0.1 + gameTime / 300); // Começa em 10%, vai até 40%
        const spiderChance = gameTime > 180 ? Math.min(0.2, (gameTime - 180) / 300) : 0; // Aranha a partir de 3min, até 20%
        const ghostChance = 0.05 + Math.min(0.1, gameTime / 600); // Fantasma raro, chance aumenta lentamente

        let type;
        const randomRoll = Math.random();
        if (randomRoll < ghostChance) {
             type = 'GHOST';
        } else if (randomRoll < ghostChance + spiderChance) {
            type = 'ARANHA';
        } else if (randomRoll < ghostChance + spiderChance + shooterChance) {
            type = 'ATIRADOR';
        } else {
            type = 'PADRAO';
        }

        spawnEnemy(type);
        // Diminui o tempo de spawn com o tempo e dificuldade
        enemySpawnTimer = Math.max(0.3, 2.1 / (1 + (gameTime / 60) * 0.2) / Math.sqrt(difficulty));
    }
    // Lógica Spawn Elite (mantida)
    if (defeatedCounterForElite == 5) {
        spawnEnemy('GHOST'); // Primeiro 'mini-elite' é um Ghost
        defeatedCounterForElite = 6; // Incrementa para não spawnar de novo imediatamente
    }
    if (defeatedCounterForElite >= 11) { // Ajuste: >= 11 para garantir 5 + 5
        spawnEnemy('ELITE');
        defeatedCounterForElite = 0; // Reseta após spawnar Elite
    }

    // Lógica de Spawn do Chefe
    bossSpawnTimer -= deltaTime;
    if (bossSpawnTimer <= 0) {
        spawnEnemy('CHEFE');
        bossSpawnTimer = 180 * (1 + bossesKilledThisGame * 0.5); // Aumenta tempo entre chefes
    }

    // --- Lógica de Hordas ---
    hordeTimer -= deltaTime;
    if (hordeTimer <= 0) {
        spawnHorde();
        hordeTimer = HORDE_INTERVAL * (1 + gameTime / 300); // Hordas ficam um pouco mais espaçadas com o tempo
    }

    // --- Lógica de Ataque Automático ---
    if (player.attackTimer <= 0) {
        const potentialTargets = spatialGrid.getNearby(player.x, player.y);
        const currentAttackRange = BASE_ATTACK_RANGE * player.attackRangeMultiplier;
        const attackRangeSq = currentAttackRange * currentAttackRange;

        // Encontra todos os alvos VÁLIDOS (com takeDamage) no alcance
        const allTargetsInRange = potentialTargets
            .filter(e => typeof e.takeDamage === 'function' && e.isAlive) // Filtra apenas alvos válidos e vivos
            .map(target => {
                const distSq = distanceSquared(player.x, player.y, target.x, target.y);
                return { target, distSq };
            })
            .filter(item => item.distSq < attackRangeSq) // Filtra pelo alcance
            .sort((a, b) => a.distSq - b.distSq); // Ordena pelo mais próximo

        const numTargetsToHit = 1 + player.extraTargets; // Quantos alvos acertar
        const targetsToHit = allTargetsInRange.slice(0, numTargetsToHit); // Pega os N mais próximos

        if (targetsToHit.length > 0) {
            targetsToHit.forEach((targetData, index) => {
                const target = targetData.target;
                const isCrit = Math.random() < player.critChance;
                let finalDamage = (isCrit
                    ? player.currentBaseDamage * player.critDamageMultiplier
                    : player.currentBaseDamage) * player.getDynamicDamageMultiplier(); // Aplica Fúria

                // Aplica Abate (Execute) apenas para Inimigos (target.type)
                if (target.type && target.hp / target.maxHp < player.abateThreshold) {
                    finalDamage *= 1.5;
                }

                target.takeDamage(finalDamage, isCrit); // Aplica o dano ao alvo

                // Gatilho OnHit (Vampiro/Bruxo) apenas para Inimigos
                if (target.type) {
                    player.triggerOnHitEffects();
                }

                // Cria a linha de ataque visual
                createAttackLine(player.x, player.y, target.x, target.y, isCrit);

                // Marca o alvo principal para o indicador visual
                if (index === 0) {
                    currentTargetCoords.x = target.x;
                    currentTargetCoords.y = target.y;
                    currentTargetCoords.timer = 0.1; // Duração do indicador
                }

                // Lógica do Raio (Ataque em Cadeia - Item Especial ⚡)
                if (index === 0 && player.isLightningActive) {
                    // Encontra candidatos para o raio (vivos, válidos, não já atingidos, no alcance)
                    const lightningTargetCandidates = potentialTargets
                        .filter(entity =>
                            entity.isAlive &&
                            typeof entity.takeDamage === 'function' &&
                            entity !== target && // Não pode ser o alvo principal
                            !targetsToHit.some(th => th.target === entity) && // Não pode ser um dos outros alvos múltiplos
                            distanceSquared(player.x, player.y, entity.x, entity.y) < attackRangeSq // Precisa estar no alcance original
                        );

                    // Pega um alvo aleatório dos candidatos
                    const lightningTarget = lightningTargetCandidates.length > 0
                        ? lightningTargetCandidates[Math.floor(Math.random() * lightningTargetCandidates.length)]
                        : null;

                    if (lightningTarget) {
                        // Calcula o dano do raio (mesma lógica do ataque principal)
                        let lightningDamage = (isCrit
                            ? player.currentBaseDamage * player.critDamageMultiplier
                            : player.currentBaseDamage) * player.getDynamicDamageMultiplier();

                        // Aplica Abate no alvo do raio
                        if (lightningTarget.type && (lightningTarget.hp / lightningTarget.maxHp < player.abateThreshold)) {
                            lightningDamage *= 1.5;
                        }

                        lightningTarget.takeDamage(lightningDamage, isCrit); // Causa dano no alvo do raio

                        // Gatilho OnHit para o alvo do raio
                        if (lightningTarget.type) {
                            player.triggerOnHitEffects();
                        }

                        // Efeitos visuais do raio
                        playBeep(900, 0.05, 'sine', 0.5);
                        spawnParticles(lightningTarget.x, lightningTarget.y, 10, 'rgba(0, 150, 255, 0.8)', 2, 4, 3, 7, 0.3);
                        createAttackLine(target.x, target.y, lightningTarget.x, lightningTarget.y, false); // Linha do alvo principal para o alvo do raio
                    }
                }
            });

            // Reseta o timer de ataque
            player.attackTimer = 1 / player.currentAttackSpeed;
        }
    }

    // --- ATUALIZA CLONES ---
    for (let i = playerClones.length - 1; i >= 0; i--) {
        const clone = playerClones[i];
        clone.update(deltaTime);
        if (!clone.isAlive) {
            playerClones.splice(i, 1);
            // Poderíamos devolver ao pool aqui se tivéssemos um pool de clones
        }
    }
    // --- FIM ATUALIZA CLONES ---

    checkCollisions(); // Verifica colisões DO JOGADOR (vs Coletáveis, Inimigos, Projéteis Inimigos)

   // --- NOVA LÓGICA: Colisão Projétil Amigável vs Alvos (Inimigo/Destrutível) ---
   // Itera sobre todos os alvos potenciais (inimigos E destrutíveis vivos)
   const allTargets = [...enemies, ...destructibles]; // Combina os arrays

   allTargets.forEach(target => {
       if (!target.isAlive) return; // Pula alvos mortos

       // Pega entidades próximas AO ALVO
       const nearbyEntities = spatialGrid.getNearby(target.x, target.y);

       nearbyEntities.forEach(entity => {
           // Verifica se a entidade próxima é um projétil amigável e vivo
           if (entity.angle !== undefined && entity.isFriendly && entity.isAlive) {
               const projectile = entity;
               const targetCollisionRadiusSq = (projectile.size / 2 + target.size / 2) ** 2;

               // Verifica a colisão
               if (distanceSquared(projectile.x, projectile.y, target.x, target.y) < targetCollisionRadiusSq) {

                   // --- LÓGICA DE COLISÃO DA BOMBA ---
                   if (projectile.projectileType === 'BOMB') {
                       if (!projectile.explodedThisFrame) { // Evita explodir múltiplas vezes no mesmo frame
                           projectile.explodeBomb();
                           projectile.isAlive = false;
                           projectile.explodedThisFrame = true; // Marca como explodida
                           // Limpa a flag no próximo frame (ou na reciclagem do pool)
                           setTimeout(() => { if(projectile) projectile.explodedThisFrame = false; }, 0); // Adiciona verificação se projétil ainda existe
                       }
                       return; // Para o processamento deste projétil para este alvo
                   }
                   // --- FIM LÓGICA DA BOMBA ---

                   // Evita que um projétil já 'morto' (sem pierce restante) acerte outro alvo no mesmo frame
                   if (projectile.pierceCount >= projectile.maxPierce && projectile.maxPierce > 0) {
                        return; // Já usou toda a perfuração neste frame
                   }

                   let finalDamage = projectile.damage;
                   let isCrit = false;

                   // Lógica JOKER
                   if (projectile.projectileType === 'JOKER' && projectile.jokerStats) {
                       const stats = projectile.jokerStats;
                       const roll = Math.random();
                       if (roll < 0.33) { finalDamage *= stats.critMult; isCrit = true; showFloatingText(target.x, target.y - 15, 'CRÍTICO! 🃏', 'crit'); }
                       else if (roll < 0.66) { finalDamage *= stats.weakMult; showFloatingText(target.x, target.y - 15, 'Fraco... 🃏', 'normal'); }
                       else { if (target.type) { target.stunTimer = Math.max(target.stunTimer, stats.stunDuration); } showFloatingText(target.x, target.y - 15, 'STUN! 🃏', 'crit'); }
                       target.takeDamage(finalDamage, isCrit);
                   }
                   // Lógica DICE
                   else if (projectile.projectileType === 'DICE' && projectile.diceStats) {
                        const stats = projectile.diceStats;
                        const roll = Math.floor(Math.random() * 6) + 1;
                        let hitDamage = projectile.damage;
                        let isHitCrit = false;
                        const stunDuration = stats.level === 1 ? 1.0 : (stats.level === 2 ? 1.5 : 2.0);
                        const aoeRadius = stats.level === 1 ? 50 : (stats.level === 2 ? 60 : 70);
                        const aoeDamageMult = stats.level === 1 ? 0.5 : (stats.level === 2 ? 0.75 : 1.0);
                        const critMult = stats.level === 1 ? 3.0 : (stats.level === 2 ? 3.5 : 4.0);
                        const executeThreshold = stats.level === 1 ? 0.20 : (stats.level === 2 ? 0.25 : 0.30);
                        switch(roll) {
                            case 1: hitDamage *= 0.1; showFloatingText(target.x, target.y - 15, '🎲 Falha! (1)', 'normal'); break;
                            case 2: if (target.type) { target.stunTimer = Math.max(target.stunTimer, stunDuration); } showFloatingText(target.x, target.y - 15, `🎲 Stun! (2)`, 'crit'); break;
                            case 3: if (target.type) { target.applySlow(3.0); } showFloatingText(target.x, target.y - 15, `🎲 Lento! (3)`, 'crit'); break;
                            case 4: const explosionDmg = hitDamage * aoeDamageMult; const explosionRadiusSq = aoeRadius * aoeRadius;
                                    spatialGrid.getNearby(target.x, target.y).forEach(otherTarget => {
                                        if (otherTarget !== target && otherTarget.isAlive && typeof otherTarget.takeDamage === 'function' && distanceSquared(target.x, target.y, otherTarget.x, otherTarget.y) < explosionRadiusSq) {
                                            otherTarget.takeDamage(explosionDmg, false); }});
                                    spawnParticles(target.x, target.y, 5, 'rgba(255, 165, 0, 0.8)', 2, 4, 3, 7, 0.4); showFloatingText(target.x, target.y - 15, `🎲 Área! (4)`, 'crit'); break;
                            case 5: hitDamage *= critMult; isHitCrit = true; showFloatingText(target.x, target.y - 15, `🎲 Crítico! (5)`, 'crit'); break;
                            case 6: if (target.type && (target.hp / target.maxHp) < executeThreshold) { hitDamage *= 10; isHitCrit = true; showFloatingText(target.x, target.y - 15, `🎲 EXECUTAR! (6)`, 'crit'); }
                                    else { hitDamage *= 1.5; showFloatingText(target.x, target.y - 15, `🎲 Sorte! (6)`, 'crit'); } break;
                        }
                        target.takeDamage(hitDamage, isHitCrit);
                   }
                   // Lógica Padrão/Outras Armas
                   else {
                       // Lógica de Crítico (incluindo Adaga)
                        if (projectile.projectileType === 'DAGGER') {
                            const finalCritChance = Math.min(1.0, player.critChance + projectile.daggerCritChance);
                            isCrit = Math.random() < finalCritChance;
                            if (isCrit) {
                                const finalCritMultiplier = player.critDamageMultiplier + projectile.daggerCritDamage;
                                finalDamage *= finalCritMultiplier;
                                daggerCritStreak++;
                                if (daggerCritStreak >= 3 && canGetPontoFraco) { showAchievement('🏆 Ponto Fraco! 3 Crits seguidos com Adaga!', 0.05, 3, 'PONTO_FRACO'); canGetPontoFraco = false; daggerCritStreak = 0; }
                            } else { daggerCritStreak = 0; }
                        } else {
                            isCrit = Math.random() < player.critChance;
                            if (isCrit) { finalDamage *= player.critDamageMultiplier; }
                            daggerCritStreak = 0;
                        }
                       if (projectile.isBoomerang) { projectile.hitCount++; }
                       target.takeDamage(finalDamage, isCrit);
                   }

                   // Lógica de Perfuração
                   if (projectile.maxPierce > 0) {
                       projectile.pierceCount++;
                       if (projectile.pierceCount >= projectile.maxPierce) {
                           projectile.isAlive = false;
                           spawnParticles(projectile.x, projectile.y, 3, projectile.color, 2, 4, 1, 2, 0.3);
                       }
                   } else {
                       projectile.isAlive = false;
                       spawnParticles(projectile.x, projectile.y, 3, projectile.color, 2, 4, 1, 2, 0.3);
                   }
               } // Fim if (colisão)
           } // Fim if (é projétil amigo vivo)
       }); // Fim forEach nearbyEntities
   }); // Fim forEach allTargets
   // --- FIM DA NOVA LÓGICA DE COLISÃO ---


    // Verifica se subiu de nível
    if (player.xp >= player.xpNeeded) {
        levelUp(); // Chama a função levelUp que agora tem o delay e transição
    }

    // Atualiza e recicla textos flutuantes
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const text = floatingTexts[i];
        text.time += deltaTime;
        text.x += text.vx * deltaTime; // Movimento mais suave
        text.y += text.vy * deltaTime; // Movimento mais suave
        text.vy += 20 * deltaTime; // Gravidade mais suave

        if (text.time >= text.duration) {
            text.isAlive = false;
            floatingTexts.splice(i, 1);
            // Devolve ao pool apenas se não estiver cheio
            if (floatingTextPool.length < 100) { // Usa o tamanho definido em initGame
                 floatingTextPool.push(text);
            }
        }
    }

    // --- CONQUISTA: MULTIPLICAÇÃO CELULAR ---
    if (canGetMultiplicacaoCelular && playerClones.length >= 3) {
        showAchievement('🏆 Multiplicação Celular! 3+ Clones ativos!', 0.05, 3, 'MULTIPLICACAO_CELULAR');
        canGetMultiplicacaoCelular = false;
    }
    // --- FIM CONQUISTA ---

    drawGame(); // Desenha o estado atual do jogo
    checkAchievements(); // Verifica se alguma conquista foi alcançada
    updateHUDs(deltaTime); // Atualiza os elementos da interface do usuário
} // Fim da função gameLoop

        // Helper para Coleta Dinâmica (Imã)
        function getDynamicCollectionRange() {
            // Esta função foi movida para ser um método da classe Player: player.getDynamicCollectionRange()
            // Mas é chamada por Collectible.update(), então precisa acessar a instância global do player.
            if (!player) return COLLECTION_RANGE; // Guarda de segurança
            return player.getDynamicCollectionRange();
        }

        // --- Funções de Desenho (Canvas) ---

		// Desenha o fundo estrelado com parallax
        function drawStarfieldBackground() {
            // Pega a cor de fundo direto das variáveis CSS
            const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--main-bg') || '#1a1a2e';

            // 1. Limpa a tela com a cor de fundo
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Calcula a posição da "câmera" (centro da tela)
            // O fundo se moverá oposto ao jogador
            const camX = player.x - canvas.width / 2;
            const camY = player.y - canvas.height / 2;

            ctx.save();

            // 3. Desenha cada camada de estrela
            starLayers.forEach(layer => {
                ctx.fillStyle = layer.color;

                layer.stars.forEach(star => {
                    // Calcula a posição da estrela com parallax
                    // Usamos % (módulo) para fazer as estrelas "darem a volta" (wrap around)
                    let starX = (star.x - camX * layer.parallax) % STAR_WORLD_SIZE;
                    let starY = (star.y - camY * layer.parallax) % STAR_WORLD_SIZE;

                    // Ajusta o módulo para números negativos
                    if (starX < 0) starX += STAR_WORLD_SIZE;
                    if (starY < 0) starY += STAR_WORLD_SIZE;

                    // Só desenha se estiver dentro da tela (otimização leve)
                    if (starX >= 0 && starX <= canvas.width && starY >= 0 && starY <= canvas.height) {
                         ctx.fillRect(starX, starY, layer.size, layer.size);
                    }
                });
            });

            ctx.restore();
        }
		
		// Adicione essas variáveis globais se ainda não tiver adicionado
		let backgroundFrameCount = 0;
		const BACKGROUND_UPDATE_INTERVAL = 2; // as estrelas são recalculadas após X frames (2~3 para dar efeito de bling/pisca) aumentar o numero melhora a performance mas aumenta efeito flicker se o fps estiver baixo.
		
		// Função principal de desenho, chamada a cada frame
        function drawGame() {
            // Aplica o tremor de câmera
            let offsetX = 0;
            let offsetY = 0;
            if (cameraShake > 0) {
                offsetX = (Math.random() - 0.5) * cameraShake * 2;
                offsetY = (Math.random() - 0.5) * cameraShake * 2;
            }


			// Preenche o fundo com a cor sólida ANTES de aplicar o shake
			ctx.fillStyle = cachedBgColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.save();
			ctx.translate(offsetX, offsetY); // Aplica o shake a tudo que vem depois

			backgroundFrameCount++;
			// Desenha o fundo estrelado (que inclui seu próprio fillRect roxo + estrelas)
			// APENAS se o contador for múltiplo do intervalo
			if (backgroundFrameCount % BACKGROUND_UPDATE_INTERVAL === 0) {
				// Nota: drawStarfieldBackground também faz um fillRect roxo,
				// então ele vai desenhar por cima do fillRect anterior neste frame.
				drawStarfieldBackground(ctx, player.x, player.y);
			}

            // 2. Desenha Obstáculos e Destrutíveis (com Culling)
            obstacles.forEach(o => {
                if (o.x + o.size / 2 > 0 && o.x - o.size / 2 < canvas.width &&
                    o.y + o.size / 2 > 0 && o.y - o.size / 2 < canvas.height)
                {
                    o.draw();
                }
            });
            destructibles.forEach(d => {
                 if (d.x + d.size / 2 > 0 && d.x - d.size / 2 < canvas.width &&
                     d.y + d.size / 2 > 0 && d.y - d.size / 2 < canvas.height)
                 {
                    d.draw();
                 }
            });

            // 3. Raio de Ataque/Visão
            const currentAttackRange = BASE_ATTACK_RANGE * player.attackRangeMultiplier;
            ctx.save();
            const animatedHue = (gameTime * 5) % 360;
            const color = `hsla(${animatedHue}, 100%, 50%, 0.1)`;
            ctx.beginPath();
            ctx.arc(player.x, player.y, currentAttackRange, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.restore();

            // 4. Raio de Coleta
            const currentCollectionRange = player.getDynamicCollectionRange();
            ctx.save();
            ctx.beginPath();
            ctx.arc(player.x, player.y, currentCollectionRange, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();
            if (player.isMagnetActive) {
                ctx.fillStyle = `rgba(250, 204, 21, ${0.1 + Math.sin(gameTime * 10) * 0.05})`;
                ctx.fill();
            }
            ctx.restore();

            // --- DESENHA LINHAS DE VELOCIDADE (DASH STREAKS) ---
			if (player.dashDuration > 0) {
				const numStreaks = 8;
				const streakLength = Math.max(canvas.width, canvas.height) * 0.6;
				const baseAlpha = 0.3;
				const initialDashDuration = 0.1 * player.dashDistanceMultiplier;
				const dashProgress = player.dashDuration / initialDashDuration;
				const currentAlpha = baseAlpha * dashProgress * dashProgress;
				let angle = Math.atan2(player.moveDirectionY, player.moveDirectionX) + Math.PI;
				if (player.moveDirectionX === 0 && player.moveDirectionY === 0) {
					angle = Math.random() * Math.PI * 2;
				}
				const cosAngle = Math.cos(angle);
				const sinAngle = Math.sin(angle);
				ctx.save();
				ctx.lineWidth = 2;
				ctx.strokeStyle = `rgba(200, 220, 255, ${currentAlpha})`;
				ctx.shadowColor = 'cyan';
				ctx.shadowBlur = 5;
				for (let i = 0; i < numStreaks; i++) {
					const perpendicularAngle = angle + Math.PI / 2;
					const spreadDistance = (Math.random() - 0.5) * canvas.width * 1.5;
					const startOffsetX = Math.cos(perpendicularAngle) * spreadDistance;
					const startOffsetY = Math.sin(perpendicularAngle) * spreadDistance;
					const startDist = streakLength * 1.5;
					const startX = player.x + cosAngle * startDist + startOffsetX;
					const startY = player.y + sinAngle * startDist + startOffsetY;
					const endX = startX - cosAngle * streakLength;
					const endY = startY - sinAngle * streakLength;
					ctx.beginPath();
					ctx.moveTo(startX, startY);
					ctx.lineTo(endX, endY);
					ctx.stroke();
				}
				ctx.restore();
			}

            // 5. Feixes de Ataque
            attackLines.forEach(line => {
                const alpha = 1 - (line.time / line.duration);
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = line.color;
                ctx.lineWidth = line.lineWidth;
                if (line.isCrit) {
                    ctx.shadowColor = line.color;
                    ctx.shadowBlur = 10;
                }
                ctx.beginPath();
                ctx.moveTo(line.x1, line.y1);
                ctx.lineTo(line.x2, line.y2);
                ctx.stroke();
                ctx.restore();
            });

            // 6. Linha de alvo (Raio de Foco)
            if (currentTargetCoords.timer > 0) {
                const goldColor = getComputedStyle(document.documentElement).getPropertyValue('--action-color') || '#f5bd1f';
                const textColor = getComputedStyle(document.body).color || '#f0f0f8';
                ctx.save();
                const alpha = (currentTargetCoords.timer / 0.1) * 0.8;
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = textColor;
                ctx.lineWidth = 1;
                ctx.shadowColor = goldColor;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(player.x, player.y);
                ctx.lineTo(currentTargetCoords.x, currentTargetCoords.y);
                ctx.stroke();
                ctx.restore();
            }

            // 7. Indicador de destino (clique)
            if (controlScheme === 'mouse' && movementTarget.x !== null) {
                const goldColor = getComputedStyle(document.documentElement).getPropertyValue('--action-color') || '#f5bd1f';
                const clickAge = gameTime - movementTarget.time;
                const PING_DURATION = 0.4;
                if (clickAge < PING_DURATION) {
                    const pingProgress = clickAge / PING_DURATION;
                    const pingRadius = 5 + (pingProgress * 25);
                    const pingOpacity = 1.0 - pingProgress;
                    ctx.save();
                    ctx.translate(movementTarget.x, movementTarget.y);
                    ctx.strokeStyle = goldColor;
                    ctx.shadowColor = goldColor;
                    ctx.shadowBlur = 8;
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = pingOpacity;
                    ctx.beginPath();
                    ctx.arc(0, 0, pingRadius, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.save();
                ctx.translate(movementTarget.x, movementTarget.y);
                ctx.strokeStyle = goldColor;
                ctx.shadowColor = goldColor;
                ctx.shadowBlur = 8;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.9;
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.stroke();
                ctx.rotate(gameTime * 2);
                ctx.beginPath();
                ctx.moveTo(0, -14);
                ctx.lineTo(0, 14);
                ctx.moveTo(-14, 0);
                ctx.lineTo(14, 0);
                ctx.stroke();
                ctx.restore();
            }

            // 8. Rastro do Dash (Q)
            ctx.save();
            dashTrail.forEach(trail => {
                const opacity = 1 - (trail.time / trail.duration);
                ctx.globalAlpha = opacity * 0.5;
                ctx.font = `${trail.size * 0.9}px var(--pixel-font)`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(player.skin, trail.x, trail.y);
            });
            ctx.restore();

            // 9. Entidades (com Culling)
            collectibles.forEach(c => {
                 if (c.x + c.size > 0 && c.x - c.size < canvas.width &&
                     c.y + c.size > 0 && c.y - c.size < canvas.height)
                 {
                    c.draw();
                 }
            });
            groundEffects.forEach(g => {
                if (g.x + g.radius > 0 && g.x - g.radius < canvas.width &&
                    g.y + g.radius > 0 && g.y - g.radius < canvas.height)
                {
                    g.draw();
                }
            });

            // Desenha Inimigos próximos
            const nearbyEntities = spatialGrid.getNearby(player.x, player.y);
            nearbyEntities.forEach(e => {
                if (e.type) { // Só desenha inimigos
                    if (e.x + e.size > 0 && e.x - e.size < canvas.width &&
                        e.y + e.size > 0 && e.y - e.size < canvas.height)
                    {
                        e.draw();
                    }
                }
            });

            // Desenha projéteis (com Culling)
            projectiles.forEach(p => {
                 const drawSize = p.size || 10;
                 if (p.x + drawSize / 2 > 0 && p.x - drawSize / 2 < canvas.width &&
                     p.y + drawSize / 2 > 0 && p.y - drawSize / 2 < canvas.height)
                 {
                    p.draw();
                 }
            });

            // --- DESENHA CLONES (com Culling) ---
            playerClones.forEach(clone => {
                 if (clone.x + clone.size / 2 > 0 && clone.x - clone.size / 2 < canvas.width &&
                     clone.y + clone.size / 2 > 0 && clone.y - clone.size / 2 < canvas.height)
                 {
                    clone.draw();
                 }
            });

            // 10. Partículas (com Culling)
            particles.forEach(p => {
                if (p.x > 0 && p.x < canvas.width && p.y > 0 && p.y < canvas.height) {
                    p.draw();
                }
            });

            // 11. Indicador de Impacto (W)
            if (impactIndicator.active) {
                const currentImpactRadius = impactIndicator.radius * player.impactAreaMultiplier;
                const alpha = impactIndicator.timer / 0.1;
                ctx.save();
                ctx.beginPath();
                ctx.arc(impactIndicator.x, impactIndicator.y, currentImpactRadius, 0, Math.PI * 2);
                let fillColor, strokeColor;
                if (Math.floor(gameTime * 20) % 2 === 0) {
                    fillColor = `rgba(255, 225, 122, ${alpha * 0.7})`;
                    strokeColor = `rgba(255, 225, 122, ${alpha})`;
                } else {
                    fillColor = `rgba(245, 189, 31, ${alpha * 0.7})`;
                    strokeColor = `rgba(245, 189, 31, ${alpha})`;
                }
                ctx.fillStyle = fillColor;
                ctx.fill();
                ctx.lineWidth = 3;
                ctx.strokeStyle = strokeColor;
                ctx.stroke();
                ctx.restore();
            }

            // 12. Indicador da Aura Dourada / Pulso Cinético
            if (auraIndicator.active) {
                const alpha = (auraIndicator.timer / auraIndicator.duration) * 0.6;
                ctx.save();
                ctx.beginPath();
                ctx.arc(auraIndicator.x, auraIndicator.y, auraIndicator.radius, 0, Math.PI * 2);
                ctx.fillStyle = auraIndicator.color.replace('0.7', `${alpha * 0.4}`);
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = auraIndicator.color.replace('0.7', `${alpha}`);
                ctx.stroke();
                ctx.restore();
            }

            // 13. Indicador da Aura de Debuff (Bardo)
            if (debuffAuraIndicator.active) {
                const alpha = (debuffAuraIndicator.timer / debuffAuraIndicator.duration) * 0.6;
                ctx.save();
                ctx.beginPath();
                ctx.arc(debuffAuraIndicator.x, debuffAuraIndicator.y, debuffAuraIndicator.radius, 0, Math.PI * 2);
                ctx.fillStyle = debuffAuraIndicator.color.replace('0.7', `${alpha * 0.4}`);
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = debuffAuraIndicator.color.replace('0.7', `${alpha}`);
                ctx.stroke();
                ctx.restore();
            }

            // 14. Jogador
            ctx.save();
            ctx.translate(player.x, player.y);
            ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
            ctx.shadowBlur = 10;
            if (player.isBerserk) {
                ctx.shadowColor = 'orange';
                ctx.shadowBlur = 15;
            }
            if (player.isLightningActive) {
                ctx.shadowColor = 'rgba(0, 150, 255, 0.8)';
                ctx.shadowBlur = 15;
            }
            let playerEmoji = player.skin;
            if (player.isInvulnerable) {
                playerEmoji = '✨';
                ctx.shadowColor = 'cyan';
                ctx.shadowBlur = 15;
            }
            if (player.isReacaoAdrenalActive) {
                playerEmoji = '💨';
                ctx.shadowColor = 'white';
                ctx.shadowBlur = 10;
            }
            if (player.furiaDoTigreMultiplier > 0 && player.hp < player.maxHp) {
                const hpPercentMissing = 1.0 - (player.hp / player.maxHp);
                ctx.shadowColor = `rgba(255, 0, 0, ${hpPercentMissing * 0.8})`;
                ctx.shadowBlur = 10 + (hpPercentMissing * 10);
            }
            ctx.save();
            if (player.moveDirectionX !== 0) {
                const tiltAngle = (Math.PI / 180) * (player.moveDirectionX * 15);
                ctx.rotate(tiltAngle);
            }
            ctx.font = `${player.size * 0.9}px var(--pixel-font)`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(playerEmoji, 0, 0);
            ctx.restore();
            ctx.save();
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.8;
            const orbitSpeed = 3;
            const orbitRadius = player.size * 1.4;
            const iconSize = player.size * 0.6;
            const orbitalEmojis = [];
            if (player.hasClass) {
                orbitalEmojis.push(player.classIcon);
            }
            Object.values(player.passiveWeapons).forEach(weapon => {
                orbitalEmojis.push(weapon.emoji);
            });
            const totalOrbitals = orbitalEmojis.length;
            if (totalOrbitals > 0) {
                const angleIncrement = (Math.PI * 2) / totalOrbitals;
                orbitalEmojis.forEach((emoji, index) => {
                    const baseAngle = gameTime * orbitSpeed;
                    const offsetAngle = index * angleIncrement;
                    const angle = baseAngle + offsetAngle;
                    const iconX = Math.cos(angle) * orbitRadius;
                    const iconY = Math.sin(angle) * orbitRadius;
                    ctx.font = `${iconSize}px var(--pixel-font)`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(emoji, iconX, iconY);
                });
            }
            ctx.restore();
            if (player.isSlowed) {
                ctx.font = `${player.size * 1.5}px var(--pixel-font)`;
                ctx.globalAlpha = 0.8;
                ctx.fillText('🕸️', 0, 0);
            }
            ctx.shadowBlur = 0;
            ctx.restore(); // Restaura o translate(player.x, player.y)

            // 15. Radar de Inimigos Fora da Tela
            let closestOffScreenEnemy = null;
            let minOffScreenDistSq = Infinity;
            enemies.forEach(enemy => {
                const isVisible = enemy.x > 0 && enemy.x < canvas.width && enemy.y > 0 && enemy.y < canvas.height;
                if (!isVisible) {
                    const distSq = distanceSquared(player.x, player.y, enemy.x, enemy.y);
                    if (distSq < minOffScreenDistSq) {
                        minOffScreenDistSq = distSq;
                        closestOffScreenEnemy = enemy;
                    }
                }
            });
            if (closestOffScreenEnemy) {
                ctx.save();
                const centerW = canvas.width / 2;
                const centerH = canvas.height / 2;
                const angle = Math.atan2(closestOffScreenEnemy.y - centerH, closestOffScreenEnemy.x - centerW);
                const indicatorRadius = Math.min(canvas.width, canvas.height) / 2 - 30;
                const indicatorX = centerW + Math.cos(angle) * indicatorRadius;
                const indicatorY = centerH + Math.sin(angle) * indicatorRadius;
                let indicatorColor = (closestOffScreenEnemy.type === 'ELITE' || closestOffScreenEnemy.type === 'CHEFE') ? '#facc15' : '#ef4444';
                ctx.fillStyle = indicatorColor;
                ctx.beginPath();
                ctx.arc(indicatorX, indicatorY, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.translate(indicatorX, indicatorY);
                ctx.rotate(angle + Math.PI / 2);
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.moveTo(0, -10); ctx.lineTo(-7, 10); ctx.lineTo(7, 10);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // 16. Textos Flutuantes
            floatingTexts.forEach(text => {
                const opacity = 1 - (text.time / text.duration);
                const translateY = text.y + (text.vy * text.time * 60) * 0.05;
                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.textAlign = 'center';
                const defaultFontSize = '12px';
                const damageFontSize = '25px';
                const computedFontName = window.computedFontName || 'sans-serif';
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                if (text.type === 'player' || text.type === 'crit' || text.type === 'normal') {
                    ctx.font = `bold ${damageFontSize} 'Silkscreen', sans-serif`;
                    if (text.type === 'player') {
                        ctx.fillStyle = '#ef4444';
                    } else if (text.type === 'crit') {
                        ctx.fillStyle = '#f5bd1f';
                        ctx.shadowColor = '#f5bd1f';
                        ctx.shadowBlur = 6;
                    } else {
                        ctx.fillStyle = '#ffffff';
                    }
                } else if (text.type === 'xp') {
                    ctx.font = `bold ${defaultFontSize} 'Silkscreen', sans-serif`;
                    ctx.fillStyle = '#facc15';
                } else if (text.type === 'heal_hp') {
                    ctx.font = `bold ${defaultFontSize} 'Silkscreen', sans-serif`;
                    ctx.fillStyle = '#4ade80';
                } else if (text.type === 'heal_sp') {
                    ctx.font = `bold ${defaultFontSize} 'Silkscreen', sans-serif`;
                    ctx.fillStyle = '#60a5fa';
                } else if (text.type === 'upgrade' || text.type === 'drop-upgrade') {
                    ctx.font = `bold ${defaultFontSize} 'Silkscreen', sans-serif`;
                    ctx.fillStyle = '#06f79a';
                    ctx.shadowColor = '#06f79a';
                    ctx.shadowBlur = 5;
                } else {
                    ctx.font = `${defaultFontSize} 'Silkscreen', sans-serif`;
                    ctx.fillStyle = '#d1d5db';
                }
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.lineWidth = 3;
                ctx.strokeText(text.text, text.x, translateY);
                ctx.fillText(text.text, text.x, translateY);
                ctx.restore();
            });

            ctx.restore(); // Restaura o translate do cameraShake

            // 17. Pulso de Berserk
            if (player.isBerserk) {
                const pulseOpacity = 0.02 + Math.sin(gameTime * 20) * 0.05;
                ctx.fillStyle = `rgba(245, 189, 31, ${pulseOpacity})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // 18. Flash de Dano
            if (damageFlashTimer > 0) {
                const opacity = damageFlashTimer / DAMAGE_FLASH_DURATION * 0.4;
                ctx.save();
                ctx.fillStyle = `rgba(255, 0, 0, ${opacity})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            }

            // 19. Desenha o Cursor Customizado
            if (isMouseOnCanvas && gameState !== 'MENU' && gameState !== 'GAME_OVER') {
                ctx.save();
                let cursorEmoji = '🎯';
                const goldColor = getComputedStyle(document.documentElement).getPropertyValue('--action-color') || '#f5bd1f';
                if (controlScheme === 'mouse') {
                    cursorEmoji = '👆';
                }
                ctx.strokeStyle = goldColor;
                ctx.fillStyle = goldColor;
                ctx.shadowColor = goldColor;
                ctx.shadowBlur = 6;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.font = `20px var(--pixel-font)`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cursorEmoji, mouseX, mouseY);
                ctx.restore();
            }
        } // <<<--- FIM DO drawGame() ATUALIZADO	
			
		// --- Cursor Customizado ---
        canvas.style.cursor = 'none'; // Esconde o cursor padrão

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });
        
        canvas.addEventListener('mouseenter', () => {
            isMouseOnCanvas = true;
        });
        
        canvas.addEventListener('mouseleave', () => {
            isMouseOnCanvas = false;
        });
        // --- Fim Cursor Customizado ---

        // Ajusta o canvas quando a janela muda de tamanho
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 100));

        // Movimento por clique
        canvas.addEventListener('mousedown', (e) => {
            // Só funciona se o modo de controle for 'mouse'
            if (gameState !== 'PLAYING' || controlScheme !== 'mouse') return;

            const rect = canvas.getBoundingClientRect();
            movementTarget.x = e.clientX - rect.left;
            movementTarget.y = e.clientY - rect.top;
			movementTarget.time = gameTime;
        });

		// Controles por Teclado
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();

            // 1. Guard: Bloqueia todas as teclas se estiver em overlays de prioridade máxima
            // Checa a loja, códice e conquistas
            if (gameState === 'GAME_OVER' || gameState === 'LEVEL_UP' ||
                document.getElementById('settings-screen').classList.contains('visible') ||
                storeScreen.classList.contains('visible') ||
                codexScreen.classList.contains('visible') ||
                achievementsScreen.classList.contains('visible'))
            {
                return;
            }

            // 2. Guard: Fecha tutorial se estiver aberto (Prioridade máxima)
            // Qualquer tecla (incluindo 'p') fecha o tutorial.
            if (tutorialTipScreen.classList.contains('visible')) {
                closeTutorialTip();
                e.preventDefault();
                return;
            }

            // 3. Handle 'p' (Pausar/Despausar)
            // Se não estamos nos guards acima, 'p' deve sempre tentar pausar/despausar.
            // A própria função togglePause() tem guards internos para (LEVEL_UP, MENU, etc.)
            if (key === 'p') {
                togglePause();
                e.preventDefault();
                return; // Já tratamos 'p', não fazer mais nada
            }

            // 4. Guard: Se chegamos aqui E NÃO é 'p', bloqueia se estiver pausado
            if (gameState === 'PAUSED') return;

            // 5. Handle: Habilidades e Movimento (Apenas se gameState === 'PLAYING')
            if (controlScheme === 'wasd') {
                // --- Controles WASD ---
                if (['w', 'a', 's', 'd'].includes(key)) {
                    keysPressed[key] = true;
                    e.preventDefault();
                }

                switch (key) {
                    case 'shift': player.useDash(); e.preventDefault(); break;
                    case 'q': player.useImpact(); e.preventDefault(); break;
                    case 'e': player.useBerserk(); e.preventDefault(); break;
                    case 't': player.consumePowerupStack(); e.preventDefault(); break;
                }

            } else {
                // --- Controles Mouse + QWET ---
                switch (key) {
                    case 'q': player.useDash(); e.preventDefault(); break;
                    case 'w': player.useImpact(); e.preventDefault(); break;
                    case 'e': player.useBerserk(); e.preventDefault(); break;
                    case 't': player.consumePowerupStack(); e.preventDefault(); break;
                }
            }
        });

        // Listener para KeyUp (para parar movimento WASD)
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (controlScheme === 'wasd' && ['w', 'a', 's', 'd'].includes(key)) {
                keysPressed[key] = false;
                e.preventDefault();
            }
        });

        // Ajusta o texto do botão de Tela Cheia (MODIFICADO)
        document.addEventListener('fullscreenchange', () => {
            const text = document.fullscreenElement ? 'SAIR T. CHEIA' : 'TELA CHEIA';
            // Atualiza APENAS o botão de configurações
            // document.getElementById('fullscreen-btn').textContent = text; // REMOVIDO
            document.getElementById('fullscreen-btn-settings').textContent = text;
        });

        // Inicialização do Jogo
		window.onload = async function () { // Adiciona 'async' aqui
			// --- Obtém o nome da fonte da variável CSS ---
			try {
				const rootStyle = getComputedStyle(document.documentElement);
				const fontFamily = rootStyle.getPropertyValue('--pixel-font').trim();
				computedFontName = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
				console.log("Fonte computada:", computedFontName);

				// --- ESPERA A FONTE CARREGAR ---
				if (document.fonts) { // Verifica se a API é suportada
					try {
						console.log(`Verificando se a fonte '${computedFontName}' está carregada...`);
						await document.fonts.load(`1em '${computedFontName}'`); // Espera a fonte carregar
						console.log(`Fonte '${computedFontName}' carregada com sucesso!`);
					} catch (fontError) {
						console.error(`Erro ao carregar a fonte '${computedFontName}':`, fontError);
						computedFontName = 'sans-serif'; // Usa fallback se falhar
					}
				} else {
					console.warn("API document.fonts não suportada. Tentando continuar sem garantia de carregamento da fonte.");
				}
				// --- FIM ESPERA FONTE ---

			} catch (e) {
				console.error("Erro ao obter/carregar a fonte da variável CSS:", e);
				computedFontName = 'sans-serif';
			}
			
			// ---> ADICIONE ESTA LINHA para pegar a cor do CSS <---
			try {
				cachedBgColor = getComputedStyle(document.documentElement).getPropertyValue('--main-bg').trim() || '#1a1a2e';
				console.log("Cor de fundo cacheada:", cachedBgColor);
			} catch(e) {
				console.error("Erro ao obter cor de fundo do CSS:", e);
				cachedBgColor = '#1a1a2e'; // Usa o fallback
			}
			// ---> FIM DA ADIÇÃO <---
			
			// --- Load inicial ---
			loadMetaUpgrades();
			loadAudioSettings();
			loadControlSettings();
			// setupFirebase(); // <- Comentado

			// ---> Obter referência do elemento de áudio BGM <---
			const bgmAudio = document.getElementById('bgm-audio');

			// --- QoL: Pausa automática ao perder o foco ---
			window.addEventListener('blur', () => {
				if (gameState === 'PLAYING') {
					togglePause('PAUSED');
				}
			});
			
            // --- Telas ---
            const startScreen = document.getElementById('start-screen');
            const pauseScreen = document.getElementById('pause-screen');
            const gameOverScreen = document.getElementById('game-over-screen');
            const settingsScreen = document.getElementById('settings-screen');
            storeScreen = document.getElementById('store-screen');

            // --- Códice e Conquistas ---
            codexScreen = document.getElementById('codex-screen');
            achievementsScreen = document.getElementById('achievements-screen');

            // --- Inicialização do InputManager (Touch / Gamepad / Save) ---
            if (typeof InputManager !== 'undefined') {
                InputManager.init();
            }

            // --- Botões do Menu Inicial ---
            document.getElementById('start-button').addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6); // Som de clique

                initGame();
                startGame();
            });

            openStoreBtn = document.getElementById('open-store-btn');
            openStoreBtn.addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6);
                openStoreScreen('meta');
            });

            // --- NOVOS Listeners (Códice e Conquistas) ---
            openCodexBtn = document.getElementById('open-codex-btn');
            openCodexBtn.addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6);
                openCodexScreen();
            });
            openAchievementsBtn = document.getElementById('open-achievements-btn');
            openAchievementsBtn.addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6);
                openAchievementsScreen();
            });

            document.getElementById('open-settings-btn').addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6); // Som de clique
                startScreen.classList.remove('visible');
                settingsScreen.classList.add('visible');
            });

            document.getElementById('exit-game-btn').addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6); // Som de clique
                window.close();
            });

             // --- Botões do Game Over ---
             document.getElementById('restart-button').addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6); // Som de clique
                initGame();
                startGame();
            });

            document.getElementById('back-to-menu-btn').addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6); // Som de clique
                gameOverScreen.classList.remove('visible');

				document.getElementById('game-container').classList.remove('low-hp-pulse');
				statusHud.classList.remove('low-hp-pulse'); // Remove do painel de status também

                startScreen.classList.add('visible');
                gameState = 'MENU'; // Atualiza o estado

                document.getElementById('game-container').classList.add('game-level-up');

				// Desenha o fundo correto
                const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--main-bg') || '#1a1a2e';
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Atualiza o emoji da skin na tela inicial
                const skinEmojiEl = document.getElementById('start-screen-skin');
                if (skinEmojiEl) {
                    skinEmojiEl.textContent = metaUpgrades.selectedSkin;
                }
            });

            // --- Botões da Tela de Configurações ---
            document.getElementById('settings-back-btn').addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6); // Som de clique
                settingsScreen.classList.remove('visible');

                // Verifica para qual tela voltar (Menu ou Pausa)
                if (gameState === 'PAUSED') {
                    pauseScreen.classList.add('visible');
                } else { // Assume 'MENU'
                    startScreen.classList.add('visible');
                }
            });

            document.getElementById('fullscreen-btn-settings').addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6); // Som de clique
                toggleFullScreen();
            });

            // --- Botões da Tela de Pausa ---
            document.getElementById('resume-game-btn').addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6); // Som de clique
                togglePause(); // Simplesmente despausa o jogo
            });

            document.getElementById('open-settings-pause-btn').addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6); // Som de clique
                pauseScreen.classList.remove('visible');
                settingsScreen.classList.add('visible');
                // O estado (gameState) continua 'PAUSED'
            });

            document.getElementById('exit-match-btn').addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6); // Som de clique
                // Volta para o menu inicial
                pauseScreen.classList.remove('visible');

				document.getElementById('game-container').classList.remove('low-hp-pulse');
				statusHud.classList.remove('low-hp-pulse'); // Remove do painel de status também

                startScreen.classList.add('visible');
                gameState = 'MENU';
                keysPressed = {}; // Limpa teclas ao sair

                document.getElementById('game-container').classList.add('game-level-up');

				// Desenha o fundo correto
                const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--main-bg') || '#1a1a2e';
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Atualiza o emoji da skin na tela inicial
                const skinEmojiEl = document.getElementById('start-screen-skin');
                if (skinEmojiEl) {
                    skinEmojiEl.textContent = metaUpgrades.selectedSkin;
                }
            });

            // --- Listeners da Loja Unificada ---
            metaUpgradeOptions = document.getElementById('meta-upgrade-options');
            openMetaStoreGameoverBtn = document.getElementById('open-meta-store-gameover-btn');
            storeGrapesBankDisplay = document.getElementById('store-grapes-bank-display');
            storeCloseBtn = document.getElementById('store-close-btn');
            tabBtnMeta = document.getElementById('tab-btn-meta');
            tabBtnSkins = document.getElementById('tab-btn-skins');
            metaContent = document.getElementById('meta-upgrade-content');
            skinContent = document.getElementById('skin-store-content');
            skinXpBonusContainer = document.getElementById('skin-xp-bonus-container');
            skinXpBonusDisplay = document.getElementById('skin-xp-bonus-display');
            storeTitleText = document.getElementById('store-title-text');
            resetMetaUpgradesBtn = document.getElementById('reset-meta-upgrades-btn');

			// --- Listeners da Aba de Skins (agora inicializado aqui)
            skinStoreOptions = document.getElementById('skin-store-options');
            if (skinStoreOptions) { // Verifica se o elemento foi encontrado
                skinStoreOptions.addEventListener('click', handleSkinStoreClick); // <-- ADICIONE ESTA LINHA
            } else {
                console.error("ERRO CRÍTICO: Elemento 'skin-store-options' não encontrado no HTML!");
            }

            openMetaStoreGameoverBtn.addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6);
                openStoreScreen('meta');
            });
            storeCloseBtn.addEventListener('click', () => {
                 playBeep(700, 0.05, 'square', 0.6);
                closeStoreScreen();
            });

            tabBtnMeta.addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6);
                setActiveTab('meta');
            });
            tabBtnSkins.addEventListener('click', () => {
                 playBeep(700, 0.05, 'square', 0.6);
                setActiveTab('skins');
            });

            metaUpgradeOptions.addEventListener('click', (e) => {
                const button = e.target.closest('.meta-upgrade-button');
                if (button && !button.disabled && button.dataset.upgradeId) {
                    purchaseMetaUpgrade(button.dataset.upgradeId);
                }
            });

            resetMetaUpgradesBtn.addEventListener('click', () => {
                 resetMetaUpgrades();
            });

            // --- Listeners do Códice ---
            codexCloseBtn = document.getElementById('codex-close-btn');
            tabBtnEnemies = document.getElementById('tab-btn-enemies');
            tabBtnWeapons = document.getElementById('tab-btn-weapons');
            tabBtnItems = document.getElementById('tab-btn-items');
            codexEnemiesContent = document.getElementById('codex-enemies-content');
            codexWeaponsContent = document.getElementById('codex-weapons-content');
            codexItemsContent = document.getElementById('codex-items-content');
            codexEnemiesGrid = document.getElementById('codex-enemies-grid');
            codexWeaponsGrid = document.getElementById('codex-weapons-grid');
            codexItemsGrid = document.getElementById('codex-items-grid');

            codexCloseBtn.addEventListener('click', () => {
                 playBeep(700, 0.05, 'square', 0.6);
                closeCodexScreen();
            });
            tabBtnEnemies.addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6);
                setCodexActiveTab('enemies');
            });
            tabBtnWeapons.addEventListener('click', () => {
                 playBeep(700, 0.05, 'square', 0.6);
                setCodexActiveTab('weapons');
            });
            tabBtnItems.addEventListener('click', () => {
                 playBeep(700, 0.05, 'square', 0.6);
                setCodexActiveTab('items');
            });

            // --- Listeners das Conquistas ---
            achievementsCloseBtn = document.getElementById('achievements-close-btn');
            achievementsList = document.getElementById('achievements-list');

            achievementsCloseBtn.addEventListener('click', () => {
                 playBeep(700, 0.05, 'square', 0.6);
                closeAchievementsScreen();
            });

            // Botões de Utilidade (Jogo)
            pauseBtn.addEventListener('click', () => {
                togglePause();
            });
            // fullscreenBtn.addEventListener('click', toggleFullScreen); // REMOVIDO

            // Botões de Habilidade (agora chamam os métodos do player)
            dashBtn.addEventListener('click', () => { if(player) player.useDash() });
            impactBtn.addEventListener('click', () => { if(player) player.useImpact() });
            berserkBtn.addEventListener('click', () => { if(player) player.useBerserk() });

            // Armazena o texto original dos tooltips
            dashTooltipText = dashBtn.querySelector('.tooltip-text').innerHTML;
            impactTooltipText = impactBtn.querySelector('.tooltip-text').innerHTML;
            berserkTooltipText = berserkBtn.querySelector('.tooltip-text').innerHTML;

            // Botão de Reroll (Level Up)
            rerollBtn = document.getElementById('reroll-button');
            rerollBtn.addEventListener('click', () => {
                attemptReroll();
            });

            // Botão de Pular (Level Up)
            const skipBtn = document.getElementById('skip-upgrade-button');
            skipBtn.addEventListener('click', () => {
                skipLevelUp();
            });

            // Adiciona sons de hover aos botões principais (com delegação de evento)
            document.body.addEventListener('mouseover', (e) => {
                if (e.target.closest('.main-button:not(:disabled), .utility-button:not(:disabled), .upgrade-option, .ability-btn:not(:disabled), .meta-upgrade-button:not(:disabled), .skin-button:not(:disabled)')) {
                    playBeep(900, 0.03, 'triangle', 0.5); // Som de hover
                }
            });
            // Adiciona sons de clique aos botões de upgrade (com delegação)
            document.getElementById('upgrade-options').addEventListener('click', (e) => {
                 if (e.target.closest('.upgrade-option')) {
                     playBeep(700, 0.05, 'square', 0.6); // Som de clique
                 }
            });

            // Inicializa elementos do Tutorial
            tutorialTipScreen = document.getElementById('tutorial-tip-screen');
            tutorialTipTitle = document.getElementById('tutorial-tip-title');
            tutorialTipText = document.getElementById('tutorial-tip-text');
            tutorialTipCloseBtn = document.getElementById('tutorial-tip-close');
            tutorialTipCloseBtn.addEventListener('click', () => {
                 playBeep(700, 0.05, 'square', 0.6); // Som de clique
                closeTutorialTip();
            });

            // --- Event Listeners do Controle de Volume ---
            const muteButtons = document.querySelectorAll('.mute-btn');
            const volumeSliders = document.querySelectorAll('.volume-slider');

            muteButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    playBeep(700, 0.05, 'square', 0.6); // Som de clique
                    isMuted = !isMuted;
                    saveAudioSettings();
                    updateVolumeControlsUI();
                });
            });

            volumeSliders.forEach(slider => {
                slider.addEventListener('input', (e) => {
                    masterVolume = parseFloat(e.target.value);
                    if (masterVolume > 0) {
                        isMuted = false; // Tira o mudo se o usuário ajustar o volume
                    }
                    saveAudioSettings();
                    updateVolumeControlsUI();
                });
            });

            // --- Event Listeners dos Controles de Jogo ---
            setControlsMouseBtn = document.getElementById('set-controls-mouse');
            setControlsWasdBtn = document.getElementById('set-controls-wasd');

            setControlsMouseBtn.addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6); // Som de clique
                controlScheme = 'mouse';
                saveControlSettings();
                updateControlSchemeUI();
            });
            setControlsWasdBtn.addEventListener('click', () => {
                playBeep(700, 0.05, 'square', 0.6); // Som de clique
                controlScheme = 'wasd';
                saveControlSettings();
                updateControlSchemeUI();
            });

            // --- Seleciona elementos da UI de Controle ---
            dashLabel = document.getElementById('dash-label');
            impactLabel = document.getElementById('impact-label');
            berserkLabel = document.getElementById('berserk-label');
            pauseControlsText = document.getElementById('pause-controls-text');

            // Captura os novos slots de armas
            passiveWeaponSlot1 = document.getElementById('passive-weapon-slot-1');
            passiveWeaponSlot2 = document.getElementById('passive-weapon-slot-2');
			passiveWeaponSlot3 = document.getElementById('passive-weapon-slot-3');

            // Prepara o canvas e o HUD inicial
            resizeCanvas();
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            updateVolumeControlsUI();
            updateControlSchemeUI(); // Aplica a UI de controle ao carregar

			// --- Listener para inicializar áudio na primeira interação ---
			function initializeAudioOnFirstInteraction() {
				initializeAudioContext(); // Isso já inicializa o audioCtx

				// ---> Tenta tocar a BGM <---
				const bgmAudioRef = document.getElementById('bgm-audio');
				if (bgmAudioRef && !isMuted) { // Só toca se não estiver mudo
					// Tenta tocar. O catch lida com erros caso o navegador ainda bloqueie.
					bgmAudioRef.play().catch(e => {
						console.warn("Música de fundo bloqueada pelo navegador, aguardando outra interação.", e);
					});
				}
				// Os listeners com { once: true } já se removem automaticamente.
			}
			
			document.body.addEventListener('mousedown', initializeAudioOnFirstInteraction, { once: true });
			document.body.addEventListener('keydown', initializeAudioOnFirstInteraction, { once: true });

            // Atualiza o emoji da skin na tela inicial ao carregar
            const skinEmojiEl = document.getElementById('start-screen-skin');
            if (skinEmojiEl) {
                skinEmojiEl.textContent = metaUpgrades.selectedSkin;
            }
			// Garante que o volume inicial seja aplicado
			updateVolumeControlsUI(); // Chame para aplicar volume/mudo carregados
        }