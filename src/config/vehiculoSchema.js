export const VEHICULO_FIELDS = [
  { key: "marca", label: "Marca", type: "text", required: true, filter: { type: "select", mode: "values" } },
  { key: "modelo", label: "Modelo", type: "text", required: true, filter: { type: "text" } },

  { key: "anio", label: "Año", type: "number", required: false, filter: { type: "range" } },
  { key: "precio", label: "Precio (USD)", type: "number", required: false, filter: { type: "range" } },

  { key: "pasajeros", label: "Pasajeros", type: "number", required: false, filter: { type: "select", mode: "values" } },
  { key: "color", label: "Color", type: "select", required: false, options: [], filter: { type: "select", mode: "values" } },

  { key: "kilometraje", label: "Kilometraje", type: "number", required: false, filter: null },
  { key: "transmision", label: "Transmisión", type: "select", required: false, options: [], filter: { type: "select", mode: "values" } },
  { key: "combustible", label: "Combustible", type: "select", required: false, options: [], filter: { type: "select", mode: "values" } },
];

export const FILTER_PANEL = {
  title: "Filtros",
  keys: ["marca", "pasajeros", "color", "anio", "precio"], // orden del panel
};
