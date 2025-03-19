
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Video, LineChart, Medal, MessageSquare } from "lucide-react";
import Container from "@/components/ui/Container";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import Chatbot from "@/components/Chatbot";
import { CourseType, MockInterviewType } from "@/types";
import { getUserCourses, getUserMockInterviews } from "@/services/api";
import { useEffect } from "react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showChatbot, setShowChatbot] = useState(false);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [interviews, setInterviews] = useState<MockInterviewType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const [courseData, interviewData] = await Promise.all([
          getUserCourses(),
          getUserMockInterviews()
        ]);
        
        setCourses(courseData);
        setInterviews(interviewData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  const recentCourses = courses.slice(0, 3);
  const recentInterviews = interviews.slice(0, 3);

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
            <Button 
              variant="outline" 
              onClick={() => setShowChatbot(!showChatbot)}
              className="flex items-center gap-1"
            >
              <MessageSquare size={16} />
              <span>Help</span>
            </Button>
          </div>
        </div>

        {showChatbot && (
          <div className="mb-8">
            <Chatbot />
          </div>
        )}

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
                    <div className="text-2xl font-bold">{courses.length}</div>
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
                    <div className="text-2xl font-bold">{interviews.length}</div>
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
                  {isLoading ? (
                    <div className="text-center py-4 text-muted-foreground">Loading...</div>
                  ) : recentCourses.length > 0 ? (
                    <div className="space-y-6">
                      {recentCourses.map((course) => (
                        <div key={course.id} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{course.title}</span>
                            <span className="text-sm text-muted-foreground">{Math.floor(Math.random() * 80 + 20)}%</span>
                          </div>
                          <Progress value={Math.floor(Math.random() * 80 + 20)} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No courses yet. Create your first course!
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Interviews</CardTitle>
                  <CardDescription>Your latest practice sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-4 text-muted-foreground">Loading...</div>
                  ) : recentInterviews.length > 0 ? (
                    <div className="space-y-6">
                      {recentInterviews.map((interview) => (
                        <div key={interview.id} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{interview.job_role}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(interview.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`font-medium ${
                              Math.random() >= 0.8 ? "text-green-500" : 
                              Math.random() >= 0.5 ? "text-amber-500" : "text-red-500"
                            }`}>
                              {Math.floor(Math.random() * 40 + 60)}%
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
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No interviews yet. Start your first mock interview!
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">Loading your courses...</div>
              ) : courses.length > 0 ? (
                <>
                  {courses.map((course) => (
                    <Card key={course.id}>
                      <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>
                          {course.purpose.replace('_', ' ')} • {course.difficulty}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Progress</span>
                            <span className="text-sm font-medium">{Math.floor(Math.random() * 80 + 20)}%</span>
                          </div>
                          <Progress value={Math.floor(Math.random() * 80 + 20)} />
                        </div>
                        <Button variant="ghost" size="sm" className="mt-4 w-full" asChild>
                          <Link to={`/course/${course.id}`}>
                            Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : null}
              
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
              {isLoading ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">Loading your interviews...</div>
              ) : interviews.length > 0 ? (
                <>
                  {interviews.map((interview) => (
                    <Card key={interview.id}>
                      <CardHeader>
                        <CardTitle>{interview.job_role}</CardTitle>
                        <CardDescription>
                          Tech Stack: {interview.tech_stack}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-muted-foreground">Overall Score</span>
                          <span className={`text-lg font-bold ${
                            Math.random() >= 0.8 ? "text-green-500" : 
                            Math.random() >= 0.5 ? "text-amber-500" : "text-red-500"
                          }`}>
                            {Math.floor(Math.random() * 40 + 60)}%
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
                </>
              ) : null}
              
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
