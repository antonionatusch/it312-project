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
let contadorMarcadores = 0;

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
    const nombre = `${String.fromCharCode(65 + contadorMarcadores)}`; // Asignar nombres como A, B, C, etc.
    const marcador = L.marker([lat, lng], {icon: marcadorGris}).addTo(mapa).bindPopup(nombre).openPopup(); // Icono gris
    contadorMarcadores++;

    // Añadir opción al select
    const option = document.createElement('option');
    option.value = nombre;
    option.textContent = nombre;
    document.getElementById('punto-inicio').appendChild(option);

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

    marcador.on('dblclick', function(event) {
        eliminarMarcador(marcador, nombre);
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
        lineas = lineas.filter(l => l !== polyline); // Eliminar la línea del array de líneas
    });

    lineas.push(polyline);
}

// Función para eliminar un marcador y sus conexiones
function eliminarMarcador(marcador, nombre) {
    mapa.removeLayer(marcador);
    marcadores = marcadores.filter(m => m !== marcador);

    // Eliminar la opción del select
    const select = document.getElementById('punto-inicio');
    const option = select.querySelector(`option[value="${nombre}"]`);
    if (option) {
        select.removeChild(option);
    }

    // Eliminar todas las líneas conectadas al marcador
    lineas.forEach(linea => {
        const [latlng1, latlng2] = linea.getLatLngs();
        if (latlng1.equals(marcador.getLatLng()) || latlng2.equals(marcador.getLatLng())) {
            mapa.removeLayer(linea);
        }
    });

    // Actualizar el array de líneas eliminando las conexiones del marcador eliminado
    lineas = lineas.filter(linea => {
        const [latlng1, latlng2] = linea.getLatLngs();
        return !latlng1.equals(marcador.getLatLng()) && !latlng2.equals(marcador.getLatLng());
    });
}

// Evento al hacer clic en el mapa para agregar marcadores
mapa.on('click', function(evento) {
    if (conectandoMarcadores) {
        agregarMarcador(evento.latlng.lat, evento.latlng.lng);
    }
});

// Evento al hacer clic en el botón 'Iniciar'
document.getElementById('iniciar').addEventListener('click', () => {
    conectandoMarcadores = true;
    document.getElementById('iniciar').disabled = true;
    document.getElementById('terminar').disabled = false;
});

// Evento al hacer clic en el botón 'Terminar'
document.getElementById('terminar').addEventListener('click', () => {
    const puntoInicioSelect = document.getElementById('punto-inicio');
    const puntoInicio = puntoInicioSelect.value;
    if (puntoInicio) {
        document.getElementById('punto-inicio-nombre').textContent = puntoInicio;
        terminarColocacionMarcadores(puntoInicio);
    }
});

// Evento al hacer clic en el botón 'Reiniciar'
document.getElementById('reiniciar').addEventListener('click', () => {
    // Eliminar todos los marcadores
    marcadores.forEach(marcador => mapa.removeLayer(marcador));
    marcadores = [];

    // Eliminar todas las líneas
    lineas.forEach(linea => mapa.removeLayer(linea));
    lineas = [];

    // Reiniciar el select
    const select = document.getElementById('punto-inicio');
    select.innerHTML = '';

    // Reiniciar el grafo
    const grafoContenedor = document.getElementById('grafo');
    grafoContenedor.innerHTML = '';

    // Reiniciar la lista de caminos cortos
    const listaCaminoCorto = document.getElementById('lista-camino-corto');
    listaCaminoCorto.innerHTML = '';

    // Reiniciar los botones
    document.getElementById('iniciar').disabled = false;
    document.getElementById('terminar').disabled = true;

    // Reiniciar el contador de marcadores
    contadorMarcadores = 0;

    // Reiniciar el texto del punto de inicio
    document.getElementById('punto-inicio-nombre').textContent = 'A';

    conectandoMarcadores = false;
});

// Función para encontrar el marcador más cercano a una coordenada dada
function encontrarMarcadorCercano(latlng, marcadoresConNombres) {
    return marcadoresConNombres.find(marcador => marcador.marcador.getLatLng().equals(latlng));
}

