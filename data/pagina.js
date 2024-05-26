// Configurar el mapa interactivo con Leaflet
const mapa = L.map('mapa').setView([0, 0], 13);

// Agregar capa base del mapa utilizando OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(mapa);

// Verificar si el navegador soporta geolocalización
if ("geolocation" in navigator) {
    // Obtener la ubicación del usuario y mostrarla en el mapa
    mapa.locate({setView: true, maxZoom: 16});
    mapa.on('locationfound', function(evento) {
        const ubicacion = evento.latlng;
        // Podrías hacer algo con la ubicación del usuario aquí
    });
} else {
    alert("La geolocalización no está disponible en este navegador.");
}

// Variables para manejar marcadores y las líneas poligonales
let marcadores = [];
let lineas = []; // Array para almacenar las líneas poligonales
let conectandoMarcadores = false;
let marcadorOrigen = null;

// Icono para los marcadores (gris)
const marcadorGris = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Función para agregar marcadores al mapa con nombres específicos
function agregarMarcador(lat, lng) {
    const marcador = L.marker([lat, lng], {icon: marcadorGris}).addTo(mapa); // Icono gris
    marcador.on('click', function(event) {
        if (conectandoMarcadores) {
            const marcadorSeleccionado = event.target;
            if (!marcadorOrigen) {
                marcadorOrigen = marcadorSeleccionado;
            } else {
                const marcadorDestino = marcadorSeleccionado;
                crearLinea(marcadorOrigen.getLatLng(), marcadorDestino.getLatLng());
                marcadorOrigen = null; // Reiniciar el marcador de origen
            }
        }
    });
    marcadores.push(marcador);
}

// Crear una línea poligonal entre dos puntos dados
function crearLinea(latlng1, latlng2) {
    const latLngs = [latlng1, latlng2];
    const polyline = L.polyline(latLngs, {color: 'green', dashArray: '5, 10'}).addTo(mapa);

    // Calcular la distancia entre los dos puntos
    const distancia = latlng1.distanceTo(latlng2);

    // Mostrar el texto de la distancia en la línea poligonal
    polyline.bindTooltip(`${Math.round(distancia)} metros`, { permanent: true, direction: 'center' }).openTooltip();
    polyline.on('click', function(event) {
        mapa.removeLayer(polyline); // Eliminar la línea del mapa cuando se hace clic en ella
    });
    lineas.push(polyline);
}

// Evento al hacer clic en el mapa para agregar marcadores
mapa.on('click', function(evento) {
    if (conectandoMarcadores) {
        agregarMarcador(evento.latlng.lat, evento.latlng.lng);
    }
});

// Evento al hacer clic en el botón 'Iniciar'
document.getElementById('iniciar').addEventListener('click', () => {
    // Habilitar colocación de marcadores
    conectandoMarcadores = true;
    document.getElementById('iniciar').disabled = true;
    document.getElementById('terminar').disabled = false;
});

// Evento al hacer clic en el botón 'Terminar'
document.getElementById('terminar').addEventListener('click', terminarColocacionMarcadores);

// Función para encontrar el marcador más cercano a una coordenada dada
function encontrarMarcadorCercano(latlng, marcadoresConNombres) {
    return marcadoresConNombres.find(marcador => marcador.marcador.getLatLng().equals(latlng));
}

