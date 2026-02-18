import { React, useState, useEffect, useMemo, useRef, useCallback, html } from './lib/deps.js';
import { DataManager, STATE_DATABASE, computeProfileProgress, formatTime12h } from './lib/utils.js';

// --- Toast System ---
const ToastContext = React.createContext();
const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const addToast = (msg, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };
    return html`
        <${ToastContext.Provider} value=${addToast}>
            ${children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                ${toasts.map(t => html`
                    <div key=${t.id} className="pointer-events-auto px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-white font-medium animate-fade-in ${t.type === 'error' ? 'bg-red-600' : 'bg-green-600'}">
                        ${t.msg}
                    </div>
                `)}
            </div>
        <//>
    `;
};
const useToast = () => React.useContext(ToastContext);

// --- Components ---

const LandingPage = ({ onNavigate }) => {
    return html`
        <div className="min-h-screen landing-bg text-white font-sans flex flex-col overflow-x-hidden">
            <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl"><i className="fas fa-feather-alt text-teal-400"></i> NotaryOS</div>
                    <button onClick=${onNavigate} className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-lg transition">Log In</button>
                </div>
            </header>
            <main className="flex-1 flex flex-col justify-center items-center text-center px-6 pt-32 pb-20 relative z-10">
                <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight max-w-5xl">
                    Drowning in paperwork? <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Chasing payments?</span>
                </h1>
                <p className="text-lg text-slate-300 mb-10 max-w-2xl">The operating system for modern notaries. Schedule, eJournal, invoices, and AI compliance in one pocket.</p>
                <button onClick=${onNavigate} className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-teal-500/20 transition-transform hover:-translate-y-1">Start Free Trial</button>
                
                <div className="mt-20 w-full max-w-6xl grid md:grid-cols-3 gap-8 text-left">
                    <div className="visual-card p-8 rounded-2xl">
                        <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-4 text-2xl"><i className="fas fa-robot"></i></div>
                        <h3 className="text-xl font-bold mb-2">AI Compliance Coach</h3>
                        <p className="text-slate-400">Instant answers to state laws. Never guess on fees or ID rules again.</p>
                    </div>
                    <div className="visual-card p-8 rounded-2xl">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center mb-4 text-2xl"><i className="fas fa-file-invoice-dollar"></i></div>
                        <h3 className="text-xl font-bold mb-2">Auto-Invoicing</h3>
                        <p className="text-slate-400">Send professional PDF invoices and track payments in real-time.</p>
                    </div>
                    <div className="visual-card p-8 rounded-2xl">
                        <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center mb-4 text-2xl"><i className="fas fa-book"></i></div>
                        <h3 className="text-xl font-bold mb-2">Secure eJournal</h3>
                        <p className="text-slate-400">Log entries securely on mobile. 50-state compliant and audit-ready.</p>
                    </div>
                </div>
            </main>
        </div>
    `;
};

const AuthScreen = ({ onAuth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const toast = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Demo Auth Logic
        if (!email.includes('@')) { toast('Invalid email', 'error'); return; }
        toast(`Welcome, ${email.split('@')[0]}!`);
        onAuth({ email, name: email.split('@')[0], plan: 'free' });
    };

    return html`
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900">${isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-slate-500 mt-2">Enter your details to continue.</p>
                </div>
                <form onSubmit=${handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <input type="email" value=${email} onChange=${e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                        <input type="password" value=${password} onChange=${e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 outline-none" required />
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition">${isLogin ? 'Sign In' : 'Sign Up'}</button>
                </form>
                <div className="mt-6 text-center">
                    <button onClick=${() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline text-sm font-medium">
                        ${isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                    </button>
                </div>
            </div>
        </div>
    `;
};

