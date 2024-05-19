function generarTabla() {
    var filas = parseInt(document.getElementById('filas').value);
    var columnas = parseInt(document.getElementById('columnas').value);

    var tabla = '<table>';

    // Agregar una fila adicional para los encabezados de columna
    tabla += '<tr>';
    tabla += '<th></th>'; // Celda vacía para la esquina superior izquierda
    for (var j = 1; j <= columnas; j++) {
        tabla += `<th contenteditable="true">Columna ${j}</th>`; // Encabezados de columna editables
    }
    tabla += '</tr>';

    for (var i = 1; i <= filas; i++) {
        tabla += '<tr>';
        tabla += `<th contenteditable="true">Fila ${i}</th>`; // Encabezado de fila editable
        for (var j = 1; j <= columnas; j++) {
            tabla += `<td contenteditable="true">Valor ${i}-${j}</td>`; // Celdas de datos
        }
        tabla += '</tr>';
    }

    tabla += '</table>';

    // Agregar botones para el histograma y eliminar tabla
    tabla += '<div class="button-group">';
    tabla += '<button onclick="crearHistograma()">Histograma</button>';
    tabla += '<span class="button-spacing"></span>'; // Espaciador entre botones
    tabla += '<button onclick="borrarTabla()">Borrar Tabla</button>';
    tabla += '</div>';

    document.getElementById('tablaContainer').innerHTML = tabla;

    // Crear el histograma después de generar la tabla
    crearHistograma();
}

function borrarTabla() {
    document.getElementById('tablaContainer').innerHTML = '';

    // Si hay un histograma, también lo borramos
    if (typeof histograma !== 'undefined') {
        borrarHistograma();
    }
}

function crearHistograma() {
    // Verificar si ya hay un histograma
    if (typeof histograma !== 'undefined') {
        borrarHistograma(); // Destruir el histograma existente
    }

    var tabla = document.getElementById('tablaContainer').getElementsByTagName('table')[0];
    var data = [];
    var rowTitles = [];
    var columnTitles = [];

    // Recorrer las celdas de la tabla y obtener los valores
    for (var i = 1; i < tabla.rows.length; i++) {
        var rowData = [];
        var rowTitle = tabla.rows[i].cells[0].textContent.trim(); // Obtener el título de la fila
        rowTitles.push(rowTitle);

        for (var j = 1; j < tabla.rows[i].cells.length; j++) {
            if (i === 1) {
                var columnTitle = tabla.rows[0].cells[j].textContent.trim(); // Obtener el título de la columna
                columnTitles.push(columnTitle);
            }

            var cell = tabla.rows[i].cells[j];
            var value = parseFloat(cell.textContent.trim());
            if (!isNaN(value)) {
                rowData.push(value);
            }
        }
        data.push(rowData);
    }

    // Preparar los datos para el histograma
    var datasets = [];
    for (var i = 0; i < data.length; i++) {
        datasets.push({
            label: rowTitles[i], // Usar el título de la fila como etiqueta para el conjunto de datos
            data: data[i],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        });
    }

    // Configurar opciones del histograma
    var histogramaOptions = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Frecuencia'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Intervalo'
                },
                ticks: {
                    callback: function(value, index) {
                        return columnTitles[index] || ''; // Mostrar título de columna o vacío si no hay título
                    }
                }
            }
        }
    };

    // Obtener el contexto del canvas
    var ctx = document.getElementById('histogramaCanvas').getContext('2d');

    // Crear el histograma
    histograma = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from(Array(columnTitles.length).keys()), // Usar índices como etiquetas en el eje X
            datasets: datasets
        },
        options: histogramaOptions
    });

    // Mostrar el botón para borrar el histograma
    document.getElementById('borrarHistogramaButton').style.display = 'block';
}

function borrarHistograma() {
    // Borrar el histograma
    if (typeof histograma !== 'undefined') {
        histograma.destroy(); // Destruir el histograma
    }

    // Ocultar el botón para borrar el histograma
    document.getElementById('borrarHistogramaButton').style.display = 'none';
}
