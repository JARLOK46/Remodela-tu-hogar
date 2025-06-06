/**
 * Revive Tu Hogar - Visual Effects
 * Este archivo contiene efectos visuales avanzados para mejorar la experiencia del usuario
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos los efectos visuales
    initParticleBackground();
    initParallaxEffects();
    initScrollAnimations();
    initHoverEffects();
    initTextAnimations();
});

/**
 * Crea un fondo de partículas interactivo
 */
function initParticleBackground() {
    // Crear el canvas para las partículas si no existe
    if (!document.getElementById('particle-canvas')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        document.body.prepend(canvas);
    }
    
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    // Configurar el tamaño del canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Ajustar el tamaño del canvas cuando cambia el tamaño de la ventana
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // Configuración de partículas
    const particleCount = 50;
    const particles = [];
    const colors = ['#B18F6B', '#6F6250', '#F4EDE3'];
    
    // Crear partículas
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 0.5 + 0.1,
            direction: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.5 + 0.2
        });
    }
    
    // Animar partículas
    function animate() {
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar y actualizar partículas
        particles.forEach(particle => {
            // Dibujar partícula
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity;
            ctx.fill();
            
            // Mover partícula
            particle.x += Math.cos(particle.direction) * particle.speed;
            particle.y += Math.sin(particle.direction) * particle.speed;
            
            // Cambiar dirección ligeramente para crear movimiento orgánico
            particle.direction += (Math.random() - 0.5) * 0.05;
            
            // Si la partícula sale del canvas, reposicionarla
            if (particle.x < 0 || particle.x > canvas.width || 
                particle.y < 0 || particle.y > canvas.height) {
                particle.x = Math.random() * canvas.width;
                particle.y = Math.random() * canvas.height;
                particle.direction = Math.random() * Math.PI * 2;
            }
        });
        
        // Continuar animación
        requestAnimationFrame(animate);
    }
    
    // Iniciar animación
    animate();
}

/**
 * Efectos de parallax para elementos seleccionados
 */
function initParallaxEffects() {
    // Aplicar efecto parallax al hacer scroll
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        // Parallax en el encabezado
        const header = document.querySelector('header');
        if (header) {
            header.style.backgroundPosition = `center ${scrollPosition * 0.4}px`;
        }
        
        // Parallax en las secciones
        document.querySelectorAll('section').forEach((section, index) => {
            const offset = section.offsetTop - scrollPosition;
            if (offset < window.innerHeight && offset > -section.offsetHeight) {
                const speed = index % 2 === 0 ? 0.1 : -0.1;
                section.style.transform = `translateY(${scrollPosition * speed}px)`;
            }
        });
    });
}

/**
 * Animaciones basadas en el scroll
 */
function initScrollAnimations() {
    // Crear un observador de intersección para detectar elementos visibles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    // Elementos a animar cuando son visibles
    const animateElements = document.querySelectorAll('.servicio, .imagen, section h2, .lead, form .form-control, .blog-posts > div');
    
    // Añadir clase para preparar la animación
    animateElements.forEach(element => {
        element.classList.add('animate-on-scroll');
        observer.observe(element);
    });
}

/**
 * Efectos de hover mejorados
 */
function initHoverEffects() {
    // Efecto de brillo en botones
    document.querySelectorAll('.btn, .btn-secondary').forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.style.setProperty('--x-position', `${x}px`);
            this.style.setProperty('--y-position', `${y}px`);
        });
    });
    
    // Efecto de zoom suave en imágenes de la galería
    document.querySelectorAll('.galeria .imagen').forEach(imagen => {
        imagen.addEventListener('mouseenter', function() {
            this.querySelector('img').style.transform = 'scale(1.05)';
        });
        
        imagen.addEventListener('mouseleave', function() {
            this.querySelector('img').style.transform = 'scale(1)';
        });
    });
}

/**
 * Animaciones de texto
 */
function initTextAnimations() {
    // Animación de texto en el encabezado
    const headerTitle = document.querySelector('header h1');
    const headerText = document.querySelector('header p');
    
    if (headerTitle && headerText) {
        // Dividir el texto en letras para animación
        const titleText = headerTitle.textContent;
        const titleLetters = titleText.split('');
        
        headerTitle.textContent = '';
        titleLetters.forEach((letter, index) => {
            const span = document.createElement('span');
            span.textContent = letter;
            span.style.animationDelay = `${index * 0.05}s`;
            span.classList.add('animated-letter');
            headerTitle.appendChild(span);
        });
        
        // Animar el subtítulo después del título
        headerText.style.animationDelay = `${titleLetters.length * 0.05 + 0.3}s`;
    }
}