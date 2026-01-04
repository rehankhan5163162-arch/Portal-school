const themes = {
    'cosmic': {
        '--primary-color': '#6366f1',
        '--primary-hover': '#4f46e5',
        '--secondary-color': '#ec4899',
        '--bg-dark': '#0f172a',
        '--bg-darker': '#020617',
        '--text-light': '#f8fafc',
        '--text-gray': '#94a3b8',
        '--glass-bg': 'rgba(255, 255, 255, 0.05)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)'
    },
    'ocean': {
        '--primary-color': '#0ea5e9',
        '--primary-hover': '#0284c7',
        '--secondary-color': '#14b8a6',
        '--bg-dark': '#0c4a6e',
        '--bg-darker': '#082f49',
        '--text-light': '#f0f9ff',
        '--text-gray': '#bae6fd',
        '--glass-bg': 'rgba(255, 255, 255, 0.08)',
        '--glass-border': 'rgba(255, 255, 255, 0.15)'
    },
    'emerald': {
        '--primary-color': '#10b981',
        '--primary-hover': '#059669',
        '--secondary-color': '#34d399',
        '--bg-dark': '#064e3b',
        '--bg-darker': '#022c22',
        '--text-light': '#ecfdf5',
        '--text-gray': '#a7f3d0',
        '--glass-bg': 'rgba(255, 255, 255, 0.05)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)'
    },
    'sunset': {
        '--primary-color': '#f97316',
        '--primary-hover': '#ea580c',
        '--secondary-color': '#f43f5e',
        '--bg-dark': '#431407',
        '--bg-darker': '#2e0f06',
        '--text-light': '#fff7ed',
        '--text-gray': '#fdba74',
        '--glass-bg': 'rgba(255, 255, 255, 0.05)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)'
    },
    'royal': {
        '--primary-color': '#a855f7',
        '--primary-hover': '#9333ea',
        '--secondary-color': '#eab308',
        '--bg-dark': '#3b0764',
        '--bg-darker': '#24043e',
        '--text-light': '#faf5ff',
        '--text-gray': '#e9d5ff',
        '--glass-bg': 'rgba(255, 255, 255, 0.05)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)'
    },
    'midnight': {
        '--primary-color': '#64748b',
        '--primary-hover': '#475569',
        '--secondary-color': '#94a3b8',
        '--bg-dark': '#000000',
        '--bg-darker': '#0a0a0a',
        '--text-light': '#f8fafc',
        '--text-gray': '#cbd5e1',
        '--glass-bg': 'rgba(255, 255, 255, 0.1)',
        '--glass-border': 'rgba(255, 255, 255, 0.2)'
    },
    'crimson': {
        '--primary-color': '#ef4444',
        '--primary-hover': '#dc2626',
        '--secondary-color': '#7f1d1d',
        '--bg-dark': '#450a0a',
        '--bg-darker': '#280606',
        '--text-light': '#fef2f2',
        '--text-gray': '#fca5a5',
        '--glass-bg': 'rgba(255, 255, 255, 0.05)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)'
    },
    'nature': {
        '--primary-color': '#84cc16',
        '--primary-hover': '#65a30d',
        '--secondary-color': '#a3e635',
        '--bg-dark': '#1a2e05',
        '--bg-darker': '#0d1802',
        '--text-light': '#f7fee7',
        '--text-gray': '#d9f99d',
        '--glass-bg': 'rgba(255, 255, 255, 0.05)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)'
    },
    'cyber': {
        '--primary-color': '#f0abfc',
        '--primary-hover': '#e879f9',
        '--secondary-color': '#2dd4bf',
        '--bg-dark': '#1e1b4b',
        '--bg-darker': '#16133a',
        '--text-light': '#faf5ff',
        '--text-gray': '#e9d5ff',
        '--glass-bg': 'rgba(255, 255, 255, 0.05)',
        '--glass-border': 'rgba(255, 255, 255, 0.15)'
    },
    'steel': {
        '--primary-color': '#9ca3af',
        '--primary-hover': '#6b7280',
        '--secondary-color': '#d1d5db',
        '--bg-dark': '#111827',
        '--bg-darker': '#030712',
        '--text-light': '#f9fafb',
        '--text-gray': '#9ca3af',
        '--glass-bg': 'rgba(255, 255, 255, 0.05)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)'
    },
    'aqua': {
        '--primary-color': '#06b6d4',
        '--primary-hover': '#0891b2',
        '--secondary-color': '#67e8f9',
        '--bg-dark': '#164e63',
        '--bg-darker': '#0e3a4a',
        '--text-light': '#ecfeff',
        '--text-gray': '#a5f3fc',
        '--glass-bg': 'rgba(255, 255, 255, 0.08)',
        '--glass-border': 'rgba(255, 255, 255, 0.15)'
    },
    'berry': {
        '--primary-color': '#d946ef',
        '--primary-hover': '#c026d3',
        '--secondary-color': '#f0abfc',
        '--bg-dark': '#4a044e',
        '--bg-darker': '#2e0231',
        '--text-light': '#fdf4ff',
        '--text-gray': '#f0abfc',
        '--glass-bg': 'rgba(255, 255, 255, 0.05)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)'
    }
};

function applyTheme(themeName) {
    const theme = themes[themeName] || themes['cosmic'];
    const root = document.documentElement;

    for (const [property, value] of Object.entries(theme)) {
        root.style.setProperty(property, value);
    }

    localStorage.setItem('selectedTheme', themeName);
}

function initTheme() {
    const savedTheme = localStorage.getItem('selectedTheme') || 'cosmic';
    applyTheme(savedTheme);
}

// Initialize on load
initTheme();
