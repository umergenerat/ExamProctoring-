import type { Teacher, Session, DistributionResult, FullAssignment, TeacherStats } from '../types';

// Interface to track which halls each teacher has been assigned to
interface TeacherHallHistory {
  [teacherId: string]: Set<number>;
}

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

  // Track hall history to avoid repeating same hall for each teacher
  const teacherHallHistory: TeacherHallHistory = {};
  teachers.forEach(t => {
    teacherHallHistory[t.id] = new Set<number>();
  });

  for (const session of sessions) {
    // Filter teachers who can proctor this session (not their subject, and are available)
    let availableTeachers = teachers.filter(t => 
        t.subject.toLowerCase() !== session.subject.toLowerCase() &&
        !(t.availability || []).includes(session.id)
    );
    
    // Further filter by max sessions allowed
    availableTeachers = availableTeachers.filter(t => teacherStats[t.id].count < t.maxSessions);

    const hallAssignments: { [hallNumber: number]: Teacher[] } = {};

    for (let i = 1; i <= hallCount; i++) {
        hallAssignments[i] = [];
    }

    // Assign 2 teachers per hall
    for (let hallNum = 1; hallNum <= hallCount; hallNum++) {
      // Sort available teachers by:
      // 1. Least assignment count (prioritize those with fewer sessions)
      // 2. Whether they have NOT been in this hall before (prioritize new halls)
      // 3. Add randomness among equal candidates
      const sortedTeachers = [...availableTeachers].sort((a, b) => {
        // Primary: least assignments first
        const countDiff = teacherStats[a.id].count - teacherStats[b.id].count;
        if (countDiff !== 0) return countDiff;
        
        // Secondary: prefer teachers who haven't been in this hall
        const aHasBeenInHall = teacherHallHistory[a.id].has(hallNum) ? 1 : 0;
        const bHasBeenInHall = teacherHallHistory[b.id].has(hallNum) ? 1 : 0;
        if (aHasBeenInHall !== bHasBeenInHall) return aHasBeenInHall - bHasBeenInHall;
        
        // Tertiary: random for variety
        return Math.random() - 0.5;
      });

      for (let i = 0; i < 2; i++) {
        if (sortedTeachers.length > 0) {
          const teacher = sortedTeachers.shift()!;
          hallAssignments[hallNum].push(teacher);
          teacherStats[teacher.id].count++;
          
          // Track that this teacher has been assigned to this hall
          teacherHallHistory[teacher.id].add(hallNum);
          
          // Remove assigned teacher from availableTeachers
          availableTeachers = availableTeachers.filter(t => t.id !== teacher.id);
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