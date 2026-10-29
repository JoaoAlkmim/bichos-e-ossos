// Em logic.js
// Verifica as colisões que envolvem o jogador
function checkCollisions() {
	// Jogador vs Coletáveis (Gema/Brinde/XP/Especiais)
    // *** USANDO LOOP FOR REVERSO PARA DEVOLUÇÃO SEGURA AO POOL ***
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const collectible = collectibles[i];

        // --- INÍCIO DA OTIMIZAÇÃO 4 ---
        // Pega o raio de coleta ATUAL (incluindo Imã) + tamanho do coletável
        const checkRadius = player.getDynamicCollectionRange() + collectible.size;

        // 1. Checagem rápida (Culling): Se o item está obviamente longe no eixo X OU Y,
        //    pule os cálculos caros de distância.
        if (Math.abs(player.x - collectible.x) > checkRadius || 
            Math.abs(player.y - collectible.y) > checkRadius) {
            continue; // Pula para o próximo coletável no loop
        }
        // --- FIM DA OTIMIZAÇÃO 4 ---


        // 2. Cálculo de Colisão (Só roda se passou na checagem rápida)
        const collisionRadius = player.size / 2 + collectible.size / 2;
        const collisionRadiusSq = collisionRadius * collisionRadius;

        // 3. Cálculo de Distância Quadrada (agora roda com muito menos frequência)
        if (distanceSquared(player.x, player.y, collectible.x, collectible.y) < collisionRadiusSq) {

            // --- CÓDICE (CORRIGIDO com guarda de segurança) ---
            const itemDef = ITEM_DEFINITIONS[collectible.type]; // Tenta obter a definição

            if (itemDef && !metaUpgrades.unlockedItems.includes(collectible.type)) {
                metaUpgrades.unlockedItems.push(collectible.type);
                saveMetaUpgrades();
                // Mostra um toast especial de descoberta (exceto para XP)
                if (collectible.type !== 'XP_GEM') {
                     // Agora é seguro usar itemDef.name
                     showAchievement(`📜 Códice Atualizado: ${itemDef.name} ${collectible.emoji}`, 0, 3, null);
                }
            }

            if (collectible.type === 'Gema') {
                playBeep(700, 0.05, 'triangle', 0.7); // Som de coleta

                // --- CONQUISTA ---
                if (canGetColecionadorAvido) {
                   gemsCollectedThisGame++;
                }

                // CONQUISTA: Colheita Rápida
                grapesCollectedInWindow++;
                grapeCollectionTimer = 5.0; // Reseta a janela de 5 segundos

                // A checagem if (grapesCollectedInWindow === 5) foi movida para checkAchievements

                spawnParticles(player.x, player.y, 10, 'rgba(0, 255, 100, 0.7)', 2, 4, 1, 3, 0.5);

                player.grapes++;

                // Lógica "Colecionador"
                if (Math.random() < player.extraGrapeChance) {
                    player.grapes++;
                    showFloatingText(collectible.x, collectible.y + 20, 'Gema Extra! 💠', 'crit');
                }

                triggerCollectPop('Gema'); // Feedback visual

                // Recupera HP e SP (com multiplicador da skin 🐷)
                const hpRestore = (player.maxHp * 0.01) * player.gemaHealMultiplier;
                const spRestore = (player.maxSp * 0.05) * player.gemaHealMultiplier;
                player.hp = Math.min(player.maxHp, player.hp + hpRestore);
                player.sp = Math.min(player.maxSp, player.sp + spRestore);

                showFloatingText(collectible.x - 10, collectible.y - 15, `+${Math.round(hpRestore)}`, 'heal_hp');
                showFloatingText(collectible.x + 10, collectible.y - 15, `+${Math.round(spRestore)}`, 'heal_sp');

            } else if (collectible.type === 'MOEDA') {
                // Arpejo Mágico Ascendente
                playBeep(600, 0.05, 'triangle', 0.7);
                setTimeout(() => playBeep(800, 0.05, 'triangle', 0.7), 40);
                setTimeout(() => playBeep(1000, 0.05, 'triangle', 0.7), 80);
                spawnParticles(player.x, player.y, 20, 'rgba(245, 189, 31, 0.8)', 3, 6, 2, 5, 0.6); // Partículas Douradas

                // --- CONQUISTA ---
                if (canGetSortudo) {
                    powerupsCollectedThisGame++;
                }

                // Acumula Brinde
                player.powerupStacks++;
                showFloatingText(collectible.x, collectible.y - 15, `Brinde! (Use T)`, 'upgrade');
                triggerCollectPop('MOEDA');

            } else if (collectible.type === 'XP_GEM') {
                playBeep(800, 0.05, 'sine', 0.6); // Som de coleta de XP

                // Aplica o multiplicador de ganho de XP
                const xpGained = collectible.amount * player.xpGainMultiplier;
                player.xp += xpGained;

                showFloatingText(collectible.x, collectible.y - 15, `+${xpGained.toFixed(1)}`, 'xp');
                triggerXPGlow();

            // Coleta de Novos Itens Especiais
            } else if (collectible.type === 'MAGNET') {
                playBeep(800, 0.2, 'sine', 0.8);
                showFloatingText(collectible.x, collectible.y - 15, `IMÃ ATIVADO! (3s)`, 'upgrade');
                showAchievement("🧲 Super Imã! Raio de coleta massivo!", 0.05, 3, 'ITEM_IMA');

                player.isMagnetActive = true;
                player.magnetTimer = 3.0;
            }

            else if (collectible.type === 'BOMB') {
                playBeep(100, 0.3, 'sawtooth', 1.0); // Som de explosão
                showFloatingText(collectible.x, collectible.y - 15, `BOMBA!`, 'upgrade');
                showAchievement("💣 KABOOM! Dano em área massivo!", 0.05, 3, 'ITEM_BOMBA');

                spawnParticles(player.x, player.y, 50, 'rgba(255, 100, 0, 0.9)', 5, 15, 5, 15, 1.0);
                cameraShake = Math.min(cameraShake + 5, 10);

                // Cálculo de Dano e Área
                const bombDamage = player.currentBaseDamage * 3.0;
                const bombRadius = (BASE_ATTACK_RANGE * player.attackRangeMultiplier) * 5.0;
                const bombRadiusSq = bombRadius * bombRadius;

                const nearbyEnemies = spatialGrid.getNearby(player.x, player.y);

                nearbyEnemies.forEach(target => {
                    // VERIFICAÇÃO: typeof target.takeDamage === 'function'
                    if (target.isAlive && typeof target.takeDamage === 'function' && distanceSquared(player.x, player.y, target.x, target.y) < bombRadiusSq) {
                        let finalBombDamage = bombDamage;

                        // Esta verificação 'target.type' já funciona bem (destrutíveis não têm 'type')
                        if (target.type && (target.hp / target.maxHp < player.abateThreshold)) {
                            finalBombDamage *= 1.5;
                        }
                        target.takeDamage(finalBombDamage, false); // Agora é seguro!
                    }
                });
            }

            else if (collectible.type === 'POTION') {
                playBeep(900, 0.15, 'triangle', 0.9); // Som de cura
                showFloatingText(collectible.x, collectible.y - 15, `POÇÃO!`, 'upgrade');
                showAchievement("❤️‍🩹 Alívio Imediato! +10% de HP recuperado!", 0.05, 3, 'ITEM_POCAO');

                spawnParticles(player.x, player.y, 20, 'rgba(0, 255, 100, 0.7)', 3, 6, 1, 3, 0.8);

                const healAmount = player.maxHp * 0.10;
                player.hp = Math.min(player.maxHp, player.hp + healAmount);
                showFloatingText(player.x, player.y - 15, `+${Math.round(healAmount)}`, 'heal_hp');
                triggerHPFlash();
            }

            else if (collectible.type === 'LIGHTNING') {
                playBeep(900, 0.1, 'sine', 0.8); // Som elétrico
                showFloatingText(collectible.x, collectible.y - 15, `RAIO ATIVADO! (5s)`, 'upgrade');
                showAchievement("⚡ Ataque em Cadeia! Acertando inimigos em dobro!", 0.05, 3, 'ITEM_RAIO');

                player.isLightningActive = true;
                player.lightningTimer = 5.0;
            }

            // --- DEVOLVE O COLETÁVEL PARA O POOL E REMOVE ---
            const itemToPool = collectibles[i]; // Item atual do loop (i)
            collectibles.splice(i, 1); // Remove o item

            // Devolve ao pool
            if (collectiblePool.length < INITIAL_COLLECTIBLE_POOL_SIZE) {
                 itemToPool.isCollected = true;
                 collectiblePool.push(itemToPool);
            }
        }
    } // Fim do loop for reverso (Coletáveis)

    // Loop único para colisão com Inimigos (contato) e Projéteis INIMIGOS vs JOGADOR
    const potentialColliders = spatialGrid.getNearby(player.x, player.y);

    potentialColliders.forEach((entity) => {

        // 1. Checa se é Inimigo (tem 'type') vs Jogador (Contato)
        if (entity.type) {
            const enemy = entity; // Renomeia para clareza
            const isDashing = player.dashDuration > 0; // Verifica se player está no dash
            const collisionRadiusSq = (player.size / 2 + enemy.size / 2) ** 2;

            // Só toma dano se não estiver no Dash e o inimigo não estiver em "hit-stun" ou carregando ataque
            if (enemy.isAlive && !isDashing && enemy.stunTimer <= 0 && !enemy.isChargingAttack &&
                distanceSquared(player.x, player.y, enemy.x, enemy.y) < collisionRadiusSq) {

                player.takeDamage(enemy.damage); // Usa o método do player
                difficulty += 0.002;

                // Empurra o jogador levemente
                const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                // Aplica um empurrão menor para não "jogar" o jogador para longe demais
                const pushForce = 5;
                player.x += Math.cos(angle) * pushForce;
                player.y += Math.sin(angle) * pushForce;
                // Aplica um pequeno stun no inimigo para evitar dano contínuo instantâneo
                enemy.stunTimer = 0.3;
            }
        }

        // 2. Checa se é um Projétil INIMIGO vs Jogador
        else if (entity.angle !== undefined) { // Checa se é um projétil (tem ângulo)
            const projectile = entity;
            const collisionRadiusSq = (player.size / 2 + projectile.size / 2) ** 2;

            // Colisão Projétil Inimigo vs Jogador
            if (!projectile.isFriendly && projectile.isAlive &&
                distanceSquared(player.x, player.y, projectile.x, projectile.y) < collisionRadiusSq) {

                projectile.isAlive = false; // Marcamos como morto imediatamente ao colidir.
                spawnParticles(projectile.x, projectile.y, 3, projectile.color, 2, 4, 1, 2, 0.3);

                if (!player.isInvulnerable) { // Se o jogador NÃO está invulnerável (Dash)
                    player.takeDamage(projectile.damage); // Usa o método do player

                    wasHitByProjectile = true; // CONQUISTA: Intocável
                    shootersDefeatedInRow = 0;

                    if (projectile.projectileType === 'WEB') { // --- LÓGICA DE LENTIDÃO ---
                        player.applySlow(3.0);
                    }

                } else { // Feedback de "desvio" durante o Dash
                    showFloatingText(projectile.x, projectile.y, 'MISS', 'normal');
                    cameraShake = Math.min(cameraShake + 0.5, 2);

                    if (canGetEsquivaPerfeita) { // CONQUISTA: Esquiva Perfeita
                        showAchievement("✨ Esquiva Perfeita! Desviou de um projétil usando o Dash!", 0.05, 3, 'ESQUIVA_PERFEITA');
                        canGetEsquivaPerfeita = false;
                        // Não resetamos a flag aqui, deixamos ela ser resetada no checkAchievements
                    }
                }
            }
            // A lógica para projéteis AMIGOS foi movida para o gameLoop
        }
    }); // Fim do forEach potentialColliders
} // Fim da função checkCollisions
		
		
		
		
		/**
        * Verifica e resolve colisões entre uma entidade e todos os obstáculos/destrutíveis.
        * @param {Object} entity - A entidade para checar (jogador ou inimigo).
        */
        function checkEntityObstacleCollision(entity) {
            const allObstacles = [...obstacles, ...destructibles.filter(d => d.isAlive)];

            allObstacles.forEach(obs => {
                const collisionRadius = (entity.size / 2 + obs.size / 2);
                const collisionRadiusSq = collisionRadius * collisionRadius;
                const distSq = distanceSquared(entity.x, entity.y, obs.x, obs.y);

                if (distSq < collisionRadiusSq) {
                    // Se colidiu, empurra a entidade para fora
                    // O cálculo do overlap precisa da raiz, mas só é feito APÓS a colisão.
                    const dist = Math.sqrt(distSq);
                    const overlap = (collisionRadius) - dist;

                    const angle = Math.atan2(entity.y - obs.y, entity.x - obs.x);
                    entity.x += Math.cos(angle) * overlap;
                    entity.y += Math.sin(angle) * overlap;
                }
            });
        }

        /**
         * Verifica e resolve colisão entre um inimigo e outros inimigos próximos.
         * @param {Enemy} currentEnemy - O inimigo que está se movendo.
         */
        function checkEnemyEnemyCollision(currentEnemy) {
            // 1. Se o inimigo atual (currentEnemy) não for corpóreo,
            // ele ignora todos os outros e pode atravessá-los.
            if (!currentEnemy.isCorporeal) {
                return;
            }

            // Usa a grade espacial para encontrar inimigos PRÓXIMOS
            // Nota: A grade só conterá inimigos processados ANTES neste frame.
            const nearbyEntities = spatialGrid.getNearby(currentEnemy.x, currentEnemy.y);

            nearbyEntities.forEach(other => {
                // 2. O inimigo atual só vai colidir com 'other' se 'other' TAMBÉM for corpóreo.
                if (other.type && other.isAlive && other !== currentEnemy && other.isCorporeal) {

                    const collisionRadius = (currentEnemy.size / 2 + other.size / 2); // Raio de colisão (soma das metades)
                    const collisionRadiusSq = collisionRadius * collisionRadius;
                    const distSq = distanceSquared(currentEnemy.x, currentEnemy.y, other.x, other.y);

                    // Se a distância ao quadrado for menor que o raio de colisão ao quadrado
                    if (distSq < collisionRadiusSq && distSq > 0) {
                        // Colisão detectada
                        const dist = Math.sqrt(distSq);
                        const overlap = (collisionRadius) - dist; // O quanto eles estão sobrepostos

                        // Calcula o ângulo de repulsão (de 'other' para 'currentEnemy')
                        const angle = Math.atan2(currentEnemy.y - other.y, currentEnemy.x - other.x);

                        // Empurra APENAS o 'currentEnemy' para fora do 'other'
                        // 'other' já teve sua posição definida neste frame.
                        currentEnemy.x += Math.cos(angle) * overlap;
                        currentEnemy.y += Math.sin(angle) * overlap;
                    }
                }
            });
        }
		
		/**
        * Spawna um inimigo em uma borda aleatória da tela (USANDO POOLING).
        * @param {string} [type='PADRAO'] - O tipo de inimigo (PADRAO, ATIRADOR, etc.).
        */
        function spawnEnemy(type = 'PADRAO') {

            const edge = Math.floor(Math.random() * 4);
            let x, y;
            const offset = 50; // Distância para fora da tela

            switch (edge) {
                case 0: x = Math.random() * canvas.width; y = -offset; break; // Topo
                case 1: x = Math.random() * canvas.width; y = canvas.height + offset; break; // Baixo
                case 2: x = -offset; y = Math.random() * canvas.height; break; // Esquerda
                case 3: x = canvas.width + offset; y = Math.random() * canvas.height; break; // Direita
            }

            // --- NOVO: Lógica de Pooling de Inimigos ---
            let newEnemy = enemyPool.pop(); // Tenta pegar do pool
            
            if (newEnemy) {
                // Reutiliza se o pool não estiver vazio
                newEnemy.init(x, y, type, player.level, difficulty);
            } else {
                // Cria um novo se o pool estiver vazio (ocorre se o limite inicial for atingido)
                newEnemy = new Enemy(x, y, type, player.level, difficulty); 
            }
            enemies.push(newEnemy);
            // --- FIM LÓGICA DE POOLING ---

            // Mostra alerta para Elite ou Chefe
            if (type === 'ELITE' || type === 'CHEFE') {
                showSpecialEnemyAlert(type);
            }

            // Gatilho de Dicas de Tutorial por tipo de inimigo
            if (type === 'PADRAO' && !hasSeenPadraoTip) {
                hasSeenPadraoTip = true;
                showTutorialTip(
                    "NOVO INIMIGO: ESQUELETO 💀",
                    "Este é o inimigo padrão.<br>Eles perseguem você implacavelmente para causar dano de contato."
                );
            } else if (type === 'ZUMBI' && !hasSeenZumbiTip) {
                hasSeenZumbiTip = true;
                showTutorialTip(
                    "NOVO INIMIGO: ZUMBI 🧟",
                    "Zumbis são lentos, mas podem surgir de inimigos derrotados!<br>Cuidado para não ser cercado por eles."
                );
            } else if (type === 'GHOST' && !hasSeenGhostTip) {
                hasSeenGhostTip = true;
                showTutorialTip(
                    "NOVO INIMIGO: FANTASMA 👻",
                    "Fantasmas são <strong>muito rápidos</strong> e se movem de forma errática.<br>Eles são frágeis, mas difíceis de acertar!"
                );
            } else if (type === 'ATIRADOR' && !hasSeenShooterTip) {
                hasSeenShooterTip = true;
                showTutorialTip(
                    "NOVO INIMIGO: ATIRADOR ☠️",
                    "Este inimigo ataca à distância!<br>Use o <strong>DASH (Q)</strong> para desviar ou se reposicionar rapidamente."
                );
            } else if (type === 'ELITE' && !hasSeenEliteTip) {
                hasSeenEliteTip = true;
                showTutorialTip(
                    "INIMIGO ELITE: 👹",
                    "Inimigos Elite são mais fortes e resistentes.<br>Foque em eliminá-los primeiro e use suas habilidades!"
                );
            } else if (type === 'CHEFE' && !hasSeenChefeTip) {
                hasSeenChefeTip = true;
                showTutorialTip(
                    "CHEFE APARECEU: 👑",
                    "Um Chefe é um inimigo único com <strong>muita vida</strong> e dano.<br>Esta será sua batalha mais difícil. Boa sorte!"
                );
            } else if (type === 'ARANHA' && !hasSeenAranhaTip) {
                hasSeenAranhaTip = true;
                showTutorialTip(
                    "NOVO INIMIGO: ARANHA 🕷️",
                    "Aranhas disparam projéteis roxos.<br>Se for atingido, você ficará <strong>LENTO</strong> por 3 segundos! 🕸️"
                );
            } else if (type === 'ZUMBETE' && !hasSeenZumbeteTip) {
                hasSeenZumbeteTip = true;
                showTutorialTip(
                    "NOVO INIMIGO: ZUMBETE 🧟‍♀️",
                    "Zumbetes são mais rápidas que zumbis, mas também podem surgir de inimigos derrotados!<br>Cuidado para não ser cercado por elas."
                );
            }
        }

        /**
         * Spawna uma horda de inimigos fracos (Zumbis) em um círculo
         * ao redor do jogador, mas fora da tela.
         */
        function spawnHorde() {
            showSpecialEnemyAlert("HORDA IMINENTE!");
            playBeep(100, 0.5, 'sawtooth', 0.9);

            const spawnCount = 25;
            const spawnDist = Math.max(canvas.width, canvas.height) / 2 + 100;

            for (let i = 0; i < spawnCount; i++) {
                const angle = (i / spawnCount) * Math.PI * 2;
                const x = player.x + Math.cos(angle) * spawnDist;
                const y = player.y + Math.sin(angle) * spawnDist;

                // Spawna Zumbis com 50% da dificuldade atual
                enemies.push(new Enemy(x, y, 'ZUMBI', player.level, difficulty * 0.5));
            }
        }
		
		// Spawna coletável especial em local aleatório (USANDO POOLING)
        function spawnSpecialCollectible(type) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            
            // --- NOVO: Lógica de Pooling de Coletáveis ---
            let c = collectiblePool.pop();
            
            if (c) {
                c.init(x, y, type);
            } else {
                c = new Collectible(x, y, type);
            }
            collectibles.push(c);
            // --- FIM LÓGICA DE POOLING ---
            
            showFloatingText(x, y, 'BÔNUS!', 'upgrade');
        }
		
		// --- NOVAS FUNÇÕES DE DISPARO DAS ARMAS ---
        function firePavioCurto(weapon, stats) {
            playBeep(250, 0.1, 'sawtooth', 0.7); // Som de lançamento de bomba

            // Encontra alvos aleatórios (como Orbe Arcano)
            const allTargets = enemies.filter(e => e.isAlive);
            if (allTargets.length === 0) return;

            const damage = player.currentBaseDamage * stats.damage;
            const projSpeed = 2.0; // Bomba lenta
            const projColor = '#DC2626'; // Vermelho

            for (let i = 0; i < stats.projectiles; i++) {
                const target = allTargets[Math.floor(Math.random() * allTargets.length)];
                const angle = Math.atan2(target.y - player.y, target.x - player.x);

                let p = projectilePool.pop();
                if (p) {
                    // Reutiliza: (maxPierce=0, isBoomerang=false, maxDistance=0, fuseTimer=stats.fuse, daggerCrit/Dmg=0)
                    p.init(player.x, player.y, angle, projSpeed, damage, projColor, 20, true, 'BOMB', 0, false, 0, stats.fuse, 0, 0);
                    p.bombStats = stats; // Anexa stats para a explosão saber o raio
                } else {
                    // Cria Novo
                    p = new Projectile(player.x, player.y, angle, projSpeed, damage, projColor, 20, true, 'BOMB', 0, false, 0, stats.fuse, 0, 0);
                    p.bombStats = stats;
                }
                projectiles.push(p);
            }
        }

        function fireAdagaCerteira(weapon, stats) {
            playBeep(600, 0.05, 'triangle', 0.6); // Som de adaga

            // Encontra inimigo mais próximo
            const potentialTargets = spatialGrid.getNearby(player.x, player.y)
                .filter(e => e.type && e.isAlive)
                .map(target => ({ target, distSq: distanceSquared(player.x, player.y, target.x, target.y) }))
                .sort((a, b) => a.distSq - b.distSq);

            if (potentialTargets.length === 0) return;

            const damage = player.currentBaseDamage * stats.damage;
            const projSpeed = 7.0; // Adaga rápida
            const projColor = '#9CA3AF'; // Cinza metálico

            for (let i = 0; i < stats.projectiles; i++) {
                 const target = potentialTargets[i % potentialTargets.length].target;
                 const angle = Math.atan2(target.y - player.y, target.x - player.x);

                 let p = projectilePool.pop();
                 if (p) {
                     // Reutiliza: (fuse=0, daggerCritChance=stats.bonusCritChance, daggerCritDamage=stats.bonusCritDamage)
                     p.init(player.x, player.y, angle, projSpeed, damage, projColor, 15, true, 'DAGGER', 0, false, 0, 0, stats.bonusCritChance, stats.bonusCritDamage);
                 } else {
                     // Cria Novo
                     p = new Projectile(player.x, player.y, angle, projSpeed, damage, projColor, 15, true, 'DAGGER', 0, false, 0, 0, stats.bonusCritChance, stats.bonusCritDamage);
                 }
                 projectiles.push(p);
            }
        }

        function fireEsporosExplosivos(weapon, stats) {
            playBeep(250, 0.1, 'sine', 0.5); // Som de "plantar"

            const damage = player.currentBaseDamage * stats.damage;

            for (let i = 0; i < stats.count; i++) {
                // Spawna perto do jogador
                const angle = Math.random() * Math.PI * 2;
                const dist = 30 + Math.random() * 30;
                // Garante que não spawne fora do canvas (simples verificação de borda)
                let x = Math.max(10, Math.min(canvas.width - 10, player.x + Math.cos(angle) * dist));
                let y = Math.max(10, Math.min(canvas.height - 10, player.y + Math.sin(angle) * dist));


                // Usa a classe SporeMine que criamos
                groundEffects.push(new SporeMine( // Adiciona ao array groundEffects
                    x, y,
                    stats.radius,
                    stats.duration,
                    damage,
                    stats.triggerRadius,
                    stats.slowDuration || 0 // Passa a duração do slow (usa 0 se não definida)
                ));
            }
        }

        // Array global para guardar os clones ativos (precisa estar acessível por fireCloneInstavel e gameLoop)
        let playerClones = [];

        function fireCloneInstavel(weapon, stats) {
            playBeep(600, 0.1, 'sine', 0.7); // Som de invocação
            setTimeout(() => playBeep(700, 0.1, 'sine', 0.7), 80);

            for (let i = 0; i < stats.count; i++) {
                 // Spawna perto do jogador
                const angle = Math.random() * Math.PI * 2;
                const dist = 25 + Math.random() * 10;
                // Garante que não spawne fora do canvas
                let x = Math.max(10, Math.min(canvas.width - 10, player.x + Math.cos(angle) * dist));
                let y = Math.max(10, Math.min(canvas.height - 10, player.y + Math.sin(angle) * dist));

                playerClones.push(new PlayerClone( // Adiciona ao array global
                    x, y,
                    stats.duration,
                    stats.damageScale,
                    stats.attackSpeedScale
                ));
            }
        }

        // --- FIM NOVAS FUNÇÕES DE DISPARO ---
		
		/**
        * Atualiza a lógica de todas as armas passivas ativas.
        * Chamado a cada frame pelo gameLoop.
        */
        function updatePassiveWeapons(dt) {
            if (!player) return;

            // Itera sobre todas as armas que o jogador possui
            for (const weapon of Object.values(player.passiveWeapons)) {
                // Reduz o timer da arma
                weapon.timer = Math.max(0, weapon.timer - dt);

                if (weapon.timer <= 0) {
                    // Timer chegou a zero, hora de disparar

                    const definition = PASSIVE_WEAPON_DEFINITIONS[weapon.id];
                    if (!definition) continue; // Definição não encontrada

                    // Pega os stats do nível ATUAL da arma
                    const stats = definition.stats[weapon.level - 1]; // -1 pois o array é 0-based
                    if (!stats) continue; // Nível inválido

                    // --- Dispara a lógica específica da arma ---
                    if (weapon.id === 'auraDourada') {
                        fireAuraDourada(weapon, stats);
                    } else if (weapon.id === 'garrasAfiadas') {
                        fireGarrasAfiadas(weapon, stats);
                    } else if (weapon.id === 'orbeArcano') {
                        fireOrbeArcano(weapon, stats);
                    } else if (weapon.id === 'cometaCadente') {
                        fireCometaCadente(weapon, stats);
                    } else if (weapon.id === 'chaoConsagrado') {
                        fireChaoConsagrado(weapon, stats);
                    } else if (weapon.id === 'pulsoCinetico') {
                        firePulsoCinetico(weapon, stats);
                    } else if (weapon.id === 'espinhosTraseiros') {
                        fireEspinhosTraseiros(weapon, stats);
                    } else if (weapon.id === 'varinhaMagica') {
                        fireVarinhaMagica(weapon, stats);
                    } else if (weapon.id === 'coringaSelvagem') {
                        fireCoringaSelvagem(weapon, stats);
                    }
                    else if (weapon.id === 'presaRetornavel') {
                        firePresaRetornavel(weapon, stats);
                    }
                    else if (weapon.id === 'bardoAmaldicoado') {
                        fireBardoAmaldicoado(weapon, stats);
                    } else if (weapon.id === 'laminasGemeas') {
                        fireLaminasGemeas(weapon, stats);
                    }
                    else if (weapon.id === 'pocaoInstavel') {
                        firePocaoInstavel(weapon, stats);
                    } else if (weapon.id === 'dadosViciados') {
                        fireDadosViciados(weapon, stats);
                    } else if (weapon.id === 'machadoGiratorio') {
                        fireMachadoGiratorio(weapon, stats);
                    } else if (weapon.id === 'ritualSangrento') {
                        fireRitualSangrento(weapon, stats);
                    } // --- NOVAS ARMAS ---
                    else if (weapon.id === 'pavioCurto') { firePavioCurto(weapon, stats); }
                    else if (weapon.id === 'adagaCerteira') { fireAdagaCerteira(weapon, stats); }
                    else if (weapon.id === 'esporosExplosivos') { fireEsporosExplosivos(weapon, stats); }
                    else if (weapon.id === 'cloneInstavel') { fireCloneInstavel(weapon, stats); }
                    // --- FIM NOVAS ARMAS ---

                    weapon.timer = stats.cooldown; // Reinicia o timer com o cooldown do nível atual
                }
            }
        }

        /**
         * Dispara a lógica da "Aura Dourada".
         */
        function fireAuraDourada(weapon, stats) {
            playBeep(900, 0.05, 'sine', 0.5); // Som suave de "pulso"

            const damage = player.currentBaseDamage * stats.damage; // Dano baseado no Dano Base
            const radius = stats.radius;
            const radiusSq = radius * radius;

            // Feedback visual da aura
			auraIndicator.active = true;
			auraIndicator.timer = auraIndicator.duration; // Reinicia o timer para a duração total
			auraIndicator.x = player.x;
			auraIndicator.y = player.y;
			auraIndicator.radius = radius; // Usa o raio dos stats da arma
            auraIndicator.color = 'rgba(245, 189, 31, 0.7)'; // Garante cor correta

            const nearbyEnemies = spatialGrid.getNearby(player.x, player.y);

            nearbyEnemies.forEach(target => {
                // Acerta apenas inimigos e destrutíveis vivos
                if (target.isAlive && typeof target.takeDamage === 'function') {
                    if (distanceSquared(player.x, player.y, target.x, target.y) < radiusSq) {
                        // Não pode ser crítico, é dano de aura
                        target.takeDamage(damage, false);
                    }
                }
            });
        }

		/**
         * Dispara a lógica das "Garras Afiadas".
         */
        function fireGarrasAfiadas(weapon, stats) {
            playBeep(400, 0.05, 'triangle', 0.6); // Som de "lançamento"

            // Encontra os inimigos mais próximos (semelhante ao ataque automático)
            const potentialTargets = spatialGrid.getNearby(player.x, player.y)
                .filter(e => e.type && e.isAlive) // Apenas inimigos vivos
                .map(target => ({ target, distSq: distanceSquared(player.x, player.y, target.x, target.y) }))
                .sort((a, b) => a.distSq - b.distSq);

            if (potentialTargets.length === 0) return; // Sem alvos

            const damage = player.currentBaseDamage * stats.damage;
            const numProjectiles = stats.projectiles;
            const projSpeed = 4; // Velocidade da garra

            for (let i = 0; i < numProjectiles; i++) {
                // Pega o alvo (se tiver 3 projéteis e 2 alvos, o 3º projétil vai no alvo 1)
                const target = potentialTargets[i % potentialTargets.length].target;

                const angle = Math.atan2(target.y - player.y, target.x - player.x);

                // Pega um projétil do pool
                let p = projectilePool.pop();
                if (p) {
                    p.init(player.x, player.y, angle, projSpeed, damage, '#f5bd1f', 20, true, 'GARRA', 0, false, 0); // <-- MODIFICADO (Arma 2)
                } else {
                    p = new Projectile(player.x, player.y, angle, projSpeed, damage, '#f5bd1f', 20, true, 'GARRA', 0, false, 0); // <-- MODIFICADO (Arma 2)
                }

                projectiles.push(p);
            }
        }

        /**
         * Dispara a lógica do "Orbe Arcano" (alvo aleatório).
         */
        function fireOrbeArcano(weapon, stats) {
            playBeep(700, 0.05, 'sine', 0.5); // Som mágico

            // Pega todos os inimigos vivos
            const allTargets = enemies.filter(e => e.isAlive);
            if (allTargets.length === 0) return; // Sem alvos

            const damage = player.currentBaseDamage * stats.damage;
            const numProjectiles = stats.projectiles;
            const projSpeed = 4.5; // Velocidade do orbe

            for (let i = 0; i < numProjectiles; i++) {
                // Pega um alvo aleatório
                const target = allTargets[Math.floor(Math.random() * allTargets.length)];

                const angle = Math.atan2(target.y - player.y, target.x - player.x);

                // Pega um projétil do pool
                let p = projectilePool.pop();
                if (p) {
                    // Reutiliza: (maxPierce é 0 por padrão)
                    p.init(player.x, player.y, angle, projSpeed, damage, '#a855f7', 15, true, 'ORBE', 0, false, 0); // <-- MODIFICADO
                } else {
                    // Cria novo:
                    p = new Projectile(player.x, player.y, angle, projSpeed, damage, '#a855f7', 15, true, 'ORBE', 0, false, 0); // <-- MODIFICADO
                }

                projectiles.push(p);
            }
        }

        /**
         * Dispara a lógica do "Cometa Cadente" (direcional).
         */
        function fireCometaCadente(weapon, stats) {
            playBeep(150, 0.2, 'sawtooth', 0.8); // Som de "whoosh"

            let angle;
            // Verifica se o jogador está se movendo (usando as vars que salvamos)
            if (player.moveDirectionX !== 0 || player.moveDirectionY !== 0) {
                angle = Math.atan2(player.moveDirectionY, player.moveDirectionX);
            } else {
                // Se parado, atira em uma direção aleatória
                angle = Math.random() * Math.PI * 2;
            }

            const damage = player.currentBaseDamage * stats.damage;
            const numProjectiles = stats.projectiles;
            const projSpeed = 5;
            const projColor = '#f97316'; // Laranja

            for (let i = 0; i < numProjectiles; i++) {
                // Se tiver múltiplos projéteis, adiciona um pequeno spread
                let finalAngle = angle + (Math.random() - 0.5) * 0.2; // +/- 0.1 radiano

                let p = projectilePool.pop();
                if (p) {
                    p.init(player.x, player.y, finalAngle, projSpeed, damage, projColor, 18, true, 'COMETA', stats.pierce, false, 0); // <-- MODIFICADO
                } else {
                    p = new Projectile(player.x, player.y, finalAngle, projSpeed, damage, projColor, 18, true, 'COMETA', stats.pierce, false, 0); // <-- MODIFICADO
                }

                projectiles.push(p);
            }
        }

        /**
         * Dispara a lógica do "Chão Consagrado" (área estática).
         */
        function fireChaoConsagrado(weapon, stats) {
            playBeep(200, 0.1, 'triangle', 0.7); // Som de "lançar poção"

            const damage = player.currentBaseDamage * stats.damage;
            const fireColor = 'rgba(245, 189, 31, 0.7)'; // Cor dourada

            for (let i = 0; i < stats.count; i++) {
                // Spawna em um local aleatório próximo ao jogador
                const x = player.x + (Math.random() - 0.5) * 150;
                const y = player.y + (Math.random() - 0.5) * 150;

                groundEffects.push(new GroundEffect(
                    x, y,
                    stats.radius,
                    stats.duration,
                    damage,
                    stats.tickRate,
                    '🔥',
                    fireColor
                ));
            }
        }

        /**
         * Dispara a lógica do "Pulso Cinético".
         */
        function firePulsoCinetico(weapon, stats) {
            playBeep(180, 0.15, 'sawtooth', 0.8); // Som de "whoosh" grave

            const damage = player.currentBaseDamage * stats.damage;
            const radius = stats.radius;
            const radiusSq = radius * radius;
            const stunDuration = stats.stunDuration;

            // Feedback visual (reutiliza o indicador da aura, mas com cor diferente)
			auraIndicator.active = true;
			auraIndicator.timer = 0.2; // Duração visual curta
			auraIndicator.x = player.x;
			auraIndicator.y = player.y;
			auraIndicator.radius = radius;
            auraIndicator.color = 'rgba(255, 255, 255, 0.7)'; // Ex: Branco

            const nearbyEnemies = spatialGrid.getNearby(player.x, player.y);

            nearbyEnemies.forEach(target => {
                // Acerta apenas inimigos e destrutíveis vivos
                if (target.isAlive && typeof target.takeDamage === 'function') {
                    if (distanceSquared(player.x, player.y, target.x, target.y) < radiusSq) {

                        target.takeDamage(damage, false); // Dano baixo, não crítico

                        // Aplica o Stun (se for um inimigo)
                        if (target.type) { // 'type' existe em Inimigos, mas não em Destrutíveis
                            target.stunTimer = Math.max(target.stunTimer, stunDuration);
                        }
                    }
                }
            });
        }

        /**
         * Dispara a lógica dos "Espinhos Traseiros" (direcional oposta).
         */
        function fireEspinhosTraseiros(weapon, stats) {
            playBeep(300, 0.1, 'triangle', 0.5); // Som agudo

            let angle;
            // Verifica se o jogador está se movendo
            if (player.moveDirectionX !== 0 || player.moveDirectionY !== 0) {
                // Pega o ângulo do movimento e ADICIONA PI (180 graus) para inverter
                angle = Math.atan2(player.moveDirectionY, player.moveDirectionX) + Math.PI;
            } else {
                // Se parado, atira em uma direção aleatória
                angle = Math.random() * Math.PI * 2;
            }

            const damage = player.currentBaseDamage * stats.damage;
            const numProjectiles = stats.projectiles;
            const projSpeed = 4;
            const projColor = '#22c55e'; // Verde

            for (let i = 0; i < numProjectiles; i++) {
                // Adiciona um pequeno spread (espalhamento)
                let finalAngle = angle + (Math.random() - 0.5) * 0.3; // +/- 0.15 radiano

                let p = projectilePool.pop();
                if (p) {
                    // Reutiliza: (maxPierce é 0, pois espinhos não perfuram)
                    p.init(player.x, player.y, finalAngle, projSpeed, damage, projColor, 16, true, 'ESPINHO', 0, false, 0); // <-- MODIFICADO
                } else {
                    p = new Projectile(player.x, player.y, finalAngle, projSpeed, damage, projColor, 16, true, 'ESPINHO', 0, false, 0); // <-- MODIFICADO
                }

                projectiles.push(p);
            }
        }

        /**
         * Dispara a lógica da "Varinha Mágica" (leque de projéteis).
         */
        function fireVarinhaMagica(weapon, stats) {
            playBeep(880, 0.05, 'sine', 0.6); // Som agudo, mágico "ping"

            // 1. Encontra o inimigo mais próximo (lógica de fireGarrasAfiadas)
            const potentialTargets = spatialGrid.getNearby(player.x, player.y)
                .filter(e => e.type && e.isAlive) // Apenas inimigos vivos
                .map(target => ({ target, distSq: distanceSquared(player.x, player.y, target.x, target.y) }))
                .sort((a, b) => a.distSq - b.distSq);

            let baseAngle;
            if (potentialTargets.length === 0) {
                // Se não houver alvos, dispara em uma direção aleatória
                baseAngle = Math.random() * Math.PI * 2;
            } else {
                // Se houver alvo, mira no mais próximo
                const target = potentialTargets[0].target;
                baseAngle = Math.atan2(target.y - player.y, target.x - player.x);
            }

            const damage = player.currentBaseDamage * stats.damage;
            const numProjectiles = stats.projectiles;
            const projSpeed = 4.5;
            const projColor = '#3b82f6'; // Azul Mágico

            for (let i = 0; i < numProjectiles; i++) {
                // 2. Calcula um ângulo em leque (spread)
                // (i / (numProjectiles - 1)) vai de 0.0 a 1.0
                // Subtrair 0.5 centraliza o leque (ex: -0.5, 0, +0.5)
                const angleOffset = (numProjectiles > 1) ? (i / (numProjectiles - 1)) - 0.5 : 0;
                const finalAngle = baseAngle + (angleOffset * stats.spread);

                // 3. Usa o Pool de Projéteis
                let p = projectilePool.pop();
                if (p) {
                    // Reutiliza (maxPierce = 0, pois não perfura)
                    p.init(player.x, player.y, finalAngle, projSpeed, damage, projColor, 12, true, 'VARINHA', 0, false, 0); // <-- MODIFICADO
                } else {
                    // Cria novo
                    p = new Projectile(player.x, player.y, finalAngle, projSpeed, damage, projColor, 12, true, 'VARINHA', 0, false, 0); // <-- MODIFICADO
                }

                projectiles.push(p);
            }
        }

        /**
         * Dispara a lógica do "Coringa Selvagem" (alvo único).
         */
        function fireCoringaSelvagem(weapon, stats) {
            playBeep(523, 0.05, 'sine', 0.6); // Som de "carta" (C5)
            setTimeout(() => playBeep(659, 0.05, 'sine', 0.6), 50); // (E5)

            // 1. Encontra o inimigo mais próximo
            const potentialTargets = spatialGrid.getNearby(player.x, player.y)
                .filter(e => e.type && e.isAlive)
                .map(target => ({ target, distSq: distanceSquared(player.x, player.y, target.x, target.y) }))
                .sort((a, b) => a.distSq - b.distSq);

            if (potentialTargets.length === 0) return; // Sem alvos

            const target = potentialTargets[0].target;
            const angle = Math.atan2(target.y - player.y, target.x - player.x);

            // 2. O 'damage' é o Dano Base da arma (será multiplicado pelo Dano Base do player)
            // O multiplicador aleatório será aplicado na colisão.
            const damage = player.currentBaseDamage * stats.damage;
            const projSpeed = 5.0;
            const projColor = '#a855f7'; // Roxo (coringa)

            let p = projectilePool.pop();
            if (p) {
                // Passamos 'JOKER' como o tipo de projétil
                p.init(player.x, player.y, angle, projSpeed, damage, projColor, 18, true, 'JOKER', 0, false, 0); // <-- MODIFICADO
                // Anexa os stats (critMult, weakMult, stunDuration) ao objeto do projétil
                p.jokerStats = stats;
            } else {
                p = new Projectile(player.x, player.y, angle, projSpeed, damage, projColor, 18, true, 'JOKER', 0, false, 0); // <-- MODIFICADO
                p.jokerStats = stats; // Anexa os stats de bônus
            }

            projectiles.push(p);
        }

        /**
         * Dispara a lógica da "Presa Retornável" (Bumerangue).
         */
        function firePresaRetornavel(weapon, stats) {
            playBeep(450, 0.1, 'sine', 0.6); // Som de "whoosh"

            // 1. Encontra os inimigos mais próximos (como em fireGarrasAfiadas)
            const potentialTargets = spatialGrid.getNearby(player.x, player.y)
                .filter(e => e.type && e.isAlive) // Apenas inimigos vivos
                .map(target => ({ target, distSq: distanceSquared(player.x, player.y, target.x, target.y) }))
                .sort((a, b) => a.distSq - b.distSq);

            if (potentialTargets.length === 0) return; // Sem alvos

            const damage = player.currentBaseDamage * stats.damage;
            const numProjectiles = stats.projectiles;
            const projSpeed = stats.speed;
            const projColor = '#f5bd1f'; // Dourado

            for (let i = 0; i < numProjectiles; i++) {
                // Pega o alvo (se tiver 2 projéteis e 1 alvo, os 2 vão no mesmo)
                const target = potentialTargets[i % potentialTargets.length].target;

                const angle = Math.atan2(target.y - player.y, target.x - player.x);

                // Pega um projétil do pool
                let p = projectilePool.pop();
                if (p) {
                    // Reutiliza: (projétil, perfuração, éBumerangue, distância)
                    p.init(player.x, player.y, angle, projSpeed, damage, projColor, 18, true, 'BOOMERANG', stats.pierce, true, stats.distance);
                } else {
                    // Cria novo:
                    p = new Projectile(player.x, player.y, angle, projSpeed, damage, projColor, 18, true, 'BOOMERANG', stats.pierce, true, stats.distance);
                }

                projectiles.push(p);
            }
        }

        /**
         * Dispara a lógica do "Bardo Amaldiçoado".
         */
        function fireBardoAmaldicoado(weapon, stats) {
            playBeep(300, 0.1, 'sine', 0.4); // Som de "strum" grave
            setTimeout(() => playBeep(500, 0.1, 'sine', 0.4), 80); // Nota mais alta
            
            const radius = stats.radius;
            const radiusSq = radius * radius;
            
            // Feedback visual (aura roxa pulsante)
            debuffAuraIndicator.active = true;
            debuffAuraIndicator.timer = debuffAuraIndicator.duration;
            debuffAuraIndicator.x = player.x;
            debuffAuraIndicator.y = player.y;
            debuffAuraIndicator.radius = radius;
            
            const nearbyEnemies = spatialGrid.getNearby(player.x, player.y);
            
            nearbyEnemies.forEach(target => {
                // Aplica debuff apenas em inimigos vivos
                if (target.type && target.isAlive) {
                    if (distanceSquared(player.x, player.y, target.x, target.y) < radiusSq) {
                        // Aplica ou atualiza o debuff no inimigo
                        target.debuffs['bardo'] = {
                            timer: stats.debuffDuration,
                            multiplier: stats.debuffMultiplier
                        };
                        // Mostra um texto flutuante de debuff (opcional)
                        showFloatingText(target.x, target.y - 10, '🪕-', 'normal');
                    }
                }
            });
        }
        
        /**
         * Dispara a lógica das "Lâminas Gêmeas".
         */
        function fireLaminasGemeas(weapon, stats) {
            // Som rápido de corte
            playBeep(700, 0.03, 'triangle', 0.6); 
            setTimeout(() => playBeep(750, 0.03, 'triangle', 0.6), 40); 
            
            // Encontra o inimigo mais próximo
            const potentialTargets = spatialGrid.getNearby(player.x, player.y)
                .filter(e => e.type && e.isAlive) // Apenas inimigos vivos
                .map(target => ({ target, distSq: distanceSquared(player.x, player.y, target.x, target.y) }))
                .sort((a, b) => a.distSq - b.distSq);
                
            const attackRadiusSq = stats.radius * stats.radius;

            if (potentialTargets.length === 0 || potentialTargets[0].distSq > attackRadiusSq) return; // Sem alvos no alcance

            const target = potentialTargets[0].target;
            const damagePerHit = player.currentBaseDamage * stats.damage;
            const numHits = stats.hits;

            for (let i = 0; i < numHits; i++) {
                // Atraso pequeno entre os golpes
                setTimeout(() => {
                    if (target.isAlive) { // Checa se o alvo ainda está vivo
                        const isCrit = Math.random() < player.critChance;
                        let finalDamage = (isCrit ? damagePerHit * player.critDamageMultiplier : damagePerHit) * player.getDynamicDamageMultiplier();
                        
                        // Aplica Abate
                        if (target.hp / target.maxHp < player.abateThreshold) {
                           finalDamage *= 1.5; 
                        }
                        
                        target.takeDamage(finalDamage, isCrit);
                        player.triggerOnHitEffects();
                        
                        // Feedback visual (linha de ataque para cada golpe)
                        // Varia a posição final ligeiramente para não sobrepor
                        const targetX = target.x + (Math.random() - 0.5) * target.size * 0.5;
                        const targetY = target.y + (Math.random() - 0.5) * target.size * 0.5;
                        createAttackLine(player.x, player.y, targetX, targetY, isCrit);
                        
                        // Som de corte adicional para golpes múltiplos
                        if (i > 0) playBeep(700 + i * 50, 0.03, 'triangle', 0.5); 
                    }
                }, i * 50); // Atraso de 50ms entre os golpes
            }
        }
        
        /**
         * Dispara a lógica da "Poção Instável".
         * (Cria um GroundEffect em local aleatório)
         */
        function firePocaoInstavel(weapon, stats) {
            playBeep(200, 0.1, 'triangle', 0.7); // Som de "lançar poção"

            for (let i = 0; i < stats.count; i++) {
                // Spawna em um local aleatório próximo ao jogador
                const x = player.x + (Math.random() - 0.5) * 150;
                const y = player.y + (Math.random() - 0.5) * 150;
                
                const damage = player.currentBaseDamage * stats.damage;
                
                // 1. Rola o efeito aleatório
                const roll = Math.random();
                let emoji, color, debuffType, debuffDuration, debuffValue;

                if (roll < 0.33) { // Efeito 1: Fogo (Dano puro)
                    emoji = '🔥';
                    color = 'rgba(245, 189, 31, 0.7)';
                    debuffType = 'none';
                    debuffDuration = 0;
                    debuffValue = 0;
                } else if (roll < 0.66) { // Efeito 2: Gelo (Dano + Lentidão)
                    emoji = '❄️';
                    color = 'rgba(59, 130, 246, 0.7)';
                    debuffType = 'SLOW';
                    debuffDuration = 2.0; // Inimigos são lentos por 2s ao sair da poça
                    debuffValue = 0;
                } else { // Efeito 3: Ácido (Dano + Vulnerabilidade)
                    emoji = '☠️';
                    color = 'rgba(168, 85, 247, 0.7)';
                    debuffType = 'MELT';
                    debuffDuration = 3.0; // Inimigos tomam mais dano por 3s
                    debuffValue = 1.0 + stats.bonus; // Bônus de dano (ex: 1.1 = +10%)
                }

                // 2. Cria o GroundEffect com os stats aleatórios
                groundEffects.push(new GroundEffect(
                    x, y,
                    stats.radius,
                    stats.duration,
                    damage,
                    stats.tickRate,
                    emoji,
                    color,
                    debuffType,
                    debuffDuration,
                    debuffValue
                ));
            }
        }
        
        /**
         * Dispara a lógica dos "Dados Viciados".
         * (Lança um projétil que aplica um efeito aleatório 1-6)
         */
        function fireDadosViciados(weapon, stats) {
            playBeep(523, 0.05, 'sine', 0.6); // Som de "carta" (C5)
            
            // Encontra alvos aleatórios (como Orbe Arcano)
            const allTargets = enemies.filter(e => e.isAlive);
            if (allTargets.length === 0) return; // Sem alvos

            const damage = player.currentBaseDamage * stats.damage;
            const projColor = '#FFFFFF'; // Branco

            for (let i = 0; i < stats.projectiles; i++) {
                const target = allTargets[Math.floor(Math.random() * allTargets.length)];
                const angle = Math.atan2(target.y - player.y, target.x - player.x);

                let p = projectilePool.pop();
                if (p) {
                    p.init(player.x, player.y, angle, stats.speed, damage, projColor, 18, true, 'DICE', 0, false, 0);
                    p.diceStats = stats; // Anexa os stats do nível atual
                } else {
                    p = new Projectile(player.x, player.y, angle, stats.speed, damage, projColor, 18, true, 'DICE', 0, false, 0);
                    p.diceStats = stats;
                }
                projectiles.push(p);
            }
        }
        
        /**
         * Dispara a lógica do "Machado Giratório".
         * (Lança projéteis perfurantes em alvos aleatórios)
         */
        function fireMachadoGiratorio(weapon, stats) {
            playBeep(150, 0.2, 'sawtooth', 0.8); // Som de "whoosh"
            
            // Encontra alvos aleatórios (como Orbe Arcano)
            const allTargets = enemies.filter(e => e.isAlive);
            if (allTargets.length === 0) return;

            const damage = player.currentBaseDamage * stats.damage;
            const projColor = '#9ca3af'; // Cinza (metal)

            for (let i = 0; i < stats.projectiles; i++) {
                const target = allTargets[Math.floor(Math.random() * allTargets.length)];
                const angle = Math.atan2(target.y - player.y, target.x - player.x);

                let p = projectilePool.pop();
                if (p) {
                    p.init(player.x, player.y, angle, stats.speed, damage, projColor, stats.size, true, 'AXE', stats.pierce, false, 0);
                } else {
                    p = new Projectile(player.x, player.y, angle, stats.speed, damage, projColor, stats.size, true, 'AXE', stats.pierce, false, 0);
                }
                projectiles.push(p);
            }
        }

        /**
         * Dispara a lógica do "Ritual Sangrento".
         * (Pulsa, causa dano em área e cura o jogador)
         */
        function fireRitualSangrento(weapon, stats) {
            playBeep(200, 0.1, 'sine', 0.6); // Som de "dreno"

            const damage = player.currentBaseDamage * stats.damage;
            const radius = stats.radius;
            const radiusSq = radius * radius;
            const healPercent = stats.healPercent;
            let totalHeal = 0;

            // Feedback visual (aura vermelha)
			auraIndicator.active = true;
			auraIndicator.timer = auraIndicator.duration; 
			auraIndicator.x = player.x;
			auraIndicator.y = player.y;
			auraIndicator.radius = radius;
            auraIndicator.color = 'rgba(239, 68, 68, 0.7)'; // Vermelho

            const nearbyEnemies = spatialGrid.getNearby(player.x, player.y);

            nearbyEnemies.forEach(target => {
                if (target.isAlive && typeof target.takeDamage === 'function') {
                    if (distanceSquared(player.x, player.y, target.x, target.y) < radiusSq) {
                        
                        target.takeDamage(damage, false);
                        
                        // Acumula a cura (APENAS de inimigos, não de destrutíveis)
                        if (target.type) {
                            totalHeal += (damage * healPercent);
                        }
                    }
                }
            });
            
            // Aplica a cura total ao jogador
            if (totalHeal > 0) {
                player.hp = Math.min(player.maxHp, player.hp + totalHeal);
                showFloatingText(player.x, player.y - 15, `+${totalHeal.toFixed(1)} HP`, 'crit');
            }
        }
		
        // Atualiza o cálculo de DPS
        function updateDPS() {
            // Remove danos mais antigos que 1 segundo
            damageHistory = damageHistory.filter(d => gameTime - d.time < 1.0);
            // Soma o dano restante na janela de 1s
            const totalDamage = damageHistory.reduce((sum, d) => sum + d.damage, 0);
            dpsValue = totalDamage; // O total é o DPS
        }