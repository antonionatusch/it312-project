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
    tabla += '<button onclick="generateControlCharts()" style="margin-right: 10px;">Generar Gráficas de Control</button>';
    tabla += '<button onclick="generateHistograms()" style="margin-right: 10px;">Generar Histograma</button>';
    tabla += '<button onclick="generarDiagramaDispersion()" id="generarDiagramaButton" style="display: none; margin-right: 10px;">Generar Diagrama de Dispersión</button>';

    tabla += '</div>';

    document.getElementById('tablaContainer').innerHTML = tabla;

    // Mostrar botón de generar diagrama de dispersión
    document.getElementById('generarDiagramaButton').style.display = 'inline-block';

    // Poblar selects para el diagrama de dispersión
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

    // Regenerar el diagrama de dispersión si ya ha sido generado
    var scatterPlotCanvas = document.getElementById('scatterPlotCanvas');
    if (scatterPlotCanvas.scatterChart) {
        generarDiagramaDispersion();
    }
}

function generateHistograms() {
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

    var histogramContainer = document.getElementById('histogramContainer');
    histogramContainer.innerHTML = '';

    var nombres = Array.from(table.rows[0].cells).map(cell => cell.textContent.trim());

    datasets.forEach((data, index) => {
        var nombre = nombres[index] || `Variable ${index + 1}`;

        var canvas = document.createElement('canvas');
        canvas.className = 'histogramCanvas';
        histogramContainer.appendChild(canvas);

        var ctx = canvas.getContext('2d');

        // Calcular el número de intervalos y la amplitud del intervalo
        var numDatos = data.length;
        var min = Math.min(...data);
        var max = Math.max(...data);
        var numIntervalos = Math.round(1 + 3.322 * Math.log10(numDatos));
        var amplitudIntervalo = (max - min) / numIntervalos;
        console.log(amplitudIntervalo);
        // Redondear la amplitud del intervalo
        amplitudIntervalo = Math.ceil(amplitudIntervalo);

        // Crear los intervalos y calcular las frecuencias
        var intervalos = [];
        var frecuencias = [];
        for (var i = 0; i < numIntervalos; i++) {
            intervalos.push(min + i * amplitudIntervalo);
            frecuencias.push(0);
        }
        intervalos.push(max);

        data.forEach(valor => {
            for (var i = 0; i < intervalos.length - 1; i++) {
                if (valor >= intervalos[i] && valor < intervalos[i + 1]) {
                    frecuencias[i]++;
                    break;
                }
            }
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: intervalos.slice(0, -1),
                datasets: [{
                    label: `Frecuencia - ${nombre}`,
                    data: frecuencias,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: 'blue',
                    borderWidth: 1,
                    barPercentage: 1,
                    categoryPercentage: 1
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: `Histograma - ${nombre}`
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Intervalos'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Frecuencia'
                        }
                    }
                }
            }
        });
    });

    var borrarHistogramasButton = document.getElementById('borrarHistogramasButton');
    borrarHistogramasButton.style.display = 'block';

    // Hacer scroll hasta la ubicación de los histogramas
    const histogramContainerTop = histogramContainer.offsetTop;
    window.scrollTo({
        top: histogramContainerTop,
        behavior: 'smooth' // Para realizar un scroll suave
    });
}

