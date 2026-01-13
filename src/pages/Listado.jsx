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

function toArray(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  if (typeof x === "string") {
    // permite que venga en string con saltos o comas
    return x
      .split(/\r?\n|,/g)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

export default function Listado() {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);

  // búsqueda libre
  const [q, setQ] = useState("");

  // filtros laterales (adaptado a planes)
  const [filters, setFilters] = useState({
    tipo: "",
    ataud: "",
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
    // Si tu JSON tiene campos distintos, aquí es donde se ajusta
    // tipo: podría ser "categoria" o "tipoPlan"
    const tipos = uniqueValues(planes, "tipo");
    const ataudes = Array.from(
      new Set(
        (planes || [])
          .flatMap((p) => toArray(p.ataudes || p.ataud || p.productos || []))
          .map((x) => String(x).trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "es"));

    return { tipo: tipos, ataud: ataudes };
  }, [planes]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    return (planes || []).filter((p) => {
      // blobs para búsqueda libre
      if (term) {
        const incluye = toArray(p.incluye).join(" ");
        const ataudes = toArray(p.ataudes || p.ataud || p.productos).join(" ");
        const blob = `${p.nombre || ""} ${p.tipo || ""} ${incluye} ${ataudes}`.toLowerCase();
        if (!blob.includes(term)) return false;
      }

      if (filters.tipo && String(p.tipo || "").trim() !== filters.tipo) return false;

      if (filters.ataud) {
        const listaAtaudes = toArray(p.ataudes || p.ataud || p.productos).map((x) => String(x).trim());
        if (!listaAtaudes.includes(filters.ataud)) return false;
      }

      return true;
    });
  }, [planes, q, filters]);

  const clearFilters = () => {
    setFilters({ tipo: "", ataud: "" });
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
          label="Tipo de plan"
          value={filters.tipo}
          onChange={(e) => setFilters((p) => ({ ...p, tipo: e.target.value }))}
          fullWidth
          size="small"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "white" } }}
        >
          <MenuItem value="">Todos</MenuItem>
          {options.tipo.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Ataúd"
          value={filters.ataud}
          onChange={(e) => setFilters((p) => ({ ...p, ataud: e.target.value }))}
          fullWidth
          size="small"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "white" } }}
        >
          <MenuItem value="">Todos</MenuItem>
          {options.ataud.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <Divider />

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
              Selecciona un plan para ver el detalle. Puedes filtrar por tipo o ataúd y buscar libremente.
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
                      const img =
                        resolveImg(p.fotoPrincipal) ||
                        "/assets/placeholders/vehiculo-default.jpg"; // si quieres, luego cambiamos placeholder

                      const incluye = toArray(p.incluye).slice(0, 3);
                      const ataudes = toArray(p.ataudes || p.ataud || p.productos).slice(0, 3);

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
                                  {p.tipo ? p.tipo : "Disponible"}
                                </Box>
                              </Box>

                              <CardContent sx={{ p: 2 }}>
                                <Typography variant="h6" fontWeight={900} sx={{ mb: 0.6 }} noWrap>
                                  {title}
                                </Typography>

                                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }} useFlexGap>
                                  {p.tipo ? <Chip size="small" label={p.tipo} /> : null}
                                  {ataudes[0] ? <Chip size="small" label={`Ataúd: ${ataudes[0]}`} /> : null}
                                </Stack>

                                {incluye.length ? (
                                  <Box sx={{ mt: 1.2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800, mb: 0.4 }}>
                                      Incluye
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {incluye.join(" · ")}
                                      {toArray(p.incluye).length > incluye.length ? " · ..." : ""}
                                    </Typography>
                                  </Box>
                                ) : null}

                                {ataudes.length ? (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800, mb: 0.4 }}>
                                      Ataúdes
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {ataudes.join(" · ")}
                                      {toArray(p.ataudes || p.ataud || p.productos).length > ataudes.length ? " · ..." : ""}
                                    </Typography>
                                  </Box>
                                ) : null}

                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.2 }}>
                                  Ver detalle del plan.
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
