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
  sector: 'CORPORATE' | 'EDUCATION' | 'GOVERNMENT' | 'NON_PROFIT' | 'TRAINING_INSTITUTE';
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'INACTIVE' | 'CANCELLED';
  timezone: string;
  customDomain?: string;
  settings?: OrganizationSetting;
  departments?: Department[];
  subscription?: OrganizationSubscription;
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

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  maxUsers: number;
  maxStorageGb: number;
  maxCourses: number;
  featuresJson: string;
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  planId: string;
  plan?: SubscriptionPlan;
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
  billingCycle: 'MONTHLY' | 'ANNUAL';
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface SubscriptionInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  billingDate: string;
  dueDate: string;
  paidAt?: string;
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

export interface Location {
  id: string;
  organizationId: string;
  name: string;
  code?: string;
  city?: string;
  country?: string;
  _count?: { memberships: number };
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  departmentId?: string;
  department?: Department;
  memberships?: { user: User }[];
}

export interface UserMembership {
  id: string;
  organizationId: string;
  userId: string;
  departmentId?: string;
  locationId?: string;
  role: string;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED';
  title?: string;
  organization: Organization;
  department?: Department;
  location?: Location;
  user?: User;
  assignedRoles?: { role: Role }[];
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  action: string;
  description: string;
}

export interface Role {
  id: string;
  organizationId?: string;
  name: string;
  description?: string;
  scope: string;
  isSystemDefault: boolean;
  permissions?: { permission: Permission }[];
  _count?: { memberships: number };
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
  contentType: 'MARKDOWN' | 'VIDEO' | 'DOCUMENT' | 'QUIZ' | 'AUDIO';
  contentText?: string;
  contentUrl?: string;
  orderIndex: number;
  isRequired: boolean;
  durationMinutes: number;
  assessment?: Assessment;
}

export interface LearningPath {
  id: string;
  organizationId: string;
  title: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  status: string;
  items: { course: Course; orderIndex: number; isMandatory: boolean }[];
  author?: { firstName: string; lastName: string };
}

export interface LiveSession {
  id: string;
  organizationId: string;
  courseId: string;
  course?: { title: string; slug: string };
  title: string;
  description?: string;
  instructorId: string;
  meetingUrl: string;
  startTime: string;
  endTime: string;
  status: string;
  attendances?: { isPresent: boolean }[];
  _count?: { attendances: number };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  author?: { firstName: string; lastName: string };
  course?: { title: string };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'DEADLINE';
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface CompliancePolicy {
  id: string;
  title: string;
  content: string;
  version: string;
  renewalMonths: number;
  isAcknowledged?: boolean;
  acknowledgedAt?: string;
  _count?: { acknowledgements: number };
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
  status?: string;
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
