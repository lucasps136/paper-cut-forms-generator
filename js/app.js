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
        color2: document.getElementById('color2').value
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
    document.getElementById('scale').value = random(15, 35);
    document.getElementById('chaosY').value = random(20, 80);
    document.getElementById('chaosX').value = random(20, 80);
    document.getElementById('rotate').value = random(50, 150);
    document.getElementById('stroke').value = random(1, 4);

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
}

/**
 * Inicializa event listeners
 */
function initEventListeners() {
    // Atualizar valores exibidos quando sliders mudarem
    ['frequency', 'scale', 'chaosY', 'chaosX', 'rotate', 'stroke'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateValues);
    });

    // Regenerar quando qualquer controle mudar
    ['shape', 'frequency', 'scale', 'chaosY', 'chaosX', 'rotate', 'stroke', 'color1', 'color2'].forEach(id => {
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
