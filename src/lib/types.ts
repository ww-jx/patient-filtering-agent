export interface PatientProfile {
  uuid: string;
  name: string;
  email: string;
  dob: string;
  gender: "male" | "female" | "other";
  country: string;
  city: string;
  conditions: string[];
}

export interface TrialCard {
  nctId: string;
  studyTitle: string;
  startDate: Date;
  lastUpdate: Date;
  status: string;
  summary: string;
  locations: string[];

}
