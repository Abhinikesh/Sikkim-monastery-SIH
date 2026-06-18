

const navbar = document.getElementById("navbar");
const mobileMenu = document.getElementById("mobile-menu");
const navMenu = document.getElementById("nav-menu");
const darkModeToggle = document.getElementById("dark-mode-toggle");

let currentModal = null;

function createModal(content, className = '') {
  const modal = document.createElement('div');
  modal.className = `modal ${className}`;
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <button class="modal-close" aria-label="Close modal">&times;</button>
      ${content}
    </div>
  `;
  return modal;
}

function showModal(modal) {
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  currentModal = modal;

  setTimeout(() => {
    modal.classList.add('active');
  }, 10);
}

function hideModal(modal) {
  modal.classList.remove('active');
  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
    document.body.style.overflow = '';
    currentModal = null;
  }, 300);
}

function initVideos() {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('video');
      if (video) {
        if (entry.isIntersecting) {
          video.play().catch(e => console.log('Video autoplay prevented:', e));
        } else {
          video.pause();
        }
      }
    });
  }, { threshold: 0.5 });

  const monasteryCards = document.querySelectorAll('.monastery-card');
  monasteryCards.forEach(card => {
    videoObserver.observe(card);
  });

  const exploreButtons = document.querySelectorAll('[data-action="explore-360vt"]');
  exploreButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const card = button.closest('.monastery-card');
      const video = card.querySelector('video');
      const title = card.querySelector('.monastery-title').textContent;
      
      if (video) {
        const videoSrc = video.querySelector('source')?.src || video.src;
        const poster = video.poster;
        
        const videoModal = createModal(`
          <div class="video-player">
            <video controls autoplay poster="${poster}">
              <source src="${videoSrc}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
            <h3>${title}</h3>
            <p>Experience the 360° virtual tour of ${title}</p>
          </div>
        `, 'video-modal');
        
        showModal(videoModal);
        
        videoModal.querySelector('.modal-close').addEventListener('click', () => {
          hideModal(videoModal);
        });
        
        videoModal.querySelector('.modal-backdrop').addEventListener('click', () => {
          hideModal(videoModal);
        });
      }
    });
  });
}

function initModals() {
  console.log('Initializing modal system...');

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentModal) {
      hideModal(currentModal);
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop') && currentModal) {
      hideModal(currentModal);
    }
  });
}

function initMap() {
  console.log('Initializing map functionality...');
  
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  if (typeof L === 'undefined') {
    console.warn('Leaflet.js not loaded. Loading from CDN...');
    loadLeaflet();
    return;
  }

  const map = L.map('map').setView([27.3389, 88.6065], 10); 

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const monasteries = [
    {
      name: 'Rumtek Monastery',
      lat: 27.3389,
      lng: 88.6065,
      description: 'The largest monastery in Sikkim, known for its stunning architecture and spiritual significance as the seat of the Karmapa.'
    },
    {
      name: 'Enchey Monastery',
      lat: 27.3331,
      lng: 88.6122,
      description: 'A 200-year-old monastery with beautiful murals and traditional architecture, offering panoramic views of Gangtok.'
    },
    {
      name: 'Pemayangtse Monastery',
      lat: 27.3000,
      lng: 88.2500,
      description: 'One of the oldest monasteries in Sikkim, famous for its intricate wood carvings and ancient Buddhist artifacts.'
    },
    {
      name: 'Tashiding Monastery',
      lat: 27.4000,
      lng: 88.5000,
      description: 'A sacred monastery known for its annual Bumchu festival and the holy water ceremony.'
    },
    {
      name: 'Phodong Monastery',
      lat: 27.3500,
      lng: 88.5500,
      description: 'A beautiful monastery with stunning murals and traditional architecture, offering a peaceful retreat.'
    }
  ];

  monasteries.forEach(monastery => {
    const marker = L.marker([monastery.lat, monastery.lng]).addTo(map);
    
    marker.bindPopup(`
      <div class="map-popup">
        <h3>${monastery.name}</h3>
        <p>${monastery.description}</p>
        <button class="lets-go-btn" data-lat="${monastery.lat}" data-lng="${monastery.lng}">
          Let's go
        </button>
        <div class="transport-options">
          <h4>Local Transport Options</h4>
          <div class="transport-list">
            <div class="transport-item">
              <i class="fas fa-bus"></i>
              <span>Bus</span>
              <span class="transport-details">₹50-100 • 30-45 min</span>
            </div>
            <div class="transport-item">
              <i class="fas fa-taxi"></i>
              <span>Taxi</span>
              <span class="transport-details">₹300-500 • 20-30 min</span>
            </div>
            <div class="transport-item">
              <i class="fas fa-car"></i>
              <span>Shared Cab</span>
              <span class="transport-details">₹150-250 • 25-35 min</span>
            </div>
            <div class="transport-item">
              <i class="fas fa-motorcycle"></i>
              <span>Bike Rental</span>
              <span class="transport-details">₹200-400/day • 15-25 min</span>
            </div>
          </div>
          <button class="book-transport-btn" data-monastery="${monastery.name}">
            Book Transport
          </button>
        </div>
      </div>
    `);
  });

  map.on('popupopen', () => {
    const letsGoBtn = document.querySelector('.lets-go-btn');
    if (letsGoBtn) {
      letsGoBtn.addEventListener('click', () => {
        const lat = letsGoBtn.dataset.lat;
        const lng = letsGoBtn.dataset.lng;
        openGoogleMapsDirections(lat, lng);
      });
    }

    const bookTransportBtn = document.querySelector('.book-transport-btn');
    if (bookTransportBtn) {
      bookTransportBtn.addEventListener('click', () => {
        const monasteryName = bookTransportBtn.dataset.monastery;
        openTransportBooking(monasteryName);
      });
    }
  });
}

function loadLeaflet() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
  
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = () => {
    console.log('Leaflet loaded, initializing map...');
    initMap();
  };
  document.head.appendChild(script);
}

function openGoogleMapsDirections(lat, lng) {
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = `${position.coords.latitude},${position.coords.longitude}`;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${lat},${lng}`;
        window.open(url, '_blank');
      },
      () => {
        
        const url = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${lat},${lng}`;
        window.open(url, '_blank');
      }
    );
  } else {
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${lat},${lng}`;
    window.open(url, '_blank');
  }
}

