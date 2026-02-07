
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameState, ChatMessage, GameAction, AiResponse } from './types';
import Candle from './components/Candle';
import AmbientSound from './components/AmbientSound';
import { getAiInteraction, getFinalOutcome } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    intensity: 65,
    color: '#FFCC33',
    isGameOver: false,
    history: [],
    startTime: Date.now(),
    lastAiInteraction: Date.now(),
    gamePhase: 'intro',
    turnCount: 0,
    isVictory: false,
  });

  const [inputText, setInputText] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const textTimeoutRef = useRef<number | null>(null);

  const typeText = (text: string) => {
    setIsTyping(true);
    setCurrentText('');
    let i = 0;
    if (textTimeoutRef.current) clearInterval(textTimeoutRef.current);
    
    const interval = setInterval(() => {
      setCurrentText(prev => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 45);
    textTimeoutRef.current = interval as any;
  };

  const handleStart = () => {
    setState(prev => ({ ...prev, gamePhase: 'playing', startTime: Date.now() }));
    typeText("طوفان زوزه می‌کشد... اما اینجا، میان دستان تو، نوری هنوز بیدار است. چه می‌کنی؟");
  };

  const endGame = async (victory: boolean) => {
    setIsFinishing(true);
    const outcome = await getFinalOutcome(state.history);
    setState(prev => ({ 
      ...prev, 
      gamePhase: 'ending', 
      isVictory: victory, 
      intensity: victory ? 100 : 5,
      analysis: outcome.analysis,
      letter: outcome.letter
    }));
    setIsFinishing(false);
  };

  const checkProgression = (response: AiResponse, turns: number) => {
    if (turns >= 8 && response.sentiment === 'positive') {
      endGame(true);
      return true;
    }
    if (turns >= 20) {
      endGame(response.flame_size > 35);
      return true;
    }
    if (response.flame_size <= 5) {
      endGame(false);
      return true;
    }
    return false;
  };

  const handleChoice = async (action: GameAction) => {
    let intensityDelta = 0;
    let feedback = "";

    switch (action) {
      case GameAction.SHELTER:
        intensityDelta = 12;
        feedback = "پناه بردی. دیوارهای سرد تو را در بر گرفتند، اما شعله آرام گرفت...";
        break;
      case GameAction.ADD_WOOD:
        intensityDelta = 20;
        feedback = "هیمه‌ای افکندی. نور با اشتیاق زبانه کشید و سایه‌ها را عقب راند.";
        break;
      case GameAction.SURRENDER:
        intensityDelta = -30;
        feedback = "دست فرو افتاد. باد تازیانه زد و کورسو، تا مرز خاموشی لرزید...";
        break;
    }

    setState(prev => ({ 
      ...prev, 
      intensity: Math.min(100, Math.max(0, prev.intensity + intensityDelta)) 
    }));
    typeText(feedback);

    setTimeout(() => {
        if (state.gamePhase === 'playing') {
            triggerAiConversation("من صدای لرزشِ قلبت را می‌شنوم. بگو، در این لحظه، چه خاطره‌ای چون گرمای چای در زمستان، تو را آرام می‌کند؟");
        }
    }, 3000);
  };

  const triggerAiConversation = async (prompt: string) => {
    if (isAiLoading || isFinishing) return;
    setIsAiLoading(true);
    const result = await getAiInteraction(prompt, state.history);
    setIsAiLoading(false);

    const nextTurns = state.turnCount + 1;
    setState(prev => ({
      ...prev,
      intensity: result.flame_size,
      color: result.mood_color,
      history: [...prev.history, { role: 'model', text: result.text }],
      lastAiInteraction: Date.now(),
      turnCount: nextTurns
    }));
    typeText(result.text);

    checkProgression(result, nextTurns);
  };

  const handleUserInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiLoading || isFinishing || isTyping) return;

    const userMsg = inputText.trim();
    setInputText('');
    
    const nextTurns = state.turnCount + 1;
    setState(prev => ({
      ...prev,
      history: [...prev.history, { role: 'user', text: userMsg }],
      turnCount: nextTurns
    }));

    setIsAiLoading(true);
    const response = await getAiInteraction(userMsg, state.history);
    setIsAiLoading(false);

    setState(prev => ({
      ...prev,
      intensity: response.flame_size,
      color: response.mood_color,
      history: [...prev.history, { role: 'model', text: response.text }],
      lastAiInteraction: Date.now()
    }));
    typeText(response.text);

    checkProgression(response, nextTurns);
  };

  const downloadLetter = () => {
    if (!state.letter) return;
    const blob = new Blob([state.letter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `کورسو_نامه_${new Date().toLocaleDateString('fa-IR')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (state.gamePhase === 'playing') {
      const timer = setInterval(() => {
        setState(prev => {
          const newIntensity = prev.intensity - 0.25;
          if (newIntensity <= 0) {
            endGame(false);
            return { ...prev, intensity: 0 };
          }
          return { ...prev, intensity: newIntensity };
        });

        if (Date.now() - state.lastAiInteraction > 120000 && !isAiLoading && !isTyping) {
          triggerAiConversation("سکوتِ سنگینی‌ست... آیا هنوز در کنار من هستی؟");
        }
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [state.gamePhase, state.lastAiInteraction, isAiLoading, isTyping]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative select-none overflow-hidden text-white transition-all duration-1000">
      <AmbientSound />
      
      {/* Intro Phase */}
      {state.gamePhase === 'intro' && (
        <div className="text-center z-10 max-w-2xl space-y-20 animate-in fade-in zoom-in duration-[2000ms]">
          <div className="space-y-4">
            <h1 className="text-8xl md:text-9xl font-thin tracking-[0.6em] text-white/90 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] select-none">کورسو</h1>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto" />
            <p className="text-white/20 text-[10px] tracking-[0.8em] uppercase font-light">Glimmer in the Dark</p>
          </div>
          
          <div className="space-y-12">
            <p className="text-white/50 leading-[2.6] font-extralight text-2xl italic px-12 md:px-24 float-subtle">
              جهان در سکوت و طوفان غرق شده است.<br/>
              تنها نوری که باقی مانده، در دستانِ توست.<br/>
              بگذار این شعله با گرمای حرف‌هایت، جان بگیرد.
            </p>
            
            <button 
              onClick={handleStart}
              className="group relative px-20 py-8 overflow-hidden rounded-full border border-white/10 text-white/50 hover:text-white transition-all duration-1000 bg-white/[0.01]"
            >
              <span className="relative z-10 tracking-[0.5em] text-xs uppercase font-light">برافروختنِ روشنایی</span>
              <div className="absolute inset-0 bg-white/[0.03] translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl bg-white/5" />
            </button>
          </div>
        </div>
      )}

      {/* Playing Phase */}
      {state.gamePhase === 'playing' && (
        <div className="flex flex-col items-center justify-center w-full max-w-4xl h-full space-y-8 z-10">
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <Candle intensity={state.intensity} color={state.color} />
            
            <div className="h-48 text-center px-6 flex items-center justify-center max-w-3xl mx-auto -mt-10">
               <p className="text-2xl md:text-4xl font-extralight text-white/90 leading-[2.1] drop-shadow-lg text-glow">
                 {isFinishing ? "نور در حالِ ثبتِ خاطره‌ی توست..." : currentText}
               </p>
            </div>
          </div>

          {!isFinishing && (
            <div className="w-full max-w-2xl pb-10">
              {state.history.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-[1500ms] delay-700">
                  {Object.values(GameAction).map((action) => (
                    <button
                      key={action}
                      onClick={() => handleChoice(action)}
                      className="group px-8 py-6 border border-white/[0.05] rounded-[2rem] text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.03] transition-all duration-700 text-sm font-extralight backdrop-blur-xl relative"
                    >
                      <span className="relative z-10">{action}</span>
                      <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
                    </button>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleUserInput} className="relative group animate-in fade-in duration-[1000ms]">
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="با شعله نجوا کن..."
                    disabled={isAiLoading || isTyping}
                    className="w-full bg-transparent border-b border-white/[0.08] py-8 px-4 text-center text-white/90 focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10 text-3xl font-extralight tracking-wide"
                    dir="rtl"
                  />
                  {isAiLoading && (
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
                       <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" />
                       <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                       <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ending Phase */}
      {state.gamePhase === 'ending' && (
        <div className="w-full max-w-6xl max-h-[92vh] overflow-y-auto no-scrollbar z-10 p-12 space-y-24 animate-in slide-in-from-bottom-24 duration-[2500ms]">
          <div className="text-center space-y-10">
            <h2 className="text-6xl md:text-8xl font-thin tracking-[0.7em] text-white/95 uppercase drop-shadow-xl">
              {state.isVictory ? "روشنایی پایدار" : "پایانِ یک سفر"}
            </h2>
            <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
            <p className="text-white/30 text-xs tracking-[1em] uppercase">The Soul's Reflection</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch">
            {/* Analysis Section */}
            <div className="relative group p-14 border border-white/[0.04] bg-white/[0.02] rounded-[5rem] backdrop-blur-[100px] flex flex-col justify-between shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] transition-all duration-1000 hover:border-white/10">
               <div className="space-y-12">
                  <div className="flex items-center gap-4 opacity-30">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <h3 className="text-white text-[10px] tracking-[0.6em] uppercase font-light">تحلیلِ بارقه‌ها</h3>
                  </div>
                  <p className="text-3xl font-extralight leading-[2.1] text-white/70 italic text-glow">
                    {state.analysis}
                  </p>
               </div>
               
               <div className="mt-20 pt-10 border-t border-white/[0.05] grid grid-cols-2 gap-8 text-[11px] text-white/20 tracking-[0.5em] uppercase font-light">
                <div className="space-y-2">
                  <span className="block opacity-50">مدت پایداری</span>
                  <span className="text-white/40">{Math.floor((Date.now() - state.startTime) / 60000)} دقیقه</span>
                </div>
                <div className="space-y-2">
                  <span className="block opacity-50">عمقِ کلام</span>
                  <span className="text-white/40">{state.turnCount} مرحله</span>
                </div>
               </div>
            </div>

            {/* Letter Section */}
            <div className="relative p-14 border border-white/[0.04] bg-white/[0.02] rounded-[5rem] backdrop-blur-[100px] flex flex-col justify-between shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] transition-all duration-1000 hover:border-white/10">
              <div className="space-y-12">
                <div className="flex items-center gap-4 opacity-30">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <h3 className="text-white text-[10px] tracking-[0.6em] uppercase font-light">دست‌نوشته‌ی شعله</h3>
                </div>
                <p className="text-2xl font-extralight leading-[2.3] text-white/80 whitespace-pre-wrap font-serif italic text-glow">
                  {state.letter}
                </p>
              </div>
              
              <div className="mt-20 flex flex-col sm:flex-row gap-8">
                <button 
                  onClick={downloadLetter}
                  className="flex-1 px-12 py-7 bg-white/[0.04] border border-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/[0.08] transition-all duration-700 text-[11px] tracking-[0.4em] uppercase font-light backdrop-blur-md"
                >
                  حفاظت از کلمات (TXT)
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-12 py-7 border border-white/5 rounded-full text-white/20 hover:text-white transition-all duration-700 text-[11px] tracking-[0.4em] uppercase font-light"
                >
                  آغازی دوباره
                </button>
              </div>
            </div>
          </div>

          <footer className="text-center text-[10px] text-white/10 tracking-[1em] pt-20 font-extralight uppercase pb-10">
            کورسو &bull; نگهبانی از روشنایی در میانِ تاریکی
          </footer>
        </div>
      )}

      {/* Background Visuals for Phase 2 & 3 */}
{state.gamePhase !== 'intro' && (
  <div className="absolute inset-0 pointer-events-none transition-opacity duration-[4000ms] -z-10"
    style={{
      background:
        state.gamePhase === 'ending'
          ? 'radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 70%, rgba(255,255,255,0.7) 100%)'
          : `radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.95) 100%)`,
      opacity:
        state.gamePhase === 'ending'
          ? 1
          : 0.4 + (1 - state.intensity / 100) * 0.6
    }}
  />
)}

    </div>
  );
};
<p className="text-white/80 text-lg tracking-[0.3em] uppercase font-light">
  نور بر تاریکی پیروز است
</p>
export default App;
