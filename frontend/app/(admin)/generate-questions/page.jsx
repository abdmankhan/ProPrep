"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function GenerateQuestionsPage({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [topicIds, setTopicIds] = useState([]);
  const [lod, setLod] = useState("3");
  const [count, setCount] = useState(5);
  const [preview, setPreview] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5555/api/admin/subjects",
          {
            withCredentials: true,
          }
        );
        setSubjects(response.data);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    const fetchTopics = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5555/api/admin/topics?subjectId=${subjectId}`,
          { withCredentials: true }
        );
        setTopics(response.data);
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      }
    };
    fetchTopics();
  }, [subjectId]);

  const toggleTopicId = (id) => {
    setTopicIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };
  const generate = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(
        "http://localhost:5555/api/admin/generate-questions",
        {
          subjectId,
          topicIds,
          lod: Number(lod),
          count: Number(count),
        },
        { withCredentials: true }
      );

      console.log("Response from server:", data);

      // Process data from API response
      if (Array.isArray(data) && data.length > 0) {
        // Map through questions and add a selected property
        const questionsWithSelected = data.map((q) => ({
          ...q,
          selected: true,
          // Ensure correct property names
          text: q.text || q.question || "",
          options: q.options || [],
          correct: q.correct !== undefined ? q.correct : q.correctIndex,
        }));
        setPreview(questionsWithSelected);
      } else {
        console.error("Received invalid data format:", data);
        alert("Failed to generate questions. Please try again.");
        setPreview([]);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("An error occurred while generating questions. Please try again.");
      setPreview([]);
    } finally {
      setIsLoading(false);
    }
  };
  const addToDB = async () => {
    try {
      if (!Array.isArray(preview) || preview.length === 0) {
        alert("No questions to add to the database.");
        return;
      }

      const selected = preview.filter((q) => q.selected);

      if (selected.length === 0) {
        alert("Please select at least one question to add.");
        return;
      }

      // Make sure we have all required properties
      const formattedQuestions = selected.map((q) => ({
        text: q.text || q.question || "",
        options: Array.isArray(q.options) ? q.options : [],
        correct: q.correct !== undefined ? q.correct : q.correctIndex,
        lod: Number(lod),
      }));

      await axios.post(
        "http://localhost:5555/api/admin/upload-questions",
        {
          subjectId,
          topicId: topicIds[0], // or enhance logic to assign per-question topic
          questions: formattedQuestions,
          userEmail: user?.email || "anonymous",
        },
        { withCredentials: true }
      );

      setPreview([]);
      alert(`${selected.length} questions added.`);
    } catch (error) {
      console.error("Error adding questions to database:", error);
      alert(
        "Failed to add questions to database: " +
          (error.message || "Unknown error")
      );
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold">Generate Questions</h2>
      {/* Subject Select */}
      <div className="space-y-1">
        <Label>Subject</Label>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Topics Multi-Select using checkboxes */}
      <div className="space-y-1">
        <Label>Topics</Label>
        <div className="border rounded p-2 max-h-40 overflow-y-auto space-y-1">
          {topics.map((t) => (
            <div key={t._id} className="flex items-center space-x-2">
              <Checkbox
                checked={topicIds.includes(t._id)}
                onCheckedChange={() => toggleTopicId(t._id)}
              />
              <span>{t.name}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Difficulty Select */}
      <div className="space-y-1">
        <Label>Difficulty</Label>
        <Select value={lod} onValueChange={setLod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Easy</SelectItem>
            <SelectItem value="1">Medium</SelectItem>
            <SelectItem value="2">Hard</SelectItem>
            <SelectItem value="3">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Count Input */}
      <div className="space-y-1">
        <Label>Number of Questions</Label>
        <Input
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />
      </div>{" "}
      <Button
        onClick={generate}
        disabled={!subjectId || topicIds.length === 0 || isLoading}
        className="w-full"
      >
        {isLoading ? "Generating..." : "Generate"}
      </Button>
      {/* Preview Section */}
      {Array.isArray(preview) && preview.length > 0 && (
        <div className="space-y-3 pt-6">
          <h3 className="font-semibold">Preview & Select</h3>
          {preview.map((q, i) => (
            <div key={i} className="p-3 border rounded space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  checked={q.selected}
                  onCheckedChange={(v) => {
                    setPreview((prev) => {
                      const cp = [...prev];
                      cp[i].selected = v;
                      return cp;
                    });
                  }}
                />
                <div className="w-full space-y-1">
                  <Input
                    value={q.text || ""}
                    onChange={(e) => {
                      const t = e.target.value;
                      setPreview((prev) => {
                        const cp = [...prev];
                        cp[i].text = t;
                        return cp;
                      });
                    }}
                    placeholder="Edit question text"
                  />
                  <div className="pl-2 space-y-1">
                    {Array.isArray(q.options) ? (
                      q.options.map((opt, oi) => <p key={oi}>• {opt}</p>)
                    ) : (
                      <p className="text-red-500">No options available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button onClick={addToDB}>Add to Database</Button>
        </div>
      )}
    </div>
  );
}
