export interface AuthHeaderParams {
  accessToken: string
}

export const getUserHeaders = ({ accessToken }: AuthHeaderParams) => ({
  Authorization: `Bearer ${accessToken}`,
})

export const getWorkspaceHeaders = (
  workspaceId: string,
  auth: AuthHeaderParams
) => ({
  ...getUserHeaders(auth),
  'x-workspace-id': workspaceId,
})
