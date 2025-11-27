import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Teacher, Session, DistributionResult, SessionAssignment } from './types';
import { generateDistribution } from './services/distributionService';
import { getImprovementSuggestions, extractTeachersFromImage } from './services/geminiService';
import { exportToPDF, exportToCSV } from './services/exportService';
import { translations, t } from './i18n';
import type { TranslationKeys } from './i18n';


// --- Helper Functions & Initial Data ---
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialTeachers: Teacher[] = [
    { id: generateId(), name: 'أحمد ', subject: 'الرياضيات', maxSessions: 4, notes: 'خبير', availability: [] },
    { id: generateId(), name: 'فاطمة الزهراء', subject: 'اللغة العربية', maxSessions: 5, notes: '', availability: [] },
    { id: generateId(), name: 'يوسف ', subject: 'الفيزياء', maxSessions: 4, notes: '', availability: [] },
    { id: generateId(), name: 'خديجة ', subject: 'علوم الحياة والأرض', maxSessions: 5, notes: 'إعفاء جزئي', availability: [] },
    { id: generateId(), name: 'محمد ', subject: 'اللغة الفرنسية', maxSessions: 3, notes: '', availability: [] },
    { id: generateId(), name: 'عائشة ', subject: 'التاريخ والجغرافيا', maxSessions: 5, notes: '', availability: [] },
    { id: generateId(), name: 'علي ', subject: 'التربية الإسلامية', maxSessions: 4, notes: '', availability: [] },
    { id: generateId(), name: 'مريم ', subject: 'اللغة الإنجليزية', maxSessions: 5, notes: '', availability: [] },
];

const initialSessions: Session[] = [
    { id: generateId(), name: 'اليوم 1 - الفترة الصباحية - الحصة 1', subject: 'الرياضيات' },
    { id: generateId(), name: 'اليوم 1 - الفترة الصباحية - الحصة 2', subject: 'اللغة العربية' },
    { id: generateId(), name: 'اليوم 1 - الفترة المسائية - الحصة 1', subject: 'الفيزياء' },
    { id: generateId(), name: 'اليوم 2 - الفترة الصباحية - الحصة 1', subject: 'اللغة الفرنسية' },
];


// --- SVG Icons ---
const AppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-indigo-600">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
    </svg>
);
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mx-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 me-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 me-3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 me-3"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const BrainCircuitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mx-2"><path d="M12 2a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3Z" /><path d="M20 12h-2a2.5 2.5 0 0 1-2.5-2.5V8" /><path d="M4 12h2a2.5 2.5 0 0 0 2.5-2.5V8" /><path d="M12 12v2a2.5 2.5 0 0 0 2.5 2.5h0a2.5 2.5 0 0 1 2.5 2.5V20" /><path d="M12 12v2a2.5 2.5 0 0 1-2.5 2.5h0a2.5 2.5 0 0 0-2.5 2.5V20" /></svg>;
const FileDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mx-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="m15 15-3 3-3-3" /></svg>;
const UploadCloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 me-2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-red-600"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mx-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const LanguageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-5 w-5"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;


