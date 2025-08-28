//parses ccda xml and returns patient profile
import fs from "fs";
import { parseStringPromise } from "xml2js";

export interface PatientProfile {
  name: string;
  city: string;
  state: string;
  postalCode: string;
  fileName: string;
}

export async function parseCdaXml(filePath: string): Promise<PatientProfile> {
  const xmlData = fs.readFileSync(filePath, "utf-8");

  const parsed = await parseStringPromise(xmlData, {
    explicitArray: false,
    tagNameProcessors: [(name: string) => name.replace(/^.*:/, "")], // strip namespace prefixes
  });

  const doc = parsed.ClinicalDocument;
  const patientRole = doc.recordTarget.patientRole;

  const given = patientRole.patient.name.given;
  const family = patientRole.patient.name.family;
  const name = `${given} ${family}`;

  const city = patientRole.addr.city || "";
  const state = patientRole.addr.state || "";
  const postalCode = patientRole.addr.postalCode || "";

  return {
    name,
    city,
    state,
    postalCode,
    fileName: filePath,
  };
}
