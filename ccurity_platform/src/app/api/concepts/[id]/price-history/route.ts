import { NextResponse } from "next/server";
import { getPriceHistory } from "@/lib/data/concepts";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const history = await getPriceHistory(id);
    return NextResponse.json(history);
}