async function obtenerDatosMeteorologicos(latitude, longitude) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.current !== undefined && data.hourly !== undefined) {
            const { temperature_2m: temperaturaActual, wind_speed_10m: velocidadVientoActual } = data.current;
            const { relative_humidity_2m: humedad, wind_speed_10m: velocidadViento, precipitation: probabilidadLluvia } = data.hourly;

            const promedioProbabilidadLluvia = calcularPromedio(probabilidadLluvia);

            document.getElementById('temperatura').innerHTML = temperaturaActual;
            document.getElementById('humedad').innerHTML = humedad[0];
            document.getElementById('velocidad-viento').innerHTML = velocidadVientoActual;
            document.getElementById('probabilidad-lluvia').innerHTML = promedioProbabilidadLluvia.toFixed(2);
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
    const latitude = 0; // Reemplaza con la latitud de tu ubicación
    const longitude = 0; // Reemplaza con la longitud de tu ubicación
    obtenerDatosMeteorologicos(latitude, longitude);
});

function mostrarGrafo(marcadoresConectados) {
    const nodos = [];
    const arcos = [];

    marcadoresConectados.forEach(conexion => {
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

        const distancia = calcularDistanciaEntreMarcadores(conexion.origen, conexion.destino);
        arcos.push({ from: conexion.origen, to: conexion.destino, label: `${Math.round(distancia)}`, color: 'black', font: { align: 'top' } });
        arcos.push({ from: conexion.destino, to: conexion.origen, label: `${Math.round(distancia)}`, color: 'black', font: { align: 'top' } });
    });

    const datos = {
        nodes: nodos,
        edges: arcos
    };

    const nodoEstilo = {
        color: {
            background: 'lightgrey',
            border: 'black',
            highlight: {
                background: 'lightgrey',
                border: 'black'
            }
        }
    };

    const opciones = {
        physics: false,
        nodes: {
            shape: 'circle',
            ...nodoEstilo
        }
    };

    const contenedor = document.getElementById('grafo');
    const red = new vis.Network(contenedor, datos, opciones);

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

function terminarColocacionMarcadores(puntoInicio) {
    const marcadoresConNombres = [];
    marcadores.forEach((marcador, index) => {
        const nombre = `${String.fromCharCode(65 + index)}`;
        marcador.bindPopup(nombre).openPopup();
        marcador.addTo(mapa);
        marcadoresConNombres.push({ nombre, marcador });
    });

    const marcadoresConectados = [];
    lineas.forEach(linea => {
        const marcadorInicio = encontrarMarcadorCercano(linea.getLatLngs()[0], marcadoresConNombres);
        const marcadorFin = encontrarMarcadorCercano(linea.getLatLngs()[1], marcadoresConNombres);
        if (marcadorInicio && marcadorFin) {
            marcadoresConectados.push({ origen: marcadorInicio.nombre, destino: marcadorFin.nombre });
            marcadoresConectados.push({ origen: marcadorFin.nombre, destino: marcadorInicio.nombre });
        }
    });

    const listaCaminoCorto = document.getElementById('lista-camino-corto');
    listaCaminoCorto.innerHTML = '';

    const { distancias, previos } = dijkstra(marcadoresConectados, puntoInicio);
    Object.keys(distancias).forEach(destino => {
        const listItem = document.createElement('li');
        const camino = [];
        let nodoActual = destino;
        while (nodoActual !== null) {
            camino.unshift(nodoActual);
            nodoActual = previos[nodoActual];
        }
        listItem.textContent = `${destino}: ${Math.round(distancias[destino])} metros, Camino: ${camino.join(' -> ')}`;
        listaCaminoCorto.appendChild(listItem);
    });

    console.log("Marcadores conectados:", marcadoresConectados);
    mostrarGrafo(marcadoresConectados);

    if (marcadoresConNombres.length > 0) {
        const primeraUbicacion = marcadoresConNombres[0].marcador.getLatLng();
        obtenerDatosMeteorologicos(primeraUbicacion.lat, primeraUbicacion.lng);

        const caminoMasCorto = calcularCaminoMasCorto(marcadoresConectados, puntoInicio);
        crearLineaRoja(caminoMasCorto);
    } else {
        console.error("No se encontraron marcadores para obtener datos meteorológicos.");
    }

    conectandoMarcadores = false; // Evitar que se agreguen más marcadores
    document.getElementById('iniciar').disabled = false;
    document.getElementById('terminar').disabled = true;
}

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

    return { distancias, previos };
}

function calcularCaminoMasCorto(marcadoresConectados, inicio) {
    const { distancias, previos } = dijkstra(marcadoresConectados, inicio);
    const camino = [];
    let nodoActual = Object.keys(distancias).reduce((a, b) => (distancias[a] < distancias[b] ? a : b));
    while (nodoActual) {
        camino.unshift(nodoActual);
        nodoActual = distancias[nodoActual].previo;
    }
    return camino;
}

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
