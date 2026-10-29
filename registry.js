/**
 * @file registry.js
 * @description Sistema de Registro Unificado (GameRegistry) do Bichos & Ossos.
 * Permite registrar e estender Armas Passivas, Skins, Classes, Inimigos,
 * Aprimoramentos e Conquistas de forma modular e desacoplada.
 */

(function (global) {
    'use strict';

    // Armazena handlers customizados de disparo de armas
    const _weaponHandlers = new Map();

    // Armazena hooks customizados de skins
    const _skinHooks = new Map();

    /**
     * API do GameRegistry
     */
    const GameRegistry = {
        /**
         * Registra uma nova arma passiva no jogo.
         * 
         * @param {string} id - Identificador único da arma (ex: 'bumerangueFogo')
         * @param {Object} definition - Metadados da arma
         * @param {string} definition.name - Nome visível da arma
         * @param {string} definition.emoji - Emoji representativo
         * @param {number} definition.maxLevel - Nível máximo (geralmente 5)
         * @param {Array<Object>} definition.stats - Lista de stats para cada nível (índice 0 = Nível 1)
         * @param {Function} [onFireHandler] - Função chamada ao disparar a arma: (weapon, stats, dt) => void
         * @example
         * GameRegistry.registerWeapon('raioSombrio', {
         *     name: 'Raio Sombrio',
         *     emoji: '⚡',
         *     maxLevel: 5,
         *     stats: [
         *         { description: 'Dispara um choque de 80% dano.', damage: 0.8, cooldown: 2.0 },
         *         // ... até o nível 5
         *     ]
         * }, (weapon, stats) => {
         *     // lógica de disparo aqui
         * });
         */
        registerWeapon(id, definition, onFireHandler = null) {
            if (!id || typeof id !== 'string') {
                console.error('[GameRegistry] ID da arma inválido:', id);
                return;
            }

            if (!definition || !Array.isArray(definition.stats)) {
                console.error(`[GameRegistry] Definição da arma '${id}' deve conter array de 'stats'.`);
                return;
            }

            // Garante campos padrões
            definition.category = definition.category || 'arma';
            definition.maxLevel = definition.maxLevel || definition.stats.length;

            // Registra na tabela global de armas
            if (typeof PASSIVE_WEAPON_DEFINITIONS !== 'undefined') {
                PASSIVE_WEAPON_DEFINITIONS[id] = definition;
            }

            // Registra o handler de disparo
            const handler = onFireHandler || definition.onFire;
            if (typeof handler === 'function') {
                _weaponHandlers.set(id, handler);
            }

            console.log(`[GameRegistry] Arma registrada com sucesso: ${definition.emoji || '⚔️'} ${definition.name} (${id})`);
        },

        /**
         * Retorna o handler de disparo registrado para uma arma.
         * @param {string} weaponId 
         * @returns {Function|null}
         */
        getWeaponHandler(weaponId) {
            return _weaponHandlers.get(weaponId) || null;
        },

        /**
         * Associa um handler de disparo a uma arma existente.
         * @param {string} weaponId 
         * @param {Function} handler 
         */
        bindWeaponHandler(weaponId, handler) {
            if (typeof handler === 'function') {
                _weaponHandlers.set(weaponId, handler);
            }
        },

        /**
         * Registra uma nova skin jogável.
         * 
         * @param {Object} skin - Dados da skin
         * @param {string} skin.id - Emoji ou identificador único (ex: '🦊')
         * @param {string} skin.name - Nome da skin (ex: 'Raposa')
         * @param {string} skin.description - Descrição dos atributos e poderes passivos
         * @param {boolean} [skin.isPremium=false] - Se é uma skin premium (custa mais gemas)
         * @param {Function} [skin.onApply] - Hook chamado ao iniciar uma partida: (player) => void
         */
        registerSkin(skin) {
            if (!skin || !skin.id || !skin.name) {
                console.error('[GameRegistry] Dados de skin inválidos.');
                return;
            }

            if (typeof SKIN_LIST !== 'undefined') {
                const exists = SKIN_LIST.some(s => s.id === skin.id);
                if (!exists) {
                    SKIN_LIST.push({
                        id: skin.id,
                        name: skin.name,
                        description: skin.description || ''
                    });

                    if (skin.isPremium && typeof PREMIUM_SKINS !== 'undefined') {
                        PREMIUM_SKINS.push(skin.id);
                    }

                    if (typeof skin.onApply === 'function') {
                        _skinHooks.set(skin.id, skin.onApply);
                    }

                    console.log(`[GameRegistry] Skin registrada: ${skin.id} ${skin.name}`);
                }
            }
        },

        /**
         * Retorna o hook de aplicação de atributos de uma skin.
         * @param {string} skinId 
         * @returns {Function|null}
         */
        getSkinHook(skinId) {
            return _skinHooks.get(skinId) || null;
        },

        /**
         * Registra um novo aprimoramento na lista geral de Level Up.
         * 
         * @param {Object} upgrade
         * @param {string} upgrade.name - Nome do aprimoramento
         * @param {string} upgrade.description - Descrição do efeito
         * @param {Function} upgrade.apply - Função executada ao escolher o upgrade
         * @param {string} [upgrade.category='ofensivo'] - 'ofensivo'|'defensivo'|'utilidade'|'critico'|'especial'
         * @param {Function} [upgrade.getContext] - Função opcional retornando texto de contexto dinâmico
         */
        registerUpgrade(upgrade) {
            if (!upgrade || !upgrade.name || typeof upgrade.apply !== 'function') {
                console.error('[GameRegistry] Upgrade inválido.');
                return;
            }

            if (typeof UPGRADES !== 'undefined') {
                UPGRADES.push(upgrade);
                console.log(`[GameRegistry] Upgrade registrado: ${upgrade.name}`);
            }
        },

        /**
         * Registra uma nova especialização de classe (oferecida no Nível 5).
         * 
         * @param {Object} classDef
         * @param {string} classDef.name - Nome da classe (ex: 'Classe: Druida')
         * @param {string} classDef.description - Descrição das vantagens/desvantagens
         * @param {string} classDef.emoji - Ícone da classe (ex: '🌿')
         * @param {Function} classDef.apply - Aplicação de stats ao jogador
         * @param {Function} [classDef.getContext] - Função para texto dinâmico de contexto
         */
        registerClass(classDef) {
            if (!classDef || !classDef.name || typeof classDef.apply !== 'function') {
                console.error('[GameRegistry] Classe inválida.');
                return;
            }

            classDef.category = classDef.category || 'especial';

            if (typeof CLASS_UPGRADES !== 'undefined') {
                CLASS_UPGRADES.push(classDef);
                console.log(`[GameRegistry] Classe registrada: ${classDef.name}`);
            }
        },

        /**
         * Registra um novo inimigo para o Códice.
         * 
         * @param {string} typeId - Chave do tipo (ex: 'MORCEGO')
         * @param {Object} def
         * @param {string} def.name - Nome do inimigo
         * @param {string} def.emoji - Emoji representativo
         * @param {string} def.desc - Descrição para o códice
         */
        registerEnemy(typeId, def) {
            if (!typeId || !def) return;
            if (typeof ENEMY_DEFINITIONS !== 'undefined') {
                ENEMY_DEFINITIONS[typeId] = def;
                console.log(`[GameRegistry] Inimigo registrado no Códice: ${def.emoji} ${def.name}`);
            }
        },

        /**
         * Registra uma nova conquista mestra.
         * 
         * @param {Object} achievement
         * @param {string} achievement.id - ID único (ex: 'VELOCISTA_SUPREMO')
         * @param {string} achievement.name - Nome com emoji (ex: '⚡ Velocista Supremo')
         * @param {string} achievement.desc - Como desbloquear
         */
        registerAchievement(achievement) {
            if (!achievement || !achievement.id) return;
            if (typeof MASTER_ACHIEVEMENT_LIST !== 'undefined') {
                MASTER_ACHIEVEMENT_LIST.push(achievement);
                console.log(`[GameRegistry] Conquista registrada: ${achievement.name}`);
            }
        }
    };

    // Exporta para o escopo global
    global.GameRegistry = GameRegistry;

})(typeof window !== 'undefined' ? window : this);
