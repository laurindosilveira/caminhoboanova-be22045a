import React from "react";

type CircularProgressBarProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
};

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  progress,
  size = 60,
  strokeWidth = 6,
  color = "text-emerald-300",
}) => {
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute top-0 left-0" width={size} height={size}>
        <circle
          className="text-white/10"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`transform -rotate-90 origin-center ${color}`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
        />
      </svg>
      <span className="font-montserrat text-sm font-black text-white">{`${Math.round(normalizedProgress)}%`}</span>
    </div>
  );
};

export default CircularProgressBar;
