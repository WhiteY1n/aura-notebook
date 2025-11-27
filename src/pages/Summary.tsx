import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { SummarySkeleton } from "@/components/LoadingSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  ArrowLeft, 
  FileDown, 
  BookOpen, 
  Lightbulb, 
  Quote, 
  Layers,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const mockSummary = {
  documentTitle: "Introduction to Machine Learning",
  overall: `Machine Learning (ML) is a transformative subset of artificial intelligence that enables computer systems to learn and improve automatically through experience. Rather than following explicit programming instructions, ML algorithms identify patterns in data to make informed decisions.

The document covers three fundamental learning paradigms: supervised learning (using labeled data), unsupervised learning (discovering patterns in unlabeled data), and reinforcement learning (learning through environmental feedback). These approaches have revolutionized numerous fields from healthcare to autonomous systems.`,
  
  keyInsights: [
    {
      title: "Self-Improving Systems",
      content: "ML systems continuously improve without explicit reprogramming, making them adaptable to new data and situations.",
    },
    {
      title: "Pattern Recognition Power",
      content: "The core strength of ML lies in its ability to identify complex patterns that would be impossible for humans to detect manually.",
    },
    {
      title: "Diverse Applications",
      content: "From image recognition to fraud detection, ML's applications span virtually every industry and continue to expand.",
    },
  ],

  importantPassages: [
    {
      text: "Machine learning focuses on the development of computer programs that can access data and use it to learn for themselves.",
      page: 1,
    },
    {
      text: "The process of learning begins with observations or data... in order to look for patterns in data and make better decisions in the future.",
      page: 1,
    },
    {
      text: "The algorithm learns by interacting with an environment and receiving feedback in the form of rewards or penalties.",
      page: 2,
    },
  ],

  pageHighlights: [
    {
      page: 1,
      highlights: [
        "Definition of Machine Learning",
        "Introduction to the learning process",
        "Supervised Learning explained",
      ],
    },
    {
      page: 2,
      highlights: [
        "Unsupervised Learning techniques",
        "Reinforcement Learning concepts",
        "Real-world applications overview",
      ],
    },
  ],
};

const navSections = [
  { id: "overall", label: "Overall Summary", icon: BookOpen },
  { id: "insights", label: "Key Insights", icon: Lightbulb },
  { id: "passages", label: "Important Passages", icon: Quote },
  { id: "pages", label: "Page Highlights", icon: Layers },
];

export default function Summary() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overall");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleExport = () => {
    // Mock export functionality
    console.log("Exporting summary...");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="Document Summary" showSearch={false} />

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 max-w-4xl mx-auto space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link to={`/viewer/${id}`}>
                    <Button variant="ghost" size="icon">
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {mockSummary.documentTitle}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      AI-generated summary
                    </p>
                  </div>
                </div>

                <Button variant="outline" onClick={handleExport}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {isLoading ? (
                <SummarySkeleton />
              ) : (
                <>
                  {/* Overall Summary */}
                  <section id="overall" className="animate-fade-in">
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          Overall Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                          {mockSummary.overall}
                        </p>
                      </CardContent>
                    </Card>
                  </section>

                  {/* Key Insights */}
                  <section id="insights" className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-warning" />
                          Key Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockSummary.keyInsights.map((insight, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-lg bg-secondary/50 border border-border/50"
                          >
                            <h3 className="font-semibold text-foreground mb-2">
                              {insight.title}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {insight.content}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </section>

                  {/* Important Passages */}
                  <section id="passages" className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Quote className="h-5 w-5 text-accent" />
                          Important Passages
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockSummary.importantPassages.map((passage, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-primary pl-4 py-2"
                          >
                            <p className="text-foreground/90 italic">
                              "{passage.text}"
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Page {passage.page}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </section>

                  {/* Page Highlights */}
                  <section id="pages" className="animate-fade-in" style={{ animationDelay: "300ms" }}>
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="h-5 w-5 text-info" />
                          Highlights per Page
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          {mockSummary.pageHighlights.map((page) => (
                            <AccordionItem key={page.page} value={`page-${page.page}`}>
                              <AccordionTrigger className="hover:no-underline">
                                <span className="font-medium">Page {page.page}</span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <ul className="space-y-2">
                                  {page.highlights.map((highlight, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2 text-sm text-muted-foreground"
                                    >
                                      <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                      {highlight}
                                    </li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </section>
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Quick Navigation Sidebar */}
        <aside className="hidden lg:block w-64 border-l border-border bg-card/50 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Quick Navigation
          </h3>
          <nav className="space-y-1">
            {navSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                  activeSection === section.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
