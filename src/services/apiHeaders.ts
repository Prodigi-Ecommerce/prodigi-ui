const USER_ID = '0012' // TODO: Replace with authenticated user context
const AUTHORIZATION = 'Bearer mock-token' // TODO: Replace with real auth token

export const getUserHeaders = () => ({
  'x-user-id': USER_ID,
  Authorization: AUTHORIZATION,
})

export const getWorkspaceHeaders = (workspaceId: string) => ({
  ...getUserHeaders(),
  'x-workspace-id': workspaceId,
})
