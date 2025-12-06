<img src="src/resources/icons/128.png" width="64"/>

# PassForge

An open-source password generator designed to create strong, unique passwords without storing any user data. Passwords are generated safely and never stored or transmitted.

## Why I built this

I needed a simple password generator that:
- Runs **inside my browser** - not on some random website with trackers
- Stores **nothing** - password goes straight to clipboard, that's it
- Has **zero data collection** - no analytics, no telemetry, no nonsense
- Is **open source** - so anyone can verify what it does

Most password generators I found were either bloated, required accounts, stored data in localStorage, or ran on websites full of tracking scripts. I wanted something minimal that just works.

## How it works

1. Click the extension icon
2. Password is generated and copied to clipboard
3. Done

That's it. No accounts. No storage. No data leaves your browser.

## Features

- **Zero Storage** - Passwords are never saved anywhere, only copied to your clipboard
- **Cryptographically Secure** - Uses `crypto.getRandomValues()` for true randomness
- **Customizable** - Adjust length, special characters, numbers, uppercase
- **Context Menu** - Right-click on any password field to generate
- **Smart Recognition** - Select text like "8 characters with numbers" and generate matching password
- **Works Offline** - No network requests, ever

## Install

<p align="center">
<a rel="noreferrer noopener" href="https://chromewebstore.google.com/detail/passforge/kbnggnipiipfgnibgnhhmmmnnbpncgch"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome-141e24.svg?&style=for-the-badge&logo=google-chrome&logoColor=white"></a>
<a rel="noreferrer noopener" href="https://addons.mozilla.org/firefox/addon/passforge/"><img alt="Firefox Add-on" src="https://img.shields.io/badge/Firefox-141e24.svg?&style=for-the-badge&logo=firefox-browser&logoColor=white"></a>
</p>

## Privacy

- No data collection
- No analytics
- No network requests
- No localStorage
- No cookies
- Password exists only in your clipboard

## Build from source

```bash
pnpm install
pnpm build
```

Extensions will be in `build/chrome` and `build/firefox`.

## License

ISC
