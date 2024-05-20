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
    tabla += '<button onclick="borrarTabla()">Borrar Tabla</button>';
    tabla += '<span style="margin-left: 10px;"></span>';
    tabla += '<button onclick="generateControlCharts()">Generar Gráficas de Control</button>';
    tabla += '<button onclick="borrarControlCharts()" id="borrarControlChartsButton" style="display: none;">Borrar Gráficas</button>';
    tabla += '</div>';

    document.getElementById('tablaContainer').innerHTML = tabla;

    // Mostrar botón de generar diagrama de dispersión
    document.getElementById('generarDiagramaButton').style.display = 'inline-block';

    // Poblar selects para el diagrama de dispersión
    populateColumnSelects();
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
                        valor = Math.floor(Math.random() * (120 - 110 + 1)) + 110;
                        break;
                    case 'Peso':
                        valor = Math.floor(Math.random() * (2000 - 1990 + 1)) + 1990;
                        break;
                    default:
                        valor = Math.round((Math.random() * 100) * 10) / 10;
                }
            } else {
                valor = Math.round((Math.random() * 100) * 10) / 10;
            }
            row.cells[j].textContent = valor;
        }
    }
}

function borrarTabla() {
    document.getElementById('tablaContainer').innerHTML = '';
    borrarControlCharts();
    document.getElementById('generarDiagramaButton').style.display = 'none';
    document.getElementById('scatterPlotContainer').style.display = 'none';
}

function generateControlCharts() {
    borrarControlCharts();
    const tabla = document.querySelector('#tablaContainer table');
    if (!tabla) return;
    const columnas = tabla.rows[0].cells.length;
    const controlChartContainer = document.getElementById('controlChartContainer');
    for (let i = 0; i < columnas; i++) {
        const canvasObservaciones = document.createElement('canvas');
        canvasObservaciones.id = 'controlChartCanvas_' + i;
        controlChartContainer.appendChild(canvasObservaciones);
        const canvasRangos = document.createElement('canvas');
        canvasRangos.id = 'rangeChartCanvas_' + i;
        controlChartContainer.appendChild(canvasRangos);
    }
    for (let i = 0; i < columnas; i++) {
        generateControlChart(i);
        generateRangeChart(i);
    }
    document.getElementById('borrarControlChartsButton').style.display = 'inline-block';
}

function borrarControlCharts() {
    const controlChartContainer = document.getElementById('controlChartContainer');
    controlChartContainer.innerHTML = '';
    document.getElementById('borrarControlChartsButton').style.display = 'none';
}

function generateControlChart(columnIndex) {
    const tabla = document.querySelector('#tablaContainer table');
    const data = [];
    for (let i = 1; i < tabla.rows.length; i++) {
        const cellValue = parseFloat(tabla.rows[i].cells[columnIndex].textContent.trim());
        if (!isNaN(cellValue)) {
            data.push(cellValue);
        }
    }
    if (data.length === 0) {
        console.error('No hay suficientes datos válidos para calcular los límites de control.');
        return;
    }
    const ranges = [];
    for (let i = 1; i < data.length; i++) {
        ranges.push(Math.abs(data[i] - data[i - 1]));
    }
    const meanRange = ranges.reduce((sum, value) => sum + value, 0) / ranges.length;
    const d2 = 1.128;
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    const UCLx = mean + 3 * (meanRange / d2);
    const LCLx = mean - 3 * (meanRange / d2);

    let canvas = document.getElementById('controlChartCanvas_' + columnIndex);
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'controlChartCanvas_' + columnIndex;
        document.getElementById('controlChartContainer').appendChild(canvas);
    }

    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map((_, i) => i + 1),
            datasets: [
                {
                    label: 'Observaciones',
                    data: data,
                    borderColor: 'blue',
                    fill: false,
                    borderWidth: 1,
                },
                {
                    label: 'Límite Superior de Control',
                    data: new Array(data.length).fill(UCLx),
                    borderColor: 'red',
                    borderDash: [5, 5],
                    fill: false,
                    borderWidth: 1,
                },
                {
                    label: 'Límite Inferior de Control',
                    data: new Array(data.length).fill(LCLx),
                    borderColor: 'red',
                    borderDash: [5, 5],
                    fill: false,
                    borderWidth: 1,
                },
                {
                    label: 'Línea Central',
                    data: new Array(data.length).fill(mean),
                    borderColor: 'green',
                    borderDash: [5, 5],
                    fill: false,
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: `Gráfico de Control - Columna ${columnIndex + 1}`,
            },
        },
    });
}

