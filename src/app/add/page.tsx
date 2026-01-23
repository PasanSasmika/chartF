'use client';

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchStudent, createCertificate } from "@/lib/api";
import { ArrowLeft, User, Mail, Globe, BookOpen, CheckCircle, Plus, Check, Search, GraduationCap, ChevronRight } from "lucide-react";
import UiBackground from "@/components/UiBackground";

// Hardcoded Courses List
const ALL_COURSES = [
  "UTC 1: Introduction to the Science of Addiction",
  "UTC 2: Continuum of Care for Addiction Professionals",
  "UTC 3: Common Co-occurring Mental and Medical Disorders",
  "UTC 4: Basic Counseling Skills for Addiction Professionals",
  "UTC 5: Intake, Screening, Assessment, Treatment Planning",
  "UTC 6: Case Management for Addiction Professionals",
  "UTC 7: Crisis Intervention for Addiction Professionals",
  "UTC 8: Ethics for Addiction Professionals"
];

export default function AddRecordPage() {
  const router = useRouter();
  
  // Profile State
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    certificate_email: "",
    certificate_country: "",
    certificate_name: "",
  });

  // Course State
  const [existingCourses, setExistingCourses] = useState<string[]>([]); 
  const [selectedNewCourses, setSelectedNewCourses] = useState<string[]>([]); 

  // Search State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 1. Handle Search Input
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, first_name: value }));
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await searchStudent(value);
          setSuggestions(Array.isArray(results) ? results : []);
          setShowSuggestions(true);
        } catch (err) {
          setSuggestions([]);
        }
      }, 300);
    } else {
      setShowSuggestions(false);
    }
  };

  // 2. Select User
  const selectUser = (user: any) => {
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email_address: user.email_address || "",
      certificate_email: user.certificate_email || user.email_address || "",
      certificate_country: user.certificate_country || "",
      certificate_name: user.certificate_name || `${user.first_name} ${user.last_name}`,
    });

    const enrolled = user.enrolled_courses ? user.enrolled_courses.split(',') : [];
    setExistingCourses(enrolled);
    setSelectedNewCourses([]);
    setShowSuggestions(false);
  };

  // 3. Toggle Course
  const toggleNewCourse = (course: string) => {
    if (selectedNewCourses.includes(course)) {
        setSelectedNewCourses(prev => prev.filter(c => c !== course));
    } else {
        setSelectedNewCourses(prev => [...prev, course]);
    }
  };

  // 4. Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNewCourses.length === 0) {
        alert("Please select at least one new course to enroll.");
        return;
    }
    setLoading(true);
    const payload = { ...formData, courses: selectedNewCourses };
    const result = await createCertificate(payload);
    setLoading(false);
    if (result) {
      setSuccess(true);
      setExistingCourses(prev => [...prev, ...selectedNewCourses]);
      setSelectedNewCourses([]);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert("Failed to save.");
    }
  };

  return (
    <UiBackground>
    <div className="p-6 flex justify-center font-sans">
      <div className="w-full max-w-5xl">
        
        {/* Navigation */}
        <button 
          onClick={() => router.back()} 
          className="group flex items-center text-slate-500 hover:text-slate-800 mb-8 transition-colors text-sm font-medium"
        >
          <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200 mr-3 group-hover:border-blue-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-visible relative">
          
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-2xl"></div>

          <div className="p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  Enroll Student
                </h1>
                <p className="text-slate-500 mt-2 ml-1">
                  Create a new record or search for an existing student to assign courses.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* --- SECTION 1: STUDENT PROFILE --- */}
              <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" /> Student Profile
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  
                  {/* First Name (Search) - Z-Index High */}
                  <div className="relative z-50">
                    <label className="block text-xs font-semibold text-slate-500 mb-2">First Name / Search</label>
                    <div className="relative group">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" required
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                        placeholder="Start typing to search..."
                        value={formData.first_name}
                        onChange={handleNameChange}
                        autoComplete="off"
                      />
                    </div>
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                         <div className="sticky top-0 bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                           Found {suggestions.length} students
                         </div>
                        {suggestions.map((u, idx) => (
                          <button key={idx} type="button" onClick={() => selectUser(u)} className="w-full text-left px-4 py-3.5 hover:bg-blue-50 border-b border-slate-50 last:border-0 group transition-colors">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-sm text-slate-800 group-hover:text-blue-700">{u.first_name} {u.last_name}</p>
                                <p className="text-xs text-slate-400">{u.email_address}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="relative z-0">
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Last Name</label>
                    <input type="text" required 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                      value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                  </div>

                  <div className="md:col-span-2 relative z-0">
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Primary Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input type="email" required 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                        value={formData.email_address} onChange={e => setFormData({...formData, email_address: e.target.value})} />
                    </div>
                  </div>

                  <div className="relative z-0">
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Country</label>
                    <div className="relative group">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input type="text" required 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                        value={formData.certificate_country} onChange={e => setFormData({...formData, certificate_country: e.target.value})} />
                    </div>
                  </div>

                  <div className="relative z-0">
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Certificate Name</label>
                    <input type="text" required 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                      value={formData.certificate_name} onChange={e => setFormData({...formData, certificate_name: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* --- SECTION 2: COURSE MANAGEMENT --- */}
              <div className="relative z-0">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" /> Course Enrollment
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      
                      {/* LEFT: Already Enrolled */}
                      <div className="bg-emerald-50/40 p-6 rounded-2xl border border-emerald-100/60">
                          <h4 className="text-xs font-bold text-emerald-700 uppercase mb-4 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4"/> Enrolled History
                          </h4>
                          {existingCourses.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-40 text-center border-2 border-dashed border-emerald-200/50 rounded-xl">
                                <p className="text-emerald-800/50 text-sm font-medium">No prior enrollment history.</p>
                              </div>
                          ) : (
                              <div className="flex flex-col gap-2.5">
                                  {existingCourses.map((course, idx) => (
                                      <div key={idx} className="flex items-start gap-3 text-sm text-emerald-900 bg-white p-3 rounded-xl border border-emerald-100 shadow-sm opacity-90 cursor-default select-none">
                                          <div className="mt-0.5 bg-emerald-100 p-1 rounded-full text-emerald-600">
                                            <Check className="w-3 h-3"/>
                                          </div>
                                          <span className="font-medium">{course.replace("UTC ", "UTC ")}</span>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      {/* RIGHT: Available to Enroll */}
                      <div className="bg-white p-0">
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 pl-1">
                              <Plus className="w-4 h-4"/> Available Courses
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                              {ALL_COURSES
                                  .filter(c => !existingCourses.includes(c)) 
                                  .map((course, idx) => {
                                      const isSelected = selectedNewCourses.includes(course);
                                      return (
                                          <button 
                                              key={idx}
                                              type="button"
                                              onClick={() => toggleNewCourse(course)}
                                              className={`
                                                  group relative flex items-center justify-between text-left p-4 rounded-xl border-2 transition-all duration-200
                                                  ${isSelected 
                                                      ? "bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200" 
                                                      : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5"
                                                  }
                                              `}
                                          >
                                              <span className={`text-sm font-semibold transition-colors pr-8 ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                                {course}
                                              </span>
                                              
                                              {isSelected ? (
                                                <div className="absolute right-4 bg-white/20 p-1 rounded-full text-white">
                                                  <Check className="w-4 h-4" />
                                                </div>
                                              ) : (
                                                <div className="absolute right-4 w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-300 transition-colors"></div>
                                              )}
                                          </button>
                                      )
                                  })
                              }
                          </div>
                      </div>
                  </div>
              </div>

              {/* Actions Footer */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm p-4 -mx-8 -mb-8 mt-8 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
                <div className="pl-4">
                  {selectedNewCourses.length > 0 && (
                     <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-full animate-in fade-in">
                        {selectedNewCourses.length} new course(s) selected
                     </span>
                  )}
                </div>
                
                <div className="flex gap-3 pr-4">
                  <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    Cancel
                  </button>
                  
                  <button 
                    type="submit" 
                    disabled={loading || success || selectedNewCourses.length === 0}
                    className={`
                      relative flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white rounded-lg transition-all shadow-md
                      ${success ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-95'}
                      ${(loading || selectedNewCourses.length === 0) ? 'opacity-50 cursor-not-allowed shadow-none' : ''}
                    `}
                  >
                    {success ? (
                      <> <CheckCircle className="w-4 h-4" /> Enrolled! </>
                    ) : (
                      <> {loading ? "Processing..." : "Enroll Student"} </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
    </UiBackground>
  );
}