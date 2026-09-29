'use strict';
/* ==========================================================================
   Chatcord — Discord-style UI demo.
   Everything runs in the browser with fake data: no server, no accounts.
   ========================================================================== */

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const MIN = 60e3, HOUR = 60 * MIN, DAY = 24 * HOUR;
let idSeq = 0;
const nextId = (p = 'id') => p + (++idSeq);
const pick = a => a[Math.floor(Math.random() * a.length)];
const initials = name => name.split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 3) || '?';

/* ---------- icons (inline SVG, stroke style) ---------- */
const P = {
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  logo: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="9.01" y2="10"/><line x1="15" y1="10" x2="15.01" y2="10"/>',
  messagePlus: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="12" y1="7" x2="12" y2="13"/><line x1="9" y1="10" x2="15" y2="10"/>',
  hash: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
  speaker: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  plusCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  mic: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
  headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  pin: '<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
  userCircle: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M6.17 18.9a7 7 0 0 1 11.66 0"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  chevronRight: '<polyline points="9 18 15 12 9 6"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  gifIcon: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M9 10H7v4h2v-2M12 10v4M15 14v-4h2.5M15 12h2"/>',
  sticker: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9.5L21 14.5V5a2 2 0 0 0-2-2z"/><path d="M14 21v-5a2 2 0 0 1 2-2h5"/>',
  reply: '<polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
  forward: '<polyline points="15 17 20 12 15 7"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  phoneOff: '<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/>',
  video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  signal: '<path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  threads: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  id: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M7 9v6M11 9h2a3 3 0 0 1 0 6h-2z"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  gem: '<polygon points="6 3 18 3 22 9 12 22 2 9"/><path d="M2 9h20M12 22 8 9l4-6 4 6z"/>',
  folderPlus: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
};
const SLASH = '<line class="slash" x1="3" y1="3" x2="21" y2="21"/>';
function icon(name, size = 20, cls = '', extra = '') {
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}${extra}</svg>`;
}

/* ---------- data ---------- */
const users = {
  me:    { id: 'me', name: 'You', username: 'you', color: '#5865f2', status: 'online', about: 'Just vibing.', since: 'Jan 1, 2024' },
  nova:  { id: 'nova', name: 'Nova', username: 'nova.dev', color: '#eb459e', status: 'online', activity: 'Coding in VS Code', about: 'Full-stack dev. Coffee first, code second.', since: 'Mar 3, 2021' },
  kai:   { id: 'kai', name: 'Kai', username: 'kai_codes', color: '#3ba55c', status: 'idle', activity: 'Listening to lo-fi beats', about: 'Rust enjoyer 🦀', since: 'Aug 12, 2022' },
  mika:  { id: 'mika', name: 'Mika', username: 'mikaaa', color: '#faa61a', status: 'dnd', activity: 'Studying for finals', about: 'CS student. Please send memes.', since: 'Jan 19, 2023' },
  rex:   { id: 'rex', name: 'Rex', username: 'rexx', color: '#ed4245', status: 'offline', about: 'Mostly lurking.', since: 'Jun 2, 2020' },
  luna:  { id: 'luna', name: 'Luna', username: 'luna.art', color: '#9b59b6', status: 'online', activity: 'Drawing something cool', about: 'Digital artist ✨ commissions open', since: 'Oct 30, 2021' },
  zed:   { id: 'zed', name: 'Zed', username: 'zed404', color: '#1abc9c', status: 'online', activity: 'Playing a racing game', about: 'gg ez', since: 'Feb 14, 2022' },
  ivy:   { id: 'ivy', name: 'Ivy', username: 'ivy.green', color: '#2ecc71', status: 'offline', about: '🌱', since: 'May 5, 2023' },
  orion: { id: 'orion', name: 'Orion', username: 'orion_x', color: '#e67e22', status: 'online', about: 'New here!', since: 'Sep 1, 2026' },
  sage:  { id: 'sage', name: 'Sage', username: 'sage.wav', color: '#607d8b', status: 'idle', about: 'Music producer.', since: 'Jul 7, 2024' },
  bot:   { id: 'bot', name: 'ModBot', username: 'modbot', color: '#5865f2', status: 'online', bot: true, activity: 'Watching the server', about: 'I keep things tidy. Type !help', since: 'Jan 1, 2021' },
};

const servers = [
  {
    id: 'cc', name: 'Coding Club', short: 'CC', color: '#5865f2', owner: 'nova',
    roles: [
      { name: 'Admin', color: '#f47fff', members: ['nova'] },
      { name: 'Moderator', color: '#00a8fc', members: ['kai', 'bot'] },
      { name: 'Helper', color: '#2ecc71', members: ['luna'] },
    ],
    members: ['me', 'nova', 'kai', 'mika', 'rex', 'luna', 'zed', 'ivy', 'bot'],
    categories: [
      { id: 'info', name: 'Information', channels: [
        { id: 'welcome', name: 'welcome', type: 'text', topic: 'Welcome to Coding Club! Read #rules first.' },
        { id: 'rules', name: 'rules', type: 'text', topic: 'Be nice. Seriously.' },
        { id: 'announcements', name: 'announcements', type: 'text', topic: 'Club news and events' },
      ] },
      { id: 'text', name: 'Text Channels', channels: [
        { id: 'general', name: 'general', type: 'text', topic: 'General chat about anything code-related 💻' },
        { id: 'help', name: 'help', type: 'text', topic: 'Stuck? Post your code and the error message.' },
        { id: 'showcase', name: 'showcase', type: 'text', topic: 'Show off what you built!' },
        { id: 'off-topic', name: 'off-topic', type: 'text', topic: 'Anything goes (within the rules)' },
      ] },
      { id: 'voice', name: 'Voice Channels', channels: [
        { id: 'lounge', name: 'Lounge', type: 'voice' },
        { id: 'pair', name: 'Pair Programming', type: 'voice' },
      ] },
    ],
  },
  {
    id: 'gh', name: 'Gaming Hub', short: 'GH', color: '#ed4245', owner: 'zed',
    roles: [
      { name: 'Owner', color: '#faa61a', members: ['zed'] },
      { name: 'Squad', color: '#57f287', members: ['kai', 'mika'] },
    ],
    members: ['me', 'zed', 'kai', 'mika', 'rex', 'orion'],
    categories: [
      { id: 'text', name: 'Text Channels', channels: [
        { id: 'general', name: 'general', type: 'text', topic: 'Talk games' },
        { id: 'lfg', name: 'looking-for-group', type: 'text', topic: 'Find people to play with' },
        { id: 'clips', name: 'clips', type: 'text', topic: 'Post your best plays' },
      ] },
      { id: 'voice', name: 'Voice Channels', channels: [
        { id: 'squad1', name: 'Squad 1', type: 'voice' },
        { id: 'squad2', name: 'Squad 2', type: 'voice' },
      ] },
    ],
  },
  {
    id: 'ad', name: 'Art & Design', short: 'A&D', color: '#9b59b6', owner: 'luna',
    roles: [{ name: 'Curator', color: '#eb459e', members: ['luna'] }],
    members: ['me', 'luna', 'ivy', 'sage', 'nova'],
    categories: [
      { id: 'text', name: 'Text Channels', channels: [
        { id: 'general', name: 'general', type: 'text', topic: 'Chat with fellow creatives' },
        { id: 'showcase', name: 'showcase', type: 'text', topic: 'Share your work' },
        { id: 'feedback', name: 'feedback', type: 'text', topic: 'Constructive critique only' },
      ] },
      { id: 'voice', name: 'Voice Channels', channels: [{ id: 'studio', name: 'Studio', type: 'voice' }] },
    ],
  },
];

const voiceUsers = { 'cc:lounge': ['kai', 'luna'], 'gh:squad1': ['zed'] };
const unread = new Set(['cc:announcements', 'cc:showcase', 'gh:lfg', 'ad:showcase']);
const mentions = { 'gh:general': 1 };
let friends = ['nova', 'kai', 'mika', 'rex', 'luna', 'zed', 'ivy'];
let pending = [{ id: 'orion', incoming: true }, { id: 'sage', incoming: false }];
let blocked = [];
const dmList = ['nova', 'kai', 'mika', 'luna', 'zed'];

const messages = {};
const R = obj => Object.fromEntries(Object.entries(obj).map(([e, c]) => [e, { count: c, me: false }]));
function seed(key, rows) {
  messages[key] = rows.map(([author, text, ago, extra]) => ({
    id: nextId('m'), author, text, time: new Date(Date.now() - ago), reactions: {}, ...(extra || {}),
  }));
}
seed('cc:general', [
  ['nova', 'Morning everyone! ☀️ Anyone working on something fun this weekend?', DAY + 3 * HOUR],
  ['kai', 'Rewriting my CLI tool in Rust. Again.', DAY + 3 * HOUR - 2 * MIN],
  ['kai', 'third time is the charm right', DAY + 3 * HOUR - 3 * MIN],
  ['mika', 'lmao', DAY + 3 * HOUR - 5 * MIN, { reactions: R({ '😂': 4 }) }],
  ['luna', 'I made a little pixel-art editor in plain JS, will post it in showcase later', DAY + 2 * HOUR],
  ['nova', 'Reminder: code review night is **Friday at 7pm** in the Lounge voice channel 🎧', 5 * HOUR, { reactions: R({ '🔥': 6, '👍': 3 }), pinned: true }],
  ['zed', 'can someone explain closures like I\'m five', 3 * HOUR],
  ['kai', 'A closure is a function that remembers the variables from where it was created:\n```js\nfunction counter() {\n  let n = 0;\n  return () => ++n;\n}\nconst next = counter();\nnext(); // 1\nnext(); // 2\n```', 3 * HOUR - 4 * MIN, { reactions: R({ '🧠': 5 }) }],
  ['zed', 'oh that actually makes sense', 3 * HOUR - 6 * MIN],
  ['bot', 'Welcome @You to **Coding Club**! Make sure to read the rules channel. Type `!help` to see what I can do.', 40 * MIN],
  ['nova', 'hey @You, glad you made it! Feel free to introduce yourself 👋', 12 * MIN],
]);
messages['cc:general'][8].replyTo = messages['cc:general'][7].id;
seed('cc:welcome', [['bot', '👋 **Welcome to Coding Club!**\n\nWe are a friendly community of people learning and building software together.\n• Say hi in general\n• Ask questions in help\n• Share your projects in showcase', 30 * DAY]]);
seed('cc:rules', [['bot', '**Server Rules**\n1. Be respectful. No harassment or hate speech.\n2. No spam or self-promo outside showcase.\n3. Keep content safe for work.\n4. Use the right channel for your question.\n5. Have fun and help each other out!', 30 * DAY, { pinned: true }]]);
seed('cc:announcements', [
  ['nova', '📣 **Hackathon next month!** Teams of up to 4. Theme will be announced on the day. Sign-ups open now @everyone', 2 * DAY, { reactions: R({ '🎉': 14, '🚀': 8 }) }],
  ['nova', 'We just hit **500 members**! Thank you all 💜', 2 * HOUR, { reactions: R({ '💜': 21 }) }],
]);
seed('cc:help', [
  ['mika', 'why does `[] + {}` give "[object Object]" in JS 😭', 6 * HOUR],
  ['kai', 'Because `+` turns both sides into strings: `[]` becomes `""` and `{}` becomes `"[object Object]"`. JavaScript is fun like that.', 6 * HOUR - 10 * MIN, { reactions: R({ '💀': 3 }) }],
]);
seed('cc:showcase', [['luna', 'Here it is! A tiny pixel editor with layers and an onion-skin mode: https://example.com/pixel-editor', 40 * MIN, { reactions: R({ '🔥': 7, '😍': 4 }) }]]);
seed('cc:off-topic', [
  ['zed', 'hot take: tabs > spaces', 4 * HOUR],
  ['mika', 'blocked, reported, uninstalled', 4 * HOUR - MIN, { reactions: R({ '😂': 9 }) }],
]);
seed('gh:general', [
  ['zed', 'Anyone up for some games tonight?', 3 * HOUR],
  ['kai', "I'm in after 9", 3 * HOUR - 5 * MIN],
  ['zed', '@You you coming too? we need one more', 25 * MIN],
]);
seed('gh:lfg', [['orion', 'LF2M for ranked, chill vibes only 🎮', 50 * MIN]]);
seed('gh:clips', [['zed', 'look at this clutch 😤 https://example.com/clip/1234', DAY, { reactions: R({ '🤯': 5 }) }]]);
seed('ad:general', [
  ['luna', 'What brushes is everyone using lately?', 5 * HOUR],
  ['sage', 'Honestly just the default round brush with pressure opacity', 5 * HOUR - 8 * MIN],
]);
seed('ad:showcase', [['luna', 'New piece: "Neon Rain" 🌧️ took about 12 hours', 90 * MIN, { reactions: R({ '😍': 11, '✨': 6 }) }]]);
seed('dm:nova', [
  ['nova', 'yo! did you see the hackathon announcement?', 2 * DAY],
  ['me', 'yeah! thinking about joining', 2 * DAY - 5 * MIN],
  ['nova', 'we should team up 👀', 2 * DAY - 6 * MIN],
  ['nova', 'also can you review my PR when you get a sec?', 20 * MIN],
]);
seed('dm:kai', [['kai', 'check out this crate, it is so good', DAY]]);
seed('dm:mika', [['mika', 'good luck on your exam!!', 3 * DAY], ['me', 'thank you 🙏', 3 * DAY - MIN]]);
seed('dm:luna', [['luna', 'thanks for the feedback on my drawing 💜', 4 * DAY]]);
seed('dm:zed', [['zed', 'gg last night', 5 * DAY]]);

const REPLIES = ['haha nice', 'wait really?', 'lol same', "that's actually so cool", 'brb getting snacks', 'true true', '👀', 'ok but hear me out…', 'agreed 💯', 'no way 😂', 'W', 'hmm let me think about that', 'sounds good to me!'];

const EMOJI = [
  ['😀', 'grinning'], ['😂', 'joy'], ['🤣', 'rofl'], ['😊', 'blush'], ['😍', 'heart_eyes'], ['🥰', 'smiling_hearts'], ['😎', 'sunglasses'], ['🤔', 'thinking'],
  ['😅', 'sweat_smile'], ['😭', 'sob'], ['😡', 'rage'], ['😴', 'sleeping'], ['🥳', 'partying'], ['😱', 'scream'], ['🤯', 'exploding_head'], ['🙃', 'upside_down'],
  ['😇', 'innocent'], ['🤗', 'hugging'], ['🙄', 'eye_roll'], ['😬', 'grimacing'], ['💀', 'skull'], ['🥺', 'pleading'], ['😤', 'triumph'], ['🤡', 'clown'],
  ['👍', 'thumbsup'], ['👎', 'thumbsdown'], ['👏', 'clap'], ['🙌', 'raised_hands'], ['🙏', 'pray'], ['💪', 'muscle'], ['👀', 'eyes'], ['👋', 'wave'],
  ['🤝', 'handshake'], ['✌️', 'v'], ['❤️', 'heart'], ['🧡', 'orange_heart'], ['💛', 'yellow_heart'], ['💚', 'green_heart'], ['💙', 'blue_heart'], ['💜', 'purple_heart'],
  ['🔥', 'fire'], ['✨', 'sparkles'], ['⭐', 'star'], ['🎉', 'tada'], ['💯', '100'], ['✅', 'check'], ['❌', 'x'], ['⚡', 'zap'],
  ['🍕', 'pizza'], ['☕', 'coffee'], ['🎮', 'video_game'], ['🎧', 'headphones'], ['💻', 'computer'], ['🚀', 'rocket'], ['🐛', 'bug'], ['🦀', 'crab'],
  ['🐍', 'snake'], ['🌙', 'moon'], ['🌈', 'rainbow'], ['🍀', 'clover'], ['🎨', 'art'], ['📌', 'pushpin'], ['💡', 'bulb'], ['🧠', 'brain'],
];

const DISCOVER = [
  { name: 'Web Dev Hangout', desc: 'Frontend, backend, and everything in between.', members: '48,203', color: '#00a8fc' },
  { name: 'Pixel Artists', desc: 'Share sprites, get feedback, join weekly challenges.', members: '12,877', color: '#eb459e' },
  { name: 'Indie Game Devs', desc: 'Build games, find collaborators, ship things.', members: '31,550', color: '#57f287' },
  { name: 'Study Together', desc: 'Focus rooms, pomodoro timers and good vibes.', members: '95,112', color: '#f0b232' },
];

/* ---------- preferences (saved in this browser only) ---------- */
function load(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } }
const prefs = Object.assign({ theme: 'dark', compact: false, fontSize: 16, reducedMotion: false, underline: false, devMode: false, roleColors: true, lang: 'en-US' }, load('chatcord.prefs'));
Object.assign(users.me, load('chatcord.me'));
function savePrefs() {
  try {
    localStorage.setItem('chatcord.prefs', JSON.stringify(prefs));
    const { name, about, banner, pronouns, status, color } = users.me;
    localStorage.setItem('chatcord.me', JSON.stringify({ name, about, banner, pronouns, status, color }));
  } catch { /* storage unavailable */ }
}
function applyPrefs() {
  const theme = prefs.theme === 'sync' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : prefs.theme;
  document.documentElement.dataset.theme = theme;
  document.body.classList.toggle('compact', !!prefs.compact);
  document.body.classList.toggle('reduce-motion', !!prefs.reducedMotion);
  document.body.classList.toggle('underline-links', !!prefs.underline);
  document.documentElement.style.setProperty('--msg-size', prefs.fontSize + 'px');
}

/* ---------- state ---------- */
const state = {
  server: 'cc', channel: { cc: 'general', gh: 'general', ad: 'general' }, dm: null,
  friendsTab: 'online', showMembers: true, showDmProfile: true,
  voice: null, muted: false, deafened: false, mutedBeforeDeafen: false,
  replyTo: null, replyPing: true, editing: null, collapsed: new Set(), drafts: {},
  search: null, typing: null, renderedKey: null,
};

const currentServer = () => servers.find(s => s.id === state.server);
const channelsOf = s => s.categories.flatMap(c => c.channels);
const findChannel = (s, id) => s && channelsOf(s).find(c => c.id === id);
function currentChannel() {
  const s = currentServer(); if (!s) return null;
  return findChannel(s, state.channel[s.id]) || channelsOf(s).find(c => c.type === 'text') || null;
}
function currentKey() {
  if (state.server === 'home') return state.dm ? 'dm:' + state.dm : null;
  const ch = currentChannel();
  return ch ? state.server + ':' + ch.id : null;
}
function findMsg(id) {
  for (const k in messages) { const m = messages[k].find(x => x.id === id); if (m) return m; }
  return null;
}
const keyOfMsg = id => Object.keys(messages).find(k => messages[k].some(m => m.id === id));
const roleOf = (s, uid) => s && s.roles.find(r => r.members.includes(uid));
function nameColor(uid) {
  if (!prefs.roleColors) return '';
  const r = roleOf(currentServer(), uid);
  return r ? r.color : '';
}
const statusLabel = (s, me) => ({ online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: me ? 'Invisible' : 'Offline' }[s]);
const mentionsMe = t => /@(you|everyone|here)\b/i.test(t || '') || (t || '').includes('@' + users.me.name);

/* ---------- formatting ---------- */
const fmtTime = d => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const sameDay = (a, b) => a.toDateString() === b.toDateString();
function fmtStamp(d) {
  const t = new Date(), y = new Date(); y.setDate(t.getDate() - 1);
  if (sameDay(d, t)) return 'Today at ' + fmtTime(d);
  if (sameDay(d, y)) return 'Yesterday at ' + fmtTime(d);
  return d.toLocaleDateString() + ' ' + fmtTime(d);
}
const fmtDate = d => d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
const fmtSize = b => b < 1024 ? b + ' bytes' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
const knownName = n => ['everyone', 'here', 'you'].includes(n.toLowerCase()) || Object.values(users).some(u => u.name.toLowerCase() === n.toLowerCase());
function fmt(text) {
  let s = esc(text);
  const blocks = [];
  s = s.replace(/```(?:[\w-]*\n)?([\s\S]*?)```/g, (_, c) => { blocks.push(`<pre><code>${c.replace(/^\n+|\n+$/g, '')}</code></pre>`); return `\u0000${blocks.length - 1}\u0000`; });
  s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<u>$1</u>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/@([A-Za-z0-9_.]+)/g, (m, n) => knownName(n) ? `<span class="mention">@${n}</span>` : m)
    .replace(/\n/g, '<br>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => blocks[i]);
}
const preview = m => m.text || (m.file ? 'Click to see attachment' : m.sticker ? 'Sticker' : m.gif ? 'GIF' : '');

function avatar(u, size = 32, status = false, ring = 'var(--bg-side)') {
  let st = '';
  if (status) {
    const d = size <= 24 ? 8 : size < 64 ? 10 : 16, b = size < 64 ? 3 : 6, off = size < 64 ? -2 : 0;
    st = `<span class="status s-${u.status}" style="--ring:${ring};width:${d}px;height:${d}px;border-width:${b}px;right:${off}px;bottom:${off}px"></span>`;
  }
  return `<span class="avatar" style="width:${size}px;height:${size}px;background:${u.color};font-size:${Math.round(size * .42)}px">${esc((u.name || '?')[0].toUpperCase())}${st}</span>`;
}

