import React from "react";
import { Box, Container, Typography, IconButton, Stack, Divider } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import InstagramIcon from "@mui/icons-material/Instagram";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

function normalizeUrl(url) {
  if (!url) return "";
  const u = String(url).trim();
  if (!u) return "";
  // Permite mailto:, tel: y http(s)
  if (u.startsWith("mailto:") || u.startsWith("tel:")) return u;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://${u}`;
}

export default function FooterBar({
  // Texto de marca (izquierda)
  brandText = "Elaborado por @tradetechnologies",

  // Link opcional para tu marca
  brandHref = "",

  // Links del cliente
  links = {
    facebook: "",
    x: "",
    instagram: "",
  },

  // Nota opcional (derecha)
  rightNote = "Catálogo interactivo • Atención respetuosa",
}) {
  const fb = normalizeUrl(links?.facebook);
  const xx = normalizeUrl(links?.x);
  const ig = normalizeUrl(links?.instagram);
  const brandLink = normalizeUrl(brandHref);

  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 3, md: 4 },
        pb: { xs: 2.2, md: 2.5 },

        // “Glass” sobrio
        background: "linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.86) 100%)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ pt: 2 }}>
          <Divider sx={{ opacity: 0.45 }} />
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 1.2, md: 2 }}
          sx={{
            py: { xs: 1.8, md: 2.1 },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
          }}
        >
          {/* Izquierda: Marca */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            {brandLink ? (
              <Box
                component="a"
                href={brandLink}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "0.1px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {brandText}
                  </Typography>
                  <OpenInNewIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                </Stack>
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "0.1px",
                  whiteSpace: "nowrap",
                }}
              >
                {brandText}
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
              ·
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
              {new Date().getFullYear()}
            </Typography>
          </Stack>

          {/* Centro/Derecha: Nota + Redes */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1, md: 2 }}
            sx={{ alignItems: { xs: "flex-start", md: "center" } }}
          >
            {rightNote ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {rightNote}
              </Typography>
            ) : null}

            <Stack direction="row" spacing={0.6} alignItems="center">
              {fb ? (
                <IconButton
                  component="a"
                  href={fb}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  sx={{
                    border: "1px solid rgba(0,0,0,0.10)",
                    bgcolor: "rgba(255,255,255,0.9)",
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  }}
                  size="small"
                >
                  <FacebookIcon fontSize="small" />
                </IconButton>
              ) : null}

              {xx ? (
                <IconButton
                  component="a"
                  href={xx}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X"
                  sx={{
                    border: "1px solid rgba(0,0,0,0.10)",
                    bgcolor: "rgba(255,255,255,0.9)",
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  }}
                  size="small"
                >
                  <XIcon fontSize="small" />
                </IconButton>
              ) : null}

              {ig ? (
                <IconButton
                  component="a"
                  href={ig}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  sx={{
                    border: "1px solid rgba(0,0,0,0.10)",
                    bgcolor: "rgba(255,255,255,0.9)",
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  }}
                  size="small"
                >
                  <InstagramIcon fontSize="small" />
                </IconButton>
              ) : null}
            </Stack>
          </Stack>
        </Stack>

        <Box sx={{ pb: 1.2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.85 }}>
            Las marcas y enlaces de redes pueden ser configurados por el cliente. Este sitio muestra información referencial del servicio.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
