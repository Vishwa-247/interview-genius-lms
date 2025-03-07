
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Video, LineChart, Medal } from "lucide-react";
import Container from "@/components/ui/Container";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - would come from API in a real app
  const recentCourses = [
    { id: "1", title: "React Advanced Patterns", progress: 65, lastAccessed: "2023-05-15" },
    { id: "2", title: "System Design Fundamentals", progress: 40, lastAccessed: "2023-05-12" },
    { id: "3", title: "Data Structures & Algorithms", progress: 85, lastAccessed: "2023-05-10" },
  ];

  const recentInterviews = [
    { id: "1", type: "Technical Interview", date: "2023-05-14", score: 82 },
    { id: "2", type: "HR Interview", date: "2023-05-11", score: 75 },
    { id: "3", type: "Behavioral Interview", date: "2023-05-09", score: 90 },
  ];

  return (
    <Container>
      <div className="py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your learning progress and interview performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/course-generator">Create Course</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/mock-interview">Start Interview</Link>
            </Button>
          </div>
        </div>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Book className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">5</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Practice Interviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Video className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">12</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Medal className="mr-2 h-4 w-4 text-primary" />
                    <div className="text-2xl font-bold">78%</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Courses</CardTitle>
                  <CardDescription>Your latest learning activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recentCourses.map((course) => (
                      <div key={course.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{course.title}</span>
                          <span className="text-sm text-muted-foreground">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Interviews</CardTitle>
                  <CardDescription>Your latest practice sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recentInterviews.map((interview) => (
                      <div key={interview.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{interview.type}</div>
                          <div className="text-sm text-muted-foreground">{interview.date}</div>
                        </div>
                        <div className="flex items-center">
                          <span className={`font-medium ${
                            interview.score >= 80 ? "text-green-500" : 
                            interview.score >= 60 ? "text-amber-500" : "text-red-500"
                          }`}>
                            {interview.score}%
                          </span>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/interview-result/${interview.id}`}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...recentCourses, ...recentCourses].map((course, index) => (
                <Card key={`${course.id}-${index}`}>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>
                      Last accessed on {new Date(course.lastAccessed).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>
                    <Button variant="ghost" size="sm" className="mt-4 w-full" asChild>
                      <Link to={`/course/${course.id}`}>
                        Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6">
                <Book className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Generate New Course</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Create a custom course based on your learning goals
                </p>
                <Button asChild>
                  <Link to="/course-generator">
                    Start Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interviews">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...recentInterviews, ...recentInterviews].map((interview, index) => (
                <Card key={`${interview.id}-${index}`}>
                  <CardHeader>
                    <CardTitle>{interview.type}</CardTitle>
                    <CardDescription>
                      Conducted on {new Date(interview.date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Overall Score</span>
                      <span className={`text-lg font-bold ${
                        interview.score >= 80 ? "text-green-500" : 
                        interview.score >= 60 ? "text-amber-500" : "text-red-500"
                      }`}>
                        {interview.score}%
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to={`/interview-result/${interview.id}`}>
                        View Results <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-dashed border-2 flex flex-col items-center justify-center p-6">
                <Video className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Start New Interview</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Practice with our AI-powered interview simulator
                </p>
                <Button asChild>
                  <Link to="/mock-interview">
                    Begin Practice <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default Dashboard;
