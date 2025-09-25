// 0. PRELOADER
    window.addEventListener("load", () => {
        const preloader = document.getElementById("preloader");
        if (preloader) {
        preloader.style.opacity = "0";
        preloader.style.transition = "opacity 1s ease";

        setTimeout(() => {
            preloader.style.display = "none";
        }, 3000);
        }
    });
    
// 1. CARICAMENTO LOGO E MENU
fetch('/mclJSON/json/common.json')
.then(response => response.json())
.then(data => {
    const siteTitle = document.getElementById('site-title');
    if (siteTitle) {
        const logo = document.createElement('img');
        logo.src = data.meta.og_image;
        logo.alt = data.meta.titolo;
        logo.classList.add('logo');
        
        const text = document.createElement('span');
        text.textContent = data.menu.titolo_pagina;
        text.classList.add('title-text');
        
        siteTitle.appendChild(logo);
        siteTitle.appendChild(text);
    }
    
    const menuContainer = document.querySelector('#menu');
    if (menuContainer && data.menu && data.menu.voci) {
        const currentPage = getCurrentPageName();
        
        data.menu.voci.forEach((voce, index) => {
            if (shouldHideMenuItem(voce, currentPage)) {
                return;
            }
            
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = voce.link || '#';
            a.textContent = voce.label;
            li.appendChild(a);

            if (voce.sottomenu && voce.sottomenu.length > 0) {
                li.dataset.submenu = JSON.stringify(voce.sottomenu);

                if (window.innerWidth <= 768) {
                    const subUl = document.createElement('ul');
                    subUl.classList.add('submenu');
                    voce.sottomenu.forEach(subVoce => {
                        const subLi = document.createElement('li');
                        const subA = document.createElement('a');
                        subA.href = subVoce.link || '#';
                        subA.textContent = subVoce.label;
                        subLi.appendChild(subA);
                        subUl.appendChild(subLi);
                    });
                    li.appendChild(subUl);
                    li.classList.add('has-submenu');
                }
            }

            if (index >= 4) {
                li.classList.add('hide-on-desktop');
            }

            menuContainer.appendChild(li);
        });

        if (currentPage !== 'index') {
            const homeLi = document.createElement('li');
            const homeA = document.createElement('a');
            homeA.href = 'index.html';
            homeA.textContent = 'Homepage';
            homeLi.appendChild(homeA);
            menuContainer.insertBefore(homeLi, menuContainer.firstChild);
        }

        setTimeout(() => {
            initializeMenuControls();
        }, 100);
    }
})
.catch(err => console.error("Errore caricamento menu e logo:", err));

function getCurrentPageName() {
    const path = window.location.pathname;
    const fileName = path.split('/').pop();
    
    if (!fileName || fileName === '' || fileName === 'index.html') {
        return 'index';
    }
    
    return fileName.replace('.html', '');
}

function shouldHideMenuItem(voce, currentPage) {
    const link = voce.link || '';
    
    if (!link || link.startsWith('#')) {
        return false;
    }
    
    const linkFileName = link.split('/').pop().replace('.html', '');
    
    return linkFileName === currentPage;
}

// 2. INIZIALIZZAZIONE CONTROLLI MENU
function initializeMenuControls() {
    setupMobileMenu();
    setupSubmenuToggles();
    handleWindowResize();
}

// 3. SETUP MENU MOBILE
function setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('#main-nav');
    
    if (menuToggle && nav) {
        menuToggle.replaceWith(menuToggle.cloneNode(true));
        const newMenuToggle = document.querySelector('.mobile-menu-toggle');
        
        newMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            nav.classList.toggle('active');

            if (!nav.classList.contains('active')) {
                const openSubmenus = nav.querySelectorAll('li.has-submenu.open');
                openSubmenus.forEach(item => item.classList.remove('open'));
            }
        });
        
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !newMenuToggle.contains(e.target)) {
                nav.classList.remove('active');
                const openSubmenus = nav.querySelectorAll('li.has-submenu.open');
                openSubmenus.forEach(item => item.classList.remove('open'));
            }
        });
    }
}

// 4. SETUP TOGGLE SOTTOMENU (cliccando sul link principale)
function setupSubmenuToggles() {
    const submenuParents = document.querySelectorAll('#main-nav li.has-submenu');
    
    submenuParents.forEach(parent => {
        const link = parent.querySelector('a');
        if (link) {
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault(); // evita che navighi subito
                    parent.classList.toggle('open');
                }
            });
        }
    });
}

// 5. GESTIONE RESIZE FINESTRA
function handleWindowResize() {
    window.addEventListener('resize', debounce(function() {
        const nav = document.querySelector('#main-nav');
        
        if (window.innerWidth > 768) {
            if (nav) nav.classList.remove('active');

            // Su desktop, ricrea i submenu per hover
            nav.querySelectorAll('li[data-submenu]').forEach(li => {
                // Rimuovi submenu esistente
                const existingSubmenu = li.querySelector('.submenu');
                if (existingSubmenu) existingSubmenu.remove();
                
                // Ricrea submenu per desktop
                const subData = JSON.parse(li.dataset.submenu);
                const subUl = document.createElement('ul');
                subUl.classList.add('submenu');
                subData.forEach(subVoce => {
                    const subLi = document.createElement('li');
                    const subA = document.createElement('a');
                    subA.href = subVoce.link || '#';
                    subA.textContent = subVoce.label;
                    subLi.appendChild(subA);
                    subUl.appendChild(subLi);
                });
                li.appendChild(subUl);
                li.classList.add('has-submenu');
            });

            const openSubmenus = document.querySelectorAll('#main-nav li.has-submenu.open');
            openSubmenus.forEach(item => item.classList.remove('open'));
        } else {
            // Ricrea submenu se non esistono (solo per mobile)
            nav.querySelectorAll('li[data-submenu]').forEach(li => {
                if (!li.querySelector('.submenu')) {
                    const subData = JSON.parse(li.dataset.submenu);
                    const subUl = document.createElement('ul');
                    subUl.classList.add('submenu');
                    subData.forEach(subVoce => {
                        const subLi = document.createElement('li');
                        const subA = document.createElement('a');
                        subA.href = subVoce.link || '#';
                        subA.textContent = subVoce.label;
                        subLi.appendChild(subA);
                        subUl.appendChild(subLi);
                    });
                    li.appendChild(subUl);
                    li.classList.add('has-submenu');
                }
            });
            setupSubmenuToggles();
        }
    }, 250));
}

