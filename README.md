# replace-datetime

A lightweight but complete datetime picker component for React, fully compatible with **React 18 and 19**.

This project is a modernized fork of the original `react-datetime` library, rewritten in TypeScript with functional components and modern React hooks.

📅 [Try the Live Demo](https://felipecarrillo100.github.io/replace-datetime/demo/) — All picker modes, fully interactive.

📚 [View the API Documentation](https://felipecarrillo100.github.io/replace-datetime/)

---
## Why `replace-datetime`?

The original `react-datetime` library was a staple of the React ecosystem for years. However, as React evolved towards functional components, concurrent rendering, and strict mode, the original class-based implementation became increasingly difficult to maintain and incompatible with modern standards like React 18 and 19.

**Key improvements in this fork:**
- **React 19 Ready**: Full support for React 18/19 features, including Strict Mode and the React Compiler.
- **Functional Components**: Completely rewritten using modern React Hooks (`useState`, `useEffect`, `useImperativeHandle`).
- **TypeScript Native**: Built from the ground up with TypeScript for superior developer experience and type safety.
- **Modern Tooling**: Powered by Vite 8 and tsup, ensuring fast builds and modern module distribution (ESM/CJS).
- **Zero Legacy Bloat**: Removed outdated dependencies and legacy lifecycle methods.

## Migration from `react-datetime`

Migrating is designed to be a seamless, drop-in process.

1. **Uninstall the old package:**
   ```sh
   npm uninstall react-datetime
   ```

2. **Install `replace-datetime`:**
   ```sh
   npm install replace-datetime
   ```

3. **Update your imports:**
   ```diff
   - import Datetime from 'react-datetime';
   + import Datetime from 'replace-datetime';
   ```

4. **Update your CSS imports:**
   ```diff
   - import "react-datetime/css/react-datetime.css";
   + import "replace-datetime/css/react-datetime.css";
   ```

The API remains 100% compatible with the original library, including the imperative methods.

## Installation

```sh
npm install replace-datetime
```

## Usage

React and Moment.js are peer dependencies for `replace-datetime`.

```tsx
import Datetime from 'replace-datetime';
import "replace-datetime/css/react-datetime.css";

function MyComponent() {
  return <Datetime />;
}
```

## API

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| **value** | `Date \| string \| moment` | `new Date()` | Selected date for controlled component usage. |
| **initialValue** | `Date \| string \| moment` | `new Date()` | Selected date for uncontrolled component usage. |
| **initialViewDate** | `Date \| string \| moment` | `new Date()` | The date shown in the calendar on open. |
| **initialViewMode** | `string` | `'days'` | Initial view (`'years'`, `'months'`, `'days'`, `'time'`). |
| **dateFormat** | `boolean \| string` | `true` | Moment.js date format. Set `false` to disable date selection. |
| **timeFormat** | `boolean \| string` | `true` | Moment.js time format. Set `false` to disable time selection. |
| **input** | `boolean` | `true` | Whether to show an input field. |
| **open** | `boolean` | `null` | Manual control over calendar visibility. |
| **onChange** | `function` | | Callback when date changes. |
| **onOpen** | `function` | | Callback when calendar opens. |
| **onClose** | `function` | | Callback when calendar closes. |
| **closeOnSelect** | `boolean` | `false` | Close calendar automatically after selection. |

### Imperative API

If you need to control the component programmatically, use a `ref`:

```tsx
const datetimeRef = useRef<any>(null);

// Navigate to years view
datetimeRef.current?.navigate('years');

// Set the view date
datetimeRef.current?.setViewDate(new Date());
```

## Theming

`replace-datetime` ships with built-in **light and dark themes** driven entirely by CSS custom properties — no extra packages, no JS, no `!important` overrides.

### How themes are applied

| Scenario | Result |
|---|---|
| No `data-theme` set, OS prefers light | ☀️ Light theme |
| No `data-theme` set, OS prefers dark | 🌙 Dark theme (via `prefers-color-scheme`) |
| `data-theme="dark"` on any ancestor | 🌙 Dark theme (OS preference ignored) |
| `data-theme="light"` on any ancestor | ☀️ Light theme (OS preference ignored) |

### Global theme toggle (React)

```tsx
import { useState, useEffect } from 'react';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <>
      <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
        Toggle theme
      </button>
      <Datetime />
    </>
  );
}
```

### Per-picker override

Wrap a single picker to force a theme regardless of the global setting:

```tsx
<div data-theme="light">
  <Datetime />   {/* always light, even if page is dark */}
</div>
```

### Custom theme

Override any `--rdt-*` token to create your own palette:

```css
.rdt {
  --rdt-active-bg:  #9f7aea;                /* purple selections */
  --rdt-hover-bg:   rgba(159,122,234,0.15); /* matching hover    */
  --rdt-today-color:#9f7aea;
}
```

### CSS custom property reference

| Token | Controls |
|---|---|
| `--rdt-bg` | Picker background |
| `--rdt-color` | All text |
| `--rdt-border` | Picker border |
| `--rdt-hover-bg` | Day / month / year hover |
| `--rdt-active-bg` | Selected date background |
| `--rdt-active-color` | Selected date text |
| `--rdt-today-color` | Today indicator dot |
| `--rdt-disabled-color` | Disabled cell text |
| `--rdt-muted-color` | Prev / next month cells |

---

## Acknowledgments & Credits

This project was modernized and is currently maintained by **Felipe Carrillo**.

We would like to express our deepest gratitude to the original authors and contributors of `react-datetime`, particularly **Javier Marquez**, for creating such a foundational component for the React community. This fork aims to carry that legacy forward into the modern React era.

Special thanks to [YouCanBook.me](https://youcanbook.me) for their long-term sponsorship of the original project.

## License

[MIT Licensed](LICENSE.md)
