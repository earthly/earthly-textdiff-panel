import { DataFrame, FieldType } from '@grafana/data';
import { pickTexts } from './pickTexts';

function frame(fields: Array<{ name: string; values: unknown[] }>): DataFrame {
  const length = fields.reduce((max, f) => Math.max(max, f.values.length), 0);
  return {
    fields: fields.map((f) => ({ name: f.name, type: FieldType.string, config: {}, values: f.values })),
    length,
  } as unknown as DataFrame;
}

describe('pickTexts', () => {
  it('returns undefined when a frame has fewer than two fields', () => {
    expect(pickTexts([frame([{ name: 'only', values: ['a'] }])])).toBeUndefined();
  });

  it('returns undefined when there are no rows', () => {
    expect(pickTexts([frame([{ name: 'a', values: [] }, { name: 'b', values: [] }])])).toBeUndefined();
  });

  it('uses positional order by default (first=previous, second=current)', () => {
    const frames = [frame([{ name: 'a', values: ['one'] }, { name: 'b', values: ['two'] }])];
    expect(pickTexts(frames)).toEqual({ previous: 'one', current: 'two' });
  });

  it('matches fields by name when provided', () => {
    const frames = [
      frame([
        { name: 'before', values: ['old'] },
        { name: 'after', values: ['new'] },
      ]),
    ];
    expect(pickTexts(frames, 'before', 'after')).toEqual({ previous: 'old', current: 'new' });
  });

  it('pretty-prints JSON string values before diffing', () => {
    const frames = [frame([{ name: 'a', values: ['{"x":1}'] }, { name: 'b', values: ['plain'] }])];
    expect(pickTexts(frames)).toEqual({ previous: '{\n  "x": 1\n}', current: 'plain' });
  });

  it('stringifies object values', () => {
    const frames = [frame([{ name: 'a', values: [{ x: 1 }] }, { name: 'b', values: ['plain'] }])];
    expect(pickTexts(frames)).toEqual({ previous: '{\n  "x": 1\n}', current: 'plain' });
  });
});
