import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
    testIsolation: false,
    viewportHeight: 1080,
    viewportWidth: 1920,
    screenshotOnRunFailure: false,
    video: false,
  },
});