// 6. UTILITY DEBOUNCE
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 7. INIZIALIZZAZIONE AL CARICAMENTO DOM
document.addEventListener('DOMContentLoaded', function() {
    const existingMenu = document.querySelector('#main-nav li');
    if (existingMenu) initializeMenuControls();
});


// 8. INIZIALIZZAZIONE AL CARICAMENTO DOM
document.addEventListener('DOMContentLoaded', function() {
    const existingMenu = document.querySelector('#main-nav li');
    if (existingMenu) initializeMenuControls();
});


// 9. MAPPA
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('mappa')) {
    const mappa = L.map('mappa', { zoomControl: false }).setView([44.41, 8.94], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mappa);

    const markers = [];

    fetch('json/common.json')
      .then(response => response.json())
      .then(data => {
        const sedi = data.mappa.sedi;

        sedi.forEach((sede, index) => {
          const popupContent = `
            <div class="sede-popup">
              <strong>${sede.nome}</strong><br>
              <span class="popup-indirizzo">${sede.indirizzo}</span><br>
              <div class="popup-contatti">
                <span><i class="fas fa-phone"></i> ${sede.telefono}</span><br>
                <span><i class="fas fa-envelope"></i> <a href="mailto:${sede.email}">${sede.email}</a></span><br>
                <span><i class="fas fa-clock"></i> ${sede.orari}</span>
              </div>
            </div>
          `;

          const marker = L.marker([sede.lat, sede.lng])
            .addTo(mappa)
            .bindPopup(popupContent);
          markers.push(marker);

          const listItem = document.createElement('li');
          listItem.innerHTML = `
            <div class="sede-header">
              <strong>${sede.nome}</strong><br>
              <span class="indirizzo">${sede.indirizzo}</span>
            </div>
            <div class="sede-dettagli" style="display: none;">
              <div class="contatti-info">
                <p><i class="fas fa-phone"></i> <a href="tel:${sede.telefono}">${sede.telefono}</a></p>
                <p><i class="fas fa-envelope"></i> <a href="mailto:${sede.email}">${sede.email}</a></p>
                <p><i class="fas fa-clock"></i> ${sede.orari}</p>
              </div>
            </div>
            <button class="toggle-dettagli">Mostra dettagli</button>
          `;

          const toggleBtn = listItem.querySelector('.toggle-dettagli');
          toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const dettagli = listItem.querySelector('.sede-dettagli');
            const isHidden = dettagli.style.display === 'none';
            dettagli.style.display = isHidden ? 'block' : 'none';
            this.textContent = isHidden ? 'Nascondi dettagli' : 'Mostra dettagli';
          });

          listItem.addEventListener('click', () => {
            mappa.setView([sede.lat, sede.lng], 15);
            marker.openPopup();

            document.querySelectorAll('#sedi-list li').forEach(item => {
              item.classList.remove('active');
            });
            listItem.classList.add('active');
          });

          document.getElementById('sedi-list').appendChild(listItem);
        });
      })
      .catch(err => console.error("Errore caricamento sedi:", err));

    window.filtraSedi = function() {
      const input = document.getElementById('search');
      const filter = input.value.toUpperCase();
      const ul = document.getElementById('sedi-list');
      const li = ul.getElementsByTagName('li');

      for (let i = 0; i < li.length; i++) {
        const nome = li[i].querySelector('strong').textContent || '';
        const indirizzo = li[i].querySelector('.indirizzo').textContent || '';
        const dettagli = li[i].querySelector('.sede-dettagli').textContent || '';

        if (nome.toUpperCase().indexOf(filter) > -1 ||
            indirizzo.toUpperCase().indexOf(filter) > -1 ||
            dettagli.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
        } else {
          li[i].style.display = "none";
        }
      }
    };

    document.getElementById('zoom-in').addEventListener('click', () => {
      mappa.zoomIn();
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
      mappa.zoomOut();
    });
  }
});

// 10. FOOTER
fetch('json/common.json')
  .then(response => response.json())
  .then(data => {

    const navFooter = document.getElementById('footer-links');
    data.footer.links.forEach(link => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.label;
      li.appendChild(a);
      navFooter.appendChild(li);
    });

    const logosSection = document.getElementById('logos');
    data.footer.logos.forEach(img => {
      const logo = document.createElement('img');
      logo.src = img;
      logosSection.appendChild(logo);
    });

    document.getElementById('footer-copyright').textContent = data.footer.copyright;
  })
  .catch(err => console.error("Errore caricamento footer:", err));

// 11. SCROLLTOTOP
document.addEventListener('DOMContentLoaded', function() {
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  const secondSection = document.querySelectorAll('section')[0];
  if (scrollToTopBtn && secondSection) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > secondSection.offsetTop) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    });
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});