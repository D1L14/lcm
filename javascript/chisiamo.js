// 1. STORIA 1 e 2
fetch('/mclJSON/json/chisiamo.json')
  .then(response => response.json())
  .then(data => {
    if(document.getElementById('footer-title')) {
      document.getElementById('footer-title').textContent = data.cookie_privacy.titolo || '';
    }
    if(document.getElementById('footer-text-first')) {
      document.getElementById('footer-text-first').innerHTML = data.cookie_privacy.testo || '';
    }
    if(document.getElementById('footer-text-second')) {
      document.getElementById('footer-text-second').innerHTML = data.cookie_privacy_second.testo || '';
    }
  })
  .catch(err => console.error("Errore caricamento sezione cookie-privacy:", err));

// 2. CAROSELLO STORIA
fetch('/mclJSON/json/chisiamo.json')
  .then(response => response.json())
  .then(data => {
    const track = document.querySelector('.carousel-track');
    if (!track) return;

    data.carousel_storia.forEach((slideData, idx) => {
      const slide = document.createElement('div');
      slide.classList.add('carousel-slide', 'slide-with-text');

      const img = document.createElement('img');
      img.src = slideData.img;
      img.alt = slideData.alt;

      const textDiv = document.createElement('div');
      textDiv.classList.add('slide-text');
      textDiv.innerHTML = `<h2 data-editable="testo slide ${idx + 1} storia">${slideData.testo}</h2>`;

      slide.appendChild(img);
      slide.appendChild(textDiv);
      track.appendChild(slide);
    });

    let currentIndex = 0;
    const slides = track.querySelectorAll('.carousel-slide');
    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.style.display = i === index ? 'block' : 'none';
      });
    }
    showSlide(currentIndex);
    document.querySelector('.carousel-btn.prev').addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    });
    document.querySelector('.carousel-btn.next').addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    });
    setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }, 7000);
  })
  .catch(err => console.error("Errore caricamento carousel storia:", err));