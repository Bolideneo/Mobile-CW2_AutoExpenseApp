export const openAiConfig = {
  apiKey: 'sk-PXPBFK4tCBHLQd1ULlokWBL81mqML5D98E4mKHvvZStMsFhd',
  baseURL: 'https://api.chatanywhere.org',
  model: 'gpt-4o-mini',
};

export const isOpenAiConfigured = (): boolean =>
  openAiConfig.apiKey.trim().length > 0;
