'use client';

import { useEffect, useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  Users, FileBadge, Globe, BookOpen, Download, Calendar, 
  Clock, Activity, Plus, TrendingUp, Trophy, X, Loader2, Mail, MapPin, Award,
  LayoutTemplate
} from "lucide-react";
import { API_BASE, fetchAnalytics, fetchKpiDetails, searchStudent } from "@/lib/api"; 
import dynamic from "next/dynamic";
import Link from "next/link";

// Components
import CoursePieChart from "@/components/CoursePieChart";
import TopStudentsList from "@/components/TopStudentsList";
import CourseExplorer from "@/components/CourseExplorer";
import StudentSearch from "@/components/StudentSearch";
import UiBackground from "@/components/UiBackground";
import Preloader from "@/components/Preloader"; 
import StudentLoyalty from "@/components/StudentLoyalty"; 

// 1. Dynamic Import for Map
const MapChart = dynamic(() => import("@/components/MapChart"), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2026-12-31' });

  // Modal States
  const [activeKpi, setActiveKpi] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchAnalytics(dateRange.start, dateRange.end);
        setData(result);
      } catch (error) {
        console.error("Error loading data", error);
      } finally {
        setIsDataLoading(false);
      }
    }
    load();
  }, [dateRange]);

  const handleExport = () => {
    const exportUrl = `${API_BASE}/export?startDate=${dateRange.start}&endDate=${dateRange.end}`;
    window.location.href = exportUrl;
  };

  const trendTotal = useMemo(() => {
    if (!data?.trend) return 0;
    return data.trend.reduce((acc: number, curr: any) => acc + curr.count, 0);
  }, [data]);

  // Handle Leaderboard Click
  const handleStudentClick = async (student: any) => {
    // Open modal immediately with loading state
    setSelectedStudent({ loading: true, name: student.name }); 
    
    try {
        // Use existing search API to get full details by email
        const result = await searchStudent(student.email_address);
        
        // Normalize data if necessary (handling flat array return from API)
        if (Array.isArray(result) && result.length > 0) {
            const raw = result[0];
            const courses = raw.enrolled_courses ? raw.enrolled_courses.split(',') : [];
            
            setSelectedStudent({
                loading: false,
                profile: {
                    name: raw.certificate_name || raw.first_name + ' ' + raw.last_name,
                    email: raw.email_address,
                    country: raw.certificate_country || 'Unknown',
                },
                certificates: courses.map((c: string) => ({
                    course_name: c,
                    date: 'Enrolled' // Date might not be in the group_concat, generic label
                }))
            });
        } else {
            // Fallback if search fails
            setSelectedStudent({ 
                loading: false, 
                error: true,
                profile: { name: student.name, email: student.email_address } 
            });
        }
    } catch (e) {
        setSelectedStudent(null);
    }
  };

  return (
    <UiBackground>
      {showPreloader && <Preloader onFinish={() => setShowPreloader(false)} />}

      <div className={`p-6 space-y-8 font-sans text-slate-900 transition-opacity duration-700 ${showPreloader ? 'opacity-0' : 'opacity-100'}`}>
        
        {(!data && !showPreloader) ? (
           <div className="h-screen flex items-center justify-center text-slate-400">Loading Data...</div>
        ) : data && (
          <>
            {/* --- KPI DETAILS MODAL --- */}
            {activeKpi && (
              <KpiModal 
                type={activeKpi} 
                dateRange={dateRange} 
                totalCount={
                    activeKpi === 'certificates' ? data.stats.total_certificates :
                    activeKpi === 'students' ? data.stats.unique_students :
                    activeKpi === 'countries' ? data.stats.active_countries :
                    data.stats.distinct_courses
                }
                onClose={() => setActiveKpi(null)} 
              />
            )}

            {/* --- STUDENT DETAILS MODAL --- */}
            {selectedStudent && (
               <StudentModal 
                  data={selectedStudent} 
                  onClose={() => setSelectedStudent(null)} 
               />
            )}

            {/* --- HEADER --- */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 p-1.5 shrink-0">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">Analytics Dashboard</h1>
                  <p className="text-xs font-medium text-slate-500">Overview of student performance</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                <div className="flex items-center gap-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-0.5 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="pl-9 pr-0.5 py-2 bg-transparent text-xs font-semibold text-slate-700 outline-none w-[130px] cursor-pointer" />
                  </div>
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="pl-9 pr-0.5 py-2 bg-transparent text-xs font-semibold text-slate-700 outline-none w-[130px] cursor-pointer" />
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>
                <div className="flex gap-2">
                  <Link href="/add" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95">
                    <Plus className="w-4 h-4" /> <span>Add Data</span>
                  </Link>
                  <button onClick={handleExport} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95">
                    <Download className="w-4 h-4 text-slate-500" /> <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <Link href="/template" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95">
                    <LayoutTemplate className="w-4 h-4" /> <span>All Records</span>
                  </Link>
    
                </div>
              </div>
            </header>

            {/* --- KPI GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard title="Total Certificates Issued" value={data.stats.total_certificates} icon={<FileBadge className="h-6 w-6"/>} color="blue" trend="+24%" onClick={() => setActiveKpi('certificates')} />
              <KpiCard title="Unique Students" value={data.stats.unique_students} icon={<Users className="h-6 w-6"/>} color="green" trend="+18%" onClick={() => setActiveKpi('students')} />
              <KpiCard title="Active Countries" value={data.stats.active_countries} icon={<Globe className="h-6 w-6"/>} color="purple" trend="+5 New" onClick={() => setActiveKpi('countries')} />
              <KpiCard title="Total Courses" value={data.stats.distinct_courses} icon={<BookOpen className="h-6 w-6"/>} color="orange" trend="Stable" onClick={() => setActiveKpi('courses')} />
            </div>

            {/* --- TRENDS & LEADERBOARD --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trends */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><TrendingUp className="w-4 h-4" /></div>
                      <h3 className="text-lg font-bold text-slate-800">Issuance Trends</h3>
                    </div>
                    <p className="text-sm text-slate-500 pl-9">Timeline of certificates issued</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-3xl font-bold text-slate-900">{trendTotal}</span>
                    <span className="text-[10px] font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">Total Issued</span>
                  </div>
                </div>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} style={{fontSize: 11, fill: '#94a3b8'}} tickLine={false} axisLine={false} dy={10} />
                      <YAxis style={{fontSize: 11, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" activeDot={{ r: 6, strokeWidth: 0, fill: '#2563EB' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Leaderboard (CLICKABLE) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100"><Trophy className="w-5 h-5" /></div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Leaderboard</h3>
                        <p className="text-xs text-slate-500">Highest achieving students</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tracking-wide text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">TOP PERFORMERS</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <TopStudentsList 
                    data={data.topStudents} 
                    onStudentClick={handleStudentClick}
                  />
                </div>
              </div>
            </div>

            {/* --- MAP & PIE --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Global Distribution</h3>
                <MapChart data={data.geo} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Course Popularity</h3>
                <CoursePieChart data={data.popularCourses} />
              </div>
            </div>

            {/* --- LOYALTY & ACTIVITY --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Student Loyalty */}
              <div className="h-full min-h-[100px]">
                 <StudentLoyalty data={data.engagement} />
              </div>

              {/* Peak Activity Hours (UPGRADED UI) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                              <Clock className="w-5 h-5 text-amber-500"/> Peak Activity
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">Most active submission times (24h)</p>
                      </div>
                  </div>

                  <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={1}/>
                                  <stop offset="100%" stopColor="#D97706" stopOpacity={0.8}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis 
                                  dataKey="hour_of_day" 
                                  tickFormatter={(val) => `${val}:00`} 
                                  style={{fontSize: 11, fill: '#94a3b8', fontWeight: 500}} 
                                  tickLine={false} axisLine={false} dy={10} 
                              />
                              <YAxis style={{fontSize: 11, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                              <Tooltip 
                                  cursor={{fill: '#FFF7ED', opacity: 0.5}} 
                                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                              />
                              <Bar 
                                  dataKey="count" 
                                  fill="url(#activityGradient)" 
                                  radius={[6, 6, 0, 0]} 
                                  barSize={32} 
                                  animationDuration={1500}
                              />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
            </div>

            {/* --- RECENT CERTIFICATIONS --- */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                    <Activity className="w-5 h-5 text-emerald-500"/> Recent Certifications
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3">Student</th>
                                <th className="px-4 py-3">Course</th>
                                <th className="px-4 py-3">Country</th>
                                <th className="px-4 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.recent.map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[150px]">{item.certificate_name}</td>
                                    <td className="px-4 py-3 text-gray-500 truncate max-w-[180px]">{item.course_name}</td>
                                    <td className="px-4 py-3 text-gray-600">{item.certificate_country}</td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(item.survey_created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- TOOLS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CourseExplorer dateRange={dateRange} allCourses={data.popularCourses} />
              <div className="h-[450px]">
                <StudentSearch />
              </div>
            </div>
          </>
        )}
      </div>
    </UiBackground>
  );
}

// --- STUDENT DETAILS MODAL ---
function StudentModal({ data, onClose }: { data: any, onClose: () => void }) {
    if (data.loading) {
        return (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2"/>
                    <p className="text-sm text-slate-500">Loading profile for {data.name}...</p>
                </div>
            </div>
        );
    }

    if (data.error) {
        return (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
                    <p className="text-red-500 font-bold mb-2">Error</p>
                    <p className="text-sm text-slate-500">Could not fetch details for this student.</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-100 rounded-lg text-sm">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
            
            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        <X className="w-4 h-4 text-white" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white text-blue-600 flex items-center justify-center text-2xl font-bold border-4 border-blue-400">
                            {data.profile.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{data.profile.name}</h2>
                            <p className="text-blue-100 text-sm flex items-center gap-1.5 mt-1">
                                <Mail className="w-3.5 h-3.5" /> {data.profile.email}
                            </p>
                            <p className="text-blue-100 text-sm flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" /> {data.profile.country}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800">Enrolled Courses</h3>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                            <Award className="w-3 h-3" /> {data.certificates.length} Total
                        </span>
                    </div>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {data.certificates.map((cert: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className="p-2 bg-green-50 rounded-full text-green-600">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">{cert.course_name.replace('UTC ', '')}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Completed</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// KPI MODAL (Existing)
function KpiModal({ type, dateRange, totalCount, onClose }: { type: string, dateRange: any, totalCount: number, onClose: () => void }) {
  const [listData, setListData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      const data = await fetchKpiDetails(type, dateRange.start, dateRange.end);
      setListData(data || []);
      setLoading(false);
    }
    fetchDetails();
  }, [type, dateRange]);

  let config = { title: '', headers: [] as string[] };
  switch (type) {
    case 'certificates': config = { title: 'All Certificates Issued', headers: ['Student', 'Course', 'Country', 'Date'] }; break;
    case 'students': config = { title: 'Student Directory', headers: ['Name', 'Email', 'Total Certificates'] }; break;
    case 'countries': config = { title: 'Geographic Distribution', headers: ['Country', 'Total Cources'] }; break;
    case 'courses': config = { title: 'Course Performance', headers: ['Course Name', 'Total Enrollments'] }; break;
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div><h2 className="text-xl font-bold text-slate-800">{config.title}</h2><p className="text-sm text-slate-500 mt-1">Showing <b>{listData.length}</b> records (Total: {totalCount})</p></div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-auto p-0">
          {loading ? (<div className="flex flex-col items-center justify-center h-64 text-slate-400"><Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />Loading...</div>) : 
           listData.length === 0 ? (<div className="p-10 text-center text-slate-400">No records found.</div>) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md"><tr>{config.headers.map((h, i) => <th key={i} className="px-6 py-4 font-semibold border-b border-gray-100">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {listData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                    {type === 'certificates' && <><td className="px-6 py-4 font-medium text-slate-700">{row.certificate_name}</td><td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">{row.course_name.replace('UTC ', '')}</td><td className="px-6 py-4 text-slate-600">{row.certificate_country}</td><td className="px-6 py-4 text-slate-500 text-xs">{new Date(row.survey_created_at).toLocaleDateString()}</td></>}
                    {type === 'students' && <><td className="px-6 py-4 font-medium text-slate-700">{row.certificate_name}</td><td className="px-6 py-4 text-slate-500">{row.email_address}</td><td className="px-6 py-4 font-bold text-blue-600">{row.certificate_count}</td></>}
                    {type === 'countries' && <><td className="px-6 py-4 font-medium text-slate-700">{row.country}</td><td className="px-6 py-4 font-bold text-slate-900">{row.count}</td></>}
                    {type === 'courses' && <><td className="px-6 py-4 font-medium text-slate-700">{row.course_name.replace('UTC ', '')}</td><td className="px-6 py-4 font-bold text-slate-900">{row.count}</td></>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// KPI CARD
function KpiCard({ title, value, icon, color, onClick }: { title: string, value: string | number, icon: any, color: "blue" | "green" | "purple" | "orange", trend?: string, onClick?: () => void }) {
  const styles = { blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "group-hover:ring-blue-100" }, green: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "group-hover:ring-emerald-100" }, purple: { bg: "bg-violet-50", text: "text-violet-600", ring: "group-hover:ring-violet-100" }, orange: { bg: "bg-amber-50", text: "text-amber-600", ring: "group-hover:ring-amber-100" } };
  const theme = styles[color];
  return (
    <div onClick={onClick} className={`group relative p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-transparent ring-1 ring-transparent ${theme.ring} cursor-pointer`}>
      <div className="flex justify-between items-start">
        <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p><h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3><div className="flex items-center mt-2 gap-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${theme.bg} ${theme.text}`}></span></div></div>
        <div className={`p-3 rounded-xl ${theme.bg} ${theme.text} shadow-sm group-hover:scale-110 transition-transform`}>{icon}</div>
      </div>
    </div>
  );
}