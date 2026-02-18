// Data & Helper Functions
export const STATE_DATABASE = {
    "AL": { "state": "Alabama", "fees": { "acknowledgment": "$5.00", "jurat": "$5.00" } },
    "AK": { "state": "Alaska", "fees": { "acknowledgment": "$25.00", "jurat": "$25.00" } },
    "AZ": { "state": "Arizona", "fees": { "acknowledgment": "$10.00", "jurat": "$10.00" } },
    "CA": { "state": "California", "fees": { "acknowledgment": "$15.00", "jurat": "$15.00" }, "id_requirements": "1 or 2 credible witnesses approved." },
    "TX": { "state": "Texas", "fees": { "acknowledgment": "$6.00", "jurat": "$6.00" } },
    "FL": { "state": "Florida", "fees": { "acknowledgment": "$10.00", "jurat": "$10.00" } },
    "NY": { "state": "New York", "fees": { "acknowledgment": "$2.00", "jurat": "$2.00" } }
};

export const COURSE_MODULES = [{ id: 1, title: "Authority", topic: "Commissioning authority." }];

export const safeParse = (val, fallback) => {
    try { return val ? JSON.parse(val) : fallback; } catch (e) { return fallback; }
};

export const DataManager = {
    get: async (key) => safeParse(localStorage.getItem(key), []),
    save: async (key, item) => {
        const list = safeParse(localStorage.getItem(key), []);
        const idx = list.findIndex(i => i.id === item.id);
        if (idx >= 0) list[idx] = item; else list.push(item);
        localStorage.setItem(key, JSON.stringify(list));
        return list;
    },
    delete: async (key, id) => {
        const list = safeParse(localStorage.getItem(key), []);
        const next = list.filter(i => i.id !== id);
        localStorage.setItem(key, JSON.stringify(next));
        return next;
    }
};

export const computeProfileProgress = (user) => {
    const name = user?.name || user?.displayName;
    const phone = user?.phone;
    return { completed: !!name && !!phone, name: !!name, phone: !!phone };
};

export const formatTime12h = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${m} ${ampm}`;
};
