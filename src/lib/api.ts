import axios from 'axios';

// 1. Export API_BASE so we can use it for the Export Button in page.tsx
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL as string;

export const fetchAnalytics = async (startDate: string, endDate: string) => {
  const params = { startDate, endDate };
  
  try {
    const [
        stats, trend, topStudents, popularCourses, geo, 
        engagement, domains, activity, recent, courseGrowth
    ] = await Promise.all([
      // Standard Metrics
      axios.get(`${API_BASE}/stats`, { params }),
      axios.get(`${API_BASE}/trend`, { params }),
      axios.get(`${API_BASE}/top-students`, { params }),
      axios.get(`${API_BASE}/popular-courses`, { params }),
      axios.get(`${API_BASE}/geo`, { params }),
      
      // Advanced Metrics
      axios.get(`${API_BASE}/engagement`, { params }),
      axios.get(`${API_BASE}/domains`, { params }),
      axios.get(`${API_BASE}/activity-hours`, { params }),
      axios.get(`${API_BASE}/recent`, { params }),
      axios.get(`${API_BASE}/course-growth`, { params }),
    ]);

    return {
      stats: stats.data,
      trend: trend.data,
      topStudents: topStudents.data,
      popularCourses: popularCourses.data,
      geo: geo.data,
      engagement: engagement.data,
      domains: domains.data,
      activity: activity.data,
      recent: recent.data,
      courseGrowth: courseGrowth.data
    };
  } catch (error) {
    console.error("Failed to fetch data", error);
    return null;
  }
};


export const fetchCourseDetail = async (startDate: string, endDate: string, courseName: string) => {
  try {
    const response = await axios.get(`${API_BASE}/course-detail`, { 
      params: { startDate, endDate, courseName } 
    });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createCertificate = async (data: any) => {
  try {
    const response = await axios.post(`${API_BASE}/add`, data);
    return response.data;
  } catch (error) {
    console.error("Create API Error", error);
    return null;
  }
};

// Ensure searchStudent is exported (we updated the backend logic for it, frontend call stays same)
export const searchStudent = async (query: string) => {
  try {
    const response = await axios.get(`${API_BASE}/search`, { params: { query } });
    return response.data;
  } catch (error) {
    return [];
  }
};

export const fetchKpiDetails = async (type: string, startDate: string, endDate: string) => {
  try {
    const response = await axios.get(`${API_BASE}/kpi-details`, { 
      params: { type, startDate, endDate } 
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch KPI details", error);
    return [];
  }
};
export const fetchCourseStudents = async (startDate: string, endDate: string, courseName: string) => {
  try {
    const response = await axios.get(`${API_BASE}/course-students`, { 
      params: { startDate, endDate, courseName } 
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch course students", error);
    return [];
  }
};

export const fetchAllCertificates = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await axios.get(`${API_BASE}/all-certificates`, {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    console.error("API Error", error);
    return { data: [], pagination: { total: 0, totalPages: 0 } };
  }
};