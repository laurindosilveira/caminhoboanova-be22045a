import { useState } from "react";
import { X, ExternalLink } from "lucide-react";

interface BibleModalProps {
  reference: string;
  open: boolean;
  onClose: () => void;
}

export default function BibleModal({ reference, open, onClose }: BibleModalProps) {
  const [iframeError, setIframeError] = useState(false);
  const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=NVI-PT&interface=print`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">📖</span>
            <h3 className="font-montserrat font-bold text-foreground text-sm truncate max-w-[250px]">{reference}</h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=NVI-PT`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              title="Abrir no site"
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-[300px]">
          {!iframeError ? (
            <iframe
              src={url}
              className="w-full h-full min-h-[300px] border-0"
              style={{ height: "60vh" }}
              title={`Bíblia - ${reference}`}
              onError={() => setIframeError(true)}
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <span className="text-4xl mb-4">📖</span>
              <p className="font-montserrat font-bold text-foreground mb-2">Não foi possível carregar</p>
              <p className="text-muted-foreground font-inter text-sm mb-4">
                O texto não pôde ser exibido diretamente. Clique abaixo para abrir no navegador.
              </p>
              <a
                href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=NVI-PT`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl font-montserrat font-bold text-sm text-primary-foreground transition-all"
                style={{ background: "var(--gradient-orange)" }}
              >
                Abrir no navegador
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
