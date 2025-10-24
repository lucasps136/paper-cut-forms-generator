/**
 * Paper Cut Forms Generator - Shape Generation
 * Gera formas geométricas com camadas e gradientes de cores
 */

// Configuração do canvas
const SVG_WIDTH = 800;
const SVG_HEIGHT = 800;

// Paths das formas geométricas
const SHAPE_PATHS = {
    hexagon: 'M400 250L529.904 325V475L400 550L270.096 475V325L400 250Z',
    triangle: 'M392.83 239.489C395.767 233.553 404.233 233.553 407.17 239.489L524.189 475.952C526.82 481.269 522.952 487.5 517.019 487.5H282.981C277.048 487.5 273.18 481.269 275.811 475.952L392.83 239.489Z'
};

let svg;

/**
 * Inicializa o canvas SVG
 */
function initSVG() {
    const wrapper = document.getElementById('canvas-wrapper');
    wrapper.innerHTML = '';

    svg = SVG()
        .viewbox(0, 0, SVG_WIDTH, SVG_HEIGHT)
        .addTo('#canvas-wrapper')
        .attr('id', 'chaos-svg');
}

/**
 * Gera as formas com base nos parâmetros fornecidos
 * @param {object} params - Parâmetros de geração
 * @param {string} params.selectedShape - Tipo de forma (circle, square, hexagon, triangle)
 * @param {number} params.frequency - Número de camadas
 * @param {number} params.scaleConstant - Escala de cada camada
 * @param {number} params.chaosY - Intensidade da distorção no eixo Y
 * @param {number} params.chaosX - Intensidade da distorção no eixo X
 * @param {number} params.maxRotate - Rotação máxima em graus
 * @param {number} params.strokeWidth - Espessura das linhas
 * @param {string} params.color1 - Cor inicial em hex
 * @param {string} params.color2 - Cor final em hex
 * @param {boolean} params.noiseEnabled - Se deve aplicar textura de ruído
 * @param {number} params.noiseIntensity - Intensidade do ruído (0-100)
 * @param {number} params.noiseScale - Escala do ruído
 * @param {number} params.noiseOctaves - Número de octaves do ruído
 */
function generateShapes(params) {
    const {
        selectedShape,
        frequency,
        scaleConstant,
        chaosY,
        chaosX,
        maxRotate,
        strokeWidth,
        color1,
        color2,
        noiseEnabled = false,
        noiseIntensity = 30,
        noiseScale = 50,
        noiseOctaves = 3
    } = params;

    initSVG();

    let previousClipId = null;

    // Criar filtro de ruído único para todas as formas (se habilitado)
    let noiseFilterId = null;
    if (noiseEnabled) {
        noiseFilterId = 'noise-filter';
        createTextureOverlay(svg, noiseFilterId, {
            scale: noiseScale,
            intensity: noiseIntensity,
            octaves: noiseOctaves,
            seed: Math.random() * 1000
        });
    }

    // Gerar camadas - da maior (borda) para menor (centro)
    for (let i = frequency; i >= 2; i--) {
        const rotateFactor = map(i, frequency, 1, 0, maxRotate);
        const t = map(i, frequency, 2, 0, 1);
        const layerColor = interpolateColor(color1, color2, t);

        const clipId = `clip-${i}`;

        // Criar forma para esta camada
        const shape = createShape(selectedShape, i * scaleConstant);

        shape
            .cx(SVG_WIDTH / 2)
            .cy(SVG_HEIGHT / 2)
            .attr('transform', `rotate(${rotateFactor}, ${SVG_WIDTH / 2}, ${SVG_HEIGHT / 2})`)
            .attr('stroke', layerColor)
            .attr('stroke-width', strokeWidth)
            .attr('fill', layerColor)
            .attr('stroke-linecap', 'round');

        // Aplicar filtro de ruído se habilitado
        if (noiseEnabled && noiseFilterId) {
            shape.attr('filter', `url(#${noiseFilterId})`);
        }

        // Aplicar clip da camada anterior (se existir)
        if (previousClipId) {
            shape.attr('clip-path', `url(#${previousClipId})`);
        }

        // Criar clip-path para próxima camada usando element() ao invés de clip()
        const clipPath = svg.defs().element('clipPath').attr('id', clipId);
        const clipShape = createShape(selectedShape, i * scaleConstant);

        // Adicionar a forma de clip ao clipPath
        clipShape
            .cx(SVG_WIDTH / 2)
            .cy(SVG_HEIGHT / 2)
            .attr('transform', `rotate(${rotateFactor}, ${SVG_WIDTH / 2}, ${SVG_HEIGHT / 2})`)
            .addTo(clipPath);

        previousClipId = clipId;
    }

    // Aplicar distorção senoidal
    const svgEl = document.getElementById('chaos-svg');
    applyWarpDistortion(svgEl, chaosX, chaosY);
}

/**
 * Cria uma forma SVG baseada no tipo
 * @param {string} shapeType - Tipo de forma (circle, square, hexagon, triangle)
 * @param {number} size - Tamanho da forma
 * @returns {object} Elemento SVG criado
 */
function createShape(shapeType, size) {
    let shape;

    switch (shapeType) {
        case 'circle':
            shape = svg.circle(size);
            break;
        case 'square':
            shape = svg.rect(size, size);
            break;
        case 'hexagon':
            shape = svg.path(SHAPE_PATHS.hexagon).size(size);
            break;
        case 'triangle':
            shape = svg.path(SHAPE_PATHS.triangle).size(size);
            break;
        default:
            shape = svg.circle(size);
    }

    return shape;
}

/**
 * Exporta o SVG atual para download
 */
function downloadSVG() {
    const svgEl = document.getElementById('chaos-svg');
    if (!svgEl) {
        console.error('SVG não encontrado');
        return;
    }

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'chaos-shape.svg';
    a.click();

    URL.revokeObjectURL(url);
}
