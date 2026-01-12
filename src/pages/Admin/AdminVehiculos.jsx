import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

async function api(path, options = {}) {
  const token = getToken();
  const r = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.message || "Error");
  return data;
}

export default function AdminVehiculos() {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const data = await api("/api/admin/vehiculos", { method: "GET" });
      setVehiculos(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      if ((e.message || "").toLowerCase().includes("no autorizado") || (e.message || "").toLowerCase().includes("token")) {
        navigate("/admin");
      }
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm("¿Eliminar este vehículo?")) return;
    try {
      await api(`/api/admin/vehiculos/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa", py: 4 }}>
      <Container maxWidth="lg">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={900}>
              Vehículos
            </Typography>
            <Typography color="text.secondary">Crea, edita o elimina vehículos del catálogo.</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<LogoutIcon />} onClick={logout}>
              Salir
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/admin/vehiculos/nuevo")}>
              Nuevo
            </Button>
          </Stack>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Marca</b></TableCell>
                  <TableCell><b>Modelo</b></TableCell>
                  <TableCell><b>Año</b></TableCell>
                  <TableCell><b>Precio</b></TableCell>
                  <TableCell><b>Acciones</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehiculos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.marca}</TableCell>
                    <TableCell>{v.modelo}</TableCell>
                    <TableCell>{v.anio ?? "-"}</TableCell>
                    <TableCell>{v.precio ?? "-"}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => navigate(`/admin/vehiculos/${v.id}`)} title="Editar">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => onDelete(v.id)} title="Eliminar">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!vehiculos.length ? (
                  <TableRow>
                    <TableCell colSpan={5}>No hay vehículos registrados.</TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
