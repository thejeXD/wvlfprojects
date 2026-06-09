import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contact: resolve(__dirname, 'contact.html'),
        gradeCalculator: resolve(__dirname, 'apps/grade-calculator.html'),
        randomizer: resolve(__dirname, 'apps/randomizer-aguinaldo.html'),
        followersChecker: resolve(__dirname, 'apps/followers-checker.html'),
        datePredictor: resolve(__dirname, 'apps/date-predictor.html'),
        imageEditor: resolve(__dirname, 'apps/image-editor.html'),
        instagramMockup: resolve(__dirname, 'apps/instagram-mockup.html'),
      }
    }
  }
});
