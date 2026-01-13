import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
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
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

export default function AdminVehiculos() {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      // Opción A: mantenemos endpoint /vehiculos, pero ahora devuelve planes
      const data = await api("/api/admin/vehiculos", { method: "GET" });
      setPlanes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      const msg = (e.message || "").toLowerCase();
      if (msg.includes("no autorizado") || msg.includes("token")) {
        navigate("/admin");
      }
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm("¿Eliminar este plan?")) return;
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
              Planes Funerarios
            </Typography>
            <Typography color="text.secondary">
              Crea, edita o elimina planes. Se guardan en <b>planes.json</b>.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<LogoutIcon />} onClick={logout}>
              Salir
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/admin/vehiculos/nuevo")}>
              Nuevo Plan
            </Button>
          </Stack>
        </Stack>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Nombre</b>
                  </TableCell>
                  <TableCell>
                    <b>Incluye</b>
                  </TableCell>
                  <TableCell>
                    <b>Ataúdes</b>
                  </TableCell>
                  <TableCell>
                    <b>Activo</b>
                  </TableCell>
                  <TableCell>
                    <b>Acciones</b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {planes.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <b>{p.nombre}</b>
                      {p.descripcionCorta ? (
                        <Typography variant="body2" color="text.secondary">
                          {p.descripcionCorta}
                        </Typography>
                      ) : null}
                    </TableCell>

                    <TableCell>
                      {(Array.isArray(p.incluye) ? p.incluye : [])
                        .slice(0, 3)
                        .map((x, idx) => (
                          <Typography key={idx} variant="body2">
                            • {x}
                          </Typography>
                        ))}
                      {(Array.isArray(p.incluye) ? p.incluye.length : 0) > 3 ? (
                        <Typography variant="body2" color="text.secondary">
                          + más...
                        </Typography>
                      ) : null}
                    </TableCell>

                    <TableCell>
                      {(Array.isArray(p.ataudes) ? p.ataudes : []).slice(0, 3).map((a, idx) => (
                        <Chip key={idx} label={a} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                      {(Array.isArray(p.ataudes) ? p.ataudes.length : 0) > 3 ? (
                        <Chip label="+ más" size="small" />
                      ) : null}
                    </TableCell>

                    <TableCell>{p.activo === false ? "No" : "Sí"}</TableCell>

                    <TableCell>
                      <IconButton onClick={() => navigate(`/admin/vehiculos/${p.id}`)} title="Editar">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => onDelete(p.id)} title="Eliminar">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {!planes.length ? (
                  <TableRow>
                    <TableCell colSpan={5}>No hay planes registrados.</TableCell>
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