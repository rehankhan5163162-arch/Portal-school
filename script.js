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

    settingsBtn.addEventListener('click', (e) => {
        addRippleEffect(e);
        setTimeout(() => {
            openModal(settingsModal);
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
        if (e.target === settingsModal) {
            closeModal(settingsModal);
        }
    });

    // Form submission handlers
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(signupForm);
        const data = Object.fromEntries(formData);

        // Get existing students
        const students = JSON.parse(localStorage.getItem('students') || '[]');

        // Check if email or roll number already exists
        if (students.some(s => s.email === data.email || s.rollNumber === data.rollNumber)) {
            alert('Student with this Email or Roll Number already exists!');
            return;
        }

        // Add new student
        students.push(data);
        localStorage.setItem('students', JSON.stringify(students));

        // Set current user session
        localStorage.setItem('currentUser', JSON.stringify(data));

        console.log('Sign Up Data:', data);
        alert(`Welcome ${data.name}! Your account has been created.\nRedirecting to dashboard...`);

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData);

        // Get existing students
        const students = JSON.parse(localStorage.getItem('students') || '[]');

        // Find student
        const student = students.find(s => s.rollNumber === data.rollNumber && s.name === data.name); // Simple validation for now

        if (student) {
            // Set current user session
            localStorage.setItem('currentUser', JSON.stringify(student));

            console.log('Login Data:', data);
            alert(`Welcome back, ${student.name}!\nLogging in...`);

            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid Name or Roll Number! Please try again or Sign Up.');
        }
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

    // Enhanced Settings Logic
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const toggleAnimations = document.getElementById('toggle-animations');
    const clearDataBtn = document.getElementById('clearDataBtn');
    const backgroundAnim = document.querySelector('.background-animation');

    // Load saved preferences
    const savedAnim = localStorage.getItem('settings-animations');
    if (savedAnim === 'false') {
        toggleAnimations.checked = false;
        if (backgroundAnim) backgroundAnim.style.display = 'none';
    }

    const savedNotifs = localStorage.getItem('settings-notifications');
    if (savedNotifs === 'false') document.getElementById('toggle-notifications').checked = false;

    const savedSounds = localStorage.getItem('settings-sounds');
    if (savedSounds === 'true') document.getElementById('toggle-sounds').checked = true;

    // Tab Switching
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            settingsTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // Animation Toggle
    toggleAnimations.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        localStorage.setItem('settings-animations', isEnabled);
        if (backgroundAnim) {
            backgroundAnim.style.display = isEnabled ? 'block' : 'none';
        }
    });

    // Other Toggles (Mock functionality)
    document.getElementById('toggle-notifications').addEventListener('change', (e) => {
        localStorage.setItem('settings-notifications', e.target.checked);
    });

    document.getElementById('toggle-sounds').addEventListener('change', (e) => {
        localStorage.setItem('settings-sounds', e.target.checked);
    });

    // Clear Data
    clearDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all data? This will log you out and reset all records.')) {
            localStorage.clear();
            alert('All data has been cleared. Redirecting...');
            window.location.reload();
        }
    });

    // Settings form submission handler
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(settingsForm);
        const password = formData.get('password');

        // Check if password is correct
        if (password === 'admin123') {
            console.log('Settings access granted');
            alert('Access Granted! Redirecting to Admin Dashboard...');

            // Redirect to admin dashboard
            window.location.href = 'admin.html';
        } else {
            alert('Incorrect Password! Please try again.');
            settingsForm.reset();
        }
    });
});
