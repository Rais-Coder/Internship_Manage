document.addEventListener("DOMContentLoaded", function () {
    if (!window.location.pathname.startsWith('/static/')) {
        console.log(`Page accessed: ${window.location.pathname}`);
    }

    console.log("DOM fully loaded and parsed");

    // Initialize core functions
    checkLoginStatus();
    setupFAQToggle();
    setupDarkMode();
    setupLoginForm();
    setupLogout();
    setupApplicationForm();
    setupPageSpecificScripts();
    setupSearchFunctionality();

    // Function to dynamically update navbar buttons based on login status
    function updateNavbarButtons() {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const role = localStorage.getItem("role");

        const dashboardLink = document.getElementById("dashboard-link");
        const logoutLink = document.getElementById("logout-link");
        const loginLink = document.getElementById("login-link");
        const candidateSignup = document.getElementById("candidate-signup");
        const companySignup = document.getElementById("company-signup");

        if (isLoggedIn) {
            // Show the dashboard button and set the correct redirect URL
            if (dashboardLink) {
                dashboardLink.classList.remove("d-none");
                dashboardLink.href = role === "student" ? "/dashboard" : "/recruiter";
            }

            // Show the logout button
            if (logoutLink) {
                logoutLink.classList.remove("d-none");
            }

            // Hide the login button
            if (loginLink) {
                loginLink.classList.add("d-none");
            }

            // Hide the signup buttons
            if (candidateSignup) {
                candidateSignup.classList.add("d-none");
            }
            if (companySignup) {
                companySignup.classList.add("d-none");
            }
        } else {
            // Show the login button
            if (loginLink) {
                loginLink.classList.remove("d-none");
            }

            // Show the signup buttons
            if (candidateSignup) {
                candidateSignup.classList.remove("d-none");
            }
            if (companySignup) {
                companySignup.classList.remove("d-none");
            }

            // Hide the dashboard and logout buttons
            if (dashboardLink) {
                dashboardLink.classList.add("d-none");
            }
            if (logoutLink) {
                logoutLink.classList.add("d-none");
            }
        }
    }

    // Call the function to update navbar buttons
    updateNavbarButtons();

    // Toggle Password Visibility
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');
    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            // Assuming input is the previous sibling
            const inputField = this.previousElementSibling;
            if (inputField) {
                if (inputField.type === "password") {
                    inputField.type = "text";
                    this.classList.remove("fa-eye");
                    this.classList.add("fa-eye-slash");
                } else {
                    inputField.type = "password";
                    this.classList.remove("fa-eye-slash");
                    this.classList.add("fa-eye");
                }
            }
        });
    });

    // Toggle for Password Field
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePassword.classList.remove("fa-eye");
                togglePassword.classList.add("fa-eye-slash");
            } else {
                passwordInput.type = "password";
                togglePassword.classList.remove("fa-eye-slash");
                togglePassword.classList.add("fa-eye");
            }
        });
    }
    
    // Toggle for Confirm Password Field
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (toggleConfirmPassword && confirmPasswordInput) {
        toggleConfirmPassword.addEventListener('click', function () {
            if (confirmPasswordInput.type === "password") {
                confirmPasswordInput.type = "text";
                toggleConfirmPassword.classList.remove("fa-eye");
                toggleConfirmPassword.classList.add("fa-eye-slash");
            } else {
                confirmPasswordInput.type = "password";
                toggleConfirmPassword.classList.remove("fa-eye-slash");
                toggleConfirmPassword.classList.add("fa-eye");
            }
        });
    }

    // Apply Now Button Handler
    const applyNowButtons = document.querySelectorAll("#applyNowBtn");
    applyNowButtons.forEach(button => {
        button.addEventListener("click", function (event) {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            const role = localStorage.getItem("role");
            if (!isLoggedIn) {
                event.preventDefault();
                showLoginAlert();
            } else if (role === "recruiter") {
                event.preventDefault();
                Swal.fire({
                    title: "Action Not Allowed",
                    text: "As a recruiter, you cannot apply for internships.",
                    icon: "info",
                    confirmButtonText: "OK"
                });
            }
        });
    });

    // Dark Mode Toggle Handler
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
        darkModeToggle.addEventListener("change", function () {
            document.body.classList.toggle("dark-mode", this.checked);
        });
    }

    // Candidate Signup Handler
    const candidateForm = document.getElementById("registerFormCandidate");
    if (candidateForm) {
        candidateForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const formData = new FormData(candidateForm);
            fetch("/auth/candidate/signup", {
                method: "POST",
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text); });
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    Swal.fire({
                        title: "Registration Failed",
                        text: data.error,
                        icon: "error",
                        confirmButtonText: "Try Again"
                    });
                } else {
                    Swal.fire({
                        title: "Registration Successful",
                        text: "Your candidate account has been created.",
                        icon: "success",
                        confirmButtonText: "Login Now"
                    }).then(() => {
                        window.location.href = "/auth/login";
                    });
                }
            })
            .catch(error => {
                console.error("Error:", error);
                Swal.fire({
                    title: "Error",
                    text: "An unexpected error occurred. Please try again later.",
                    icon: "error",
                    confirmButtonText: "Try Again"
                });
            });
        });
    }

    // Company Signup Handler
    const companyForm = document.getElementById("registerFormCompany");
    if (companyForm) {
        companyForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const formData = new FormData(companyForm);
            fetch("/auth/company/signup", {
                method: "POST",
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text); });
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    Swal.fire({
                        title: "Registration Failed",
                        text: data.error,
                        icon: "error",
                        confirmButtonText: "Try Again"
                    });
                } else {
                    Swal.fire({
                        title: "Registration Successful",
                        text: "Your company account has been created.",
                        icon: "success",
                        confirmButtonText: "Login Now"
                    }).then(() => {
                        window.location.href = "/auth/login";
                    });
                }
            })
            .catch(error => {
                console.error("Error:", error);
                Swal.fire({
                    title: "Error",
                    text: "An unexpected error occurred. Please try again later.",
                    icon: "error",
                    confirmButtonText: "Try Again"
                });
            });
        });
    }

    // Fetch login status and update UI dynamically
    fetch('/api/check_login_status')
        .then(response => response.json())
        .then(data => {
            const dashboardLink = document.getElementById("dashboard-link");
            const logoutLink = document.getElementById("logout-link");
            const loginLink = document.getElementById("login-link");
            const candidateSignup = document.getElementById("candidate-signup");
            const companySignup = document.getElementById("company-signup");

            if (data.logged_in) {
                // Show dashboard and logout buttons
                dashboardLink.classList.remove("d-none");
                logoutLink.classList.remove("d-none");

                // Hide login and signup buttons
                loginLink.classList.add("d-none");
                candidateSignup.classList.add("d-none");
                companySignup.classList.add("d-none");

                // Set the dashboard link based on the role
                dashboardLink.href = data.role === "recruiter" ? "/recruiter" : "/dashboard";
            } else {
                // Show login and signup buttons
                loginLink.classList.remove("d-none");
                candidateSignup.classList.remove("d-none");
                companySignup.classList.remove("d-none");

                // Hide dashboard and logout buttons
                dashboardLink.classList.add("d-none");
                logoutLink.classList.add("d-none");
            }
        })
        .catch(error => console.error("Error fetching login status:", error));

    const logoutLink = document.getElementById("logout-link");

    // Handle logout functionality with confirmation
    if (logoutLink) {
        logoutLink.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default link behavior

            // Show confirmation dialog
            Swal.fire({
                title: 'Are you sure?',
                text: "Do you really want to log out?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, Logout',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    // If user confirms, send logout request
                    fetch('/api/logout', { method: 'POST' })
                        .then(response => {
                            if (response.ok) {
                                // Update navbar buttons
                                document.getElementById("dashboard-link").classList.add("d-none");
                                logoutLink.classList.add("d-none");
                                document.getElementById("login-link").classList.remove("d-none");
                                document.getElementById("candidate-signup").classList.remove("d-none");
                                document.getElementById("company-signup").classList.remove("d-none");

                                // Redirect to the home page
                                window.location.href = '/';
                            } else {
                                console.error("Failed to log out");
                            }
                        })
                        .catch(error => console.error("Error during logout:", error));
                }
            });
        });
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            // Ensure the form action is correct
            if (registerForm.action !== "/auth/candidate/signup") {
                console.error("Form action is incorrect:", registerForm.action);
                event.preventDefault(); // Prevent submission
            }
        });
    }
});

