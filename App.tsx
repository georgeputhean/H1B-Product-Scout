import React, { useState, useEffect } from 'react';
import { Company, ResearchState, SERIES_LABELS, SeriesCategory } from './types';
import { fetchCompaniesForSeries } from './services/geminiService';
import { CompanyTable } from './components/CompanyTable';
import { Download, Search, Loader2, Database, AlertCircle, MapPin, Filter, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState(process.env.API_KEY || '');
  const [activeTab, setActiveTab] = useState<SeriesCategory>('seriesC');
  const [regionalOnly, setRegionalOnly] = useState(false);
  const [state, setState] = useState<ResearchState>({
    seriesC: [],
    seriesD: [],
    seriesE: [],
    lateStage: [],
    isSearching: false,
    currentStage: '',
    error: null,
  });

  const REGIONAL_STATES = ['NY', 'NEW YORK', 'PA', 'PENNSYLVANIA', 'NJ', 'NEW JERSEY', 'DE', 'DELAWARE'];

  const filterRegional = (companies: Company[]) => {
    if (!regionalOnly) return companies;
    return companies.filter(company => 
      REGIONAL_STATES.some(state => 
        company.location.toUpperCase().includes(state)
      )
    );
  };

  const getActiveData = () => {
    return filterRegional(state[activeTab]);
  };

  const getTotalCount = () => {
    const all = [...state.seriesC, ...state.seriesD, ...state.seriesE, ...state.lateStage];
    return filterRegional(all).length;
  };

  const handleResearch = async () => {
    if (!apiKey) {
      alert("API Key is missing. Please check your configuration.");
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isSearching: true, 
      error: null, 
      currentStage: 'Initiating deep-scan...',
      seriesC: [], seriesD: [], seriesE: [], lateStage: []
    }));

    const categories: SeriesCategory[] = ['seriesC', 'seriesD', 'seriesE', 'lateStage'];
    
    for (const category of categories) {
      setState(prev => ({ ...prev, currentStage: `Scanning for 50+ ${SERIES_LABELS[category]} roles...` }));
      
      try {
        const results = await fetchCompaniesForSeries(SERIES_LABELS[category], apiKey, regionalOnly);
        setState(prev => ({
          ...prev,
          [category]: results,
        }));
      } catch (err) {
        console.error(`Failed to fetch ${category}`, err);
        setState(prev => ({ ...prev, error: `Partial data failure for ${SERIES_LABELS[category]}. Results might be limited.` }));
      }
    }

    setState(prev => ({ ...prev, isSearching: false, currentStage: 'Deep Research Complete!' }));
  };

  const handleExportCSV = () => {
    const allData = [
      ...state.seriesC.map(c => ({...c, tab_category: 'Series C'})),
      ...state.seriesD.map(c => ({...c, tab_category: 'Series D'})),
      ...state.seriesE.map(c => ({...c, tab_category: 'Series E'})),
      ...state.lateStage.map(c => ({...c, tab_category: 'Late Stage'}))
    ];

    const filteredData = regionalOnly ? allData.filter(c => 
      REGIONAL_STATES.some(s => c.location.toUpperCase().includes(s))
    ) : allData;

    if (filteredData.length === 0) return;

    const headers = ['Company Name', 'Series Category', 'Specific Series', 'Industry', 'Role Location', 'H1B Likelihood', 'Roles', 'Website', 'Reasoning'];
    const csvRows = [headers.join(',')];

    for (const row of filteredData) {
      const values = [
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.tab_category}"`,
        `"${row.series.replace(/"/g, '""')}"`,
        `"${row.industry.replace(/"/g, '""')}"`,
        `"${row.location.replace(/"/g, '""')}"`,
        `"${row.h1b_likelihood}"`,
        `"${row.roles.join('; ').replace(/"/g, '""')}"`,
        `"${row.website}"`,
        `"${row.reasoning.replace(/"/g, '""')}"`,
      ];
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `h1b_product_roles_deep_research_${regionalOnly ? 'regional' : 'global'}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600 leading-tight">
                H1B Product Scout
              </h1>
              <div className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">High-Volume Deep Research</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {state.isSearching && (
                <div className="flex items-center text-sm text-blue-600 font-semibold animate-pulse">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {state.currentStage}
                </div>
             )}
             
             <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
               <button
                 onClick={() => setRegionalOnly(!regionalOnly)}
                 className={`flex items-center px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                   regionalOnly 
                   ? 'bg-blue-600 text-white shadow-sm' 
                   : 'text-slate-600 hover:bg-slate-200'
                 }`}
               >
                 <MapPin className="w-3.5 h-3.5 mr-1.5" />
                 NY, PA, NJ, DE Roles
               </button>
             </div>

             <button
              onClick={handleResearch}
              disabled={state.isSearching}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                state.isSearching 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md active:scale-95'
              }`}
             >
               {state.isSearching ? 'Deep Scouting...' : 'Start Deep Research'}
               {!state.isSearching && <Search className="w-4 h-4 ml-2" />}
             </button>

             <button 
              onClick={handleExportCSV}
              disabled={getTotalCount() === 0 || state.isSearching}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium border transition-all ${
                getTotalCount() === 0 || state.isSearching
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50 bg-white hover:border-slate-400'
              }`}
             >
               Export CSV
               <Download className="w-4 h-4 ml-2" />
             </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full h-[calc(100vh-64px)] overflow-hidden">
        
        {getTotalCount() === 0 && !state.isSearching && (
          <div className="flex flex-col items-center justify-center flex-grow text-center max-w-2xl mx-auto">
             <div className="bg-white p-6 rounded-3xl shadow-xl mb-8 border border-slate-100 ring-8 ring-slate-100/50">
               <div className="bg-blue-50 p-4 rounded-2xl">
                 <BarChart3 className="w-10 h-10 text-blue-600" />
               </div>
             </div>
             <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">High-Volume H1B Scouting</h2>
             <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
               Aggregating 50+ companies per funding series. Targeting Series C, D, E, and Late Stage 
               startups with active product teams.
               {regionalOnly && (
                 <span className="block mt-2 text-blue-600"> Scanning strictly for roles based in the NY/PA/NJ/DE area.</span>
               )}
             </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left w-full">
               <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all hover:shadow-md">
                 <div className="flex items-center mb-2">
                   <div className="bg-blue-100 p-1.5 rounded-lg mr-3">
                     <MapPin className="w-4 h-4 text-blue-600" />
                   </div>
                   <div className="font-bold text-slate-800">Regional Precision</div>
                 </div>
                 <p className="text-sm text-slate-500">Identifies roles physically based in the Tri-State and Delaware region.</p>
               </div>
               <div className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all hover:shadow-md">
                 <div className="flex items-center mb-2">
                   <div className="bg-green-100 p-1.5 rounded-lg mr-3">
                     <Database className="w-4 h-4 text-green-600" />
                   </div>
                   <div className="font-bold text-slate-800">50+ Results Per Category</div>
                 </div>
                 <p className="text-sm text-slate-500">Exhaustive search across late-stage startups to maximize your outreach list.</p>
               </div>
             </div>
          </div>
        )}

        {(getTotalCount() > 0 || state.isSearching) && (
          <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-1 bg-slate-200/60 p-1 rounded-xl w-fit">
                {(Object.keys(SERIES_LABELS) as SeriesCategory[]).map((key) => {
                  const categoryCount = filterRegional(state[key]).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                        activeTab === key
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      {SERIES_LABELS[key]}
                      {categoryCount > 0 && (
                        <span className={`ml-2 py-0.5 px-2.5 rounded-full text-[10px] ${activeTab === key ? 'bg-blue-100 text-blue-800' : 'bg-slate-300 text-slate-700'}`}>
                          {categoryCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex items-center gap-3">
                {regionalOnly && (
                  <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1.5" />
                    Target Area: NY/PA/NJ/DE
                  </div>
                )}
                <div className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-sm">
                  Total Found: {getTotalCount()}
                </div>
              </div>
            </div>

            {state.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center shadow-sm">
                <AlertCircle className="w-5 h-5 mr-2" />
                {state.error}
              </div>
            )}

            <div className="flex-grow overflow-hidden relative">
              {state.isSearching && getActiveData().length === 0 ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <Database className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-slate-800 font-bold text-xl mt-6">{state.currentStage}</p>
                    <p className="text-slate-500 text-sm mt-2 max-w-sm text-center">Searching the web for over 200+ companies. This deep scan analyzes role locations and H1B history...</p>
                 </div>
              ) : (
                <div className="h-full">
                  <CompanyTable companies={getActiveData()} title={`${SERIES_LABELS[activeTab]} Deep Research`} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;