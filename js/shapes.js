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

    const shapeGroup = svg.group()
        .attr('stroke-linecap', 'round');

    let previousClipId = null;

    // Valores iniciais para inner shadow
    const initialBlur = 2;
    const initialOffset = 1;

    // Gerar camadas - da maior (borda) para menor (centro)
    for (let i = frequency; i >= 2; i--) {
        const rotateFactor = map(i, frequency, 1, 0, maxRotate);
        const t = map(i, frequency, 2, 0, 1);
        const layerColor = interpolateColor(color1, color2, t);

        // Calcular valores progressivos de blur e offset (1x a 2x)
        const shadowProgress = 1 + t; // Vai de 1 a 2
        const blurAmount = initialBlur * shadowProgress;
        const offsetAmount = initialOffset * shadowProgress;

        const clipId = `clip-${i}`;
        const filterId = `inner-shadow-${i}`;

        // Criar filtro de inner shadow com valores progressivos
        createInnerShadowFilter(filterId, blurAmount, offsetAmount);

        // Criar forma para esta camada
        const shape = createShape(selectedShape, i * scaleConstant);

        // Configurar posição e transformação
        shape
            .cx(SVG_WIDTH / 2)
            .cy(SVG_HEIGHT / 2)
            .attr('transform', `rotate(${rotateFactor}, ${SVG_WIDTH / 2}, ${SVG_HEIGHT / 2})`)
            .attr('stroke', layerColor)
            .attr('stroke-width', strokeWidth)
            .attr('stroke-linecap', 'round')
            .attr('filter', `url(#${filterId})`); // Aplicar filtro de inner shadow

        // Aplicar cor sólida (com ou sem textura de ruído)
        applyColorToShape(shape, layerColor, i, noiseEnabled ? {
            enabled: true,
            scale: noiseScale,
            intensity: noiseIntensity,
            octaves: noiseOctaves
        } : null);

        // Aplicar clip da camada anterior (se existir)
        if (previousClipId) {
            shape.attr('clip-path', `url(#${previousClipId})`);
        }

        // Adicionar forma ao grupo
        shapeGroup.add(shape);

        // Criar clip-path para próxima camada
        const clipPath = svg.defs().clip().attr('id', clipId);
        const clipShape = createShape(selectedShape, i * scaleConstant);

        clipShape
            .cx(SVG_WIDTH / 2)
            .cy(SVG_HEIGHT / 2)
            .attr('transform', `rotate(${rotateFactor}, ${SVG_WIDTH / 2}, ${SVG_HEIGHT / 2})`);

        // Adicionar forma de clip ao clipPath
        clipPath.add(clipShape);

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
 * Cria um filtro de inner shadow progressivo
 * @param {string} filterId - ID único para o filtro
 * @param {number} blurAmount - Quantidade de blur (stdDeviation)
 * @param {number} offsetAmount - Deslocamento da sombra
 * @returns {object} Elemento de filtro SVG
 */
function createInnerShadowFilter(filterId, blurAmount, offsetAmount) {
    const filter = svg.defs().element('filter').attr('id', filterId);

    // 1. Inverter o alpha da forma (criar máscara invertida)
    filter.element('feFlood')
        .attr('flood-color', '#000000')
        .attr('result', 'flood');

    filter.element('feComposite')
        .attr('in', 'flood')
        .attr('in2', 'SourceGraphic')
        .attr('operator', 'out')
        .attr('result', 'inverse');

    // 2. Aplicar offset na máscara invertida
    filter.element('feOffset')
        .attr('in', 'inverse')
        .attr('dx', offsetAmount)
        .attr('dy', offsetAmount)
        .attr('result', 'offset');

    // 3. Aplicar blur
    filter.element('feGaussianBlur')
        .attr('in', 'offset')
        .attr('stdDeviation', blurAmount)
        .attr('result', 'blur');

    // 4. Compor a sombra dentro da forma
    filter.element('feComposite')
        .attr('in', 'blur')
        .attr('in2', 'SourceGraphic')
        .attr('operator', 'in')
        .attr('result', 'shadow');

    // 5. Misturar a sombra com a forma original
    const feMerge = filter.element('feMerge');
    feMerge.element('feMergeNode').attr('in', 'SourceGraphic');
    feMerge.element('feMergeNode').attr('in', 'shadow');

    return filter;
}

/**
 * Aplica cor sólida com textura de ruído opcional a uma forma
 * @param {object} shape - Elemento SVG da forma
 * @param {string} color - Cor base em formato hex
 * @param {number} layerIndex - Índice da camada (para seed único)
 * @param {object} noiseOptions - Opções de ruído
 * @returns {object} Forma com cor aplicada
 */
function applyColorToShape(shape, color, layerIndex, noiseOptions = null) {
    if (noiseOptions && noiseOptions.enabled) {
        const patternId = `noise-pattern-${layerIndex}`;
        const noiseData = createNoisePattern(patternId, color, {
            scale: noiseOptions.scale,
            intensity: noiseOptions.intensity,
            octaves: noiseOptions.octaves,
            seed: layerIndex * 123.456
        });

        // Criar pattern SVG com configuração correta
        const pattern = svg.defs()
            .pattern(noiseData.size, noiseData.size)
            .attr('id', patternId)
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('patternContentUnits', 'userSpaceOnUse')
            .attr('x', 0)
            .attr('y', 0);

        pattern.image(noiseData.dataUrl)
            .size(noiseData.size, noiseData.size)
            .attr('x', 0)
            .attr('y', 0)
            .attr('preserveAspectRatio', 'none');

        shape.attr('fill', `url(#${patternId})`);
    } else {
        // Cor sólida sem ruído
        shape.attr('fill', color);
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
