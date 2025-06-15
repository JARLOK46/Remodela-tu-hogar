/**
 * Revive Tu Hogar - Main JavaScript
 * This file contains all the interactive functionality for the website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initSmoothScrolling();
    initGallery();
    initFormValidation();
    initAnimations();
    initButtonActions();
    loadBlogPosts();
    initNavbarScroll();
    
    // Remove loading screen (already implemented in HTML)
    // simulateLoading() is called in the HTML
});

/**
 * Handle navbar color change on scroll
 */
function initNavbarScroll() {
    const navbar = document.querySelector('.nav-transparent');
    const hero = document.querySelector('.hero');
    
    window.addEventListener('scroll', function() {
        // Get the bottom position of the hero section
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        
        // Check if we've scrolled past the hero section
        if (window.scrollY > heroBottom - navbar.offsetHeight) {
            // We've scrolled past the hero, apply the scrolled class
            navbar.classList.add('scrolled');
        } else {
            // We're still within the hero section, remove the scrolled class
            navbar.classList.remove('scrolled');
        }
    });
    
    // Trigger the scroll event once to set the initial state
    window.dispatchEvent(new Event('scroll'));
}

/**
 * Smooth scrolling for navigation links
 */
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only prevent default for same-page anchor links
            // This allows links to other pages (like index.html) to work normally
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Add active class to current nav link
                    navLinks.forEach(link => link.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Smooth scroll to target
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Offset for header
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Highlight active section on scroll
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

/**
 * Gallery functionality with lightbox
 */
function initGallery() {
    const galleryImages = document.querySelectorAll('.galeria .imagen img');
    
    // Create lightbox elements if they don't exist
    if (!document.querySelector('.lightbox')) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="close">&times;</span>
                <img class="lightbox-img" src="" alt="Imagen ampliada">
                <div class="lightbox-caption"></div>
                <div class="lightbox-controls">
                    <button class="prev-btn">&#10094;</button>
                    <button class="next-btn">&#10095;</button>
                </div>
            </div>
        `;
        document.body.appendChild(lightbox);
    }
    
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const closeBtn = document.querySelector('.lightbox .close');
    const prevBtn = document.querySelector('.lightbox .prev-btn');
    const nextBtn = document.querySelector('.lightbox .next-btn');
    
    let currentIndex = 0;
    
    // Open lightbox when clicking on gallery images
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', function() {
            lightbox.style.display = 'flex';
            lightboxImg.src = this.src;
            lightboxCaption.textContent = this.alt;
            currentIndex = index;
            updateLightboxControls();
        });
    });
    
    // Close lightbox
    closeBtn.addEventListener('click', function() {
        lightbox.style.display = 'none';
    });
    
    // Navigate through images
    prevBtn.addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightbox();
    });
    
    nextBtn.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % galleryImages.length;
        updateLightbox();
    });
    
    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });
    
    // Update lightbox with current image
    function updateLightbox() {
        const img = galleryImages[currentIndex];
        lightboxImg.src = img.src;
        lightboxCaption.textContent = img.alt;
        updateLightboxControls();
    }
    
    // Update lightbox controls visibility
    function updateLightboxControls() {
        prevBtn.style.display = galleryImages.length > 1 ? 'block' : 'none';
        nextBtn.style.display = galleryImages.length > 1 ? 'block' : 'none';
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') {
                lightbox.style.display = 'none';
            } else if (e.key === 'ArrowLeft') {
                prevBtn.click();
            } else if (e.key === 'ArrowRight') {
                nextBtn.click();
            }
        }
    });
}

/**
 * Form validation for contact form
 */
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form fields
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();

        // Clear previous alerts
        removeAlerts();

        // Validate fields
        if (!nombre || !email || !mensaje) {
            showAlert('danger', 'Por favor, complete todos los campos.');
            return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
            showAlert('danger', 'Por favor, ingrese un correo electrónico válido.');
            return;
        }

        try {
            // Simulate sending the form data to a server
            await simulateFormSubmission({ nombre, email, mensaje });
            
            // Clear form
            contactForm.reset();
            
            // Show success message
            showAlert('success', '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.');
        } catch (error) {
            showAlert('danger', 'Hubo un error al enviar el mensaje. Por favor, inténtelo de nuevo.');
        }
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const form = document.getElementById('contactForm');
    form.insertBefore(alertDiv, form.firstChild);
}

function removeAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => alert.remove());
}

async function simulateFormSubmission(data) {
    // Simulate API call delay
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Form data:', data);
            resolve();
        }, 1000);
    });
}

/**
 * Animations for page elements
 */
function initAnimations() {
    // Animate elements when they come into view
    const animateElements = document.querySelectorAll('.servicio, .post, .imagen');
    
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                // Unobserve after animation is triggered
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    // Observe elements
    animateElements.forEach(element => {
        observer.observe(element);
    });
    
    // Add parallax effect to header
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const header = document.querySelector('header');
        
        if (header) {
            header.style.backgroundPosition = `center ${scrollPosition * 0.5}px`;
        }
    });
}

/**
 * Button actions and interactions
 */
function initButtonActions() {
    // Get all buttons with class 'btn'
    const buttons = document.querySelectorAll('.btn, .btn-secondary, .btn-link');
    
    // Add click event to all buttons
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Skip links with href to actual pages (not just anchors)
            if (this.tagName === 'A' && this.getAttribute('href') && !this.getAttribute('href').startsWith('#')) {
                return; // Allow default navigation behavior
            }
            
            // Prevent default action for anchor links
            if (this.tagName === 'A') {
                e.preventDefault();
            }
            
            // Add ripple effect
            addRippleEffect(this, e);
            
            // Check if button has data-action attribute
            const action = this.getAttribute('data-action');
            
            if (action) {
                // Handle different button actions
                switch (action) {
                    case 'scroll-to-contact':
                        scrollToElement('#contacto');
                        break;
                    case 'show-gallery':
                        scrollToElement('#galeria');
                        break;
                    // Add more actions as needed
                    default:
                        // For now, show a message that functionality is under construction
                        alert('Funcionalidad en construcción');
                }
            } else {
                // Default action for buttons without specific action
                alert('Funcionalidad en construcción');
            }
        });
    });
    
    // Helper function to add ripple effect to buttons
    function addRippleEffect(button, e) {
        // Create ripple element
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        button.appendChild(ripple);
        
        // Position ripple
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        
        // Remove ripple after animation
        ripple.addEventListener('animationend', function() {
            ripple.remove();
        });
    }
    
    // Helper function to scroll to element
    function scrollToElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    }
}

/**
 * Load blog posts from the API
 */
function loadBlogPosts() {
    const blogPostsContainer = document.getElementById('blogPosts');
    
    if (blogPostsContainer) {
        // Show loading state
        blogPostsContainer.innerHTML = '<div class="loading-posts"><p>Cargando artículos...</p></div>';
        
        // Fetch posts from API
        fetch('/api/posts')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar los posts');
                }
                return response.json();
            })
            .then(posts => {
                // Clear loading message
                blogPostsContainer.innerHTML = '';
                
                if (posts.length === 0) {
                    // Show message if no posts
                    blogPostsContainer.innerHTML = '<p class="text-center">No hay artículos publicados aún.</p>';
                    return;
                }
                
                // Create post elements
                posts.forEach((post, index) => {
                    const postElement = document.createElement('article');
                    postElement.className = 'post';
                    postElement.style.setProperty('--animation-order', index);
                    postElement.dataset.postId = post.id;
                    
                    // Format date
                    const postDate = new Date(post.created_at).toLocaleDateString('es-ES');
                    
                    // Create post HTML
                    postElement.innerHTML = `
                        <div class="post-image">
                            <img src="${post.image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'}" alt="${post.title}">
                        </div>
                        <h3>${post.title}</h3>
                        <p>${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</p>
                        <p class="post-meta">Por: ${post.author || 'Anónimo'} | ${postDate}</p>
                        <div class="post-actions">
                            <button class="btn-link like-btn ${post.is_liked ? 'liked' : ''}">
                                <i class="${post.is_liked ? 'fas' : 'far'} fa-heart"></i> 
                                <span class="likes-count">${post.likes_count || 0}</span>
                            </button>
                            <button class="btn-link show-comments-btn">
                                <i class="fas fa-comments"></i> Comentarios (${post.comments_count || 0})
                            </button>
                        </div>
                        <div class="comments-section" style="display: none;">
                            <div class="comments-container"></div>
                            <div class="comment-form-container">
                                <form class="comment-form">
                                    <div class="form-group">
                                        <textarea class="form-control comment-input" placeholder="Escribe un comentario..."></textarea>
                                    </div>
                                    <div class="form-group">
                                        <button type="submit" class="btn-secondary submit-comment-btn">Comentar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    `;
                    
                    blogPostsContainer.appendChild(postElement);
                    
                    // Add event listener to show/hide comments
                    const showCommentsBtn = postElement.querySelector('.show-comments-btn');
                    const commentsSection = postElement.querySelector('.comments-section');
                    
                    showCommentsBtn.addEventListener('click', function() {
                        const isVisible = commentsSection.style.display !== 'none';
                        
                        if (isVisible) {
                            commentsSection.style.display = 'none';
                        } else {
                            commentsSection.style.display = 'block';
                            loadComments(post.id, postElement.querySelector('.comments-container'));
                        }
                    });
                    
                    // Add event listener for comment form
                    const commentForm = postElement.querySelector('.comment-form');
                    commentForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        submitComment(post.id, this, postElement);
                    });
                    
                    // Add event listener for like button
                    const likeBtn = postElement.querySelector('.like-btn');
                    likeBtn.addEventListener('click', function() {
                        handleLike(post.id, this);
                    });
                });
            })
            .catch(error => {
                console.error('Error loading blog posts:', error);
                blogPostsContainer.innerHTML = '<p class="text-center">Error al cargar los artículos. Por favor, intenta de nuevo más tarde.</p>';
            });
    }
}

/**
 * Handle like/unlike action for a post
 */
function handleLike(postId, likeButton) {
    // Check if user is logged in
    fetch('/api/user')
        .then(response => {
            if (!response.ok) {
                // User is not logged in
                alert('Debes iniciar sesión para dar like a un artículo');
                window.location.href = '/login.html';
                return;
            }
            return response.json();
        })
        .then(user => {
            if (!user) return; // Exit if no user data (handled in previous step)
            
            const isLiked = likeButton.classList.contains('liked');
            const endpoint = isLiked ? `/api/posts/${postId}/unlike` : `/api/posts/${postId}/like`;
            
            // Send like/unlike request
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al procesar la acción');
                }
                return response.json();
            })
            .then(data => {
                // Update UI
                updateLikeUI(likeButton, data.is_liked, data.likes_count);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un error al procesar tu acción. Por favor, intenta de nuevo.');
            });
        })
        .catch(error => {
            console.error('Error checking user session:', error);
            alert('Hubo un error al verificar tu sesión. Por favor, intenta de nuevo.');
        });
}

/**
 * Update like button UI
 */
function updateLikeUI(likeButton, isLiked, likesCount) {
    const heartIcon = likeButton.querySelector('i');
    const likesCountElement = likeButton.querySelector('.likes-count');
    
    if (isLiked) {
        likeButton.classList.add('liked');
        heartIcon.className = 'fas fa-heart'; // Solid heart
    } else {
        likeButton.classList.remove('liked');
        heartIcon.className = 'far fa-heart'; // Outline heart
    }
    
    likesCountElement.textContent = likesCount;
}

/**
 * Load comments for a specific post
 */
function loadComments(postId, commentsContainer) {
    // Show loading state
    commentsContainer.innerHTML = '<p class="loading-comments">Cargando comentarios...</p>';
    
    // Fetch comments from API
    fetch(`/api/posts/${postId}/comments`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los comentarios');
            }
            return response.json();
        })
        .then(comments => {
            // Clear loading message
            commentsContainer.innerHTML = '';
            
            if (comments.length === 0) {
                // Show message if no comments
                commentsContainer.innerHTML = '<p class="no-comments">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
                return;
            }
            
            // Create comment elements
            comments.forEach(comment => {
                const commentElement = createCommentElement(comment);
                commentsContainer.appendChild(commentElement);
            });
        })
        .catch(error => {
            console.error('Error loading comments:', error);
            commentsContainer.innerHTML = '<p class="text-center">Error al cargar los comentarios. Por favor, intenta de nuevo más tarde.</p>';
        });
}

/**
 * Create a comment element
 */
function createCommentElement(comment) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.dataset.commentId = comment.id;
    
    // Format date
    const commentDate = new Date(comment.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    commentElement.innerHTML = `
        <div class="comment-header">
            <strong class="comment-author">${comment.author}</strong>
            <span class="comment-date">${commentDate}</span>
        </div>
        <div class="comment-content">${comment.content}</div>
    `;
    
    return commentElement;
}

// Manejo de la selección de planes de precios
document.addEventListener('DOMContentLoaded', function() {
    // Agregar evento a los botones de "¡LO QUIERO!"
    const planButtons = document.querySelectorAll('.btn-pricing');
    
    planButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Obtener el nombre del plan seleccionado
            const planCard = this.closest('.pricing-card');
            const planName = planCard.querySelector('h3').textContent;
            
            // Guardar el plan seleccionado en el almacenamiento local
            localStorage.setItem('selectedPlan', planName);
            
            // Desplazarse a la sección de contacto
            document.querySelector('#contacto').scrollIntoView({
                behavior: 'smooth'
            });
            
            // Opcional: Mostrar un mensaje al usuario
            setTimeout(() => {
                alert(`¡Has seleccionado el plan ${planName}! Por favor completa el formulario de contacto y nos pondremos en contacto contigo para continuar con el proceso.`);
            }, 500);
        });
    });
});

/**
 * Submit a new comment
 */
function submitComment(postId, form, postElement) {
    const commentInput = form.querySelector('.comment-input');
    const content = commentInput.value.trim();
    
    if (!content) {
        alert('Por favor, escribe un comentario antes de enviar.');
        return;
    }
    
    // Check if user is logged in
    fetch('/api/user')
        .then(response => {
            if (!response.ok) {
                // User is not logged in
                alert('Debes iniciar sesión para comentar');
                window.location.href = '/login.html';
                return;
            }
            return response.json();
        })
        .then(user => {
            if (!user) return; // Exit if no user data (handled in previous step)
            
            // Send comment to API
            fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al enviar el comentario');
                }
                return response.json();
            })
            .then(comment => {
                // Clear input
                commentInput.value = '';
                
                // Add new comment to UI
                const commentsContainer = postElement.querySelector('.comments-container');
                const noCommentsMessage = commentsContainer.querySelector('.no-comments');
                
                if (noCommentsMessage) {
                    commentsContainer.innerHTML = '';
                }
                
                const commentElement = createCommentElement(comment);
                commentsContainer.insertBefore(commentElement, commentsContainer.firstChild);
                
                // Update comment count
                const commentsCountElement = postElement.querySelector('.show-comments-btn');
                const currentCount = parseInt(commentsCountElement.textContent.match(/\d+/) || 0);
                commentsCountElement.innerHTML = `<i class="fas fa-comments"></i> Comentarios (${currentCount + 1})`;
            })
            .catch(error => {
                console.error('Error submitting comment:', error);
                alert('Hubo un error al enviar tu comentario. Por favor, intenta de nuevo.');
            });
        })
        .catch(error => {
            console.error('Error checking user session:', error);
            alert('Hubo un error al verificar tu sesión. Por favor, intenta de nuevo.');
        });
}