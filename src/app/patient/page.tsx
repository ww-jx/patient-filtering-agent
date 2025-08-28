import { parseCdaXml } from "@/lib/parseXml";
import PatientPageClient from "./PatientPageClient";

export default async function PatientPage() {
  const patientXml = process.env.FAKE_PATIENT_FILE;
  const profile = await parseCdaXml(patientXml!);

  return <PatientPageClient profile={profile} />;
}
