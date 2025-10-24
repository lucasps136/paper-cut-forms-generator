/**
 * Paper Cut Forms Generator - Noise Texture Generation
 * Gera texturas de ruído procedural usando filtros SVG nativos
 */

/**
 * Cria um filtro de ruído SVG nativo usando feTurbulence
 * @param {object} svg - Objeto SVG.js
 * @param {string} id - ID único para o filtro
 * @param {object} options - Opções do filtro
 * @param {number} options.scale - Escala do ruído (10-150)
 * @param {number} options.intensity - Intensidade do ruído (0-100)
 * @param {number} options.octaves - Número de octaves (1-6)
 * @param {number} options.seed - Seed para geração determinística
 * @returns {object} Filtro SVG criado
 */
function createNoiseFilter(svg, id, options = {}) {
    const {
        scale = 50,
        intensity = 30,
        octaves = 3,
        seed = 0
    } = options;

    // Calcular baseFrequency a partir da escala
    // Escala maior = frequência menor (padrões maiores)
    const baseFrequency = 0.5 / (scale / 10);

    // Calcular a intensidade do deslocamento
    // Intensidade 0-100 -> escala 0-20
    const displacementScale = (intensity / 100) * 15;

    // Criar o filtro
    const filter = svg.defs().filter().attr('id', id);

    // feTurbulence - gera o ruído
    filter.node.innerHTML = `
        <feTurbulence
            type="fractalNoise"
            baseFrequency="${baseFrequency}"
            numOctaves="${octaves}"
            seed="${seed}"
            result="turbulence"/>
        <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="${displacementScale}"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displacement"/>
        <feColorMatrix
            in="displacement"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"/>
    `;

    return filter;
}

/**
 * Cria um filtro de textura mais sutil para sobreposição
 * @param {object} svg - Objeto SVG.js
 * @param {string} id - ID único para o filtro
 * @param {object} options - Opções do filtro
 * @returns {object} Filtro SVG criado
 */
function createTextureOverlay(svg, id, options = {}) {
    const {
        scale = 50,
        intensity = 30,
        octaves = 3,
        seed = 0
    } = options;

    const baseFrequency = 0.8 / (scale / 10);

    const filter = svg.defs().filter().attr('id', id);

    filter.node.innerHTML = `
        <feTurbulence
            type="fractalNoise"
            baseFrequency="${baseFrequency}"
            numOctaves="${octaves}"
            seed="${seed}"
            result="turbulence"/>
        <feColorMatrix
            in="turbulence"
            type="saturate"
            values="0"
            result="grayscale"/>
        <feComponentTransfer in="grayscale" result="contrast">
            <feFuncR type="linear" slope="3" intercept="-1"/>
            <feFuncG type="linear" slope="3" intercept="-1"/>
            <feFuncB type="linear" slope="3" intercept="-1"/>
        </feComponentTransfer>
        <feBlend
            in="SourceGraphic"
            in2="contrast"
            mode="overlay"
            result="blend"/>
        <feComponentTransfer in="blend">
            <feFuncA type="linear" slope="1" intercept="0"/>
        </feComponentTransfer>
    `;

    return filter;
}
