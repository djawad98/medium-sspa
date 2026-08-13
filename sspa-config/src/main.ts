import { registerApplication, setMountMaxTime, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";

const isMobile = window.innerWidth <= 768;
const routingFile = (await import(isMobile ? "./microfrontend-layout-mobile.html?raw" : "./microfrontend-layout-desktop.html?raw")).default;

const routes = constructRoutes(routingFile);
const applications = constructApplications({
  routes,
  loadApp({ name }) {
    return import(/* @vite-ignore */name);
  },
});
const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach(registerApplication);
layoutEngine.activate();
setMountMaxTime(5000)
start({ urlRerouteOnly: false });

// https://single-spa.js.org/docs/api/#app-change-event
const appchangeHandler = (evt: unknown) => {
  const e = evt as unknown as AppChangeEvent;
  const mountedApps = e.detail.appsByNewStatus['MOUNTED'];
  if (mountedApps.includes('ng/app')) {

    /**
     * Add angular-specific styles
     */
    // const headContent = `
    //   <link rel="stylesheet" href="/fonts/fontawesome/fontawesome.min.css" />
    //   <link rel="stylesheet" href="/fonts/icomoon/icomoon.css" />
    // `
    // document.head.innerHTML += headContent

    /**
     * Add @omp/platform angular polyfills
     */
    const polyfillScript = document.createElement('script')
    polyfillScript.setAttribute('type', 'module')
    polyfillScript.append(`import 'ng/polyfills.js';`)
    document.head.appendChild(polyfillScript);

    /**
     * unsub after first mount of platform
     */
    window.removeEventListener("single-spa:before-mount-routing-event", appchangeHandler)
  }
}
window.addEventListener("single-spa:before-mount-routing-event", appchangeHandler);

interface AppChangeEvent {
  detail: {
    originalEvent: PopStateEvent,
    newAppStatuses: Record<string, string> // { app1: MOUNTED, app2: NOT_MOUNTED }
    appsByNewStatus: Record<string, string> // { MOUNTED: ['app1'], NOT_MOUNTED: ['app2'] }
    totalAppChanges: number
  }
}