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

function formatMoney(value) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildWhatsappLink({ phone, text }) {
  const msg = encodeURIComponent(text || "");
  if (!phone) return "";
  return `https://wa.me/${phone}?text=${msg}`;
}

export default function Detalle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [v, setV] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Zoom modal state ---
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomSrc, setZoomSrc] = useState("");
  const [zoom, setZoom] = useState(1);

  const openZoom = (src) => {
    if (!src) return;
    setZoomSrc(src);
    setZoom(1);
    setZoomOpen(true);
  };

  const closeZoom = () => {
    setZoomOpen(false);
    setZoomSrc("");
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
        const r = await apiFetch(`/api/vehiculos/${id}`);
        if (!r.ok) throw new Error("Not found");
        const data = await r.json();
        if (alive) setV(data);
      } catch (e) {
        if (alive) setV(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  const tituloVehiculo = useMemo(() => {
    if (!v) return "";
    return `${v.marca || ""} ${v.modelo || ""}`.trim() || "Vehículo";
  }, [v]);

  const whatsappText = useMemo(() => {
    if (!v) return "";
    const parts = [
      "Hola, necesito coordinar un servicio. Por favor, ¿me brindan disponibilidad y costo?",
      "",
      `Vehículo: ${tituloVehiculo}`,
      v.anio ? `Año: ${v.anio}` : null,
      v.transmision ? `Transmisión: ${v.transmision}` : null,
      v.combustible ? `Combustible: ${v.combustible}` : null,
      v.color ? `Color: ${v.color}` : null,
      v.precio ? `Referencia: ${formatMoney(v.precio)}` : null,
      "",
      `Link: ${window.location.href}`,
    ].filter(Boolean);

    return parts.join("\n");
  }, [v, tituloVehiculo]);

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


  if (!v) {
      return (
  <PageBackground>
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa", py: 4 }}>
        <Container maxWidth="lg">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/")}>
            Volver
          </Button>
          <Box sx={{ mt: 3, p: 3, bgcolor: "white", borderRadius: 3, border: "1px solid #eee" }}>
            <Typography fontWeight={800} variant="h6">
              Vehículo no encontrado
            </Typography>
            <Typography color="text.secondary">Revisa el ID o vuelve al listado.</Typography>
          </Box>
        </Container>
      </Box>
    );
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
            principal={v.fotoPrincipal}
            fotos={v.galeriaFotos || []}
            onOpenZoom={openZoom}
          />

          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={900}>
                {tituloVehiculo}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {v.anio ? <Chip label={`Año ${v.anio}`} /> : null}
                {v.transmision ? <Chip label={v.transmision} /> : null}
                {v.combustible ? <Chip label={v.combustible} /> : null}
                {v.color ? <Chip label={`Color: ${v.color}`} /> : null}
              </Stack>

              <Typography variant="h5" fontWeight={900} sx={{ mt: 1 }}>
                {formatMoney(v.precio)}
              </Typography>

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
                Atención rápida. Si lo deseas, indícanos distrito, hora tentativa y si requieres chofer.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography fontWeight={800}>Datos</Typography>
                  <Stack spacing={0.6} sx={{ mt: 1 }}>
                    <Typography color="text.secondary">
                      Kilometraje:{" "}
                      <b style={{ color: "inherit" }}>
                        {v.kilometraje ? `${v.kilometraje.toLocaleString("es-PE")} km` : "-"}
                      </b>
                    </Typography>
                    <Typography color="text.secondary">
                      Transmisión: <b style={{ color: "inherit" }}>{v.transmision || "-"}</b>
                    </Typography>
                    <Typography color="text.secondary">
                      Combustible: <b style={{ color: "inherit" }}>{v.combustible || "-"}</b>
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Typography fontWeight={800}>Características</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                    {(v.caracteristicas || []).length ? (
                      v.caracteristicas.map((c, idx) => <Chip key={idx} label={c} variant="outlined" />)
                    ) : (
                      <Typography color="text.secondary">No hay características registradas.</Typography>
                    )}
                  </Stack>
                </Grid>
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
            <Typography color="text.secondary" variant="body2">
              Zoom: <b>{Math.round(zoom * 100)}%</b>. Usa los botones para acercar o alejar.
            </Typography>
          </Box>
        </Dialog>
      </Container>

      {/* BOTÓN FLOTANTE (sticky) */}
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
