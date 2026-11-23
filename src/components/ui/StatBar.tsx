import React from "react";

type StatBarProps = {
  value: number;
  total: number;
  color?: string;
  label: string;
  valueLabel: string;
};

const StatBar: React.FC<StatBarProps> = ({ value, total, color = "bg-emerald-300", label, valueLabel }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <p className="font-inter text-xs leading-tight text-white/60">{label}</p>
        <p className="font-montserrat text-sm font-black leading-none text-white">{valueLabel}</p>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div
          className={`${color} h-1.5 rounded-full`}
          style={{ width: `${percentage}%`, transition: "width 0.5s ease-in-out" }}
        />
      </div>
    </div>
  );
};

export default StatBar;
