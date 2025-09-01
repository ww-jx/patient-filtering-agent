'use client';

import PatientPageClient from "./PatientPageClient";
import type { PatientProfile } from "@/lib/types";

interface Props {
  profile: PatientProfile;
}

export default function PatientPageWrapper({ profile }: Props) {

  return <PatientPageClient profile={profile} />;
}
