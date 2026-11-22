import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { UserProvider } from "./context/UserContext";
import { TicketProvider } from "./context/TicketContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <TicketProvider>
          <App />
        </TicketProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);