import { db } from "@/lib/firebase";
import { STUDENT_LIST, Student } from "@/lib/data"; 
import { doc, writeBatch } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

// Helper: Generates a random 6-char token
function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function POST(req: NextRequest) {
  try {
    // --- 🔒 SECURITY CHECK ---
    const secretHeader = req.headers.get("x-admin-secret");
    const storedSecret = process.env.ADMIN_SECRET;
    if (!storedSecret || secretHeader !== storedSecret){
      return NextResponse.json(
        { error: "Unauthorized: Invalid Secret Key" },
        { status: 401 }
      );
    }
    // -------------------------

    const batch = writeBatch(db);
    const generatedData: { name: string; token: string }[] = []; 

    STUDENT_LIST.forEach((student: Student) => {
      // 1. Generate Token
      const token = generateToken();

      // 2. Prepare Database Entry
      const userRef = doc(db, "users", token);
      
      batch.set(userRef, {
        name: student.name,
        email: student.email,
        isRegistered: false,
        tags: [],
        clues: "",
        targetToken: null,
        createdAt: new Date().toISOString()
      });

      // 3. Keep record for printing
      generatedData.push({
        name: student.name,
        token: token
      });
    });

    // 4. Commit to DB
    await batch.commit();

    return NextResponse.json({ 
      message: "Seeding Complete!", 
      count: generatedData.length,
      tokens_to_print: generatedData 
    });

  } catch (error: any) {
    console.error("Seeding Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}