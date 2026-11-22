import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

// Keep the original sample ticket raisers available in the user selector so
// Employee mode can always filter the seeded ticket data correctly.
const employeeNames = [
  "John Smith",
  "Sarah Wilson",
  "David Brown",
  "Emily Davis",
  "Michael Scott",
  "Jessica Taylor",
  "Robert Wilson",
  "Daniel Miller",
  "Sophia Anderson",
  "James Thomas",
  "Olivia Martin",
  "William Garcia",
  "Emma Martinez",
  "Noah Robinson",
  "Ava Clark",
  // Additional demo employees used in tickets created during testing.
  "Gandharv",
  "Charan",
  "Ravi",
  "Kiran",
];

const employees = employeeNames.map((name, index) => ({
  id: `emp-${index + 1}`,
  name,
  role: "Employee",
}));

// These names match the existing assignedTo values in the sample data.
const supportStaff = [
  { id: "support-1", name: "Alex Morgan", role: "IT Support Staff" },
  { id: "support-2", name: "Priya Sharma", role: "IT Support Staff" },
  { id: "support-3", name: "Rahul Kumar", role: "IT Support Staff" },
  { id: "support-4", name: "Support Agent 4", role: "IT Support Staff" },
  { id: "support-5", name: "Support Agent 5", role: "IT Support Staff" },
];

const users = [...employees, ...supportStaff];

export function UserProvider({ children }) {
  const [selectedUserId, setSelectedUserId] = useState(employees[0].id);

  const selectedUser = users.find(
    (user) => user.id === selectedUserId
  );

  const value = {
    users,
    employees,
    supportStaff,
    selectedUser,
    selectedUserId,
    setSelectedUserId,
    userRole: selectedUser?.role || "Employee",
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}
