import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- ☠️ 5-SEARCH HARDCORE CIPHERS (JUMBLED EDITION) ---
function generateHardMECPuzzle(name: string) {
  // 1. CLEAN THE NAME
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  
  // 2. JUMBLE THE LETTERS (The Anagram Step)
  // SNEHA -> HANSE
  const scrambledName = cleanName.split('').sort(() => 0.5 - Math.random()).join('');

  const methods = ["ATOMIC", "THE_ONION", "FREQUENCY_HOP"];
  const selectedMethod = methods[Math.floor(Math.random() * methods.length)];

  let result = "";
  let errorType = "";

  switch (selectedMethod) {
    case "ATOMIC":
      // Map JUMBLED letters to Atomic Numbers
      // User gets: 1, 13, 7, 16, 63 (H, A, N, S, E) -> Must arrange to SNEHA
      const atomicMap: Record<string, number> = {
        A: 13, B: 5, C: 6, D: 66, E: 63, F: 9, G: 31, H: 1, I: 53, J: 55, K: 19, 
        L: 3, M: 12, N: 7, O: 8, P: 15, Q: 84, R: 88, S: 16, T: 22, U: 92, V: 23, 
        W: 74, X: 54, Y: 39, Z: 40
      };
      
      const atomicCodes = scrambledName.split('').map(c => atomicMap[c] || "0");
      result = atomicCodes.join(' - ');
      errorType = "CHEM LAB ACCIDENT: Sample Containers Jumbled. Identify Elements by Proton Count, then Reassemble the Name.";
      break;

    case "THE_ONION":
      // Jumbled -> Hex -> Base64
      // Hint tells them it's "High Entropy" (Scrambled)
      const hex = scrambledName.split('').map(c => c.charCodeAt(0).toString(16).toUpperCase()).join('');
      const base64 = Buffer.from(hex).toString('base64');
      
      result = base64;
      errorType = "LAYER 7 ENCRYPTION (PACKET LOSS DETECTED). Protocol: Base64 -> Hex -> ASCII. Warning: Data Stream is UNSORTED.";
      break;

    case "FREQUENCY_HOP":
      // Jumbled -> ASCII Codes
      result = scrambledName.split('').map(c => c.charCodeAt(0)).join(' || ');
      errorType = "RADIO SIGNAL SCRAMBLED. Tune to these ASCII Frequencies (Hz). Decode letters and Unscramble.";
      break;
  }

  return { result, errorType };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, answers } = body;

    if (!token || !answers) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const userRef = doc(db, "users", token);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return NextResponse.json({ error: "Invalid Token" }, { status: 401 });

    const userData = userSnap.data();
    const studentName = userData?.name || "The Student";

    // 1. GENERATE THE JUMBLED PUZZLE
    const puzzle = generateHardMECPuzzle(studentName);

    // 2. FLAVOR TEXT
    const mecLocations = [
      "the long queue at the Photostat Shop (Color Rings)", 
      "a dark corner of Mad Elsker Cafe", 
      "the backstage of Caza", 
      "the registration desk at Elga", 
      "a corrupted Excel server"
    ];
    const locationFlavor = mecLocations[Math.floor(Math.random() * mecLocations.length)];

    let aiProfile = null;

    // 3. AI CALL
    try {
      const prompt = `
        You are "MEC-BOT", the sarcastic AI of Model Engineering College.
        Target: "${studentName}"
        User Data: ${JSON.stringify(answers)}
        Secret Hint: "${answers.reveal || 'None'}"
        MEC Context: Mention "${locationFlavor}".

        **MANDATORY CLUE 3 DATA:**
        - Error Protocol: "${puzzle.errorType}"
        - Encrypted Data: "${puzzle.result}"

        Task: Generate valid JSON with:
        1. "tags": 3 hashtags using MEC slang (e.g. #MECian, #ElgaVibes, #CazaNights).
        2. "clues": Array of 3 strings.
           - Clue 1: Witty observation about '${answers.spot}' and '${answers.weapon}'.
           - Clue 2: Rumor based on Secret Hint: "${answers.reveal}".
           
           - Clue 3 (THE IMPOSSIBLE CIPHER): 
             You MUST output the "Error Protocol" and "Encrypted Data" exactly.
             Frame it as a "System Dump" from "${locationFlavor}".
             **CRITICAL: DO NOT EXPLAIN HOW TO SOLVE IT.** Just give the raw data.

             Example: "CRITICAL FAILURE at Color Rings. [Error Protocol]. Data Packet: [Encrypted Data]"

        Return ONLY JSON.
      `;

      const completion: any = await Promise.race([
        groq.chat.completions.create({
          messages: [
             { role: "system", content: "You are a cryptic college AI." },
             { role: "user", content: prompt }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.8,
          response_format: { type: "json_object" },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000))
      ]);

      const content = completion.choices[0]?.message?.content;
      if (content) aiProfile = JSON.parse(content);

    } catch (e) {
      console.warn("Using Fallback.");
    }

    // 4. FALLBACK
    if (!aiProfile) {
      aiProfile = {
        tags: ["#MEC", "#Excel", "#SystemFailure"],
        clues: [
          `Target spotted near ${answers.spot} holding ${answers.weapon}.`,
          `Intercepted at ${locationFlavor}: "${answers.reveal || "A mystery gift needed."}"`,
          `SYSTEM CRASH: ${puzzle.errorType} \nDATA: [ ${puzzle.result} ]`
        ]
      };
    }

    await updateDoc(userRef, {
      answers,
      tags: aiProfile.tags,
      clues: aiProfile.clues,
      isRegistered: true,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, generatedProfile: aiProfile });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}