import md from '../data/policies/shipping.md?raw';
import { renderPolicy } from './_policy.js';

export const render = (main) => renderPolicy(main, { title: 'Shipping policy', label: 'Shipping', md });
