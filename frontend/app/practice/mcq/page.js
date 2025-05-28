// app/practice/mcq/page.js
import McqPlayer from "@/components/practice/McqPlayer";
import axios from "axios";
import { cookies } from "next/headers";

export default async function McqPage() {
  // --------------------
  // SERVER-SIDE FETCH
  // --------------------
  // This runs on the server at request time (SSR).
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  const res = await axios.get("http://localhost:5555/api/questions", {
    withCredentials: true,
    headers: {
      Cookie: `jwt=${token}`,
    },
  });
  // res.ok doesn't exist on axios, also, res.json() doesn't exist on axios, instead we use res.data and res.status respectively reversed
  if (!res.status) {
    throw new Error("Failed to fetch questions");

  }
  const questions = await res.data;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">MCQ Practice</h1>
      {/* Pass the pre-fetched questions to the client component */}
      <McqPlayer questions={questions} />
    </div>
  );
}
