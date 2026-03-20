import { mount } from 'svelte';
import App from './App.svelte';

// punto de entrada: monta el componente raiz en el div #app
const app = mount(App, { target: document.getElementById('app') });

export default app;
