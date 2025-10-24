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

    const baseFrequency = 0.5 / (scale / 10);

    // Criar o filtro manualmente
    const defs = svg.defs();
    const filter = defs.element('filter')
        .attr('id', id)
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%')
        .attr('filterUnits', 'objectBoundingBox');

    // Calcular range de variação baseado na intensidade
    // Intensidade 0 = sem variação (0.5 a 0.5)
    // Intensidade 100 = variação máxima (0 a 1)
    const variation = intensity / 100 * 0.5;
    const minBrightness = 0.5 - variation;
    const maxBrightness = 0.5 + variation;

    filter.node.innerHTML = `
        <!-- Gerar ruído fractal -->
        <feTurbulence
            type="fractalNoise"
            baseFrequency="${baseFrequency}"
            numOctaves="${octaves}"
            seed="${seed}"
            result="turbulence"/>

        <!-- Converter para escala de cinza (luminância) -->
        <feColorMatrix
            in="turbulence"
            type="matrix"
            values="0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0.33 0.33 0.33 0 0
                    0    0    0    1 0"
            result="grayscale"/>

        <!-- Normalizar ruído para range de variação desejado -->
        <!-- Range: ${minBrightness} (escuro) a ${maxBrightness} (claro) -->
        <feComponentTransfer in="grayscale" result="noiseMap">
            <feFuncR type="linear" slope="${variation * 2}" intercept="${minBrightness}"/>
            <feFuncG type="linear" slope="${variation * 2}" intercept="${minBrightness}"/>
            <feFuncB type="linear" slope="${variation * 2}" intercept="${minBrightness}"/>
        </feComponentTransfer>

        <!-- Multiplicar cor original pelo mapa de ruído -->
        <!-- Valores < 0.5 escurecem, valores > 0.5 clareiam -->
        <feBlend
            in="SourceGraphic"
            in2="noiseMap"
            mode="multiply"
            result="multiplied"/>

        <!-- Adicionar de volta a cor original para balancear -->
        <feBlend
            in="multiplied"
            in2="SourceGraphic"
            mode="screen"
            result="blended"/>

        <!-- Mix entre resultado e original baseado na intensidade -->
        <feComposite
            in="blended"
            in2="SourceGraphic"
            operator="arithmetic"
            k1="0"
            k2="${0.5 + variation}"
            k3="${0.5 - variation}"
            k4="0"
            result="mixed"/>

        <!-- Clipar aos limites da forma -->
        <feComposite
            in="mixed"
            in2="SourceAlpha"
            operator="in"
            result="final"/>
    `;

    return filter;
}
