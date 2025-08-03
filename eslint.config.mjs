/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// @ts-check

import eslint from '@eslint/js';
import tselint from 'typescript-eslint';

export default tselint.config(
    {
        ignores: ['**/dist/**']
    },
    {
        extends: [eslint.configs.recommended],
        rules: {
            'no-unused-labels': 'warn', // -- DEV label used frequently
        }
    },
    tselint.configs.strictTypeChecked,
    tselint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['*.config.mjs', '*.config.ts'],
                },
                tsconfigRootDir: import.meta.dirname,
            }
        }
    },
    {
        files: ['*.config.mjs', '*.config.ts'],
        rules: { // way too many false positives
            '@typescript-eslint/no-unsafe-assignment': 'warn',
            '@typescript-eslint/no-unsafe-call': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'warn',
        }
    }
);