/* ---------- toast & clipboard ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
function copy(text, label = 'Copied to clipboard!') {
  const done = () => toast(label);
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, done);
  else {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove(); done();
  }
}

/* ==========================================================================
   Rendering
   ========================================================================== */
function renderAll() {
  renderRail(); renderSidebar(); renderMain(); renderVoicePanel(); renderUserPanel();
}

function renderRail() {
  const dmUnread = dmList.filter(id => unread.has('dm:' + id)).length + pending.filter(p => p.incoming).length;
  let h = `<div class="rail-item ${state.server === 'home' ? 'active' : ''}" data-home data-tip="Direct Messages"><span class="pill"></span><div class="rail-icon">${icon('logo', 26)}</div>${dmUnread ? `<span class="count-badge">${dmUnread}</span>` : ''}</div><div class="rail-sep"></div>`;
  for (const s of servers) {
    const keys = channelsOf(s).map(c => s.id + ':' + c.id);
    const hasUnread = !s.muted && keys.some(k => unread.has(k));
    const m = keys.reduce((n, k) => n + (mentions[k] || 0), 0);
    h += `<div class="rail-item ${state.server === s.id ? 'active' : ''} ${hasUnread ? 'unread' : ''} ${s.muted ? 'muted-server' : ''}" data-server="${s.id}" data-tip="${esc(s.name)}"><span class="pill"></span><div class="rail-icon" style="--c:${s.color}">${esc(s.short)}</div>${m ? `<span class="count-badge">${m}</span>` : ''}</div>`;
  }
  h += `<div class="rail-item" data-action="add-server" data-tip="Add a Server"><span class="pill"></span><div class="rail-icon green">${icon('plus', 24)}</div></div>
    <div class="rail-item" data-action="explore" data-tip="Explore Discoverable Servers"><span class="pill"></span><div class="rail-icon green">${icon('compass', 24)}</div></div>
    <div class="rail-sep"></div>
    <div class="rail-item" data-action="download" data-tip="Download Apps"><span class="pill"></span><div class="rail-icon green">${icon('download', 22)}</div></div>`;
  $('#rail').innerHTML = h;
}

function voiceIcons() {
  return `<span class="vu-icons">${state.muted ? icon('mic', 14, '', SLASH) : ''}${state.deafened ? icon('headphones', 14, '', SLASH) : ''}</span>`;
}

function renderSidebar() {
  const head = $('#sidebarHeader'), list = $('#channelList');
  if (state.server === 'home') {
    head.innerHTML = `<button class="find-btn" data-action="quick-switch">Find or start a conversation</button>`;
    const inc = pending.filter(p => p.incoming).length;
    let h = `<div class="dm-item dm-first ${!state.dm ? 'active' : ''}" data-action="friends">${icon('users', 24)}<span class="dm-name">Friends</span>${inc ? `<span class="count-badge">${inc}</span>` : ''}</div>
      <div class="dm-heading"><span>Direct Messages</span><button data-action="new-dm" data-tip="Create DM" aria-label="Create DM">${icon('plus', 16)}</button></div>`;
    for (const id of dmList) {
      const u = users[id];
      h += `<div class="dm-item ${state.dm === id ? 'active' : ''} ${unread.has('dm:' + id) ? 'unread' : ''}" data-dm="${id}" data-user="${id}">${avatar(u, 32, true)}<div class="dm-meta"><div class="dm-name">${esc(u.name)}</div>${u.activity && u.status !== 'offline' ? `<div class="dm-sub">${esc(u.activity)}</div>` : ''}</div><button class="dm-close" data-action="close-dm" data-id="${id}" aria-label="Close DM">${icon('x', 16)}</button></div>`;
    }
    list.innerHTML = h;
    return;
  }
  const s = currentServer(), cur = currentChannel();
  head.innerHTML = `<button class="server-header" data-action="server-menu"><span>${esc(s.name)}</span>${icon('chevronDown', 18, 'ic-chev')}${icon('x', 18, 'ic-x')}</button>`;
  let h = '<div class="list-pad"></div>';
  for (const c of s.categories) {
    const col = state.collapsed.has(s.id + ':' + c.id);
    h += `<div class="category ${col ? 'collapsed' : ''}" data-cat="${c.id}">${icon('chevronDown', 12)}<span>${esc(c.name)}</span><button class="cat-add" data-action="create-channel" data-cat="${c.id}" data-tip="Create Channel" aria-label="Create Channel">${icon('plus', 16)}</button></div>`;
    for (const ch of c.channels) {
      const key = s.id + ':' + ch.id, active = cur && ch.id === cur.id, un = unread.has(key), vu = voiceUsers[key] || [];
      if (col && !active && !un && !vu.length) continue;
      if (s.hideMuted && ch.muted && !active) continue;
      h += `<div class="channel ${active ? 'active' : ''} ${un && !ch.muted ? 'unread' : ''} ${ch.muted ? 'muted' : ''}" data-channel="${ch.id}">${icon(ch.type === 'voice' ? 'speaker' : 'hash', 20, 'ch-icon')}<span class="ch-name">${esc(ch.name)}</span>${mentions[key] ? `<span class="count-badge">${mentions[key]}</span>` : `<span class="ch-actions"><button data-action="invite" data-tip="Create Invite" aria-label="Create Invite">${icon('userPlus', 16)}</button><button data-action="edit-channel" data-tip="Edit Channel" aria-label="Edit Channel">${icon('settings', 16)}</button></span>`}</div>`;
      if (vu.length) h += `<div class="voice-users">${vu.map(id => `<div class="voice-user" data-profile="${id}" data-user="${id}">${avatar(users[id], 24)}<span>${esc(users[id].name)}</span>${id === 'me' ? voiceIcons() : ''}</div>`).join('')}</div>`;
    }
  }
  list.innerHTML = h;
}

function renderUserPanel() {
  const me = users.me;
  $('#userPanel').innerHTML = `<div class="me" data-action="status-menu">${avatar(me, 32, true, 'var(--bg-user)')}<div class="me-meta"><div class="me-name">${esc(me.name)}</div><div class="me-status">${statusLabel(me.status, true)}</div></div></div>
    <button class="up-btn ${state.muted ? 'off' : ''}" data-action="mute" data-tip="${state.muted ? 'Unmute' : 'Mute'}" aria-label="Mute">${icon('mic', 20, '', state.muted ? SLASH : '')}</button>
    <button class="up-btn ${state.deafened ? 'off' : ''}" data-action="deafen" data-tip="${state.deafened ? 'Undeafen' : 'Deafen'}" aria-label="Deafen">${icon('headphones', 20, '', state.deafened ? SLASH : '')}</button>
    <button class="up-btn" data-action="settings" data-tip="User Settings" aria-label="User Settings">${icon('settings', 20)}</button>`;
}

function renderVoicePanel() {
  const p = $('#voicePanel');
  if (!state.voice) { p.hidden = true; return; }
  const s = servers.find(x => x.id === state.voice.server), ch = findChannel(s, state.voice.channel);
  p.hidden = false;
  p.innerHTML = `<div class="vp-row"><div class="vp-info"><div class="vp-status">${icon('signal', 16)} Voice Connected</div><div class="vp-where">${esc(ch.name)} / ${esc(s.name)}</div></div><button class="up-btn" data-action="disconnect" data-tip="Disconnect" aria-label="Disconnect">${icon('phoneOff', 20)}</button></div>
    <div class="vp-actions"><button class="vp-btn" data-action="video" data-tip="Turn On Camera">${icon('video', 18)} Video</button><button class="vp-btn" data-action="screen" data-tip="Share Your Screen">${icon('monitor', 18)} Screen</button></div>`;
}

function renderMain() {
  const main = $('#main');
  const oldInput = $('#input');
  if (oldInput && state.renderedKey) state.drafts[state.renderedKey] = oldInput.value;
  if (state.server === 'home' && !state.dm) { main.innerHTML = friendsHTML(); state.renderedKey = null; return; }
  const isDM = state.server === 'home';
  const u = isDM ? users[state.dm] : null, ch = isDM ? null : currentChannel();
  const burger = `<button class="hdr-btn hamburger" data-action="toggle-nav" aria-label="Open navigation">${icon('menu', 24)}</button>`;
  if (!isDM && !ch) {
    main.innerHTML = `<header class="chat-header">${burger}<h1>${esc(currentServer().name)}</h1></header><div class="empty">${icon('hash', 64)}<h3>NO TEXT CHANNELS</h3><p>You find yourself in a strange place. You don't have access to any text channels, or there are none in this server.</p><button class="btn" data-action="create-channel">Create Channel</button></div>`;
    state.renderedKey = null;
    return;
  }
  const key = currentKey();
  const tools = isDM ? `
      <button class="hdr-btn" data-action="call" data-tip="Start Voice Call" aria-label="Start Voice Call">${icon('phone', 22)}</button>
      <button class="hdr-btn" data-action="video-call" data-tip="Start Video Call" aria-label="Start Video Call">${icon('video', 22)}</button>
      <button class="hdr-btn" data-action="pins" data-tip="Pinned Messages" aria-label="Pinned Messages">${icon('pin', 22)}</button>
      <button class="hdr-btn" data-action="add-to-dm" data-tip="Add Friends to DM" aria-label="Add Friends to DM">${icon('userPlus', 22)}</button>
      <button class="hdr-btn ${state.showDmProfile ? 'on' : ''}" data-action="toggle-profile" data-tip="${state.showDmProfile ? 'Hide' : 'Show'} User Profile" aria-label="Toggle User Profile">${icon('userCircle', 22)}</button>`
    : `
      <button class="hdr-btn" data-action="threads" data-tip="Threads" aria-label="Threads">${icon('threads', 22)}</button>
      <button class="hdr-btn" data-action="notif" data-tip="Notification Settings" aria-label="Notification Settings">${icon('bell', 22)}</button>
      <button class="hdr-btn" data-action="pins" data-tip="Pinned Messages" aria-label="Pinned Messages">${icon('pin', 22)}</button>
      <button class="hdr-btn ${state.showMembers ? 'on' : ''}" data-action="toggle-members" data-tip="${state.showMembers ? 'Hide' : 'Show'} Member List" aria-label="Toggle Member List">${icon('users', 22)}</button>`;
  const placeholder = isDM ? `Message @${u.name}` : `Message #${ch.name}`;
  main.innerHTML = `<header class="chat-header">${burger}
      ${isDM ? avatar(u, 24, true, 'var(--bg-main)') : `<span class="hdr-icon">${icon('hash', 24)}</span>`}
      <h1>${esc(isDM ? u.name : ch.name)}</h1>
      ${!isDM && ch.topic ? `<div class="divider"></div><div class="topic" data-action="show-topic">${esc(ch.topic)}</div>` : '<div class="spacer"></div>'}
      <div class="hdr-tools">${tools}
        <div class="search"><input id="search" placeholder="Search" value="${esc(state.search || '')}" autocomplete="off" aria-label="Search">${icon('search', 16)}</div>
        <button class="hdr-btn" data-action="inbox" data-tip="Inbox" aria-label="Inbox">${icon('inbox', 22)}</button>
        <button class="hdr-btn" data-action="help" data-tip="Help" aria-label="Help">${icon('help', 22)}</button>
      </div>
    </header>
    <div class="chat-body">
      <section class="chat-col" id="chatCol">
        <div class="messages scroller" id="messages"></div>
        <form class="composer" id="composer" autocomplete="off">
          <div class="reply-bar" id="replyBar" hidden></div>
          <div class="composer-inner">
            <button type="button" class="comp-btn plus" data-action="attach" aria-label="Upload a file or more">${icon('plusCircle', 24)}</button>
            <textarea id="input" rows="1" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}"></textarea>
            <div class="comp-tools">
              <button type="button" class="comp-btn" data-action="gift" data-tip="Send a gift" aria-label="Send a gift">${icon('gift', 22)}</button>
              <button type="button" class="comp-btn" data-action="gif" data-tip="Open GIF picker" aria-label="Open GIF picker">${icon('gifIcon', 22)}</button>
              <button type="button" class="comp-btn" data-action="sticker" data-tip="Open sticker picker" aria-label="Open sticker picker">${icon('sticker', 22)}</button>
              <button type="button" class="comp-btn" data-action="emoji" data-tip="Select emoji" aria-label="Select emoji">${icon('smile', 22)}</button>
            </div>
          </div>
        </form>
        <div class="typing" id="typing"></div>
      </section>
      <aside class="side-panel scroller" id="sidePanel"></aside>
    </div>`;
  state.renderedKey = key;
  const input = $('#input');
  input.value = state.drafts[key] || '';
  autosize(input);
  renderMessages(); renderReplyBar(); renderSidePanel(); renderTyping();
  if (matchMedia('(pointer:fine)').matches) input.focus();
}

function welcomeHTML() {
  if (state.server === 'home') {
    const u = users[state.dm], isF = friends.includes(u.id), isB = blocked.includes(u.id);
    return `<div class="welcome">${avatar(u, 80)}<h2>${esc(u.name)}</h2><div class="w-user">${esc(u.username)}</div><p>This is the beginning of your direct message history with <b>${esc(u.name)}</b>.</p>
      <div class="w-actions">${u.bot ? '' : isF ? `<button class="btn secondary small" data-action="remove-friend" data-id="${u.id}">Remove Friend</button>` : `<button class="btn small" data-action="add-friend-user" data-id="${u.id}">Add Friend</button>`}<button class="btn secondary small" data-action="${isB ? 'unblock' : 'block-user'}" data-id="${u.id}">${isB ? 'Unblock' : 'Block'}</button></div></div>`;
  }
  const ch = currentChannel();
  return `<div class="welcome"><div class="w-icon">${icon('hash', 42)}</div><h2>Welcome to #${esc(ch.name)}!</h2><p>This is the start of the #${esc(ch.name)} channel.</p><button class="w-edit" data-action="edit-channel">${icon('edit', 16)} Edit Channel</button></div>`;
}

function messageHTML(m, grouped) {
  if (m.system) {
    return `<div class="msg system" data-msg="${m.id}"><span class="sys-ic">${icon('pin', 16)}</span><div><b class="msg-author" data-profile="${m.author}">${esc(users[m.author].name)}</b> pinned <a data-jump="${m.ref}">a message</a> to this channel. See all <a data-action="pins-inline">pinned messages</a>. <span class="msg-time">${fmtStamp(m.time)}</span></div></div>`;
  }
  const u = users[m.author], own = m.author === 'me', color = nameColor(u.id);
  const ref = m.replyTo ? findMsg(m.replyTo) : null;
  const mentioned = !own && (mentionsMe(m.text) || (ref && ref.author === 'me' && m.ping !== false));
  let h = '';
  if (m.replyTo) {
    const rc = ref && nameColor(ref.author);
    h += ref
      ? `<div class="reply-ref" data-jump="${ref.id}"><span class="reply-spine"></span>${avatar(users[ref.author], 16)}<span class="reply-name" ${rc ? `style="color:${rc}"` : ''}>@${esc(users[ref.author].name)}</span><span class="reply-text">${esc(preview(ref))}</span></div>`
      : `<div class="reply-ref"><span class="reply-spine"></span><i>Original message was deleted</i></div>`;
  }
  if (grouped) h += `<span class="hover-time">${fmtTime(m.time)}</span>`;
  else h += `<div class="msg-avatar" data-profile="${u.id}">${avatar(u, 40)}</div><div class="msg-head"><span class="msg-author" data-profile="${u.id}" ${color ? `style="color:${color}"` : ''}>${esc(u.name)}</span>${u.bot ? '<span class="bot-tag">✓ App</span>' : ''}<time class="msg-time" title="${esc(m.time.toLocaleString())}">${fmtStamp(m.time)}</time></div>`;
  if (state.editing === m.id) {
    h += `<div class="edit-box"><textarea class="edit-input" rows="1" aria-label="Edit message">${esc(m.text)}</textarea><div class="edit-hint">escape to <a data-action="cancel-edit">cancel</a> • enter to <a data-action="save-edit">save</a></div></div>`;
  } else if (m.text) {
    h += `<div class="msg-text">${fmt(m.text)}${m.edited ? '<span class="edited" title="Edited">(edited)</span>' : ''}</div>`;
  }
  if (m.file) {
    h += m.file.url
      ? `<img class="attach-img" src="${m.file.url}" alt="${esc(m.file.name)}" data-action="view-image">`
      : `<div class="attach-file">${icon('file', 32)}<div><a data-action="toast" data-msg="Downloads aren't available in this demo">${esc(m.file.name)}</a><small>${fmtSize(m.file.size)}</small></div></div>`;
  }
  if (m.sticker) h += `<div class="sticker" title="Sticker">${m.sticker}</div>`;
  if (m.gif) h += `<div class="gif" style="--c:${m.gif.color}"><em>GIF</em><span>${esc(m.gif.label)}</span></div>`;
  const reacts = Object.entries(m.reactions).filter(([, r]) => r.count > 0);
  if (reacts.length) {
    h += `<div class="reactions">${reacts.map(([e, r]) => `<button class="reaction ${r.me ? 'me' : ''}" data-react="${e}" aria-label="${e} ${r.count}">${e}<span>${r.count}</span></button>`).join('')}<button class="reaction add" data-action="react-picker" data-tip="Add Reaction" aria-label="Add Reaction">${icon('smile', 16)}</button></div>`;
  }
  h += `<div class="msg-toolbar">${['👍', '😂', '❤️'].map(e => `<button data-action="quick-react" data-emoji="${e}" data-tip="React with ${e}">${e}</button>`).join('')}<span class="tb-sep"></span><button data-action="react-picker" data-tip="Add Reaction" aria-label="Add Reaction">${icon('smile', 20)}</button><button data-action="reply" data-tip="Reply" aria-label="Reply">${icon('reply', 20)}</button>${own && m.text ? `<button data-action="edit" data-tip="Edit" aria-label="Edit">${icon('edit', 20)}</button>` : ''}<button data-action="msg-more" data-tip="More" aria-label="More">${icon('more', 20)}</button></div>`;
  const cls = ['msg', grouped && 'grouped', mentioned && 'mentioned', state.replyTo === m.id && 'replying', m.replyTo && 'has-reply'].filter(Boolean).join(' ');
  return `<div class="${cls}" data-msg="${m.id}">${h}</div>`;
}

function renderMessages(stick = true) {
  const el = $('#messages'); if (!el) return;
  const key = currentKey(); const list = messages[key] || (messages[key] = []);
  const prevTop = el.scrollTop;
  let h = welcomeHTML(), prev = null;
  for (const m of list) {
    const newDay = !prev || !sameDay(prev.time, m.time);
    if (newDay) h += `<div class="date-divider"><span>${fmtDate(m.time)}</span></div>`;
    const grouped = prev && !newDay && prev.author === m.author && !m.replyTo && !m.system && !prev.system && (m.time - prev.time) < 7 * MIN;
    h += messageHTML(m, grouped);
    prev = m;
  }
  el.innerHTML = h + '<div class="msg-spacer"></div>';
  el.scrollTop = stick ? el.scrollHeight : prevTop;
}

function renderReplyBar() {
  const bar = $('#replyBar'); if (!bar) return;
  const m = state.replyTo && findMsg(state.replyTo);
  if (!m) { bar.hidden = true; state.replyTo = null; return; }
  bar.hidden = false;
  bar.innerHTML = `<span class="rb-text">Replying to <b>${esc(users[m.author].name)}</b></span>${m.author !== 'me' ? `<button type="button" class="rb-ping ${state.replyPing ? '' : 'off'}" data-action="toggle-ping" data-tip="Click to ${state.replyPing ? 'disable' : 'enable'} pinging ${esc(users[m.author].name)}">@ ${state.replyPing ? 'ON' : 'OFF'}</button>` : ''}<button type="button" data-action="cancel-reply" aria-label="Cancel reply">${icon('x', 18)}</button>`;
}

function renderTyping() {
  const el = $('#typing'); if (!el) return;
  const t = state.typing;
  el.innerHTML = t && t.key === currentKey() ? `<span class="dots"><i></i><i></i><i></i></span><span><b>${esc(users[t.user].name)}</b> is typing...</span>` : '';
}

function renderSidePanel() {
  const p = $('#sidePanel'); if (!p) return;
  if (state.search) {
    p.className = 'side-panel scroller search-panel'; p.hidden = false; p.innerHTML = searchHTML(); return;
  }
  if (state.server === 'home') {
    p.className = 'side-panel scroller dm-profile'; p.hidden = !state.showDmProfile;
    p.innerHTML = profileHTML(users[state.dm], { panel: true }); return;
  }
  p.className = 'side-panel scroller members'; p.hidden = !state.showMembers;
  p.innerHTML = membersHTML(currentServer());
}