function generateRangeChart(columnIndex) {
    const tabla = document.querySelector('#tablaContainer table');
    const data = [];
    for (let i = 1; i < tabla.rows.length; i++) {
        const cellValue = parseFloat(tabla.rows[i].cells[columnIndex].textContent.trim());
        if (!isNaN(cellValue)) {
            data.push(cellValue);
        }
    }
    if (data.length < 2) {
        console.error('No hay suficientes datos válidos para calcular los rangos.');
        return;
    }
    const ranges = [];
    for (let i = 1; i < data.length; i++) {
        ranges.push(Math.abs(data[i] - data[i - 1]));
    }
    const meanRange = ranges.reduce((sum, value) => sum + value, 0) / ranges.length;
    const D3 = 0;
    const D4 = 2.114;
    const UCLr = D4 * meanRange;
    const LCLr = D3 * meanRange;

    let canvas = document.getElementById('rangeChartCanvas_' + columnIndex);
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'rangeChartCanvas_' + columnIndex;
        document.getElementById('controlChartContainer').appendChild(canvas);
    }

    canvas.width = 400;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ranges.map((_, i) => i + 1),
            datasets: [
                {
                    label: 'Rangos',
                    data: ranges,
                    borderColor: 'blue',
                    fill: false,
                    borderWidth: 1,
                },
                {
                    label: 'Límite Superior de Control',
                    data: new Array(ranges.length).fill(UCLr),
                    borderColor: 'red',
                    borderDash: [5, 5],
                    fill: false,
                    borderWidth: 1,
                },
                {
                    label: 'Límite Inferior de Control',
                    data: new Array(ranges.length).fill(LCLr),
                    borderColor: 'red',
                    borderDash: [5, 5],
                    fill: false,
                    borderWidth: 1,
                },
                {
                    label: 'Línea Central',
                    data: new Array(ranges.length).fill(meanRange),
                    borderColor: 'green',
                    borderDash: [5, 5],
                    fill: false,
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: `Gráfico de Rangos - Columna ${columnIndex + 1}`,
            },
        },
    });
}

function populateColumnSelects() {
    const tabla = document.querySelector('#tablaContainer table');
    if (!tabla) return;

    const selectX = document.getElementById('selectX');
    const selectY = document.getElementById('selectY');
    selectX.innerHTML = '';
    selectY.innerHTML = '';

    const columns = tabla.rows[0].cells.length;
    for (let i = 0; i < columns; i++) {
        const columnName = tabla.rows[0].cells[i].textContent.trim() || `Columna ${i + 1}`;
        const optionX = document.createElement('option');
        const optionY = document.createElement('option');
        optionX.value = i;
        optionX.textContent = columnName;
        optionY.value = i;
        optionY.textContent = columnName;
        selectX.appendChild(optionX);
        selectY.appendChild(optionY);
    }
}


/* function generarDiagramaDispersión() {
    const tabla = document.querySelector('#tablaContainer table');
    if (!tabla) return;

    const selectX = document.getElementById('selectX');
    const selectY = document.getElementById('selectY');
    const colX = parseInt(selectX.value);
    const colY = parseInt(selectY.value);

    const dataX = [];
    const dataY = [];

    for (let i = 1; i < tabla.rows.length; i++) {
        const valX = parseFloat(tabla.rows[i].cells[colX].textContent.trim());
        const valY = parseFloat(tabla.rows[i].cells[colY].textContent.trim());
        if (!isNaN(valX) && !isNaN(valY)) {
            dataX.push(valX);
            dataY.push(valY);
        }
    }

    const ctx = document.getElementById('scatterPlotCanvas').getContext('2d');
    const scatterData = {
        datasets: [{
            label: 'Datos',
            data: dataX.map((x, i) => ({ x, y: dataY[i] })),
            backgroundColor: 'blue'
        }]
    };

    const scatterPlot = new Chart(ctx, {
        type: 'scatter',
        data: scatterData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `X: ${context.raw.x}, Y: ${context.raw.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: selectX.options[selectX.selectedIndex].text
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: selectY.options[selectY.selectedIndex].text
                    }
                }
            }
        }
    });

    // Calculando la línea de tendencia
    const n = dataX.length;
    const sumX = dataX.reduce((a, b) => a + b, 0);
    const sumY = dataY.reduce((a, b) => a + b, 0);
    const sumXY = dataX.reduce((sum, x, i) => sum + x * dataY[i], 0);
    const sumX2 = dataX.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const regressionLine = dataX.map(x => ({ x, y: slope * x + intercept }));
    scatterPlot.data.datasets.push({
        label: 'Línea de Tendencia',
        data: regressionLine,
        type: 'line',
        borderColor: 'red',
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
    });
    scatterPlot.update();

    // Calculando el coeficiente de correlación
    const meanX = sumX / n;
    const meanY = sumY / n;
    const ssXX = dataX.reduce((sum, x) => sum + (x - meanX) * (x - meanX), 0);
    const ssYY = dataY.reduce((sum, y) => sum + (y - meanY) * (y - meanY), 0);
    const ssXY = dataX.reduce((sum, x, i) => sum + (x - meanX) * (dataY[i] - meanY), 0);

    const r = ssXY / Math.sqrt(ssXX * ssYY);
    const r2 = r * r;

    document.getElementById('correlationResults').innerHTML = `
        <p>Coeficiente de Correlación (r): ${r.toFixed(4)}</p>
        <p>Coeficiente de Determinación (r²): ${r2.toFixed(4)}</p>
    `;
} */