async function obtenerDatosMeteorologicos(latitude, longitude) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation`;
        const response = await fetch(url);
        const data = await response.json();

        console.log("Datos meteorológicos:", data); // Verificar los datos obtenidos

        if (data.current !== undefined && data.hourly !== undefined) {
            console.log("Objeto current:", data.current); // Verificar el objeto current
            console.log("Objeto hourly:", data.hourly); // Verificar el objeto hourly

            const { temperature_2m: temperaturaActual, wind_speed_10m: velocidadVientoActual } = data.current;
            console.log("Temperatura actual:", temperaturaActual); // Verificar la temperatura actual
            console.log("Velocidad del viento actual:", velocidadVientoActual); // Verificar la velocidad del viento actual

            const { relative_humidity_2m: humedad, wind_speed_10m: velocidadViento, precipitation: probabilidadLluvia } = data.hourly;
            console.log("Humedad:", humedad); // Verificar la humedad
            console.log("Velocidad del viento:", velocidadViento); // Verificar la velocidad del viento
            console.log("Probabilidad de lluvia:", probabilidadLluvia); // Verificar la probabilidad de lluvia

            // Calcular el promedio de la probabilidad de lluvia
            const promedioProbabilidadLluvia = calcularPromedio(probabilidadLluvia);
            console.log("Promedio de probabilidad de lluvia:", promedioProbabilidadLluvia); // Verificar el promedio de probabilidad de lluvia

            // Mostrar los datos en la página HTML
            document.getElementById('temperatura').innerHTML = temperaturaActual;
            document.getElementById('humedad').innerHTML = humedad[0]; // Tomamos el valor de la humedad en la primera hora
            document.getElementById('velocidad-viento').innerHTML = velocidadVientoActual; // Usamos la velocidad del viento actual
            document.getElementById('probabilidad-lluvia').innerHTML = promedioProbabilidadLluvia.toFixed(2); // Mostramos el promedio de la probabilidad de lluvia
        } else {
            console.error("No se pudieron obtener los datos meteorológicos de la respuesta de la API.");
        }
    } catch (error) {
        console.error("Error al obtener los datos meteorológicos:", error);
    }
}

// Función para calcular el promedio de una lista de valores
function calcularPromedio(lista) {
    if (lista.length === 0) return 0;
    const suma = lista.reduce((acumulador, valor) => acumulador + valor, 0);
    return suma / lista.length;
}

// Llamar a la función para obtener los datos meteorológicos al cargar la página
window.addEventListener('load', () => {
    // Aquí debes definir las coordenadas para tu ubicación actual
    const latitude = 0; // Reemplaza con la latitud de tu ubicación
    const longitude = 0; // Reemplaza con la longitud de tu ubicación
    obtenerDatosMeteorologicos(latitude, longitude);
});

function mostrarGrafo(marcadoresConectados) {
    // Crear un arreglo de nodos y arcos para vis.js
    const nodos = [];
    const arcos = [];

    // Obtener las coordenadas de los marcadores y crear los nodos correspondientes
    marcadoresConectados.forEach((conexion, index) => {
        // Agregar nodos si no existen en el arreglo
        if (!nodos.find(nodo => nodo.id === conexion.origen)) {
            const marcadorOrigen = marcadores.find(marcador => marcador.getPopup().getContent() === conexion.origen);
            if (marcadorOrigen) {
                nodos.push({ id: conexion.origen, label: conexion.origen, x: mapa.latLngToLayerPoint(marcadorOrigen.getLatLng()).x, y: mapa.latLngToLayerPoint(marcadorOrigen.getLatLng()).y, fixed: true });
            }
        }
        if (!nodos.find(nodo => nodo.id === conexion.destino)) {
            const marcadorDestino = marcadores.find(marcador => marcador.getPopup().getContent() === conexion.destino);
            if (marcadorDestino) {
                nodos.push({ id: conexion.destino, label: conexion.destino, x: mapa.latLngToLayerPoint(marcadorDestino.getLatLng()).x, y: mapa.latLngToLayerPoint(marcadorDestino.getLatLng()).y, fixed: true });
            }
        }

        // Agregar arcos
        const distancia = calcularDistanciaEntreMarcadores(conexion.origen, conexion.destino);
        arcos.push({ from: conexion.origen, to: conexion.destino, label: `${Math.round(distancia)}`, arrows: 'to', color: 'black', font: { align: 'top' } });
    });

    // Crear un conjunto de datos para vis.js
    const datos = {
        nodes: nodos,
        edges: arcos
    };

    // Definir el estilo de los nodos
    const nodoEstilo = {
        color: {
            background: 'lightgrey', // Color de fondo gris claro
            border: 'black', // Color del borde negro
            highlight: {
                background: 'lightgrey', // Color de fondo resaltado gris claro
                border: 'black' // Color del borde resaltado negro
            }
        }
    };

    // Configurar las opciones del gráfico con el estilo de nodo definido
    const opciones = {
        physics: false, // Deshabilitar la simulación física para mantener fijos los nodos
        nodes: {
            shape: 'circle', // Forma de los nodos (círculo)
            ...nodoEstilo // Agregar el estilo de nodo definido
        }
    };

    // Mostrar el gráfico en el contenedor
    const contenedor = document.getElementById('grafo');
    const red = new vis.Network(contenedor, datos, opciones);

    // Ajustar el gráfico para que todos los nodos y arcos sean visibles
    red.fit();
}

// Función para calcular la distancia entre dos marcadores
function calcularDistanciaEntreMarcadores(origen, destino) {
    const marcadorOrigen = marcadores.find(marcador => marcador.getPopup().getContent() === origen);
    const marcadorDestino = marcadores.find(marcador => marcador.getPopup().getContent() === destino);
    if (marcadorOrigen && marcadorDestino) {
        const distancia = marcadorOrigen.getLatLng().distanceTo(marcadorDestino.getLatLng());
        return distancia;
    }
    return 0;
}

function terminarColocacionMarcadores() {
    // Asignar nombres a los marcadores y recolectarlos
    const marcadoresConNombres = [];
    marcadores.forEach((marcador, index) => {
        const nombre = `${String.fromCharCode(65 + index)}`; // Asignar nombres como Punto A, Punto B, etc.
        marcador.bindPopup(nombre); // Mostrar el nombre del marcador al hacer clic en él
        marcador.addTo(mapa); // Agregar el marcador nuevamente al mapa para que se muestre el nombre
        marcadoresConNombres.push({ nombre, marcador }); // Agregar el marcador con su nombre al array
    });

    // Verificar qué marcadores están conectados entre sí
    const marcadoresConectados = [];
    lineas.forEach(linea => {
        const marcadorInicio = encontrarMarcadorCercano(linea.getLatLngs()[0], marcadoresConNombres);
        const marcadorFin = encontrarMarcadorCercano(linea.getLatLngs()[1], marcadoresConNombres);
        if (marcadorInicio && marcadorFin) {
            marcadoresConectados.push({ origen: marcadorInicio.nombre, destino: marcadorFin.nombre });
        }
    });

    // Mostrar los marcadores conectados en la lista del HTML
    const listaCaminoCorto = document.getElementById('lista-camino-corto');
    listaCaminoCorto.innerHTML = ''; // Limpiar la lista antes de agregar nuevos elementos

    // Calcular el camino más corto y mostrar las distancias
    const distancias = dijkstra(marcadoresConectados, 'A');
    Object.keys(distancias).forEach(destino => {
        const listItem = document.createElement('li');
        listItem.textContent = `${destino}: ${distancias[destino]} metros`;
        listaCaminoCorto.appendChild(listItem);
    });

    // Mostrar los marcadores conectados en la consola o donde desees
    console.log("Marcadores conectados:", marcadoresConectados);
    mostrarGrafo(marcadoresConectados);

    // Recolectar datos meteorológicos para la ubicación del primer marcador
    if (marcadoresConNombres.length > 0) {
        const primeraUbicacion = marcadoresConNombres[0].marcador.getLatLng();
        obtenerDatosMeteorologicos(primeraUbicacion.lat, primeraUbicacion.lng);

        // Crear la línea roja para el camino más corto
        const caminoMasCorto = calcularCaminoMasCorto(marcadoresConectados, 'A');
        crearLineaRoja(caminoMasCorto);
    } else {
        console.error("No se encontraron marcadores para obtener datos meteorológicos.");
    }

    // Deshabilitar la colocación de marcadores
    conectandoMarcadores = false;
    document.getElementById('iniciar').disabled = false;
    document.getElementById('terminar').disabled = true;
}

// Función para calcular el camino más corto usando el algoritmo de Dijkstra
function dijkstra(marcadoresConectados, inicio) {
    const distancias = {};
    const previos = {};
    const pq = new PriorityQueue();

    marcadoresConectados.forEach(conexion => {
        distancias[conexion.origen] = Infinity;
        distancias[conexion.destino] = Infinity;
        previos[conexion.origen] = null;
        previos[conexion.destino] = null;
    });

    distancias[inicio] = 0;
    pq.enqueue(inicio, 0);

    while (!pq.isEmpty()) {
        const menor = pq.dequeue().element;

        const conexiones = marcadoresConectados.filter(con => con.origen === menor);
        conexiones.forEach(conexion => {
            const vecino = conexion.destino;
            const nuevaDistancia = distancias[menor] + calcularDistanciaEntreMarcadores(menor, vecino);
            if (nuevaDistancia < distancias[vecino]) {
                distancias[vecino] = nuevaDistancia;
                previos[vecino] = menor;
                pq.enqueue(vecino, nuevaDistancia);
            }
        });
    }

    return distancias;
}

// Función para calcular el camino más corto y devolver los nodos en el orden correcto
function calcularCaminoMasCorto(marcadoresConectados, inicio) {
    const distancias = dijkstra(marcadoresConectados, inicio);
    const camino = [];
    let nodoActual = Object.keys(distancias).reduce((a, b) => (distancias[a] < distancias[b] ? a : b));
    while (nodoActual) {
        camino.unshift(nodoActual);
        nodoActual = distancias[nodoActual].previo;
    }
    return camino;
}

// Clase de cola de prioridad
class PriorityQueue {
    constructor() {
        this.items = [];
    }
    enqueue(element, priority) {
        const qElement = { element, priority };
        let added = false;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > qElement.priority) {
                this.items.splice(i, 0, qElement);
                added = true;
                break;
            }
        }
        if (!added) {
            this.items.push(qElement);
        }
    }
    dequeue() {
        return this.items.shift();
    }
    isEmpty() {
        return this.items.length === 0;
    }
}

// Función para crear una línea roja sólida en el camino más corto
function crearLineaRoja(camino) {
    const latLngs = camino.map(punto => {
        const marcador = marcadores.find(marcador => marcador.getPopup().getContent() === punto);
        return marcador.getLatLng();
    });

    const polylineRoja = L.polyline(latLngs, { color: 'red' }).addTo(mapa);
}
