export const IG_ENDPOINTS = {
  accountInsights: (accountId: string) => `/${accountId}/insights`,
  mediaList: (accountId: string) => `/${accountId}/media`,
  mediaInsights: (mediaId: string) => `/${mediaId}/insights`,
  mediaData: (mediaId: string) => `/${mediaId}`,
  tokenRefresh: '/oauth/access_token',
};
