/**
 * Paper Cut Forms Generator - Noise Texture Generation
 * Gera texturas de ruído procedural usando filtros SVG nativos
 */

/**
 * Cria um filtro de textura simples que adiciona ruído mantendo as cores
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

    const baseFrequency = 0.8 / (scale / 10);

    // Criar o filtro manualmente
    const defs = svg.defs();
    const filter = defs.element('filter').attr('id', id);

    // Calcular opacidade baseada na intensidade (quanto maior, mais visível a textura)
    const textureOpacity = intensity / 100;

    filter.node.innerHTML = `
        <feTurbulence
            type="fractalNoise"
            baseFrequency="${baseFrequency}"
            numOctaves="${octaves}"
            seed="${seed}"
            result="turbulence"/>
        <feColorMatrix
            in="turbulence"
            type="luminanceToAlpha"
            result="alpha"/>
        <feComponentTransfer in="alpha" result="texture">
            <feFuncA type="table" tableValues="0 ${textureOpacity}"/>
        </feComponentTransfer>
        <feBlend
            in="SourceGraphic"
            in2="texture"
            mode="overlay"/>
    `;

    return filter;
}
