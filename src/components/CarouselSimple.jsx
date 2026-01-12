import React, { useMemo, useState, useEffect } from "react";
import { Box, IconButton, Stack } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const BACKEND = process.env.REACT_APP_BACKEND_ORIGIN || "";

/**
 * Resuelve rutas tipo /uploads/... para que apunten al backend en desarrollo.
 * Evita que React (3000) devuelva index.html como si fuese imagen (causa del "infinito").
 */
function resolveImg(src) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (BACKEND && src.startsWith("/uploads/")) return `${BACKEND}${src}`;
  return src;
}

/**
 * Carrusel simple:
 * - Orden: principal -> galería (sin duplicados)
 * - Flechas + puntos
 * - Miniaturas clicables
 * - Click en imagen abre zoom si se pasa onOpenZoom
 */
export default function CarouselSimple({
  principal,
  fotos = [],
  height = 420,
  showThumbnails = true,
  onOpenZoom,
}) {
  const items = useMemo(() => {
    const uniq = new Set();
    const out = [];
    const add = (x) => {
      if (!x) return;
      if (uniq.has(x)) return;
      uniq.add(x);
      out.push(x);
    };

    add(principal);
    (Array.isArray(fotos) ? fotos : []).forEach(add);

    return out;
  }, [principal, fotos]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= items.length) setIdx(0);
    // eslint-disable-next-line
  }, [items.length]);

  const hasMany = items.length > 1;

  const prev = () => setIdx((p) => (p - 1 + items.length) % items.length);
  const next = () => setIdx((p) => (p + 1) % items.length);

  if (!items.length) {
    return (
      <Box
        sx={{
          width: "100%",
          height,
          bgcolor: "#f1f1f1",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Box sx={{ color: "#777", fontWeight: 700 }}>Sin imágenes</Box>
      </Box>
    );
  }

  const activeSrc = resolveImg(items[idx]);

  return (
    <Box>
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <img
          src={activeSrc}
          alt={`foto-${idx}`}
          onClick={() => onOpenZoom && onOpenZoom(activeSrc)}
          style={{
            width: "100%",
            height,
            objectFit: "cover",
            display: "block",
            cursor: onOpenZoom ? "zoom-in" : "default",
          }}
        />

        {hasMany && (
          <>
            <IconButton
              onClick={prev}
              aria-label="Anterior"
              sx={{
                position: "absolute",
                top: "50%",
                left: 10,
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.92)",
              }}
            >
              <ChevronLeftIcon />
            </IconButton>

            <IconButton
              onClick={next}
              aria-label="Siguiente"
              sx={{
                position: "absolute",
                top: "50%",
                right: 10,
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.92)",
              }}
            >
              <ChevronRightIcon />
            </IconButton>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                position: "absolute",
                bottom: 12,
                left: "50%",
                transform: "translateX(-50%)",
                bgcolor: "rgba(0,0,0,0.35)",
                px: 1.5,
                py: 0.8,
                borderRadius: 99,
              }}
            >
              {items.map((_, i) => (
                <Box
                  key={i}
                  onClick={() => setIdx(i)}
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    cursor: "pointer",
                    bgcolor: i === idx ? "white" : "rgba(255,255,255,0.45)",
                  }}
                />
              ))}
            </Stack>
          </>
        )}
      </Box>

      {showThumbnails && hasMany && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            p: 1,
            bgcolor: "white",
            borderTop: "1px solid #eee",
            overflowX: "auto",
          }}
        >
          {items.map((src, i) => {
            const thumbSrc = resolveImg(src);
            return (
              <Box
                key={src + i}
                onClick={() => setIdx(i)}
                sx={{
                  flex: "0 0 auto",
                  width: 92,
                  height: 62,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: i === idx ? "2px solid #000" : "1px solid #ddd",
                  cursor: "pointer",
                  bgcolor: "#fff",
                }}
              >
                <img
                  src={thumbSrc}
                  alt={`thumb-${i}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
