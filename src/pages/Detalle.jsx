import React, { useEffect, useMemo, useState } from "react";
import CarouselSimple from "../components/CarouselSimple";
import { apiFetch } from "../lib/api";
import PageBackground from "../components/PageBackground";
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Grid,
  Chip,
  Button,
  Divider,
  Skeleton,
  Dialog,
  IconButton,
  Tooltip,
  Fab,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CallIcon from "@mui/icons-material/Call";
import { useNavigate, useParams } from "react-router-dom";

const WHATSAPP_PHONE = (process.env.REACT_APP_WHATSAPP_PHONE || "").replace(/\D/g, "");
const CONTACT_PHONE = (process.env.REACT_APP_CONTACT_PHONE || "").replace(/\D/g, "");

// Si tus imágenes vienen como /uploads/...
const BACKEND = process.env.REACT_APP_BACKEND_ORIGIN || "";
function resolveImg(src) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (BACKEND && src.startsWith("/uploads/")) return `${BACKEND}${src}`;
  return src;
}

function buildWhatsappLink({ phone, text }) {
  const msg = encodeURIComponent(text || "");
  if (!phone) return "";
  return `https://wa.me/${phone}?text=${msg}`;
}

function toArray(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  if (typeof x === "string") {
    return x
      .split(/\r?\n|,/g)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Normaliza fotos para soportar:
 * - string[]: ["/uploads/a.jpg", ...]
 * - objetos: [{ src, titulo }, { url, caption }, ...]
 * - también respeta fotoPrincipal si existe
 */
function normalizeFotos(plan) {
  const principal = plan?.fotoPrincipal ? { src: plan.fotoPrincipal, titulo: "" } : null;
  const raw = plan?.galeriaFotos || plan?.fotos || [];

  const list = (Array.isArray(raw) ? raw : []).map((x) => {
    if (!x) return null;
    if (typeof x === "string") return { src: x, titulo: "" };
    // intenta varias convenciones
    const src = x.src || x.url || x.path || x.foto || "";
    const titulo = x.titulo || x.caption || x.nombre || x.label || "";
    return src ? { src, titulo } : null;
  }).filter(Boolean);

  // Dedup por src
  const seen = new Set();
  const out = [];
  const push = (it) => {
    if (!it?.src) return;
    if (seen.has(it.src)) return;
    seen.add(it.src);
    out.push(it);
  };

  if (principal) push(principal);
  list.forEach(push);

  // Si no hay principal, toma primera como principal "lógica"
  return out;
}

export default function Detalle() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Zoom modal state ---
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomSrc, setZoomSrc] = useState("");
  const [zoomCaption, setZoomCaption] = useState("");
  const [zoom, setZoom] = useState(1);

  const openZoom = (src, caption = "") => {
    if (!src) return;
    setZoomSrc(src);
    setZoomCaption(caption || "");
    setZoom(1);
    setZoomOpen(true);
  };

  const closeZoom = () => {
    setZoomOpen(false);
    setZoomSrc("");
    setZoomCaption("");
    setZoom(1);
  };

  const zoomIn = () => setZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100));
  const zoomOut = () => setZoom((z) => Math.max(1, Math.round((z - 0.25) * 100) / 100));
  const zoomReset = () => setZoom(1);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // CAMBIO CLAVE: planes
        const r = await apiFetch(`/api/planes/${id}`);
        if (!r.ok) throw new Error("Not found");
        const data = await r.json();

        if (alive) setPlan(data);
      } catch (e) {
        if (alive) setPlan(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  const tituloPlan = useMemo(() => {
    if (!plan) return "";
    return (plan.nombre || plan.titulo || "Plan funerario").trim();
  }, [plan]);

  const incluyeList = useMemo(() => toArray(plan?.incluye), [plan]);
  const ataudesList = useMemo(() => toArray(plan?.ataudes || plan?.ataud || plan?.productos), [plan]);

  const fotos = useMemo(() => normalizeFotos(plan), [plan]);

  // Para reutilizar CarouselSimple (que probablemente espera string[])
  const carouselFotos = useMemo(() => fotos.map((f) => f.src), [fotos]);

  const whatsappText = useMemo(() => {
    if (!plan) return "";
    const parts = [
      "Hola, necesito coordinar un servicio funerario. Por favor, ¿me brindan disponibilidad y costo?",
      "",
      `Plan: ${tituloPlan}`,
      plan.tipo ? `Tipo: ${plan.tipo}` : null,
      incluyeList.length ? `Incluye: ${incluyeList.join(" | ")}` : null,
      ataudesList.length ? `Ataúdes: ${ataudesList.join(" | ")}` : null,
      "",
      `Link: ${window.location.href}`,
    ].filter(Boolean);

    return parts.join("\n");
  }, [plan, tituloPlan, incluyeList, ataudesList]);

  const whatsappLink = useMemo(() => {
    return buildWhatsappLink({ phone: WHATSAPP_PHONE, text: whatsappText });
  }, [whatsappText]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa", py: 4 }}>
        <Container maxWidth="lg">
          <Skeleton width={220} height={50} />
          <Card sx={{ mt: 2, borderRadius: 3, overflow: "hidden" }}>
            <Skeleton variant="rectangular" height={360} />
            <CardContent>
              <Skeleton width="60%" />
              <Skeleton width="40%" />
              <Skeleton width="90%" />
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!plan) {
    return (
      <PageBackground>
        <Box sx={{ minHeight: "100vh", py: 4 }}>
          <Container maxWidth="lg">
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/")}>
              Volver
            </Button>
            <Box sx={{ mt: 3, p: 3, bgcolor: "white", borderRadius: 3, border: "1px solid #eee" }}>
              <Typography fontWeight={800} variant="h6">
                Plan no encontrado
              </Typography>
              <Typography color="text.secondary">Revisa el ID o vuelve al listado.</Typography>
            </Box>
          </Container>
        </Box>
      </PageBackground>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa", py: 4, position: "relative" }}>
      <Container maxWidth="lg">
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/")}>
          Volver
        </Button>

        <Card sx={{ mt: 2, borderRadius: 3, overflow: "hidden" }}>
          <CarouselSimple
            principal={plan.fotoPrincipal}
            fotos={carouselFotos}
            onOpenZoom={(src) => {
              // intenta hallar caption si existe
              const found = fotos.find((f) => f.src === src);
              openZoom(resolveImg(src), found?.titulo || "");
            }}
          />

          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={900}>
                {tituloPlan}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {plan.tipo ? <Chip label={plan.tipo} /> : null}
                {ataudesList[0] ? <Chip label={`Ataúd: ${ataudesList[0]}`} /> : null}
              </Stack>

              {/* CTA PRINCIPAL */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<WhatsAppIcon />}
                  disabled={!WHATSAPP_PHONE}
                  onClick={() => {
                    if (!whatsappLink) return;
                    window.open(whatsappLink, "_blank", "noopener,noreferrer");
                  }}
                  sx={{ borderRadius: 3, py: 1.2, fontWeight: 900 }}
                >
                  Coordinar por WhatsApp
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CallIcon />}
                  disabled={!CONTACT_PHONE}
                  onClick={() => {
                    if (!CONTACT_PHONE) return;
                    window.location.href = `tel:+${CONTACT_PHONE}`;
                  }}
                  sx={{ borderRadius: 3, py: 1.2, fontWeight: 900 }}
                >
                  Llamar
                </Button>
              </Stack>

              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Atención rápida. Si lo deseas, indícanos distrito, hora tentativa y cualquier requerimiento adicional.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography fontWeight={800}>Incluye</Typography>
                  <Stack spacing={0.8} sx={{ mt: 1 }}>
                    {incluyeList.length ? (
                      incluyeList.map((t, idx) => (
                        <Typography key={idx} color="text.secondary">
                          • {t}
                        </Typography>
                      ))
                    ) : (
                      <Typography color="text.secondary">No se registraron ítems en “Incluye”.</Typography>
                    )}
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography fontWeight={800}>Ataúdes</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                    {ataudesList.length ? (
                      ataudesList.map((c, idx) => <Chip key={idx} label={c} variant="outlined" />)
                    ) : (
                      <Typography color="text.secondary">No se registraron ataúdes.</Typography>
                    )}
                  </Stack>
                </Grid>

                {/* Pie de foto (si existe en tu estructura) */}
                {fotos.some((f) => f.titulo) ? (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography fontWeight={800} sx={{ mb: 1 }}>
                      Galería (con pie de foto)
                    </Typography>

                    <Grid container spacing={1.6}>
                      {fotos.map((f, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={f.src + idx}>
                          <Card sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #eee" }}>
                            <CardActionArea onClick={() => openZoom(resolveImg(f.src), f.titulo || "")}>
                              <CardMedia
                                component="img"
                                height="170"
                                image={resolveImg(f.src)}
                                alt={f.titulo || `foto-${idx}`}
                                sx={{ objectFit: "cover" }}
                              />
                              {f.titulo ? (
                                <CardContent sx={{ py: 1.2 }}>
                                  <Typography fontWeight={800} variant="body2">
                                    {f.titulo}
                                  </Typography>
                                </CardContent>
                              ) : null}
                            </CardActionArea>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                ) : null}
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        {/* MODAL ZOOM */}
        <Dialog open={zoomOpen} onClose={closeZoom} fullWidth maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5 }}>
            <Typography fontWeight={900}>Vista ampliada</Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Acercar">
                <IconButton onClick={zoomIn}>
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Alejar">
                <IconButton onClick={zoomOut}>
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset">
                <IconButton onClick={zoomReset}>
                  <RestartAltIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cerrar">
                <IconButton onClick={closeZoom}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Box
            sx={{
              bgcolor: "#111",
              display: "grid",
              placeItems: "center",
              p: 2,
              overflow: "auto",
              maxHeight: "80vh",
            }}
          >
            {zoomSrc ? (
              <img
                src={zoomSrc}
                alt="zoom"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  maxWidth: "100%",
                  height: "auto",
                  transition: "transform 120ms ease",
                  borderRadius: 12,
                }}
              />
            ) : null}
          </Box>

          <Box sx={{ p: 1.5, borderTop: "1px solid #eee" }}>
            {zoomCaption ? (
              <Typography sx={{ mb: 0.6 }} fontWeight={800}>
                {zoomCaption}
              </Typography>
            ) : null}
            <Typography color="text.secondary" variant="body2">
              Zoom: <b>{Math.round(zoom * 100)}%</b>. Usa los botones para acercar o alejar.
            </Typography>
          </Box>
        </Dialog>
      </Container>

      {/* BOTÓN FLOTANTE */}
      {WHATSAPP_PHONE ? (
        <Fab
          color="success"
          aria-label="WhatsApp"
          onClick={() => {
            if (!whatsappLink) return;
            window.open(whatsappLink, "_blank", "noopener,noreferrer");
          }}
          sx={{
            position: "fixed",
            right: 18,
            bottom: 18,
            zIndex: 1300,
            boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
          }}
        >
          <WhatsAppIcon />
        </Fab>
      ) : null}
    </Box>
  );
}
