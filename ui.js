
        // HUD só atualiza o DOM se o valor mudar (Otimização de Cache)
        function updateHUDs(deltaTime = 0) {
            // Guarda de segurança se o player não foi inicializado
            if (!player) return;

            // Tempo
            const minutes = Math.floor(gameTime / 60);
            const seconds = Math.floor(gameTime % 60);
            const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            if (hudCache.time !== timeString) {
                document.getElementById('time-display').textContent = timeString;
                hudCache.time = timeString;
            }

            // Progresso
            if (hudCache.level !== player.level) {
                document.getElementById('level-display').textContent = player.level;
                hudCache.level = player.level;
            }
            const xpText = Math.round(player.xp);
            if (hudCache.xp !== xpText) {
                document.getElementById('xp-display').textContent = xpText;
                hudCache.xp = xpText;
            }
            if (hudCache.xpNeeded !== player.xpNeeded) {
                document.getElementById('xp-needed-display').textContent = player.xpNeeded;
                hudCache.xpNeeded = player.xpNeeded;
            }
            if (hudCache.grapes !== player.grapes) {
				document.getElementById('grapes-display').textContent = player.grapes;
                hudCache.grapes = player.grapes;
            }
            if (hudCache.enemiesDefeated !== player.enemiesDefeated) {
                document.getElementById('enemies-defeated-display').textContent = player.enemiesDefeated;
                hudCache.enemiesDefeated = player.enemiesDefeated;
            }

            // Contador de Brindes
            if (hudCache.powerupStacks !== player.powerupStacks) {
                document.getElementById('powerup-stacks-display').textContent = player.powerupStacks;
                hudCache.powerupStacks = player.powerupStacks;
            }

            // Dificuldade (na tela de pausa)
            const difficultyText = `${(difficulty * 100).toFixed(1)}%`;
            const pauseDifficultyEl = document.getElementById('pause-difficulty-display');
            if (pauseDifficultyEl && hudCache.difficulty !== difficultyText) {
                pauseDifficultyEl.textContent = difficultyText;
                hudCache.difficulty = difficultyText;
            }

            // Barra de XP
            const xpPercent = Math.min(100, (player.xp / player.xpNeeded) * 100);
            if (hudCache.xpPercent !== xpPercent) {
                xpBar.style.width = `${xpPercent}%`;
                hudCache.xpPercent = xpPercent;
            }
			// Status (Classe)
            if (hudCache.className !== player.className) {
                document.getElementById('class-name-hud').textContent = player.className;
                document.getElementById('class-icon-hud').textContent = player.classIcon;
                hudCache.className = player.className; // Cache o nome (o ícone muda com ele)
            }
            // Status (HP)
            const hpText = Math.round(player.hp);
            if (hudCache.hp !== hpText) {
                document.getElementById('hp-value').textContent = hpText;
                hudCache.hp = hpText;
            }
            if (hudCache.maxHp !== player.maxHp) {
                document.getElementById('max-hp-value').textContent = player.maxHp;
                hudCache.maxHp = player.maxHp;
            }
            const hpPercent = (player.hp / player.maxHp) * 100;
            if (hudCache.hpPercent !== hpPercent) {
                document.getElementById('hp-bar').style.width = `${hpPercent}%`;
                hudCache.hpPercent = hpPercent;
            }

            hpBarBg.classList.toggle('hp-full-glow', player.hp === player.maxHp);

			const isLowHp = (player.hp / player.maxHp) <= 0.10; //Quando o jogador tiver 10% ou menos de HP a tela piscara de vermelho
			statusHud.classList.toggle('low-hp-pulse', isLowHp);
			document.getElementById('game-container').classList.toggle('low-hp-pulse', isLowHp); //vignette de vida baixa

			// Toca o som de batida do coração se o HP estiver baixo e o timer tiver zerado
			if (isLowHp && lowHpSoundTimer <= 0 && gameState === 'PLAYING') {
				// Frequência baixa (100Hz), tipo 'sine' (suave), duração curta
				playBeep(100, 0.15, 'sine', 0.8); 
				lowHpSoundTimer = 0.7; // Toca a cada 0.7 segundos
			}

            // Status (SP)
            const spText = Math.round(player.sp);
            if (hudCache.sp !== spText) {
                document.getElementById('sp-value').textContent = spText;
                hudCache.sp = spText;
            }
            if (hudCache.maxSp !== player.maxSp) {
                document.getElementById('max-sp-value').textContent = player.maxSp;
                hudCache.maxSp = player.maxSp;
            }
            const spPercent = (player.sp / player.maxSp) * 100;
            if (hudCache.spPercent !== spPercent) {
                document.getElementById('sp-bar').style.width = `${spPercent}%`;
                hudCache.spPercent = spPercent;
            }

            // Feedback visual: Brilho de SP (cheio ou regenerando)
            const spBarContainer = document.getElementById('sp-bar-bg');
            const isFocoTotal = (player.focoTotalBonus > 0) && player.sp === player.maxSp;
            spBarContainer.classList.toggle('sp-regen-glow', isFocoTotal || (player.sp < player.maxSp && player.spRegen > 0));

            // Feedback visual: Pulsação de SP Baixo
            const minSpCost = ABILITY_CONSTS.DASH.COST;
            spBarContainer.classList.toggle('low-sp-pulse', player.sp < minSpCost);

            // Atributos
            const dmgText = player.currentBaseDamage.toFixed(2);
            if (hudCache.dmg !== dmgText) {
                dmgDisplay.textContent = dmgText;
                hudCache.dmg = dmgText;
            }
            const aspdText = player.currentAttackSpeed.toFixed(2);
            if (hudCache.aspd !== aspdText) {
                aspdDisplay.textContent = aspdText;
                hudCache.aspd = aspdText;
            }
            const msText = player.currentMoveSpeed.toFixed(1);
            if (hudCache.ms !== msText) {
                msDisplay.textContent = msText;
                hudCache.ms = msText;
            }
            const critCText = `${(player.critChance * 100).toFixed(0)}%`;
            if (hudCache.critC !== critCText) {
                document.getElementById('crit-c-display').textContent = critCText;
                hudCache.critC = critCText;
            }
            const critDText = `${(player.critDamageMultiplier * 100).toFixed(0)}%`;
            if (hudCache.critD !== critDText) {
                document.getElementById('crit-d-display').textContent = critDText;
                hudCache.critD = critDText;
            }

            // DPS
            const dpsText = dpsValue.toFixed(1);
			if (hudCache.dps !== dpsText) {
                document.getElementById('dps-display').textContent = dpsText;
                hudCache.dps = dpsText;
            }

            // Atualiza HUD de Armas Passivas
            if (passiveWeaponSlot1) { // Garante que os elementos foram carregados
                // Pega a lista de armas ativas (o 'player' já as mantém na ordem)
                const activeWeapons = Object.values(player.passiveWeapons);

                // Define a arma para cada slot (ou null se não houver)
                const weapon1 = activeWeapons[0] || null;
                const weapon2 = activeWeapons[1] || null;
				const weapon3 = activeWeapons[2] || null;

                // Chama a nova função helper
                updateWeaponSlot(passiveWeaponSlot1, weapon1, 'weapon1');
                updateWeaponSlot(passiveWeaponSlot2, weapon2, 'weapon2');
				updateWeaponSlot(passiveWeaponSlot3, weapon3, 'weapon3');
            }

            // Feedback visual: Atributos buffados (Berserk / Reação Adrenal / Foco Total)
            const isBerserk = player.isBerserk;
            const isAdrenal = player.isReacaoAdrenalActive;
            const isFoco = (player.focoTotalBonus > 0) && player.sp === player.maxSp;

            [dmgDisplay, aspdDisplay].forEach(el => {
                const parent = el.closest('.hud-text').querySelector('span');
                parent.classList.toggle('berserk-attribute-glow', isBerserk || isFoco); // Foco Total também brilha
            });
            // Velocidade de Movimento pode brilhar com Berserk OU Adrenal
            const msParent = msDisplay.closest('.hud-text').querySelector('span');
            msParent.classList.toggle('berserk-attribute-glow', isBerserk || isAdrenal);
			// Atualiza custos de Habilidade (para bônus de skin)
            const dashCost = Math.round(ABILITY_CONSTS.DASH.COST * player.dashCostMultiplier);
            if (hudCache.dashCost !== dashCost) {
                document.getElementById('dash-cost-display').textContent = `SP: ${dashCost}`;
                hudCache.dashCost = dashCost;
            }
            const impactCost = Math.round(ABILITY_CONSTS.IMPACT.COST * player.impactCostMultiplier);
            if (hudCache.impactCost !== impactCost) {
                document.getElementById('impact-cost-display').textContent = `SP: ${impactCost}`;
                hudCache.impactCost = impactCost;
            }
            const berserkCost = Math.round(ABILITY_CONSTS.BERSERK.COST * player.berserkCostMultiplier);
            if (hudCache.berserkCost !== berserkCost) {
                document.getElementById('berserk-cost-display').textContent = `SP: ${berserkCost}`;
                hudCache.berserkCost = berserkCost;
            }
			// Cooldowns de Habilidades
            const abilities = [
                { id: 'dash', cd: player.dashCooldown, maxCd: ABILITY_CONSTS.DASH.COOLDOWN * player.dashCooldownMultiplier, cost: dashCost, btn: dashBtn, cache: dashTooltipText },
                { id: 'impact', cd: player.impactCooldown, maxCd: ABILITY_CONSTS.IMPACT.COOLDOWN * player.impactCooldownMultiplier, cost: impactCost, btn: impactBtn, cache: impactTooltipText },
                { id: 'berserk', cd: player.berserkCooldown, maxCd: ABILITY_CONSTS.BERSERK.COOLDOWN * player.berserkCooldownMultiplier, cost: berserkCost, btn: berserkBtn, cache: berserkTooltipText },
            ];

            abilities.forEach(a => {
                const btn = a.btn;
                const cdDiv = document.getElementById(`${a.id}-cd`);
                const tooltipSpan = btn.querySelector('.tooltip-text');
                const costSpan = btn.querySelector('span:not(.tooltip-text)');

                const onCooldown = a.cd > 0;
                const lowSp = player.sp < a.cost;

                btn.classList.toggle('disabled', onCooldown || lowSp);

                if (onCooldown) {
                    // Mostra o timer de cooldown
                    cdDiv.classList.remove('hidden');
                    const cdText = a.cd.toFixed(1);
                    if (cdDiv.textContent !== cdText) { // Otimização HUD
                        cdDiv.textContent = cdText;
                    }
					const percent = (a.cd / a.maxCd) * 100;
                    cdDiv.style.height = `${percent}%`;
                    cdDiv.style.top = `${100 - percent}%`;
                    // Mostra feedback dinâmico no tooltip
                    tooltipSpan.innerHTML = getAbilityFeedbackText(a.cost, a.cd, a.maxCd);
                } else if (lowSp) {
                    // Mostra que está sem SP
                    cdDiv.classList.add('hidden');
                    cdDiv.style.height = '100%';
                    cdDiv.style.top = '0';
                    tooltipSpan.innerHTML = getAbilityFeedbackText(a.cost, a.cd, a.maxCd);
                } else {
                    // Habilidade pronta
                    cdDiv.classList.add('hidden');
                    // Reseta para o texto estático original (do cache)
                    if (tooltipSpan.innerHTML !== a.cache) {
                        tooltipSpan.innerHTML = a.cache;
                    }
                }
            });
        }
		
		/**
        * Atualiza um slot de arma passiva no HUD, usando cache e tooltip.
        * @param {HTMLElement} slotEl - O elemento DOM do slot.
        * @param {Object | null} weapon - Os dados da arma (ou null).
        * @param {string} cacheKey - A chave do hudCache ('weapon1' ou 'weapon2').
        */
        function updateWeaponSlot(slotEl, weapon, cacheKey) {
            const weaponState = weapon ? `${weapon.emoji}${weapon.level}` : null;
            const tooltipSpan = slotEl.querySelector('.tooltip-text'); // Pega o span do tooltip

            if (hudCache[cacheKey] !== weaponState) {
                if (weapon && tooltipSpan) {
                    // Preenche o slot com os dados da arma
                    slotEl.innerHTML = `
                        <span class="emoji">${weapon.emoji}</span>
                        <span class="level">Nv ${weapon.level}</span>
                        <span class="tooltip-text"></span> `;
                    // Adiciona a borda dourada
                    slotEl.style.borderColor = `var(--action-color)`;

                    // --- Atualiza o Tooltip ---
                    const newTooltipSpan = slotEl.querySelector('.tooltip-text'); // Pega o span recriado
                    const definition = PASSIVE_WEAPON_DEFINITIONS[weapon.id];
                    if (definition && definition.stats[weapon.level - 1]) {
                        const stats = definition.stats[weapon.level - 1];
                        newTooltipSpan.innerHTML = `<strong>${definition.name} (Nv. ${weapon.level})</strong>${stats.description}`;
                    } else {
                        newTooltipSpan.textContent = 'Arma desconhecida';
                    }
                    // --- Fim Atualiza Tooltip ---

                } else if (tooltipSpan) { // Se não tem arma, mas o tooltip existe
                    // Limpa o slot
                    slotEl.innerHTML = '<span class="tooltip-text"></span>'; // Deixa só o span vazio do tooltip
                    // Reseta a borda
                    slotEl.style.borderColor = `var(--hud-border)`;
                    // Limpa o texto do tooltip
                    tooltipSpan.textContent = '';
                }
                hudCache[cacheKey] = weaponState; // Atualiza o cache
            }
        }
		
		// Função de Texto Flutuante (Usa Object Pooling)
        function showFloatingText(x, y, text, type) {
            let displayText;
            let cssType = type;

            if (typeof text === 'number') {
                displayText = String(Math.round(text));
            } else {
                displayText = String(text);
                if (type === 'upgrade') {
                    cssType = 'drop-upgrade'; // Estilo especial para upgrades
                }
            }

            // Tenta pegar um objeto do pool
            let ft = floatingTextPool.pop();
            if (!ft) {
                // Se o pool está vazio, cria um novo
                ft = {
                    x: 0, y: 0, text: '', type: '',
                    time: 0, duration: 1,
                    vx: 0, vy: 0, isAlive: true
                };
            }

            // Inicializa/Reseta o objeto
            ft.x = x;
            ft.y = y;
            ft.text = displayText;
            ft.type = cssType;
            ft.time = 0;
            ft.duration = 1;
            ft.vx = (Math.random() - 0.5) * 5;
            ft.vy = -Math.random() * 10 - 5;
            ft.isAlive = true;

			// --- ADICIONE ESTA LINHA ---
			ft.rotation = (Math.random() - 0.5) * 0.1; // Rotação aleatória
			// --- FIM DA ADIÇÃO ---

            floatingTexts.push(ft);
        }
		
		/**
        * Mostra uma notificação de conquista e aplica um bônus de XP.
        * @param {string} message - A mensagem a ser exibida.
        * @param {number} [bonusXP=0.05] - O multiplicador de ganho de XP bônus (0.05 = 5%).
        * @param {number} [duration=3] - A duração que a notificação fica na tela.
        * @param {string | null} achievementId - O ID da conquista (ou null se não for uma conquista real).
        */
        function showAchievement(message, bonusXP = 0.05, duration = 3, achievementId = null) {
            
            // --- Salva a conquista permanente ---
            if (achievementId && !metaUpgrades.unlockedAchievements.includes(achievementId)) {
                metaUpgrades.unlockedAchievements.push(achievementId);
                saveMetaUpgrades();
            }
            
            const div = achievementPool.pop(); // Pega do pool
            if (!div) return; // Pool esgotado, ignora
            
            // Limpa classes antigas
            div.className = 'achievement';

            const mainMessage = message.split('!')[0] + '!';
            
            let bonusText = '';
            // Se for um bônus de XP e for maior que 0
            if (bonusXP > 0) {
                const percentBonus = (bonusXP * 100).toFixed(0);
                bonusText = `<br><span class='text-yellow-300'>(+${percentBonus}% Ganho de XP)</span>`;
                
                // Aplica o bônus ao multiplicador e mostra o feedback
                // (Não aplica se for 0, como no caso do reset)
                player.xpGainMultiplier += bonusXP;
                showFloatingText(player.x, player.y - 40, `+${percentBonus}% XP Gain!`, 'upgrade');
                triggerXPGlow();
            } else {
                 // Se bonusXP for 0, não mostra a linha de bônus
                 // (Usado para o reset de meta-upgrades)
            }
            
            div.innerHTML = `${mainMessage} ${bonusText}`;
            
            achievementContainer.appendChild(div);
            setTimeout(() => div.classList.add('show'), 50);
            
            setTimeout(() => {
                div.classList.remove('show');
                div.classList.add('hide');
                setTimeout(() => {
                    div.remove(); // Remove do DOM
                    achievementPool.push(div); // Devolve ao pool
                }, 400);
            }, duration * 1000);
        }
		
		// --- Função para checar conquista de arma ---
        // --- (Aceita newLevel e atualiza lógica) ---
        function checkWeaponAchievement(weaponId, newLevel) {
            const definition = PASSIVE_WEAPON_DEFINITIONS[weaponId];
            if (!definition) return;

            // 1. CONDIÇÃO PRINCIPAL: Só prossiga se a arma atingiu o Nível MÁXIMO
            if (newLevel !== definition.maxLevel) {
                return; // Se não for o nível máximo, não faz nada
            }

            let achievementKey, achievementId, message;
            
            // --- (Atualiza as mensagens) ---
            switch(weaponId) {
                case 'auraDourada':      achievementKey = 'canGetArmaAuraDourada';      achievementId = 'ARMA_AURA_DOURADA';    message = `🌟 Iluminado! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'garrasAfiadas':    achievementKey = 'canGetArmaGarrasAfiadas';    achievementId = 'ARMA_GARRAS_AFIADAS';  message = `🔪 Manicure Afiada! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'orbeArcano':       achievementKey = 'canGetArmaOrbeArcano';       achievementId = 'ARMA_ORBE_ARCANO';     message = `🔮 Vidente! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'cometaCadente':    achievementKey = 'canGetArmaCometaCadente';    achievementId = 'ARMA_COMETA_CADENTE';  message = `☄️ Observador de Estrelas! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'chaoConsagrado':   achievementKey = 'canGetArmaChaoConsagrado';   achievementId = 'ARMA_CHAO_CONSAGRADO'; message = `🔥 Piromante! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'pulsoCinetico':    achievementKey = 'canGetArmaPulsoCinetico';    achievementId = 'ARMA_PULSO_CINETICO';  message = `💨 Campo de Força! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'espinhosTraseiros': achievementKey = 'canGetArmaEspinhosTraseiros'; achievementId = 'ARMA_ESPINHOS_TRASEIROS'; message = `🌵 Porco-Espinho! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'varinhaMagica':    achievementKey = 'canGetArmaVarinhaMagica';    achievementId = 'ARMA_VARINHA_MAGICA';  message = `🪄 Prestidigitador! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'coringaSelvagem':  achievementKey = 'canGetArmaCoringaSelvagem';  achievementId = 'ARMA_CORINGA_SELVAGEM'; message = `🃏 O Apostador! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'presaRetornavel':  achievementKey = 'canGetArmaPresaRetornavel'; achievementId = 'ARMA_PRESA_RETORNAVEL'; message = `🪃 Bumerangue! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'bardoAmaldicoado': achievementKey = 'canGetArmaBardo';        achievementId = 'ARMA_BARDO';           message = `🪕 Trovador! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'laminasGemeas':    achievementKey = 'canGetArmaLaminas';      achievementId = 'ARMA_LAMINAS';         message = `✂️ O Alfaiate! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'pocaoInstavel':    achievementKey = 'canGetArmaAlquimista';   achievementId = 'ARMA_ALQUIMISTA';    message = `🧪 Alquimista! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'dadosViciados':    achievementKey = 'canGetArmaJogador';      achievementId = 'ARMA_JOGADOR';       message = `🎲 Jogador! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'machadoGiratorio': achievementKey = 'canGetArmaLenhador';     achievementId = 'ARMA_LENHADOR';      message = `🪓 Lenhador! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'ritualSangrento':  achievementKey = 'canGetArmaHemomante';    achievementId = 'ARMA_HEMOMANTE';     message = `🩸 Hemomante! ${definition.name} Nível ${definition.maxLevel}!`; break;
                // --- NOVAS ARMAS ---
                case 'pavioCurto': achievementKey = 'canGetArmaPavioCurto'; achievementId = 'ARMA_PAVIO_CURTO'; message = `🧨 Engenheiro de Demolição! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'adagaCerteira': achievementKey = 'canGetArmaAdagaCerteira'; achievementId = 'ARMA_ADAGA_CERTEIRA'; message = `🗡️ Precisão Mortal! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'esporosExplosivos': achievementKey = 'canGetArmaEsporosExplosivos'; achievementId = 'ARMA_ESPOROS_EXPLOSIVOS'; message = `🍄 Micologista de Combate! ${definition.name} Nível ${definition.maxLevel}!`; break;
                case 'cloneInstavel': achievementKey = 'canGetArmaCloneInstavel'; achievementId = 'ARMA_CLONE_INSTAVEL'; message = `🧬 Engenharia Genética! ${definition.name} Nível ${definition.maxLevel}!`; break;
                // --- FIM NOVAS ARMAS ---
				
                default: return; // Arma desconhecida
            }

            // Acessa a flag global correspondente
            if (window[achievementKey]) {
                showAchievement(message, 0.05, 3, achievementId); // Bônus de 5% XP e salva
                window[achievementKey] = false; // Marca como obtida nesta partida
            }
        }

        function checkAchievements() {
            // (As checagens de conquistas já usam showAchievement com o ID correto)
            // Os checks condicionais (ex: if (canGetPeLeve && gameTime >= 120)) permanecem os mesmos,
            // mas agora a chamada a showAchievement() inclui o ID.

             // Pé Leve (2 mins)
            if (canGetPeLeve && gameTime >= 120) {
                showAchievement("👟 Pé Leve! Sobreviveu por 2 minutos!", 0.05, 3, 'PE_LEVE');
                canGetPeLeve = false;
            }

            // Maratonista (5 mins)
            if (canGetMaratonista && gameTime >= 300) {
                showAchievement("🏃 Maratonista! Sobreviveu por 5 minutos!", 0.10, 3, 'MARATONISTA');
                canGetMaratonista = false;
            }

             // Economista (Level 5, no SP)
            if (canGetEconomista && player.level >= 5) {
                if (!hasUsedSP) {
                    showAchievement(" frugal Economista! Chegou ao Nível 5 sem usar SP!", 0.15, 3, 'ECONOMISTA');
                }
                canGetEconomista = false; // Check only once
            }

            // Mid-Game
            if (canGetDestruidor && destructiblesDestroyed >= 20) {
                showAchievement("🏺 Destruidor! Quebrou 20+ objetos!", 0.05, 3, 'DESTRUIDOR');
                canGetDestruidor = false;
            }
            if (canGetDefensorDaHorda && gameTime > HORDE_INTERVAL && hordeTimer < HORDE_INTERVAL - 5) { // Verifica se já passou do tempo da 1ª horda
                showAchievement("🧟 Defensor da Horda! Sobreviveu à primeira Horda!", 0.05, 3, 'DEFENSOR_DA_HORDA');
                canGetDefensorDaHorda = false;
            }
            if (canGetColecionadorAvido && gemsCollectedThisGame >= 100) {
                showAchievement("💠 Colecionador Ávido! Coletou 100+ Gemas!", 0.05, 3, 'COLECIONADOR_AVIDO');
                canGetColecionadorAvido = false;
            }
             if (canGetSortudo && powerupsCollectedThisGame >= 5) {
                showAchievement("⭐ Sortudo! Coletou 5+ Brindes!", 0.05, 3, 'SORTUDO');
                canGetSortudo = false;
            }

            // End-Game
            if (canGetInvencivel && gameTime >= 900) { // 15 minutos
                showAchievement("⏳ Invencível! Sobreviveu por 15 minutos!", 0.15, 3, 'INVENCIVEL');
                canGetInvencivel = false;
            }
             if (canGetDeusDaGuerra && dpsValue >= 1000) {
                showAchievement("🔥 Deus da Guerra! Alcançou 1000+ DPS!", 0.15, 3, 'DEUS_DA_GUERRA');
                canGetDeusDaGuerra = false;
            }
            if (canGetCeifador && player.enemiesDefeated >= 1000) {
                showAchievement("💀 Ceifador! Derrotou 1000+ inimigos!", 0.15, 3, 'CEIFADOR');
                canGetCeifador = false;
            }
             if (canGetCarrasco && bossesKilledThisGame >= 3) {
                showAchievement("👑 Carrasco! Derrotou 3 Chefes!", 0.20, 3, 'CARRASCO');
                canGetCarrasco = false;
            }

             // Colheita Rápida
            if (grapesCollectedInWindow >= 5) { // Checa se atingiu 5
                showAchievement("💠 Colheita Rápida! Coletou 5 Gemas em 5 segundos!", 0.05, 3, 'COLHEITA_RAPIDA');
                grapesCollectedInWindow = 0;
                grapeCollectionTimer = 0;
                // Não precisa de flag 'canGet', pois o timer controla
            }

            // Reserva de Poder
            if (canGetReservaDePoder) {
                if (killsWithMaxSP >= 10) {
                    showAchievement("🏆 Reserva de Poder! 10 abates com SP máximo!", 0.05, 3, 'RESERVA_DE_PODER');
                    killsWithMaxSP = 0;
                    canGetReservaDePoder = false;
                }
                if (player.sp < player.maxSp) {
                    killsWithMaxSP = 0;
                }
            }

             // Exterminador de Hordas
            if (canGetExterminadorHordas && zumbiKillsInWindow >= 20) {
                showAchievement("🏆 Exterminador de Hordas! 20 Zumbis em 10 segundos!", 0.10, 3, 'EXTERMINADOR_HORDAS');
                zumbiKillsInWindow = 0;
                zumbiKillTimer = 0;
                canGetExterminadorHordas = false;
            }

            // Intocável
            if (canGetIntocavel && shootersDefeatedInRow >= 3) {
                showAchievement("🏆 Intocável! 3 Atiradores/Aranhas derrotados sem ser atingido!", 0.10, 3, 'INTOCAVEL');
                shootersDefeatedInRow = 0;
                canGetIntocavel = false;
            }
            if (wasHitByProjectile) {
                shootersDefeatedInRow = 0;
                wasHitByProjectile = false;
            }

            // Outras checagens (Fúria, 10 kills sem dano, etc.)
            // ... (estas não precisam de ID pois são temporárias/visuais)

            if (player.hp < lastHp) {
                enemiesWithoutDamage = 0;
            }
            lastHp = player.hp;
        }
		
		// --- Sistema de Tutorial ---
        /**
         * Mostra uma dica de tutorial, pausando o jogo.
         * @param {string} title - O título da dica.
         * @param {string} text - O texto (pode conter HTML).
         */
        function showTutorialTip(title, text) {
            if (gameState !== 'PLAYING') return;

            playBeep(500, 0.1, 'sine', 0.4); // Som de transição
            gameState = 'PAUSED'; // Pausa o jogo manualmente

            tutorialTipTitle.textContent = title;
            tutorialTipText.innerHTML = text; // Usa innerHTML para permitir tags (ex: <strong>)
            tutorialTipScreen.classList.add('visible');

            // Adiciona classe para esconder botões
            document.getElementById('game-container').classList.add('game-level-up');

            document.getElementById('pause-screen').classList.remove('visible');
            pauseBtn.textContent = 'PAUSADO';
        }

        // Fecha a dica de tutorial
        function closeTutorialTip() {
            if (gameState !== 'PAUSED' && !tutorialTipScreen.classList.contains('visible')) return;

            playBeep(400, 0.1, 'sine', 0.4); // Som de transição
            tutorialTipScreen.classList.remove('visible');
            document.getElementById('game-container').classList.remove('game-level-up');

            gameState = 'PLAYING'; // Retoma o jogo
            pauseBtn.textContent = 'PAUSAR';

            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        }

        // Alerta visual para inimigos especiais
        function showSpecialEnemyAlert(type) {
            let text;

            // Altera o texto com base no tipo de alerta (Chefe, Elite ou Horda)
            if (type === 'CHEFE') {
                text = "PERIGO: CHEFE APARECEU!";
            } else if (type === 'ELITE') {
                text = "ALERTA: INIMIGO ELITE!";
            } else {
                text = "HORDA IMINENTE!"; // Texto padrão para hordas
            }

            specialEnemyAlertText.textContent = text;

            specialEnemyAlert.classList.remove('hidden', 'hide');
            specialEnemyAlert.classList.add('show');

            // Animação de saída
            setTimeout(() => {
                specialEnemyAlert.classList.remove('show');
                specialEnemyAlert.classList.add('hide');
            }, 1800);

            setTimeout(() => {
                specialEnemyAlert.classList.add('hidden');
            }, 2300);
        }
		
		// --- LOJA UNIFICADA ---
        /**
        * Abre a tela da loja unificada.
        * @param {string} tab - A aba para abrir ('meta' or 'skins').
        */
        function openStoreScreen(tab = 'meta') {
            playBeep(500, 0.1, 'sine', 0.4); // Som de transição
            
            // Garante que outras telas estejam fechadas
            document.getElementById('start-screen').classList.remove('visible');
            document.getElementById('game-over-screen').classList.remove('visible');
            
            storeScreen.classList.add('visible');
            
            // Popula ambas as lojas (para garantir que os dados de gemas/etc. estejam corretos)
            populateMetaUpgradeScreen();
            populateSkinStoreScreen();
            
            // Define a aba ativa
            setActiveTab(tab);
            
            // Adiciona classe para esconder botões
            document.getElementById('game-container').classList.add('game-level-up');
        }
        
        /**
         * Define qual aba da loja está ativa.
         * @param {string} tab - A aba para ativar ('meta' or 'skins').
         */
        function setActiveTab(tab) {
            if (tab === 'skins') {
                // Ativa a aba de Skins
                tabBtnMeta.classList.remove('active-setting');
                tabBtnSkins.classList.add('active-setting');
                
                metaContent.classList.add('hidden');
                skinContent.classList.remove('hidden');
                
                // Mostra/Esconde elementos do cabeçalho
                skinXpBonusContainer.classList.remove('hidden');
                resetMetaUpgradesBtn.classList.add('hidden');
                storeTitleText.textContent = "Loja de Skins";

            } else {
                // Ativa a aba de Melhorias (padrão)
                tabBtnMeta.classList.add('active-setting');
                tabBtnSkins.classList.remove('active-setting');
                
                metaContent.classList.remove('hidden');
                skinContent.classList.add('hidden');
                
                // Mostra/Esconde elementos do cabeçalho
                skinXpBonusContainer.classList.add('hidden');
                resetMetaUpgradesBtn.classList.remove('hidden');
                storeTitleText.textContent = "Melhorias Permanentes";
            }
        }

        /**
         * Fecha a tela da loja e volta para o menu ou game over.
         */
        function closeStoreScreen() {
            playBeep(400, 0.1, 'sine', 0.4); // Som de transição
            storeScreen.classList.remove('visible');
            
            // Decide para qual tela voltar
            if (gameState === 'MENU') {
                document.getElementById('start-screen').classList.add('visible');
            } else if (gameState === 'GAME_OVER') {
                document.getElementById('game-over-screen').classList.add('visible');
            }
            // A classe 'game-level-up' permanece, pois ainda estamos em um overlay
            
            // Atualiza o emoji da skin na tela inicial
            const skinEmojiEl = document.getElementById('start-screen-skin');
            if (skinEmojiEl) {
                skinEmojiEl.textContent = metaUpgrades.selectedSkin;
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
        
        // --- NOVAS FUNÇÕES DA LOJA DE SKINS ---

        /**
         * Preenche a loja de skins com as opções.
         */
        function populateSkinStoreScreen() {
            loadMetaUpgrades(); // Garante que os dados (Gemas, skins) estejam atualizados

            // Usa o display de gemas unificado
            storeGrapesBankDisplay.textContent = metaUpgrades.totalGrapesBank; 
            skinXpBonusDisplay.textContent = `+${(metaUpgrades.skinXpBonus * 100).toFixed(0)}%`;
            skinStoreOptions.innerHTML = ''; // Limpa opções antigas

            SKIN_LIST.forEach(skin => {
                const isUnlocked = metaUpgrades.unlockedSkins.includes(skin.id);
                const isSelected = metaUpgrades.selectedSkin === skin.id;
                
                // --- INÍCIO - LÓGICA DE CUSTO/BÔNUS DINÂMICO ---
                const isPremium = PREMIUM_SKINS.includes(skin.id);
                const cost = isPremium ? PREMIUM_SKIN_COST : SKIN_COST;
                const bonus = isPremium ? PREMIUM_SKIN_XP_BONUS : SKIN_XP_BONUS_PER_SKIN;

                const canAfford = metaUpgrades.totalGrapesBank >= cost;

                const itemDiv = document.createElement('div');
                itemDiv.className = 'skin-item'; // Nova classe CSS

                let buttonHTML;
                if (isSelected) {
                    // Skin está selecionada
                    buttonHTML = `<button class="skin-button selected-skin" disabled>Selecionada</button>`;
                } else if (isUnlocked) {
                    // Skin desbloqueada, mas não selecionada
                    buttonHTML = `
                        <button class="skin-button select-skin" data-skin-id="${skin.id}" data-action="select">
                            Selecionar
                        </button>
                    `;
                } else {
                    // Skin não desbloqueada
                    buttonHTML = `
                        <button 
                            class="skin-button ${!canAfford ? 'disabled' : ''}" 
                            ${!canAfford ? 'disabled' : ''}
                            data-skin-id="${skin.id}" 
                            data-action="buy"
                        >
                            Comprar ( ${cost} 💠 )
                        </button>
                    `;
                }

				itemDiv.innerHTML = `
					<div class="skin-emoji">${skin.id}</div>
					<div class="skin-info">
						<h4>${skin.name}</h4>
						<p class="skin-bonus-desc">${skin.description}</p>
						<p class="skin-bonus-xp">+${(bonus * 100).toFixed(0)}% Bônus de XP</p>
					</div>
					${buttonHTML}
				`;
                skinStoreOptions.appendChild(itemDiv);
            });
        }
        
        /**
         * Manipulador de clique para a grade de skins.
         */
        function handleSkinStoreClick(e) {
            const button = e.target.closest('.skin-button');
            if (button && !button.disabled) {
                const skinId = button.dataset.skinId;
                const action = button.dataset.action;

                if (action === 'buy') {
                    purchaseSkin(skinId);
                } else if (action === 'select') {
                    selectSkin(skinId);
                }
            }
        }
		
		/**
        * Lógica de compra de uma skin.
        */
        function purchaseSkin(skinId) {
            if (metaUpgrades.unlockedSkins.includes(skinId)) return; // Já possui
            
            // --- LÓGICA DE CUSTO/BÔNUS DINÂMICO ---
            const isPremium = PREMIUM_SKINS.includes(skinId);
            const cost = isPremium ? PREMIUM_SKIN_COST : SKIN_COST;
            const bonus = isPremium ? PREMIUM_SKIN_XP_BONUS : SKIN_XP_BONUS_PER_SKIN;
            
            if (metaUpgrades.totalGrapesBank >= cost) {
                playBeep(900, 0.1, 'sine', 0.8); // Som de sucesso

                // Deduz o custo, desbloqueia a skin, aplica bônus
                metaUpgrades.totalGrapesBank -= cost;
                metaUpgrades.unlockedSkins.push(skinId);
                metaUpgrades.skinXpBonus += bonus; // Adiciona bônus

                saveMetaUpgrades(); // Salva o progresso
                populateSkinStoreScreen(); // Atualiza a UI da loja
                
                // Feedback de bônus (usa o sistema de conquistas, mas sem ID)
                showAchievement(`Skin ${skinId} desbloqueada!`, bonus, 3, null);
            } else {
                playBeep(120, 0.1, 'square', 0.7); // Som de falha
            }
        }
        
        /**
         * Lógica de seleção de uma skin.
         */
        function selectSkin(skinId) {
            if (!metaUpgrades.unlockedSkins.includes(skinId)) return; // Não possui

            playBeep(700, 0.05, 'triangle', 0.6); // Som de seleção
            
            metaUpgrades.selectedSkin = skinId;
            saveMetaUpgrades();
            populateSkinStoreScreen();
            
            // Atualiza o emoji na tela inicial COM animação
            const skinEmojiEl = document.getElementById('start-screen-skin');
            if (skinEmojiEl) {
                skinEmojiEl.textContent = metaUpgrades.selectedSkin;
                // Adiciona a classe de animação e a remove após a animação
                skinEmojiEl.classList.add('celebrate-skin');
                setTimeout(() => skinEmojiEl.classList.remove('celebrate-skin'), 600); // 600ms (duração da animação)
            }
        }
		
		/**
        * Lógica de compra de um upgrade.
        * É chamada pelo event listener adicionado em 'window.onload'.
        */
        function purchaseMetaUpgrade(upgradeId) {
            const upgrade = META_UPGRADE_LIST.find(u => u.id === upgradeId);
            if (!upgrade) return;

            const currentLevel = metaUpgrades[upgrade.id] || 0;
            if (currentLevel >= upgrade.maxLevel) return; // Já está no máximo

            const cost = upgrade.getCost(currentLevel);

            if (metaUpgrades.totalGrapesBank >= cost) {
                playBeep(900, 0.1, 'sine', 0.8); // Som de sucesso

                // Deduz o custo e aumenta o nível
                metaUpgrades.totalGrapesBank -= cost;
                metaUpgrades[upgrade.id] = currentLevel + 1;

                saveMetaUpgrades(); // Salva o progresso
                populateMetaUpgradeScreen(); // Atualiza a UI da loja
            } else {
                playBeep(120, 0.1, 'square', 0.7); // Som de falha
            }
        }
        
        /**
         * Reseta todas as melhorias permanentes.
         * Calcula o custo total gasto, reembolsa 100% e zera todos os nívei.
         * NÃO reseta as skins nem o bônus de skin.
         * NÃO reseta o Códice nem as Conquistas.
         */
        function resetMetaUpgrades() {
            let totalCostSpent = 0;
            
            // 1. Calcula o custo total gasto (APENAS em META_UPGRADE_LIST)
            META_UPGRADE_LIST.forEach(upgrade => {
                const currentLevel = metaUpgrades[upgrade.id] || 0;
                if (currentLevel > 0) {
                    // Soma o custo de cada nível individualmente
                    for (let level = 0; level < currentLevel; level++) {
                        totalCostSpent += upgrade.getCost(level);
                    }
                }
            });

            // 2. Calcula o reembolso (100%)
            const refundAmount = totalCostSpent;

            // 3. Reseta o objeto metaUpgrades
            const newTotalGrapes = (metaUpgrades.totalGrapesBank || 0) + refundAmount;
            
            // Preserva as propriedades das skins E CÓDICE/CONQUISTAS
            const skins = metaUpgrades.unlockedSkins;
            const selected = metaUpgrades.selectedSkin;
            const skinBonus = metaUpgrades.skinXpBonus;
            const uEnemies = metaUpgrades.unlockedEnemies;
            const uWeapons = metaUpgrades.unlockedWeapons;
            const uItems = metaUpgrades.unlockedItems;
            const uAchievements = metaUpgrades.unlockedAchievements;
            
            const defaultKeys = Object.keys(metaUpgrades); 
            metaUpgrades = {}; // Limpa
            
            // Recria o objeto com valores zerados
            defaultKeys.forEach(key => {
                // Não reseta as propriedades de skin, códice ou conquistas
                if (!['unlockedSkins', 'selectedSkin', 'skinXpBonus', 
                      'unlockedEnemies', 'unlockedWeapons', 'unlockedItems', 
                      'unlockedAchievements'].includes(key)) 
                {
                     metaUpgrades[key] = 0; // Reseta todos os bônus
                }
            });
            
            // Define o novo total de Gemas e restaura as propriedades
            metaUpgrades.totalGrapesBank = newTotalGrapes;
            metaUpgrades.unlockedSkins = skins;
            metaUpgrades.selectedSkin = selected;
            metaUpgrades.skinXpBonus = skinBonus;
            metaUpgrades.unlockedEnemies = uEnemies;
            metaUpgrades.unlockedWeapons = uWeapons;
            metaUpgrades.unlockedItems = uItems;
            metaUpgrades.unlockedAchievements = uAchievements;

            // 4. Salva e atualiza a UI
            saveMetaUpgrades();
            populateMetaUpgradeScreen(); // Atualiza a loja

            // 5. Feedback de sucesso
            playBeep(1000, 0.1, 'sine', 0.9);
            setTimeout(() => playBeep(800, 0.15, 'sine', 0.8), 100);
            
            // Usamos a notificação de conquista para confirmar (sem bônus de XP, sem ID de conquista)
            showAchievement(`Melhorias resetadas! Você recebeu ${refundAmount} 💠 de volta! (Skins/Códice mantidos)`, 0, 4, null);
        }
		
		// --- NOVAS FUNÇÕES (CÓDICE) ---
        /**
        * Abre a tela do Códice.
        */
        function openCodexScreen() {
            playBeep(500, 0.1, 'sine', 0.4); // Som de transição
            
            document.getElementById('start-screen').classList.remove('visible');
            codexScreen.classList.add('visible');
            
            // Popula o Códice
            populateCodexScreen();
            
            // Define a aba padrão (Inimigos)
            setCodexActiveTab('enemies');
            
            document.getElementById('game-container').classList.add('game-level-up');
        }

        /**
         * Fecha a tela do Códice.
         */
        function closeCodexScreen() {
            playBeep(400, 0.1, 'sine', 0.4); // Som de transição
            codexScreen.classList.remove('visible');
            
            // Volta para o Menu
            document.getElementById('start-screen').classList.add('visible');
        }
        
        /**
         * Define a aba ativa no Códice.
         */
        function setCodexActiveTab(tab) {
            // Desativa todas
            tabBtnEnemies.classList.remove('active-setting');
            tabBtnWeapons.classList.remove('active-setting');
            tabBtnItems.classList.remove('active-setting');
            codexEnemiesContent.classList.add('hidden');
            codexWeaponsContent.classList.add('hidden');
            codexItemsContent.classList.add('hidden');

            // Ativa a correta
            if (tab === 'weapons') {
                tabBtnWeapons.classList.add('active-setting');
                codexWeaponsContent.classList.remove('hidden');
            } else if (tab === 'items') {
                tabBtnItems.classList.add('active-setting');
                codexItemsContent.classList.remove('hidden');
            } else { // 'enemies'
                tabBtnEnemies.classList.add('active-setting');
                codexEnemiesContent.classList.remove('hidden');
            }
        }
        
        /**
         * Preenche a tela do Códice com os dados descobertos.
         */
        function populateCodexScreen() {
            loadMetaUpgrades(); // Garante que os dados de 'unlocked' estejam carregados
            
            // 1. Preenche Inimigos
            codexEnemiesGrid.innerHTML = '';
            for (const [id, def] of Object.entries(ENEMY_DEFINITIONS)) {
                const isUnlocked = metaUpgrades.unlockedEnemies.includes(id);
                const itemDiv = document.createElement('div');
                itemDiv.className = `codex-item ${isUnlocked ? '' : 'locked'}`;
                
                itemDiv.innerHTML = `
                    <div class="codex-emoji">${isUnlocked ? def.emoji : '❓'}</div>
                    <div class="codex-info">
                        <h4>${isUnlocked ? def.name : '???'}</h4>
                        <p>${isUnlocked ? def.desc : 'Derrote este inimigo para desbloquear.'}</p>
                    </div>
                `;
                codexEnemiesGrid.appendChild(itemDiv);
            }
            
            // 2. Preenche Armas
            codexWeaponsGrid.innerHTML = '';
            for (const [id, def] of Object.entries(PASSIVE_WEAPON_DEFINITIONS)) {
                const isUnlocked = metaUpgrades.unlockedWeapons.includes(id);
                const itemDiv = document.createElement('div');
                itemDiv.className = `codex-item ${isUnlocked ? '' : 'locked'}`;
                
                itemDiv.innerHTML = `
                    <div class="codex-emoji">${isUnlocked ? def.emoji : '❓'}</div>
                    <div class="codex-info">
                        <h4>${isUnlocked ? def.name : '???'}</h4>
                        <p>${isUnlocked ? def.stats[0].description : 'Colete esta arma para desbloquear.'}</p>
                    </div>
                `;
                codexWeaponsGrid.appendChild(itemDiv);
            }

            // 3. Preenche Itens
            codexItemsGrid.innerHTML = '';
            for (const [id, def] of Object.entries(ITEM_DEFINITIONS)) {
                const isUnlocked = metaUpgrades.unlockedItems.includes(id);
                const itemDiv = document.createElement('div');
                itemDiv.className = `codex-item ${isUnlocked ? '' : 'locked'}`;
                
                itemDiv.innerHTML = `
                    <div class="codex-emoji">${isUnlocked ? def.emoji : '❓'}</div>
                    <div class="codex-info">
                        <h4>${isUnlocked ? def.name : '???'}</h4>
                        <p>${isUnlocked ? def.desc : 'Colete este item para desbloquear.'}</p>
                    </div>
                `;
                codexItemsGrid.appendChild(itemDiv);
            }
        }

        // --- NOVAS FUNÇÕES (CONQUISTAS) ---

        /**
         * Abre a tela de Conquistas.
         */
        function openAchievementsScreen() {
            playBeep(500, 0.1, 'sine', 0.4); // Som de transição
            
            document.getElementById('start-screen').classList.remove('visible');
            achievementsScreen.classList.add('visible');
            
            // Popula a lista
            populateAchievementsScreen();
            
            document.getElementById('game-container').classList.add('game-level-up');
        }

        /**
         * Fecha a tela de Conquistas.
         */
        function closeAchievementsScreen() {
            playBeep(400, 0.1, 'sine', 0.4); // Som de transição
            achievementsScreen.classList.remove('visible');
            
            // Volta para o Menu
            document.getElementById('start-screen').classList.add('visible');
        }

        /**
         * Preenche a tela de Conquistas com os dados salvos.
         */
        function populateAchievementsScreen() {
            loadMetaUpgrades(); // Garante que 'unlockedAchievements' esteja carregado
            achievementsList.innerHTML = '';

            MASTER_ACHIEVEMENT_LIST.forEach(ach => {
                const isUnlocked = metaUpgrades.unlockedAchievements.includes(ach.id);
                const itemDiv = document.createElement('div');
                itemDiv.className = `achievement-item ${isUnlocked ? '' : 'locked'}`;
                
                itemDiv.innerHTML = `
                    <div class="achievement-icon">🏆</div>
                    <div class="achievement-info">
                        <h4>${ach.name}</h4>
                        <p>${isUnlocked ? ach.desc : '???'}</p>
                    </div>
                `;
                achievementsList.appendChild(itemDiv);
            });
        }
		
		// --- Funções de Level Up e Reroll ---
        // Atualiza o estado visual do botão de reroll (custo e se está ativo)
        function updateRerollButtonState() {
            if (!rerollBtn) return; // Garante que o botão exista

            // Giros Grátis
            if (freeRerolls > 0) {
                rerollBtn.textContent = `Girar (Grátis: ${freeRerolls}x)`;
                rerollBtn.classList.remove('disabled');
                rerollBtn.disabled = false;
            } else {
                rerollBtn.textContent = `Girar (${REROLL_COST}💠)`;
                if (player.grapes < REROLL_COST) {
                    rerollBtn.classList.add('disabled');
                    rerollBtn.disabled = true;
                } else {
                    rerollBtn.classList.remove('disabled');
                    rerollBtn.disabled = false;
                }
            }
        }

        // Tenta usar as Gemas para girar os upgrades
        function attemptReroll() {
            // Lógica do Giro Grátis
            const hasFreeReroll = freeRerolls > 0;

            if (hasFreeReroll || player.grapes >= REROLL_COST) {
                playBeep(700, 0.05, 'triangle', 0.6);
                setTimeout(() => playBeep(600, 0.05, 'triangle', 0.6), 60);

                // Consome Giro Grátis ou Gemas
                if (hasFreeReroll) {
                    freeRerolls--;
                } else {
                    player.grapes -= REROLL_COST;
                }

                generateUpgradeOptions(); // Gera novas opções
                updateHUDs(); // Atualiza o contador de Gemas
                updateRerollButtonState(); // Atualiza o botão
                triggerCollectPop('Gema'); // Feedback visual
            } else {
                playBeep(120, 0.1, 'square', 0.7); // Som de falha

                // Feedback visual de falha (treme o botão)
                if (!rerollBtn.classList.contains('shake-button')) {
                    rerollBtn.classList.add('shake-button');
                    setTimeout(() => rerollBtn.classList.remove('shake-button'), 300);
                }
            }
        }

        /**
         * Pega o pool de todos os upgrades disponíveis (Padrão + Armas Passivas)
         */
        function getAllAvailableUpgrades() {
            const allAvailableUpgrades = [...UPGRADES];

            // 1. Verifica quantas armas o jogador já possui
            const numPassiveWeapons = Object.keys(player.passiveWeapons).length;

            // Itera sobre as definições de Armas Passivas
            for (const [weaponId, definition] of Object.entries(PASSIVE_WEAPON_DEFINITIONS)) {

                const currentWeapon = player.passiveWeapons[weaponId];
                const currentLevel = currentWeapon ? currentWeapon.level : 0;
                const hasThisWeapon = currentLevel > 0;

                // 2. Decide se podemos oferecer esta arma
                // Condição A: O jogador já tem esta arma (pode fazer upgrade).
                // Condição B: O jogador tem MENOS de 3 armas (pode pegar uma nova).
                const canOfferWeapon = hasThisWeapon || (numPassiveWeapons < 3);

                // 3. Se não puder oferecer, pula para a próxima arma na lista
                if (!canOfferWeapon) {
                    continue; // Pula esta arma, pois o jogador tem 2 e esta seria uma 3ª nova
                }

                // Lógica original (Verifica se a arma pode subir de nível)
                if (currentLevel < definition.maxLevel) {
                    // O jogador pode pegar ou atualizar esta arma
                    const nextLevel = currentLevel + 1;
                    const stats = definition.stats[nextLevel - 1]; // Pega os stats do próximo nível

                    // Cria um objeto de upgrade dinâmico
                    const weaponUpgrade = {
                        name: `${definition.emoji} ${definition.name} Nv. ${nextLevel}`,
                        description: stats.description,
                        category: definition.category,
                        emoji: definition.emoji, // Para o Toast
                        weaponId: weaponId, // --- Adiciona o ID para a conquista ---

                        // A função 'apply' adiciona ou atualiza a arma
                        apply: () => {
                            if (currentLevel === 0) {
                                // É um novo upgrade, chama o método do player
                                player.addPassiveWeapon(weaponId);
                            } else {
                                // Apenas aumenta o nível
                                currentWeapon.level++;
                            }
                        },

                        // Contexto dinâmico (opcional, mas bom ter)
                        getContext: () => {
                            if (currentLevel > 0) {
                                return `(Atual: Nv. ${currentLevel} &rarr; <span class='text-green-300'>Nv. ${nextLevel}</span>)`;
                            }
                            return `<span class='text-green-300'>NOVA ARMA PASSIVA</span>`;
                        }
                    };
                    allAvailableUpgrades.push(weaponUpgrade);
                }
            }
            return allAvailableUpgrades;
        }

        // Gera as 3 opções de upgrade e as exibe na tela
        function generateUpgradeOptions() {
            const optionsContainer = document.getElementById('upgrade-options');
            optionsContainer.innerHTML = '';

            // *** Usa o novo helper para pegar TODAS as opções ***
            const availableUpgrades = getAllAvailableUpgrades();

            const selectedUpgrades = [];
            for (let i = 0; i < 3 && availableUpgrades.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * availableUpgrades.length);
                selectedUpgrades.push(availableUpgrades.splice(randomIndex, 1)[0]);
            }

            // Cria os elementos HTML para cada opção
            selectedUpgrades.forEach(upgrade => {
                const div = document.createElement('div');

                const category = upgrade.category || 'default';
                const categoryName = UPGRADE_CATEGORY_NAMES[category] || 'BÔNUS';

                // Adiciona emoji (Usa o emoji da arma se for uma, senão o padrão)
                let emoji = upgrade.emoji || '✨'; // Pega o emoji da definição da arma
                if (category === 'ofensivo') emoji = '💥';
                else if (category === 'defensivo') emoji = '❤️';
                else if (category === 'utilidade') emoji = '👟';
                else if (category === 'critico') emoji = '🎯';
                else if (category === 'especial') emoji = '📈';

                div.className = `upgrade-option hover:shadow-lg category-${category}`;

                // A lógica de contexto agora vem do objeto de upgrade
                const contextText = upgrade.getContext ? upgrade.getContext() : "";

                div.innerHTML = `
                    <span class="upgrade-category-tag tag-${category}">${categoryName}</span>
                    <p class="text-lg font-bold text-white">${emoji} ${upgrade.name}</p>
                    <p class="text-sm text-gray-300 mt-2 px-2">
                        ${upgrade.description}
                        <br><span class="text-sm text-yellow-300">${contextText}</span>
                    </p>
                `;

                // Define o clique para aplicar o upgrade e fechar a tela
				div.onclick = () => {
					// 1. Desabilita cliques em outras opções e no próprio div
					optionsContainer.querySelectorAll('.upgrade-option').forEach(opt => opt.style.pointerEvents = 'none');
					div.style.pointerEvents = 'none'; // Impede clique duplo

					// 2. Adiciona a classe de animação
					div.classList.add('upgrade-selected-animation');

					// 3. Toca o som de seleção
					playBeep(700, 0.05, 'square', 0.6); // Som de clique (movido para antes do delay)

					// 4. Espera a animação terminar (300ms) antes de continuar
					setTimeout(() => {
						// Código original que estava dentro do onclick:
						player.applyUpgrade(upgrade); // Usa o método do player

						player.level++;
						player.xp = 0;
						player.xpNeeded = getXPNeeded(player.level);

						document.getElementById('level-up-screen').classList.remove('visible');
						document.getElementById('game-container').classList.remove('game-level-up');

						// Remove a classe de animação para a próxima vez (embora a tela já vá sumir)
						div.classList.remove('upgrade-selected-animation'); 
						// Readiciona pointerEvents caso algo dê errado (embora a tela vá sumir)
						optionsContainer.querySelectorAll('.upgrade-option').forEach(opt => opt.style.pointerEvents = '');

						gameState = 'PLAYING';
						lastTime = performance.now();
						requestAnimationFrame(gameLoop);

					}, 300); // <-- Tempo igual à duração da animação CSS
                };
                optionsContainer.appendChild(div);
            });
        }
		
		// Ativa a tela de Level Up
        function levelUp() {
            playBeep(500, 0.1, 'sine', 0.4); // Som de transição
			playBeep(440, 0.2, 'sine', 0.9); // Nota fundamental (Lá)
            setTimeout(() => playBeep(660, 0.15, 'sine', 0.8), 50); // A Quinta (Mi)
            setTimeout(() => playBeep(880, 0.1, 'sine', 0.7), 100); // A Oitava

            // Explosão de partículas
            spawnParticles(player.x, player.y, 50, '#facc15', 3, 6, 4, 10, 1.0); // Douradas
            spawnParticles(player.x, player.y, 50, '#06f79a', 2, 5, 3, 8, 1.0); // Cor de ação

            gameState = 'LEVEL_UP';

			gameState = 'LEVEL_UP_TRANSITION'; //
            document.getElementById('game-container').classList.add('game-level-up');

            triggerLevelGlow(); // Feedback visual

            // --- Conquistas de Nível ---
            if (player.level === 9 && canGetEspecialista) { // (Nível 9 -> 10)
                showAchievement("🏆 Especialista! Alcançou Nível 10!", 0.05, 3, 'ESPECIALISTA');
                canGetEspecialista = false;
            } else if (player.level === 24 && canGetMestreDeClasse) { // (Nível 24 -> 25)
                showAchievement("🏆 Mestre de Classe! Alcançou Nível 25!", 0.10, 3, 'MESTRE_DE_CLASSE');
                canGetMestreDeClasse = false;
            }

            // Animação de pulsação da barra de XP
            xpBar.classList.add('xp-level-up-pulse');
            setTimeout(() => xpBar.classList.remove('xp-level-up-pulse'), 500);

            // Roteador de Level Up
            // Se for o Nível 1 E o jogador ainda não escolheu uma classe:

            // Mostra o texto "LEVEL UP!" flutuante
            showFloatingText(player.x, player.y - 40, 'LEVEL UP!', 'upgrade');

            // Espera 500ms (meio segundo) antes de mostrar a tela de seleção
            setTimeout(() => {
                // Se o jogador não morreu/saiu nesse meio tempo
                if (gameState === 'LEVEL_UP_TRANSITION') { 
                    gameState = 'LEVEL_UP'; // Define o estado final
                    
                    // Roteador de Level Up (seu código existente)
                    if (player.level === 1 && !player.hasClass) {
                        showClassSelection();
                    } else {
                        showStandardLevelUp();
                    }
                    // A tela (level-up-screen) é tornada visível DENTRO dessas funções
                }
            }, 500); // Atraso de 500ms
        }
		
		/**
        * Mostra a tela de seleção de CLASSE (Nível 1 -> 2)
        */
        function showClassSelection() {
            const levelUpScreen = document.getElementById('level-up-screen');

            levelUpScreen.querySelector('h1').textContent = 'ESCOLHA SUA CLASSE! (Permanente)';

            // Esconde os botões de Reroll e Skip
            if (rerollBtn) rerollBtn.style.display = 'none';
            document.getElementById('skip-upgrade-button').style.display = 'none';

            generateClassOptions();
            levelUpScreen.classList.add('visible');
        }

        /**
         * Mostra a tela de Aprimoramento PADRÃO (Nível 2+)
         */
        function showStandardLevelUp() {
            const levelUpScreen = document.getElementById('level-up-screen');

            levelUpScreen.querySelector('h1').textContent = 'NOVO NÍVEL! Escolha um Aprimoramento:';

            // Garante que os botões de Reroll e Skip estejam visíveis
            if (rerollBtn) rerollBtn.style.display = '';
            document.getElementById('skip-upgrade-button').style.display = '';

            generateUpgradeOptions();
            updateRerollButtonState(); // Atualiza o estado do botão de Reroll

            levelUpScreen.classList.add('visible');
        }
		
		// --- Pular a seleção de Level Up ---
        function skipLevelUp() {
            playBeep(300, 0.1, 'sine', 0.7); // Som de "cancelar"

            // Recompensa por pular
            const reward = 5;
            player.grapes += reward;
            showFloatingText(player.x, player.y - 20, `+${reward} 💠`, 'crit');

            // Lógica padrão de fim de level up
            player.level++;
            player.xp = 0;
            player.xpNeeded = getXPNeeded(player.level);

            document.getElementById('level-up-screen').classList.remove('visible');
            document.getElementById('game-container').classList.remove('game-level-up');

            gameState = 'PLAYING';
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
            updateHUDs(); // Atualiza o contador de Gemas
        }
		
		// Feedback visual de falha ao usar habilidade (sem SP ou em CD)
        function triggerAbilityFail(btn, cost) {
			playBeep(120, 0.1, 'square', 0.7); // Som de falha
			playBeep(125, 0.1, 'square', 0.7); // Tom dissonante (faz soar como "buzz")

            // 1. Treme o botão
            if (!btn.classList.contains('shake-button')) {
                btn.classList.add('shake-button');
                setTimeout(() => btn.classList.remove('shake-button'), 300);
            }

            // 2. Pisca a barra de SP (se for por falta de SP)
            if (player.sp < cost) {
                if (!spBarBg.classList.contains('sp-flash-danger')) {
                    spBarBg.classList.add('sp-flash-danger');
                    setTimeout(() => spBarBg.classList.remove('sp-flash-danger'), 200);
                }
            }
        }
		
		// Ativa o efeito visual e o dano da habilidade "Impacto" (W)
        function activateImpactFlash(color, damageMultiplier) {
            playBeep(250, 0.15, 'sawtooth', 0.9); // Som de "boom"

            impactIndicator.active = true;
            impactIndicator.timer = 0.1;
            impactIndicator.x = player.x;
            impactIndicator.y = player.y;
            impactIndicator.color = color;
            cameraShake = Math.min(cameraShake + 1, 3);

            // Calcula o dano base do impacto
            const isCrit = Math.random() < player.critChance;
            const baseImpactDamage = (player.currentBaseDamage * damageMultiplier) * player.impactDamageMultiplier;

            // Usa a grade espacial para encontrar inimigos no raio
            const nearbyEnemies = spatialGrid.getNearby(player.x, player.y);
            const currentImpactRadius = impactIndicator.radius * player.impactAreaMultiplier;
            const impactRadiusSq = currentImpactRadius * currentImpactRadius;

            // CONQUISTA: Impacto Massivo
            let enemiesHitByImpact = 0;

            nearbyEnemies.forEach(target => {
                if (target.isAlive && distanceSquared(player.x, player.y, target.x, target.y) < impactRadiusSq) {

                    let finalDamage = isCrit
                        ? baseImpactDamage * player.critDamageMultiplier
                        : baseImpactDamage;

                    finalDamage *= player.getDynamicDamageMultiplier(); // Aplica Fúria

                    // Se for um Inimigo (tem 'type'), aplica Abate e Stun
                    if (target.type) {
                        // Aplica "Abate (Execute)"
                        if (target.hp / target.maxHp < player.abateThreshold) {
                            finalDamage *= 1.5;
                        }

                        target.takeDamage(finalDamage, isCrit);

                        // Aplica "Impacto Atordoante"
                        if (player.impactoAtordoanteDuration > 0) {
                            target.stunTimer = Math.max(target.stunTimer, player.impactoAtordoanteDuration);
                        }

                        player.triggerOnHitEffects(); // Ativa Vampiro/Bruxo
                        difficulty += 0.01;
                        enemiesHitByImpact++;
						} else {
                        // <<< INÍCIO DA SUBSTITUIÇÃO >>>
                        // Se for um Destrutível (ou qualquer outra coisa COM takeDamage), só causa dano
                        // ADICIONE ESTA VERIFICAÇÃO:
                        if (typeof target.takeDamage === 'function') {
                             target.takeDamage(finalDamage, isCrit); // Linha original, agora segura
                        }
                        // Se não tiver a função takeDamage (ex: é um projétil), simplesmente ignora.
                        // <<< FIM DA SUBSTITUIÇÃO >>>
                    }
                }
            });

            if (enemiesHitByImpact >= 10 && canGetImpactoMassivo) {
                showAchievement("💥 Impacto Massivo! Acertou 10+ inimigos com um único Impacto!", 0.05, 3, 'IMPACTO_MASSIVO');
                canGetImpactoMassivo = false;
            }

            // Partículas douradas para o Impacto
			spawnParticles(player.x, player.y, 10, 'rgba(245, 189, 31, 0.8)', 4, 8, 5, 12, 0.5);
        }