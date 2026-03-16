import { useState, useRef, useCallback, useEffect } from "react";
import { Keyboard, RotateCcw, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

const SAMPLE_TEXTS = [
  "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito para que todo o que nele crer não pereça mas tenha a vida eterna.",
  "O Senhor é o meu pastor e nada me faltará. Deitar-me faz em verdes pastos e guia-me mansamente a águas tranquilas.",
  "Tudo posso naquele que me fortalece. Sede fortes e corajosos. Não temais nem vos espanteis.",
  "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento. Reconheça o Senhor em todos os seus caminhos.",
];

export default function TypingMetricsPanel() {
  const [isActive, setIsActive] = useState(false);
  const [sampleText, setSampleText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errorCount, setErrorCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pickNewText = useCallback(() => {
    const text = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    setSampleText(text);
  }, []);

  function startTest() {
    pickNewText();
    setTypedText("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setErrorCount(0);
    setFinished(false);
    setElapsedSeconds(0);
    setIsActive(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function resetTest() {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setFinished(false);
    setTypedText("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setErrorCount(0);
    setElapsedSeconds(0);
  }

  useEffect(() => {
    if (startTime && !finished) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, finished]);

  function handleInput(value: string) {
    if (finished) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    setTypedText(value);

    // Calculate metrics
    let errors = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== sampleText[i]) errors++;
    }
    setErrorCount(errors);

    const totalChars = value.length;
    const correctChars = totalChars - errors;
    const acc = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    setAccuracy(acc);

    const elapsed = (Date.now() - (startTime || Date.now())) / 1000 / 60;
    const words = correctChars / 5;
    const currentWpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
    setWpm(currentWpm);

    // Check if done
    if (value.length >= sampleText.length) {
      setFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  function getCharClass(index: number) {
    if (index >= typedText.length) return "text-muted-foreground";
    return typedText[index] === sampleText[index]
      ? "text-brand-green"
      : "text-destructive bg-destructive/10 rounded";
  }

  const wpmColor = wpm >= 60 ? "text-brand-green" : wpm >= 30 ? "text-warning" : "text-primary";
  const accColor = accuracy >= 95 ? "text-brand-green" : accuracy >= 80 ? "text-warning" : "text-destructive";

  return (
    <div className="mx-5 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Keyboard className="w-4 h-4 text-primary" />
        <span className="font-montserrat font-bold text-foreground text-sm">Treino de Digitação</span>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
        {!isActive ? (
          <div className="text-center space-y-3">
            <p className="text-3xl">⌨️</p>
            <p className="text-sm font-inter text-muted-foreground">
              Teste sua velocidade e precisão de digitação com versículos bíblicos!
            </p>
            <Button onClick={startTest} className="rounded-xl gap-2">
              <Play className="w-4 h-4" /> Iniciar Teste
            </Button>
          </div>
        ) : (
          <>
            {/* Metrics bar */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-muted rounded-xl p-2 text-center">
                <p className={`text-lg font-montserrat font-black ${wpmColor}`}>{wpm}</p>
                <p className="text-[9px] text-muted-foreground font-inter uppercase">PPM</p>
              </div>
              <div className="bg-muted rounded-xl p-2 text-center">
                <p className={`text-lg font-montserrat font-black ${accColor}`}>{accuracy}%</p>
                <p className="text-[9px] text-muted-foreground font-inter uppercase">Precisão</p>
              </div>
              <div className="bg-muted rounded-xl p-2 text-center">
                <p className="text-lg font-montserrat font-black text-destructive">{errorCount}</p>
                <p className="text-[9px] text-muted-foreground font-inter uppercase">Erros</p>
              </div>
              <div className="bg-muted rounded-xl p-2 text-center">
                <p className="text-lg font-montserrat font-black text-foreground">{elapsedSeconds}s</p>
                <p className="text-[9px] text-muted-foreground font-inter uppercase">Tempo</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min((typedText.length / sampleText.length) * 100, 100)}%` }}
              />
            </div>

            {/* Sample text */}
            <div className="bg-muted/50 rounded-xl p-3 font-inter text-sm leading-relaxed select-none">
              {sampleText.split("").map((char, i) => (
                <span key={i} className={`${getCharClass(i)} ${i === typedText.length ? "border-b-2 border-primary" : ""}`}>
                  {char}
                </span>
              ))}
            </div>

            {/* Input */}
            <textarea
              ref={inputRef}
              value={typedText}
              onChange={(e) => handleInput(e.target.value)}
              disabled={finished}
              placeholder="Comece a digitar aqui..."
              className="w-full bg-background border border-border rounded-xl p-3 text-sm font-inter resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />

            {/* Result / Actions */}
            {finished ? (
              <div className="text-center space-y-2">
                <p className="text-2xl">
                  {accuracy >= 95 && wpm >= 40 ? "🏆" : accuracy >= 80 ? "👏" : "💪"}
                </p>
                <p className="font-montserrat font-bold text-foreground text-sm">
                  {accuracy >= 95 && wpm >= 40
                    ? "Excelente! Ótima velocidade e precisão!"
                    : accuracy >= 80
                      ? "Bom trabalho! Continue praticando."
                      : "Continue treinando para melhorar!"}
                </p>
                <Button onClick={startTest} variant="outline" className="rounded-xl gap-2">
                  <RotateCcw className="w-4 h-4" /> Tentar Novamente
                </Button>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button onClick={resetTest} variant="ghost" size="sm" className="gap-1 text-xs">
                  <Pause className="w-3 h-3" /> Cancelar
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
