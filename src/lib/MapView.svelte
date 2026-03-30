<!-- MapView.svelte -->
<!-- componente que encapsula el mapa leaflet de colombia -->
<!-- recibe props reactivas y actualiza solo las capas que cambian -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { capitals, graph } from './graph.js';
  import chivaUrl from '../assets/chiva.png';

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

  // marcador del carrito animado
  let carMarker = null;

  // id del requestAnimationFrame activo
  let animationId = null;

  // colores diferenciados por algoritmo para identificacion visual rapida
  const ROUTE_COLORS = {
    ucs:   '#e63946',
    dfs:   '#457b9d',
    astar: '#2a9d8f',
  };

  onMount(async () => {
    // importacion dinamica: leaflet necesita el objeto window del navegador
    const L = (await import('leaflet')).default;

    // limites geograficos de colombia con algo de margen
    const colombiaBounds = L.latLngBounds(
      L.latLng(-5.5, -82.5),   // esquina suroeste
      L.latLng(14.0, -66.5),   // esquina noreste
    );

    // crear el mapa centrado geograficamente en colombia
    map = L.map(mapContainer, {
      zoomControl: true,
      minZoom: 5,
      maxZoom: 18,
      maxBounds: colombiaBounds,
      maxBoundsViscosity: 1.0,   // impide arrastrar fuera de los limites
    }).setView([4.5, -74.0], 6);

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
    stopCarAnimation();
    map?.remove();
  });

  // calcula el angulo de direccion en grados (norte = 0, sentido horario)
  function getBearing(start, end) {
    const lat1 = start[0] * Math.PI / 180;
    const lat2 = end[0] * Math.PI / 180;
    const dLon  = (end[1] - start[1]) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  // crea el icono de la chiva apuntando en la direccion de viaje
  // la imagen apunta al OESTE (izquierda), por eso la logica se divide en dos casos:
  //
  // b in [0°, 180°) — viaje con componente norte o este:
  //   se voltea con scaleX(-1) (ahora apunta al este) y luego se rota como imagen derecha: b - 90°
  //   - norte  (b=0°):  scaleX(-1) rotate(-90°) → apunta arriba ✓
  //   - este   (b=90°): scaleX(-1) rotate( 0°)  → apunta derecha ✓
  //
  // b in [180°, 360°) — viaje con componente sur o oeste:
  //   imagen natural (izquierda) rotada directamente: b + 90°
  //   - sur    (b=180°): rotate(270°) → apunta abajo ✓
  //   - oeste  (b=270°): rotate(360°) → sin rotacion ✓
  function createCarIcon(L, bearing) {
    const b = ((bearing % 360) + 360) % 360;
    const transform = b < 180
      ? `scaleX(-1) rotate(${b - 90}deg)`
      : `rotate(${b + 90}deg)`;
    return L.divIcon({
      className: '',
      html: `<div class="car-icon" style="transform:${transform}"><img src="${chivaUrl}" width="48" height="48" /></div>`,
      iconSize:   [48, 48],
      iconAnchor: [24, 24],
    });
  }

  function stopCarAnimation() {
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    carMarker?.remove();
    carMarker = null;
  }

  // anima el carrito a lo largo del arreglo de coordenadas en ~4 segundos
  function animateCar(L, coords) {
    stopCarAnimation();
    if (coords.length < 2) return;

    // calcular longitudes acumuladas de cada segmento en coordenadas
    const segments = [];
    let totalLen = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const dx = coords[i + 1][1] - coords[i][1];
      const dy = coords[i + 1][0] - coords[i][0];
      const len = Math.sqrt(dx * dx + dy * dy);
      totalLen += len;
      segments.push({ start: coords[i], end: coords[i + 1], len, cumLen: totalLen });
    }

    const DURATION  = 4000; // ms totales de animacion
    const startTime = performance.now();

    carMarker = L.marker(coords[0], {
      icon: createCarIcon(L, getBearing(coords[0], coords[1])),
      zIndexOffset: 1000,
      opacity: 1,
    }).addTo(map);

    function step(now) {
      const t         = Math.min((now - startTime) / DURATION, 1);
      const targetLen = t * totalLen;

      // encontrar en que segmento cae la posicion actual
      let seg = segments[segments.length - 1];
      let prevCumLen = 0;
      for (let i = 0; i < segments.length; i++) {
        if (segments[i].cumLen >= targetLen) {
          seg = segments[i];
          prevCumLen = i > 0 ? segments[i - 1].cumLen : 0;
          break;
        }
      }

      const segT  = seg.len > 0 ? (targetLen - prevCumLen) / seg.len : 1;
      const lat   = seg.start[0] + (seg.end[0] - seg.start[0]) * segT;
      const lng   = seg.start[1] + (seg.end[1] - seg.start[1]) * segT;
      const angle = getBearing(seg.start, seg.end);

      carMarker.setLatLng([lat, lng]);
      carMarker.setIcon(createCarIcon(L, angle));

      if (t < 1) animationId = requestAnimationFrame(step);
    }

    animationId = requestAnimationFrame(step);
  }

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

    // animar el carrito a lo largo de la ruta encontrada
    animateCar(L, coords);
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

  :global(.car-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: center center;
    filter: drop-shadow(0 1px 3px rgba(0,0,0,0.6));
    opacity: 1 !important;
  }

  :global(.car-icon img) {
    display: block;
    opacity: 1 !important;
  }

  :global(.leaflet-marker-icon) {
    opacity: 1 !important;
  }
</style>
