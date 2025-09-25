// 1. CAROUSEL PRINCIPALE
function initCarousel() {
    const track = document.querySelector('.carousel-track');
    const carouselContainer = document.querySelector('.custom-carousel');

    if (!track || !carouselContainer) return;

    let slides = Array.from(track.children);
    if (slides.length === 0) return; 

    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    slides = Array.from(track.children);

    let currentIndex = 1;
    let slideWidth = slides[0].getBoundingClientRect().width;

    function updateSlidePosition(animated = true) {
        if (!animated) track.classList.add('no-transition');
        else track.classList.remove('no-transition');

        track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;

        if (!animated) void track.offsetWidth; 
        track.classList.remove('no-transition');
    }

    function goToNextSlide() {
        if (currentIndex >= slides.length - 1) return;

        currentIndex++;
        updateSlidePosition();

        if (currentIndex === slides.length - 1) {
            setTimeout(() => {
                track.classList.add('no-transition');
                currentIndex = 1;
                updateSlidePosition(false);
            }, 500);
        }
    }

    function goToPrevSlide() {
        if (currentIndex <= 0) return;

        currentIndex--;
        updateSlidePosition();

        if (currentIndex === 0) {
            setTimeout(() => {
                track.classList.add('no-transition');
                currentIndex = slides.length - 2;
                updateSlidePosition(false);
            }, 500);
        }
    }

    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');

    if (nextBtn) nextBtn.addEventListener('click', goToNextSlide);
    if (prevBtn) prevBtn.addEventListener('click', goToPrevSlide);

    window.addEventListener('resize', () => {
        slideWidth = slides[0].getBoundingClientRect().width;
        updateSlidePosition(false);
    });

    let autoplayInterval = setInterval(goToNextSlide, 9000);

    carouselContainer.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    carouselContainer.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(goToNextSlide, 9000);
    });

    updateSlidePosition(false);
}

fetch('/mclJSON/json/index.json')
.then(response => response.json())
.then(data => {
    const carouselTrack = document.querySelector('.carousel-track');
    if (!carouselTrack) return;

    carouselTrack.innerHTML = "";

    if (!data.carousel || data.carousel.length === 0) {
        carouselTrack.innerHTML = "<p>Nessuna slide disponibile.</p>";
        return;
    }

    data.carousel.forEach(item => {
        const slide = document.createElement('div');
        slide.classList.add('carousel-slide');

        if(item.titolo) {
            const img = document.createElement('img');
            img.src = item.img;
            img.alt = item.titolo;

            const textDiv = document.createElement('div');
            textDiv.classList.add('slide-text');
            textDiv.innerHTML = `<h2>${item.titolo}</h2><p>${item.testo}</p>`;

            if(item.link) {
                textDiv.innerHTML += `<a href="${item.link}">${item.link_testo || ''}</a>`;
            } else if(item.link1 && item.link2) {
                textDiv.innerHTML += `<a href="${item.link1}">${item.link1_text}</a> - <a href="${item.link2}">${item.link2_text}</a>`;
            }

            slide.appendChild(img);
            slide.appendChild(textDiv);
        } else {
            const img = document.createElement('img');
            img.src = item.img;
            img.alt = "Slide";
            slide.appendChild(img);
        }

        carouselTrack.appendChild(slide);
    });

    initCarousel();
})
.catch(err => console.error('Errore nel caricamento del carousel:', err));


// 2. NEWS / NOVITÀ
function popolaNews(containerId, articoli) {
  const newsCarousel = document.getElementById(containerId);
  if(!newsCarousel) return;

  newsCarousel.innerHTML = "";

  if (!articoli || articoli.length === 0) {
    newsCarousel.innerHTML = "<p>Nessuna novità disponibile.</p>";
    return;
  }

  articoli.forEach(item => {
    const slide = document.createElement('div');
    slide.classList.add('news-slide');

    slide.innerHTML = `
      <div class="news-img"><img src="${item.img}" alt="${item.titolo}"></div>
      <div class="news-text"><h2>${item.titolo}</h2><p>${item.testo}</p></div>
    `;

    newsCarousel.appendChild(slide);
  });
}

fetch('/mclJSON/json/index.json')
  .then(response => response.json())
  .then(data => {
    popolaNews('newsCarousel-caf', data["newsCarousel-caf"].articoli);
    popolaNews('newsCarousel-caf-extra', data["newsCarousel-caf-extra"].articoli);
    popolaNews('newsCarousel-patronato', data["newsCarousel-patronato"].articoli);
  })
  .catch(err => console.error("Errore caricamento news:", err));


// 3. SERVIZI
function popolaServizi(containerSelector, servizi) {
  const container = document.querySelector(containerSelector);
  if(!container) return;

  container.innerHTML = "";

  if (!servizi || servizi.length === 0) {
    container.innerHTML = "<p>Nessun servizio disponibile.</p>";
    return;
  }

  servizi.forEach(item => {
    const article = document.createElement('article');
    article.classList.add('service');

    let listaSottotitoli = '';
    if(item.sottotitoli) {
      listaSottotitoli = '<ul>' + item.sottotitoli.map(s => `<li>${s}</li>`).join('') + '</ul>';
    }

    article.innerHTML = `
      <div class="service-img"><img src="${item.img}" alt="${item.titolo}"></div>
      <div class="service-text">
        <h3><a href="${item.link}">${item.titolo}</a></h3>
        ${listaSottotitoli}
        <p><em>${item.testo}</em> <a href="${item.link}">${item.link_text}</a></p>
      </div>
    `;

    container.appendChild(article);
  });
}

fetch('/mclJSON/json/index.json')
  .then(response => response.json())
  .then(data => {
    popolaServizi('#servizi-caf .service-container', data.servizi_caf.servizi);
    popolaServizi('#servizi-patronato .service-container', data.servizi_patronato.servizi);
  })
  .catch(err => console.error("Errore caricamento servizi:", err));


// 4. ASSISTENZA
function popolaAssistenza(containerSelector, servizi) {
  const container = document.querySelector(containerSelector);
  if(!container) return;

  container.innerHTML = "";

  if (!servizi || servizi.length === 0) {
    container.innerHTML = "<p>Nessun servizio di assistenza disponibile.</p>";
    return;
  }

  servizi.forEach(item => {
    const article = document.createElement('article');
    article.classList.add('service');

    let listaSottotitoli = '';
    if(item.sottotitoli) {
      listaSottotitoli = '<ul>' + item.sottotitoli.map(s => `<li>${s}</li>`).join('') + '</ul>';
    }

    article.innerHTML = `
      <div class="service-img"><img src="${item.img}" alt="${item.titolo}"></div>
      <div class="service-text">
        <h3><a href="${item.link}">${item.titolo}</a></h3>
        ${listaSottotitoli}
        <p><em>${item.testo}</em> <a href="${item.link}">${item.link_text}</a></p>
      </div>
    `;

    container.appendChild(article);
  });
}

fetch('/mclJSON/json/index.json')
  .then(response => response.json())
  .then(data => {
    popolaAssistenza('#assistenza-services', data.assistenza.servizi);
  })
  .catch(err => console.error("Errore caricamento assistenza:", err));


// 5. STORIA / COOKIE PRIVACY
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
