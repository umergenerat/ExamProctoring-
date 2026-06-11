import type { Teacher, Session, DistributionResult, FullAssignment, TeacherStats, AssignedTeacher } from '../types';

// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Construct a single assignment using randomized greedy approach with penalty scores
const runSingleTrial = (
  teachers: Teacher[],
  sessions: Session[],
  hallCount: number,
  globalAvgStrictness: number
): DistributionResult | null => {
  const assignments: FullAssignment = {};
  const teacherStats: TeacherStats = teachers.reduce((acc, teacher) => {
    acc[teacher.id] = { name: teacher.name, count: 0 };
    return acc;
  }, {} as TeacherStats);

  // Track hall history to avoid repeating same hall for each teacher
  const teacherHallHistory: { [teacherId: string]: Set<number> } = {};
  teachers.forEach(t => {
    teacherHallHistory[t.id] = new Set<number>();
  });

  // Track cumulative strictness per hall
  const hallStrictnessSum: { [hallNum: number]: number } = {};
  const hallAssignmentCount: { [hallNum: number]: number } = {};
  for (let h = 1; h <= hallCount; h++) {
    hallStrictnessSum[h] = 0;
    hallAssignmentCount[h] = 0;
  }

  for (const session of sessions) {
    // Filter available teachers (physically available)
    let availableTeachers = teachers.filter(t =>
      !(t.availability || []).includes(session.id)
    );

    const hallAssignments: { [hallNumber: number]: AssignedTeacher[] } = {};
    for (let h = 1; h <= hallCount; h++) {
      hallAssignments[h] = [];
    }

    // Assign 2 teachers per hall
    for (let hallNum = 1; hallNum <= hallCount; hallNum++) {
      for (let slot = 0; slot < 2; slot++) {
        // Filter teachers who haven't reached max sessions
        let eligibleTeachers = availableTeachers.filter(t => teacherStats[t.id].count < t.maxSessions);

        if (eligibleTeachers.length === 0) {
          // Fallback: allow teachers who reached max sessions if absolutely necessary
          eligibleTeachers = availableTeachers;
        }

        if (eligibleTeachers.length === 0) {
          // No available teachers for this session at all
          continue;
        }

        const firstTeacher = slot === 1 && hallAssignments[hallNum].length > 0 ? hallAssignments[hallNum][0] : null;

        // Calculate a score for each eligible teacher (lower score is better)
        const candidates = eligibleTeachers.map(t => {
          // 1. Count penalty (equalizing sessions)
          const countPenalty = teacherStats[t.id].count * 15;

          // 2. Hall repetition penalty
          const hasBeenInHall = teacherHallHistory[t.id].has(hallNum);
          const repetitionPenalty = hasBeenInHall ? 500 : 0;

          // 3. Subject conflict penalty (soft constraint: avoid guarding own subject)
          const isSubjectConflict = t.subject.trim().toLowerCase() === session.subject.trim().toLowerCase();
          const subjectConflictPenalty = isSubjectConflict ? 2000 : 0;

          // 4. Strictness pairing penalty (if second slot)
          let pairingPenalty = 0;
          if (firstTeacher) {
            const idealStrictness = 2 * globalAvgStrictness - (firstTeacher.strictness || 3);
            pairingPenalty = Math.abs((t.strictness || 3) - idealStrictness) * 30;
          }

          // 5. Hall strictness history penalty
          const currentSum = hallStrictnessSum[hallNum];
          const currentCount = hallAssignmentCount[hallNum];
          const newAvg = (currentSum + (t.strictness || 3)) / (currentCount + 1);
          const hallStrictnessPenalty = Math.abs(newAvg - globalAvgStrictness) * 50;

          const totalScore = countPenalty + repetitionPenalty + subjectConflictPenalty + pairingPenalty + hallStrictnessPenalty;

          return { teacher: t, score: totalScore, isSubjectConflict };
        });

        // Sort candidates by score
        candidates.sort((a, b) => a.score - b.score);

        // Select with some randomness (85% top candidate, 15% second candidate)
        let selected: typeof candidates[0];
        if (candidates.length > 1 && Math.random() < 0.15) {
          selected = candidates[1];
        } else {
          selected = candidates[0];
        }

        const selectedTeacher = selected.teacher;
        const isRepeat = teacherHallHistory[selectedTeacher.id].has(hallNum);

        hallAssignments[hallNum].push({
          ...selectedTeacher,
          isRepeat,
          isSubjectConflict: selected.isSubjectConflict,
        });

        // Update stats
        teacherStats[selectedTeacher.id].count++;
        teacherHallHistory[selectedTeacher.id].add(hallNum);
        hallStrictnessSum[hallNum] += (selectedTeacher.strictness || 3);
        hallAssignmentCount[hallNum]++;

        // Remove from available teachers for this session
        availableTeachers = availableTeachers.filter(t => t.id !== selectedTeacher.id);
      }
    }

    // Reserves are remaining available teachers who haven't reached max sessions
    const reserves = availableTeachers.filter(t => teacherStats[t.id].count < t.maxSessions);

    assignments[session.id] = {
      hallAssignments,
      reserves,
    };
  }

  return { assignments, stats: teacherStats };
};

