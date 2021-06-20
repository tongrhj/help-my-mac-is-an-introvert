const path = require("path");
require("dotenv").config();

const APP_BUNDLE_ID = "com.jaredtong.super-cozy-introvert-party";
const IDENTITY = "NTVN7FLWTR";

const config = {
  packagerConfig: {
    name: "Super Cozy Catnap Time",
    appCopyright: "Jared Tong",
    asar: true,
    icon: path.resolve(__dirname, "assets", "MyIcon.icns"),
    ignore: [
      ".+.test.js",
      ".*.env",
      ".env",
      ".husky",
      ".eslintcache",
      ".gitignore",
      "README.md",
      ".*.provisionprofile",
    ],
    appCategoryType: "public.app-category.developer-tools",
    osxSign: {
      identity: "Developer ID Application: Jared Tong (NTVN7FLWTR)",
      hardenedRuntime: true,
      entitlements: "entitlements.plist",
      "entitlements-inherit": "entitlements.plist",
      "signature-flags": "library",
      "gatekeeper-assess": false,
    },
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
    },
  },
  makers: [
    {
      name: "@electron-forge/maker-dmg",
      platforms: ["darwin"],
      arch: ["x64", "arm64"],
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
    throw new Error(
      "Should be notarizing, but environment variables APPLE_ID or APPLE_ID_PASSWORD are missing!"
    );
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
