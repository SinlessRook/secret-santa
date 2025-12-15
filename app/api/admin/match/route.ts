import { db } from "@/lib/firebase";
import { collection, getDocs, writeBatch, doc, setDoc, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 🔒 1. SECURITY CHECK
    // Prevents random people from triggering the match
    const secretHeader = req.headers.get("x-admin-secret");
    const storedSecret = process.env.ADMIN_SECRET;
    
    if (!storedSecret || secretHeader !== storedSecret) {
      return NextResponse.json({ error: "Unauthorized: Wrong Secret Key" }, { status: 401 });
    }

    // 2. FETCH REGISTERED USERS
    // Only fetch users who have actually taken the quiz (isRegistered == true)
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("isRegistered", "==", true));
    const snapshot = await getDocs(q);
    
    let participants: any[] = [];
    snapshot.forEach((docSnap) => {
      // Store ID (Token) and Name for logging
      participants.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (participants.length < 2) {
      return NextResponse.json({ error: "Not enough registered players to match! (Need min 2)" }, { status: 400 });
    }

    // 3. THE SHUFFLE (Fisher-Yates Algorithm)
    // This ensures true randomness
    for (let i = participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participants[i], participants[j]] = [participants[j], participants[i]];
    }

    // 4. CIRCULAR ASSIGNMENT & BATCH UPDATE
    // Participant[0] gives to [1], [1] to [2] ... [Last] gives to [0]
    const batch = writeBatch(db);
    
    for (let i = 0; i < participants.length; i++) {
      const santa = participants[i];
      const receiver = participants[(i + 1) % participants.length];
      
      const santaRef = doc(db, "users", santa.id);
      
      // Update the Santa's document with their Target's Token
      batch.update(santaRef, { 
        targetToken: receiver.id,
        status: "MATCHED" 
      });
    }

    // 5. SET GLOBAL CONFIG (The Reveal Date)
    // This sets the date when names will automatically unlock on the frontend
    // Format: YYYY-MM-DDTHH:MM:SS
    const REVEAL_DATE = "2025-12-24T09:00:00"; 

    await setDoc(doc(db, "config", "main"), { 
      status: "MATCHED", 
      revealDate: REVEAL_DATE,
      totalParticipants: participants.length,
      matchedAt: new Date().toISOString()
    });

    // 6. COMMIT ALL CHANGES
    await batch.commit();

    return NextResponse.json({ 
      success: true,
      message: `Successfully matched ${participants.length} students!`,
      revealDate: REVEAL_DATE
    });

  } catch (error: any) {
    console.error("Matching Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}