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

// Acepta string o {src,titulo}
function resolveImg(img) {
  if (!img) return "";
  const src = typeof img === "string" ? img : img?.src;
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (BACKEND && src.startsWith("/uploads/")) return `${BACKEND}${src}`;
  return src;
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function Listado() {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);

  // búsqueda libre
  const [q, setQ] = useState("");

  // filtros laterales
  const [filters, setFilters] = useState({
    tag: "",
    precioMin: "",
    precioMax: "",
    activo: "todos",
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const r = await apiFetch("/api/planes");
        const data = await r.json();
        if (alive) setPlanes(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setPlanes([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, []);

  const options = useMemo(() => {
    // tags únicos
    const allTags = new Set();
    (planes || []).forEach((p) => (p.tags || []).forEach((t) => allTags.add(String(t).trim())));
    return {
      tags: Array.from(allTags).filter(Boolean).sort((a, b) => a.localeCompare(b, "es")),
    };
  }, [planes]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const precioMin = filters.precioMin ? Number(filters.precioMin) : null;
    const precioMax = filters.precioMax ? Number(filters.precioMax) : null;

    return (planes || []).filter((p) => {
      if (term) {
        const blob = [
          p.nombre,
          p.descripcionCorta,
          ...(p.incluye || []),
          ...(p.ataudes || []),
          ...(p.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!blob.includes(term)) return false;
      }

      if (filters.tag) {
        const has = (p.tags || []).map(String).includes(filters.tag);
        if (!has) return false;
      }

      if (filters.activo !== "todos") {
        const wanted = filters.activo === "activos";
        if (Boolean(p.activo) !== wanted) return false;
      }

      const precio = p.precio === null || p.precio === undefined || p.precio === "" ? null : Number(p.precio);

      if (precioMin !== null) {
        if (precio === null || Number.isNaN(precio) || precio < precioMin) return false;
      }
      if (precioMax !== null) {
        if (precio === null || Number.isNaN(precio) || precio > precioMax) return false;
      }

      return true;
    });
  }, [planes, q, filters]);

  const clearFilters = () => {
    setFilters({ tag: "", precioMin: "", precioMax: "", activo: "todos" });
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
          label="Tag"
          value={filters.tag}
          onChange={(e) => setFilters((p) => ({ ...p, tag: e.target.value }))}
          fullWidth
          size="small"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "white" } }}
        >
          <MenuItem value="">Todos</MenuItem>
          {options.tags.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Estado"
          value={filters.activo}
          onChange={(e) => setFilters((p) => ({ ...p, activo: e.target.value }))}
          fullWidth
          size="small"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "white" } }}
        >
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="activos">Activos</MenuItem>
          <MenuItem value="inactivos">Inactivos</MenuItem>
        </TextField>

        <Divider />

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
              Planes funerarios
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Selecciona un plan para ver el detalle. Puedes buscar por nombre, incluye, ataúdes o tags.
            </Typography>

            <TextField
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar plan..."
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

          <Box sx={{ display: { xs: "block", sm: "flex" }, gap: 2.4, alignItems: "flex-start" }}>
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
                  : filtered.map((p) => {
                      const title = (p.nombre || "Plan").trim();
                      const img = resolveImg(p.fotoPrincipal) || "/assets/placeholders/vehiculo-default.jpg";

                      return (
                        <Grid item xs={12} sm={6} md={4} key={p.id}>
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
                            <CardActionArea onClick={() => navigate(`/plan/${p.id}`)}>
                              <CardMedia component="img" height="210" image={img} alt={title} sx={{ objectFit: "cover" }} />
                              <CardContent sx={{ p: 2 }}>
                                <Typography variant="h6" fontWeight={900} sx={{ mb: 0.6 }} noWrap>
                                  {title}
                                </Typography>

                                {p.descripcionCorta ? (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {p.descripcionCorta}
                                  </Typography>
                                ) : null}

                                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }} useFlexGap>
                                  {(p.tags || []).slice(0, 4).map((t, idx) => (
                                    <Chip key={idx} size="small" label={t} />
                                  ))}
                                  {p.activo === false ? <Chip size="small" color="warning" label="Inactivo" /> : null}
                                </Stack>

                                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.6 }} alignItems="baseline">
                                  <Typography variant="body2" color="text.secondary">
                                    Incluye: {(p.incluye || []).length}
                                  </Typography>
                                  <Typography variant="h6" fontWeight={900}>
                                    {formatMoney(p.precio)}
                                  </Typography>
                                </Stack>

                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.9 }}>
                                  Ver detalle y coordinar.
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