function memberRow(s, id) {
  const u = users[id], r = roleOf(s, id), c = prefs.roleColors && r ? r.color : '';
  return `<div class="member ${u.status === 'offline' ? 'offline' : ''}" data-profile="${id}" data-user="${id}">${avatar(u, 32, true)}<div class="m-meta"><div class="m-name" ${c ? `style="color:${c}"` : ''}>${esc(u.name)}${s.owner === id ? ' <span class="crown" title="Server Owner">👑</span>' : ''}${u.bot ? ' <span class="bot-tag">✓ App</span>' : ''}</div>${u.activity && u.status !== 'offline' ? `<div class="m-sub">${esc(u.activity)}</div>` : ''}</div></div>`;
}
function membersHTML(s) {
  const online = s.members.filter(id => users[id].status !== 'offline');
  const offline = s.members.filter(id => users[id].status === 'offline');
  const used = new Set(); let h = '';
  for (const r of s.roles) {
    const ms = online.filter(id => r.members.includes(id) && !used.has(id));
    if (!ms.length) continue;
    ms.forEach(id => used.add(id));
    h += `<h3>${esc(r.name)} — ${ms.length}</h3>` + ms.map(id => memberRow(s, id)).join('');
  }
  const rest = online.filter(id => !used.has(id));
  if (rest.length) h += `<h3>Online — ${rest.length}</h3>` + rest.map(id => memberRow(s, id)).join('');
  if (offline.length) h += `<h3>Offline — ${offline.length}</h3>` + offline.map(id => memberRow(s, id)).join('');
  return h;
}

function profileHTML(u, { panel = false, preview = false, ring } = {}) {
  const s = state.server !== 'home' ? currentServer() : null;
  const role = roleOf(s, u.id), inServer = s && s.members.includes(u.id);
  const ringColor = ring || (panel ? 'var(--bg-side)' : 'var(--bg-float)');
  let bottom = '';
  if (!panel && !preview) {
    bottom = u.id === 'me'
      ? `<button class="btn full mt" data-action="settings-profile">${icon('edit', 16)} Edit Profile</button>`
      : `<input class="pf-msg" data-user="${u.id}" placeholder="Message @${esc(u.name)}" aria-label="Message ${esc(u.name)}">`;
  }
  return `<div class="profile ${panel ? 'panel' : ''}" style="--ring-bg:${ringColor}">
    <div class="pf-banner" style="background:${u.banner || u.color}"></div>
    <div class="pf-avatar">${avatar(u, 80, true, ringColor)}</div>
    <div class="pf-top-actions">${u.bot ? '<span class="pf-badge">🤖 Bot</span>' : ''}${friends.includes(u.id) ? `<span class="pf-badge">${icon('check', 12)} Friend</span>` : ''}</div>
    <div class="pf-body">
      <div class="pf-name">${esc(u.name)}</div>
      <div class="pf-user">${esc(u.username)}${u.pronouns ? ` • ${esc(u.pronouns)}` : ''}${u.bot ? ' <span class="bot-tag">✓ App</span>' : ''}</div>
      ${u.activity && u.status !== 'offline' ? `<div class="pf-activity">${esc(u.activity)}</div>` : ''}
      <div class="pf-sep"></div>
      ${u.about ? `<h4>About Me</h4><p>${esc(u.about)}</p>` : ''}
      <h4>Member Since</h4><p>${esc(u.since || 'Today')}</p>
      ${inServer ? `<h4>Roles</h4><div class="roles">${role ? `<span class="role"><i style="background:${role.color}"></i>${esc(role.name)}</span>` : '<span class="muted" style="font-size:14px">No roles</span>'}</div>` : ''}
      ${u.note ? `<h4>Note</h4><p>${esc(u.note)}</p>` : ''}
      ${bottom}
    </div></div>`;
}

function searchHTML() {
  const q = state.search.toLowerCase();
  const res = (messages[currentKey()] || []).filter(m => (m.text || '').toLowerCase().includes(q));
  const hl = t => fmt(t).replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![^<]*>)`, 'gi'), '<mark>$1</mark>');
  return `<div class="sp-head"><span>${res.length} Result${res.length === 1 ? '' : 's'}</span><button data-action="clear-search" aria-label="Close search">${icon('x', 18)}</button></div>` +
    (res.length ? res.map(m => `<div class="search-hit" data-jump="${m.id}">${avatar(users[m.author], 32)}<div><div><b>${esc(users[m.author].name)}</b> <span class="msg-time">${fmtStamp(m.time)}</span></div><div class="sh-text">${hl(m.text)}</div></div></div>`).join('')
      : `<div class="empty small">${icon('search', 48)}<p>No results found. Try searching for something else.</p></div>`);
}

/* ---------- friends page ---------- */
function friendsHTML() {
  const tab = state.friendsTab;
  const inc = pending.filter(p => p.incoming).length;
  const tabs = [['online', 'Online'], ['all', 'All'], ['pending', 'Pending'], ['blocked', 'Blocked']];
  const header = `<header class="chat-header"><button class="hdr-btn hamburger" data-action="toggle-nav" aria-label="Open navigation">${icon('menu', 24)}</button><span class="hdr-icon">${icon('users', 24)}</span><h1>Friends</h1><div class="divider"></div>
    <nav class="friend-tabs">${tabs.map(([k, l]) => `<button class="ftab ${tab === k ? 'active' : ''}" data-ftab="${k}">${l}${k === 'pending' && inc ? ` <span class="count-badge">${inc}</span>` : ''}</button>`).join('')}<button class="ftab add ${tab === 'add' ? 'active' : ''}" data-ftab="add">Add Friend</button></nav>
    <div class="hdr-tools"><button class="hdr-btn" data-action="new-dm" data-tip="New Group DM" aria-label="New Group DM">${icon('messagePlus', 22)}</button><div class="divider"></div><button class="hdr-btn" data-action="inbox" data-tip="Inbox" aria-label="Inbox">${icon('inbox', 22)}</button><button class="hdr-btn" data-action="help" data-tip="Help" aria-label="Help">${icon('help', 22)}</button></div></header>`;
  let body;
  if (tab === 'add') {
    body = `<div class="add-friend"><h2>Add Friend</h2><p>You can add friends with their username.</p>
      <form class="af-box" id="addFriendForm"><input id="afInput" placeholder="You can add friends with their username." autocomplete="off" aria-label="Username"><button class="btn small" id="afBtn" disabled>Send Friend Request</button></form>
      <div class="af-msg" id="afMsg"></div></div>
      <div class="af-explore"><h3>Other places to make friends</h3><button class="af-card" data-action="explore">${icon('compass', 24)} Explore Discoverable Servers ${icon('chevronRight', 16)}</button></div>`;
  } else {
    let rows = [], label = '', empty = '';
    if (tab === 'online') {
      rows = friends.filter(id => users[id].status !== 'offline').map(friendRow); label = 'Online'; empty = "No one's around right now. Check back later!";
    } else if (tab === 'all') {
      rows = friends.map(friendRow); label = 'All friends'; empty = "You don't have any friends yet. Add some!";
    } else if (tab === 'pending') {
      rows = pending.map(p => pendingRow(p)); label = 'Pending'; empty = 'There are no pending friend requests.';
    } else {
      rows = blocked.map(blockedRow); label = 'Blocked'; empty = "You can't unblock the Wumpus... just kidding, you haven't blocked anyone.";
    }
    body = rows.length
      ? `<div class="friend-search"><input id="friendSearch" placeholder="Search" aria-label="Search friends">${icon('search', 18)}</div><div class="f-count">${label} — ${rows.length}</div>${rows.join('')}`
      : `<div class="empty">${icon(tab === 'blocked' ? 'shield' : 'users', 96)}<p>${empty}</p></div>`;
  }
  return header + `<div class="friends-body"><div class="friends-main scroller">${body}</div><aside class="active-now scroller">${activeNowHTML()}</aside></div>`;
}
function friendRow(id) {
  const u = users[id];
  return `<div class="friend-row" data-dm="${id}" data-user="${id}" data-n="${esc(u.name.toLowerCase())}">${avatar(u, 32, true, 'var(--bg-main)')}<div class="fr-meta"><div class="fr-name">${esc(u.name)}<span>${esc(u.username)}</span></div><div class="fr-sub">${esc(u.status === 'offline' ? 'Offline' : u.activity || statusLabel(u.status))}</div></div>
    <div class="f-actions"><button class="circle-btn" data-action="open-dm" data-id="${id}" data-tip="Message" aria-label="Message">${icon('message', 18)}</button><button class="circle-btn" data-action="friend-more" data-id="${id}" data-tip="More" aria-label="More">${icon('more', 18)}</button></div></div>`;
}
function pendingRow(p) {
  const u = users[p.id];
  return `<div class="friend-row" data-user="${p.id}" data-profile="${p.id}" data-n="${esc(u.name.toLowerCase())}">${avatar(u, 32, false)}<div class="fr-meta"><div class="fr-name">${esc(u.name)}<span>${esc(u.username)}</span></div><div class="fr-sub">${p.incoming ? 'Incoming' : 'Outgoing'} Friend Request</div></div>
    <div class="f-actions">${p.incoming ? `<button class="circle-btn accept" data-action="accept" data-id="${p.id}" data-tip="Accept" aria-label="Accept">${icon('check', 18)}</button>` : ''}<button class="circle-btn decline" data-action="decline" data-id="${p.id}" data-tip="${p.incoming ? 'Ignore' : 'Cancel'}" aria-label="Decline">${icon('x', 18)}</button></div></div>`;
}
function blockedRow(id) {
  const u = users[id];
  return `<div class="friend-row" data-user="${id}" data-n="${esc(u.name.toLowerCase())}">${avatar(u, 32, false)}<div class="fr-meta"><div class="fr-name">${esc(u.name)}<span>${esc(u.username)}</span></div><div class="fr-sub">Blocked</div></div>
    <div class="f-actions"><button class="circle-btn decline" data-action="unblock" data-id="${id}" data-tip="Unblock" aria-label="Unblock">${icon('userPlus', 18)}</button></div></div>`;
}
function activeNowHTML() {
  const act = friends.filter(id => users[id].status !== 'offline' && users[id].activity);
  return `<h2>Active Now</h2>` + (act.length
    ? act.map(id => `<div class="an-card" data-profile="${id}" data-user="${id}">${avatar(users[id], 40, true)}<div><b>${esc(users[id].name)}</b><small>${esc(users[id].activity)}</small></div></div>`).join('')
    : `<div class="an-empty"><h3>It's quiet for now...</h3><p>When a friend starts an activity—like playing a game or hanging out on voice—we'll show it here!</p></div>`);
}

/* ==========================================================================
   Navigation
   ========================================================================== */
function markRead() { const k = currentKey(); if (k) { unread.delete(k); delete mentions[k]; } }
function navReset() { closeFloating(); closeNav(); state.replyTo = null; state.editing = null; state.search = null; }
function goHome() { navReset(); state.server = 'home'; markRead(); renderAll(); }
function goServer(id) {
  navReset(); state.server = id;
  const s = currentServer(), ch = currentChannel();
  if (ch) state.channel[s.id] = ch.id;
  markRead(); renderAll();
}
function goChannel(cid) {
  const s = currentServer(), ch = findChannel(s, cid); if (!ch) return;
  if (ch.type === 'voice') { joinVoice(s, ch); return; }
  navReset(); state.channel[s.id] = cid; markRead(); renderAll();
}
function openDM(uid) {
  navReset();
  if (!dmList.includes(uid)) dmList.unshift(uid);
  state.server = 'home'; state.dm = uid; markRead(); renderAll();
}
function navigateKey(key) {
  if (key.startsWith('dm:')) return openDM(key.slice(3));
  const [sid, cid] = key.split(':');
  if (state.server !== sid) goServer(sid);
  goChannel(cid);
}
function jumpTo(id) {
  closeFloating();
  const key = keyOfMsg(id); if (!key) return;
  if (key !== currentKey()) navigateKey(key);
  const el = document.querySelector(`#messages [data-msg="${id}"]`); if (!el) return;
  el.scrollIntoView({ block: 'center', behavior: prefs.reducedMotion ? 'auto' : 'smooth' });
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
}
function toggleNav() { $('#app').classList.toggle('nav-open'); }
function closeNav() { $('#app').classList.remove('nav-open'); }

/* ---------- voice ---------- */
function joinVoice(s, ch) {
  const key = s.id + ':' + ch.id;
  if (state.voice && state.voice.server === s.id && state.voice.channel === ch.id) { toast(`You're already in ${ch.name}`); return; }
  leaveVoice(true);
  (voiceUsers[key] ||= []).push('me');
  state.voice = { server: s.id, channel: ch.id };
  renderSidebar(); renderVoicePanel();
  toast(`Connected to ${ch.name}`);
}
function leaveVoice(silent) {
  if (!state.voice) return;
  const key = state.voice.server + ':' + state.voice.channel;
  voiceUsers[key] = (voiceUsers[key] || []).filter(id => id !== 'me');
  state.voice = null;
  if (state.server !== 'home') renderSidebar();
  renderVoicePanel();
  if (silent !== true) toast('Disconnected');
}
function toggleMute() {
  if (state.deafened) { state.deafened = false; state.muted = false; }
  else state.muted = !state.muted;
  renderUserPanel(); if (state.voice && state.server !== 'home') renderSidebar();
}
function toggleDeafen() {
  if (state.deafened) { state.deafened = false; state.muted = state.mutedBeforeDeafen; }
  else { state.mutedBeforeDeafen = state.muted; state.deafened = true; state.muted = true; }
  renderUserPanel(); if (state.voice && state.server !== 'home') renderSidebar();
}
function setStatus(st) { users.me.status = st; savePrefs(); renderUserPanel(); if (state.server !== 'home') renderSidePanel(); }

/* ==========================================================================
   Messaging
   ========================================================================== */
function autosize(el) { if (!el) return; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, innerHeight * .5) + 'px'; }
function insertAtCursor(inp, text) {
  if (!inp) return;
  const s = inp.selectionStart ?? inp.value.length, e = inp.selectionEnd ?? s;
  inp.value = inp.value.slice(0, s) + text + inp.value.slice(e);
  inp.selectionStart = inp.selectionEnd = s + text.length;
  inp.focus(); autosize(inp);
}
function pushMessage(key, data) {
  const m = { id: nextId('m'), time: new Date(), reactions: {}, text: '', ...data };
  (messages[key] ||= []).push(m);
  return m;
}
function sendText(text) {
  const key = currentKey(); if (!key || !text.trim()) return;
  pushMessage(key, { author: 'me', text: text.trim(), replyTo: state.replyTo, ping: state.replyPing });
  state.replyTo = null; state.replyPing = true;
  renderReplyBar(); renderMessages();
  botCommand(key, text.trim()) || autoReply(key);
}
function send() {
  const inp = $('#input'); if (!inp) return;
  const text = inp.value;
  if (!text.trim()) return;
  inp.value = ''; state.drafts[currentKey()] = ''; autosize(inp);
  sendText(text);
}
function sendPayload(extra) {
  const key = currentKey(); if (!key) return;
  pushMessage(key, { author: 'me', ...extra });
  renderMessages(); autoReply(key);
}
function deliver(key, author, text) {
  pushMessage(key, { author, text });
  if (key === currentKey()) renderMessages();
  else { unread.add(key); if (/@you\b/i.test(text)) mentions[key] = (mentions[key] || 0) + 1; renderRail(); renderSidebar(); }
}
function botCommand(key, text) {
  if (key.startsWith('dm:') || !text.startsWith('!')) return false;
  const s = servers.find(x => x.id === key.split(':')[0]);
  if (!s || !s.members.includes('bot')) return false;
  const cmd = text.slice(1).split(/\s+/)[0].toLowerCase();
  const out = {
    help: '**Commands**\n`!ping` — check if I am awake\n`!roll` — roll a dice\n`!flip` — flip a coin\n`!8ball <question>` — ask the magic 8-ball',
    ping: `Pong! 🏓 ${20 + Math.floor(Math.random() * 60)}ms`,
    roll: `🎲 You rolled a **${1 + Math.floor(Math.random() * 6)}**`,
    flip: `🪙 **${Math.random() < .5 ? 'Heads' : 'Tails'}**!`,
    '8ball': `🎱 ${pick(['It is certain.', 'Ask again later.', "Don't count on it.", 'Signs point to yes.', 'Very doubtful.', 'Without a doubt.'])}`,
  }[cmd];
  if (!out) return false;
  setTimeout(() => deliver(key, 'bot', out), 500);
  return true;
}
let typingTimer;
function autoReply(key) {
  let who;
  if (key.startsWith('dm:')) who = key.slice(3);
  else {
    const s = servers.find(x => x.id === key.split(':')[0]);
    const pool = s ? s.members.filter(id => id !== 'me' && users[id].status !== 'offline' && !users[id].bot) : [];
    if (!pool.length || Math.random() < .45) return;
    who = pick(pool);
  }
  if (!users[who] || users[who].bot || blocked.includes(who)) return;
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    state.typing = { key, user: who }; renderTyping();
    typingTimer = setTimeout(() => {
      state.typing = null; renderTyping();
      deliver(key, who, pick(REPLIES));
    }, 1400 + Math.random() * 1600);
  }, 700 + Math.random() * 900);
}
function toggleReaction(m, e) {
  if (!m) return;
  const r = m.reactions[e] || (m.reactions[e] = { count: 0, me: false });
  if (r.me) { r.count--; r.me = false; if (r.count <= 0) delete m.reactions[e]; }
  else { r.count++; r.me = true; }
  renderMessages(false);
}
function startReply(id) {
  state.replyTo = id; state.replyPing = true;
  renderReplyBar(); renderMessages(false); $('#input')?.focus();
}
function startEdit(id) {
  state.editing = id; renderMessages(false);
  const inp = $('.edit-input'); if (!inp) return;
  autosize(inp); inp.focus(); inp.selectionStart = inp.selectionEnd = inp.value.length;
}
function saveEdit(inp) {
  const m = findMsg(state.editing); if (!m || !inp) return;
  const v = inp.value.trim();
  state.editing = null;
  if (!v) { renderMessages(false); deleteMessage(m); return; }
  if (v !== m.text) { m.text = v; m.edited = true; }
  renderMessages(false); $('#input')?.focus();
}
function cancelEdit() { state.editing = null; renderMessages(false); $('#input')?.focus(); }
function deleteMessage(m, skipConfirm) {
  const doIt = () => {
    const key = keyOfMsg(m.id);
    messages[key] = messages[key].filter(x => x.id !== m.id && !(x.system && x.ref === m.id));
    if (state.replyTo === m.id) { state.replyTo = null; renderReplyBar(); }
    renderMessages(false);
  };
  if (skipConfirm) return doIt();
  const u = users[m.author];
  confirmModal({
    title: 'Delete Message', confirm: 'Delete', danger: true, onConfirm: doIt,
    body: `Are you sure you want to delete this message?<div class="pin-card" style="margin-top:16px;cursor:default">${avatar(u, 32)}<div class="pc-main"><b>${esc(u.name)}</b> <span class="msg-time">${fmtStamp(m.time)}</span><div class="msg-text">${fmt(preview(m))}</div></div></div><p class="hint"><b>PROTIP:</b> Hold Shift when clicking Delete Message to bypass this confirmation entirely.</p>`,
  });
}
function togglePin(m) {
  const key = keyOfMsg(m.id);
  m.pinned = !m.pinned;
  if (m.pinned) pushMessage(key, { author: 'me', system: 'pin', ref: m.id });
  toast(m.pinned ? 'Message pinned' : 'Message unpinned');
  renderMessages(false);
}
function uploadFiles(files) {
  const key = currentKey(); if (!key || !files.length) return;
  for (const f of files) {
    pushMessage(key, { author: 'me', file: { name: f.name, size: f.size, url: f.type.startsWith('image/') ? URL.createObjectURL(f) : null } });
  }
  renderMessages();
}
function pickFiles() {
  const fi = document.createElement('input'); fi.type = 'file'; fi.multiple = true;
  fi.onchange = () => uploadFiles([...fi.files]);
  fi.click();
}

/* ==========================================================================
   Floating layer: menus, popouts, tooltips
   ========================================================================== */
