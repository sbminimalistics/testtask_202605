const saveToLocalStorage = <T>(key: string, data: T[]) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Failed to save to localStorage:", error);
    }
};

const loadFromLocalStorage = <T>(key: string): T[] => {
    try {
        const saved = localStorage.getItem(key);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error("Failed to load from localStorage:", error);
    }
    return [];
};


export {saveToLocalStorage, loadFromLocalStorage};