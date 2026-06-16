# Text Diff Panel

A Grafana panel that renders a line-by-line diff between two text values
returned by your query. It is useful for comparing two versions of a document,
configuration, or any pair of text columns side by side as added/removed lines.

![Text diff](https://raw.githubusercontent.com/earthly/earthly-textdiff-panel/main/src/img/screenshot-diff.png)

## Features

- Line-by-line diff with added/removed lines highlighted.
- Reads two columns (previous and current) from the first row of your query.
- Match the columns by name, or fall back to positional order.
- Pretty-prints JSON values before diffing so structural changes are readable.

## Requirements

- Grafana 10.4 or later.
- A data source that returns at least one row with two text columns to compare.

## Getting started

1. Add a panel and select **Text Diff** as the visualization.
2. Write a query that returns two text columns in a single row. For example,
   with a PostgreSQL data source:

   ```sql
   SELECT previous_manifest AS previous,
          current_manifest  AS current
   FROM deployments
   WHERE id = $deployment
   LIMIT 1;
   ```

3. The panel diffs the two columns and highlights added and removed lines.

## Panel options

| Option | Description |
| --- | --- |
| **Previous data field** | Name of the field holding the "previous" text. If empty, the first field is used. |
| **Current data field** | Name of the field holding the "current" text. If empty, the second field is used. |

## License

Licensed under the [MIT License](https://github.com/earthly/earthly-textdiff-panel/blob/main/LICENSE).