let floating = null, lastClosedOwner = null;
function place(el, pos, owner) {
  $('#layer').appendChild(el);
  const w = el.offsetWidth, h = el.offsetHeight, vw = innerWidth, vh = innerHeight, gap = pos.gap ?? 8;
  let x, y;
  if (pos.anchor) {
    const r = pos.anchor.getBoundingClientRect(), side = pos.side || 'bottom';
    if (side === 'bottom' || side === 'top') {
      x = pos.align === 'right' ? r.right - w : pos.align === 'center' ? r.left + r.width / 2 - w / 2 : r.left;
      y = side === 'bottom' ? r.bottom + gap : r.top - h - gap;
      if (side === 'top' && y < 8) y = r.bottom + gap;
      if (side === 'bottom' && y + h > vh - 8 && r.top - h - gap > 8) y = r.top - h - gap;
    } else {
      x = side === 'right' ? r.right + gap : r.left - w - gap;
      if (side === 'right' && x + w > vw - 8) x = r.left - w - gap;
      if (side === 'left' && x < 8) x = r.right + gap;
      y = r.top;
    }
  } else {
    x = pos.x; y = pos.y;
    if (x + w > vw - 8) x -= w;
    if (y + h > vh - 8) y = Math.max(8, y - h);
  }
  x = Math.max(8, Math.min(x, vw - w - 8)); y = Math.max(8, Math.min(y, vh - h - 8));
  el.style.left = x + 'px'; el.style.top = y + 'px';
  floating = { el, owner };
  if (owner && owner.classList) owner.classList.add('float-open');
}
function closeFloating() {
  if (!floating) return;
  floating.el.remove();
  if (floating.owner && floating.owner.classList) floating.owner.classList.remove('float-open');
  lastClosedOwner = floating.owner || null;
  floating = null;
}
function cleanItems(items) {
  const out = [];
  for (const it of items.filter(Boolean)) {
    if (it.sep && (!out.length || out[out.length - 1].sep)) continue;
    out.push(it);
  }
  while (out.length && out[out.length - 1].sep) out.pop();
  return out;
}
function showMenu(items, pos, owner, cls = '') {
  closeFloating();
  items = cleanItems(items);
  const el = document.createElement('div');
  el.className = `menu floating ${cls}`; el.setAttribute('role', 'menu');
  el.innerHTML = items.map((it, i) => {
    if (it.sep) return '<div class="msep"></div>';
    if (it.html) return it.html;
    const right = it.check !== undefined ? `<span class="chk ${it.check ? 'on' : ''}">${it.check ? icon('check', 14) : ''}</span>`
      : it.radio !== undefined ? `<span class="radio ${it.radio ? 'on' : ''}"></span>`
      : it.icon ? icon(it.icon, 18) : '';
    return `<div class="mi ${it.danger ? 'danger' : ''} ${it.accent ? 'accent' : ''} ${it.disabled ? 'disabled' : ''}" data-mi="${i}" role="menuitem">${it.dot ? `<span class="status-dot s-${it.dot}"></span>` : ''}<span class="mi-label">${esc(it.label)}${it.desc ? `<small>${esc(it.desc)}</small>` : ''}</span>${right}</div>`;
  }).join('');
  el.addEventListener('click', e => {
    e.stopPropagation();
    const q = e.target.closest('[data-qr]');
    if (q) { closeFloating(); items.find(x => x.onQuick)?.onQuick(q.dataset.qr); return; }
    const mi = e.target.closest('[data-mi]');
    if (!mi || mi.classList.contains('disabled')) return;
    const it = items[+mi.dataset.mi];
    closeFloating();
    it.action && it.action(e);
  });
  el.addEventListener('contextmenu', e => e.preventDefault());
  place(el, pos, owner);
  return el;
}
function showPopout(html, pos, owner, onMount, cls = '') {
  closeFloating();
  const el = document.createElement('div');
  el.className = `popout floating ${cls}`; el.innerHTML = html;
  place(el, pos, owner);
  onMount && onMount(el);
  return el;
}
const isToggleClose = a => lastClosedOwner === a;

/* tooltips */
const tip = $('#tooltip');
let tipFor = null;
function showTip(el) {
  tipFor = el; tip.textContent = el.dataset.tip;
  const inRail = !!el.closest('.rail');
  tip.classList.toggle('big', inRail); tip.classList.add('show');
  const r = (el.querySelector('.rail-icon') || el).getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
  let x, y;
  if (inRail) { x = r.right + 14; y = r.top + r.height / 2 - h / 2; }
  else { x = r.left + r.width / 2 - w / 2; y = r.top - h - 8; if (y < 4) y = r.bottom + 8; }
  x = Math.max(4, Math.min(x, innerWidth - w - 4));
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
}
function hideTip() { tipFor = null; tip.classList.remove('show'); }
document.addEventListener('mouseover', e => {
  const el = e.target.closest('[data-tip]');
  if (!el || el.classList.contains('float-open') || !matchMedia('(hover:hover)').matches) { if (tipFor) hideTip(); return; }
  if (el !== tipFor) showTip(el);
});
document.addEventListener('scroll', hideTip, true);

/* ==========================================================================
   Menus
   ========================================================================== */
function serverMenuItems(s) {
  return [
    { label: 'Server Boost', icon: 'gem', action: () => toast("Server Boosts aren't available in this demo") },
    { sep: true },
    { label: 'Invite People', icon: 'userPlus', accent: true, action: () => inviteModal(s) },
    { label: 'Server Settings', icon: 'settings', action: () => openServerSettings(s) },
    { label: 'Create Channel', icon: 'plusCircle', action: () => createChannelModal(s) },
    { label: 'Create Category', icon: 'folderPlus', action: () => createCategoryModal(s) },
    { label: 'Create Event', icon: 'calendar', action: () => createEventModal(s) },
    { sep: true },
    { label: 'Notification Settings', icon: 'bell', action: () => serverNotifModal(s) },
    { label: 'Privacy Settings', icon: 'shield', action: () => privacyModal(s) },
    { sep: true },
    { label: 'Edit Server Profile', icon: 'edit', action: () => serverProfileModal(s) },
    { label: 'Hide Muted Channels', check: !!s.hideMuted, action: () => { s.hideMuted = !s.hideMuted; renderSidebar(); } },
    { sep: true },
    s.owner === 'me'
      ? { label: 'Delete Server', icon: 'trash', danger: true, action: () => deleteServerConfirm(s) }
      : { label: 'Leave Server', icon: 'logout', danger: true, action: () => leaveServerConfirm(s) },
  ];
}
function serverIconMenu(s) {
  return [
    { label: 'Mark As Read', action: () => { channelsOf(s).forEach(c => { unread.delete(s.id + ':' + c.id); delete mentions[s.id + ':' + c.id]; }); renderRail(); if (state.server === s.id) renderSidebar(); } },
    { sep: true },
    { label: 'Invite People', accent: true, action: () => inviteModal(s) },
    { sep: true },
    { label: 'Mute Server', check: !!s.muted, action: () => { s.muted = !s.muted; renderRail(); toast(s.muted ? `Muted ${s.name}` : `Unmuted ${s.name}`); } },
    { label: 'Notification Settings', action: () => serverNotifModal(s) },
    { label: 'Hide Muted Channels', check: !!s.hideMuted, action: () => { s.hideMuted = !s.hideMuted; if (state.server === s.id) renderSidebar(); } },
    { sep: true },
    { label: 'Server Settings', action: () => openServerSettings(s) },
    { label: 'Privacy Settings', action: () => privacyModal(s) },
    { label: 'Edit Server Profile', action: () => serverProfileModal(s) },
    { sep: true },
    { label: 'Create Channel', action: () => createChannelModal(s) },
    { label: 'Create Category', action: () => createCategoryModal(s) },
    { sep: true },
    s.owner === 'me' ? { label: 'Delete Server', danger: true, action: () => deleteServerConfirm(s) } : { label: 'Leave Server', danger: true, action: () => leaveServerConfirm(s) },
    prefs.devMode && { sep: true },
    prefs.devMode && { label: 'Copy Server ID', icon: 'id', action: () => copy(s.id, 'Server ID copied') },
  ];
}
function channelMenu(s, ch) {
  const key = s.id + ':' + ch.id, voice = ch.type === 'voice', inIt = state.voice && state.voice.channel === ch.id && state.voice.server === s.id;
  return [
    !voice && { label: 'Mark As Read', disabled: !unread.has(key), action: () => { unread.delete(key); delete mentions[key]; renderSidebar(); renderRail(); } },
    voice && (inIt ? { label: 'Disconnect', danger: true, action: () => leaveVoice() } : { label: 'Join Voice', action: () => joinVoice(s, ch) }),
    { sep: true },
    { label: 'Invite People', accent: true, action: () => inviteModal(s, ch) },
    { label: 'Copy Link', action: () => copy(`https://chat.example/channels/${s.id}/${ch.id}`, 'Link copied') },
    { sep: true },
    { label: `Mute ${voice ? 'Channel' : '#' + ch.name}`, check: !!ch.muted, action: () => { ch.muted = !ch.muted; renderSidebar(); renderRail(); } },
    !voice && { label: 'Notification Settings', action: () => channelNotifModal(ch) },
    { sep: true },
    { label: 'Edit Channel', action: () => editChannelModal(s, ch) },
    { label: `Duplicate ${voice ? 'Voice' : 'Text'} Channel`, action: () => duplicateChannel(s, ch) },
    { label: 'Delete Channel', danger: true, action: () => deleteChannelConfirm(s, ch) },
    prefs.devMode && { sep: true },
    prefs.devMode && { label: 'Copy Channel ID', icon: 'id', action: () => copy(ch.id, 'Channel ID copied') },
  ];
}
function categoryMenu(s, cat) {
  const k = s.id + ':' + cat.id, col = state.collapsed.has(k);
  return [
    { label: 'Mark As Read', action: () => { cat.channels.forEach(c => { unread.delete(s.id + ':' + c.id); delete mentions[s.id + ':' + c.id]; }); renderSidebar(); renderRail(); } },
    { sep: true },
    { label: 'Collapse Category', check: col, action: () => { col ? state.collapsed.delete(k) : state.collapsed.add(k); renderSidebar(); } },
    { label: 'Collapse All Categories', action: () => { s.categories.forEach(c => state.collapsed.add(s.id + ':' + c.id)); renderSidebar(); } },
    { sep: true },
    { label: 'Mute Category', check: cat.channels.length > 0 && cat.channels.every(c => c.muted), action: () => { const m = !cat.channels.every(c => c.muted); cat.channels.forEach(c => c.muted = m); renderSidebar(); renderRail(); } },
    { sep: true },
    { label: 'Create Channel', action: () => createChannelModal(s, cat.id) },
    { label: 'Edit Category', action: () => editCategoryModal(s, cat) },
    { label: 'Delete Category', danger: true, action: () => confirmModal({ title: 'Delete Category', body: `Are you sure you want to delete <b>${esc(cat.name)}</b>? Channels inside it will be deleted too.`, confirm: 'Delete Category', danger: true, onConfirm: () => { s.categories = s.categories.filter(c => c !== cat); renderAll(); } }) },
  ];
}
function messageMenu(m, anchorEl) {
  const own = m.author === 'me', key = keyOfMsg(m.id);
  const qr = `<div class="menu-emojis">${['👍', '❤️', '😂', '🔥'].map(e => `<button data-qr="${e}" aria-label="React with ${e}">${e}</button>`).join('')}</div><div class="msep"></div>`;
  return [
    { html: qr, onQuick: e => toggleReaction(findMsg(m.id), e) },
    { label: 'Add Reaction', icon: 'smile', action: () => { const el = $(`#messages [data-msg="${m.id}"]`) || anchorEl; emojiPicker(el, e => toggleReaction(findMsg(m.id), e)); } },
    own && m.text && { label: 'Edit Message', icon: 'edit', action: () => startEdit(m.id) },
    { label: m.pinned ? 'Unpin Message' : 'Pin Message', icon: 'pin', action: () => togglePin(m) },
    { label: 'Reply', icon: 'reply', action: () => startReply(m.id) },
    { label: 'Forward', icon: 'forward', action: () => forwardModal(m) },
    { sep: true },
    m.text && { label: 'Copy Text', icon: 'copy', action: () => copy(m.text) },
    { label: 'Mark Unread', icon: 'bell', action: () => { unread.add(key); renderSidebar(); renderRail(); toast('Marked as unread'); } },
    { label: 'Copy Message Link', icon: 'link', action: () => copy(`https://chat.example/channels/${key.replace(':', '/')}/${m.id}`, 'Link copied') },
    m.text && 'speechSynthesis' in window && { label: 'Speak Message', icon: 'speaker', action: () => { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(`${users[m.author].name} said ${m.text}`)); } },
    { sep: true },
    own ? { label: 'Delete Message', icon: 'trash', danger: true, action: e => deleteMessage(m, e.shiftKey) }
      : { label: 'Report Message', icon: 'flag', danger: true, action: () => reportModal(m) },
    prefs.devMode && { sep: true },
    prefs.devMode && { label: 'Copy Message ID', icon: 'id', action: () => copy(m.id, 'Message ID copied') },
  ];
}
function userMenu(id, el) {
  const u = users[id], isMe = id === 'me', isFriend = friends.includes(id), isBlocked = blocked.includes(id);
  const out = pending.find(p => p.id === id);
  const inp = $('#input');
  const s = currentServer();
  return [
    { label: 'Profile', action: () => profilePopout(id, el) },
    inp && { label: 'Mention', action: () => insertAtCursor(inp, `@${u.name} `) },
    !isMe && { label: 'Message', action: () => openDM(id) },
    !isMe && !u.bot && { label: 'Call', action: () => { openDM(id); toast(`Calling ${u.name}…`); } },
    !isMe && { label: 'Add Note', desc: 'Only visible to you', action: () => noteModal(u) },
    el && el.closest('.dm-item') && { label: 'Close DM', action: () => closeDM(id) },
    { sep: true },
    isMe && { label: 'Edit Profile', action: () => openUserSettings('profiles') },
    isMe && { label: 'Set Status', action: () => statusMenu($('.me')) },
    !isMe && s && s.members.includes(id) && { label: 'Mute', check: !!u.localMute, action: () => { u.localMute = !u.localMute; toast(u.localMute ? `Muted ${u.name}` : `Unmuted ${u.name}`); } },
    !isMe && !u.bot && !isBlocked && (isFriend
      ? { label: 'Remove Friend', action: () => removeFriend(id) }
      : out ? { label: out.incoming ? 'Accept Friend Request' : 'Friend Request Sent', disabled: !out.incoming, action: () => acceptFriend(id) }
        : { label: 'Add Friend', action: () => sendFriendRequest(id) }),
    !isMe && (isBlocked ? { label: 'Unblock', action: () => unblockUser(id) } : { label: 'Block', danger: true, action: () => blockUser(id) }),
    prefs.devMode && { sep: true },
    prefs.devMode && { label: 'Copy User ID', icon: 'id', action: () => copy(id, 'User ID copied') },
  ];
}
function statusMenu(anchor) {
  showMenu([
    { label: 'Online', dot: 'online', action: () => setStatus('online') },
    { sep: true },
    { label: 'Idle', dot: 'idle', action: () => setStatus('idle') },
    { label: 'Do Not Disturb', dot: 'dnd', desc: 'You will not receive desktop notifications', action: () => setStatus('dnd') },
    { label: 'Invisible', dot: 'offline', desc: 'You will not appear online, but will have full access', action: () => setStatus('offline') },
    { sep: true },
    { label: 'Edit Profile', icon: 'edit', action: () => openUserSettings('profiles') },
    { label: 'Switch Accounts', icon: 'users', action: () => toast("Account switching isn't available in this demo") },
    { sep: true },
    { label: 'Copy Username', icon: 'copy', action: () => copy(users.me.username, 'Username copied') },
  ], { anchor, side: 'top', gap: 8 }, anchor, 'wide');
}
function notifMenu(a) {
  const ch = currentChannel(); ch.notif ||= 'default';
  const set = v => () => { ch.notif = v; toast('Notification settings updated'); };
  showMenu([
    { label: `Mute #${ch.name}`, check: !!ch.muted, action: () => { ch.muted = !ch.muted; renderSidebar(); renderRail(); } },
    { sep: true },
    { label: 'Use Category Default', desc: 'All Messages', radio: ch.notif === 'default', action: set('default') },
    { label: 'All Messages', radio: ch.notif === 'all', action: set('all') },
    { label: 'Only @mentions', radio: ch.notif === 'mentions', action: set('mentions') },
    { label: 'Nothing', radio: ch.notif === 'nothing', action: set('nothing') },
  ], { anchor: a, side: 'bottom', align: 'right' }, a, 'wide');
}
function attachMenu(a) {
  showMenu([
    { label: 'Upload a File', icon: 'file', action: pickFiles },
    { label: 'Create Thread', icon: 'threads', action: () => toast("Threads aren't available in this demo") },
    { label: 'Create Poll', icon: 'signal', action: () => pollModal() },
    { label: 'Use Apps', icon: 'gem', action: () => toast('No apps installed yet') },
  ], { anchor: a, side: 'top', gap: 12 }, a, 'wide');
}
function friendMoreItems(id) {
  const u = users[id];
  return [
    { label: 'Start Video Call', action: () => { openDM(id); toast(`Video calling ${u.name}…`); } },
    { label: 'Start Voice Call', action: () => { openDM(id); toast(`Calling ${u.name}…`); } },
    { sep: true },
    { label: 'Remove Friend', danger: true, action: () => removeFriend(id) },
  ];
}

