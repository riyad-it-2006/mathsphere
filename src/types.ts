export type UserRole = "student" | "cr" | "teacher" | "admin";

export type OperationType = "READ" | "WRITE" | "DELETE" | "UPDATE";

export interface UserProfile {
  uid: string;
  customUsername?: string;
  displayName: string;
  email: string;
  photoURL?: string;
  batch?: string;
  session?: string;
  bio?: string;
  skills?: string[];
  facebookUrl?: string;
  phoneNumber?: string;
  idCardUrl?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: "public" | "batch" | "private";
  batch?: string;
  members: string[];
  lastMessage?: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUrl?: string;
  voiceUrl?: string;
  replyTo?: string;
  reactions?: Record<string, string[]>;
  createdAt: string;
}

export interface Discussion {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface Note {
  id: string;
  uploaderId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  year: string;
  semester: string;
  courseCode: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  attachmentUrl?: string;
  attachmentType?: string;
  isPinned: boolean;
  type: "exam" | "class" | "assignment" | "general";
  createdAt: string;
}
