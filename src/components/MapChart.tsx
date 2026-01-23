'use client';

import React, { useState, useMemo } from "react";
// @ts-ignore
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Download, Plus, Minus, FileQuestion, ChevronLeft, ChevronRight } from "lucide-react";

// --- 1. CONFIGURATION DATA ---

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map Country Names to ISO Codes for Flags
const nationalityToAlpha2: Record<string, string> = {
  "Sri Lanka": "lk", "India": "in", "United Kingdom": "gb", "China": "cn",
  "Singapore": "sg", "Australia": "au", "Russia": "ru", "Canada": "ca",
  "United States": "us", "UK": "gb", "USA": "us", "Nigeria": "ng",
  "Indonesia": "id", "Philippines": "ph", "Vietnam": "vn", "Germany": "de",
  "France": "fr", "Italy": "it", "Spain": "es", "Brazil": "br", "Mexico": "mx",
  "South Africa": "za", "Kenya": "ke", "Egypt": "eg", "Japan": "jp",
  "South Korea": "kr", "Thailand": "th", "Malaysia": "my", "Bangladesh": "bd",
  "Pakistan": "pk", "Nepal": "np", "Saudi Arabia": "sa", "UAE": "ae",
  "Chile": "cl", "Argentina": "ar", "Colombia": "co", "Peru": "pe"
};

const regions: Record<string, string[]> = {
  "All": [],
  "Asia": ["Sri Lanka", "India", "China", "Singapore", "Japan", "South Korea", "Thailand", "Malaysia", "Indonesia", "Philippines", "Vietnam", "Bangladesh", "Pakistan", "Nepal"],
  "Europe": ["United Kingdom", "UK", "Russia", "Germany", "France", "Italy", "Spain", "Netherlands", "Switzerland", "Belgium", "Austria", "Sweden", "Norway", "Denmark", "Finland", "Poland", "Greece", "Portugal", "Ireland"],
  "Americas": ["United States", "USA", "Canada", "Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru"],
  "Middle East": ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman", "Israel", "Jordan", "Lebanon"],
  "Oceania": ["Australia", "New Zealand", "Fiji"],
  "Africa": ["South Africa", "Egypt", "Kenya", "Nigeria", "Morocco", "Tanzania"]
};

type RegionKey = keyof typeof regions;

// --- 2. COMPONENT ---

interface MapProps {
  data: { country: string; count: number }[];
}