/* ---------- popouts ---------- */
function profilePopout(uid, anchor) {
  if (!users[uid]) return;
  if (anchor && isToggleClose(anchor)) return;
  anchor = anchor && anchor.isConnected ? anchor : $('#main');
  const r = anchor.getBoundingClientRect();
  const side = r.left > innerWidth / 2 ? 'left' : 'right';
  showPopout(profileHTML(users[uid]), { anchor, side, gap: 16 }, anchor, null, 'pop-profile');
}
function emojiPicker(anchor, onPick) {
  const html = `<div class="ep-head"><input class="input ep-search" placeholder="Find the perfect emoji" aria-label="Search emoji"></div><div class="ep-body scroller"><div class="ep-grid">${EMOJI.map(([e, n]) => `<button class="ep-e" data-e="${e}" data-n="${n}" title=":${n}:">${e}</button>`).join('')}</div></div><div class="ep-foot"><span class="ep-prev">😀</span><span class="ep-name">:grinning:</span></div>`;
  showPopout(html, { anchor, side: 'top', align: 'right' }, anchor, el => {
    const s = $('.ep-search', el); s.focus();
    s.addEventListener('input', () => { const q = s.value.toLowerCase(); $$('.ep-e', el).forEach(b => b.hidden = !b.dataset.n.includes(q)); });
    el.addEventListener('mouseover', e => { const b = e.target.closest('.ep-e'); if (b) { $('.ep-prev', el).textContent = b.dataset.e; $('.ep-name', el).textContent = `:${b.dataset.n}:`; } });
    el.addEventListener('click', e => {
      e.stopPropagation();
      const b = e.target.closest('.ep-e'); if (!b) return;
      if (!e.shiftKey) closeFloating();
      onPick(b.dataset.e);
    });
  }, 'pop-emoji');
}
function expressionPicker(anchor, tab) {
  if (isToggleClose(anchor)) return;
  const gifCats = [['Trending', '#5865f2'], ['Funny', '#eb459e'], ['Cute', '#57f287'], ['Excited', '#f0b232'], ['Sad', '#3498db'], ['Dance', '#9b59b6'], ['Thumbs up', '#e67e22'], ['Facepalm', '#ed4245'], ['Mind blown', '#1abc9c'], ['Good night', '#34495e']];
  const stickers = ['🐸', '🐱', '🐶', '🦊', '🐼', '🐧', '🦄', '🐙', '👾', '🤖', '🍩', '🌮', '🦖', '🐢', '🌵', '🎈'];
  const html = `<div class="xp-tabs">${[['gif', 'GIFs'], ['sticker', 'Stickers'], ['emoji', 'Emoji']].map(([k, l]) => `<button class="xp-tab" data-xt="${k}">${l}</button>`).join('')}</div><div class="xp-search"><input class="input" aria-label="Search"></div><div class="xp-body scroller"></div><div class="ep-foot" hidden><span class="ep-prev">😀</span><span class="ep-name">:grinning:</span></div>`;
  showPopout(html, { anchor, side: 'top', align: 'right', gap: 12 }, anchor, el => {
    let cur = tab;
    const body = $('.xp-body', el), s = $('.xp-search input', el), foot = $('.ep-foot', el);
    const draw = () => {
      $$('.xp-tab', el).forEach(b => b.classList.toggle('active', b.dataset.xt === cur));
      s.placeholder = { gif: 'Search GIFs', sticker: 'Find the perfect sticker', emoji: 'Find the perfect emoji' }[cur];
      foot.hidden = cur !== 'emoji';
      const q = s.value.toLowerCase();
      if (cur === 'gif') body.innerHTML = `<div class="gif-grid">${gifCats.filter(([n]) => n.toLowerCase().includes(q)).map(([n, c]) => `<button class="gif-tile" data-gif="${n}" data-c="${c}" style="--c:${c}">${n}</button>`).join('')}</div>`;
      else if (cur === 'sticker') body.innerHTML = `<div class="stk-grid">${stickers.map(x => `<button class="stk" data-stk="${x}" aria-label="Sticker ${x}">${x}</button>`).join('')}</div>`;
      else body.innerHTML = `<div class="ep-grid">${EMOJI.filter(([, n]) => n.includes(q)).map(([e, n]) => `<button class="ep-e" data-e="${e}" data-n="${n}" title=":${n}:">${e}</button>`).join('')}</div>`;
    };
    s.addEventListener('input', draw);
    el.addEventListener('mouseover', e => { const b = e.target.closest('.ep-e'); if (b) { $('.ep-prev', el).textContent = b.dataset.e; $('.ep-name', el).textContent = `:${b.dataset.n}:`; } });
    el.addEventListener('click', e => {
      e.stopPropagation();
      const tb = e.target.closest('[data-xt]'); if (tb) { cur = tb.dataset.xt; s.value = ''; draw(); s.focus(); return; }
      const g = e.target.closest('[data-gif]'); if (g) { closeFloating(); sendPayload({ gif: { label: g.dataset.gif, color: g.dataset.c } }); return; }
      const st = e.target.closest('[data-stk]'); if (st) { closeFloating(); sendPayload({ sticker: st.dataset.stk }); return; }
      const em = e.target.closest('[data-e]'); if (em) { if (!e.shiftKey) closeFloating(); insertAtCursor($('#input'), em.dataset.e); }
    });
    draw(); s.focus();
  }, 'pop-xp');
}
function pinsPopout(a) {
  if (!a || isToggleClose(a)) return;
  const list = (messages[currentKey()] || []).filter(m => m.pinned && !m.system).reverse();
  showPopout(`<div class="pop-head">${icon('pin', 20)}<h3>Pinned Messages</h3></div><div class="pop-body scroller">${list.length
    ? list.map(m => `<div class="pin-card" data-jump="${m.id}">${avatar(users[m.author], 32)}<div class="pc-main"><div><b>${esc(users[m.author].name)}</b> <span class="msg-time">${fmtStamp(m.time)}</span></div><div class="msg-text">${fmt(preview(m))}</div></div><button class="pc-x" data-unpin="${m.id}" aria-label="Unpin" data-tip="Unpin">${icon('x', 14)}</button></div>`).join('')
    : `<div class="empty small">${icon('pin', 56)}<p>This channel doesn't have any pinned messages... yet.</p></div>`}</div>`,
  { anchor: a, side: 'bottom', align: 'right' }, a, el => {
    el.addEventListener('click', e => {
      const u = e.target.closest('[data-unpin]'); if (!u) return;
      e.stopPropagation();
      const m = findMsg(u.dataset.unpin); m.pinned = false;
      u.closest('.pin-card').remove(); renderMessages(false); toast('Message unpinned');
    });
  }, 'pop-pins');
}
function threadsPopout(a) {
  if (isToggleClose(a)) return;
  showPopout(`<div class="pop-head">${icon('threads', 20)}<h3>Threads</h3><button class="btn small" data-action="toast" data-msg="Threads aren't available in this demo">Create</button></div><div class="pop-body"><div class="empty small">${icon('threads', 56)}<b style="color:var(--text-strong)">There are no threads.</b><p>Stay focused on a conversation with a thread — a temporary text channel.</p></div></div>`,
    { anchor: a, side: 'bottom', align: 'right' }, a, null, 'pop-threads');
}
function inboxPopout(a) {
  if (isToggleClose(a)) return;
  let tab = 'mentions';
  showPopout(`<div class="pop-head">${icon('inbox', 20)}<h3>Inbox</h3></div><div class="pop-tabs"><button data-it="foryou">For You</button><button data-it="unreads">Unreads</button><button data-it="mentions">Mentions</button></div><div class="pop-body scroller"></div>`,
    { anchor: a, side: 'bottom', align: 'right' }, a, el => {
      const body = $('.pop-body', el);
      const where = key => {
        if (key.startsWith('dm:')) return `${icon('at', 12)} ${esc(users[key.slice(3)].name)}`;
        const [sid, cid] = key.split(':'); const s = servers.find(x => x.id === sid); const ch = findChannel(s, cid);
        return s && ch ? `${icon('hash', 12)} ${esc(ch.name)} • ${esc(s.name)}` : '';
      };
      const draw = () => {
        $$('[data-it]', el).forEach(b => b.classList.toggle('active', b.dataset.it === tab));
        if (tab === 'mentions') {
          const list = Object.entries(messages).flatMap(([k, ms]) => ms.filter(m => m.author !== 'me' && !m.system && mentionsMe(m.text)).map(m => [k, m])).sort((x, y) => y[1].time - x[1].time);
          body.innerHTML = list.length ? list.map(([k, m]) => `<div class="inbox-item" data-jump="${m.id}">${avatar(users[m.author], 32)}<div class="pc-main"><div class="pc-where">${where(k)}</div><div><b>${esc(users[m.author].name)}</b> <span class="msg-time">${fmtStamp(m.time)}</span></div><div class="msg-text">${fmt(m.text)}</div></div></div>`).join('')
            : `<div class="empty small">${icon('at', 56)}<p>Nobody has mentioned you yet.</p></div>`;
        } else if (tab === 'unreads') {
          const list = [...unread];
          body.innerHTML = list.length ? list.map(k => `<div class="inbox-item" data-goto="${k}"><div class="pc-main"><div class="pc-where" style="margin:0;font-size:14px;color:var(--text-strong)">${where(k)}</div><small class="muted">${(messages[k] || []).length} messages</small></div></div>`).join('') + `<button class="btn secondary full" data-readall>Mark All As Read</button>`
            : `<div class="empty small">${icon('check', 56)}<p>You're all caught up!</p></div>`;
        } else {
          const inc = pending.filter(p => p.incoming);
          body.innerHTML = inc.length ? inc.map(p => `<div class="inbox-item" data-friends>${avatar(users[p.id], 32)}<div class="pc-main"><b>${esc(users[p.id].name)}</b> sent you a friend request.<div class="muted" style="font-size:12px">Click to view</div></div></div>`).join('')
            : `<div class="empty small">${icon('inbox', 56)}<p>Nothing new for you right now.</p></div>`;
        }
      };
      el.addEventListener('click', e => {
        const t = e.target.closest('[data-it]'); if (t) { e.stopPropagation(); tab = t.dataset.it; draw(); return; }
        const g = e.target.closest('[data-goto]'); if (g) { e.stopPropagation(); navigateKey(g.dataset.goto); return; }
        if (e.target.closest('[data-readall]')) { e.stopPropagation(); unread.clear(); Object.keys(mentions).forEach(k => delete mentions[k]); renderRail(); renderSidebar(); draw(); return; }
        if (e.target.closest('[data-friends]')) { e.stopPropagation(); state.dm = null; state.friendsTab = 'pending'; goHome(); }
      });
      draw();
    }, 'pop-inbox');
}
function newDmPopout(a) {
  if (isToggleClose(a)) return;
  const align = a.closest('.sidebar') ? 'left' : 'right';
  showPopout(`<div class="pop-head col"><h3>Select Friends</h3><p class="muted">You can message any of your friends.</p><input class="input" placeholder="Type the username of a friend" id="ndSearch" aria-label="Search friends"></div><div class="pop-body scroller">${friends.length
    ? friends.map(id => `<div class="nd-row" data-dm="${id}" data-n="${esc((users[id].name + ' ' + users[id].username).toLowerCase())}">${avatar(users[id], 32, true, 'var(--bg-float)')}<span>${esc(users[id].name)}</span><span class="muted">${esc(users[id].username)}</span></div>`).join('')
    : `<div class="empty small"><p>You don't have any friends to add!</p></div>`}</div>`,
  { anchor: a, side: 'bottom', align }, a, el => {
    const s = $('#ndSearch', el); s.focus();
    s.addEventListener('input', () => { const q = s.value.toLowerCase(); $$('.nd-row', el).forEach(r => r.hidden = !r.dataset.n.includes(q)); });
  }, 'pop-newdm');
}

/* ==========================================================================
   Modals
   ========================================================================== */
const modals = [];
function openModal(html, onMount, { cls = '' } = {}) {
  closeFloating(); hideTip();
  const root = document.createElement('div');
  root.className = 'modal-root';
  root.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true">${html}<button class="modal-close" data-action="close-modal" aria-label="Close">${icon('x', 24)}</button></div>`;
  root.addEventListener('mousedown', e => { if (e.target === root) closeModal(root); });
  $('#layer').appendChild(root); modals.push(root);
  onMount && onMount(root);
  const f = root.querySelector('[autofocus]'); if (f) f.focus();
  return root;
}
function setModal(root, html) {
  $('.modal', root).innerHTML = html + `<button class="modal-close" data-action="close-modal" aria-label="Close">${icon('x', 24)}</button>`;
  const f = root.querySelector('[autofocus]'); if (f) f.focus();
}
function closeModal(root = modals[modals.length - 1]) {
  if (!root) return;
  const i = modals.indexOf(root); if (i >= 0) modals.splice(i, 1);
  root.remove();
}
function confirmModal({ title, body, confirm = 'Confirm', danger = false, onConfirm }) {
  openModal(`<div class="modal-head"><h2 class="h-sm">${esc(title)}</h2></div><div class="modal-body"><div class="confirm-text">${body}</div></div><div class="modal-foot"><button class="btn link" data-action="close-modal">Cancel</button><button class="btn ${danger ? 'danger' : ''}" data-ok>${esc(confirm)}</button></div>`, root => {
    const ok = $('[data-ok]', root);
    ok.addEventListener('click', () => { closeModal(root); onConfirm && onConfirm(); });
    ok.focus();
  }, { cls: 'modal-sm' });
}
function formModal({ title, sub = '', fields, confirm = 'Save', onSave, danger }) {
  const body = fields.map(f => `<label class="lbl" for="${f.id}">${esc(f.label)}</label>${f.type === 'textarea'
    ? `<textarea class="input" id="${f.id}" rows="4" maxlength="${f.max || 1024}" placeholder="${esc(f.placeholder || '')}">${esc(f.value || '')}</textarea>`
    : f.type === 'select' ? `<select class="input" id="${f.id}">${f.options.map(([v, l]) => `<option value="${esc(v)}" ${v === f.value ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`
    : `<input class="input" id="${f.id}" value="${esc(f.value || '')}" placeholder="${esc(f.placeholder || '')}" maxlength="${f.max || 100}" ${f.type ? `type="${f.type}"` : ''}>`}${f.hint ? `<div class="hint">${esc(f.hint)}</div>` : ''}`).join('');
  return openModal(`<div class="modal-head"><h2 class="h-sm">${esc(title)}</h2>${sub ? `<p>${sub}</p>` : ''}</div><div class="modal-body">${body}</div><div class="modal-foot"><button class="btn link" data-action="close-modal">Cancel</button><button class="btn ${danger ? 'danger' : ''}" data-ok>${esc(confirm)}</button></div>`, root => {
    const first = root.querySelector('input,textarea,select'); if (first) { first.focus(); if (first.select) first.select(); }
    const submit = () => {
      const vals = Object.fromEntries(fields.map(f => [f.id, $('#' + f.id, root).value]));
      if (fields.some(f => f.required && !vals[f.id].trim())) { toast('Please fill in the required fields'); return; }
      closeModal(root); onSave(vals);
    };
    $('[data-ok]', root).addEventListener('click', submit);
    root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); submit(); } });
  });
}

function addServerModal() {
  const tpls = [['Create My Own', '✨'], ['Gaming', '🎮'], ['School Club', '🏫'], ['Study Group', '📚'], ['Friends', '💛'], ['Artists & Creators', '🎨'], ['Local Community', '🏡']];
  const step1 = () => `<div class="modal-head center"><h2>Create Your Server</h2><p>Your server is where you and your friends hang out. Make yours and start talking.</p></div>
    <div class="modal-body">${tpls.map(([t, e], i) => `<button class="template" data-tpl="${esc(t)}"><span class="tpl-ic">${e}</span>${esc(t)}${icon('chevronRight', 20)}</button>${i === 0 ? '<h4 class="tpl-h">Start from a template</h4>' : ''}`).join('')}</div>
    <div class="modal-foot center"><h3>Have an invite already?</h3><button class="btn secondary full" data-step="join">Join a Server</button></div>`;
  const root = openModal(step1(), root => {
    let tpl = 'Create My Own';
    root.addEventListener('click', e => {
      const t = e.target.closest('[data-tpl]');
      if (t) {
        tpl = t.dataset.tpl;
        setModal(root, `<div class="modal-head center"><h2>Customize Your Server</h2><p>Give your new server a personality with a name and an icon. You can always change it later.</p></div>
          <div class="modal-body"><div class="upload-circle" data-action="toast" data-msg="Icon upload isn't available in this demo">${icon('plusCircle', 24)}<span>Upload</span></div>
          <label class="lbl" for="srvName">Server Name <span class="req">*</span></label><input class="input" id="srvName" value="${esc(users.me.name)}'s server" maxlength="100" autofocus>
          <p class="hint">By creating a server, you agree to the Community Guidelines.</p></div>
          <div class="modal-foot between"><button class="btn link" data-step="back">Back</button><button class="btn" data-step="create">Create</button></div>`);
        $('#srvName', root).select();
        $('#srvName', root).addEventListener('keydown', ev => { if (ev.key === 'Enter') $('[data-step="create"]', root).click(); });
        return;
      }
      const st = e.target.closest('[data-step]'); if (!st) return;
      if (st.dataset.step === 'back') setModal(root, step1());
      else if (st.dataset.step === 'join') {
        setModal(root, `<div class="modal-head center"><h2>Join a Server</h2><p>Enter an invite below to join an existing server</p></div>
          <div class="modal-body"><label class="lbl" for="invCode">Invite Link <span class="req">*</span></label><input class="input" id="invCode" placeholder="https://chat.example/invite/hTKzmak" autofocus>
          <label class="lbl">Invites should look like</label><p class="hint" style="font-size:14px">hTKzmak<br>https://chat.example/invite/hTKzmak<br>https://chat.example/invite/cool-people</p></div>
          <div class="modal-foot between"><button class="btn link" data-step="back">Back</button><button class="btn" data-step="dojoin">Join Server</button></div>`);
      } else if (st.dataset.step === 'dojoin') {
        const v = $('#invCode', root).value.trim();
        if (!v) { toast('Please enter a valid invite link or invite code.'); return; }
        const code = v.split('/').pop();
        closeModal(root);
        const s = createServer(code.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), { members: ['me', 'nova', 'orion', 'sage'] });
        seed(s.id + ':general', [['orion', 'welcome to the server! 🎉', 5 * MIN]]);
        goServer(s.id); toast(`Joined ${s.name}`);
      } else if (st.dataset.step === 'create') {
        const name = $('#srvName', root).value.trim();
        if (!name) { toast('Server name is required'); return; }
        closeModal(root);
        const s = createServer(name, { tpl });
        goServer(s.id); toast(`Created ${s.name}`);
      }
    });
  });
  return root;
}
function createServer(name, { color = pick(['#5865f2', '#eb459e', '#3ba55c', '#faa61a', '#ed4245', '#9b59b6', '#1abc9c']), members = ['me'], tpl = '' } = {}) {
  const id = nextId('s');
  const extra = {
    'Gaming': [['clips-and-highlights', 'text'], ['Lobby', 'voice'], ['Gaming', 'voice']],
    'School Club': [['announcements', 'text'], ['homework-help', 'text'], ['Meeting Room', 'voice']],
    'Study Group': [['resources', 'text'], ['notes', 'text'], ['Study Room', 'voice']],
    'Friends': [['memes', 'text'], ['Hangout', 'voice']],
    'Artists & Creators': [['showcase', 'text'], ['critique', 'text'], ['Studio', 'voice']],
    'Local Community': [['events', 'text'], ['marketplace', 'text'], ['Town Hall', 'voice']],
  }[tpl] || [];
  const text = [{ id: 'general', name: 'general', type: 'text', topic: '' }, ...extra.filter(x => x[1] === 'text').map(([n]) => ({ id: n, name: n, type: 'text', topic: '' }))];
  const voice = [{ id: 'voice-general', name: 'General', type: 'voice' }, ...extra.filter(x => x[1] === 'voice').map(([n]) => ({ id: nextId('v'), name: n, type: 'voice' }))];
  const s = { id, name, short: initials(name), color, owner: members.length === 1 ? 'me' : members[1], roles: [], members,
    categories: [{ id: nextId('k'), name: 'Text Channels', channels: text }, { id: nextId('k'), name: 'Voice Channels', channels: voice }] };
  servers.push(s);
  return s;
}
function exploreModal() {
  const draw = () => DISCOVER.map((d, i) => {
    const joined = servers.some(s => s.name === d.name);
    return `<div class="explore-card"><span class="ec-icon" style="background:${d.color}">${esc(initials(d.name))}</span><div><b>${esc(d.name)}</b><small>${esc(d.desc)}</small><small>🟢 ${d.members} members</small></div><button class="btn small ${joined ? 'secondary' : 'green'}" data-join="${i}" ${joined ? 'disabled' : ''}>${joined ? 'Joined' : 'Join'}</button></div>`;
  }).join('');
  openModal(`<div class="modal-head"><h2>Find your community</h2><p>From gaming, to music, to learning, there's a place for you.</p></div><div class="modal-body" id="exList">${draw()}</div>`, root => {
    root.addEventListener('click', e => {
      const j = e.target.closest('[data-join]'); if (!j) return;
      const d = DISCOVER[+j.dataset.join];
      const s = createServer(d.name, { color: d.color, members: ['me', 'nova', 'kai', 'luna', 'orion', 'sage', 'rex'] });
      seed(s.id + ':general', [['kai', `Welcome to ${d.name}! Introduce yourself 👋`, 2 * HOUR], ['luna', 'hi everyone!', HOUR]]);
      closeModal(root); goServer(s.id); toast(`Joined ${d.name}`);
    });
  }, { cls: 'modal-lg' });
}
function inviteModal(s, ch) {
  ch = ch || channelsOf(s).find(c => c.type === 'text') || channelsOf(s)[0];
  const link = `https://chat.example/invite/${Math.random().toString(36).slice(2, 9)}`;
  openModal(`<div class="modal-head"><h2 class="h-sm">Invite friends to ${esc(s.name)}</h2>${ch ? `<p class="sub">${icon(ch.type === 'voice' ? 'speaker' : 'hash', 16)} ${esc(ch.name)}</p>` : ''}</div>
    <div class="modal-body"><div class="friend-search"><input id="invSearch" placeholder="Search for friends" aria-label="Search for friends">${icon('search', 18)}</div>
    <div class="invite-list scroller">${friends.map(id => `<div class="invite-row" data-n="${esc(users[id].name.toLowerCase())}">${avatar(users[id], 32)}<span>${esc(users[id].name)}</span><button class="btn outline small" data-invite="${id}">Invite</button></div>`).join('') || '<p class="muted">No friends to invite yet.</p>'}</div></div>
    <div class="modal-foot col"><label class="lbl">Or, send a server invite link to a friend</label><div class="copy-box"><input class="input" readonly value="${link}" aria-label="Invite link"><button class="btn small" data-copy="${link}">Copy</button></div><p class="hint">Your invite link expires in 7 days. <a data-action="toast" data-msg="Invite link settings aren't available in this demo">Edit invite link.</a></p></div>`, root => {
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-invite]');
      if (b && !b.disabled) { b.textContent = 'Sent'; b.disabled = true; b.classList.add('sent'); }
      const c = e.target.closest('[data-copy]');
      if (c) { copy(c.dataset.copy, 'Invite link copied'); c.textContent = 'Copied'; c.classList.add('green'); setTimeout(() => { c.textContent = 'Copy'; c.classList.remove('green'); }, 1500); }
    });
    $('#invSearch', root).addEventListener('input', e => { const q = e.target.value.toLowerCase(); $$('.invite-row', root).forEach(r => r.hidden = !r.dataset.n.includes(q)); });
  });
}
function createChannelModal(s, catId) {
  s = s || currentServer();
  const cat = s.categories.find(c => c.id === catId) || s.categories.find(c => c.channels.some(ch => ch.type === 'text')) || s.categories[0];
  let type = cat && cat.channels.length && cat.channels.every(c => c.type === 'voice') ? 'voice' : 'text';
  openModal(`<div class="modal-head"><h2 class="h-sm">Create Channel</h2>${cat ? `<p class="sub">in ${esc(cat.name)}</p>` : ''}</div>
    <div class="modal-body"><label class="lbl">Channel Type</label>
      <div class="radio-card ${type === 'text' ? 'selected' : ''}" data-type="text">${icon('hash', 24)}<div><b>Text</b><small>Send messages, images, GIFs, emoji, opinions, and puns</small></div><span class="radio"></span></div>
      <div class="radio-card ${type === 'voice' ? 'selected' : ''}" data-type="voice">${icon('speaker', 24)}<div><b>Voice</b><small>Hang out together with voice, video, and screen share</small></div><span class="radio"></span></div>
      <label class="lbl" for="chName">Channel Name</label><div class="input-icon"><span id="chIc">${icon(type === 'voice' ? 'speaker' : 'hash', 16)}</span><input class="input" id="chName" placeholder="new-channel" maxlength="100" autofocus></div>
      <div class="set-row slim"><div><div class="t">${icon('lock', 16)} Private Channel</div><div class="d">Only selected members and roles will be able to view this channel.</div></div><button type="button" class="switch" role="switch" aria-label="Private Channel"></button></div>
    </div><div class="modal-foot"><button class="btn link" data-action="close-modal">Cancel</button><button class="btn" data-ok disabled>Create Channel</button></div>`, root => {
    const inp = $('#chName', root), ok = $('[data-ok]', root);
    root.addEventListener('click', e => {
      const rc = e.target.closest('.radio-card'); if (!rc) return;
      type = rc.dataset.type;
      $$('.radio-card', root).forEach(x => x.classList.toggle('selected', x === rc));
      $('#chIc', root).innerHTML = icon(type === 'voice' ? 'speaker' : 'hash', 16);
      inp.focus();
    });
    inp.addEventListener('input', () => {
      if (type === 'text') { const p = inp.selectionStart; inp.value = inp.value.toLowerCase().replace(/\s/g, '-'); inp.selectionStart = inp.selectionEnd = p; }
      ok.disabled = !inp.value.trim();
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !ok.disabled) ok.click(); });
    ok.addEventListener('click', () => {
      const name = inp.value.trim().replace(/^-+|-+$/g, '') || inp.value.trim();
      let c = cat;
      if (!c) { c = { id: nextId('k'), name: 'Channels', channels: [] }; s.categories.push(c); }
      const ch = { id: nextId('c'), name, type, topic: '' };
      c.channels.push(ch);
      closeModal(root);
      if (type === 'text') { state.channel[s.id] = ch.id; renderAll(); } else renderSidebar();
      toast(`Created ${type === 'text' ? '#' : ''}${name}`);
    });
  });
}
function createCategoryModal(s) {
  formModal({ title: 'Create Category', fields: [{ id: 'catName', label: 'Category Name', placeholder: 'New Category', required: true }], confirm: 'Create Category',
    onSave: v => { s.categories.push({ id: nextId('k'), name: v.catName.trim(), channels: [] }); renderSidebar(); toast('Category created'); } });
}
function editCategoryModal(s, cat) {
  formModal({ title: 'Edit Category', fields: [{ id: 'catName', label: 'Category Name', value: cat.name, required: true }],
    onSave: v => { cat.name = v.catName.trim(); renderSidebar(); } });
}
function createEventModal(s) {
  formModal({ title: 'Create Event', sub: `in ${esc(s.name)}`, confirm: 'Create Event', fields: [
    { id: 'evName', label: 'Event Topic', placeholder: "What's your event?", required: true },
    { id: 'evDate', label: 'Start Date', type: 'date', value: new Date().toISOString().slice(0, 10) },
    { id: 'evDesc', label: 'Description', type: 'textarea', placeholder: 'Tell people a little more about your event.' },
  ], onSave: v => toast(`Event "${v.evName}" created`) });
}
function editChannelModal(s, ch) {
  if (!ch) return;
  formModal({ title: `Edit ${ch.type === 'voice' ? '' : '#'}${ch.name}`, fields: [
    { id: 'edName', label: 'Channel Name', value: ch.name, required: true },
    ch.type === 'text' && { id: 'edTopic', label: 'Channel Topic', type: 'textarea', value: ch.topic, placeholder: 'Let everyone know how to use this channel!', max: 1024 },
    ch.type === 'text' && { id: 'edSlow', label: 'Slowmode', type: 'select', value: ch.slow || '0', options: [['0', 'Off'], ['5', '5s'], ['30', '30s'], ['60', '1m'], ['300', '5m']] },
  ].filter(Boolean), confirm: 'Save Changes', onSave: v => {
    ch.name = ch.type === 'text' ? v.edName.trim().toLowerCase().replace(/\s+/g, '-') : v.edName.trim();
    if (ch.type === 'text') { ch.topic = v.edTopic.trim(); ch.slow = v.edSlow; }
    renderAll(); toast('Channel updated');
  } });
}
function duplicateChannel(s, ch) {
  const cat = s.categories.find(c => c.channels.includes(ch));
  const copyCh = { ...ch, id: nextId('c'), name: ch.name + (ch.type === 'text' ? '-copy' : ' Copy'), muted: false };
  cat.channels.splice(cat.channels.indexOf(ch) + 1, 0, copyCh);
  renderSidebar(); toast('Channel duplicated');
}
function deleteChannelConfirm(s, ch) {
  confirmModal({ title: 'Delete Channel', body: `Are you sure you want to delete <b>${ch.type === 'text' ? '#' : ''}${esc(ch.name)}</b>? This cannot be undone.`, confirm: 'Delete Channel', danger: true, onConfirm: () => {
    const cat = s.categories.find(c => c.channels.includes(ch));
    cat.channels = cat.channels.filter(c => c !== ch);
    if (state.voice && state.voice.channel === ch.id && state.voice.server === s.id) leaveVoice(true);
    if (state.channel[s.id] === ch.id) delete state.channel[s.id];
    renderAll(); toast('Channel deleted');
  } });
}
function removeServer(s) {
  if (state.voice && state.voice.server === s.id) leaveVoice(true);
  servers.splice(servers.indexOf(s), 1);
  if (state.server === s.id) { state.dm = null; goHome(); } else renderAll();
}
function leaveServerConfirm(s) {
  confirmModal({ title: `Leave '${s.name}'`, body: `Are you sure you want to leave <b>${esc(s.name)}</b>? You won't be able to rejoin this server unless you are re-invited.`, confirm: 'Leave Server', danger: true, onConfirm: () => { removeServer(s); toast(`You left ${s.name}`); } });
}
function deleteServerConfirm(s) {
  confirmModal({ title: `Delete '${s.name}'`, body: `Are you sure you want to delete <b>${esc(s.name)}</b>? This action cannot be undone.`, confirm: 'Delete Server', danger: true, onConfirm: () => { closeSettings(); removeServer(s); toast('Server deleted'); } });
}
function serverNotifModal(s) {
  const lvl = s.notif || 'mentions';
  openModal(`<div class="modal-head"><h2 class="h-sm">Notification Settings</h2><p>${esc(s.name)}</p></div><div class="modal-body">
    <div class="set-row"><div><div class="t">Mute ${esc(s.name)}</div><div class="d">Muting a server prevents unread indicators and notifications from appearing unless you are mentioned.</div></div><button class="switch ${s.muted ? 'on' : ''}" data-local="muted" role="switch" aria-label="Mute server"></button></div>
    <label class="lbl mt">Server Notification Settings</label>
    ${[['all', 'All Messages'], ['mentions', 'Only @mentions'], ['nothing', 'Nothing']].map(([v, l]) => `<div class="radio-card ${lvl === v ? 'selected' : ''}" data-lvl="${v}"><span class="radio"></span><div>${l}</div></div>`).join('')}
    <div class="set-row"><div class="t">Suppress @everyone and @here</div><button class="switch ${s.supEveryone ? 'on' : ''}" data-local="supEveryone" role="switch" aria-label="Suppress everyone"></button></div>
    <div class="set-row"><div class="t">Suppress All Role @mentions</div><button class="switch ${s.supRoles ? 'on' : ''}" data-local="supRoles" role="switch" aria-label="Suppress roles"></button></div>
    </div><div class="modal-foot"><button class="btn" data-action="close-modal">Done</button></div>`, root => {
    root.addEventListener('click', e => {
      const r = e.target.closest('[data-lvl]');
      if (r) { s.notif = r.dataset.lvl; $$('[data-lvl]', root).forEach(x => x.classList.toggle('selected', x === r)); }
      const sw = e.target.closest('[data-local]');
      if (sw) setTimeout(() => { s[sw.dataset.local] = sw.classList.contains('on'); renderRail(); });
    });
  });
}
function channelNotifModal(ch) {
  const lvl = ch.notif || 'default';
  openModal(`<div class="modal-head"><h2 class="h-sm">Notification Settings</h2><p>#${esc(ch.name)}</p></div><div class="modal-body">
    ${[['default', 'Use Category Default'], ['all', 'All Messages'], ['mentions', 'Only @mentions'], ['nothing', 'Nothing']].map(([v, l]) => `<div class="radio-card ${lvl === v ? 'selected' : ''}" data-lvl="${v}"><span class="radio"></span><div>${l}</div></div>`).join('')}
    </div><div class="modal-foot"><button class="btn" data-action="close-modal">Done</button></div>`, root => {
    root.addEventListener('click', e => { const r = e.target.closest('[data-lvl]'); if (r) { ch.notif = r.dataset.lvl; $$('[data-lvl]', root).forEach(x => x.classList.toggle('selected', x === r)); } });
  });
}
function privacyModal(s) {
  openModal(`<div class="modal-head"><h2 class="h-sm">Privacy Settings</h2><p>${esc(s.name)}</p></div><div class="modal-body">
    <div class="set-row"><div><div class="t">Direct Messages</div><div class="d">Allow direct messages from other members in this server.</div></div><button class="switch ${s.noDms ? '' : 'on'}" data-local="dms" role="switch" aria-label="Direct messages"></button></div>
    <div class="set-row"><div><div class="t">Message Requests</div><div class="d">Filter messages from server members you may not know.</div></div><button class="switch on" role="switch" aria-label="Message requests"></button></div>
    <div class="set-row"><div><div class="t">Activity Status</div><div class="d">Share your activity status in this server.</div></div><button class="switch on" role="switch" aria-label="Activity status"></button></div>
    </div><div class="modal-foot"><button class="btn" data-action="close-modal">Done</button></div>`, root => {
    root.addEventListener('click', e => { const sw = e.target.closest('[data-local="dms"]'); if (sw) setTimeout(() => { s.noDms = !sw.classList.contains('on'); }); });
  });
}
function serverProfileModal(s) {
  formModal({ title: 'Edit Server Profile', sub: `How you appear in ${esc(s.name)}`, fields: [
    { id: 'spNick', label: 'Server Nickname', value: s.nick || '', placeholder: users.me.name, max: 32, hint: 'Nicknames are only visible in this server.' },
  ], onSave: v => { s.nick = v.spNick.trim(); toast('Server profile saved'); } });
}
function noteModal(u) {
  formModal({ title: `Note for ${u.name}`, fields: [{ id: 'note', label: 'Note', type: 'textarea', value: u.note || '', placeholder: 'Click to add a note', max: 256 }],
    onSave: v => { u.note = v.note.trim(); toast('Note saved'); } });
}
function reportModal(m) {
  openModal(`<div class="modal-head"><h2 class="h-sm">Report Message</h2><p>What's going on with this message?</p></div><div class="modal-body">
    ${['Spam', 'Harassment or bullying', 'Hate speech', 'Something else'].map((r, i) => `<div class="radio-card ${i === 0 ? 'selected' : ''}" data-r><span class="radio"></span><div>${r}</div></div>`).join('')}
    </div><div class="modal-foot"><button class="btn link" data-action="close-modal">Cancel</button><button class="btn danger" data-ok>Report</button></div>`, root => {
    root.addEventListener('click', e => { const r = e.target.closest('[data-r]'); if (r) $$('[data-r]', root).forEach(x => x.classList.toggle('selected', x === r)); });
    $('[data-ok]', root).addEventListener('click', () => { closeModal(root); toast('Thanks! Your report was submitted (demo).'); });
  });
}
function forwardModal(m) {
  const targets = [...dmList.map(id => ['dm:' + id, users[id].name, avatar(users[id], 24)]), ...servers.flatMap(s => channelsOf(s).filter(c => c.type === 'text').map(c => [s.id + ':' + c.id, `#${c.name} • ${s.name}`, icon('hash', 20)]))];
  openModal(`<div class="modal-head"><h2 class="h-sm">Forward To</h2><p>Select where you want to share this message.</p></div><div class="modal-body"><div class="invite-list scroller" style="max-height:300px">${targets.map(([k, l, ic]) => `<div class="invite-row">${ic}<span>${esc(l)}</span><button class="btn outline small" data-fwd="${k}">Send</button></div>`).join('')}</div></div>`, root => {
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-fwd]'); if (!b || b.disabled) return;
      const { text, file, sticker, gif } = m;
      pushMessage(b.dataset.fwd, { author: 'me', text: text ? `> forwarded from ${users[m.author].name}\n${text}` : '', file, sticker, gif });
      b.textContent = 'Sent'; b.disabled = true; b.classList.add('sent');
      if (b.dataset.fwd === currentKey()) renderMessages();
    });
  });
}
function pollModal() {
  formModal({ title: 'Create a Poll', confirm: 'Post', fields: [
    { id: 'pq', label: 'Question', placeholder: 'What question do you want to ask?', required: true, max: 300 },
    { id: 'pa1', label: 'Answer 1', placeholder: 'Type your answer', required: true },
    { id: 'pa2', label: 'Answer 2', placeholder: 'Type your answer', required: true },
  ], onSave: v => sendPayload({ text: `📊 **${v.pq.trim()}**\n1️⃣ ${v.pa1.trim()}\n2️⃣ ${v.pa2.trim()}\n\n*React to vote!*`, reactions: {} }) });
}
function topicModal() {
  const ch = currentChannel(); if (!ch) return;
  openModal(`<div class="modal-head"><h2 class="h-sm">#${esc(ch.name)}</h2></div><div class="modal-body"><div class="confirm-text">${fmt(ch.topic || 'No topic set.')}</div></div><div class="modal-foot"><button class="btn secondary" data-edit-topic>Edit Channel</button><button class="btn" data-action="close-modal">Close</button></div>`, root => {
    $('[data-edit-topic]', root).addEventListener('click', () => { closeModal(root); editChannelModal(currentServer(), ch); });
  });
}
function imageModal(src) {
  openModal(`<img src="${src}" alt="" style="display:block;max-width:90vw;max-height:80vh">`, null, { cls: 'modal-img' });
}

