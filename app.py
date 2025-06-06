from flask import Flask, request, jsonify, render_template, send_from_directory, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

app = Flask(__name__, static_folder='.')

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or os.urandom(24)

db = SQLAlchemy(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    posts = db.relationship('BlogPost', backref='author_user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Like model
class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('blog_post.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='unique_user_post_like'),)

# Blog post model
class BlogPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    author = db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    comments = db.relationship('Comment', backref='post', lazy=True, cascade='all, delete-orphan')
    likes = db.relationship('Like', backref='post', lazy=True, cascade='all, delete-orphan')

# Comment model
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('blog_post.id'), nullable=False)

# Create database tables
with app.app_context():
    # Only create tables if they don't exist
    # Removed db.drop_all() to prevent losing user data on restart
    db.create_all()

# Routes
@app.route('/')
def index():
    return app.send_static_file('index.html')

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login_page'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/admin.html')
@login_required
def admin():
    return send_from_directory('html', 'admin.html')

@app.route('/html/admin.html')
@login_required
def admin_html_redirect():
    return redirect(url_for('admin'))

@app.route('/login.html')
def login_page():
    return send_from_directory('html', 'login.html')

@app.route('/html/login.html')
def login_html_redirect():
    return redirect(url_for('login_page'))

@app.route('/register.html')
def register_page():
    return send_from_directory('html', 'register.html')

@app.route('/html/register.html')
def register_html_redirect():
    return redirect(url_for('register_page'))

@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('js', filename)

@app.route('/html/servicios/<path:filename>')
def serve_service_pages(filename):
    return send_from_directory('html/servicios', filename)

# Like routes
@app.route('/api/posts/<int:post_id>/like', methods=['POST'])
@login_required
def like_post(post_id):
    post = BlogPost.query.get_or_404(post_id)
    
    # Check if user already liked this post
    existing_like = Like.query.filter_by(
        user_id=session['user_id'],
        post_id=post_id
    ).first()
    
    if existing_like:
        return jsonify({'error': 'Ya has dado like a este post'}), 400
    
    new_like = Like(
        user_id=session['user_id'],
        post_id=post_id
    )
    
    db.session.add(new_like)
    db.session.commit()
    
    return jsonify({
        'likes_count': len(post.likes),
        'is_liked': True
    })

@app.route('/api/posts/<int:post_id>/unlike', methods=['POST'])
@login_required
def unlike_post(post_id):
    post = BlogPost.query.get_or_404(post_id)
    
    # Find and remove the like
    like = Like.query.filter_by(
        user_id=session['user_id'],
        post_id=post_id
    ).first()
    
    if not like:
        return jsonify({'error': 'No has dado like a este post'}), 400
    
    db.session.delete(like)
    db.session.commit()
    
    return jsonify({
        'likes_count': len(post.likes),
        'is_liked': False
    })

@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts = BlogPost.query.order_by(BlogPost.created_at.desc()).all()
    return jsonify([{
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'image_url': post.image_url,
        'created_at': post.created_at.isoformat(),
        'author': post.author,
        'likes_count': len(post.likes),
        'comments_count': len(post.comments),
        'is_liked': bool(Like.query.filter_by(post_id=post.id, user_id=session.get('user_id')).first()) if 'user_id' in session else False
    } for post in posts])

@app.route('/api/posts', methods=['POST'])
@login_required
def create_post():
    data = request.json
    user = User.query.get(session['user_id'])
    
    new_post = BlogPost(
        title=data['title'],
        content=data['content'],
        image_url=data.get('image_url'),
        author=user.username,
        user_id=user.id
    )
    db.session.add(new_post)
    db.session.commit()
    return jsonify({
        'id': new_post.id,
        'title': new_post.title,
        'content': new_post.content,
        'image_url': new_post.image_url,
        'created_at': new_post.created_at.isoformat(),
        'author': new_post.author
    }), 201

@app.route('/api/posts/<int:post_id>', methods=['PUT'])
@login_required
def update_post(post_id):
    post = BlogPost.query.get_or_404(post_id)
    
    # Check if the user is the owner of the post
    if post.user_id != session['user_id']:
        return jsonify({'error': 'No autorizado para editar este post'}), 403
        
    data = request.json
    post.title = data.get('title', post.title)
    post.content = data.get('content', post.content)
    post.image_url = data.get('image_url', post.image_url)
    db.session.commit()
    return jsonify({
        'id': post.id,
        'title': post.title,
        'content': post.content,
        'image_url': post.image_url,
        'created_at': post.created_at.isoformat(),
        'author': post.author
    })

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
@login_required
def delete_post(post_id):
    post = BlogPost.query.get_or_404(post_id)
    
    # Check if the user is the owner of the post
    if post.user_id != session['user_id']:
        return jsonify({'error': 'No autorizado para eliminar este post'}), 403
        
    db.session.delete(post)
    db.session.commit()
    return '', 204

# Authentication routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'El nombre de usuario ya está en uso'}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'El correo electrónico ya está registrado'}), 400
    
    # Create new user
    new_user = User(username=data['username'], email=data['email'])
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'Usuario registrado correctamente'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    
    # Find user by username
    user = User.query.filter_by(username=data['username']).first()
    
    # Check if user exists and password is correct
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Nombre de usuario o contraseña incorrectos'}), 401
    
    # Set user session
    session['user_id'] = user.id
    session['username'] = user.username
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email
    })

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return jsonify({'message': 'Sesión cerrada correctamente'})

@app.route('/api/user', methods=['GET'])
@login_required
def get_current_user():
    user = User.query.get(session['user_id'])
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email
    })

# Comment routes
@app.route('/api/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    post = BlogPost.query.get_or_404(post_id)
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.desc()).all()
    return jsonify([{
        'id': comment.id,
        'content': comment.content,
        'created_at': comment.created_at.isoformat(),
        'user_id': comment.user_id,
        'author': User.query.get(comment.user_id).username
    } for comment in comments])

@app.route('/api/posts/<int:post_id>/comments', methods=['POST'])
@login_required
def create_comment(post_id):
    post = BlogPost.query.get_or_404(post_id)
    data = request.json
    
    new_comment = Comment(
        content=data['content'],
        user_id=session['user_id'],
        post_id=post_id
    )
    
    db.session.add(new_comment)
    db.session.commit()
    
    return jsonify({
        'id': new_comment.id,
        'content': new_comment.content,
        'created_at': new_comment.created_at.isoformat(),
        'user_id': new_comment.user_id,
        'author': User.query.get(new_comment.user_id).username
    }), 201

@app.route('/api/comments/<int:comment_id>', methods=['PUT'])
@login_required
def update_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    
    # Check if the user is the owner of the comment
    if comment.user_id != session['user_id']:
        return jsonify({'error': 'No autorizado para editar este comentario'}), 403
    
    data = request.json
    comment.content = data.get('content', comment.content)
    db.session.commit()
    
    return jsonify({
        'id': comment.id,
        'content': comment.content,
        'created_at': comment.created_at.isoformat(),
        'user_id': comment.user_id,
        'author': User.query.get(comment.user_id).username
    })

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    
    # Check if the user is the owner of the comment
    if comment.user_id != session['user_id']:
        return jsonify({'error': 'No autorizado para eliminar este comentario'}), 403
    
    db.session.delete(comment)
    db.session.commit()
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)