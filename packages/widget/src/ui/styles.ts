export function getStyles(): string {
  return `
    :host { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.5; }
    .chatbot-root { position: fixed; bottom: 0; right: 0; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .chatbot-launcher { position: fixed; bottom: 20px; width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s, box-shadow 0.2s; z-index: 2147483647; }
    .chatbot-launcher:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
    .chatbot-launcher.right { right: 20px; }
    .chatbot-launcher.left { left: 20px; }
    .chatbot-launcher.open { transform: rotate(90deg); }
    .chatbot-window { position: fixed; bottom: 90px; width: 380px; height: 520px; max-height: calc(100vh - 120px); background: #fff; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); display: flex; flex-direction: column; overflow: hidden; opacity: 0; transform: translateY(20px) scale(0.95); transition: opacity 0.3s, transform 0.3s; pointer-events: none; z-index: 2147483646; }
    .chatbot-window.visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    .chatbot-window.right { right: 20px; }
    .chatbot-window.left { left: 20px; }
    .chatbot-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; color: white; border-radius: 16px 16px 0 0; }
    .chatbot-header-info { display: flex; align-items: center; gap: 10px; }
    .chatbot-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
    .chatbot-name { font-weight: 600; font-size: 15px; }
    .chatbot-close { background: none; border: none; color: white; cursor: pointer; padding: 4px; display: flex; opacity: 0.8; }
    .chatbot-close:hover { opacity: 1; }
    .chatbot-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .chatbot-messages::-webkit-scrollbar { width: 4px; }
    .chatbot-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
    .message { display: flex; max-width: 85%; }
    .message-user { align-self: flex-end; }
    .message-assistant, .message-agent { align-self: flex-start; }
    .message-system { align-self: center; max-width: 100%; }
    .message-bubble { padding: 10px 14px; border-radius: 16px; word-wrap: break-word; }
    .user-bubble { color: white; border-bottom-right-radius: 4px; }
    .bot-bubble { background: #f0f0f0; color: #333; border-bottom-left-radius: 4px; }
    .message-content { font-size: 14px; line-height: 1.5; white-space: pre-wrap; }
    .system-message { font-size: 12px; color: #888; text-align: center; padding: 4px 8px; font-style: italic; }
    .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 12px 16px; background: #f0f0f0; border-radius: 16px; border-bottom-left-radius: 4px; align-self: flex-start; max-width: 60px; }
    .typing-indicator span { width: 8px; height: 8px; background: #999; border-radius: 50%; animation: typing 1.4s infinite ease-in-out; }
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
    .chatbot-input-container { display: flex; align-items: center; padding: 12px 16px; border-top: 1px solid #eee; gap: 8px; }
    .chatbot-input { flex: 1; border: 1px solid #e0e0e0; border-radius: 24px; padding: 10px 16px; font-size: 14px; outline: none; transition: border-color 0.2s; font-family: inherit; }
    .chatbot-input:focus { border-color: #999; }
    .chatbot-send { background: none; border: none; cursor: pointer; padding: 8px; display: flex; border-radius: 50%; transition: background 0.2s; }
    .chatbot-send:hover { background: #f0f0f0; }
    .chatbot-forms-container { max-height: 0; overflow: hidden; transition: max-height 0.3s; }
    .chatbot-forms-container:has(.lead-form), .chatbot-forms-container:has(.appointment-picker) { max-height: 400px; border-top: 1px solid #eee; }
    .lead-form, .appointment-picker { padding: 16px; }
    .lead-form-title, .appointment-title { font-weight: 600; margin-bottom: 12px; font-size: 14px; color: #333; }
    .lead-form-fields, .appointment-form { display: flex; flex-direction: column; gap: 8px; }
    .form-input { border: 1px solid #e0e0e0; border-radius: 8px; padding: 10px 12px; font-size: 14px; outline: none; font-family: inherit; }
    .form-input:focus { border-color: #999; }
    .form-submit { padding: 10px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; background: #333; color: white; transition: background 0.2s; }
    .form-submit:hover { background: #555; }
    .chatbot-branding { text-align: center; padding: 6px; font-size: 11px; color: #aaa; background: #fafafa; border-top: 1px solid #f0f0f0; }
    @media (max-width: 440px) { .chatbot-window { width: calc(100vw - 16px); height: calc(100vh - 100px); bottom: 80px; right: 8px !important; left: 8px !important; border-radius: 12px; } }
  `;
}
