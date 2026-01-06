document.addEventListener('DOMContentLoaded', () => {
    // Check for active session
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Update student info in dashboard
    if (currentUser.name) {
        document.getElementById('studentName').textContent = currentUser.name;
        document.getElementById('welcomeName').textContent = currentUser.name;
    }

    if (currentUser.email) {
        document.getElementById('userEmail').textContent = currentUser.email;
    }

    // Responsive Sidebar Logic
    const sidebar = document.querySelector('.sidebar');
    const menuBtn = document.getElementById('menuBtn');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleSidebar);
    if (closeSidebar) closeSidebar.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);

    // Close sidebar on menu item click (mobile)
    const menuItemsList = document.querySelectorAll('.menu-item');
    menuItemsList.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
    });

    // Menu navigation
    const menuItems = document.querySelectorAll('.menu-item:not(.logout)');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('pageTitle');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active class from all items
            menuItems.forEach(mi => mi.classList.remove('active'));

            // Add active class to clicked item
            item.classList.add('active');

            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));

            // Show selected section
            const sectionId = item.getAttribute('data-section');
            const activeSection = document.getElementById(sectionId);
            if (activeSection) {
                activeSection.classList.add('active');

                // Update page title
                const sectionName = item.querySelector('span:last-child').textContent;
                pageTitle.textContent = sectionName;
            }
        });
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (confirm('Are you sure you want to logout?')) {
            // Clear current user session
            localStorage.removeItem('currentUser');

            // Redirect to welcome page
            window.location.href = 'index.html';
        }
    });

    // Initialize data placeholders
    let announcements = [];
    let assignments = [];
    let quizzes = [];
    let tests = [];
    let syllabus = [];
    let attendance = [];
    let resources = [];
    let quizResults = [];
    let testResults = [];
    let assignmentSubmissions = [];
    let adjustments = {};
    let students = [];

    // REAL-TIME DATABASE LISTENERS
    function setupFirebaseListeners() {
        const refs = {
            'announcements': (data) => { announcements = data; displayAnnouncements(); },
            'assignments': (data) => { assignments = data; displayAssignments(); },
            'quizzes': (data) => { quizzes = data; displayQuizzes(); },
            'tests': (data) => { tests = data; displayTests(); },
            'syllabus': (data) => { syllabus = data; displaySyllabus(); },
            'attendance': (data) => {
                attendance = data.filter(a => a.rollNumber === currentUser.rollNumber);
                displayAttendance();
            },
            'resources': (data) => { resources = data; displayResources(); },
            'quizResults': (data) => {
                quizResults = data;
                displayLeaderboard();
                updateStats();
            },
            'testResults': (data) => {
                testResults = data;
                displayTests(); // Refresh tests to show score if graded
            },
            'assignmentSubmissions': (data) => {
                assignmentSubmissions = data;
                displayAssignments(); // Refresh assignments as status might change
                updateStats();
            },
            'leaderboardAdjustments': (data) => { adjustments = data || {}; displayLeaderboard(); },
            'students': (data) => { students = data; displayLeaderboard(); }
        };

        Object.keys(refs).forEach(key => {
            database.ref(key).on('value', (snapshot) => {
                const val = snapshot.val();
                let data = [];
                if (val) {
                    if (key === 'leaderboardAdjustments') {
                        data = val;
                    } else {
                        data = Object.keys(val).map(id => ({ ...val[id], firebaseId: id }));
                    }
                }
                refs[key](data);
            });
        });

        displayProfile();
    }

    // Listeners setup moved to end of file to prevent blocking

    function displayAnnouncements() {
        const list = document.getElementById('announcementsList');

        // Filter by class
        const userClass = currentUser.class ? String(currentUser.class) : null;

        const filtered = announcements.filter(a =>
            !a.targetClass ||
            a.targetClass === 'All' ||
            (userClass && String(a.targetClass) === userClass)
        );

        if (filtered.length === 0) {
            list.innerHTML = `<p style="color: #94a3b8; text-align: center; grid-column: 1/-1;">No announcements found for Class ${userClass || '(Not Set)'}.</p>`;
            return;
        }

        // Sort by id (newest first assuming id is timestamp) or use date
        const sorted = [...filtered].sort((a, b) => (b.id || 0) - (a.id || 0));

        list.innerHTML = sorted.map(a => `
            <div class="announcement-card" style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h3 style="color: #1e293b; margin: 0;">${a.title}</h3>
                    <span style="color: #64748b; font-size: 0.875rem;">${a.date}</span>
                </div>
                <p style="color: #475569; line-height: 1.5;">${a.message}</p>
            </div>
        `).join('');
    }

    function displayAssignments() {
        const list = document.getElementById('assignmentsList');

        // Filter by class
        const filtered = assignments.filter(a => !a.targetClass || a.targetClass === 'All' || a.targetClass === currentUser.class);

        if (filtered.length === 0) {
            list.innerHTML = '<p style="color: #94a3b8; text-align: center; grid-column: 1/-1;">No assignments for your class.</p>';
            return;
        }

        list.innerHTML = filtered.map(a => {
            const submission = assignmentSubmissions.find(s => s.assignmentId == a.id && s.rollNumber === currentUser.rollNumber);
            let statusHtml = '';

            if (submission) {
                if (submission.status === 'Graded') {
                    statusHtml = `
                        <div style="margin-top: 1rem; border-top: 1px dashed #cbd5e1; padding-top: 0.5rem;">
                             <span class="status graded" style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 99px; font-size: 0.85rem; font-weight: 600;">Graded</span>
                             <p style="margin-top: 5px; font-weight: bold; color: #166534;">Score: ${submission.marksObtained} / ${a.marks}</p>
                             <p style="font-size: 0.85rem; color: #64748b;">Feedback: ${submission.feedback}</p>
                        </div>
                    `;
                } else {
                    statusHtml = `<span class="status pending" style="background: #fef9c3; color: #854d0e; padding: 4px 12px; border-radius: 99px; font-size: 0.85rem; font-weight: 600; display: inline-block; margin-top: 1rem;">Submitted</span>`;
                }
            } else {
                statusHtml = `<button class="btn-start" onclick="openAssignmentModal(${a.id})" style="margin-top: 1rem; width: 100%;">Submit Assignment</button>`;
            }

            return `
            <div class="assignment-card">
                <h3>${a.title}</h3>
                <p><strong>Subject:</strong> ${a.subject}</p>
                <p style="font-size: 0.9rem; color: #64748b; margin: 0.5rem 0;">${a.description ? a.description.substring(0, 60) + '...' : ''}</p>
                <p><strong>Marks:</strong> ${a.marks} | <strong>Due:</strong> ${a.dueDate}</p>
                ${statusHtml}
            </div>
        `}).join('');
    }

    function displayQuizzes() {
        const list = document.getElementById('quizList');

        // Filter by class
        const filtered = quizzes.filter(q => !q.targetClass || q.targetClass === 'All' || q.targetClass === currentUser.class);

        if (filtered.length === 0) {
            list.innerHTML = '<p style="color: #94a3b8; text-align: center; grid-column: 1/-1;">No quizzes available for your class.</p>';
            return;
        }

        list.innerHTML = filtered.map(q => {
            const result = quizResults.find(r => r.quizId == q.id && r.rollNumber === currentUser.rollNumber);
            let actionHtml = '';

            if (result) {
                actionHtml = `<div style="margin-top: 1rem; font-weight: bold; color: #10b981;">Score: ${result.score} / ${result.total}</div>`;
            } else {
                actionHtml = `<button class="btn-start" onclick="startQuiz(${q.id})" style="margin-top: 1rem;">Start Quiz</button>`;
            }

            return `
                <div class="quiz-card">
                    <h3>${q.title}</h3>
                    <p>Questions: ${q.questions.length} | Duration: ${q.duration} minutes</p>
                    ${actionHtml}
                </div>
            `;
        }).join('');
    }

    function displayTests() {
        const list = document.getElementById('testList');

        // Filter by class
        const filtered = tests.filter(t => !t.targetClass || t.targetClass === 'All' || t.targetClass === currentUser.class);

        if (filtered.length === 0) {
            list.innerHTML = '<p style="color: #94a3b8; text-align: center; grid-column: 1/-1;">No tests scheduled for your class.</p>';
            return;
        }

        list.innerHTML = filtered.map(t => {
            // Check if student already took this test
            const submission = testResults.find(r => r.testId == t.id && r.rollNumber === currentUser.rollNumber);
            let actionHtml = '';

            if (submission) {
                if (submission.status === 'Graded') {
                    actionHtml = `
                        <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed #e2e8f0;">
                            <span style="font-weight: bold; color: #166534;">Score: ${submission.marksObtained} / ${t.totalMarks}</span>
                            <p style="font-size: 0.85rem; color: #64748b; margin-top: 2px;">Feedback: ${submission.feedback}</p>
                        </div>
                    `;
                } else {
                    actionHtml = `<span class="status pending">Result Pending</span>`;
                }
            } else {
                actionHtml = `<button class="btn-start" onclick="startTest(${t.id})">Start Test</button>`;
            }

            return `
            <div class="test-card">
                <h3>${t.title}</h3>
                <p><strong>Subject:</strong> ${t.subject}</p>
                <p>Date: ${t.date} | Time: ${t.time}</p>
                <p>Duration: ${t.duration || 'N/A'} mins</p>
                ${actionHtml}
            </div>
        `}).join('');
    }

    function displaySyllabus() {
        const list = document.getElementById('syllabusList');

        const filtered = syllabus.filter(s => !s.targetClass || s.targetClass === 'All' || s.targetClass === currentUser.class);

        if (filtered.length === 0) {
            list.innerHTML = '<p style="color: #94a3b8; text-align: center; grid-column: 1/-1;">No syllabus found for your class.</p>';
            return;
        }

        list.innerHTML = filtered.map(s => `
            <div class="syllabus-card">
                <h3>${s.subject}</h3>
                <ul>
                    ${s.topics.map(topic => `<li>${topic}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    function displayAttendance() {
        const list = document.getElementById('attendanceList');

        // Group by Month
        const attendanceByMonth = {};
        attendance.forEach(record => {
            const date = new Date(record.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-M
            if (!attendanceByMonth[monthKey]) {
                attendanceByMonth[monthKey] = [];
            }
            attendanceByMonth[monthKey].push(record);
        });

        const today = new Date();
        const currentMonthKey = `${today.getFullYear()}-${today.getMonth() + 1}`;

        // Current Month Calculation
        const currentMonthRecords = attendanceByMonth[currentMonthKey] || [];
        const currentPresentCount = currentMonthRecords.filter(a => a.status === 'present').length;
        // Calculate percentage based on 30 days fixed
        let currentPercentage = Math.min(Math.round((currentPresentCount / 30) * 100), 100);

        // Determine Status
        let statusText = '';
        let statusColor = '';
        if (currentPercentage >= 75) {
            statusText = 'High';
            statusColor = '#10b981'; // Green
        } else if (currentPercentage >= 50) {
            statusText = 'Moderate';
            statusColor = '#f59e0b'; // Orange
        } else {
            statusText = 'Low';
            statusColor = '#ef4444'; // Red
        }

        let html = `
            <div class="attendance-summary" style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 1.5rem; text-align: center;">
                <h3 style="margin: 0; color: #64748b; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px;">Current Month (${today.toLocaleString('default', { month: 'long' })})</h3>
                <div style="font-size: 3rem; font-weight: 700; color: ${statusColor}; margin: 0.5rem 0;">${currentPercentage}%</div>
                <div style="display: inline-block; padding: 0.25rem 1rem; border-radius: 20px; background: ${statusColor}20; color: ${statusColor}; font-weight: 600;">${statusText}</div>
                <p style="margin-top: 0.5rem; color: #94a3b8; font-size: 0.875rem;">${currentPresentCount} / 30 Days Present</p>
            </div>
        `;

        // History Section (Previous Months)
        const historyKeys = Object.keys(attendanceByMonth).filter(k => k !== currentMonthKey).sort((a, b) => {
            const [y1, m1] = a.split('-').map(Number);
            const [y2, m2] = b.split('-').map(Number);
            return (y2 * 12 + m2) - (y1 * 12 + m1); // Sort descending
        });

        if (historyKeys.length > 0) {
            html += '<h3 style="margin: 1.5rem 0 1rem; color: #1e293b;">Previous Months</h3>';
            historyKeys.forEach(key => {
                const records = attendanceByMonth[key];
                const present = records.filter(a => a.status === 'present').length;
                const pct = Math.min(Math.round((present / 30) * 100), 100);
                const [year, month] = key.split('-');
                const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

                html += `
                    <div class="item-card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <div>
                            <h4 style="margin: 0;">${monthName}</h4>
                            <p style="margin: 0; color: #64748b;">${present} / 30 Days Present</p>
                        </div>
                        <div style="font-weight: bold; color: #1e293b;">${pct}%</div>
                    </div>
                `;
            });
        }

        // Recent Activity (Current Month Records)
        if (currentMonthRecords.length > 0) {
            html += '<h3 style="margin: 1.5rem 0 1rem; color: #1e293b;">Recent Activity</h3>';
            currentMonthRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
            html += currentMonthRecords.map(a => `
                <div class="item-card" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>${new Date(a.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                        <p>Status: <span style="color: ${a.status === 'present' ? '#10b981' : '#ef4444'}; text-transform: capitalize; font-weight: bold;">${a.status}</span></p>
                    </div>
                </div>
            `).join('');
        } else if (historyKeys.length === 0) {
            html += '<p style="color: #94a3b8; text-align: center;">No attendance records found.</p>';
        }

        list.innerHTML = html;
    }

    function updateStats() {
        // Pending assignments (not submitted)
        const submittedAssignIds = assignmentSubmissions
            .filter(s => s.rollNumber === currentUser.rollNumber)
            .map(s => s.assignmentId);

        const pendingCount = assignments.filter(a => !submittedAssignIds.includes(a.id)).length;

        // Upcoming quizzes (not taken)
        const takenQuizIds = quizResults
            .filter(r => r.rollNumber === currentUser.rollNumber)
            .map(r => r.quizId);
        const upcomingQuizzes = quizzes.filter(q => !takenQuizIds.includes(q.id)).length;

        // Current week tests (simple count for now)
        const scheduledTests = tests.length;

        const statsCards = document.querySelectorAll('.stat-card h3');
        if (statsCards.length >= 3) {
            statsCards[0].textContent = pendingCount; // Pending Assignments
            statsCards[1].textContent = upcomingQuizzes; // Upcoming Quizzes
            statsCards[2].textContent = scheduledTests;  // Tests Scheduled
        }
    }


    // Quiz Logic
    let currentQuizTimer = null;
    let currentQuizId = null;

    window.startQuiz = function (quizId) {
        const quiz = quizzes.find(q => q.id == quizId);

        if (!quiz) return;

        currentQuizId = quizId;
        const modal = document.getElementById('quizModal');
        const title = document.getElementById('quizModalTitle');
        const questionsContainer = document.getElementById('quizQuestions');
        const submitBtn = document.getElementById('submitQuizBtn');

        title.textContent = quiz.title;
        submitBtn.textContent = 'Submit Quiz';
        submitBtn.onclick = () => submitQuiz(); // Manual submit

        // Render Questions
        questionsContainer.innerHTML = quiz.questions.map((q, index) => `
            <div class="question-item" data-question-index="${index}">
                <h4>${index + 1}. ${q.question}</h4>
                <div class="options-group">
                    ${q.options.map((opt, i) => `
                        <label class="option-label">
                            <input type="radio" name="q_${index}" value="${i}">
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Show Modal
        modal.classList.add('active');

        // Start Timer
        startTimer(quiz.duration);
    };

    function startTimer(durationMinutes) {
        let timeLeft = durationMinutes * 60;
        const timerDisplay = document.getElementById('quizTimer');

        // Clear existing timer if any
        if (currentQuizTimer) clearInterval(currentQuizTimer);

        updateTimerDisplay(timeLeft);

        currentQuizTimer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(currentQuizTimer);
                submitQuiz(true); // Auto submit
            }
        }, 1000);
    }

    function updateTimerDisplay(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        document.getElementById('quizTimer').textContent = `Time Left: ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

        // Visual warning for last minute
        if (seconds < 60) {
            document.getElementById('quizTimer').style.color = '#ef4444';
            document.getElementById('quizTimer').style.borderColor = '#ef4444';
        } else {
            document.getElementById('quizTimer').style.color = '#f43f5e';
            document.getElementById('quizTimer').style.borderColor = 'rgba(244, 63, 94, 0.2)';
        }
    }

    window.submitQuiz = function (isAuto = false) {
        if (currentQuizTimer) clearInterval(currentQuizTimer);

        // Use global quizzes array which is synced from Firebase
        const quiz = quizzes.find(q => q.id === currentQuizId);
        if (!quiz) return;

        let score = 0;
        const total = quiz.questions.length;

        // Calculate Score
        quiz.questions.forEach((q, index) => {
            const selected = document.querySelector(`input[name="q_${index}"]:checked`);
            if (selected && parseInt(selected.value) === q.correctAnswer) {
                score++;
            }
        });

        const result = {
            id: Date.now(),
            studentName: currentUser.name,
            rollNumber: currentUser.rollNumber,
            email: currentUser.email,
            quizId: currentQuizId,
            quizTitle: quiz.title,
            score: score,
            total: total,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };

        database.ref('quizResults').push(result);

        // Show Results in Modal
        const questionsContainer = document.getElementById('quizQuestions');
        const submitBtn = document.getElementById('submitQuizBtn');
        const timerDisplay = document.getElementById('quizTimer');

        timerDisplay.textContent = 'Quiz Completed';

        const percentage = (score / total) * 100;
        let message = '';
        if (percentage >= 80) message = 'Outstanding Performance! 🌟';
        else if (percentage >= 60) message = 'Good Job! 👍';
        else message = 'Keep Practicing! 📚';

        questionsContainer.innerHTML = `
            <div class="quiz-result-overlay">
                <h2>${isAuto ? 'Time\'s Up!' : 'Quiz Submitted!'}</h2>
                <div class="score-display">${score} / ${total} (${Math.round(percentage)}%)</div>
                <p class="score-message">${message}</p>
                <p>Your result has been recorded.</p>
            </div>
        `;

        submitBtn.textContent = 'Close';
        submitBtn.onclick = () => {
            document.getElementById('quizModal').classList.remove('active');
            updateStats(); // Refresh stats to show taken quiz if we track that
        };
    };

    // Test Logic
    let currentTestTimer = null;
    let currentTestId = null;
    let currentQuestionIndex = 0;
    let testAnswers = [];
    let currentTest = null;

    window.startTest = function (testId) {
        currentTest = tests.find(t => t.id == testId);

        if (!currentTest) return;

        currentTestId = testId;
        currentQuestionIndex = 0;

        // Initialize empty answers
        testAnswers = currentTest.questions.map(q => ({
            question: q,
            studentAnswer: ''
        }));

        // UI Setup
        document.getElementById('testModalTitle').textContent = currentTest.title;
        document.getElementById('totalTestQuestions').textContent = currentTest.questions.length;

        // Listeners - clean up old ones to avoid duplicates if re-opening
        const nextBtn = document.getElementById('nextTestQuestionBtn');
        const submitBtn = document.getElementById('submitTestBtn');

        // Clone to remove listeners
        const newNext = nextBtn.cloneNode(true);
        const newSubmit = submitBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNext, nextBtn);
        submitBtn.parentNode.replaceChild(newSubmit, submitBtn);

        document.getElementById('nextTestQuestionBtn').onclick = nextQuestion;
        document.getElementById('submitTestBtn').onclick = () => submitTest();

        renderTestQuestion();
        document.getElementById('testModal').classList.add('active');

        startTestTimer(currentTest.duration);
    };

    function startTestTimer(durationMinutes) {
        let timeLeft = durationMinutes * 60;

        if (currentTestTimer) clearInterval(currentTestTimer);

        updateTestTimerDisplay(timeLeft);

        currentTestTimer = setInterval(() => {
            timeLeft--;
            updateTestTimerDisplay(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(currentTestTimer);
                submitTest(true); // Auto submit
            }
        }, 1000);
    }

    function updateTestTimerDisplay(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        const display = document.getElementById('testTimer');
        display.textContent = `Time Left: ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

        if (seconds < 60) {
            display.style.color = '#ef4444';
        } else {
            display.style.color = '#f43f5e';
        }
    }

    function renderTestQuestion() {
        const qIndex = currentQuestionIndex;
        document.getElementById('currentQuestionNum').textContent = qIndex + 1;
        document.getElementById('testQuestionNumber').textContent = `Question ${qIndex + 1}`;
        document.getElementById('testQuestionText').textContent = currentTest.questions[qIndex];
        document.getElementById('testAnswerInput').value = testAnswers[qIndex].studentAnswer;

        // Buttons
        const nextBtn = document.getElementById('nextTestQuestionBtn');
        const submitBtn = document.getElementById('submitTestBtn');

        if (qIndex === currentTest.questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            submitBtn.style.display = 'none';
        }
    }

    function nextQuestion() {
        // Save current answer
        const currentInput = document.getElementById('testAnswerInput').value;
        testAnswers[currentQuestionIndex].studentAnswer = currentInput;

        if (currentQuestionIndex < currentTest.questions.length - 1) {
            currentQuestionIndex++;
            renderTestQuestion();
        }
    }

    window.submitTest = function (isAuto = false) {
        if (currentTestTimer) clearInterval(currentTestTimer);

        // Save last answer if manual submit
        if (!isAuto) {
            const currentInput = document.getElementById('testAnswerInput').value;
            testAnswers[currentQuestionIndex].studentAnswer = currentInput;
        }

        const result = {
            id: Date.now(),
            testId: currentTestId,
            testTitle: currentTest.title,
            studentName: currentUser.name,
            rollNumber: currentUser.rollNumber,
            email: currentUser.email,
            answers: testAnswers,
            marksObtained: null,
            feedback: null,
            status: 'Pending',
            dateTaken: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
        };

        database.ref('testResults').push(result);

        // Reset UI
        document.getElementById('testModal').classList.remove('active');

        // Show confirmation
        alert(isAuto ? "Time is up! Your test has been submitted." : "Test submitted successfully!");

        // Refresh list
        displayTests();
    };

    // Assignment Submission Logic
    let currentAssignmentId = null;

    // Close Modal
    document.getElementById('closeAssignmentModal').addEventListener('click', () => {
        document.getElementById('assignmentModal').classList.remove('active');
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('submissionStatus').style.display = 'none';
        document.getElementById('assignmentFile').value = '';
    });

    window.openAssignmentModal = function (id) {
        const assignment = assignments.find(a => a.id == id);

        if (!assignment) return;

        currentAssignmentId = id;
        document.getElementById('assignmentModalTitle').textContent = `Submit: ${assignment.title}`;
        document.getElementById('amTitle').textContent = assignment.title;
        document.getElementById('amDescription').textContent = assignment.description;
        document.getElementById('amMarks').textContent = assignment.marks;

        document.getElementById('assignmentModal').classList.add('active');
    };

    window.submitAssignment = function () {
        const fileInput = document.getElementById('assignmentFile');
        const errorEl = document.getElementById('uploadError');

        if (fileInput.files.length === 0) {
            errorEl.textContent = "Please select a file to upload.";
            errorEl.style.display = 'block';
            return;
        }

        const file = fileInput.files[0];

        // 500KB limit (approx)
        if (file.size > 500000) {
            errorEl.textContent = "File size exceeds 500KB limit.";
            errorEl.style.display = 'block';
            return;
        }

        errorEl.style.display = 'none';

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = function () {
            const base64File = reader.result;

            const submission = {
                id: Date.now(),
                assignmentId: currentAssignmentId,
                studentName: currentUser.name,
                rollNumber: currentUser.rollNumber,
                email: currentUser.email,
                fileData: base64File,
                fileName: file.name,
                fileType: file.type,
                dateSubmitted: new Date().toLocaleDateString(),
                status: 'Pending',
                marksObtained: 0,
                feedback: ''
            };

            database.ref('assignmentSubmissions').push(submission);

            // Show success
            document.getElementById('uploadSection').style.display = 'none';
            document.getElementById('submissionStatus').style.display = 'block';

            // Refresh list
            displayAssignments();
        };

        reader.onerror = function (error) {
            console.log('Error: ', error);
            errorEl.textContent = "Error reading file. Please try again.";
            errorEl.style.display = 'block';
        };
    };

    function displayResources() {
        const list = document.getElementById('studentResourcesList');
        if (!list) return;

        const filtered = resources.filter(r => !r.targetClass || r.targetClass === 'All' || r.targetClass === currentUser.class);

        if (filtered.length === 0) {
            list.innerHTML = '<p style="color: #94a3b8; padding: 2rem;">No study resources for your class yet.</p>';
            return;
        }

        list.innerHTML = filtered.map(res => `
            <div class="stat-card" style="flex-direction: column; align-items: flex-start; gap: 1rem; position: relative;">
                <span style="position: absolute; top: 1rem; right: 1rem; font-size: 0.75rem; background: var(--primary-color); padding: 2px 8px; border-radius: 10px;">${res.type}</span>
                <div style="font-size: 1.5rem;">
                    ${res.type === 'Video' ? '<i class="fas fa-video"></i>' : res.type === 'PDF' ? '<i class="fas fa-file-pdf"></i>' : '<i class="fas fa-link"></i>'}
                </div>
                <div>
                    <h4 style="color: white; margin-bottom: 0.25rem;">${res.title}</h4>
                    <p style="font-size: 0.8rem; color: #94a3b8;">Shared on ${res.date}</p>
                </div>
                <a href="${res.link}" target="_blank" class="btn-primary" style="width: 100%; text-align: center; text-decoration: none; font-size: 0.9rem; padding: 0.6rem;">Access Material</a>
            </div>
        `).join('');
    }

    function displayLeaderboard() {
        const tbody = document.getElementById('studentLeaderboardBody');
        if (!tbody) return;

        const leaderboardData = {};

        // Process all students
        students.forEach(student => {
            const email = student.email;
            leaderboardData[email] = {
                name: student.name,
                points: adjustments[email.replace(/\./g, ',')] || 0,
                quizzes: 0
            };
        });

        // Add quiz results
        quizResults.forEach(result => {
            const email = result.email;
            if (!email) return;

            if (!leaderboardData[email]) {
                leaderboardData[email] = {
                    name: result.studentName || email.split('@')[0],
                    points: adjustments[email.replace(/\./g, ',')] || 0,
                    quizzes: 0
                };
            }
            leaderboardData[email].points += parseInt(result.score);
            leaderboardData[email].quizzes += 1;
        });

        const sortedScores = Object.values(leaderboardData)
            .filter(s => s.points > 0) // Filter out students with 0 points
            .sort((a, b) => b.points - a.points);

        if (sortedScores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 3rem; color: #94a3b8;">Rankings are empty.</td></tr>';
            return;
        }

        tbody.innerHTML = sortedScores.map((student, index) => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                <td style="padding: 1.25rem;"><span style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'rgba(255,255,255,0.05)'}; color: ${index < 3 ? '#000' : '#fff'}; border-radius: 50%; font-weight: bold; font-size: 0.85rem;">${index + 1}</span></td>
                <td style="padding: 1.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 1.2rem;">${index === 0 ? '<i class="fas fa-crown" style="color: gold;"></i>' : '<i class="fas fa-user"></i>'}</span>
                        <span style="font-weight: 500;">${student.name} ${student.name === currentUser.name ? '(You)' : ''}</span>
                    </div>
                </td>
                <td style="padding: 1.25rem; font-weight: 600; color: var(--primary-color);">${student.points}</td>
                <td style="padding: 1.25rem;">${student.quizzes}</td>
            </tr>
        `).join('');
    }

    function displayProfile() {
        if (!currentUser) return;
        document.getElementById('profileName').textContent = currentUser.name || 'N/A';
        document.getElementById('profileEmail').textContent = currentUser.email || 'N/A';
        document.getElementById('profileRoll').textContent = currentUser.rollNumber || 'N/A';

        // Password Logic
        const passwordInput = document.getElementById('profilePassword');
        if (passwordInput && currentUser.password) {
            passwordInput.value = currentUser.password;
        }

        const toggleBtn = document.getElementById('togglePasswordBtn');
        const icon = document.getElementById('passwordIcon');

        // Remove old listeners to prevent duplicates if function called multiple times
        const newToggle = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newToggle, toggleBtn);

        newToggle.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // Safe Initialization
    try {
        if (typeof database !== 'undefined') {
            setupFirebaseListeners();
        } else {
            console.warn("Firebase database not initialized. UI running in offline/empty mode.");
            // Render empty states
            displayAnnouncements();
            displayAssignments();
            displayQuizzes();
            displayTests();
            displaySyllabus();
            displayAttendance();
            displayResources();
            displayLeaderboard();
            displayProfile();
            updateStats();
        }
    } catch (error) {
        console.error("Error initializing dashboard data:", error);
    }
});
