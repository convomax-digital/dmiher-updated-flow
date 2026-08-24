import { createContext, useContext, useState } from "react";

/**
 * Shares the active "faculty" between the two independent SAS sections so the
 * page behaves like the live site:
 *
 *   - TabBaseImageContent ("OUR FACULTIES UNDER SAS") sets the active faculty
 *     when a tab is clicked (via each tab's `program_key`).
 *   - ProgramsSection ("OUR PROGRAMS") reads it and points its UG/PG/PhD
 *     buttons at that faculty's programs (?f=<key>).
 *
 * Only SAS wires this up today; every other page leaves facultyKey null and the
 * two sections keep their original standalone behaviour.
 */
const ProgramFacultyContext = createContext(null);

export function ProgramFacultyProvider({ children }) {
  const [facultyKey, setFacultyKey] = useState(null);
  return (
    <ProgramFacultyContext.Provider value={{ facultyKey, setFacultyKey }}>
      {children}
    </ProgramFacultyContext.Provider>
  );
}

// Safe outside a provider: returns inert no-ops so sections never crash.
export function useProgramFaculty() {
  return useContext(ProgramFacultyContext) || { facultyKey: null, setFacultyKey: () => {} };
}

export default ProgramFacultyContext;