// ------------------------- Core Functions -------------------------

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const role = localStorage.getItem("role");

    const dashboardLink = document.getElementById("dashboard-link");
    const logoutLink = document.getElementById("logout-link");
    const loginLink = document.getElementById("login-link");
    const candidateSignup = document.getElementById("candidate-signup");
    const companySignup = document.getElementById("company-signup");

    const validRoles = ["student", "recruiter"];
    if (!isLoggedIn || !validRoles.includes(role)) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("role");
    }

    if (dashboardLink) {
        dashboardLink.classList.toggle("d-none", !isLoggedIn);
        dashboardLink.href = role === "student" ? "dashboard.html" : "/recruiter";
    }
    if (logoutLink) {
        logoutLink.classList.toggle("d-none", !isLoggedIn);
    }
    if (loginLink) {
        loginLink.classList.toggle("d-none", isLoggedIn);
    }
    // Completely remove the signup buttons when logged in
    if (isLoggedIn) {
        if (candidateSignup) candidateSignup.remove();
        if (companySignup) candidateSignup.remove();
    }
}

// Logout function
function logoutUser() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    window.location.href = "index.html";
}

function showLoginAlert() {
    Swal.fire({
        title: "Access Denied!",
        text: "Please login first to continue.",
        icon: "warning",
        confirmButtonText: "Login Now",
        confirmButtonColor: "#ff4d4d"
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "login.html";
        }
    });
}

