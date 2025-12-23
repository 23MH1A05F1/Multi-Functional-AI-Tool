
# Multi-Functional AI Tools Workspace
Demo link: https://23mh1a05f1.github.io/Multi-Functional-AI-Tool/ammu

Welcome to this collection of practical AI-powered utilities and demos. This workspace bundles small, focused projects for tasks like resume building, chatbots, summarization, translation, image editing, and more. Each subproject is self-contained for quick testing or integration.

## 📁 Project Overview

Here's a structured breakdown of the key folders and their purposes:


| Folder | Description | Tech Stack | Entry Point |
| :-- | :-- | :-- | :-- |
| **ATS/** | Frontend UI for ATS dashboard and resume pages. | HTML/CSS/JS | `ats.html`, `ats_Dashbord_ui.html` |
| **ats_resume_builder_ats/** | Full React-based resume builder with dashboard. | TypeScript + Vite + React | `npm run dev` (see `package.json`) |
| **bg_remove/** | Demo for image background removal. | HTML/JS | `bg_remove.html` |
| **chatbot/** | Basic interactive chatbot interface. | HTML/CSS/JS | `index.html` |
| **chatbot_ui_ready/** | Advanced chatbot UI with Python summarization backend. | Frontend (HTML/JS) + Python | Frontend: `frontend/`; Backend: `Summary/` |
| **Offline-AI-chatbot-main/** \& **offlinechat/** | Offline-capable chatbots with Python servers. | Python + JS | Look for `app.py` or `server/` |
| **Summary/** | Text summarization tools with simple frontend. | Python + HTML/JS | `python app.py` (after `requirements.txt`) |
| **Excel-main/** | Spreadsheet analysis with backend/frontend. | Node.js + Frontend | Backend: `backend/server.js`; Frontend: `frontend/sheet-analysis/` |
| **Translator/** | Real-time language translation demo. | HTML/JS | `index.html` |
| **login/** | Basic signup/auth UI demo. | HTML | `signup.html` |
| **my_library/** | Static library/history management pages. | HTML/CSS | Open HTML files |

## 🚀 Quick Start Guide

### Static Demos (Browser-Ready)

Open these directly in any web browser—no setup needed:

- `chatbot/index.html`
- `bg_remove/bg_remove.html`
- `Translator/index.html`
- `login/signup.html`
- `my_library/` HTML files

For a better experience, serve via a local server:

```bash
# Using Python (3+)
python -m http.server 8000

# Or Node.js
npx serve .
```

Visit `http://localhost:8000`.

### Node.js/React Projects

```bash
cd <folder>  # e.g., ats_resume_builder_ats/
npm install
npm run dev  # Or check package.json for scripts like 'start'
```


### Python Projects

```bash
cd <folder>  # e.g., Summary/
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py  # Or check for specific entrypoint
```

**Pro Tip**: For full-stack setups (e.g., `chatbot_ui_ready/`), start the Python backend first, then launch the frontend dev server.

## 🔍 Troubleshooting \& Tips

- **Missing READMEs?** Dive into each folder—many have inline docs, `package.json` scripts, or files like `Excel-main/CONNECTION_COMPLETE.md`.
- **Dependencies?** Always run `npm install` or `pip install -r requirements.txt` first.
- **Port Conflicts?** Edit `package.json` or `app.py` to change default ports (e.g., from 3000 to 3001).
- **Windows Users**: Use `.\.venv\Scripts\activate` for venv and Git Bash/PowerShell for npm.


## 🤝 Contribution \& Enhancements

- **Unified Launcher**: I can add a top-level `start.sh`/`.bat` script or CLI to launch any project with one command. Which ones do you use most?
- **Feedback**: Share issues running a specific folder (e.g., "Help with Excel-main"), and I'll provide tailored steps or fix deps.
- **License**: Add a `LICENSE` (e.g., MIT) at the root before publishing or sharing.

This workspace is perfect for rapid prototyping—pick a folder and run! Need detailed setup for one project? Just name it.

