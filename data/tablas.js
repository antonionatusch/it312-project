function generarTabla() {
    var filas = parseInt(document.getElementById('filas').value);
    var columnas = parseInt(document.getElementById('columnas').value);

    var tabla = '<table>';


    for (var j = 0; j < columnas; j++) {
        tabla += `<th contenteditable="true"></th>`; // Encabezados de columna editables vacíos
    }
    tabla += '</tr>';

    // Etiquetas de tipo de datos
    var tiposDatos = ['Altura', 'Distancia', 'Batería', 'Peso'];

    for (var i = 0; i < filas; i++) {
        tabla += '<tr>';
        for (var j = 0; j < columnas; j++) {
            // Elegir un tipo de dato aleatorio de la lista de tipos de datos
            var tipoDato = tiposDatos[Math.floor(Math.random() * tiposDatos.length)];
            tabla += `<td contenteditable="true" data-tipo="${tipoDato}"></td>`; // Asignar el tipo de dato a la celda
        }
        tabla += '</tr>';
    }

    tabla += '</table>';

    // Agregar botón para eliminar tabla y generar histograma
    tabla += '<div class="button-group">';
    tabla += '<button onclick="borrarTabla()">Borrar Tabla</button>';
    tabla += '<span style="margin-left: 10px;"></span>'; // Espacio entre los botones
    tabla += '<button onclick="generateControlCharts()">Generar Gráficas de Control</button>';
    tabla += '<button onclick="borrarControlCharts()" id="borrarControlChartsButton" style="display: none;">Borrar Gráficas</button>'; // Botón para borrar gráficas de control oculto por defecto
    tabla += '</div>';

    document.getElementById('tablaContainer').innerHTML = tabla;
}

function generarDatos() {
    var tabla = document.getElementById('tablaContainer').getElementsByTagName('table')[0];
    var filas = tabla.rows.length;

    // Obtener tipos de datos de la primera fila si están disponibles
    var tiposDatos = [];
    if (filas > 0) {
        var primeraFila = tabla.rows[0];
        var columnas = primeraFila.cells.length;
        for (var j = 0; j < columnas; j++) {
            var tipoDato = primeraFila.cells[j].textContent.trim();
            tiposDatos.push(tipoDato);
        }
    }

    for (var i = 1; i < filas; i++) { // Comienza desde la fila 1
        var row = tabla.rows[i];
        var columnas = row.cells.length;

        for (var j = 0; j < columnas; j++) { // Comienza desde la columna 0
            // Generar un valor aleatorio según el tipo de dato de la celda
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

            // Asignar el valor generado a la celda
            row.cells[j].textContent = valor;
        }
    }
}



function borrarTabla() {
    document.getElementById('tablaContainer').innerHTML = '';

    // Si hay gráficas de control, también las borramos
    borrarControlCharts();
}

function generateControlCharts() {
    // Borrar gráficas de control existentes
    borrarControlCharts();

    // Obtener la tabla
    const tabla = document.querySelector('#tablaContainer table');
    if (!tabla) return;

    // Obtener el número de columnas
    const columnas = tabla.rows[0].cells.length;

    // Crear contenedores para las gráficas de control
    const controlChartContainer = document.getElementById('controlChartContainer');
    for (let i = 0; i < columnas; i++) {
        // Canvas para la gráfica de observaciones individuales
        const canvasObservaciones = document.createElement('canvas');
        canvasObservaciones.id = 'controlChartCanvas_' + i;
        controlChartContainer.appendChild(canvasObservaciones);

        // Canvas para la gráfica de rangos móviles
        const canvasRangos = document.createElement('canvas');
        canvasRangos.id = 'rangeChartCanvas_' + i;
        controlChartContainer.appendChild(canvasRangos);
    }

    // Generar gráficas de control para cada columna
    for (let i = 0; i < columnas; i++) {
        generateControlChart(i);
        generateRangeChart(i); // Generar la gráfica de rangos móviles
    }

    // Mostrar el botón para borrar las gráficas de control
    document.getElementById('borrarControlChartsButton').style.display = 'inline-block';
}

function borrarControlCharts() {
    // Borrar las gráficas de control
    const controlChartContainer = document.getElementById('controlChartContainer');
    controlChartContainer.innerHTML = '';

    // Ocultar el botón para borrar las gráficas de control
    document.getElementById('borrarControlChartsButton').style.display = 'none';
}

