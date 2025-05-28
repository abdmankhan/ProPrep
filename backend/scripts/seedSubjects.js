// scripts/seedSubjects.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Subject from "../models/Subject.js";

dotenv.config();

const SUBJECTS = ["OS", "DBMS", "SQL", "CCN", "OOPs"];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding…");

    for (const name of SUBJECTS) {
      const existing = await Subject.findOne({ name });
      if (!existing) {
        await Subject.create({ name });
        console.log(`• Created subject: ${name}`);
      } else {
        console.log(`• Already exists:    ${name}`);
      }
    }

    console.log("✅ Subject seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
