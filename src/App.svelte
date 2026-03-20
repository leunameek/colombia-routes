<!-- App.svelte -->
<!-- componente raiz: coordina controles, algoritmos de busqueda y visualizacion del mapa -->
<script>
  import MapView from './lib/MapView.svelte';
  import { ucs } from './lib/ucs.js';
  import { dfs } from './lib/dfs.js';
  import { graph, cityList } from './lib/graph.js';
  import { history, addToHistory, clearHistory } from './lib/history.js';

  // ciudad de origen seleccionada por el usuario
  let origin = 'Bogota';

  // ciudad de destino seleccionada por el usuario
  let destination = 'Medellin';

  // estrategia de busqueda activa: 'ucs' o 'dfs'
  let algorithm = 'ucs';

  // resultado de la ultima busqueda ejecutada
  let result = null;

  // mensaje de error para validaciones y rutas inexistentes
  let errorMsg = '';

  // controla la visibilidad del panel de historial
  let showHistory = false;

  // estado de carga para deshabilitar el boton durante la busqueda
  let isSearching = false;

  // ejecuta el algoritmo seleccionado con el origen y destino configurados
  function runSearch() {
    // limpiar estado previo
    result = null;
    errorMsg = '';

    // validacion: origen y destino no pueden ser iguales
    if (origin === destination) {
      errorMsg = 'El origen y el destino no pueden ser la misma ciudad.';
      return;
    }

    isSearching = true;

    // usar setTimeout para permitir que svelte actualice el dom antes de bloquear con el algoritmo
    setTimeout(() => {
      const searchFn = algorithm === 'ucs' ? ucs : dfs;
      const found = searchFn(graph, origin, destination);
      isSearching = false;

      if (!found) {
        errorMsg = `No existe una ruta directa entre ${origin} y ${destination} en el mapa.`;
        return;
      }

      result = found;

      // guardar la busqueda en el historial persistente
      addToHistory({
        origin,
        destination,
        algorithm: algorithm === 'ucs' ? 'Costo Uniforme' : 'Profundidad',
        path: found.path,
        cost: found.cost,
        steps: found.path.length,
        explored: found.explored.length,
        date: new Date().toLocaleDateString('es-CO', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        }),
      });
    }, 10);
  }

  // borra el historial tras confirmacion del usuario
  function handleClearHistory() {
    if (confirm('¿Deseas borrar todo el historial de rutas?')) {
      clearHistory();
    }
  }

  // nombre legible del algoritmo activo para mostrar en resultados
  $: algorithmLabel = algorithm === 'ucs' ? 'Costo Uniforme (UCS)' : 'Profundidad (DFS)';
</script>

