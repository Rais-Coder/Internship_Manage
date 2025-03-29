from flask import Blueprint, render_template

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    # Render the index page (templates/index.html)
    return render_template('index.html')

@main_bp.route('/login')
def login():
    # Render the login page (templates/login.html)
    return render_template('login.html')

@main_bp.route('/recruiter')
def recruiter():
    # Render the recruiter dashboard (templates/recruiter.html)
    return render_template('recruiter.html')

# ...existing code...
