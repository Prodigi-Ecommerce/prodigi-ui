import { createProject, updateProject } from '@/services/projectsService'
import axios from 'axios'

interface ProcessImagesArgs {
  workspaceId: string
  projectName: string
  files: File[]
}

interface ProcessImagesResult {
  projectId: string
  status: string
}

const uploadToS3 = async (
  file: File,
  uploadUrl: string,
  contentType: string
) => {
  console.log('Uploading to S3:', {
    fileName: file.name,
    fileType: file.type,
    expectedContentType: contentType,
    uploadUrl: uploadUrl.split('?')[0],
  })

  try {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': contentType,
      },
    })
    console.log(`Successfully uploaded ${file.name}`)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Failed to upload ${file.name}:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
    }
    throw error
  }
}

export const processImages = async ({
  workspaceId,
  projectName,
  files,
}: ProcessImagesArgs): Promise<ProcessImagesResult> => {
  console.log('Step 1: Creating project with files:', files.map((f) => f.name))
  const projectData = await createProject({ workspaceId, name: projectName, files })

  if (files.length !== projectData.uploadUrls.length) {
    throw new Error('Number of files does not match upload URLs from backend')
  }

  console.log('Step 2: Starting uploads...')
  await Promise.all(
    files.map((file, index) =>
      uploadToS3(
        file,
        projectData.uploadUrls[index].uploadUrl,
        projectData.uploadUrls[index].fileType
      )
    )
  )

  console.log('Step 3: All uploads complete, updating project...')
  const updatedProject = await updateProject({
    workspaceId,
    projectId: projectData.projectId,
    uploadUrls: projectData.uploadUrls,
  })

  return {
    projectId: projectData.projectId,
    status: updatedProject.status,
  }
}
