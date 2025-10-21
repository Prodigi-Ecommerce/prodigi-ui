import type { CreateProjectResponse, UpdateProjectResponse } from "@/types/projectsApi"
import projectsApiClient from "./projectsApi"

export const createProject = async (files: File[]) => {
  const response = await projectsApiClient.post<CreateProjectResponse>(
    '/projects',
    {
      files: files.map((file) => ({
        fileType: file.type,
      })),
    },
    {
      headers: {
        'x-user-id': '001221', // Replace with actual user ID retrieval logic
        Authorization: `Bearer mock-token`, // Replace with actual token retrieval logic
      },
    }
  )
  return response.data
}

export const updateProject = async (
  projectId: string,
  uploadUrls: CreateProjectResponse['uploadUrls']
) => {
  const response = await projectsApiClient.patch<UpdateProjectResponse>(
    `/projects/${projectId}`,
    {
      status: 'PENDING',
      inputImages: uploadUrls.map((url) => ({
        imageId: url.imageId,
        s3Key: url.key,
      })),
      outputImages: [],
    },
    {
      headers: {
        'x-user-id': '001221', // Replace with actual user ID retrieval logic
      },
    }
  )
  return response.data
}