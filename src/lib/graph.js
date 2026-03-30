// graph.js
// datos del grafo de rutas entre capitales departamentales de colombia
// fuente de costos: distancias aproximadas por carretera en kilometros
// fuente de coordenadas: latitud/longitud geografica de cada capital
// solo se modelan las conexiones representadas en la figura del enunciado

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
};

// grafo de adyacencia: { ciudad: { vecino: costo_en_km } }
// el grafo es no dirigido — cada conexion aparece en ambas direcciones
// el costo elegido es kilometros de carretera porque refleja el presupuesto de viaje del usuario
export const graph = {
  "Riohacha": {
    "Valledupar":             177,
  },
  "Valledupar": {
    "Riohacha":               177,
    "Santa Marta":            242,
    "Barranquilla":           295,
    "Cucuta":                 437,
  },
  "Santa Marta": {
    "Valledupar":             242,
  },
  "Barranquilla": {
    "Cartagena":              123,
    "Valledupar":             295,
  },
  "Cartagena": {
    "Barranquilla":           123,
    "Sincelejo":              157,
    "Bucaramanga":            565,
  },
  "Sincelejo": {
    "Monteria":                97,
    "Cartagena":              157,
    "Bucaramanga":            480,
  },
  "Monteria": {
    "Sincelejo":               97,
    "Medellin":               375,
  },
  "Medellin": {
    "Manizales":              190,
    "Monteria":               375,
    "Quibdo":                 347,
    "Tunja":                  315,
  },
  "Quibdo": {
    "Medellin":               347,
  },
  "Manizales": {
    "Ibague":                 163,
    "Pereira":                 53,
    "Bogota":                 287,
    "Medellin":               190,
  },
  "Pereira": {
    "Manizales":               53,
    "Armenia":                 53,
  },
  "Armenia": {
    "Cali":                   188,
    "Pereira":                 53,
    "Ibague":                 104,
  },
  "Cali": {
    "Armenia":                188,
    "Popayan":                143,
  },
  "Popayan": {
    "Cali":                   143,
    "Pasto":                  258,
    "Florencia":              308,
    "Neiva":                  282,
  },
  "Pasto": {
    "Popayan":                258,
    "Mocoa":                  122,
  },
  "Mocoa": {
    "Pasto":                  122,
    "Florencia":              247,
  },
  "Florencia": {
    "Popayan":                308,
    "Mocoa":                  247,
  },
  "Neiva": {
    "Ibague":                 157,
    "Popayan":                282,
  },
  "Ibague": {
    "Manizales":              163,
    "Armenia":                104,
    "Neiva":                  157,
    "Bogota":                 203,
  },
  "Bogota": {
    "Manizales":              287,
    "Ibague":                 203,
    "Villavicencio":           93,
    "Tunja":                  148,
  },
  "Tunja": {
    "Bogota":                 148,
    "Medellin":               315,
    "Yopal":                  199,
    "Bucaramanga":            212,
  },
  "Bucaramanga": {
    "Arauca":                 533,
    "Tunja":                  212,
    "Cucuta":                 199,
    "Sincelejo":              480,
    "Cartagena":              565,
  },
  "Cucuta": {
    "Valledupar":             437,
    "Bucaramanga":            199,
  },
  "Arauca": {
    "Yopal":                  338,
    "Bucaramanga":            533,
  },
  "Yopal": {
    "Puerto Carreno":         682,
    "Tunja":                  199,
    "Arauca":                 338,
  },
  "Puerto Carreno": {
    "Inirida":                755,
    "Yopal":                  682,
  },
  "Inirida": {
    "Puerto Carreno":         755,
  },
  "Villavicencio": {
    "San Jose del Guaviare":  318,
    "Bogota":                  93,
  },
  "San Jose del Guaviare": {
    "Villavicencio":          318,
  },
  // estas ciudades no tienen conexiones por carretera en el mapa
  "Leticia":        {},
  "Mitu":           {},
};

// lista ordenada alfabeticamente de ciudades para los selectores de la ui
export const cityList = Object.keys(graph).sort();
