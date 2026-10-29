        // Definição dos upgrades da loja (Nome, Descrição, ID, Custo, Max)
        const META_UPGRADE_LIST = [
            {
                id: 'bonusHp',
                name: '❤️ Vitalidade do Tigre',
                description: 'Comece com +10 HP Máx por nível.',
                maxLevel: 10,
                // Função de custo (aumenta a cada nível)
                getCost: (level) => 50 + (level * 25) 
            },
            {
                id: 'bonusDmg',
                name: '⚔️ Garras Afiadas',
                description: 'Comece com +2% Dano Base por nível.',
                maxLevel: 10,
                getCost: (level) => 75 + (level * 50)
            },
            {
                id: 'bonusSpRegen',
                name: '🧘 Foco Interior',
                description: 'Comece com +0.1 SP/s por nível.',
                maxLevel: 5,
                getCost: (level) => 100 + (level * 75)
            },
            {
                id: 'bonusMoveSpeed',
                name: '👟 Pés Leves',
                description: 'Comece com +1% Veloc. Mov. por nível.',
                maxLevel: 10,
                getCost: (level) => 60 + (level * 30)
            },
            {
                id: 'bonusCritChance',
                name: '🎯 Olho Preciso',
                description: 'Comece com +0.2% Chance Crítica por nível.',
                maxLevel: 5,
                getCost: (level) => 150 + (level * 100)
            },
            {
                id: 'bonusCollectionRange',
                name: '🧲 Magnetismo',
                description: 'Aumenta a área de coleta de itens em +5% por nível.',
                maxLevel: 10,
                getCost: (level) => 80 + (level * 40) 
            },
            {
                id: 'startBonusPowerup',
                name: '⭐ Brinde Inicial',
                description: 'Comece a partida com +1 Brinde (⭐) por nível.',
                maxLevel: 3,
                getCost: (level) => 200 + (level * 100)
            },
            {
                id: 'startBonusReroll',
                name: '🧠 Mente Flexível',
                description: 'Receba +1 Giro Grátis (Level Up) por nível.',
                maxLevel: 3,
                getCost: (level) => 150 + (level * 100)
            },
            {
                id: 'bonusBrindeChance',
                name: '🍀 Sorte de Novato',
                description: 'Aumenta a chance de Brindes (⭐) em +2% (mult.) por nível.',
                maxLevel: 10,
                getCost: (level) => 100 + (level * 50)
            },
            {
                id: 'bonusXPGain',
                name: '🎓 Sabedoria Acumulada',
                description: 'Comece com +1% de Ganho de XP por nível.',
                maxLevel: 10,
                getCost: (level) => 100 + (level * 60)
            },
            {
                id: 'bonusProjectiles',
                name: '🏹 Tiro Multiplicador',
                description: 'Comece com +1 Projetil por nível.',
                maxLevel: 2, // Muito forte, limite baixo
                getCost: (level) => 500 + (level * 500) // Custo alto
            },
            {
                id: 'bonusSpecialDropChance',
                name: '✨ Caçador de Relíquias',
                description: 'Chance de cair Coletáveis (🧲,💣) +10% por nível.',
                maxLevel: 5,
                getCost: (level) => 150 + (level * 100)
            },
            {
                id: 'startDifficultyBonus',
                name: '🔥 Desafiante',
                description: 'Comece com +10% Dificuldade E +5% Ganho de XP por nível.',
                maxLevel: 5,
                getCost: (level) => 100 + (level * 50)
            },
            {
                id: 'bonusLuck',
                name: '✨ Sortudo',
                description: 'Aumenta Crit Chance (+0.1%) e Chance de Brinde (+1% mult.) por nível.',
                maxLevel: 5,
                getCost: (level) => 120 + (level * 80)
            },
            {
                id: 'bonusGemologo',
                name: '💠 Gemólogo Experiente',
                description: '+5% Ataques/s e +1% Chance de Gema Extra por nível.',
                maxLevel: 10, // 10 níveis = +50% ASPD e +10% Gema Extra
                getCost: (level) => 150 + (level * 100) // Custo alto por ser stat duplo
            }
        ];
		
		const SKIN_LIST = [
            // Padrão
            { id: '🐯', name: 'Tigre',     description: '<strong>Fúria Primitiva:</strong> +10% Dano Base, -5% HP Máx.' },
            { id: '🐮', name: 'Vaca',      description: '<strong>Resistência Rústica:</strong> +25% HP Máx, -10% Veloc. Mov.' },
            { id: '🐷', name: 'Porco',     description: '<strong>Gula:</strong> Gemas (💠) recuperam 50% a mais de HP/SP.' },
            { id: '🐸', name: 'Sapo',      description: '<strong>Salto Ágil:</strong> Custo de SP do Dash -20%, Cooldown do Dash -10%.' },
            { id: '🐻', name: 'Urso',      description: '<strong>Pele Grossa:</strong> Começa com +1 acúmulo de "Aura Protetora".' },
            { id: '🐰', name: 'Coelho',    description: '<strong>Pés Ligeiros:</strong> +15% Velocidade de Movimento.' },
            { id: '🐶', name: 'Cachorro',  description: '<strong>Lealdade:</strong> +50% Raio de Coleta de itens.' },
            { id: '🐵', name: 'Macaco',    description: '<strong>Travessura:</strong> +5% Chance Crítica e +10% Dano Crítico.' },
            // Premium
            { id: '🤡', name: 'Palhaço',   description: '<strong>Coringa:</strong> Começa com a arma passiva "Coringa Selvagem" Nv. 1.' },
            { id: '👽', name: 'Alien',     description: '<strong>Tecnologia Arcana:</strong> Começa com +1 Projétil de ataque automático.' },
            { id: '🤖', name: 'Robô',      description: '<strong>Eficiência:</strong> +0.5 Regeneração de SP/s.' },
            { id: '🎃', name: 'Abóbora',   description: '<strong>Colheita Sombria:</strong> Começa com +5% de Chance de Vampirismo.' }
        ];
		
		// Quais skins são premium
		const PREMIUM_SKINS = ['🤡', '👽', '🤖', '🎃'];
		
		// Custos e Bônus
        const SKIN_COST = 100;
        const SKIN_XP_BONUS_PER_SKIN = 0.05; // +5% de bônus de XP por skin
        
        // Novas constantes para skins premium
        const PREMIUM_SKIN_COST = 200; // Dobro do custo
        const PREMIUM_SKIN_XP_BONUS = 0.10; // Dobro do bônus
		
		// CÓDICE: Inimigos
        const ENEMY_DEFINITIONS = {
            'PADRAO': { name: 'Esqueleto', emoji: '💀', desc: 'Inimigo básico. Persegue o jogador para causar dano de contato.' },
            'ZUMBI': { name: 'Zumbi', emoji: '🧟', desc: 'Lento e fraco, mas pode aparecer em hordas ou de inimigos derrotados.' },
            'GHOST': { name: 'Fantasma', emoji: '👻', desc: 'Extremamente rápido e errático. Frágil, mas difícil de acertar. Atravessa obstáculos.' },
            'ATIRADOR': { name: 'Atirador', emoji: '☠️', desc: 'Para a distância e dispara projéteis perigosos.' },
            'ARANHA': { name: 'Aranha', emoji: '🕷️', desc: 'Dispara teias que causam lentidão (SLOW) ao jogador.' },
            'ZUMBETE': { name: 'Zumbete', emoji: '🧟‍♀️', desc: 'Mais rápida que o Zumbi comum, também surge de inimigos caídos.' },
            'ELITE': { name: 'Elite', emoji: '👹', desc: 'Uma versão mais forte e resistente dos inimigos comuns. Concede mais recompensas.' },
            'CHEFE': { name: 'Chefe', emoji: '👑', desc: 'Inimigo raro e poderoso com vida massiva. Derrotá-lo é um grande desafio.' }
        };

        // CÓDICE: Itens
        const ITEM_DEFINITIONS = {
            'Gema': { name: 'Gema', emoji: '💠', desc: 'Coletável principal. Recupera uma pequena quantidade de HP e SP.' },
            'MOEDA': { name: 'Brinde', emoji: '⭐', desc: 'Coletável raro. Acumula "Brindes" que podem ser usados com a tecla (T) para um aprimoramento imediato.' },
            'XP_GEM': { name: 'Orbe de XP', emoji: '✨', desc: 'Coletado ao derrotar inimigos. Necessário para subir de nível.' },
            'MAGNET': { name: 'Imã', emoji: '🧲', desc: 'Item especial temporário. Aumenta massivamente o raio de coleta por 3 segundos.' },
            'BOMB': { name: 'Bomba', emoji: '💣', desc: 'Item especial. Explode ao ser coletado, causando dano massivo a todos os inimigos próximos.' },
            'POTION': { name: 'Poção', emoji: '❤️‍🩹', desc: 'Item especial. Recupera 10% do HP máximo instantaneamente.' },
            'LIGHTNING': { name: 'Relâmpago', emoji: '⚡', desc: 'Item especial temporário. Seus ataques automáticos acertam um inimigo adicional (ataque em cadeia) por 5 segundos.' }
        };
		
		// CONQUISTAS: Lista Mestra
        const MASTER_ACHIEVEMENT_LIST = [
            // Duração
            { id: 'PE_LEVE', name: '👟 Pé Leve', desc: 'Sobreviva por 2 minutos.' },
            { id: 'MARATONISTA', name: '🏃 Maratonista', desc: 'Sobreviva por 5 minutos.' },
            { id: 'INVENCIVEL', name: '⏳ Invencível', desc: 'Sobreviva por 15 minutos.' },
            // Combate
            { id: 'CACADOR_ELITE', name: '👹 Caçador de Elite', desc: 'Derrote seu primeiro inimigo Elite.' },
            { id: 'CARRASCO', name: '👑 Carrasco', desc: 'Derrote 3 Chefes em uma única partida.' },
            { id: 'CEIFADOR', name: '💀 Ceifador', desc: 'Derrote 1000 inimigos em uma única partida.' },
            { id: 'DEUS_DA_GUERRA', name: '🔥 Deus da Guerra', desc: 'Alcance 1000 DPS (Dano Por Segundo).' },
            { id: 'PRECISAO_LETAL', name: '🎯 Precisão Letal', desc: 'Consiga 5 acertos críticos seguidos.' },
            { id: 'DESTRUIDOR', name: '🏺 Destruidor', desc: 'Destrua 20 objetos destrutíveis em uma partida.' },
            // Habilidades
            { id: 'COMBO_PERFEITO', name: '🏆 Combo Perfeito!', desc: 'Use Dash (Q/Shift), Impacto (W/Q) e Berserk (E) em 5 segundos.' },
            { id: 'IMPACTO_MASSIVO', name: '💥 Impacto Massivo', desc: 'Acerte 10+ inimigos com um único uso da habilidade Impacto.' },
            { id: 'FURIA_INCONTROLAVEL', name: '👹 Fúria Incontrolável', desc: 'Derrote 15+ inimigos durante um único Berserk.' },
            { id: 'ESQUIVA_PERFEITA', name: '✨ Esquiva Perfeita', desc: 'Desvie de um projétil inimigo usando o Dash.' },
            // Especiais
            { id: 'POR_UM_FIO', name: '❤️‍🩹 Por Um Fio', desc: 'Derrote um inimigo enquanto estiver com menos de 10% de HP.' },
            { id: 'RESERVA_DE_PODER', name: '🏆 Reserva de Poder', desc: 'Derrote 10 inimigos enquanto estiver com SP máximo.' },
            { id: 'CACADOR_SELVAGEM', name: '🏆 Caçador Selvagem', desc: 'Derrote um Elite ou Chefe durante o Berserk.' },
            { id: 'EXTERMINADOR_HORDAS', name: '🏆 Exterminador de Hordas', desc: 'Derrote 20 Zumbis em 10 segundos.' },
            { id: 'DEFENSOR_DA_HORDA', name: '🧟 Defensor da Horda', desc: 'Sobreviva à primeira horda de Zumbis.' },
            { id: 'INTOCAVEL', name: '🏆 Intocável', desc: 'Derrote 3 Atiradores/Aranhas seguidos sem ser atingido por projéteis.' },
            { id: 'IMPRUDENTE', name: '🏆 Imprudente', desc: 'Ative o Berserk com menos de 20% de HP.' },
            { id: 'ECONOMISTA', name: ' frugal Economista', desc: 'Chegue ao Nível 5 sem usar nenhuma habilidade de SP.' },
            // Nível e Coleta
            { id: 'ESPECIALISTA', name: '🏆 Especialista', desc: 'Alcance o Nível 10.' },
            { id: 'MESTRE_DE_CLASSE', name: '🏆 Mestre de Classe', desc: 'Alcance o Nível 25.' },
            { id: 'COLHEITA_RAPIDA', name: '💠 Colheita Rápida', desc: 'Colete 5 Gemas em 5 segundos.' },
            { id: 'COLECIONADOR_AVIDO', name: '💠 Colecionador Ávido', desc: 'Colete 100 Gemas em uma única partida.' },
            { id: 'SORTUDO', name: '⭐ Sortudo', desc: 'Colete 5 Brindes em uma única partida.' },
            // Itens Especiais
            { id: 'ITEM_IMA', name: '🧲 Super Imã!', desc: 'Colete um Imã especial.' },
            { id: 'ITEM_BOMBA', name: '💣 KABOOM!', desc: 'Colete uma Bomba especial.' },
            { id: 'ITEM_POCAO', name: '❤️‍🩹 Alívio Imediato!', desc: 'Colete uma Poção especial.' },
            { id: 'ITEM_RAIO', name: '⚡ Ataque em Cadeia!', desc: 'Colete um Relâmpago especial.' },
            // Armas
            { id: 'ARMA_AURA_DOURADA', name: '🌟 Iluminado', desc: 'Desbloqueie a arma "Aura Dourada".' },
            { id: 'ARMA_GARRAS_AFIADAS', name: '🔪 Manicure Afiada', desc: 'Desbloqueie a arma "Garras Afiadas".' },
            { id: 'ARMA_ORBE_ARCANO', name: '🔮 Vidente', desc: 'Desbloqueie a arma "Orbe Arcano".' },
            { id: 'ARMA_COMETA_CADENTE', name: '☄️ Observador de Estrelas', desc: 'Desbloqueie a arma "Cometa Cadente".' },
            { id: 'ARMA_CHAO_CONSAGRADO', name: '🔥 Piromante', desc: 'Desbloqueie a arma "Chão Consagrado".' },
            { id: 'ARMA_PULSO_CINETICO', name: '💨 Campo de Força', desc: 'DesbloqueIE a arma "Pulso Cinético".' },
            { id: 'ARMA_ESPINHOS_TRASEIROS', name: '🌵 Porco-Espinho', desc: 'Desbloqueie a arma "Espinhos Traseiros".' },
            { id: 'ARMA_VARINHA_MAGICA', name: '🪄 Prestidigitador', desc: 'Desbloqueie a arma "Varinha Mágica".' },
            { id: 'ARMA_CORINGA_SELVAGEM', name: '🃏 O Apostador', desc: 'Desbloqueie a arma "Coringa Selvagem".' },
            { id: 'ARMA_PRESA_RETORNAVEL', name: '🪃 Bumerangue', desc: 'Desbloqueie a arma "Presa Retornável".' },
            { id: 'RETORNO_CERTEIRO', name: '🏆 Retorno Certeiro', desc: 'Acerte 5+ inimigos com um único lançamento da Presa Retornável.' },
            { id: 'ARMA_BARDO', name: '🪕 Trovador', desc: 'Desbloqueie a arma "Bardo Amaldiçoado".' },
            { id: 'ARMA_LAMINAS', name: '✂️ O Alfaiate', desc: 'Desbloqueie a arma "Lâminas Gêmeas".' },
            { id: 'ARMA_ALQUIMISTA', name: '🧪 Alquimista', desc: 'Desbloqueie a arma "Poção Instável".' },
            { id: 'ARMA_JOGADOR', name: '🎲 Jogador', desc: 'Desbloqueie a arma "Dados Viciados".' },
            { id: 'ARMA_LENHADOR', name: '🪓 Lenhador', desc: 'Desbloqueie a arma "Machado Giratório".' },
            { id: 'ARMA_HEMOMANTE', name: '🩸 Hemomante', desc: 'Desbloqueie a arma "Ritual Sangrento".' },
            { id: 'ARMA_PAVIO_CURTO', name: '🧨 Engenheiro de Demolição', desc: 'Desbloqueie a arma "Pavio Curto".' },
            { id: 'REACAO_EM_CADEIA', name: '🏆 Reação em Cadeia', desc: 'Acerte 5+ inimigos com uma única explosão do Pavio Curto.' },
            { id: 'ARMA_ADAGA_CERTEIRA', name: '🗡️ Precisão Mortal', desc: 'Desbloqueie a arma "Adaga Certeira".' },
            { id: 'PONTO_FRACO', name: '🏆 Ponto Fraco', desc: 'Consiga 3 acertos críticos seguidos com a Adaga Certeira.' },
            { id: 'ARMA_ESPOROS_EXPLOSIVOS', name: '🍄 Micologista de Combate', desc: 'Desbloqueie a arma "Esporos Explosivos".' },
            { id: 'DETONACAO_FUNGICA', name: '🏆 Detonação Fúngica', desc: 'Acerte 3+ inimigos com a explosão de um único Esporo.' },
            { id: 'ARMA_CLONE_INSTAVEL', name: '🧬 Engenharia Genética', desc: 'Desbloqueie a arma "Clone Instável".' },
            { id: 'MULTIPLICACAO_CELULAR', name: '🏆 Multiplicação Celular', desc: 'Tenha 3 ou mais Clones Instáveis ativos ao mesmo tempo.' }
        ];
		
		// --- Banco de Aprimoramentos (Level Up) ---
        const UPGRADES = [
            { 
                name: "Dano Base +10%", 
                description: "Aumenta seu dano em 10%.", 
                apply: () => { player.baseDamage *= 1.1; player.currentBaseDamage *= 1.1; }, 
                category: 'ofensivo',
                getContext: () => `(Atual: ${player.baseDamage.toFixed(1)} &rarr; <span class='text-green-300'>${(player.baseDamage * 1.1).toFixed(1)}</span>)`
            },
            { 
                name: "Ataques/s +12%", 
                description: "Aumenta sua velocidade de ataque em 12%.", 
                apply: () => { player.attackSpeed *= 1.12; player.currentAttackSpeed *= 1.12; }, 
                category: 'ofensivo',
                getContext: () => `(Atual: ${player.attackSpeed.toFixed(2)} &rarr; <span class='text-green-300'>${(player.attackSpeed * 1.12).toFixed(2)}</span>)`
            },
            { 
                name: "Chance Crítica +1%", 
                description: "Aumenta sua chance de acerto crítico.", 
                apply: () => player.critChance += 0.01, 
                category: 'critico',
                getContext: () => `(Atual: ${(player.critChance * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${(player.critChance * 100 + 1).toFixed(0)}%</span>)`
            },
            { 
                name: "Dano Crítico +10%", 
                description: "Aumenta o multiplicador de dano crítico.", 
                apply: () => player.critDamageMultiplier += 0.1, 
                category: 'critico',
                getContext: () => `(Atual: ${(player.critDamageMultiplier * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${(player.critDamageMultiplier * 100 + 10).toFixed(0)}%</span>)`
            },
            { 
                name: "Velocidade Mov. +10%", 
                description: "Aumenta sua velocidade de movimento no campo.", 
                apply: () => { player.moveSpeed *= 1.1; player.currentMoveSpeed *= 1.1; }, 
                category: 'utilidade',
                getContext: () => "" // (Não é simples de mostrar, bônus é multiplicativo)
            },
            { 
                name: "HP Máximo +10", 
                description: "Aumenta seu HP máximo e recupera 10 HP.", 
                apply: () => { player.maxHp += 10; player.hp = Math.min(player.hp + 10, player.maxHp); }, 
                category: 'defensivo',
                getContext: () => `(Atual: ${player.maxHp} &rarr; <span class='text-green-300'>${player.maxHp + 10}</span>)`
            },
            { 
                name: "SP Máximo +10", 
                description: "Aumenta seu SP máximo e recupera 10 SP.", 
                apply: () => { player.maxSp += 10; player.sp = Math.min(player.sp + 10, player.maxSp); }, 
                category: 'utilidade',
                getContext: () => `(Atual: ${player.maxSp} &rarr; <span class='text-green-300'>${player.maxSp + 10}</span>)`
            },
            { 
                name: "Dificuldade +20%", 
                description: "Aumenta permanentemente a dificuldade do jogo. Apenas para os ousados!", 
                apply: () => difficulty *= 1.2, 
                category: 'especial',
                getContext: () => ""
            },
            { 
                name: "Foco no Tigre", 
                description: "Ataques mais precisos. Chance Crítica +5% e Dano Crítico +25%.", 
                apply: () => { player.critChance += 0.05; player.critDamageMultiplier += 0.25; }, 
                category: 'critico',
                getContext: () => ""
            },
            { 
                name: "Estamina do Lutador", 
                description: "Regeneração de SP +1 por segundo.", 
                apply: () => { player.spRegen += 1; }, 
                category: 'utilidade',
                getContext: () => ""
            },
            { 
                name: "Visão", 
                description: "Aumenta a área de ataque em 10% e a visibilidade de inimigos distantes em 1%.", 
                apply: () => { player.attackRangeMultiplier += 0.1; player.visionOpacityBonus += 0.01; }, 
                category: 'utilidade',
                getContext: () => `(Dist.: ${(player.attackRangeMultiplier * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${((player.attackRangeMultiplier + 0.1) * 100).toFixed(0)}%</span>)`
            },
            { 
                name: "Experiente", 
                description: "Adiciona +1% de chance de dropar o dobro de XP (acumulativo).", 
                apply: () => { player.doubleXpChance += 0.01; }, 
                category: 'especial',
                getContext: () => `(Chance: ${(player.doubleXpChance * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${((player.doubleXpChance + 0.01) * 100).toFixed(0)}%</span>)`
            },
            { 
                name: "O Esquivo", 
                description: "Aumenta a distância do Dash em 10% e o tempo de invulnerabilidade em 0.01s.", 
                apply: () => { player.dashDistanceMultiplier += 0.1; player.dashInvulnBonus += 0.01; }, 
                category: 'defensivo',
                getContext: () => `(Dist.: ${(player.dashDistanceMultiplier * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${((player.dashDistanceMultiplier + 0.1) * 100).toFixed(0)}%</span>)`
            },
            { 
                name: "Colecionador", 
                description: "Adiciona +1% de chance de coletar uma Gema extra (acumulativo).", 
                apply: () => { player.extraGrapeChance += 0.01; }, 
                category: 'utilidade',
                getContext: () => `(Chance: ${(player.extraGrapeChance * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${((player.extraGrapeChance + 0.01) * 100).toFixed(0)}%</span>)`
            },        
            { 
                name: "Imã", 
                description: "Aumenta a área de coleta de itens em 10%.", 
                apply: () => { player.collectionRangeMultiplier += 0.1; }, 
                category: 'utilidade',
                getContext: () => `(Área: ${(player.collectionRangeMultiplier * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${((player.collectionRangeMultiplier + 0.1) * 100).toFixed(0)}%</span>)`
            },
            { 
                name: "Impacto", 
                description: "Aumenta a área da habilidade Impacto (W) em 10% e o dano em 5%.", 
                apply: () => { player.impactAreaMultiplier += 0.1; player.impactDamageMultiplier += 0.05;}, 
                category: 'ofensivo',
                getContext: () => `(Área: ${(player.impactAreaMultiplier * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${((player.impactAreaMultiplier + 0.1) * 100).toFixed(0)}%</span> | Dano: ${(player.impactDamageMultiplier * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${((player.impactDamageMultiplier + 0.05) * 100).toFixed(0)}%</span>)`
            },
            { 
                name: "Berserk", 
                description: "Aumenta a duração da habilidade Berserk (E) em 15%.", 
                apply: () => { player.berserkDurationMultiplier += 0.15; }, 
                category: 'ofensivo',
                getContext: () => {
                    const currentDuration = 4 * player.berserkDurationMultiplier;
                    const nextDuration = 4 * (player.berserkDurationMultiplier + 0.15);
                    return `(Duração: ${currentDuration.toFixed(1)}s &rarr; <span class='text-green-300'>${nextDuration.toFixed(1)}s</span>)`;
                }
            },
            { 
                name: "Vampiro", 
                description: "Adiciona +1% de chance de recuperar 1% de HP ao causar dano (apenas a chance acumula).", 
                apply: () => { player.vampireChance += 0.01; }, 
                category: 'defensivo',
                getContext: () => `(Chance: ${(player.vampireChance * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${((player.vampireChance + 0.01) * 100).toFixed(0)}%</span>)`
            },
            { 
                name: "Bruxo", 
                description: "Adiciona +1% de chance de recuperar 1% de SP ao causar dano (apenas a chance acumula).", 
                apply: () => { player.wizardChance += 0.01; }, 
                category: 'utilidade',
                getContext: () => `(Chance: ${(player.wizardChance * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${((player.wizardChance + 0.01) * 100).toFixed(0)}%</span>)`
            },
            { 
                name: "Aura Protetora", 
                description: "Enquanto seu SP estiver acima de 80%, você recebe +10% de redução de dano (acumulativo).",
                apply: () => { player.auraProtetoraStacks += 1; }, 
                category: 'defensivo',
                getContext: () => {
                    const nextReduction = Math.min(90, (player.auraProtetoraStacks + 1) * 10);
                    return `(Redução: ${(player.auraProtetoraStacks * 10)}% &rarr; <span class='text-green-300'>${nextReduction}%</span> (SP > 80%))`;
                }
            },
            { 
                name: "Abate (Execute)", 
                description: "Seus ataques causam 50% de dano adicional a inimigos com HP baixo. Aumenta o limite de HP para o abate em +5% (iniciando em 20%).",
                apply: () => { player.abateThreshold += 0.05; }, 
                category: 'ofensivo',
                getContext: () => {
                    const nextThreshold = Math.min(100, (player.abateThreshold + 0.05) * 100);
                    return `(Limite HP: ${(player.abateThreshold * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${nextThreshold.toFixed(0)}%</span>)`;
                }
            },
            { 
                name: "Impacto Atordoante", 
                description: "A habilidade Impacto (W) agora atordoa inimigos. Aumenta a duração do atordoamento em +0.5s.",
                apply: () => { player.impactoAtordoanteDuration += 0.5; },
                category: 'utilidade',
                getContext: () => `(Duração Stun: ${player.impactoAtordoanteDuration.toFixed(1)}s &rarr; <span class='text-green-300'>${(player.impactoAtordoanteDuration + 0.5).toFixed(1)}s</span>)`
            },
            { 
                name: "Crítico Estilhaçante", 
                description: "Seus acertos críticos explodem. Aumenta o dano da explosão em +25% do dano do acerto.",
                apply: () => { player.criticoEstilhacanteMultiplier += 0.25; },
                category: 'critico',
                getContext: () => `(Dano Explosão: ${(player.criticoEstilhacanteMultiplier * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${((player.criticoEstilhacanteMultiplier + 0.25) * 100).toFixed(0)}%</span>)`
            },
            { 
                name: "Aterrissagem Impactante", 
                description: "Seu Dash (Q) cria uma onda de choque ao terminar. Aumenta o dano da onda de choque em +100% do seu Dano Base.",
                apply: () => { player.aterrissagemImpactanteMultiplier += 1.0; },
                category: 'ofensivo',
                getContext: () => `(Dano Onda: ${(player.aterrissagemImpactanteMultiplier * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${((player.aterrissagemImpactanteMultiplier + 1.0) * 100).toFixed(0)}%</span>)`
            },
            { 
                name: "Caçador de Tesouros", 
                description: "Aumenta a chance de Brindes (⭐) aparecerem em 5% (multiplicativo).",
                apply: () => { player.brindeChanceMultiplier *= 1.05; },
                category: 'especial',
                getContext: () => `(Chance Brinde: ${player.brindeChanceMultiplier.toFixed(2)}x &rarr; <span class'text-green-300'>${(player.brindeChanceMultiplier * 1.05).toFixed(2)}x</span>)`
            },
            { 
                name: "Sobrecarga (SP)", 
                description: "Regeneração de SP +1/s. HP Máximo -10.",
                apply: () => { 
                    player.spRegen += 1; 
                    player.maxHp = Math.max(10, player.maxHp - 10); // Garante que HP não zere
                    player.hp = Math.min(player.hp, player.maxHp);
                },
                category: 'utilidade',
                getContext: () => {
                    const nextHP = Math.max(10, player.maxHp - 10);
                    return `(SP Regen: ${player.spRegen}/s &rarr; <span class='text-green-300'>${player.spRegen + 1}/s</span> | HP Max: ${player.maxHp} &rarr; <span class'text-red-300'>${nextHP}</span>)`;
                }
            },
            { 
                name: "Reação Adrenal", 
                description: "Ao ficar abaixo de 25% de HP, ganha um bônus de velocidade (Cooldown 15s). Aumenta o bônus de Veloc. Mov. em +30% e a duração em +3s.",
                apply: () => { 
                    player.reacaoAdrenalMoveSpeedBuff += 0.3; // +30% Vel Mov
                    player.reacaoAdrenalDuration += 3.0; // +3s Duração
                }, 
                category: 'defensivo',
                getContext: () => `(Veloc.: +${(player.reacaoAdrenalMoveSpeedBuff * 100).toFixed(0)}% &rarr; <span class='text-green-300'>+${((player.reacaoAdrenalMoveSpeedBuff + 0.3) * 100).toFixed(0)}%</span> | Duração: ${player.reacaoAdrenalDuration.toFixed(0)}s &rarr; <span class'text-green-300'>${(player.reacaoAdrenalDuration + 3.0).toFixed(0)}s</span>)`
            },
            { 
                name: "Fúria do Tigre", 
                description: "Seus ataques causam dano bônus com base no seu HP perdido. Aumenta o bônus máximo de dano em +50%.",
                apply: () => { player.furiaDoTigreMultiplier += 0.5; }, // +50% no multiplicador
                category: 'ofensivo',
                getContext: () => `(Bônus Max: +${(player.furiaDoTigreMultiplier * 100).toFixed(0)}% &rarr; <span class='text-green-300'>+${((player.furiaDoTigreMultiplier + 0.5) * 100).toFixed(0)}%</span>)`
            },
            { 
                name: "Foco Total", 
                description: "Enquanto seu SP estiver 100%, ganha bônus de Dano e ASPD. Aumenta o bônus em +10% para ambos.",
                apply: () => { player.focoTotalBonus += 0.1; }, // +10% no bônus
                category: 'ofensivo',
                getContext: () => `(Bônus: +${(player.focoTotalBonus * 100).toFixed(0)}% &rarr; <span class='text-green-300'>+${((player.focoTotalBonus + 0.1) * 100).toFixed(0)}%</span> (SP 100%))`
            },
            { 
                name: "Sorte Dobrada", 
                description: "+1% Chance Crítica, +1% Chance de XP em Dobro, +1% Chance de Gema Extra.",
                apply: () => { 
                    player.critChance += 0.01; 
                    player.doubleXpChance += 0.01;
                    player.extraGrapeChance += 0.01;
                }, 
                category: 'especial',
                getContext: () => `(<span class='text-green-300'>+1%</span> Crit, <span class='text-green-300'>+1%</span> XP Dobro, <span class'text-green-300'>+1%</span> Gema Extra)`
            },
            { 
                name: "Tigre Veloz", 
                description: "Aumenta Ataques/s em 5% e Velocidade de Mov. em 5%.",
                apply: () => { 
                    player.attackSpeed *= 1.05; 
                    player.currentAttackSpeed *= 1.05;
                    player.moveSpeed *= 1.05; 
                    player.currentMoveSpeed *= 1.05;
                }, 
                category: 'utilidade',
                getContext: () => `(ASPD: ${player.attackSpeed.toFixed(2)} &rarr; <span class='text-green-300'>${(player.attackSpeed * 1.05).toFixed(2)}</span> | MS: ${player.moveSpeed.toFixed(1)} &rarr; <span class'text-green-300'>${(player.moveSpeed * 1.05).toFixed(1)}</span>)`
            },
            { 
                name: "Ataque Múltiplo", 
                description: "Seu ataque automático acerta +1 alvo próximo (acumulativo).",
                apply: () => { player.extraTargets += 1; },
                category: 'ofensivo',
                getContext: () => `(Alvos: ${1 + player.extraTargets} &rarr; <span class'text-green-300'>${2 + player.extraTargets}</span>)`
            },
        ];
		
		// Mapeamento de nomes de categoria para exibição
        const UPGRADE_CATEGORY_NAMES = {
            'ofensivo': 'OFENSIVO',
            'defensivo': 'DEFENSIVO',
            'utilidade': 'UTILIDADE',
            'critico': 'CRÍTICO',
            'especial': 'ESPECIAL',
            'arma': 'ARMA',
            'default': 'BÔNUS'
        };

        // --- LISTA DE CLASSES ---
        const CLASS_UPGRADES = [
            { 
                name: "Classe: Espadachim", 
                description: "Foco no combate corpo a corpo. Alcance de Ataque -20%, Dano de Ataque +40%.", 
                emoji: '⚔️',
                apply: () => { 
                    player.attackRangeMultiplier *= 0.8; // Reduz o alcance
                    player.baseDamage *= 1.4; // Aumenta o dano
                    player.currentBaseDamage = player.baseDamage; // Atualiza o dano atual
                    player.hasClass = true; // Marca que a classe foi escolhida
					player.className = "Espadachim";
					player.classIcon = "⚔️";
                }, 
                category: 'especial',
                // Função para gerar texto de contexto dinâmico
                //getContext: () => `(Alcance: ${(player.attackRangeMultiplier * 100).toFixed(0)}% &rarr; <span class='text-red-300'>${(player.attackRangeMultiplier * 0.7 * 100).toFixed(0)}%</span> | Dano: ${(player.baseDamage).toFixed(1)} &rarr; <span class='text-green-300'>${(player.baseDamage * 1.3).toFixed(1)}</span>)`
                getContext: () => `(Alcance: ${(player.attackRangeMultiplier * 100).toFixed(0)}% &rarr; <span class='text-red-300'>${(player.attackRangeMultiplier * 0.8 * 100).toFixed(0)}%</span> | Dano: ${(player.baseDamage).toFixed(1)} &rarr; <span class='text-green-300'>${(player.baseDamage * 1.4).toFixed(1)}</span>)`

            },
            { 
                name: "Classe: Arqueiro", 
                description: "Especialista em longa distância. Alcance de Ataque +40%, Dano de Ataque -20%.", 
                emoji: '🏹',
                apply: () => { 
                    player.attackRangeMultiplier *= 1.4; // Aumenta o alcance
                    player.baseDamage *= 0.8; // Reduz o dano
                    player.currentBaseDamage = player.baseDamage;
                    player.hasClass = true;
					player.className = "Arqueiro";
					player.classIcon = "🏹";
                }, 
                category: 'especial',
                //getContext: () => `(Alcance: ${(player.attackRangeMultiplier * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${(player.attackRangeMultiplier * 1.2 * 100).toFixed(0)}%</span> | Dano: ${(player.baseDamage).toFixed(1)} &rarr; <span class='text-red-300'>${(player.baseDamage * 0.8).toFixed(1)}</span>)`
                getContext: () => `(Alcance: ${(player.attackRangeMultiplier * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${(player.attackRangeMultiplier * 1.4 * 100).toFixed(0)}%</span> | Dano: ${(player.baseDamage).toFixed(1)} &rarr; <span class='text-red-300'>${(player.baseDamage * 0.8).toFixed(1)}</span>)`
            },
            { 
                name: "Classe: Mago", 
                description: "Manipulador de projéteis. Alcance -10%, Dano -20%, +1 Projétil de Ataque.", 
                emoji: '🧙',
                apply: () => { 
                    player.attackRangeMultiplier *= 0.9; // Reduz o alcance
                    player.baseDamage *= 0.8; // Reduz o dano
                    player.currentBaseDamage = player.baseDamage;
                    player.extraTargets += 1; // Adiciona projétil extra
                    player.hasClass = true;
					player.className = "Mago";
					player.classIcon = "🧙";
                }, 
                category: 'especial',
                //getContext: () => `(Alcance: ${(player.attackRangeMultiplier * 100).toFixed(0)}% &rarr; <span class='text-red-300'>${(player.attackRangeMultiplier * 0.8 * 100).toFixed(0)}%</span> | Dano: ${(player.baseDamage).toFixed(1)} &rarr; <span class='text-red-300'>${(player.baseDamage * 0.8).toFixed(1)}</span> | Projéteis: ${player.extraTargets} &rarr; <span class='text-green-300'>${player.extraTargets + 1}</span>)`
                getContext: () => `(Alcance: ${(player.attackRangeMultiplier * 100).toFixed(0)}% &rarr; <span class='text-red-300'>${(player.attackRangeMultiplier * 0.9 * 100).toFixed(0)}%</span> | Dano: ${(player.baseDamage).toFixed(1)} &rarr; <span class='text-red-300'>${(player.baseDamage * 0.8).toFixed(1)}</span> | Projéteis: ${player.extraTargets} &rarr; <span class='text-green-300'>${player.extraTargets + 1}</span>)`
            },
            { 
                name: "Classe: Defensor", 
                description: "Especialista em sobrevivência. HP Máx +50%, Dano de Ataque -15%.", 
                emoji: '🛡️',
                apply: () => { 
                    player.maxHp *= 1.5; // +50% HP
                    player.hp = player.maxHp; // Cura total
                    player.baseDamage *= 0.85; // -15% Dano
                    player.currentBaseDamage = player.baseDamage;
                    player.hasClass = true;
					player.className = "Defensor";
					player.classIcon = "🛡️";
                }, 
                category: 'especial',
                getContext: () => `(HP: ${player.maxHp} &rarr; <span class='text-green-300'>${(player.maxHp * 1.5).toFixed(0)}</span> | Dano: ${(player.baseDamage).toFixed(1)} &rarr; <span class='text-red-300'>${(player.baseDamage * 0.85).toFixed(1)}</span>)`
            },
            { 
                name: "Classe: Assassino", 
                description: "Mestre dos pontos fracos. Chance Crítica +25%, Dano Crítico +50%, HP Máx -30%.", 
                emoji: '🗡️',
                apply: () => { 
                    player.critChance += 0.25; // +25%
                    player.critDamageMultiplier += 0.50; // +50%
                    player.maxHp *= 0.7; // -30% HP
                    player.hp = player.maxHp; // Define para o novo máximo
                    player.hasClass = true;
					player.className = "Assassino";
					player.classIcon = "🗡️";
                }, 
                category: 'especial',
                getContext: () => `(Crit.C: ${(player.critChance * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${(player.critChance * 100 + 25).toFixed(0)}%</span> | Crit.D: ${(player.critDamageMultiplier * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${(player.critDamageMultiplier * 100 + 50).toFixed(0)}%</span> | HP: ${player.maxHp} &rarr; <span class='text-red-300'>${(player.maxHp * 0.7).toFixed(0)}</span>)`
            },
			{ 
                name: "Classe: Mercador", 
                description: "Foco em coleta. Alcance de Ataque -20%, Dano -20%, Alcance de Coleta +110%.", 
                emoji: '💰',
                apply: () => { 
                    player.attackRangeMultiplier *= 0.8; // -20% Alcance
                    player.baseDamage *= 0.8; // -20% Dano
                    player.currentBaseDamage = player.baseDamage;
                    player.collectionRangeMultiplier += 1.1; // +110% Coleta
                    player.hasClass = true;
                    player.className = "Mercador";
                    player.classIcon = "💰";
                }, 
                category: 'especial',
                getContext: () => `(Alcance: ${(player.attackRangeMultiplier * 100).toFixed(0)}% &rarr; <span class='text-red-300'>${(player.attackRangeMultiplier * 0.8 * 100).toFixed(0)}%</span> | Dano: ${(player.baseDamage).toFixed(1)} &rarr; <span class='text-red-300'>${(player.baseDamage * 0.8).toFixed(1)}</span> | Coleta: ${(player.collectionRangeMultiplier * 100).toFixed(0)}% &rarr; <span class='text-green-300'>${((player.collectionRangeMultiplier + 1.1) * 100).toFixed(0)}%</span>)`
            }            
        ];
		
		// Define as Armas Passivas e seus níveis onde 'damage' é um multiplicador do Dano Base atual do jogador.
        const PASSIVE_WEAPON_DEFINITIONS = {
            'auraDourada': {
                name: 'Aura Dourada',
                emoji: '🌟',
                category: 'arma',
                maxLevel: 5,
                stats: [ // Níveis (índice 0 = Nível 1)
                    { description: 'Causa 20% do Dano Base a cada 2s em área.', damage: 0.2, cooldown: 2.0, radius: 50 },
                    { description: 'Causa 30% do Dano Base a cada 1.5s. Área +50%.', damage: 0.3, cooldown: 1.5, radius: 75 },
                    { description: 'Causa 40% do Dano Base a cada 1.0s. Área +50%.', damage: 0.4, cooldown: 1.0, radius: 100 },
					{ description: 'Causa 50% do Dano Base a cada 0.9s. Área +25%.', damage: 0.5, cooldown: 0.9, radius: 125 },
					{ description: 'Causa 60% do Dano Base a cada 0.8s. Área +25%.', damage: 0.6, cooldown: 0.8, radius: 150 },
                ]
            },
            'garrasAfiadas': {
                name: 'Garras Afiadas',
                emoji: '🔪',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Lança 1 garra a cada 3s no inimigo mais próximo (50% Dano).', projectiles: 1, cooldown: 3.0, damage: 0.5 },
                    { description: 'Lança 2 garras a cada 3s (60% Dano).', projectiles: 2, cooldown: 3.0, damage: 0.6 },
                    { description: 'Lança 3 garras a cada 2.5s (70% Dano).', projectiles: 3, cooldown: 2.5, damage: 0.7 },
                    { description: 'Lança 3 garras a cada 2s (80% Dano).', projectiles: 3, cooldown: 2, damage: 0.8 },
                    { description: 'Lança 3 garras a cada 1.5s (90% Dano).', projectiles: 3, cooldown: 1.5, damage: 0.9 },
                ]
            },
            'orbeArcano': {
                name: 'Orbe Arcano',
                emoji: '🔮',
                category: 'arma',
                maxLevel: 5,
                stats: [ // Níveis (índice 0 = Nível 1)
                    { description: 'Dispara 1 orbe em um inimigo aleatório (80% Dano).', projectiles: 1, cooldown: 2.5, damage: 0.8 },
                    { description: 'Dispara 2 orbes em inimigos aleatórios (90% Dano).', projectiles: 2, cooldown: 2.5, damage: 0.9 },
                    { description: 'Dispara 3 orbes em inimigos aleatórios (100% Dano).', projectiles: 3, cooldown: 2.0, damage: 1.0 },
                    { description: 'Dispara 3 orbes em inimigos aleatórios (115% Dano).', projectiles: 3, cooldown: 2.0, damage: 1.15 },
                    { description: 'Dispara 3 orbes em inimigos aleatórios (130% Dano).', projectiles: 3, cooldown: 2.0, damage: 1.3 },
                ]
            },
            'cometaCadente': {
                name: 'Cometa Cadente',
                emoji: '☄️',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Dispara 1 cometa perfurante na direção do movimento (100% Dano). Perfura 2.', projectiles: 1, cooldown: 2.0, damage: 1.0, pierce: 2 },
                    { description: 'Dispara 2 cometas (110% Dano). Perfura 3.', projectiles: 2, cooldown: 2.0, damage: 1.1, pierce: 3 },
                    { description: 'Dispara 3 cometas (120% Dano). Perfura 5.', projectiles: 3, cooldown: 1.5, damage: 1.2, pierce: 5 },
                    { description: 'Dispara 4 cometas (130% Dano). Perfura 7.', projectiles: 4, cooldown: 1.5, damage: 1.3, pierce: 7 },
                    { description: 'Dispara 5 cometas (140% Dano). Perfura 9.', projectiles: 5, cooldown: 1.5, damage: 1.4, pierce: 9 },
                ]
            },
            'chaoConsagrado': {
                name: 'Chão Consagrado',
                emoji: '🔥',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Cria 1 área de fogo (25% Dano/tick). Duração 5s.', count: 1, cooldown: 8.0, damage: 0.25, duration: 5, radius: 60, tickRate: 0.5 },
                    { description: 'Cria 2 área de fogo (30% Dano/tick). Duração 6s. Área +20%.', count: 2, cooldown: 7.0, damage: 0.30, duration: 6, radius: 75, tickRate: 0.5 },
                    { description: 'Cria 3 áreas de fogo (35% Dano/tick). Duração 6s. Área +10%.', count: 3, cooldown: 7.0, damage: 0.35, duration: 6, radius: 85, tickRate: 0.4 },
                    { description: 'Cria 4 áreas de fogo (40% Dano/tick). Duração 7s. Área +15%.', count: 4, cooldown: 7.0, damage: 0.4, duration: 7, radius: 100, tickRate: 0.4 },
                    { description: 'Cria 5 áreas de fogo (40% Dano/tick). Duração 7s. Área +10%.', count: 5, cooldown: 7.0, damage: 0.4, duration: 7, radius: 110, tickRate: 0.3 },
                ]
            },
            
            'pulsoCinetico': {
                name: 'Pulso Cinético',
                emoji: '💨',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Empurra inimigos a cada 4s (10% Dano, 0.25s Stun).', damage: 0.1, cooldown: 4.0, radius: 75, stunDuration: 0.25 },
                    { description: 'Empurra inimigos a cada 3s (15% Dano, 0.5s Stun).', damage: 0.15, cooldown: 3.0, radius: 85, stunDuration: 0.5 },
                    { description: 'Empurra inimigos a cada 2s (20% Dano, 0.5s Stun). Área +20%.', damage: 0.2, cooldown: 2.0, radius: 95, stunDuration: 0.5 },
                    { description: 'Empurra inimigos a cada 1.7s (25% Dano, 0.5s Stun). Área +10%.', damage: 0.25, cooldown: 1.7, radius: 105, stunDuration: 0.5 },
                    { description: 'Empurra inimigos a cada 1.6s (25% Dano, 0.6s Stun). Área +10%.', damage: 0.25, cooldown: 1.6, radius: 115, stunDuration: 0.6 },
                ]
            },
            'espinhosTraseiros': {
                name: 'Espinhos Traseiros',
                emoji: '🌵',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Dispara 1 espinho na direção oposta ao movimento (80% Dano).', projectiles: 1, cooldown: 2.5, damage: 0.8 },
                    { description: 'Dispara 2 espinhos na direção oposta (90% Dano).', projectiles: 2, cooldown: 2.5, damage: 0.9 },
                    { description: 'Dispara 3 espinhos na direção oposta (100% Dano).', projectiles: 3, cooldown: 2.0, damage: 1.0 },
                    { description: 'Dispara 4 espinhos na direção oposta (110% Dano).', projectiles: 4, cooldown: 1.8, damage: 1.1 },
                    { description: 'Dispara 5 espinhos na direção oposta (120% Dano).', projectiles: 5, cooldown: 1.7, damage: 1.2 },
                ]
            },
            'varinhaMagica': {
                name: 'Varinha Mágica',
                emoji: '🪄',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Dispara 3 projéteis (20% Dano) em leque no inimigo mais próximo.', projectiles: 3, cooldown: 2.0, damage: 0.2, spread: 0.5 },
                    { description: 'Dispara 4 projéteis (20% Dano) em leque. Área do leque +20%.', projectiles: 4, cooldown: 2.0, damage: 0.2, spread: 0.7 },
                    { description: 'Dispara 6 projéteis (25% Dano) em leque. Cooldown -25%.', projectiles: 6, cooldown: 1.5, damage: 0.25, spread: 0.7 },
                    { description: 'Dispara 7 projéteis (25% Dano) em leque. Cooldown -10%.', projectiles: 7, cooldown: 1.2, damage: 0.50, spread: 0.7 },
                    { description: 'Dispara 8 projéteis (25% Dano) em leque. Cooldown -10%.', projectiles: 8, cooldown: 1.1, damage: 0.75, spread: 0.7 }
                ]
            },
            'coringaSelvagem': {
                name: 'Coringa Selvagem',
                emoji: '🃏',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { 
                        description: 'Atira 1 carta (100% Dano) a cada 3s. Efeito aleatório ao acertar (300% Crit, 50% Dano, ou 1s Stun).', 
                        cooldown: 3.0, damage: 1.0, 
                        critMult: 3.0, weakMult: 0.5, stunDuration: 1.0 
                    },
                    { 
                        description: 'Atira 1 carta (120% Dano) a cada 2.5s. Efeitos (350% Crit, 50% Dano, ou 1.5s Stun).', 
                        cooldown: 2.5, damage: 1.2, 
                        critMult: 3.5, weakMult: 0.5, stunDuration: 1.5 
                    },
                    { 
                        description: 'Atira 1 carta (140% Dano) a cada 2.0s. Efeitos (400% Crit, 50% Dano, ou 2s Stun).', 
                        cooldown: 2.0, damage: 1.4, 
                        critMult: 4.0, weakMult: 0.5, stunDuration: 2.0 
                    },
                    { 
                        description: 'Atira 1 carta (140% Dano) a cada 1.5s. Efeitos (450% Crit, 50% Dano, ou 2s Stun).', 
                        cooldown: 1.5, damage: 1.4, 
                        critMult: 4.5, weakMult: 0.5, stunDuration: 2.0 
                    },
                    { 
                        description: 'Atira 1 carta (140% Dano) a cada 1.3s. Efeitos (500% Crit, 50% Dano, ou 2s Stun).', 
                        cooldown: 1.4, damage: 1.4, 
                        critMult: 5.0, weakMult: 0.5, stunDuration: 2.0 
                    },
                ]
            },
            'presaRetornavel': {
                name: 'Presa Retornável',
                emoji: '🪃',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { 
                        description: 'Lança 1 presa (70% Dano) que retorna. Perfura 3 inimigos.', 
                        projectiles: 1, cooldown: 3.0, damage: 0.7, pierce: 3, distance: 150, speed: 5 
                    },
                    { 
                        description: 'Lança 1 presa (80% Dano). Perfura 5. Distância +20%.', 
                        projectiles: 1, cooldown: 2.5, damage: 0.8, pierce: 5, distance: 180, speed: 5 
                    },
                    { 
                        description: 'Lança 2 presas (80% Dano). Perfura 7. Distância +10%.', 
                        projectiles: 2, cooldown: 2.5, damage: 0.8, pierce: 7, distance: 190, speed: 5.5 
                    },
                    { 
                        description: 'Lança 2 presas (90% Dano). Perfura 7. Velocidade +10%.', 
                        projectiles: 2, cooldown: 2.5, damage: 0.9, pierce: 7, distance: 190, speed: 6 
                    },
                    { 
                        description: 'Lança 3 presas (90% Dano). Perfura 7. Distância +10%.', 
                        projectiles: 3, cooldown: 2.5, damage: 0.9, pierce: 7, distance: 200, speed: 6 
                    },
                ]
            },
            'bardoAmaldicoado': {
                name: 'Bardo Amaldiçoado',
                emoji: '🪕',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Toca uma melodia a cada 3s. Inimigos próximos recebem 5% a mais de dano por 3s.', cooldown: 3.0, radius: 100, debuffDuration: 3.0, debuffMultiplier: 1.05 },
                    { description: 'Cooldown 2.5s. Dano aumentado para 10%. Duração 4s.', cooldown: 2.5, radius: 100, debuffDuration: 4.0, debuffMultiplier: 1.10 },
                    { description: 'Cooldown 2.0s. Dano aumentado para 15%. Área +25%.', cooldown: 2.0, radius: 125, debuffDuration: 4.0, debuffMultiplier: 1.15 },
                    { description: 'Cooldown 1.8s. Dano aumentado para 20%. Área +10%.', cooldown: 1.8, radius: 140, debuffDuration: 4.0, debuffMultiplier: 1.2 },
                    { description: 'Cooldown 1.5s. Dano aumentado para 25%. Área +10%.', cooldown: 1.5, radius: 150, debuffDuration: 4.0, debuffMultiplier: 1.25 },
                ]
            },
            'laminasGemeas': {
                name: 'Lâminas Gêmeas',
                emoji: '✂️',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Ataca o inimigo mais próximo 3x a cada 3s (40% Dano cada). Alcance 75.', cooldown: 3.0, damage: 0.4, hits: 3, radius: 75 },
                    { description: 'Ataca 4x a cada 2.5s (50% Dano cada). Alcance 75.', cooldown: 2.5, damage: 0.5, hits: 4, radius: 75 },
                    { description: 'Ataca 5x a cada 2.2s (50% Dano cada). Alcance 85.', cooldown: 2.2, damage: 0.5, hits: 5, radius: 85 },
                    { description: 'Ataca 6x a cada 2.0s (50% Dano cada). Alcance 90.', cooldown: 2, damage: 0.5, hits: 6, radius: 90 },
                    { description: 'Ataca 7x a cada 1.75s (50% Dano cada). Alcance 95.', cooldown: 1.75, damage: 0.5, hits: 7, radius: 95 },
                ]
            },
            'pocaoInstavel': {
                name: 'Poção Instável',
                emoji: '🧪',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Cria 1 poça a cada 6s (20% Dano/tick). Efeito aleatório (Fogo, Gelo ❄️ ou Ácido ☠️).', 
                      count: 1, cooldown: 6.0, damage: 0.2, duration: 4, radius: 50, tickRate: 0.5, bonus: 0.1 }, // Ácido = +10% Dano
                    { description: 'Cria 2 poça a cada 5s (25% Dano/tick). Efeitos 20% mais fortes.', 
                      count: 2, cooldown: 5.0, damage: 0.25, duration: 5, radius: 55, tickRate: 0.5, bonus: 0.15 }, // Ácido = +15% Dano
                    { description: 'Cria 3 poças a cada 5s (25% Dano/tick). Efeitos 40% mais fortes.', 
                      count: 3, cooldown: 5.0, damage: 0.25, duration: 5, radius: 60, tickRate: 0.4, bonus: 0.2 }, // Ácido = +20% Dano
                    { description: 'Cria 4 poças a cada 4s (25% Dano/tick). Efeitos 10% mais fortes.', 
                      count: 4, cooldown: 4.0, damage: 0.3, duration: 4, radius: 70, tickRate: 0.35, bonus: 0.25 }, // Ácido = +20% Dano
                    { description: 'Cria 4 poças a cada 3s (25% Dano/tick). Efeitos 10% mais fortes.', 
                      count: 4, cooldown: 3.0, damage: 0.35, duration: 3, radius: 75, tickRate: 0.3, bonus: 0.3 }, // Ácido = +20% Dano
                ]
            },
            'dadosViciados': {
                name: 'Dados Viciados',
                emoji: '🎲',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Lança 1 dado a cada 5s (100% Dano). Efeito aleatório (1-6) ao acertar.', 
                      projectiles: 1, cooldown: 5.0, damage: 1.0, speed: 4.5, level: 1 },
                    { description: 'Lança 2 dado a cada 4s (120% Dano). Efeitos Nv. 2.', 
                      projectiles: 2, cooldown: 4.0, damage: 1.2, speed: 4.5, level: 2 },
                    { description: 'Lança 3 dados a cada 4s (120% Dano). Efeitos Nv. 3.', 
                      projectiles: 3, cooldown: 4.0, damage: 1.2, speed: 4.5, level: 3 },
                    { description: 'Lança 4 dados a cada 3s (125% Dano). Efeitos Nv. 3.', 
                      projectiles: 4, cooldown: 3.0, damage: 1.25, speed: 4.5, level: 3 },
                    { description: 'Lança 5 dados a cada 3s (125% Dano). Efeitos Nv. 3.', 
                      projectiles: 5, cooldown: 3.0, damage: 1.25, speed: 4.5, level: 3 },
                ]
            },
            'machadoGiratorio': {
                name: 'Machado Giratório',
                emoji: '🪓',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Lança 1 machado perfurante a cada 4s (120% Dano). Perfura 3.', 
                      projectiles: 1, cooldown: 4.0, damage: 1.2, pierce: 3, speed: 4, size: 20 },
                    { description: 'Lança 2 machado a cada 3s (140% Dano). Perfura 5. Tamanho +20%.', 
                      projectiles: 2, cooldown: 3.0, damage: 1.4, pierce: 5, speed: 4, size: 24 },
                    { description: 'Lança 3 machados a cada 3s (140% Dano). Perfura 5. Tamanho +20%.', 
                      projectiles: 3, cooldown: 3.0, damage: 1.4, pierce: 5, speed: 4.5, size: 25 },
                    { description: 'Lança 3 machados a cada 2.8s (150% Dano). Perfura 5. Tamanho +10%.', 
                      projectiles: 3, cooldown: 2.8, damage: 1.5, pierce: 5, speed: 4.5, size: 30 },
                    { description: 'Lança 3 machados a cada 2.6s (160% Dano). Perfura 5. Tamanho +10%.', 
                      projectiles: 3, cooldown: 2.6, damage: 1.6, pierce: 5, speed: 4.5, size: 35 },
                ]
            },
            'ritualSangrento': {
                name: 'Ritual Sangrento',
                emoji: '🩸',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Pulsa a cada 3s (50% Dano). Cura o jogador em 25% do dano causado.', 
                      damage: 0.5, cooldown: 3.0, radius: 75, healPercent: 0.25 },
                    { description: 'Pulsa a cada 2.5s (60% Dano). Cura 30% do dano. Área +25%.', 
                      damage: 0.6, cooldown: 2.5, radius: 100, healPercent: 0.30 },
                    { description: 'Pulsa a cada 2.0s (70% Dano). Cura 35% do dano. Área +25%.', 
                      damage: 0.7, cooldown: 2.0, radius: 125, healPercent: 0.35 },
                    { description: 'Pulsa a cada 1.8s (75% Dano). Cura 35% do dano. Área +5%.', 
                      damage: 0.75, cooldown: 1.8, radius: 130, healPercent: 0.35 },
                    { description: 'Pulsa a cada 1.6s (80% Dano). Cura 35% do dano. Área +5%.', 
                      damage: 0.8, cooldown: 1.6, radius: 135, healPercent: 0.35 },
                ]
            },
			// --- INÍCIO NOVAS ARMAS ---
            'pavioCurto': {
                name: 'Pavio Curto',
                emoji: '🧨',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Lança 1 bomba lenta a cada 5s (150% Dano). Explode ao contato ou após 3s.', projectiles: 1, cooldown: 5.0, damage: 1.5, radius: 60, fuse: 3.0 },
                    { description: 'Lança 1 bomba (180% Dano). Área +25%. Tempo de pavio -0.5s.', projectiles: 1, cooldown: 4.5, damage: 1.8, radius: 75, fuse: 2.5 },
                    { description: 'Lança 2 bombas (180% Dano). Tempo de pavio -0.5s.', projectiles: 2, cooldown: 4.5, damage: 1.8, radius: 75, fuse: 2.0 },
                    { description: 'Lança 2 bombas (200% Dano). Área +25%. Tempo de pavio -0.5s.', projectiles: 2, cooldown: 4.0, damage: 2.0, radius: 90, fuse: 1.5 },
                    { description: 'Lança 3 bombas (200% Dano). Tempo de pavio -0.5s.', projectiles: 3, cooldown: 4.0, damage: 2.0, radius: 90, fuse: 1.0 },
                ]
            },
            'adagaCerteira': {
                name: 'Adaga Certeira',
                emoji: '🗡️',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Atira 1 adaga no inimigo mais próximo (60% Dano). Chance Crítica da Adaga: +20%.', projectiles: 1, cooldown: 1.5, damage: 0.6, bonusCritChance: 0.20, bonusCritDamage: 0 },
                    { description: 'Atira 1 adaga (70% Dano). Chance Crítica: +25%. Dano Crítico da Adaga: +50%.', projectiles: 1, cooldown: 1.3, damage: 0.7, bonusCritChance: 0.25, bonusCritDamage: 0.50 },
                    { description: 'Atira 2 adagas (70% Dano). Chance Crítica: +30%.', projectiles: 2, cooldown: 1.3, damage: 0.7, bonusCritChance: 0.30, bonusCritDamage: 0.50 },
                    { description: 'Atira 2 adagas (80% Dano). Chance Crítica: +35%. Dano Crítico da Adaga: +75%.', projectiles: 2, cooldown: 1.1, damage: 0.8, bonusCritChance: 0.35, bonusCritDamage: 0.75 },
                    { description: 'Atira 3 adagas (80% Dano). Chance Crítica: +40%.', projectiles: 3, cooldown: 1.1, damage: 0.8, bonusCritChance: 0.40, bonusCritDamage: 0.75 },
                ]
            },
            'esporosExplosivos': {
                name: 'Esporos Explosivos',
                emoji: '🍄',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Solta 1 esporo a cada 6s. Explode (50% Dano) se inimigos se aproximam. Duração 8s.', count: 1, cooldown: 6.0, damage: 0.5, radius: 40, duration: 8.0, triggerRadius: 30 },
                    { description: 'Solta 2 esporos (60% Dano). Área +25%. Duração 10s.', count: 2, cooldown: 5.5, damage: 0.6, radius: 50, duration: 10.0, triggerRadius: 35 },
                    { description: 'Solta 3 esporos (60% Dano). Explosão aplica Lentidão por 1s.', count: 3, cooldown: 5.0, damage: 0.6, radius: 50, duration: 10.0, triggerRadius: 35, slowDuration: 1.0 },
                    { description: 'Solta 3 esporos (70% Dano). Área +25%. Duração 12s.', count: 3, cooldown: 4.5, damage: 0.7, radius: 60, duration: 12.0, triggerRadius: 40, slowDuration: 1.5 },
                    { description: 'Solta 4 esporos (70% Dano). Duração 12s.', count: 4, cooldown: 4.0, damage: 0.7, radius: 60, duration: 12.0, triggerRadius: 40, slowDuration: 1.5 },
                ]
            },
            'cloneInstavel': {
                name: 'Clone Instável',
                emoji: '🧬',
                category: 'arma',
                maxLevel: 5,
                stats: [
                    { description: 'Invoca 1 clone a cada 15s. Ataca por 5s (30% Dano, 50% ASPD).', count: 1, cooldown: 15.0, duration: 5.0, damageScale: 0.3, attackSpeedScale: 0.5 },
                    { description: 'Invoca 1 clone. Duração +2s. Dano do clone +10%.', count: 1, cooldown: 14.0, duration: 7.0, damageScale: 0.4, attackSpeedScale: 0.5 },
                    { description: 'Invoca 1 clone. ASPD do clone +25%.', count: 1, cooldown: 13.0, duration: 7.0, damageScale: 0.4, attackSpeedScale: 0.75 },
                    { description: 'Invoca 2 clones. Duração +1s.', count: 2, cooldown: 13.0, duration: 8.0, damageScale: 0.4, attackSpeedScale: 0.75 },
                    { description: 'Invoca 2 clones. Duração +2s. Dano do clone +10%.', count: 2, cooldown: 12.0, duration: 10.0, damageScale: 0.5, attackSpeedScale: 0.75 },
                ]
            }
        };
		
		// Constantes de Jogo
        const REROLL_COST = 5;
        const ABILITY_CONSTS = {
            DASH: { COST: 20, COOLDOWN: 10 },
            IMPACT: { COST: 30, COOLDOWN: 10 },
            BERSERK: { COST: 40, COOLDOWN: 15 }
        };
		
		// Constantes para a curva de XP
        const XP_RATE_BASE = 10;
        const XP_RATE_GROWTH = 1.15;
		
		// Chave para salvar no localStorage
        const META_SAVE_KEY = 'save_Bichos&Ossos';
		
		// Chave para salvar o audio
		const AUDIO_SETTINGS_KEY = 'save_Bichos&Ossos_audio';
		
		// Chave para salvar os controles
		const CONTROL_SETTINGS_KEY = 'save_Bichos&Ossos_control';
		
		// Constantes de Alcance
        const BASE_ATTACK_RANGE = 100; // Raio de ataque/visão base do jogador
        const COLLECTION_RANGE = 35; // Raio de atração de Gemas/Brindes
		
		// Baseia o tamanho da célula no raio de ataque
        //const GRID_CELL_SIZE = BASE_ATTACK_RANGE;  // ~100
		const GRID_CELL_SIZE = 90; // Reduzi um pouco para diminuir a quantidade de atrito/lag
		
		// Configuração de Hordas
        const HORDE_INTERVAL = 60; // A cada 60 segundos
		
		// Temporizador para o flash de dano
		const DAMAGE_FLASH_DURATION = 0.1; 
		
		// Variaveis do background
		const STAR_WORLD_SIZE = 3000; // Tamanho do "universo" das estrelas
		
		// Object pools
		const ATTACK_LINE_POOL_SIZE = 50;
		const DASH_TRAIL_POOL_SIZE = 100;
		const ACHIEVEMENT_POOL_SIZE = 20;
		const TOAST_POOL_SIZE = 20;
		const INITIAL_PROJECTILE_POOL_SIZE = 3000;
		const INITIAL_ENEMY_POOL_SIZE = 3000;
		const INITIAL_COLLECTIBLE_POOL_SIZE = 3000;
		const INITIAL_PARTICLE_POOL_SIZE = 3000;