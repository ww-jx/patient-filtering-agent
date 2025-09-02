export interface PatientProfile {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  dob: string;
  gender: "male" | "female" | "other";
  country: string;
  city: string;
  conditions: string[];
}

