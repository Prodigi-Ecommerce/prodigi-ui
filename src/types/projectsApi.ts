export type ProjectStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETE'
  | 'FAILED'

export interface CreateProjectFilePayload {
  fileType: string
}

export interface CreateProjectPayload {
  name: string
  files: CreateProjectFilePayload[]
}

export interface UploadUrl {
  imageId: string
  key: string
  uploadUrl: string
  fileType: string
}

export interface CreateProjectResponse {
  projectId: string
  uploadUrls: UploadUrl[]
}

export interface ProjectImage {
  imageId: string
  s3Key: string
}

export interface ProjectOutputImage extends ProjectImage {
  generatedAt?: string
  basedOnInputId?: string
  downloadUrl?: string
}

export interface ProjectInputImage extends ProjectImage {
  uploadedAt?: string
  downloadUrl?: string
}

export interface UpdateProjectResponse {
  projectId: string
  workspaceId: string
  status: ProjectStatus
  updatedAt: string
  inputImages: ProjectImage[]
  outputImages: ProjectImage[]
}

export interface UpdateProjectPayload {
  status: ProjectStatus
  inputImages: ProjectImage[]
  outputImages: ProjectImage[]
}

export interface ProjectSummary {
  projectId: string
  workspaceId: string
  name: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  inputImages: ProjectInputImage[]
  outputImages: ProjectOutputImage[]
}

export type ProjectDetail = ProjectSummary
