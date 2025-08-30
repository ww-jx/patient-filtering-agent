# Next.js Patient Eligibility Checker

## Search for trial-eligible patients, using trials from ClinicalTrials.gov and patient data from Synthea

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd patient-filtering-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Set OpenRouter API key and model

### 4. Add synthetic patient data

This project currently uses synthetic patient data for testing.

1. Download "100 Sample Synthetic Patient Records, C-CDA" (XML) from [Synthea Downloads](https://synthea.mitre.org/downloads)
2. Extract the files and place them in the `src/data` directory.
3. Choose one file as the fake patient, and add its filename to the .env file

### 5. Run the development server

```bash
npm run dev
```