function openTransportBooking(monasteryName) {
  
  window.location.href = `transport.html?monastery=${encodeURIComponent(monasteryName)}`;
}

function initShop() {
  console.log('Initializing shop functionality...');
  
  const buyButtons = document.querySelectorAll('[data-action="add-to-cart"]');
  buyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const productCard = button.closest('.product-card');
      const productName = productCard.querySelector('.product-name').textContent;
      const productPrice = productCard.querySelector('.product-price').textContent;
      const productDescription = productCard.querySelector('.product-description').textContent;
      
      const shopModal = createModal(`
        <div class="shop-modal">
          <h3>${productName}</h3>
          <p class="product-price">${productPrice}</p>
          <p class="product-description">${productDescription}</p>
          <div class="quantity-selector">
            <label for="quantity">Quantity:</label>
            <select id="quantity">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" onclick="this.closest('.modal').querySelector('.modal-close').click()">
              Continue Shopping
            </button>
            <button class="btn-primary" onclick="proceedToCheckout('${productName}', ${productPrice.replace('₹', '').replace(',', '')})">
              Proceed to Checkout
            </button>
          </div>
        </div>
      `, 'shop-modal');
      
      showModal(shopModal);

      shopModal.querySelector('.modal-close').addEventListener('click', () => {
        hideModal(shopModal);
      });
    });
  });
}

function proceedToCheckout(productName, price) {
  console.log(`Proceeding to checkout for ${productName} at ₹${price}`);
  alert(`Checkout functionality would be implemented here.\n\nProduct: ${productName}\nPrice: ₹${price}`);

  if (currentModal) {
    hideModal(currentModal);
  }
}

function initGallery() {
  console.log('Initializing gallery functionality...');
  
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const isVideo = item.dataset.type === 'video';
      const image = item.querySelector('.gallery-image img');
      const video = item.querySelector('.gallery-video');
      
      if (isVideo && video) {
        
        const videoSrc = video.querySelector('source')?.src || video.src;
        const poster = video.poster;
        
        const videoModal = createModal(`
          <div class="video-player">
            <video controls autoplay poster="${poster}">
              <source src="${videoSrc}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </div>
        `, 'video-modal');
        
        showModal(videoModal);
      } else if (image) {
        
        const imageSrc = image.src;
        const imageAlt = image.alt;
        
        const imageModal = createModal(`
          <div class="image-lightbox">
            <img src="${imageSrc}" alt="${imageAlt}" />
            <p>${imageAlt}</p>
          </div>
        `, 'image-modal');
        
        showModal(imageModal);
      }

      if (currentModal) {
        currentModal.querySelector('.modal-close').addEventListener('click', () => {
          hideModal(currentModal);
        });
      }
    });
  });
}

