/**
 * Paper Cut Forms Generator - Warp Distortion
 * Aplica distorção senoidal nas formas SVG para criar efeito "paper cut"
 */

// Dimensões do canvas SVG
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

/**
 * Aplica distorção senoidal em um elemento SVG
 * @param {SVGElement} element - Elemento SVG contendo as formas
 * @param {number} chaosX - Intensidade da distorção no eixo X (0-100)
 * @param {number} chaosY - Intensidade da distorção no eixo Y (0-100)
 */
function applyWarpDistortion(element, chaosX, chaosY) {
    const rand1 = Math.round(random(24, 64));
    const rand2 = Math.round(random(24, 64));

    // Pega todos os elementos com coordenadas
    const shapes = element.querySelectorAll('circle, rect, path');

    shapes.forEach(shape => {
        const tagName = shape.tagName.toLowerCase();

        if (tagName === 'circle') {
            distortCircle(shape, chaosX, chaosY, rand1, rand2);
        } else if (tagName === 'rect') {
            distortRect(shape, chaosX, chaosY, rand1, rand2);
        } else if (tagName === 'path') {
            distortPath(shape, chaosX, chaosY, rand1, rand2);
        }
    });
}

/**
 * Distorce um círculo convertendo-o em path
 * @param {SVGCircleElement} shape - Elemento círculo
 * @param {number} chaosX - Intensidade da distorção no eixo X
 * @param {number} chaosY - Intensidade da distorção no eixo Y
 * @param {number} rand1 - Valor aleatório para variação senoidal
 * @param {number} rand2 - Valor aleatório para variação senoidal
 */
function distortCircle(shape, chaosX, chaosY, rand1, rand2) {
    const cx = parseFloat(shape.getAttribute('cx') || 0);
    const cy = parseFloat(shape.getAttribute('cy') || 0);
    const r = parseFloat(shape.getAttribute('r') || 0);

    // Criar path circular com distorção
    const points = [];
    const numPoints = 64;

    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        let x = cx + Math.cos(angle) * r;
        let y = cy + Math.sin(angle) * r;

        // Aplicar distorção senoidal
        const distorted = applyDistortionToPoint(x, y, chaosX, chaosY, rand1, rand2);
        points.push(`${distorted.x},${distorted.y}`);
    }

    // Substituir círculo por path
    replaceShapeWithPath(shape, points);
}

/**
 * Distorce um retângulo convertendo-o em path
 * @param {SVGRectElement} shape - Elemento retângulo
 * @param {number} chaosX - Intensidade da distorção no eixo X
 * @param {number} chaosY - Intensidade da distorção no eixo Y
 * @param {number} rand1 - Valor aleatório para variação senoidal
 * @param {number} rand2 - Valor aleatório para variação senoidal
 */
function distortRect(shape, chaosX, chaosY, rand1, rand2) {
    const x = parseFloat(shape.getAttribute('x') || 0);
    const y = parseFloat(shape.getAttribute('y') || 0);
    const w = parseFloat(shape.getAttribute('width') || 0);
    const h = parseFloat(shape.getAttribute('height') || 0);

    // Criar path retangular com distorção
    const corners = [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h]
    ];

    const points = [];
    corners.forEach(corner => {
        const distorted = applyDistortionToPoint(corner[0], corner[1], chaosX, chaosY, rand1, rand2);
        points.push(`${distorted.x},${distorted.y}`);
    });

    replaceShapeWithPath(shape, points);
}

/**
 * Distorce um path existente
 * @param {SVGPathElement} shape - Elemento path
 * @param {number} chaosX - Intensidade da distorção no eixo X
 * @param {number} chaosY - Intensidade da distorção no eixo Y
 * @param {number} rand1 - Valor aleatório para variação senoidal
 * @param {number} rand2 - Valor aleatório para variação senoidal
 */
function distortPath(shape, chaosX, chaosY, rand1, rand2) {
    const d = shape.getAttribute('d');
    if (!d) return;

    // Parse path e aplica distorção
    const newD = transformPathData(d, chaosX, chaosY, rand1, rand2);
    shape.setAttribute('d', newD);
}

/**
 * Aplica distorção senoidal em um ponto
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @param {number} chaosX - Intensidade da distorção no eixo X
 * @param {number} chaosY - Intensidade da distorção no eixo Y
 * @param {number} rand1 - Valor aleatório para variação senoidal
 * @param {number} rand2 - Valor aleatório para variação senoidal
 * @returns {object} Objeto com coordenadas x e y distorcidas
 */
function applyDistortionToPoint(x, y, chaosX, chaosY, rand1, rand2) {
    const distanceFromYCenter = CANVAS_HEIGHT / 2 - y;
    const distanceFromXCenter = CANVAS_WIDTH / 2 - x;
    const chaosFactorX = map(distanceFromXCenter, 400, -400, 1, chaosX);
    const chaosFactorY = map(distanceFromYCenter, 400, -400, 10, chaosY);

    const newX = x - chaosFactorX * Math.sin(y / rand1);
    const newY = y - chaosFactorY * Math.sin(x / rand2);

    return { x: newX, y: newY };
}

/**
 * Transforma os dados de um path SVG aplicando distorção
 * @param {string} d - String com comandos do path
 * @param {number} chaosX - Intensidade da distorção no eixo X
 * @param {number} chaosY - Intensidade da distorção no eixo Y
 * @param {number} rand1 - Valor aleatório para variação senoidal
 * @param {number} rand2 - Valor aleatório para variação senoidal
 * @returns {string} String com comandos do path distorcido
 */
function transformPathData(d, chaosX, chaosY, rand1, rand2) {
    // Parse comandos SVG path
    const commands = d.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi);
    if (!commands) return d;

    let newPath = '';

    commands.forEach(cmd => {
        const type = cmd[0];
        const coords = cmd.slice(1).trim().split(/[\s,]+/).filter(c => c).map(parseFloat);

        if (type === 'M' || type === 'L') {
            if (coords.length >= 2) {
                const distorted = applyDistortionToPoint(coords[0], coords[1], chaosX, chaosY, rand1, rand2);
                newPath += `${type}${distorted.x},${distorted.y} `;
            }
        } else if (type === 'Z') {
            newPath += 'Z ';
        } else {
            newPath += cmd + ' ';
        }
    });

    return newPath.trim();
}

/**
 * Substitui uma forma SVG por um path
 * @param {SVGElement} shape - Elemento a ser substituído
 * @param {Array<string>} points - Array de pontos no formato "x,y"
 */
function replaceShapeWithPath(shape, points) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${points.join(' L ')} Z`);
    path.setAttribute('fill', shape.getAttribute('fill') || 'none');
    path.setAttribute('stroke', shape.getAttribute('stroke') || 'none');
    path.setAttribute('stroke-width', shape.getAttribute('stroke-width') || '1');
    path.setAttribute('opacity', shape.getAttribute('opacity') || '1');
    path.setAttribute('stroke-linecap', shape.getAttribute('stroke-linecap') || 'butt');

    shape.parentNode.replaceChild(path, shape);
}
