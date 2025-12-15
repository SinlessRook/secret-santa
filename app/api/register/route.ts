import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, answers } = body;

    // 1. Basic Validation
    if (!token || !answers) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const userRef = doc(db, "users", token);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    const userData = userSnap.data();
    const studentName = userData?.name || "The Student"; // Needed for the name riddle

    let aiProfile = null;

    // 2. ATTEMPT AI GENERATION (Using Pollinations.ai)
    try {
      // Construct a specific prompt for 3 clues
      const prompt = `
        You are a Secret Santa Profile Generator.
        Analyze this student:
        - Name: ${studentName}
        - Answers: ${JSON.stringify(answers)}
        - Secret Hint (User input): "${answers.reveal || 'None'}"

        Generate a JSON object with exactly two fields:
        1. "tags": Array of 3 short hashtags (e.g. ["#Gamer", "#Foodie"]).
        2. "clues": An array of exactly 3 strings (Clues):
           - Clue 1: Combine their location ('${answers.spot}') and item ('${answers.weapon}') into a witty observation.
           - Clue 2: Use their 'Secret Hint' ("${answers.reveal}") but make it sound like a rumor or whisper. If 'Secret Hint' is empty, use their 'Gift' preference. Do NOT reveal their name.
           - Clue 3: A creative riddle about the spelling of their name "${studentName}". (e.g., "Starts with S and ends with A", or "A name of 5 letters"). DO NOT say the name directly.

        Return ONLY the raw JSON string.
      `;

      const aiResponse = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a creative JSON generator.' },
            { role: 'user', content: prompt }
          ],
          model: 'openai',
          jsonMode: true
        }),
      });

      if (!aiResponse.ok) throw new Error("Pollinations API Error");

      const text = await aiResponse.text();
      const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      aiProfile = JSON.parse(cleanText);

    } catch (aiError) {
      console.warn("⚠️ AI Failed. Switching to Manual Fallback.");
      aiProfile = generateFallbackProfile(answers, studentName);
    }

    // 3. Fallback Safety Check
    if (!aiProfile || !aiProfile.tags || !Array.isArray(aiProfile.clues)) {
       aiProfile = generateFallbackProfile(answers, studentName);
    }

    // 4. Save to Firebase
    await updateDoc(userRef, {
      answers: answers,
      tags: aiProfile.tags,
      clues: aiProfile.clues, // Now saving an Array of 3 strings
      isRegistered: true,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      generatedProfile: aiProfile 
    });

  } catch (error: any) {
    console.error("Critical System Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- 🎲 THE 3-CLUE FALLBACK GENERATOR ---
function generateFallbackProfile(answers: any, name: string) {
  const tags: string[] = [];
  
  // 1. Tag Logic (Same as before)
  const tagMap: Record<string, string> = {
    "Coffee": "CaffeineAddict", "Red Bull": "WingsGiven", "Tea": "ChaiLover",
    "Gaming": "Gamer", "Reading": "Bookworm", "Music": "#VibeCurator",
    "Library": "Scholar", "BackBench": "BackBencher", "Canteen": "Foodie",
    "Techie": "TechBro", "Artist": "CreativeSoul"
  };

  if (tagMap[answers.weapon]) tags.push(tagMap[answers.weapon]);
  if (tagMap[answers.hobby]) tags.push(tagMap[answers.hobby]);
  if (tagMap[answers.spot]) tags.push(tagMap[answers.spot]);
  
  const genericTags = ["Student", "Campus", "SecretSanta", "VibeCheck"];
  while (tags.length < 3) tags.push(genericTags[tags.length]);

  // 2. CLUE GENERATION (The 3 Specific Logics)

  // --- Clue 1: Vibe/Location (Mad Libs) ---
  const mood: Record<string, string> = { "Coffee": "caffeinated", "Red Bull": "hyperactive", "Gaming": "competitive" };
  const action: Record<string, string> = { "Library": "studying silently", "BackBench": "sleeping", "Ground": "running" };
  
  const adj = mood[answers.weapon] || "mysterious";
  const act = action[answers.spot] || "hanging out";
  
  const clue1Options = [
    `WANTED: A ${adj} student known for ${answers.hobby || "stuff"} and ${act} in the ${answers.spot || "campus"}.`,
    `This agent is usually found in the ${answers.spot || "hallway"} with a ${answers.weapon || "drink"} in hand.`,
    `Look for the ${answers.vibe || "student"} who survives solely on ${answers.weapon || "hope"}.`
  ];
  const clue1 = clue1Options[Math.floor(Math.random() * clue1Options.length)];

  // --- Clue 2: The Secret Hint (Indirect) ---
  let clue2 = "";
  if (answers.reveal && answers.reveal.length > 3) {
    // If they typed something custom
    const hints = [
      `Rumor has it: "${answers.reveal}"`,
      `They once whispered that "${answers.reveal}"`,
      `A secret dossier mentions: "${answers.reveal}"`
    ];
    clue2 = hints[Math.floor(Math.random() * hints.length)];
  } else {
    // Fallback if they didn't type anything specific
    clue2 = `This student is secretly obsessed with ${answers.gift || "surprises"}.`;
  }

  // --- Clue 3: Name Riddle (Heuristic) ---
  const firstChar = name.charAt(0).toUpperCase();
  const lastChar = name.charAt(name.length - 1).toUpperCase();
  const nameLen = name.length;
  
  const clue3Options = [
    `The target's name starts with the letter '${firstChar}' and ends with '${lastChar}'.`,
    `A name of exactly ${nameLen} letters.`,
    `Look for a name beginning with '${firstChar}'.`
  ];
  const clue3 = clue3Options[Math.floor(Math.random() * clue3Options.length)];

  return {
    tags: tags.slice(0, 3), 
    clues: [clue1, clue2, clue3] // Return array of 3 strings
  };
}