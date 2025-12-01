import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Flashcard, FlashcardData } from "@/components/Flashcard";
import { FlashcardGridSkeleton } from "@/components/LoadingSkeletons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ArrowLeft, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { FadeIn, FadeInStagger, FadeInStaggerItem } from "@/components/animations";

const mockFlashcards: FlashcardData[] = [
  { id: "1", question: "What is Machine Learning?", answer: "A subset of artificial intelligence that enables systems to automatically learn and improve from experience without being explicitly programmed.", category: "Fundamentals" },
  { id: "2", question: "What is Supervised Learning?", answer: "A type of machine learning where the algorithm is trained on labeled data, learning to predict outputs from input data with known answers.", category: "Types" },
  { id: "3", question: "What is Unsupervised Learning?", answer: "A machine learning approach where the algorithm finds patterns and relationships in unlabeled data, using techniques like clustering.", category: "Types" },
  { id: "4", question: "What is Reinforcement Learning?", answer: "Learning through interaction with an environment, receiving feedback as rewards or penalties to maximize cumulative reward.", category: "Types" },
  { id: "5", question: "Name 3 applications of Machine Learning", answer: "1. Image and speech recognition\n2. Natural language processing\n3. Recommendation systems", category: "Applications" },
  { id: "6", question: "How does the ML learning process begin?", answer: "It begins with observations or data (examples, direct experience, or instruction), looking for patterns to make better decisions in the future.", category: "Fundamentals" },
];

const categories = ["All", "Fundamentals", "Types", "Applications"];

export default function Flashcards() {
  const { id } = useParams();
  const { setTheme, isDark } = useTheme();
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("grid");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFlashcards(mockFlashcards);
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [id]);

  const handleRegenerate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setFlashcards([...mockFlashcards].sort(() => Math.random() - 0.5));
      setIsLoading(false);
    }, 1000);
  };

  const filteredFlashcards = selectedCategory === "All" 
    ? flashcards 
    : flashcards.filter((card) => card.category === selectedCategory);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredFlashcards.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < filteredFlashcards.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to={`/project/${id}`}>
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="font-semibold text-foreground">Flashcards</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <Button 
                variant={viewMode === "grid" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button 
                variant={viewMode === "carousel" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("carousel")}
              >
                Focus
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleRegenerate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentIndex(0);
                }}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </FadeIn>

        {isLoading ? (
          <FlashcardGridSkeleton count={6} />
        ) : viewMode === "grid" ? (
          <FadeInStagger staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlashcards.map((card) => (
              <FadeInStaggerItem key={card.id}>
                <Flashcard card={card} />
              </FadeInStaggerItem>
            ))}
          </FadeInStagger>
        ) : (
          <FadeIn className="flex flex-col items-center justify-center py-8">
            <div className="w-full max-w-md">
              <Flashcard card={filteredFlashcards[currentIndex]} className="h-72" />
            </div>
            
            <div className="flex items-center gap-6 mt-8">
              <Button variant="outline" size="icon" onClick={handlePrev}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {filteredFlashcards.length}
              </span>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </FadeIn>
        )}
      </main>
    </div>
  );
}
