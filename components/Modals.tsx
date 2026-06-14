import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './ui';
import { ExternalLinkIcon } from './icons';
import { Teacher, Session, DistributionResult, SessionAssignment } from '../types';
import { t } from '../i18n';
import { getArchive, deleteFromArchive, saveToArchive, exportArchivedToPDF, ArchivedDistribution } from '../services/archiveService';

type TranslationKeys = Parameters<typeof t>[0];

interface SettingsModalProps {
    onClose: () => void;
    T: (key: TranslationKeys) => string;
}
export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, T }) => {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem('gemini_api_key', apiKey);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <Modal title={T('settingsTitle')} onClose={onClose}>
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {T('settingsDescription')}
                </p>
                <div>
                    <label htmlFor="api-key-input" className="block text-sm font-medium">{T('geminiApiKey')}</label>
                    <input
                        id="api-key-input"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                        placeholder={T('apiKeyPlaceholder')}
                    />
                    <div className="mt-2 text-sm text-end">
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline inline-flex items-center gap-1 transition-colors">
                            {T('getApiKeyLink')} <ExternalLinkIcon />
                        </a>
                    </div>
                </div>
                <div className="pt-4 flex justify-between items-center">
                    <span className={`text-sm text-green-600 dark:text-green-400 transition-opacity duration-300 ${isSaved ? 'opacity-100' : 'opacity-0'}`}>
                        {T('settingsSaved')}
                    </span>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{T('close')}</button>
                        <button type="button" onClick={handleSave} className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">{T('save')}</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

interface TeacherModalProps {
    teacher: Teacher | null;
    sessions: Session[];
    onSave: (teacher: Teacher) => void;
    onClose: () => void;
    T: (key: TranslationKeys) => string;
}
export const TeacherModal: React.FC<TeacherModalProps> = ({ teacher, sessions, onSave, onClose, T }) => {
    const [formData, setFormData] = useState<Teacher>(teacher || { id: '', name: '', subject: '', maxSessions: 4, strictness: 3, notes: '', availability: [] });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (name === 'maxSessions' || name === 'strictness') ? parseInt(value) || 1 : value }));
    };

    const handleAvailabilityChange = (sessionId: string) => {
        setFormData(prev => {
            const newAvailability = prev.availability.includes(sessionId)
                ? prev.availability.filter(id => id !== sessionId)
                : [...prev.availability, sessionId];
            return { ...prev, availability: newAvailability };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.subject) {
            onSave(formData);
        }
    };

    return (
        <Modal title={teacher?.id ? T('modalEditTeacher') : T('modalAddTeacher')} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="teacher-name" className="block text-sm font-medium">{T('fullName')}</label>
                    <input id="teacher-name" type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                    <label htmlFor="teacher-subject" className="block text-sm font-medium">{T('subjectTaught')}</label>
                    <input id="teacher-subject" type="text" name="subject" value={formData.subject} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                    <label htmlFor="teacher-max-sessions" className="block text-sm font-medium">{T('maxSessions')}</label>
                    <input id="teacher-max-sessions" type="number" name="maxSessions" value={formData.maxSessions} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required min="1" />
                </div>
                <div>
                    <label htmlFor="teacher-strictness" className="block text-sm font-medium">{T('strictnessLevel')}</label>
                    <input id="teacher-strictness" type="number" name="strictness" value={formData.strictness} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required min="1" max="5" />
                </div>
                <div>
                    <label htmlFor="teacher-notes" className="block text-sm font-medium">{T('notes')}</label>
                    <textarea id="teacher-notes" name="notes" value={formData.notes} onChange={handleChange} rows={2} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium">{T('availabilityHelp')}</label>
                    <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md p-2 space-y-2 bg-gray-50 dark:bg-gray-900">
                        {sessions.length > 0 ? sessions.map(session => (
                            <div key={session.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`session-avail-${session.id}`}
                                    checked={formData.availability.includes(session.id)}
                                    onChange={() => handleAvailabilityChange(session.id)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`session-avail-${session.id}`} className="ms-3 block text-sm text-gray-900 dark:text-gray-200 select-none cursor-pointer">
                                    {session.name} <span className="text-gray-500 dark:text-gray-400">({session.subject})</span>
                                </label>
                            </div>
                        )) : <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">{T('noSessionsForAvailability')}</p>}
                    </div>
                </div>
                <div className="pt-4 flex justify-end space-x-2 rtl:space-x-reverse">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{T('cancel')}</button>
                    <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">{T('save')}</button>
                </div>
            </form>
        </Modal>
    );
};

interface SessionModalProps {
    session: Session | null;
    subjects: string[];
    onSave: (session: Session) => void;
    onClose: () => void;
    T: (key: TranslationKeys) => string;
}
export const SessionModal: React.FC<SessionModalProps> = ({ session, subjects, onSave, onClose, T }) => {
    const days = useMemo(() => Array.from({ length: 5 }, (_, i) => `${T('day')} ${i + 1}`), [T]);
    const periods = useMemo(() => [T('morningPeriod'), T('eveningPeriod')], [T]);
    const slots = useMemo(() => Array.from({ length: 4 }, (_, i) => `${T('slot')} ${i + 1}`), [T]);

    const [day, setDay] = useState(days[0]);
    const [period, setPeriod] = useState(periods[0]);
    const [slot, setSlot] = useState(slots[0]);
    const [subject, setSubject] = useState(subjects[0] || '');

    useEffect(() => {
        if (session && session.id) {
            const parts = session.name.split(' - ');
            if (parts.length === 3) {
                const [dayPart, periodPart, slotPart] = parts;
                const allLangs = ['ar', 'en', 'fr'] as const;

                const getIndex = (part: string, key: 'day' | 'slot' | 'period', count: number): number => {
                    for (const lang of allLangs) {
                        if (key === 'period') {
                            if (part === t('morningPeriod', lang)) return 0;
                            if (part === t('eveningPeriod', lang)) return 1;
                        } else {
                            for (let i = 0; i < count; i++) {
                                if (part === `${t(key, lang)} ${i + 1}`) return i;
                            }
                        }
                    }
                    return -1;
                };

                const dayIndex = getIndex(dayPart, 'day', 5);
                const periodIndex = getIndex(periodPart, 'period', 2);
                const slotIndex = getIndex(slotPart, 'slot', 4);

                if (dayIndex !== -1) setDay(days[dayIndex]);
                if (periodIndex !== -1) setPeriod(periods[periodIndex]);
                if (slotIndex !== -1) setSlot(slots[slotIndex]);
            }
            setSubject(session.subject);
        } else if (subjects.length > 0 && !session?.subject) {
            setSubject(subjects[0]);
        }
    }, [session, subjects, days, periods, slots]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const combinedName = `${day} - ${period} - ${slot}`;
        if (combinedName && subject) {
            onSave({
                id: session?.id || '',
                name: combinedName,
                day: day,
                period: period,
                slot: slot,
                subject: subject
            });
        }
    };

    const commonSelectClass = "mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2";

    return (
        <Modal title={session?.id ? T('modalEditSession') : T('modalAddSession')} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="session-day" className="block text-sm font-medium">{T('day')}</label>
                    <select id="session-day" value={day} onChange={e => setDay(e.target.value)} className={commonSelectClass}>
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="session-period" className="block text-sm font-medium">{T('period')}</label>
                    <select id="session-period" value={period} onChange={e => setPeriod(e.target.value)} className={commonSelectClass}>
                        {periods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="session-slot" className="block text-sm font-medium">{T('slot')}</label>
                    <select id="session-slot" value={slot} onChange={e => setSlot(e.target.value)} className={commonSelectClass}>
                        {slots.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="session-subject" className="block text-sm font-medium">{T('subjectProgrammed')}</label>
                    <select id="session-subject" value={subject} onChange={e => setSubject(e.target.value)} className={commonSelectClass} required>
                        <option value="" disabled>-- {T('chooseSubject')} --</option>
                        {subjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
                <div className="pt-4 flex justify-end space-x-2 rtl:space-x-reverse">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{T('cancel')}</button>
                    <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">{T('save')}</button>
                </div>
            </form>
        </Modal>
    );
};

interface ArchiveModalProps {
    onClose: () => void;
    T: (key: TranslationKeys) => string;
    language: 'ar' | 'en' | 'fr';
}
export const ArchiveModal: React.FC<ArchiveModalProps> = ({ onClose, T, language }) => {
    const [archivedItems, setArchivedItems] = useState<ArchivedDistribution[]>([]);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    useEffect(() => {
        setArchivedItems(getArchive());
    }, []);

    const handleDelete = (id: string) => {
        deleteFromArchive(id);
        setArchivedItems(getArchive());
        setDeleteConfirmId(null);
    };

    const handleExportPDF = (item: ArchivedDistribution) => {
        exportArchivedToPDF(item, T, language);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{T('archive')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {archivedItems.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            <p>{T('archiveEmpty')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {archivedItems.map(item => (
                                <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg">{item.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {T('archiveDate')}: {formatDate(item.date)}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.sessions.length} {T('sessionCount')} • {item.hallCount} {T('hall')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleExportPDF(item)} className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 text-sm transition-colors">PDF</button>
                                            {deleteConfirmId === item.id ? (
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleDelete(item.id)} className="bg-red-600 text-white py-1 px-2 rounded-md hover:bg-red-700 text-sm transition-colors">✓</button>
                                                    <button onClick={() => setDeleteConfirmId(null)} className="bg-gray-300 text-gray-700 py-1 px-2 rounded-md hover:bg-gray-400 text-sm transition-colors dark:bg-gray-600 dark:text-gray-200">✕</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setDeleteConfirmId(item.id)} className="bg-gray-200 text-gray-700 py-1 px-3 rounded-md hover:bg-gray-300 text-sm transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{T('deleteFromArchive')}</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{T('close')}</button>
                </div>
            </div>
        </div>
    );
};

interface SaveArchiveModalProps {
    distributionResult: DistributionResult;
    sessions: Session[];
    teachers: Teacher[];
    hallCount: number;
    onClose: () => void;
    T: (key: TranslationKeys) => string;
}
export const SaveArchiveModal: React.FC<SaveArchiveModalProps> = ({ distributionResult, sessions, teachers, hallCount, onClose, T }) => {
    const [name, setName] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        try {
            saveToArchive(name, distributionResult, sessions, teachers, hallCount);
            setIsSaved(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Failed to save to archive:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{T('saveToArchive')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6">
                    {isSaved ? (
                        <div className="text-center py-4">
                            <div className="text-green-600 dark:text-green-400 text-xl mb-2">✓</div>
                            <p className="text-green-600 dark:text-green-400 font-semibold">{T('archiveSaved')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{T('archiveName')}</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={T('archiveNamePlaceholder')}
                                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{T('cancel')}</button>
                                <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">{T('save')}</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

interface AssignmentEditModalProps {
    teachers: Teacher[];
    sessionAssignment: SessionAssignment;
    currentTeacher: Teacher | null;
    onSave: (teacher: Teacher) => void;
    onClose: () => void;
    T: (key: TranslationKeys) => string;
}
export const AssignmentEditModal: React.FC<AssignmentEditModalProps> = ({ teachers, sessionAssignment, currentTeacher, onSave, onClose, T }) => {
    const [search, setSearch] = useState('');

    const getTeacherStatus = (teacherId: string) => {
        if (sessionAssignment.reserves.find(t => t.id === teacherId)) return { label: T('activeMapReserve'), color: 'text-green-600', isAvailable: true };
        for (const [hallNum, proctors] of Object.entries(sessionAssignment.hallAssignments) as [string, Teacher[]][]) {
            if (proctors.some(p => p.id === teacherId)) return { label: `${T('hall')} ${hallNum}`, color: 'text-orange-600', isAvailable: false };
        }
        return { label: T('unavailable'), color: 'text-gray-400', isAvailable: false };
    };

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) &&
        t.id !== currentTeacher?.id
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[80vh]">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{T('editAssignment')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
                </div>
                <div className="p-4 border-b dark:border-gray-700">
                    <input
                        type="text"
                        placeholder={T('searchTeacher')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"
                    />
                </div>
                <div className="p-2 overflow-y-auto flex-1">
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredTeachers.map(teacher => {
                            const status = getTeacherStatus(teacher.id);
                            return (
                                <li key={teacher.id}>
                                    <button onClick={() => onSave(teacher)} className="w-full text-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{teacher.name}</p>
                                            <p className="text-xs text-gray-500">{teacher.subject}</p>
                                        </div>
                                        <span className={`text-xs font-medium ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="p-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{T('close')}</button>
                </div>
            </div>
        </div>
    );
};

interface LogoutConfirmModalProps {
    onKeepAndLogout: () => void;
    onDiscardAndLogout: () => void;
    onClose: () => void;
    T: (key: TranslationKeys) => string;
}
export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ onKeepAndLogout, onDiscardAndLogout, onClose, T }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-full overflow-y-auto transform transition-all">
                <div className="p-6">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ms-4 sm:text-start">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 font-bold" id="modal-title">
                                {T('logoutConfirmTitle')}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {T('logoutConfirmMessage')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-850 px-4 py-3 sm:px-6 flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
                    <button
                        type="button"
                        onClick={onKeepAndLogout}
                        className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm transition-colors"
                    >
                        {T('logoutKeepData')}
                    </button>
                    <button
                        type="button"
                        onClick={onDiscardAndLogout}
                        className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm transition-colors"
                    >
                        {T('logoutDiscardData')}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                    >
                        {T('cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