function generateControlChart(columnIndex) {
    // Obtener la tabla y los datos para la columna específica
    const tabla = document.querySelector('#tablaContainer table');

    // Crear un array para almacenar los datos numéricos
    const data = [];
    for (let i = 1; i < tabla.rows.length; i++) {
        const cellValue = parseFloat(tabla.rows[i].cells[columnIndex].textContent.trim());

        // Verificar si el valor es un número válido antes de agregarlo al array
        if (!isNaN(cellValue)) {
            data.push(cellValue);
        }
    }

    // Verificar si hay suficientes datos para calcular los límites de control
    if (data.length === 0) {
        console.error('No hay suficientes datos válidos para calcular los límites de control.');
        return;
    }

    // Calcular los rangos
    const ranges = [];
    for (let i = 1; i < data.length; i++) {
        ranges.push(Math.abs(data[i] - data[i - 1])); // Tomar el valor absoluto de la diferencia
    }

    // Calcular la media de los rangos
    const meanRange = ranges.reduce((sum, value) => sum + value, 0) / ranges.length;
    console.log(meanRange)
    // Calcular el factor d2 (valor para n=2)
    const d2 = 1.128;

    // Calcular la media de los datos
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;

    // Calcular los límites de control para observaciones individuales
    const UCLx = mean + 3 * (meanRange / d2);
    const LCLx = mean - 3 * (meanRange / d2);

    console.log(UCLx);
    console.log(LCLx);

    // Obtener o crear el canvas para la gráfica de control de observaciones individuales
    let canvas = document.getElementById('controlChartCanvas_' + columnIndex);
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'controlChartCanvas_' + columnIndex;
        document.getElementById('controlChartContainer').appendChild(canvas);
    }

    canvas.width = canvas.parentElement.clientWidth; // Ajustar el ancho del canvas al contenedor
    canvas.height = 400; // Establecer una altura fija para el canvas

    // Obtener el contexto del canvas
    const ctx = canvas.getContext('2d');

    // Crear la gráfica de control de observaciones individuales
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from(Array(data.length).keys()),
            datasets: [{
                label: 'Observaciones',
                data: data,
                borderColor: 'blue',
                fill: false
            }, {
                label: 'UCLx',
                data: new Array(data.length).fill(UCLx), // Llenar el arreglo con el valor de UCLx
                borderColor: 'red',
                borderDash: [5, 5],
                fill: false
            }, {
                label: 'LCLx',
                data: new Array(data.length).fill(LCLx), // Llenar el arreglo con el valor de LCLx
                borderColor: 'green',
                borderDash: [5, 5],
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Muestra'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor'
                    }
                }
            }
        }
    });
}


function generateRangeChart(columnIndex) {
    // Obtener la tabla y los datos para la columna específica
    const tabla = document.querySelector('#tablaContainer table');

    // Crear un array para almacenar los datos numéricos
    const data = [];
    for (let i = 1; i < tabla.rows.length; i++) {
        const cellValue = parseFloat(tabla.rows[i].cells[columnIndex].textContent.trim());

        // Verificar si el valor es un número válido antes de agregarlo al array
        if (!isNaN(cellValue)) {
            data.push(cellValue);
        }
    }

    // Verificar si hay suficientes datos para calcular los límites de control
    if (data.length === 0) {
        console.error('No hay suficientes datos válidos para calcular los límites de control.');
        return;
    }

    // Calcular los rangos
    const ranges = [];
    for (let i = 1; i < data.length; i++) {
        ranges.push(Math.abs(data[i] - data[i - 1])); // Tomar el valor absoluto de la diferencia
    }

    // Calcular la media de los rangos
    const meanRange = ranges.reduce((sum, value) => sum + value, 0) / ranges.length;
    console.log(meanRange)
    // Calcular el factor d2 (valor para n=2)
    const d2 = 1.128;

    // Calcular los límites de control para rangos móviles
    const UCLR = meanRange + 3 * (meanRange / d2);
    const LCLR = Math.max(0, meanRange - 3 * (meanRange / d2));

    console.log(UCLR);
    console.log(LCLR);

    // Obtener o crear el canvas para la gráfica de rangos móviles
    let canvas = document.getElementById('rangeChartCanvas_' + columnIndex);
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'rangeChartCanvas_' + columnIndex;
        document.getElementById('controlChartContainer').appendChild(canvas);
    }

    canvas.width = canvas.parentElement.clientWidth; // Ajustar el ancho del canvas al contenedor
    canvas.height = 400; // Establecer una altura fija para el canvas

    // Obtener el contexto del canvas
    const ctx = canvas.getContext('2d');

    // Crear la gráfica de control de rangos móviles
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from(Array(ranges.length).keys()),
            datasets: [{
                label: 'Rangos',
                data: ranges,
                borderColor: 'blue',
                fill: false
            }, {
                label: 'UCLR',
                data: new Array(ranges.length).fill(UCLR), // Llenar el arreglo con el valor de UCLR
                borderColor: 'red',
                borderDash: [5, 5],
                fill: false
            }, {
                label: 'LCLR',
                data: new Array(ranges.length).fill(LCLR), // Llenar el arreglo con el valor de LCLR
                borderColor: 'green',
                borderDash: [5, 5],
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Muestra'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor'
                    }
                }
            }
        }
    });
}












