
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Container from "@/components/ui/Container";
import GlassMorphism from "@/components/ui/GlassMorphism";
import Navbar from "@/components/layout/Navbar";
import { ArrowRight, BookOpen, Video, Sparkles, Users, BookMarked, FlaskConical, Lightbulb, Megaphone } from "lucide-react";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";

const Index = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"learn" | "interview">("learn");

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
      link: "/future-integrations"
    },
    {
      id: "community",
      title: "AI Interview Agents",
      description: "Practice with specialized AI agents for technical, HR, aptitude, and management rounds.",
      icon: <Users className="h-12 w-12 text-primary" />,
      link: "/future-integrations"
    }
  ];

  const platformBenefits = [
    {
      icon: <BookMarked className="h-8 w-8 text-primary" />,
      title: "Comprehensive Learning Materials",
      description: "Access detailed chapters, flashcards, and interactive quizzes all generated by AI to match your specific learning needs."
    },
    {
      icon: <FlaskConical className="h-8 w-8 text-primary" />,
      title: "Personalized Learning Path",
      description: "Courses adapt to your skill level, from beginner to advanced, ensuring effective learning progression."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      title: "Diverse Learning Methods",
      description: "Study with various formats including text chapters, flashcards, MCQs, and Q&A pairs for comprehensive understanding."
    },
    {
      icon: <Megaphone className="h-8 w-8 text-primary" />,
      title: "Community Learning",
      description: "Share and access courses created by others in the community, expanding your knowledge base."
    },
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
              AI-Powered Learning & Interview Preparation Platform
            </h1>
            <p className="text-xl text-muted-foreground animate-fade-up mb-8">
              Generate custom courses, practice with intelligent mock interviews,
              and receive detailed feedback to master any subject or ace your next interview.
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
      
      {/* Platform Overview Section */}
      <section className="py-16 bg-muted/30">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our core features designed to enhance your learning and interview preparation experience.
            </p>
          </div>
          
          <Tabs 
            defaultValue="learn" 
            value={activeTab} 
            onValueChange={(val) => setActiveTab(val as "learn" | "interview")}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-2 w-[400px]">
                <TabsTrigger value="learn">Learning Platform</TabsTrigger>
                <TabsTrigger value="interview">Interview Preparation</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="learn" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {platformBenefits.map((benefit, idx) => (
                  <div key={idx} className="flex gap-4 p-6 bg-card rounded-lg shadow-sm">
                    <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button size="lg" asChild>
                  <Link to="/course-generator">
                    Start Learning Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="interview" className="space-y-8">
              <GlassMorphism className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Mock Interview Simulator</h3>
                    <p className="text-muted-foreground mb-4">
                      Practice with our AI-powered interview simulator that adapts to your field and experience level.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>Customized questions based on job role</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>Technical, HR, and behavioral interviews</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>Real-time feedback on your responses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>Performance analytics and improvement tracking</span>
                      </li>
                    </ul>
                    <div className="mt-6">
                      <Button asChild>
                        <Link to="/mock-interview">Try Mock Interview</Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden border border-border relative aspect-video bg-muted flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="h-16 w-16 text-muted-foreground opacity-50" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 p-4 bg-background/80 backdrop-blur-sm rounded-lg">
                      <p className="text-sm font-medium">Coming soon: AI video analysis of your body language and speaking patterns</p>
                    </div>
                  </div>
                </div>
              </GlassMorphism>
              
              <div className="mt-8 flex justify-center">
                <Button size="lg" asChild>
                  <Link to="/future-integrations">
                    Explore Advanced Features <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/20 to-secondary/20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning Experience?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of users who are already using our platform to master new skills and ace their interviews.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">
                  Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/future-integrations">
                  Explore Future Features
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Index;
