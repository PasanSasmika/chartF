'use client';

import { useState, useRef, useEffect } from "react";
import { searchStudent } from "@/lib/api";
import { Search, Mail, MapPin, Award, Calendar, User, ChevronRight } from "lucide-react";

export default function StudentSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Suggestion States
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // --- HELPER: Normalize Data ---
  // This converts the "Flat" backend data into the "Nested" structure the UI needs
  const normalizeStudentData = (data: any[]) => {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => {
      // If it's already in the old format (has profile), return it
      if (item.profile) return item;

      // Otherwise, map the flat format (from the Add Form API)
      const courseList = item.enrolled_courses ? item.enrolled_courses.split(',') : [];
      
      return {
        profile: {
          name: item.certificate_name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
          email: item.email_address,
          country: item.certificate_country || "Unknown",
        },
        stats: {
          total_courses: courseList.length,
          last_active: item.survey_created_at || new Date().toISOString() // Fallback date
        },
        certificates: courseList.map((c: string) => ({
          course: c,
          date: item.survey_created_at || new Date().toISOString() // Fallback date
        }))
      };
    });
  };

  // 1. Handle Typing with Debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const rawData = await searchStudent(value);
          const processedData = normalizeStudentData(rawData); // <--- Normalize here
          setSuggestions(processedData);
        } catch (err) {
          setSuggestions([]);
        }
      }, 300);
    } else {
      setSuggestions([]);
    }
  };

  // 2. Handle Clicking a Suggestion
  const handleSelectSuggestion = (student: any) => {
    setQuery(student.profile.name); 
    setResults([student]);          
    setShowSuggestions(false);      
    setHasSearched(true);
  };

  // 3. Handle Form Submit
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (!query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const rawData = await searchStudent(query);
      const processedData = normalizeStudentData(rawData); // <--- Normalize here
      setResults(processedData);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-indigo-500" />
        Student Inspector
      </h3>

      {/* Search Bar Wrapper */}
      <div className="relative mb-6" ref={wrapperRef}>
        <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by Name or Email..." 
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                />
            </div>
            <button 
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
                {loading ? "..." : "Search"}
            </button>
        </form>

        {/* Suggestion Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-50 max-h-[300px] overflow-y-auto">
                {suggestions.map((student, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSelectSuggestion(student)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between group border-b border-gray-50 last:border-0 transition-colors"
                    >
                        <div>
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600">
                                {student.profile.name}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {student.profile.email}
                            </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400" />
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
        
        {!loading && hasSearched && results.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
                No students found matching "{query}"
            </div>
        )}

        {results.map((student: any, idx: number) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50/50">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg">{student.profile.name}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {student.profile.email}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {student.profile.country}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {student.stats.total_courses} Certificates
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                            Last Active: {new Date(student.stats.last_active).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Course History */}
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Course History
                    </p>
                    <ul className="space-y-2">
                        {student.certificates.map((cert: any, cIdx: number) => (
                            <li key={cIdx} className="flex items-start gap-3 text-sm bg-white p-2 rounded border border-gray-100">
                                <div className="mt-0.5 min-w-[4px] h-[4px] rounded-full bg-green-400" />
                                <div className="flex-1">
                                    <span className="text-gray-800 font-medium block">
                                        {cert.course.replace("UTC ", "")}
                                    </span>
                                </div>
                                <span className="text-gray-400 text-xs whitespace-nowrap flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {/* Note: Dates might be approximate depending on backend aggregation */}
                                    {cert.date ? new Date(cert.date).toLocaleDateString() : 'N/A'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}