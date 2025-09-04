export interface ProgressUpdate {
    itemId?: string;
    overallProgress?: number;
    completedItems?: string[];
    timeSpent?: number;
    isCompleted?: boolean;
}

export function notifyProgressUpdate(update: ProgressUpdate) {
    const event = new CustomEvent('progress-updated', { detail: update });
    window.dispatchEvent(event);
    
    const currentSession = JSON.parse(sessionStorage.getItem('course-progress') || '{}');
    const updatedSession = { ...currentSession, ...update, lastUpdate: Date.now() };
    sessionStorage.setItem('course-progress', JSON.stringify(updatedSession));
}

export function getSessionProgress(): ProgressUpdate | null {
    try {
        const sessionData = sessionStorage.getItem('course-progress');
        if (!sessionData) return null;
        
        const parsed = JSON.parse(sessionData);
        const isRecent = Date.now() - parsed.lastUpdate < 300000;
        return isRecent ? parsed : null;
    } catch {
        return null;
    }
}