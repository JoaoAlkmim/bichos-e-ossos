
		//Funções de Utilidade
		
        // Calcula a distância entre dois pontos
        function distance(x1, y1, x2, y2) {
            return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        }
		
		// Calcula a distância ao quadrado (evita Math.sqrt)
        function distanceSquared(x1, y1, x2, y2) {
            return (x2 - x1) ** 2 + (y2 - y1) ** 2;
        }
		
		// Calcula o XP necessário para o próximo nível
        function getXPNeeded(level) {
            if (level === 1) return XP_RATE_BASE;
            return Math.round(XP_RATE_BASE * Math.pow(XP_RATE_GROWTH, level - 1));
        }
		
		//Inicialização de audio
		let isAudioContextInitialized = false; // Flag global
		function initializeAudioContext() {
			if (isAudioContextInitialized || audioCtx) return; // Já inicializado

			try {
				audioCtx = new (window.AudioContext || window.webkitAudioContext)();

				// --- WARM-UP DE ÁUDIO ---
				const buffer = audioCtx.createBuffer(1, 1, 22050);
				const source = audioCtx.createBufferSource();
				source.buffer = buffer;
				source.connect(audioCtx.destination);
				source.start(0);
				console.log("AudioContext inicializado e aquecido.");
				// --- FIM DO WARM-UP ---
				isAudioContextInitialized = true; // Marca como inicializado

			} catch (e) {
				console.error("Web Audio API não é suportada neste navegador.", e);
				isAudioContextInitialized = true; // Marca mesmo em caso de erro para não tentar de novo
			}
		}
		
		// --- Função de Tela Cheia ---
        function toggleFullScreen() {
            const element = document.documentElement; 
            
            if (!document.fullscreenElement) {
                if (element.requestFullscreen) element.requestFullscreen();
                else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
                else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
                else if (element.msRequestFullscreen) element.msRequestFullscreen();
                // O texto do botão agora é atualizado pelo listener 'fullscreenchange'
            } else {
                document.exitFullscreen();
                // O texto do botão agora é atualizado pelo listener 'fullscreenchange'
            }
        }
		
        // Salva as configurações de áudio (volume e mudo) no localStorage.
        function saveAudioSettings() {
            try {
                const settings = { masterVolume, isMuted };
                localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
            } catch (e) {
                console.error("Falha ao salvar configurações de áudio:", e);
            }
        }
		
        // Carrega as configurações de áudio do localStorage ao iniciar.
        function loadAudioSettings() {
            try {
                const savedSettings = localStorage.getItem(AUDIO_SETTINGS_KEY);
                if (savedSettings) {
                    const { masterVolume: savedVol, isMuted: savedMute } = JSON.parse(savedSettings);
                    masterVolume = typeof savedVol === 'number' ? savedVol : 0.3;
                    isMuted = typeof savedMute === 'boolean' ? savedMute : false;
                }
            } catch (e) {
                console.error("Falha ao carregar configurações de áudio:", e);
            }
        }
		
        // Salva as configurações de controle no localStorage.
        function saveControlSettings() {
            try {
                localStorage.setItem(CONTROL_SETTINGS_KEY, JSON.stringify({ scheme: controlScheme }));
            } catch (e) {
                console.error("Falha ao salvar configurações de controle:", e);
            }
        }
		
        // Carrega as configurações de controle do localStorage.
        function loadControlSettings() {
            try {
                const savedSettings = localStorage.getItem(CONTROL_SETTINGS_KEY);
                if (savedSettings) {
                    const { scheme } = JSON.parse(savedSettings);
                    controlScheme = (scheme === 'wasd') ? 'wasd' : 'mouse'; // Validação
                } else {
                    controlScheme = 'mouse'; // Padrão
                }
            } catch (e) {
                console.error("Falha ao carregar configurações de controle:", e);
                controlScheme = 'mouse'; // Padrão em caso de erro
            }
        }
		
        // Atualiza toda a UI (botões, labels) para refletir o modo de controle.
        function updateControlSchemeUI() {
            if (!setControlsMouseBtn) return; // Garante que a UI esteja carregada

            if (controlScheme === 'wasd') {
                // Atualiza botões de Configurações
                setControlsWasdBtn.classList.add('active-setting');
                setControlsWasdBtn.disabled = true;
                setControlsMouseBtn.classList.remove('active-setting');
                setControlsMouseBtn.disabled = false;

                // Atualiza rótulos dos botões de habilidade
                dashLabel.textContent = 'DASH (Shift)';
                impactLabel.textContent = 'Impacto (Q)';
                // berserkLabel.textContent = 'Berserk (E)'; // Sem mudança

                // Atualiza texto de ajuda (Pausa)
                pauseControlsText.textContent = "Controles: WASD (Mover), Shift (Dash), Q (Impacto), E (Berserk), T (Brinde)";

                // Atualiza cursor do canvas
                canvas.style.cursor = 'crosshair'; // Cursor padrão, já que o clique não move

            } else { // 'mouse'
                // Atualiza botões de Configurações
                setControlsMouseBtn.classList.add('active-setting');
                setControlsMouseBtn.disabled = true;
                setControlsWasdBtn.classList.remove('active-setting');
                setControlsWasdBtn.disabled = false;

                // Atualiza rótulos dos botões de habilidade
                dashLabel.textContent = 'DASH (Q)';
                impactLabel.textContent = 'Impacto (W)';
                // berserkLabel.textContent = 'Berserk (E)';

                // Atualiza texto de ajuda (Pausa)
                pauseControlsText.textContent = "Controles: Q (Dash), W (Impacto), E (Berserk), T (Brinde)";

                // Atualiza cursor do canvas
                canvas.style.cursor = 'pointer'; // Cursor de clique
            }
        }

        // Atualiza todos os elementos da UI de volume para refletir o estado atual.
        function updateVolumeControlsUI() {
            const allMuteButtons = document.querySelectorAll('.mute-btn');
            const allVolumeSliders = document.querySelectorAll('.volume-slider');

            allMuteButtons.forEach(btn => {
                btn.textContent = isMuted || masterVolume === 0 ? '🔇' : '🔊';
            });

            allVolumeSliders.forEach(slider => {
                slider.value = masterVolume;
                slider.disabled = isMuted;
                slider.style.opacity = isMuted ? 0.5 : 1;
            });
			// ---> Aplicar volume/mudo à BGM <---
			const bgmAudioRef = document.getElementById('bgm-audio'); // Pega a referência aqui também
			if (bgmAudioRef) { // Verifica se o elemento existe
				bgmAudioRef.volume = masterVolume;
				bgmAudioRef.muted = isMuted;
			}
        }
		
		// ====== Funções de Feedback Visual (HUD) ======

		function triggerXPGlow() {
		const xpDisplay = document.getElementById('xp-display');
		const xpBar = document.getElementById('xp-bar');
		xpDisplay.classList.add('xp-glow');
		xpBar.classList.add('xp-glow');
		setTimeout(() => {
			xpDisplay.classList.remove('xp-glow');
			xpBar.classList.remove('xp-glow');
		}, 200);
		}

		function triggerHPFlash() {
		const hpValue = document.getElementById('hp-value');
		hpValue.classList.add('hp-flash');
		setTimeout(() => hpValue.classList.remove('hp-flash'), 300);
		}

		function triggerCollectPop(type) {
		const targetId = type === 'Gema' ? 'grapes-display' : 'powerup-stacks-display';
		const el = document.getElementById(targetId);
		if (el) {
			el.classList.add('pop-scale');
			setTimeout(() => el.classList.remove('pop-scale'), 300);
		}
		}

		function triggerLevelGlow() {
		const levelDisplay = document.getElementById('level-display');
		levelDisplay.classList.add('level-glow');
		setTimeout(() => levelDisplay.classList.remove('level-glow'), 400);
		}
		
		/**
        * Toca um som sintetizado, respeitando o volume master e o estado de mudo.
        * @param {number} [frequency=440] - Frequência do som em Hz.
        * @param {number} [duration=0.1] - Duração do som em segundos.
        * @param {string} [type='square'] - Tipo de onda (sine, square, sawtooth, triangle).
        * @param {number} [volume=1.0] - Volume do som (0.0 a 1.0).
        */
		let audioCtx;
        function playBeep(frequency = 440, duration = 0.1, type = 'square', volume = 1.0) {
            // Não toca som se o áudio não foi iniciado ou está mudo
            if (!audioCtx || isMuted) return;

            try {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                oscillator.type = type;
                oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

                // Usa o volume master para controlar o volume final
                const finalVolume = volume * masterVolume;
                gainNode.gain.setValueAtTime(finalVolume, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + duration);

            } catch (e) {
                console.error("Erro ao tocar o som:", e);
            }
        }
		