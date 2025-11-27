import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { Flashcard, FlashcardData } from "@/components/Flashcard";
import { FlashcardGridSkeleton } from "@/components/LoadingSkeletons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ArrowLeft, Brain } from "lucide-react";

const mockFlashcards: FlashcardData[] = [
  {
    id: "1",
    question: "What is Machine Learning?",
    answer: "A subset of artificial intelligence that enables systems to automatically learn and improve from experience without being explicitly programmed.",
    category: "Fundamentals",
  },
  {
    id: "2",
    question: "What is Supervised Learning?",
    answer: "A type of machine learning where the algorithm is trained on labeled data, learning to predict outputs from input data with known answers.",
    category: "Types",
  },
  {
    id: "3",
    question: "What is Unsupervised Learning?",
    answer: "A machine learning approach where the algorithm finds patterns and relationships in unlabeled data, using techniques like clustering.",
    category: "Types",
  },
  {
    id: "4",
    question: "What is Reinforcement Learning?",
    answer: "Learning through interaction with an environment, receiving feedback as rewards or penalties to maximize cumulative reward.",
    category: "Types",
  },
  {
    id: "5",
    question: "Name 3 applications of Machine Learning",
    answer: "1. Image and speech recognition\n2. Natural language processing\n3. Recommendation systems\n(Also: Fraud detection, Medical diagnosis, Autonomous vehicles)",
    category: "Applications",
  },
  {
    id: "6",
    question: "How does the ML learning process begin?",
    answer: "It begins with observations or data (examples, direct experience, or instruction), looking for patterns to make better decisions in the future.",
    category: "Fundamentals",
  },
];

const categories = ["All", "Fundamentals", "Types", "Applications"];

export default function Flashcards() {
  const { id } = useParams();
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setFlashcards(mockFlashcards);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [id]);

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setIsLoading(true);
    
    setTimeout(() => {
      // Shuffle flashcards for demo
      setFlashcards([...mockFlashcards].sort(() => Math.random() - 0.5));
      setIsLoading(false);
      setIsRegenerating(false);
    }, 2000);
  };

  const filteredFlashcards = selectedCategory === "All"
    ? flashcards
    : flashcards.filter((card) => card.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="Flashcards" showSearch={false} />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/viewer/${id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                Introduction to Machine Learning
              </h1>
              <p className="text-muted-foreground mt-1">
                {flashcards.length} flashcards generated
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
            Regenerate
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
              {category !== "All" && (
                <span className="ml-1 opacity-70">
                  ({flashcards.filter((c) => c.category === category).length})
                </span>
              )}
            </Badge>
          ))}
        </div>

        {/* Flashcards Grid */}
        {isLoading ? (
          <FlashcardGridSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlashcards.map((card, index) => (
              <div
                key={card.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Flashcard card={card} />
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredFlashcards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No flashcards in this category
            </p>
          </div>
        )}

        {/* Study Tip */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 max-w-xl">
          <p className="text-sm text-foreground font-medium mb-1">💡 Study Tip</p>
          <p className="text-sm text-muted-foreground">
            Click on any card to flip it and reveal the answer. Try to recall the answer before flipping!
          </p>
        </div>
      </div>
    </div>
  );
}
