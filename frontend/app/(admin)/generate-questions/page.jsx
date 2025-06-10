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
  const [questionType, setQuestionType] = useState("MCQ");
  const [preview, setPreview] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5555/api/admin/mcq/subjects",
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
          `http://localhost:5555/api/admin/mcq/topics?subjectId=${subjectId}`,
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
        "http://localhost:5555/api/admin/mcq/generate-questions",
        {
          subjectId,
          topicIds,
          lod: Number(lod),
          count: Number(count),
          questionType, // Include question type
        },
        { withCredentials: true }
      );

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
          questionType: q.questionType || "MCQ", // Add question type
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
    // console.log("Adding to DB with preview:", preview);
    // preview is actually an array of questions, so don't confuse it with something UI related.
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

      // Get topic information for formatting
      const topicInfo = {};
      topics.forEach((topic) => {
        topicInfo[topic._id] = topic.name;
      });

      // Make sure we have all required properties
      const formattedQuestions = selected.map((q) => {
        // Format topics array correctly - use question's topics if available
        let questionTopics = q.topics;
        // If no topics are set, use selected topic IDs
        if (
          !questionTopics ||
          !Array.isArray(questionTopics) ||
          questionTopics.length === 0
        ) {
          questionTopics = topicIds.map((topicId) => ({
            topicId,
            topicName: topicInfo[topicId] || "Unknown",
          }));
        }
        return {
          text: q.text || q.question || "",
          options: Array.isArray(q.options) ? q.options : [],
          correct: q.correct !== undefined ? q.correct : q.correctIndex,
          lod: Number(lod),
          topics: questionTopics,
          questionType: q.questionType || "MCQ",
          explanation: q.explanation || "",
        };
      });
      await axios.post(
        "http://localhost:5555/api/admin/mcq/upload-questions",
        {
          subjectId,
          topicId: topicIds[0], // Used as fallback for any question without topics
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
      </div>{" "}
      {/* Count Input */}
      <div className="space-y-1">
        <Label>Number of Questions</Label>
        <Input
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />
      </div>
      {/* Question Type Selection */}
      <div className="space-y-1">
        <Label>Question Type</Label>
        <Select value={questionType} onValueChange={setQuestionType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MCQ">
              Multiple Choice (Single Correct)
            </SelectItem>
            <SelectItem value="Multiple Correct">
              Multiple Choice (Multiple Correct)
            </SelectItem>
            <SelectItem value="Type in the answer(TITA)">
              Type in the answer (TITA)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
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
                />{" "}
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

                  {/* Display question topics */}
                  {q.topics &&
                    Array.isArray(q.topics) &&
                    q.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 my-1">
                        {q.topics.map((topic, ti) => (
                          <span
                            key={ti}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {topic.topicName}
                          </span>
                        ))}
                      </div>
                    )}

                  {/* Question type badge */}
                  <div className="flex items-center my-1">
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                      {q.questionType || "MCQ"}
                    </span>
                  </div>

                  <div className="pl-2 space-y-1">
                    {Array.isArray(q.options) ? (
                      q.options.map((opt, oi) => (
                        <p
                          key={oi}
                          className={
                            oi === q.correct
                              ? "text-green-600 font-semibold bg-green-50 rounded px-1"
                              : ""
                          }
                        >
                          • {opt}
                        </p>
                      ))
                    ) : (
                      <p className="text-red-500">No options available</p>
                    )}
                  </div>

                  {/* Explanation field */}
                  <div className="mt-2">
                    <Label className="text-xs text-gray-600">Explanation</Label>
                    <Input
                      value={q.explanation || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPreview((prev) => {
                          const cp = [...prev];
                          cp[i].explanation = val;
                          return cp;
                        });
                      }}
                      placeholder="Add or edit explanation for this question"
                    />
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
