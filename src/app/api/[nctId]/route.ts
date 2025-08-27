import { NextResponse } from 'next/server';

//get trial details by nctId
export async function GET(
  req: Request,
  { params }: { params: { nctId: string } }
) {
  const { nctId } = params;

  try {
    const apiUrl = `https://clinicaltrials.gov/api/v2/studies/${nctId}?format=json&markupFormat=markdown`;

    const res = await fetch(apiUrl);
    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch study: ${nctId}` }, { status: res.status });
    }

    const data = await res.json();

    const study = {
      protocolSection: {
        identificationModule: {
          briefTitle: data.protocolSection?.identificationModule?.briefTitle || '',
          officialTitle: data.protocolSection?.identificationModule?.officialTitle || '',
          organization: {
            fullName: data.protocolSection?.identificationModule?.organization?.fullName || '',
          },
        },
        statusModule: {
          overallStatus: data.protocolSection?.statusModule?.overallStatus || '',
          startDateStruct: {
            date: data.protocolSection?.statusModule?.startDateStruct?.date || '',
          },
          completionDateStruct: {
            date: data.protocolSection?.statusModule?.completionDateStruct?.date || '',
          },
        },
        eligibilityModule: {
          eligibilityCriteria: data.protocolSection?.eligibilityModule?.eligibilityCriteria || '',
          healthyVolunteers: data.protocolSection?.eligibilityModule?.healthyVolunteers ?? false,
          sex: data.protocolSection?.eligibilityModule?.sex || 'ALL',
          genderBased: data.protocolSection?.eligibilityModule?.genderBased ?? false,
          genderDescription: data.protocolSection?.eligibilityModule?.genderDescription || '',
          minimumAge: data.protocolSection?.eligibilityModule?.minimumAge || '',
          maximumAge: data.protocolSection?.eligibilityModule?.maximumAge || '',
          stdAges: data.protocolSection?.eligibilityModule?.stdAges || [],
          studyPopulation: data.protocolSection?.eligibilityModule?.studyPopulation || '',
          samplingMethod: data.protocolSection?.eligibilityModule?.samplingMethod || '',
        },
      },
    };

    return NextResponse.json(study);
  } catch (error) {
    console.error('Error fetching study:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
