/**
 * Paper Cut Forms Generator - Distorted Gradient System
 * Gera gradientes distorcidos e orgânicos usando ruído Simplex
 */

/**
 * Cria um gradiente radial distorcido para uma forma
 * @param {string} id - ID único para o gradiente
 * @param {string} color1 - Cor inicial em hex
 * @param {string} color2 - Cor final em hex
 * @param {number} layerIndex - Índice da camada (para seed único)
 * @param {object} options - Opções de distorção
 * @param {number} options.intensity - Intensidade da distorção (0-100)
 * @param {number} options.complexity - Complexidade do gradiente (número de stops intermediários)
 * @param {number} options.seed - Seed para geração determinística
 * @param {string} options.type - Tipo de gradiente ('radial' ou 'linear')
 * @returns {object} Dados do gradiente distorcido
 */
function createDistortedGradient(id, color1, color2, layerIndex, options = {}) {
    const {
        intensity = 50,
        complexity = 5,
        seed = Math.random() * 1000,
        type = 'radial'
    } = options;

    const simplex = new SimplexNoise(seed + layerIndex * 456.789);

    // Gerar cores intermediárias distorcidas
    const stops = [];
    const numStops = complexity;

    for (let i = 0; i < numStops; i++) {
        const basePosition = i / (numStops - 1);

        // Adicionar distorção à posição usando ruído
        const noiseValue = simplex.noise(
            basePosition * 5 + layerIndex * 0.1,
            layerIndex * 0.1
        );

        // Distorção suave da posição (±intensity%)
        const distortion = (noiseValue * 0.5) * (intensity / 100) * 0.3;
        let position = Math.max(0, Math.min(1, basePosition + distortion));

        // Gerar cor intermediária
        const baseColor = interpolateColor(color1, color2, basePosition);

        // Adicionar variação sutil à cor usando ruído
        const colorVariation = simplex.noise(
            basePosition * 3 + layerIndex * 0.2,
            layerIndex * 0.15
        ) * (intensity / 100) * 30;

        const variedColor = varyColor(baseColor, colorVariation);

        stops.push({
            position: Math.round(position * 100),
            color: variedColor
        });
    }

    // Ordenar stops por posição
    stops.sort((a, b) => a.position - b.position);

    // Garantir que primeira posição é 0% e última é 100%
    if (stops.length > 0) {
        stops[0].position = 0;
        stops[stops.length - 1].position = 100;
    }

    return {
        id,
        type,
        stops
    };
}

/**
 * Aplica gradiente distorcido a uma forma SVG
 * @param {object} svg - Instância SVG.js
 * @param {object} shape - Elemento SVG da forma
 * @param {object} gradientData - Dados do gradiente
 * @param {object} bounds - Limites da forma {cx, cy, radius}
 */
function applyDistortedGradient(svg, shape, gradientData, bounds = null) {
    const { id, type, stops } = gradientData;

    // Remover gradiente existente se já existe
    const existingGradient = svg.defs().findOne(`#${id}`);
    if (existingGradient) {
        existingGradient.remove();
    }

    let gradient;

    if (type === 'radial') {
        // Gradiente radial centrado
        gradient = svg.defs().gradient('radial', (add) => {
            stops.forEach(stop => {
                add.stop(stop.position / 100, stop.color);
            });
        });

        gradient.attr({
            id: id,
            cx: '50%',
            cy: '50%',
            r: '50%'
        });
    } else {
        // Gradiente linear
        gradient = svg.defs().gradient('linear', (add) => {
            stops.forEach(stop => {
                add.stop(stop.position / 100, stop.color);
            });
        });

        gradient.attr({
            id: id,
            x1: '0%',
            y1: '0%',
            x2: '100%',
            y2: '100%'
        });
    }

    // Aplicar gradiente à forma
    shape.attr('fill', `url(#${id})`);

    return gradient;
}

/**
 * Cria um gradiente com padrão de ruído para textura orgânica
 * @param {string} id - ID único para o padrão
 * @param {string} color1 - Cor inicial
 * @param {string} color2 - Cor final
 * @param {number} layerIndex - Índice da camada
 * @param {object} options - Opções de ruído e gradiente
 * @returns {object} Dados do padrão de gradiente com ruído
 */
