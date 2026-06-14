import React, { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import * as XLSX from 'xlsx';
import type { Teacher, Session, DistributionResult, SessionAssignment, AssignedTeacher } from './types';
import { generateDistribution } from './services/distributionService';
import { getImprovementSuggestions, extractTeachersFromImage, extractSessionsFromImage } from './services/geminiService';
import { exportToPDF, exportToCSV, exportToExcel, downloadTeacherExcelTemplate, downloadSessionExcelTemplate } from './services/exportService';
import { saveToArchive, getArchive, deleteFromArchive, exportArchivedToPDF, type ArchivedDistribution } from './services/archiveService';
import { translations, t } from './i18n';
import type { TranslationKeys } from './i18n';


// --- Helper Functions & Initial Data ---
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialTeachers: Teacher[] = [
    { id: generateId(), name: 'أحمد ', subject: 'الرياضيات', maxSessions: 4, strictness: 4, notes: 'خبير', availability: [] },
    { id: generateId(), name: 'فاطمة الزهراء', subject: 'اللغة العربية', maxSessions: 5, strictness: 2, notes: '', availability: [] },
    { id: generateId(), name: 'يوسف ', subject: 'الفيزياء', maxSessions: 4, strictness: 3, notes: '', availability: [] },
    { id: generateId(), name: 'خديجة ', subject: 'علوم الحياة والأرض', maxSessions: 5, strictness: 5, notes: 'إعفاء جزئي', availability: [] },
    { id: generateId(), name: 'محمد ', subject: 'اللغة الفرنسية', maxSessions: 3, strictness: 3, notes: '', availability: [] },
    { id: generateId(), name: 'عائشة ', subject: 'التاريخ والجغرافيا', maxSessions: 5, strictness: 3, notes: '', availability: [] },
    { id: generateId(), name: 'علي ', subject: 'التربية الإسلامية', maxSessions: 4, strictness: 4, notes: '', availability: [] },
    { id: generateId(), name: 'مريم ', subject: 'اللغة الإنجليزية', maxSessions: 5, strictness: 3, notes: '', availability: [] },
];

const initialSessions: Session[] = [
    { id: generateId(), name: 'اليوم 1 - الفترة الصباحية - الحصة 1', day: 'اليوم 1', period: 'صباحية', slot: 'الحصة 1', subject: 'الرياضيات' },
    { id: generateId(), name: 'اليوم 1 - الفترة الصباحية - الحصة 2', day: 'اليوم 1', period: 'صباحية', slot: 'الحصة 2', subject: 'اللغة العربية' },
    { id: generateId(), name: 'اليوم 1 - الفترة المسائية - الحصة 1', day: 'اليوم 1', period: 'مسائية', slot: 'الحصة 1', subject: 'الفيزياء' },
    { id: generateId(), name: 'اليوم 2 - الفترة الصباحية - الحصة 1', day: 'اليوم 2', period: 'صباحية', slot: 'الحصة 1', subject: 'اللغة الفرنسية' },
];


import { AppIcon, PlusIcon, EditIcon, TrashIcon, UsersIcon, CalendarIcon, HomeIcon, BrainCircuitIcon, FileDownIcon, UploadCloudIcon, WarningIcon, LogOutIcon, SunIcon, MoonIcon, LanguageIcon, SettingsIcon, ArchiveIcon, ArchiveIconSmall, FileSpreadsheet, FileText, DownloadIcon, ExternalLinkIcon } from './components/icons';
import { Card, CardHeader, Modal, ConfirmationModal } from './components/ui';

const TeacherManagement = lazy(() => import('./components/TeacherManagement').then(module => ({ default: module.TeacherManagement })));
const SessionManagement = lazy(() => import('./components/SessionManagement').then(module => ({ default: module.SessionManagement })));
const SettingsModal = lazy(() => import('./components/Modals').then(module => ({ default: module.SettingsModal })));
const TeacherModal = lazy(() => import('./components/Modals').then(module => ({ default: module.TeacherModal })));
const SessionModal = lazy(() => import('./components/Modals').then(module => ({ default: module.SessionModal })));
const ArchiveModal = lazy(() => import('./components/Modals').then(module => ({ default: module.ArchiveModal })));
const SaveArchiveModal = lazy(() => import('./components/Modals').then(module => ({ default: module.SaveArchiveModal })));
const AssignmentEditModal = lazy(() => import('./components/Modals').then(module => ({ default: module.AssignmentEditModal })));
const LogoutConfirmModal = lazy(() => import('./components/Modals').then(module => ({ default: module.LogoutConfirmModal })));

// --- Main App Component ---
export default function App() {
    // App states
    const [teachers, setTeachers] = useState<Teacher[]>(() => {
        try {
            const saved = localStorage.getItem('exam_teachers');
            return saved ? JSON.parse(saved) : initialTeachers;
        } catch { return initialTeachers; }
    });
    const [sessions, setSessions] = useState<Session[]>(() => {
        try {
            const saved = localStorage.getItem('exam_sessions');
            return saved ? JSON.parse(saved) : initialSessions;
        } catch { return initialSessions; }
    });
    const [hallCount, setHallCount] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('exam_hallCount');
            return saved ? JSON.parse(saved) : 3;
        } catch { return 3; }
    });

    // UI states
    const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

    // Result states
    const [distributionResult, setDistributionResult] = useState<DistributionResult | null>(() => {
        try {
            const saved = localStorage.getItem('exam_distributionResult');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [aiSuggestions, setAiSuggestions] = useState<string>('');
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [activeTab, setActiveTab] = useState('bySession');

    // Import states
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const [isImportingSessions, setIsImportingSessions] = useState(false);
    const [sessionImportError, setSessionImportError] = useState('');
    const [conflictingTeachers, setConflictingTeachers] = useState<{ existing: Teacher; imported: Omit<Teacher, 'id' | 'availability'> }[]>([]);
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
    const [pendingNewTeachers, setPendingNewTeachers] = useState<Teacher[]>([]);

    // Assignment Edit State
    const [assignmentEditConfig, setAssignmentEditConfig] = useState<{
        sessionId: string;
        hallNum: number;
        slotIndex: number;
        currentTeacher: Teacher | null;
    } | null>(null);

    // Auto-save effects
    useEffect(() => {
        localStorage.setItem('exam_teachers', JSON.stringify(teachers));
    }, [teachers]);

    useEffect(() => {
        localStorage.setItem('exam_sessions', JSON.stringify(sessions));
    }, [sessions]);

    useEffect(() => {
        localStorage.setItem('exam_hallCount', JSON.stringify(hallCount));
    }, [hallCount]);

    useEffect(() => {
        if (distributionResult) {
            localStorage.setItem('exam_distributionResult', JSON.stringify(distributionResult));
        } else {
            localStorage.removeItem('exam_distributionResult');
        }
    }, [distributionResult]);

    const handleEditAssignment = (sessionId: string, hallNum: number, slotIndex: number, currentTeacher: Teacher | undefined) => {
        setAssignmentEditConfig({ sessionId, hallNum, slotIndex, currentTeacher: currentTeacher || null });
    };

    const handleAssignmentUpdate = (newTeacher: Teacher) => {
        if (!assignmentEditConfig || !distributionResult) return;
        const { sessionId, hallNum, slotIndex } = assignmentEditConfig;

        setDistributionResult(prev => {
            if (!prev) return null;
            const newAssignments = { ...prev.assignments };
            const sessionAssignment = { ...newAssignments[sessionId] };
            const hallAssignments = { ...sessionAssignment.hallAssignments };
            const currentHall = [...(hallAssignments[hallNum] || [])];

            const session = sessionMap[sessionId];
            const isSubjectConflict = session ? newTeacher.subject.trim().toLowerCase() === session.subject.trim().toLowerCase() : false;
            const newAssignedTeacher: AssignedTeacher = {
                ...newTeacher,
                isRepeat: false,
                isSubjectConflict
            };

            if (slotIndex < currentHall.length) {
                currentHall[slotIndex] = newAssignedTeacher;
            } else {
                currentHall.push(newAssignedTeacher);
            }

            hallAssignments[hallNum] = currentHall;
            sessionAssignment.hallAssignments = hallAssignments;
            newAssignments[sessionId] = sessionAssignment;

            const newStats = { ...prev.stats };
            if (assignmentEditConfig.currentTeacher) {
                const oldId = assignmentEditConfig.currentTeacher.id;
                if (newStats[oldId]) {
                    newStats[oldId] = { ...newStats[oldId], count: Math.max(0, newStats[oldId].count - 1) };
                }
            }
            if (!newStats[newTeacher.id]) {
                newStats[newTeacher.id] = { name: newTeacher.name, count: 0 };
            }
            newStats[newTeacher.id] = { ...newStats[newTeacher.id], count: newStats[newTeacher.id].count + 1 };

            return {
                ...prev,
                assignments: newAssignments,
                stats: newStats
            };
        });

        setAssignmentEditConfig(null);
    };

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

    // Archive states
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isSaveArchiveModalOpen, setIsSaveArchiveModalOpen] = useState(false);
    const [archiveName, setArchiveName] = useState('');

    // Export state
    const [isExporting, setIsExporting] = useState(false);

    // PWA Install state
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);

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

    // --- PWA Installation Effect ---
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstallable(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsInstallable(false);
        }
    };

    // --- Authentication handlers ---
    const handleAuthSuccess = () => {
        const user = localStorage.getItem('proctoringAppCurrentUser');
        setIsAuthenticated(true);
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setIsLogoutConfirmOpen(true);
    };

    const handleLogoutKeep = () => {
        localStorage.removeItem('proctoringAppCurrentUser');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsLogoutConfirmOpen(false);
    };

    const handleLogoutDiscard = () => {
        localStorage.removeItem('proctoringAppCurrentUser');
        localStorage.removeItem('exam_teachers');
        localStorage.removeItem('exam_sessions');
        localStorage.removeItem('exam_hallCount');
        localStorage.removeItem('exam_distributionResult');
        
        setTeachers(initialTeachers);
        setSessions(initialSessions);
        setHallCount(3);
        setDistributionResult(null);
        setAiSuggestions('');
        
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsLogoutConfirmOpen(false);
    };

    // --- CRUD Handlers for Teachers ---
    const handleAddTeacher = () => {
        setCurrentTeacher({ id: '', name: '', subject: '', maxSessions: 4, strictness: 3, notes: '', availability: [] });
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
                                ...t,
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
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                
                parsedTeachers = rows.slice(1).map(row => {
                    return {
                        name: row[0]?.toString().trim() || '',
                        subject: row[1]?.toString().trim() || '',
                        maxSessions: parseInt(row[2]) || 4,
                        strictness: parseInt(row[3]) || 3,
                        notes: row[4]?.toString().trim() || ''
                    };
                }).filter(t => t.name);
            } else if (file.type === 'text/csv') {
                const text = await file.text();
                parsedTeachers = text.split('\n').slice(1).map(row => {
                    const [name, subject, maxSessions, strictness, notes] = row.split(',');
                    return {
                        name: name?.trim(),
                        subject: subject?.trim(),
                        maxSessions: parseInt(maxSessions?.trim()) || 4,
                        strictness: parseInt(strictness?.trim()) || 3,
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
                    return;
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
            e.target.value = '';
        }
    };

    // --- Session File Import Handler ---
    const handleSessionFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImportingSessions(true);
        setSessionImportError('');

        try {
            let parsedSessions: Omit<Session, 'id'>[] = [];
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                
                parsedSessions = rows.slice(1).map(row => {
                    const sessionName = row[0]?.toString().trim() || '';
                    const day = row[1]?.toString().trim() || '';
                    const period = row[2]?.toString().trim() || '';
                    const slot = row[3]?.toString().trim() || '';
                    const subject = row[4]?.toString().trim() || '';

                    const combinedName = day && period && slot ? `${day} - ${period} - ${slot}` : sessionName;

                    return {
                        name: combinedName || sessionName,
                        day: day,
                        period: period,
                        slot: slot,
                        subject: subject
                    };
                }).filter(s => s.name || s.subject);
            } else if (file.type === 'text/csv') {
                const text = await file.text();
                parsedSessions = text.split('\n').slice(1).map(row => {
                    const [sessionName, day, period, slot, subject] = row.split(',').map(s => s?.trim() || '');
                    const combinedName = day && period && slot ? `${day} - ${period} - ${slot}` : sessionName;
                    return {
                        name: combinedName || sessionName,
                        day: day,
                        period: period,
                        slot: slot,
                        subject: subject
                    };
                }).filter(s => s.name || s.subject);
            } else if (file.type.startsWith('image/')) {
                const blobToBase64 = (blob: Blob): Promise<string> =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });

                const base64Image = await blobToBase64(file);
                parsedSessions = await extractSessionsFromImage(base64Image, file.type, language);
            } else {
                throw new Error(T('importErrorUnsupportedFile'));
            }

            const sessionsToAdd = parsedSessions.map(s => ({ ...s, id: generateId() }));
            
            if (sessionsToAdd.length > 0) {
                setSessions(prev => [...prev, ...sessionsToAdd]);
                alert(T('importSuccessNoConflict').replace('{count}', sessionsToAdd.length.toString()));
            } else {
                alert(T('importErrorGeneric'));
            }

        } catch (error: any) {
            console.error("Session Import failed:", error);
            setSessionImportError(error.message || T('aiError'));
        } finally {
            setIsImportingSessions(false);
            e.target.value = '';
        }
    };

    // --- CRUD Handlers for Sessions ---
    const handleAddSession = () => {
        setCurrentSession({ id: '', name: '', day: '', period: '', slot: '', subject: '' });
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

        const executeChecksAndGeneration = () => {
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
                    break;
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

            const totalSlotsNeeded = sessions.length * hallCount * 2;
            const totalSlotsAvailable = teachers.reduce((sum, teacher) => sum + teacher.maxSessions, 0);

            if (totalSlotsAvailable < totalSlotsNeeded) {
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
                return;
            }

            performGeneration();
        };

        setConfirmationModalConfig({
            title: T('confirmGenerateTitle'),
            message: T('confirmGenerateMessage'),
            onConfirm: () => {
                setIsConfirmationModalOpen(false);
                executeChecksAndGeneration();
            },
            confirmText: T('continueAnyway'),
            confirmButtonClass: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
        });
        setIsConfirmationModalOpen(true);
    };

    const handleExportPDF = async () => {
        if (!distributionResult) return;
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await exportToPDF(distributionResult, sessions, teachers, hallCount, T, language);
        setIsExporting(false);
    };

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
                        {isInstallable && (
                            <button onClick={handleInstallClick} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 sm:py-2 sm:px-3 rounded-md flex items-center justify-center transition-colors text-sm shadow-sm" title={language === 'ar' ? "تثبيت التطبيق" : (language === 'fr' ? "Installer l'application" : "Install App")}>
                                <DownloadIcon /> <span className='hidden sm:inline mx-1'>{language === 'ar' ? "تثبيت" : (language === 'fr' ? "Installer" : "Install")}</span>
                            </button>
                        )}
                        <button onClick={() => setIsArchiveModalOpen(true)} title={T('viewArchive')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <ArchiveIcon />
                        </button>
                        <button onClick={() => setIsSettingsModalOpen(true)} title={T('settings')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <SettingsIcon />
                        </button>
                        <button onClick={toggleTheme} title={T('toggleTheme')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        </button>
                        <button onClick={toggleLanguage} title={T('toggleLanguage')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                            <LanguageIcon />
                            <span className="text-sm font-semibold">{getNextLanguageName()}</span>
                        </button>
                        <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-3 rounded-md hover:bg-red-600 flex items-center justify-center transition-colors text-sm">
                            <LogOutIcon /> <span className='hidden sm:inline'>{T('logout')}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Suspense fallback={<div>{T('loading')}...</div>}>
                        <TeacherManagement
                            teachers={teachers}
                            onEditTeacher={handleEditTeacher}
                            onDeleteTeacher={handleDeleteTeacher}
                            onAddTeacher={handleAddTeacher}
                            onFileImport={handleFileImport}
                            isImporting={isImporting}
                            importError={importError}
                            onDownloadTemplate={downloadTeacherExcelTemplate}
                            language={language}
                            T={T}
                        />

                        <SessionManagement
                            sessions={sessions}
                            onEditSession={handleEditSession}
                            onDeleteSession={handleDeleteSession}
                            onAddSession={handleAddSession}
                            hallCount={hallCount}
                            setHallCount={setHallCount}
                            onSessionFileImport={handleSessionFileImport}
                            isImportingSessions={isImportingSessions}
                            sessionImportError={sessionImportError}
                            onDownloadTemplate={downloadSessionExcelTemplate}
                            language={language}
                            T={T}
                        />
                    </Suspense>

                    <div className="sticky top-6">
                        <button onClick={handleGenerate} className="w-full bg-green-600 text-white py-3 px-4 rounded-lg shadow-lg hover:bg-green-700 flex items-center justify-center text-lg font-bold transition-all transform hover:scale-105">
                            <BrainCircuitIcon /> {T('generateDistribution')}
                        </button>
                    </div>
                </div>

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
                                                                {Object.entries(assignment.hallAssignments).map(([hallNum, proctors]) => {
                                                                    const hallNumber = parseInt(hallNum);
                                                                    return (
                                                                        <tr key={hallNum}>
                                                                            <td className="px-6 py-4 whitespace-nowrap font-medium">
                                                                                {T('hall')} {hallNum}
                                                                            </td>
                                                                            <td
                                                                                className={`px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${(proctors[0] as AssignedTeacher)?.isRepeat ? 'text-red-600 font-bold' : (proctors[0] as AssignedTeacher)?.isSubjectConflict ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''}`}
                                                                                onClick={() => handleEditAssignment(sessionId, hallNumber, 0, proctors[0])}
                                                                                title={T('clickToEdit')}
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <span>{proctors[0]?.name || <span className="text-gray-400">---</span>}</span>
                                                                                    {proctors[0]?.isSubjectConflict && (
                                                                                        <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20" title={language === 'ar' ? 'حراسة نفس المادة المدرسّة' : (language === 'fr' ? 'Surveillance de sa propre matière' : 'Guarding own subject')}>
                                                                                            {language === 'ar' ? 'المادة' : (language === 'fr' ? 'Matière' : 'Subject')}
                                                                                        </span>
                                                                                    )}
                                                                                    {proctors[0]?.isRepeat && (
                                                                                        <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-950/40 px-2 py-0.5 text-xs font-semibold text-red-800 dark:text-red-300 ring-1 ring-inset ring-red-600/20" title={language === 'ar' ? 'تكرار القاعة' : (language === 'fr' ? 'Salle répétée' : 'Repeated Hall')}>
                                                                                            {language === 'ar' ? 'تكرار' : (language === 'fr' ? 'Répété' : 'Repeat')}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td
                                                                                className={`px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${(proctors[1] as AssignedTeacher)?.isRepeat ? 'text-red-600 font-bold' : (proctors[1] as AssignedTeacher)?.isSubjectConflict ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''}`}
                                                                                onClick={() => handleEditAssignment(sessionId, hallNumber, 1, proctors[1])}
                                                                                title={T('clickToEdit')}
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <span>{proctors[1]?.name || <span className="text-gray-400">---</span>}</span>
                                                                                    {proctors[1]?.isSubjectConflict && (
                                                                                        <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20" title={language === 'ar' ? 'حراسة نفس المادة المدرسّة' : (language === 'fr' ? 'Surveillance de sa propre matière' : 'Guarding own subject')}>
                                                                                            {language === 'ar' ? 'المادة' : (language === 'fr' ? 'Matière' : 'Subject')}
                                                                                        </span>
                                                                                    )}
                                                                                    {proctors[1]?.isRepeat && (
                                                                                        <span className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-950/40 px-2 py-0.5 text-xs font-semibold text-red-800 dark:text-red-300 ring-1 ring-inset ring-red-600/20" title={language === 'ar' ? 'تكرار القاعة' : (language === 'fr' ? 'Salle répétée' : 'Repeated Hall')}>
                                                                                            {language === 'ar' ? 'تكرار' : (language === 'fr' ? 'Répété' : 'Repeat')}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
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
                                                    {(Object.values(distributionResult.stats) as { name: string; count: number }[]).sort((a, b) => b.count - a.count).map(stat => (
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

                            <Card>
                                <CardHeader><BrainCircuitIcon /> {T('aiSuggestionsTitle')}</CardHeader>
                                {isLoadingSuggestions && <p className="text-gray-600 dark:text-gray-300 animate-pulse">{T('aiAnalyzing')}...</p>}
                                {!isLoadingSuggestions && aiSuggestions && (
                                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {aiSuggestions.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
                                    </div>
                                )}
                            </Card>

                            <Card>
                                <CardHeader>{T('exportReports')}</CardHeader>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button onClick={handleExportPDF} disabled={isExporting} className={`flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center transition-colors ${isExporting ? 'opacity-75 cursor-not-allowed' : ''}`}>
                                        {isExporting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {T('exporting')}
                                            </>
                                        ) : (
                                            <>
                                                <FileDownIcon /> {T('exportPDF')}
                                            </>
                                        )}
                                    </button>
                                    <button onClick={() => exportToExcel(distributionResult, sessions, hallCount, T)} className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center transition-colors">
                                        <FileSpreadsheet /> {T('exportExcel')}
                                    </button>
                                    <button onClick={() => exportToCSV(distributionResult, sessions, hallCount, T)} className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center justify-center transition-colors">
                                        <FileText /> {T('exportCSV')}
                                    </button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button onClick={() => setIsSaveArchiveModalOpen(true)} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 flex items-center justify-center transition-colors">
                                        <ArchiveIconSmall /> {T('saveToArchive')}
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

            <Suspense fallback={null}>
                {assignmentEditConfig && distributionResult && (
                    <AssignmentEditModal
                        teachers={teachers}
                        sessionAssignment={distributionResult.assignments[assignmentEditConfig.sessionId]}
                        currentTeacher={assignmentEditConfig.currentTeacher}
                        onSave={handleAssignmentUpdate}
                        onClose={() => setAssignmentEditConfig(null)}
                        T={T}
                    />
                )}
                {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} T={T} />}
                {isTeacherModalOpen && <TeacherModal teacher={currentTeacher} sessions={sessions} onSave={handleSaveTeacher} onClose={() => setIsTeacherModalOpen(false)} T={T} />}
                {isSessionModalOpen && <SessionModal session={currentSession} subjects={uniqueSubjects} onSave={handleSaveSession} onClose={() => setIsSessionModalOpen(false)} T={T} />}
                {isArchiveModalOpen && (
                    <ArchiveModal
                        onClose={() => setIsArchiveModalOpen(false)}
                        T={T}
                        language={language}
                    />
                )}
                {isSaveArchiveModalOpen && distributionResult && (
                    <SaveArchiveModal
                        distributionResult={distributionResult}
                        sessions={sessions}
                        teachers={teachers}
                        hallCount={hallCount}
                        onClose={() => {
                            setIsSaveArchiveModalOpen(false);
                            setArchiveName('');
                        }}
                        T={T}
                    />
                )}
                {isLogoutConfirmOpen && (
                    <LogoutConfirmModal
                        onKeepAndLogout={handleLogoutKeep}
                        onDiscardAndLogout={handleLogoutDiscard}
                        onClose={() => setIsLogoutConfirmOpen(false)}
                        T={T}
                    />
                )}
            </Suspense>

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
            {isArchiveModalOpen && (
                <ArchiveModal
                    onClose={() => setIsArchiveModalOpen(false)}
                    T={T}
                    language={language}
                />
            )}
            {isSaveArchiveModalOpen && distributionResult && (
                <SaveArchiveModal
                    distributionResult={distributionResult}
                    sessions={sessions}
                    teachers={teachers}
                    hallCount={hallCount}
                    onClose={() => {
                        setIsSaveArchiveModalOpen(false);
                        setArchiveName('');
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


// Removed UI components (Card, CardHeader)

// Removed Modals (SettingsModal, TeacherModal, SessionModal, ArchiveModal, SaveArchiveModal, AssignmentEditModal)