function borrarHistogramas() {
    var histogramContainer = document.getElementById('histogramContainer');
    histogramContainer.innerHTML = '';

    // Ocultar botón de borrar histogramas
    var borrarHistogramasButton = document.getElementById('borrarHistogramasButton');
    borrarHistogramasButton.style.display = 'none';

    // Hacer scroll hasta la ubicación de la tabla
    const tablaContainer = document.getElementById('tablaContainer');
    const tablaContainerTop = tablaContainer.offsetTop;
    window.scrollTo({
        top: tablaContainerTop,
        behavior: 'smooth' // Para realizar un scroll suave
    });
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
    // Evitar reemplazar el contenido existente, si lo hay
    var existingCharts = controlChartContainer.querySelectorAll('.controlChartCanvas');
    if (existingCharts.length > 0) {
        return; // Ya se han generado los gráficos
    }

    var nombres = Array.from(table.rows[0].cells).map(cell => cell.textContent.trim());

    datasets.forEach((data, index) => {
        var nombre = nombres[index] || `Variable ${index + 1}`;

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
                    label: nombre,
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
                    text: `Gráfico de Control - ${nombre}`
                }
            }
        });

        // Gráfico de Rangos Móviles
        var ranges = [];
        for (var i = 1; i < data.length; i++) {
            ranges.push(Math.abs(data[i] - data[i - 1]));
        }

        var meanRange = ranges.reduce((sum, value) => sum + value, 0) / ranges.length;
        var d2 = 1.128;

        var UCLR = meanRange + 3 * (meanRange / d2);
        var LCLR = Math.max(0, meanRange - 3 * (meanRange / d2));

        var canvasRangos = document.createElement('canvas');
        canvasRangos.className = 'controlChartCanvas';
        controlChartContainer.appendChild(canvasRangos);

        var ctxRangos = canvasRangos.getContext('2d');

        new Chart(ctxRangos, {
            type: 'line',
            data: {
                labels: Array.from({ length: ranges.length }, (_, i) => i + 1),
                datasets: [{
                    label: `Rangos Móviles - ${nombre}`,
                    data: ranges,
                    borderColor: 'blue',
                    fill: false
                }, {
                    label: 'Límite Superior de Control (UCL)',
                    data: Array(ranges.length).fill(UCLR),
                    borderColor: 'red',
                    borderDash: [5, 5],
                    fill: false
                }, {
                    label: 'Límite Inferior de Control (LCL)',
                    data: Array(ranges.length).fill(LCLR),
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
                    text: `Rangos Móviles - ${nombre}`
                }
            }
        });
    });

    document.getElementById('borrarControlChartsButton').style.display = 'inline-block';
    const controlChartContainerTop = controlChartContainer.offsetTop;
    window.scrollTo({
        top: controlChartContainerTop,
        behavior: 'smooth' // Para realizar un scroll suave
    });
}



function borrarControlCharts() {
    document.getElementById('controlChartContainer').innerHTML = '';
    document.getElementById('borrarControlChartsButton').style.display = 'none';

    // Hacer scroll hasta la ubicación de la tabla
    const tablaContainer = document.getElementById('tablaContainer');
    const tablaContainerTop = tablaContainer.offsetTop;
    window.scrollTo({
        top: tablaContainerTop,
        behavior: 'smooth' // Para realizar un scroll suave
    });
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

    var nombres = Array.from(table.rows[0].cells).map(cell => cell.textContent.trim());

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
                        text: nombres[xIndex] || `Variable ${xIndex + 1}`
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: nombres[yIndex] || `Variable ${yIndex + 1}`
                    }
                }
            }
        }
    });

    var correlation = calculateCorrelation(dataX, dataY);
    var determination = Math.pow(correlation, 2);

    document.getElementById('correlationResults').innerHTML = `
        <p>Correlación: ${correlation.toFixed(2)}</p>
        <p>Coeficiente de Determinación (R²): ${determination.toFixed(2)}</p>
    `;

    document.getElementById('columnSelectorContainer').style.display = 'block';
    document.getElementById('borrarDiagramaButton').style.display = 'inline-block'

    // Hacer scroll hasta la ubicación del gráfico de dispersión
    const scatterPlotCanvasTop = scatterPlotCanvas.offsetTop;
    window.scrollTo({
        top: scatterPlotCanvasTop,
        behavior: 'smooth' // Para realizar un scroll suave
    });
}

function borrarDiagramaDispersion() {
    var scatterPlotCanvas = document.getElementById('scatterPlotCanvas');
    scatterPlotCanvas.getContext('2d').clearRect(0, 0, scatterPlotCanvas.width, scatterPlotCanvas.height);
    if (scatterPlotCanvas.scatterChart) {
        scatterPlotCanvas.scatterChart.destroy();
    }
    document.getElementById('correlationResults').textContent = '';
    document.getElementById('borrarDiagramaButton').style.display = 'none';
    // Ocultar el div columnSelectorContainer
    document.getElementById('columnSelectorContainer').style.display = 'none';

    // Hacer scroll hasta la ubicación de la tabla
    const tablaContainer = document.getElementById('tablaContainer');
    const tablaContainerTop = tablaContainer.offsetTop;
    window.scrollTo({
        top: tablaContainerTop,
        behavior: 'smooth' // Para realizar un scroll suave
    });
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
        option.text = table.rows[0].cells[j].textContent.trim() || `Variable ${j + 1}`;
        selectX.add(option);
        var optionClone = option.cloneNode(true);
        selectY.add(optionClone);
    }
}
