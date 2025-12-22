"use client"
import React, { useState, useEffect } from "react"
import { 
  Terminal, Database, Gift, Zap, Save, Menu, X, RotateCcw, 
  CheckCircle, AlertOctagon 
} from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"
import { STUDENT_LIST } from "@/lib/data"
// Assuming these components exist in your project
import { Snowfall } from "@/components/snowfall"
import { ChristmasLights } from "@/components/christmas-lights"

const AdminDashboard = () => {
  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('users'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Config State
  const [revealTime, setRevealTime] = useState('');
  const [configLoading, setConfigLoading] = useState(false);

  // Data State
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Raw Data Editor State
  const [jsonInput, setJsonInput] = useState(JSON.stringify(STUDENT_LIST, null, 2));

  // 🔔 TOAST STATE (Replaces Alert)
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  // --- HELPERS ---

  // Custom Toast Function
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    // Auto hide after 3 seconds
    setTimeout(() => setToast(null), 3000);
  };

  const callAdminApi = async (endpoint: string, method = 'POST', body: any = null) => {
    setActionLoading(true);
    const token = passwordInput || sessionStorage.getItem('admin_token') || "";
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': token },
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      return data;
    } catch (error: any) {
      showToast(`SYSTEM ERROR: ${error.message}`, 'error');
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/verify-admin', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': passwordInput }
      });
      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_token', passwordInput);
        fetchUsers(); 
        fetchConfig();
        showToast("ACCESS GRANTED. WELCOME SANTA.", "success");
      } else {
        showToast("ACCESS DENIED: INVALID PROTOCOL", "error");
      }
    } catch (error) {
      showToast("CONNECTION ERROR", "error");
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = sessionStorage.getItem('admin_token');
    if(savedToken) {
        setPasswordInput(savedToken);
        setIsAuthenticated(true);
    }
  }, []);

  const fetchConfig = async () => {
     const res = await callAdminApi('/api/admin/reveal', 'GET');
     if(res && res.revealDate) setRevealTime(res.revealDate);
  };

  const updateRevealDate = async () => {
      setConfigLoading(true);
      const res = await callAdminApi('/api/admin/reveal', 'POST', { revealDate: revealTime });
      if (res) showToast("TIMELINE UPDATED SUCCESSFULLY", "success");
      setConfigLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (error) {
      console.error(error);
      showToast("FAILED TO SYNC OPERATIVE DATA", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) { fetchUsers(); fetchConfig(); }
  }, [isAuthenticated]);


  // --- TRIGGER BUTTONS ---
  const triggerMatch = async () => {
    if(!confirm("⚠️ EXECUTE MATCHING ALGORITHM?")) return;
    const result = await callAdminApi('/api/admin/match'); 
    if (result) { 
        showToast(`ALGORITHM COMPLETE: ${result.message}`, "success"); 
        fetchUsers(); 
    }
  };

  const triggerEmail = async () => {
    if(!confirm("⚠️ INITIATE EMAIL PROTOCOL?")) return;
    const result = await callAdminApi('/api/admin/email'); 
    if (result) showToast(`SENT: ${result.stats.sent} | FAILED: ${result.stats.failed}`, "success");
  };

  const triggerSeeding = async () => {
    try {
        const parsedData = JSON.parse(jsonInput);
        
        if (!Array.isArray(parsedData)) {
            showToast("ERROR: Data must be an array []", "error");
            return;
        }

        if(!confirm(`⚠️ OVERWRITE DATABASE WITH ${parsedData.length} ENTRIES FROM EDITOR?`)) return;
        
        const result = await callAdminApi('/api/admin/seed', 'POST', { data: parsedData });
        
        if (result) { 
            showToast("DATABASE RESET COMPLETE", "success"); 
            fetchUsers(); 
        }

    } catch (e) {
        showToast("INVALID JSON SYNTAX", "error");
    }
  };

  const resetJson = () => {
      if(confirm("Reset editor to original file data?")) {
          setJsonInput(JSON.stringify(STUDENT_LIST, null, 2));
          showToast("EDITOR RESET", "success");
      }
  }

  // --- RENDER ---

  // 🔔 CUSTOM TOAST COMPONENT
  const ToastNotification = () => (
    <div 
        className={`
            fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] 
            flex items-center gap-3 px-6 py-4 rounded-lg border 
            bg-[#0a0f1c] shadow-[0_0_20px_rgba(0,0,0,0.5)] 
            transition-all duration-500 ease-in-out transform
            ${toast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}
            ${toast?.type === 'error' ? 'border-red-500 text-red-500 shadow-red-900/20' : 'border-green-500 text-green-500 shadow-green-900/20'}
        `}
    >
       {toast?.type === 'error' ? <AlertOctagon size={20}/> : <CheckCircle size={20}/>}
       <span className="font-mono font-bold tracking-widest text-xs md:text-sm uppercase">
          {toast?.msg}
       </span>
    </div>
  );
  
  // Login Screen
  if (!isAuthenticated) return (
      <>
        <Snowfall />
        <ChristmasLights />
        <ToastNotification /> {/* Add Toast Here */}
        <div className="min-h-screen bg-[#050A10] flex items-center justify-center p-4 font-mono relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          <div className="w-full max-w-md border border-red-900/50 bg-[#0a0f1c] p-8 shadow-[0_0_30px_rgba(220,38,38,0.2)] relative z-10">
            <div className="flex justify-center mb-6 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 animate-santa-wobble">
                <Gift className="w-16 h-16 text-red-600 animate-pulse" />
              </div>
            </div>
            <h1 className="text-2xl text-red-500 font-bold text-center mb-2 tracking-widest mt-16">ADMIN ACCESS</h1>
            <p className="text-xs text-gray-500 text-center mb-6 font-mono">Secret Santa Dashboard</p>
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-[#050a10] border border-red-900/50 text-red-500 p-3 text-center focus:outline-none focus:border-red-500" placeholder="Enter Admin Password" />
              <button type="submit" disabled={loginLoading} className="w-full bg-red-900/20 hover:bg-red-900/40 border border-red-800 text-red-500 py-3 font-bold tracking-widest">{loginLoading ? "VERIFYING..." : "UNLOCK DASHBOARD"}</button>
            </form>
          </div>
        </div>
      </>
  );

  return (
    <>
      <Snowfall />
      <ChristmasLights />
      <ToastNotification /> {/* Add Toast Here */}
      
      <div className="min-h-screen bg-[#050A10] text-gray-300 font-mono flex flex-col md:flex-row relative">
       
       {/* Mobile Header */}
       <div className="md:hidden flex justify-between items-center p-4 border-b border-gray-800 bg-[#0a0f1c] sticky top-0 z-50">
          <span className="text-red-500 font-bold tracking-widest flex items-center gap-2 text-sm"><Gift size={16}/> SECRET SANTA ADMIN</span>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            {isMobileMenuOpen ? <X className="text-red-500" size={24}/> : <Menu className="text-red-500" size={24}/>}
          </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0f1c] border-r border-gray-800 p-6 
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:relative md:translate-x-0 md:block
      `}>
        <div className="hidden md:flex items-center gap-2 text-red-500 font-bold tracking-widest mb-12"><Gift size={20}/> ADMIN_CONSOLE</div>
        <nav className="space-y-4">
          <button onClick={() => {setActiveTab('users'); setIsMobileMenuOpen(false)}} className={`w-full text-left p-3 border-l-2 transition-all ${activeTab === 'users' ? 'border-red-500 bg-red-900/10 text-white' : 'border-transparent text-gray-500 hover:text-red-400'}`}>01. STUDENTS</button>
          <button onClick={() => {setActiveTab('controls'); setIsMobileMenuOpen(false)}} className={`w-full text-left p-3 border-l-2 transition-all ${activeTab === 'controls' ? 'border-red-500 bg-red-900/10 text-white' : 'border-transparent text-gray-500 hover:text-red-400'}`}>02. CONTROLS</button>
          <button onClick={() => {setActiveTab('data'); setIsMobileMenuOpen(false)}} className={`w-full text-left p-3 border-l-2 transition-all ${activeTab === 'data' ? 'border-red-500 bg-red-900/10 text-white' : 'border-transparent text-gray-500 hover:text-red-400'}`}>03. RAW_EDITOR</button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4 pb-20 md:pb-0">
             <div className="flex justify-between items-end border-b border-gray-800 pb-4 sticky top-0 bg-[#050A10] z-10 pt-2">
                <h2 className="text-lg md:text-xl text-white tracking-widest"><span className="text-red-500">01.</span> OPERATIVE_LIST <span className="text-xs text-gray-500">[{users.length}]</span></h2>
                <button onClick={fetchUsers} className="text-xs border border-gray-700 px-3 py-1 hover:bg-gray-800 text-gray-400">REFRESH</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((u) => (
                    <div key={u.id} className="bg-[#0a0f1c] border border-gray-800 p-4 relative group hover:border-red-900/50 transition-colors">
                        <div className="absolute top-2 right-2 flex gap-1"><div className={`w-2 h-2 rounded-full ${u.isRegistered ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-yellow-600'}`}></div></div>
                        <h3 className="text-red-500 font-bold truncate pr-4">{u.name}</h3>
                        <p className="text-xs text-gray-500 mb-3 truncate">{u.email}</p>
                        <div className="flex items-center justify-between text-xs mt-4 pt-4 border-t border-gray-800/50">
                            <span className={u.targetToken ? "text-green-500" : "text-gray-600"}>{u.targetToken ? "MATCHED" : "UNASSIGNED"}</span>
                        </div>
                    </div>
                ))}
            </div>
            {users.length === 0 && !loading && <div className="text-center text-gray-600 text-sm mt-10">No operatives found.</div>}
          </div>
        )}

        {/* CONTROLS TAB */}
        {activeTab === 'controls' && (
          <div className="max-w-4xl mx-auto space-y-8 pb-20 md:pb-0">
             <div className="border-b border-gray-800 pb-4">
                <h2 className="text-lg md:text-xl text-white tracking-widest"><span className="text-red-500">02.</span> SYSTEM_CONTROLS</h2>
            </div>

            {/* Config & Match & Email Buttons */}
            <div className="bg-[#0a0f1c] border border-red-900/30 p-4 md:p-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs text-red-500 mb-2 block">GLOBAL_REVEAL_TIMESTAMP</label>
                        <input type="datetime-local" value={revealTime} onChange={(e) => setRevealTime(e.target.value)} className="w-full bg-[#050a10] border border-gray-700 text-gray-300 p-3 focus:border-red-500 outline-none font-mono text-sm"/>
                    </div>
                    <button onClick={updateRevealDate} className="w-full md:w-auto bg-red-900/20 border border-red-800 text-red-500 px-6 py-3 font-bold flex justify-center items-center">
                        {configLoading ? "..." : <><Save size={16} className="mr-2 md:hidden"/> SAVE</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0a0f1c] border border-gray-800 p-6">
                    <h3 className="font-bold text-white mb-2 flex gap-2 items-center"><Zap size={16} className="text-yellow-500"/> MATCH_ALGO</h3>
                    <button onClick={triggerMatch} disabled={actionLoading} className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 text-xs font-bold tracking-widest border border-gray-700 mt-4 active:scale-95 transition-transform">EXECUTE</button>
                </div>
                <div className="bg-[#0a0f1c] border border-gray-800 p-6">
                    <h3 className="font-bold text-white mb-2 flex gap-2 items-center"><Terminal size={16} className="text-green-500"/> DISPATCH_PROTOCOL</h3>
                    <button onClick={triggerEmail} disabled={actionLoading} className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 text-xs font-bold tracking-widest border border-gray-700 mt-4 active:scale-95 transition-transform">TRANSMIT</button>
                </div>
            </div>

            <div className="p-4 border border-orange-900/30 bg-orange-900/10 text-orange-500 text-xs text-center md:text-left">
                NOTE: Use "RAW_EDITOR" tab to modify data before seeding.
            </div>
          </div>
        )}

        {/* 🆕 DATA EDITOR TAB */}
        {activeTab === 'data' && (
           <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col pb-6 md:pb-0">
             <div className="border-b border-gray-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-lg md:text-xl text-white tracking-widest"><span className="text-red-500">03.</span> SOURCE_MANIFEST</h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={resetJson} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs border border-gray-700 px-3 py-3 md:py-2 hover:bg-gray-800 text-gray-400">
                        <RotateCcw size={14}/> RESET
                    </button>
                    <button 
                        onClick={triggerSeeding}
                        disabled={actionLoading}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs bg-red-900/20 border border-red-800 text-red-500 px-4 py-3 md:py-2 hover:bg-red-900/30 font-bold tracking-widest"
                    >
                        <Database size={14}/> {actionLoading ? "WRITING..." : "SEED DB"}
                    </button>
                </div>
            </div>
             
             <div className="flex-1 bg-[#0a0f1c] border border-gray-800 p-1 relative">
               <textarea 
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-full bg-[#050a10] text-green-500/90 font-mono text-sm md:text-xs p-4 focus:outline-none resize-none"
                  spellCheck="false"
               />
               <div className="absolute bottom-4 right-6 text-[10px] text-gray-600 pointer-events-none bg-[#0a0f1c]/80 px-2 rounded">
                  JSON_MODE
               </div>
             </div>
           </div>
        )}
      </main>
    </div>
    </>
  );
};

export default AdminDashboard;