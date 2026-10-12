# AI MindSET website

Practical AI workshops, a prompt library, insights articles and downloadable certificates.

## Project structure

```
ai-mindset-website/
├── index.html            ← page structure
├── css/style.css         ← all styling
├── js/script.js          ← all functionality (background animation, prompts, workshops, insights, certificate)
├── assets/
│   ├── images/           ← insight images + founder signature
│   └── logo/             ← logo files (dark, light, icon)
├── server.js             ← small local server (no packages needed)
└── package.json
```

## Run it on your computer

1. Install **Node.js** (version 14 or newer) from https://nodejs.org if you don't have it.
   Check with: `node -v`
2. Unzip this folder, open a terminal **inside** the `ai-mindset-website` folder, and run:

```bash
npm start
```

3. Open **http://localhost:3000** in your browser. Press `Ctrl + C` in the terminal to stop.

No `npm install` is needed – the server uses only built-in Node.js modules.

**No Node.js?** If you have Python, run this inside the folder instead:

```bash
python -m http.server 3000
```

> Always open the site through the server (http://localhost:3000), not by double-clicking `index.html`. The certificate download needs the page to be served.

## Add your details

Open `js/script.js` and edit the block at `EDIT YOUR DETAILS HERE`:

```js
const CONFIG = {
  email: "you@example.com",
  phone: "+91 00000 00000",
  founderLabel: "FOUNDER"
};
```

Other content you can edit in `js/script.js`:

| Search for | What it controls |
|---|---|
| `const WORKSHOPS` | Workshop titles, dates, times, mode |
| `const PROMPTS` | Prompt library |
| `const INSIGHTS` | The 3 insight articles (title, text, image, prompt) |

Text such as the hero headline, sections and FAQ is in `index.html`. Colours and layout are in `css/style.css`.

To replace an insight image, put your image in `assets/images/` and change its `src` in `const INSIGHTS`.
To replace the signature, overwrite `assets/images/signature.png` (transparent PNG works best).

## Features

| Feature | How it works |
|---|---|
| Animated background | Gold particle wave and bokeh lights on every page |
| Try a prompt | Opens the prompt in Claude or ChatGPT in a new tab |
| Prompt library | Filter, search, copy, or send a prompt to the Try box |
| Workshop "Register" | Opens an email to you with the workshop details |
| Monthly tips "Subscribe" | Opens an email to you |
| Insights | "How AI drives business success" – 3 clickable cards, each opening its own article page |
| Certificate | Visitors enter their name and download a PNG certificate with your signature |

## Put it online

Upload the whole folder (except `server.js` and `package.json`, which are only for running locally) to any static host:

- **Netlify Drop:** drag the folder onto https://app.netlify.com/drop
- **GitHub Pages:** upload the files to a repository → Settings → Pages
- **Your own domain:** upload to `public_html` with your hosting file manager
