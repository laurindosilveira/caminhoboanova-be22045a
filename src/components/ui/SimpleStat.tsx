import React from "react";

type SimpleStatProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
};

const SimpleStat: React.FC<SimpleStatProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
    {icon}
    <div>
      <p className="font-montserrat text-base font-bold leading-none text-white">{value}</p>
      <p className="font-inter text-[10px] leading-tight text-white/60">{label}</p>
    </div>
  </div>
);

export default SimpleStat;
