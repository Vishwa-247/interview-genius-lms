
import { useState } from "react";
import { BookOpen, FileText, ListChecks, CreditCard } from "lucide-react";
import Container from "@/components/ui/Container";
import CourseForm from "@/components/course/CourseForm";
import GlassMorphism from "@/components/ui/GlassMorphism";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface CourseContent {
  title: string;
  description: string;
  notes: string[];
  flashcards: Array<{ question: string; answer: string }>;
  quizzes: Array<{ question: string; options: string[]; answer: number }>;
}

const CourseGenerator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<CourseContent | null>(null);
  const [activeTab, setActiveTab] = useState("notes");

  const handleGenerateCourse = (courseName: string, difficulty: string) => {
    setIsLoading(true);
    
    // Simulate API call to generate course
    setTimeout(() => {
      // This is mock data - in a real app, this would come from the AI service
      const mockCourse: CourseContent = {
        title: courseName,
        description: `A comprehensive ${difficulty} level course on ${courseName}. This course covers all essential concepts and practical applications.`,
        notes: [
          "Introduction to key concepts and principles",
          "Understanding the core framework and structure",
          "Advanced techniques and methodologies",
          "Real-world applications and case studies",
          "Best practices and optimization strategies",
        ],
        flashcards: [
          {
            question: "What is the primary purpose of this topic?",
            answer: "To provide a systematic approach to solving complex problems in the domain.",
          },
          {
            question: "Name three key benefits of mastering this subject.",
            answer: "Improved analytical skills, better problem-solving capabilities, and enhanced career opportunities.",
          },
          {
            question: "What distinguishes beginners from experts in this field?",
            answer: "Deep understanding of principles, ability to apply concepts in varied contexts, and intuitive problem recognition.",
          },
        ],
        quizzes: [
          {
            question: "Which of the following is NOT a core principle?",
            options: [
              "Systematic approach",
              "Iterative refinement",
              "Linear progression",
              "Contextual awareness",
            ],
            answer: 2,
          },
          {
            question: "In which scenario would you apply the advanced technique?",
            options: [
              "When dealing with simple problems",
              "When optimization is critical",
              "When time is limited",
              "When working with beginners",
            ],
            answer: 1,
          },
        ],
      };
      
      setGeneratedCourse(mockCourse);
      setIsLoading(false);
    }, 2000);
  };

  const renderTabContent = () => {
    if (!generatedCourse) return null;

    switch (activeTab) {
      case "notes":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Course Notes</h3>
            <div className="space-y-4">
              {generatedCourse.notes.map((note, index) => (
                <div key={index} className="p-4 bg-white/10 dark:bg-black/10 rounded-lg">
                  <p className="text-foreground">{note}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "flashcards":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Flashcards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedCourse.flashcards.map((card, index) => (
                <div key={index} className="bg-white/10 dark:bg-black/10 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <p className="font-medium">{card.question}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-muted-foreground">{card.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "quizzes":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Practice Quizzes</h3>
            <div className="space-y-8">
              {generatedCourse.quizzes.map((quiz, quizIndex) => (
                <div key={quizIndex} className="space-y-3">
                  <p className="font-medium">{quiz.question}</p>
                  <div className="space-y-2">
                    {quiz.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg flex items-center space-x-3 cursor-pointer transition-colors ${
                          optionIndex === quiz.answer
                            ? "bg-primary/20 border border-primary/30"
                            : "bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            optionIndex === quiz.answer
                              ? "bg-primary text-white"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </div>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Generate Your <span className="text-gradient">Personalized</span> Course
            </h1>
            <p className="text-lg text-muted-foreground">
              Enter a topic and difficulty level, and our AI will create a
              comprehensive learning experience tailored to your needs.
            </p>
          </div>

          {!generatedCourse ? (
            <CourseForm onSubmit={handleGenerateCourse} isLoading={isLoading} />
          ) : (
            <div className="space-y-8">
              <GlassMorphism className="p-8" intensity="medium">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">{generatedCourse.title}</h2>
                  <p className="text-muted-foreground">
                    {generatedCourse.description}
                  </p>
                </div>
              </GlassMorphism>

              <div className="flex overflow-x-auto space-x-2 pb-2">
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap transition-colors ${
                    activeTab === "notes"
                      ? "bg-primary text-white"
                      : "bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20"
                  }`}
                >
                  <FileText size={16} />
                  <span>Notes</span>
                </button>
                <button
                  onClick={() => setActiveTab("flashcards")}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap transition-colors ${
                    activeTab === "flashcards"
                      ? "bg-primary text-white"
                      : "bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20"
                  }`}
                >
                  <CreditCard size={16} />
                  <span>Flashcards</span>
                </button>
                <button
                  onClick={() => setActiveTab("quizzes")}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap transition-colors ${
                    activeTab === "quizzes"
                      ? "bg-primary text-white"
                      : "bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20"
                  }`}
                >
                  <ListChecks size={16} />
                  <span>Quizzes</span>
                </button>
              </div>

              <GlassMorphism className="p-8" intensity="medium">
                {renderTabContent()}
              </GlassMorphism>

              <div className="flex justify-center">
                <button
                  onClick={() => setGeneratedCourse(null)}
                  className="px-6 py-3 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Generate Another Course
                </button>
              </div>
            </div>
          )}
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseGenerator;
