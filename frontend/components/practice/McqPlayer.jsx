"use client";

import { useState } from "react";
import axios from "axios";

export default function McqPlayer({ questions }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { q1: 2, q2: 0, … }
  const [results, setResults] = useState(null);

  const handleSubmit = async () => {
    try{
      const res = await axios.post("http://localhost:5555/api/questions/submit",
         { answers },
         { withCredentials: true });
      const data = await res.data;
      console.log(data);
      setResults(data);
    } catch (err) {
      console.log(err);
    }
  }
  

  

  const question = questions[currentIndex];
  return (
    <div className="space-y-6">
      <div>
        <p className="font-medium">
          Question {currentIndex + 1} of {questions.length}
        </p>
        <p className="mt-2">{question.text}</p>
      </div>

      <div className="space-y-2">
        {question.options.map((opt, idx) => (
          <label key={idx} className="flex items-center space-x-3">
            <input
              type="radio"
              name={`q-${question.id}`}
              checked={answers[question.id] === idx}
              onChange={() =>
                setAnswers((prev) => ({ ...prev, [question.id]: idx }))
              }
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={answers[question.id] == null}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded"
            disabled={answers[question.id] == null}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
