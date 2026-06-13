import React from 'react';
import { Card, CardHeader } from './ui';
import { CalendarIcon, EditIcon, TrashIcon, PlusIcon, HomeIcon, UploadCloudIcon } from './icons';
import { Session } from '../types';

interface SessionManagementProps {
    sessions: Session[];
    onEditSession: (session: Session) => void;
    onDeleteSession: (id: string) => void;
    onAddSession: () => void;
    hallCount: number;
    setHallCount: (count: number) => void;
    onSessionFileImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isImportingSessions: boolean;
    sessionImportError: string | null;
    onDownloadTemplate: (T: any) => void;
    language: string;
    T: (key: any) => string;
}

export const SessionManagement: React.FC<SessionManagementProps> = ({
    sessions,
    onEditSession,
    onDeleteSession,
    onAddSession,
    hallCount,
    setHallCount,
    onSessionFileImport,
    isImportingSessions,
    sessionImportError,
    onDownloadTemplate,
    language,
    T,
}) => {
    return (
        <Card>
            <CardHeader><CalendarIcon /> {T('examsSchedule')}</CardHeader>
            <div className="max-h-48 overflow-y-auto ps-2">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sessions.map(s => (
                        <li key={s.id} className="py-2 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{s.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{T('sessionSubject')}: {s.subject}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => onEditSession(s)} className="p-1" title={language === 'ar' ? 'تعديل' : (language === 'fr' ? 'Modifier' : 'Edit')} aria-label={language === 'ar' ? 'تعديل' : (language === 'fr' ? 'Modifier' : 'Edit')}><EditIcon /></button>
                                <button onClick={() => onDeleteSession(s.id)} className="p-1" title={language === 'ar' ? 'حذف' : (language === 'fr' ? 'Supprimer' : 'Delete')} aria-label={language === 'ar' ? 'حذف' : (language === 'fr' ? 'Supprimer' : 'Delete')}><TrashIcon /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <button onClick={onAddSession} className="mt-4 w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 flex items-center justify-center transition-colors">
                <PlusIcon /> {T('addSession')}
            </button>
            <div className="mt-4">
                <label htmlFor="hallCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"><HomeIcon /> {T('hallCountLabel')}</label>
                <input type="number" id="hallCount" value={hallCount} onChange={e => setHallCount(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-center font-bold text-lg p-2" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center">
                    <UploadCloudIcon />
                    {T('importSessions')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {T('importSessionsHelp')}
                </p>
                <input
                    type="file"
                    id="session-file-upload"
                    className="hidden"
                    accept=".csv,image/png,image/jpeg,.xlsx,.xls"
                    onChange={onSessionFileImport}
                    disabled={isImportingSessions}
                />
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <label htmlFor="session-file-upload" className={`w-full cursor-pointer bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors ${isImportingSessions ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {isImportingSessions ? T('importing') : T('chooseFile')}
                    </label>
                    <button onClick={() => onDownloadTemplate(T)} className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40 flex items-center justify-center transition-colors text-sm font-medium">
                        {language === 'ar' ? 'تحميل نموذج Excel' : (language === 'fr' ? 'Modèle Excel' : 'Excel Template')}
                    </button>
                </div>
                {sessionImportError && <p className="text-red-500 text-xs mt-2">{sessionImportError}</p>}
            </div>
        </Card>
    );
};
