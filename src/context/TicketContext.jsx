
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import sampleTickets from "../data/sampleTickets";

const TicketContext = createContext(null);

const STORAGE_KEY = "it-helpdesk-tickets";

// Load saved tickets, or use sample tickets initially
function getInitialTickets() {
  try {
    const savedTickets = localStorage.getItem(STORAGE_KEY);

    if (savedTickets !== null) {
      const parsedTickets = JSON.parse(savedTickets);

      if (Array.isArray(parsedTickets)) {
        return parsedTickets;
      }
    }
  } catch (error) {
    console.error("Unable to load tickets:", error);
  }

  return sampleTickets;
}

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState(getInitialTickets);

  // Save whenever the tickets change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tickets)
      );
    } catch (error) {
      console.error("Unable to save tickets:", error);
    }
  }, [tickets]);

  // Add a new ticket
  const addTicket = (newTicket) => {
    setTickets((previousTickets) => [
      newTicket,
      ...previousTickets,
    ]);
  };

  // Update an existing ticket
  const updateTicket = (ticketId, updatedFields) => {
    setTickets((previousTickets) =>
      previousTickets.map((ticket) =>
        String(ticket.id ?? ticket.ticketId) === String(ticketId)
          ? { ...ticket, ...updatedFields }
          : ticket
      )
    );
  };

  // Delete a ticket
  const deleteTicket = (ticketId) => {
    setTickets((previousTickets) =>
      previousTickets.filter(
        (ticket) => String(ticket.id ?? ticket.ticketId) !== String(ticketId)
      )
    );
  };

  // Find one ticket
  const getTicketById = (ticketId) => {
    return tickets.find(
      (ticket) => String(ticket.id ?? ticket.ticketId) === String(ticketId)
    );
  };

  const value = {
    tickets,
    addTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
}

// Custom hook to access ticket context
export function useTickets() {
  const context = useContext(TicketContext);

  if (!context) {
    throw new Error(
      "useTickets must be used inside TicketProvider"
    );
  }

  return context;
}
