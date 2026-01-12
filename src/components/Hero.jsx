import React, { useMemo } from "react";
import { Box, Container, Typography, Button, Stack, Chip } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const WHATSAPP_PHONE = (process.env.REACT_APP_WHATSAPP_PHONE || "").replace(/\D/g, "");

function buildWhatsappLink({ phone, text }) {
  const msg = encodeURIComponent(text || "");
  if (!phone) return "";
  return `https://wa.me/${phone}?text=${msg}`;
}

export default function Hero({ title, subtitle, onContact }) {
  const defaultTitle = "Acompañamiento digno\nen momentos difíciles";
  const defaultSubtitle =
    "Catálogo de vehículos funerarios. Coordinación rápida, atención clara y servicio profesional.";

  const waText = useMemo(() => {
    return [
      "Hola, necesito coordinar un servicio de transporte funerario.",
      "¿Me brindan disponibilidad y costos?",
    ].join("\n");
  }, []);

  const waLink = useMemo(() => buildWhatsappLink({ phone: WHATSAPP_PHONE, text: waText }), [waText]);

  return (
    <Box
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        minHeight: { xs: 340, md: 420 },
        bgcolor: "#111",
      }}
    >
      {/* Background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/assets/hero/hero-funerario.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(0.95)",
          transform: "scale(1.02)",
        }}
      />

      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.50) 40%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          py: { xs: 5, md: 7 },
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 720 }}>
          <Typography
            variant="h3"
            fontWeight={900}
            color="white"
            sx={{
              whiteSpace: "pre-line",
              lineHeight: 1.05,
              letterSpacing: "-0.5px",
              fontSize: { xs: 34, md: 52 },
            }}
          >
            {title || defaultTitle}
          </Typography>

          <Typography
            color="rgba(255,255,255,0.88)"
            sx={{ fontSize: { xs: 14.5, md: 17 } }}
          >
            {subtitle || defaultSubtitle}
          </Typography>

          {/* Trust chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
            <Chip
              icon={<VerifiedUserIcon />}
              label="Servicio profesional"
              sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "white" }}
            />
            <Chip
              icon={<AccessTimeIcon />}
              label="Atención rápida"
              sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "white" }}
            />
            <Chip
              icon={<LocalShippingIcon />}
              label="Coordinación clara"
              sx={{ bgcolor: "rgba(255,255,255,0.16)", color: "white" }}
            />
          </Stack>

          {/* CTA */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ pt: 1 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<WhatsAppIcon />}
              disabled={!WHATSAPP_PHONE}
              onClick={() => {
                if (onContact) return onContact();
                if (!waLink) return;
                window.open(waLink, "_blank", "noopener,noreferrer");
              }}
              sx={{
                borderRadius: 3,
                py: 1.2,
                fontWeight: 900,
                width: { xs: "100%", sm: "fit-content" },
              }}
            >
              Coordinar por WhatsApp
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                const el = document.getElementById("catalogo-grid");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              sx={{
                borderRadius: 3,
                py: 1.2,
                fontWeight: 900,
                color: "white",
                borderColor: "rgba(255,255,255,0.55)",
                "&:hover": { borderColor: "white" },
                width: { xs: "100%", sm: "fit-content" },
              }}
            >
              Ver catálogo
            </Button>
          </Stack>

          <Typography color="rgba(255,255,255,0.75)" variant="body2" sx={{ pt: 0.5 }}>
            Si lo deseas, indícanos distrito, horario y si requieres chofer.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
