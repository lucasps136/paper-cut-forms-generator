# Paper Cut Forms Generator

Um gerador interativo de formas geométricas com efeito de distorção senoidal, criando padrões artísticos inspirados em papel recortado.

## Descrição

Este projeto permite criar arte generativa através da manipulação de formas geométricas (círculos, quadrados, triângulos e hexágonos) com múltiplas camadas e distorções senoidais. O resultado final são padrões únicos e artísticos que podem ser exportados como SVG.

## Características

- **Múltiplas Formas**: Círculo, Quadrado, Triângulo e Hexágono
- **Camadas Configuráveis**: Controle o número de camadas sobrepostas
- **Distorção Senoidal**: Efeito "warp" personalizável nos eixos X e Y
- **Gradiente de Cores**: Interpolação suave entre duas cores
- **Rotação Dinâmica**: Cada camada pode rotacionar progressivamente
- **Geração Aleatória**: Crie padrões únicos com um clique
- **Exportação SVG**: Salve suas criações em formato vetorial

## Estrutura do Projeto

```
paper-cut-forms-generator/
├── index.html              # Página principal
├── css/
│   └── styles.css         # Estilos da interface
├── js/
│   ├── utils.js           # Funções utilitárias (cores, números)
│   ├── warp.js            # Lógica de distorção senoidal
│   ├── shapes.js          # Geração de formas SVG
│   └── app.js             # Controlador principal e eventos
├── main.html              # Arquivo original (mantido para referência)
└── README.md              # Este arquivo
```

## Módulos JavaScript

### `utils.js`
Funções utilitárias para operações matemáticas e conversão de cores:
- `random()`: Geração de números aleatórios
- `map()`: Mapeamento de valores entre intervalos
- `interpolateColor()`: Interpolação entre cores hexadecimais
- `hexToRgb()`, `rgbToHex()`, `hslToHex()`: Conversões de cores

### `warp.js`
Implementação da distorção senoidal:
- `applyWarpDistortion()`: Aplica distorção em elementos SVG
- `distortCircle()`, `distortRect()`, `distortPath()`: Distorção específica por tipo
- `applyDistortionToPoint()`: Cálculo da distorção em pontos individuais

### `shapes.js`
Geração e manipulação de formas geométricas:
- `initSVG()`: Inicializa o canvas SVG
- `generateShapes()`: Gera as camadas de formas
- `createShape()`: Cria formas individuais
- `downloadSVG()`: Exporta o SVG gerado

### `app.js`
Controle da aplicação e interface:
- `generate()`: Gera forma com parâmetros atuais
- `randomize()`: Gera parâmetros aleatórios
- `updateValues()`: Atualiza displays de valores
- `initEventListeners()`: Configura listeners de eventos

## Como Usar

### Instalação

1. Clone ou baixe este repositório
2. Abra `index.html` em um navegador moderno

Não há dependências externas além do SVG.js (carregado via CDN).

### Controles

- **Forma**: Escolha entre círculo, quadrado, triângulo ou hexágono
- **Camadas**: Define quantas camadas sobrepostas (10-40)
- **Escala**: Tamanho de cada camada (10-40)
- **Chaos Y**: Intensidade da distorção vertical (0-100)
- **Chaos X**: Intensidade da distorção horizontal (0-100)
- **Rotação Máxima**: Ângulo máximo de rotação das camadas (0-180°)
- **Espessura**: Largura das linhas (1-5)
- **Cores**: Defina as cores inicial e final do gradiente

### Botões

- **Gerar**: Regenera a forma com os parâmetros atuais
- **Aleatório**: Gera parâmetros aleatórios para criar um padrão único
- **Download SVG**: Salva a forma atual como arquivo SVG

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- SVG.js (biblioteca para manipulação de SVG)

## Algoritmo de Distorção

A distorção senoidal é aplicada através da seguinte fórmula:

```javascript
x' = x - chaosFactorX * sin(y / rand1)
y' = y - chaosFactorY * sin(x / rand2)
```

Onde:
- `chaosFactorX` e `chaosFactorY` são calculados com base na distância do centro
- `rand1` e `rand2` são valores aleatórios entre 24 e 64
- O resultado cria ondulações orgânicas nas formas

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## Autor

Desenvolvido com arte generativa e JavaScript.
