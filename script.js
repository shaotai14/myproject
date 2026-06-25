(function () {
  'use strict';

  // ========== DOM 引用 ==========
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const menuToggle = document.getElementById('menuToggle');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryGrid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const contactForm = document.getElementById('contactForm');
  const allNavLinks = document.querySelectorAll('.nav-links a');

  let currentLightboxIndex = -1;
  let filteredItems = [];

  // ========== 导航栏滚动效果 ==========
  function updateNavbar() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // ========== 活跃导航高亮 ==========
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 100;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        allNavLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // ========== 移动端菜单 ==========
  menuToggle.addEventListener('click', function () {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // 点击导航链接关闭菜单
  allNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // 点击页面其他区域关闭菜单
  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
    }
  });

  // ========== 画廊筛选 ==========
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { return b.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.getAttribute('data-filter');

      galleryItems.forEach(function (item) {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = '';
          // 触发重排后恢复透明度
          requestAnimationFrame(function () {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          });
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          // 等过渡结束后隐藏
          setTimeout(function () {
            if (item.style.opacity === '0') {
              item.style.display = 'none';
            }
          }, 350);
        }
      });
    });
  });

  // ========== 灯箱 ==========
  galleryGrid.addEventListener('click', function (e) {
    var item = e.target.closest('.gallery-item');
    if (!item) return;

    // 只收集当前可见的图片
    filteredItems = Array.from(galleryItems).filter(function (it) {
      return it.style.display !== 'none';
    });

    currentLightboxIndex = filteredItems.indexOf(item);
    openLightbox(currentLightboxIndex);
  });

  function openLightbox(index) {
    if (index < 0 || index >= filteredItems.length) return;
    currentLightboxIndex = index;

    var item = filteredItems[index];
    var img = item.querySelector('img');
    var title = item.querySelector('h3');
    var desc = item.querySelector('p');

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = title
      ? title.textContent + (desc ? ' — ' + desc.textContent : '')
      : '';

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    updateNavButtons();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    currentLightboxIndex = -1;
  }

  function showPrev() {
    if (filteredItems.length === 0) return;
    var newIndex = (currentLightboxIndex - 1 + filteredItems.length) % filteredItems.length;
    openLightbox(newIndex);
  }

  function showNext() {
    if (filteredItems.length === 0) return;
    var newIndex = (currentLightboxIndex + 1) % filteredItems.length;
    openLightbox(newIndex);
  }

  function updateNavButtons() {
    lightboxPrev.style.display = filteredItems.length > 1 ? '' : 'none';
    lightboxNext.style.display = filteredItems.length > 1 ? '' : 'none';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  // 点击背景关闭
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  // 键盘导航
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // 触摸滑动
  var touchStartX = 0;
  var touchEndX = 0;

  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    var diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) showNext();
      else showPrev();
    }
  });

  // ========== 表单提交 ==========
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = document.getElementById('name').value.trim();
    var email = document.getElementById('email').value.trim();
    var subject = document.getElementById('subject').value;
    var message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      showToast('请填写所有必填字段');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('请输入有效的邮箱地址');
      return;
    }

    // 禁用提交按钮防止重复提交
    var submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '发送中...';

    // 提交到后端 API
    fetch('api/submit.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'name=' + encodeURIComponent(name)
        + '&email=' + encodeURIComponent(email)
        + '&subject=' + encodeURIComponent(subject)
        + '&message=' + encodeURIComponent(message)
    })
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.success) {
        showToast(data.message || '消息已发送，感谢你的联系！');
        contactForm.reset();
      } else {
        showToast(data.message || '提交失败，请重试');
      }
    })
    .catch(function () {
      showToast('网络错误，请稍后重试');
    })
    .finally(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = '发送消息';
    });
  });

  // ========== Toast 通知 ==========
  function showToast(msg) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('show');
    });

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { return toast.remove(); }, 400);
    }, 2800);
  }

  // ========== 滚动渐入动画 ==========
  var fadeEls = document.querySelectorAll(
    '.about-content, .about-image, .contact-item, .contact-form, .gallery-item'
  );

  fadeEls.forEach(function (el) {
    el.classList.add('fade-in');
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  fadeEls.forEach(function (el) {
    observer.observe(el);
  });
})();