function initNavbar() {
  console.log('Initializing navbar functionality...');

  if (mobileMenu && navMenu) {
    mobileMenu.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
  }

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu) {
        navMenu.classList.remove('active');
      }
      if (mobileMenu) {
        mobileMenu.classList.remove('active');
      }
    });
  });

  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  });

  navLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }
    });
  });
}

function initCulturalCalendar() {
  console.log('Initializing cultural calendar functionality...');

  const exploreFestivalsBtn = document.querySelector('.explore-festivals-btn');
  if (exploreFestivalsBtn) {
    exploreFestivalsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'festivals.html';
    });
  }

  const filterButtons = document.querySelectorAll('.filter-btn');
  const timelineItems = document.querySelectorAll('.timeline-item');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.dataset.filter;
      
      timelineItems.forEach(item => {
        if (filter === 'all') {
          item.style.display = 'block';
          item.classList.add('animate');
        } else {
          const itemType = item.dataset.type;
          if (itemType === filter) {
            item.style.display = 'block';
            item.classList.add('animate');
          } else {
            item.style.display = 'none';
            item.classList.remove('animate');
          }
        }
      });

      if (exploreFestivalsBtn) {
        if (filter === 'rituals') {
          exploreFestivalsBtn.textContent = 'Explore more rituals and ceremonies';
        } else if (filter === 'festivals') {
          exploreFestivalsBtn.textContent = 'Explore more festivals and events';
        } else {
          exploreFestivalsBtn.textContent = 'Explore more festivals and events';
        }
      }
    });
  });
}

function initPlanYourVisit() {
  console.log('Initializing plan your visit functionality...');

  const planButtons = document.querySelectorAll('.plan-button');
  planButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const href = button.getAttribute('href');
      if (href) {
        window.location.href = href;
      }
    });
  });
}

function initDarkMode() {
  console.log('Initializing dark mode functionality...');
  
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');

      const icon = darkModeToggle.querySelector('i');
      darkModeToggle.style.transform = 'scale(0.8) rotateZ(180deg)';
      
      setTimeout(() => {
        icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        darkModeToggle.style.transform = 'scale(1) rotateZ(0deg)';
      }, 150);

      localStorage.setItem('darkMode', isDarkMode);
    });
  }

  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  if (savedDarkMode) {
    document.body.classList.add('dark-mode');
    if (darkModeToggle) {
      darkModeToggle.querySelector('i').className = 'fas fa-sun';
    }
  }
}

function initAnimations() {
  console.log('Initializing animation system...');

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');

        if (entry.target.classList.contains('timeline-item')) {
          
          const items = entry.target.parentElement.querySelectorAll('.timeline-item');
          items.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('animate');
            }, index * 200);
          });
        }
        
        if (entry.target.tagName === 'SECTION') {
          
          const cards = entry.target.querySelectorAll('.monastery-card, .info-card, .gallery-item, .product-card, .festival-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.style.animationDelay = `${index * 0.1}s`;
              card.classList.add('animate');
            }, index * 100);
          });
        }
      }
    });
  }, observerOptions);

  const sections = document.querySelectorAll('section');
  sections.forEach((section) => observer.observe(section));
  
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach((item) => observer.observe(item));
}

function initParallax() {
  console.log('Initializing parallax effects...');

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxImage = document.querySelector('.parallax-image');
    if (parallaxImage) {
      const speed = scrolled * 0.5;
      parallaxImage.style.transform = `translateY(${speed}px)`;
    }

    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scrolled < window.innerHeight) {
      const heroSpeed = scrolled * 0.3;
      heroContent.style.transform = `translateY(${heroSpeed}px)`;
    }
  });

  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroTitle && window.scrollY < window.innerHeight) {
      const moveX = (mouseX - 0.5) * 20;
      const moveY = (mouseY - 0.5) * 20;
      heroTitle.style.transform = `translate(${moveX}px, ${moveY}px)`;
      if (heroSubtitle) {
        heroSubtitle.style.transform = `translate(${-moveX * 0.5}px, ${-moveY * 0.5}px)`;
      }
    }
  });
}

function initHeroCTA() {
  console.log('Initializing hero CTA functionality...');
  
  const ctaButton = document.querySelector('.cta-button');
  if (ctaButton) {
    ctaButton.addEventListener('click', () => {
      ctaButton.style.transform = 'scale(0.95)';
      setTimeout(() => {
        ctaButton.style.transform = 'scale(1)';
        const featuredSection = document.querySelector('#featured-monasteries');
        if (featuredSection) {
          featuredSection.scrollIntoView({
            behavior: 'smooth',
          });
        }
      }, 150);
    });
  }
}

