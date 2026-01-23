'use client';

import { useState, useMemo, useRef, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from "recharts";
import { Check, Filter, ChevronDown, ChevronUp, Search, X } from "lucide-react";

// Consistent colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

interface CourseData {
  course_name: string;
  count: number;
}

export default function CoursePieChart({ data }: { data: CourseData[] }) {
  // State for Chart Filters (Toggled items)
  const [visibleCourses, setVisibleCourses] = useState<string[]>(
    data.map((d) => d.course_name)
  );

  // State for Dropdown Visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State for Search Input inside dropdown
  const [searchQuery, setSearchQuery] = useState("");

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Data for the CHART (Based on checkboxes)
  const chartData = useMemo(() => {
    return data.filter((item) => visibleCourses.includes(item.course_name));
  }, [data, visibleCourses]);

  // Calculate Total
  const totalDisplayed = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.count, 0);
  }, [chartData]);

  // Toggle Checkbox Logic
  const toggleCourse = (name: string) => {
    setVisibleCourses((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  // Filter the LIST inside the dropdown based on Search Query
  const filteredDropdownList = data.filter(item => 
    item.course_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate percentages for display (like in the image)
  const totalAll = useMemo(() => {
    return data.reduce((sum, item) => sum + item.count, 0);
  }, [data]);

  const getPercentage = (count: number) => {
    return totalAll > 0 ? Math.round((count / totalAll) * 100 * 10) / 10 : 0;
  };

  return (
    <div className="flex flex-col h-full w-full font-sans relative">
      
      {/* --- DROPDOWN TRIGGER (Top Right) --- */}
      {/* 
      {/* --- CHART SECTION --- */}
      <div className="h-[280px] w-full relative mt-4 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={3}
              dataKey="count"
              nameKey="course_name"
            >
              {chartData.map((entry, index) => {
                const originalIndex = data.findIndex(d => d.course_name === entry.course_name);
                return <Cell key={`cell-${index}`} fill={COLORS[originalIndex % COLORS.length]} strokeWidth={2} />;
              })}
              <Label
                value={totalDisplayed}
                position="center"
                className="text-3xl font-bold text-gray-900"
              />
              <Label
                value="TOTAL"
                position="centerBottom"
                className="text-xs font-medium text-gray-500"
                dy={20}
              />
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value, name) => [`${value} Students`, name]}
            />
          </PieChart>
        </ResponsiveContainer>

        {chartData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
                No courses selected
            </div>
        )}
      </div>

      {/* --- BOTTOM LEGEND/FILTER BAR (Vertical scroll like image) --- */}
      <div className="w-full flex flex-col gap-2 px-4">
        {/* Header like "Select suppliers" */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Select Suppliers</span>
          {/* Optional: Show selected count */}
          <span className="text-xs text-slate-400">{visibleCourses.length}/{data.length} selected</span>
        </div>

        {/* Vertical scrollable list of clickable items (scroll down) */}
        <div className="max-h-[200px] overflow-y-auto custom-scrollbar flex flex-col gap-2">
          {data.map((item, index) => {
            const isVisible = visibleCourses.includes(item.course_name);
            const color = COLORS[index % COLORS.length];
            const percentage = getPercentage(item.count);

            return (
              <button
                key={item.course_name}
                onClick={() => toggleCourse(item.course_name)}
                className={`
                  w-full group flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all border select-none text-left
                  ${isVisible 
                    ? "bg-slate-50 border-slate-200 text-slate-700" 
                    : "bg-transparent border-transparent text-slate-400 hover:bg-slate-50"
                  }
                `}
              >
                {/* Color indicator / Checkbox like dropdown */}
                <div 
                  className={`flex-shrink-0 flex items-center justify-center w-4 h-4 rounded transition-colors border ${isVisible ? 'border-transparent' : 'border-slate-200'}`}
                  style={{ backgroundColor: isVisible ? color : 'transparent' }}
                >
                    {isVisible && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </div>
                
                {/* Name */}
                <span className="truncate flex-1">
                  {item.course_name.replace("UTC ", "")}
                </span>
                
                {/* Percentage like in image */}
                <span className={`font-bold text-slate-600 ${!isVisible ? 'opacity-50' : ''}`}>
                  {percentage}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}