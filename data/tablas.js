// tablas.js
function generarTabla() {
    var filas = parseInt(document.getElementById('filas').value);
    var columnas = parseInt(document.getElementById('columnas').value);

    var tabla = '<table>';
    tabla += '<tr>';
    for (var j = 0; j < columnas; j++) {
        tabla += `<th contenteditable="true"></th>`;
    }
    tabla += '</tr>';

    var tiposDatos = ['Altura', 'Distancia', 'Batería', 'Peso'];
    for (var i = 0; i < filas; i++) {
        tabla += '<tr>';
        for (var j = 0; j < columnas; j++) {
            var tipoDato = tiposDatos[Math.floor(Math.random() * tiposDatos.length)];
            tabla += `<td contenteditable="true" data-tipo="${tipoDato}"></td>`;
        }
        tabla += '</tr>';
    }
    tabla += '</table>';
    tabla += '<div class="button-group">';
    tabla += '<button onclick="generateControlCharts()">Generar Gráficas de Control</button>';
    tabla += '</div>';

    document.getElementById('tablaContainer').innerHTML = tabla;

    document.getElementById('generarDiagramaButton').style.display = 'inline-block';
    populateColumnSelects();
    conectarEventos();
}

function generarDatos() {
    var tabla = document.getElementById('tablaContainer').getElementsByTagName('table')[0];
    var filas = tabla.rows.length;

    var tiposDatos = [];
    if (filas > 0) {
        var primeraFila = tabla.rows[0];
        var columnas = primeraFila.cells.length;
        for (var j = 0; j < columnas; j++) {
            var tipoDato = primeraFila.cells[j].textContent.trim();
            tiposDatos.push(tipoDato);
        }
    }

    for (var i = 1; i < filas; i++) {
        var row = tabla.rows[i];
        var columnas = row.cells.length;
        for (var j = 0; j < columnas; j++) {
            var valor;
            if (tiposDatos.length > 0 && tiposDatos[j]) {
                var tipoDato = tiposDatos[j];
                switch (tipoDato) {
                    case 'Altura':
                        valor = Math.floor(Math.random() * (300 - 290 + 1)) + 290;
                        break;
                    case 'Distancia':
                        valor = Math.floor(Math.random() * (2000 - 1990 + 1)) + 1990;
                        break;
                    case 'Batería':
                        valor = Math.floor(Math.random() * (60 - 55 + 1)) + 55;
                        break;
                    case 'Peso':
                        valor = Math.floor(Math.random() * (1500 - 1490 + 1)) + 1490;
                        break;
                    default:
                        valor = Math.floor(Math.random() * 100);
                        break;
                }
            } else {
                valor = Math.floor(Math.random() * 100);
            }
            row.cells[j].textContent = valor;
        }
    }

    var scatterPlotCanvas = document.getElementById('scatterPlotCanvas');
    if (scatterPlotCanvas.scatterChart) {
        generarDiagramaDispersion();
    }
}

function generateControlCharts() {
    var table = document.getElementById('tablaContainer').getElementsByTagName('table')[0];
    var rows = table.rows.length;
    var cols = table.rows[0].cells.length;

    var datasets = [];
    for (var j = 0; j < cols; j++) {
        var data = [];
        for (var i = 1; i < rows; i++) {
            var value = parseFloat(table.rows[i].cells[j].textContent);
            if (!isNaN(value)) {
                data.push(value);
            }
        }
        datasets.push(data);
    }

    var controlChartContainer = document.getElementById('controlChartContainer');
    var rangeChartContainer = document.getElementById('rangeChartContainer');
    controlChartContainer.innerHTML = '';
    rangeChartContainer.innerHTML = '';

    datasets.forEach((data, index) => {
        var canvas = document.createElement('canvas');
        canvas.className = 'controlChartCanvas';
        controlChartContainer.appendChild(canvas);

        var ctx = canvas.getContext('2d');

        var mean = data.reduce((sum, value) => sum + value, 0) / data.length;
        var variance = data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / data.length;
        var stdDev = Math.sqrt(variance);

        var upperControlLimit = mean + 3 * stdDev;
        var lowerControlLimit = mean - 3 * stdDev;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: data.length }, (_, i) => i + 1),
                datasets: [{
                    label: `Variable ${index + 1}`,
                    data: data,
                    borderColor: 'blue',
                    fill: false
                }, {
                    label: 'Límite Superior de Control (UCL)',
                    data: Array(data.length).fill(upperControlLimit),
                    borderColor: 'red',
                    borderDash: [5, 5],
                    fill: false
                }, {
                    label: 'Límite Inferior de Control (LCL)',
                    data: Array(data.length).fill(lowerControlLimit),
                    borderColor: 'red',
                    borderDash: [5, 5],
                    fill: false
                }, {
                    label: 'Media',
                    data: Array(data.length).fill(mean),
                    borderColor: 'green',
                    borderDash: [5, 5],
                    fill: false
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: `Gráfico de Control - Variable ${index + 1}`
                }
            }
        });

        // Gráfico de Rangos Móviles
        var rangeCanvas = document.createElement('canvas');
        rangeCanvas.className = 'rangeChartCanvas';
        rangeChartContainer.appendChild(rangeCanvas);

        var rangeCtx = rangeCanvas.getContext('2d');
        var ranges = [];
        for (let i = 1; i < data.length; i++) {
            ranges.push(Math.abs(data[i] - data[i - 1]));
        }

        var meanRange = ranges.reduce((sum, value) => sum + value, 0) / ranges.length;
        const d2 = 1.128;
        var upperRangeControlLimit = meanRange + 3 * (meanRange / d2);
        var lowerRangeControlLimit = Math.max(0, meanRange - 3 * (meanRange / d2));

        new Chart(rangeCtx, {
            type: 'line',
            data: {
                labels: Array.from({ length: ranges.length }, (_, i) => i + 1),
                datasets: [{
                    label: `Rangos Móviles - Variable ${index + 1}`,
                    data: ranges,
                    borderColor: 'blue',
                    fill: false
                }, {
                    label: 'Límite Superior de Control (UCL)',
                    data: Array(ranges.length).fill(upperRangeControlLimit),
                    borderColor: 'red',
                    borderDash: [5, 5],
                    fill: false
                }, {
                    label: 'Límite Inferior de Control (LCL)',
                    data: Array(ranges.length).fill(lowerRangeControlLimit),
                    borderColor: 'red',
                    borderDash: [5, 5],
                    fill: false
                }, {
                    label: 'Media',
                    data: Array(ranges.length).fill(meanRange),
                    borderColor: 'green',
                    borderDash: [5, 5],
                    fill: false
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: `Gráfico de Rangos Móviles - Variable ${index + 1}`
                }
            }
        });
    });

    document.getElementById('borrarControlChartsButton').style.display = 'inline-block';
}

