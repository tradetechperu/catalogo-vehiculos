import React, { useState } from "react";
import { Box, Container, Typography, TextField, Button, Card, CardContent, Stack, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const navigate = useNavigate();
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("admin123");
  const [error, setError] = useState("");

  const onLogin = async () => {
    setError("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, pass }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.message || "Error");

      localStorage.setItem("admin_token", data.token);
      navigate("/admin/vehiculos");
    } catch (e) {
      setError(e.message || "No se pudo iniciar sesión");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
          Panel Admin
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Ingresa para gestionar vehículos del catálogo.
        </Typography>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              {error ? <Alert severity="error">{error}</Alert> : null}

              <TextField label="Usuario" value={user} onChange={(e) => setUser(e.target.value)} fullWidth />
              <TextField
                label="Contraseña"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                fullWidth
              />

              <Button variant="contained" size="large" onClick={onLogin}>
                Ingresar
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
