const APP_BUNDLE_ID = "com.jaredtong.super-cozy-introvert-party";
const IDENTITY = "NTVN7FLWTR";

const config = {
  packagerConfig: {
    name: "Super Cozy Introvert Party Time",
    asar: true,
    appBundleId: APP_BUNDLE_ID,
    appCategoryType: "public.app-category.utilities",
    appCopyright: "Jared Tong",
    icon: "assets/MyIcon.icns",
    ignore: [
      ".+.test.js",
      ".*.env",
      ".husky",
      ".eslintcache",
      ".gitignore",
      "README.md",
      ".*.provisionprofile",
    ],
    osxSign: {
      identity: `Developer ID Application: Jared Tong (${IDENTITY})`,
      hardenedRuntime: true,
      "gatekeeper-assess": false,
      entitlements: "static/entitlements.plist",
      "entitlements-inherit": "static/entitlements.plist",
      "signature-flags": "library",
    },
  },
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
      architectures: ["x64", "arm64"],
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "tongrhj",
          name: "help-my-mac-is-an-introvert",
        },
        draft: true,
        prerelease: false,
      },
    },
  ],
};

function notarizeMaybe() {
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    console.warn(
      "Should be notarizing, but environment variables APPLE_ID or APPLE_ID_PASSWORD are missing!"
    );
    return;
  }

  config.packagerConfig.osxNotarize = {
    appBundleId: APP_BUNDLE_ID,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    ascProvider: IDENTITY,
  };
}

notarizeMaybe();

module.exports = config;
