import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import RippleButton from './RippleButton';

interface MarqueeItem {
  id: string;
  text: string;
  type: 'announcement' | 'news' | 'highlight';
}

const InfiniteMarquee: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const marqueeRef = useRef<HTMLDivElement>(null);

  const items: MarqueeItem[] = [
    { id: '1', text: '📸 Now Booking 2025 Wedding Season!', type: 'announcement' },
    { id: '2', text: '⭐ Featured in Wedding Photography Magazine', type: 'highlight' },
    { id: '3', text: '🏆 Winner - Best Wedding Photographer 2024', type: 'news' },
    { id: '4', text: '💍 500+ Couples Captured Their Perfect Day', type: 'highlight' },
    { id: '5', text: '🎨 New Portrait Studio Now Open', type: 'announcement' },
    { id: '6', text: '🌟 Join Our Photography Workshop Series', type: 'news' }
  ];

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const updateAnimationSpeed = () => {
      marquee.style.setProperty('--marquee-speed', `${30 / speed}s`);
    };

    updateAnimationSpeed();
  }, [speed]);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(Math.max(0.5, Math.min(3, newSpeed)));
  };

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white py-4 relative overflow-hidden">
      <div 
        ref={marqueeRef}
        className={`flex items-center space-x-12 ${isPaused ? '' : 'animate-marquee'}`}
        style={{ 
          animationPlayState: isPaused ? 'paused' : 'running',
          animationDuration: `${30 / speed}s`
        }}
      >
        {[...items, ...items].map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center space-x-2 whitespace-nowrap text-lg font-medium"
          >
            <span className={`inline-block w-2 h-2 rounded-full ${
              item.type === 'announcement' ? 'bg-yellow-400' :
              item.type === 'highlight' ? 'bg-green-400' : 'bg-blue-400'
            }`} />
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
        <RippleButton
          onClick={() => setIsPaused(!isPaused)}
          className="p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors duration-200"
          aria-label={isPaused ? 'Play marquee' : 'Pause marquee'}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </RippleButton>

        <div className="flex items-center space-x-1">
          <RippleButton
            onClick={() => handleSpeedChange(speed - 0.5)}
            className="px-2 py-1 text-sm bg-white/20 rounded backdrop-blur-sm hover:bg-white/30 transition-colors duration-200"
            disabled={speed <= 0.5}
          >
            -
          </RippleButton>
          <span className="text-sm font-mono bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
            {speed}x
          </span>
          <RippleButton
            onClick={() => handleSpeedChange(speed + 0.5)}
            className="px-2 py-1 text-sm bg-white/20 rounded backdrop-blur-sm hover:bg-white/30 transition-colors duration-200"
            disabled={speed >= 3}
          >
            +
          </RippleButton>
        </div>
      </div>
    </div>
  );
};

export default InfiniteMarquee;