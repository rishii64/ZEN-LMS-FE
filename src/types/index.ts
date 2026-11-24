export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isSuperAdmin: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  sector: 'CORPORATE' | 'EDUCATION' | 'GOVERNMENT' | 'NON_PROFIT';
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  timezone: string;
  settings?: OrganizationSetting;
  departments?: Department[];
  _count?: {
    courses: number;
    memberships: number;
    departments: number;
  };
}

export interface OrganizationSetting {
  id: string;
  organizationId: string;
  terminology: string; // JSON string
  completionPolicy: string;
  allowSelfEnrollment: boolean;
  emailNotifications: boolean;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  code?: string;
  description?: string;
  parentId?: string;
  parent?: Department;
  children?: Department[];
  _count?: {
    memberships: number;
  };
}

export interface UserMembership {
  id: string;
  organizationId: string;
  userId: string;
  departmentId?: string;
  role: 'ORG_ADMIN' | 'DEPT_MANAGER' | 'INSTRUCTOR' | 'LEARNER';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  title?: string;
  organization: Organization;
  department?: Department;
  user?: User;
}

export interface Course {
  id: string;
  organizationId: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  coverImageUrl?: string;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  estimatedHours: number;
  isMandatory: boolean;
  authorId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  modules?: Module[];
  isEnrolled?: boolean;
  enrollment?: Enrollment;
  _count?: {
    modules: number;
    enrollments: number;
  };
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  contentType: 'MARKDOWN' | 'VIDEO' | 'DOCUMENT' | 'QUIZ';
  contentText?: string;
  contentUrl?: string;
  orderIndex: number;
  isRequired: boolean;
  durationMinutes: number;
  assessment?: Assessment;
}

export interface Assessment {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimitMinutes?: number;
  maxAttempts: number;
  questions?: Question[];
  _count?: {
    questions: number;
  };
}

export interface Question {
  id: string;
  assessmentId: string;
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  points: number;
  orderIndex: number;
  explanation?: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect?: boolean;
  orderIndex: number;
}

export interface Enrollment {
  id: string;
  organizationId: string;
  courseId: string;
  userId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPct: number;
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
  deadline?: string;
  course?: Course;
  certificate?: Certificate;
  lessonProgress?: LessonProgress[];
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt?: string;
  lastPositionSeconds: number;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  organizationId: string;
  courseId: string;
  userId: string;
  enrollmentId: string;
  verificationCode: string;
  issueDate: string;
  expiryDate?: string;
  recipientName: string;
  courseTitle: string;
  organizationName: string;
  course?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    estimatedHours: number;
  };
  organization?: {
    id: string;
    name: string;
    logoUrl?: string;
    primaryColor: string;
    sector: string;
  };
}
