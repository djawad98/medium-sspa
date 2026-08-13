import {singleSpaSvelte} from "@wjfe/single-spa-svelte";
import { cssLifecycleFactory } from 'vite-plugin-single-spa/ex';

import App from "./profile.svelte";

const svelteLifecycles = singleSpaSvelte(App);

const cssLc = cssLifecycleFactory('sspa-home', /* optional factory options */);
export const bootstrap = [cssLc.bootstrap, svelteLifecycles.bootstrap];
export const mount = [cssLc.mount, svelteLifecycles.mount];
export const unmount = [cssLc.unmount, svelteLifecycles.unmount];
