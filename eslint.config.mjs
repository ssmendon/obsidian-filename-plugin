// @ts-check

import eslint from '@eslint/js';
import tselint from 'typescript-eslint';

export default tselint.config(
    eslint.configs.recommended,
    tselint.configs.strictTypeChecked,
    tselint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            }
        }
    }
);
