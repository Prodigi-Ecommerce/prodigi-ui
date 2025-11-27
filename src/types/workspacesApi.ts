export interface CreateWorkspaceResponse {
  workspaceId: string
  name: string
  createdBy: string
  createdAt: string
}

export interface WorkspaceSummary {
  workspaceId: string
  name: string
  createdBy: string
  createdAt: string
  role: string
  joinedAt: string
}