export default function MapChart({ data }: MapProps) {
  // --- STATE ---
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>("All");

  const itemsPerPage = 4;

  // --- DATA TRANSFORMATION ---
  const processedData = useMemo(() => {
    const total = data.reduce((acc, curr) => acc + curr.count, 0);
    return data.map(item => ({
      nationality: item.country,
      booking_count: item.count,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : "0"
    })).sort((a, b) => b.booking_count - a.booking_count);
  }, [data]);

  // Filter based on Region
  const filteredData = useMemo(() => {
    if (selectedRegion === "All") return processedData;
    return processedData.filter(item => regions[selectedRegion].includes(item.nationality));
  }, [processedData, selectedRegion]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentCountries = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const filteredTotalCourses = filteredData.reduce((sum, item) => sum + item.booking_count, 0);

  // --- HANDLERS ---
  
  const handleRegionChange = (region: RegionKey) => {
    setSelectedRegion(region);
    setCurrentPage(0);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 4));
  const handleZoomOut = () => {
    setZoom(z => {
      const newZoom = Math.max(z - 0.5, 1);
      if (newZoom === 1) setCenter([0, 20]);
      return newZoom;
    });
  };

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart && zoom > 1) {
      const dx = (e.clientX - dragStart.x) / (zoom * 2);
      const dy = (e.clientY - dragStart.y) / (zoom * 2);
      setCenter(prev => [prev[0] - dx, prev[1] + dy]);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Helpers
  const getFlagSvgUrl = (nationality: string) => {
    const alpha2 = nationalityToAlpha2[nationality];
    return alpha2 ? `https://flagcdn.com/${alpha2}.svg` : "";
  };

  const getCountryColor = (countryName: string) => {
    const hasData = processedData.some(d => d.nationality === countryName);
    const inRegion = selectedRegion === "All" || regions[selectedRegion].includes(countryName);

    if (selectedRegion !== "All") {
      if (inRegion && hasData) return "#2563EB"; 
      if (inRegion) return "#E2E8F0"; 
      return "#F1F5F9"; 
    }
    return hasData ? "#3B82F6" : "#E2E8F0";
  };

  const handleExport = () => {
    const headers = ['Country', 'Certificates', 'Percentage'];
    const rows = filteredData.map(item => [
      item.nationality,
      item.booking_count,
      `${item.percentage}%`
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nationality-report.csv`;
    link.click();
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[550px] flex flex-col">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-bold text-gray-800">Certificate Country </h3>
        
        <div className="flex items-center gap-3">
           {selectedRegion !== "All" && (
            <div className="text-sm text-gray-600 hidden lg:block">
              <span className="font-bold text-blue-600">{filteredTotalCourses}</span> countries
            </div>
           )}

           <select
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value as RegionKey)}
            className="px-3 py-1.5 text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            {(Object.keys(regions) as RegionKey[]).map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full overflow-hidden">
        
        {/* LEFT: MAP */}
        <div 
          className="lg:col-span-3 relative bg-slate-50 rounded-xl border border-slate-100 overflow-hidden cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
           <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <button onClick={handleZoomIn} className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 font-bold border border-gray-100">
              <Plus className="w-4 h-4"/>
            </button>
            <button onClick={handleZoomOut} className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50 font-bold border border-gray-100">
              <Minus className="w-4 h-4"/>
            </button>
          </div>

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 120 * zoom, center: center }}
            height={500}
            className="w-full h-full"
          >
            <Geographies geography={geoUrl}>
              {/* 👇 FIXED: Added type definition here */}
              {({ geographies }: { geographies: any[] }) =>
                geographies
                  .filter((geo: any) => geo.properties.name !== "Antarctica")
                  .map((geo: any) => {
                    const countryName = geo.properties.name;
                    const fillColor = getCountryColor(countryName);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        stroke="#ffffff"
                        strokeWidth={0.5}
                        // 👇 FIXED: Added React.MouseEvent types here
                        onMouseEnter={(e: React.MouseEvent) => {
                          setHoveredCountry(countryName);
                          setTooltipPos({ x: e.clientX, y: e.clientY });
                        }}
                        onMouseMove={(e: React.MouseEvent) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => setHoveredCountry(null)}
                        style={{
                          default: { outline: "none", transition: "all 0.2s" },
                          hover: { fill: "#F59E0B", outline: "none", opacity: 0.9 },
                          pressed: { outline: "none" }
                        }}
                      />
                    );
                  })
              }
            </Geographies>
          </ComposableMap>

          {hoveredCountry && (
            <div
              className="fixed pointer-events-none z-50 bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs"
              style={{ left: tooltipPos.x + 10, top: tooltipPos.y + 10 }}
            >
              <div className="font-bold">{hoveredCountry}</div>
              {processedData.find(d => d.nationality === hoveredCountry) && (
                <div className="text-blue-200 mt-1">
                  {processedData.find(d => d.nationality === hoveredCountry)?.booking_count} courses
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: LIST */}
        <div className="lg:col-span-2 flex flex-col h-full">
           <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                 {selectedRegion === "All" ? "All Countries" : selectedRegion} ({filteredData.length})
              </span>
              
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                >
                   <ChevronLeft className="w-4 h-4 text-gray-600"/>
                </button>
                <span className="text-xs text-gray-500 font-medium">
                   {currentPage + 1} / {totalPages || 1}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                >
                   <ChevronRight className="w-4 h-4 text-gray-600"/>
                </button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                   <FileQuestion className="w-10 h-10 mb-2 opacity-50"/>
                   <p className="text-sm">No data for {selectedRegion}</p>
                </div>
              ) : (
                currentCountries.map((country) => (
                  <div key={country.nationality} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors group">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                           {getFlagSvgUrl(country.nationality) ? (
                             <img src={getFlagSvgUrl(country.nationality)} alt="flag" className="w-full h-full object-cover"/>
                           ) : (
                             <span className="text-xs">🌍</span>
                           )}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                           <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-800 truncate">{country.nationality}</span>
                              <span className="text-sm font-bold text-blue-600">{country.booking_count}</span>
                           </div>
                        </div>
                     </div>

                     <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-blue-500 rounded-full group-hover:bg-blue-600 transition-all duration-500"
                           style={{ width: `${country.percentage}%` }}
                        />
                     </div>
                     <div className="text-right mt-1">
                        <span className="text-[10px] text-gray-400 font-medium">{country.percentage}%</span>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

      </div>
    </div>
  );
}