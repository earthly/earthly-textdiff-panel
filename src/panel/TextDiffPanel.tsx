import React, { useMemo } from 'react';
import { GrafanaTheme2, PanelProps } from '@grafana/data';
import { css } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { diffLines } from 'diff';
import { TextDiffOptions } from '../types';
import { pickTexts } from '../utils/pickTexts';
import './styles.css';

type Props = PanelProps<TextDiffOptions>;

const getStyles = (theme: GrafanaTheme2) => ({
  container: css({
    background: theme.colors.background.primary,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  }),
});

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const TextDiffPanel: React.FC<Props> = ({ data, options }) => {
  const styles = useStyles2(getStyles);

  const html = useMemo(() => {
    const texts = pickTexts(data?.series ?? [], options.previousField, options.currentField);
    if (!texts) {
      return '<em>No data. Query must return at least 1 row with 2 columns.</em>';
    }

    const parts = diffLines(texts.previous, texts.current);
    const lines: string[] = ['<pre style="font-family: monospace !important; font-size: 12px !important; line-height: 1.4; margin: 0;">'];

    for (const part of parts) {
      let cls = 'td-line';
      let prefix = ' ';

      if (part.added) {
        cls += ' td-line--added';
        prefix = '+';
      } else if (part.removed) {
        cls += ' td-line--removed';
        prefix = '-';
      }

      const partLines = part.value.replace(/\n$/, '').split('\n');
      for (const line of partLines) {
        lines.push(`<div class="${cls}">${prefix} ${escapeHtml(line)}</div>`);
      }
    }

    lines.push('</pre>');
    return lines.join('');
  }, [data?.series, options.previousField, options.currentField]);

  return (
    <div className={styles.container}>
      <div className="textDiffRoot" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};
