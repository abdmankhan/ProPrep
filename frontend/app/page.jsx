// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import * as echarts from "echarts";
import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
// Ensure Inter is imported globally

const App = () => {
  const radarChartRef = useRef(null);
  const progressChartRef = useRef(null);

  useEffect(() => {
    if (radarChartRef.current) {
      const radarChart = echarts.init(radarChartRef.current);
      const radarOption = {
        animation: false,
        backgroundColor: "transparent",
        radar: {
          indicator: [
            { name: "Coding", max: 100 },
            { name: "Aptitude", max: 100 },
            { name: "MCQs", max: 100 },
            { name: "Interview", max: 100 },
            { name: "Problem Solving", max: 100 },
          ],
          radius: 100,
          splitArea: {
            areaStyle: {
              color: ["rgba(114, 165, 245, 0.05)", "rgba(114, 165, 245, 0.1)"],
            },
          },
          axisLine: {
            lineStyle: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
          splitLine: {
            lineStyle: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
          name: {
            textStyle: {
              color: "#4B5563",
            },
          },
        },
        series: [
          {
            name: "Skills Assessment",
            type: "radar",
            data: [
              {
                value: [85, 70, 90, 65, 75],
                name: "Your Skills",
                areaStyle: {
                  color: "rgba(99, 102, 241, 0.4)",
                },
                lineStyle: {
                  color: "rgba(99, 102, 241, 0.8)",
                },
                itemStyle: {
                  color: "rgba(99, 102, 241, 0.8)",
                },
              },
            ],
          },
        ],
      };
      radarChart.setOption(radarOption);

      window.addEventListener("resize", () => {
        radarChart.resize();
      });
    }

    if (progressChartRef.current) {
      const progressChart = echarts.init(progressChartRef.current);
      const progressOption = {
        animation: false,
        backgroundColor: "transparent",
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderColor: "rgba(0, 0, 0, 0.1)",
          textStyle: {
            color: "#4B5563",
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          axisLine: {
            lineStyle: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
          axisLabel: {
            color: "#4B5563",
          },
        },
        yAxis: {
          type: "value",
          axisLine: {
            lineStyle: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
          splitLine: {
            lineStyle: {
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
          axisLabel: {
            color: "#4B5563",
          },
        },
        series: [
          {
            name: "Problems Solved",
            type: "line",
            data: [10, 15, 8, 20, 12, 25, 18],
            smooth: true,
            lineStyle: {
              color: "#6366f1",
              width: 3,
            },
            symbol: "circle",
            symbolSize: 8,
            itemStyle: {
              color: "#6366f1",
              borderWidth: 2,
              borderColor: "#fff",
            },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: "rgba(99, 102, 241, 0.5)",
                  },
                  {
                    offset: 1,
                    color: "rgba(99, 102, 241, 0.1)",
                  },
                ],
              },
            },
          },
        ],
      };
      progressChart.setOption(progressOption);

      window.addEventListener("resize", () => {
        progressChart.resize();
      });
    }

    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-inter">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a365d]/5 to-white">
        <div className="absolute inset-0 z-0">
          <img
            src="https://readdy.ai/api/search-image?query=Modern%20abstract%20technology%20background%20with%20glowing%20blue%20and%20purple%20gradient%2C%20futuristic%20digital%20interface%20elements%2C%20subtle%20code%20patterns%2C%20and%20soft%20geometric%20shapes%2C%20perfect%20for%20an%20AI-powered%20education%20platform%2C%20with%20clean%20minimal%20design%20and%20ample%20space%20for%20text%20on%20the%20left%20side&width=1440&height=600&seq=hero-bg-1&orientation=landscape"
            alt="Hero Background"
            className="w-full h-full object-cover object-top opacity-10"
          />
        </div>
        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="text-left">
              <Badge className="mb-4 bg-[#1a365d]/10 text-[#1a365d] hover:bg-[#1a365d]/20 px-3 py-1">
                AI-Powered Learning
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a365d] mb-4 md:mb-6 leading-tight">
                Ace Your Placement{" "}
                <span className="text-[#2a4365]">Preparation</span> with AI
              </h1>
              <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8">
                One platform for all your placement needs - MCQs, Aptitude,
                Coding Tests, and Interview Preparation. Personalized learning
                powered by advanced AI to maximize your success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-[#1a365d] hover:bg-[#2a4365] text-base md:text-lg px-6 md:px-8 py-4 md:py-6 !rounded-md text-white shadow-sm transition-colors">
                  Start Learning Now
                </Button>
                <Button
                  variant="outline"
                  className="border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white text-base md:text-lg px-6 md:px-8 py-4 md:py-6 !rounded-md transition-colors"
                >
                  <i className="fas fa-play-circle mr-2"></i> Watch Demo
                </Button>
              </div>
              <div className="mt-6 md:mt-8 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Avatar key={i} className="border-2 border-white w-8 h-8">
                      <AvatarImage
                        src={`https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20of%20diverse%20person%20with%20neutral%20background%2C%20high%20quality%2C%20photorealistic&width=100&height=100&seq=avatar-${i}&orientation=squarish`}
                      />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="ml-4">
                  <span className="text-sm text-gray-600">
                    Joined by{" "}
                    <span className="font-semibold text-[#1a365d]">
                      10,000+
                    </span>{" "}
                    students
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 bg-[#1a365d]/10 text-[#1a365d] hover:bg-[#1a365d]/20">
              All-in-One Solution
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">
              Comprehensive Preparation Tools
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform offers everything you need to excel in
              your placement journey, from technical assessments to soft skills
              development.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                icon: "fas fa-tasks",
                title: "MCQ Practice",
                description:
                  "Practice with AI-generated questions tailored to your skill level and target companies.",
                image:
                  "https://readdy.ai/api/search-image?query=3D%20illustration%20of%20a%20digital%20quiz%20interface%20with%20multiple%20choice%20questions%2C%20glowing%20checkboxes%2C%20and%20a%20futuristic%20blue%20gradient%20background%20with%20abstract%20patterns%2C%20clean%20modern%20design%20with%20tech%20elements&width=500&height=300&seq=mcq-1&orientation=landscape",
                features: [
                  "Adaptive difficulty",
                  "Company-specific questions",
                  "Instant feedback",
                ],
              },
              {
                icon: "fas fa-brain",
                title: "Aptitude Training",
                description:
                  "Sharpen your logical and mathematical skills with personalized aptitude challenges.",
                image:
                  "https://readdy.ai/api/search-image?query=3D%20illustration%20of%20mathematical%20formulas%20and%20geometric%20shapes%20floating%20in%20a%20digital%20space%20with%20glowing%20blue%20and%20purple%20gradients%2C%20abstract%20brain%20visualization%2C%20clean%20modern%20design%20with%20tech%20elements&width=500&height=300&seq=aptitude-1&orientation=landscape",
                features: [
                  "Dynamic difficulty scaling",
                  "Timed challenges",
                  "Detailed explanations",
                ],
              },
              {
                icon: "fas fa-code",
                title: "Coding Tests",
                description:
                  "Solve coding problems with real-time AI code reviews and optimization suggestions.",
                image:
                  "https://readdy.ai/api/search-image?query=3D%20illustration%20of%20programming%20code%20on%20a%20virtual%20screen%20with%20glowing%20syntax%20highlighting%20in%20blue%20and%20purple%20tones%2C%20floating%20code%20blocks%20in%20a%20digital%20space%2C%20clean%20modern%20design%20with%20tech%20elements&width=500&height=300&seq=coding-1&orientation=landscape",
                features: [
                  "Real-time code analysis",
                  "Multiple language support",
                  "Industry-standard problems",
                ],
              },
              {
                icon: "fas fa-user-tie",
                title: "Interview Preparation",
                description:
                  "Practice with AI-powered mock interviews that provide feedback on your responses.",
                image:
                  "https://readdy.ai/api/search-image?query=3D%20illustration%20of%20a%20virtual%20interview%20setup%20with%20holographic%20screens%20showing%20conversation%20analytics%2C%20in%20a%20futuristic%20blue%20and%20purple%20gradient%20environment%2C%20clean%20modern%20design%20with%20tech%20elements&width=500&height=300&seq=interview-1&orientation=landscape",
                features: [
                  "Video interview simulation",
                  "Personalized feedback",
                  "HR & technical rounds",
                ],
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="overflow-hidden border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 bg-sky-50"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1a365d]/10 flex items-center justify-center text-[#1a365d]">
                      <i className={feature.icon}></i>
                    </div>
                    <CardTitle className="text-[#1a365d]">
                      {feature.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <i className="fas fa-check-circle text-[#1a365d]"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#1a365d] hover:bg-[#2a4365] !rounded-md text-white shadow-sm transition-colors">
                    Explore {feature.title}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Progress Dashboard Preview */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 bg-[#1a365d]/10 text-[#1a365d] hover:bg-[#1a365d]/20">
              Smart Analytics
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">
              Track Your Progress
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Get detailed insights into your learning journey with our
              AI-powered analytics dashboard.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-xl font-semibold text-[#1a365d]">
                  Your Learning Dashboard
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    Last updated: Today
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="!rounded-md border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white transition-colors"
                  >
                    <i className="fas fa-sync-alt mr-2"></i> Refresh
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6">
              <div className="col-span-1">
                <Card className="bg-white border border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Skills Assessment</CardTitle>
                    <CardDescription>
                      Your current proficiency levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      ref={radarChartRef}
                      className="w-full h-64 bg-white"
                    ></div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-1 md:col-span-2">
                <Card className="bg-white border border-gray-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Weekly Progress</CardTitle>
                    <CardDescription>Problems solved over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      ref={progressChartRef}
                      className="w-full h-64 bg-white"
                    ></div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6">
              {[
                {
                  title: "Total Practice Time",
                  value: "42h 30m",
                  icon: "fas fa-clock",
                  change: "+12% from last week",
                  positive: true,
                },
                {
                  title: "Problems Solved",
                  value: "328",
                  icon: "fas fa-check-circle",
                  change: "+28 this week",
                  positive: true,
                },
                {
                  title: "Success Rate",
                  value: "78%",
                  icon: "fas fa-chart-line",
                  change: "+5% improvement",
                  positive: true,
                },
              ].map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold mt-1">{stat.value}</p>
                        <p
                          className={`text-sm mt-2 ${
                            stat.positive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          <i
                            className={`fas ${
                              stat.positive ? "fa-arrow-up" : "fa-arrow-down"
                            } mr-1`}
                          ></i>
                          {stat.change}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl">
                        <i className={stat.icon}></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-4 md:p-6 border-t border-gray-100">
              <h3 className="text-xl font-semibold mb-4">
                Personalized Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Improve your Data Structures knowledge",
                    type: "Course",
                    time: "Estimated 4 hours",
                  },
                  {
                    title: "Practice more SQL query problems",
                    type: "Practice",
                    time: "Recommended 10 problems",
                  },
                  {
                    title: "Take the System Design mock interview",
                    type: "Interview",
                    time: "30 minutes session",
                  },
                  {
                    title: "Revise Aptitude - Probability section",
                    type: "Revision",
                    time: "Weak area detected",
                  },
                ].map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <i className="fas fa-lightbulb"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Badge variant="outline">{rec.type}</Badge>
                        <span>{rec.time}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!rounded-button whitespace-nowrap cursor-pointer"
                    >
                      <i className="fas fa-arrow-right"></i>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Learning Paths */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 bg-[#1a365d]/10 text-[#1a365d] hover:bg-[#1a365d]/20">
              Customized Journeys
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">
              Interactive Learning Paths
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Follow structured learning paths tailored to your career goals and
              current skill level.
            </p>
          </div>

          <Tabs defaultValue="software" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-8">
              <TabsTrigger
                value="software"
                className="!rounded-button whitespace-nowrap cursor-pointer"
              >
                Software Development
              </TabsTrigger>
              <TabsTrigger
                value="data"
                className="!rounded-button whitespace-nowrap cursor-pointer"
              >
                Data Science
              </TabsTrigger>
              <TabsTrigger
                value="product"
                className="!rounded-button whitespace-nowrap cursor-pointer"
              >
                Product Management
              </TabsTrigger>
            </TabsList>

            {["software", "data", "product"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-6">
                <div className="bg-gray-50 rounded-xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {tab === "software"
                          ? "Software Engineering Path"
                          : tab === "data"
                          ? "Data Science & Analytics Path"
                          : "Product Management Path"}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {tab === "software"
                          ? "Master algorithms, system design, and full-stack development"
                          : tab === "data"
                          ? "Excel in statistics, machine learning, and data visualization"
                          : "Learn product strategy, user research, and agile methodologies"}
                      </p>
                    </div>
                    <Button className="bg-[#1a365d] hover:bg-[#2a4365] !rounded-button whitespace-nowrap cursor-pointer">
                      Start This Path
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200 z-0"></div>

                    <div className="space-y-8 relative z-10">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex">
                          <div className="flex-shrink-0 relative">
                            <div
                              className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${
                                step === 1
                                  ? "bg-[#1a365d] text-white"
                                  : "bg-white border-2 border-gray-200 text-gray-400"
                              }`}
                            >
                              {step}
                            </div>
                            {step !== 4 && (
                              <div className="absolute left-8 top-16 bottom-0 w-1 bg-gray-200 z-0"></div>
                            )}
                          </div>

                          <div className="ml-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex-1">
                            <h4 className="text-xl font-semibold mb-2">
                              {tab === "software"
                                ? step === 1
                                  ? "Data Structures & Algorithms"
                                  : step === 2
                                  ? "System Design Fundamentals"
                                  : step === 3
                                  ? "Full-Stack Development"
                                  : "Advanced Topics & Specialization"
                                : tab === "data"
                                ? step === 1
                                  ? "Statistics & Probability"
                                  : step === 2
                                  ? "Machine Learning Basics"
                                  : step === 3
                                  ? "Advanced ML & Deep Learning"
                                  : "Big Data & Production Systems"
                                : step === 1
                                ? "Product Thinking & Strategy"
                                : step === 2
                                ? "User Research & Analysis"
                                : step === 3
                                ? "Agile & Scrum Methodologies"
                                : "Product Metrics & Growth"}
                            </h4>

                            <p className="text-gray-600 mb-4">
                              {step === 1
                                ? "Master the fundamentals that form the basis of technical interviews."
                                : step === 2
                                ? "Learn how to design scalable systems and communicate your ideas."
                                : step === 3
                                ? "Build practical projects that showcase your implementation skills."
                                : "Specialize in areas that align with your career goals and interests."}
                            </p>

                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center mb-2">
                                  <span className="text-sm font-medium text-gray-700 mr-2">
                                    Progress:
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {step === 1
                                      ? "65%"
                                      : step === 2
                                      ? "30%"
                                      : "0%"}
                                  </span>
                                </div>
                                <Progress
                                  value={step === 1 ? 65 : step === 2 ? 30 : 0}
                                  className="w-48 h-2"
                                />
                              </div>

                              <Button
                                variant={step <= 2 ? "default" : "outline"}
                                size="sm"
                                className="!rounded-button whitespace-nowrap cursor-pointer"
                              >
                                {step === 1
                                  ? "Continue"
                                  : step === 2
                                  ? "Start"
                                  : "Locked"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 bg-[#1a365d]/10 text-[#1a365d] hover:bg-[#1a365d]/20">
              AI-Powered
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">
              Advanced AI Features
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform leverages cutting-edge AI to provide personalized
              learning experiences and actionable insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <img
                src="https://readdy.ai/api/search-image?query=3D%20illustration%20of%20an%20advanced%20AI%20system%20analyzing%20data%2C%20with%20glowing%20neural%20networks%2C%20flowing%20data%20visualizations%2C%20and%20futuristic%20interface%20elements%2C%20in%20blue%20and%20purple%20gradient%20tones%20with%20a%20clean%20modern%20aesthetic&width=600&height=500&seq=ai-features&orientation=landscape"
                alt="AI Features"
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>

            <div className="space-y-6 md:space-y-8 order-1 md:order-2">
              {[
                {
                  icon: "fas fa-brain",
                  title: "Adaptive Learning",
                  description:
                    "Our AI adapts to your learning pace and style, adjusting question difficulty and focus areas in real-time.",
                },
                {
                  icon: "fas fa-comment-dots",
                  title: "Personalized Feedback",
                  description:
                    "Receive detailed feedback on your solutions with specific improvement suggestions tailored to your skill level.",
                },
                {
                  icon: "fas fa-robot",
                  title: "AI Interview Simulation",
                  description:
                    "Practice with our AI interviewer that simulates real interview scenarios and provides constructive feedback.",
                },
                {
                  icon: "fas fa-chart-line",
                  title: "Performance Analytics",
                  description:
                    "Get deep insights into your strengths and weaknesses with AI-powered performance analysis.",
                },
              ].map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1a365d]/10 flex items-center justify-center text-[#1a365d] text-xl">
                    <i className={feature.icon}></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}

              <Button className="bg-[#1a365d] hover:bg-[#2a4365] !rounded-button whitespace-nowrap cursor-pointer">
                Explore AI Features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge className="mb-4 bg-[#1a365d]/10 text-[#1a365d] hover:bg-[#1a365d]/20">
              Success Stories
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a365d] mb-4">
              What Our Users Say
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              Hear from students who transformed their placement journey with
              our platform.
            </p>
          </div>

          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            className="pb-12"
          >
            {[
              {
                name: "Priya Sharma",
                role: "Software Engineer at Microsoft",
                image:
                  "https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20of%20a%20smiling%20Indian%20woman%20with%20neutral%20background%2C%20high%20quality%2C%20photorealistic&width=100&height=100&seq=testimonial-1&orientation=squarish",
                quote:
                  "The AI-powered mock interviews were game-changers for me. They helped me identify my weak points and improve my communication skills significantly.",
              },
              {
                name: "Alex Johnson",
                role: "Data Analyst at Amazon",
                image:
                  "https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20of%20a%20smiling%20man%20with%20neutral%20background%2C%20high%20quality%2C%20photorealistic&width=100&height=100&seq=testimonial-2&orientation=squarish",
                quote:
                  "The personalized learning path helped me focus on exactly what I needed to learn. The aptitude section especially improved my problem-solving speed.",
              },
              {
                name: "Raj Patel",
                role: "Product Manager at Flipkart",
                image:
                  "https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20of%20a%20smiling%20Indian%20man%20with%20neutral%20background%2C%20high%20quality%2C%20photorealistic&width=100&height=100&seq=testimonial-3&orientation=squarish",
                quote:
                  "From struggling with coding interviews to landing my dream job, this platform made all the difference. The real-time feedback on my code was invaluable.",
              },
              {
                name: "Emma Wilson",
                role: "Frontend Developer at Google",
                image:
                  "https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20of%20a%20smiling%20woman%20with%20neutral%20background%2C%20high%20quality%2C%20photorealistic&width=100&height=100&seq=testimonial-4&orientation=squarish",
                quote:
                  "The community aspect of the platform was unexpected but incredibly helpful. I found study partners and we all succeeded together!",
              },
              {
                name: "David Kim",
                role: "ML Engineer at Netflix",
                image:
                  "https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20of%20a%20smiling%20Asian%20man%20with%20neutral%20background%2C%20high%20quality%2C%20photorealistic&width=100&height=100&seq=testimonial-5&orientation=squarish",
                quote:
                  "The AI-generated practice questions were surprisingly relevant to my actual interviews. It's like the platform knew exactly what I needed to prepare for.",
              },
            ].map((testimonial, index) => (
              <SwiperSlide key={index}>
                <Card className="h-full">
                  <CardContent className="p-8">
                    <div className="flex flex-col h-full">
                      <div className="mb-6">
                        <i className="fas fa-quote-left text-4xl text-[#1a365d]"></i>
                        <p className="mt-4 text-gray-700 italic">
                          "{testimonial.quote}"
                        </p>
                      </div>
                      <div className="mt-auto flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={testimonial.image} />
                          <AvatarFallback>
                            {testimonial.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          <p className="text-sm text-gray-600">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-[#1a365d]/5 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-[#1a365d]/10 text-[#1a365d] hover:bg-[#1a365d]/20">
                Get Started Today
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a365d] mb-4 md:mb-6">
                Ready to Transform Your Placement Journey?
              </h2>
              <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
                Join thousands of students who have successfully landed their
                dream jobs using our AI-powered preparation platform.
              </p>

              <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                {[
                  { stat: "10,000+", label: "Active Users" },
                  { stat: "85%", label: "Success Rate" },
                  { stat: "200+", label: "Companies Hiring" },
                  { stat: "24/7", label: "AI Support" },
                ].map((item, index) => (
                  <div key={index}>
                    <p className="text-3xl font-bold text-[#1a365d]">
                      {item.stat}
                    </p>
                    <p className="text-gray-600">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-[#1a365d] hover:bg-[#2a4365] text-base md:text-lg px-6 md:px-8 py-4 md:py-6 !rounded-md text-white shadow-sm">
                  Start Free Trial
                </Button>
                <Button
                  variant="outline"
                  className="border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white text-base md:text-lg px-6 md:px-8 py-4 md:py-6 !rounded-md"
                >
                  Watch Demo
                </Button>
              </div>
            </div>

            <div className="hidden md:block">
              <img
                src="https://readdy.ai/api/search-image?query=3D%20illustration%20of%20diverse%20students%20celebrating%20success%2C%20with%20graduation%20caps%2C%20job%20offer%20letters%2C%20and%20achievement%20symbols%2C%20in%20a%20futuristic%20digital%20environment%20with%20blue%20and%20purple%20gradients%2C%20clean%20modern%20design&width=600&height=500&seq=cta-image&orientation=landscape"
                alt="Success Celebration"
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* AI Assistant Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#1a365d] hover:bg-[#2a4365] shadow-lg flex items-center justify-center text-white text-xl !rounded-full transition-colors">
          <i className="fas fa-robot"></i>
        </Button>
      </div>
    </div>
  );
};

export default App;
