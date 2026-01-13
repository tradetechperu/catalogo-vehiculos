import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Admin
import LoginAdmin from "./pages/Admin/LoginAdmin";
import AdminPlanes from "./pages/Admin/AdminPlanes";
import FormPlan from "./pages/Admin/FormPlan";

// Público
import Listado from "./pages/Listado";
import Detalle from "./pages/Detalle";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Listado />} />
        <Route path="/plan/:id" element={<Detalle />} />

        {/* Admin */}
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route path="/admin/planes" element={<AdminPlanes />} />
        <Route path="/admin/planes/nuevo" element={<FormPlan />} />
        <Route path="/admin/planes/:id" element={<FormPlan />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
