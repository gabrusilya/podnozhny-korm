/* ============================================
   Подножный корм — Лендинг (без VPS)
   Меню из JSON, фильтры, лайтбокс
   ============================================ */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // ==========================================
  // Мобильная навигация
  // ==========================================
  const burgerBtn = $('#burgerBtn');
  const mobileNav = $('#mobileNav');

  if (burgerBtn && mobileNav) {
    burgerBtn.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      burgerBtn.setAttribute('aria-expanded', open);
      burgerBtn.classList.toggle('active', open);
    });
    $$('.mobile-nav__link', mobileNav).forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        burgerBtn.setAttribute('aria-expanded', 'false');
        burgerBtn.classList.remove('active');
      });
    });
  }

  // ==========================================
  // Лайтбокс
  // ==========================================
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxCaption = $('#lightboxCaption');

  function openLightbox(img) {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    lightboxCaption.textContent = img.dataset.caption || img.alt || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  $$('.lightbox-img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLightbox(img));
  });

  $$('[data-close-lightbox]').forEach(el => {
    el.addEventListener('click', closeLightbox);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // ==========================================
  // Меню из JSON
  // ==========================================
  let menuData = null;
  let activeCategory = 'all';
  let activeTag = null;

  async function loadMenu() {
    try {
      const res = await fetch('data/menu.json');
      menuData = await res.json();
      renderMenu();
    } catch (err) {
      console.error('Не удалось загрузить меню:', err);
      $('#menuCategories').innerHTML = '<p class="menu-error">Не удалось загрузить меню. Обновите страницу.</p>';
    }
  }

  function getFilteredItems(category, tag) {
    if (!menuData) return [];
    let cats = menuData.categories;
    if (category !== 'all') {
      cats = cats.filter(c => c.id === category);
    }
    const items = [];
    cats.forEach(cat => {
      cat.items.forEach(item => {
        if (tag) {
          const tags = item.tags || [];
          if (!tags.includes(tag)) return;
        }
        items.push({ ...item, category: cat.name, categoryId: cat.id });
      });
    });
    return items;
  }

  function formatPrice(p) {
    if (p == null) return 'по запросу';
    return p.toLocaleString('ru-RU') + ' ₽';
  }

  function renderMenu() {
    const container = $('#menuCategories');
    if (!container) return;

    const items = getFilteredItems(activeCategory, activeTag);

    if (items.length === 0) {
      container.innerHTML = '<p class="menu-empty">По выбранным фильтрам блюд не найдено</p>';
      return;
    }

    // Группируем по категориям
    const groups = {};
    items.forEach(item => {
      if (!groups[item.categoryId]) {
        groups[item.categoryId] = { name: item.category, items: [] };
      }
      groups[item.categoryId].items.push(item);
    });

    let html = '';
    Object.entries(groups).forEach(([catId, group]) => {
      html += `<div class="menu-category" data-cat="${catId}">`;
      html += `<h3 class="menu-category__title">${group.name}</h3>`;
      html += `<div class="menu-category__list">`;

      group.items.forEach(item => {
        const tags = (item.tags || []).map(t => `<span class="menu-tag menu-tag--${t.replace(/\s/g,'-')}">${t}</span>`).join('');
        const extras = item.extras ? `<ul class="menu-extras">${item.extras.map(e => `<li>${e.name} — <strong>${formatPrice(e.price)}</strong></li>`).join('')}</ul>` : '';
        const sizes = item.sizes ? `<span class="menu-sizes">${item.sizes.map(s => `${s.label}: ${formatPrice(s.price)}`).join(' · ')}</span>` : '';

        html += `
          <article class="menu-item">
            <div class="menu-item__header">
              <h4 class="menu-item__name">${item.name}</h4>
              <span class="menu-item__price">${formatPrice(item.price)}</span>
            </div>
            ${item.description ? `<p class="menu-item__desc">${item.description}</p>` : ''}
            ${sizes}
            ${tags ? `<div class="menu-item__tags">${tags}</div>` : ''}
            ${extras}
          </article>`;
      });

      html += `</div></div>`;
    });

    container.innerHTML = html;
  }

  // Фильтры категорий
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => { b.classList.remove('filter-btn--active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('filter-btn--active');
      btn.setAttribute('aria-selected', 'true');
      activeCategory = btn.dataset.category;
      renderMenu();
    });
  });

  // Фильтры dietary
  $$('.dietary-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      if (activeTag === tag) {
        activeTag = null;
        btn.classList.remove('dietary-btn--active');
      } else {
        $$('.dietary-btn').forEach(b => b.classList.remove('dietary-btn--active'));
        activeTag = tag;
        btn.classList.add('dietary-btn--active');
      }
      renderMenu();
    });
  });

  // Инициализация
  document.addEventListener('DOMContentLoaded', loadMenu);

})();
