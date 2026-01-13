import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../../lib/http"; // <-- si tu lib está en src/lib/http.js

export default function LoginAdmin() {
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const r = await fetch(apiUrl("/api/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: user.trim(), pass }),
      });

      const text = await r.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { raw: text };
      }

      if (!r.ok) throw new Error(data?.message || data?.raw || "No se pudo iniciar sesión");

      if (!data?.token) throw new Error("Token no recibido");

      localStorage.setItem("admin_token", data.token);
      navigate("/admin/planes");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 3.2 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h4" fontWeight={900}>
                  Admin
                </Typography>
                <Typography color="text.secondary">
                  Ingresa con tus credenciales para gestionar el catálogo.
                </Typography>
              </Box>

              {error ? <Alert severity="error">{error}</Alert> : null}

              <TextField
                label="Usuario"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                fullWidth
              />
              <TextField
                label="Contraseña"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                fullWidth
              />

              <Button
                variant="contained"
                size="large"
                onClick={onLogin}
                disabled={loading}
                sx={{ borderRadius: 3, fontWeight: 900 }}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
