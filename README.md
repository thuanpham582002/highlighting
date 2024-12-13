# Highlighter
A simple chrome extension that allows the highlighting of text on webpages with a simple right-click (or keyboard shortcut Ctrl+Shfit+H). Saves all highlights so they can be re-highlighted when a webpage is reopened!

Available for [download on the Chrome web store](https://chrome.google.com/webstore/detail/highlighter/fdfcjfoifbjplmificlkdfneafllkgmn).
---
Fork from [jeromepl/highlighter](https://github.com/jeromepl/highlighter) then add a function to sync with the GitHub repo to always keep your backup safe.

## Development Set Up

You will need Node.js and [the `gh` cli](https://cli.github.com/) installed (and authenticated).
Then, run the following:

```sh
npm install
```

Finally, you will need to enter your own Google Analytics account IDs. One for production and one for testing:
```sh
cp config/secrets.sample.js config/secrets.js # Then replace "GA_TRACKING_ID" with your test account ID
cp config/secrets.sample.js config/secrets.production.js # Then replace the "GA_TRACKING_ID" with your production account ID
```

## Other commands:

- Linting (ESLint): `npm run lint`
- Releasing a new version:
```sh
# Bump the version in the manifest and package.json files, create a new commit, tag it, push to Github
# and create a draft release on Github using the `gh` CLI tool
npm run release

# Create the zipped package to upload to the Chrome web store
npm run build
```
