'use client';

import { useState, useEffect } from "react";
import { fetchCourseDetail, fetchCourseStudents } from "@/lib/api";
import { Search, FileCheck, CalendarClock, X, Loader2, ChevronRight } from "lucide-react";

interface Props {
  dateRange: { start: string; end: string };
  allCourses: any[];
}

export default function CourseExplorer({ dateRange, allCourses }: Props) {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [studentList, setStudentList] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // Auto-select first course
  useEffect(() => {
    if (allCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(allCourses[0].course_name);
    }
  }, [allCourses]);

  // Fetch Stats
  useEffect(() => {
    async function load() {
      if (!selectedCourse) return;
      setLoading(true);
      const data = await fetchCourseDetail(dateRange.start, dateRange.end, selectedCourse);
      setStats(data);
      setLoading(false);
    }
    load();
  }, [selectedCourse, dateRange]);

  // Fetch Student List (When modal opens)
  const handleOpenList = async () => {
    setShowModal(true);
    setListLoading(true);
    const list = await fetchCourseStudents(dateRange.start, dateRange.end, selectedCourse);
    setStudentList(list);
    setListLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-blue-500" />
        Course Explorer
      </h3>

      {/* 1. Selector */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
          Select Course to Analyze
        </label>
        <select 
          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all cursor-pointer"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          {allCourses.map((c: any, idx: number) => (
            <option key={idx} value={c.course_name}>
              {c.course_name.replace("UTC ", "")}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Stats Display */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Calculating...
        </div>
      ) : stats ? (
        <div className="space-y-4">
          
          {/* Main Clickable Card */}
          <button 
            onClick={handleOpenList}
            className="w-full group p-5 bg-blue-50/50 hover:bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 text-left flex justify-between items-center relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all transform group-hover:scale-125 translate-x-8 -translate-y-8 pointer-events-none"></div>

            <div>
               <div className="flex items-center gap-2 mb-1">
                 <FileCheck className="w-4 h-4 text-blue-600" />
                 <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Certificates</span>
               </div>
               <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                 {stats.total_certificates}
               </p>
               <p className="text-xs text-gray-500 mt-1 group-hover:text-blue-600/70">Click to view students</p>
            </div>

            <div className="bg-white p-2 rounded-full shadow-sm border border-blue-100 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
               <ChevronRight className="w-5 h-5" />
            </div>
          </button>

          {/* Last Active Info */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-600">Last Issued:</span>
             </div>
             <span className="text-sm font-bold text-gray-800">
                {stats.last_certificate 
                  ? new Date(stats.last_certificate).toLocaleDateString() 
                  : "N/A"}
             </span>
          </div>
        </div>
      ) : null}

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Students Enrolled</h2>
                <p className="text-sm text-slate-500 mt-0.5">{selectedCourse.replace("UTC ", "")}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-0">
              {listLoading ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                  Loading List...
                </div>
              ) : studentList.length === 0 ? (
                <div className="p-10 text-center text-slate-400">No students found for this period.</div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 font-semibold border-b">Name</th>
                      <th className="px-6 py-3 font-semibold border-b">Email</th>
                      <th className="px-6 py-3 font-semibold border-b">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {studentList.map((student, i) => (
                      <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-700">{student.certificate_name}</td>
                        <td className="px-6 py-3 text-slate-500">{student.email_address}</td>
                        <td className="px-6 py-3 text-slate-400 text-xs">{new Date(student.survey_created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}