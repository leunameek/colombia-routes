// ucs.js
// implementacion de busqueda de costo uniforme (uniform cost search)
// basada en russell & norvig — inteligencia artificial: un enfoque moderno, cap. 3
// no usa librerias externas — todo el codigo es propio

// ---- min-heap (cola de prioridad minima) ----
// estructura de datos que siempre entrega el elemento de menor costo primero
// se usa un arbol binario representado como arreglo

class MinHeap {
  constructor() {
    // el heap se representa como arreglo; el padre del nodo i esta en floor((i-1)/2)
    this.data = [];
  }

  // retorna el numero de elementos en la cola
  get size() {
    return this.data.length;
  }

  // inserta un nuevo elemento y lo sube hasta su posicion correcta
  push(item) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }

  // extrae y retorna el elemento con menor costo (la raiz del heap)
  pop() {
    const top = this.data[0];
    const last = this.data.pop();
    // si aun quedan elementos, el ultimo pasa a la raiz y se hunde
    if (this.data.length > 0) {
      this.data[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  // sube el elemento en la posicion i hacia la raiz comparando costos
  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.data[parent].cost <= this.data[i].cost) break;
      // intercambiar con el padre si el hijo tiene menor costo
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }

  // hunde el elemento en la posicion i hacia las hojas comparando costos
  _sinkDown(i) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const left  = 2 * i + 1;
      const right = 2 * i + 2;
      // comparar con hijo izquierdo
      if (left < n && this.data[left].cost < this.data[smallest].cost) {
        smallest = left;
      }
      // comparar con hijo derecho
      if (right < n && this.data[right].cost < this.data[smallest].cost) {
        smallest = right;
      }
      // si el nodo actual ya es el menor, el heap esta en orden
      if (smallest === i) break;
      [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
      i = smallest;
    }
  }
}

// ---- algoritmo ucs ----

/**
 * busca la ruta de menor costo acumulado entre start y goal
 * @param {Object} graph  - grafo de adyacencia { ciudad: { vecino: costoKm } }
 * @param {string} start  - ciudad de origen
 * @param {string} goal   - ciudad de destino
 * @returns {{ path: string[], cost: number, explored: string[] } | null}
 */
export function ucs(graph, start, goal) {
  // la frontera es una cola de prioridad minima
  // cada nodo contiene: costo acumulado, ciudad actual, camino desde el origen
  const frontier = new MinHeap();
  frontier.push({ cost: 0, city: start, path: [start] });

  // conjunto de ciudades ya expandidas — no se vuelven a visitar
  const expanded = new Set();

  // orden en que se expandieron los nodos (para el arbol de busqueda del informe)
  const exploredOrder = [];

  while (frontier.size > 0) {
    // extraer el nodo de menor costo de la frontera
    const { cost, city, path } = frontier.pop();

    // si ya fue expandido con un costo menor, ignorar esta entrada
    if (expanded.has(city)) continue;

    expanded.add(city);
    exploredOrder.push(city);

    // prueba de objetivo: si la ciudad actual es el destino, retornar resultado
    if (city === goal) {
      return { path, cost, explored: exploredOrder };
    }

    // generar sucesores: agregar vecinos no expandidos a la frontera
    const neighbors = graph[city] || {};
    for (const [neighbor, stepCost] of Object.entries(neighbors)) {
      if (!expanded.has(neighbor)) {
        frontier.push({
          cost: cost + stepCost,
          city: neighbor,
          // crear una copia del camino para no mutar el estado del nodo padre
          path: [...path, neighbor],
        });
      }
    }
  }

  // la frontera se vacio sin encontrar el objetivo — no existe ruta
  return null;
}
