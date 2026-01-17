
export interface Teacher {
  id: string;
  name: string;
  subject: string;
  maxSessions: number;
  notes: string;
  availability: string[];
}

export interface Session {
  id: string;
  name: string;
  subject: string;
}

export interface AssignedTeacher extends Teacher {
  isRepeat: boolean;
}

export interface HallAssignment {
  [hallNumber: number]: AssignedTeacher[];
}

export interface SessionAssignment {
  hallAssignments: HallAssignment;
  reserves: Teacher[];
}

export interface FullAssignment {
  [sessionId: string]: SessionAssignment;
}

export interface TeacherStats {
  [teacherId: string]: {
    name: string;
    count: number;
  };
}

export interface DistributionResult {
  assignments: FullAssignment;
  stats: TeacherStats;
}