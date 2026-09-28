import { useState } from 'react';
import axios from 'axios';
import { Activity, Search, BrainCircuit, Database, ShieldAlert, GitCommit, Network, Zap, Check } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const ConnectionLine = ({ active = true, color = 'text-rose-500', height = 40 }) => (
  <div className="flex justify-center items-center w-full relative" style={{ height }}>
    <svg width="2" height={height} className="overflow-visible">
      <line x1="1" y1="0" x2="1" y2={height} stroke="#1f2937" strokeWidth="1" />
      {active && (
        <line 
          x1="1" y1="0" x2="1" y2={height} 
          stroke="currentColor" 
          className={`${color} animate-signal-flow motion-reduce:hidden`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 12"
        />
      )}
    </svg>
  </div>
);

const SignalConduit = () => (
  <div className="mx-auto my-8 flex justify-center items-center h-40 w-16 relative">
    <svg width="40" height="160" viewBox="0 0 40 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
      <path d="M 15 0 L 15 30 L 5 45 L 5 115 L 15 130 L 15 150" stroke="#3f3f46" strokeWidth="1" strokeOpacity="0.3" fill="none" />
      <path d="M 25 0 L 25 30 L 35 45 L 35 115 L 25 130 L 25 150" stroke="#3f3f46" strokeWidth="1" strokeOpacity="0.3" fill="none" />
      
      <g className="motion-reduce:hidden">
        <path d="M -12 0 L 0 0" stroke="url(#contour-tail)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="0" cy="0" r="1.5" fill="#f43f5e" style={{ filter: 'drop-shadow(0 0 3px rgba(244,63,94,1))' }} />
        <animateMotion 
          dur="10s" 
          repeatCount="indefinite" 
          path="M 15 0 L 25 0 L 25 30 L 35 45 L 35 115 L 25 130 L 25 150 L 15 150 L 15 130 L 5 115 L 5 45 L 15 30 Z" 
          rotate="auto" 
        />
      </g>

      <line x1="20" y1="0" x2="20" y2="155" stroke="#3f3f46" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="20" y1="0" x2="20" y2="155" stroke="#f43f5e" strokeWidth="2" strokeOpacity="0.4" className="animate-system-breathe motion-reduce:hidden" style={{ transformOrigin: 'center' }} />
      <g className="animate-signal-travel motion-reduce:hidden">
        <circle cx="20" cy="0" r="3" fill="#f43f5e" className="shadow-[0_0_15px_rgba(244,63,94,1)]" />
        <line x1="20" y1="-30" x2="20" y2="0" stroke="url(#signal-gradient)" strokeWidth="3" />
      </g>
      <path d="M 15 155 L 20 160 L 25 155" stroke="#3f3f46" strokeWidth="1" fill="none" className="transition-all duration-300" />
      <defs>
        <linearGradient id="signal-gradient" x1="20" y1="-30" x2="20" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="contour-tail" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

function App() {
  const [view, setView] = useState('dashboard');
  const [incidentId, setIncidentId] = useState('');
  const [investigation, setInvestigation] = useState<any>(null);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  
  const [formData, setFormData] = useState({
    service: 'payment-service',
    severity: 'high',
    error: '503 Service Unavailable',
    description: 'Database connection pool exhausted',
    environment: 'production',
    deployment_version: 'v2.5.0'
  });

  const [resolutionData, setResolutionData] = useState({
    actual_root_cause: '',
    action_taken: '',
    outcome: '',
    resolution_time: '',
    lessons_learned: ''
  });

  const createIncident = async () => {
    try {
      const res = await axios.post(`${API_BASE}/incidents`, formData);
      setIncidentId(res.data.incident_id);
      setView('investigate');
      setIsResolved(false);
      setInvestigation(null);
    } catch (e) {
      console.error(e);
      alert('Error creating incident');
    }
  };

  const investigate = async () => {
    if (!incidentId) return;
    setIsInvestigating(true);
    try {
      const res = await axios.post(`${API_BASE}/incidents/${incidentId}/investigate`);
      setInvestigation(res.data);
    } catch (e) {
      console.error(e);
      alert('Error investigating');
    }
    setIsInvestigating(false);
  };

  const resolveIncident = async () => {
    try {
      await axios.post(`${API_BASE}/incidents/${incidentId}/resolve`, resolutionData);
      setIsResolved(true);
      setTimeout(() => {
        setView('dashboard');
        setIncidentId('');
        setInvestigation(null);
        setIsResolved(false);
        setResolutionData({
          actual_root_cause: '',
          action_taken: '',
          outcome: '',
          resolution_time: '',
          lessons_learned: ''
        });
      }, 3000);
    } catch (e) {
      console.error(e);
      alert('Error resolving incident');
    }
  };

  return (
    <div className="min-h-screen bg-system-bg text-slate-300 font-sans selection:bg-rose-500/30 overflow-x-hidden">
      <nav className="border-b border-zinc-900 bg-system-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Network className="text-zinc-500 w-5 h-5" />
            <span className="font-mono text-sm tracking-widest text-zinc-300 uppercase">IncidentMind System</span>
          </div>
          <div className="flex gap-4 text-xs font-mono uppercase tracking-wider">
            <button onClick={() => setView('dashboard')} className={`${view === 'dashboard' ? 'text-rose-400' : 'text-zinc-600 hover:text-zinc-400'} transition-colors flex items-center gap-2`}>
              <Activity className="w-3 h-3" /> System Status
            </button>
            {incidentId && (
              <button onClick={() => setView('investigate')} className={`${view === 'investigate' ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'} transition-colors flex items-center gap-2`}>
                <Search className="w-3 h-3" /> Active Signal
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {view === 'dashboard' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="text-center space-y-4 py-12">
              <h1 className="text-xl font-mono tracking-widest text-zinc-400 uppercase">Operational Intelligence</h1>
              <SignalConduit />
              <p className="text-zinc-500 max-w-xl mx-auto text-sm font-mono leading-relaxed">
                SYSTEM IDLE. AWAITING INCIDENT SIGNAL.
              </p>
            </div>

            <div className="max-w-xl mx-auto bg-system-panel border border-zinc-800 rounded-sm p-6 relative">
              <svg className="absolute -inset-px w-[calc(100%+2px)] h-[calc(100%+2px)] pointer-events-none rounded-sm overflow-visible motion-reduce:hidden z-10" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="100%" height="100%" rx="2" fill="none" stroke="#f43f5e" strokeOpacity="1" strokeWidth="1.5" pathLength="100" strokeDasharray="10 100" style={{ '--start-offset': '0px', filter: 'drop-shadow(0 0 6px rgba(244,63,94,0.8))' } as React.CSSProperties} className="animate-perimeter-scan" />
              </svg>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-sm font-mono tracking-wider text-zinc-300 flex items-center gap-2 uppercase">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  New Incident Intake
                </h2>
                <button onClick={async () => {
                  try {
                    await axios.post(`${API_BASE}/demo/seed`);
                    alert('Demo memories seeded to Hindsight!');
                  } catch(e) {
                    console.error(e);
                    alert('Error seeding demo data');
                  }
                }} className="text-zinc-500 hover:text-zinc-300 text-xs font-mono uppercase tracking-widest transition-colors">
                  [ Seed Memory ]
                </button>
              </div>
              
              <div className="space-y-5 font-mono text-sm">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-zinc-500 mb-1 text-xs uppercase tracking-wider">Target Service</label>
                    <input value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-sm px-3 py-2 text-zinc-300 focus:border-rose-500/50 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 text-xs uppercase tracking-wider">Environment</label>
                    <input value={formData.environment} onChange={e => setFormData({...formData, environment: e.target.value})} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-sm px-3 py-2 text-zinc-300 focus:border-rose-500/50 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-500 mb-1 text-xs uppercase tracking-wider">Error Signal</label>
                  <input value={formData.error} onChange={e => setFormData({...formData, error: e.target.value})} className="w-full bg-rose-500/5 border border-rose-500/30 rounded-sm px-3 py-2 text-rose-400 focus:border-rose-500/60 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-zinc-500 mb-1 text-xs uppercase tracking-wider">System Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-sm px-3 py-2 text-zinc-300 focus:border-rose-500/50 outline-none transition-all h-20 resize-none" />
                </div>
                
                <div className="pt-4">
                  <button onClick={createIncident} className="w-full bg-zinc-900/80 hover:bg-rose-500/10 text-zinc-300 hover:text-rose-400 border border-zinc-700 hover:border-rose-500/50 py-3 rounded-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2">
                    <Activity className="w-4 h-4" />
                    Transmit Signal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'investigate' && (
          <div className="max-w-2xl mx-auto space-y-0 pb-20 animate-in fade-in duration-1000 flex flex-col items-center">
            
            {/* 1. INCIDENT */}
            <div className="w-full bg-system-panel border border-rose-500/30 rounded-sm p-5 shadow-[0_0_15px_rgba(244,63,94,0.05)] relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <h2 className="text-rose-500 font-mono text-sm tracking-widest uppercase">Active Incident Signal</h2>
                <span className="ml-auto text-[10px] text-rose-500/50 font-mono">ID: {incidentId}</span>
              </div>
              <div className="font-mono text-sm text-zinc-300 bg-zinc-950/50 border border-rose-500/10 p-3 rounded-sm">
                <p><span className="text-zinc-500">SVC:</span> {formData.service}</p>
                <p><span className="text-zinc-500">ERR:</span> <span className="text-rose-400">{formData.error}</span></p>
              </div>
            </div>

            <ConnectionLine active={true} color="text-rose-500" height={40} />

            {/* 2. HINDSIGHT RECALL / MEMORY INFLUENCE */}
            <div className="w-full bg-system-panel border border-amber-500/20 rounded-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-amber-500 font-mono text-sm tracking-widest uppercase flex items-center gap-2">
                  <Database className="w-4 h-4" /> Hindsight Memory
                </h2>
                {!investigation && (
                  <button onClick={investigate} disabled={isInvestigating} className="text-[10px] bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-sm tracking-wider uppercase transition-colors">
                    {isInvestigating ? 'Querying...' : 'Initiate Recall'}
                  </button>
                )}
                {investigation && (
                  <span className="text-[10px] text-amber-500/70 font-mono uppercase border border-amber-500/20 px-2 py-0.5 rounded-sm bg-amber-500/5">
                    {investigation.historical_evidence.length} Memories Found
                  </span>
                )}
              </div>
              
              {investigation && investigation.historical_evidence.length > 0 && (
                <div className="space-y-3 mt-4 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-amber-500/20">
                  {investigation.historical_evidence.map((mem: any, i: number) => {
                    const isDirect = mem.category === 'DIRECT_MATCH';
                    const isOrg = mem.category === 'ORGANIZATIONAL_PATTERN';
                    const colorClass = isDirect ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' : 
                                       isOrg ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                                       'text-[#b45309] border-[#b45309]/30 bg-[#b45309]/5'; // Copper/Muted Brown for historical
                    
                    const dotClass = isDirect ? 'bg-rose-500' : isOrg ? 'bg-emerald-500' : 'bg-[#b45309]';
                    
                    return (
                      <div key={i} className={`relative pl-8`}>
                        <div className={`absolute left-[-1.5px] top-4 w-6 h-px bg-zinc-800`}></div>
                        <div className={`absolute left-[-3px] top-3.5 w-1.5 h-1.5 rounded-full ${dotClass}`}></div>
                        <div className={`border rounded-sm p-3 text-sm font-mono ${colorClass}`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] tracking-wider uppercase opacity-80">{mem.category.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] opacity-50">{mem.id}</span>
                          </div>
                          <p className="opacity-90">{mem.content}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {investigation && (
              <>
                <ConnectionLine active={true} color="text-amber-500" height={50} />

                {/* 3. AI ANALYSIS */}
                <div className="w-full bg-system-panel border border-indigo-500/20 rounded-sm p-5">
                  <h2 className="text-indigo-400 font-mono text-sm tracking-widest uppercase flex items-center gap-2 mb-4">
                    <BrainCircuit className="w-4 h-4" /> Pattern Analysis
                  </h2>
                  <div className="space-y-4 font-mono text-sm">
                    <div>
                      <span className="text-zinc-500 text-[10px] tracking-wider uppercase block mb-1">Identified Root Cause</span>
                      <p className="text-zinc-200">{investigation.likely_root_cause}</p>
                    </div>
                    <div className="bg-zinc-950/50 border border-zinc-800/80 p-3 rounded-sm">
                      <span className="text-indigo-500/50 text-[10px] tracking-wider uppercase block mb-1">Reasoning</span>
                      <p className="text-zinc-400 text-xs leading-relaxed">{investigation.reasoning}</p>
                    </div>
                  </div>
                </div>

                <ConnectionLine active={true} color="text-indigo-500" height={40} />

                {/* 4. RECOMMENDATION & STEPS */}
                <div className="w-full bg-system-panel border border-zinc-800 rounded-sm p-5">
                  <h2 className="text-zinc-300 font-mono text-sm tracking-widest uppercase flex items-center gap-2 mb-4">
                    <GitCommit className="w-4 h-4 text-zinc-500" /> Action Protocol
                  </h2>
                  <div className="space-y-4 font-mono text-sm">
                    <div className="border-l-2 border-rose-500/50 pl-3">
                      <span className="text-rose-400 text-[10px] tracking-wider uppercase block mb-1">Recommended Action</span>
                      <p className="text-zinc-200">{investigation.recommended_action}</p>
                    </div>
                    <div className="border-l-2 border-zinc-700 pl-3">
                      <span className="text-zinc-500 text-[10px] tracking-wider uppercase block mb-1">Investigation Steps</span>
                      <p className="text-zinc-400 text-xs">{investigation.recommended_investigation}</p>
                    </div>
                  </div>
                </div>

                <ConnectionLine active={true} color="text-zinc-500" height={40} />

                {/* 5. RESOLUTION */}
                <div className={`w-full border rounded-sm p-5 transition-all duration-500 ${isResolved ? 'bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'bg-system-panel border-zinc-800'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className={`${isResolved ? 'text-emerald-400' : 'text-zinc-400'} font-mono text-sm tracking-widest uppercase flex items-center gap-2 transition-colors`}>
                      {isResolved ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      Resolution Learning
                    </h2>
                    {isResolved && <span className="text-emerald-400 text-[10px] font-mono uppercase tracking-widest animate-pulse">Memory Retained</span>}
                  </div>
                  
                  {!isResolved ? (
                    <div className="space-y-4 font-mono text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-500 mb-1 text-[10px] uppercase tracking-wider">Actual Root Cause</label>
                          <input value={resolutionData.actual_root_cause} onChange={e => setResolutionData({...resolutionData, actual_root_cause: e.target.value})} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-sm px-3 py-2 text-zinc-300 focus:border-emerald-500/50 outline-none transition-colors" />
                        </div>
                        <div>
                          <label className="block text-zinc-500 mb-1 text-[10px] uppercase tracking-wider">Action Taken</label>
                          <input value={resolutionData.action_taken} onChange={e => setResolutionData({...resolutionData, action_taken: e.target.value})} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-sm px-3 py-2 text-zinc-300 focus:border-emerald-500/50 outline-none transition-colors" />
                        </div>
                      </div>
                      <button onClick={resolveIncident} className="w-full mt-2 bg-zinc-900/80 hover:bg-emerald-500/10 text-emerald-500 border border-zinc-800 hover:border-emerald-500/50 py-2.5 rounded-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 text-xs">
                        Retain Experience
                      </button>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-emerald-500/80 font-mono text-sm">System successfully updated with new operational intelligence.</p>
                      <p className="text-emerald-500/50 font-mono text-[10px] mt-2 uppercase tracking-widest">Returning to idle state...</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
