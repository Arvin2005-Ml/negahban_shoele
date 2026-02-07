
import React, { useMemo } from 'react';

interface CandleProps {
  intensity: number;
  color: string;
}

const Candle: React.FC<CandleProps> = ({ intensity, color }) => {
  const intensityFactor = intensity / 100;
  const sizeWidth = Math.max(14, 32 * intensityFactor);
  const sizeHeight = Math.max(30, 80 * intensityFactor);
  const glowRadius = Math.max(40, 400 * intensityFactor);

  // Poetic embers representing fragments of hope
  const embers = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 5,
      left: Math.random() * 80 - 40,
      duration: 4 + Math.random() * 6,
      size: 1 + Math.random() * 2
    }));
  }, []);

  return (
    <div className="relative flex items-center justify-center h-[500px] w-full select-none transition-all duration-1000">
      
      {/* Deep Atmospheric Glow - The "Soul" of the candle */}
      <div 
        className="absolute rounded-full animate-pulse-glow transition-colors duration-[4000ms]"
        style={{
          width: `${glowRadius * 3}px`,
          height: `${glowRadius * 3.5}px`,
          backgroundColor: color,
          filter: 'blur(120px)',
          opacity: 0.25 * intensityFactor,
        }}
      />

      {/* Radiant Aura */}
      <div 
        className="absolute rounded-full opacity-40 transition-all duration-[2000ms]"
        style={{
          width: `${glowRadius * 1.5}px`,
          height: `${glowRadius * 1.8}px`,
          backgroundColor: color,
          filter: 'blur(60px)',
        }}
      />
      
      {/* Spiritual Embers */}
      {intensity > 10 && embers.map(ember => (
        <div 
          key={ember.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            backgroundColor: color,
            left: `calc(50% + ${ember.left}px)`,
            bottom: '50%',
            opacity: 0,
            animation: `spiritual-float ${ember.duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
            animationDelay: `${ember.delay}s`,
            boxShadow: `0 0 8px ${color}`
          }}
        />
      ))}

      {/* The Flame Structure */}
      <div className="relative flex flex-col items-center">
        
        {/* The Flame Itself */}
        <div 
          className="relative z-20 animate-flicker transition-all duration-700"
          style={{
            width: `${sizeWidth}px`,
            height: `${sizeHeight}px`,
            background: `linear-gradient(to top, transparent 0%, ${color} 40%, #fff 100%)`,
            borderRadius: '50% 50% 20% 20% / 90% 90% 10% 10%',
            boxShadow: `
              0 0 15px ${color},
              0 -15px 45px ${color}88
            `,
            transformOrigin: 'bottom center',
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))'
          }}
        >
          {/* Inner Radiant Core */}
          <div 
            className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[40%] h-[40%] bg-white/90 blur-[1px]"
            style={{ borderRadius: '50% 50% 20% 20% / 90% 90% 10% 10%' }}
          />
        </div>

        {/* The Wick */}
        <div className="w-[4px] h-16 bg-gradient-to-b from-[#111] via-[#222] to-[#000] rounded-full -mt-4 relative z-10" />
        
        {/* Candle Body Top (Faded into Darkness) */}
        <div 
          className="w-16 h-32 bg-gradient-to-b from-[#0a0a0a] via-[#050505] to-transparent opacity-95 rounded-t-lg border-t border-white/5"
          style={{
            boxShadow: `inset 0 10px 20px -5px ${color}11`
          }}
        />
      </div>

      <style>{`
        @keyframes spiritual-float {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-400px) translateX(${Math.random() * 60 - 30}px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Candle;
