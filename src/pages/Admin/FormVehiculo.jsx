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
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "";

function resolveImg(src) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads/") && API_BASE) return `${API_BASE}${src}`;
  return src;
}

export default function FormVehiculo() {
  const navigate = useNavigate();
  const { id } = useParams();

  // IMPORTANTE: /admin/vehiculos/nuevo no trae id por params
  const isNew = !id || id === "nuevo";

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    descripcionCorta: "",
    incluyeText: "", // multiline
    ataudesText: "", // separado por coma
    tagsText: "", // separado por coma
    precio: "",
    activo: true,

    // fotos con caption
    fotoPrincipal: { src: "", titulo: "" },
    galeria: [], // [{src,titulo}]
  });

  // Cargar plan (edición)
  useEffect(() => {
    (async () => {
      if (isNew) return;
      try {
        const list = await api(`/api/admin/vehiculos`, { method: "GET" });
        const found = (Array.isArray(list) ? list : []).find((x) => x.id === id);
        if (!found) throw new Error("No encontrado");

        setForm({
          nombre: found.nombre || "",
          descripcionCorta: found.descripcionCorta || "",
          incluyeText: Array.isArray(found.incluye) ? found.incluye.join("\n") : "",
          ataudesText: Array.isArray(found.ataudes) ? found.ataudes.join(", ") : "",
          tagsText: Array.isArray(found.tags) ? found.tags.join(", ") : "",
          precio: found.precio ?? "",
          activo: found.activo === false ? false : true,

          fotoPrincipal:
            found.fotoPrincipal && typeof found.fotoPrincipal === "object"
              ? { src: found.fotoPrincipal.src || "", titulo: found.fotoPrincipal.titulo || "" }
              : { src: "", titulo: "" },

          galeria: Array.isArray(found.galeria)
            ? found.galeria
                .filter((g) => g && typeof g === "object")
                .map((g) => ({ src: g.src || "", titulo: g.titulo || "" }))
                .filter((g) => g.src)
            : [],
        });
      } catch (e) {
        setError(e.message);
      }
    })();
    // eslint-disable-next-line
  }, [id, isNew]);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  // Upload multiple con token (Bearer) directo al backend
  const uploadGallery = async (files) => {
    setError("");

    if (!API_BASE) throw new Error("REACT_APP_API_URL no está configurado.");
    const token = localStorage.getItem("admin_token") || "";
    if (!token) throw new Error("No autorizado");

    const fd = new FormData();
    for (const f of files) fd.append("files", f);

    const r = await fetch(`${API_BASE}/api/upload/multiple`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.message || "Error al subir imágenes");
    return data.paths || [];
  };

  // Lista de fotos a mostrar: principal + galería (sin duplicados)
  const allFotos = useMemo(() => {
    const uniq = new Set();
    const out = [];

    const add = (src) => {
      if (!src) return;
      if (uniq.has(src)) return;
      uniq.add(src);
      out.push(src);
    };

    add(form.fotoPrincipal?.src);
    (Array.isArray(form.galeria) ? form.galeria : []).forEach((g) => add(g.src));
    return out;
  }, [form.fotoPrincipal, form.galeria]);

  // helper para obtener caption por src
  const getCaptionBySrc = (src) => {
    if (!src) return "";
    if (form.fotoPrincipal?.src === src) return form.fotoPrincipal?.titulo || "";
    const g = (Array.isArray(form.galeria) ? form.galeria : []).find((x) => x.src === src);
    return g?.titulo || "";
  };

  // set caption por src (si es principal, actualiza principal; si es galería, actualiza ese item)
  const setCaptionBySrc = (src, titulo) => {
    setForm((p) => {
      if (p.fotoPrincipal?.src === src) {
        return { ...p, fotoPrincipal: { ...p.fotoPrincipal, titulo } };
      }
      const galeria = (Array.isArray(p.galeria) ? p.galeria : []).map((g) =>
        g.src === src ? { ...g, titulo } : g
      );
      return { ...p, galeria };
    });
  };

  // set principal por src (mantiene caption existente si lo hay)
  const setPrincipal = (src) => {
    setForm((p) => {
      const caption = getCaptionBySrc(src);
      const gal = Array.isArray(p.galeria) ? p.galeria : [];

      // asegurar que esté en galería
      const exists = gal.some((x) => x.src === src);
      const newGal = exists ? gal : [{ src, titulo: caption }, ...gal];

      return {
        ...p,
        fotoPrincipal: { src, titulo: caption },
        galeria: newGal,
      };
    });
  };

  const removeFoto = (src) => {
    setForm((p) => {
      const newGaleria = (Array.isArray(p.galeria) ? p.galeria : []).filter((x) => x.src !== src);

      let newPrincipal = p.fotoPrincipal;
      if (p.fotoPrincipal?.src === src) {
        const candidate = newGaleria[0] || null;
        newPrincipal = candidate ? { src: candidate.src, titulo: candidate.titulo || "" } : { src: "", titulo: "" };
      }

      return {
        ...p,
        fotoPrincipal: newPrincipal,
        galeria: newGaleria,
      };
    });
  };

  const onSave = async () => {
    setError("");
    setSaving(true);

    try {
      const incluye = form.incluyeText
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

      const ataudes = form.ataudesText
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      const tags = form.tagsText
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      const payload = {
        nombre: form.nombre.trim(),
        descripcionCorta: form.descripcionCorta.trim(),
        incluye,
        ataudes,
        tags,
        precio: form.precio === "" ? null : Number(form.precio),
        activo: Boolean(form.activo),

        fotoPrincipal: {
          src: String(form.fotoPrincipal?.src || "").trim(),
          titulo: String(form.fotoPrincipal?.titulo || "").trim(),
        },

        galeria: (Array.isArray(form.galeria) ? form.galeria : [])
          .map((g) => ({
            src: String(g.src || "").trim(),
            titulo: String(g.titulo || "").trim(),
          }))
          .filter((g) => g.src),
      };

      if (!payload.nombre) throw new Error("El nombre del plan es obligatorio.");

      // consistencia: si hay fotoPrincipal, que exista en galería
      if (payload.fotoPrincipal.src && !payload.galeria.some((g) => g.src === payload.fotoPrincipal.src)) {
        payload.galeria = [{ ...payload.fotoPrincipal }, ...payload.galeria];
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

  const chipsIncluye = form.incluyeText
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 8);

  const chipsAtaudes = form.ataudesText
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
              {isNew ? "Nuevo Plan Funerario" : "Editar Plan Funerario"}
            </Typography>
            <Typography color="text.secondary">Configura incluye, ataúdes y fotos con pie de foto.</Typography>
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
              <Grid item xs={12}>
                <TextField label="Nombre del plan *" value={form.nombre} onChange={set("nombre")} fullWidth />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Descripción corta"
                  value={form.descripcionCorta}
                  onChange={set("descripcionCorta")}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Incluye (1 por línea)"
                  value={form.incluyeText}
                  onChange={set("incluyeText")}
                  fullWidth
                  multiline
                  minRows={4}
                  helperText="Ejemplo: Preparación tanatológica ↵ Traslado de cuerpo ↵ Velación..."
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  {chipsIncluye.map((c, idx) => (
                    <Chip key={idx} label={c} size="small" />
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Ataúdes (separados por coma)"
                  value={form.ataudesText}
                  onChange={set("ataudesText")}
                  fullWidth
                  helperText="Ejemplo: REDONDO, AMADEUS, JERUSALEN"
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  {chipsAtaudes.map((c, idx) => (
                    <Chip key={idx} label={c} size="small" />
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField label="Precio (opcional)" value={form.precio} onChange={set("precio")} fullWidth />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(form.activo)}
                      onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))}
                    />
                  }
                  label="Activo (visible al público)"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Tags (separados por coma)"
                  value={form.tagsText}
                  onChange={set("tagsText")}
                  fullWidth
                  helperText="Ejemplo: Campo Fe, Lujo"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
                  Fotos (con pie de foto)
                </Typography>

                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Sube imágenes, marca una como <b>Principal</b>. En cada foto escribe el texto que irá como pie de foto.
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
                          const curr = Array.isArray(p.galeria) ? p.galeria : [];
                          const merged = [...curr];

                          for (const src of paths) {
                            if (!src) continue;
                            if (!merged.some((x) => x.src === src)) merged.push({ src, titulo: "" });
                          }

                          // si no hay principal, toma la primera subida
                          const principalSrc = p.fotoPrincipal?.src || paths[0] || "";
                          const principalTitulo =
                            (principalSrc === p.fotoPrincipal?.src ? p.fotoPrincipal?.titulo : "") || "";

                          return {
                            ...p,
                            fotoPrincipal: principalSrc ? { src: principalSrc, titulo: principalTitulo } : { src: "", titulo: "" },
                            galeria: merged.some((x) => x.src === principalSrc) || !principalSrc
                              ? merged
                              : [{ src: principalSrc, titulo: principalTitulo }, ...merged],
                          };
                        });

                        e.target.value = "";
                      } catch (err) {
                        setError(err.message);
                      }
                    }}
                  />
                </Button>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {allFotos.map((src, idx) => {
                    const isPrincipal = src === form.fotoPrincipal?.src;
                    const viewSrc = resolveImg(src);
                    const caption = getCaptionBySrc(src);

                    return (
                      <Grid item xs={12} sm={6} md={4} key={src + idx}>
                        <Box
                          sx={{
                            borderRadius: 2,
                            overflow: "hidden",
                            border: isPrincipal ? "2px solid #000" : "1px solid #eee",
                            bgcolor: "white",
                          }}
                        >
                          <img
                            src={viewSrc}
                            alt={`foto-${idx}`}
                            style={{ width: "100%", height: 190, objectFit: "cover", display: "block" }}
                          />

                          <Box sx={{ p: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Button size="small" variant={isPrincipal ? "contained" : "outlined"} onClick={() => setPrincipal(src)}>
                                {isPrincipal ? "Principal" : "Hacer Principal"}
                              </Button>

                              <Button size="small" variant="contained" onClick={() => removeFoto(src)}>
                                Eliminar
                              </Button>
                            </Stack>

                            <TextField
                              label="Pie de foto"
                              value={caption}
                              onChange={(e) => setCaptionBySrc(src, e.target.value)}
                              fullWidth
                              size="small"
                              placeholder="Ej: Servicio de Cargadores"
                            />
                          </Box>
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

                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Button variant="contained" size="large" onClick={onSave} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar Plan"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
