import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ nctId: string }> } // <-- note Promise here
) {
  // await the params
  const { nctId } = await context.params;

  try {
    const apiUrl = `https://clinicaltrials.gov/api/v2/studies/${nctId}?format=json&markupFormat=markdown`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch study: ${nctId}` }, { status: res.status });
    }

    const data = await res.json();

    // build a fully typed study object
    const study = {
      protocolSection: {
        identificationModule: {
          nctId: data.protocolSection?.identificationModule?.nctId ?? '',
          briefTitle: data.protocolSection?.identificationModule?.briefTitle ?? '',
          officialTitle: data.protocolSection?.identificationModule?.officialTitle ?? '',
          organization: {
            fullName: data.protocolSection?.identificationModule?.organization?.fullName ?? '',
          },
        },
        descriptionModule: {
          briefSummary: data.protocolSection?.descriptionModule?.briefSummary ?? '',
          detailedSummary: data.protocolSection?.descriptionModule?.detailedDescription ?? '',
        },
        statusModule: {
          overallStatus: data.protocolSection?.statusModule?.overallStatus ?? '',
          startDate: data.protocolSection?.statusModule?.startDateStruct?.date ?? '',
          completionDate: data.protocolSection?.statusModule?.completionDateStruct?.date ?? '',
        },
        eligibilityModule: {
          eligibilityCriteria: data.protocolSection?.eligibilityModule?.eligibilityCriteria ?? '',
          healthyVolunteers: data.protocolSection?.eligibilityModule?.healthyVolunteers ?? false,
          sex: data.protocolSection?.eligibilityModule?.sex ?? 'ALL',
          genderBased: data.protocolSection?.eligibilityModule?.genderBased ?? false,
          genderDescription: data.protocolSection?.eligibilityModule?.genderDescription ?? '',
          minimumAge: data.protocolSection?.eligibilityModule?.minimumAge ?? '',
          maximumAge: data.protocolSection?.eligibilityModule?.maximumAge ?? '',
        },
        sponsorCollaboratorsModule: {
          responsibleParty: data.protocolSection?.sponsorCollaboratorsModule?.responsibleParty ?? {},
          leadSponsor: data.protocolSection?.sponsorCollaboratorsModule?.leadSponsor ?? {},
          collaborators: data.protocolSection?.sponsorCollaboratorsModule?.collaborators ?? [],
        },
        contactsLocationsModule: {
          centralContacts: data.protocolSection?.contactsLocationsModule?.centralContacts ?? [],
          overallOfficials: data.protocolSection?.contactsLocationsModule?.overallOfficials ?? [],
          locations: data.protocolSection?.contactsLocationsModule?.locations ?? [],
        },
        moreInfoModule: {
          pointOfContact: data.protocolSection?.moreInfoModule?.pointOfContact ?? {},
        },
      },
    };

    return NextResponse.json(study);
  } catch (error) {
    console.error('Error fetching study:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