<div class="app">
  <!-- encabezado de la aplicacion -->
  <header class="app-header">
    <div class="header-content">
      <div class="header-title">
        <span class="header-icon">🗺️</span>
        <div>
          <h1>Rutas por Colombia</h1>
          <p>Planificador inteligente de viajes entre capitales departamentales</p>
        </div>
      </div>
      <div class="header-badge">IA · UMNG</div>
    </div>
  </header>

  <div class="app-body">
    <!-- barra lateral izquierda: controles y resultados -->
    <aside class="sidebar">

      <!-- seccion de configuracion de la busqueda -->
      <section class="control-section">
        <h2 class="section-title">Configurar ruta</h2>

        <div class="field">
          <label for="select-origin">Ciudad de origen</label>
          <select id="select-origin" bind:value={origin}>
            {#each cityList as city}
              <option value={city}>{city}</option>
            {/each}
          </select>
        </div>

        <div class="field">
          <label for="select-dest">Ciudad destino</label>
          <select id="select-dest" bind:value={destination}>
            {#each cityList as city}
              <option value={city}>{city}</option>
            {/each}
          </select>
        </div>

        <div class="field">
          <label>Estrategia de busqueda</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" bind:group={algorithm} value="ucs" />
              <span class="radio-text">
                <span class="algo-name">Costo Uniforme</span>
                <span class="algo-desc">Ruta mas corta garantizada</span>
              </span>
              <span class="algo-badge ucs">UCS</span>
            </label>
            <label class="radio-label">
              <input type="radio" bind:group={algorithm} value="dfs" />
              <span class="radio-text">
                <span class="algo-name">Profundidad</span>
                <span class="algo-desc">Primer camino encontrado</span>
              </span>
              <span class="algo-badge dfs">DFS</span>
            </label>
          </div>
        </div>

        <button
          class="btn-search"
          class:searching={isSearching}
          on:click={runSearch}
          disabled={isSearching}
        >
          {isSearching ? 'Buscando...' : 'Buscar ruta'}
        </button>
      </section>

      <!-- mensaje de error -->
      {#if errorMsg}
        <div class="error-box" role="alert">
          <span class="error-icon">⚠</span>
          {errorMsg}
        </div>
      {/if}

      <!-- panel de resultados -->
      {#if result}
        <section class="result-section">
          <h2 class="section-title">
            Resultado
            <span class="result-algo-badge" class:ucs={algorithm === 'ucs'} class:dfs={algorithm === 'dfs'}>
              {algorithmLabel}
            </span>
          </h2>

          <div class="result-stats">
            <div class="stat">
              <span class="stat-value">{result.cost} km</span>
              <span class="stat-label">Distancia total</span>
            </div>
            <div class="stat">
              <span class="stat-value">{result.path.length}</span>
              <span class="stat-label">Ciudades</span>
            </div>
            <div class="stat">
              <span class="stat-value">{result.explored.length}</span>
              <span class="stat-label">Nodos explorados</span>
            </div>
          </div>

          <div class="path-display">
            <span class="path-label">Ruta:</span>
            <span class="path-text">{result.path.join(' → ')}</span>
          </div>
        </section>
      {/if}

      <!-- panel de historial -->
      <section class="history-section">
        <div class="history-header">
          <button
            class="btn-toggle"
            on:click={() => showHistory = !showHistory}
            aria-expanded={showHistory}
          >
            Historial de rutas
            <span class="toggle-arrow">{showHistory ? '▲' : '▼'}</span>
          </button>
          {#if showHistory && $history.length > 0}
            <button class="btn-clear" on:click={handleClearHistory}>Borrar</button>
          {/if}
        </div>

        {#if showHistory}
          <div class="history-list">
            {#if $history.length === 0}
              <p class="history-empty">No hay rutas guardadas.</p>
            {:else}
              {#each $history as entry, i}
                <div class="history-item">
                  <div class="history-route">
                    <strong>{entry.origin}</strong>
                    <span class="history-arrow">→</span>
                    <strong>{entry.destination}</strong>
                  </div>
                  <div class="history-meta">
                    <span class="history-algo">{entry.algorithm}</span>
                    <span>{entry.cost} km</span>
                    <span>{entry.date}</span>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        {/if}
      </section>

    </aside>

    <!-- contenedor del mapa leaflet -->
    <main class="map-area">
      <MapView
        solutionPath={result?.path ?? []}
        exploredNodes={result?.explored ?? []}
        {algorithm}
      />
    </main>
  </div>
</div>

<style>
  /* variables globales de diseno — tema oscuro industrial */
  :global(:root) {
    --bg:           #0d1117;
    --surface:      #161b22;
    --surface-2:    #1c2128;
    --border:       #30363d;
    --border-soft:  #21262d;
    --text:         #e6edf3;
    --text-muted:   #8b949e;
    --text-subtle:  #484f58;
    --accent-ucs:   #e63946;
    --accent-dfs:   #457b9d;
    --green:        #52b788;
    --font:         'IBM Plex Sans', sans-serif;
    --radius:       6px;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
  }

  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  /* layout principal */
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  /* encabezado */
  .app-header {
    border-bottom: 1px solid var(--border);
    padding: 0 1.5rem;
    flex-shrink: 0;
    background: var(--surface);
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .header-icon {
    font-size: 1.4rem;
  }

  h1 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .app-header p {
    margin: 0;
    font-size: 0.72rem;
    color: var(--text-muted);
    line-height: 1;
  }

  .header-badge {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-muted);
    border: 1px solid var(--border);
    padding: 2px 8px;
    border-radius: 20px;
    letter-spacing: 0.08em;
  }

  /* layout de dos columnas */
  .app-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* barra lateral */
  .sidebar {
    width: 300px;
    flex-shrink: 0;
    border-right: 1px solid var(--border);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;
    background: var(--bg);
  }

  .sidebar::-webkit-scrollbar { width: 4px; }
  .sidebar::-webkit-scrollbar-track { background: transparent; }
  .sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* secciones de la barra lateral */
  .control-section,
  .result-section,
  .history-section {
    padding: 1.25rem;
    border-bottom: 1px solid var(--border-soft);
  }

  .section-title {
    margin: 0 0 1rem;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  /* campos de formulario */
  .field {
    margin-bottom: 0.9rem;
  }

  .field > label {
    display: block;
    font-size: 0.72rem;
    color: var(--text-muted);
    margin-bottom: 0.35rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  select {
    width: 100%;
    padding: 0.5rem 0.6rem;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: var(--radius);
    font-family: var(--font);
    font-size: 0.88rem;
    appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238b949e'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.6rem center;
    padding-right: 2rem;
  }

  select:focus {
    outline: none;
    border-color: var(--accent-ucs);
  }

  /* grupo de radio buttons */
  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.7rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    background: var(--surface);
  }

  .radio-label:hover {
    border-color: var(--text-subtle);
    background: var(--surface-2);
  }

  .radio-label input[type="radio"] {
    margin: 0;
    accent-color: var(--accent-ucs);
    flex-shrink: 0;
  }

  .radio-text {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 1px;
  }

  .algo-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text);
  }

  .algo-desc {
    font-size: 0.7rem;
    color: var(--text-muted);
  }

  .algo-badge {
    font-size: 0.62rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }

  .algo-badge.ucs {
    background: rgba(230, 57, 70, 0.15);
    color: var(--accent-ucs);
    border: 1px solid rgba(230, 57, 70, 0.3);
  }

  .algo-badge.dfs {
    background: rgba(69, 123, 157, 0.15);
    color: var(--accent-dfs);
    border: 1px solid rgba(69, 123, 157, 0.3);
  }

  /* boton principal */
  .btn-search {
    width: 100%;
    padding: 0.65rem;
    background: var(--accent-ucs);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-family: var(--font);
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
    margin-top: 0.25rem;
  }

  .btn-search:hover:not(:disabled) { opacity: 0.85; }
  .btn-search:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-search.searching { opacity: 0.7; }

  /* mensaje de error */
  .error-box {
    margin: 0 1.25rem;
    padding: 0.65rem 0.8rem;
    background: rgba(249, 115, 22, 0.08);
    border: 1px solid rgba(249, 115, 22, 0.3);
    border-radius: var(--radius);
    color: #f97316;
    font-size: 0.82rem;
    line-height: 1.5;
    display: flex;
    gap: 0.4rem;
  }

  .error-icon { flex-shrink: 0; }

  /* panel de resultados */
  .result-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.9rem;
  }

  .stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.6rem 0.4rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .stat-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
  }

  .stat-label {
    font-size: 0.64rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .path-display {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.65rem 0.75rem;
  }

  .path-label {
    display: block;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    margin-bottom: 0.3rem;
    font-weight: 600;
  }

  .path-text {
    font-size: 0.78rem;
    color: var(--text);
    line-height: 1.7;
    word-break: break-word;
  }

  .result-algo-badge {
    font-size: 0.62rem;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 20px;
    text-transform: none;
    letter-spacing: 0;
  }

  .result-algo-badge.ucs {
    background: rgba(230, 57, 70, 0.12);
    color: var(--accent-ucs);
  }

  .result-algo-badge.dfs {
    background: rgba(69, 123, 157, 0.12);
    color: var(--accent-dfs);
  }

  /* panel de historial */
  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .btn-toggle {
    background: none;
    border: none;
    color: var(--text-muted);
    font-family: var(--font);
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .btn-toggle:hover { color: var(--text); }

  .toggle-arrow {
    font-size: 0.6rem;
  }

  .btn-clear {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-family: var(--font);
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-clear:hover {
    color: #e05252;
    border-color: #e05252;
  }

  .history-list {
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .history-empty {
    margin: 0;
    color: var(--text-subtle);
    font-size: 0.82rem;
  }

  .history-item {
    background: var(--surface);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius);
    padding: 0.55rem 0.7rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .history-route {
    font-size: 0.82rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .history-arrow {
    color: var(--text-muted);
  }

  .history-meta {
    display: flex;
    gap: 0.5rem;
    font-size: 0.7rem;
    color: var(--text-muted);
    flex-wrap: wrap;
  }

  .history-algo {
    color: var(--green);
    font-weight: 600;
  }

  /* area del mapa */
  .map-area {
    flex: 1;
    overflow: hidden;
  }
</style>
