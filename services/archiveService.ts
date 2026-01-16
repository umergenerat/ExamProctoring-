import type { DistributionResult, Session, Teacher } from '../types';
import { exportToPDF } from './exportService';
import type { TFunction } from '../i18n';

export interface ArchivedDistribution {
    id: string;
    name: string;
    date: string;
    distributionResult: DistributionResult;
    sessions: Session[];
    teachers: Teacher[];
    hallCount: number;
}

const ARCHIVE_STORAGE_KEY = 'proctoringAppArchive';

/**
 * Generate a unique ID for archived items
 */
const generateArchiveId = (): string => {
    return `archive_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Get all archived distributions from localStorage
 */
export const getArchive = (): ArchivedDistribution[] => {
    try {
        const stored = localStorage.getItem(ARCHIVE_STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to load archive:', error);
        return [];
    }
};

/**
 * Save a distribution to the archive
 */
export const saveToArchive = (
    name: string,
    distributionResult: DistributionResult,
    sessions: Session[],
    teachers: Teacher[],
    hallCount: number
): ArchivedDistribution => {
    const archive = getArchive();

    const newItem: ArchivedDistribution = {
        id: generateArchiveId(),
        name: name.trim() || `Distribution ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
        distributionResult,
        sessions,
        teachers,
        hallCount
    };

    archive.unshift(newItem); // Add to beginning (newest first)

    try {
        localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(archive));
    } catch (error) {
        console.error('Failed to save to archive:', error);
        throw new Error('Failed to save to archive');
    }

    return newItem;
};

/**
 * Delete an archived distribution by ID
 */
export const deleteFromArchive = (id: string): boolean => {
    const archive = getArchive();
    const filtered = archive.filter(item => item.id !== id);

    if (filtered.length === archive.length) {
        return false; // Item not found
    }

    try {
        localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Failed to delete from archive:', error);
        return false;
    }
};

/**
 * Export an archived distribution to PDF
 */
export const exportArchivedToPDF = async (
    item: ArchivedDistribution,
    T: TFunction,
    lang: 'ar' | 'en' | 'fr'
): Promise<void> => {
    await exportToPDF(
        item.distributionResult,
        item.sessions,
        item.teachers,
        item.hallCount,
        T,
        lang
    );
};

/**
 * Clear all archived distributions
 */
export const clearArchive = (): void => {
    try {
        localStorage.removeItem(ARCHIVE_STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear archive:', error);
    }
};
