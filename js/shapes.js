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
 * @param {string} params.color1A - Primeira cor inicial (borda) em hex
 * @param {string} params.color1B - Segunda cor inicial (borda) em hex
 * @param {string} params.color2A - Primeira cor final (centro) em hex
 * @param {string} params.color2B - Segunda cor final (centro) em hex
 * @param {boolean} params.noiseEnabled - Se deve aplicar textura de ruído
 * @param {number} params.noiseIntensity - Intensidade do ruído (0-100)
 * @param {number} params.noiseScale - Escala do ruído
 * @param {number} params.noiseOctaves - Número de octaves do ruído
 * @param {boolean} params.shadowEnabled - Se deve aplicar inner shadow
 * @param {number} params.shadowOffsetX - Offset X da sombra
 * @param {number} params.shadowOffsetY - Offset Y da sombra
 * @param {number} params.shadowBlur - Blur final da sombra
 * @param {number} params.shadowSize - Tamanho final da sombra
 * @param {string} params.shadowColor - Cor da sombra em hex
 * @param {boolean} params.gradientEnabled - Se deve usar gradientes distorcidos
 * @param {number} params.gradientIntensity - Intensidade da distorção do gradiente
 * @param {number} params.gradientScale - Escala do ruído do gradiente
 * @param {number} params.gradientOctaves - Número de octaves do gradiente
 */
