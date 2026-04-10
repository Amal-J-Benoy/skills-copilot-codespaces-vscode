import React, { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'wearable_demo_mode';

// Check env variables first, then fall back to localStorage
const envDemoMode = process.env.REACT_APP_DEMO_MODE === 'true';
const envDemoEnabled = process.env.REACT_APP_DEMO_ENABLED !== 'false'; // default true

const getInitialDemoMode = () => {
    if (envDemoMode) return true;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'true';
    } catch {
        return false;
    }
};

const DemoContext = createContext({
    isDemoMode: false,
    isDemoEnabled: true,
    toggleDemoMode: () => {},
});

export const DemoProvider = ({ children }) => {
    const [isDemoMode, setIsDemoMode] = useState(getInitialDemoMode);

    const toggleDemoMode = useCallback(() => {
        setIsDemoMode((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY, String(next));
            } catch {
                // ignore storage errors
            }
            return next;
        });
    }, []);

    return (
        <DemoContext.Provider
            value={{ isDemoMode, isDemoEnabled: envDemoEnabled, toggleDemoMode }}
        >
            {children}
        </DemoContext.Provider>
    );
};

export const useDemo = () => useContext(DemoContext);

export default DemoContext;
