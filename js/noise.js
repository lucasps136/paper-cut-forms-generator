/**
 * Paper Cut Forms Generator - Noise Texture Generation (Vetorial)
 * Gera texturas de ruído vetorial usando SVG feTurbulence
 */

/**
 * Cria filtro SVG de textura vetorial usando feTurbulence
 * @param {object} svg - Instância SVG.js
 * @param {string} filterId - ID único para o filtro
 * @param {object} options - Opções de textura
 * @param {number} options.scale - Escala da textura (20-200, padrão 80)
 * @param {number} options.intensity - Intensidade da textura (0-100, padrão 50)
 * @param {number} options.octaves - Número de octaves (1-6, padrão 4)
 * @param {number} options.seed - Seed para textura consistente
 * @returns {object} Filtro SVG criado
 */
function createVectorTextureFilter(svg, filterId, options = {}) {
    const {
        scale = 80,
        intensity = 50,
        octaves = 4,
        seed = 12345
    } = options;

    // Remover filtro existente se já existe
    const existingFilter = svg.defs().findOne(`#${filterId}`);
    if (existingFilter) {
        existingFilter.remove();
    }

    // Converter escala para baseFrequency (inversamente proporcional)
    // scale 20 (máximo zoom) → baseFrequency ~1.0
    // scale 200 (mínimo zoom) → baseFrequency ~0.1
    const baseFrequency = (1 / scale) * 20;

    // Converter intensidade para slope (0-100 → 0-0.3)
    const slope = (intensity / 100) * 0.3;
    const intercept = 0.5 - (slope * 0.5); // Centralizar em 0.5

    // Criar filtro
    const filter = svg.defs().element('filter');
    filter.attr({
        id: filterId,
        x: '-20%',
        y: '-20%',
        width: '140%',
        height: '140%'
    });

    // 1. Gerar ruído fractal
    filter.element('feTurbulence').attr({
        type: 'fractalNoise',
        baseFrequency: baseFrequency,
        numOctaves: octaves,
        seed: seed,
        result: 'turbulence'
    });

    // 2. Converter para escala de cinza
    filter.element('feColorMatrix').attr({
        in: 'turbulence',
        type: 'saturate',
        values: '0',
        result: 'grayscale'
    });

    // 3. Ajustar intensidade
    const componentTransfer = filter.element('feComponentTransfer');
    componentTransfer.attr({
        in: 'grayscale',
        result: 'adjusted'
    });

    ['feFuncR', 'feFuncG', 'feFuncB'].forEach(func => {
        componentTransfer.element(func).attr({
            type: 'linear',
            slope: slope,
            intercept: intercept
        });
    });

    // 4. Misturar com a forma original
    filter.element('feBlend').attr({
        in: 'SourceGraphic',
        in2: 'adjusted',
        mode: 'multiply'
    });

    return filter;
}

/**
 * CÓDIGO ANTIGO REMOVIDO - Agora usamos feTurbulence vetorial
 * Mantido apenas SimplexNoise para compatibilidade temporária
 */

/**
 * Gerador de ruído Simplex 2D
 * Baseado no algoritmo de Ken Perlin
 */
class SimplexNoise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
        this.p = [];
        for(let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(this.random() * 256);
        }
        this.perm = [];
        for(let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    }

    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    dot(g, x, y) {
        return g[0] * x + g[1] * y;
    }

    noise(xin, yin) {
        const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

        let n0, n1, n2;
        let s = (xin + yin) * F2;
        let i = Math.floor(xin + s);
        let j = Math.floor(yin + s);
        let t = (i + j) * G2;
        let X0 = i - t;
        let Y0 = j - t;
        let x0 = xin - X0;
        let y0 = yin - Y0;

        let i1, j1;
        if(x0 > y0) {
            i1 = 1; j1 = 0;
        } else {
            i1 = 0; j1 = 1;
        }

        let x1 = x0 - i1 + G2;
        let y1 = y0 - j1 + G2;
        let x2 = x0 - 1.0 + 2.0 * G2;
        let y2 = y0 - 1.0 + 2.0 * G2;

        let ii = i & 255;
        let jj = j & 255;
        let gi0 = this.perm[ii + this.perm[jj]] % 12;
        let gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        let gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

        let t0 = 0.5 - x0*x0 - y0*y0;
        if(t0 < 0) n0 = 0.0;
        else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
        }

        let t1 = 0.5 - x1*x1 - y1*y1;
        if(t1 < 0) n1 = 0.0;
        else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
        }

        let t2 = 0.5 - x2*x2 - y2*y2;
        if(t2 < 0) n2 = 0.0;
        else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
        }

        return 70.0 * (n0 + n1 + n2);
    }
}