function generarDiagramaDispersion() {
    const tabla = document.querySelector('#tablaContainer table');
    if (!tabla) return;

    const selectX = document.getElementById('selectX');
    const selectY = document.getElementById('selectY');
    const colX = parseInt(selectX.value);
    const colY = parseInt(selectY.value);

    const dataX = [];
    const dataY = [];

    for (let i = 1; i < tabla.rows.length; i++) {
        const valX = parseFloat(tabla.rows[i].cells[colX].textContent.trim());
        const valY = parseFloat(tabla.rows[i].cells[colY].textContent.trim());
        if (!isNaN(valX) && !isNaN(valY)) {
            dataX.push(valX);
            dataY.push(valY);
        }
    }

    const ctx = document.getElementById('scatterPlotCanvas').getContext('2d');

    // Eliminar el gráfico existente si lo hay
    if (window.scatterPlot) {
        window.scatterPlot.destroy();
    }

    // Generar el nuevo gráfico de dispersión
    window.scatterPlot = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Datos',
                data: dataX.map((x, i) => ({ x, y: dataY[i] })),
                backgroundColor: 'blue'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `X: ${context.raw.x}, Y: ${context.raw.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: selectX.options[selectX.selectedIndex].text
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: selectY.options[selectY.selectedIndex].text
                    }
                }
            }
        }
    });

    // Calcular correlación y línea de tendencia
    calcularCorrelacion(dataX, dataY);
}

function calcularCorrelacion(dataX, dataY) {
    const n = dataX.length;
    const sumX = dataX.reduce((a, b) => a + b, 0);
    const sumY = dataY.reduce((a, b) => a + b, 0);
    const sumXY = dataX.reduce((sum, x, i) => sum + x * dataY[i], 0);
    const sumX2 = dataX.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const meanX = sumX / n;
    const meanY = sumY / n;
    const ssXX = dataX.reduce((sum, x) => sum + (x - meanX) * (x - meanX), 0);
    const ssYY = dataY.reduce((sum, y) => sum + (y - meanY) * (y - meanY), 0);
    const ssXY = dataX.reduce((sum, x, i) => sum + (x - meanX) * (dataY[i] - meanY), 0);

    const r = ssXY / Math.sqrt(ssXX * ssYY);
    const r2 = r * r;

    document.getElementById('correlationResults').innerHTML = `
        <p>Coeficiente de Correlación (r): ${r.toFixed(4)}</p>
        <p>Coeficiente de Determinación (r²): ${r2.toFixed(4)}</p>
    `;

    calcularLineaTendencia(slope, intercept, dataX);
}


function calcularLineaTendencia(slope, intercept, dataX) {
    // Calcular la línea de tendencia
    const regressionLine = dataX.map(x => ({ x, y: slope * x + intercept }));

    // Obtener el gráfico de dispersión

    // Actualizar el conjunto de datos con la línea de tendencia
    window.scatterPlot.data.datasets.push({
        label: 'Línea de Tendencia',
        data: regressionLine,
        type: 'line',
        borderColor: 'red',
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
    });

    // Actualizar el gráfico
    window.scatterPlot.update();
}


function borrarDiagramaDispersion() {
    const scatterPlotCanvas = document.getElementById('scatterPlotCanvas');
    const scatterPlotCtx = scatterPlotCanvas.getContext('2d');
    const width = scatterPlotCanvas.width;
    const height = scatterPlotCanvas.height;

    scatterPlotCtx.clearRect(0, 0, width, height);
    document.getElementById('correlationResults').innerHTML = '';
}