function showModal(title, message, callback) {
    if (typeof bootstrap === "undefined") {
        console.error("Bootstrap is not defined. Ensure Bootstrap JS is loaded.");
        return;
    }
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modalTitle.textContent = title;
    modalBody.textContent = message;
    modal.show();
    const modalElement = document.getElementById('confirmationModal');
    modalElement.addEventListener('hidden.bs.modal', function () {
        if (callback) callback();
    }, { once: true });
}

// ------------------------- Feature Setup Functions -------------------------

function setupLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        console.log("Login form found. Attaching event listener...");
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const role = document.getElementById("role").value;
            const loginButton = loginForm.querySelector("button[type='submit']");

            if (!email || !password || !role) {
                Swal.fire({
                    title: "Missing Fields",
                    text: "Please fill in all required fields.",
                    icon: "warning",
                    confirmButtonText: "OK"
                });
                return;
            }

            // Disable the login button to prevent multiple submissions
            loginButton.disabled = true;

            const formData = new FormData(loginForm);

            fetch(loginForm.action, {
                method: "POST",
                body: formData
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.error) {
                        Swal.fire({
                            title: "Login Failed",
                            text: data.error,
                            icon: "error",
                            confirmButtonText: "Try Again"
                        });
                        loginButton.disabled = false; // Re-enable the button
                    } else if (data.redirect) {
                        console.log("Redirecting to:", data.redirect);
                        window.location.href = data.redirect; // Redirect to Flask route
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    Swal.fire({
                        title: "Error",
                        text: "An unexpected error occurred. Please try again later.",
                        icon: "error",
                        confirmButtonText: "Try Again"
                    });
                    loginButton.disabled = false; // Re-enable the button
                });
        });
    } else {
        console.error("Login form not found.");
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById("logout-link");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            Swal.fire({
                title: "Logout Confirmation",
                text: "Are you sure you want to logout?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ff4d4d",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, Logout",
                cancelButtonText: "Cancel"
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem("isLoggedIn");
                    localStorage.removeItem("role");
                    window.location.href = "index.html";
                }
            });
        });
    }
}

