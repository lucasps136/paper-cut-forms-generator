/**
 * Paper Cut Forms Generator - Noise Texture Generation
 * Gera texturas de ruído procedural usando filtros SVG nativos
 */

/**
 * Cria um filtro de textura que adiciona variação de luminosidade mantendo as cores
 * @param {object} svg - Objeto SVG.js
 * @param {string} id - ID único para o filtro
 * @param {object} options - Opções do filtro
 * @param {number} options.scale - Escala do ruído (10-150)
 * @param {number} options.intensity - Intensidade do ruído (0-100)
 * @param {number} options.octaves - Número de octaves (1-6)
 * @param {number} options.seed - Seed para geração determinística
 * @returns {object} Filtro SVG criado
 */
function createTextureOverlay(svg, id, options = {}) {
    const {
        scale = 50,
        intensity = 30,
        octaves = 3,
        seed = 0
    } = options;

    const baseFrequency = 0.6 / (scale / 10);

    // Criar o filtro manualmente
    const defs = svg.defs();
    const filter = defs.element('filter')
        .attr('id', id)
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%')
        .attr('filterUnits', 'objectBoundingBox');

    // Calcular fator de intensidade (0-100 → 0.0-0.5)
    const intensityFactor = intensity / 200;

    filter.node.innerHTML = `
        <!-- Gerar ruído fractal -->
        <feTurbulence
            type="fractalNoise"
            baseFrequency="${baseFrequency}"
            numOctaves="${octaves}"
            seed="${seed}"
            result="turbulence"/>

        <!-- Converter turbulência para escala de cinza -->
        <feColorMatrix
            in="turbulence"
            type="matrix"
            values="1 0 0 0 0
                    1 0 0 0 0
                    1 0 0 0 0
                    0 0 0 1 0"
            result="grayscale"/>

        <!-- Ajustar brilho do ruído para criar variação sutil -->
        <feComponentTransfer in="grayscale" result="adjustedNoise">
            <feFuncR type="linear" slope="1" intercept="${-0.5 + intensityFactor}"/>
            <feFuncG type="linear" slope="1" intercept="${-0.5 + intensityFactor}"/>
            <feFuncB type="linear" slope="1" intercept="${-0.5 + intensityFactor}"/>
        </feComponentTransfer>

        <!-- Aplicar o ruído à imagem original usando aritmética -->
        <!-- k2 = imagem original, k3 = ruído -->
        <feComposite
            in="SourceGraphic"
            in2="adjustedNoise"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="${intensityFactor * 2}"
            k4="0"
            result="textured"/>

        <!-- CRÍTICO: Clipar o resultado pelos limites da forma original -->
        <!-- Isso garante que o ruído apareça APENAS dentro da forma -->
        <feComposite
            in="textured"
            in2="SourceAlpha"
            operator="in"
            result="final"/>
    `;

    return filter;
}
