from flask import Flask, request, render_template, redirect, url_for, session, flash, send_from_directory, jsonify
from config import Config
from database import db, init_tables
from routes.main import main_bp
from routes.internship_routes import internship_bp
from routes.auth_routes import auth_bp  # added
import logging

app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = 'your_secret_key'  # Replace with a secure key

# Add this configuration
app.config['UPLOAD_FOLDER'] = 'uploads'

# Set logging level to capture errors
logging.basicConfig(level=logging.ERROR)

# Log each request's page path
@app.before_request
def log_request():
    app.logger.info("Page accessed: %s", request.path)

@app.errorhandler(404)
def page_not_found(e):
    app.logger.warning(f"404 Error: {e}")
    return "Page not found", 404

@app.route('/static/<path:filename>')
def static_files(filename):
    try:
        return send_from_directory('static', filename)
    except FileNotFoundError:
        app.logger.warning(f"Static file not found: {filename}")
        return "File not found", 404

# Initialize the database
db.init_app(app)

# Register blueprints
app.register_blueprint(main_bp)
app.register_blueprint(internship_bp)
app.register_blueprint(auth_bp, url_prefix='/auth')  # added

# Create the database tables if they don't exist
with app.app_context():
    db.create_all()
    init_tables()  # Initialize the candidates and companies tables

#  Home Page Route
@app.route('/')
@app.route('/index.html')
def home():
    return render_template("index.html")

#  Other Page Routes
@app.route('/internships')
@app.route('/internships.html')
def internships():
    search_query = request.args.get("search", "")  # Capture the search parameter if present
    return render_template("internships.html", search=search_query)

@app.route('/about_us')
@app.route('/about_us.html')
def about_us():
    return render_template("about_us.html")

@app.route('/contact_us')
@app.route('/contact_us.html')
def contact_us():
    return render_template("contact_us.html")

@app.route('/dashboard')
def dashboard():
    if session.get('logged_in') and session.get('role') == 'student':
        return render_template('dashboard.html', name=session.get('name'))
    elif session.get('logged_in') and session.get('role') == 'recruiter':
        return redirect(url_for('recruiter'))
    else:
        flash("Please log in to access the dashboard.", "warning")
        return redirect(url_for('auth_bp.login'))

@app.route('/recruiter')
def recruiter():
    if session.get('logged_in') and session.get('role') == 'recruiter':
        print(f"Recruiter session: user_id={session.get('user_id')}, name={session.get('name')}, role={session.get('role')}")
        return render_template("recruiter.html", name=session.get('name'))
    flash("Please log in first.", "warning")
    return redirect(url_for('auth_bp.login'))

# ✅ Internship Role Routes
@app.route('/internship_roles/software_role')
def software_role():
    return render_template("internship_roles/software_role.html")

@app.route('/internship_roles/data_analyst')
def data_analyst():
    return render_template("internship_roles/data_analyst.html")

@app.route('/internship_roles/ui_ux')
def ui_ux():
    return render_template("internship_roles/ui_ux.html")

@app.route('/internship_roles/marketing')
def marketing():
    return render_template("internship_roles/marketing.html")

@app.route('/internship_roles/graphic')
def graphic():
    return render_template("internship_roles/graphic.html")

@app.route('/internship_roles/content_writ')
def content_writ():
    return render_template("internship_roles/content_writ.html")

@app.route('/internship_roles/backend')
def backend():
    return render_template("internship_roles/backend.html")

@app.route('/internship_roles/frontend')
def frontend():
    return render_template("internship_roles/frontend.html")

@app.route('/internship_roles/digital_marketing')
def digital_marketing():
    return render_template("internship_roles/digital_marketing.html")

@app.route('/login.html')
def login_html():
    return redirect(url_for('main.login'))

@app.route('/api/check_login_status', methods=['GET'])
def check_login_status():
    if 'logged_in' in session and session['logged_in']:
        role = session.get('role', 'unknown')
        dashboard_url = '/dashboard' if role == 'student' else '/recruiter'
        return jsonify({
            'logged_in': True,
            'role': role,
            'dashboard_url': dashboard_url
        })
    return jsonify({'logged_in': False})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()  # Clear the session
    return jsonify({'message': 'Logged out successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)