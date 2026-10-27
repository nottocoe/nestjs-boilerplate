export type ProjectMember = {
  userId: string;
  email: string;
};

type members = {
  projectId: string;
  userIds: string[];
  members: ProjectMember[];
};

type validationCommonResponse<T> = {
  status: number;
  message: string;
  data: T;
};

export type MemberValidationType = validationCommonResponse<members>;
