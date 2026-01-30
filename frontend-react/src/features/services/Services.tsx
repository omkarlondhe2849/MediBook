import React, { useEffect, useState } from 'react';
import { api } from '../../shared/api/client';
import PatientLayout from '../../shared/components/PatientLayout';
import ServiceCard from '../../shared/components/ServiceCard';

interface DoctorProfile {
  id: number;
  doctorName: string;
  specialization: string;
  clinicCity: string;
  consultationFee: number;
}

const Services: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');



  const fetchDoctors = async (query = '') => {
    setLoading(true);
    try {
      // Search or get all
      let url = '/doctors';
      if (query) {
        url = `/doctors/search?name=${query}`;
      }

      const response: any = await api.get(url);

      if (query && response.doctors) {
        setDoctors(response.doctors || []);
      } else if (Array.isArray(response)) {
        setDoctors(response);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error("Failed to fetch doctors", error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearchTerm = doctor.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.clinicCity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || doctor.specialization === selectedCategory;
    return matchesSearchTerm && matchesCategory;
  });

  return (
    <PatientLayout activePage="find-doctors" hideSidebar={true}>
      <div className="max-w-7xl mx-auto">
        {/* Search */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Find a Specialist</h1>
          <p className="text-slate-500 mb-6">Search for top doctors and health experts near you.</p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-400 text-lg">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Seach by doctor name (e.g. Dr. Smith)"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-full md:w-64 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-400 text-lg">🏥</span>
              </div>
              <select
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm appearance-none cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Specializations</option>
                {[...new Set(doctors.map(s => s.specialization).filter(Boolean))].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filteredDoctors.map(doctor => (
              <ServiceCard key={doctor.id} service={doctor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="text-5xl mb-4 grayscale opacity-30">👨‍⚕️</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No doctors found</h3>
            <p className="text-slate-500">Try adjusting your search criteria</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="mt-4 text-emerald-600 font-bold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </PatientLayout >
  );
};

export default Services;
