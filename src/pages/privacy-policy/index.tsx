import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Download } from 'lucide-react';

// Importar el PDF como asset estático usando Vite
const privacyPolicyPdf = new URL(
  '../../assets/privacy-policy.pdf',
  import.meta.url
).href;

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to App</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">Privacy Policy</h1>
            </div>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Privacy Policy</h2>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2"
            >
              <a
                href={privacyPolicyPdf}
                download="privacy-policy.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Last Updated: November 25th, 2025
          </p>
        </div>

        {/* PDF Viewer */}
        <div className="w-full border rounded-lg overflow-hidden bg-background shadow-lg">
          <iframe
            src={privacyPolicyPdf}
            title="Privacy Policy"
            className="w-full h-[calc(100vh-250px)] min-h-[600px]"
            style={{ border: 'none' }}
          />
        </div>
      </main>
    </div>
  );
}