/**
 * Gera uma textura de ruído SVG
 * @param {string} id - ID único para o pattern
 * @param {string} baseColor - Cor base em formato hex
 * @param {object} options - Opções de geração
 * @param {number} options.scale - Escala do ruído (quanto menor, mais detalhado)
 * @param {number} options.intensity - Intensidade do ruído (0-100)
 * @param {number} options.octaves - Número de octaves para ruído fractal
 * @param {number} options.seed - Seed para geração determinística
 * @returns {SVGPatternElement} Elemento pattern SVG
 */
function createNoisePattern(id, baseColor, options = {}) {
    const {
        scale = 50,
        intensity = 50,
        octaves = 3,
        seed = Math.random() * 1000,
        patternSize = 200 // Permite customizar o tamanho
    } = options;
    const simplex = new SimplexNoise(seed);

    // Criar canvas temporário para gerar a textura
    const canvas = document.createElement('canvas');
    canvas.width = patternSize;
    canvas.height = patternSize;
    const ctx = canvas.getContext('2d');

    // Converter cor hex para RGB
    const rgb = hexToRgb(baseColor);

    // Gerar ruído
    const imageData = ctx.createImageData(patternSize, patternSize);
    const data = imageData.data;

    for (let y = 0; y < patternSize; y++) {
        for (let x = 0; x < patternSize; x++) {
            const idx = (y * patternSize + x) * 4;

            // Ruído fractal com múltiplas octaves
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

            // Normalizar para 0-1
            noiseValue = (noiseValue / maxValue + 1) / 2;

            // Aplicar intensidade (0.3 para normalizar com gradiente)
            const effect = (noiseValue - 0.5) * (intensity / 100) * 0.3;

            // Aplicar ruído à cor base
            data[idx] = Math.max(0, Math.min(255, rgb.r + effect * 255));
            data[idx + 1] = Math.max(0, Math.min(255, rgb.g + effect * 255));
            data[idx + 2] = Math.max(0, Math.min(255, rgb.b + effect * 255));
            data[idx + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    // Converter canvas para data URL
    const dataUrl = canvas.toDataURL('image/png');

    return {
        id: id,
        dataUrl: dataUrl,
        size: patternSize
    };
}

/**
 * Cria um filtro SVG de turbulência como alternativa mais leve
 * @param {string} id - ID único para o filtro
 * @param {object} options - Opções do filtro
 * @returns {object} Dados do filtro
 */
function createTurbulenceFilter(id, options = {}) {
    const {
        baseFrequency = 0.05,
        numOctaves = 3,
        seed = 0,
        type = 'fractalNoise'
    } = options;

    return {
        id: id,
        baseFrequency: baseFrequency,
        numOctaves: numOctaves,
        seed: seed,
        type: type
    };
}

/**
 * Aplica textura de ruído a uma forma SVG
 * @param {object} shape - Elemento SVG da forma
 * @param {string} patternId - ID do pattern de ruído
 * @param {string} baseColor - Cor base
 * @param {number} opacity - Opacidade da textura (0-1)
 */
function applyNoiseToShape(shape, patternId, baseColor, opacity = 0.3) {
    // Aplicar cor base
    shape.attr('fill', baseColor);

    // Criar um segundo elemento com a textura
    const textureShape = shape.clone();
    textureShape
        .attr('fill', `url(#${patternId})`)
        .attr('opacity', opacity)
        .attr('mix-blend-mode', 'overlay');

    return textureShape;
}

/**
 * Converte cor hexadecimal para RGB
 * @param {string} hex - Cor em formato hex
 * @returns {object} Objeto com propriedades r, g, b
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}
