// import { loadViteClient } from '@single-spa-angular-esm/shared-utils';
import type { AppProps } from 'single-spa';
import { singleSpaAngular } from 'single-spa-angular';
// import { environment } from '@omp/alt-platform/env';
import { NgZone } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { bootstrapApplication } from '@angular/platform-browser';

// if (!environment.production) {
// loadViteClient();
// }

// if (environment.production) {
//   enableProdMode();
// }


const lifecycles = singleSpaAngular<AppProps>({
  bootstrapFunction: (/*singleSpaProps: AppProps*/) => {
    return bootstrapApplication(AppComponent, appConfig)
  },
  template: '<app-root/>',
  Router,
  NgZone,
  NavigationStart
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