const searchData = {
  monasteries: [
    {
      id: 'rumtek',
      title: 'Rumtek Monastery',
      description: 'The largest monastery in Sikkim, known for its stunning architecture and spiritual significance as the seat of the Karmapa.',
      category: 'Monastery',
      icon: 'fas fa-place-of-worship',
      url: '#featured-monasteries'
    },
    {
      id: 'enchey',
      title: 'Enchey Monastery',
      description: 'A 200-year-old monastery with beautiful murals and traditional architecture, offering panoramic views of Gangtok.',
      category: 'Monastery',
      icon: 'fas fa-place-of-worship',
      url: '#featured-monasteries'
    },
    {
      id: 'pemayangtse',
      title: 'Pemayangtse Monastery',
      description: 'One of the oldest monasteries in Sikkim, famous for its intricate wood carvings and ancient Buddhist artifacts.',
      category: 'Monastery',
      icon: 'fas fa-place-of-worship',
      url: '#featured-monasteries'
    },
    {
      id: 'tashiding',
      title: 'Tashiding Monastery',
      description: 'A sacred monastery known for its annual Bumchu festival and the holy water ceremony.',
      category: 'Monastery',
      icon: 'fas fa-place-of-worship',
      url: '#featured-monasteries'
    },
    {
      id: 'phodong',
      title: 'Phodong Monastery',
      description: 'A beautiful monastery with stunning murals and traditional architecture, offering a peaceful retreat.',
      category: 'Monastery',
      icon: 'fas fa-place-of-worship',
      url: '#featured-monasteries'
    }
  ],
  festivals: [
    {
      id: 'losar',
      title: 'Losar Festival',
      description: 'Tibetan New Year celebration with traditional dances, butter sculptures, and monastery ceremonies.',
      category: 'Festival',
      icon: 'fas fa-calendar-alt',
      url: '#cultural-calendar'
    },
    {
      id: 'buddha-purnima',
      title: 'Buddha Purnima',
      description: 'Celebrating the birth of Buddha with spiritual gatherings, rituals, and prayers at all major monasteries.',
      category: 'Festival',
      icon: 'fas fa-calendar-alt',
      url: '#cultural-calendar'
    },
    {
      id: 'durga-puja',
      title: 'Durga Puja',
      description: 'Major Hindu festival marking victory of good over evil with worship ceremonies and family gatherings.',
      category: 'Festival',
      icon: 'fas fa-calendar-alt',
      url: '#cultural-calendar'
    },
    {
      id: 'cherry-tea-festival',
      title: 'Cherry Tea Festival',
      description: 'Celebrates the local cherry and tea culture with brewing, tasting, and fairs promoting local produce.',
      category: 'Festival',
      icon: 'fas fa-calendar-alt',
      url: '#cultural-calendar'
    }
  ],
  archives: [
    {
      id: 'buddhist-manuscript',
      title: 'Ancient Buddhist Manuscript',
      description: 'Sacred Buddhist texts written in traditional Tibetan script, dating back to the 17th century.',
      category: 'Archive',
      icon: 'fas fa-scroll',
      url: 'archives.html'
    },
    {
      id: 'thangka-manuscript',
      title: 'Buddhist Thangka Manuscript',
      description: 'Illustrated manuscript depicting Buddhist deities and teachings, created in the 19th century.',
      category: 'Archive',
      icon: 'fas fa-scroll',
      url: 'archives.html'
    },
    {
      id: 'mural-art',
      title: 'Traditional Mural Art',
      description: 'Intricate wall paintings depicting Buddhist cosmology and local folklore from ancient times.',
      category: 'Archive',
      icon: 'fas fa-palette',
      url: 'archives.html'
    },
    {
      id: 'foundation-document',
      title: 'Monastery Foundation Document',
      description: 'Official document establishing the monastery\'s foundation and land grants from the 19th century.',
      category: 'Archive',
      icon: 'fas fa-file-alt',
      url: 'archives.html'
    }
  ],
  products: [
    {
      id: 'prayer-wheel',
      title: 'Traditional Prayer Wheel',
      description: 'Handcrafted copper prayer wheel with intricate engravings and traditional mantras.',
      category: 'Product',
      icon: 'fas fa-shopping-cart',
      url: '#shop'
    },
    {
      id: 'thangka-painting',
      title: 'Thangka Painting',
      description: 'Authentic Buddhist thangka painting depicting traditional deities and spiritual scenes.',
      category: 'Product',
      icon: 'fas fa-shopping-cart',
      url: '#shop'
    },
    {
      id: 'singing-bowl',
      title: 'Tibetan Singing Bowl',
      description: 'Hand-hammered brass singing bowl for meditation and spiritual practice.',
      category: 'Product',
      icon: 'fas fa-shopping-cart',
      url: '#shop'
    },
    {
      id: 'prayer-flags',
      title: 'Prayer Flags Set',
      description: 'Colorful prayer flags with traditional mantras and blessings for your home.',
      category: 'Product',
      icon: 'fas fa-shopping-cart',
      url: '#shop'
    }
  ]
};

