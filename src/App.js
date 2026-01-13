// frontend/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Listado from "./pages/Listado";
import Detalle from "./pages/Detalle";

import LoginAdmin from "./pages/Admin/LoginAdmin";
import AdminVehiculos from "./pages/Admin/AdminVehiculos";
import FormVehiculo from "./pages/Admin/FormVehiculo";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<Listado />} />
        <Route path="/vehiculo/:id" element={<Detalle />} />

        {/* Admin */}
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route path="/admin/vehiculos" element={<AdminVehiculos />} />
        <Route path="/admin/vehiculos/nuevo" element={<FormVehiculo />} />
        <Route path="/admin/vehiculos/:id" element={<FormVehiculo />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
