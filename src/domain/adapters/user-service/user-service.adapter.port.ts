export interface UserServiceAdapterPort {
  validateMemberInProject(projectId: string): Promise<boolean>;
}
