/**
 * Paper Cut Forms Generator - Utility Functions
 * Funções utilitárias para manipulação de cores, números e conversões
 */

/**
 * Gera número aleatório entre min e max
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {boolean} float - Se true, retorna float, senão retorna inteiro
 * @returns {number} Número aleatório
 */
function random(min, max, float = false) {
    const val = Math.random() * (max - min) + min;
    return float ? val : Math.floor(val);
}

/**
 * Mapeia um valor de um intervalo para outro
 * @param {number} value - Valor a ser mapeado
 * @param {number} start1 - Início do intervalo original
 * @param {number} stop1 - Fim do intervalo original
 * @param {number} start2 - Início do novo intervalo
 * @param {number} stop2 - Fim do novo intervalo
 * @returns {number} Valor mapeado
 */
function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

/**
 * Interpola entre duas cores hexadecimais
 * @param {string} color1 - Cor inicial em formato hex (#RRGGBB)
 * @param {string} color2 - Cor final em formato hex (#RRGGBB)
 * @param {number} t - Fator de interpolação (0-1)
 * @returns {string} Cor interpolada em formato hex
 */
function interpolateColor(color1, color2, t) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);

    return rgbToHex(r, g, b);
}

/**
 * Converte cor hexadecimal para RGB
 * @param {string} hex - Cor em formato hex (#RRGGBB)
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

/**
 * Converte RGB para cor hexadecimal
 * @param {number} r - Componente vermelho (0-255)
 * @param {number} g - Componente verde (0-255)
 * @param {number} b - Componente azul (0-255)
 * @returns {string} Cor em formato hex (#RRGGBB)
 */
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Converte HSL para cor hexadecimal
 * @param {number} h - Matiz (0-360)
 * @param {number} s - Saturação (0-100)
 * @param {number} l - Luminosidade (0-100)
 * @returns {string} Cor em formato hex (#RRGGBB)
 */
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
