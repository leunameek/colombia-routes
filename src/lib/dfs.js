// dfs.js
// implementacion iterativa de busqueda por profundidad (depth first search)
// version iterativa con pila explicita — evita desbordamiento del call stack
// no usa librerias externas — todo el codigo es propio

/**
 * busca una ruta entre start y goal explorando en profundidad
 * no garantiza optimalidad — retorna el primer camino encontrado
 * @param {Object} graph  - grafo de adyacencia { ciudad: { vecino: costoKm } }
 * @param {string} start  - ciudad de origen
 * @param {string} goal   - ciudad de destino
 * @returns {{ path: string[], cost: number, explored: string[] } | null}
 */
export function dfs(graph, start, goal) {
  // la pila almacena el estado de exploracion: ciudad actual, camino y costo acumulado
  // lifo: el ultimo elemento agregado es el primero en ser procesado
  const stack = [{ city: start, path: [start], cost: 0 }];

  // conjunto de ciudades ya visitadas para evitar ciclos en el grafo
  const visited = new Set();

  // registro del orden de exploracion para visualizar el arbol de busqueda
  const exploredOrder = [];

  while (stack.length > 0) {
    // tomar el ultimo elemento de la pila (comportamiento lifo)
    const { city, path, cost } = stack.pop();

    // si esta ciudad ya fue visitada, continuar con la siguiente
    if (visited.has(city)) continue;

    visited.add(city);
    exploredOrder.push(city);

    // prueba de objetivo
    if (city === goal) {
      return { path, cost, explored: exploredOrder };
    }

    // agregar vecinos en orden inverso para que el primero en el grafo sea el primero explorado
    // esto hace el comportamiento de dfs predecible y consistente
    const neighbors = Object.entries(graph[city] || {}).reverse();
    for (const [neighbor, stepCost] of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push({
          city: neighbor,
          path: [...path, neighbor],
          cost: cost + stepCost,
        });
      }
    }
  }

  // se agoto la pila sin encontrar el objetivo — no existe ruta
  return null;
}
