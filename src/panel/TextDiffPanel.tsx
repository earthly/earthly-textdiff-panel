import React, { useEffect, useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';
import { render } from '../embed';
import { TextDiffOptions } from '../types';

type Props = PanelProps<TextDiffOptions>;

// Thin React wrapper: the diff rendering and styling live in the
// framework-agnostic `embed.render`, shared with the compiled
// marcusolsson-dynamictext-panel build so the two can't diverge.
export const TextDiffPanel: React.FC<Props> = ({ data, options }) => {
  const theme = useTheme2();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    return render(el, { series: data?.series ?? [], options, theme });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.series, options.previousField, options.currentField, theme]);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
};
