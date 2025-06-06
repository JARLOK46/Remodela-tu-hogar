function startAnimeAnimations() {
    // Animación para el encabezado (hero section)
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const textContent = heroTitle.textContent.trim();
        heroTitle.innerHTML = ''; // Limpiar texto original
        if (textContent) {
            textContent.split('').forEach(letter => {
                const letterSpan = document.createElement('span');
                letterSpan.textContent = letter;
                letterSpan.style.display = 'inline-block';
                if (letter.trim() === '') { // Manejo de espacios
                    letterSpan.innerHTML = '&nbsp;';
                }
                heroTitle.appendChild(letterSpan);
            });

            anime({
                targets: '.hero h1 span', // Animar los spans individuales
                translateY: [20, 0], // Traslación Y más sutil para letras
                opacity: [0, 1],
                duration: 800,
                delay: anime.stagger(40), // Stagger para efecto letra por letra
                easing: 'easeOutExpo'
            });
        }
    }

    if (document.querySelector('.hero p')) {
        anime({
            targets: '.hero p',
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 1000,
            delay: 300, // Retraso para que aparezca después del título
            easing: 'easeOutExpo'
        });
    }

    // Animación para las tarjetas de servicios al hacer scroll
    const serviceCards = document.querySelectorAll('.servicios .servicio'); // Corregido el selector a '.servicios .servicio'
    if (serviceCards.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1 // Se activa cuando el 10% de la tarjeta es visible
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target,
                        translateY: [100, 0],
                        opacity: [0, 1],
                        rotateX: [-20, 0], // Efecto 3D de entrada
                        scale: [0.9, 1],
                        delay: anime.stagger(150, { start: 0 }),
                        duration: 900,
                        easing: 'easeOutElastic(1, .8)'
                    });
                    observer.unobserve(entry.target); // Dejar de observar una vez animado
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        serviceCards.forEach(card => {
            observer.observe(card);
        });

        // Animación al pasar el ratón por encima de las tarjetas de servicios
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                anime({
                    targets: card,
                    scale: 1.08,
                    rotateY: '20deg', // Rotación 3D más pronunciada
                    rotateX: '5deg',
                    boxShadow: '0px 15px 30px rgba(0,0,0,0.2)', // Sombra más dinámica
                    duration: 400,
                    easing: 'easeOutQuint'
                });
            });
            card.addEventListener('mouseleave', () => {
                anime({
                    targets: card,
                    scale: 1,
                    rotateY: '0deg',
                    rotateX: '0deg',
                    boxShadow: '0px 8px 15px rgba(0,0,0,0.1)', // Sombra base
                    duration: 400,
                    easing: 'easeOutQuint'
                });
            });
        });
    }

    // Animación para la sección de llamada a la acción (CTA)
    const ctaSection = document.querySelector('.cta');
    if (ctaSection) {
        const ctaObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.25
        };

        const ctaObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: '.cta h2, .cta p, .cta .btn-primary',
                        translateY: [50, 0],
                        opacity: [0, 1],
                        delay: anime.stagger(150),
                        duration: 800,
                        easing: 'easeOutExpo'
                    });
                    observer.unobserve(entry.target);
                }
            });
        };
        const ctaObserver = new IntersectionObserver(ctaObserverCallback, ctaObserverOptions);
        ctaObserver.observe(ctaSection);
    }

    // Animación para los testimonios
    const testimonials = document.querySelectorAll('.testimonial-card');
    if (testimonials.length > 0) {
        const testimonialObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const testimonialObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target,
                        opacity: [0, 1],
                        scale: [0.9, 1],
                        duration: 700,
                        delay: anime.stagger(100),
                        easing: 'easeOutCubic'
                    });
                    observer.unobserve(entry.target);
                }
            });
        };
        const testimonialObserver = new IntersectionObserver(testimonialObserverCallback, testimonialObserverOptions);
        testimonials.forEach(testimonial => {
            testimonialObserver.observe(testimonial);
        });
    }

    // Animación para las imágenes de la galería
    const galleryImages = document.querySelectorAll('.galeria .imagen');
    if (galleryImages.length > 0) {
        const galleryObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1 // Se activa cuando el 10% de la imagen es visible
        };

        const galleryObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target,
                        translateY: [60, 0],
                        opacity: [0, 1],
                        scale: [0.90, 1],
                        rotateX: [-20, 0], // Añadido efecto 3D de rotación en X al entrar
                        delay: anime.stagger(120, { from: 'center' }),
                        duration: 900,
                        easing: 'easeOutElastic(1, .8)'
                    });
                    observer.unobserve(entry.target); // Dejar de observar una vez animado
                }
            });
        };

        const galleryObserver = new IntersectionObserver(galleryObserverCallback, galleryObserverOptions);
        galleryImages.forEach(image => {
            galleryObserver.observe(image);
        });
    }

    // Animación para la sección del Blog
    const blogCards = document.querySelectorAll('#blog .blog-card'); // Asegúrate de que este selector coincida con tus tarjetas de blog. Ej: '.post-card', '.article-item'
    if (blogCards.length > 0) {
        const blogObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1 // Se activa cuando el 10% de la tarjeta es visible
        };

        const blogObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target,
                        translateY: [50, 0],
                        opacity: [0, 1],
                        duration: 800,
                        delay: anime.stagger(150, { start: 0 }),
                        easing: 'easeOutExpo'
                    });
                    observer.unobserve(entry.target); // Dejar de observar una vez animado
                }
            });
        };

        const blogObserver = new IntersectionObserver(blogObserverCallback, blogObserverOptions);
        blogCards.forEach(card => {
            blogObserver.observe(card);
        });
    }

    // Animación para la sección de Servicios (los íconos y texto)
    const serviciosItems = document.querySelectorAll('.servicios .servicio');
    if (serviciosItems.length > 0) {
        const serviciosObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2 // Se activa cuando el 20% del elemento es visible
        };

        const serviciosObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target.querySelectorAll('i, h3, p, .btn'),
                        translateY: [40, 0], // Ajustado para mayor impacto
                        opacity: [0, 1],
                        delay: anime.stagger(120, {start: 100}), // Stagger ajustado
                        duration: 750, // Duración ajustada
                        easing: 'easeOutQuint' // Easing más suave
                    });
                    observer.unobserve(entry.target);
                }
            });
        };
        const serviciosObserver = new IntersectionObserver(serviciosObserverCallback, serviciosObserverOptions);
        serviciosItems.forEach(item => {
            serviciosObserver.observe(item);
        });
    }

    // Animación para el footer
    const footerElements = document.querySelectorAll('footer .about, footer .contact-info > div, footer .social-icons a');
    if (footerElements.length > 0) {
        const footerObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1 // Se activa cuando el 10% del footer es visible
        };

        const footerObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target,
                        translateY: [20, 0],
                        opacity: [0, 1],
                        delay: anime.stagger(100, { from: 'first' }),
                        duration: 700,
                        easing: 'easeOutCubic'
                    });
                    observer.unobserve(entry.target);
                }
            });
        };
        const footerObserver = new IntersectionObserver(footerObserverCallback, footerObserverOptions);
        // Observar el contenedor del footer o secciones individuales
        const footerContainer = document.querySelector('footer .container');
        if (footerContainer) footerObserver.observe(footerContainer);
        // O si se prefiere animar elementos individuales al entrar en viewport
        // footerElements.forEach(el => footerObserver.observe(el)); 
    }
}

// Exportar la función si se usa como módulo, o adjuntarla al objeto window
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { startAnimeAnimations };
} else {
    window.startAnimeAnimations = startAnimeAnimations;
}