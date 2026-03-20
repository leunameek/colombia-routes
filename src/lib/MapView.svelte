<!-- MapView.svelte -->
<!-- componente que encapsula el mapa leaflet de colombia -->
<!-- recibe props reactivas y actualiza solo las capas que cambian -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { capitals, graph } from './graph.js';

  // camino solucion: arreglo ordenado de nombres de ciudad
  export let solutionPath = [];

  // nodos explorados por el algoritmo en orden de expansion
  export let exploredNodes = [];

  // algoritmo activo — determina el color de la ruta en el mapa
  export let algorithm = 'ucs';

  // referencia al div contenedor del mapa
  let mapContainer;

  // instancia del mapa leaflet
  let map = null;

  // capa de la ruta solucion (se reemplaza en cada busqueda)
  let solutionLayer = null;

  // colores diferenciados por algoritmo para identificacion visual rapida
  const ROUTE_COLORS = {
    ucs: '#e63946',
    dfs: '#457b9d',
  };

  onMount(async () => {
    // importacion dinamica: leaflet necesita el objeto window del navegador
    const L = (await import('leaflet')).default;

    // crear el mapa centrado geograficamente en colombia
    map = L.map(mapContainer, { zoomControl: true }).setView([4.5, -74.0], 6);

    // capa base de openstreetmap — gratuita, sin api key requerida
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // dibujar todas las aristas del grafo como lineas grises de fondo
    drawAllEdges(L);

    // colocar un marcador circular en cada capital departamental
    drawCapitalMarkers(L);
  });

  onDestroy(() => {
    // liberar recursos del mapa al desmontar el componente
    map?.remove();
  });

  // dibuja todas las conexiones del grafo en color gris claro
  function drawAllEdges(L) {
    const drawn = new Set();
    for (const [city, neighbors] of Object.entries(graph)) {
      for (const neighbor of Object.keys(neighbors)) {
        // evitar dibujar la misma arista dos veces (el grafo es no dirigido)
        const edgeKey = [city, neighbor].sort().join('||');
        if (!drawn.has(edgeKey) && capitals[city] && capitals[neighbor]) {
          drawn.add(edgeKey);
          L.polyline([capitals[city], capitals[neighbor]], {
            color: '#3d4451',
            weight: 1.5,
            opacity: 0.7,
          }).addTo(map);
        }
      }
    }
  }

  // coloca un marcador circular en cada capital con tooltip de nombre
  function drawCapitalMarkers(L) {
    for (const [city, coords] of Object.entries(capitals)) {
      L.circleMarker(coords, {
        radius: 5,
        fillColor: '#52b788',
        color: '#081c15',
        weight: 1.5,
        fillOpacity: 1,
      })
        .addTo(map)
        .bindTooltip(city, { permanent: false, direction: 'top', className: 'city-tooltip' });
    }
  }

  // cuando solutionPath cambia, actualizar la capa de ruta en el mapa
  $: if (map && solutionPath.length > 1) {
    updateSolutionLayer();
  }

  async function updateSolutionLayer() {
    const L = (await import('leaflet')).default;

    // remover la ruta anterior si existe
    solutionLayer?.remove();

    // filtrar ciudades que existan en el objeto capitals
    const coords = solutionPath
      .filter(city => capitals[city])
      .map(city => capitals[city]);

    if (coords.length < 2) return;

    // dibujar la ruta solucion con el color del algoritmo activo
    solutionLayer = L.polyline(coords, {
      color: ROUTE_COLORS[algorithm] ?? ROUTE_COLORS.ucs,
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // ajustar el zoom del mapa para mostrar la ruta completa con margen
    map.fitBounds(solutionLayer.getBounds(), { padding: [50, 50] });
  }
</script>

<!-- el div que leaflet usa como contenedor del mapa -->
<div bind:this={mapContainer} class="map-container"></div>

<style>
  .map-container {
    width: 100%;
    height: 100%;
  }

  /* estilos para el tooltip de nombre de ciudad */
  :global(.city-tooltip) {
    background: #161b22;
    border: 1px solid #30363d;
    color: #e6edf3;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.78rem;
    padding: 2px 8px;
    border-radius: 4px;
    box-shadow: none;
  }

  :global(.city-tooltip::before) {
    display: none;
  }
</style>
