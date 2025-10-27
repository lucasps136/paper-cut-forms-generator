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

// Cache de filtros SVG para reutilização entre camadas
const filterCache = new Map();

/**
 * Gera ID de filtro compartilhado baseado em parâmetros (agrupa valores similares)
 */
function getSharedFilterId(blurAmount, offsetX, offsetY, opacity, color) {
    // Arredondar valores para agrupar filtros similares
    const blurBucket = Math.round(blurAmount * 2) / 2; // Agrupa em 0.5 incrementos
    const offsetXBucket = Math.round(offsetX);
    const offsetYBucket = Math.round(offsetY);
    const opacityBucket = Math.round(opacity * 10) / 10;
    return `shared-shadow-${blurBucket}-${offsetXBucket}-${offsetYBucket}-${opacityBucket}-${color.replace('#', '')}`;
}

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

    // Limpar cache de filtros ao reinicializar
    filterCache.clear();
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
            // Calcular valores progressivos de blur e offset
            // shadowSize controla o multiplicador final (ex: 2 = vai de 0.5x a 2x)
            const minMultiplier = 0.5;
            const maxMultiplier = shadowSize;
            const shadowProgress = minMultiplier + (t * (maxMultiplier - minMultiplier));

            const blurAmount = shadowBlur * shadowProgress;
            const offsetXAmount = shadowOffsetX * shadowProgress;
            const offsetYAmount = shadowOffsetY * shadowProgress;
            const opacityAmount = 0.7; // Opacidade fixa em 70%

            // Usar filtro compartilhado baseado em parâmetros agrupados
            const sharedFilterId = getSharedFilterId(blurAmount, offsetXAmount, offsetYAmount, opacityAmount, shadowColor);

            // Criar filtro apenas se ainda não existe
            if (!filterCache.has(sharedFilterId)) {
                createInnerShadowFilter(sharedFilterId, blurAmount, offsetXAmount, offsetYAmount, opacityAmount, shadowColor);
                filterCache.set(sharedFilterId, true);
            }

            // Aplicar filtro compartilhado à forma
            shape.attr('filter', `url(#${sharedFilterId})`);
        }

        // Armazenar metadados para criar clips após distorção
        shapeMetadata.push({
            layer: i,
            clipId: clipId,
            shapeType: selectedShape,
            size: i * scaleConstant,
            rotateFactor: rotateFactor
        });

        // Adicionar forma ao grupo
        shapeGroup.add(shape);
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
 * Cria clip-paths baseados nas formas JÁ DISTORCIDAS
 * @param {SVGElement} svgEl - Elemento SVG contendo as formas distorcidas
 * @param {Array} shapeMetadata - Array com metadados das formas
 * @param {number} frequency - Número de camadas (para identificar forma MAIOR)
 */
function reapplyClipsAfterDistortion(svgEl, shapeMetadata, frequency) {
    // Pegar todas as formas visíveis (não clip-paths) no grupo principal
    // Após distorção, todas as formas podem ter virado <path>
    const allShapes = Array.from(svgEl.querySelectorAll('g > path, g > circle, g > rect'))
        .filter(shape => !shape.closest('clipPath'));

    if (allShapes.length === 0) return;

    const mainGroup = svgEl.querySelector('g');
    const defs = svgEl.querySelector('defs');
    if (!mainGroup || !defs) return;

    // Margem visual otimizada: clips serão 90% do tamanho da forma (10% menor)
    // Reduzido de 0.85 para 0.90 para melhor performance (menos recorte = menos processamento)
    // Ainda mantém contenção visual mas com menos overhead de clipping
    const clipScaleFactor = 0.90;

    // 1. Criar clip-path GLOBAL baseado na forma MAIOR (já distorcida)
    const largestShape = allShapes[0];
    const globalClipId = 'clip-global-largest';

    const globalClipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    globalClipPath.setAttribute('id', globalClipId);

    const clonedLargest = largestShape.cloneNode(true);
    clonedLargest.removeAttribute('clip-path');
    clonedLargest.removeAttribute('filter');
    clonedLargest.removeAttribute('fill');

    // Aplicar escala de segurança no clip global
    const bbox = largestShape.getBBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    clonedLargest.setAttribute('transform',
        `translate(${centerX}, ${centerY}) scale(${clipScaleFactor}) translate(${-centerX}, ${-centerY})`
    );

    globalClipPath.appendChild(clonedLargest);
    defs.appendChild(globalClipPath);

    // 2. Criar clip-path individual para cada forma baseado na forma ANTERIOR (já distorcida)
    const clipPaths = {}; // Armazenar clips criados

    for (let i = 0; i < allShapes.length - 1; i++) {
        const currentShape = allShapes[i]; // Forma que será usada como clip para a próxima
        const meta = shapeMetadata[i];
        const clipId = meta.clipId;

        // Criar clip-path baseado na forma atual (distorcida)
        const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', clipId);

        const clonedShape = currentShape.cloneNode(true);
        clonedShape.removeAttribute('clip-path');
        clonedShape.removeAttribute('filter');
        clonedShape.removeAttribute('fill');

        // Aplicar escala de segurança centralizada
        const shapeBBox = currentShape.getBBox();
        const shapeCenterX = shapeBBox.x + shapeBBox.width / 2;
        const shapeCenterY = shapeBBox.y + shapeBBox.height / 2;
        clonedShape.setAttribute('transform',
            `translate(${shapeCenterX}, ${shapeCenterY}) scale(${clipScaleFactor}) translate(${-shapeCenterX}, ${-shapeCenterY})`
        );

        clipPath.appendChild(clonedShape);
        defs.appendChild(clipPath);
        clipPaths[clipId] = clipPath;
    }

    // 3. Criar estrutura de grupos aninhados
    const globalClipGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    globalClipGroup.setAttribute('clip-path', `url(#${globalClipId})`);

    // 4. Adicionar a primeira forma (maior) diretamente ao grupo global SEM clip
    if (allShapes[0] && allShapes[0].parentNode === mainGroup) {
        allShapes[0].removeAttribute('clip-path');
        globalClipGroup.appendChild(allShapes[0]);
    }

    // 5. Para cada forma subsequente, criar grupo individual com clip
    for (let i = 1; i < allShapes.length; i++) {
        const shape = allShapes[i];
        const prevMeta = shapeMetadata[i - 1]; // Metadados da forma ANTERIOR (maior que esta)

        if (shape && shape.parentNode === mainGroup) {
            // Criar grupo individual com clip da forma anterior
            const individualGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            individualGroup.setAttribute('clip-path', `url(#${prevMeta.clipId})`);

            // Mover forma para o grupo individual
            shape.removeAttribute('clip-path');
            individualGroup.appendChild(shape);

            // Adicionar grupo individual ao grupo global
            globalClipGroup.appendChild(individualGroup);
        }
    }

    // 6. Adicionar grupo global ao mainGroup
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
