/**
 * Paper Cut Forms Generator - Main Application
 * Gerencia controles de interface e orquestra a geração das formas
 */

/**
 * Obtém os valores atuais dos controles
 * @returns {object} Objeto com todos os parâmetros de geração
 */
function getControlValues() {
    return {
        selectedShape: document.getElementById('shape').value,
        frequency: parseInt(document.getElementById('frequency').value),
        scaleConstant: parseInt(document.getElementById('scale').value),
        chaosY: parseFloat(document.getElementById('chaosY').value),
        chaosX: parseFloat(document.getElementById('chaosX').value),
        maxRotate: parseInt(document.getElementById('rotate').value),
        strokeWidth: parseFloat(document.getElementById('stroke').value),
        color1: document.getElementById('color1').value,
        color2: document.getElementById('color2').value,
        noiseEnabled: document.getElementById('noiseEnabled').checked,
        noiseIntensity: parseInt(document.getElementById('noiseIntensity').value),
        noiseScale: parseInt(document.getElementById('noiseScale').value),
        noiseOctaves: parseInt(document.getElementById('noiseOctaves').value),
        shadowEnabled: document.getElementById('shadowEnabled').checked,
        shadowOffsetX: parseFloat(document.getElementById('shadowOffsetX').value),
        shadowOffsetY: parseFloat(document.getElementById('shadowOffsetY').value),
        shadowBlur: parseFloat(document.getElementById('shadowBlur').value),
        shadowSize: parseFloat(document.getElementById('shadowSize').value),
        shadowColor: document.getElementById('shadowColor').value
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
    document.getElementById('shape').value = shapes[random(0, shapes.length)];

    // Valores aleatórios para sliders
    document.getElementById('frequency').value = random(15, 35);
    document.getElementById('scale').value = random(20, 100);
    document.getElementById('chaosY').value = random(20, 80);
    document.getElementById('chaosX').value = random(20, 80);
    document.getElementById('rotate').value = random(50, 150);
    document.getElementById('stroke').value = random(1, 4);

    // Valores aleatórios para ruído
    document.getElementById('noiseEnabled').checked = Math.random() > 0.3; // 70% de chance de estar habilitado
    document.getElementById('noiseIntensity').value = random(20, 60);
    document.getElementById('noiseScale').value = random(30, 100);
    document.getElementById('noiseOctaves').value = random(2, 5);

    // Valores aleatórios para inner shadow
    document.getElementById('shadowEnabled').checked = Math.random() > 0.3; // 70% de chance de estar habilitado
    document.getElementById('shadowOffsetX').value = random(-5, 5) / 2;
    document.getElementById('shadowOffsetY').value = random(-5, 5) / 2;
    document.getElementById('shadowBlur').value = random(5, 30);
    document.getElementById('shadowSize').value = (random(15, 40) / 10); // 1.5 a 4.0
    const shadowHue = random(0, 360);
    document.getElementById('shadowColor').value = hslToHex(shadowHue, random(20, 80), random(10, 40));

    // Cores complementares aleatórias
    const hue1 = random(0, 360);
    const hue2 = (hue1 + random(60, 180)) % 360;
    document.getElementById('color1').value = hslToHex(hue1, 70, 60);
    document.getElementById('color2').value = hslToHex(hue2, 70, 60);

    // Atualizar displays e gerar
    updateValues();
    generate();
}

/**
 * Atualiza os valores exibidos nos labels dos sliders
 */
function updateValues() {
    document.getElementById('frequencyValue').textContent = document.getElementById('frequency').value;
    document.getElementById('scaleValue').textContent = document.getElementById('scale').value;
    document.getElementById('chaosYValue').textContent = document.getElementById('chaosY').value;
    document.getElementById('chaosXValue').textContent = document.getElementById('chaosX').value;
    document.getElementById('rotateValue').textContent = document.getElementById('rotate').value;
    document.getElementById('strokeValue').textContent = document.getElementById('stroke').value;
    document.getElementById('noiseIntensityValue').textContent = document.getElementById('noiseIntensity').value;
    document.getElementById('noiseScaleValue').textContent = document.getElementById('noiseScale').value;
    document.getElementById('noiseOctavesValue').textContent = document.getElementById('noiseOctaves').value;
    document.getElementById('shadowOffsetXValue').textContent = document.getElementById('shadowOffsetX').value;
    document.getElementById('shadowOffsetYValue').textContent = document.getElementById('shadowOffsetY').value;
    document.getElementById('shadowBlurValue').textContent = document.getElementById('shadowBlur').value;
    document.getElementById('shadowSizeValue').textContent = document.getElementById('shadowSize').value;
}

/**
 * Inicializa event listeners
 */
function initEventListeners() {
    // Atualizar valores exibidos quando sliders mudarem
    ['frequency', 'scale', 'chaosY', 'chaosX', 'rotate', 'stroke', 'noiseIntensity', 'noiseScale', 'noiseOctaves',
     'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowSize'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateValues);
    });

    // Regenerar quando qualquer controle mudar
    ['shape', 'frequency', 'scale', 'chaosY', 'chaosX', 'rotate', 'stroke', 'color1', 'color2',
     'noiseEnabled', 'noiseIntensity', 'noiseScale', 'noiseOctaves',
     'shadowEnabled', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowSize', 'shadowColor'].forEach(id => {
        document.getElementById(id).addEventListener('input', generate);
    });
}

/**
 * Inicialização da aplicação
 */
function init() {
    initEventListeners();
    initSVG();
    generate();
}

// Iniciar aplicação quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