// --- Main App Component ---
export default function App() {
    // App states
    const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
    const [sessions, setSessions] = useState<Session[]>(initialSessions);
    const [hallCount, setHallCount] = useState<number>(3);
    
    // UI states
    const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    
    // Result states
    const [distributionResult, setDistributionResult] = useState<DistributionResult | null>(null);
    const [aiSuggestions, setAiSuggestions] = useState<string>('');
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [activeTab, setActiveTab] = useState('bySession');

    // Import states
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const [conflictingTeachers, setConflictingTeachers] = useState<{ existing: Teacher; imported: Omit<Teacher, 'id' | 'availability'> }[]>([]);
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
    const [pendingNewTeachers, setPendingNewTeachers] = useState<Teacher[]>([]);
    
    // Confirmation modal states
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationModalConfig, setConfirmationModalConfig] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
        confirmText?: string;
        confirmButtonClass?: string;
    } | null>(null);

    // Authentication states
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    // Theme and Language states
    const [language, setLanguage] = useState<'ar' | 'en' | 'fr'>(() => (localStorage.getItem('language') as 'ar' | 'en' | 'fr') || 'ar');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');

    // --- Translation function ---
    const T = useCallback((key: TranslationKeys) => t(key, language), [language]);
    
    // --- Effects for Theme and Language ---
    useEffect(() => {
        const root = document.documentElement;
        root.lang = language;
        root.dir = language === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('language', language);
        document.title = T('appTitle');
    }, [language, T]);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);
    
    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
    
    const toggleLanguage = () => {
        setLanguage(prev => {
            if (prev === 'ar') return 'en';
            if (prev === 'en') return 'fr';
            return 'ar';
        });
    };

    const getNextLanguageName = () => {
        if (language === 'ar') return 'English';
        if (language === 'en') return 'Français';
        return 'العربية';
    };

    // --- Authentication check effect ---
    useEffect(() => {
        const user = localStorage.getItem('proctoringAppCurrentUser');
        if (user) {
            setIsAuthenticated(true);
            setCurrentUser(user);
        }
        setIsCheckingAuth(false);
    }, []);
    
    // --- Authentication handlers ---
    const handleAuthSuccess = () => {
        const user = localStorage.getItem('proctoringAppCurrentUser');
        setIsAuthenticated(true);
        setCurrentUser(user);
    };

    const handleLogout = () => {
        localStorage.removeItem('proctoringAppCurrentUser');
        setIsAuthenticated(false);
        setCurrentUser(null);
    };

    // --- CRUD Handlers for Teachers ---
    const handleAddTeacher = () => {
        setCurrentTeacher({ id: '', name: '', subject: '', maxSessions: 4, notes: '', availability: [] });
        setIsTeacherModalOpen(true);
    };

    const handleEditTeacher = (teacher: Teacher) => {
        setCurrentTeacher(teacher);
        setIsTeacherModalOpen(true);
    };

    const handleDeleteTeacher = (id: string) => {
        setConfirmationModalConfig({
            title: T('deleteTeacherConfirmTitle'),
            message: T('deleteTeacherConfirmMessage'),
            onConfirm: () => {
                setTeachers(teachers.filter(t => t.id !== id));
                setIsConfirmationModalOpen(false);
            },
            confirmText: T('confirmDelete'),
            confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        });
        setIsConfirmationModalOpen(true);
    };

    const handleSaveTeacher = (teacher: Teacher) => {
        if (teacher.id) {
            setTeachers(teachers.map(t => t.id === teacher.id ? teacher : t));
        } else {
            setTeachers([...teachers, { ...teacher, id: generateId() }]);
        }
        setIsTeacherModalOpen(false);
    };

    type Resolutions = { [teacherName: string]: 'update' | 'skip' };
    
    const handleConflictResolution = (resolutions: Resolutions) => {
        setTeachers(prevTeachers => {
            let updatedTeachers = [...prevTeachers];
            let updatedCount = 0;

            conflictingTeachers.forEach(conflict => {
                const resolution = resolutions[conflict.existing.name];
                if (resolution === 'update') {
                    updatedTeachers = updatedTeachers.map(t => 
                        t.id === conflict.existing.id 
                            ? { 
                                ...t, // Keep id and availability
                                name: conflict.imported.name,
                                subject: conflict.imported.subject,
                                maxSessions: conflict.imported.maxSessions,
                                notes: conflict.imported.notes,
                              } 
                            : t
                    );
                    updatedCount++;
                }
            });

            const finalTeachers = [...updatedTeachers, ...pendingNewTeachers];
            alert(T('importSuccess').replace('{updated}', updatedCount.toString()).replace('{added}', pendingNewTeachers.length.toString()));
            return finalTeachers;
        });

        setIsConflictModalOpen(false);
        setConflictingTeachers([]);
        setPendingNewTeachers([]);
    };

    // --- File Import Handler ---
    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setImportError('');
        
        try {
            let parsedTeachers: Omit<Teacher, 'id' | 'availability'>[] = [];
            if (file.type === 'text/csv') {
                const text = await file.text();
                parsedTeachers = text.split('\n').slice(1).map(row => {
                    const [name, subject, maxSessions, notes] = row.split(',');
                    return {
                        name: name?.trim(),
                        subject: subject?.trim(),
                        maxSessions: parseInt(maxSessions?.trim()) || 4,
                        notes: notes?.trim() || ''
                    };
                }).filter(t => t.name);
            } else if (file.type.startsWith('image/')) {
                const blobToBase64 = (blob: Blob): Promise<string> => 
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                
                const base64Image = await blobToBase64(file);
                parsedTeachers = await extractTeachersFromImage(base64Image, file.type, language);
            } else {
                throw new Error(T('importErrorUnsupportedFile'));
            }

            const existingTeachersMap = new Map<string, Teacher>();
            teachers.forEach(t => existingTeachersMap.set(t.name.toLowerCase().trim(), t));

            const conflicts: { existing: Teacher; imported: Omit<Teacher, 'id' | 'availability'> }[] = [];
            const nonConflicts: Omit<Teacher, 'id' | 'availability'>[] = [];

            parsedTeachers.forEach(importedTeacher => {
                if (!importedTeacher || typeof importedTeacher.name !== 'string' || importedTeacher.name.trim() === '') {
                    return; // Skip invalid or empty entries
                }
                const existing = existingTeachersMap.get(importedTeacher.name.toLowerCase().trim());
                if (existing) {
                    conflicts.push({ existing, imported: importedTeacher });
                } else {
                    nonConflicts.push(importedTeacher);
                }
            });

            const teachersToAdd = nonConflicts.map(t => ({ ...t, id: generateId(), availability: [] }));

            if (conflicts.length > 0) {
                setConflictingTeachers(conflicts);
                setPendingNewTeachers(teachersToAdd);
                setIsConflictModalOpen(true);
            } else {
                if (teachersToAdd.length > 0) {
                    setTeachers(prev => [...prev, ...teachersToAdd]);
                    alert(T('importSuccessNoConflict').replace('{count}', teachersToAdd.length.toString()));
                } else {
                    alert(T('importNoNewTeachers'));
                }
            }

        } catch (error: any) {
            console.error("Import failed:", error);
            setImportError(T('aiError'));
        } finally {
            setIsImporting(false);
            e.target.value = ''; // Reset file input
        }
    };

    // --- CRUD Handlers for Sessions ---
    const handleAddSession = () => {
        setCurrentSession({ id: '', name: '', subject: '' });
        setIsSessionModalOpen(true);
    };

    const handleEditSession = (session: Session) => {
        setCurrentSession(session);
        setIsSessionModalOpen(true);
    };

    const handleDeleteSession = (id: string) => {
        setConfirmationModalConfig({
            title: T('deleteSessionConfirmTitle'),
            message: T('deleteSessionConfirmMessage'),
            onConfirm: () => {
                setSessions(sessions.filter(s => s.id !== id));
                setIsConfirmationModalOpen(false);
            },
            confirmText: T('confirmDelete'),
            confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        });
        setIsConfirmationModalOpen(true);
    };
    
    const handleSaveSession = (session: Session) => {
        if (session.id) {
            setSessions(sessions.map(s => s.id === session.id ? session : s));
        } else {
            setSessions([...sessions, { ...session, id: generateId() }]);
        }
        setIsSessionModalOpen(false);
    };

    // --- Distribution Handler ---
    const handleGenerate = async () => {
        const performGeneration = async () => {
            const result = generateDistribution(teachers, sessions, hallCount);
            setDistributionResult(result);
            setAiSuggestions('');
            if (result) {
                setIsLoadingSuggestions(true);
                try {
                    const suggestions = await getImprovementSuggestions(result.stats, teachers.length, sessions.length, hallCount, language);
                    setAiSuggestions(suggestions);
                } catch (error: any) {
                    console.error(error);
                    setAiSuggestions(T('aiError'));
                } finally {
                    setIsLoadingSuggestions(false);
                }
            }
        };

        // Check 1: Per-session eligibility due to subject conflicts.
        const neededPerSession = hallCount * 2;
        let problematicSession = null;
        for (const session of sessions) {
            const eligibleTeachers = teachers.filter(t => t.subject.toLowerCase() !== session.subject.toLowerCase());
            if (eligibleTeachers.length < neededPerSession) {
                problematicSession = {
                    name: session.name,
                    eligibleCount: eligibleTeachers.length,
                    neededCount: neededPerSession,
                };
                break; // Found the first problematic session
            }
        }

        if (problematicSession) {
            setConfirmationModalConfig({
                title: T('warning'),
                message: T('warningProctorsForSession')
                    .replace('{sessionName}', problematicSession.name)
                    .replace('{eligibleCount}', problematicSession.eligibleCount.toString())
                    .replace('{neededCount}', problematicSession.neededCount.toString()),
                onConfirm: () => {
                    setIsConfirmationModalOpen(false);
                    performGeneration();
                },
                confirmText: T('continueAnyway'),
                confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
            });
            setIsConfirmationModalOpen(true);
            return;
        }

        // Check 2: Overall capacity check based on max sessions.
        const totalSlotsNeeded = sessions.length * hallCount * 2;
        const totalSlotsAvailable = teachers.reduce((sum, teacher) => sum + teacher.maxSessions, 0);

        if (totalSlotsAvailable < totalSlotsNeeded && totalSlotsNeeded > 0) {
            setConfirmationModalConfig({
                title: T('warning'),
                message: T('warningProctorsOverall')
                    .replace('{available}', totalSlotsAvailable.toString())
                    .replace('{needed}', totalSlotsNeeded.toString()),
                onConfirm: () => {
                    setIsConfirmationModalOpen(false);
                    performGeneration();
                },
                confirmText: T('continueAnyway'),
                confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
            });
            setIsConfirmationModalOpen(true);
        } else {
            performGeneration();
        }
    };
    
    // --- Memoized Data for Display ---
    const sessionMap = useMemo(() => {
        return sessions.reduce((map, session) => {
            map[session.id] = session;
            return map;
        }, {} as Record<string, Session>);
    }, [sessions]);
    
    const uniqueSubjects = useMemo(() => {
        const allSubjects = teachers.map(t => t.subject);
        return [...new Set(allSubjects)].filter(s => s).sort();
    }, [teachers]);


    // --- Conditional Rendering for Auth ---
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-300 animate-pulse">{T('loading')}</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AuthPage onAuthSuccess={handleAuthSuccess} T={T} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            <header className="bg-white shadow-md dark:bg-gray-800 dark:border-b dark:border-gray-700">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <AppIcon />
                        <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-200">{T('appTitle')}</h1>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">{currentUser}</span>
                         <button onClick={() => setIsSettingsModalOpen(true)} title={T('settings')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <SettingsIcon />
                        </button>
                        <button onClick={toggleTheme} title={T('toggleTheme')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        </button>
                        <button onClick={toggleLanguage} title={T('toggleLanguage')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                             <LanguageIcon/>
                             <span className="text-sm font-semibold">{getNextLanguageName()}</span>
                        </button>
                        <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-3 rounded-md hover:bg-red-600 flex items-center justify-center transition-colors text-sm">
                           <LogOutIcon /> <span className='hidden sm:inline'>{T('logout')}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- Column 1: Data Input --- */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Teachers Card */}
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
                                            <button onClick={() => handleEditTeacher(t)} className="p-1"><EditIcon /></button>
                                            <button onClick={() => handleDeleteTeacher(t.id)} className="p-1"><TrashIcon /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button onClick={handleAddTeacher} className="mt-4 w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 flex items-center justify-center transition-colors">
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
                                accept=".csv,image/png,image/jpeg"
                                onChange={handleFileImport}
                                disabled={isImporting}
                            />
                            <label htmlFor="file-upload" className={`w-full cursor-pointer bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isImporting ? T('importing') : T('chooseFile')}
                            </label>
                            {importError && <p className="text-red-500 text-xs mt-2">{importError}</p>}
                        </div>
                    </Card>

                    {/* Sessions & Halls Card */}
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
                                            <button onClick={() => handleEditSession(s)} className="p-1"><EditIcon /></button>
                                            <button onClick={() => handleDeleteSession(s.id)} className="p-1"><TrashIcon /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                         <button onClick={handleAddSession} className="mt-4 w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 flex items-center justify-center transition-colors">
                            <PlusIcon /> {T('addSession')}
                        </button>
                        <div className="mt-4">
                            <label htmlFor="hallCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center"><HomeIcon /> {T('hallCountLabel')}</label>
                            <input type="number" id="hallCount" value={hallCount} onChange={e => setHallCount(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-center font-bold text-lg p-2" />
                        </div>
                    </Card>
                    
                    <div className="sticky top-6">
                        <button onClick={handleGenerate} className="w-full bg-green-600 text-white py-3 px-4 rounded-lg shadow-lg hover:bg-green-700 flex items-center justify-center text-lg font-bold transition-all transform hover:scale-105">
                            <BrainCircuitIcon /> {T('generateDistribution')}
                        </button>
                    </div>

                </div>

                {/* --- Column 2: Results & Output --- */}
                <div className="lg:col-span-2 space-y-6">
                    {!distributionResult && (
                        <div className="h-full flex flex-col items-center justify-center bg-white rounded-lg shadow p-8 text-center dark:bg-gray-800">
                             <BrainCircuitIcon />
                            <h3 className="mt-2 text-xl font-medium text-gray-900 dark:text-gray-100">{T('readyToStart')}</h3>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">{T('readyToStartHelp')}</p>
                        </div>
                    )}
                    {distributionResult && (
                        <>
                            {/* Distribution Tabs */}
                            <Card>
                                <CardHeader>{T('distributionResults')}</CardHeader>
                                <div className="border-b border-gray-200 dark:border-gray-700">
                                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                        <button onClick={() => setActiveTab('bySession')} className={`${activeTab === 'bySession' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                                            {T('viewBySession')}
                                        </button>
                                        <button onClick={() => setActiveTab('byTeacher')} className={`${activeTab === 'byTeacher' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                                            {T('teacherSummary')}
                                        </button>
                                    </nav>
                                </div>

                                <div className="mt-4">
                                    {activeTab === 'bySession' && (
                                        <div className="space-y-6">
                                            {(Object.entries(distributionResult.assignments) as [string, SessionAssignment][]).map(([sessionId, assignment]) => (
                                                <div key={sessionId}>
                                                    <h4 className="font-bold text-lg text-indigo-700 bg-indigo-50 p-2 rounded-t-md dark:bg-indigo-900/50 dark:text-indigo-300">
                                                        {sessionMap[sessionId]?.name} - ({T('sessionSubject')}: {sessionMap[sessionId]?.subject})
                                                    </h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                                <tr>
                                                                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{T('hall')}</th>
                                                                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{T('proctor1')}</th>
                                                                    <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{T('proctor2')}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                                                {Object.entries(assignment.hallAssignments).map(([hallNum, proctors]) => (
                                                                    <tr key={hallNum}>
                                                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{T('hall')} {hallNum}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">{proctors[0]?.name || '---'}</td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">{proctors[1]?.name || '---'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className="mt-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-b-md">
                                                        <span className="font-semibold">{T('reserves')}:</span> {assignment.reserves.length > 0 ? assignment.reserves.map(r => r.name).join('، ') : T('noReserves')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {activeTab === 'byTeacher' && (
                                         <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{T('teacher')}</th>
                                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{T('sessionCount')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                                    {(Object.values(distributionResult.stats) as { name: string; count: number }[]).sort((a,b) => b.count - a.count).map(stat => (
                                                        <tr key={stat.name}>
                                                            <td className="px-6 py-4 whitespace-nowrap">{stat.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-lg">{stat.count}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* AI Suggestions Card */}
                            <Card>
                                <CardHeader><BrainCircuitIcon /> {T('aiSuggestionsTitle')}</CardHeader>
                                {isLoadingSuggestions && <p className="text-gray-600 dark:text-gray-300 animate-pulse">{T('aiAnalyzing')}...</p>}
                                {!isLoadingSuggestions && aiSuggestions && (
                                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {aiSuggestions.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
                                    </div>
                                )}
                            </Card>
                            
                            {/* Export Card */}
                             <Card>
                                <CardHeader>{T('exportReports')}</CardHeader>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={() => exportToPDF(distributionResult, sessions, teachers, hallCount, T, language)} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center transition-colors">
                                        <FileDownIcon /> {T('exportPDF')}
                                    </button>
                                    <button onClick={() => exportToCSV(distributionResult, sessions, hallCount, T)} className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center transition-colors">
                                        <FileDownIcon /> {T('exportCSV')}
                                    </button>
                                </div>
                            </Card>
                        </>
                    )}
                </div>
            </main>

            <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-6">
                {T('appDeveloper')}
            </footer>

            {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} T={T} />}
            {isTeacherModalOpen && <TeacherModal teacher={currentTeacher} sessions={sessions} onSave={handleSaveTeacher} onClose={() => setIsTeacherModalOpen(false)} T={T} />}
            {isSessionModalOpen && <SessionModal session={currentSession} subjects={uniqueSubjects} onSave={handleSaveSession} onClose={() => setIsSessionModalOpen(false)} T={T} />}
            {isConfirmationModalOpen && confirmationModalConfig && (
                <ConfirmationModal
                    title={confirmationModalConfig.title}
                    message={confirmationModalConfig.message}
                    onConfirm={confirmationModalConfig.onConfirm}
                    onCancel={() => setIsConfirmationModalOpen(false)}
                    confirmText={confirmationModalConfig.confirmText}
                    confirmButtonClass={confirmationModalConfig.confirmButtonClass}
                    T={T}
                />
            )}
            {isConflictModalOpen && (
                <ConflictResolutionModal
                    conflicts={conflictingTeachers}
                    onConfirm={handleConflictResolution}
                    onCancel={() => {
                        setIsConflictModalOpen(false);
                        setConflictingTeachers([]);
                        setPendingNewTeachers([]);
                    }}
                    T={T}
                />
            )}
        </div>
    );
}


// --- Sub-Components: Modals, Cards, and Auth Page ---

// --- Authentication Page Component ---
const AuthPage: React.FC<{ onAuthSuccess: () => void, T: (key: TranslationKeys) => string }> = ({ onAuthSuccess, T }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError(T('authErrorRequired'));
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError(T('authErrorEmail'));
            return;
        }

        const users = JSON.parse(localStorage.getItem('proctoringAppUsers') || '[]');

        if (isLoginMode) {
            const user = users.find((u: any) => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('proctoringAppCurrentUser', email);
                onAuthSuccess();
            } else {
                setError(T('authErrorInvalid'));
            }
        } else { // Sign Up Mode
            if (password.length < 6) {
                setError(T('authErrorPassword'));
                return;
            }
            const existingUser = users.find((u: any) => u.email === email);
            if (existingUser) {
                setError(T('authErrorExists'));
            } else {
                users.push({ email, password });
                localStorage.setItem('proctoringAppUsers', JSON.stringify(users));
                localStorage.setItem('proctoringAppCurrentUser', email);
                onAuthSuccess();
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                 <div className="flex flex-col items-center justify-center mb-6">
                    <AppIcon />
                    <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mt-2">{T('appTitle')}</h1>
                    <p className="text-sm font-mono text-gray-500 dark:text-gray-400">AITLOUTOU</p>
                </div>
                
                <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-200 mb-2">{isLoginMode ? T('authLoginTitle') : T('authSignupTitle')}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{T('email')}</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 text-gray-900 dark:text-gray-100"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{T('password')}</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 text-gray-900 dark:text-gray-100"
                            required
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-lg hover:bg-indigo-700 flex items-center justify-center font-semibold transition-colors"
                    >
                        {isLoginMode ? T('login') : T('signup')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                        {isLoginMode ? T('signupPrompt') : T('loginPrompt')}
                    </button>
                </div>
            </div>
        </div>
    );
};


interface ConflictResolutionModalProps {
    conflicts: { existing: Teacher; imported: Omit<Teacher, 'id' | 'availability'> }[];
    onConfirm: (resolutions: { [teacherName: string]: 'update' | 'skip' }) => void;
    onCancel: () => void;
    T: (key: TranslationKeys) => string;
}
const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({ conflicts, onConfirm, onCancel, T }) => {
    const [resolutions, setResolutions] = useState<{ [teacherName: string]: 'update' | 'skip' }>(() => {
        const initialResolutions: { [teacherName: string]: 'update' | 'skip' } = {};
        conflicts.forEach(c => {
            initialResolutions[c.existing.name] = 'update'; // Default to 'update'
        });
        return initialResolutions;
    });

    const handleResolutionChange = (teacherName: string, choice: 'update' | 'skip') => {
        setResolutions(prev => ({ ...prev, [teacherName]: choice }));
    };
    
    const handleSelectAll = (choice: 'update' | 'skip') => {
        const newResolutions: { [teacherName: string]: 'update' | 'skip' } = {};
        conflicts.forEach(c => {
            newResolutions[c.existing.name] = choice;
        });
        setResolutions(newResolutions);
    };

    const handleSubmit = () => {
        onConfirm(resolutions);
    };

    return (
        <Modal title={T('importConflictTitle')} onClose={onCancel}>
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {T('importConflictMessage')}
                </p>
                <div className="flex justify-end gap-2 text-sm">
                    <button onClick={() => handleSelectAll('update')} className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800">{T('updateAll')}</button>
                    <button onClick={() => handleSelectAll('skip')} className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{T('skipAll')}</button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-3 p-2 border rounded-md bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                    {conflicts.map(({ existing, imported }) => (
                        <div key={existing.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                            <h4 className="font-bold text-gray-800 dark:text-gray-100">{existing.name}</h4>
                            <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                                <span className="text-gray-500 dark:text-gray-400">{T('currentSubject')}:</span> <span>{existing.subject}</span>
                                <span className="text-gray-500 dark:text-gray-400">{T('newSubject')}:</span> <span className="font-semibold text-blue-600 dark:text-blue-400">{imported.subject}</span>
                                
                                <span className="text-gray-500 dark:text-gray-400">{T('currentSessions')}:</span> <span>{existing.maxSessions}</span>
                                <span className="text-gray-500 dark:text-gray-400">{T('newSessions')}:</span> <span className="font-semibold text-blue-600 dark:text-blue-400">{imported.maxSessions}</span>

                                <span className="text-gray-500 dark:text-gray-400">{T('currentNotes')}:</span> <span className="col-span-1 truncate">{existing.notes || T('none')}</span>
                                <span className="text-gray-500 dark:text-gray-400">{T('newNotes')}:</span> <span className="font-semibold text-blue-600 dark:text-blue-400 col-span-1 truncate">{imported.notes || T('none')}</span>
                            </div>
                            <div className="mt-3 flex justify-center gap-2">
                                <button
                                    onClick={() => handleResolutionChange(existing.name, 'update')}
                                    className={`w-full text-sm py-1 px-3 rounded transition-colors ${resolutions[existing.name] === 'update' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'}`}
                                >
                                    {T('updateData')}
                                </button>
                                <button
                                    onClick={() => handleResolutionChange(existing.name, 'skip')}
                                    className={`w-full text-sm py-1 px-3 rounded transition-colors ${resolutions[existing.name] === 'skip' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'}`}
                                >
                                    {T('skipChanges')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pt-4 flex justify-end space-x-2 rtl:space-x-reverse">
                    <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{T('cancelImport')}</button>
                    <button type="button" onClick={handleSubmit} className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">{T('confirmAndExecute')}</button>
                </div>
            </div>
        </Modal>
    );
};


interface CardProps {
    children: React.ReactNode;
}
const Card: React.FC<CardProps> = ({ children }) => (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 dark:bg-gray-800">{children}</div>
);

interface CardHeaderProps {
    children: React.ReactNode;
}
const CardHeader: React.FC<CardHeaderProps> = ({ children }) => (
    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4 flex items-center dark:text-gray-100 dark:border-gray-700">{children}</h3>
);

interface SettingsModalProps {
    onClose: () => void;
    T: (key: TranslationKeys) => string;
}
const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, T }) => {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem('gemini_api_key', apiKey);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000); // Hide message after 2s
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
const TeacherModal: React.FC<TeacherModalProps> = ({ teacher, sessions, onSave, onClose, T }) => {
    const [formData, setFormData] = useState<Teacher>(teacher || { id: '', name: '', subject: '', maxSessions: 4, notes: '', availability: [] });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'maxSessions' ? parseInt(value) : value }));
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
                    <label className="block text-sm font-medium">{T('fullName')}</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">{T('subjectTaught')}</label>
                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">{T('maxSessions')}</label>
                    <input type="number" name="maxSessions" value={formData.maxSessions} onChange={handleChange} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" required min="1" />
                </div>
                <div>
                    <label className="block text-sm font-medium">{T('notes')}</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
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
const SessionModal: React.FC<SessionModalProps> = ({ session, subjects, onSave, onClose, T }) => {
    const days = useMemo(() => Array.from({ length: 5 }, (_, i) => `${T('day')} ${i + 1}`), [T]);
    const periods = useMemo(() => [T('morningPeriod'), T('eveningPeriod')], [T]);
    const slots = useMemo(() => Array.from({ length: 4 }, (_, i) => `${T('slot')} ${i + 1}`), [T]);

    // State for each part of the session
    const [day, setDay] = useState(days[0]);
    const [period, setPeriod] = useState(periods[0]);
    const [slot, setSlot] = useState(slots[0]);
    const [subject, setSubject] = useState(subjects[0] || '');

    // Effect to populate form when editing an existing session
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
                    return -1; // Not found
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
                subject: subject
            });
        }
    };

    const commonSelectClass = "mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2";

    return (
        <Modal title={session?.id ? T('modalEditSession') : T('modalAddSession')} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">{T('day')}</label>
                    <select value={day} onChange={e => setDay(e.target.value)} className={commonSelectClass}>
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">{T('period')}</label>
                    <select value={period} onChange={e => setPeriod(e.target.value)} className={commonSelectClass}>
                        {periods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">{T('slot')}</label>
                    <select value={slot} onChange={e => setSlot(e.target.value)} className={commonSelectClass}>
                        {slots.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">{T('subjectProgrammed')}</label>
                    <select
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className={commonSelectClass}
                        required
                    >
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

interface ModalProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}
const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-full overflow-y-auto">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    confirmButtonClass?: string;
    T: (key: TranslationKeys) => string;
}
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm, onCancel, confirmText, confirmButtonClass, T }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-full overflow-y-auto transform transition-all">
                <div className="p-6">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                            <WarningIcon />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ms-4 sm:text-start">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:gap-x-3">
                     <button
                        type="button"
                        onClick={onConfirm}
                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:text-sm ${confirmButtonClass || 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}`}
                    >
                        {confirmText || T('confirm')}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        {T('cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};