document.addEventListener('DOMContentLoaded', () => {
    // Initialize data placeholders
    let announcements = [];
    let assignments = [];
    let quizzes = [];
    let tests = [];
    let syllabus = [];
    let attendance = [];
    let students = [];
    let resources = [];
    let quizResults = [];
    let adjustments = {};

    // REAL-TIME DATABASE LISTENERS
    function setupFirebaseListeners() {
        const refs = {
            'announcements': (data) => { announcements = data; displayAnnouncements(); },
            'assignments': (data) => { assignments = data; displayAssignments(); },
            'quizzes': (data) => { quizzes = data; displayQuizzes(); },
            'tests': (data) => { tests = data; displayTests(); },
            'syllabus': (data) => { syllabus = data; displaySyllabus(); },
            'attendance': (data) => { attendance = data; displayAttendance(); },
            'students': (data) => { students = data; displayStudents(); },
            'resources': (data) => { resources = data; displayResources(resources); initResources(resources); },
            'quizResults': (data) => { quizResults = data; displayLeaderboard(quizResults, adjustments); initLeaderboardControl(quizResults, adjustments); },
            'leaderboardAdjustments': (data) => { adjustments = data || {}; displayLeaderboard(quizResults, adjustments); initLeaderboardControl(quizResults, adjustments); },
            'testResults': (data) => { /* handled inside specific views if needed, or kept in sync */ },
            'assignmentSubmissions': (data) => { /* same */ }
        };

        Object.keys(refs).forEach(key => {
            database.ref(key).on('value', (snapshot) => {
                const val = snapshot.val();
                let data = [];
                if (val) {
                    if (key === 'leaderboardAdjustments') {
                        data = val;
                    } else {
                        // Convert object to array for compatibility with existing display logic
                        data = Object.keys(val).map(id => ({ ...val[id], firebaseId: id }));
                    }
                }
                refs[key](data);
                updateStats();
            });
        });
    }

    // Initialize listeners
    setupFirebaseListeners();

    // Stats update helper
    function updateStats() {
        document.getElementById('totalAnnouncements').textContent = announcements.length;
        document.getElementById('totalAssignments').textContent = assignments.length;
        document.getElementById('totalQuizzes').textContent = quizzes.length;
        document.getElementById('totalStudents').textContent = students.length;
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

            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(section => section.classList.remove('active'));

            const sectionId = item.getAttribute('data-section');
            const activeSection = document.getElementById(sectionId);
            if (activeSection) {
                activeSection.classList.add('active');
                const sectionName = item.querySelector('span:last-child').textContent;
                pageTitle.textContent = sectionName;
            }
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = 'index.html';
        }
    });

    // Announcement Form
    document.getElementById('announcementForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('announcement-title').value;
        const targetClass = document.getElementById('announcement-class').value;
        const message = document.getElementById('announcement-message').value;

        const announcement = {
            id: Date.now(),
            title,
            targetClass,
            message,
            date: new Date().toLocaleDateString()
        };

        database.ref('announcements').push(announcement);

        e.target.reset();
        alert('Announcement posted successfully!');
    });

    // Assignment Form
    // Assignment Form
    document.getElementById('assignmentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('assignment-title').value;
        const targetClass = document.getElementById('assignment-class').value;
        const subject = document.getElementById('assignment-subject').value;
        const description = document.getElementById('assignment-description').value;
        const marks = document.getElementById('assignment-marks').value;
        const dueDate = document.getElementById('assignment-due').value;

        const assignment = {
            id: Date.now(),
            title,
            targetClass,
            subject,
            description,
            marks,
            dueDate,
            createdDate: new Date().toLocaleDateString()
        };

        database.ref('assignments').push(assignment);

        e.target.reset();
        alert('Assignment created successfully!');
    });

    // Quiz Form
    let questionCount = 1;

    document.getElementById('addQuestionBtn').addEventListener('click', () => {
        questionCount++;
        const container = document.getElementById('questionsContainer');
        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block';
        questionBlock.innerHTML = `
            <div class="form-group">
                <label>Question ${questionCount}</label>
                <input type="text" class="question-text" placeholder="Enter question" required>
            </div>
            <div class="options-grid">
                <input type="text" class="option" placeholder="Option A" required>
                <input type="text" class="option" placeholder="Option B" required>
                <input type="text" class="option" placeholder="Option C" required>
                <input type="text" class="option" placeholder="Option D" required>
            </div>
            <div class="form-group">
                <label>Correct Answer</label>
                <select class="correct-answer" required>
                    <option value="">Select correct answer</option>
                    <option value="0">Option A</option>
                    <option value="1">Option B</option>
                    <option value="2">Option C</option>
                    <option value="3">Option D</option>
                </select>
            </div>
        `;
        container.appendChild(questionBlock);
    });

    document.getElementById('quizForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('quiz-title').value;
        const targetClass = document.getElementById('quiz-class').value;
        const duration = document.getElementById('quiz-duration').value;

        const container = document.getElementById('questionsContainer');
        const questionBlocks = container.querySelectorAll('.question-block');
        const questions = [];

        questionBlocks.forEach(block => {
            const questionText = block.querySelector('.question-text').value;
            const options = Array.from(block.querySelectorAll('.option')).map(opt => opt.value);
            const correctAnswer = parseInt(block.querySelector('.correct-answer').value);

            questions.push({
                question: questionText,
                options,
                correctAnswer
            });
        });

        const quiz = {
            id: Date.now(),
            title,
            targetClass,
            duration,
            questions,
            createdDate: new Date().toLocaleDateString()
        };

        database.ref('quizzes').push(quiz);

        e.target.reset();
        // Reset to 1 question
        document.getElementById('questionsContainer').innerHTML = `
            <h3>Questions</h3>
            <div class="question-block">
                <div class="form-group">
                    <label>Question 1</label>
                    <input type="text" class="question-text" placeholder="Enter question" required>
                </div>
                <div class="options-grid">
                    <input type="text" class="option" placeholder="Option A" required>
                    <input type="text" class="option" placeholder="Option B" required>
                    <input type="text" class="option" placeholder="Option C" required>
                    <input type="text" class="option" placeholder="Option D" required>
                </div>
                <div class="form-group">
                    <label>Correct Answer</label>
                    <select class="correct-answer" required>
                        <option value="">Select correct answer</option>
                        <option value="0">Option A</option>
                        <option value="1">Option B</option>
                        <option value="2">Option C</option>
                        <option value="3">Option D</option>
                    </select>
                </div>
            </div>
        `;
        questionCount = 1;
        alert('Quiz created successfully!');
    });

    // Test Form
    let testQuestionCount = 1;

    document.getElementById('addTestQuestionBtn').addEventListener('click', () => {
        testQuestionCount++;
        const container = document.getElementById('testQuestionsContainer');
        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block';
        questionBlock.innerHTML = `
            <div class="form-group">
                <label>Question ${testQuestionCount}</label>
                <textarea class="test-question-text" rows="2" placeholder="Enter question" required></textarea>
            </div>
        `;
        container.appendChild(questionBlock);
    });

    document.getElementById('testForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('test-title').value;
        const targetClass = document.getElementById('test-class').value;
        const subject = document.getElementById('test-subject').value;
        const date = document.getElementById('test-date').value;
        const time = document.getElementById('test-time').value;
        const duration = document.getElementById('test-duration').value;
        const totalMarks = document.getElementById('test-marks').value;

        const container = document.getElementById('testQuestionsContainer');
        const questionElements = container.querySelectorAll('.test-question-text');
        const questions = Array.from(questionElements).map(q => q.value);

        const test = {
            id: Date.now(),
            title,
            targetClass,
            subject,
            date,
            time,
            duration,
            totalMarks,
            questions
        };

        database.ref('tests').push(test);

        e.target.reset();

        // Reset questions to 1
        document.getElementById('testQuestionsContainer').innerHTML = `
            <h3>Questions</h3>
            <div class="question-block">
                <div class="form-group">
                    <label>Question 1</label>
                    <textarea class="test-question-text" rows="2" placeholder="Enter question" required></textarea>
                </div>
            </div>
        `;
        testQuestionCount = 1;

        alert('Test scheduled successfully!');
    });

    // Syllabus Form
    document.getElementById('syllabusForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = document.getElementById('syllabus-subject').value;
        const targetClass = document.getElementById('syllabus-class').value;
        const topics = document.getElementById('syllabus-topics').value.split('\n').filter(t => t.trim());

        const syllabusItem = {
            id: Date.now(),
            subject,
            targetClass,
            topics
        };

        database.ref('syllabus').push(syllabusItem);

        e.target.reset();
        alert('Syllabus updated successfully!');
    });

    // Attendance Form
    document.getElementById('attendanceForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('attendance-date').value;
        const rollNumber = document.getElementById('student-roll').value;
        const status = document.getElementById('attendance-status').value;

        const attendanceRecord = {
            id: Date.now(),
            date,
            rollNumber,
            status
        };

        database.ref('attendance').push(attendanceRecord);

        e.target.reset();
        alert('Attendance updated successfully!');
    });

    // Display functions
    function displayAnnouncements() {
        const list = document.getElementById('announcementsList');

        if (announcements.length === 0) {
            list.innerHTML = '<h3>Recent Announcements</h3><p style="color: #94a3b8;">No announcements yet.</p>';
            return;
        }

        // Sort by date (newest first)
        const sorted = [...announcements].sort((a, b) => b.id - a.id);

        list.innerHTML = '<h3>Recent Announcements</h3>' + sorted.map(a => `
            <div class="item-card">
                <h4>${a.title}</h4>
                <p>${a.message}</p>
                <div class="meta">Posted on: ${a.date}</div>
                <button class="btn-delete" onclick="deleteItem('announcements', '${a.firebaseId}')">Delete</button>
            </div>
        `).join('');
    }

    function displayAssignments() {
        const list = document.getElementById('assignmentsList');

        if (assignments.length === 0) {
            list.innerHTML = '<h3>All Assignments</h3><p style="color: #94a3b8;">No assignments yet.</p>';
            return;
        }

        const sorted = [...assignments].sort((a, b) => b.id - a.id);

        list.innerHTML = '<h3>All Assignments</h3>' + sorted.map(a => `
            <div class="item-card">
                <h4>${a.title}</h4>
                <p><strong>Subject:</strong> ${a.subject}</p>
                <p><strong>Criteria:</strong> ${a.description ? a.description.substring(0, 50) + '...' : 'No description'}</p>
                <p><strong>Marks:</strong> ${a.marks || 'N/A'} | <strong>Due:</strong> ${a.dueDate}</p>
                <div class="meta">Created: ${a.createdDate}</div>
                <div style="margin-top: 1rem;">
                    <button class="btn-view" onclick="gradeAssignment('${a.firebaseId}')">Grade Assignment</button>
                    <button class="btn-delete" onclick="deleteItem('assignments', '${a.firebaseId}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    function displayQuizzes() {
        const list = document.getElementById('quizList');

        if (quizzes.length === 0) {
            list.innerHTML = '<h3>All Quizzes</h3><p style="color: #94a3b8;">No quizzes yet.</p>';
            return;
        }

        const sorted = [...quizzes].sort((a, b) => b.id - a.id);

        list.innerHTML = '<h3>All Quizzes</h3>' + sorted.map(q => `
            <div class="item-card">
                <h4>${q.title}</h4>
                <p><strong>Questions:</strong> ${q.questions.length} | <strong>Duration:</strong> ${q.duration} minutes</p>
                <div class="meta">Created: ${q.createdDate}</div>
                <div style="margin-top: 1rem;">
                    <button class="btn-view" onclick="viewResults('${q.firebaseId}')">View Results</button>
                    <button class="btn-delete" onclick="deleteItem('quizzes', '${q.firebaseId}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    function displayTests() {
        const list = document.getElementById('testsList');

        if (tests.length === 0) {
            list.innerHTML = '<h3>Scheduled Tests</h3><p style="color: #94a3b8;">No tests scheduled.</p>';
            return;
        }

        const sorted = [...tests].sort((a, b) => b.id - a.id);

        list.innerHTML = '<h3>Scheduled Tests</h3>' + sorted.map(t => `
            <div class="item-card">
                <h4>${t.title}</h4>
                <p><strong>Subject:</strong> ${t.subject}</p>
                <div class="meta">Date: ${t.date} at ${t.time}</div>
                <div class="meta">Duration: ${t.duration || 'N/A'} mins | Marks: ${t.totalMarks || 'N/A'}</div>
                <div style="margin-top: 1rem;">
                    <button class="btn-view" onclick="gradeTest('${t.firebaseId}')">Grade Test</button>
                    <button class="btn-delete" onclick="deleteItem('tests', '${t.firebaseId}')">Delete</button>
                </div>
            </div>
            `).join('');
    }

    function displaySyllabus() {
        const list = document.getElementById('syllabusList');

        if (syllabus.length === 0) {
            list.innerHTML = '<h3>Current Syllabus</h3><p style="color: #94a3b8;">No syllabus added yet.</p>';
            return;
        }

        list.innerHTML = '<h3>Current Syllabus</h3>' + syllabus.map(s => `
            <div class="item-card">
                <h4>${s.subject}</h4>
                <ul style="margin-top: 1rem; list-style: none;">
                    ${s.topics.map(topic => `<li style="padding: 0.5rem 0; color: #94a3b8;">→ ${topic}</li>`).join('')}
                </ul>
                <button class="btn-delete" onclick="deleteItem('syllabus', '${s.firebaseId}')">Delete</button>
            </div>
            `).join('');
    }

    function displayAttendance() {
        const list = document.getElementById('attendanceList');

        if (attendance.length === 0) {
            list.innerHTML = '<h3>Attendance Records</h3><p style="color: #94a3b8;">No attendance records yet.</p>';
            return;
        }

        const sorted = [...attendance].sort((a, b) => b.id - a.id);

        list.innerHTML = '<h3>Attendance Records</h3>' + sorted.map(a => `
            <div class="item-card">
                <h4>Roll Number: ${a.rollNumber}</h4>
                <p><strong>Status:</strong> <span style="color: ${a.status === 'present' ? '#10b981' : '#ef4444'}; text-transform: capitalize;">${a.status}</span></p>
                <div class="meta">Date: ${a.date}</div>
                <button class="btn-delete" onclick="deleteItem('attendance', '${a.firebaseId}')">Delete</button>
            </div>
            `).join('');
    }

    function displayStudents() {
        const tbody = document.getElementById('studentsTableBody');

        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #94a3b8;">No students registered yet.</td></tr>';
            return;
        }

        tbody.innerHTML = students.map((s) => `
            <tr>
                <td><div style="font-weight: 500;">${s.name}</div></td>
                <td><span class="status-badge" style="background: #e0f2fe; color: #0369a1;">Class ${s.class || 'N/A'}</span></td>
                <td>${s.rollNumber}</td>
                <td>${s.email}</td>
                <td>
                    <button class="btn-view" style="padding: 4px 12px; font-size: 0.8rem;" onclick="openEditStudentModal('${s.firebaseId}')">Edit</button>
                    <!-- <button class="btn-delete" style="padding: 4px 12px; font-size: 0.8rem;" onclick="deleteStudent('${s.firebaseId}')">Remove</button> -->
                </td>
            </tr>
        `).join('');
    }

    function updateStats() {
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const students = JSON.parse(localStorage.getItem('students') || '[]');

        document.getElementById('totalAnnouncements').textContent = announcements.length;
        document.getElementById('totalAssignments').textContent = assignments.length;
        document.getElementById('totalQuizzes').textContent = quizzes.length;
        document.getElementById('totalStudents').textContent = students.length;
    }

    // Global delete function
    window.deleteItem = function (type, firebaseId) {
        if (confirm('Are you sure you want to delete this item?')) {
            database.ref(type).child(firebaseId).remove();
        }
    };

    // Delete student function
    window.deleteStudent = function (firebaseId) {
        if (confirm('Are you sure you want to remove this student?')) {
            database.ref('students').child(firebaseId).remove();
        }
    };

    // Delete resource helper
    window.deleteResource = function (firebaseId) {
        if (confirm('Delete this resource?')) {
            database.ref('resources').child(firebaseId).remove();
        }
    };

    // Initial display
    displayAnnouncements();
    displayAssignments();
    displayQuizzes();
    displayTests();
    displaySyllabus();
    displayAttendance();
    displayStudents();

    // Results Modal Logic
    const resultsModal = document.getElementById('resultsModal');
    const closeResultsBtn = document.getElementById('closeResultsModal');

    closeResultsBtn.addEventListener('click', () => {
        resultsModal.classList.remove('active');
    });

    window.clickOutside = function (e) {
        if (e.target == resultsModal) {
            resultsModal.classList.remove('active');
        }
    }
    window.addEventListener('click', window.clickOutside);

    window.viewResults = function (quizFirebaseId) {
        database.ref('quizResults').once('value', (snapshot) => {
            const resultsVal = snapshot.val();
            const results = resultsVal ? Object.keys(resultsVal).map(id => ({ ...resultsVal[id], firebaseId: id })) : [];
            const quiz = quizzes.find(q => q.firebaseId === quizFirebaseId);

            if (!quiz) return;

            document.getElementById('resultsModalTitle').textContent = `Results: ${quiz.title} `;
            const tbody = document.getElementById('resultsTableBody');

            // Filter results for this quiz (using the numeric id for filtering if that's what's stored)
            const filteredResults = results.filter(r => r.quizId == quiz.id);

            // Sort by Score (Desc) then Date (Desc)
            filteredResults.sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date));

            if (filteredResults.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No students have taken this quiz yet.</td></tr>';
            } else {
                tbody.innerHTML = filteredResults.map(r => {
                    const percentage = Math.round((r.score / r.total) * 100);
                    let colorClass = '#ef4444'; // Red
                    if (percentage >= 80) colorClass = '#10b981'; // Green
                    else if (percentage >= 60) colorClass = '#f59e0b'; // Orange

                    return `
                <tr>
                            <td><strong>${r.studentName || 'Unknown'}</strong></td>
                            <td>${r.rollNumber || 'N/A'}</td>
                            <td><span style="font-weight: bold; color: ${colorClass}">${r.score} / ${r.total}</span></td>
                            <td><span style="padding: 2px 8px; border-radius: 10px; background: ${colorClass}20; color: ${colorClass}; font-size: 0.85rem; font-weight: 600;">${percentage}%</span></td>
                            <td>${r.date} <span style="font-size: 0.8em; color: #64748b; margin-left: 5px;">${r.time}</span></td>
                </tr>
                `;
                }).join('');
            }
            resultsModal.classList.add('active');
        });
    };

    window.gradeTest = function (testFirebaseId) {
        database.ref('testResults').once('value', (snapshot) => {
            const resultsVal = snapshot.val();
            const results = resultsVal ? Object.keys(resultsVal).map(id => ({ ...resultsVal[id], firebaseId: id })) : [];
            const test = tests.find(t => t.firebaseId === testFirebaseId);

            if (!test) return;

            document.getElementById('gradingModalTitle').textContent = `Grade: ${test.title}`;
            const submissionsList = document.getElementById('studentSubmissionsList');

            // Filter results for this test
            const testSubmissions = results.filter(r => r.testId == test.id);

            if (testSubmissions.length === 0) {
                submissionsList.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 2rem;">No students have submitted this test yet.</p>';
            } else {
                submissionsList.innerHTML = testSubmissions.map(sub => `
                    <div class="item-card" onclick="viewSubmission('${sub.firebaseId}')" style="cursor: pointer; transition: transform 0.2s;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4>${sub.studentName}</h4>
                                <p class="meta">Roll: ${sub.rollNumber} | Submitted: ${sub.dateTaken}</p>
                            </div>
                            <div class="status-badge" style="background: ${sub.status === 'Graded' ? '#dcfce7' : '#fef9c3'}; color: ${sub.status === 'Graded' ? '#166534' : '#854d0e'}; padding: 4px 12px; border-radius: 99px; font-size: 0.85rem; font-weight: 600;">
                                ${sub.status || 'Pending'}
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            gradingModal.classList.add('active');
        });
    };

    window.viewSubmission = function (submissionFirebaseId) {
        database.ref('testResults').child(submissionFirebaseId).once('value', (snapshot) => {
            const submission = snapshot.val();
            if (!submission) return;

            const test = tests.find(t => t.id == submission.testId);

            // Populate Interface
            document.getElementById('studentSubmissionsList').style.display = 'none';
            document.getElementById('gradingInterface').style.display = 'block';

            document.getElementById('gradingStudentName').textContent = submission.studentName;
            document.getElementById('currentSubmissionId').value = submissionFirebaseId; // Store firebaseId
            document.getElementById('gradingTotalMarks').textContent = test ? test.totalMarks : '-';
            document.getElementById('gradingMarks').value = submission.marksObtained || '';
            document.getElementById('gradingFeedback').value = submission.feedback || 'Good Job';

            // Render Questions and Answers
            const container = document.getElementById('gradingQuestionsContainer');
            container.innerHTML = submission.answers.map((ans, index) => `
                <div class="qa-block" style="margin-bottom: 1.5rem; background: #f8fafc; padding: 1rem; border-radius: 8px;">
                    <p style="font-weight: 600; color: #334155; margin-bottom: 0.5rem;">Q${index + 1}: ${ans.question}</p>
                    <div style="background: white; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; color: #1e293b;">
                        ${ans.studentAnswer || '<span style="color: #94a3b8; font-style: italic;">No answer provided</span>'}
                    </div>
                </div>
            `).join('');
        });
    };

    window.saveGrade = function () {
        const submissionFirebaseId = document.getElementById('currentSubmissionId').value;
        const marks = document.getElementById('gradingMarks').value;
        const feedback = document.getElementById('gradingFeedback').value;

        if (!marks) {
            alert('Please enter marks');
            return;
        }

        database.ref('testResults').child(submissionFirebaseId).update({
            marksObtained: marks,
            feedback: feedback,
            status: 'Graded'
        }).then(() => {
            alert('Grade saved successfully!');
            backToSubmissions();
            // We need to refresh the list, we can just get the testId from the previous state
            // But it's easier to just re-open the list
        });
    };

    window.gradeAssignment = function (assignmentFirebaseId) {
        const modal = document.getElementById('assignmentGradingModal');
        const title = document.getElementById('assignmentGradingTitle');
        const list = document.getElementById('assignmentSubmissionsList');
        const interface = document.getElementById('assignmentGradingInterface');

        const assignment = assignments.find(a => a.firebaseId === assignmentFirebaseId);
        if (!assignment) return;

        title.textContent = `Grade Assignment: ${assignment.title}`;
        interface.style.display = 'none';
        list.style.display = 'grid';

        database.ref('assignmentSubmissions').once('value', (snapshot) => {
            const submissionsVal = snapshot.val();
            const submissions = submissionsVal ? Object.keys(submissionsVal).map(id => ({ ...submissionsVal[id], firebaseId: id })) : [];
            const assignmentSubmissions = submissions.filter(s => s.assignmentId == assignment.id);

            if (assignmentSubmissions.length === 0) {
                list.innerHTML = '<p class="no-data" style="color: #94a3b8; text-align: center; padding: 2rem;">No submissions found for this assignment.</p>';
            } else {
                list.innerHTML = assignmentSubmissions.map(s => `
                    <div class="item-card" onclick="viewAssignmentSubmission('${s.firebaseId}')" style="cursor: pointer; transition: transform 0.2s;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4>${s.studentName}</h4>
                                <p class="meta">Roll: ${s.rollNumber} | Submitted: ${s.dateSubmitted}</p>
                            </div>
                            <div>
                                <span class="status-badge" style="background: ${s.status === 'Graded' ? '#dcfce7' : '#fef9c3'}; color: ${s.status === 'Graded' ? '#166534' : '#854d0e'}; padding: 4px 12px; border-radius: 99px; font-size: 0.85rem; font-weight: 600;">${s.status}</span>
                                ${s.status === 'Graded' ? `<div style="font-weight: bold; margin-top: 5px; text-align: right; color: #10b981;">Score: ${s.marksObtained}</div>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            modal.style.display = 'block';
        });
    };

    window.viewAssignmentSubmission = function (submissionFirebaseId) {
        const list = document.getElementById('assignmentSubmissionsList');
        const interface = document.getElementById('assignmentGradingInterface');

        database.ref('assignmentSubmissions').child(submissionFirebaseId).once('value', (snapshot) => {
            const submission = snapshot.val();
            if (!submission) return;

            const assignment = assignments.find(a => a.id == submission.assignmentId);

            list.style.display = 'none';
            interface.style.display = 'block';

            document.getElementById('agStudentName').textContent = `${submission.studentName} (${submission.rollNumber})`;
            document.getElementById('fileNameDisplay').textContent = submission.fileName || 'No filename';
            document.getElementById('agTotalMarks').textContent = assignment ? assignment.marks : '-';
            document.getElementById('currentAgSubmissionId').value = submissionFirebaseId;

            const downloadBtn = document.getElementById('downloadFileBtn');
            if (submission.fileData) {
                downloadBtn.href = submission.fileData;
                downloadBtn.download = submission.fileName || 'assignment_submission';
                downloadBtn.style.display = 'inline-block';
            } else {
                downloadBtn.style.display = 'none';
            }

            if (submission.status === 'Graded') {
                document.getElementById('agMarks').value = submission.marksObtained;
                document.getElementById('agFeedback').value = submission.feedback;
            } else {
                document.getElementById('agMarks').value = '';
                document.getElementById('agFeedback').value = '';
            }
        });
    };

    window.saveAssignmentGrade = function () {
        const submissionFirebaseId = document.getElementById('currentAgSubmissionId').value;
        const marks = document.getElementById('agMarks').value;
        const feedback = document.getElementById('agFeedback').value;

        if (!marks) {
            alert('Please enter marks.');
            return;
        }

        database.ref('assignmentSubmissions').child(submissionFirebaseId).update({
            marksObtained: marks,
            feedback: feedback,
            status: 'Graded'
        }).then(() => {
            alert('Grade saved successfully!');
            backToAssignmentSubmissions();
        });
    };

    function initResources() {
        const form = document.getElementById('resourceForm');
        if (form && !form.dataset.initialized) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('resource-title').value;
                const targetClass = document.getElementById('resource-class').value;
                const type = document.getElementById('resource-type').value;
                const link = document.getElementById('resource-link').value;

                const resource = {
                    id: Date.now(),
                    title,
                    targetClass,
                    type,
                    link,
                    date: new Date().toLocaleDateString()
                };

                database.ref('resources').push(resource);
                e.target.reset();
                alert('Resource added successfully!');
            });
            form.dataset.initialized = "true";
        }
    }

    function displayResources() {
        const list = document.getElementById('resourcesList');
        if (!list) return;

        list.innerHTML = '<h3>Current Resources</h3>';
        const container = document.createElement('div');
        container.className = 'resources-grid';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
        container.style.gap = '1rem';
        container.style.marginTop = '1rem';

        if (resources.length === 0) {
            list.innerHTML += '<p style="color: #94a3b8;">No resources shared yet.</p>';
            return;
        }

        resources.forEach(res => {
            const card = document.createElement('div');
            card.className = 'resource-card';
            card.style.background = 'rgba(255,255,255,0.03)';
            card.style.padding = '1rem';
            card.style.borderRadius = '12px';
            card.style.border = '1px solid var(--glass-border)';
            card.style.position = 'relative';

            const icon = res.type === 'Video' ? '<i class="fas fa-video"></i>' : res.type === 'PDF' ? '<i class="fas fa-file-pdf"></i>' : '<i class="fas fa-link"></i>';

            card.innerHTML = `
                <span style="position: absolute; top: 0.5rem; right: 0.5rem; font-size: 0.8rem; background: var(--primary-color); padding: 2px 8px; border-radius: 10px;">${res.type}</span>
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${icon}</div>
                <h4 style="margin-bottom: 0.5rem;">${res.title}</h4>
                <p style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 1rem;">Added on ${res.date}</p>
                <div style="display: flex; gap: 0.5rem;">
                    <a href="${res.link}" target="_blank" class="btn-primary" style="padding: 5px 15px; font-size: 0.85rem; text-decoration: none;">View</a>
                    <button class="btn-text-only" onclick="deleteResource('${res.firebaseId}')" style="padding: 5px 15px; font-size: 0.85rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 8px;">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
        list.appendChild(container);
    }

    function displayLeaderboard(quizResults, adjustments = {}) {
        const tbody = document.getElementById('globalLeaderboardBody');
        if (!tbody) return;

        const leaderboardData = {};

        students.forEach(student => {
            const email = student.email;
            leaderboardData[email] = {
                name: student.name,
                quizPoints: 0,
                adjustment: adjustments[email] || 0,
                totalPoints: adjustments[email] || 0,
                quizzes: 0
            };
        });

        quizResults.forEach(result => {
            const email = result.email;
            if (!leaderboardData[email]) {
                leaderboardData[email] = {
                    name: result.studentName || email.split('@')[0],
                    quizPoints: 0,
                    adjustment: adjustments[email] || 0,
                    totalPoints: adjustments[email] || 0,
                    quizzes: 0
                };
            }
            leaderboardData[email].quizPoints += parseInt(result.score);
            leaderboardData[email].totalPoints += parseInt(result.score);
            leaderboardData[email].quizzes += 1;
        });

        const sortedScores = Object.values(leaderboardData)
            .filter(s => s.totalPoints > 0) // Filter: Show only students with points
            .sort((a, b) => b.totalPoints - a.totalPoints);

        if (sortedScores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #94a3b8;">No student records found.</td></tr>';
            return;
        }

        tbody.innerHTML = sortedScores.map((student, index) => `
            <tr>
                <td><span style="display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; background: ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'rgba(255,255,255,0.05)'}; color: ${index < 3 ? '#000' : '#fff'}; border-radius: 50%; font-weight: bold;">${index + 1}</span></td>
                <td>${student.name}</td>
                <td style="color: #94a3b8;">${student.quizPoints} pts</td>
                <td style="color: ${student.adjustment >= 0 ? '#10b981' : '#ef4444'};">${student.adjustment >= 0 ? '+' : ''}${student.adjustment}</td>
                <td style="font-weight: 600; color: var(--primary-color);">${student.totalPoints} pts</td>
                <td>${student.quizzes}</td>
            </tr>
        `).join('');
    }

    function initLeaderboardControl() {
        const form = document.getElementById('leaderboardAdjustmentForm');
        if (form && !form.dataset.initialized) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('adj-email').value;
                const points = parseInt(document.getElementById('adj-points').value);

                if (!email || isNaN(points)) return;

                const newTotal = (adjustments[email] || 0) + points;
                database.ref('leaderboardAdjustments').child(email.replace(/\./g, ',')).set(newTotal);

                e.target.reset();
                alert(`Points updated for ${email}`);
            });
            form.dataset.initialized = "true";
        }
    }

    // Student Edit Modal Logic
    const editStudentModal = document.getElementById('editStudentModal');
    const closeEditStudentBtn = document.getElementById('closeEditStudentModal');

    if (closeEditStudentBtn) {
        closeEditStudentBtn.addEventListener('click', () => {
            editStudentModal.classList.remove('active');
        });
    }

    window.openEditStudentModal = function (firebaseId) {
        const student = students.find(s => s.firebaseId === firebaseId);
        if (!student) return;

        document.getElementById('editStudentId').value = firebaseId;
        document.getElementById('edit-name').value = student.name || '';
        document.getElementById('edit-email').value = student.email || '';
        document.getElementById('edit-class').value = student.class || '1';
        document.getElementById('edit-roll').value = student.rollNumber || '';
        document.getElementById('edit-password').value = student.password || '';

        editStudentModal.classList.add('active');
    };

    const editStudentForm = document.getElementById('editStudentForm');
    if (editStudentForm) {
        editStudentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const firebaseId = document.getElementById('editStudentId').value;
            const name = document.getElementById('edit-name').value;
            const email = document.getElementById('edit-email').value;
            const studentClass = document.getElementById('edit-class').value;
            const rollNumber = document.getElementById('edit-roll').value;
            const password = document.getElementById('edit-password').value;

            database.ref('students').child(firebaseId).update({
                name,
                email,
                class: studentClass,
                rollNumber,
                password
            }).then(() => {
                alert('Student profile updated successfully!');
                editStudentModal.classList.remove('active');
            }).catch(err => {
                console.error(err);
                alert('Error updating student profile.');
            });
        });
    }

});
