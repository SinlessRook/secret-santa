import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    // 🔒 1. SECURITY CHECK
    const secretHeader = req.headers.get("x-admin-secret");
    const storedSecret = process.env.ADMIN_SECRET;
    if (!storedSecret || secretHeader !== storedSecret){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. SETUP EMAIL TRANSPORTER (Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. FETCH ALL USERS
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    
    let sentCount = 0;
    let failedCount = 0;
    let errors: any[] = [];

    // 4. LOOP & SEND
    // We use Promise.all to send them in parallel (faster)
    const emailPromises = snapshot.docs.map(async (doc) => {
      const user = doc.data();
      const token = doc.id; // The Document ID is the Token

      if (!user.email) return; // Skip if no email

      const mailOptions = {
        from: `"Secret Santa Admin" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "🎅 Your Secret Santa Access Token",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #dc2626;">🎄 Secret Santa 2025</h1>
              <p style="color: #666;">Your mission awaits, Agent ${user.name}.</p>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; border: 2px dashed #dc2626;">
              <p style="margin: 0; font-size: 14px; color: #888;">YOUR ACCESS TOKEN</p>
              <h2 style="margin: 10px 0; font-size: 32px; letter-spacing: 5px; color: #0f172a;">${token}</h2>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://secret-santa-three-brown.vercel.app" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
              <p style="font-size: 12px; color: #999; margin-top: 20px;">Do not share this token with anyone!</p>
            </div>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        sentCount++;
      } catch (err: any) {
        console.error(`Failed to send to ${user.name}:`, err);
        failedCount++;
        errors.push({ name: user.name, error: err.message });
      }
    });

    await Promise.all(emailPromises);

    return NextResponse.json({
      message: "Email Blast Complete",
      stats: {
        sent: sentCount,
        failed: failedCount,
        errors: errors
      }
    });

  } catch (error: any) {
    console.error("Critical Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}