/* ---------- friends ---------- */
function closeDM(id) {
  const i = dmList.indexOf(id); if (i >= 0) dmList.splice(i, 1);
  if (state.dm === id && state.server === 'home') state.dm = null;
  renderAll();
}
function removeFriend(id) {
  const u = users[id];
  confirmModal({ title: `Remove '${u.name}'`, body: `Are you sure you want to remove <b>${esc(u.name)}</b> from your friends?`, confirm: 'Remove Friend', danger: true, onConfirm: () => { friends = friends.filter(x => x !== id); renderAll(); toast(`Removed ${u.name}`); } });
}
function blockUser(id) {
  const u = users[id];
  confirmModal({ title: `Block ${u.name}?`, body: `Blocking will also remove them from your friends. You won't see their messages in DMs.`, confirm: 'Block', danger: true, onConfirm: () => {
    blocked.push(id); friends = friends.filter(x => x !== id); pending = pending.filter(p => p.id !== id);
    renderAll(); toast(`Blocked ${u.name}`);
  } });
}
function unblockUser(id) { blocked = blocked.filter(x => x !== id); renderAll(); toast(`Unblocked ${users[id].name}`); }
function acceptFriend(id) {
  pending = pending.filter(p => p.id !== id);
  if (!friends.includes(id)) friends.push(id);
  renderAll(); toast(`You are now friends with ${users[id].name}!`);
}
function sendFriendRequest(id) {
  if (!pending.some(p => p.id === id)) pending.push({ id, incoming: false });
  renderAll(); toast(`Friend request sent to ${users[id].name}`);
}
function submitAddFriend() {
  const inp = $('#afInput'), box = $('#addFriendForm'), msg = $('#afMsg');
  const name = inp.value.trim().replace(/^@/, ''); if (!name) return;
  const fail = t => { box.className = 'af-box err'; msg.className = 'af-msg err'; msg.textContent = t; };
  if (name.toLowerCase() === users.me.username.toLowerCase()) return fail("You can't add yourself as a friend, silly.");
  let u = Object.values(users).find(x => x.username.toLowerCase() === name.toLowerCase() || x.name.toLowerCase() === name.toLowerCase());
  if (u && friends.includes(u.id)) return fail("You're already friends with that user!");
  if (u && pending.some(p => p.id === u.id)) return fail('You already have a pending request with that user.');
  if (u && u.bot) return fail("Hm, didn't work. Bots can't be added as friends.");
  if (!u) {
    const id = nextId('u');
    u = users[id] = { id, name: name[0].toUpperCase() + name.slice(1), username: name.toLowerCase(), color: pick(['#5865f2', '#eb459e', '#3ba55c', '#faa61a', '#ed4245', '#9b59b6']), status: 'offline', about: '', since: 'Today' };
  }
  pending.push({ id: u.id, incoming: false });
  box.className = 'af-box ok'; msg.className = 'af-msg ok';
  msg.textContent = `Success! Your friend request to ${u.username} was sent.`;
  inp.value = ''; $('#afBtn').disabled = true;
  renderSidebar(); renderRail();
}

/* ==========================================================================
   Settings (full screen)
   ========================================================================== */
let settingsRoot = null, micTimer = null;
function openSettings(nav, render, first) {
  closeFloating(); hideTip();
  if (settingsRoot) closeSettings();
  const root = document.createElement('div');
  root.className = 'settings-root';
  root.innerHTML = `<div class="set-side scroller"><nav class="set-nav">${nav.map(n => n.head ? `<div class="set-head">${esc(n.head)}</div>` : n.sep ? '<div class="set-sep"></div>' : n.foot ? `<div class="set-foot">${esc(n.foot)}</div>` : `<button class="set-tab ${n.danger ? 'danger' : ''}" data-tab="${n.id}">${esc(n.label)}${n.icon ? icon(n.icon, 16) : ''}</button>`).join('')}</nav></div>
    <div class="set-main scroller"><div class="set-content"></div><div class="set-close"><button data-action="close-settings" aria-label="Close settings">${icon('x', 18)}</button><span>ESC</span></div></div>`;
  $('#layer').appendChild(root); settingsRoot = root;
  const show = id => {
    const n = nav.find(x => x.id === id); if (n && n.run) { n.run(); return; }
    clearInterval(micTimer);
    $$('.set-tab', root).forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    const fresh = document.createElement('div'); fresh.className = 'set-content';
    $('.set-content', root).replaceWith(fresh);
    render(id, fresh, show);
    $('.set-main', root).scrollTop = 0;
  };
  root.addEventListener('click', e => { const t = e.target.closest('[data-tab]'); if (t) show(t.dataset.tab); });
  show(first);
}
function closeSettings() {
  if (!settingsRoot) return;
  clearInterval(micTimer);
  settingsRoot.remove(); settingsRoot = null;
  renderAll();
}
const toggleRow = (title, desc, key, def = false) => {
  const on = prefs[key] ?? def;
  return `<div class="set-row"><div><div class="t">${esc(title)}</div>${desc ? `<div class="d">${esc(desc)}</div>` : ''}</div><button class="switch ${on ? 'on' : ''}" role="switch" aria-checked="${on}" aria-label="${esc(title)}" data-pref="${key}"></button></div>`;
};
const radioRow = (group, val, label, on, desc = '') => `<div class="radio-card ${on ? 'selected' : ''}" data-radio="${group}" data-val="${val}"><span class="radio"></span><div>${label}${desc ? `<small>${esc(desc)}</small>` : ''}</div></div>`;

