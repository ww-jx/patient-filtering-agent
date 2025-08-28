import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Return n random patients with relative file paths
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const countParam = searchParams.get("count");
    const count = countParam ? parseInt(countParam, 10) : 1;

    const dataDir = path.join(process.cwd(), "src/data");
    const files = fs
      .readdirSync(dataDir)
      .filter(f => f.endsWith(".xml"));

    // randomly shuffle the files array
    for (let i = files.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [files[i], files[j]] = [files[j], files[i]];
    }

    // get desired number of patients
    const selectedFiles = files.slice(0, count);

    const patients = selectedFiles.map(file => ({
      name: file.replace(".xml", ""),
      // relative path from project root
      filePath: path.join("src/data", file),
    }));

    return NextResponse.json({ patients });
  } catch (err: any) {
    console.error("Error reading patients:", err);
    return NextResponse.json({ error: "Failed to read patients" }, { status: 500 });
  }
}
