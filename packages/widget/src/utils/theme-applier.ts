import { WidgetConfig } from '../widget';

export class ThemeApplier {
  static apply(root: HTMLElement, config: WidgetConfig) {
    root.style.setProperty('--primary-color', config.primaryColor);
  }
}
