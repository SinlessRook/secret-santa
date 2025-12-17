import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// --- ☠️ 10+ HARDCORE CIPHERS (MEC EDITION) ---
// (Kept logic same, but you can use this function as provided in your previous code)
function generateHardMECPuzzle(name: string) {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '');
  // ... (Your existing scrambling logic here - omitted for brevity, keeps file size manageable) ... 
  // ... Ensure you keep the exact generateHardMECPuzzle function you wrote above ...
  
  // RE-INSERTING YOUR LOGIC FOR CONTEXT (Copy this block back in if you are pasting the whole file)
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
    case "ATOMIC":
      const atomicMap: Record<string, number> = { A: 13, B: 5, C: 6, D: 66, E: 63, F: 9, G: 31, H: 1, I: 53, J: 55, K: 19, L: 3, M: 12, N: 7, O: 8, P: 15, Q: 84, R: 88, S: 16, T: 22, U: 92, V: 23, W: 74, X: 54, Y: 39, Z: 40 };
      result = scrambledName.split('').map(c => atomicMap[c] || "0").join(' - ');
      errorType = "ELF CHEMISTRY SET. Elements Jumbled. Identify by Proton Count.";
      break;
    case "THE_ONION":
      const hex = scrambledName.split('').map(c => c.charCodeAt(0).toString(16).toUpperCase()).join('');
      result = Buffer.from(hex).toString('base64');
      errorType = "WRAPPING PAPER ENCRYPTION. Layer 7: Base64 -> Hex -> ASCII.";
      break;
    case "FREQUENCY_HOP":
      result = scrambledName.split('').map(c => c.charCodeAt(0)).join(' || ');
      errorType = "SLEIGH RADIO INTERCEPT. Tune to these ASCII Frequencies (Hz).";
      break;
    case "BINARY_STREAM":
      result = scrambledName.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
      errorType = "NORTH POLE SERVER DUMP. Binary detected. Memory blocks shuffled.";
      break;
    case "NOKIA_LEGACY":
      const t9Map: Record<string, string> = { A:"2", B:"22", C:"222", D:"3", E:"33", F:"333", G:"4", H:"44", I:"444", J:"5", K:"55", L:"555", M:"6", N:"66", O:"666", P:"7", Q:"77", R:"777", S:"7777", T:"8", U:"88", V:"888", W:"9", X:"99", Y:"999", Z:"9999" };
      result = scrambledName.split('').map(c => t9Map[c] || "?").join(' | ');
      errorType = "SANTA'S OLD PHONE. SMS Archive (2005). Decode the T9 Taps.";
      break;
    case "RESISTOR_COLOR":
      const colors = ["Black", "Brown", "Red", "Orange", "Yellow", "Green", "Blue", "Violet", "Grey", "White"];
      result = scrambledName.split('').map(c => { const val = (c.charCodeAt(0) - 65) % 10; return colors[val]; }).join(' - ');
      errorType = "TOY FACTORY CIRCUIT. Resistor Bands. Map A=0 (Black), B=1... K=0.";
      break;
    case "MIRROR_DIMENSION":
      result = scrambledName.split('').map(c => { const code = c.charCodeAt(0); return String.fromCharCode(90 - (code - 65)); }).join('');
      errorType = "REFLECTION ERROR. The Alphabet is inverted (A=Z, B=Y).";
      break;
    case "KEYBOARD_SLIP":
      const qwerty = "QWERTYUIOPASDFGHJKLZXCVBNM";
      result = scrambledName.split('').map(c => { const idx = qwerty.indexOf(c); return idx !== -1 ? qwerty[(idx + 1) % qwerty.length] : c; }).join('');
      errorType = "FROZEN FINGERS. Every key pressed one spot to the RIGHT on QWERTY.";
      break;
    case "CAESAR_SALAD":
      result = scrambledName.split('').map(c => { const code = c.charCodeAt(0); return String.fromCharCode(((code - 65 + 3) % 26) + 65); }).join('');
      errorType = "CHRISTMAS CAESAR. Shift -3 to decode the jumbled letters.";
      break;
    case "NATO_ALPHA":
      const nato: Record<string, string> = { A:"Alpha", B:"Bravo", C:"Charlie", D:"Delta", E:"Echo", F:"Foxtrot", G:"Golf", H:"Hotel", I:"India", J:"Juliet", K:"Kilo", L:"Lima", M:"Mike", N:"November", O:"Oscar", P:"Papa", Q:"Quebec", R:"Romeo", S:"Sierra", T:"Tango", U:"Uniform", V:"Victor", W:"Whiskey", X:"Xray", Y:"Yankee", Z:"Zulu" };
      result = scrambledName.split('').map(c => nato[c]).join('-');
      errorType = "REINDEER COMM CHANNEL. Phonetic Alphabet. Extract Initials.";
      break;
    case "MORSE_VIBES":
      const morse: Record<string, string> = { A:".-", B:"-...", C:"-.-.", D:"-..", E:".", F:"..-.", G:"--.", H:"....", I:"..", J:".---", K:"-.-", L:".-..", M:"--", N:"-.", O:"---", P:".--.", Q:"--.-", R:".-.", S:"...", T:"-", U:"..-", V:"...-", W:".--", X:"-..-", Y:"-.--", Z:"--.." };
      result = scrambledName.split('').map(c => morse[c]).join(' / ');
      errorType = "BLIZZARD INTERFERENCE. Morse Code detected.";
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

    // 2. FLAVOR TEXT (MEC + Christmas)
    const mecLocations = [
      "the snowy queue at the Photostat Shop", 
      "a festive corner of Mad Elsker Cafe", 
      "the frozen backstage of Caza", 
      "the garland-wrapped desk at Elga", 
      "the chimney of the CS Block",
      "the Biomedical Lab (North Pole Branch)"
    ];
    const locationFlavor = mecLocations[Math.floor(Math.random() * mecLocations.length)];

    let aiProfile = null;

    // 3. AI CALL
    try {
      const prompt = `
        You are "TOKEN-SANTA", the sarcastic, glitchy Christmas AI of Model Engineering College (MEC).
        
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
        2. Refer to them as "The Elf", "Subject", "The Grinch", or "Target".
        3. The Puzzle MUST be the 3rd clue.

        *** THEME REQUIREMENTS ***:
        1. Mix MEC College slang with Christmas metaphors.
        2. Keywords to use: Naughty List, Coal, Reindeer, Sleigh, Snow, Gifts, Elves.
        3. Be witty and slightly roasting.

        Task: Generate JSON with:
        1. "tags": 3 hashtags (e.g., #MECXmas, #NaughtyList, #SystemFailure).
        2. "clues": Array of 3 strings.
           - Clue 1: A sarcastic Christmas observation about their Vibe and Spot.
           - Clue 2: A rumor from the Elves based on their Secret Hint.
           - Clue 3: The System Error. Format: "FROST BITE ERROR at [Location]. [Protocol]. Data: [Cipher]"

        Return ONLY JSON.
      `;

      const completion: any = await Promise.race([
        groq.chat.completions.create({
          messages: [
             { role: "system", content: "You are a holiday AI. You never reveal names. You speak in Christmas puns and college slang." },
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
        aiProfile.clues = aiProfile.clues.map((c: string) => c.replace(nameRegex, "The Snowman"));
      }

    } catch (e) {
      console.warn("Using Fallback.");
    }

    // 4. FALLBACK (Guaranteed No Name + Christmas Theme)
    if (!aiProfile) {
      aiProfile = {
        tags: ["#MECSecretSanta", "#CodeRedNose", "#MissionJingle"],
        clues: [
          `Target spotted on the Naughty List near ${answers.spot}, vibing like a ${answers.vibe} reindeer.`,
          `Elf whispers suggest: "${answers.reveal || "They are hiding presents"}"`,
          `SYSTEM FROZEN at ${locationFlavor}: ${puzzle.errorType} \nDATA DUMP: [ ${puzzle.result} ]`
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