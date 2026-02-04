import React, { useEffect, useState } from 'react';
import type { FC } from 'react';

interface TrustScoreGaugeProps {
  score: number;
}

const TrustScoreGauge: FC<TrustScoreGaugeProps> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setAnimatedScore(score));
    return () => cancelAnimationFrame(animation);
  }, [score]);

  const getStrokeColor = (s: number) => {
    if (s > 80) return '#48bb78'; // green-500
    if (s > 60) return '#ecc94b'; // yellow-400
    if (s > 40) return '#f59e0b'; // amber-500
    return '#f56565'; // red-500
  };

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const color = getStrokeColor(animatedScore);

  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-gray-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          strokeWidth="10"
          stroke={color}
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {Math.round(animatedScore)}
        </span>
        <span className="text-xs text-gray-400">Trust Score</span>
      </div>
    </div>
  );
};

export default TrustScoreGauge;
