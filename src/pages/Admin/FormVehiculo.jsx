import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../utils/api";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Stack,
  Alert,
  Chip,
  Checkbox,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "";

function resolveImg(src) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  // Si el backend sirve /uploads como estático, resolvemos contra API_BASE
  if (src.startsWith("/uploads/") && API_BASE) return `${API_BASE}${src}`;

  return src;
}

export default function FormVehiculo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id || id === "nuevo";


  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    anio: "",
    precio: "",
    kilometraje: "",
    transmision: "",
    combustible: "",
    color: "",
    pasajeros: "",
    fotoPrincipal: "",
    galeriaFotos: [],
    caracteristicasText: "",
  });

  useEffect(() => {
    (async () => {
      if (isNew) return;
      try {
        // Carga lista y ubica el vehículo por id (backend actual expone listado admin)
        const v = await api(`/api/admin/vehiculos`, { method: "GET" });
        const found = (Array.isArray(v) ? v : []).find((x) => x.id === id);
        if (!found) throw new Error("No encontrado");

        setForm({
          marca: found.marca || "",
          modelo: found.modelo || "",
          anio: found.anio ?? "",
          precio: found.precio ?? "",
          kilometraje: found.kilometraje ?? "",
          transmision: found.transmision || "",
          combustible: found.combustible || "",
          color: found.color || "",
          pasajeros: found.pasajeros ?? "",
          fotoPrincipal: found.fotoPrincipal || "",
          galeriaFotos: Array.isArray(found.galeriaFotos) ? found.galeriaFotos : [],
          caracteristicasText: (found.caracteristicas || []).join(", "),
        });
      } catch (e) {
        setError(e.message);
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const uploadGallery = async (files) => {
    setError("");

    if (!API_BASE) {
      throw new Error("REACT_APP_API_URL no está configurado en el frontend.");
    }

    const token = localStorage.getItem("admin_token") || "";
    if (!token) throw new Error("No autorizado");

    const fd = new FormData();
    for (const f of files) fd.append("files", f);

    const r = await fetch(`${API_BASE}/api/upload/multiple`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: fd,
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.message || "Error al subir imágenes de galería");
    return data.paths || [];
  };

  const allFotos = useMemo(() => {
    const uniq = new Set();
    const out = [];
    const add = (x) => {
      if (!x) return;
      if (uniq.has(x)) return;
      uniq.add(x);
      out.push(x);
    };

    add(form.fotoPrincipal);
    (form.galeriaFotos || []).forEach(add);

    return out;
  }, [form.fotoPrincipal, form.galeriaFotos]);

  const setPrincipal = (src) => {
    setForm((p) => ({
      ...p,
      fotoPrincipal: src,
      galeriaFotos: (() => {
        const curr = Array.isArray(p.galeriaFotos) ? p.galeriaFotos : [];
        if (!src) return curr;
        return curr.includes(src) ? curr : [src, ...curr];
      })(),
    }));
  };

  const removeFoto = (src) => {
    setForm((p) => {
      const newGaleria = (Array.isArray(p.galeriaFotos) ? p.galeriaFotos : []).filter((x) => x !== src);

      let newPrincipal = p.fotoPrincipal;
      if (p.fotoPrincipal === src) {
        newPrincipal = newGaleria[0] || "";
      }

      return {
        ...p,
        fotoPrincipal: newPrincipal,
        galeriaFotos: newGaleria,
      };
    });
  };

  const onSave = async () => {
    setError("");
    setSaving(true);

    try {
      const payload = {
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        anio: form.anio === "" ? null : Number(form.anio),
        precio: form.precio === "" ? null : Number(form.precio),
        kilometraje: form.kilometraje === "" ? null : Number(form.kilometraje),
        transmision: form.transmision.trim(),
        combustible: form.combustible.trim(),
        color: form.color.trim(),
        pasajeros: form.pasajeros === "" ? null : Number(form.pasajeros),
        fotoPrincipal: form.fotoPrincipal.trim(),
        galeriaFotos: Array.isArray(form.galeriaFotos) ? form.galeriaFotos : [],
        caracteristicas: form.caracteristicasText
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      };

      if (!payload.marca || !payload.modelo) {
        throw new Error("Marca y Modelo son obligatorios.");
      }

      // Asegura consistencia: principal dentro de galería
      if (payload.fotoPrincipal && !payload.galeriaFotos.includes(payload.fotoPrincipal)) {
        payload.galeriaFotos = [payload.fotoPrincipal, ...payload.galeriaFotos];
      }

      if (isNew) {
        await api("/api/admin/vehiculos", { method: "POST", body: JSON.stringify(payload) });
      } else {
        await api(`/api/admin/vehiculos/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      }

      navigate("/admin/vehiculos");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const chips = form.caracteristicasText
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 8);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa", py: 4 }}>
      <Container maxWidth="md">
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={900}>
              {isNew ? "Nuevo Vehículo" : "Editar Vehículo"}
            </Typography>
            <Typography color="text.secondary">Sube fotos, marca una como principal y gestiona características.</Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate("/admin/vehiculos")}>
            Volver
          </Button>
        </Stack>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Marca *" value={form.marca} onChange={set("marca")} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Modelo *" value={form.modelo} onChange={set("modelo")} fullWidth />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField label="Año" value={form.anio} onChange={set("anio")} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Precio (USD)" value={form.precio} onChange={set("precio")} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Kilometraje" value={form.kilometraje} onChange={set("kilometraje")} fullWidth />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField label="Transmisión" value={form.transmision} onChange={set("transmision")} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Combustible" value={form.combustible} onChange={set("combustible")} fullWidth />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Color" value={form.color} onChange={set("color")} fullWidth />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField label="Pasajeros" value={form.pasajeros} onChange={set("pasajeros")} fullWidth />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
                  Fotos
                </Typography>

                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Sube imágenes, verás miniaturas. Marca una como <b>Principal</b>. Para un vehículo nuevo, la primera foto subida será la principal.
                </Typography>

                <Button variant="outlined" component="label">
                  Subir fotos (galería)
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      try {
                        const files = Array.from(e.target.files || []);
                        if (!files.length) return;

                        const paths = await uploadGallery(files);

                        setForm((p) => {
                          const curr = Array.isArray(p.galeriaFotos) ? p.galeriaFotos : [];
                          const merged = [...curr];

                          for (const pth of paths) {
                            if (pth && !merged.includes(pth)) merged.push(pth);
                          }

                          // si no hay principal, toma la primera subida
                          const principal = p.fotoPrincipal || (paths[0] || "");

                          return {
                            ...p,
                            fotoPrincipal: principal,
                            galeriaFotos: merged.includes(principal) || !principal ? merged : [principal, ...merged],
                          };
                        });

                        e.target.value = "";
                      } catch (err) {
                        setError(err.message);
                      }
                    }}
                  />
                </Button>

                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {allFotos.map((src, idx) => {
                    const checked = src === form.fotoPrincipal;
                    const viewSrc = resolveImg(src);

                    return (
                      <Grid item xs={6} sm={4} md={3} key={src + idx}>
                        <Box
                          sx={{
                            borderRadius: 2,
                            overflow: "hidden",
                            border: checked ? "2px solid #000" : "1px solid #eee",
                            position: "relative",
                            bgcolor: "white",
                          }}
                        >
                          <img
                            src={viewSrc}
                            alt={`foto-${idx}`}
                            style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }}
                          />

                          <Box
                            sx={{
                              position: "absolute",
                              left: 8,
                              top: 8,
                              bgcolor: "rgba(255,255,255,0.92)",
                              borderRadius: 2,
                              px: 1,
                              py: 0.2,
                            }}
                          >
                            <FormControlLabel
                              control={<Checkbox checked={checked} onChange={() => setPrincipal(src)} size="small" />}
                              label="Principal"
                              sx={{ m: 0 }}
                            />
                          </Box>

                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => removeFoto(src)}
                            sx={{
                              position: "absolute",
                              right: 8,
                              top: 8,
                              minWidth: "auto",
                              padding: "4px 8px",
                            }}
                          >
                            X
                          </Button>
                        </Box>
                      </Grid>
                    );
                  })}

                  {!allFotos.length ? (
                    <Grid item xs={12}>
                      <Typography color="text.secondary" sx={{ mt: 1 }}>
                        Aún no hay fotos cargadas.
                      </Typography>
                    </Grid>
                  ) : null}
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Ruta foto principal"
                    value={form.fotoPrincipal}
                    onChange={set("fotoPrincipal")}
                    fullWidth
                    helperText="Se actualiza automáticamente al marcar 'Principal'."
                  />
                </Box>

                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Características (separadas por coma)"
                  value={form.caracteristicasText}
                  onChange={set("caracteristicasText")}
                  fullWidth
                  helperText="Ejemplo: Asientos premium, Iluminación interior, Plataforma reforzada"
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  {chips.map((c, idx) => (
                    <Chip key={idx} label={c} size="small" />
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" size="large" onClick={onSave} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
