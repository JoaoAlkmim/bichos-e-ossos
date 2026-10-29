/**
 * @file input.js
 * @description Gerenciador Unificado de Entrada: Controles Touch (Joystick Virtual sem overlay bloqueante),
 * Gamepad (HTML5 Gamepad API) e Sistema de Exportação/Importação de Save.
 */

(function (global) {
    'use strict';

    // Estado do Joystick Virtual Touch
    const touchState = {
        active: false,
        touchId: null,
        startX: 0,
        startY: 0,
        dx: 0,
        dy: 0,
        maxRadius: 50
    };

    // Estado do Gamepad
    const gamepadState = {
        connected: false,
        dx: 0,
        dy: 0,
        lastButtons: {}
    };

    let joystickBaseEl = null;
    let joystickKnobEl = null;

    const InputManager = {
        /**
         * Inicializa os controles touch, gamepad e hooks de UI.
         */
        init() {
            this._setupTouchJoystick();
            this._setupTouchAbilityButtons();
            this._setupGamepad();
            this._setupSaveManagement();
            this._setupPWA();
            console.log('[InputManager] Controles Touch, Gamepad e Save inicializados com sucesso.');
        },

        /**
         * Retorna a direção de movimento de entrada ativa (Touch ou Gamepad).
         * @returns {{ dx: number, dy: number, isOverriding: boolean }}
         */
        getMovementVector() {
            // 1. Prioridade: Joystick Touch se ativo
            if (touchState.active && (touchState.dx !== 0 || touchState.dy !== 0)) {
                return { dx: touchState.dx, dy: touchState.dy, isOverriding: true };
            }

            // 2. Gamepad se ativo
            if (gamepadState.connected && (gamepadState.dx !== 0 || gamepadState.dy !== 0)) {
                return { dx: gamepadState.dx, dy: gamepadState.dy, isOverriding: true };
            }

            return { dx: 0, dy: 0, isOverriding: false };
        },

        /**
         * Polling de Gamepad chamado dentro do gameLoop.
         */
        pollGamepad() {
            if (!navigator.getGamepads) return;
            const gamepads = navigator.getGamepads();
            const gp = gamepads ? gamepads[0] : null;

            if (!gp || !gp.connected) {
                gamepadState.connected = false;
                gamepadState.dx = 0;
                gamepadState.dy = 0;
                return;
            }

            gamepadState.connected = true;

            // Analógico Esquerdo (Axis 0 e 1)
            const deadzone = 0.22;
            let rawX = gp.axes[0] || 0;
            let rawY = gp.axes[1] || 0;

            if (Math.abs(rawX) < deadzone) rawX = 0;
            if (Math.abs(rawY) < deadzone) rawY = 0;

            // D-Pad digital (Botões 12, 13, 14, 15)
            if (gp.buttons[14]?.pressed) rawX = -1; // Esquerda
            if (gp.buttons[15]?.pressed) rawX = 1;  // Direita
            if (gp.buttons[12]?.pressed) rawY = -1; // Cima
            if (gp.buttons[13]?.pressed) rawY = 1;  // Baixo

            const mag = Math.sqrt(rawX * rawX + rawY * rawY);
            if (mag > 0) {
                gamepadState.dx = rawX / Math.max(1, mag);
                gamepadState.dy = rawY / Math.max(1, mag);
            } else {
                gamepadState.dx = 0;
                gamepadState.dy = 0;
            }

            // Ações de Botões com Edge Detection (Apenas se estiver em jogo)
            if (typeof gameState !== 'undefined' && gameState === 'PLAYING' && typeof player !== 'undefined' && player) {
                // Botão A / X (Xbox/Playstation) -> Dash
                if (gp.buttons[0]?.pressed && !gamepadState.lastButtons[0]) {
                    player.useDash();
                }
                // Botão B / Círculo -> Impacto
                if (gp.buttons[1]?.pressed && !gamepadState.lastButtons[1]) {
                    player.useImpact();
                }
                // Botão X / Quadrado -> Berserk
                if (gp.buttons[2]?.pressed && !gamepadState.lastButtons[2]) {
                    player.useBerserk();
                }
                // Botão Y / Triângulo -> Usar Brinde (⭐)
                if (gp.buttons[3]?.pressed && !gamepadState.lastButtons[3]) {
                    player.consumePowerupStack();
                }
            }

            // Botão Start / Menu (Botão 9) -> Pausar
            if (gp.buttons[9]?.pressed && !gamepadState.lastButtons[9]) {
                if (typeof togglePause === 'function') {
                    togglePause();
                }
            }

            // Atualiza histórico de botões
            for (let i = 0; i < gp.buttons.length; i++) {
                gamepadState.lastButtons[i] = gp.buttons[i]?.pressed;
            }
        },

        // --- Configuração Touch Joystick (Direct Canvas binding, ZERO overlay) ---
        _setupTouchJoystick() {
            joystickBaseEl = document.getElementById('touch-joystick-base');
            joystickKnobEl = document.getElementById('touch-joystick-knob');
            const canvasEl = document.getElementById('game-canvas');

            if (!canvasEl || !joystickBaseEl || !joystickKnobEl) return;

            const onTouchStart = (e) => {
                if (touchState.active || !e.changedTouches || e.changedTouches.length === 0) return;
                if (typeof gameState !== 'undefined' && gameState !== 'PLAYING') return;

                const touch = e.changedTouches[0];
                const rect = canvasEl.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const touchY = touch.clientY - rect.top;

                // Em modo WASD ou toque na metade esquerda da tela -> ativa joystick analógico
                if ((typeof controlScheme !== 'undefined' && controlScheme === 'wasd') || touchX < rect.width * 0.5) {
                    touchState.active = true;
                    touchState.touchId = touch.identifier;
                    touchState.startX = touchX;
                    touchState.startY = touchY;
                    touchState.dx = 0;
                    touchState.dy = 0;

                    joystickBaseEl.style.left = `${touchX}px`;
                    joystickBaseEl.style.top = `${touchY}px`;
                    joystickKnobEl.style.transform = `translate(-50%, -50%)`;
                    joystickBaseEl.classList.remove('hidden');
                } else if (typeof controlScheme !== 'undefined' && controlScheme === 'mouse') {
                    // No modo mouse em dispositivos de toque, tocar na tela move o jogador
                    if (typeof movementTarget !== 'undefined') {
                        movementTarget.x = touchX;
                        movementTarget.y = touchY;
                        movementTarget.time = typeof gameTime !== 'undefined' ? gameTime : 0;
                    }
                }
            };

            const onTouchMove = (e) => {
                if (!touchState.active || !e.changedTouches) return;

                for (let i = 0; i < e.changedTouches.length; i++) {
                    const touch = e.changedTouches[i];
                    if (touch.identifier === touchState.touchId) {
                        const rect = canvasEl.getBoundingClientRect();
                        const currentX = touch.clientX - rect.left;
                        const currentY = touch.clientY - rect.top;

                        const deltaX = currentX - touchState.startX;
                        const deltaY = currentY - touchState.startY;
                        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                        if (distance > 0) {
                            touchState.dx = deltaX / distance;
                            touchState.dy = deltaY / distance;

                            const clampedDistance = Math.min(distance, touchState.maxRadius);
                            const knobX = (deltaX / distance) * clampedDistance;
                            const knobY = (deltaY / distance) * clampedDistance;
                            joystickKnobEl.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
                        } else {
                            touchState.dx = 0;
                            touchState.dy = 0;
                            joystickKnobEl.style.transform = `translate(-50%, -50%)`;
                        }
                        break;
                    }
                }
            };

            const onTouchEnd = (e) => {
                if (!touchState.active || !e.changedTouches) return;

                for (let i = 0; i < e.changedTouches.length; i++) {
                    if (e.changedTouches[i].identifier === touchState.touchId) {
                        touchState.active = false;
                        touchState.touchId = null;
                        touchState.dx = 0;
                        touchState.dy = 0;
                        joystickBaseEl.classList.add('hidden');
                        joystickKnobEl.style.transform = `translate(-50%, -50%)`;
                        break;
                    }
                }
            };

            canvasEl.addEventListener('touchstart', onTouchStart, { passive: true });
            canvasEl.addEventListener('touchmove', onTouchMove, { passive: true });
            canvasEl.addEventListener('touchend', onTouchEnd, { passive: true });
            canvasEl.addEventListener('touchcancel', onTouchEnd, { passive: true });
        },

        // --- Configuração dos Botões de Habilidade para Touch Rápido ---
        _setupTouchAbilityButtons() {
            const buttons = [
                { id: 'dash-btn', action: () => player?.useDash() },
                { id: 'impact-btn', action: () => player?.useImpact() },
                { id: 'berserk-btn', action: () => player?.useBerserk() },
                { id: 'powerup-hud', action: () => player?.consumePowerupStack() }
            ];

            buttons.forEach(({ id, action }) => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('touchstart', (e) => {
                        e.stopPropagation();
                        if (typeof gameState !== 'undefined' && gameState === 'PLAYING') {
                            action();
                        }
                    }, { passive: true });
                }
            });
        },

        // --- Configuração Gamepad API ---
        _setupGamepad() {
            window.addEventListener('gamepadconnected', (e) => {
                console.log(`[InputManager] Controle conectado: ${e.gamepad.id}`);
                gamepadState.connected = true;
                if (typeof showFloatingText === 'function' && typeof player !== 'undefined' && player) {
                    showFloatingText(player.x, player.y - 40, '🎮 CONTROLE CONECTADO!', 'crit');
                }
            });

            window.addEventListener('gamepaddisconnected', (e) => {
                console.log(`[InputManager] Controle desconectado: ${e.gamepad.id}`);
                gamepadState.connected = false;
                gamepadState.dx = 0;
                gamepadState.dy = 0;
            });
        },

        // --- Configuração de Exportação e Importação de Save ---
        _setupSaveManagement() {
            const exportBtn = document.getElementById('export-save-btn');
            const importBtn = document.getElementById('import-save-btn');
            const fileInput = document.getElementById('import-save-input');

            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.exportSave();
                });
            }

            if (importBtn && fileInput) {
                importBtn.addEventListener('click', () => {
                    fileInput.click();
                });

                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        this.importSave(file);
                        fileInput.value = ''; // Reseta input
                    }
                });
            }
        },

        /**
         * Exporta o progresso atual em arquivo JSON para download.
         */
        exportSave() {
            try {
                const saveData = {
                    version: '1.2',
                    timestamp: new Date().toISOString(),
                    metaUpgrades: typeof metaUpgrades !== 'undefined' ? metaUpgrades : {},
                    audioSettings: localStorage.getItem(AUDIO_SETTINGS_KEY || 'save_Bichos&Ossos_audio'),
                    controlSettings: localStorage.getItem(CONTROL_SETTINGS_KEY || 'save_Bichos&Ossos_control')
                };

                const jsonStr = JSON.stringify(saveData, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `bichos_e_ossos_save_${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                alert('✅ Save exportado com sucesso!');
            } catch (err) {
                console.error('[InputManager] Falha ao exportar save:', err);
                alert('❌ Erro ao exportar o save.');
            }
        },

        /**
         * Importa um save de um arquivo JSON.
         * @param {File} file 
         */
        importSave(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);

                    // Validação de segurança básica
                    const dataToSave = imported.metaUpgrades || imported;
                    if (typeof dataToSave.totalGrapesBank !== 'number') {
                        throw new Error('Formato de save inválido: campo totalGrapesBank ausente.');
                    }

                    // Atualiza LocalStorage
                    localStorage.setItem(META_SAVE_KEY, JSON.stringify(dataToSave));

                    if (imported.audioSettings) {
                        localStorage.setItem(AUDIO_SETTINGS_KEY, imported.audioSettings);
                    }
                    if (imported.controlSettings) {
                        localStorage.setItem(CONTROL_SETTINGS_KEY, imported.controlSettings);
                    }

                    // Recarrega os estados no jogo
                    if (typeof loadMetaUpgrades === 'function') loadMetaUpgrades();
                    if (typeof loadAudioSettings === 'function') loadAudioSettings();
                    if (typeof loadControlSettings === 'function') loadControlSettings();
                    if (typeof updateVolumeControlsUI === 'function') updateVolumeControlsUI();
                    if (typeof updateControlSchemeUI === 'function') updateControlSchemeUI();
                    if (typeof populateMetaUpgradeScreen === 'function') populateMetaUpgradeScreen();
                    if (typeof populateSkinStoreScreen === 'function') populateSkinStoreScreen();
                    if (typeof populateCodexScreen === 'function') populateCodexScreen();
                    if (typeof populateAchievementsScreen === 'function') populateAchievementsScreen();

                    alert(`🎉 Save importado com sucesso!\n💠 Gemas no Banco: ${metaUpgrades.totalGrapesBank}\n👕 Skins Desbloqueadas: ${metaUpgrades.unlockedSkins?.length || 1}`);
                } catch (err) {
                    console.error('[InputManager] Falha ao importar save:', err);
                    alert('❌ Arquivo de save inválido ou corrompido: ' + err.message);
                }
            };
            reader.readAsText(file);
        },

        // --- Registro PWA ---
        _setupPWA() {
            if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
                navigator.serviceWorker.register('./sw.js')
                    .then((reg) => console.log('[PWA] Service Worker registrado com escopo:', reg.scope))
                    .catch((err) => console.warn('[PWA] Falha ao registrar Service Worker:', err));
            }
        }
    };

    global.InputManager = InputManager;

})(typeof window !== 'undefined' ? window : this);