// Calculate global multi-objective fitness score for an assignment (lower is better)
const calculateFitnessScore = (
  result: DistributionResult,
  teachers: Teacher[],
  sessions: Session[],
  hallCount: number,
  globalAvgStrictness: number
): number => {
  let score = 0;

  // 1. Session Count Equality (Variance of teacher counts)
  const counts = Object.values(result.stats).map(s => s.count);
  const avgCount = counts.reduce((sum, c) => sum + c, 0) / counts.length;
  const countVariance = counts.reduce((sum, c) => sum + Math.pow(c - avgCount, 2), 0) / counts.length;
  score += countVariance * 1000;

  // 2. Hall Repetition Count
  let totalRepetitions = 0;
  const teacherHallHistory: { [teacherId: string]: { [hallNum: number]: number } } = {};
  teachers.forEach(t => {
    teacherHallHistory[t.id] = {};
  });

  for (const session of sessions) {
    const sessionAssign = result.assignments[session.id];
    if (!sessionAssign) continue;

    for (let hallNum = 1; hallNum <= hallCount; hallNum++) {
      const assigned = sessionAssign.hallAssignments[hallNum] || [];
      for (const t of assigned) {
        teacherHallHistory[t.id][hallNum] = (teacherHallHistory[t.id][hallNum] || 0) + 1;
      }
    }
  }

  for (const teacherId in teacherHallHistory) {
    for (const hallNum in teacherHallHistory[teacherId]) {
      const count = teacherHallHistory[teacherId][hallNum];
      if (count > 1) {
        totalRepetitions += (count - 1);
      }
    }
  }
  score += totalRepetitions * 10000;

  // 3. Subject Conflicts Count
  let totalSubjectConflicts = 0;
  for (const session of sessions) {
    const sessionAssign = result.assignments[session.id];
    if (!sessionAssign) continue;

    for (let hallNum = 1; hallNum <= hallCount; hallNum++) {
      const assigned = sessionAssign.hallAssignments[hallNum] || [];
      for (const t of assigned) {
        if (t.subject.trim().toLowerCase() === session.subject.trim().toLowerCase()) {
          totalSubjectConflicts++;
        }
      }
    }
  }
  score += totalSubjectConflicts * 5000;

  // 4. Hall Strictness Variance
  const hallStrictnessSums: { [hallNum: number]: number } = {};
  const hallAssignmentCounts: { [hallNum: number]: number } = {};
  for (let h = 1; h <= hallCount; h++) {
    hallStrictnessSums[h] = 0;
    hallAssignmentCounts[h] = 0;
  }

  for (const session of sessions) {
    const sessionAssign = result.assignments[session.id];
    if (!sessionAssign) continue;

    for (let hallNum = 1; hallNum <= hallCount; hallNum++) {
      const assigned = sessionAssign.hallAssignments[hallNum] || [];
      for (const t of assigned) {
        hallStrictnessSums[hallNum] += (t.strictness || 3);
        hallAssignmentCounts[hallNum]++;
      }
    }
  }

  const hallAverages: number[] = [];
  for (let h = 1; h <= hallCount; h++) {
    const count = hallAssignmentCounts[h];
    const avg = count > 0 ? hallStrictnessSums[h] / count : globalAvgStrictness;
    hallAverages.push(avg);
  }

  const avgHallStrictness = hallAverages.reduce((sum, a) => sum + a, 0) / hallAverages.length;
  const strictnessVariance = hallAverages.reduce((sum, a) => sum + Math.pow(a - avgHallStrictness, 2), 0) / hallAverages.length;
  score += strictnessVariance * 4000;

  // 5. Pairing Strictness Balance
  let pairingDeviationSum = 0;
  let pairingCount = 0;
  for (const session of sessions) {
    const sessionAssign = result.assignments[session.id];
    if (!sessionAssign) continue;

    for (let hallNum = 1; hallNum <= hallCount; hallNum++) {
      const assigned = sessionAssign.hallAssignments[hallNum] || [];
      if (assigned.length === 2) {
        const s1 = assigned[0].strictness || 3;
        const s2 = assigned[1].strictness || 3;
        pairingDeviationSum += Math.pow((s1 + s2) - 2 * globalAvgStrictness, 2);
        pairingCount++;
      }
    }
  }

  if (pairingCount > 0) {
    score += (pairingDeviationSum / pairingCount) * 100;
  }

  return score;
};

export const generateDistribution = (
  teachers: Teacher[],
  sessions: Session[],
  hallCount: number
): DistributionResult | null => {
  if (teachers.length === 0 || sessions.length === 0 || hallCount <= 0) {
    return null;
  }

  const NUM_TRIALS = 300;
  let bestResult: DistributionResult | null = null;
  let bestScore = Infinity;

  // Calculate the average strictness of all available teachers
  const globalAvgStrictness = teachers.reduce((sum, t) => sum + (t.strictness || 3), 0) / teachers.length;

  for (let trial = 0; trial < NUM_TRIALS; trial++) {
    const result = runSingleTrial(teachers, sessions, hallCount, globalAvgStrictness);
    if (!result) continue;

    const score = calculateFitnessScore(result, teachers, sessions, hallCount, globalAvgStrictness);
    if (score < bestScore) {
      bestScore = score;
      bestResult = result;
    }
  }

  return bestResult;
};