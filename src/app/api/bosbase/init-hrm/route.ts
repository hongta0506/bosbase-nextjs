import { NextRequest, NextResponse } from "next/server";
import { ensureHrmCollections } from "@/lib/bosbase/init-hrm-collections";

export async function POST(request: NextRequest) {
  try {
    const res = await ensureHrmCollections();
    return NextResponse.json({
      success: true,
      message: "HRM collections initialized successfully",
      details: res.results,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to initialize HRM collections",
      },
      { status: 500 }
    );
  }
}
