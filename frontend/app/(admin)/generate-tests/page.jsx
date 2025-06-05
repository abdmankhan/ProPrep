"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GenerateTests() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [lod, setLod] = useState("0"); // Default: Easy
  const [count, setCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [testName, setTestName] = useState("");
  const [timeLimit, setTimeLimit] = useState(30); // Default 30 minutes
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [testCreating, setTestCreating] = useState(false);

  const questionsPerPage = 20;
  const totalPages = Math.ceil(previewQuestions.length / questionsPerPage);

  // Get the current page's questions
  const currentQuestions = previewQuestions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  // Fetch all subjects on component mount
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
        toast.error("Error fetching subjects", {
          description: error.response?.data?.error || "An error occurred",
          id: "subjects-error",
          duration: 5000,
        });
        console.error("[Admin Error]", error);
      }
    };

    fetchSubjects();
  }, []);

  // Handle subject selection/deselection
  const handleSubjectChange = (subjectId) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };
  // Generate questions preview
  const handleGeneratePreview = async () => {
    if (selectedSubjects.length === 0) {
      toast.warning("Subject selection required", {
        description: "Please select at least one subject",
        id: "subject-required",
        duration: 3000,
      });
      return;
    }

    if (count < 1) {
      toast.warning("Invalid count", {
        description: "Please enter a valid number of questions",
        id: "count-invalid",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5555/api/admin/mcq/get-test-questions",
        {
          subjectIds: selectedSubjects,
          lod: parseInt(lod),
          count: parseInt(count),
        },
        { withCredentials: true }
      );

      setPreviewQuestions(response.data);
      // Initially select all questions      setSelectedQuestions(response.data.map((q) => q._id));
      setCurrentPage(1);

      toast.success("Questions generated", {
        description: `${response.data.length} questions retrieved successfully`,
        id: "questions-generated",
        duration: 3000,
      });
    } catch (error) {
      toast.error("Error generating questions", {
        description: error.response?.data?.error || "An error occurred",
        id: "generate-error",
        duration: 5000,
      });
      console.error("[Admin Error]", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle question selection/deselection
  const handleQuestionSelection = (questionId) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };
  // Save test to database
  const handleSaveTest = async () => {
    if (!testName.trim()) {
      toast.warning("Test name required", {
        description: "Please enter a name for the test",
        id: "test-name-required",
        duration: 3000,
      });
      return;
    }

    if (selectedQuestions.length === 0) {
      toast.warning("No questions selected", {
        description: "Please select at least one question for the test",
        id: "no-questions-selected",
        duration: 3000,
      });
      return;
    }
    setTestCreating(true);
    try {
      const response = await axios.post(
        "http://localhost:5555/api/admin/mcq/generate-test",
        {
          name: testName,
          subjectIds: selectedSubjects,
          questionIds: selectedQuestions,
          totalQuestions: selectedQuestions.length,
          timeLimit: parseInt(timeLimit),
          shuffleQuestions,
          shuffleOptions,
        },
        { withCredentials: true }
      );

      toast.success("Test created", {
        description: `Test "${testName}" has been created successfully`,
        id: "test-created",
        duration: 5000,
      });

      // Reset form after successful creation
      setPreviewQuestions([]);
      setSelectedQuestions([]);
      setTestName("");
      setTimeLimit(30);
      setShuffleQuestions(false);
      setShuffleOptions(false);
    } catch (error) {
      toast.error("Error creating test", {
        description: error.response?.data?.error || "An error occurred",
        id: "test-error",
        duration: 5000,
      });
      console.error("[Admin Error]", error);
    } finally {
      setTestCreating(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Generate Tests</h1>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="setup">Test Setup</TabsTrigger>
          <TabsTrigger value="preview" disabled={previewQuestions.length === 0}>
            Question Preview
          </TabsTrigger>
          <TabsTrigger value="save" disabled={previewQuestions.length === 0}>
            Save Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>Test Parameters</CardTitle>
              <CardDescription>
                Configure subject, difficulty, and number of questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-base mb-2 block">
                    Select Subjects
                  </Label>
                  <div className="flex flex-wrap gap-4">
                    {subjects.map((subject) => (
                      <div
                        key={subject._id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`subject-${subject._id}`}
                          checked={selectedSubjects.includes(subject._id)}
                          onCheckedChange={() =>
                            handleSubjectChange(subject._id)
                          }
                        />
                        <Label htmlFor={`subject-${subject._id}`}>
                          {subject.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={lod} onValueChange={setLod}>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Easy</SelectItem>
                        <SelectItem value="1">Medium</SelectItem>
                        <SelectItem value="2">Hard</SelectItem>
                        <SelectItem value="3">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="count">Number of Questions</Label>
                    <Input
                      id="count"
                      type="number"
                      min="1"
                      max="100"
                      value={count}
                      onChange={(e) =>
                        setCount(
                          Math.min(
                            100,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGeneratePreview}
                disabled={loading || selectedSubjects.length === 0}
              >
                {loading ? "Generating..." : "Generate Questions Preview"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Question Preview</CardTitle>
              <CardDescription>
                {previewQuestions.length} questions found.{" "}
                {selectedQuestions.length} selected.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {currentQuestions.map((question, index) => (
                  <div key={question._id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id={`question-${question._id}`}
                        checked={selectedQuestions.includes(question._id)}
                        onCheckedChange={() =>
                          handleQuestionSelection(question._id)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`question-${question._id}`}
                          className="font-medium"
                        >
                          {(currentPage - 1) * questionsPerPage + index + 1}.{" "}
                          {question.text}
                        </Label>
                        <div className="mt-2 ml-6 space-y-1">
                          {question.options.map((option, i) => (
                            <div
                              key={i}
                              className={`${
                                i === question.correct
                                  ? "font-semibold text-green-600 dark:text-green-400"
                                  : ""
                              }`}
                            >
                              {String.fromCharCode(65 + i)}. {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedQuestions(previewQuestions.map((q) => q._id));
                }}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedQuestions([]);
                }}
              >
                Deselect All
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="save">
          <Card>
            <CardHeader>
              <CardTitle>Save Test</CardTitle>
              <CardDescription>
                Configure additional test parameters and save
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="Enter a name for this test"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    value={timeLimit}
                    onChange={(e) =>
                      setTimeLimit(Math.max(1, parseInt(e.target.value) || 1))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shuffleQuestions"
                      checked={shuffleQuestions}
                      onCheckedChange={setShuffleQuestions}
                    />
                    <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="shuffleOptions"
                      checked={shuffleOptions}
                      onCheckedChange={setShuffleOptions}
                    />
                    <Label htmlFor="shuffleOptions">Shuffle Options</Label>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Selected questions: {selectedQuestions.length} out of{" "}
                    {previewQuestions.length} available
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveTest}
                disabled={
                  testCreating ||
                  selectedQuestions.length === 0 ||
                  !testName.trim()
                }
              >
                {testCreating ? "Saving..." : "Save Test"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
