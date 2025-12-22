import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

// Helper for auth check
const isAuthenticated = (req: NextRequest) => 
  req.headers.get("x-admin-secret") === ADMIN_SECRET;

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const docRef = doc(db, "config", "main"); // We use a single doc named 'main' in 'config' collection
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      return NextResponse.json(snapshot.data());
    } else {
      // Default if not set
      return NextResponse.json({ revealDate: "2025-12-25T10:00" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { revealDate } = body;

    // Save to Firestore
    await setDoc(doc(db, "config", "main"), { revealDate }, { merge: true });

    return NextResponse.json({ success: true, revealDate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}