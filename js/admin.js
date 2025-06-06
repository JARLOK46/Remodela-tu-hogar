/**
 * Revive Tu Hogar - Admin Panel JavaScript
 * This file handles all admin panel functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin components
    initAdminPanel();
});

/**
 * Initialize admin panel functionality
 */
let quill; // Global Quill instance

function initAdminPanel() {
    const postForm = document.getElementById('postForm');
    const blogPostForm = document.getElementById('blogPostForm');
    const newPostBtn = document.getElementById('newPostBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const previewBtn = document.getElementById('previewBtn');
    const previewContainer = document.getElementById('previewContainer');
    const postsList = document.getElementById('postsList');
    const formTitle = document.getElementById('formTitle');
    const postIdInput = document.getElementById('postId');
    const alertContainer = document.getElementById('alertContainer');
    const contentInput = document.getElementById('content');
    
    // Initialize Quill editor once
    quill = new Quill('#editor-container', {
        modules: {
            toolbar: '#toolbar-container'
        },
        placeholder: 'Escribe el contenido del post...',
        theme: 'snow'
    });
    
    // Check authentication status
    checkAuth();
    
    // Load posts when page loads
    loadPosts();
    
    // Event Listeners
    newPostBtn.addEventListener('click', showNewPostForm);
    cancelBtn.addEventListener('click', hidePostForm);
    previewBtn.addEventListener('click', showPreview);
    blogPostForm.addEventListener('submit', handleFormSubmit);
}

/**
 * Check authentication status
 */
function checkAuth() {
    fetch('/api/user')
        .then(response => {
            if (!response.ok) {
                window.location.href = '/login.html';
                throw new Error('No autorizado');
            }
            return response.json();
        })
        .catch(error => {
            if (error.message !== 'No autorizado') {
                showAlert('Error de autenticación', 'danger');
            }
        });
}

/**
 * Show new post form
 */
function showNewPostForm() {
    const formTitle = document.getElementById('formTitle');
    const blogPostForm = document.getElementById('blogPostForm');
    const postForm = document.getElementById('postForm');
    const postIdInput = document.getElementById('postId');
    
    formTitle.textContent = 'Nuevo Post';
    blogPostForm.reset();
    postIdInput.value = '';
    postForm.style.display = 'block';
    
    window.scrollTo({
        top: postForm.offsetTop - 100,
        behavior: 'smooth'
    });
}

/**
 * Hide post form
 */
function hidePostForm() {
    const postForm = document.getElementById('postForm');
    const previewContainer = document.getElementById('previewContainer');
    
    postForm.style.display = 'none';
    previewContainer.style.display = 'none';
}

/**
 * Show post preview
 */
function showPreview() {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value || 'Anónimo';
    const imageUrl = document.getElementById('imageUrl').value;
    const content = quill.root.innerHTML;
    
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewMeta').textContent = `Autor: ${author} | Fecha: ${new Date().toLocaleDateString('es-ES')}`;
    
    const previewImage = document.getElementById('previewImage');
    if (imageUrl) {
        previewImage.src = imageUrl;
        previewImage.style.display = 'block';
    } else {
        previewImage.style.display = 'none';
    }
    
    document.getElementById('previewContent').innerHTML = content;
    
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.style.display = 'block';
    
    window.scrollTo({
        top: previewContainer.offsetTop - 100,
        behavior: 'smooth'
    });
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get the content from Quill editor and set it to the hidden textarea
    const contentInput = document.getElementById('content');
    const editorContent = quill.root.innerHTML;
    contentInput.value = editorContent;
    
    // Validate required fields
    const title = document.getElementById('title').value.trim();
    if (!title) {
        showAlert('El título es requerido', 'danger');
        return;
    }
    
    if (!editorContent.trim()) {
        showAlert('El contenido es requerido', 'danger');
        return;
    }
    
    const postData = {
        title: title,
        content: editorContent,
        image_url: document.getElementById('imageUrl').value.trim(),
        author: document.getElementById('author').value.trim() || 'Anónimo'
    };
    
    const postId = document.getElementById('postId').value;
    
    // Mostrar indicador de carga
    showAlert('Guardando post...', 'info');
    
    // Asegurarse de que el contenido se está enviando correctamente
    console.log('Enviando datos:', postData);
    
    // Crear o actualizar el post directamente
    if (postId) {
        updatePost(postId, postData);
    } else {
        createPost(postData);
    }
}


/**
 * Load all posts
 */
function loadPosts() {
    const postsList = document.getElementById('postsList');
    
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            postsList.innerHTML = '';
            
            if (posts.length === 0) {
                postsList.innerHTML = '<p>No hay posts publicados.</p>';
                return;
            }
            
            posts.forEach(post => {
                const postItem = document.createElement('div');
                postItem.className = 'post-item';
                
                const postDate = new Date(post.created_at).toLocaleDateString('es-ES');
                
                postItem.innerHTML = `
                    <div>
                        <h4>${post.title}</h4>
                        <p>Autor: ${post.author || 'Anónimo'} | Fecha: ${postDate}</p>
                    </div>
                    <div class="post-actions">
                        <button class="btn-edit" data-id="${post.id}">Editar</button>
                        <button class="btn-delete" data-id="${post.id}">Eliminar</button>
                    </div>
                `;
                
                postsList.appendChild(postItem);
            });
            
            // Add event listeners to edit and delete buttons
            addPostActionListeners();
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            showAlert('Error al cargar los posts. Por favor, intenta de nuevo.', 'danger');
        });
}

