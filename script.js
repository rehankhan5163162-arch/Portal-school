document.addEventListener('DOMContentLoaded', () => {
    const signupBtn = document.getElementById('signupBtn');
    const loginBtn = document.getElementById('loginBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    const signupModal = document.getElementById('signupModal');
    const loginModal = document.getElementById('loginModal');
    const settingsModal = document.getElementById('settingsModal');

    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const settingsForm = document.getElementById('settingsForm');

    // Add ripple CSS dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            background-color: rgba(255, 255, 255, 0.3);
            pointer-events: none;
        }
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    const addRippleEffect = (e) => {
        const btn = e.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - btn.offsetLeft - radius}px`;
        circle.style.top = `${e.clientY - btn.offsetTop - radius}px`;
        circle.classList.add('ripple');

        const ripple = btn.getElementsByClassName('ripple')[0];

        if (ripple) {
            ripple.remove();
        }

        btn.appendChild(circle);
    };

    // Modal functions
    const openModal = (modal) => {
        modal.classList.add('show');
        modal.style.display = 'flex';
    };

    const closeModal = (modal) => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    };

    // Button click handlers
    signupBtn.addEventListener('click', (e) => {
        addRippleEffect(e);
        setTimeout(() => {
            openModal(signupModal);
        }, 200);
    });

    loginBtn.addEventListener('click', (e) => {
        addRippleEffect(e);
        setTimeout(() => {
            openModal(loginModal);
        }, 200);
    });

    // Close button handlers
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modalId = closeBtn.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === signupModal) {
            closeModal(signupModal);
        }
        if (e.target === loginModal) {
            closeModal(loginModal);
        }
        if (e.target === themeModal) {
            closeModal(themeModal);
        }
    });

    // Form submission handlers
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(signupForm);
        const data = Object.fromEntries(formData);

        // Fetch existing students from Firebase to check for duplicates
        database.ref('students').once('value', (snapshot) => {
            const val = snapshot.val();
            const students = val ? Object.values(val) : [];

            // Check if email or roll number already exists
            if (students.some(s => s.email === data.email || s.rollNumber === data.rollNumber)) {
                alert('Student with this Email or Roll Number already exists!');
                return;
            }

            // Add new student to Firebase
            database.ref('students').push(data).then(() => {
                // Set current user session
                localStorage.setItem('currentUser', JSON.stringify(data));

                console.log('Sign Up Data:', data);
                alert(`Welcome ${data.name}! Your account has been created.\nRedirecting to dashboard...`);

                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            });
        });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const password = formData.get('password');

        // Admin Check
        if (email === 'rehankhan1668634@gmail.com' && password === 'Admin1668634') {
            console.log('Admin Login Success');
            alert('Welcome Admin! Redirecting to Admin Dashboard...');
            window.location.href = 'admin.html';
            return;
        }

        // Fetch students from Firebase
        database.ref('students').once('value', (snapshot) => {
            const val = snapshot.val();
            const students = val ? Object.values(val) : [];

            // Find student with matching email and password
            const student = students.find(s => s.email === email && s.password === password);

            if (student) {
                // Set current user session
                localStorage.setItem('currentUser', JSON.stringify(student));

                console.log('Login Success:', student.name);
                alert(`Welcome back, ${student.name}!\nLogging in...`);

                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid Email or Password! Please try again.');
            }
        });
    });

    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => otherItem.classList.remove('active'));

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});
