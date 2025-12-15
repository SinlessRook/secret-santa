# 🎅 TokenSanta - College Edition 2025

![TokenSanta Banner](./Screenshots/banner.jpg)

> A secure, AI-powered Secret Santa experience designed for college campuses. No more paper chits—just tokens, vibes, and automated matchmaking.

## 📖 Overview
**TokenSanta** is a modern web application built with **Next.js** and **Firebase** that modernizes the traditional Secret Santa game. Instead of drawing names from a hat, students use unique **Access Tokens** to log in, take a personality quiz, and get matched with a target.

The system uses **AI (Pollinations/OpenAI)** to analyze quiz answers and generate witty, mysterious "Vibe Clues" so users can buy gifts based on personality rather than just a name.

---

## 🚀 How It Works

### 1. The Student Flow
1.  **Login:** Students receive a unique 6-character token via email. They use this to unlock the app.
2.  **The Vibe Check:** Users take a fun, college-themed personality quiz (e.g., *"What's your attendance strategy?"*).
3.  **AI Profiling:** The system generates unique **#Tags** and **Mystery Clues** based on their answers.
4.  **The Mission:** Users enter the "Mission Hub" where they see their target's clues (Identity is **CLASSIFIED**).
5.  **The Reveal:** On the event date (e.g., Dec 24th), the countdown ends, and the target's identity is revealed!

### 2. The Matching Logic (Fisher-Yates Shuffle)
To ensure fair and collision-free pairings, the admin route uses the **Fisher-Yates Shuffle** algorithm:
1.  **Fetch:** The system retrieves all registered users from Firebase.
2.  **Shuffle:** It randomly shuffles the array of users, ensuring a completely unbiased order every time.
3.  **Link:** It creates a circular linked list (User A ➔ User B ➔ User C ➔ ... ➔ User A).
    * This guarantees that **everyone gets a gift**.
    * It prevents anyone from being assigned to themselves.
    * It ensures no sub-loops (e.g., A ➔ B and B ➔ A) unless there are only 2 players.

---

## 👮 Admin API Guide

The application includes secured API routes for administrative tasks (Seeding, Matching, Emailing). These endpoints are protected by the `ADMIN_SECRET` environment variable to prevent unauthorized access.

**Required Header:**
`x-admin-secret: <Your_Secret_Password>`

### 1. Trigger Matchmaking
Shuffles registered users and assigns Secret Santa targets.
* **Method:** `POST`
* **Endpoint:** `/api/admin/match`
* **Action:** Runs the Fisher-Yates algorithm and updates every user document with a `targetToken`. Sets the global Reveal Date.

### 2. Email Blast
Sends the unique Access Tokens to all students via Gmail/Nodemailer.
* **Method:** `POST`
* **Endpoint:** `/api/admin/email`
* **Action:** Iterates through the database and sends a styled HTML email to every user containing their specific Login Token.

---

## 📸 User Interface

| **The Gatekeeper (Login)** | **The Vibe Quiz** |
|:---:|:---:|
| ![Login Screen](./Screenshots/login.png) | ![Quiz Screen](./Screenshots/quiz.png) |
| *Secure Token Entry* | *AI-Powered Profiling* |

| **Mission Hub (Classified)** | **The Reveal** |
|:---:|:---:|
| ![Mission Screen](./Screenshots/mission.png) | ![Reveal Screen](./Screenshots/reveal.png) |
| *View Clues & Tags* | *Identity Unlocked!* |

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Database:** Firebase Firestore
* **Styling:** Tailwind CSS + Shadcn UI
* **AI Engine:** Pollinations.ai (Free OpenAI Wrapper)
* **Email Service:** Nodemailer (Gmail SMTP)
* **Animations:** Lucide React, CSS Keyframes

---

## ⚡ Getting Started

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/token-santa.git](https://github.com/yourusername/token-santa.git)
    cd token-santa
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file in the root directory and add the following keys. 
    
    *Note: The `NEXT_PUBLIC_` keys are required for the frontend to connect to Firebase.*

    ```env
    # --- FIREBASE CONFIG ---
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

    # --- ADMIN SECRETS ---
    ADMIN_SECRET=MySuperSecretPassword123

    # --- EMAIL SERVICE (Gmail) ---
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    ```

4.  **Run the Server**
    ```bash
    npm run dev
    ```

---

## 🤝 Contributing
Contributions are always welcome! If you have ideas for cooler animations, better quiz questions, or stronger security:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## ❤️ Credits

Made with love by **Adithyan**.

> *"May your code be bug-free and your gifts be awesome."* 🎄