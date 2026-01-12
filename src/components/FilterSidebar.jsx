import React, { useMemo } from "react";
import { Box, Typography, Stack, TextField, MenuItem, Button, Divider } from "@mui/material";
import { VEHICULO_FIELDS, FILTER_PANEL } from "../config/vehiculoSchema";

function getUniqueValues(list, key) {
  const s = new Set();
  for (const v of list || []) {
    const val = v?.[key];
    if (val !== null && val !== undefined && val !== "") s.add(String(val));
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b, "es"));
}

export default function FilterSidebar({ vehiculos, filters, setFilters }) {
  const filterDefs = useMemo(() => {
    const byKey = Object.fromEntries(VEHICULO_FIELDS.map((f) => [f.key, f]));
    return FILTER_PANEL.keys.map((k) => byKey[k]).filter(Boolean);
  }, []);

  const dynamicOptions = useMemo(() => {
    const map = {};
    for (const def of filterDefs) {
      if (def?.filter?.type === "select" && def?.filter?.mode === "values") {
        map[def.key] = getUniqueValues(vehiculos, def.key);
      }
    }
    return map;
  }, [vehiculos, filterDefs]);

  const onClear = () => {
    setFilters({
      marca: "",
      modelo: "",
      color: "",
      pasajeros: "",
      anioMin: "",
      anioMax: "",
      precioMin: "",
      precioMax: "",
    });
  };

  return (
    <Box
      sx={{
        bgcolor: "white",
        border: "1px solid #eee",
        borderRadius: 4,
        p: 2,
        position: { md: "sticky" },
        top: { md: 18 },
      }}
    >
      <Typography fontWeight={900} sx={{ mb: 1 }}>
        {FILTER_PANEL.title}
      </Typography>

      <Stack spacing={1.2}>
        {/* Marca */}
        <TextField
          select
          label="Marca"
          value={filters.marca}
          onChange={(e) => setFilters((p) => ({ ...p, marca: e.target.value }))}
          fullWidth
        >
          <MenuItem value="">Todas</MenuItem>
          {(dynamicOptions.marca || []).map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        {/* Pasajeros */}
        <TextField
          select
          label="Pasajeros"
          value={filters.pasajeros}
          onChange={(e) => setFilters((p) => ({ ...p, pasajeros: e.target.value }))}
          fullWidth
        >
          <MenuItem value="">Todos</MenuItem>
          {(dynamicOptions.pasajeros || []).map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        {/* Color */}
        <TextField
          select
          label="Color"
          value={filters.color}
          onChange={(e) => setFilters((p) => ({ ...p, color: e.target.value }))}
          fullWidth
        >
          <MenuItem value="">Todos</MenuItem>
          {(dynamicOptions.color || []).map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <Divider />

        {/* Año range */}
        <Stack direction="row" spacing={1}>
          <TextField
            label="Año min"
            value={filters.anioMin}
            onChange={(e) => setFilters((p) => ({ ...p, anioMin: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Año max"
            value={filters.anioMax}
            onChange={(e) => setFilters((p) => ({ ...p, anioMax: e.target.value }))}
            fullWidth
          />
        </Stack>

        {/* Precio range */}
        <Stack direction="row" spacing={1}>
          <TextField
            label="Precio min"
            value={filters.precioMin}
            onChange={(e) => setFilters((p) => ({ ...p, precioMin: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Precio max"
            value={filters.precioMax}
            onChange={(e) => setFilters((p) => ({ ...p, precioMax: e.target.value }))}
            fullWidth
          />
        </Stack>

        <Button variant="outlined" onClick={onClear} sx={{ borderRadius: 3, fontWeight: 900 }}>
          Limpiar filtros
        </Button>
      </Stack>
    </Box>
  );
}
