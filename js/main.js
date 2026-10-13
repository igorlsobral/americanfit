(function () {
  const config = window.PAGE_CONFIG || {};
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const productName = (config.productName || "").trim() || "AmericanFit";
  document.querySelectorAll("[data-product-name]").forEach((el) => {
    el.textContent = productName;
  });
  document.title = `Método ${productName} · Reative seu metabolismo em 28 dias`;

  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  document.querySelectorAll("[data-checkout]").forEach((el) => {
    el.addEventListener("click", (event) => {
      if (!config.checkoutUrl || config.checkoutUrl === "#checkout") {
        event.preventDefault();
        setTimeout(() => alert("Link do vídeo pendente: cole a URL em js/config.js (checkoutUrl)"), 350);
        return;
      }
      if (window.fbq) window.fbq("track", "ViewContent");
      if (window.ttq) window.ttq.track("ClickButton");
      if (el.tagName === "A") {
        el.setAttribute("href", config.checkoutUrl);
      } else {
        window.location.href = config.checkoutUrl;
      }
    });
    if (el.tagName === "A" && config.checkoutUrl && config.checkoutUrl !== "#checkout") {
      el.setAttribute("href", config.checkoutUrl);
    }
  });

  document.querySelectorAll("[data-pending-link]").forEach((el) => {
    if (el.getAttribute("href") !== "#") return;
    el.addEventListener("click", (event) => event.preventDefault());
  });

  const urgency = document.querySelector("[data-urgency]");
  const countdownRoot = document.querySelector("[data-countdown]");
  if (urgency && countdownRoot && config.countdownEnd) {
    const end = new Date(config.countdownEnd).getTime();
    if (!Number.isNaN(end)) {
      urgency.hidden = false;
      const tick = () => {
        const diff = Math.max(0, end - Date.now());
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        countdownRoot.textContent = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      };
      tick();
      setInterval(tick, 1000);
    }
  }

  document.querySelectorAll("[data-split]").forEach((root) => {
    let index = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.namespaceURI !== "http://www.w3.org/2000/svg") walk(child);
          return;
        }
        if (child.nodeType !== Node.TEXT_NODE) return;
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
          const word = document.createElement("span");
          word.className = "w";
          word.textContent = part;
          word.style.setProperty("--i", index++);
          frag.appendChild(word);
        });
        child.replaceWith(frag);
      });
    };
    walk(root);
  });

  const reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => revealObserver.observe(el));
  }

  const formatNumber = (n) => n.toLocaleString("pt-BR");
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.getAttribute("data-count")) || 0;
    if (!("IntersectionObserver" in window)) {
      el.textContent = formatNumber(target);
      return;
    }
    const run = () => {
      const duration = 2200;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = formatNumber(Math.round(target * eased));
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          el.classList.add("pop");
        }
      };
      requestAnimationFrame(step);
    };
    el.textContent = formatNumber(0);
    const countObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      countObserver.disconnect();
      setTimeout(run, 1000);
    });
    countObserver.observe(el);
  });

  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("pointerdown", (event) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });

  if (finePointer) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        el.style.translate = `${x * 16}px ${y * 12}px`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.translate = "0 0";
      });
    });

    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointerenter", () => card.classList.add("is-tilting"));
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        card.style.setProperty("--rx", `${(0.5 - py) * 12}deg`);
        card.style.setProperty("--ry", `${(px - 0.5) * 14}deg`);
        card.style.setProperty("--cx", `${px * 100}%`);
        card.style.setProperty("--cy", `${py * 100}%`);
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });

    document.querySelectorAll("[data-glow]").forEach((box) => {
      box.addEventListener("pointermove", (event) => {
        const rect = box.getBoundingClientRect();
        box.style.setProperty("--fx", `${event.clientX - rect.left}px`);
        box.style.setProperty("--fy", `${event.clientY - rect.top}px`);
      });
    });

    const layer = document.querySelector("[data-parallax]");
    const spotlight = document.querySelector("[data-spotlight]");
    if (layer) {
      const target = { x: 0, y: 0, mx: innerWidth / 2, my: innerHeight / 3 };
      const current = { ...target };
      let running = false;

      const frame = () => {
        current.x += (target.x - current.x) * 0.06;
        current.y += (target.y - current.y) * 0.06;
        current.mx += (target.mx - current.mx) * 0.12;
        current.my += (target.my - current.my) * 0.12;
        layer.style.setProperty("--px", current.x.toFixed(4));
        layer.style.setProperty("--py", current.y.toFixed(4));
        if (spotlight) spotlight.style.transform = `translate(${current.mx}px, ${current.my}px)`;
        const settled =
          Math.abs(target.x - current.x) < 0.0005 &&
          Math.abs(target.y - current.y) < 0.0005 &&
          Math.abs(target.mx - current.mx) < 0.5 &&
          Math.abs(target.my - current.my) < 0.5;
        running = !settled;
        if (running) requestAnimationFrame(frame);
      };

      window.addEventListener("pointermove", (event) => {
        target.x = event.clientX / innerWidth - 0.5;
        target.y = event.clientY / innerHeight - 0.5;
        target.mx = event.clientX;
        target.my = event.clientY;
        if (spotlight) spotlight.classList.add("is-on");
        if (!running) {
          running = true;
          requestAnimationFrame(frame);
        }
      });
      document.addEventListener("pointerleave", () => {
        if (spotlight) spotlight.classList.remove("is-on");
      });
    }
  }

  const sticky = document.querySelector("[data-sticky]");
  const heroCta = document.querySelector("[data-hero-cta]");
  const finalCta = document.querySelector("[data-final-cta]");
  if (sticky && heroCta && "IntersectionObserver" in window) {
    const state = { heroPassed: false, finalVisible: false };
    const update = () => {
      sticky.classList.toggle("is-visible", state.heroPassed && !state.finalVisible);
    };
    new IntersectionObserver(([entry]) => {
      state.heroPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      update();
    }).observe(heroCta);
    if (finalCta) {
      new IntersectionObserver(([entry]) => {
        state.finalVisible = entry.isIntersecting;
        update();
      }).observe(finalCta);
    }
  }

  function injectPixels() {
    const { meta, google, tiktok } = config.pixels || {};
    if (meta) {
      const script = document.createElement("script");
      script.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta}');fbq('track','PageView');`;
      document.head.appendChild(script);
    }
    if (google) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${google}`;
      document.head.appendChild(script);
      const inline = document.createElement("script");
      inline.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${google}');`;
      document.head.appendChild(inline);
    }
    if (tiktok) {
      const script = document.createElement("script");
      script.innerHTML = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(obj,method){obj[method]=function(){obj.push([method].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(id){for(var inst=ttq._i[id]||[],j=0;j<ttq.methods.length;j++)ttq.setAndDefer(inst,ttq.methods[j]);return inst};ttq.load=function(id){var s=d.createElement("script");s.type="text/javascript";s.async=!0;s.src="https://analytics.tiktok.com/i18n/pixel/events.js?sdkid="+id+"&lib="+t;e=d.getElementsByTagName("script")[0];e.parentNode.insertBefore(s,e)};}(window,document,"ttq");ttq.load("${tiktok}");ttq.page();`;
      document.head.appendChild(script);
    }
  }

  injectPixels();
})();