function borrarControlCharts() {
    document.getElementById('controlChartContainer').innerHTML = '';
    document.getElementById('rangeChartContainer').innerHTML = '';
    document.getElementById('borrarControlChartsButton').style.display = 'none';
}

function linearRegression(x, y) {
    var n = x.length;
    var sumX = x.reduce((a, b) => a + b, 0);
    var sumY = y.reduce((a, b) => a + b, 0);
    var sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    var sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    var intercept = (sumY - slope * sumX) / n;

    return { slope: slope, intercept: intercept };
}

function generarDiagramaDispersion() {
    var table = document.getElementById('tablaContainer').getElementsByTagName('table')[0];
    var rows = table.rows.length;

    var selectX = document.getElementById('selectX');
    var selectY = document.getElementById('selectY');
    var xIndex = selectX.selectedIndex;
    var yIndex = selectY.selectedIndex;

    var dataX = [];
    var dataY = [];

    for (var i = 1; i < rows; i++) {
        var valueX = parseFloat(table.rows[i].cells[xIndex].textContent);
        var valueY = parseFloat(table.rows[i].cells[yIndex].textContent);
        if (!isNaN(valueX) && !isNaN(valueY)) {
            dataX.push(valueX);
            dataY.push(valueY);
        }
    }

    var scatterPlotCanvas = document.getElementById('scatterPlotCanvas');
    var ctx = scatterPlotCanvas.getContext('2d');

    if (scatterPlotCanvas.scatterChart) {
        scatterPlotCanvas.scatterChart.destroy();
    }

    var scatterData = dataX.map((x, i) => ({ x: x, y: dataY[i] }));
    var regression = linearRegression(dataX, dataY);
    var trendlineData = dataX.map(x => ({ x: x, y: regression.slope * x + regression.intercept }));

    scatterPlotCanvas.scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Diagrama de Dispersión',
                data: scatterData,
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 123, 255, 0.5)'
            }, {
                label: 'Línea de Tendencia',
                data: trendlineData,
                type: 'line',
                borderColor: 'red',
                fill: false,
                showLine: true,
                tension: 0,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Diagrama de Dispersión con Línea de Tendencia'
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: selectX.options[xIndex].text
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: selectY.options[yIndex].text
                    }
                }
            }
        }
    });

    var correlation = calculateCorrelation(dataX, dataY);
    document.getElementById('correlationResults').textContent = `Correlación: ${correlation.toFixed(2)}`;

    document.getElementById('borrarDiagramaButton').style.display = 'inline-block';
}

function borrarDiagramaDispersion() {
    var scatterPlotCanvas = document.getElementById('scatterPlotCanvas');
    scatterPlotCanvas.getContext('2d').clearRect(0, 0, scatterPlotCanvas.width, scatterPlotCanvas.height);
    if (scatterPlotCanvas.scatterChart) {
        scatterPlotCanvas.scatterChart.destroy();
    }
    document.getElementById('correlationResults').textContent = '';
    document.getElementById('borrarDiagramaButton').style.display = 'none';
}

function calculateCorrelation(x, y) {
    var n = x.length;
    var sumX = x.reduce((a, b) => a + b, 0);
    var sumY = y.reduce((a, b) => a + b, 0);
    var sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    var sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    var sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    var numerator = (n * sumXY) - (sumX * sumY);
    var denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));

    return numerator / denominator;
}

function populateColumnSelects() {
    var table = document.getElementById('tablaContainer').getElementsByTagName('table')[0];
    var columnas = table.rows[0].cells.length;
    var selectX = document.getElementById('selectX');
    var selectY = document.getElementById('selectY');

    selectX.innerHTML = '';
    selectY.innerHTML = '';

    for (var j = 0; j < columnas; j++) {
        var option = document.createElement('option');
        option.text = `Variable ${j + 1}`;
        selectX.add(option);
        var optionClone = option.cloneNode(true);
        selectY.add(optionClone);
    }
}