/**
 * Add event listeners to post action buttons
 */
function addPostActionListeners() {
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-id');
            editPost(postId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-id');
            if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
                deletePost(postId);
            }
        });
    });
}

/**
 * Create a new post
 */
function createPost(postData) {
    // Show loading indicator
    showAlert('Guardando post...', 'info');
    
    fetch('/api/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData),
        credentials: 'same-origin' // Incluir cookies para la autenticación
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                // Problema de autenticación
                throw new Error('No autorizado. Debes iniciar sesión.');
            }
            throw new Error(`Error al crear el post: ${response.status}`);
        }
        return response.json();
    })
    .then(post => {
        showAlert('Post creado con éxito', 'success');
        hidePostForm();
        loadPosts();
    })
    .catch(error => {
        console.error('Error creating post:', error);
        if (error.message.includes('No autorizado')) {
            showAlert('Debes iniciar sesión para guardar un post', 'danger');
            setTimeout(() => {
                window.location.href = '/html/login.html';
            }, 2000);
        } else {
            showAlert(`Error al crear el post: ${error.message}. Por favor, intenta de nuevo.`, 'danger');
        }
    });
}

/**
 * Edit a post
 */
function editPost(postId) {
    fetch(`/api/posts/${postId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el post');
            }
            return response.json();
        })
        .then(post => {
            const formTitle = document.getElementById('formTitle');
            
            formTitle.textContent = 'Editar Post';
            document.getElementById('title').value = post.title;
            quill.root.innerHTML = post.content;
            document.getElementById('imageUrl').value = post.image_url || '';
            document.getElementById('author').value = post.author || '';
            document.getElementById('postId').value = post.id;
            
            const previewContainer = document.getElementById('previewContainer');
            const postForm = document.getElementById('postForm');
            
            previewContainer.style.display = 'none';
            postForm.style.display = 'block';
            
            window.scrollTo({
                top: postForm.offsetTop - 100,
                behavior: 'smooth'
            });
        })
        .catch(error => {
            console.error('Error fetching post:', error);
            showAlert('Error al cargar el post. Por favor, intenta de nuevo.', 'danger');
        });
}

/**
 * Update a post
 */
function updatePost(postId, postData) {
    fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData),
        credentials: 'same-origin' // Incluir cookies para la autenticación
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                // Problema de autenticación
                throw new Error('No autorizado. Debes iniciar sesión.');
            }
            throw new Error('Error al actualizar el post');
        }
        return response.json();
    })
    .then(post => {
        showAlert('Post actualizado con éxito', 'success');
        hidePostForm();
        loadPosts();
    })
    .catch(error => {
        console.error('Error updating post:', error);
        if (error.message.includes('No autorizado')) {
            showAlert('Debes iniciar sesión para guardar un post', 'danger');
            setTimeout(() => {
                window.location.href = '/html/login.html';
            }, 2000);
        } else {
            showAlert('Error al actualizar el post. Por favor, intenta de nuevo.', 'danger');
        }
    });
}

/**
 * Delete a post
 */
function deletePost(postId) {
    fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al eliminar el post');
        }
        showAlert('Post eliminado con éxito', 'success');
        loadPosts();
    })
    .catch(error => {
        console.error('Error deleting post:', error);
        showAlert('Error al eliminar el post. Por favor, intenta de nuevo.', 'danger');
    });
}

/**
 * Show alert message
 */
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    // Remove alert after 3 seconds
    setTimeout(() => {
        alert.remove();
    }, 3000);
}