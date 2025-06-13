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
import { toast } from "sonner";
import { config } from "@/lib/config";

export default function CreateTopicPage() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(
          `${config.apiUrl}/api/admin/mcq/subjects`,
          { withCredentials: true }
        );
        setSubjects(response.data);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        toast.error("Failed to load subjects");
      }
    };
    fetchSubjects();
  }, []);

  // Update selected subject when subjectId changes
  useEffect(() => {
    if (subjectId) {
      const subject = subjects.find((s) => s._id === subjectId);
      setSelectedSubject(subject);
    } else {
      setSelectedSubject(null);
    }
  }, [subjectId, subjects]);

  const handleSubmit = async () => {
    if (!subjectId || !name.trim() || !selectedSubject) return;

    // Split the topic names by comma and trim whitespace
    const topicNames = name
      .split(",")
      .map((topic) => topic.trim())
      .filter((topic) => topic);

    if (topicNames.length === 0) return;

    // Show confirmation toast with topic names
    toast.custom(
      (t) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-lg mb-2">Confirm Adding Topics</h3>
          <p className="mb-2">
            Are you sure you want to add the following topics to{" "}
            <strong>{selectedSubject.name}</strong>?
          </p>
          <ul className="list-disc list-inside mb-4 text-sm max-h-40 overflow-y-auto">
            {topicNames.map((topic, index) => (
              <li key={index}>{topic}</li>
            ))}
          </ul>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t)}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t);
                addTopics(topicNames);
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000, // 5 seconds
      }
    );
  };

  const addTopics = async (topicNames) => {
    setIsSubmitting(true);

    try {
      // Track successes and failures
      let successCount = 0;
      let failureCount = 0;
      const successfulTopics = [];

      // Process each topic
      for (const topicName of topicNames) {
        try {
          const response = await axios.post(
            `${config.apiUrl}/api/admin/mcq/topics`,
            {
              subjectId,
              name: topicName,
              subjectName: selectedSubject.name,
            },
            { withCredentials: true }
          );
          successCount++;
          successfulTopics.push(topicName);
        } catch (error) {
          console.error(`Failed to create topic '${topicName}':`, error);
          failureCount++;
        }
      }

      // Show appropriate toast based on results
      if (successCount > 0 && failureCount === 0) {
        toast.success(
          <div>
            <p>
              Successfully added {successCount} topic
              {successCount !== 1 ? "s" : ""} to{" "}
              <strong>{selectedSubject.name}</strong>
            </p>
            <ul className="list-disc list-inside mt-2 text-sm max-h-32 overflow-y-auto">
              {successfulTopics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </div>
        );
      } else if (successCount > 0 && failureCount > 0) {
        toast.warning(
          <div>
            <p>
              Added {successCount} topic
              {successCount !== 1 ? "s" : ""} to{" "}
              <strong>{selectedSubject.name}</strong>, but {failureCount} failed
            </p>
            <ul className="list-disc list-inside mt-2 text-sm max-h-32 overflow-y-auto">
              {successfulTopics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </div>
        );
      } else {
        toast.error("Failed to add topics");
      }

      // Clear the input field
      setName("");
    } catch (error) {
      console.error("Error adding topics:", error);
      toast.error("Failed to add topics");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">Create New Topics</h2>
      <div className="space-y-2">
        <label className="text-sm font-medium">Subject</label>
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger className="w-full">
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
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Topic Names (separate multiple topics with commas)
        </label>
        <Input
          placeholder="e.g. Functions, Variables, Loops"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!subjectId || !name.trim() || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Adding Topics..." : "Add Topics"}
      </Button>
    </div>
  );
}
