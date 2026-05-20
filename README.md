# Sight Word Pop

An iPad-friendly sight word game where kids listen for a word and pop the
matching balloon.

## Play locally

```bash
npm start
```

Then open <http://localhost:4173>.

The support website is available at <http://localhost:4173/support.html>.

## Build the iPad app

This project uses Capacitor to wrap the web game in a native iOS app project.

```bash
npm install
npm run ios:sync
```

The iOS project is in `ios/App`. App Store archiving and upload must be done on
a Mac with Xcode and an Apple Developer account:

1. Run `npm run ios:open` on the Mac.
2. In Xcode, select the `App` target and set your Apple Developer Team under
   **Signing & Capabilities**.
3. If Apple says the bundle ID is unavailable, change it in both Xcode and
   `capacitor.config.json`.
4. Select an iPad or **Any iOS Device** as the build destination.
5. Choose **Product > Archive**.
6. In the Organizer window, choose **Distribute App > App Store Connect**.
7. In App Store Connect, create the app listing, add iPad screenshots, complete
   age rating and privacy details, then submit for review.

The current native bundle ID is `com.jackson24601.sightwordpop`, and the app is
configured as an iPad app.

## Support website

`support.html` is a static support page for App Store Connect's Support URL. It
explains how to use the app, lists the included sight words, gives
troubleshooting tips, and describes the app's no-data-collection privacy posture.

Before submitting the App Store listing, update the contact email in
`support.html` to the address you want families to use for support.