function setupApplicationForm() {
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', function (event) {
            event.preventDefault();
            Swal.fire({
                title: "Form Submitted Successfully!",
                text: "We have received your information.",
                icon: "success",
                confirmButtonText: "Close",
                confirmButtonColor: "#4e72c4"
            }).then(() => {
                window.location.href = "internship.html";
            });
        });
    }
}

function setupFAQToggle() {
    const faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const isAlreadyOpen = this.classList.contains('active');
            faqToggles.forEach(btn => {
                btn.classList.remove('active');
                if (btn.nextElementSibling) btn.nextElementSibling.style.display = 'none';
            });
            if (!isAlreadyOpen) {
                this.classList.add('active');
                const faqContent = this.nextElementSibling;
                if (faqContent) faqContent.style.display = 'block';
            }
        });
    });
}

function setupDarkMode() {
    console.log("Setting up dark mode...");
    // Additional dark mode logic can be added here.
}

function setupPageSpecificScripts() {
    // Dark Mode Toggle within Dashboard or page-specific scripts.
    const toggleDarkModeButton = document.getElementById('toggleDarkMode');
    if (toggleDarkModeButton) {
        toggleDarkModeButton.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
        });
    }
    // Mark Notification as Read
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
        notification.addEventListener('click', function () {
            notification.style.backgroundColor = '#e9ecef';
            notification.style.cursor = 'default';
            alert("Notification marked as read.");
        });
    });
    // Settings Form Validation
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function (e) {
            const passwordInput = document.getElementById('password');
            if (!passwordInput) {
                alert("Password input not found.");
                return;
            }
            const password = passwordInput.value;
            if (password.length < 6) {
                e.preventDefault();
                alert("Password must be at least 6 characters long.");
            } else {
                alert("Settings updated successfully!");
            }
        });
    }
    // Updated Sign-Up / Sign-In Toggle
    const signUpButton = document.getElementById("signUp");
    const signInButton = document.getElementById("signIn");
    const mainContainer = document.querySelector(".container");
    if (signUpButton && signInButton && mainContainer) {
        signUpButton.addEventListener("click", () => {
            mainContainer.classList.add("right-panel-active");
        });
        signInButton.addEventListener("click", () => {
            mainContainer.classList.remove("right-panel-active");
        });
    }
    // Register User
    const registerForm = document.querySelector(".register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const firstNameInput = document.getElementById("firstName");
            const lastNameInput = document.getElementById("lastName");
            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");
            const confirmPasswordInput = document.getElementById("confirmPassword");
            if (!firstNameInput || !lastNameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
                alert("Please fill all the fields.");
                return;
            }
            const firstName = firstNameInput.value.trim();
            const lastName = lastNameInput.value.trim();
            const fullName = firstName + " " + lastName;
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();
            const role = "student";
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }
            const userData = { fullName, email, password, role };
            localStorage.setItem("userData", JSON.stringify(userData));
            alert("Registration successful! You can now login.");
            window.location.href = "login.html";
        });
    }
}

function setupSearchFunctionality() {
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    if (!searchInput || !searchResults) {
        console.info("Search functionality not initialized on this page.");
        return;
    }
    const internships = [
        "Software Engineer Intern",
        "Data Analyst Intern",
        "Marketing Intern",
        "Graphic Designer Intern",
        "UI/UX Designer Intern",
        "Web Developer Intern",
        "Product Manager Intern",
        "Content Writer Intern"
    ];
    searchInput.addEventListener("input", function () {
        const query = searchInput.value.toLowerCase();
        searchResults.innerHTML = "";
        if (query) {
            const filteredInternships = internships.filter(intern => intern.toLowerCase().includes(query));
            filteredInternships.forEach(intern => {
                const div = document.createElement("div");
                div.textContent = intern;
                div.addEventListener("click", function () {
                    window.location.href = `internships.html?search=${encodeURIComponent(intern)}`;
                });
                searchResults.appendChild(div);
            });
        }
    });
}