function openUserSettings(tab = 'account') {
  const nav = [
    { head: 'User Settings' },
    { id: 'account', label: 'My Account' }, { id: 'profiles', label: 'Profiles' }, { id: 'privacy', label: 'Privacy & Safety' }, { id: 'devices', label: 'Devices' },
    { sep: true }, { head: 'App Settings' },
    { id: 'appearance', label: 'Appearance' }, { id: 'accessibility', label: 'Accessibility' }, { id: 'voice', label: 'Voice & Video' },
    { id: 'notifications', label: 'Notifications' }, { id: 'keybinds', label: 'Keybinds' }, { id: 'language', label: 'Language' }, { id: 'advanced', label: 'Advanced' },
    { sep: true },
    { id: 'logout', label: 'Log Out', danger: true, icon: 'logout', run: () => confirmModal({ title: 'Log Out', body: 'Are you sure you want to logout?', confirm: 'Log Out', danger: true, onConfirm: () => { closeSettings(); toast('Logged out (not really — this is a demo)'); } }) },
    { sep: true }, { foot: 'Chatcord Web • Demo build 1.0.0' },
  ];
  openSettings(nav, userSettingsTab, tab);
}
function userSettingsTab(id, el, show) {
  const me = users.me;
  const reRender = () => show(id);
  if (id === 'account') {
    const field = (label, value, key, btn = 'Edit') => `<div class="acct-field"><div><div class="lbl">${label}</div><div class="val">${value}</div></div><button class="btn secondary small" data-edit="${key}">${btn}</button></div>`;
    el.innerHTML = `<h2>My Account</h2>
      <div class="acct-card"><div class="acct-banner" style="background:${me.banner || me.color}"></div>
        <div class="acct-top"><span class="avatar-wrap">${avatar(me, 80, true, 'var(--bg-rail)')}</span><div class="acct-name">${esc(me.name)}</div><button class="btn" data-go="profiles">Edit User Profile</button></div>
        <div class="acct-fields">
          ${field('Display Name', esc(me.name), 'name')}
          ${field('Username', esc(me.username), 'username')}
          ${field('Email', `<span id="email">**********@example.com</span> <a data-reveal>Reveal</a>`, 'email')}
          ${field('Phone Number', "You haven't added a phone number yet.", 'phone', 'Add')}
        </div></div>
      <div class="set-divider"></div>
      <h3 class="set-h3">Password and Authentication</h3>
      <button class="btn" data-edit="password">Change Password</button>
      <label class="lbl mt">Authenticator App</label><p class="d">Protect your account with an extra layer of security. Once configured, you'll be required to enter your password and complete one additional step in order to sign in.</p>
      <div class="row-gap"><button class="btn" data-edit="2fa">Enable Authenticator App</button></div>
      <div class="set-divider"></div>
      <label class="lbl">Account Removal</label><p class="d">Disabling your account means you can recover it at any time after taking this action.</p>
      <div class="row-gap"><button class="btn danger" data-edit="disable">Disable Account</button><button class="btn outline-danger" data-edit="delete">Delete Account</button></div>`;
    el.addEventListener('click', e => {
      if (e.target.closest('[data-go]')) return show('profiles');
      const rv = e.target.closest('[data-reveal]');
      if (rv) { const on = rv.textContent === 'Reveal'; $('#email', el).textContent = on ? 'you@example.com' : '**********@example.com'; rv.textContent = on ? 'Hide' : 'Reveal'; return; }
      const b = e.target.closest('[data-edit]'); if (!b) return;
      const k = b.dataset.edit;
      if (k === 'name') formModal({ title: 'Change your display name', fields: [{ id: 'dn', label: 'Display Name', value: me.name, max: 32, required: true }], confirm: 'Done', onSave: v => { me.name = v.dn.trim(); savePrefs(); reRender(); renderUserPanel(); } });
      else if (k === 'username') formModal({ title: 'Change your username', sub: 'Enter a new username and your existing password.', fields: [{ id: 'un', label: 'Username', value: me.username, max: 32, required: true }, { id: 'pw', label: 'Current Password', type: 'password' }], confirm: 'Done', onSave: v => { me.username = v.un.trim().toLowerCase().replace(/\s+/g, '_'); savePrefs(); reRender(); } });
      else if (k === 'email') formModal({ title: 'Change your email', fields: [{ id: 'em', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true }, { id: 'pw', label: 'Current Password', type: 'password' }], confirm: 'Done', onSave: () => toast('Email updated (demo)') });
      else if (k === 'phone') formModal({ title: 'Enter a Phone Number', fields: [{ id: 'ph', label: 'Phone Number', type: 'tel', placeholder: '+1 555 0100', required: true }], confirm: 'Send', onSave: () => toast('Verification code sent (demo)') });
      else if (k === 'password') formModal({ title: 'Update your password', sub: 'Enter your current password and a new password.', fields: [{ id: 'op', label: 'Current Password', type: 'password' }, { id: 'np', label: 'New Password', type: 'password' }, { id: 'cp', label: 'Confirm New Password', type: 'password' }], confirm: 'Done', onSave: v => toast(v.np && v.np === v.cp ? 'Password updated (demo)' : "Passwords don't match") });
      else if (k === '2fa') toast("Two-factor setup isn't available in this demo");
      else confirmModal({ title: k === 'delete' ? 'Delete Account' : 'Disable Account', body: 'Are you sure? This is a demo, so nothing will actually happen.', confirm: k === 'delete' ? 'Delete Account' : 'Disable Account', danger: true, onConfirm: () => toast('Nothing happened — this is a demo 🙂') });
    });
  } else if (id === 'profiles') {
    el.innerHTML = `<h2>Profiles</h2><div class="prof-grid"><div>
      <label class="lbl" for="pDisp">Display Name</label><input class="input" id="pDisp" value="${esc(me.name)}" maxlength="32">
      <label class="lbl" for="pPron">Pronouns</label><input class="input" id="pPron" value="${esc(me.pronouns || '')}" placeholder="Add your pronouns" maxlength="40">
      <label class="lbl">Avatar Color</label><div class="color-row"><input type="color" id="pAvatar" value="${me.color}" aria-label="Avatar color"><span class="d">Used behind your initial</span></div>
      <label class="lbl">Banner Color</label><div class="color-row"><input type="color" id="pBanner" value="${me.banner || me.color}" aria-label="Banner color"><button class="btn link" data-reset-banner>Reset</button></div>
      <label class="lbl" for="pAbout">About Me</label><textarea class="input" id="pAbout" rows="4" maxlength="190" placeholder="Tell everyone about yourself">${esc(me.about || '')}</textarea><div class="d right" id="pCount">${(me.about || '').length}/190</div>
      </div><div><label class="lbl">Preview</label><div class="popout static" id="pPrev">${profileHTML(me, { preview: true })}</div></div></div>`;
    const upd = () => {
      me.name = $('#pDisp', el).value.trim() || 'You';
      me.pronouns = $('#pPron', el).value.trim();
      me.color = $('#pAvatar', el).value;
      me.banner = $('#pBanner', el).value;
      me.about = $('#pAbout', el).value;
      $('#pCount', el).textContent = `${me.about.length}/190`;
      $('#pPrev', el).innerHTML = profileHTML(me, { preview: true });
      savePrefs(); renderUserPanel();
    };
    el.addEventListener('input', upd);
    el.addEventListener('click', e => { if (e.target.closest('[data-reset-banner]')) { delete me.banner; $('#pBanner', el).value = me.color; upd(); delete me.banner; savePrefs(); } });
  } else if (id === 'privacy') {
    el.innerHTML = `<h2>Privacy & Safety</h2><label class="lbl">Safe Direct Messaging</label>
      ${radioRow('dmfilter', 'all', 'Filter all direct messages', prefs.dmFilter === 'all', 'All direct messages will be filtered for explicit media content.')}
      ${radioRow('dmfilter', 'nonfriends', 'Filter direct messages from non-friends', (prefs.dmFilter || 'nonfriends') === 'nonfriends', 'Direct messages from non-friends will be filtered.')}
      ${radioRow('dmfilter', 'none', 'Do not filter direct messages', prefs.dmFilter === 'none', 'Direct messages will not be filtered.')}
      <div class="set-divider"></div><label class="lbl">Server Privacy Defaults</label>
      ${toggleRow('Allow DMs from other members in your servers', 'This setting is applied when you join a new server.', 'pv_dms', true)}
      ${toggleRow('Allow access to age-restricted servers on iOS', '', 'pv_age', false)}
      ${toggleRow('Message requests', 'Filter messages from people you may not know.', 'pv_requests', true)}
      <div class="set-divider"></div><label class="lbl">How we use your data</label>
      ${toggleRow('Use data to improve the app', 'This setting allows us to use and process information about how you navigate and use the app.', 'pv_analytics', false)}
      ${toggleRow('Use data to customize my experience', 'This setting allows us to personalize the app for you.', 'pv_custom', true)}`;
    el.addEventListener('click', e => { const r = e.target.closest('[data-radio]'); if (r) { prefs.dmFilter = r.dataset.val; savePrefs(); $$('[data-radio="dmfilter"]', el).forEach(x => x.classList.toggle('selected', x === r)); } });
  } else if (id === 'devices') {
    el.innerHTML = `<h2>Devices</h2><p class="d">Here are all the devices that are currently logged in with your account. You can log out of each one individually or all other devices.</p>
      <label class="lbl mt">Current Device</label><div class="audit">${icon('monitor', 32)}<div><b>${esc(navigator.platform || 'Web')} • Browser</b><div class="muted">Right now</div></div></div>
      <label class="lbl mt">Other Devices</label><div class="audit">${icon('phone', 32)}<div style="flex:1"><b>Phone • Mobile App</b><div class="muted">2 days ago</div></div><button class="btn secondary small" data-logout-dev>Log Out</button></div>
      <div class="set-divider"></div><h3 class="set-h3">Log out of all known devices</h3><p class="d">You'll have to log back in on all logged out devices.</p><div class="row-gap"><button class="btn danger" data-logout-all>Log Out All Known Devices</button></div>`;
    el.addEventListener('click', e => {
      const d = e.target.closest('[data-logout-dev]'); if (d) { d.closest('.audit').remove(); toast('Device logged out'); }
      if (e.target.closest('[data-logout-all]')) toast('Logged out of all other devices');
    });
  } else if (id === 'appearance') {
    const sample = [
      { id: 'pv1', author: 'nova', text: 'Waiting for the day when compact mode would be turned on 👀', time: new Date(), reactions: {} },
      { id: 'pv2', author: 'kai', text: 'Look at me I am a beautiful butterfly 🦋', time: new Date(), reactions: {} },
    ];
    el.innerHTML = `<h2>Appearance</h2>
      <div class="preview-msgs">${sample.map(m => messageHTML(m, false)).join('')}</div>
      <label class="lbl mt">Theme</label>
      <div class="themes">${[['dark', 'Dark', '#313338'], ['light', 'Light', '#ffffff'], ['sync', 'Sync with computer', 'linear-gradient(135deg,#ffffff 50%,#313338 50%)']].map(([k, l, bg]) => `<button class="theme-opt ${prefs.theme === k ? 'selected' : ''}" data-theme-opt="${k}" data-tip="${l}" aria-label="${l}" style="background:${bg}">${prefs.theme === k ? `<span class="tick">${icon('check', 14)}</span>` : ''}</button>`).join('')}</div>
      <div class="set-divider"></div>
      <label class="lbl">Message Display</label>
      ${radioRow('display', 'cozy', '<b>Cozy</b>', !prefs.compact, 'Modern, beautiful, and easy on your eyes.')}
      ${radioRow('display', 'compact', '<b>Compact</b>', !!prefs.compact, 'Fit more messages on screen at one time. #IRC')}
      <div class="set-divider"></div>
      <label class="lbl" for="fontRange">Chat Font Scaling</label>
      <input type="range" min="12" max="24" step="1" value="${prefs.fontSize}" id="fontRange" class="range">
      <div class="range-labels"><span>12px</span><span id="fontVal">${prefs.fontSize}px</span><span>24px</span></div>`;
    el.addEventListener('click', e => {
      const t = e.target.closest('[data-theme-opt]');
      if (t) { prefs.theme = t.dataset.themeOpt; applyPrefs(); savePrefs(); hideTip(); reRender(); return; }
      const r = e.target.closest('[data-radio="display"]');
      if (r) { prefs.compact = r.dataset.val === 'compact'; applyPrefs(); savePrefs(); $$('[data-radio="display"]', el).forEach(x => x.classList.toggle('selected', x === r)); }
    });
    $('#fontRange', el).addEventListener('input', e => { prefs.fontSize = +e.target.value; $('#fontVal', el).textContent = prefs.fontSize + 'px'; applyPrefs(); savePrefs(); });
  } else if (id === 'accessibility') {
    el.innerHTML = `<h2>Accessibility</h2>
      ${toggleRow('Reduced Motion', 'Reduce the intensity of animations, hover effects, and other moving effects.', 'reducedMotion')}
      ${toggleRow('Always underline links', 'Make links stand out more by always underlining them.', 'underline')}
      ${toggleRow('Show role colors in names', 'Display role colors next to names in chat and the member list.', 'roleColors', true)}
      ${toggleRow('Show send message button', 'Show a button to send messages (useful on touch screens).', 'a11y_send', false)}
      <label class="lbl mt" for="satRange">Saturation</label><input type="range" id="satRange" class="range" min="0" max="100" value="${prefs.saturation ?? 100}">
      <div class="range-labels"><span>0%</span><span id="satVal">${prefs.saturation ?? 100}%</span><span>100%</span></div>`;
    $('#satRange', el).addEventListener('input', e => { prefs.saturation = +e.target.value; $('#satVal', el).textContent = prefs.saturation + '%'; document.documentElement.style.filter = prefs.saturation < 100 ? `saturate(${prefs.saturation}%)` : ''; savePrefs(); });
  } else if (id === 'voice') {
    el.innerHTML = `<h2>Voice Settings</h2>
      <div class="two-col"><div><label class="lbl" for="inDev">Input Device</label><select class="input" id="inDev"><option>Default</option><option>Microphone (Built-in)</option><option>Headset Microphone</option></select></div>
      <div><label class="lbl" for="outDev">Output Device</label><select class="input" id="outDev"><option>Default</option><option>Speakers (Built-in)</option><option>Headphones</option></select></div>
      <div><label class="lbl">Input Volume</label><input type="range" class="range" min="0" max="100" value="${prefs.inVol ?? 100}" data-vol="inVol"></div>
      <div><label class="lbl">Output Volume</label><input type="range" class="range" min="0" max="200" value="${prefs.outVol ?? 100}" data-vol="outVol"></div></div>
      <label class="lbl mt">Mic Test</label><p class="d">Having mic issues? Start a test and say something silly — we'll play your voice back to you.</p>
      <div class="mic-test" style="margin-top:12px"><button class="btn" data-mic>Let's Check</button><div class="meter"><i id="meter"></i></div></div>
      <div class="set-divider"></div><label class="lbl">Input Mode</label>
      ${radioRow('mode', 'va', 'Voice Activity', (prefs.inputMode || 'va') === 'va')}
      ${radioRow('mode', 'ptt', 'Push to Talk', prefs.inputMode === 'ptt')}
      <div class="set-divider"></div>
      ${toggleRow('Echo Cancellation', '', 'v_echo', true)}
      ${toggleRow('Noise Suppression', 'Suppress background noise from your mic.', 'v_noise', true)}
      ${toggleRow('Automatic Gain Control', '', 'v_agc', true)}`;
    el.addEventListener('input', e => { const v = e.target.closest('[data-vol]'); if (v) { prefs[v.dataset.vol] = +v.value; savePrefs(); } });
    el.addEventListener('click', e => {
      const m = e.target.closest('[data-mic]');
      if (m) {
        const on = m.textContent === "Let's Check";
        m.textContent = on ? 'Stop Testing' : "Let's Check";
        clearInterval(micTimer); $('#meter', el).style.width = '0';
        if (on) micTimer = setInterval(() => { $('#meter', el).style.width = Math.random() * 90 + '%'; }, 120);
      }
      const r = e.target.closest('[data-radio="mode"]');
      if (r) { prefs.inputMode = r.dataset.val; savePrefs(); $$('[data-radio="mode"]', el).forEach(x => x.classList.toggle('selected', x === r)); }
    });
  } else if (id === 'notifications') {
    el.innerHTML = `<h2>Notifications</h2>
      ${toggleRow('Enable Desktop Notifications', 'Get notified about new messages when the app is in the background.', 'n_desktop', true)}
      ${toggleRow('Enable Unread Message Badge', 'Shows a red badge on the app icon when you have unread messages.', 'n_badge', true)}
      ${toggleRow('Enable Taskbar Flashing', '', 'n_flash', true)}
      <div class="set-divider"></div><label class="lbl">Sounds</label>
      ${[['Message', 's_msg'], ['Deafen', 's_deafen'], ['Mute', 's_mute'], ['User Join', 's_join'], ['User Leave', 's_leave'], ['Incoming Ring', 's_ring']].map(([l, k]) => toggleRow(l, '', k, true)).join('')}`;
  } else if (id === 'keybinds') {
    const kb = [['Quick Switcher', ['Ctrl', 'K']], ['Toggle Mute', ['Ctrl', 'Shift', 'M']], ['Toggle Deafen', ['Ctrl', 'Shift', 'D']], ['Send Message', ['Enter']], ['New Line', ['Shift', 'Enter']], ['Edit Last Message', ['↑']], ['Close Popout / Modal', ['Esc']], ['Delete message without confirmation', ['Shift', 'Click']]];
    el.innerHTML = `<h2>Keybinds</h2><p class="d" style="margin-bottom:16px">These shortcuts work anywhere in the app.</p>${kb.map(([l, keys]) => `<div class="kb-row"><span>${l}</span><span>${keys.map(k => `<kbd>${k}</kbd>`).join('')}</span></div>`).join('')}`;
  } else if (id === 'language') {
    const langs = [['en-US', 'English, US'], ['en-GB', 'English, UK'], ['es-ES', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'], ['pt-BR', 'Português do Brasil'], ['ja', '日本語'], ['ko', '한국어']];
    el.innerHTML = `<h2>Language</h2><label class="lbl">Select a language</label>${langs.map(([k, l]) => radioRow('lang', k, l, prefs.lang === k)).join('')}<p class="hint">This is a demo, so the interface stays in English.</p>`;
    el.addEventListener('click', e => { const r = e.target.closest('[data-radio="lang"]'); if (r) { prefs.lang = r.dataset.val; savePrefs(); $$('[data-radio="lang"]', el).forEach(x => x.classList.toggle('selected', x === r)); toast('Language updated'); } });
  } else if (id === 'advanced') {
    el.innerHTML = `<h2>Advanced</h2>
      ${toggleRow('Developer Mode', 'Developer Mode exposes context menu items helpful for people writing bots, like "Copy ID".', 'devMode')}
      ${toggleRow('Hardware Acceleration', 'Turns on hardware acceleration, which uses your GPU to make the app smoother.', 'hwAccel', true)}
      <div class="set-divider"></div>
      <h3 class="set-h3">Reset demo data</h3><p class="d">Clear your saved preferences and profile changes from this browser.</p>
      <div class="row-gap"><button class="btn danger" data-reset>Reset Everything</button></div>`;
    el.addEventListener('click', e => {
      if (e.target.closest('[data-reset]')) confirmModal({ title: 'Reset everything?', body: 'This clears your saved settings in this browser and reloads the page.', confirm: 'Reset', danger: true, onConfirm: () => { try { localStorage.removeItem('chatcord.prefs'); localStorage.removeItem('chatcord.me'); } catch { /* ignore */ } location.reload(); } });
    });
  }
}

function openServerSettings(s, tab = 'overview') {
  const nav = [
    { head: s.name },
    { id: 'overview', label: 'Overview' }, { id: 'roles', label: 'Roles' }, { id: 'emoji', label: 'Emoji' },
    { sep: true }, { head: 'Moderation' },
    { id: 'safety', label: 'Safety Setup' }, { id: 'audit', label: 'Audit Log' }, { id: 'bans', label: 'Bans' },
    { sep: true }, { head: 'User Management' },
    { id: 'members', label: 'Members' }, { id: 'invites', label: 'Invites' },
    { sep: true },
    { id: 'delete', label: 'Delete Server', danger: true, icon: 'trash', run: () => deleteServerConfirm(s) },
  ];
  openSettings(nav, (id, el, show) => serverSettingsTab(s, id, el, show), tab);
}
function serverSettingsTab(s, id, el, show) {
  if (id === 'overview') {
    const textChs = channelsOf(s).filter(c => c.type === 'text');
    el.innerHTML = `<h2>Server Overview</h2>
      <div class="overview-top"><div><div class="srv-preview" id="ovPrev" style="background:${s.color}">${esc(s.short)}</div><p class="hint" style="text-align:center">Minimum size 128x128</p></div>
      <div><label class="lbl" for="ovName">Server Name</label><input class="input" id="ovName" value="${esc(s.name)}" maxlength="100">
      <label class="lbl" for="ovColor">Icon Color</label><input type="color" id="ovColor" value="${s.color}"></div></div>
      <div class="set-divider"></div>
      <label class="lbl" for="ovSys">System Messages Channel</label><select class="input" id="ovSys">${textChs.map(c => `<option value="${c.id}" ${s.sysChannel === c.id ? 'selected' : ''}>#${esc(c.name)}</option>`).join('')}</select>
      <p class="hint">This is the channel we send system event messages to.</p>
      ${toggleRow('Send a random welcome message when someone joins this server.', '', 'sv_welcome_' + s.id, true)}
      ${toggleRow('Prompt members to reply to welcome messages with a sticker.', '', 'sv_sticker_' + s.id, true)}
      <div class="save-bar" hidden><span>Careful — you have unsaved changes!</span><button class="btn link" data-reset>Reset</button><button class="btn green" data-save>Save Changes</button></div>`;
    const bar = $('.save-bar', el), nameI = $('#ovName', el), colorI = $('#ovColor', el), sysI = $('#ovSys', el);
    const dirty = () => { bar.hidden = nameI.value === s.name && colorI.value === s.color && (sysI.value || '') === (s.sysChannel || textChs[0]?.id || ''); const p = $('#ovPrev', el); p.style.background = colorI.value; p.textContent = initials(nameI.value); };
    el.addEventListener('input', dirty); el.addEventListener('change', dirty);
    el.addEventListener('click', e => {
      if (e.target.closest('[data-reset]')) { nameI.value = s.name; colorI.value = s.color; sysI.value = s.sysChannel || textChs[0]?.id || ''; dirty(); }
      if (e.target.closest('[data-save]')) {
        if (!nameI.value.trim()) { toast('Server name is required'); return; }
        s.name = nameI.value.trim(); s.short = initials(s.name); s.color = colorI.value; s.sysChannel = sysI.value;
        $('.set-head', settingsRoot).textContent = s.name; dirty(); toast('Changes saved');
      }
    });
  } else if (id === 'roles') {
    const draw = () => {
      el.innerHTML = `<h2>Roles</h2><p class="d">Use roles to group your server members and assign permissions.</p>
        <div class="row-gap" style="margin-bottom:16px"><button class="btn" data-add-role>Create Role</button></div>
        <div class="role-row"><span class="role"><i style="background:#99aab5"></i>@everyone</span><small style="margin-left:auto">${s.members.length} members • default permissions</small></div>
        ${s.roles.map((r, i) => `<div class="role-row"><input type="color" value="${r.color}" data-rcolor="${i}" aria-label="Role color"><input class="input" value="${esc(r.name)}" data-rname="${i}" aria-label="Role name"><small>${r.members.length} ${r.members.length === 1 ? 'member' : 'members'}</small><button class="circle-btn decline" data-rdel="${i}" data-tip="Delete Role" aria-label="Delete Role">${icon('trash', 16)}</button></div>`).join('')}`;
    };
    draw();
    el.addEventListener('input', e => {
      const n = e.target.closest('[data-rname]'); if (n) s.roles[+n.dataset.rname].name = n.value || 'new role';
      const c = e.target.closest('[data-rcolor]'); if (c) s.roles[+c.dataset.rcolor].color = c.value;
    });
    el.addEventListener('click', e => {
      if (e.target.closest('[data-add-role]')) { s.roles.push({ name: 'new role', color: '#99aab5', members: [] }); draw(); $$('[data-rname]', el).pop().select(); }
      const d = e.target.closest('[data-rdel]'); if (d) { s.roles.splice(+d.dataset.rdel, 1); hideTip(); draw(); }
    });
  } else if (id === 'emoji') {
    el.innerHTML = `<h2>Emoji</h2><p class="d">Add up to 50 custom emoji that anyone can use in this server.</p><div class="row-gap"><button class="btn" data-action="toast" data-msg="Emoji upload isn't available in this demo">Upload Emoji</button></div><div class="empty small">${icon('smile', 64)}<b style="color:var(--text-strong)">NO EMOJI</b><p>Get the party started by uploading an emoji</p></div>`;
  } else if (id === 'safety') {
    const levels = [['none', 'None', 'Unrestricted'], ['low', 'Low', 'Must have a verified email on their account.'], ['medium', 'Medium', 'Must also be registered for longer than 5 minutes.'], ['high', 'High', 'Must also be a member of this server for longer than 10 minutes.'], ['highest', 'Highest', 'Must have a verified phone number.']];
    el.innerHTML = `<h2>Safety Setup</h2><label class="lbl">Verification Level</label>${levels.map(([k, l, d]) => radioRow('verify', k, `<b>${l}</b>`, (s.verify || 'low') === k, d)).join('')}
      <div class="set-divider"></div>${toggleRow('Block words commonly flagged as spam', 'Automatically blocks messages with commonly flagged words.', 'sv_spam_' + s.id, true)}${toggleRow('Require 2FA for moderator actions', '', 'sv_2fa_' + s.id, false)}`;
    el.addEventListener('click', e => { const r = e.target.closest('[data-radio="verify"]'); if (r) { s.verify = r.dataset.val; $$('[data-radio="verify"]', el).forEach(x => x.classList.toggle('selected', x === r)); } });
  } else if (id === 'audit') {
    const who = s.members.filter(x => x !== 'me');
    const acts = [['created the channel', '#general', 3], ['updated the server name', '', 5], ['created the role', 'Moderator', 7], ['created an invite', '', 9]];
    el.innerHTML = `<h2>Audit Log</h2>${acts.map(([a, t, d], i) => { const u = users[who[i % who.length] || 'me']; return `<div class="audit">${avatar(u, 32)}<div><b>${esc(u.name)}</b> ${a} <b>${esc(t)}</b><div class="muted" style="font-size:12px">${d} days ago</div></div></div>`; }).join('')}`;
  } else if (id === 'bans') {
    el.innerHTML = `<h2>Server Ban List</h2><p class="d">Bans by default are by account and IP.</p><div class="empty small">${icon('shield', 64)}<b style="color:var(--text-strong)">NO BANS</b><p>You haven't banned anybody... but if and when you must, do not hesitate!</p></div>`;
  } else if (id === 'members') {
    const draw = () => {
      el.innerHTML = `<h2>Server Members</h2><div class="friend-search" style="margin-bottom:12px"><input id="smSearch" placeholder="Search members" aria-label="Search members">${icon('search', 18)}</div>
        ${s.members.map(mid => { const u = users[mid], r = roleOf(s, mid); return `<div class="ss-member" data-n="${esc(u.name.toLowerCase())}">${avatar(u, 40, true, 'var(--bg-main)')}<div><b>${esc(u.name)}</b>${s.owner === mid ? ' 👑' : ''}<div class="muted" style="font-size:13px">${esc(u.username)}</div></div><small>${r ? esc(r.name) : 'No roles'}</small>${mid !== 'me' && mid !== s.owner ? `<button class="btn outline-danger small" data-kick="${mid}">Kick</button>` : ''}</div>`; }).join('')}`;
      $('#smSearch', el).addEventListener('input', e => { const q = e.target.value.toLowerCase(); $$('.ss-member', el).forEach(r => r.hidden = !r.dataset.n.includes(q)); });
    };
    draw();
    el.addEventListener('click', e => {
      const k = e.target.closest('[data-kick]'); if (!k) return;
      const u = users[k.dataset.kick];
      confirmModal({ title: `Kick '${u.name}' from Server`, body: `Are you sure you want to kick <b>${esc(u.name)}</b> from the server? They will be able to rejoin again with a new invite.`, confirm: 'Kick', danger: true, onConfirm: () => {
        s.members = s.members.filter(x => x !== u.id); s.roles.forEach(r => r.members = r.members.filter(x => x !== u.id));
        draw(); toast(`Kicked ${u.name}`);
      } });
    });
  } else if (id === 'invites') {
    el.innerHTML = `<h2>Invites</h2><p class="d">Here's a list of all active invite links. You can revoke any one.</p>
      ${toggleRow('Pause Invites', 'Stop new people from joining this server with invite links.', 'sv_pause_' + s.id, false)}
      <div class="audit mt">${avatar(users.nova, 32)}<div style="flex:1"><b>Nova</b> <span class="muted">• hTKzmak • 42 uses • expires in 6 days</span></div><button class="btn outline-danger small" data-revoke>Revoke</button></div>`;
    el.addEventListener('click', e => { const r = e.target.closest('[data-revoke]'); if (r) { r.closest('.audit').remove(); toast('Invite revoked'); } });
  }
}

/* ---------- quick switcher (Ctrl+K) ---------- */
function quickSwitcher() {
  if (modals.some(m => m.querySelector('.modal-qs'))) return;
  openModal(`<div class="qs"><h3>Search for servers, channels or DMs</h3><input class="input qs-input" id="qsInput" placeholder="Where would you like to go?" autocomplete="off" aria-label="Where would you like to go?"><div class="qs-list scroller" id="qsList"></div><p class="qs-tip"><b>PROTIP:</b> Start searches with @, # or * to narrow down results.</p></div>`, root => {
    const inp = $('#qsInput', root), list = $('#qsList', root);
    const all = () => [
      ...[...new Set([...dmList, ...friends])].map(id => ({ type: '@', label: users[id].name, sub: users[id].username, html: avatar(users[id], 20, true, 'var(--bg-side)'), go: () => openDM(id) })),
      ...servers.flatMap(s => channelsOf(s).filter(c => c.type === 'text').map(c => ({ type: '#', label: c.name, sub: s.name, html: icon('hash', 20), go: () => navigateKey(s.id + ':' + c.id) }))),
      ...servers.map(s => ({ type: '*', label: s.name, sub: 'Server', html: `<span class="qs-srv" style="background:${s.color}">${esc(s.short)}</span>`, go: () => goServer(s.id) })),
    ];
    let sel = 0, res = [];
    const draw = () => {
      let q = inp.value.trim().toLowerCase(), f = null;
      if (/^[@#*]/.test(q)) { f = q[0]; q = q.slice(1); }
      res = all().filter(i => (!f || i.type === f) && i.label.toLowerCase().includes(q)).slice(0, 12);
      sel = Math.max(0, Math.min(sel, res.length - 1));
      list.innerHTML = res.length
        ? `<div class="qs-h">${q ? 'Results' : 'Suggestions'}</div>` + res.map((r, i) => `<div class="qs-item ${i === sel ? 'sel' : ''}" data-i="${i}">${r.html}<span class="qs-label">${esc(r.label)}</span><span class="qs-sub">${esc(r.sub)}</span></div>`).join('')
        : `<div class="qs-empty">Can't seem to find what you're looking for?</div>`;
    };
    const setSel = i => { sel = i; $$('.qs-item', list).forEach((x, j) => x.classList.toggle('sel', j === sel)); $$('.qs-item', list)[sel]?.scrollIntoView({ block: 'nearest' }); };
    inp.addEventListener('input', () => { sel = 0; draw(); });
    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(Math.min(sel + 1, res.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(Math.max(sel - 1, 0)); }
      else if (e.key === 'Enter' && res[sel]) { e.preventDefault(); closeModal(root); res[sel].go(); }
    });
    list.addEventListener('mousemove', e => { const it = e.target.closest('[data-i]'); if (it && +it.dataset.i !== sel) setSel(+it.dataset.i); });
    list.addEventListener('click', e => { const it = e.target.closest('[data-i]'); if (it) { closeModal(root); res[+it.dataset.i].go(); } });
    draw(); inp.focus();
  }, { cls: 'modal-qs' });
}

/* ==========================================================================
   Actions (data-action="...")
   ========================================================================== */
const msgOf = a => findMsg(a.closest('[data-msg]')?.dataset.msg);
const actions = {
  'friends': () => { navReset(); state.dm = null; renderAll(); },
  'close-dm': a => closeDM(a.dataset.id),
  'quick-switch': quickSwitcher,
  'new-dm': a => newDmPopout(a),
  'add-to-dm': a => newDmPopout(a),
  'server-menu': a => { if (!isToggleClose(a)) showMenu(serverMenuItems(currentServer()), { anchor: a, side: 'bottom', align: 'center', gap: 4 }, a, 'wide'); },
  'create-channel': a => createChannelModal(currentServer(), a.dataset.cat),
  'invite': a => { const s = currentServer(); inviteModal(s, findChannel(s, a.closest('.channel')?.dataset.channel)); },
  'edit-channel': a => { const s = currentServer(); editChannelModal(s, findChannel(s, a.closest('.channel')?.dataset.channel) || currentChannel()); },
  'toggle-members': a => { state.showMembers = !state.showMembers; a.classList.toggle('on', state.showMembers); a.dataset.tip = (state.showMembers ? 'Hide' : 'Show') + ' Member List'; hideTip(); renderSidePanel(); },
  'toggle-profile': a => { state.showDmProfile = !state.showDmProfile; a.classList.toggle('on', state.showDmProfile); a.dataset.tip = (state.showDmProfile ? 'Hide' : 'Show') + ' User Profile'; hideTip(); renderSidePanel(); },
  'pins': a => pinsPopout(a),
  'pins-inline': () => pinsPopout($('[data-action="pins"]')),
  'threads': a => threadsPopout(a),
  'notif': a => { if (!isToggleClose(a)) notifMenu(a); },
  'inbox': a => inboxPopout(a),
  'help': () => toast("The help center isn't available in this demo"),
  'call': () => toast(`Calling ${users[state.dm].name}…`),
  'video-call': () => toast(`Video calling ${users[state.dm].name}…`),
  'show-topic': topicModal,
  'attach': a => { if (!isToggleClose(a)) attachMenu(a); },
  'gift': () => toast("Gifting isn't available in this demo"),
  'gif': a => expressionPicker(a, 'gif'),
  'sticker': a => expressionPicker(a, 'sticker'),
  'emoji': a => expressionPicker(a, 'emoji'),
  'quick-react': a => toggleReaction(msgOf(a), a.dataset.emoji),
  'react-picker': a => { const m = msgOf(a); if (m && !isToggleClose(a)) emojiPicker(a, e => toggleReaction(findMsg(m.id), e)); },
  'reply': a => startReply(msgOf(a).id),
  'edit': a => startEdit(msgOf(a).id),
  'msg-more': a => { const m = msgOf(a); if (m && !isToggleClose(a)) showMenu(messageMenu(m, a), { anchor: a, side: 'left', gap: 4 }, a); },
  'cancel-reply': () => { state.replyTo = null; renderReplyBar(); renderMessages(false); },
  'toggle-ping': () => { state.replyPing = !state.replyPing; renderReplyBar(); },
  'cancel-edit': cancelEdit,
  'save-edit': () => saveEdit($('.edit-input')),
  'mute': toggleMute,
  'deafen': toggleDeafen,
  'settings': () => openUserSettings('account'),
  'settings-profile': () => openUserSettings('profiles'),
  'status-menu': a => { if (!isToggleClose(a)) statusMenu(a); },
  'disconnect': () => leaveVoice(),
  'video': () => toast("Camera isn't available in this demo"),
  'screen': () => toast("Screen share isn't available in this demo"),
  'open-dm': a => openDM(a.dataset.id),
  'friend-more': a => { if (!isToggleClose(a)) showMenu(friendMoreItems(a.dataset.id), { anchor: a, side: 'bottom', align: 'right' }, a); },
  'accept': a => acceptFriend(a.dataset.id),
  'decline': a => { const p = pending.find(x => x.id === a.dataset.id); pending = pending.filter(x => x.id !== a.dataset.id); renderAll(); toast(p && p.incoming ? 'Friend request ignored' : 'Friend request cancelled'); },
  'unblock': a => unblockUser(a.dataset.id),
  'block-user': a => blockUser(a.dataset.id),
  'remove-friend': a => removeFriend(a.dataset.id),
  'add-friend-user': a => sendFriendRequest(a.dataset.id),
  'toggle-nav': toggleNav,
  'close-nav': closeNav,
  'close-modal': a => closeModal(a.closest('.modal-root')),
  'close-settings': closeSettings,
  'clear-search': () => { state.search = null; const s = $('#search'); if (s) s.value = ''; renderSidePanel(); },
  'add-server': addServerModal,
  'explore': exploreModal,
  'download': () => toast("You're already using the web app 🙂"),
  'view-image': a => imageModal(a.src),
  'toast': a => toast(a.dataset.msg),
};

/* ==========================================================================
   Global event handlers
   ========================================================================== */
document.addEventListener('click', e => {
  const t = e.target;
  hideTip();
  lastClosedOwner = null;
  if (floating && !floating.el.contains(t)) closeFloating();

  const sw = t.closest('.switch');
  if (sw) {
    sw.classList.toggle('on');
    sw.setAttribute('aria-checked', sw.classList.contains('on'));
    if (sw.dataset.pref) { prefs[sw.dataset.pref] = sw.classList.contains('on'); applyPrefs(); savePrefs(); }
    return;
  }
  const a = t.closest('[data-action]');
  if (a) { const fn = actions[a.dataset.action]; if (fn) { e.preventDefault(); fn(a, e); } return; }

  let el;
  if ((el = t.closest('[data-ftab]'))) { state.friendsTab = el.dataset.ftab; renderMain(); if (state.friendsTab === 'add') $('#afInput')?.focus(); return; }
  if ((el = t.closest('.rail-item[data-home]'))) return goHome();
  if ((el = t.closest('.rail-item[data-server]'))) return goServer(el.dataset.server);
  if ((el = t.closest('.category[data-cat]'))) {
    const k = state.server + ':' + el.dataset.cat;
    state.collapsed.has(k) ? state.collapsed.delete(k) : state.collapsed.add(k);
    return renderSidebar();
  }
  if ((el = t.closest('.channel[data-channel]'))) return goChannel(el.dataset.channel);
  if ((el = t.closest('[data-react]'))) return toggleReaction(msgOf(el), el.dataset.react);
  if ((el = t.closest('[data-jump]'))) return jumpTo(el.dataset.jump);
  if ((el = t.closest('.mention'))) {
    const n = el.textContent.slice(1).toLowerCase();
    const u = Object.values(users).find(x => x.name.toLowerCase() === n) || (n === 'you' ? users.me : null);
    if (u) profilePopout(u.id, el);
    return;
  }
  if ((el = t.closest('[data-profile]'))) return profilePopout(el.dataset.profile, el);
  if ((el = t.closest('[data-dm]'))) return openDM(el.dataset.dm);
});

document.addEventListener('contextmenu', e => {
  const t = e.target;
  if (/INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.closest('a[href]') || t.closest('.settings-root') || t.closest('.modal-root')) return;
  e.preventDefault(); hideTip();
  const pos = { x: e.clientX, y: e.clientY };
  let el;
  if ((el = t.closest('.rail-item[data-server]'))) return showMenu(serverIconMenu(servers.find(s => s.id === el.dataset.server)), pos, el);
  if ((el = t.closest('.rail-item[data-home]'))) return showMenu([{ label: 'Mark All As Read', action: () => { dmList.forEach(id => unread.delete('dm:' + id)); renderRail(); if (state.server === 'home') renderSidebar(); } }], pos, el);
  const s = currentServer();
  if (s && (el = t.closest('.channel[data-channel]'))) return showMenu(channelMenu(s, findChannel(s, el.dataset.channel)), pos, el);
  if (s && (el = t.closest('.category[data-cat]'))) return showMenu(categoryMenu(s, s.categories.find(c => c.id === el.dataset.cat)), pos, el);
  if (s && t.closest('.server-header')) return showMenu(serverMenuItems(s), pos);
  if ((el = t.closest('[data-user],[data-profile]'))) { const id = el.dataset.user || el.dataset.profile; if (users[id]) return showMenu(userMenu(id, el), pos, el); }
  if ((el = t.closest('[data-msg]'))) { const m = findMsg(el.dataset.msg); if (m && !m.system) return showMenu(messageMenu(m, el), pos, el); }
  if (s && t.closest('.channel-list')) return showMenu([
    { label: 'Create Channel', action: () => createChannelModal(s) },
    { label: 'Create Category', action: () => createCategoryModal(s) },
    { label: 'Invite People', accent: true, action: () => inviteModal(s) },
  ], pos);
});

document.addEventListener('keydown', e => {
  const t = e.target;
  if (t.id === 'input') {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); return; }
    if (e.key === 'ArrowUp' && !t.value) {
      const own = [...(messages[currentKey()] || [])].reverse().find(m => m.author === 'me' && m.text && !m.system);
      if (own) { e.preventDefault(); startEdit(own.id); }
      return;
    }
    if (e.key === 'Escape' && state.replyTo && !floating) { state.replyTo = null; renderReplyBar(); renderMessages(false); return; }
  }
  if (t.classList && t.classList.contains('edit-input')) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(t); }
    else if (e.key === 'Escape') cancelEdit();
    return;
  }
  if (t.id === 'search') {
    if (e.key === 'Enter') { state.search = t.value.trim() || null; renderSidePanel(); }
    else if (e.key === 'Escape') { t.value = ''; state.search = null; renderSidePanel(); t.blur(); }
    return;
  }
  if (t.classList && t.classList.contains('pf-msg') && e.key === 'Enter' && t.value.trim()) {
    const uid = t.dataset.user, text = t.value.trim();
    closeFloating(); openDM(uid); sendText(text);
    return;
  }
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); quickSwitcher(); return; }
  if (mod && e.shiftKey && e.key.toLowerCase() === 'm') { e.preventDefault(); toggleMute(); return; }
  if (mod && e.shiftKey && e.key.toLowerCase() === 'd') { e.preventDefault(); toggleDeafen(); return; }
  if (e.key === 'Escape') {
    if (floating) closeFloating();
    else if (modals.length) closeModal();
    else if (settingsRoot) closeSettings();
    else if ($('#app').classList.contains('nav-open')) closeNav();
    return;
  }
  // Start typing anywhere → focus the message box (like the real app)
  if (!mod && !e.altKey && e.key.length === 1 && !/INPUT|TEXTAREA|SELECT/.test(t.tagName) && !t.isContentEditable && !modals.length && !settingsRoot && !floating) {
    $('#input')?.focus();
  }
});

