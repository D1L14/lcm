document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch('/mclJSON/json/servizi.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // --- MENU SERVIZI (unchanged visual titles)
    const menuContainer = document.getElementById('servizi-container');
    if (menuContainer) menuContainer.innerHTML = '';
    const menuServices = data.servizi || [];
    if (menuContainer && Array.isArray(menuServices)) {
      menuServices.forEach(servizio => {
        // titolo (lo vuoi mantenere)
        const h1 = document.createElement('h1');
        h1.textContent = servizio.titolo || '';
        h1.setAttribute('data-editable', `titolo servizio ${String(servizio.titolo || '').toLowerCase()}`);
        menuContainer.appendChild(h1);

        // pulsanti (voci)
        const divButtons = document.createElement('div');
        divButtons.classList.add('hero-buttons');
        (servizio.voci || []).forEach((voce, idx) => {
          const a = document.createElement('a');
          a.href = `#${voce.id || ''}`;
          a.classList.add('btn-hero');
          a.textContent = voce.testo || '';
          a.setAttribute('data-editable', `${idx + 1} voce ${String(servizio.titolo || '').toLowerCase()}`);
          divButtons.appendChild(a);
        });
        menuContainer.appendChild(divButtons);
      });
    }

    // --- HELPERS GENERICI
    const addParagraph = (parent, txt) => {
      if (!txt && txt !== 0) return;
      if (Array.isArray(txt)) {
        txt.forEach(t => addParagraph(parent, t));
        return;
      }
      const p = document.createElement('p');
      p.textContent = String(txt);
      parent.appendChild(p);
    };

    const addList = (parent, arr) => {
      if (!Array.isArray(arr)) return;
      const ul = document.createElement('ul');
      arr.forEach(item => {
        if (item === null || item === undefined) return;
        const s = String(item).trim();
        if (!s) return;
        const li = document.createElement('li');
        li.textContent = s;
        ul.appendChild(li);
      });
      if (ul.childElementCount) parent.appendChild(ul);
    };

    // normalizza chiave per match flessibile (rimuove spazi e minuscola)
    const norm = k => (String(k || '').toLowerCase().replace(/\s+/g, ''));

    // --- RENDER SERVIZIO (tollerante)
    const renderServizio = (servizio, container) => {
      // rimuovo articoli preesistenti con lo stesso id (evita duplicati)
      if (servizio.id) {
        const existingGlobal = document.getElementById(servizio.id);
        if (existingGlobal && container.contains(existingGlobal)) existingGlobal.remove();
      }

      const article = document.createElement('article');
      article.classList.add('service');
      if (servizio.id) article.id = servizio.id;

      const imgDiv = document.createElement('div');
      imgDiv.classList.add('service-img');
      const textDiv = document.createElement('div');
      textDiv.classList.add('service-text');

      // immagine
      if (servizio.img) {
        const img = document.createElement('img');
        img.src = servizio.img;
        img.alt = servizio.alt || '';
        imgDiv.appendChild(img);
      }

      // titolo principale
      if (servizio.titolo) {
        const h2 = document.createElement('h2');
        h2.textContent = servizio.titolo;
        textDiv.appendChild(h2);
      }

      // sottotitolo singolo / multipli
      if (servizio.sottotitolo) {
        const h3 = document.createElement('h3');
        h3.textContent = servizio.sottotitolo;
        textDiv.appendChild(h3);
      }
      if (Array.isArray(servizio.sottotitoli)) {
        servizio.sottotitoli.forEach(s => {
          const tag = (s && s.tipo) || 'h3';
          const el = document.createElement(tag);
          el.textContent = s && s.testo ? s.testo : '';
          textDiv.appendChild(el);
        });
      }

      // --- Scansiono tutte le chiavi del servizio in modo tollerante ---
      Object.keys(servizio).forEach(k => {
        const v = servizio[k];
        const nk = norm(k);

        // paragrafi / descrizioni (paragrafo, paragrafi, paragrafo(2), descrizione...)
        if (nk.startsWith('paragrafo') || nk.startsWith('paragrafi') || nk.startsWith('descrizione') || nk.startsWith('descrizion')) {
          if (Array.isArray(v)) v.forEach(it => addParagraph(textDiv, it));
          else addParagraph(textDiv, v);
          return;
        }

        // elenchi (elenco, elenchi, elenco(2), elenco(3) ...)
        if (nk.startsWith('elenco') || nk.startsWith('elenchi') || nk.startsWith('elenc')) {
          if (Array.isArray(v)) addList(textDiv, v);
          return;
        }

        // titolo elenco (titoloelenco(1), titolo elenco (1), ecc.)
        const match = k.match(/^titolo elenco\s*\(?\s*(\d+)\s*\)?$/i);
        if (match) {
          const idx = match[1];
          const p = document.createElement('p');
          p.classList.add('titolo-elenco');
          p.textContent = Array.isArray(v) ? v.join(' ') : String(v);
          textDiv.appendChild(p);

          const elencoKey = `elenco (${idx})`;
          const altKey = `elenco(${idx})`;
          if (Array.isArray(servizio[elencoKey])) addList(textDiv, servizio[elencoKey]);
          else if (Array.isArray(servizio[altKey])) addList(textDiv, servizio[altKey]);
          return;
        }
      });

      // --- SOTTOSEZIONI (anche con chiavi non standard)
      if (Array.isArray(servizio.sottosezioni)) {
        servizio.sottosezioni.forEach(sub => {
          // titolo sottosezione
          if (sub && (sub.titolo || sub.title)) {
            const h3 = document.createElement('h3');
            h3.textContent = sub.titolo || sub.title || '';
            textDiv.appendChild(h3);
          }

          // scandisco tutte le chiavi della sottosezione in modo tollerante
          if (sub && typeof sub === 'object') {
            Object.keys(sub).forEach(k => {
              const v = sub[k];
              const nk = norm(k);
              if (nk.startsWith('paragrafo') || nk.startsWith('descrizion')) {
                if (Array.isArray(v)) v.forEach(it => addParagraph(textDiv, it));
                else addParagraph(textDiv, v);
                return;
              }
              if (nk.startsWith('elenco') || nk.startsWith('elenchi') || nk.startsWith('elenc')) {
                if (Array.isArray(v)) addList(textDiv, v);
                return;
              }
            });
          }
        });
      }

      article.appendChild(imgDiv);
      article.appendChild(textDiv);
      container.appendChild(article);
    };

    const sectionKeys = ['servizi CAF', 'servizi Patronato', 'servizi Assistenza'];

    sectionKeys.forEach(sectionKey => {
      const sectionData = data[sectionKey];
      if (!sectionData) return;

      const container = document.getElementById(sectionData.id);
      if (!container) return;

      container.innerHTML = '';

      if (!Array.isArray(sectionData.servizi)) return;
      sectionData.servizi.forEach(servizio => renderServizio(servizio, container));
    });

  } catch (err) {
    console.error("Errore caricamento JSON servizi:", err);
  }
});

// 5. STORIA
fetch('/mclJSON/json/index.json')
  .then(response => response.json())
  .then(data => {
    const cookiePrivacy = data.cookie_privacy;
    document.getElementById('footer-title').textContent = cookiePrivacy.titolo;
    document.getElementById('footer-text').textContent = cookiePrivacy.testo;

    const linkElem = document.querySelector('#cookie-privacy a');
    linkElem.href = cookiePrivacy.link_storia.href;
    linkElem.textContent = cookiePrivacy.link_storia.text;
  })
  .catch(err => console.error("Errore caricamento sezione cookie-privacy:", err));
