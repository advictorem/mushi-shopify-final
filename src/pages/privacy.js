import md from '../data/policies/privacy.md?raw';
import { renderPolicy } from './_policy.js';

export const render = (main) => renderPolicy(main, { title: 'Privacy policy', label: 'Privacy', md });
