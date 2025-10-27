/**
 * Paper Cut Forms Generator - Main Application
 * Gerencia controles de interface e orquestra a geração das formas
 */

/**
 * Configurações centralizadas da aplicação
 * Define limites, valores padrão e ranges para randomização
 */
const CONFIG = {
    // Limites de rotação
    rotation: {
        min: 0,
        max: 35,
        randomMin: 5,
        randomMax: 30
    },
    // Configurações de ruído
    noise: {
        intensity: {
            min: 0,
            max: 20,
            randomMin: 5,
            randomMax: 15
        },
        scale: {
            min: 10,
            max: 150,
            randomMin: 30,
            randomMax: 100
        },
        octaves: {
            min: 1,
            max: 6,
            randomMin: 2,
            randomMax: 5
        },
        patternSize: 200 // Tamanho do pattern (mesmo valor em noise.js)
    },
    // Outras configurações de sliders
    frequency: {
        min: 3,
        max: 20,
        randomMin: 8,
        randomMax: 15
    },
    scale: {
        min: 10,
        max: 200,
        randomMin: 20,
        randomMax: 100
    },
    chaos: {
        min: 0,
        max: 100,
        randomMin: 20,
        randomMax: 80
    },
    shadow: {
        offset: {
            min: -10,
            max: 10,
            randomMin: -2.5,
            randomMax: 2.5
        },
        blur: {
            min: 0,
            max: 50,
            randomMin: 5,
            randomMax: 30
        },
        size: {
            min: 1,
            max: 5,
            randomMin: 1.5,
            randomMax: 4.0
        }
    },
    // Probabilidades
    probability: {
        noiseEnabled: 0.7,  // 70% de chance
        shadowEnabled: 0.7  // 70% de chance
    }
};

/**
 * Cache de elementos DOM para melhor performance
 * Evita múltiplas chamadas a document.getElementById()
 */
const controls = {};

/**
 * Inicializa o cache de elementos DOM
 */
function initControlsCache() {
    const controlIds = [
        'shape', 'frequency', 'scale', 'chaosY', 'chaosX', 'rotate',
        'color1A', 'color1B', 'color2A', 'color2B', 'noiseEnabled', 'noiseIntensity',
        'noiseScale', 'noiseOctaves', 'shadowEnabled', 'shadowOffsetX',
        'shadowOffsetY', 'shadowBlur', 'shadowSize', 'shadowColor',
        'gradientEnabled', 'gradientIntensity', 'gradientScale', 'gradientOctaves'
    ];

    const valueDisplayIds = [
        'frequencyValue', 'scaleValue', 'chaosYValue', 'chaosXValue',
        'rotateValue', 'noiseIntensityValue', 'noiseScaleValue',
        'noiseOctavesValue', 'shadowOffsetXValue', 'shadowOffsetYValue',
        'shadowBlurValue', 'shadowSizeValue', 'gradientIntensityValue',
        'gradientScaleValue', 'gradientOctavesValue'
    ];

    controlIds.forEach(id => {
        controls[id] = document.getElementById(id);
    });

    valueDisplayIds.forEach(id => {
        controls[id] = document.getElementById(id);
    });
}

/**
 * Atualiza visibilidade das cores B baseado no estado do gradiente
 */
function updateColorBVisibility() {
    const gradientEnabled = controls.gradientEnabled.checked;
    const color1BGroup = document.getElementById('color1B-group');
    const color2BGroup = document.getElementById('color2B-group');

    if (color1BGroup && color2BGroup) {
        if (gradientEnabled) {
            color1BGroup.classList.remove('hidden');
            color2BGroup.classList.remove('hidden');
        } else {
            color1BGroup.classList.add('hidden');
            color2BGroup.classList.add('hidden');
        }
    }
}

/**
 * Obtém os valores atuais dos controles
 * @returns {object} Objeto com todos os parâmetros de geração
 */
function getControlValues() {
    return {
        selectedShape: controls.shape.value,
        frequency: parseInt(controls.frequency.value),
        scaleConstant: parseInt(controls.scale.value),
        chaosY: parseFloat(controls.chaosY.value),
        chaosX: parseFloat(controls.chaosX.value),
        maxRotate: parseInt(controls.rotate.value),
        color1A: controls.color1A.value,
        color1B: controls.color1B.value,
        color2A: controls.color2A.value,
        color2B: controls.color2B.value,
        noiseEnabled: controls.noiseEnabled.checked,
        noiseIntensity: parseInt(controls.noiseIntensity.value),
        noiseScale: parseInt(controls.noiseScale.value),
        noiseOctaves: parseInt(controls.noiseOctaves.value),
        shadowEnabled: controls.shadowEnabled.checked,
        shadowOffsetX: parseFloat(controls.shadowOffsetX.value),
        shadowOffsetY: parseFloat(controls.shadowOffsetY.value),
        shadowBlur: parseFloat(controls.shadowBlur.value),
        shadowSize: parseFloat(controls.shadowSize.value),
        shadowColor: controls.shadowColor.value,
        gradientEnabled: controls.gradientEnabled.checked,
        gradientIntensity: parseInt(controls.gradientIntensity.value),
        gradientScale: parseInt(controls.gradientScale.value),
        gradientOctaves: parseInt(controls.gradientOctaves.value)
    };
}

/**
 * Gera a forma com base nos valores atuais dos controles
 */
function generate() {
    const params = getControlValues();
    generateShapes(params);
}

/**
 * Gera valores aleatórios para todos os controles
 */
