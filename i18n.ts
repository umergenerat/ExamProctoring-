export const translations = {
  ar: {
    appTitle: 'مُوَزِّع مهام حراسة الامتحانات',
    appDeveloper: 'تطوير: عمر ايت لوتو',

    // --- Header ---
    logout: 'تسجيل الخروج',
    toggleTheme: 'تغيير المظهر',
    toggleLanguage: 'تغيير اللغة',

    // --- General UI ---
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    unavailable: 'غير متوفر',
    none: 'لا يوجد',
    close: 'إغلاق',

    // --- Teacher Management ---
    manageTeachers: 'إدارة الأساتذة',
    addTeacher: 'إضافة أستاذ',
    maxSessionsSuffix: 'حصص كحد أقصى',

    // --- Session Management ---
    examsSchedule: 'برنامج الامتحانات',
    addSession: 'إضافة حصة',
    sessionSubject: 'المادة',
    hallCountLabel: 'عدد القاعات',

    // --- Main Action ---
    generateDistribution: 'توليد التوزيع الذكي',

    // --- Import ---
    importTeachers: 'استيراد بيانات الأساتذة',
    importTeachersHelp: 'استورد من ملف CSV أو صورة لجدول (PNG, JPG). للـ PDF، يرجى أخذ لقطة شاشة.',
    chooseFile: 'اختر ملفًا',
    importing: 'جاري الاستيراد...',
    importErrorUnsupportedFile: 'نوع الملف غير مدعوم. يرجى اختيار ملف CSV أو صورة.',
    importErrorAIParse: 'لم يتمكن الذكاء الاصطناعي من تحليل الصورة بشكل صحيح. حاول مرة أخرى بصورة أوضح.',
    importErrorGeneric: 'فشل استيراد البيانات. يرجى المحاولة مرة أخرى.',
    importSuccess: 'اكتمل الاستيراد. تم تحديث {updated} أساتذة وإضافة {added} أساتذة جدد.',
    importSuccessNoConflict: 'تم استيراد {count} أساتذة بنجاح.',
    importNoNewTeachers: 'لم يتم العثور على أساتذة جدد لاستيرادهم أو جميعهم موجودون بالفعل.',

    // --- Conflict Modal ---
    importConflictTitle: 'معالجة تكرار الأسماء',
    importConflictMessage: 'تم العثور على أساتذة في الملف بنفس أسماء أساتذة موجودين بالفعل في النظام. الرجاء تحديد الإجراء المطلوب لكل حالة.',
    updateAll: 'تحديث الكل',
    skipAll: 'تجاهل الكل',
    updateData: 'تحديث البيانات',
    skipChanges: 'تجاهل التغييرات',
    confirmAndExecute: 'تأكيد وتنفيذ',
    cancelImport: 'إلغاء الاستيراد',
    currentSubject: 'المادة الحالية',
    newSubject: 'المادة الجديدة',
    currentSessions: 'الحصص الحالية',
    newSessions: 'الحصص الجديدة',
    currentNotes: 'ملاحظات حالية',
    newNotes: 'ملاحظات جديدة',

    // --- Results View ---
    readyToStart: 'جاهز لبدء التوزيع',
    readyToStartHelp: 'أدخل بيانات الأساتذة والحصص ثم اضغط على "توليد التوزيع الذكي".',
    distributionResults: 'نتائج التوزيع',
    viewBySession: 'عرض حسب الحصة',
    teacherSummary: 'ملخص الأساتذة',
    hall: 'القاعة',
    proctor1: 'المراقب 1',
    proctor2: 'المراقب 2',
    reserves: 'الاحتياط',
    noReserves: 'لا يوجد',
    teacher: 'الأستاذ',
    sessionCount: 'عدد الحصص',

    // --- AI Suggestions ---
    aiSuggestionsTitle: 'اقتراحات التحسين والتنظيم',
    aiAnalyzing: 'جاري تحليل النتائج وطلب الاقتراحات من الذكاء الاصطناعي',
    aiError: 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى التأكد من صحة مفتاح API الخاص بك في الإعدادات والمحاولة مرة أخرى.',

    // --- API Key & Settings ---
    settings: 'الإعدادات',
    settingsTitle: 'إعدادات التطبيق',
    settingsDescription: 'الرجاء إدخال مفتاح Google Gemini API الخاص بك. يتم تخزين هذا المفتاح محليًا في متصفحك ولا يتم إرساله أبدًا إلى خوادمنا.',
    geminiApiKey: 'مفتاح Gemini API',
    apiKeyPlaceholder: 'أدخل مفتاحك هنا',
    settingsSaved: 'تم الحفظ بنجاح!',

    // --- Export ---
    exportReports: 'تصدير التقارير',
    exportPDF: 'تصدير PDF',
    errorExportingPDF: 'حدث خطأ أثناء تصدير PDF. يرجى المحاولة مرة أخرى.',
    exportCSV: 'تصدير CSV',
    exporting: 'جاري التصدير...',
    filePrefix: 'توزيع_الحراسة',

    // --- Auth Page ---
    authLoginTitle: 'تسجيل الدخول',
    authSignupTitle: 'إنشاء حساب جديد',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    login: 'دخول',
    signup: 'إنشاء حساب',
    signupPrompt: 'ليس لديك حساب؟ أنشئ واحدا',
    loginPrompt: 'لديك حساب بالفعل؟ سجل دخولك',
    authErrorRequired: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.',
    authErrorEmail: 'الرجاء إدخال بريد إلكتروني صالح.',
    authErrorInvalid: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    authErrorPassword: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.',
    authErrorExists: 'هذا البريد الإلكتروني مسجل بالفعل.',

    // --- Modals ---
    modalEditTeacher: 'تعديل بيانات الأستاذ',
    modalAddTeacher: 'إضافة أستاذ جديد',
    modalEditSession: 'تعديل بيانات الحصة',
    modalAddSession: 'إضافة حصة جديدة',
    fullName: 'الاسم الكامل',
    subjectTaught: 'المادة المدرسة',
    maxSessions: 'الحد الأقصى للحصص',
    notes: 'ملاحظات',
    availabilityHelp: 'حصص عدم التوفر (اختياري)',
    noSessionsForAvailability: 'لا توجد حصص لإعداد التوفر. يرجى إضافتها أولاً.',
    subjectProgrammed: 'المادة المبرمجة',
    chooseSubject: 'اختر المادة',
    day: 'اليوم',
    period: 'الفترة',
    slot: 'الحصة',
    morningPeriod: 'الفترة الصباحية',
    eveningPeriod: 'الفترة المسائية',

    // --- Confirmation Modals ---
    deleteTeacherConfirmTitle: 'تأكيد حذف الأستاذ',
    deleteTeacherConfirmMessage: 'هل أنت متأكد من حذف هذا الأستاذ؟ لا يمكن التراجع عن هذا الإجراء.',
    deleteSessionConfirmTitle: 'تأكيد حذف الحصة',
    deleteSessionConfirmMessage: 'هل أنت متأكد من حذف هذه الحصة؟',
    confirmDelete: 'تأكيد الحذف',
    warning: 'تحذير',
    warningProctorsForSession: `بالنسبة للحصة "{sessionName}"، لا يوجد عدد كافٍ من الأساتذة المؤهلين بسبب تعارض المواد. المتوفر: {eligibleCount}، المطلوب: {neededCount}. سيؤدي هذا إلى قاعات فارغة في هذه الحصة. هل تريد المتابعة على أي حال؟`,
    warningProctorsOverall: `إجمالي الحصص المتاحة من الأساتذة ({available}) أقل من المطلوب ({needed}). قد ينتج عن هذا قاعات فارغة. هل تريد المتابعة؟`,
    continueAnyway: 'متابعة',

    // --- PDF Export ---
    pdfReportTitle: 'تقرير توزيع مهام حراسة الامتحانات',
    pdfSessionTitle: 'الحصة:',
    pdfProctor1: 'المراقب 1',
    pdfProctor2: 'المراقب 2',
    pdfHall: 'القاعة',
    pdfReserves: 'الأساتذة الاحتياط:',
    pdfNoReserves: 'لا يوجد',
    pdfSummaryTitle: 'ملخص توزيع الحصص على الأساتذة',
    pdfSessionCount: 'عدد الحصص',
    pdfTeacherName: 'اسم الأستاذ',

    // --- CSV Export ---
    csvSession: 'الحصة',
    csvSubject: 'المادة',
    csvHall: 'القاعة',
    csvProctor1: 'المراقب 1',
    csvProctor2: 'المراقب 2',
    csvReserves: 'الاحتياط',

    // --- Archive ---
    archive: 'الأرشيف',
    archiveEmpty: 'لا توجد توزيعات محفوظة',
    saveToArchive: 'حفظ في الأرشيف',
    archiveName: 'اسم التوزيع',
    archiveDate: 'التاريخ',
    deleteFromArchive: 'حذف',
    archiveSaved: 'تم الحفظ في الأرشيف بنجاح!',
    viewArchive: 'عرض الأرشيف',
    archiveNamePlaceholder: 'مثال: امتحانات الفصل الأول',
    confirmDeleteArchive: 'هل أنت متأكد من حذف هذا التوزيع من الأرشيف؟',
    archiveActions: 'الإجراءات',

    // --- Gemini Prompts ---
    geminiStatsSummaryLine: 'الأستاذ {name}: {count} حصص',
    geminiSuggestionsPrompt: `
أنا مدير مدرسة قمت بتوزيع مهام حراسة الامتحانات باستخدام نظام آلي. هذه هي ملخص النتائج:
- إجمالي عدد الأساتذة: {teacherCount}
- إجمالي عدد الحصص الامتحانية: {sessionCount}
- إجمالي عدد قاعات الامتحان: {hallCount}
- توزيع الحصص على كل أستاذ:
{statsSummary}

بناءً على هذه البيانات، يرجى تقديم تحليل تربوي وتنظيمي واقتراح تحسينات. ركز على النقاط التالية:
1.  تقييم عدالة التوزيع بين الأساتذة.
2.  اقتراحات لتحسين الكفاءة وتقليل العبء على بعض الأساتذة إن وجد.
3.  أفكار تنظيمية للمستقبل بناءً على هذه الأرقام (مثل الحاجة لأساتذة احتياط، أو تقليص عدد الحصص).
4.  توصيات بيداغوچية لضمان أفضل ظروف لإجراء الامتحانات.

قدم الإجابة باللغة العربية على شكل نقاط واضحة وموجزة.`,
    geminiImageExtractionPrompt: `
قم بتحليل الصورة المرفقة، والتي تحتوي على جدول ببيانات الأساتذة. استخرج البيانات لكل أستاذ وأرجعها كـ JSON array.
يجب أن يحتوي كل object في الـ array على الحقول التالية: 'name', 'subject', 'maxSessions' (كرقم), و 'notes' (كنص).
إذا كان الحقل غير موجود، استخدم قيمة افتراضية مناسبة (string فارغ أو 4 لـ maxSessions). تجاهل أي صفوف فارغة أو صف الرأس.
تأكد من أن الإخراج هو JSON صالح فقط ولا شيء غيره.`,
    geminiSchemaName: "اسم الأستاذ الكامل",
    geminiSchemaSubject: "المادة التي يدرسها",
    geminiSchemaMaxSessions: "الحد الأقصى للحصص",
    geminiSchemaNotes: "أي ملاحظات إضافية",
  },
  en: {
    appTitle: 'Exam Proctoring Duty Distributor',
    appDeveloper: 'Developed by: Aomar Ait Loutou',

    // --- Header ---
    logout: 'Logout',
    toggleTheme: 'Toggle Theme',
    toggleLanguage: 'Toggle Language',

    // --- General UI ---
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    unavailable: 'Unavailable',
    none: 'None',
    close: 'Close',

    // --- Teacher Management ---
    manageTeachers: 'Manage Teachers',
    addTeacher: 'Add Teacher',
    maxSessionsSuffix: 'max sessions',

    // --- Session Management ---
    examsSchedule: 'Exams Schedule',
    addSession: 'Add Session',
    sessionSubject: 'Subject',
    hallCountLabel: 'Number of Halls',

    // --- Main Action ---
    generateDistribution: 'Generate Smart Distribution',

    // --- Import ---
    importTeachers: 'Import Teacher Data',
    importTeachersHelp: 'Import from a CSV file or an image of a table (PNG, JPG). For PDFs, please take a screenshot.',
    chooseFile: 'Choose a file',
    importing: 'Importing...',
    importErrorUnsupportedFile: 'Unsupported file type. Please select a CSV or image file.',
    importErrorAIParse: 'The AI could not parse the image correctly. Try again with a clearer image.',
    importErrorGeneric: 'Failed to import data. Please try again.',
    importSuccess: 'Import complete. Updated {updated} teachers and added {added} new teachers.',
    importSuccessNoConflict: 'Successfully imported {count} teachers.',
    importNoNewTeachers: 'No new teachers were found to import, or they all already exist.',

    // --- Conflict Modal ---
    importConflictTitle: 'Handle Name Duplicates',
    importConflictMessage: 'Teachers were found in the file with the same names as teachers already in the system. Please select the desired action for each case.',
    updateAll: 'Update All',
    skipAll: 'Skip All',
    updateData: 'Update Data',
    skipChanges: 'Skip Changes',
    confirmAndExecute: 'Confirm and Execute',
    cancelImport: 'Cancel Import',
    currentSubject: 'Current Subject',
    newSubject: 'New Subject',
    currentSessions: 'Current Sessions',
    newSessions: 'New Sessions',
    currentNotes: 'Current Notes',
    newNotes: 'New Notes',

    // --- Results View ---
    readyToStart: 'Ready to Start Distribution',
    readyToStartHelp: 'Enter teacher and session data, then click "Generate Smart Distribution".',
    distributionResults: 'Distribution Results',
    viewBySession: 'View by Session',
    teacherSummary: 'Teacher Summary',
    hall: 'Hall',
    proctor1: 'Proctor 1',
    proctor2: 'Proctor 2',
    reserves: 'Reserves',
    noReserves: 'None',
    teacher: 'Teacher',
    sessionCount: 'Session Count',

    // --- AI Suggestions ---
    aiSuggestionsTitle: 'Improvement and Organization Suggestions',
    aiAnalyzing: 'Analyzing results and requesting suggestions from the AI',
    aiError: 'An error occurred with the AI. Please ensure your API key is correctly configured in the Settings and try again.',

    // --- API Key & Settings ---
    settings: 'Settings',
    settingsTitle: 'Application Settings',
    settingsDescription: 'Please enter your Google Gemini API key. This key is stored locally in your browser and is never sent to our servers.',
    geminiApiKey: 'Gemini API Key',
    apiKeyPlaceholder: 'Enter your key here',
    settingsSaved: 'Saved successfully!',

    // --- Export ---
    exportReports: 'Export Reports',
    exportPDF: 'Export PDF',
    errorExportingPDF: 'Failed to export PDF. Please try again.',
    exportCSV: 'Export CSV',
    exporting: 'Exporting...',
    filePrefix: 'Proctoring_Distribution',

    // --- Auth Page ---
    authLoginTitle: 'Login',
    authSignupTitle: 'Create a New Account',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    signup: 'Sign Up',
    signupPrompt: "Don't have an account? Sign up",
    loginPrompt: 'Already have an account? Login',
    authErrorRequired: 'Please enter both email and password.',
    authErrorEmail: 'Please enter a valid email address.',
    authErrorInvalid: 'Incorrect email or password.',
    authErrorPassword: 'Password must be at least 6 characters long.',
    authErrorExists: 'This email is already registered.',

    // --- Modals ---
    modalEditTeacher: 'Edit Teacher Information',
    modalAddTeacher: 'Add New Teacher',
    modalEditSession: 'Edit Session Information',
    modalAddSession: 'Add New Session',
    fullName: 'Full Name',
    subjectTaught: 'Subject Taught',
    maxSessions: 'Maximum Sessions',
    notes: 'Notes',
    availabilityHelp: 'Unavailability Sessions (Optional)',
    noSessionsForAvailability: 'No sessions available to set unavailability. Please add them first.',
    subjectProgrammed: 'Programmed Subject',
    chooseSubject: 'Choose Subject',
    day: 'Day',
    period: 'Period',
    slot: 'Slot',
    morningPeriod: 'Morning Period',
    eveningPeriod: 'Evening Period',

    // --- Confirmation Modals ---
    deleteTeacherConfirmTitle: 'Confirm Teacher Deletion',
    deleteTeacherConfirmMessage: 'Are you sure you want to delete this teacher? This action cannot be undone.',
    deleteSessionConfirmTitle: 'Confirm Session Deletion',
    deleteSessionConfirmMessage: 'Are you sure you want to delete this session?',
    confirmDelete: 'Confirm Deletion',
    warning: 'Warning',
    warningProctorsForSession: `For session "{sessionName}", there are not enough eligible teachers due to subject conflicts. Available: {eligibleCount}, Needed: {neededCount}. This will result in empty halls for this session. Do you want to proceed anyway?`,
    warningProctorsOverall: `The total available sessions from teachers ({available}) is less than the required amount ({needed}). This may result in empty halls. Do you want to continue?`,
    continueAnyway: 'Continue Anyway',

    // --- PDF Export ---
    pdfReportTitle: 'Exam Proctoring Duty Distribution Report',
    pdfSessionTitle: 'Session:',
    pdfProctor1: 'Proctor 1',
    pdfProctor2: 'Proctor 2',
    pdfHall: 'Hall',
    pdfReserves: 'Reserve Teachers:',
    pdfNoReserves: 'None',
    pdfSummaryTitle: 'Teacher Session Distribution Summary',
    pdfSessionCount: 'Session Count',
    pdfTeacherName: 'Teacher Name',

    // --- CSV Export ---
    csvSession: 'Session',
    csvSubject: 'Subject',
    csvHall: 'Hall',
    csvProctor1: 'Proctor 1',
    csvProctor2: 'Proctor 2',
    csvReserves: 'Reserves',

    // --- Archive ---
    archive: 'Archive',
    archiveEmpty: 'No saved distributions',
    saveToArchive: 'Save to Archive',
    archiveName: 'Distribution Name',
    archiveDate: 'Date',
    deleteFromArchive: 'Delete',
    archiveSaved: 'Saved to archive successfully!',
    viewArchive: 'View Archive',
    archiveNamePlaceholder: 'e.g., First Semester Exams',
    confirmDeleteArchive: 'Are you sure you want to delete this distribution from the archive?',
    archiveActions: 'Actions',

    // --- Gemini Prompts ---
    geminiStatsSummaryLine: 'Teacher {name}: {count} sessions',
    geminiSuggestionsPrompt: `
As a school principal, I have used an automated system to distribute exam proctoring duties. Here is the summary of the results:
- Total number of teachers: {teacherCount}
- Total number of exam sessions: {sessionCount}
- Total number of exam halls: {hallCount}
- Distribution of sessions per teacher:
{statsSummary}

Based on this data, please provide an educational and organizational analysis with suggestions for improvement. Focus on the following points:
1.  Evaluate the fairness of the distribution among teachers.
2.  Suggest improvements for efficiency and to reduce the workload on some teachers, if any.
3.  Provide organizational ideas for the future based on these numbers (e.g., need for reserve teachers, reducing the number of sessions).
4.  Offer pedagogical recommendations to ensure the best conditions for conducting exams.

Provide the answer in English as clear and concise points.`,
    geminiImageExtractionPrompt: `
Analyze the attached image, which contains a table of teacher data. Extract the data for each teacher and return it as a JSON array.
Each object in the array must contain the following fields: 'name', 'subject', 'maxSessions' (as a number), and 'notes' (as text).
If a field is missing, use an appropriate default value (empty string or 4 for maxSessions). Ignore any empty rows or the header row.
Ensure the output is only valid JSON and nothing else.`,
    geminiSchemaName: "Full name of the teacher",
    geminiSchemaSubject: "The subject they teach",
    geminiSchemaMaxSessions: "The maximum number of sessions",
    geminiSchemaNotes: "Any additional notes",
  },
  fr: {
    appTitle: 'Distributeur de Tâches de Surveillance d\'Examen',
    appDeveloper: 'Développé par: Aomar Ait Loutou',

    // --- Header ---
    logout: 'Déconnexion',
    toggleTheme: 'Changer de Thème',
    toggleLanguage: 'Changer de Langue',

    // --- General UI ---
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    unavailable: 'Indisponible',
    none: 'Aucun',
    close: 'Fermer',

    // --- Teacher Management ---
    manageTeachers: 'Gérer les Enseignants',
    addTeacher: 'Ajouter un Enseignant',
    maxSessionsSuffix: 'sessions max',

    // --- Session Management ---
    examsSchedule: 'Calendrier des Examens',
    addSession: 'Ajouter une Session',
    sessionSubject: 'Matière',
    hallCountLabel: 'Nombre de Salles',

    // --- Main Action ---
    generateDistribution: 'Générer la Répartition Intelligente',

    // --- Import ---
    importTeachers: 'Importer les Données des Enseignants',
    importTeachersHelp: 'Importer depuis un fichier CSV ou une image d\'un tableau (PNG, JPG). Pour les PDF, veuillez prendre une capture d\'écran.',
    chooseFile: 'Choisir un fichier',
    importing: 'Importation en cours...',
    importErrorUnsupportedFile: 'Type de fichier non supporté. Veuillez sélectionner un fichier CSV ou une image.',
    importErrorAIParse: 'L\'IA n\'a pas pu analyser l\'image correctement. Réessayez avec une image plus claire.',
    importErrorGeneric: 'Échec de l\'importation des données. Veuillez réessayer.',
    importSuccess: 'Importation terminée. {updated} enseignants mis à jour et {added} nouveaux enseignants ajoutés.',
    importSuccessNoConflict: '{count} enseignants importés avec succès.',
    importNoNewTeachers: 'Aucun nouvel enseignant trouvé à importer, ou ils existent tous déjà.',

    // --- Conflict Modal ---
    importConflictTitle: 'Gérer les Doublons de Noms',
    importConflictMessage: 'Des enseignants avec les mêmes noms que ceux déjà présents dans le système ont été trouvés. Veuillez sélectionner l\'action souhaitée pour chaque cas.',
    updateAll: 'Tout Mettre à Jour',
    skipAll: 'Tout Ignorer',
    updateData: 'Mettre à Jour',
    skipChanges: 'Ignorer',
    confirmAndExecute: 'Confirmer et Exécuter',
    cancelImport: 'Annuler l\'Importation',
    currentSubject: 'Matière Actuelle',
    newSubject: 'Nouvelle Matière',
    currentSessions: 'Sessions Actuelles',
    newSessions: 'Nouvelles Sessions',
    currentNotes: 'Notes Actuelles',
    newNotes: 'Nouvelles Notes',

    // --- Results View ---
    readyToStart: 'Prêt à Démarrer la Répartition',
    readyToStartHelp: 'Saisissez les données des enseignants et des sessions, puis cliquez sur "Générer la Répartition Intelligente".',
    distributionResults: 'Résultats de la Répartition',
    viewBySession: 'Par Session',
    teacherSummary: 'Résumé par Enseignant',
    hall: 'Salle',
    proctor1: 'Surveillant 1',
    proctor2: 'Surveillant 2',
    reserves: 'Réservistes',
    noReserves: 'Aucun',
    teacher: 'Enseignant',
    sessionCount: 'Nombre de Sessions',

    // --- AI Suggestions ---
    aiSuggestionsTitle: 'Suggestions d\'Amélioration',
    aiAnalyzing: 'Analyse des résultats et demande de suggestions à l\'IA',
    aiError: 'Une erreur est survenue avec l\'IA. Veuillez vous assurer que votre clé API est correctement configurée dans les Paramètres et réessayez.',

    // --- API Key & Settings ---
    settings: 'Paramètres',
    settingsTitle: 'Paramètres de l\'Application',
    settingsDescription: 'Veuillez entrer votre clé API Google Gemini. Cette clé est stockée localement dans votre navigateur et n\'est jamais envoyée à nos serveurs.',
    geminiApiKey: 'Clé API Gemini',
    apiKeyPlaceholder: 'Entrez votre clé ici',
    settingsSaved: 'Enregistré avec succès !',

    // --- Export ---
    exportReports: 'Exporter les Rapports',
    exportPDF: 'Exporter en PDF',
    errorExportingPDF: 'Échec de l\'exportation PDF. Veuillez réessayer.',
    exportCSV: 'Exporter en CSV',
    exporting: 'Exportation...',
    filePrefix: 'Repartition_Surveillance',

    // --- Auth Page ---
    authLoginTitle: 'Connexion',
    authSignupTitle: 'Créer un Nouveau Compte',
    email: 'E-mail',
    password: 'Mot de passe',
    login: 'Se connecter',
    signup: 'S\'inscrire',
    signupPrompt: 'Pas de compte ? Inscrivez-vous',
    loginPrompt: 'Déjà un compte ? Connectez-vous',
    authErrorRequired: 'Veuillez saisir l\'e-mail et le mot de passe.',
    authErrorEmail: 'Veuillez saisir une adresse e-mail valide.',
    authErrorInvalid: 'E-mail ou mot de passe incorrect.',
    authErrorPassword: 'Le mot de passe doit comporter au moins 6 caractères.',
    authErrorExists: 'Cet e-mail est déjà enregistré.',

    // --- Modals ---
    modalEditTeacher: 'Modifier les Informations de l\'Enseignant',
    modalAddTeacher: 'Ajouter un Nouvel Enseignant',
    modalEditSession: 'Modifier les Informations de la Session',
    modalAddSession: 'Ajouter une Nouvelle Session',
    fullName: 'Nom Complet',
    subjectTaught: 'Matière Enseignée',
    maxSessions: 'Nombre Maximum de Sessions',
    notes: 'Remarques',
    availabilityHelp: 'Sessions d\'indisponibilité (Optionnel)',
    noSessionsForAvailability: 'Aucune session disponible pour définir l\'indisponibilité. Veuillez d\'abord les ajouter.',
    subjectProgrammed: 'Matière Programmée',
    chooseSubject: 'Choisir la matière',
    day: 'Jour',
    period: 'Période',
    slot: 'Séance',
    morningPeriod: 'Période du Matin',
    eveningPeriod: 'Période de l\'Après-midi',

    // --- Confirmation Modals ---
    deleteTeacherConfirmTitle: 'Confirmer la Suppression de l\'Enseignant',
    deleteTeacherConfirmMessage: 'Êtes-vous sûr de vouloir supprimer cet enseignant ? Cette action est irréversible.',
    deleteSessionConfirmTitle: 'Confirmer la Suppression de la Session',
    deleteSessionConfirmMessage: 'Êtes-vous sûr de vouloir supprimer cette session ?',
    confirmDelete: 'Confirmer la Suppression',
    warning: 'Avertissement',
    warningProctorsForSession: `Pour la session "{sessionName}", il n'y a pas assez d'enseignants éligibles en raison de conflits de matières. Disponible : {eligibleCount}, Requis : {neededCount}. Cela entraînera des salles vides pour cette session. Voulez-vous continuer quand même ?`,
    warningProctorsOverall: `Le nombre total de sessions disponibles des enseignants ({available}) est inférieur au nombre requis ({needed}). Cela peut entraîner des salles vides. Voulez-vous continuer ?`,
    continueAnyway: 'Continuer quand même',

    // --- PDF Export ---
    pdfReportTitle: 'Rapport de Répartition des Tâches de Surveillance',
    pdfSessionTitle: 'Session :',
    pdfProctor1: 'Surveillant 1',
    pdfProctor2: 'Surveillant 2',
    pdfHall: 'Salle',
    pdfReserves: 'Enseignants de Réserve :',
    pdfNoReserves: 'Aucun',
    pdfSummaryTitle: 'Résumé de la Répartition des Sessions par Enseignant',
    pdfSessionCount: 'Nombre de Sessions',
    pdfTeacherName: 'Nom de l\'Enseignant',

    // --- CSV Export ---
    csvSession: 'Session',
    csvSubject: 'Matière',
    csvHall: 'Salle',
    csvProctor1: 'Surveillant 1',
    csvProctor2: 'Surveillant 2',
    csvReserves: 'Réservistes',

    // --- Archive ---
    archive: 'Archives',
    archiveEmpty: 'Aucune distribution enregistrée',
    saveToArchive: 'Enregistrer dans les Archives',
    archiveName: 'Nom de la Distribution',
    archiveDate: 'Date',
    deleteFromArchive: 'Supprimer',
    archiveSaved: 'Enregistré dans les archives avec succès !',
    viewArchive: 'Voir les Archives',
    archiveNamePlaceholder: 'ex: Examens du Premier Semestre',
    confirmDeleteArchive: 'Êtes-vous sûr de vouloir supprimer cette distribution des archives ?',
    archiveActions: 'Actions',

    // --- Gemini Prompts ---
    geminiStatsSummaryLine: 'Enseignant {name}: {count} sessions',
    geminiSuggestionsPrompt: `
En tant que directeur d'école, j'ai utilisé un système automatisé pour répartir les tâches de surveillance d'examen. Voici le résumé des résultats :
- Nombre total d'enseignants : {teacherCount}
- Nombre total de sessions d'examen : {sessionCount}
- Nombre total de salles d'examen : {hallCount}
- Répartition des sessions par enseignant :
{statsSummary}

Sur la base de ces données, veuillez fournir une analyse pédagogique et organisationnelle avec des suggestions d'amélioration. Concentrez-vous sur les points suivants :
1. Évaluer l'équité de la répartition entre les enseignants.
2. Suggérer des améliorations pour l'efficacité et pour réduire la charge de travail de certains enseignants, le cas échéant.
3. Fournir des idées d'organisation pour l'avenir basées sur ces chiffres (par exemple, besoin d'enseignants de réserve, réduction du nombre de sessions).
4. Offrir des recommandations pédagogiques pour assurer les meilleures conditions de déroulement des examens.

Fournissez la réponse en français sous forme de points clairs et concis.`,
    geminiImageExtractionPrompt: `
Analysez l'image ci-jointe, qui contient un tableau de données sur les enseignants. Extrayez les données pour chaque enseignant et retournez-les sous forme de tableau JSON.
Chaque objet du tableau doit contenir les champs suivants : 'name', 'subject', 'maxSessions' (en tant que nombre), et 'notes' (en tant que texte).
Si un champ est manquant, utilisez une valeur par défaut appropriée (chaîne vide ou 4 pour maxSessions). Ignorez les lignes vides ou la ligne d'en-tête.
Assurez-vous que la sortie est uniquement du JSON valide et rien d'autre.`,
    geminiSchemaName: "Nom complet de l'enseignant",
    geminiSchemaSubject: "La matière qu'il enseigne",
    geminiSchemaMaxSessions: "Le nombre maximum de sessions",
    geminiSchemaNotes: "Toutes notes supplémentaires",
  },
};

export type TranslationKeys = keyof typeof translations.en;

export type TFunction = (key: TranslationKeys) => string;

export const t = (key: TranslationKeys, lang: 'ar' | 'en' | 'fr'): string => {
  return translations[lang]?.[key] || translations.en[key] || key;
};