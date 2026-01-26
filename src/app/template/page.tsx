'use client';

import { useState, useEffect } from "react";
import { fetchAllCertificates } from "@/lib/api";
import UiBackground from "@/components/UiBackground";
import { Search, ChevronLeft, ChevronRight, Eye, X, Loader2 } from "lucide-react";
import Link from "next/link";

export default function TemplatePage() {
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State to control the popup
  const [showModal, setShowModal] = useState(false);

  // Fetch Data
  const loadData = async (page = 1, search = "") => {
    setLoading(true);
    const result = await fetchAllCertificates(page, 10, search);
    if (result) {
      setData(result.data || []);
      setPagination(result.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
    }
    setLoading(false);
  };

  useEffect(() => { loadData(1, searchTerm); }, []);

  // Search Handler
  useEffect(() => {
    const timer = setTimeout(() => { loadData(1, searchTerm); }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) loadData(newPage, searchTerm);
  };

  return (
    <UiBackground>
      <div className="p-6 min-h-screen font-sans text-slate-900">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/80 p-4 rounded-xl border border-white shadow-sm backdrop-blur-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Certificate Database</h1>
            <p className="text-sm text-slate-500">View all records</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             <div className="relative group w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <Link href="/" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">
               Dashboard
             </Link>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student Name</th>
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Country</th>
                  <th className="px-6 py-4 font-semibold text-center">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin inline mr-2"/> Loading...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">No records found.</td></tr>
                ) : (
                  data.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{row.certificate_name}</td>
                      <td className="px-6 py-4 text-slate-600 truncate max-w-[250px]">{row.course_name ? row.course_name.replace("UTC ", "") : "N/A"}</td>
                      <td className="px-6 py-4 text-slate-500">{row.email_address}</td>
                      <td className="px-6 py-4">{row.certificate_country}</td>
                      <td className="px-6 py-4 text-center">
                        {/* Simple button to open modal */}
                        <button 
                          onClick={() => setShowModal(true)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
             <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.totalPages}</p>
             <div className="flex gap-2">
               <button disabled={pagination.page === 1} onClick={() => handlePageChange(pagination.page - 1)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
               <button disabled={pagination.page === pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
             </div>
          </div>
        </div>

        {/* --- SIMPLE IMAGE POPUP --- */}
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative bg-white p-2 rounded-lg shadow-2xl max-w-5xl w-full">
              
              {/* Close Button */}
              <button 
                onClick={() => setShowModal(false)}
                className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* The Image */}
              <div className="overflow-auto max-h-[85vh] flex justify-center bg-gray-100 rounded-md">
                 <img 
                   src="/certificate-bg.jpg" 
                   alt="Certificate" 
                   className="w-auto h-auto max-w-full object-contain" 
                 />
              </div>

            </div>
          </div>
        )}

      </div>
    </UiBackground>
  );
}