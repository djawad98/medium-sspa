import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import ts from 'typescript-eslint';

export default [
    prettier,
    js.configs.recommended,
	ts.configs.recommended,
];