const Dashboard = ({ user, setView }) => {
    const [stats, setStats] = useState({ revenue: 0, pending: 0 });
    
    useEffect(() => {
        const load = async () => {
            const appts = await DataManager.get('notary_appointments');
            const rev = appts.filter(a => a.status === 'Paid').reduce((s, a) => s + Number(a.fee || 0), 0);
            const pend = appts.filter(a => a.status === 'Scheduled').length;
            setStats({ revenue: rev, pending: pend });
        };
        load();
    }, []);

    return html`
        <div className="p-6 space-y-6 animate-fade-in font-sans">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Good Morning, ${user.name}.</h2>
                    <p className="text-slate-500">Here is your daily briefing.</p>
                </div>
                <button onClick=${() => setView('Add Appointment')} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition"><i className="fas fa-plus mr-2"></i>New Job</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Revenue (YTD)</div>
                    <div className="text-3xl font-bold text-slate-900 mt-2">$${stats.revenue.toLocaleString()}</div>
                    <div className="text-emerald-600 text-sm font-medium mt-1"><i className="fas fa-arrow-up"></i> +12% this month</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pending Jobs</div>
                    <div className="text-3xl font-bold text-slate-900 mt-2">${stats.pending}</div>
                    <div className="text-slate-500 text-sm font-medium mt-1">Upcoming appointments</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:border-blue-200 transition" onClick=${() => setView('ai')}>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">AI Coach</div>
                    <div className="text-xl font-bold text-blue-600 mt-2">Ask a Question</div>
                    <div className="text-slate-500 text-sm font-medium mt-1">State laws & fees</div>
                </div>
            </div>
        </div>
    `;
};

const Schedule = ({ setView }) => {
    const [appts, setAppts] = useState([]);
    
    useEffect(() => { DataManager.get('notary_appointments').then(setAppts); }, []);

    return html`
        <div className="p-6 font-sans">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Schedule</h2>
                <button onClick=${() => setView('Add Appointment')} className="text-blue-600 font-bold hover:bg-blue-50 px-3 py-2 rounded-lg transition">+ Add</button>
            </div>
            ${appts.length === 0 ? html`
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                    <i className="fas fa-calendar-times text-4xl text-slate-300 mb-3"></i>
                    <p className="text-slate-500 font-medium">No appointments scheduled.</p>
                </div>
            ` : html`
                <div className="space-y-3">
                    ${appts.map(a => html`
                        <div key=${a.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center hover:shadow-md transition">
                            <div>
                                <div className="font-bold text-slate-900">${a.clientName}</div>
                                <div className="text-sm text-slate-500">${a.date} at ${formatTime12h(a.time)} • ${a.type}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-slate-900">$${a.fee}</div>
                                <div className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full inline-block mt-1">${a.status}</div>
                            </div>
                        </div>
                    `)}
                </div>
            `}
        </div>
    `;
};

const ApptForm = ({ setView }) => {
    const toast = useToast();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        data.id = Date.now().toString();
        data.status = 'Scheduled';
        await DataManager.save('notary_appointments', data);
        toast('Appointment Scheduled');
        setView('schedule');
    };

    return html`
        <div className="p-6 font-sans max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">New Appointment</h2>
            <form onSubmit=${handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <input name="clientName" placeholder="Client Name" required className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-blue-500" />
                <div className="grid grid-cols-2 gap-4">
                    <input name="date" type="date" required className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-blue-500" />
                    <input name="time" type="time" required className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-blue-500" />
                </div>
                <input name="type" placeholder="Service Type (e.g. Loan Signing)" className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-blue-500" />
                <input name="fee" type="number" placeholder="Fee ($)" className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:border-blue-500" />
                <div className="flex gap-3 pt-2">
                    <button type="button" onClick=${() => setView('schedule')} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Save</button>
                </div>
            </form>
        </div>
    `;
};

const AICoach = ({ setView }) => {
    const [msgs, setMsgs] = useState([{role:'assistant', content:'Hello! I am your Notary Coach. Ask me about fees, ID rules, or state laws.'}]);
    const [input, setInput] = useState('');

    const send = () => {
        if(!input) return;
        setMsgs(p => [...p, {role:'user', content:input}]);
        setInput('');
        setTimeout(() => {
            setMsgs(p => [...p, {role:'assistant', content:'This is a demo response. Add your Gemini API key in settings to get real answers!'}]);
        }, 600);
    };

    return html`
        <div className="flex flex-col h-screen bg-slate-50 font-sans">
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">AI Coach</h3>
                <button onClick=${() => setView('dashboard')} className="text-slate-400 hover:text-slate-600">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                ${msgs.map((m, i) => html`
                    <div key=${i} className="flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}">
                        <div className="max-w-[80%] p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-800'}">
                            ${m.content}
                        </div>
                    </div>
                `)}
            </div>
            <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
                <input value=${input} onChange=${e => setInput(e.target.value)} onKeyDown=${e => e.key==='Enter' && send()} placeholder="Ask a question..." className="flex-1 px-4 py-2 border border-slate-300 rounded-xl outline-none focus:border-blue-500" />
                <button onClick=${send} className="bg-blue-600 text-white px-4 rounded-xl font-bold">Send</button>
            </div>
        </div>
    `;
};

