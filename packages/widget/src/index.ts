import { Widget } from './widget';
import { getStyles } from './ui/styles';

(function () {
  const config = (window as any).AIChatbot || {};
  const chatbotId = config.id || document.currentScript?.getAttribute('data-chatbot-id');

  if (!chatbotId) {
    console.error('[AIChatbot] No chatbot ID provided');
    return;
  }

  function init() {
    const container = document.createElement('div');
    container.id = 'ai-chatbot-widget';
    document.body.appendChild(container);

    // Shadow DOM for style isolation
    const shadow = container.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = getStyles();
    shadow.appendChild(styleEl);

    const root = document.createElement('div');
    root.className = 'chatbot-root';
    shadow.appendChild(root);

    const widget = new Widget(root, shadow, chatbotId, config.apiUrl);
    widget.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
