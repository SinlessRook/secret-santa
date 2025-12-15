import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) return NextResponse.json({ error: "Token is required" }, { status: 400 });

    // 1. Check if User Exists (Direct Lookup)
    const userRef = doc(db, "users", token);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: "Invalid Santa ID" }, { status: 401 });
    }

    const userData = userSnap.data();

    // 2. Return Success + Registration Status
    return NextResponse.json({ 
      success: true,
      name: userData.name,       // Optional: To welcome them like "Hi Aditya!"
      isRegistered: userData.isRegistered // Crucial for routing
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}