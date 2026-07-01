// Headless entrypoint: renders the line diff with no React and no @grafana/ui,
// so the same implementation drives both the standard React panel
// (src/panel/TextDiffPanel.tsx) and the compiled marcusolsson-dynamictext-panel
// instance produced by lunar's @plugin compiler. Keep this framework-agnostic:
// only `import type` from @grafana/* (erased at build). `diff` is bundled.
import type { DataFrame, GrafanaTheme2 } from '@grafana/data';
import { diffLines } from 'diff';
import { pickTexts } from './utils/pickTexts';
import type { TextDiffOptions } from './types';

/** Context passed by the host (React panel or dynamictext afterRender). */
export interface EmbedContext {
  series?: DataFrame[];
  dataFrame?: DataFrame;
  options: TextDiffOptions;
  theme?: GrafanaTheme2;
}

/** Defaults mirror module.ts's setPanelOptions builder (positional by default). */
export const defaultOptions: TextDiffOptions = {};

const ROOT_CLASS = 'lunar-textdiff';

/** CSS translated verbatim from the panel's emotion `getStyles`, scoped under
 *  ROOT_CLASS. The theme-derived background falls back when none is supplied. */
export function styles(theme?: GrafanaTheme2): string {
  const bg = theme?.colors.background.primary ?? 'transparent';
  return `
.${ROOT_CLASS} { background: ${bg}; height: 100%; display: flex; flex-direction: column; box-sizing: border-box; }
.${ROOT_CLASS} .root { height: 100%; width: 100%; overflow: auto; scrollbar-width: thin; }
.${ROOT_CLASS} pre { margin: 0; font-family: monospace !important; font-size: 12px !important; line-height: 1.4; }
.${ROOT_CLASS} .line { padding: 0 8px; white-space: pre; }
.${ROOT_CLASS} .line.added { color: #a6e3a1; background: rgba(166, 227, 161, 0.1); }
.${ROOT_CLASS} .line.removed { color: #f38ba8; background: rgba(243, 139, 168, 0.1); }
`;
}

/**
 * Render the line-by-line diff into `el`. Returns a no-op dispose (nothing to
 * tear down). Behavior mirrors TextDiffPanel.tsx exactly.
 */
export function render(el: HTMLElement, ctx: EmbedContext): () => void {
  const { options, theme } = ctx;
  const frames = ctx.series ?? (ctx.dataFrame ? [ctx.dataFrame] : []);

  el.innerHTML = '';
  // Host may be an auto-height wrapper (e.g. dynamictext's row div) sitting in a
  // flex-grow parent; fill it so the container's `height: 100%` resolves and the
  // themed background reaches the bottom of the panel (parity with the React panel).
  el.style.height = '100%';

  const style = document.createElement('style');
  style.textContent = styles(theme);
  el.appendChild(style);

  const container = document.createElement('div');
  container.className = ROOT_CLASS;
  el.appendChild(container);

  const texts = pickTexts(frames, options.previousField, options.currentField);
  if (!texts) {
    const em = document.createElement('em');
    em.textContent = 'No data. Query must return at least 1 row with 2 columns.';
    container.appendChild(em);
    return () => {};
  }

  const root = document.createElement('div');
  root.className = 'root';
  const pre = document.createElement('pre');

  for (const part of diffLines(texts.previous, texts.current)) {
    let cls = 'line';
    let prefix = ' ';
    if (part.added) {
      cls = 'line added';
      prefix = '+';
    } else if (part.removed) {
      cls = 'line removed';
      prefix = '-';
    }
    const partLines = part.value.replace(/\n$/, '').split('\n');
    for (const line of partLines) {
      const div = document.createElement('div');
      div.className = cls;
      div.textContent = `${prefix} ${line}`;
      pre.appendChild(div);
    }
  }

  root.appendChild(pre);
  container.appendChild(root);
  return () => {};
}