function randomize() {
    // Forma aleatória
    const shapes = ['circle', 'square', 'triangle', 'hexagon'];
    controls.shape.value = shapes[random(0, shapes.length)];

    // Valores aleatórios para sliders usando CONFIG
    controls.frequency.value = random(CONFIG.frequency.randomMin, CONFIG.frequency.randomMax);
    controls.scale.value = random(CONFIG.scale.randomMin, CONFIG.scale.randomMax);
    controls.chaosY.value = random(CONFIG.chaos.randomMin, CONFIG.chaos.randomMax);
    controls.chaosX.value = random(CONFIG.chaos.randomMin, CONFIG.chaos.randomMax);
    controls.rotate.value = random(CONFIG.rotation.randomMin, CONFIG.rotation.randomMax);

    // Valores aleatórios para ruído usando CONFIG
    controls.noiseEnabled.checked = Math.random() > (1 - CONFIG.probability.noiseEnabled);
    controls.noiseIntensity.value = random(CONFIG.noise.intensity.randomMin, CONFIG.noise.intensity.randomMax);
    controls.noiseScale.value = random(CONFIG.noise.scale.randomMin, CONFIG.noise.scale.randomMax);
    controls.noiseOctaves.value = random(CONFIG.noise.octaves.randomMin, CONFIG.noise.octaves.randomMax);

    // Valores aleatórios para inner shadow usando CONFIG
    controls.shadowEnabled.checked = Math.random() > (1 - CONFIG.probability.shadowEnabled);
    controls.shadowOffsetX.value = random(CONFIG.shadow.offset.randomMin, CONFIG.shadow.offset.randomMax);
    controls.shadowOffsetY.value = random(CONFIG.shadow.offset.randomMin, CONFIG.shadow.offset.randomMax);
    controls.shadowBlur.value = random(CONFIG.shadow.blur.randomMin, CONFIG.shadow.blur.randomMax);
    controls.shadowSize.value = random(CONFIG.shadow.size.randomMin, CONFIG.shadow.size.randomMax, true);
    const shadowHue = random(0, 360);
    controls.shadowColor.value = hslToHex(shadowHue, random(20, 80), random(10, 40));

    // Cores complementares aleatórias (4 cores)
    const hue1A = random(0, 360);
    const hue1B = (hue1A + random(30, 90)) % 360; // Cores iniciais próximas
    const hue2A = (hue1A + random(120, 240)) % 360; // Cores finais complementares
    const hue2B = (hue2A + random(30, 90)) % 360;

    controls.color1A.value = hslToHex(hue1A, 70, 60);
    controls.color1B.value = hslToHex(hue1B, 70, 60);
    controls.color2A.value = hslToHex(hue2A, 70, 60);
    controls.color2B.value = hslToHex(hue2B, 70, 60);

    // Atualizar displays e gerar
    updateValues();
    generate();
}

/**
 * Atualiza os valores exibidos nos labels dos sliders
 */
function updateValues() {
    controls.frequencyValue.textContent = controls.frequency.value;
    controls.scaleValue.textContent = controls.scale.value;
    controls.chaosYValue.textContent = controls.chaosY.value;
    controls.chaosXValue.textContent = controls.chaosX.value;
    controls.rotateValue.textContent = controls.rotate.value;
    controls.noiseIntensityValue.textContent = controls.noiseIntensity.value;
    controls.noiseScaleValue.textContent = controls.noiseScale.value;
    controls.noiseOctavesValue.textContent = controls.noiseOctaves.value;
    controls.shadowOffsetXValue.textContent = controls.shadowOffsetX.value;
    controls.shadowOffsetYValue.textContent = controls.shadowOffsetY.value;
    controls.shadowBlurValue.textContent = controls.shadowBlur.value;
    controls.shadowSizeValue.textContent = controls.shadowSize.value;
    controls.gradientIntensityValue.textContent = controls.gradientIntensity.value;
    controls.gradientScaleValue.textContent = controls.gradientScale.value;
    controls.gradientOctavesValue.textContent = controls.gradientOctaves.value;
}

/**
 * Inicializa event listeners
 */
function initEventListeners() {
    // Atualizar valores exibidos quando sliders mudarem
    ['frequency', 'scale', 'chaosY', 'chaosX', 'rotate', 'noiseIntensity', 'noiseScale', 'noiseOctaves',
     'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowSize', 'gradientIntensity', 'gradientScale', 'gradientOctaves'].forEach(id => {
        controls[id].addEventListener('input', updateValues);
    });

    // Garantir que gradiente e ruído sejam mutuamente exclusivos
    controls.gradientEnabled.addEventListener('change', function() {
        if (this.checked) {
            controls.noiseEnabled.checked = false;
        }
        updateColorBVisibility();
        generate();
    });

    controls.noiseEnabled.addEventListener('change', function() {
        if (this.checked) {
            controls.gradientEnabled.checked = false;
        }
        generate();
    });

    // Regenerar quando qualquer controle mudar (exceto gradientEnabled e noiseEnabled que já têm listeners)
    ['shape', 'frequency', 'scale', 'chaosY', 'chaosX', 'rotate', 'color1A', 'color1B', 'color2A', 'color2B',
     'noiseIntensity', 'noiseScale', 'noiseOctaves',
     'shadowEnabled', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowSize', 'shadowColor',
     'gradientIntensity', 'gradientScale', 'gradientOctaves'].forEach(id => {
        controls[id].addEventListener('input', generate);
    });
}

/**
 * Inicialização da aplicação
 */
function init() {
    initControlsCache();
    initEventListeners();
    updateColorBVisibility(); // Configurar estado inicial das cores B
    initSVG();
    generate();
}

// Iniciar aplicação quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
