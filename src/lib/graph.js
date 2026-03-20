// graph.js
// datos del grafo de rutas entre capitales departamentales de colombia
// fuente de costos: distancias aproximadas por carretera en kilometros
// fuente de coordenadas: latitud/longitud geografica de cada capital
// solo se modelan las conexiones representadas por lineas rojas en la figura 1 del enunciado

// coordenadas [latitud, longitud] de cada capital departamental
export const capitals = {
  "Bogota":                [4.7110,  -74.0721],
  "Medellin":              [6.2442,  -75.5812],
  "Cali":                  [3.4516,  -76.5320],
  "Barranquilla":          [10.9685, -74.7813],
  "Cartagena":             [10.3910, -75.4794],
  "Cucuta":                [7.8939,  -72.5078],
  "Bucaramanga":           [7.1193,  -73.1227],
  "Pereira":               [4.8133,  -75.6961],
  "Manizales":             [5.0703,  -75.5138],
  "Armenia":               [4.5339,  -75.6811],
  "Ibague":                [4.4389,  -75.2322],
  "Neiva":                 [2.9273,  -75.2819],
  "Pasto":                 [1.2136,  -77.2811],
  "Popayan":               [2.4448,  -76.6147],
  "Tunja":                 [5.5353,  -73.3678],
  "Villavicencio":         [4.1420,  -73.6266],
  "Florencia":             [1.6144,  -75.6062],
  "Mocoa":                 [1.1522,  -76.6483],
  "Monteria":              [8.7575,  -75.8857],
  "Valledupar":            [10.4631, -73.2532],
  "Riohacha":              [11.5444, -72.9072],
  "Santa Marta":           [11.2408, -74.1990],
  "Quibdo":                [5.6919,  -76.6583],
  "Yopal":                 [5.3378,  -72.3959],
  "Arauca":                [7.0900,  -70.7617],
  "Inirida":               [3.8653,  -67.9239],
  "San Jose del Guaviare": [2.5683,  -72.6383],
  "Mitu":                  [1.1980,  -70.1734],
  "Puerto Carreno":        [6.1891,  -67.4865],
  "Leticia":               [-4.2153, -69.9406],
  "Sincelejo":             [9.3047,  -75.3978],
  "San Andres":            [12.5847, -81.7006],
};

// grafo de adyacencia: { ciudad: { vecino: costo_en_km } }
// el grafo es no dirigido — cada conexion aparece en ambas direcciones
// el costo elegido es kilometros de carretera porque refleja el presupuesto de viaje del usuario
export const graph = {
  "Bogota": {
    "Tunja":                  147,
    "Villavicencio":           89,
    "Ibague":                 204,
    "Neiva":                  302,
    "Medellin":               414,
    "Bucaramanga":            410,
  },
  "Medellin": {
    "Bogota":                 414,
    "Manizales":              187,
    "Monteria":               347,
    "Quibdo":                 346,
    "Pereira":                166,
  },
  "Cali": {
    "Popayan":                130,
    "Armenia":                182,
    "Pereira":                215,
    "Ibague":                 250,
    "Pasto":                  456,
  },
  "Barranquilla": {
    "Cartagena":              120,
    "Santa Marta":             90,
    "Valledupar":             271,
    "Monteria":               283,
  },
  "Cartagena": {
    "Barranquilla":           120,
    "Monteria":               194,
    "Sincelejo":              140,
  },
  "Cucuta": {
    "Bucaramanga":            196,
    "Arauca":                 470,
    "Valledupar":             412,
  },
  "Bucaramanga": {
    "Cucuta":                 196,
    "Tunja":                  213,
    "Yopal":                  365,
    "Bogota":                 410,
  },
  "Pereira": {
    "Medellin":               166,
    "Manizales":               55,
    "Armenia":                 55,
    "Cali":                   215,
  },
  "Manizales": {
    "Medellin":               187,
    "Pereira":                 55,
    "Armenia":                 88,
    "Bogota":                 290,
    "Ibague":                 160,
  },
  "Armenia": {
    "Manizales":               88,
    "Pereira":                 55,
    "Cali":                   182,
    "Ibague":                 105,
  },
  "Ibague": {
    "Bogota":                 204,
    "Armenia":                105,
    "Manizales":              160,
    "Neiva":                  155,
    "Cali":                   250,
  },
  "Neiva": {
    "Bogota":                 302,
    "Ibague":                 155,
    "Popayan":                273,
    "Florencia":              219,
  },
  "Pasto": {
    "Popayan":                249,
    "Mocoa":                  118,
    "Cali":                   456,
  },
  "Popayan": {
    "Cali":                   130,
    "Neiva":                  273,
    "Pasto":                  249,
    "Florencia":              295,
  },
  "Tunja": {
    "Bogota":                 147,
    "Bucaramanga":            213,
    "Yopal":                  197,
  },
  "Villavicencio": {
    "Bogota":                  89,
    "Yopal":                  245,
    "San Jose del Guaviare":  350,
  },
  "Florencia": {
    "Neiva":                  219,
    "Popayan":                295,
    "Mocoa":                  255,
  },
  "Mocoa": {
    "Pasto":                  118,
    "Florencia":              255,
  },
  "Monteria": {
    "Cartagena":              194,
    "Barranquilla":           283,
    "Sincelejo":               95,
    "Medellin":               347,
  },
  "Valledupar": {
    "Barranquilla":           271,
    "Riohacha":               165,
    "Santa Marta":            220,
    "Cucuta":                 412,
  },
  "Riohacha": {
    "Valledupar":             165,
    "Santa Marta":            160,
    "Barranquilla":           310,
  },
  "Santa Marta": {
    "Barranquilla":            90,
    "Riohacha":               160,
    "Valledupar":             220,
  },
  "Quibdo": {
    "Medellin":               346,
    "Monteria":               340,
  },
  "Yopal": {
    "Tunja":                  197,
    "Bucaramanga":            365,
    "Villavicencio":          245,
    "Arauca":                 356,
  },
  "Arauca": {
    "Cucuta":                 470,
    "Yopal":                  356,
  },
  "Sincelejo": {
    "Cartagena":              140,
    "Monteria":                95,
    "Barranquilla":           210,
  },
  "San Jose del Guaviare": {
    "Villavicencio":          350,
    "Inirida":                580,
  },
  "Inirida": {
    "San Jose del Guaviare":  580,
  },
  // estas ciudades existen como nodos pero no tienen conexiones por carretera en el mapa
  "Mitu":           {},
  "Puerto Carreno": {},
  "Leticia":        {},
  "San Andres":     {},
};

// lista ordenada alfabeticamente de ciudades para los selectores de la ui
export const cityList = Object.keys(graph).sort();
