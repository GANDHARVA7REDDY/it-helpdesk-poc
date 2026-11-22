import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import TicketManagementPage from "./pages/TicketManagementPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import EditTicketPage from "./pages/EditTicketPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<DashboardPage />} />

        <Route path="tickets" element={<TicketManagementPage />} />

        <Route path="create-ticket" element={<CreateTicketPage />} />

        <Route path="tickets/:ticketId" element={<TicketDetailsPage />} />

        <Route path="tickets/:ticketId/edit" element={<EditTicketPage />} />
      </Route>
    </Routes>
  );
}