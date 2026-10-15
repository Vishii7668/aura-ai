# Aura AI website

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
| Workshop "Register" | One click → button turns green "Registered ✓" and the count below it goes up (shared count needs the Registration counter below) |
| Monthly tips "Subscribe" | One click → "Subscribed ✓" |
| Insights | "How AI drives business success" – 3 clickable cards, each opening its own article page |
| Certificate | Visitors enter their name and download a PNG certificate with your signature |

## Put it online

Upload the whole folder (except `server.js` and `package.json`, which are only for running locally) to any static host:

- **Netlify Drop:** drag the folder onto https://app.netlify.com/drop
- **GitHub Pages:** upload the files to a repository → Settings → Pages
- **Your own domain:** upload to `public_html` with your hosting file manager


## Registrations, emails and notifications (free, about 10 minutes)

This turns on:
- **Registration form** (name, email, phone, company) on every Register button
- **Automatic confirmation email** to the participant's Gmail
- **Founder notification email** for every registration and every certificate download
- **Certificate only for registered people** (checked by email + workshop)
- **Visit log** and an optional **daily summary email**
- One **shared count** under each Register button

### Steps
1. Sign in to Google with **visheshmaurya82@gmail.com** and open https://sheets.new. Name it **Aura AI – Registrations**.
2. **Extensions → Apps Script.** Delete everything, paste all of `google-apps-script/Code.gs`, click **Save**.
3. In the function list at the top choose **testSetup**, click **Run**, and allow the permissions (Advanced → Go to project → Allow). You'll receive a test email.
4. **Deploy → New deployment →** gear icon **→ Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy** and copy the **Web app URL** (ends in `/exec`).
5. Open `js/script.js`, **line 12**, paste the URL: `registrationApi: "https://script.google.com/macros/s/XXXX/exec"`
6. Push your site again (`git add -A`, `git commit -m "Connect backend"`, `git push`).

### Optional: daily summary email
In Apps Script click **Triggers (clock icon) → Add trigger** → function **dailySummary** → **Time-driven → Day timer** → choose a time → **Save**.

### Mark attendance (optional)
In the **Registrations** sheet, column **Attended (Y/N)**: type **N** for anyone who didn't attend. They won't be able to download a certificate. Leave it empty or **Y** to allow.

### If you change Code.gs later
**Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.** The URL stays the same.

Note: free Gmail accounts can send about 100 emails a day through Apps Script.
