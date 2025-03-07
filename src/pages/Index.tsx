
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Container from "@/components/ui/Container";
import GlassMorphism from "@/components/ui/GlassMorphism";
import Navbar from "@/components/layout/Navbar";
import { ArrowRight, BookOpen, Video, Sparkles, Users } from "lucide-react";

const Index = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const features = [
    {
      id: "courses",
      title: "AI Course Generation",
      description: "Create customized courses by specifying topic and difficulty. Get comprehensive notes, flashcards, and practice questions.",
      icon: <BookOpen className="h-12 w-12 text-primary" />,
      link: "/course-generator"
    },
    {
      id: "interview",
      title: "Mock Interview Simulator",
      description: "Practice interviews with AI that adapts to your role and experience. Receive detailed feedback on your answers.",
      icon: <Video className="h-12 w-12 text-primary" />,
      link: "/mock-interview"
    },
    {
      id: "analysis",
      title: "Video Analysis",
      description: "Get insights on your confidence, engagement, and non-verbal communication during interview practice.",
      icon: <Sparkles className="h-12 w-12 text-primary" />,
      link: "/mock-interview"
    },
    {
      id: "community",
      title: "AI Interview Agents",
      description: "Practice with specialized AI agents for technical, HR, aptitude, and management rounds.",
      icon: <Users className="h-12 w-12 text-primary" />,
      link: "/mock-interview"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-muted/30"></div>
        <div className="absolute inset-0 -z-10 bg-mesh-1 opacity-30"></div>
        
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-gradient animate-fade-in font-bold mb-6">
              Master Your Interviews with AI-Powered Learning
            </h1>
            <p className="text-xl text-muted-foreground animate-fade-up mb-8">
              Generate custom courses, practice with intelligent mock interviews,
              and receive detailed feedback to improve your skills.
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-fade-up delay-100">
              <Button size="lg" asChild>
                <Link to="/course-generator">
                  Generate Courses <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/mock-interview">
                  Practice Interviews <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform offers everything you need to prepare for interviews and learn new skills efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <Card 
                key={feature.id}
                className="transition-all duration-300 hover:shadow-soft-xl"
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    variant={hoveredCard === feature.id ? "default" : "ghost"} 
                    className="transition-all duration-300 w-full" 
                    asChild
                  >
                    <Link to={feature.link}>
                      Explore {hoveredCard === feature.id && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Index;
