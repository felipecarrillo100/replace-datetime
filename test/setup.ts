import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { expect, afterEach } from 'vitest';
import 'moment/min/locales';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