function generateShapes(params) {
    const {
        selectedShape,
        frequency,
        scaleConstant,
        chaosY,
        chaosX,
        maxRotate,
        color1A,
        color1B,
        color2A,
        color2B,
        noiseEnabled = false,
        noiseIntensity = 10,
        noiseScale = 50,
        noiseOctaves = 3,
        shadowEnabled = false,
        shadowOffsetX = 1,
        shadowOffsetY = 1,
        shadowBlur = 4,
        shadowSize = 2,
        shadowColor = '#000000',
        gradientEnabled = false,
        gradientIntensity = 50,
        gradientScale = 80,
        gradientOctaves = 4
    } = params;

    initSVG();

    const shapeGroup = svg.group();

    // Array para armazenar metadados das formas para reaplicar clips após distorção
    const shapeMetadata = [];

    let previousClipId = null;

    // Gerar camadas - da maior (borda) para menor (centro)
    for (let i = frequency; i >= 2; i--) {
        const rotateFactor = map(i, frequency, 1, 0, maxRotate);
        const t = map(i, frequency, 2, 0, 1);

        // Interpolar entre as cores iniciais (1A, 1B) e finais (2A, 2B)
        // Para cada camada, calculamos duas cores que serão usadas no gradiente
        const layerColorA = interpolateColor(color1A, color2A, t);
        const layerColorB = interpolateColor(color1B, color2B, t);

        // Cor média para modo sem gradiente
        const layerColor = interpolateColor(layerColorA, layerColorB, 0.5);

        const clipId = `clip-${i}`;

        // Criar forma para esta camada
        const shape = createShape(selectedShape, i * scaleConstant);

        // Configurar posição e transformação
        shape
            .cx(SVG_WIDTH / 2)
            .cy(SVG_HEIGHT / 2)
            .attr('transform', `rotate(${rotateFactor}, ${SVG_WIDTH / 2}, ${SVG_HEIGHT / 2})`)
            .attr('stroke', 'none')
            .attr('stroke-width', 0);

        // Aplicar cor: gradiente OU cor sólida com textura (mutuamente exclusivos)
        if (gradientEnabled) {
            // Gradiente distorcido já tem sua própria textura através do ruído
            const patternId = `noise-gradient-${i}`;
            const patternData = createNoiseGradientPattern(
                patternId,
                layerColorA,
                layerColorB,
                i,
                {
                    intensity: gradientIntensity,
                    scale: gradientScale,
                    octaves: gradientOctaves,
                    seed: i * 789.123
                }
            );
            applyNoiseGradientPattern(svg, shape, patternId, patternData);
        } else if (noiseEnabled) {
            // Cor sólida com textura de ruído
            applyColorToShape(shape, layerColor, i, {
                enabled: true,
                scale: noiseScale,
                intensity: noiseIntensity,
                octaves: noiseOctaves
            });
        } else {
            // Apenas cor sólida
            shape.attr('fill', layerColor);
        }

        // Aplicar inner shadow DEPOIS do fill
        if (shadowEnabled && shadowBlur > 0) {
            const filterId = `inner-shadow-${i}`;

            // Calcular valores progressivos de blur e offset
            // shadowSize controla o multiplicador final (ex: 2 = vai de 0.5x a 2x)
            const minMultiplier = 0.5;
            const maxMultiplier = shadowSize;
            const shadowProgress = minMultiplier + (t * (maxMultiplier - minMultiplier));

            const blurAmount = shadowBlur * shadowProgress;
            const offsetXAmount = shadowOffsetX * shadowProgress;
            const offsetYAmount = shadowOffsetY * shadowProgress;
            const opacityAmount = 0.7; // Opacidade fixa em 70%

            // Criar filtro de inner shadow com valores progressivos
            createInnerShadowFilter(filterId, blurAmount, offsetXAmount, offsetYAmount, opacityAmount, shadowColor);

            // Aplicar filtro à forma
            shape.attr('filter', `url(#${filterId})`);
        }

        // NÃO aplicar clip ainda - será aplicado após distorção
        // Armazenar metadados para aplicar depois
        shapeMetadata.push({
            layer: i,
            clipId: clipId,
            previousClipId: previousClipId,
            shapeType: selectedShape,
            size: i * scaleConstant,
            rotateFactor: rotateFactor
        });

        // Adicionar forma ao grupo
        shapeGroup.add(shape);

        // Criar clip-path para próxima camada com margem de segurança
        // Reduzir tamanho em ~2% para garantir contenção após distorção
        const clipPath = svg.defs().clip().attr('id', clipId);
        const clipPadding = 0.98; // 98% do tamanho original
        const clipShape = createShape(selectedShape, i * scaleConstant * clipPadding);

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

    // Reaplicar clip-paths APÓS distorção para garantir contenção
    reapplyClipsAfterDistortion(svgEl, shapeMetadata, frequency);
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
 * @param {number} offsetX - Deslocamento horizontal da sombra
 * @param {number} offsetY - Deslocamento vertical da sombra
 * @param {number} opacity - Opacidade da sombra (0-1)
 * @param {string} color - Cor da sombra em hex
 * @returns {object} Elemento de filtro SVG
 */
function createInnerShadowFilter(filterId, blurAmount, offsetX, offsetY, opacity, color) {
    // Verificar se o filtro já existe e removê-lo
    const existingFilter = svg.defs().findOne(`#${filterId}`);
    if (existingFilter) {
        existingFilter.remove();
    }

    const filter = svg.defs().element('filter');
    filter.attr({
        id: filterId,
        x: '-50%',
        y: '-50%',
        width: '200%',
        height: '200%'
    });

    // Passo 1: Criar flood com a cor da sombra
    filter.element('feFlood').attr({
        'flood-color': color,
        'flood-opacity': opacity,
        result: 'shadowColor'
    });

    // Passo 2: Usar SourceAlpha (apenas a forma, sem cores) como máscara INVERTIDA
    // Isso cria a área FORA da forma
    filter.element('feComposite').attr({
        in: 'shadowColor',
        in2: 'SourceAlpha',
        operator: 'out',
        result: 'inverse'
    });

    // Passo 3: Aplicar offset (move a sombra)
    filter.element('feOffset').attr({
        in: 'inverse',
        dx: offsetX,
        dy: offsetY,
        result: 'offsetShadow'
    });

    // Passo 4: Aplicar blur
    filter.element('feGaussianBlur').attr({
        in: 'offsetShadow',
        stdDeviation: blurAmount,
        result: 'blurredShadow'
    });

    // Passo 5: Recortar a sombra para ficar DENTRO da forma original usando SourceAlpha
    filter.element('feComposite').attr({
        in: 'blurredShadow',
        in2: 'SourceAlpha',
        operator: 'in',
        result: 'innerShadow'
    });

    // Passo 6: Combinar a sombra com a forma original
    // A ordem importa: primeiro SourceGraphic (forma com cor), depois innerShadow (sombra por cima)
    const merge = filter.element('feMerge');
    merge.element('feMergeNode').attr({in: 'SourceGraphic'});
    merge.element('feMergeNode').attr({in: 'innerShadow'});

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
 * Reaplica os clip-paths após a distorção para garantir contenção
 * @param {SVGElement} svgEl - Elemento SVG contendo as formas distorcidas
 * @param {Array} shapeMetadata - Array com metadados das formas
 * @param {number} frequency - Número de camadas (para identificar forma MAIOR)
 */
function reapplyClipsAfterDistortion(svgEl, shapeMetadata, frequency) {
    // Pegar todas as formas visíveis (não clip-paths) no grupo principal
    const allShapes = Array.from(svgEl.querySelectorAll('g > path, g > circle, g > rect'))
        .filter(shape => !shape.closest('clipPath'));

    if (allShapes.length === 0) return;

    // 1. Criar clip-path GLOBAL da forma MAIOR (primeira forma, já distorcida)
    const largestShape = allShapes[0]; // Primeira forma é a MAIOR (i=frequency)
    const globalClipId = 'clip-global-largest';

    // Clonar o path da forma MAIOR distorcida para usar como clip global
    const globalClipPath = svgEl.querySelector('defs').appendChild(
        document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
    );
    globalClipPath.setAttribute('id', globalClipId);

    // Clonar a forma MAIOR (já distorcida) para o clip-path global
    const clonedLargestShape = largestShape.cloneNode(true);
    clonedLargestShape.removeAttribute('clip-path'); // Remover qualquer clip existente
    clonedLargestShape.removeAttribute('filter'); // Remover filtros
    clonedLargestShape.setAttribute('fill', '#000'); // Cor não importa para clip
    globalClipPath.appendChild(clonedLargestShape);

    // 2. Aplicar clip-path individual E clip global em cada forma
    shapeMetadata.forEach((meta, index) => {
        const shape = allShapes[index];
        if (!shape) return;

        // Para a forma MAIOR (primeira), não aplicar clip
        if (index === 0) {
            // Forma MAIOR não recebe clip (é o limite máximo)
            return;
        }

        // Para todas as outras formas: aplicar clip individual
        if (meta.previousClipId) {
            shape.setAttribute('clip-path', `url(#${meta.previousClipId})`);
        }

        // 3. Envolver todas as formas menores em um grupo com clip global
        // Isso será feito depois do loop
    });

    // 3. Criar grupo com clip global e mover todas as formas MENORES para dentro
    const mainGroup = svgEl.querySelector('g');
    if (!mainGroup) return;

    // Criar novo grupo com clip da forma MAIOR
    const globalClipGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    globalClipGroup.setAttribute('clip-path', `url(#${globalClipId})`);

    // Mover todas as formas EXCETO a primeira (MAIOR) para o grupo com clip global
    for (let i = 1; i < allShapes.length; i++) {
        const shape = allShapes[i];
        if (shape && shape.parentNode === mainGroup) {
            globalClipGroup.appendChild(shape);
        }
    }

    // Adicionar o grupo com clip global de volta ao grupo principal
    mainGroup.appendChild(globalClipGroup);
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
