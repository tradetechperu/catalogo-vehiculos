import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/admin/vehiculos" element={<AdminVehiculos />} />
        <Route path="/admin/vehiculos/:id" element={<FormVehiculo />} />
      </Routes>
    </BrowserRouter>
  );
}
