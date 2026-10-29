// classes.js

        // Classe base para Jogador e Inimigos
        class Entity {
            constructor(x, y, size, color, emoji, hp, damage) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.color = color;
                this.emoji = emoji;
                this.maxHp = hp;
                this.hp = hp;
                this.damage = damage;
                this.isAlive = true;
            }

			draw() {
                // Lógica de Opacidade (inalterada)
                const currentAttackRange = BASE_ATTACK_RANGE * player.attackRangeMultiplier;
                const currentAttackRangeSq = currentAttackRange * currentAttackRange;
                const distSq = distanceSquared(this.x, this.y, player.x, player.y);

                ctx.save();

                if (distSq > currentAttackRangeSq) {
                    const baseOpacity = 0.25;
                    ctx.globalAlpha = Math.min(1.0, baseOpacity + player.visionOpacityBonus);
                }

                ctx.translate(this.x, this.y);

                // --- (TELEGRAFAR) ---
                if (this.isChargingAttack) {
                    if (Math.floor(gameTime * 20) % 2 === 0) {
                         ctx.shadowColor = 'rgba(255, 255, 255, 0.9)'; // <-- AJUSTE (opacidade levemente menor)
                         ctx.shadowBlur = 7; // <-- AJUSTE (reduzido de 15)
                    } else {
                         ctx.shadowColor = 'rgba(239, 68, 68, 0.7)'; // <-- AJUSTE (opacidade levemente menor)
                         ctx.shadowBlur = 5; // <-- AJUSTE (reduzido de 10)
                    }
                } else {
                    ctx.shadowColor = 'rgba(239, 68, 68, 0.7)'; // <-- AJUSTE (opacidade levemente menor)
                    ctx.shadowBlur = 5; // <-- AJUSTE (reduzido de 10)
                }

                // --- FEEDBACK DEBUFF ---
                if (this.debuffs && this.debuffs['bardo'] && this.debuffs['bardo'].timer > 0) {
                    ctx.shadowColor = 'rgba(168, 85, 247, 0.9)'; // <-- AJUSTE (opacidade levemente menor)
                    ctx.shadowBlur = 8; // <-- AJUSTE (reduzido de 15)
                }

                // --- FEEDBACK VISUAL DE STATUS ---
                const isSlowed = this.stunTimer > 1.0;
                const isStunned = this.stunTimer > 0 && this.stunTimer <= 1.0;

                ctx.save();

                if (isStunned) {
                    // Efeito de Stun: Menos brilho e cinza mais sutil
                    ctx.filter = 'brightness(0.7) grayscale(15%)'; // <-- AJUSTE (brightness 0.7, grayscale 15%)
                    ctx.globalAlpha *= 0.85; // <-- AJUSTE (um pouco menos transparente)
                } else if (isSlowed) {
                    // Efeito de Slow: Tonalidade azulada um pouco mais sutil
                    ctx.filter = 'hue-rotate(180deg) saturate(120%) brightness(0.95)'; // <-- AJUSTE (saturate 120%, brightness 0.95)
                }

                // Desenha o emoji da entidade (inalterado)
                ctx.font = `${this.size * 0.8}px var(--pixel-font)`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.emoji, 0, 0);

                // === INÍCIO DO FEEDBACK DE FLASH (DANO) === (inalterado)
                if (this.hitFlashTimer > 0) {
                    const flashOpacity = (this.hitFlashTimer / 0.1);
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
                    ctx.fillText(this.emoji, 0, 0);
                    ctx.globalCompositeOperation = 'source-over';
                }
                // === FIM DO FEEDBACK DE FLASH ===

                // Reseta o shadow para não afetar a barra de vida
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;

                // Desenha a barra de vida (se não estiver cheia)
                if (this.hp < this.maxHp) {
                    const barWidth = this.size * 1.5;
                    const barHeight = 3;
                    const hpPercent = this.hp / this.maxHp;

                    ctx.fillStyle = 'gray';
                    ctx.fillRect(-barWidth / 2, this.size / 2 + 5, barWidth, barHeight);
                    ctx.fillStyle = 'red';
                    ctx.fillRect(-barWidth / 2, this.size / 2 + 5, barWidth * hpPercent, barHeight);
                }

                ctx.restore(); // Restaura filtros/alpha
                ctx.restore(); // Restaura translate/shadows
            }
        }
		
		// Classe para Inimigos
        class Enemy extends Entity {
            constructor(x, y, type, level, difficulty) {
                // 1. CHAME super() PRIMEIRO com valores genéricos/padrão
                super(0, 0, 0, 'none', '?', 1, 1);

                // 2. Chama init() para definir os valores reais
                this.init(x, y, type, level, difficulty, false);
            }

            /**
             * Inicializa/Reseta o inimigo do pool.
             * @param {boolean} isPoolingCall - Ignorado no construtor, usado para pooling.
             */
            init(x, y, type, level, difficulty, isPoolingCall = true) {
                 // Pega a definição do inimigo da lista mestra
                const def = ENEMY_DEFINITIONS[type] || ENEMY_DEFINITIONS['PADRAO'];
                let emoji = def.emoji;

                let size, color, hp, damage, speed;
                let projectileType = 'NORMAL';
                let projectileColor = 'red';

                const baseHp = 10 * difficulty;
                let baseDmg = 1;

                // Ajusta o dano baseado no tipo de inimigo
                let damageMultiplier = 1;
                if (type === 'PADRAO' || type === 'ATIRADOR' || type === 'GHOST' || type === 'ZUMBI' || type === 'ARANHA'|| type === 'ZUMBETE') {
                    damageMultiplier = 1.75;
                } else if (type === 'ELITE' || type === 'CHEFE') {
                    damageMultiplier = 3;
                }

                const finalDamage = (baseDmg * difficulty) * damageMultiplier;

                let isShooter = false;

                // Define atributos com base no tipo
                switch (type) {
                    case 'ZUMBI':
                        size = 20; color = '#22c55e';
                        hp = baseHp/2; damage = finalDamage; speed = 0.5;
                        break;
                    case 'PADRAO':
                        size = 20; color = '#ef4444';
                        hp = baseHp; damage = finalDamage; speed = 0.7;
                        break;
                    case 'GHOST':
                        size = 20; color = '#ef4444';
                        hp = baseHp/2; damage = finalDamage; speed = 1.5;
                        break;
                    case 'ATIRADOR':
                        size = 20; color = '#bfdbfe';
                        hp = baseHp; damage = finalDamage; speed = 0.3;
                        isShooter = true;
                        projectileType = 'NORMAL';
                        projectileColor = 'red';
                        break;
                    case 'ARANHA':
                        size = 20; color = '#a855f7';
                        hp = baseHp; damage = finalDamage; speed = 0.3;
                        isShooter = true;
                        projectileType = 'WEB';
                        projectileColor = '#a855f7';
                        break;
                    case 'ELITE':
                        size = 30; color = '#facc15';
                        hp = baseHp * 10; damage = finalDamage; speed = 0.6;
                        break;
                    case 'CHEFE':
                        size = 40; color = '#8b5cf6';
                        hp = baseHp * 15; damage = finalDamage; speed = 1;
                        break;
                    case 'ZUMBETE':
                        size = 20; color = '#22c55e';
                        hp = baseHp/2; damage = finalDamage; speed = 0.6;
                        break;
                    default: // Garante que as vars sejam definidas
                         size = 20; color = '#ef4444'; hp = baseHp; damage = finalDamage; speed = 0.7;
                         break;
                }

                // --- APENAS RESETA PROPRIEDADES HERDADAS ---
                this.x = x;
                this.y = y;
                this.size = size;
                this.color = color;
                this.emoji = emoji;
                this.maxHp = hp;
                this.hp = hp;
                this.damage = damage;
                this.isAlive = true; // MUITO IMPORTANTE!

                // Reseta todas as propriedades específicas
                this.type = type;
                this.speed = speed;
                this.level = level;
                this.stunTimer = 0;
                this.projectileType = projectileType;
                this.projectileColor = projectileColor;
                this.debuffs = {}; // Rastreia debuffs
                this.hitFlashTimer = 0; // Timer para o flash de dano
                this.isChargingAttack = false;
                this.chargeTimer = 0.2;
                this.isCorporeal = (type !== 'GHOST');
                this.id = Math.random(); // <-- MODIFICAÇÃO: Adiciona um ID aleatório simples

                if (isShooter) {
                    this.ghostProjectileTimer = 1.1; // Cooldown de tiro
                }
            }

            /**
             * Aplica lentidão ao inimigo.
             * @param {number} duration - A duração do slow em segundos.
             */
            applySlow(duration) {
                // A lentidão é aplicada através do stunTimer,
                // mas a velocidade é reduzida em vez de zerada.
                this.stunTimer = Math.max(this.stunTimer, duration);
                // A lógica de redução de velocidade será aplicada no update()
            }

            update(dt) {
                if (!this.isAlive) return;
                // Atualiza o timer do flash de dano
                if (this.hitFlashTimer > 0) {
                    this.hitFlashTimer -= dt;
                }

                // --- ATUALIZA DEBUFFS ---
                for (const key in this.debuffs) {
                    if (this.debuffs[key].timer > 0) {
                        this.debuffs[key].timer -= dt;
                    }
                }

                // Para de se mover se estiver em "hit-stun"
                let isSlowedByDebuff = false;

                if (this.stunTimer > 0) {
                    this.stunTimer -= dt;

                    // Se o stun for muito curto (hit-stun ou stun de habilidade), para total.
                    if (this.stunTimer < 1.0) { // Stuns curtos param o movimento
                         return;
                    } else {
                        // Se o stunTimer for longo (é um Slow), reduz a velocidade
                        isSlowedByDebuff = true;
                    }
                }

                // Lógica de movimento (perseguição)
                const distToPlayerSq = distanceSquared(this.x, this.y, player.x, player.y);
                const angle = Math.atan2(player.y - this.y, player.x - this.x);
                let currentSpeed = this.speed;

                // --- APLICA SLOW ---
                if (isSlowedByDebuff) {
                    currentSpeed *= 0.5; // Reduz velocidade em 50%
                }

                let finalAngle = angle;

                // Atiradores (e Aranhas) param a uma certa distância para atirar
                if (this.type === 'ATIRADOR' || this.type === 'ARANHA') {
                    const ATTACK_STOP_RANGE_SQ = 150 * 150;
                    if (distToPlayerSq < ATTACK_STOP_RANGE_SQ) {
                        currentSpeed = 0;
                    } else {
                        // Se está fora do alcance E lento, usa a velocidade lenta
                        currentSpeed = isSlowedByDebuff ? currentSpeed : this.speed;
                    }
                }

                // Ghosts têm um movimento levemente errático
                if (this.type === 'GHOST') {
                    const WIGGLE_MAGNITUDE = 0.1;
                    const WIGGLE_SPEED = 10;
                    const wiggle = Math.sin(gameTime * WIGGLE_SPEED) * WIGGLE_MAGNITUDE;
                    finalAngle += wiggle;
                }

                // Aplica o movimento
                if (currentSpeed > 0 || (this.type !== 'ATIRADOR' && this.type !== 'ARANHA')) {
                    this.x += Math.cos(finalAngle) * currentSpeed * dt * 60;
                    this.y += Math.sin(finalAngle) * currentSpeed * dt * 60;
                }

                // Colisão de Inimigo com Inimigo (COM ESCALONAMENTO)
                // Verifica a colisão apenas em certos frames, distribuindo a carga.
                // Exemplo: Verifica ~a cada 3 frames, distribuído entre os inimigos.
                const checkFrame = Math.floor(gameTime * 60); // Número aproximado do frame atual
                // Usamos o ID para decidir se verifica NESTE frame
                // Adicione this.id = Math.random(); ou similar no init() se não tiver ID
                const enemyCheckSlot = Math.floor(this.id * 4) % 4; // Garante um valor 0, 1, 2 ou 3 baseado no ID

                if (this.isCorporeal && (checkFrame % 4 === enemyCheckSlot)) {
                    checkEnemyEnemyCollision(this); // Só chama a função ~1/4 das vezes por inimigo
                }

                // Colisão de Inimigo com Obstáculo (Mantém a verificação a cada frame)
                // Apenas inimigos corpóreos colidem com obstáculos
                if (this.isCorporeal) {
                    checkEntityObstacleCollision(this);
                }

                // Lógica de tiro para Atiradores e Aranhas
                if (this.type === 'ATIRADOR' || this.type === 'ARANHA') {
                    // Usa o alcance de ataque dinâmico
                    const currentAttackRange = BASE_ATTACK_RANGE * player.attackRangeMultiplier;
                    const visionRangeSq = (currentAttackRange * 1.5) ** 2;

                    if (distToPlayerSq < visionRangeSq) {

                        if (this.isChargingAttack) {
                            // 2. Se está carregando, conta o tempo
                            this.chargeTimer -= dt;
                            if (this.chargeTimer <= 0) {
                                // 3. Tempo acabou, atira!
                                const angleToShoot = Math.atan2(player.y - this.y, player.x - this.x); // Recalcula o ângulo no momento do tiro
                                this.shoot(angleToShoot);
                                this.ghostProjectileTimer = 1.0; // Reseta cooldown
                                this.isChargingAttack = false; // Sai do estado de carga
                            }
                        } else if (this.stunTimer <= 0) { // Não pode carregar se estiver em hit-stun
                            // 1. Se não está carregando, checa o cooldown
                            this.ghostProjectileTimer -= dt;
                            if (this.ghostProjectileTimer <= 0) {
                                // 4. Cooldown zerou, entra em modo de carga
                                this.isChargingAttack = true;
                                this.chargeTimer = 0.2; // Reseta o tempo de carga (0.2s)
                                playBeep(500, 0.05, 'square', 0.5); // Som de "carregando"
                            }
                        }

                    } else {
                         // Se o jogador sair do alcance, cancela o ataque
                         this.isChargingAttack = false;
                    }
                }
            }

            // Cria um projétil
            shoot(angle) {
                const damage = this.damage + player.level;

                // Pega o tipo e cor do projétil (com padrões)
                const projColor = this.projectileColor || 'red';
                const projType = this.projectileType || 'NORMAL';

                // Definir velocidade do projétil ---
                let projSpeed = 1.5; // Velocidade padrão (para ATIRADOR)
                if (this.type === 'ARANHA') {
                    projSpeed = 1; // Projétil da aranha mais lento
                }

                // --- LÓGICA DE POOLING ---
                let p = projectilePool.pop(); // Tenta pegar um projétil do pool

                if (p) {
                    // Se conseguiu, reinicia ele com os novos dados (incluindo projSpeed)
                    // Adicionados argumentos faltantes para init (maxPierce, isBoomerang, maxDistance, fuseTimer, daggerCritChance, daggerCritDamage)
                    p.init(this.x, this.y, angle, projSpeed, damage, projColor, 10, false, projType, 0, false, 0, 0, 0, 0);
                } else {
                    // Se o pool estava vazio, cria um novo (incluindo projSpeed)
                    // Adicionados argumentos faltantes para o construtor Projectile (via init)
                    p = new Projectile(this.x, this.y, angle, projSpeed, damage, projColor, 10, false, projType, 0, false, 0, 0, 0, 0);
                }
                projectiles.push(p); // Adiciona o projétil (novo ou reciclado) ao jogo
            }

            /**
             * Aplica dano ao inimigo e dispara efeitos visuais e lógicos.
             * @param {number} damage - A quantidade de dano a aplicar.
             * @param {boolean} isCrit - Se o dano foi um acerto crítico.
             */
            takeDamage(damage, isCrit) {
                // --- APLICA DEBUFFS ---
                if (this.debuffs['bardo'] && this.debuffs['bardo'].timer > 0) {
                    damage *= this.debuffs['bardo'].multiplier;
                }

                this.hp -= damage;
                this.hitFlashTimer = 0.1; // Ativa o flash por 0.1 segundos

                // Lógica do "Crítico Estilhaçante"
                if (isCrit && player.criticoEstilhacanteMultiplier > 0) {
                    const explosionDmg = (damage * player.criticoEstilhacanteMultiplier) * player.getDynamicDamageMultiplier();
                    const explosionRadius = 50; // Área pequena
                    const explosionRadiusSq = explosionRadius * explosionRadius;

                    const nearbyEnemies = spatialGrid.getNearby(this.x, this.y);
                    nearbyEnemies.forEach(otherTarget => {
                    // Não acerta a si mesmo, checa o raio E SE PODE TOMAR DANO
                        if (otherTarget !== this &&
                            otherTarget.isAlive &&
                            typeof otherTarget.takeDamage === 'function' &&
                            distanceSquared(this.x, this.y, otherTarget.x, otherTarget.y) < explosionRadiusSq)
                        {
                            // Acerta apenas entidades que podem tomar dano
                            otherTarget.takeDamage(explosionDmg, false);
                        }
                    });
                    // Partículas da explosão
                    spawnParticles(this.x, this.y, 5, 'rgba(255, 165, 0, 0.8)', 2, 4, 3, 7, 0.4);
                }

                showFloatingText(this.x, this.y, damage, isCrit ? 'crit' : 'normal');

                // CONQUISTA: Precisão Letal (Gatilho 1)
                if (isCrit) {
                    consecutiveCrits++;
                    if (consecutiveCrits === 5 && canGetPrecisaoLetal) {
                        showAchievement("🎯 Precisão Letal! Conseguiu 5 acertos críticos seguidos!", 0.10, 3, 'PRECISAO_LETAL');
                        consecutiveCrits = 0; // Reseta após a conquista
                        canGetPrecisaoLetal = false; // Só uma vez
                    }
                } else {
                    consecutiveCrits = 0; // Reseta se o acerto não for crítico
                }

                // Feedback de Áudio
                if (isCrit) {
                    playBeep(600, 0.08, 'triangle', 0.8); // Som de acerto crítico
                    hitStopTimer = 15; // Pausa o jogo por 15ms
                } else {
					const baseHitFreq = 250;
					const randomPitchVariation = (Math.random() - 0.5) * 40; // Varia +/- 20Hz
					playBeep(baseHitFreq + randomPitchVariation, 0.05, 'square', 0.6);
					//hitStopTimer = Math.max(hitStopTimer, 5); // Pausa o jogo por 5ms ao causar dano (opcional, eu particularmente resolvi deixar o impacto só no critico)
				}

                // Adiciona o dano ao histórico para cálculo de DPS
                damageHistory.push({ time: gameTime, damage: damage });

                // Efeitos visuais de dano
                const particleColor = isCrit ? 'rgba(245, 189, 31, 0.8)' : 'rgba(240, 240, 248, 0.8)';
                spawnParticles(this.x, this.y, isCrit ? 5 : 2, particleColor, 2, 4, 3, 7, 0.4);

                this.stunTimer = 0.1; // Aplica o "hit-stun"

                // Lógica de morte
                if (this.hp <= 0) {
                    this.isAlive = false;

                    playBeep(200, 0.15, 'sawtooth', 1.0); // Som de morte de inimigo

                    // --- LÓGICA DE CÓDICE ---
                    if (!metaUpgrades.unlockedEnemies.includes(this.type)) {
                        metaUpgrades.unlockedEnemies.push(this.type);
                        saveMetaUpgrades();
                        // Mostra um toast especial de descoberta
                        // Adicionada verificação se ENEMY_DEFINITIONS[this.type] existe antes de acessá-lo
                        if (ENEMY_DEFINITIONS[this.type]) {
                            showAchievement(`📜 Códice Atualizado: ${ENEMY_DEFINITIONS[this.type].name} ${this.emoji}`, 0, 3, null);
                        } else {
                             showAchievement(`📜 Códice Atualizado: Inimigo Desconhecido ${this.emoji}`, 0, 3, null);
                        }
                    }

                    player.enemiesDefeated++;
                    enemiesWithoutDamage++; // Para conquistas

                    // --- CONQUISTA (Carrasco) ---
                    if (this.type === 'CHEFE' && canGetCarrasco) {
                        bossesKilledThisGame++;
                    }

                    // CONQUISTA: Fúria Incontrolável
                    if (player.isBerserk) {
                        killsDuringBerserk++;
                    }

                    // CONQUISTAS: Rastreamento de Mortes
                    // Reserva de Poder
                    if (canGetReservaDePoder && player.sp === player.maxSp) {
                        killsWithMaxSP++;
                    }
                    // Caçador Selvagem
                    if (canGetCaçadorSelvagem && player.isBerserk && (this.type === 'ELITE' || this.type === 'CHEFE')) {
                        showAchievement("🏆 Caçador Selvagem! Derrotou um Elite/Chefe durante o Berserk!", 0.15, 3, 'CACADOR_SELVAGEM');
                        canGetCaçadorSelvagem = false; // Só uma vez
                    }
                    // Exterminador de Hordas
                    if (canGetExterminadorHordas && this.type === 'ZUMBI') {
                        if (zumbiKillTimer <= 0) { // Primeira morte da janela
                            zumbiKillsInWindow = 1;
                            zumbiKillTimer = 10.0; // Começa janela de 10s
                        } else {
                            zumbiKillsInWindow++;
                            zumbiKillTimer = 10.0; // Reseta a janela
                        }
                    }
                    // Intocável
                    if (canGetIntocavel && (this.type === 'ATIRADOR' || this.type === 'ARANHA')) {
                        if (!wasHitByProjectile) {
                            shootersDefeatedInRow++;
                        } else {
                            shootersDefeatedInRow = 0; // Foi atingido, reseta
                            wasHitByProjectile = false; // Limpa a flag
                        }
                    }

                    // CONQUISTA: Caçador de Elite
                    if (this.type === 'ELITE' && canGetCacadorElite) {
                        showAchievement("👹 Caçador de Elite! Derrotou um inimigo Elite!", 0.10, 3, 'CACADOR_ELITE');
                        canGetCacadorElite = false; // Só uma vez por jogo
                    }

                    // CONQUISTA: Por Um Fio
                    if (canGetPorUmFio && (player.hp / player.maxHp) <= 0.1) {
                        showAchievement("❤️‍🩹 Por Um Fio! Derrotou um inimigo com menos de 10% de HP!", 0.05, 3, 'POR_UM_FIO');
                        canGetPorUmFio = false;
                        setTimeout(() => { canGetPorUmFio = true; }, 20000);
                    }

					// Lógica de Drop de XP (✨) com MESCLAGEM
                    let xpToDrop = 1; // Base XP drop

                    // Lógica do "Experiente" (Double XP)
                    if (Math.random() < player.doubleXpChance) {
                        xpToDrop *= 2;
                        showFloatingText(this.x, this.y + 20, 'XP x2!', 'crit'); // Feedback
                    }

                    let merged = false;
                    // Define o raio ao quadrado para mesclar (ex: 50 pixels) - ajuste se necessário
                    const mergeRadiusSq = 50 * 50;

                    // Só tenta mesclar se tiver XP para dropar
                    if (xpToDrop > 0) {
                        // Itera pelos coletáveis JÁ EXISTENTES para tentar mesclar
                        // Usamos um loop for...of pois não vamos remover itens aqui
                        for (const existingCollectible of collectibles) {
                            // Só mescla com XP_GEM existentes, não coletados e próximos
                            if (!existingCollectible.isCollected && // Garante que não foi coletado ainda
                                existingCollectible.type === 'XP_GEM' &&
                                distanceSquared(this.x, this.y, existingCollectible.x, existingCollectible.y) < mergeRadiusSq)
                            {
                                existingCollectible.amount += xpToDrop; // Soma o valor ao existente
                                // Feedback visual opcional para a mesclagem
                                showFloatingText(existingCollectible.x, existingCollectible.y - 5, `+${xpToDrop.toFixed(0)}`, 'xp');
                                // Efeito visual de "pop" no orbe que recebeu XP
                                existingCollectible.size = Math.min(20, existingCollectible.size + 1); // Aumenta um pouco o tamanho (opcional)

                                merged = true; // Marca que a mesclagem ocorreu
                                break; // Para o loop após mesclar com o primeiro encontrado
                            }
                        }
                    }

                    // Só cria um NOVO coletável de XP se NÃO tiver mesclado e tiver XP para dropar
                    if (!merged && xpToDrop > 0) {
                        let xpGem = collectiblePool.pop();
                        if (xpGem) {
                            xpGem.init(this.x, this.y - 10, 'XP_GEM', xpToDrop);
                            // Reseta o tamanho caso esteja reutilizando um orbe aumentado
                            xpGem.size = 12;
                        } else {
                            xpGem = new Collectible(this.x, this.y - 10, 'XP_GEM', xpToDrop);
                        }
                        collectibles.push(xpGem);
                    }

                    defeatedCounterForElite++; // Este contador deve incrementar independentemente da mesclagem

                    // Efeitos visuais de morte
                    spawnParticles(this.x, this.y, 10, '#ef4444', 3, 6, 5, 10, 0.6);

                    if (this.type === 'ELITE' || this.type === 'CHEFE') {
                        cameraShake = Math.min(cameraShake + 8, 15); // Um tremor BEM mais forte
                    } else {
                        cameraShake = Math.min(cameraShake + 1, 3); // O tremor padrão
                    }

                    // Chance de dropar Gema (cura) (AGORA USANDO POOL)
                    if (Math.random() < 0.33) {
                        let gema = collectiblePool.pop();
                        if (gema) {
                             gema.init(this.x, this.y, 'Gema');
                        } else {
                             gema = new Collectible(this.x, this.y, 'Gema');
                        }
                        collectibles.push(gema);
                    }

                    // Chance de dropar Brinde (⭐)
                    let coinChance = 0;
                    if (this.type === 'CHEFE') coinChance = 0.85;
                    else if (this.type === 'ELITE') coinChance = 0.50;
                    else if (this.type === 'GHOST') coinChance = 0.12;
                    else if (this.type === 'ATIRADOR') coinChance = 0.06;
                    else if (this.type === 'ARANHA') coinChance = 0.06;
                    else if (this.type === 'PADRAO') coinChance = 0.02;
                    else if (this.type === 'ZUMBETE') coinChance = 0.02;
                    else if (this.type === 'ZUMBI') coinChance = 0.01;

                    if (Math.random() < (coinChance * player.brindeChanceMultiplier)) {
                        let brinde = collectiblePool.pop();
                        if (brinde) {
                             brinde.init(this.x + 10, this.y + 10, 'MOEDA');
                        } else {
                             brinde = new Collectible(this.x + 10, this.y + 10, 'MOEDA');
                        }
                        collectibles.push(brinde);
                    }

                    // Chance de Spawnar Colecionável Especial
                    const specialDropBaseChance = 0.01;
                    if (Math.random() < (specialDropBaseChance * player.specialDropChanceMultiplier)) {
                        const randType = Math.random();
                        let specialType;

                        if (randType < 0.25) {
                            specialType = 'MAGNET';
                        } else if (randType < 0.50) {
                            specialType = 'BOMB';
                        } else if (randType < 0.75) {
                            specialType = 'POTION';
                        } else {
                            specialType = 'LIGHTNING';
                        }

                        spawnSpecialCollectible(specialType);
                    }

                    // --- INÍCIO DA LÓGICA DE SPAWN DA ARANHA ---
                    if (gameTime >= 180 && Math.random() < 0.1) {
                        spawnEnemy('ARANHA');
                        showFloatingText(this.x, this.y - 20, 'ARANHA! 🕷️', 'upgrade');
                    }

                    // Chance de spawnar ZUMBI
                    if (gameTime >= 70 && Math.random() < 0.2) {
                        spawnEnemy('ZUMBI');
                    }
                    // Chance de spawnar ZUMBETE
                    if (gameTime >= 240 && Math.random() < 0.2) {
                        spawnEnemy('ZUMBETE');
                    }
                }
            }

            // <-- MODIFICAÇÃO: draw() com efeitos reduzidos -->
            draw() {
                // Lógica de Opacidade (inalterada)
                const currentAttackRange = BASE_ATTACK_RANGE * player.attackRangeMultiplier;
                const currentAttackRangeSq = currentAttackRange * currentAttackRange;
                const distSq = distanceSquared(this.x, this.y, player.x, player.y);

                ctx.save();

                if (distSq > currentAttackRangeSq) {
                    const baseOpacity = 0.25;
                    ctx.globalAlpha = Math.min(1.0, baseOpacity + player.visionOpacityBonus);
                }

                ctx.translate(this.x, this.y);

                // --- (TELEGRAFAR) ---
                if (this.isChargingAttack) {
                    if (Math.floor(gameTime * 20) % 2 === 0) {
                         ctx.shadowColor = 'rgba(255, 255, 255, 0.9)'; // <-- AJUSTE (opacidade levemente menor)
                         ctx.shadowBlur = 8; // <-- AJUSTE (reduzido de 15)
                    } else {
                         ctx.shadowColor = 'rgba(239, 68, 68, 0.7)'; // <-- AJUSTE (opacidade levemente menor)
                         ctx.shadowBlur = 6; // <-- AJUSTE (reduzido de 10)
                    }
                } else {
                    ctx.shadowColor = 'rgba(239, 68, 68, 0.7)'; // <-- AJUSTE (opacidade levemente menor)
                    ctx.shadowBlur = 6; // <-- AJUSTE (reduzido de 10)
                }

                // --- FEEDBACK DEBUFF ---
                if (this.debuffs && this.debuffs['bardo'] && this.debuffs['bardo'].timer > 0) {
                    ctx.shadowColor = 'rgba(168, 85, 247, 0.9)'; // <-- AJUSTE (opacidade levemente menor)
                    ctx.shadowBlur = 8; // <-- AJUSTE (reduzido de 15)
                }

                // --- FEEDBACK VISUAL DE STATUS ---
                const isSlowed = this.stunTimer > 1.0;
                const isStunned = this.stunTimer > 0 && this.stunTimer <= 1.0;

                ctx.save();

                if (isStunned) {
                    // Efeito de Stun: Menos brilho e cinza mais sutil
                    ctx.filter = 'brightness(0.7) grayscale(15%)'; // <-- AJUSTE (brightness 0.7, grayscale 15%)
                    ctx.globalAlpha *= 0.85; // <-- AJUSTE (um pouco menos transparente)
                } else if (isSlowed) {
                    // Efeito de Slow: Tonalidade azulada um pouco mais sutil
                    ctx.filter = 'hue-rotate(180deg) saturate(120%) brightness(0.95)'; // <-- AJUSTE (saturate 120%, brightness 0.95)
                }

                // Desenha o emoji da entidade (inalterado)
                ctx.font = `${this.size * 0.8}px var(--pixel-font)`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.emoji, 0, 0);

                // === INÍCIO DO FEEDBACK DE FLASH (DANO) === (inalterado)
                if (this.hitFlashTimer > 0) {
                    const flashOpacity = (this.hitFlashTimer / 0.1);
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
                    ctx.fillText(this.emoji, 0, 0);
                    ctx.globalCompositeOperation = 'source-over';
                }
                // === FIM DO FEEDBACK DE FLASH ===

                // Reseta o shadow para não afetar a barra de vida (inalterado)
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;

                // Desenha a barra de vida (se não estiver cheia) (inalterado)
                if (this.hp < this.maxHp) {
                    const barWidth = this.size * 1.5;
                    const barHeight = 3;
                    const hpPercent = this.hp / this.maxHp;

                    ctx.fillStyle = 'gray';
                    ctx.fillRect(-barWidth / 2, this.size / 2 + 5, barWidth, barHeight);
                    ctx.fillStyle = 'red';
                    ctx.fillRect(-barWidth / 2, this.size / 2 + 5, barWidth * hpPercent, barHeight);
                }

                ctx.restore(); // Restaura filtros/alpha
                ctx.restore(); // Restaura translate/shadows
            }
            // <-- FIM DA MODIFICAÇÃO draw() -->
        } // Fim da classe Enemy
		
		// Classe para Projéteis
        class Projectile {
             constructor(x, y, angle, speed, damage, color, size, isFriendly = true, projectileType = 'NORMAL') {
                // O construtor agora só chama o init
                this.init(x, y, angle, speed, damage, color, size, isFriendly, projectileType, 0, false, 0, 0, 0, 0); // Adicionados fuse, daggerCritChance, daggerCritDamage
				this.fuseTimer = 0; // Para a bomba
				this.daggerCritChance = 0; // Para a adaga
				this.daggerCritDamage = 0; // Para a adaga
            }

            // Método init para reciclar o objeto
            init(x, y, angle, speed, damage, color, size, isFriendly = true, projectileType = 'NORMAL', maxPierce = 0, isBoomerang = false, maxDistance = 0, fuseTimer = 0, daggerCritChance = 0, daggerCritDamage = 0) {
                this.x = x;
                this.y = y;
                this.angle = angle;
                this.speed = speed;
                this.damage = damage;
                this.color = color;
                this.size = size;
                this.isFriendly = isFriendly;
                this.isAlive = true;
                this.projectileType = projectileType;
                
                // *** SISTEMA DE ARMAS PASSIVAS ***
                this.pierceCount = 0; // Quantas vezes já perfurou
                this.maxPierce = maxPierce;
                
                // --- (Arma: Coringa) ---
                // Limpa os stats da arma anterior (se estiver reciclando)
                if (this.jokerStats) {
                    this.jokerStats = null;
                }
                // --- (Arma: Dados) ---
                if (this.diceStats) {
                    this.diceStats = null;
                }
                
                // --- (Arma Nova: Bumerangue) ---
                this.isBoomerang = isBoomerang;
                this.maxDistance = maxDistance;
                this.spawnX = x; // Posição inicial
                this.spawnY = y;
                this.isReturning = false; // Estado
                this.hitCount = 0; // Para a conquista
				this.fuseTimer = fuseTimer;
				this.daggerCritChance = daggerCritChance;
				this.daggerCritDamage = daggerCritDamage;
            }

            update(dt) {
                // --- INÍCIO DA LÓGICA DO BUMERANGUE ---
                if (this.isBoomerang) {
                    if (this.isReturning) {
                        // 2. Está retornando: Persegue o jogador
                        const distToPlayerSq = distanceSquared(this.x, this.y, player.x, player.y);
                        
                        // "Pega" o bumerangue
                        if (distToPlayerSq < (player.size / 2 + this.size / 2) ** 2) {
                            this.isAlive = false;
                            
                            // --- CONQUISTA "RETORNO CERTEIRO" ---
                            if (this.hitCount >= 5 && canGetRetornoCerteiro) {
                                showAchievement("🏆 Retorno Certeiro! Acertou 5+ inimigos com uma única Presa!", 0.05, 3, 'RETORNO_CERTEIRO');
                                canGetRetornoCerteiro = false;
                            }
                            return;
                        }
                        
                        // Atualiza o ângulo para mirar no jogador
                        this.angle = Math.atan2(player.y - this.y, player.x - this.x);
                        
                    } else {
                        // 1. Está indo: Verifica a distância
                        const distFromSpawnSq = distanceSquared(this.x, this.y, this.spawnX, this.spawnY);
                        if (distFromSpawnSq >= this.maxDistance * this.maxDistance) {
                            this.isReturning = true;
                            // Ao retornar, reseta a contagem de perfuração para acertar inimigos na volta
                            this.pierceCount = 0;
                        }
                    }
                }
				// --- FIM DA LÓGICA DO BUMERANGUE ---
				
				// --- LÓGICA DA BOMBA (PAVIO CURTO) ---
				if (this.projectileType === 'BOMB' && this.fuseTimer > 0) {
					this.fuseTimer -= dt;
					if (this.fuseTimer <= 0) {
						this.explodeBomb(); // Chama a explosão quando o pavio acaba
						this.isAlive = false; // Marca para remoção
					} else {
						// Reduz a velocidade enquanto o pavio queima (efeito visual)
						this.speed *= (1.0 - (dt * 5)); // Perde velocidade rapidamente
						// Adiciona efeito visual de "faísca" (partículas)
						if (Math.random() < 0.3) { // 30% de chance por frame
							spawnParticles(this.x, this.y, 1, 'orange', 1, 3, 1, 2, 0.2);
						}
					}
				}
				// --- FIM LÓGICA DA BOMBA ---
				
                this.x += Math.cos(this.angle) * this.speed * dt * 60;
                this.y += Math.sin(this.angle) * this.speed * dt * 60;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                
                // *** SISTEMA DE ARMAS PASSIVAS ***
                // Rotaciona o projétil (para a 'Garra')
                if (this.projectileType === 'GARRA') {
                    ctx.rotate(this.angle + Math.PI / 2); // Gira para apontar na direção do movimento
                    ctx.font = `${this.size}px var(--pixel-font)`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = this.color;
                    ctx.fillText('🔪', 0, 0); // Desenha a 'Garra'
                } else if (this.projectileType === 'ORBE') { // (Arma 1)
                    // Orbe pulsante
                    const pulseSize = this.size * (1 + Math.sin(gameTime * 20) * 0.1);
                    ctx.font = `${pulseSize}px var(--pixel-font)`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = this.color;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 10;
                    ctx.fillText('🔮', 0, 0);
                } else if (this.projectileType === 'COMETA') { // <-- (Arma 2)
                    // Cometa giratório
                    ctx.rotate(this.angle + Math.PI / 2); // Aponta na direção
                    ctx.font = `${this.size}px var(--pixel-font)`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = this.color;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 10;
                    ctx.fillText('☄️', 0, 0);             
                } else if (this.projectileType === 'ESPINHO') {
                    // Espinho (gira para dar efeito)
                    ctx.rotate(this.angle + gameTime * 10); // Gira rápido
                    ctx.font = `${this.size}px var(--pixel-font)`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = this.color;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 5;
                    ctx.fillText('🌵', 0, 0);
                } else if (this.projectileType === 'VARINHA') {
                    // Projétil mágico (pisca/twinkle)
                    const pulseSize = this.size * (1 + Math.sin(gameTime * 30) * 0.15); // Twinkle rápido
                    ctx.font = `${pulseSize}px var(--pixel-font)`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = this.color;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 8;
                    ctx.fillText('🪄', 0, 0);
                } else if (this.projectileType === 'JOKER') {
                    // Carta girando
                    ctx.rotate(this.angle + Math.PI / 2); // Orienta a carta
                    ctx.font = `${this.size}px var(--pixel-font)`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = this.color;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 8;
                    // Faz a carta "girar" no eixo Y (achatando e esticando)
                    ctx.scale(Math.abs(Math.sin(gameTime * 20)), 1);
                    ctx.fillText('🃏', 0, 0);
                // --- INÍCIO DO DRAW (BUMERANGUE) ---
                } else if (this.projectileType === 'BOOMERANG') {
                    // Bumerangue girando
                    ctx.rotate(this.angle + gameTime * 25); // Gira muito rápido
                    ctx.font = `${this.size}px var(--pixel-font)`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = this.color;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 8;
                    ctx.fillText('🪃', 0, 0);
                } else if (this.projectileType === 'BARDO') {
                    // Esta arma não tem projétil, o efeito é a aura
                } else if (this.projectileType === 'LAMINAS') {
                    // Esta arma não tem projétil, o efeito são as AttackLines	
                } else if (this.projectileType === 'AXE') { // Machado 🪓
                    ctx.rotate(this.angle + gameTime * 25); // Gira muito rápido
                    ctx.font = `${this.size}px var(--pixel-font)`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = this.color;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 8;
                    ctx.fillText('🪓', 0, 0);
                } else if (this.projectileType === 'DICE') { // Dado 🎲
                    ctx.rotate(this.angle + gameTime * 10); // Gira
                    ctx.font = `${this.size}px var(--pixel-font)`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = this.color;
                    ctx.shadowColor = this.color;
                    ctx.shadowBlur = 8;
                    // Faz o dado "girar" no eixo Y (achatando e esticando)
                    ctx.scale(Math.abs(Math.sin(gameTime * 10)), 1);
                    ctx.fillText('🎲', 0, 0);
                } else if (this.projectileType === 'DAGGER') {
					ctx.rotate(this.angle + Math.PI / 2); // Rotaciona a adaga para apontar na direção do movimento (+90 graus)
					ctx.font = `${this.size * 1.2}px var(--pixel-font)`; // Tamanho um pouco maior para a adaga
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillStyle = this.color; // Usa a cor definida (cinza)
					ctx.shadowColor = this.color;
					ctx.shadowBlur = 5;
					ctx.fillText('🗡️', 0, 0); // Desenha o emoji da adaga
				}
                // 🧪 Poção Instável (Usa GroundEffect, não projétil)
                // 🩸 Ritual Sangrento (Usa Aura, não projétil)
             
                else {
                    // Lógica original (círculo)
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
			// --- NOVO MÉTODO PARA EXPLOSÃO DA BOMBA ---
			explodeBomb() {
				playBeep(100, 0.3, 'sawtooth', 1.0); // Som de explosão
				spawnParticles(this.x, this.y, 30, 'rgba(255, 100, 0, 0.9)', 4, 10, 4, 10, 0.7);
				cameraShake = Math.min(cameraShake + 3, 7);

				// Pega o raio dos stats anexados ao projétil durante o disparo
				const radius = this.bombStats ? this.bombStats.radius : 60; // Usa 60 como padrão se stats não foram anexados
				const radiusSq = radius * radius;
				const damage = this.damage; // O dano já foi calculado no disparo

				const nearbyTargets = spatialGrid.getNearby(this.x, this.y);
				let enemiesHitCount = 0; // Para conquista

				nearbyTargets.forEach(target => {
					if (target.isAlive && typeof target.takeDamage === 'function' && distanceSquared(this.x, this.y, target.x, target.y) < radiusSq) {

						// Não pode dar crítico na explosão da bomba
						target.takeDamage(damage, false);

						if (target.type) { // Conta apenas inimigos
						enemiesHitCount++;
						}
					}
				});

				// --- CONQUISTA: REAÇÃO EM CADEIA ---
				if (enemiesHitCount >= 5 && canGetReacaoEmCadeia) {
					showAchievement('🏆 Reação em Cadeia! Acertou 5+ com 1 explosão!', 0.05, 3, 'REACAO_EM_CADEIA');
					canGetReacaoEmCadeia = false;
				}
			}
			// --- FIM MÉTODO EXPLODEBOMB ---
        }

        // Classe para Coletáveis (Gemas 💠 e Brindes ⭐)
		class Collectible {
            constructor(x, y, type, amount = 1) {
                 this.init(x, y, type, amount);
            }
            
            /**
             * Inicializa/Reseta o coletável do pool.
             */
            init(x, y, type, amount = 1) {
                this.x = x;
                this.y = y;
                this.type = type;
                this.amount = amount;
                
                // Novos coletáveis
                this.size = (type === 'XP_GEM' ? 12 : 15);
                
                if (type === 'Gema') this.emoji = '💠';
                else if (type === 'MOEDA') this.emoji = '⭐';
                else if (type === 'XP_GEM') this.emoji = '✨';
                else if (type === 'MAGNET') this.emoji = '🧲';
                else if (type === 'BOMB') this.emoji = '💣';
                else if (type === 'POTION') this.emoji = '❤️‍🩹';
                else if (type === 'LIGHTNING') this.emoji = '⚡';
                else this.emoji = '❓'; // Padrão
                
                this.isCollected = false; // MUITO IMPORTANTE!
				
				// --- ADIÇÃO AQUI ---
                this.updateInterval = 0.0333; // Intervalo de atualização (1 vez a cada 2 frames)
                this.updateTimer = Math.random() * this.updateInterval; // Timer inicial aleatório
                // --- FIM DA ADIÇÃO ---
            }
            
			update(dt) {
                // Diminui o timer a cada quadro
                this.updateTimer -= dt;

                // Só executa a lógica de atração se o timer zerou
                if (this.updateTimer <= 0) {
                    // Reinicia o timer para o próximo intervalo (com um pouco de variação)
                    // Adicionar Math.random evita que muitos itens atualizem exatamente no mesmo frame
                    this.updateTimer = this.updateInterval + (Math.random() - 0.5) * (this.updateInterval * 0.1);

                    // --- Lógica de atração magnética (com movimento corrigido) ---
                    const currentCollectionRange = player.getDynamicCollectionRange();
                    const collectionRangeSq = currentCollectionRange * currentCollectionRange;
                    const distSq = distanceSquared(this.x, this.y, player.x, player.y);

                    if (distSq < collectionRangeSq) {
                        const dist = Math.sqrt(distSq);
                        const angle = Math.atan2(player.y - this.y, player.x - this.x);

                        // 1. Calcula a velocidade base (como no original, pixels por "segundo simulado")
                        const baseAttractionSpeed = Math.min(20, (currentCollectionRange - dist) * 0.5) * 60; // O * 60 original

                        // 2. Calcula a DISTÂNCIA TOTAL a mover neste passo (velocidade * tempo_intervalo)
                        //    Usamos this.updateInterval aqui, que é o tempo real que passou desde a última atualização de movimento.
                        const moveDistance = baseAttractionSpeed * this.updateInterval;

                        // --- IMPORTANTE: Evitar Overshooting ---
                        // Se a distância a mover for maior que a distância até o jogador,
                        // apenas mova o coletável para a posição do jogador (ou muito perto).
                        if (moveDistance * moveDistance > distSq) {
                             // Move diretamente para o jogador (ou quase) para garantir a coleta
                             this.x = player.x + Math.cos(angle + Math.PI) * (player.size / 4); // Move para um pouco "atrás" do centro do jogador
                             this.y = player.y + Math.sin(angle + Math.PI) * (player.size / 4);
                        } else {
                             // 3. Aplica o movimento calculado diretamente (representa o "salto")
                             this.x += Math.cos(angle) * moveDistance;
                             this.y += Math.sin(angle) * moveDistance;
                        }

                    }
                    // --- Fim da lógica de atração ---
                }
                // Se o timer não zerou, NENHUMA lógica de movimento de atração é executada neste quadro.
            }

			draw() {
				ctx.save();
				ctx.translate(this.x, this.y);

				// Flutuação vertical (mantida)
				const yOffset = Math.sin(gameTime * 5 + this.x) * 3;

                let drawSize = this.size; // Tamanho padrão

                // Apenas para XP_GEM, calcula o tamanho baseado na quantidade
                if (this.type === 'XP_GEM') {
                    const baseSize = 12; // Tamanho inicial do XP_GEM
                    const maxSize = 36;  // Tamanho máximo visual
                    const scaleFactor = 1.5; // Ajusta o quão rápido o tamanho aumenta
                    // Calcula o tamanho: base + raiz quadrada do (valor - 1) * fator, com limite máximo
                    drawSize = Math.min(maxSize, baseSize + Math.sqrt(Math.max(0, this.amount - 1)) * scaleFactor);
                }

				// Define a fonte com o tamanho calculado (ou o padrão para outros itens)
				ctx.font = `${drawSize}px var(--pixel-font)`; // <--- Usa drawSize
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				// Desenha o emoji com o offset vertical
				ctx.fillText(this.emoji, 0, yOffset);

				ctx.restore(); // Restaura translate
			}
        }
		
		// Spatial Grid
        class SpatialGrid {
            constructor(width, height, cellSize) {
                this.cellSize = cellSize;
                this.gridWidth = Math.ceil(width / cellSize);
                this.gridHeight = Math.ceil(height / cellSize);
                this.grid = new Array(this.gridWidth * this.gridHeight).fill(null).map(() => []);
            }
            
			_getCellIndex(x, y) {
                // Se x ou y não forem números (ex: NaN), o cálculo do índice falha.
                // Retornamos -1 para que a entidade seja (corretamente) ignorada.
                if (isNaN(x) || isNaN(y)) {
                    return -1;
                }

                const col = Math.floor(x / this.cellSize);
                const row = Math.floor(y / this.cellSize);
                
                if (col < 0 || col >= this.gridWidth || row < 0 || row >= this.gridHeight) {
                    return -1; // Fora dos limites
                }
                return row * this.gridWidth + col;
            }
            
            clear() {
                for (let i = 0; i < this.grid.length; i++) {
                    this.grid[i].length = 0; // Mais rápido que .fill([])
                }
            }
            
            insert(entity) {
                const index = this._getCellIndex(entity.x, entity.y);
                if (index !== -1) {
                    this.grid[index].push(entity);
                }
            }
            
            getNearby(x, y) {
                const nearbyEntities = [];
                const col = Math.floor(x / this.cellSize);
                const row = Math.floor(y / this.cellSize);
                
                // Checa a célula atual e as 8 vizinhas
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newRow = row + i;
                        const newCol = col + j;
                        if (newCol >= 0 && newCol < this.gridWidth && newRow >= 0 && newRow < this.gridHeight) {
                            const index = newRow * this.gridWidth + newCol;
                            nearbyEntities.push(...this.grid[index]);
                        }
                    }
                }
                return nearbyEntities;
            }
        }
        
        // --- Sistema de Partículas ---
        class Particle {
            constructor(x, y, color, size, vx, vy, lifetime) {
                this.init(x, y, color, size, vx, vy, lifetime);
            }
            
            // Método de inicialização para reciclar o objeto
            init(x, y, color, size, vx, vy, lifetime) {
                this.x = x;
                this.y = y;
                this.color = color;
                this.size = size;
                this.vx = vx;
                this.vy = vy;
                this.lifetime = lifetime;
                this.time = 0;
                this.isAlive = true;
            }

            update(dt) {
                this.x += this.vx * dt * 60;
                this.y += this.vy * dt * 60;
                this.vy += 0.5; // Gravidade
                this.time += dt;
                if (this.time >= this.lifetime) {
                    this.isAlive = false;
                }
            }

            draw() {
                const alpha = Math.max(0, 1 - (this.time / this.lifetime));
                ctx.fillStyle = this.color;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
		
		/**
        * Classe para Obstáculos estáticos (árvores, pedras)
        * Eles apenas bloqueiam o movimento.
        */
        class Obstacle {
            constructor(x, y, size, emoji) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.emoji = emoji;
                this.isObstacle = true; // Flag para colisão
            }

            draw() {
                ctx.save();
                
                // Opacidade fora do alcance
                const currentAttackRange = BASE_ATTACK_RANGE * player.attackRangeMultiplier;
                const currentAttackRangeSq = currentAttackRange * currentAttackRange;
                const distSq = distanceSquared(this.x, this.y, player.x, player.y);
                
                if (distSq > currentAttackRangeSq) {
                    ctx.globalAlpha = 0.1; // 10% opacidade
                }

                ctx.translate(this.x, this.y);
                ctx.font = `${this.size}px var(--pixel-font)`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.emoji, 0, 0);
                ctx.restore();
            }
        }

        /**
        * Classe para Entidades Destrutíveis (caixas, barris)
        * Eles bloqueiam, mas podem ser destruídos para dropar itens.
        */
        class Destructible {
            constructor(x, y, size, emoji, hp) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.emoji = emoji;
                this.maxHp = hp;
                this.hp = hp;
                this.isAlive = true;
                this.isObstacle = true; // Também é um obstáculo
            }

            takeDamage(damage, isCrit = false) { 
                if (!this.isAlive) return;

                this.hp -= damage;
                showFloatingText(this.x, this.y, Math.round(damage), isCrit ? 'crit' : 'normal');
                spawnParticles(this.x, this.y, 2, 'rgba(210, 180, 140, 0.8)', 2, 4, 1, 3, 0.3); // Partículas de "madeira"

                if (this.hp <= 0) {
                    this.isAlive = false;
                    
                    // --- CONQUISTA ---
                    if (canGetDestruidor) {
                        destructiblesDestroyed++;
                    }
                    
                    // Lógica de Barris Explosivos
                    playBeep(100, 0.3, 'sawtooth', 1.0); // Som de explosão

                    // Efeitos de explosão
                    spawnParticles(this.x, this.y, 30, 'rgba(255, 100, 0, 0.9)', 5, 10, 5, 12, 0.8); //

                    // Lógica da Explosão
                    const explosionDmg = this.maxHp * 2; // Dano baseado na vida do barril
                    const explosionRadius = 100; // Raio da explosão
                    const explosionRadiusSq = explosionRadius * explosionRadius;

                    // Pega inimigos E OUTROS DESTRUTÍVEIS próximos usando a grid
                    const nearbyEntities = spatialGrid.getNearby(this.x, this.y);

                    nearbyEntities.forEach(target => {
                        // Não acerta a si mesmo, checa se está vivo e no raio
                        if (target !== this && target.isAlive && distanceSquared(this.x, this.y, target.x, target.y) < explosionRadiusSq) {
                            
							// Causa dano em área (não-crítico)
                            if (typeof target.takeDamage === 'function') { // Verifica se a função existe
                                target.takeDamage(explosionDmg, false);
                            }
                            // Se não tiver a função takeDamage (ex: é um projétil), simplesmente ignora.
                        }
                    });

					// Chance de dropar Gema ou Brinde (AGORA USANDO POOL)
                    if (Math.random() < 0.7) { // 70% chance de Gema
                        let gema = collectiblePool.pop();
                        if (gema) {
                             gema.init(this.x, this.y, 'Gema');
                        } else {
                             gema = new Collectible(this.x, this.y, 'Gema');
                        }
                        collectibles.push(gema);
                    } else if (Math.random() < 0.1) { // 10% chance de Brinde
                        let brinde = collectiblePool.pop();
                        if (brinde) {
                             brinde.init(this.x + 10, this.y + 10, 'MOEDA');
                        } else {
                             brinde = new Collectible(this.x + 10, this.y + 10, 'MOEDA');
                        }
                        collectibles.push(brinde);
                    }
                }
            }

            draw() {
                ctx.save();

                // Opacidade fora do alcance
                const currentAttackRange = BASE_ATTACK_RANGE * player.attackRangeMultiplier;
                const currentAttackRangeSq = currentAttackRange * currentAttackRange;
                const distSq = distanceSquared(this.x, this.y, player.x, player.y);
                
                if (distSq > currentAttackRangeSq) {
                    ctx.globalAlpha = 0.1; // 10% opacidade
                }

                ctx.translate(this.x, this.y);
                ctx.font = `${this.size}px var(--pixel-font)`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.emoji, 0, 0);
                
                // Barra de vida
                if (this.hp < this.maxHp) {
                    const barWidth = this.size * 1.5;
                    const barHeight = 3;
                    ctx.fillStyle = 'gray';
                    ctx.fillRect(-barWidth / 2, this.size / 2 + 5, barWidth, barHeight);
                    ctx.fillStyle = '#f59e0b'; // Cor âmbar
                    ctx.fillRect(-barWidth / 2, this.size / 2 + 5, barWidth * (this.hp / this.maxHp), barHeight);
                }
                
                ctx.restore();
            }
        }
		
		// Classe para Efeitos de Área Estáticos (ex: Chão Consagrado, Poção Instável)
        class GroundEffect {
            constructor(x, y, radius, duration, damagePerTick, tickRate, emoji, color, debuffType = 'none', debuffDuration = 0, debuffValue = 0) {
                this.x = x;
                this.y = y;
                this.radius = radius;
                this.radiusSq = radius * radius;
                this.duration = duration;
                this.maxDuration = duration;
                this.damage = damagePerTick;
                this.tickRate = tickRate;
                this.tickTimer = 0; // Ataca imediatamente
                this.emoji = emoji;
                this.color = color;
                this.isAlive = true;
                
                // --- NOVAS PROPRIEDADES (PARA A POÇÃO 🧪) ---
                this.debuffType = debuffType;         // 'none', 'SLOW', 'MELT'
                this.debuffDuration = debuffDuration; // Duração do debuff a aplicar
                this.debuffValue = debuffValue;       // Potência (ex: 1.1 para 10% de 'MELT')
            }

            update(dt) {
                this.duration -= dt;
                if (this.duration <= 0) { 
                    this.isAlive = false;
                    return;
                }
                
                this.tickTimer -= dt;
                if (this.tickTimer <= 0) {
                    this.tickTimer = this.tickRate; // Reseta timer do "tick"
                    
                    // Som do "tick" de dano
                    playBeep(180, 0.05, 'square', 0.5);
                    
                    // Aplica dano a inimigos próximos
                    const nearby = spatialGrid.getNearby(this.x, this.y);
                    nearby.forEach(target => {
                        if(target.isAlive && typeof target.takeDamage === 'function' && distanceSquared(this.x, this.y, target.x, target.y) < this.radiusSq) {
                            
                            // 1. Aplica o Dano de DoT
                            target.takeDamage(this.damage, false); // Dano de área nunca é crítico
                            
                            // 2. Aplica Debuffs (se houver)
                            if (target.type) { // Só aplica debuff em Inimigos
                                if (this.debuffType === 'SLOW') {
                                    // applySlow já lida com a duração
                                    target.applySlow(this.debuffDuration);
                                } else if (this.debuffType === 'MELT') {
                                    // Reutiliza a lógica de debuff do Bardo (aumenta dano recebido)
                                    target.debuffs['bardo'] = {
                                        timer: this.debuffDuration,
                                        multiplier: this.debuffValue
                                    };
                                }
                            }
                        }
                    });
                }
            }

            draw() {
                // A opacidade diminui com o tempo
                const alpha = Math.min(1, this.duration / (this.maxDuration * 0.5)) * 0.5; // Fade out
                
                ctx.save();
                ctx.globalAlpha = alpha;
                
                // Desenha o círculo de efeito
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Desenha o emoji no centro (mais opaco)
                ctx.globalAlpha = alpha * 1.5;
                ctx.font = `${this.radius * 0.7}px var(--pixel-font)`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.emoji, this.x, this.y);
                
                ctx.restore();
            }
        }
		
		// --- Classe do Jogador ---
        class Player {
            constructor(metaUpgrades = {}) {
                // --- Padrões ---
                this.x = canvas.width / 2;
                this.y = canvas.height / 2;
                this.size = 20;
                this.color = 'orange';
                
                // --- Aplica a Skin ---
                this.skin = metaUpgrades.selectedSkin || '🐯';
                
                this.level = 1;
                this.xp = 0;
                this.xpNeeded = 10;
                
                this.maxHp = 100;
                this.hp = 100;
                
                this.maxSp = 100;
                this.sp = 100;
                this.spRegen = 2;
                
                this.baseDamage = 10;
                this.attackSpeed = 1;
                this.moveSpeed = 2.5;
                
                this.critChance = 0.01;
                this.critDamageMultiplier = 2.0;
                
                this.grapes = 0;
                this.enemiesDefeated = 0;
                this.powerupStacks = 0;
                
                // RASTREADOR DE CLASSE
                this.hasClass = false;
				this.className = "Aprendiz"; // Valor Padrão
                this.classIcon = "🎓"; // Ícone Padrão
                
                this.passiveWeapons = {}; // Rastreia armas (ex: { 'auraDourada': { level: 1, timer: 0, emoji: '🌟' } })
                
                // Novos stats para os novos aprimoramentos
                this.attackRangeMultiplier = 1.0;
                this.visionOpacityBonus = 0;
                this.doubleXpChance = 0;
                this.dashDistanceMultiplier = 1.0;
                this.dashInvulnBonus = 0;
                this.extraGrapeChance = 0;
                this.collectionRangeMultiplier = 1.0;
                this.impactAreaMultiplier = 1.0;
                this.impactDamageMultiplier = 1.0;
                this.berserkDurationMultiplier = 1.0;
                this.vampireChance = 0;
                this.wizardChance = 0;
                this.xpGainMultiplier = 1.0;
                this.extraTargets = 0;

                // STAT DE DROP ESPECIAL
                this.specialDropChanceMultiplier = 1.0;
                this.abateThreshold = 0.2;
                this.impactoAtordoanteDuration = 0;
                this.criticoEstilhacanteMultiplier = 0;
                this.aterrissagemImpactanteMultiplier = 0;
                this.brindeChanceMultiplier = 1.0;
                this.reacaoAdrenalCooldown = 0;
                this.isReacaoAdrenalActive = false;
                this.reacaoAdrenalTimer = 0;
                this.furiaDoTigreMultiplier = 0;
                this.focoTotalBonus = 0;
                // --- NOVOS ATRIBUTOS (SKINS) ---
                // Bônus 🐷 Porco (Gula)
                this.gemaHealMultiplier = 1.0;
                // Bônus 🐸 Sapo (Salto Ágil)
                this.dashCostMultiplier = 1.0;
                this.dashCooldownMultiplier = 1.0;
                // (Adicionamos para todas as habilidades por consistência)
                this.impactCostMultiplier = 1.0;
                this.impactCooldownMultiplier = 1.0;
                this.berserkCostMultiplier = 1.0;
                this.berserkCooldownMultiplier = 1.0;
                // STATS ACUMULÁVEIS
                this.auraProtetoraStacks = 0;
                this.reacaoAdrenalMoveSpeedBuff = 0;
                this.reacaoAdrenalDuration = 0;

                // COLETÁVEIS
                this.isMagnetActive = false;
                this.magnetTimer = 0;
                this.isLightningActive = false;
                this.lightningTimer = 0;

                this.isSlowed = false;
                this.slowTimer = 0;

                this.attackTimer = 0;
                this.dashCooldown = 0;
                this.dashDuration = 0.1;
                this.impactCooldown = 0;
                this.berserkCooldown = 0;
                this.berserkDuration = 4;
                this.isBerserk = false;

                // Atributos atuais (afetados por Buffs)
                this.currentBaseDamage = 10;
                this.currentAttackSpeed = 1;
                this.currentMoveSpeed = 2.5;
                this.isInvulnerable = false;
                
                // Conquistas/Combo (movido para dentro do player)
                this.comboTimer = 0;
                this.comboTracker = { q: false, w: false, e: false };
                
                // --- Rastreia direção para armas
                this.moveDirectionX = 0;
                this.moveDirectionY = 0;

                // --- Aplicar Meta-Upgrades ---
                const hpBonus = (metaUpgrades.bonusHp || 0) * 10;
                this.maxHp += hpBonus;
                this.hp = this.maxHp;
        
                const dmgBonusPercent = (metaUpgrades.bonusDmg || 0) * 0.02;
                this.baseDamage *= (1 + dmgBonusPercent);
                this.currentBaseDamage = this.baseDamage;
        
                const spRegenBonus = (metaUpgrades.bonusSpRegen || 0) * 0.1;
                this.spRegen += spRegenBonus;
        
                const moveSpeedBonusPercent = (metaUpgrades.bonusMoveSpeed || 0) * 0.01;
                this.moveSpeed *= (1 + moveSpeedBonusPercent);
                this.currentMoveSpeed = this.moveSpeed;
        
                const critChanceBonus = (metaUpgrades.bonusCritChance || 0) * 0.002;
                this.critChance += critChanceBonus;

                const collectionBonus = (metaUpgrades.bonusCollectionRange || 0) * 0.05;
                this.collectionRangeMultiplier += collectionBonus;

                this.powerupStacks += (metaUpgrades.startBonusPowerup || 0);

                // freeRerolls é global, então é pego de fora
                freeRerolls = (metaUpgrades.startBonusReroll || 0);

                const brindeBonus = (metaUpgrades.bonusBrindeChance || 0) * 0.02;
                this.brindeChanceMultiplier *= (1 + brindeBonus);

                const xpGainBonus = (metaUpgrades.bonusXPGain || 0) * 0.01;
                this.xpGainMultiplier += xpGainBonus;
                
                this.extraTargets += (metaUpgrades.bonusProjectiles || 0);

                const specialDropBonus = (metaUpgrades.bonusSpecialDropChance || 0) * 0.1;
                this.specialDropChanceMultiplier *= (1 + specialDropBonus);

                // Dificuldade é global, pego de fora
                const difficultyBonus = (metaUpgrades.startDifficultyBonus || 0) * 0.1;
                difficulty *= (1 + difficultyBonus);
                const difficultyXpBonus = (metaUpgrades.startDifficultyBonus || 0) * 0.05;
                this.xpGainMultiplier += difficultyXpBonus;
                
                const luckCritBonus = (metaUpgrades.bonusLuck || 0) * 0.001;
                this.critChance += luckCritBonus;
                const luckBrindeBonus = (metaUpgrades.bonusLuck || 0) * 0.01;
                this.brindeChanceMultiplier *= (1 + luckBrindeBonus);
				// --- APLICAÇÃO DO BÔNUS (Gemólogo) ---
                const GemologoLevel = (metaUpgrades.bonusGemologo || 0);
                if (GemologoLevel > 0) {
                    // Bônus de Velocidade de Ataque
                    const aspdBonusPercent = GemologoLevel * 0.05; // +5% por nível
                    this.attackSpeed *= (1 + aspdBonusPercent);
                    this.currentAttackSpeed = this.attackSpeed; // Atualiza o stat "current"

                    // Bônus de Chance de Gema Extra
                    const grapeChanceBonus = GemologoLevel * 0.01; // +1% por nível
                    this.extraGrapeChance += grapeChanceBonus;
                }
                
                // --- APLICA O BÔNUS DE XP DAS SKINS ---
                const skinXpBonus = (metaUpgrades.skinXpBonus || 0);
                this.xpGainMultiplier += skinXpBonus;
                // --- APLICAR BÔNUS DA SKIN SELECIONADA ---
                const skinData = SKIN_LIST.find(s => s.id === this.skin);
                if (skinData) {
                    switch (skinData.id) {
                        case '🐯': // Tigre: +10% Dano, -5% HP
                            this.baseDamage *= 1.1;
                            this.currentBaseDamage *= 1.1;
                            this.maxHp *= 0.95;
                            break;
                        case '🐮': // Vaca: +25% HP, -10% MS
                            this.maxHp *= 1.25;
                            this.moveSpeed *= 0.9;
                            this.currentMoveSpeed *= 0.9;
                            break;
                        case '🐷': // Porco: +50% Cura de Gema
                            this.gemaHealMultiplier = 1.5;
                            break;
                        case '🐸': // Sapo: Buff no Dash
                            this.dashCostMultiplier = 0.8; // -20% Custo
                            this.dashCooldownMultiplier = 0.9; // -10% Cooldown
                            break;
                        case '🐻': // Urso: +1 Aura Protetora
                            this.auraProtetoraStacks += 1;
                            break;
                        case '🐰': // Coelho: +15% MS
                            this.moveSpeed *= 1.15;
                            this.currentMoveSpeed *= 1.15;
                            break;
                        case '🐶': // Cachorro: +50% Raio de Coleta
                            this.collectionRangeMultiplier += 0.5;
                            break;
                        case '🐵': // Macaco: +5% Crit, +10% Crit Dmg
                            this.critChance += 0.05;
                            this.critDamageMultiplier += 0.1;
                            break;
                        case '🤡': // Palhaço: Começa com Coringa Nv. 1
                            this.addPassiveWeapon('coringaSelvagem');
                            break;
                        case '👽': // Alien: +1 Projétil
                            this.extraTargets += 1;
                            break;
                        case '🤖': // Robô: +0.5 SP/s
                            this.spRegen += 0.5;
                            break;
                        case '🎃': // Abóbora: +5% Vampirismo
                            this.vampireChance += 0.05;
                            break;
                    }
                }
                
                // Garante que HP/SP fiquem dentro dos limites após bônus de skin
                this.hp = this.maxHp;
                this.sp = this.maxSp;
                // Garante que stats atuais reflitam mudanças
                this.currentBaseDamage = this.baseDamage;
                this.currentMoveSpeed = this.moveSpeed;
                this.currentAttackSpeed = this.attackSpeed;
                // --- FIM DA APLICAÇÃO DOS BÔNUS ---
                this.xpNeeded = getXPNeeded(1); // Ajusta o XP inicial
            }

            // --- Métodos de Ação ---

            /**
             * Aplica dano ao jogador e dispara efeitos visuais e lógicos.
             * @param {number} damage - A quantidade de dano a aplicar.
             */
            takeDamage(damage) {
                if (this.isInvulnerable) return; // Imune durante o Dash
                
                // Aplica redução de dano da "Aura Protetora"
                if (this.auraProtetoraStacks > 0 && this.sp / this.maxSp > 0.8) {
                    const reduction = Math.min(0.9, this.auraProtetoraStacks * 0.1);
                    damage *= (1.0 - reduction);
                }

                playBeep(150, 0.2, 'sawtooth', 1.0); // Som de levar dano
                
                triggerHPFlash(); // Feedback visual no HUD

                // Feedback visual no painel de Status
                if (!statusHud.classList.contains('panel-hurt')) {
                    statusHud.classList.add('panel-hurt');
                    setTimeout(() => statusHud.classList.remove('panel-hurt'), 200);
                }

                damage = Math.round(damage);
                this.hp -= damage;
                difficulty += 0.002; // Aumenta a dificuldade ao tomar dano

                damageFlashTimer = DAMAGE_FLASH_DURATION; // Ativa o flash vermelho na tela
                showFloatingText(this.x, this.y, damage, 'player'); // Texto flutuante
                cameraShake = Math.min(cameraShake + 2, 5); // Tremor de câmera
                
                spawnParticles(this.x, this.y, 5, 'rgba(255, 0, 0, 0.9)', 3, 5, 2, 5, 0.4);
                
                // Ativa a "Reação Adrenal"
                if (this.reacaoAdrenalCooldown <= 0 && (this.hp / this.maxHp) <= 0.25 && !this.isReacaoAdrenalActive) {
                    
                    if (this.reacaoAdrenalDuration > 0) {
                        this.isReacaoAdrenalActive = true;
                        this.reacaoAdrenalTimer = this.reacaoAdrenalDuration; // Duração acumulada
                        this.reacaoAdrenalCooldown = 15.0; // Cooldown de 15s
                        
                        if (!this.isBerserk) {
                            this.currentMoveSpeed = this.moveSpeed * (1.0 + this.reacaoAdrenalMoveSpeedBuff);
                        } else {
                            this.currentMoveSpeed = this.moveSpeed * Math.max(2.0, (1.0 + this.reacaoAdrenalMoveSpeedBuff));
                        }
                        
                        showFloatingText(this.x, this.y - 20, 'VELOCIDADE!', 'crit');
                        playBeep(600, 0.1, 'sine', 0.8); // Som de buff
                    }
                }

                // Verifica Game Over (A primeira vez que o HP chegar a 0, vira 1 como um "último suspiro".
				if (this.hp <= 0) {
					if (!this.hasUsedDeathDefy) {
						this.hasUsedDeathDefy = true; // Gasta a chance
						this.hp = 1; // Define o HP para 1 (não 0)

						// Dá invulnerabilidade
						this.isInvulnerable = true;
						setTimeout(() => { this.isInvulnerable = false; }, 1500); // 1.5s

						// Feedback
						playBeep(100, 0.3, 'sawtooth', 1.0); // Som de quase morte
						showFloatingText(this.x, this.y - 20, 'ÚLTIMO SUSPIRO!', 'crit');
						damageFlashTimer = DAMAGE_FLASH_DURATION * 5; // Um flash de dano mais longo

					} else {
						// Se já usou o "Último Suspiro", morre normalmente
						this.hp = 0;
						gameOver();
					}
				}
            }

            // Habilidade: Dash (Q)
            useDash() {
                const cost = ABILITY_CONSTS.DASH.COST * this.dashCostMultiplier;
                if (gameState !== 'PLAYING' || !canUseAbility(cost, this.dashCooldown)) {
                    triggerAbilityFail(dashBtn, cost);
                    return;
                }
                
                if (canGetEconomista) hasUsedSP = true; // CONQUISTA
                if (canGetComboPerfeito) this._checkComboAchievement('q'); // CONQUISTA
                
                playBeep(300, 0.1, 'triangle', 0.5); // Som de "whoosh"
                
                this.sp -= cost;
                this.dashCooldown = ABILITY_CONSTS.DASH.COOLDOWN * this.dashCooldownMultiplier;
                
                // Lógica "O Esquivo"
                this.dashDuration = 0.1 * this.dashDistanceMultiplier;
                const invulnDuration = (0.1 + this.dashInvulnBonus) * 1000;
                
                this.isInvulnerable = true;
                setTimeout(() => {
                    this.isInvulnerable = false;
                }, invulnDuration);
            }

            // Habilidade: Impacto (W)
            useImpact() {
                const cost = ABILITY_CONSTS.IMPACT.COST * this.impactCostMultiplier;
                if (gameState !== 'PLAYING' || !canUseAbility(cost, this.impactCooldown)) {
                    triggerAbilityFail(impactBtn, cost);
                    return;
                }
                
                if (canGetEconomista) hasUsedSP = true; // CONQUISTA
                if (canGetComboPerfeito) this._checkComboAchievement('w'); // CONQUISTA

                this.sp -= cost;
                this.impactCooldown = ABILITY_CONSTS.IMPACT.COOLDOWN * this.impactCooldownMultiplier;
                
                // Ativa o primeiro pulso de dano
                activateImpactFlash('orange', 2);
                
                // Ativa o segundo pulso de dano após um atraso
                setTimeout(() => {
                    if (gameState === 'PLAYING') {
                        activateImpactFlash('red', 2);
                    }
                }, 150);
            }

            // Habilidade: Berserk (E)
            useBerserk() {
                const cost = ABILITY_CONSTS.BERSERK.COST * this.berserkCostMultiplier;
                if (gameState !== 'PLAYING' || !canUseAbility(cost, this.berserkCooldown)) {
                    triggerAbilityFail(berserkBtn, cost);
                    return;
                }
                
                if (canGetEconomista) hasUsedSP = true; // CONQUISTA
                
                // CONQUISTA: Imprudente
                if (canGetImprudente && (this.hp / this.maxHp) < 0.2) {
                    showAchievement("🏆 Imprudente! Ativou Berserk com HP baixo!", 0.05, 3, 'IMPRUDENTE');
                    canGetImprudente = false;
                }
                
                if (canGetComboPerfeito) this._checkComboAchievement('e'); // CONQUISTA
                
                playBeep(200, 0.3, 'sawtooth', 1.0); // Som de "Rage"
                
                this.sp -= cost;
                this.berserkCooldown = ABILITY_CONSTS.BERSERK.COOLDOWN * this.berserkCooldownMultiplier;
                this.berserkDuration = 4 * this.berserkDurationMultiplier;
                this.isBerserk = true;

                // Aplica os buffs de status (serão recalculados no loop com Foco Total)
                this.currentMoveSpeed = this.moveSpeed * Math.max(2.0, (1.0 + this.reacaoAdrenalMoveSpeedBuff));
                
                // Feedback visual no contorno da tela
                document.getElementById('game-container').classList.add('berserk-active');
                cameraShake = 4;
            }
            
            // Função para consumir Brinde (T)
            consumePowerupStack() {
                if (gameState !== 'PLAYING' || this.powerupStacks <= 0) {
                    playBeep(100, 0.1, 'square', 0.5); // Som de falha/vazio
                    return;
                }
                
				playBeep(1100, 0.15, 'square', 1.0); // Som de usar brinde
                
                this.powerupStacks--;
                
                // Pega um upgrade aleatório APENAS da lista PADRÃO (UPGRADES)
                const randomIndex = Math.floor(Math.random() * UPGRADES.length); // Usa UPGRADES.length
                const upgrade = UPGRADES[randomIndex]; // Pega direto de UPGRADES
                
                this.applyUpgrade(upgrade); // Aplica
                showUpgradeToast(upgrade); // Mostra o toast
                updateHUDs(); // Atualiza o contador no HUD
            }

            // Aplica o efeito de um aprimoramento selecionado
            applyUpgrade(upgrade) {
                // A função apply() dos upgrades modifica 'player' (esta instância)
                upgrade.apply();
                
                // --- Lógica de Códice/Conquista de Arma ---
                if (upgrade.category === 'arma' && upgrade.weaponId) {
                    // Pega o novo nível da arma que ACABOU de ser atualizada
                    const newLevel = this.passiveWeapons[upgrade.weaponId]?.level;

                    // Passa o ID da arma E o seu novo nível para a verificação
                    checkWeaponAchievement(upgrade.weaponId, newLevel);
                    
                    // CÓDICE: Desbloqueia a arma (Desbloqueia no Nv 1)
                    if (!metaUpgrades.unlockedWeapons.includes(upgrade.weaponId)) {
                        metaUpgrades.unlockedWeapons.push(upgrade.weaponId);
                        saveMetaUpgrades();
                    }
                }
                
                // Garante que HP/SP não ultrapassem o novo máximo
                this.hp = Math.min(this.hp, this.maxHp);
                this.sp = Math.min(this.sp, this.maxSp);
                
                consecutiveUpgrades++; // Para conquistas
                checkAchievements();
                updateHUDs();
            }
            
            /**
             * Adiciona uma nova arma passiva ao jogador (Nível 1)
             * @param {string} weaponId - A chave da arma (ex: 'auraDourada')
             */
            addPassiveWeapon(weaponId) {
                if (!PASSIVE_WEAPON_DEFINITIONS[weaponId] || this.passiveWeapons[weaponId]) return; // Já tem
                const definition = PASSIVE_WEAPON_DEFINITIONS[weaponId];
                this.passiveWeapons[weaponId] = {
                    id: weaponId, // Armazena o ID para referência
                    level: 1,
                    timer: 0, // Inicia o timer em 0 para disparar imediatamente
                    emoji: definition.emoji
                };
            }

            // --- Métodos de Lógica ---
            
            // Aplica efeitos on-hit (Vampiro, Bruxo)
            triggerOnHitEffects() {
                // Vampiro
                if (this.vampireChance > 0 && Math.random() < this.vampireChance) {
                    const hpHeal = this.maxHp * 0.01; // Cura 1%
                    this.hp = Math.min(this.maxHp, this.hp + hpHeal);
                    showFloatingText(this.x, this.y + 15, `+${hpHeal.toFixed(1)}`, 'heal_hp'); // Mudamos 'crit' para 'heal_hp' e removemos " HP"
                }
                
                // Bruxo
                if (this.wizardChance > 0 && Math.random() < this.wizardChance) {
                    const spHeal = this.maxSp * 0.01; // Recupera 1%
                    this.sp = Math.min(this.maxSp, this.sp + spHeal);
                    showFloatingText(this.x, this.y + 30, `+${spHeal.toFixed(1)}`, 'heal_sp'); // Mudamos 'crit' para 'heal_sp' e removemos " SP"
                }
            }
            
            // Helper para Dano Dinâmico (Fúria do Tigre)
            getDynamicDamageMultiplier() {
                let multiplier = 1.0;
                
                // Fúria do Tigre
                if (this.furiaDoTigreMultiplier > 0) {
                    const hpPercentMissing = 1.0 - (this.hp / this.maxHp);
                    const furiaBonus = hpPercentMissing * this.furiaDoTigreMultiplier;
                    multiplier += furiaBonus;
                }
                
                return multiplier;
            }

            // Helper para Coleta Dinâmica (Imã)
            getDynamicCollectionRange() {
                let multiplier = this.collectionRangeMultiplier;
                if (this.isMagnetActive) {
                    multiplier += 10.0; // Aumenta em 1000%
                }
                return COLLECTION_RANGE * multiplier;
            }

            // Helper da conquista "Combo Perfeito"
            _checkComboAchievement(key) {
                if (this.comboTimer <= 0) { // Primeira habilidade do combo
                    this.comboTimer = 5.0; // Inicia janela de 5s
                    this.comboTracker = { q: false, w: false, e: false };
                }
                this.comboTracker[key] = true;
                
                // Checa se completou
                if (this.comboTracker.q && this.comboTracker.w && this.comboTracker.e) {
                    showAchievement("🏆 Combo Perfeito! Usou Q, W e E em 5 segundos!", 0.05, 3, 'COMBO_PERFEITO');
                    this.comboTimer = 0; // Reseta timer
                    canGetComboPerfeito = false; // Só pode ganhar uma vez
                }
            }
            
            /**
             * Aplica lentidão ao jogador.
             * @param {number} duration - A duração do slow em segundos.
             */
            applySlow(duration) {
                this.isSlowed = true;
                // Pega a duração mais longa se já estiver lento
                this.slowTimer = Math.max(this.slowTimer, duration);
                showFloatingText(this.x, this.y - 30, 'LENTO! 🕸️', 'player');
                playBeep(180, 0.2, 'square', 0.8); // Som de "debuff"
            }
            
        }
		// --- NOVA CLASSE PARA ESPOROS EXPLOSIVOS ---
        class SporeMine {
            constructor(x, y, radius, duration, damage, triggerRadius, slowDuration = 0) {
                this.x = x;
                this.y = y;
                this.radius = radius; // Raio da explosão
                this.radiusSq = radius * radius;
                this.duration = duration; // Tempo de vida
                this.maxDuration = duration;
                this.damage = damage;
                this.triggerRadius = triggerRadius; // Raio para ativar
                this.triggerRadiusSq = triggerRadius * triggerRadius;
                this.slowDuration = slowDuration; // Duração do slow (se houver)
                this.emoji = '🍄';
                this.isAlive = true;
                this.triggered = false; // Evita múltiplas explosões
            }

            update(dt) {
                if (!this.isAlive || this.triggered) return;

                this.duration -= dt;
                if (this.duration <= 0) {
                    this.isAlive = false; // Fizzle (some sem explodir)
                    spawnParticles(this.x, this.y, 5, 'grey', 1, 3, 1, 2, 0.5); // Fumaça
                    return;
                }

                // Verifica inimigos próximos para detonar
                const nearbyEnemies = spatialGrid.getNearby(this.x, this.y)
                                        .filter(e => e.type && e.isAlive); // Apenas inimigos vivos

                for (const enemy of nearbyEnemies) {
                    if (distanceSquared(this.x, this.y, enemy.x, enemy.y) < this.triggerRadiusSq) {
                        this.explode();
                        this.triggered = true;
                        this.isAlive = false;
                        break; // Explode apenas uma vez
                    }
                }
            }

            explode() {
                playBeep(150, 0.2, 'sawtooth', 0.8); // Som de explosão abafado
                spawnParticles(this.x, this.y, 20, 'rgba(100, 200, 100, 0.8)', 3, 7, 2, 6, 0.6); // Partículas verdes

                const nearbyTargets = spatialGrid.getNearby(this.x, this.y);
                let enemiesHitCount = 0; // Para conquista

                nearbyTargets.forEach(target => {
                    if (target.isAlive && typeof target.takeDamage === 'function' && distanceSquared(this.x, this.y, target.x, target.y) < this.radiusSq) {

                        target.takeDamage(this.damage, false); // Dano da explosão (não crit)

                        if (target.type) { // Aplica slow apenas em inimigos
                            enemiesHitCount++;
                            if (this.slowDuration > 0) {
                                target.applySlow(this.slowDuration);
                            }
                        }
                    }
                });

                // --- CONQUISTA: DETONAÇÃO FÚNGICA ---
                if (enemiesHitCount >= 3 && canGetDetonacaoFungica) {
                    showAchievement('🏆 Detonação Fúngica! Acertou 3+ com 1 Esporo!', 0.05, 3, 'DETONACAO_FUNGICA');
                    canGetDetonacaoFungica = false;
                }
            }

            draw() {
                 // Opacidade diminui com o tempo (fade out)
                const alpha = Math.min(1, this.duration / (this.maxDuration * 0.5)) * 0.8;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(this.x, this.y);

                // Efeito visual pulsante leve
                const scale = 1 + Math.sin(gameTime * 6 + this.x) * 0.1; // Usa this.x para dessincronizar
                ctx.scale(scale, scale);

                // Desenha o emoji
                ctx.font = `20px var(--pixel-font)`; // Tamanho fixo para o esporo
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'green';
                ctx.shadowBlur = 5;
                ctx.fillText(this.emoji, 0, 0);

                ctx.restore();
            }
        }
        // --- FIM CLASSE ESPORO ---

		// --- NOVA CLASSE PARA CLONE INSTÁVEL ---
        class PlayerClone {
            constructor(x, y, duration, damageScale, attackSpeedScale) {
                this.x = x;
                this.y = y;
                this.size = player.size * 0.8; // Um pouco menor
                this.emoji = '🧬';
                this.duration = duration;
                this.maxDuration = duration;
                this.damageScale = damageScale;
                this.attackSpeedScale = attackSpeedScale;
                this.isAlive = true;

                // Calcula o cooldown de ataque do clone baseado no do player
                // Certifique-se que player.currentAttackSpeed não seja zero
                const playerAttackSpeed = player.currentAttackSpeed > 0 ? player.currentAttackSpeed : 1;
                this.attackCooldown = 1 / (playerAttackSpeed * this.attackSpeedScale);
                this.attackTimer = Math.random() * this.attackCooldown; // Ataque inicial aleatório
            }

            update(dt) {
                if (!this.isAlive) return;

                this.duration -= dt;
                if (this.duration <= 0) {
                    this.isAlive = false;
                    spawnParticles(this.x, this.y, 10, 'lightblue', 2, 4, 1, 3, 0.5); // Efeito de dissipar
                    return;
                }

                // Lógica de ataque do clone
                this.attackTimer -= dt;
                if (this.attackTimer <= 0) {
                    // Encontra alvo mais próximo (alcance menor que o player)
                    const cloneAttackRange = BASE_ATTACK_RANGE * player.attackRangeMultiplier * 0.7; // 70% do alcance
                    const cloneAttackRangeSq = cloneAttackRange * cloneAttackRange;

                    const potentialTargets = spatialGrid.getNearby(this.x, this.y)
                        .filter(e => e.type && e.isAlive) // Apenas Inimigos vivos
                        .map(target => ({ target, distSq: distanceSquared(this.x, this.y, target.x, target.y) }))
                        .filter(item => item.distSq < cloneAttackRangeSq)
                        .sort((a, b) => a.distSq - b.distSq);

                    if (potentialTargets.length > 0) {
                        const target = potentialTargets[0].target;
                        const angle = Math.atan2(target.y - this.y, target.x - this.x);
                        const cloneDamage = player.currentBaseDamage * this.damageScale; // Dano escalado
                        const projSpeed = 4.0; // Velocidade fixa
                        const projColor = 'lightblue';

                        playBeep(900, 0.03, 'sine', 0.4); // Som de tiro do clone

                        // Cria um projétil SIMPLES (não herda efeitos complexos)
                        let p = projectilePool.pop();
                        if (p) {
                             // Reutiliza: (maxPierce=0, isBoomerang=false, etc.)
                            p.init(this.x, this.y, angle, projSpeed, cloneDamage, projColor, 8, true, 'CLONE_SHOT', 0, false, 0, 0, 0, 0);
                        } else {
                            // Cria novo
                            p = new Projectile(this.x, this.y, angle, projSpeed, cloneDamage, projColor, 8, true, 'CLONE_SHOT', 0, false, 0, 0, 0, 0);
                        }
                        projectiles.push(p);

                        // Reseta o timer de ataque do clone
                        // Certifique-se que player.currentAttackSpeed não seja zero
                        const playerAttackSpeed = player.currentAttackSpeed > 0 ? player.currentAttackSpeed : 1;
                        this.attackCooldown = 1 / (playerAttackSpeed * this.attackSpeedScale); // Recalcula caso ASPD do player mude
                        this.attackTimer = this.attackCooldown;
                    } else {
                        // Se não encontrou alvo, tenta de novo logo
                        this.attackTimer = 0.1;
                    }
                }
            }

            draw() {
                // Opacidade diminui no final da vida
                const alpha = Math.min(1, this.duration / (this.maxDuration * 0.3)) * 0.7;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(this.x, this.y);

                // Efeito visual pulsante
                const scale = 1 + Math.sin(gameTime * 10 + this.x) * 0.05; // Usa this.x para dessincronizar
                ctx.scale(scale, scale);

                ctx.font = `${this.size}px var(--pixel-font)`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'lightblue';
                ctx.shadowBlur = 10;
                ctx.fillText(this.emoji, 0, 0);

                ctx.restore();
            }
        }
        // --- FIM CLASSE CLONE ---