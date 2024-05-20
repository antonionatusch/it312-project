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
            var valor = Math.floor(Math.random() * (40 - 1 + 1)) + 1; // Generar valor aleatorio entre 1 y 40 para todas las columnas
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
    const data = Array.from(tabla.rows).map(row => parseFloat(row.cells[columnIndex].textContent.trim()));

    const headerCells = tabla.rows[0].cells;
    const columnName = headerCells[columnIndex].textContent.trim();

    // Configurar los límites de control (valores fijos para este ejemplo)
    const UCL = 35;
    const LCL = 15;

    // Obtener el contexto del canvas
    const ctx = document.getElementById('controlChartCanvas_' + columnIndex).getContext('2d');

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
                label: 'UCL',
                data: new Array(data.length).fill(UCL),
                borderColor: 'red',
                borderDash: [5, 5],
                fill: false
            }, {
                label: 'LCL',
                data: new Array(data.length).fill(LCL),
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
                        text: columnName
                    }
                }
            }
        }
    });
}
