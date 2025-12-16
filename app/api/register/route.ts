import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- ☠️ 10+ HARDCORE CIPHERS (MEC EDITION) ---
function generateHardMECPuzzle(name: string) {
  // 1. CLEAN THE NAME
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  
  // 2. JUMBLE THE LETTERS FIRST (The Anagram Step)
  // Logic: User decodes cipher -> Gets Jumbled Letters -> Unscrambles Name
  const scrambledName = cleanName.split('').sort(() => 0.5 - Math.random()).join('');

  const methods = [
    "ATOMIC", "THE_ONION", "FREQUENCY_HOP", "BINARY_STREAM", 
    "NOKIA_LEGACY", "RESISTOR_COLOR", "MIRROR_DIMENSION", 
    "KEYBOARD_SLIP", "CAESAR_SALAD", "NATO_ALPHA", "MORSE_VIBES"
  ];
  
  const selectedMethod = methods[Math.floor(Math.random() * methods.length)];

  let result = "";
  let errorType = "";

  switch (selectedMethod) {
    case "ATOMIC": // [Existing]
      const atomicMap: Record<string, number> = {
        A: 13, B: 5, C: 6, D: 66, E: 63, F: 9, G: 31, H: 1, I: 53, J: 55, K: 19, 
        L: 3, M: 12, N: 7, O: 8, P: 15, Q: 84, R: 88, S: 16, T: 22, U: 92, V: 23, 
        W: 74, X: 54, Y: 39, Z: 40
      };
      result = scrambledName.split('').map(c => atomicMap[c] || "0").join(' - ');
      errorType = "CHEM LAB SPILL. Sample Containers Jumbled. Identify Elements by Proton Count to find the letters.";
      break;

    case "THE_ONION": // [Existing]
      const hex = scrambledName.split('').map(c => c.charCodeAt(0).toString(16).toUpperCase()).join('');
      result = Buffer.from(hex).toString('base64');
      errorType = "LAYER 7 ENCRYPTION. Protocol: Base64 -> Hex -> ASCII. Warning: Data Stream is Unsorted.";
      break;

    case "FREQUENCY_HOP": // [Existing]
      result = scrambledName.split('').map(c => c.charCodeAt(0)).join(' || ');
      errorType = "RADIO SIGNAL INTERCEPT. Tune to these ASCII Frequencies (Hz). Decode characters and Unscramble.";
      break;

    case "BINARY_STREAM": // Binary (New)
      result = scrambledName.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
      errorType = "CORE DUMP. Machine Code Detected. Convert Binary to Text. Warning: Memory blocks shuffled.";
      break;

    case "NOKIA_LEGACY": // T9 Keypad (New)
      const t9Map: Record<string, string> = {
        A:"2", B:"22", C:"222", D:"3", E:"33", F:"333", G:"4", H:"44", I:"444",
        J:"5", K:"55", L:"555", M:"6", N:"66", O:"666", P:"7", Q:"77", R:"777", S:"7777",
        T:"8", U:"88", V:"888", W:"9", X:"99", Y:"999", Z:"9999"
      };
      result = scrambledName.split('').map(c => t9Map[c] || "?").join(' | ');
      errorType = "SMS ARCHIVE CORRUPTED (Year 2005). Old School Keypad Input. Decode the Taps.";
      break;

    case "RESISTOR_COLOR": // Resistor Color Codes (New)
      // Map A=0 (Black), B=1 (Brown)... J=9 (White), K=0 (Black)...
      const colors = ["Black", "Brown", "Red", "Orange", "Yellow", "Green", "Blue", "Violet", "Grey", "White"];
      result = scrambledName.split('').map(c => {
         const val = (c.charCodeAt(0) - 65) % 10; // A=0, B=1...
         return colors[val];
      }).join(' - ');
      errorType = "CIRCUIT BOARD FAILURE. Resistor Bands Burnt. Identify Value (0-9). Map A=0, B=1... K=0. Unscramble.";
      break;

    case "MIRROR_DIMENSION": // Atbash (Reverse Alphabet) (New)
      // A <-> Z, B <-> Y
      result = scrambledName.split('').map(c => {
        const code = c.charCodeAt(0);
        return String.fromCharCode(90 - (code - 65));
      }).join('');
      errorType = "REFLECTION ERROR. The Alphabet is inverted (A=Z, B=Y). Decode and Unscramble.";
      break;

    case "KEYBOARD_SLIP": // QWERTY Right Shift (New)
      const qwerty = "QWERTYUIOPASDFGHJKLZXCVBNM";
      result = scrambledName.split('').map(c => {
        const idx = qwerty.indexOf(c);
        // Return the letter to the RIGHT (loops back to start if needed)
        return idx !== -1 ? qwerty[(idx + 1) % qwerty.length] : c;
      }).join('');
      errorType = "FAT FINGER SYNDROME. Every key was pressed one spot to the RIGHT on a QWERTY keyboard. Shift Left to fix.";
      break;

    case "CAESAR_SALAD": // ROT-3 (New)
      result = scrambledName.split('').map(c => {
        const code = c.charCodeAt(0);
        // Shift +3
        return String.fromCharCode(((code - 65 + 3) % 26) + 65);
      }).join('');
      errorType = "ROMAN LEGION ENCAMPMENT. Caesar Cipher (+3 Shift). Shift Back to reveal the jumbled letters.";
      break;

    case "NATO_ALPHA": // NATO Phonetic (New)
      const nato: Record<string, string> = {
        A:"Alpha", B:"Bravo", C:"Charlie", D:"Delta", E:"Echo", F:"Foxtrot", G:"Golf",
        H:"Hotel", I:"India", J:"Juliet", K:"Kilo", L:"Lima", M:"Mike", N:"November",
        O:"Oscar", P:"Papa", Q:"Quebec", R:"Romeo", S:"Sierra", T:"Tango", U:"Uniform",
        V:"Victor", W:"Whiskey", X:"Xray", Y:"Yankee", Z:"Zulu"
      };
      result = scrambledName.split('').map(c => nato[c]).join('-');
      errorType = "MILITARY COMM CHANNEL. Phonetic Alphabet Intercepted. Extract Initials. Unscramble.";
      break;

    case "MORSE_VIBES": // Morse Code (New)
      const morse: Record<string, string> = {
        A:".-", B:"-...", C:"-.-.", D:"-..", E:".", F:"..-.", G:"--.", H:"....",
        I:"..", J:".---", K:"-.-", L:".-..", M:"--", N:"-.", O:"---", P:".--.",
        Q:"--.-", R:".-.", S:"...", T:"-", U:"..-", V:"...-", W:".--", X:"-..-",
        Y:"-.--", Z:"--.."
      };
      result = scrambledName.split('').map(c => morse[c]).join(' / ');
      errorType = "TELEGRAPH LINE NOISE. Dots and Dashes detected. Decode Morse -> Letters -> Unscramble.";
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

    // 1. GENERATE THE JUMBLED PUZZLE (Now with 10+ Methods)
    const puzzle = generateHardMECPuzzle(studentName);

    // 2. FLAVOR TEXT
    const mecLocations = [
      "the long queue at the Photostat Shop", 
      "a dark corner of Mad Elsker Cafe", 
      "the backstage of Caza", 
      "the registration desk at Elga", 
      "a corrupted Excel server",
      "the CS Lab server room",
      "the Biomedical Lab"
    ];
    const locationFlavor = mecLocations[Math.floor(Math.random() * mecLocations.length)];

    let aiProfile = null;

    // 3. AI CALL
    try {
      const prompt = `
        You are "MEC-BOT", the sarcastic AI of Model Engineering College.
        
        TARGET DATA:
        - Vibe: ${answers.vibe}
        - Favorite Spot: ${answers.spot}
        - Canteen Order: ${answers.canteen}
        - Attendance Style: ${answers.attendance}
        - Secret Hint: "${answers.reveal || 'None'}"
        
        PUZZLE DATA (Include exactly):
        - Location: ${locationFlavor}
        - Protocol: ${puzzle.errorType}
        - Cipher: ${puzzle.result}

        *** STRICT PRIVACY RULES ***:
        1. DO NOT mention the student's real name (${studentName}) in the output.
        2. Refer to them as "The Asset", "Subject", or "Target".
        3. The Puzzle MUST be the 3rd clue.

        Task: Generate JSON with:
        1. "tags": 3 hashtags using MEC slang (e.g. #MECian, #ElgaVibes).
        2. "clues": Array of 3 strings.
           - Clue 1: A sarcastic observation about their Vibe and Spot.
           - Clue 2: A rumor based on their Secret Hint ("${answers.reveal}").
           - Clue 3: The System Error. Format: "CRITICAL FAILURE at [Location]. [Protocol]. Data: [Cipher]"

        Return ONLY JSON.
      `;

      const completion: any = await Promise.race([
        groq.chat.completions.create({
          messages: [
             { role: "system", content: "You are a cryptic college AI. You never reveal names." },
             { role: "user", content: prompt }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.8,
          response_format: { type: "json_object" },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 8000))
      ]);

      const content = completion.choices[0]?.message?.content;
      if (content) {
        aiProfile = JSON.parse(content);
        
        // --- 🛡️ SAFETY CHECK: REMOVE NAME IF LEAKED ---
        const nameRegex = new RegExp(studentName, "gi");
        aiProfile.clues = aiProfile.clues.map((c: string) => c.replace(nameRegex, "The Target"));
      }

    } catch (e) {
      console.warn("Using Fallback.");
    }

    // 4. FALLBACK (Guaranteed No Name)
    if (!aiProfile) {
      aiProfile = {
        tags: ["#MEC", "#SystemFailure", "#MissionBrief"],
        clues: [
          `Target known to inhabit ${answers.spot} with a ${answers.vibe} attitude.`,
          `Intercepted transmission: "${answers.reveal || "Unknown Mystery"}"`,
          `SYSTEM CRASH at ${locationFlavor}: ${puzzle.errorType} \nDATA DUMP: [ ${puzzle.result} ]`
        ]
      };
    }

    await updateDoc(userRef, {
      answers,
      tags: aiProfile.tags,
      clue: aiProfile.clues[2], 
      clues: aiProfile.clues,   
      isRegistered: true,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, generatedProfile: aiProfile });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}