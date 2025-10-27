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
        'shape', 'frequency', 'scale', 'chaosY', 'chaosX', 'rotate', 'seed',
        'color1A', 'color1B', 'color2A', 'color2B', 'textureEnabled', 'textureIntensity',
        'textureScale', 'textureOctaves', 'shadowEnabled', 'shadowOffsetX',
        'shadowOffsetY', 'shadowBlur', 'shadowSize', 'shadowColor',
        'gradientEnabled'
    ];

    const valueDisplayIds = [
        'frequencyValue', 'scaleValue', 'chaosYValue', 'chaosXValue',
        'rotateValue', 'textureIntensityValue', 'textureScaleValue',
        'textureOctavesValue', 'shadowOffsetXValue', 'shadowOffsetYValue',
        'shadowBlurValue', 'shadowSizeValue'
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
        seed: parseInt(controls.seed.value),
        color1A: controls.color1A.value,
        color1B: controls.color1B.value,
        color2A: controls.color2A.value,
        color2B: controls.color2B.value,
        textureEnabled: controls.textureEnabled.checked,
        textureIntensity: parseInt(controls.textureIntensity.value),
        textureScale: parseInt(controls.textureScale.value),
        textureOctaves: parseInt(controls.textureOctaves.value),
        shadowEnabled: controls.shadowEnabled.checked,
        shadowOffsetX: parseFloat(controls.shadowOffsetX.value),
        shadowOffsetY: parseFloat(controls.shadowOffsetY.value),
        shadowBlur: parseFloat(controls.shadowBlur.value),
        shadowSize: parseFloat(controls.shadowSize.value),
        shadowColor: controls.shadowColor.value,
        gradientEnabled: controls.gradientEnabled.checked
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
 * Gera uma nova seed aleatória
 */
function generateNewSeed() {
    controls.seed.value = Math.floor(Math.random() * 999999);
    generate();
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

    // Valores aleatórios para textura usando CONFIG
    controls.textureEnabled.checked = Math.random() > (1 - CONFIG.probability.noiseEnabled);
    controls.textureIntensity.value = random(CONFIG.noise.intensity.randomMin, CONFIG.noise.intensity.randomMax);
    controls.textureScale.value = random(CONFIG.noise.scale.randomMin, CONFIG.noise.scale.randomMax);
    controls.textureOctaves.value = random(CONFIG.noise.octaves.randomMin, CONFIG.noise.octaves.randomMax);

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
    controls.textureIntensityValue.textContent = controls.textureIntensity.value;
    controls.textureScaleValue.textContent = controls.textureScale.value;
    controls.textureOctavesValue.textContent = controls.textureOctaves.value;
    controls.shadowOffsetXValue.textContent = controls.shadowOffsetX.value;
    controls.shadowOffsetYValue.textContent = controls.shadowOffsetY.value;
    controls.shadowBlurValue.textContent = controls.shadowBlur.value;
    controls.shadowSizeValue.textContent = controls.shadowSize.value;
}

/**
 * Inicializa event listeners
 */
function initEventListeners() {
    // Atualizar valores exibidos quando sliders mudarem
    ['frequency', 'scale', 'chaosY', 'chaosX', 'rotate', 'textureIntensity', 'textureScale', 'textureOctaves',
     'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowSize'].forEach(id => {
        controls[id].addEventListener('input', updateValues);
    });

    // Gradiente e textura agora funcionam independentemente
    controls.gradientEnabled.addEventListener('change', function() {
        updateColorBVisibility();
        generate();
    });

    controls.textureEnabled.addEventListener('change', function() {
        generate();
    });

    // Regenerar quando qualquer controle mudar
    ['shape', 'frequency', 'scale', 'chaosY', 'chaosX', 'rotate', 'seed', 'color1A', 'color1B', 'color2A', 'color2B',
     'textureIntensity', 'textureScale', 'textureOctaves',
     'shadowEnabled', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowSize', 'shadowColor'].forEach(id => {
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
