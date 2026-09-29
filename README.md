# tests
just testing random stuff

## Chatcord — Discord-style chat UI (HTML/CSS/JS)

A front-end-only clone of the Discord desktop layout. No server and no accounts:
all data is fake and stays in your browser. The menus, popouts, modals and
settings screens all work.

Files:

- `index.html` — page shell
- `styles.css` — all styling (dark + light theme, mobile layout)
- `app.js` — fake data, rendering, menus and interactions

### Run it

Open `index.html` in a browser. Nothing to install or build.

### Host it

It's a static site, so any static host works:

- **GitHub Pages:** repo **Settings → Pages → Deploy from a branch**, pick the branch and `/ (root)`.
- **Netlify / Vercel / Cloudflare Pages:** drag and drop the folder, or connect the repo with no build command.

### What works

- Server rail with tooltips, unread pills and mention badges; add a server (templates), join via invite, explore servers
- Channels and categories: switch, collapse, create, edit, duplicate, delete, mute
- Voice channels: join/leave, mute/deafen, "Voice Connected" panel
- Messages: send, reply, edit (↑ key), delete, pin, react, forward, markdown (`**bold**`, `*italic*`, `` `code` ``, code blocks, links, @mentions)
- Emoji / GIF / sticker picker, file uploads (click `+` or drag and drop), polls
- Right-click menus on servers, channels, categories, messages and users
- Server dropdown menu, notification menu, pinned messages, inbox, threads, search
- Profile popouts, member list with roles, DMs with auto-replies and typing indicator
- Friends page: Online / All / Pending / Blocked / Add Friend, accept/ignore requests, block/unblock
- User settings (account, profile editor, privacy, appearance with dark/light/compact/font size, accessibility, voice, notifications, keybinds, language, advanced)
- Server settings (overview with unsaved-changes bar, roles, members/kick, safety, audit log, invites, delete)
- Quick switcher (`Ctrl+K`), `Ctrl+Shift+M` mute, `Ctrl+Shift+D` deafen, `Esc` to close things
- Works on phones: the server and channel lists slide in from the ☰ button
- Bot commands in servers with ModBot: `!help`, `!ping`, `!roll`, `!flip`, `!8ball`