document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'input' || t.classList.contains('edit-input')) autosize(t);
  if (t.id === 'afInput') { $('#afBtn').disabled = !t.value.trim(); $('#afMsg').textContent = ''; $('#addFriendForm').className = 'af-box'; }
  if (t.id === 'friendSearch') { const q = t.value.toLowerCase(); $$('.friend-row').forEach(r => r.hidden = !r.dataset.n.includes(q)); }
});

document.addEventListener('submit', e => {
  e.preventDefault();
  if (e.target.id === 'composer') send();
  if (e.target.id === 'addFriendForm') submitAddFriend();
});

// Drag & drop files onto the chat to "upload" them
let dragDepth = 0;
document.addEventListener('dragenter', e => { if (!$('#chatCol') || !e.dataTransfer?.types.includes('Files')) return; dragDepth++; $('#chatCol').classList.add('dragging'); });
document.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; $('#chatCol')?.classList.remove('dragging'); } });
document.addEventListener('dragover', e => { if ($('#chatCol')) e.preventDefault(); });
document.addEventListener('drop', e => {
  dragDepth = 0; $('#chatCol')?.classList.remove('dragging');
  if (!$('#chatCol') || !e.dataTransfer?.files.length) return;
  e.preventDefault(); uploadFiles([...e.dataTransfer.files]);
});

window.addEventListener('resize', () => { closeFloating(); hideTip(); });
matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', () => { if (prefs.theme === 'sync') applyPrefs(); });

/* ---------- start ---------- */
applyPrefs();
if (prefs.saturation < 100) document.documentElement.style.filter = `saturate(${prefs.saturation}%)`;
markRead();
renderAll();
