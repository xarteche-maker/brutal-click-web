// BRUTAL.CLICK — comportamiento compartido
document.addEventListener('DOMContentLoaded', () => {
  // menú móvil
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav.main');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.getAttribute('data-open') === 'true') {
        nav.setAttribute('data-open', 'false');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // duplica el contenido del ticker para que el bucle sea continuo
  document.querySelectorAll('.ticker__track').forEach(track => {
    track.innerHTML += track.innerHTML;
  });

  // año en el footer
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // feedback de envío para cualquier formulario gestionado por Netlify Forms
  document.querySelectorAll('form[data-netlify="true"]').forEach(form => {
    form.addEventListener('submit', () => {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.textContent = 'Enviando…';
    });
  });

  // vídeo del hero: no se reproduce solo, avanza con el scroll del propio
  // hero (no de toda la página) y con interpolación suave, sin saltos.
  // Al salir el hero de pantalla, el propio scroll lo tapa de forma natural.
  const heroMedia = document.querySelector('.hero__media video');
  const heroSection = document.querySelector('#main.hero');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroMedia && heroSection && !reduceMotion) {
    let ready = false;
    let targetTime = 0;
    let displayedTime = 0;
    let rafRunning = false;

    heroMedia.addEventListener('loadedmetadata', () => {
      ready = true;
      // algunos navegadores no pintan ningún fotograma hasta que el vídeo
      // se ha reproducido al menos una vez; lo arrancamos y pausamos al instante
      const p = heroMedia.play();
      if (p && p.then) p.then(() => heroMedia.pause()).catch(() => {});
    });
    if (heroMedia.readyState >= 1) ready = true;

    const MAX_FRACTION = 0.92; // margen de seguridad para no tocar el fotograma final exacto

    const computeTarget = () => {
      if (!ready || !heroMedia.duration) return;
      const rect = heroSection.getBoundingClientRect();
      // progreso 0→1 a medida que el hero recorre la pantalla, hasta salir por arriba
      const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
      targetTime = progress * heroMedia.duration * MAX_FRACTION;
    };

    const tick = () => {
      // interpolación: el vídeo persigue el objetivo suavemente en vez de saltar
      displayedTime += (targetTime - displayedTime) * 0.12;
      if (Math.abs(targetTime - displayedTime) > 0.01) {
        try { heroMedia.currentTime = displayedTime; } catch (e) { /* aún no listo */ }
        window.requestAnimationFrame(tick);
      } else {
        rafRunning = false;
      }
    };

    const onScroll = () => {
      computeTarget();
      if (!rafRunning) {
        rafRunning = true;
        window.requestAnimationFrame(tick);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    computeTarget();
    onScroll();
  }
});
