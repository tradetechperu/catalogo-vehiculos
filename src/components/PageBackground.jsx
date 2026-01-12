import React from "react";
import { Box } from "@mui/material";

export default function PageBackground({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",

        // Fondo
        backgroundImage: "url(/assets/backgrounds/campo-fe-bg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: { xs: "scroll", md: "fixed" },

        // Importante: NO usar overflow aquí si quieres sticky
        // overflow: "hidden",
      }}
    >
      {/* Overlay (mejor UX: degradado suave, no plano) */}
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, rgba(250,250,250,0.92) 0%, rgba(250,250,250,0.88) 45%, rgba(250,250,250,0.92) 100%)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
