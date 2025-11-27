import { useState, useMemo } from "react";
import { TopNav } from "@/components/TopNav";
import { DocumentCard, Document } from "@/components/DocumentCard";
import { UploadDropzone } from "@/components/UploadDropzone";
import { DocumentGridSkeleton } from "@/components/LoadingSkeletons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Upload } from "lucide-react";

// Mock data
const mockDocuments: Document[] = [
  { id: "1", title: "Introduction to Machine Learning.pdf", type: "pdf", lastUpdated: "2 hours ago" },
  { id: "2", title: "React Best Practices.docx", type: "doc", lastUpdated: "Yesterday" },
  { id: "3", title: "Quantum Computing Lecture.mp3", type: "audio", lastUpdated: "3 days ago" },
  { id: "4", title: "Data Structures Notes.txt", type: "text", lastUpdated: "1 week ago" },
  { id: "5", title: "Neural Networks Explained", type: "youtube", lastUpdated: "2 weeks ago" },
  { id: "6", title: "Research Paper on AI Ethics", type: "website", lastUpdated: "1 month ago" },
];

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [isLoading, setIsLoading] = useState(false);

  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === "name") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    // "recent" is default order

    return filtered;
  }, [documents, searchQuery, sortBy]);

  const handleUpload = (files: File[]) => {
    console.log("Uploading files:", files);
    // Mock upload - in real app would send to backend
  };

  const handleUrlSubmit = (url: string) => {
    console.log("Adding URL:", url);
    // Mock URL add - in real app would send to backend
  };

  const handleRename = (id: string, newTitle: string) => {
    setDocuments((docs) =>
      docs.map((doc) => (doc.id === id ? { ...doc, title: newTitle } : doc))
    );
  };

  const handleDelete = (id: string) => {
    setDocuments((docs) => docs.filter((doc) => doc.id !== id));
  };

  const isEmpty = documents.length === 0;

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav title="Your Documents" onSearch={setSearchQuery} />

      <div className="flex-1 p-6 space-y-6">
        {/* Upload Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <UploadDropzone compact onUpload={handleUpload} onUrlSubmit={handleUrlSubmit} />
          
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <DocumentGridSkeleton count={6} />
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No documents yet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Upload your first document to get started. We support PDFs, Word docs, text files, images, audio, and more.
            </p>
            <UploadDropzone onUpload={handleUpload} onUrlSubmit={handleUrlSubmit} className="max-w-lg w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((doc, index) => (
              <div
                key={doc.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <DocumentCard
                  document={doc}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}

        {!isEmpty && filteredDocuments.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No documents found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
