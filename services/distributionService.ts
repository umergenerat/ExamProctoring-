import type { Teacher, Session, DistributionResult, FullAssignment, TeacherStats } from '../types';

// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateDistribution = (
  teachers: Teacher[],
  sessions: Session[],
  hallCount: number
): DistributionResult | null => {
  if (teachers.length === 0 || sessions.length === 0 || hallCount <= 0) {
    return null;
  }

  const assignments: FullAssignment = {};
  const teacherStats: TeacherStats = teachers.reduce((acc, teacher) => {
    acc[teacher.id] = { name: teacher.name, count: 0 };
    return acc;
  }, {} as TeacherStats);

  const teachersNeededPerSession = hallCount * 2;

  // Warning for insufficient teachers is now handled in the UI before calling this function,
  // making this service cleaner and more focused on the distribution logic itself.

  for (const session of sessions) {
    // Filter teachers who can proctor this session (not their subject, and are available)
    let availableTeachers = teachers.filter(t => 
        t.subject.toLowerCase() !== session.subject.toLowerCase() &&
        !(t.availability || []).includes(session.id)
    );

    // Sort available teachers by current assignment count (ascending) to prioritize those with fewer assignments
    availableTeachers.sort((a, b) => teacherStats[a.id].count - teacherStats[b.id].count);
    
    // Further filter by max sessions allowed
    availableTeachers = availableTeachers.filter(t => teacherStats[t.id].count < t.maxSessions);

    // Shuffle to add randomness among teachers with the same assignment count
    availableTeachers = shuffleArray(availableTeachers);
    
    const assignedTeachers: Teacher[] = [];
    const hallAssignments: { [hallNumber: number]: Teacher[] } = {};

    for (let i = 1; i <= hallCount; i++) {
        hallAssignments[i] = [];
    }

    // Assign 2 teachers per hall
    for (let hallNum = 1; hallNum <= hallCount; hallNum++) {
      for (let i = 0; i < 2; i++) {
        if (availableTeachers.length > 0) {
          const teacher = availableTeachers.shift()!;
          hallAssignments[hallNum].push(teacher);
          assignedTeachers.push(teacher);
          teacherStats[teacher.id].count++;
        }
      }
    }
    
    // Remaining available teachers are reserves
    const reserves = availableTeachers;

    assignments[session.id] = {
      hallAssignments,
      reserves,
    };
  }

  return { assignments, stats: teacherStats };
};