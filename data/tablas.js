function generarTabla() {
    var filas = parseInt(document.getElementById('filas').value);
    var columnas = parseInt(document.getElementById('columnas').value);

    var tabla = '<table>';

    // Celda vacía para la esquina superior izquierda
    for (var j = 0; j < columnas; j++) {
        tabla += `<th contenteditable="true"></th>`; // Encabezados de columna editables vacíos
    }
    tabla += '</tr>';

    for (var i = 0; i < filas; i++) {
        tabla += '<tr>';
        for (var j = 0; j < columnas; j++) {
            tabla += `<td contenteditable="true"></td>`; // Celdas de datos vacías y editables
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

    for (var i = 1; i < filas; i++) { // Comienza desde la fila 1
        var row = tabla.rows[i];
        var columnas = row.cells.length;

        for (var j = 0; j < columnas; j++) { // Comienza desde la columna 0
            // Generar un valor aleatorio dentro del rango ±0.5 alrededor de un valor central
            var valorCentral = 125; // Valor central para el ejemplo
            var variabilidad = 0.5; // Variabilidad permitida
            var valor = valorCentral + (Math.random() * 2 - 1) * variabilidad;

            // Redondear el valor a un decimal
            valor = Math.round(valor * 10) / 10;

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
        const canvas = document.createElement('canvas');
        canvas.id = 'controlChartCanvas_' + i;
        controlChartContainer.appendChild(canvas);
    }

    // Generar gráficas de control para cada columna
    for (let i = 0; i < columnas; i++) {
        generateControlChart(i);
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

    // Obtener o crear el canvas para la gráfica de control
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

    // Crear la gráfica de control
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from(Array(data.length).keys()),
            datasets: [{
                label: 'Datos',
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












