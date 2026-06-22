import React, { useMemo } from 'react';
import { GrafanaTheme2, PanelProps } from '@grafana/data';
import { css, cx } from '@emotion/css';
import { useStyles2 } from '@grafana/ui';
import { diffLines } from 'diff';
import { TextDiffOptions } from '../types';
import { pickTexts } from '../utils/pickTexts';

type Props = PanelProps<TextDiffOptions>;

const getStyles = (theme: GrafanaTheme2) => ({
  container: css({
    background: theme.colors.background.primary,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  }),
  root: css({
    height: '100%',
    width: '100%',
    overflow: 'auto',
    scrollbarWidth: 'thin',
  }),
  pre: css({
    margin: 0,
    fontFamily: 'monospace !important',
    fontSize: '12px !important',
    lineHeight: 1.4,
  }),
  line: css({
    padding: '0 8px',
    whiteSpace: 'pre',
  }),
  lineAdded: css({
    color: '#a6e3a1',
    background: 'rgba(166, 227, 161, 0.1)',
  }),
  lineRemoved: css({
    color: '#f38ba8',
    background: 'rgba(243, 139, 168, 0.1)',
  }),
});

export const TextDiffPanel: React.FC<Props> = ({ data, options }) => {
  const styles = useStyles2(getStyles);

  const content = useMemo(() => {
    const texts = pickTexts(data?.series ?? [], options.previousField, options.currentField);
    if (!texts) {
      return <em>No data. Query must return at least 1 row with 2 columns.</em>;
    }

    const parts = diffLines(texts.previous, texts.current);
    const rows: React.ReactNode[] = [];
    let key = 0;

    for (const part of parts) {
      let className = styles.line;
      let prefix = ' ';

      if (part.added) {
        className = cx(styles.line, styles.lineAdded);
        prefix = '+';
      } else if (part.removed) {
        className = cx(styles.line, styles.lineRemoved);
        prefix = '-';
      }

      const partLines = part.value.replace(/\n$/, '').split('\n');
      for (const line of partLines) {
        rows.push(
          <div key={key++} className={className}>
            {prefix} {line}
          </div>,
        );
      }
    }

    return <pre className={styles.pre}>{rows}</pre>;
  }, [data?.series, options.previousField, options.currentField, styles]);

  return (
    <div className={styles.container}>
      <div className={styles.root}>{content}</div>
    </div>
  );
};