const Sidebar = ({ setView, active, onLogout }) => {
    const items = [
        { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
        { id: 'schedule', icon: 'fa-calendar-alt', label: 'Schedule' },
        { id: 'journal', icon: 'fa-book', label: 'Journal' },
        { id: 'ai', icon: 'fa-robot', label: 'AI Coach' },
    ];
    return html`
        <div className="hidden md:flex w-64 flex-col bg-slate-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="p-6 text-xl font-bold flex items-center gap-3 border-b border-slate-800">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                NotaryOS
            </div>
            <nav className="p-4 space-y-1">
                ${items.map(i => html`
                    <button key=${i.id} onClick=${() => setView(i.id)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${active === i.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}">
                        <i className="fas ${i.icon} w-5 text-center"></i> ${i.label}
                    </button>
                `)}
            </nav>
            <div className="mt-auto p-4 border-t border-slate-800">
                <button onClick=${onLogout} className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition"><i className="fas fa-sign-out-alt mr-2"></i> Log Out</button>
            </div>
        </div>
    `;
};

const MobileNav = ({ setView }) => html`
    <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 pb-6 z-50">
        <button onClick=${() => setView('dashboard')} className="text-slate-400 hover:text-blue-600"><i className="fas fa-home text-xl"></i></button>
        <button onClick=${() => setView('schedule')} className="text-slate-400 hover:text-blue-600"><i className="fas fa-calendar text-xl"></i></button>
        <button onClick=${() => setView('Add Appointment')} className="bg-blue-600 text-white w-12 h-12 rounded-full -mt-8 shadow-lg flex items-center justify-center border-4 border-white"><i className="fas fa-plus"></i></button>
        <button onClick=${() => setView('journal')} className="text-slate-400 hover:text-blue-600"><i className="fas fa-book text-xl"></i></button>
        <button onClick=${() => setView('ai')} className="text-slate-400 hover:text-blue-600"><i className="fas fa-robot text-xl"></i></button>
    </div>
`;

// --- Root App ---
const App = () => {
    const [user, setUser] = useState(safeParse(localStorage.getItem('notary_user'), null));
    const [view, setView] = useState('dashboard');

    const handleAuth = (u) => {
        localStorage.setItem('notary_user', JSON.stringify(u));
        setUser(u);
        setView('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('notary_user');
        setUser(null);
        setView('landing');
    };

    if (!user) {
        if (view === 'landing') return html`<${LandingPage} onNavigate=${() => setView('auth')} />`;
        return html`<${ToastProvider}><${AuthScreen} onAuth=${handleAuth} /><//>`;
    }

    return html`
        <${ToastProvider}>
            <div className="flex min-h-screen bg-slate-50">
                <${Sidebar} setView=${setView} active=${view} onLogout=${handleLogout} />
                <main className="flex-1 md:ml-64 pb-20 md:pb-0 relative">
                    ${view === 'dashboard' && html`<${Dashboard} user=${user} setView=${setView} />`}
                    ${view === 'schedule' && html`<${Schedule} setView=${setView} />`}
                    ${view === 'Add Appointment' && html`<${ApptForm} setView=${setView} />`}
                    ${view === 'ai' && html`<${AICoach} setView=${setView} />`}
                    ${view === 'journal' && html`<div className="p-8 text-center text-slate-500">Journal Module Placeholder</div>`}
                </main>
                <${MobileNav} setView=${setView} />
            </div>
        <//>
    `;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(html`<${App} />`);
