// astar.js
// implementacion de busqueda A* (A estrella)
// usa distancia en linea recta (haversine) como heuristica admisible
// basada en russell & norvig — inteligencia artificial: un enfoque moderno, cap. 3
// no usa librerias externas — todo el codigo es propio

// ---- min-heap ordenado por f = g + h ----

class MinHeap {
  constructor() {
    this.data = [];
  }

  get size() {
    return this.data.length;
  }

  push(item) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }

  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.data[parent].f <= this.data[i].f) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const left  = 2 * i + 1;
      const right = 2 * i + 2;
      if (left  < n && this.data[left].f  < this.data[smallest].f) smallest = left;
      if (right < n && this.data[right].f < this.data[smallest].f) smallest = right;
      if (smallest === i) break;
      [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
      i = smallest;
    }
  }
}

// ---- heuristica: distancia haversine en kilometros ----
// admisible porque nunca sobreestima la distancia real por carretera

const R = 6371; // radio medio de la tierra en km

/**
 * @param {[number, number]} a - [lat, lng]
 * @param {[number, number]} b - [lat, lng]
 * @returns {number} distancia en km
 */
function haversine(a, b) {
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const x =
    sinLat * sinLat +
    Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) *
    sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// ---- algoritmo A* ----

/**
 * busca la ruta de menor costo entre start y goal usando A*
 * @param {Object} graph     - grafo de adyacencia { ciudad: { vecino: costoKm } }
 * @param {string} start     - ciudad de origen
 * @param {string} goal      - ciudad de destino
 * @param {Object} coords    - coordenadas { ciudad: [lat, lng] } para la heuristica
 * @returns {{ path: string[], cost: number, explored: string[] } | null}
 */
export function astar(graph, start, goal, coords) {
  const goalCoords = coords[goal];

  // h(n): heuristica — distancia haversine desde n hasta el destino
  const h = city => (coords[city] && goalCoords) ? haversine(coords[city], goalCoords) : 0;

  // la frontera es una cola de prioridad minima ordenada por f = g + h
  const frontier = new MinHeap();
  frontier.push({ f: h(start), g: 0, city: start, path: [start] });

  // conjunto de ciudades ya expandidas
  const expanded = new Set();

  // orden de expansion para el informe
  const exploredOrder = [];

  while (frontier.size > 0) {
    const { g, city, path } = frontier.pop();

    if (expanded.has(city)) continue;

    expanded.add(city);
    exploredOrder.push(city);

    if (city === goal) {
      return { path, cost: g, explored: exploredOrder };
    }

    const neighbors = graph[city] || {};
    for (const [neighbor, stepCost] of Object.entries(neighbors)) {
      if (!expanded.has(neighbor)) {
        const gNew = g + stepCost;
        frontier.push({
          f: gNew + h(neighbor),
          g: gNew,
          city: neighbor,
          path: [...path, neighbor],
        });
      }
    }
  }

  return null;
}
