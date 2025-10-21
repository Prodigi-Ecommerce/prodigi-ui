export interface CreateProjectResponse {
  projectId: string
  uploadUrls: Array<{
    imageId: string
    key: string
    uploadUrl: string
    fileType: string
  }>
}

export interface UpdateProjectResponse {
  projectId: string
  userId: string
  status: 'DRAFT' | 'PENDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED'
  updatedAt: string
  inputImages: Array<{
    imageId: string
    s3Key: string
  }>
  outputImages: Array<{
    imageId: string
    s3Key: string
  }>
}