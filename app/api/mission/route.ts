import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    // 1. Get Logged-In User
    const userRef = doc(db, "users", token);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    const userData = userSnap.data();

    // 2. Check Matching Status
    if (!userData.targetToken) {
      return NextResponse.json({ status: "WAITING_FOR_MATCH" });
    }

    // 3. Get Target Data (Sensitive! Contains their Token, Name, Email)
    const targetRef = doc(db, "users", userData.targetToken);
    const targetSnap = await getDoc(targetRef);
    
    // Safety check: What if target was deleted?
    if (!targetSnap.exists()) {
       return NextResponse.json({ status: "WAITING_FOR_MATCH" }); 
    }

    const targetData = targetSnap.data();

    // 4. Check Global Reveal Date
    const configSnap = await getDoc(doc(db, "config", "main"));
    const revealDateStr = configSnap.exists() ? configSnap.data().revealDate : "2099-12-25";
    const isRevealed = new Date() >= new Date(revealDateStr);

    // 🔒 5. SANITIZATION STEP (The Fix)
    // We create a new object. We DO NOT pass 'targetData' directly.
    
    let safeResponse;

    if (isRevealed) {
      // ✅ REVEAL MODE: Allowed to send Name/Class
      safeResponse = {
        name: targetData.name,
        class: targetData.class,
        tags: targetData.tags,
        clues: targetData.clues
        // NOTICE: We do NOT include 'email', 'token', or 'targetToken' here.
      };
    } else {
      // 🕵️‍♂️ CLASSIFIED MODE: Strictly Tags & Clues only
      safeResponse = {
        name: "CLASSIFIED AGENT", // Placeholder
        class: "UNKNOWN",         // Placeholder
        tags: targetData.tags,
        clues: targetData.clues
      };
    }

    return NextResponse.json({
      status: isRevealed ? "REVEALED" : "CLASSIFIED",
      revealDate: revealDateStr,
      target: safeResponse // Send ONLY the clean object
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}