function initGlobalSearch() {
  console.log('Initializing global search functionality...');
  
  const searchInput = document.getElementById('global-search');
  const suggestionsContainer = document.getElementById('search-suggestions');
  
  if (!searchInput || !suggestionsContainer) return;
  
  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
      suggestionsContainer.classList.remove('show');
      return;
    }
    
    searchTimeout = setTimeout(() => {
      performSearch(query, suggestionsContainer);
    }, 300);
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length >= 2) {
      suggestionsContainer.classList.add('show');
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.classList.remove('show');
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        redirectToSearchPage(query);
      }
    } else if (e.key === 'Escape') {
      suggestionsContainer.classList.remove('show');
    }
  });
}

function performSearch(query, container) {
  const results = searchAllData(query);
  displaySuggestions(results, container);
}

function searchAllData(query) {
  const allData = [
    ...searchData.monasteries,
    ...searchData.festivals,
    ...searchData.archives,
    ...searchData.products
  ];
  
  const lowerQuery = query.toLowerCase();
  
  return allData.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery) ||
    item.category.toLowerCase().includes(lowerQuery)
  ).slice(0, 8); 
}

function displaySuggestions(results, container) {
  if (results.length === 0) {
    container.innerHTML = '<div class="suggestion-item"><p>No results found</p></div>';
  } else {
    container.innerHTML = results.map(item => `
      <div class="suggestion-item" data-url="${item.url}">
        <i class="suggestion-icon ${item.icon}"></i>
        <div class="suggestion-content">
          <h4>${item.title}</h4>
          <p>${item.description}</p>
        </div>
        <span class="suggestion-category">${item.category}</span>
      </div>
    `).join('');

    container.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        if (url.startsWith('#')) {
          
          const target = document.querySelector(url);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          
          window.location.href = url;
        }
        container.classList.remove('show');
      });
    });
  }
  
  container.classList.add('show');
}

function redirectToSearchPage(query) {
  window.location.href = `search.html?q=${encodeURIComponent(query)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Monastery360 — Sikkim: Initializing application...');

  initModals();
  initVideos();
  initMap();
  initShop();
  initGallery();
  initNavbar();
  initCulturalCalendar();
  initPlanYourVisit();
  initDarkMode();
  initAnimations();
  initParallax();
  initHeroCTA();
  initGlobalSearch();

  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
  
  console.log('Monastery360 — Sikkim: Application initialized successfully!');
});

const modalStyles = `
<style>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.modal.active {
  opacity: 1;
  visibility: visible;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 15px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.modal.active .modal-content {
  transform: scale(1);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  z-index: 1;
}

.modal-close:hover {
  color: #000;
}

.video-player {
  padding: 2rem;
  text-align: center;
}

.video-player video {
  width: 100%;
  max-width: 800px;
  height: auto;
  border-radius: 10px;
}

.video-player h3 {
  margin: 1rem 0 0.5rem;
  color: #333;
}

.video-player p {
  color: #666;
  margin-bottom: 0;
}

.image-lightbox {
  padding: 2rem;
  text-align: center;
}

.image-lightbox img {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 10px;
}

.image-lightbox p {
  margin: 1rem 0 0;
  color: #666;
}

.shop-modal {
  padding: 2rem;
  max-width: 500px;
}

.shop-modal h3 {
  margin-bottom: 1rem;
  color: #333;
}

.shop-modal .product-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.quantity-selector {
  margin: 1.5rem 0;
}

.quantity-selector label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.quantity-selector select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--secondary-color);
  transform: translateY(-2px);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.map-popup .lets-go-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.map-popup .lets-go-btn:hover {
  background: var(--secondary-color);
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', modalStyles);