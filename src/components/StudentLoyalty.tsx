'use client';

import { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Sector 
} from 'recharts';
import { Users, Info } from 'lucide-react';

// Modern Color Palette
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface LoyaltyData {
  category: string;
  student_count: number;
}

interface StudentLoyaltyProps {
  data: LoyaltyData[];
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  
  return (
    <g>
      <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#1e293b" className="text-xl font-bold">
        {value}
      </text>
      <text x={cx} y={cy} dy={10} textAnchor="middle" fill="#64748b" className="text-xs font-medium uppercase">
        Students
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6} // Gentle expansion on hover
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 6}
        outerRadius={innerRadius - 2}
        fill={fill}
        fillOpacity={0.2}
        cornerRadius={4}
      />
    </g>
  );
};

export default function StudentLoyalty({ data }: StudentLoyaltyProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Calculate total for percentage
  const totalStudents = data.reduce((acc, cur) => acc + cur.student_count, 0);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-[400px] text-center">
        <div className="bg-gray-50 p-4 rounded-full mb-3">
          <Users className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-semibold">No Loyalty Data</h3>
        <p className="text-gray-500 text-sm mt-1">Not enough student history to analyze retention yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Student Loyalty
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Certificates earned per student ratio
          </p>
        </div>
        <div className="group relative">
          <Info className="w-4 h-4 text-slate-300 cursor-help" />
          <div className="absolute right-0 w-48 p-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl mt-1">
            Shows how many students return for multiple courses.
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 min-h-[280px] relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={4}
              dataKey="student_count"
              nameKey="category"
              onMouseEnter={onPieEnter}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="transition-all duration-300 outline-none"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Legend */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map((entry, index) => {
          const isActive = index === activeIndex;
          const percentage = ((entry.student_count / totalStudents) * 100).toFixed(1);
          
          return (
            <div 
              key={index}
              onMouseEnter={() => setActiveIndex(index)}
              className={`
                flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 border
                ${isActive 
                  ? "bg-slate-50 border-slate-200 shadow-sm transform scale-[1.02]" 
                  : "bg-transparent border-transparent hover:bg-slate-50"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full shadow-sm" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className={`text-xs font-medium ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                  {entry.category}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}