export interface AuthHeaderParams {
  userId: string
  accessToken: string
}

export const getUserHeaders = ({ userId, accessToken }: AuthHeaderParams) => ({
  'x-user-id': userId,
  Authorization: `Bearer ${accessToken}`,
})

export const getWorkspaceHeaders = (
  workspaceId: string,
  auth: AuthHeaderParams
) => ({
  ...getUserHeaders(auth),
  'x-workspace-id': workspaceId,
})
