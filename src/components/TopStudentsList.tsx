'use client';

import { Trophy, Medal, ChevronRight } from "lucide-react";

interface Student {
  name: string;
  email_address: string;
  certificate_count: number; // Ensure this matches your API response key
}

interface Props {
  data: Student[];
  onStudentClick?: (student: Student) => void; // New Prop
}

export default function TopStudentsList({ data, onStudentClick }: Props) {
  // Find the highest count to calculate bar percentages
  const maxCount = Math.max(...data.map((d) => d.certificate_count), 0);

  // Helper for Rank Icons/Colors
  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100", icon: <Trophy className="w-4 h-4" /> }; // Gold
      case 1: return { color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", icon: <Medal className="w-4 h-4" /> };   // Silver
      case 2: return { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", icon: <Medal className="w-4 h-4" /> };  // Bronze
      default: return { color: "text-slate-400", bg: "bg-white", border: "border-slate-100", icon: <span className="text-xs font-bold">{index + 1}</span> };
    }
  };

  return (
    <div className="h-[350px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
      {data.map((student, index) => {
        const rank = getRankStyle(index);
        const percentage = maxCount > 0 ? (student.certificate_count / maxCount) * 100 : 0;
        
        // Get Initials for Avatar
        const initials = student.name
          ? student.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
          : "ST";

        return (
          <div 
            key={index} 
            onClick={() => onStudentClick && onStudentClick(student)}
            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer relative"
          >
            {/* 1. Rank Badge */}
            <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border ${rank.bg} ${rank.border} ${rank.color}`}>
              {rank.icon}
            </div>

            {/* 2. Avatar */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200 shadow-sm">
              {initials}
            </div>

            {/* 3. Name & Bar */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-sm font-semibold text-slate-800 truncate pr-2 group-hover:text-blue-600 transition-colors">
                  {student.name}
                </p>
                <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-700">
                    {student.certificate_count}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">certs</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out group-hover:bg-blue-600"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Hover Arrow */}
            <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity -ml-2" />
          </div>
        );
      })}
    </div>
  );
}