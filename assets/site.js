(function () {
  var doc = document.documentElement;
  var lang = (doc.lang || 'en').slice(0, 2);

  var TEXT = {
    en: {
      title: 'LeadFlow HQ',
      subtitle: 'The same assistant we set up for clinics',
      greeting: 'Hi. Ask anything about how this works, or say "I\'m a patient" to try it the way your patients would.',
      placeholder: 'Write a message',
      newChat: 'New conversation'
    },
    hr: {
      title: 'LeadFlow HQ',
      subtitle: 'Isti asistent kakav postavljamo ordinacijama',
      greeting: 'Pozdrav. Pitajte bilo što o tome kako ovo radi ili napišite "ja sam pacijent" da isprobate kako bi to izgledalo vašim pacijentima.',
      placeholder: 'Napišite poruku',
      newChat: 'Novi razgovor'
    }
  };
  var t = TEXT[lang] || TEXT.en;

  var CHAT_WEBHOOK_URL = 'https://alexcapitalai.app.n8n.cloud/webhook/eb54350e-b9ca-422f-9117-989fdfa87459/chat';
  var CHAT_BASE = 'https://cdn.jsdelivr.net/npm/@n8n/chat@1.41.0/dist/';

  /* Hero: play the example conversation once */
  doc.classList.add('js');
  var items = [].slice.call(document.querySelectorAll('.desk .anim'));
  var clock = document.getElementById('clock');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    items.forEach(function (el) { el.classList.add('show'); });
    if (clock) clock.textContent = '21:48';
  } else {
    var delays = [150, 650, 750, 600, 450];
    var at = 0;
    items.forEach(function (el, i) {
      at += delays[i] || 600;
      setTimeout(function () {
        el.classList.add('show');
        if (i === 2 && clock) clock.textContent = '21:48';
      }, at);
    });
  }

  /* Booking: load Calendly only when the booking section comes near */
  var cal = document.querySelector('.calendly-inline-widget');
  function loadCalendly() {
    if (loadCalendly.done) return;
    loadCalendly.done = true;
    var s = document.createElement('script');
    s.src = 'https://assets.calendly.com/assets/external/widget.js';
    s.async = true;
    document.body.appendChild(s);
  }
  if (cal) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { loadCalendly(); io.disconnect(); }
      }, { rootMargin: '900px 0px' });
      io.observe(cal);
    } else {
      window.addEventListener('load', loadCalendly);
    }
  }

  /* Chat: load the n8n widget only when someone wants to chat */
  var launcher = document.querySelector('.chat-launch');
  var tryBtn = document.getElementById('tryChat');
  var chatPromise = null;

  function prefetchChat() {
    if (prefetchChat.done) return;
    prefetchChat.done = true;
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = CHAT_BASE + 'style.css';
    document.head.appendChild(css);
    var pre = document.createElement('link');
    pre.rel = 'modulepreload';
    pre.href = CHAT_BASE + 'chat.bundle.es.js';
    document.head.appendChild(pre);
  }

  function loadChat() {
    if (chatPromise) return chatPromise;
    prefetchChat();
    chatPromise = import(CHAT_BASE + 'chat.bundle.es.js').then(function (mod) {
      var i18n = { en: { title: t.title, subtitle: t.subtitle, footer: '', getStarted: t.newChat, inputPlaceholder: t.placeholder } };
      mod.createChat({
        webhookUrl: CHAT_WEBHOOK_URL,
        mode: 'window',
        showWelcomeScreen: false,
        loadPreviousSession: false,
        defaultLanguage: 'en',
        initialMessages: [t.greeting],
        i18n: i18n
      });
      return new Promise(function (resolve) {
        var tries = 0;
        (function wait() {
          var toggle = document.querySelector('#n8n-chat .chat-window-toggle');
          if (toggle || tries++ > 50) return resolve(toggle);
          setTimeout(wait, 40);
        })();
      });
    });
    return chatPromise;
  }

  function openChat() {
    if (launcher) launcher.setAttribute('aria-busy', 'true');
    loadChat().then(function (toggle) {
      if (launcher) launcher.remove();
      launcher = null;
      if (!toggle) return;
      var win = document.querySelector('#n8n-chat .chat-window');
      var isOpen = win && win.getBoundingClientRect().width > 50;
      if (!isOpen) toggle.click();
      setTimeout(function () {
        var input = document.querySelector('#n8n-chat textarea, #n8n-chat input');
        if (input) input.focus();
      }, 350);
    }).catch(function () {
      if (launcher) launcher.removeAttribute('aria-busy');
      chatPromise = null;
    });
  }

  [launcher, tryBtn].forEach(function (el) {
    if (!el) return;
    el.hidden = false;
    el.addEventListener('click', openChat);
    el.addEventListener('pointerenter', prefetchChat, { once: true });
    el.addEventListener('focus', prefetchChat, { once: true });
    el.addEventListener('touchstart', prefetchChat, { once: true, passive: true });
  });
  /* "Send us your website" form */
  var REQUEST_URL = 'https://alexcapitalai.app.n8n.cloud/webhook/leadflow-website-request';
  [].slice.call(document.querySelectorAll('form[data-request]')).forEach(function (form) {
    var msg = form.querySelector('.req-msg');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var website = String(data.get('website') || '').trim();
      var email = String(data.get('email') || '').trim();
      msg.classList.remove('err');
      if (!website || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = msg.getAttribute('data-invalid');
        msg.classList.add('err');
        return;
      }
      btn.disabled = true;
      fetch(REQUEST_URL, { method: 'POST', body: new URLSearchParams(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function () {
          form.classList.add('done');
          msg.textContent = msg.getAttribute('data-ok');
        })
        .catch(function () {
          msg.textContent = msg.getAttribute('data-err');
          msg.classList.add('err');
          btn.disabled = false;
        });
    });
  });
})();
