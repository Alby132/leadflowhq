/*!
 * LeadFlow HQ clinic chat widget
 * <script src="https://leadflowhq.tech/widget.js" data-key="CLIENT_KEY" data-name="Clinic name" data-lang="en" defer></script>
 * Optional: data-color="#0F6E64" (the clinic's brand colour), data-logo="https://.../icon.png" (square icon or logo)
 */
(function () {
  if (window.__leadflowWidget) return;
  var script = document.currentScript || document.querySelector('script[src*="leadflowhq.tech/widget.js"]');
  if (!script) return;
  var key = (script.getAttribute('data-key') || '').trim();
  if (!key) return;
  window.__leadflowWidget = true;

  var WEBHOOK = 'https://alexcapitalai.app.n8n.cloud/webhook/50be516f-f9e5-41e7-ab6b-d78063311bf8/chat';
  var BASE = 'https://cdn.jsdelivr.net/npm/@n8n/chat@1.41.0/dist/';

  var name = (script.getAttribute('data-name') || '').trim();
  var lang = (script.getAttribute('data-lang') || document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  var brand = /^#[0-9a-f]{6}$/i.test(script.getAttribute('data-color') || '') ? script.getAttribute('data-color') : '#0F6E64';
  var logo = (script.getAttribute('data-logo') || '').trim();
  if (!/^https:\/\/[^\s"'()<>]+$/i.test(logo)) logo = '';

  var TEXT = {
    en: {
      title: name || 'Ask us',
      subtitle: 'Automated assistant. Please do not share medical details here.',
      greeting: 'Hello. I can answer questions about our opening hours, treatments and prices, or pass an appointment request to the team.',
      placeholder: 'Write a message',
      open: 'Open chat'
    },
    hr: {
      title: name || 'Pitajte nas',
      subtitle: 'Automatski asistent. Molimo ne dijelite ovdje zdravstvene podatke.',
      greeting: 'Dobar dan. Mogu odgovoriti na pitanja o radnom vremenu, uslugama i cijenama ili proslijediti zahtjev za termin našem timu.',
      placeholder: 'Napišite poruku',
      open: 'Otvori chat'
    }
  };
  var t = TEXT[lang] || TEXT.en;

  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function luminance(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].reduce(function (sum, v, i) {
      v /= 255; v = v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      return sum + v * [0.2126, 0.7152, 0.0722][i];
    }, 0);
  }
  /* Keep the clinic's hue, but darken it until white text on it is readable (WCAG 4.5:1). */
  var color = brand;
  for (var i = 0; i < 14 && (1.05 / (luminance(color) + 0.05)) < 4.5; i++) color = shade(color, 0.9);
  var dark = shade(color, 0.78);
  var side = 'right';

  var css = '' +
    '.lf-launch{position:fixed;bottom:24px;' + side + ':24px;z-index:2147483000;width:58px;height:58px;border-radius:50%;border:0;cursor:pointer;' +
    'background:' + color + ';color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.18);transition:transform .15s ease,background .15s ease}' +
    '.lf-launch:hover{background:' + dark + ';transform:translateY(-2px)}' +
    '.lf-launch:focus-visible{outline:3px solid ' + color + ';outline-offset:3px}' +
    '.lf-launch[aria-busy="true"]{opacity:.7;cursor:progress}' +
    '.lf-launch svg{width:26px;height:26px}' +
    '@media (max-width:480px){.lf-launch{bottom:16px;' + side + ':16px}}' +
    '#n8n-chat{--chat--font-family:inherit;--chat--color--primary:' + color + ';--chat--color--primary-shade-50:' + dark + ';--chat--color--primary--shade-100:' + dark + ';' +
    '--chat--color--secondary:' + color + ';--chat--color-secondary-shade-50:' + dark + ';--chat--color-white:#fff;--chat--color-light:#F6F8F7;' +
    '--chat--color-light-shade-50:#E8EDEB;--chat--color-light-shade-100:#D9E2DF;--chat--color-medium:#B9C6C2;--chat--color-dark:#16201E;--chat--color-typing:#5B6B67;' +
    '--chat--spacing:14px;--chat--border-radius:14px;--chat--window--width:372px;--chat--window--height:560px;--chat--window--bottom:24px;--chat--window--right:24px;' +
    '--chat--window--border:1px solid #D9E2DF;--chat--window--border-radius:18px;--chat--window--margin-bottom:14px;--chat--header-height:auto;--chat--header--padding:16px 18px;' +
    '--chat--header--background:' + dark + ';--chat--header--color:#fff;--chat--header--border-bottom:none;--chat--heading--font-size:1.05rem;--chat--subtitle--font-size:.8rem;' +
    '--chat--subtitle--line-height:1.4;--chat--body--background:#F6F8F7;--chat--messages-list--padding:16px;--chat--message--font-size:.94rem;--chat--message-line-height:1.45;' +
    '--chat--message--padding:10px 14px;--chat--message--border-radius:14px;--chat--message--margin-bottom:8px;--chat--message--bot--background:#fff;--chat--message--bot--color:#16201E;' +
    '--chat--message--bot--border:1px solid #D9E2DF;--chat--message--user--background:' + color + ';--chat--message--user--color:#fff;--chat--message--user--border:none;' +
    '--chat--input--font-size:.95rem;--chat--input--border:none;--chat--input--border-active:none;--chat--input--background:#fff;--chat--input--text-color:#16201E;' +
    '--chat--input--padding:14px 16px;--chat--input--container--background:#fff;--chat--input--container--border:none;--chat--input--container--border-radius:0;' +
    '--chat--input--send--button--background:transparent;--chat--input--send--button--color:' + color + ';--chat--input--send--button--background-hover:transparent;' +
    '--chat--input--send--button--color-hover:' + dark + ';--chat--textarea--height:52px;--chat--toggle--size:58px;--chat--toggle--background:' + color + ';' +
    '--chat--toggle--hover--background:' + dark + ';--chat--toggle--active--background:' + dark + ';--chat--toggle--color:#fff}' +
    '#n8n-chat .chat-window-wrapper{z-index:2147483000}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* The clinic's own icon in the chat header, only once it has really loaded (a broken image never shows). */
  if (logo) {
    var img = new Image();
    img.onload = function () {
      if (img.naturalWidth < 16) return;
      style.textContent += '#n8n-chat .chat-header{position:relative;padding-left:68px}' +
        '#n8n-chat .chat-header::before{content:"";position:absolute;left:18px;top:50%;width:36px;height:36px;margin-top:-18px;border-radius:10px;' +
        'box-sizing:border-box;padding:5px;background:#fff url("' + logo + '") center/contain no-repeat;background-origin:content-box;box-shadow:0 0 0 1px rgba(255,255,255,.25)}';
    };
    img.src = logo;
  }

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'lf-launch';
  btn.setAttribute('aria-label', t.open);
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';

  var loading = null;
  function prefetch() {
    if (prefetch.done) return;
    prefetch.done = true;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = BASE + 'style.css';
    document.head.appendChild(l);
  }

  function load() {
    if (loading) return loading;
    prefetch();
    loading = import(BASE + 'chat.bundle.es.js').then(function (mod) {
      mod.createChat({
        webhookUrl: WEBHOOK,
        mode: 'window',
        showWelcomeScreen: false,
        loadPreviousSession: false,
        defaultLanguage: 'en',
        initialMessages: [t.greeting],
        metadata: { key: key },
        i18n: { en: { title: t.title, subtitle: t.subtitle, footer: '', getStarted: '', inputPlaceholder: t.placeholder } }
      });
      return new Promise(function (resolve) {
        var tries = 0;
        (function wait() {
          var toggle = document.querySelector('#n8n-chat .chat-window-toggle');
          if (toggle || tries++ > 75) return resolve(toggle);
          setTimeout(wait, 40);
        })();
      });
    });
    return loading;
  }

  function open() {
    btn.setAttribute('aria-busy', 'true');
    load().then(function (toggle) {
      btn.remove();
      if (!toggle) return;
      var win = document.querySelector('#n8n-chat .chat-window');
      if (!(win && win.getBoundingClientRect().width > 50)) toggle.click();
      setTimeout(function () {
        var input = document.querySelector('#n8n-chat textarea');
        if (input) input.focus();
      }, 350);
    }).catch(function () {
      btn.removeAttribute('aria-busy');
      loading = null;
    });
  }

  btn.addEventListener('click', open);
  btn.addEventListener('pointerenter', prefetch, { once: true });
  btn.addEventListener('focus', prefetch, { once: true });
  btn.addEventListener('touchstart', prefetch, { once: true, passive: true });

  function mount() { document.body.appendChild(btn); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
