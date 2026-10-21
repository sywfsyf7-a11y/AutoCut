const {platform} = require('os');

require('dotenv').config();

const macosSigningConfig =
  process.env.QA_UNSIGNED_BUILD === 'true'
    ? {}
    : {
        osxSign: {
          identity: 'Developer ID Application: ToolPad (9K87MUX8ZW)',
        },
      };

// For all config keys, see https://electron.github.io/packager/main/interfaces/Options.html
module.exports = {
  packagerConfig: {
    appBundleId: 'com.autocut.aea',
    appCategoryType: 'public.app-category.productivity',
    appCopyright: '© 2026 AutoCut. Tous droits réservés.',
    asar: process.env.ASAR === 'true',
    asarUnpack: ['**/*.node', '**/*.dylib', '**/*.dll', '**/*.so'], // Ensure that all the .node etc files are signed
    darwinDarkModeSupport: true,
    executableName: 'AutoCut',
    helperBundleId: 'com.autocut.aea',
    icon: 'buildResources/icon',
    junk: false,
    name: 'AutoCut',
    ...macosSigningConfig,
    // package.json pins @electron/universal to an ESM-capable launcher (3.0.6).
    // Older launchers emit CommonJS under this app's "type": "module" package.
    osxUniversal: {
      x64ArchFiles:
        '**/node_modules/velopack/lib/native/velopack_nodeffi_osx.node',
    },
    packageManager: 'yarn',
    out: 'dist',
    overwrite: true,
    platform: ['darwin', 'win32'],
    arch: ['x64', 'ia32', 'armv7l', 'arm64'],
    protocols: [{name: 'AutoCut', schemes: ['autocut']}],
    win32metadata: {
      'requested-execution-level': 'asInvoker',
    },

    extraResource: [
      'buildResources/assets',
      ...(process.platform === 'darwin'
        ? ['./buildResources/icons/Assets.car']
        : []),
    ],
    extendInfo: {
      CFBundleIconName: 'AutoCut', // The name of the icon in the buildResources/icons/Assets.car file
    },
  },
  rebuildConfig: {
    force: true,
  },
  publishers: [],
  plugins: [],
};
