# replace-datetime

A lightweight but complete datetime picker component for React, fully compatible with **React 18 and 19**.

This project is a modernized, TypeScript-native fork of the original [react-datetime](https://github.com/YouCanBookMe/react-datetime) library, originally created by [Javier Marquez](https://github.com/arqex).

📅 [Try the Live Demo](https://felipecarrillo100.github.io/replace-datetime/demo/) — All picker modes, fully interactive.

📚 [View the API Documentation](https://felipecarrillo100.github.io/replace-datetime/)

---
## Why `replace-datetime`?

The original `react-datetime` library was a staple of the React ecosystem for years. However, as React evolved towards functional components, concurrent rendering, and strict mode, the original class-based implementation became increasingly difficult to maintain and incompatible with modern standards like React 18 and 19.

**Key improvements in this fork:**
- **React 19 Ready**: Full support for React 18/19 features, including Strict Mode and the React Compiler.
- **Day.js Powered**: Replaced the heavy, legacy Moment.js library with lightweight, modern, and immutable Day.js.
- **Functional Components**: Completely rewritten using modern React Hooks (`useState`, `useEffect`, `useImperativeHandle`).
- **TypeScript Native**: Built from the ground up with TypeScript for superior developer experience and type safety.
- **Modern Tooling**: Powered by Vite 8 and tsup, ensuring fast builds and modern module distribution (ESM/CJS).
- **Zero Legacy Bloat**: Removed outdated dependencies and legacy lifecycle methods.

## Migration from `react-datetime` (Legacy Component)

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

## Installation

```sh
npm install replace-datetime
```

## Usage

React and Day.js are peer dependencies for `replace-datetime`.

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
| **value** | `Date \| string \| dayjs` | `new Date()` | Selected date for controlled component usage. |
| **initialValue** | `Date \| string \| dayjs` | `new Date()` | Selected date for uncontrolled component usage. |
| **initialViewDate** | `Date \| string \| dayjs` | `new Date()` | The date shown in the calendar on open. |
| **initialViewMode** | `string` | `'days'` | Initial view (`'years'`, `'months'`, `'days'`, `'time'`). |
| **dateFormat** | `boolean \| string` | `true` | Day.js date format. Set `false` to disable date selection. |
| **timeFormat** | `boolean \| string` | `true` | Day.js time format. Set `false` to disable time selection. |
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

## Migration from `replace-datetime` v4 to v5 (Moment.js to Day.js)

Version 5.x of `replace-datetime` replaces **Moment.js** with **Day.js** to significantly reduce bundle size, improve performance, and adopt immutable date manipulation.

To upgrade from v4 to v5:

1. **Update package dependencies:**
   Remove `moment` (if no longer used elsewhere in your application) and install `dayjs`:
   ```sh
   npm uninstall moment
   npm install replace-datetime@5 dayjs
   ```

2. **Update your Types:**
   Change references to `moment.Moment` in your code and component prop types to `dayjs.Dayjs`:
   ```diff
   - import moment from 'moment';
   - const [value, setValue] = useState<moment.Moment>();
   + import dayjs from 'dayjs';
   + const [value, setValue] = useState<dayjs.Dayjs>();
   ```

3. **Load Day.js plugins:**
   Day.js requires explicit plugins to match the advanced formatting, locales, and timezone features of Moment. If you use custom parsing format strings, timezone conversions, or query methods like `isSameOrAfter`, add the following to your application entry point:
   ```typescript
   import dayjs from 'dayjs';
   import utc from 'dayjs/plugin/utc';
   import timezone from 'dayjs/plugin/timezone';
   import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
   import localizedFormat from 'dayjs/plugin/localizedFormat';
   import customParseFormat from 'dayjs/plugin/customParseFormat';

   dayjs.extend(utc);
   dayjs.extend(timezone);
   dayjs.extend(isSameOrAfter);
   dayjs.extend(localizedFormat);
   dayjs.extend(customParseFormat);
   ```

4. **Adjust custom handlers and date utilities:**
    - **Immutability:** Operations on `dayjs` objects (e.g., `.add()`, `.subtract()`, `.startOf()`) are immutable and return a new instance. Unlike Moment, they do not modify the original instance.
    - **Helper checks:** Replace `moment.isMoment(val)` with `dayjs.isDayjs(val)`.
    - **Static exports:** Access the dayjs instance constructor using the component's static property: `Datetime.dayjs` (instead of `Datetime.moment`).


## Troubleshooting & Best Practices

### Clipping and Overflow Issues
The datetime picker is an absolutely positioned element. If any parent container (such as a Card, Grid cell, or Modal) has `overflow: hidden`, the picker will be cut off when it opens.

**Solution:**
- Ensure the parent container has `overflow: visible`.
- Use the `.rdtOpen` class to lift the picker's stacking context if it is tucked behind other elements:
  ```css
  /* Ensure the active picker floats above everything else */
  .rdtOpen {
    z-index: 100;
    position: relative;
  }
  ```

### Day.js Locales and Plugins
This library relies on Day.js for all date manipulation and localization.

**⚠️ Loading Plugins and Locales:**
Day.js uses a modular, plugin-based architecture and lazy-loads locales. If you wish to use custom formats, timezones, or specific locales, make sure to import and register them in your main application entry point:

```tsx
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/es';

// Register plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(localizedFormat);

// Set default locale
dayjs.locale('en');
```

---

## Acknowledgments & Credits

This project was modernized and is currently maintained by **Felipe Carrillo**.

We would like to express our deepest gratitude to the original authors and contributors of [react-datetime](https://github.com/YouCanBookMe/react-datetime), particularly **Javier Marquez**, for creating such a foundational component for the React community. This fork aims to carry that legacy forward into the modern React era.

Special thanks to [YouCanBook.me](https://youcanbook.me) for their long-term sponsorship of the original project.

## License

[MIT Licensed](LICENSE.txt)
