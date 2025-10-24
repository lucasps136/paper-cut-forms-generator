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

    // Criar o filtro manualmente
    const defs = svg.defs();
    const filter = defs.element('filter').attr('id', id);

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
 * Cria um filtro de textura que varia a luminosidade baseado em ruído
 * Mantém a cor base de cada forma e adiciona variação de luz/sombra
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

    const baseFrequency = 1.0 / (scale / 10);

    // Converter intensidade (0-100) para escala de variação (0.8 a 1.2)
    // Intensidade 0 = sem variação, Intensidade 100 = muita variação
    const variation = 0.2 * (intensity / 100);
    const minBrightness = 1 - variation;
    const maxBrightness = 1 + variation;

    // Criar o elemento filter manualmente usando SVG nativo
    const defs = svg.defs();
    const filter = defs.element('filter').attr('id', id);

    filter.node.innerHTML = `
        <!-- Gerar ruído fractal -->
        <feTurbulence
            type="fractalNoise"
            baseFrequency="${baseFrequency}"
            numOctaves="${octaves}"
            seed="${seed}"
            result="turbulence"/>

        <!-- Pegar apenas o canal R do ruído e normalizar -->
        <feColorMatrix
            in="turbulence"
            type="matrix"
            values="1 0 0 0 0
                    1 0 0 0 0
                    1 0 0 0 0
                    0 0 0 1 0"
            result="noise"/>

        <!-- Ajustar o range do ruído baseado na intensidade -->
        <feComponentTransfer in="noise" result="adjustedNoise">
            <feFuncR type="linear" slope="${intensity / 50}" intercept="${0.5 - intensity / 100}"/>
            <feFuncG type="linear" slope="${intensity / 50}" intercept="${0.5 - intensity / 100}"/>
            <feFuncB type="linear" slope="${intensity / 50}" intercept="${0.5 - intensity / 100}"/>
        </feComponentTransfer>

        <!-- Multiplicar a cor original pelo ruído -->
        <feBlend in="SourceGraphic" in2="adjustedNoise" mode="multiply" result="darkened"/>

        <!-- Adicionar de volta luz para não ficar muito escuro -->
        <feComposite
            in="darkened"
            in2="SourceGraphic"
            operator="arithmetic"
            k1="0"
            k2="0.7"
            k3="0.3"
            k4="0"
            result="final"/>
    `;

    return filter;
}
