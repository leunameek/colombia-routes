// history.js
// store de svelte sincronizado con localstorage
// guarda el historial de rutas calculadas entre sesiones del navegador

import { writable } from 'svelte/store';

const STORAGE_KEY = 'colombia_routes_history';

// intentar recuperar el historial previo del localstorage
// si el json esta corrupto o vacio, empezar con un arreglo limpio
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // json invalido — descartar y empezar de cero
    return [];
  }
}

// store principal: arreglo de entradas de historial
export const history = writable(loadFromStorage());

// sincronizar el store con localstorage en cada cambio
history.subscribe(value => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
});

/**
 * agrega una nueva entrada al inicio del historial
 * mantiene un maximo de 50 entradas para no saturar el localstorage
 * @param {{ origin: any, destination: any, algorithm: any, path: any, cost: any, steps: any, explored: any, date: any }} entry
 */
export function addToHistory(entry) {
  history.update(prev => [entry, ...prev].slice(0, 50));
}

// borra completamente el historial del store y del localstorage
export function clearHistory() {
  history.set([]);
}
