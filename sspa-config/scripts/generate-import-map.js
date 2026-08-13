import { execSync } from 'node:child_process';
import fs, { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { styleText } from 'node:util';

const __dirname = dirname(fileURLToPath(import.meta.url));
const devImportMapPath = path.resolve(__dirname, "../src/importMap.dev.json");
const devImportMapContent = JSON.parse(readFileSync(devImportMapPath, {encoding: "utf-8"})).imports
const prodImportMapPath = path.resolve(__dirname, "../src/importMap.json");
const sspaDistFolder = path.resolve(__dirname, path.resolve(__dirname, "../dist"));
const builtMifesPath = sspaDistFolder + "/microfrontends";


const prodImportMaps = {imports:{}};
const imports = Object.entries(devImportMapContent);


var sharedDeps = Object.entries({
    'rxjs': path.resolve(__dirname,'../node_modules/rxjs/dist/bundles/rxjs.umd.min.js')
  })

function main(){

    const copyCommands = [];
    for(const [mifeName, mifeUrl] of imports){
        let mifeOutputPath = undefined;

        if(mifeName.startsWith('@omp/platform')){
            /**
             * if import entry is from old-platform
             */
            const oldPlatformDistFolder = path.resolve(__dirname, "../../apps/old-platform/dist/apps/platform/fa");
            const mifeFile = readdirSync(oldPlatformDistFolder).find(file => {
                return (mifeName === '@omp/platform/polyfills.js' ? /^polyfills-[\s\S]*?.js$/i : /^main-[\s\S]*?.js$/i).test(file)
            });
            mifeOutputPath = `old-platform/${mifeFile}`
            copyCommands.push([oldPlatformDistFolder, builtMifesPath + '/old-platform']);

        } else if(mifeName.startsWith('@omp/sv')){
            /**
             * if import entry is from svelte projects. Mobile or desktop
            */
            const mobileOrDesktop = mifeName.startsWith('@omp/sv-mobile') ? 'mobile' : 'desktop';
            const svelteDistFolder = path.resolve(__dirname, "../../apps/sv-platform-"+mobileOrDesktop+"/build");
            const mifeFile = mifeUrl.split("/").at(-1);
            mifeOutputPath = `sv-platform-${mobileOrDesktop}/${mifeFile}`;
            copyCommands.push([svelteDistFolder, `${builtMifesPath}/sv-platform-${mobileOrDesktop}`]);
        } else if(mifeUrl.includes('node_modules')){
            /**
             * if import entry is a shared node_module file
             */
            const [,pkgPath] = sharedDeps.find((pkg) => mifeName.includes(pkg[0]));
            const pkgFile = pkgPath.split('/').at(-1);
            mifeOutputPath = `shared-deps/${pkgFile}`;
            copyCommands.push([pkgPath, builtMifesPath + '/' + mifeOutputPath]);

        } else {
            /**
             * if import entry is unknown
             */
            throw new Error("Could not resolve mife '"+mifeName+"' with path '"+mifeUrl+"'")
        }
        prodImportMaps.imports[mifeName] = '/'+ path.relative(sspaDistFolder, builtMifesPath + '/' + mifeOutputPath);
    }

    /**
     * Update importMap.json file for production
     * Also prettify the file
     */
    console.log(styleText(['cyan'],'Updating importMap.json...'))
    writeFileSync(prodImportMapPath,JSON.stringify(prodImportMaps), {encoding: 'utf-8'})
    execSync('pnpm exec prettier --write '+ prodImportMapPath, {encoding: 'utf-8'})
    console.log(styleText(['green','bold'],'Updated!'))

    /**
     * build sspa application using its vite build
     */
    console.log(styleText(['cyan'],'Building sspa-config...'))
    execSync('vite build', {encoding: 'utf-8'})
    console.log(styleText(['green','bold'],'Built!'))

    /**
     * copy microfrontends to dist folder of the sspa-config project
     */
    console.log(styleText(['cyan'],'Copying sspa-config...'))
    copyCommands.forEach(command => {
        copyDirectory(...command)
        console.log('Copied '+command[0])
    })
    console.log(styleText(['green','bold'],'All Microfrontends copied!'))

    /**
     * May be we can discard updated importMap.json file
     */
    // execSync('git restore ./src/importMap.json', {encoding: 'utf-8'})
    // console.log('Reverted importMap.json!')
    console.log(styleText(['green', 'bold'],'Opertaion successful!'))
}

main();

function copyDirectory(src, dest) {
    if (!fs.existsSync(src)) {
      throw new Error(`Source does not exist: ${src}`);
    }
  
    // Remove destination if it exists
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true }); 
    }
  
    // Ensure parent of destDir exists
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true }); 
    }
  
    if(fs.statSync(src).isFile()){
        fs.copyFileSync(src, dest);
    } else {
        // Copy directory recursively
        fs.cpSync(src, dest, { recursive: true, });
    }
}
  
