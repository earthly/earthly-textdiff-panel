import { PanelPlugin } from '@grafana/data';
import { TextDiffPanel } from './panel/TextDiffPanel';
import { TextDiffOptions } from './types';

export const plugin = new PanelPlugin<TextDiffOptions>(TextDiffPanel).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: 'previousField',
      name: 'Previous data field (optional)',
      description:
        'Name of the field containing the previous text. If empty, uses the first field.',
    })
    .addTextInput({
      path: 'currentField',
      name: 'Current data field (optional)',
      description:
        'Name of the field containing the current text. If empty, uses the second field.',
    });
});
