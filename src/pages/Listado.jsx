import React, { useEffect, useMemo, useState } from "react";
import Hero from "../components/Hero";
import PageBackground from "../components/PageBackground";
import { apiFetch } from "../lib/api";
import FooterBar from "../components/FooterBar";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Skeleton,
  Divider,
  MenuItem,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

const BACKEND = process.env.REACT_APP_BACKEND_ORIGIN || "";

function resolveImg(src) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (BACKEND && src.startsWith("/uploads/")) return `${BACKEND}${src}`;
  return src;
}

function formatMoney(value) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function uniqueValues(list, key) {
  const s = new Set();
  for (const v of list || []) {
    const val = v?.[key];
    if (val !== null && val !== undefined && String(val).trim() !== "") {
      s.add(String(val).trim());
    }
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b, "es"));
}

export default function Listado() {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);

  // búsqueda libre
  const [q, setQ] = useState("");

  // filtros laterales
  const [filters, setFilters] = useState({
    marca: "",
    pasajeros: "",
    color: "",
    anioMin: "",
    anioMax: "",
    precioMin: "",
    precioMax: "",
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const r = await apiFetch("/api/vehiculos");
        const data = await r.json();
        if (alive) setVehiculos(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setVehiculos([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  const options = useMemo(() => {
    return {
      marca: uniqueValues(vehiculos, "marca"),
      color: uniqueValues(vehiculos, "color"),
      pasajeros: uniqueValues(vehiculos, "pasajeros"),
    };
  }, [vehiculos]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    const anioMin = filters.anioMin ? Number(filters.anioMin) : null;
    const anioMax = filters.anioMax ? Number(filters.anioMax) : null;
    const precioMin = filters.precioMin ? Number(filters.precioMin) : null;
    const precioMax = filters.precioMax ? Number(filters.precioMax) : null;

    return (vehiculos || []).filter((v) => {
      if (term) {
        const blob =
          `${v.marca || ""} ${v.modelo || ""} ${v.anio || ""} ${v.transmision || ""} ${v.combustible || ""} ${v.color || ""} ${v.pasajeros || ""}`.toLowerCase();
        if (!blob.includes(term)) return false;
      }

      if (filters.marca && String(v.marca || "").trim() !== filters.marca) return false;
      if (filters.color && String(v.color || "").trim() !== filters.color) return false;
      if (filters.pasajeros && String(v.pasajeros || "").trim() !== filters.pasajeros) return false;

      if (anioMin !== null) {
        const a = v.anio === null || v.anio === undefined ? null : Number(v.anio);
        if (a === null || Number.isNaN(a) || a < anioMin) return false;
      }
      if (anioMax !== null) {
        const a = v.anio === null || v.anio === undefined ? null : Number(v.anio);
        if (a === null || Number.isNaN(a) || a > anioMax) return false;
      }

      if (precioMin !== null) {
        const p = v.precio === null || v.precio === undefined ? null : Number(v.precio);
        if (p === null || Number.isNaN(p) || p < precioMin) return false;
      }
      if (precioMax !== null) {
        const p = v.precio === null || v.precio === undefined ? null : Number(v.precio);
        if (p === null || Number.isNaN(p) || p > precioMax) return false;
      }

      return true;
    });
  }, [vehiculos, q, filters]);

  const clearFilters = () => {
    setFilters({
      marca: "",
      pasajeros: "",
      color: "",
      anioMin: "",
      anioMax: "",
      precioMin: "",
      precioMax: "",
    });
  };

  const FiltersPanel = (
    <Box
      sx={{
        bgcolor: "rgba(255,255,255,0.88)",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 4,
        p: 1.7,
        boxShadow: "0 14px 40px rgba(0,0,0,0.10)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Typography fontWeight={900} sx={{ mb: 1 }}>
        Filtros
      </Typography>

      <Stack spacing={1.1}>
        <TextField
          select
          label="Marca"
          value={filters.marca}
          onChange={(e) => setFilters((p) => ({ ...p, marca: e.target.value }))}
          fullWidth
          size="small"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "white" } }}
        >
          <MenuItem value="">Todas</MenuItem>
          {options.marca.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Pasajeros"
          value={filters.pasajeros}
          onChange={(e) => setFilters((p) => ({ ...p, pasajeros: e.target.value }))}
          fullWidth
          size="small"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "white" } }}
        >
          <MenuItem value="">Todos</MenuItem>
          {options.pasajeros.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Color"
          value={filters.color}
          onChange={(e) => setFilters((p) => ({ ...p, color: e.target.value }))}
          fullWidth
          size="small"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "white" } }}
        >
          <MenuItem value="">Todos</MenuItem>
          {options.color.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <Divider />

        <Typography fontWeight={800} variant="body2">
          Año
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            label="Min"
            value={filters.anioMin}
            onChange={(e) => setFilters((p) => ({ ...p, anioMin: e.target.value }))}
            fullWidth
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "white" } }}
          />
          <TextField
            label="Max"
            value={filters.anioMax}
            onChange={(e) => setFilters((p) => ({ ...p, anioMax: e.target.value }))}
            fullWidth
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "white" } }}
          />
        </Stack>

        <Typography fontWeight={800} variant="body2">
          Precio (USD)
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            label="Min"
            value={filters.precioMin}
            onChange={(e) => setFilters((p) => ({ ...p, precioMin: e.target.value }))}
            fullWidth
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "white" } }}
          />
          <TextField
            label="Max"
            value={filters.precioMax}
            onChange={(e) => setFilters((p) => ({ ...p, precioMax: e.target.value }))}
            fullWidth
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "white" } }}
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ pt: 0.5 }}>
          <Button
            variant="outlined"
            onClick={clearFilters}
            size="small"
            sx={{ borderRadius: 3, fontWeight: 900, whiteSpace: "nowrap" }}
          >
            Limpiar
          </Button>

          <Typography variant="body2" color="text.secondary">
            <b style={{ color: "inherit" }}>{filtered.length}</b> resultados
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );

  return (
    <PageBackground>
      <Box sx={{ minHeight: "100vh", py: { xs: 2.5, md: 4 } }}>
        <Container maxWidth="lg">
          <Hero />

          <Stack spacing={1.2} sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: "-0.4px" }}>
              Catálogo de vehículos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Selecciona un vehículo para ver el detalle. Puedes filtrar por atributos o buscar libremente.
            </Typography>

            <TextField
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar vehículo..."
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "white" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Divider sx={{ pt: 0.5 }} />
          </Stack>

          {/* Layout con flex: asegura filtros izquierda y tarjetas derecha */}
          <Box sx={{ display: { xs: "block", sm: "flex" }, gap: 2.4, alignItems: "flex-start" }}>
            {/* Sticky */}
            <Box
              sx={{
                width: { xs: "100%", sm: 300, md: 280 },
                flexShrink: 0,
                mb: { xs: 2.2, sm: 0 },

                position: { xs: "static", sm: "sticky" },
                top: { sm: 16 },
                alignSelf: "flex-start",
                height: "fit-content",
              }}
            >
              {FiltersPanel}
            </Box>

            {/* Tarjetas */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Grid container spacing={2.2}>
                {loading
                  ? Array.from({ length: 9 }).map((_, i) => (
                      <Grid item xs={12} sm={6} md={4} key={i}>
                        <Card sx={{ borderRadius: 4 }}>
                          <Skeleton variant="rectangular" height={210} />
                          <CardContent>
                            <Skeleton width="70%" />
                            <Skeleton width="45%" />
                            <Skeleton width="90%" />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  : filtered.map((v) => {
                      const title = `${v.marca || "-"} ${v.modelo || ""}`.trim();
                      const img = resolveImg(v.fotoPrincipal) || "/assets/placeholders/vehiculo-default.jpg";

                      return (
                        <Grid item xs={12} sm={6} md={4} key={v.id}>
                          <Card
                            sx={{
                              borderRadius: 4,
                              overflow: "hidden",
                              border: "1px solid #eee",
                              bgcolor: "white",
                              transition: "transform 180ms ease, box-shadow 180ms ease",
                              "&:hover": {
                                transform: "translateY(-3px)",
                                boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
                              },
                            }}
                          >
                            <CardActionArea onClick={() => navigate(`/vehiculo/${v.id}`)}>
                              <Box sx={{ position: "relative" }}>
                                <CardMedia component="img" height="210" image={img} alt={title} sx={{ objectFit: "cover" }} />
                                <Box
                                  sx={{
                                    position: "absolute",
                                    left: 12,
                                    top: 12,
                                    bgcolor: "rgba(17,17,17,0.72)",
                                    color: "white",
                                    px: 1.2,
                                    py: 0.6,
                                    borderRadius: 2,
                                    fontWeight: 800,
                                    fontSize: 12,
                                    backdropFilter: "blur(6px)",
                                  }}
                                >
                                  {v.anio ? `Año ${v.anio}` : "Disponible"}
                                </Box>
                              </Box>

                              <CardContent sx={{ p: 2 }}>
                                <Typography variant="h6" fontWeight={900} sx={{ mb: 0.6 }} noWrap>
                                  {title}
                                </Typography>

                                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }} useFlexGap>
                                  {v.pasajeros ? <Chip size="small" label={`${v.pasajeros} pasajeros`} /> : null}
                                  {v.transmision ? <Chip size="small" label={v.transmision} /> : null}
                                  {v.combustible ? <Chip size="small" label={v.combustible} /> : null}
                                  {v.color ? <Chip size="small" label={v.color} /> : null}
                                </Stack>

                                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.6 }} alignItems="baseline">
                                  <Typography variant="body2" color="text.secondary">
                                    Km: {v.kilometraje ? v.kilometraje.toLocaleString("es-PE") : "-"}
                                  </Typography>
                                  <Typography variant="h6" fontWeight={900}>
                                    {formatMoney(v.precio)}
                                  </Typography>
                                </Stack>

                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.9 }}>
                                  Ver detalle y coordinar en minutos.
                                </Typography>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      );
                    })}
              </Grid>

              {!loading && filtered.length === 0 && (
                <Box sx={{ mt: 3, p: 3, bgcolor: "white", borderRadius: 4, border: "1px solid #eee" }}>
                  <Typography fontWeight={900}>No hay resultados</Typography>
                  <Typography color="text.secondary">Ajusta filtros o intenta con otra búsqueda.</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Container>

        <FooterBar
          brandText="Elaborado por @tradetechnologies"
          links={{
            facebook: "https://facebook.com/",
            x: "https://x.com/",
            instagram: "https://instagram.com/",
          }}
        />
      </Box>
    </PageBackground>
  );
}