function createNoiseGradientPattern(id, color1, color2, layerIndex, options = {}) {
    const {
        intensity = 50,
        scale = 50,
        octaves = 3,
        seed = Math.random() * 1000,
        gradientComplexity = 5
    } = options;

    const patternSize = 400; // Tamanho maior para mais detalhes
    const simplex = new SimplexNoise(seed + layerIndex * 234.567);

    // Criar canvas temporário
    const canvas = document.createElement('canvas');
    canvas.width = patternSize;
    canvas.height = patternSize;
    const ctx = canvas.getContext('2d');

    const imageData = ctx.createImageData(patternSize, patternSize);
    const data = imageData.data;

    const centerX = patternSize / 2;
    const centerY = patternSize / 2;
    const maxRadius = patternSize / 2;

    for (let y = 0; y < patternSize; y++) {
        for (let x = 0; x < patternSize; x++) {
            const idx = (y * patternSize + x) * 4;

            // Calcular distância do centro (para gradiente radial)
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const normalizedDistance = Math.min(1, distance / maxRadius);

            // Gerar ruído fractal
            let noiseValue = 0;
            let amplitude = 1;
            let frequency = 1;
            let maxValue = 0;

            for (let o = 0; o < octaves; o++) {
                const sampleX = (x / scale) * frequency;
                const sampleY = (y / scale) * frequency;
                noiseValue += simplex.noise(sampleX, sampleY) * amplitude;
                maxValue += amplitude;
                amplitude *= 0.5;
                frequency *= 2;
            }

            // Normalizar ruído para 0-1
            noiseValue = (noiseValue / maxValue + 1) / 2;

            // Combinar distância radial com ruído para distorção do gradiente
            // intensity controla APENAS a distorção do gradiente, não a variação de cor
            const distortionAmount = (intensity / 100) * 0.6;
            let t = normalizedDistance + (noiseValue - 0.5) * distortionAmount;
            t = Math.max(0, Math.min(1, t));

            // Interpolar cor (SEM variação adicional - gradiente puro)
            const color = interpolateColorRGB(color1, color2, t);

            data[idx] = color.r;
            data[idx + 1] = color.g;
            data[idx + 2] = color.b;
            data[idx + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    const dataUrl = canvas.toDataURL('image/png');

    return {
        id: id,
        dataUrl: dataUrl,
        size: patternSize
    };
}

/**
 * Aplica padrão de gradiente com ruído a uma forma
 * @param {object} svg - Instância SVG.js
 * @param {object} shape - Elemento SVG da forma
 * @param {string} patternId - ID do padrão
 * @param {object} patternData - Dados do padrão
 */
function applyNoiseGradientPattern(svg, shape, patternId, patternData) {
    // Remover padrão existente se já existe
    const existingPattern = svg.defs().findOne(`#${patternId}`);
    if (existingPattern) {
        existingPattern.remove();
    }

    // Criar pattern SVG
    const pattern = svg.defs()
        .pattern(patternData.size, patternData.size)
        .attr('id', patternId)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('patternContentUnits', 'userSpaceOnUse')
        .attr('x', 0)
        .attr('y', 0);

    pattern.image(patternData.dataUrl)
        .size(patternData.size, patternData.size)
        .attr('x', 0)
        .attr('y', 0)
        .attr('preserveAspectRatio', 'none');

    // Aplicar padrão à forma
    shape.attr('fill', `url(#${patternId})`);

    return pattern;
}

/**
 * Varia uma cor em hex adicionando um valor delta
 * @param {string} hexColor - Cor em hex
 * @param {number} delta - Valor de variação (-100 a +100)
 * @returns {string} Nova cor em hex
 */
function varyColor(hexColor, delta) {
    const rgb = hexToRgb(hexColor);

    const r = Math.max(0, Math.min(255, rgb.r + delta));
    const g = Math.max(0, Math.min(255, rgb.g + delta));
    const b = Math.max(0, Math.min(255, rgb.b + delta));

    return rgbToHex(r, g, b);
}

/**
 * Interpola entre duas cores RGB (retorna objeto RGB ao invés de hex)
 * @param {string} color1 - Cor inicial em hex
 * @param {string} color2 - Cor final em hex
 * @param {number} t - Fator de interpolação (0-1)
 * @returns {object} Cor RGB {r, g, b}
 */
function interpolateColorRGB(color1, color2, t) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    return {
        r: Math.round(c1.r + (c2.r - c1.r) * t),
        g: Math.round(c1.g + (c2.g - c1.g) * t),
        b: Math.round(c1.b + (c2.b - c1.b) * t)
    };
}
