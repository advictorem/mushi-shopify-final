import md from '../data/policies/terms.md?raw';
import { renderPolicy } from './_policy.js';

export const render = (main) => renderPolicy(main, { title: 'Terms of service', label: 'Terms', md });
