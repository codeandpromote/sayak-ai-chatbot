export async function loadConfig(apiUrl: string, chatbotId: string): Promise<any> {
  const response = await fetch(`${apiUrl}/api/widget/config/${chatbotId}`);
  if (!response.ok) throw new Error('Failed to load chatbot config');
  return response.json();
}
