import React from 'react';
import { Card, CardHeader } from './ui';
import { UsersIcon, EditIcon, TrashIcon, PlusIcon, UploadCloudIcon } from './icons';
import { Teacher } from '../types';

interface TeacherManagementProps {
    teachers: Teacher[];
    onEditTeacher: (teacher: Teacher) => void;
    onDeleteTeacher: (id: string) => void;
    onAddTeacher: () => void;
    onFileImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isImporting: boolean;
    importError: string | null;
    onDownloadTemplate: (T: any) => void;
    language: string;
    T: (key: any) => string;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
    teachers,
    onEditTeacher,
    onDeleteTeacher,
    onAddTeacher,
    onFileImport,
    isImporting,
    importError,
    onDownloadTemplate,
    language,
    T,
}) => {
    return (
        <Card>
            <CardHeader><UsersIcon /> {T('manageTeachers')}</CardHeader>
            <div className="max-h-60 overflow-y-auto ps-2">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {teachers.map(t => (
                        <li key={t.id} className="py-2 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{t.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t.subject} - {t.maxSessions} {T('maxSessionsSuffix')}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => onEditTeacher(t)} className="p-1" title={language === 'ar' ? 'تعديل' : (language === 'fr' ? 'Modifier' : 'Edit')} aria-label={language === 'ar' ? 'تعديل' : (language === 'fr' ? 'Modifier' : 'Edit')}><EditIcon /></button>
                                <button onClick={() => onDeleteTeacher(t.id)} className="p-1" title={language === 'ar' ? 'حذف' : (language === 'fr' ? 'Supprimer' : 'Delete')} aria-label={language === 'ar' ? 'حذف' : (language === 'fr' ? 'Supprimer' : 'Delete')}><TrashIcon /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <button onClick={onAddTeacher} className="mt-4 w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 flex items-center justify-center transition-colors">
                <PlusIcon /> {T('addTeacher')}
            </button>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 flex items-center">
                    <UploadCloudIcon />
                    {T('importTeachers')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {T('importTeachersHelp')}
                </p>
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv,image/png,image/jpeg,.xlsx,.xls"
                    onChange={onFileImport}
                    disabled={isImporting}
                />
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <label htmlFor="file-upload" className={`w-full cursor-pointer bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {isImporting ? T('importing') : T('chooseFile')}
                    </label>
                    <button onClick={() => onDownloadTemplate(T)} className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40 flex items-center justify-center transition-colors text-sm font-medium">
                        {language === 'ar' ? 'تحميل نموذج Excel' : (language === 'fr' ? 'Modèle Excel' : 'Excel Template')}
                    </button>
                </div>
                {importError && <p className="text-red-500 text-xs mt-2">{importError}</p>}
            </div>
        </Card>
    );
};
