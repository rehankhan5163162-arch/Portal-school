document.addEventListener('DOMContentLoaded', () => {
    // Initialize data from localStorage
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    const tests = JSON.parse(localStorage.getItem('tests') || '[]');
    const syllabus = JSON.parse(localStorage.getItem('syllabus') || '[]');
    const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    const students = JSON.parse(localStorage.getItem('students') || '[]');

    // Update stats
    updateStats();

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
        const message = document.getElementById('announcement-message').value;

        const announcement = {
            id: Date.now(),
            title,
            message,
            date: new Date().toLocaleDateString()
        };

        announcements.unshift(announcement);
        localStorage.setItem('announcements', JSON.stringify(announcements));

        e.target.reset();
        displayAnnouncements();
        updateStats();
        alert('Announcement posted successfully!');
    });

    // Assignment Form
    // Assignment Form
    document.getElementById('assignmentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('assignment-title').value;
        const subject = document.getElementById('assignment-subject').value;
        const description = document.getElementById('assignment-description').value;
        const marks = document.getElementById('assignment-marks').value;
        const dueDate = document.getElementById('assignment-due').value;

        const assignment = {
            id: Date.now(),
            title,
            subject,
            description,
            marks,
            dueDate,
            createdDate: new Date().toLocaleDateString()
        };

        assignments.push(assignment);
        localStorage.setItem('assignments', JSON.stringify(assignments));

        e.target.reset();
        displayAssignments();
        updateStats();
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
        const duration = document.getElementById('quiz-duration').value;

        const questionBlocks = document.querySelectorAll('.question-block');
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
            duration,
            questions,
            createdDate: new Date().toLocaleDateString()
        };

        quizzes.push(quiz);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));

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
        displayQuizzes();
        updateStats();
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
        const subject = document.getElementById('test-subject').value;
        const date = document.getElementById('test-date').value;
        const time = document.getElementById('test-time').value;
        const duration = document.getElementById('test-duration').value;
        const totalMarks = document.getElementById('test-marks').value;

        const questionElements = document.querySelectorAll('.test-question-text');
        const questions = Array.from(questionElements).map(q => q.value);

        const test = {
            id: Date.now(),
            title,
            subject,
            date,
            time,
            duration,
            totalMarks,
            questions
        };

        tests.push(test);
        localStorage.setItem('tests', JSON.stringify(tests));

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

        displayTests();
        alert('Test scheduled successfully!');
    });

    // Syllabus Form
    document.getElementById('syllabusForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const subject = document.getElementById('syllabus-subject').value;
        const topics = document.getElementById('syllabus-topics').value.split('\n').filter(t => t.trim());

        const syllabusItem = {
            id: Date.now(),
            subject,
            topics
        };

        syllabus.push(syllabusItem);
        localStorage.setItem('syllabus', JSON.stringify(syllabus));

        e.target.reset();
        displaySyllabus();
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

        attendance.push(attendanceRecord);
        localStorage.setItem('attendance', JSON.stringify(attendance));

        e.target.reset();
        displayAttendance();
        alert('Attendance updated successfully!');
    });

    // Display functions
    function displayAnnouncements() {
        const list = document.getElementById('announcementsList');
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');

        if (announcements.length === 0) {
            list.innerHTML = '<h3>Recent Announcements</h3><p style="color: #94a3b8;">No announcements yet.</p>';
            return;
        }

        list.innerHTML = '<h3>Recent Announcements</h3>' + announcements.map(a => `
            <div class="item-card">
                <h4>${a.title}</h4>
                <p>${a.message}</p>
                <div class="meta">Posted on: ${a.date}</div>
                <button class="btn-delete" onclick="deleteItem('announcements', ${a.id})">Delete</button>
            </div>
        `).join('');
    }

    function displayAssignments() {
        const list = document.getElementById('assignmentsList');
        const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');

        if (assignments.length === 0) {
            list.innerHTML = '<h3>All Assignments</h3><p style="color: #94a3b8;">No assignments yet.</p>';
            return;
        }

        list.innerHTML = '<h3>All Assignments</h3>' + assignments.map(a => `
            <div class="item-card">
                <h4>${a.title}</h4>
                <p><strong>Subject:</strong> ${a.subject}</p>
                <p><strong>Criteria:</strong> ${a.description ? a.description.substring(0, 50) + '...' : 'No description'}</p>
                <p><strong>Marks:</strong> ${a.marks || 'N/A'} | <strong>Due:</strong> ${a.dueDate}</p>
                <div class="meta">Created: ${a.createdDate}</div>
                <div style="margin-top: 1rem;">
                    <button class="btn-view" onclick="gradeAssignment(${a.id})">Grade Assignment</button>
                    <button class="btn-delete" onclick="deleteItem('assignments', ${a.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    function displayQuizzes() {
        const list = document.getElementById('quizList');
        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');

        if (quizzes.length === 0) {
            list.innerHTML = '<h3>All Quizzes</h3><p style="color: #94a3b8;">No quizzes yet.</p>';
            return;
        }

        list.innerHTML = '<h3>All Quizzes</h3>' + quizzes.map(q => `
            <div class="item-card">
                <h4>${q.title}</h4>
                <p><strong>Questions:</strong> ${q.questions.length} | <strong>Duration:</strong> ${q.duration} minutes</p>
                <div class="meta">Created: ${q.createdDate}</div>
                <div style="margin-top: 1rem;">
                    <button class="btn-view" onclick="viewResults(${q.id})">View Results</button>
                    <button class="btn-delete" onclick="deleteItem('quizzes', ${q.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    function displayTests() {
        const list = document.getElementById('testsList');
        const tests = JSON.parse(localStorage.getItem('tests') || '[]');

        if (tests.length === 0) {
            list.innerHTML = '<h3>Scheduled Tests</h3><p style="color: #94a3b8;">No tests scheduled.</p>';
            return;
        }

        list.innerHTML = '<h3>Scheduled Tests</h3>' + tests.map(t => `
            <div class="item-card">
                <h4>${t.title}</h4>
                <p><strong>Subject:</strong> ${t.subject}</p>
                <div class="meta">Date: ${t.date} at ${t.time}</div>
                <div class="meta">Duration: ${t.duration || 'N/A'} mins | Marks: ${t.totalMarks || 'N/A'}</div>
                <div style="margin-top: 1rem;">
                    <button class="btn-view" onclick="gradeTest(${t.id})">Grade Test</button>
                    <button class="btn-delete" onclick="deleteItem('tests', ${t.id})">Delete</button>
                </div>
            </div>
            `).join('');
    }

    function displaySyllabus() {
        const list = document.getElementById('syllabusList');
        const syllabus = JSON.parse(localStorage.getItem('syllabus') || '[]');

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
                <button class="btn-delete" onclick="deleteItem('syllabus', ${s.id})">Delete</button>
            </div>
            `).join('');
    }

    function displayAttendance() {
        const list = document.getElementById('attendanceList');
        const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');

        if (attendance.length === 0) {
            list.innerHTML = '<h3>Attendance Records</h3><p style="color: #94a3b8;">No attendance records yet.</p>';
            return;
        }

        list.innerHTML = '<h3>Attendance Records</h3>' + attendance.map(a => `
            <div class="item-card">
                <h4>Roll Number: ${a.rollNumber}</h4>
                <p><strong>Status:</strong> <span style="color: ${a.status === 'present' ? '#10b981' : '#ef4444'}; text-transform: capitalize;">${a.status}</span></p>
                <div class="meta">Date: ${a.date}</div>
                <button class="btn-delete" onclick="deleteItem('attendance', ${a.id})">Delete</button>
            </div>
            `).join('');
    }

    function displayStudents() {
        const list = document.getElementById('studentsList');
        const students = JSON.parse(localStorage.getItem('students') || '[]');

        if (students.length === 0) {
            list.innerHTML = '<h3>All Students</h3><p style="color: #94a3b8;">No students registered yet.</p>';
            return;
        }

        list.innerHTML = '<h3>All Students</h3>' + students.map((s, index) => `
            <div class="item-card">
                <h4>${s.name}</h4>
                <p><strong>Roll Number:</strong> ${s.rollNumber}</p>
                <p><strong>Email:</strong> ${s.email}</p>
                <div class="meta">Class: ${s.class}</div>
                <button class="btn-delete" onclick="deleteStudent(${index})">Remove</button>
            </div>
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
    window.deleteItem = function (type, id) {
        if (confirm('Are you sure you want to delete this item?')) {
            const items = JSON.parse(localStorage.getItem(type) || '[]');
            const filtered = items.filter(item => item.id !== id);
            localStorage.setItem(type, JSON.stringify(filtered));

            // Refresh the appropriate display
            switch (type) {
                case 'announcements':
                    displayAnnouncements();
                    break;
                case 'assignments':
                    displayAssignments();
                    break;
                case 'quizzes':
                    displayQuizzes();
                    break;
                case 'tests':
                    displayTests();
                    break;
                case 'syllabus':
                    displaySyllabus();
                    break;
                case 'attendance':
                    displayAttendance();
                    break;
            }

            updateStats();
        }
    };

    // Delete student function
    window.deleteStudent = function (index) {
        if (confirm('Are you sure you want to remove this student?')) {
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            students.splice(index, 1);
            localStorage.setItem('students', JSON.stringify(students));
            displayStudents();
            updateStats();
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

    window.viewResults = function (quizId) {
        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
        const quiz = quizzes.find(q => q.id === quizId);

        if (!quiz) return;

        document.getElementById('resultsModalTitle').textContent = `Results: ${quiz.title} `;
        const tbody = document.getElementById('resultsTableBody');

        // Filter results for this quiz
        const quizResults = results.filter(r => r.quizId === quizId);

        // Sort by Score (Desc) then Date (Desc)
        quizResults.sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date));

        if (quizResults.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No students have taken this quiz yet.</td></tr>';
        } else {
            tbody.innerHTML = quizResults.map(r => {
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
    };

    // Grading Modal Logic
    const gradingModal = document.getElementById('gradingModal');
    const closeGradingBtn = document.getElementById('closeGradingModal');

    closeGradingBtn.addEventListener('click', () => {
        gradingModal.classList.remove('active');
        document.getElementById('gradingInterface').style.display = 'none';
        document.getElementById('studentSubmissionsList').style.display = 'block';
    });

    window.gradeTest = function (testId) {
        const tests = JSON.parse(localStorage.getItem('tests') || '[]');
        const results = JSON.parse(localStorage.getItem('testResults') || '[]');
        const test = tests.find(t => t.id === testId);

        if (!test) return;

        document.getElementById('gradingModalTitle').textContent = `Grade: ${test.title}`;
        const submissionsList = document.getElementById('studentSubmissionsList');

        // Filter results for this test
        const testSubmissions = results.filter(r => r.testId === testId);

        if (testSubmissions.length === 0) {
            submissionsList.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 2rem;">No students have submitted this test yet.</p>';
        } else {
            submissionsList.innerHTML = testSubmissions.map(sub => `
                <div class="item-card" onclick="viewSubmission(${sub.id})" style="cursor: pointer; transition: transform 0.2s;">
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
    };

    window.viewSubmission = function (submissionId) {
        const results = JSON.parse(localStorage.getItem('testResults') || '[]');
        const submission = results.find(r => r.id === submissionId);
        if (!submission) return;

        const tests = JSON.parse(localStorage.getItem('tests') || '[]');
        const test = tests.find(t => t.id === submission.testId);

        // Populate Interface
        document.getElementById('studentSubmissionsList').style.display = 'none';
        document.getElementById('gradingInterface').style.display = 'block';

        document.getElementById('gradingStudentName').textContent = submission.studentName;
        document.getElementById('currentSubmissionId').value = submission.id;
        document.getElementById('gradingTotalMarks').textContent = test.totalMarks;
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
    };

    window.backToSubmissions = function () {
        document.getElementById('gradingInterface').style.display = 'none';
        document.getElementById('studentSubmissionsList').style.display = 'block';
    };

    window.saveGrade = function () {
        const submissionId = parseInt(document.getElementById('currentSubmissionId').value);
        const marks = document.getElementById('gradingMarks').value;
        const feedback = document.getElementById('gradingFeedback').value;
        const totalMarks = parseInt(document.getElementById('gradingTotalMarks').textContent);

        if (!marks) {
            alert('Please enter marks');
            return;
        }

        // Save to localStorage
        const results = JSON.parse(localStorage.getItem('testResults') || '[]');
        const index = results.findIndex(r => r.id === submissionId);

        if (index !== -1) {
            results[index].marksObtained = marks;
            results[index].feedback = feedback;
            results[index].status = 'Graded';
            localStorage.setItem('testResults', JSON.stringify(results));

            alert('Grade saved successfully!');
            backToSubmissions();
            // Refresh list (re-open to refresh is easiest or call gradeTest again with testId)
            const testId = results[index].testId;
            gradeTest(testId);
        }
    };

    // Close buttons for Assignment Grading Modal
    document.getElementById('closeAssignmentGradingModal').addEventListener('click', () => {
        document.getElementById('assignmentGradingModal').style.display = 'none';
        document.getElementById('assignmentGradingInterface').style.display = 'none';
        document.getElementById('assignmentSubmissionsList').style.display = 'grid';
    });

    // Make functions global
    window.gradeTest = gradeTest;
    window.viewSubmission = viewSubmission;
    window.saveGrade = saveGrade;
    window.backToSubmissions = backToSubmissions;
    window.gradeAssignment = gradeAssignment;
    window.viewAssignmentSubmission = viewAssignmentSubmission;
    window.saveAssignmentGrade = saveAssignmentGrade;
    window.backToAssignmentSubmissions = backToAssignmentSubmissions;
});

// Assignment Grading Logic

function gradeAssignment(assignmentId) {
    const modal = document.getElementById('assignmentGradingModal');
    const title = document.getElementById('assignmentGradingTitle');
    const list = document.getElementById('assignmentSubmissionsList');
    const interface = document.getElementById('assignmentGradingInterface');

    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const submissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]');
    const assignment = assignments.find(a => a.id === assignmentId);

    if (!assignment) return;

    title.textContent = `Grade Assignment: ${assignment.title}`;
    interface.style.display = 'none';
    list.style.display = 'grid';

    // Filter submissions for this assignment
    const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignmentId);

    if (assignmentSubmissions.length === 0) {
        list.innerHTML = '<p class="no-data" style="color: #94a3b8; text-align: center; padding: 2rem;">No submissions found for this assignment.</p>';
    } else {
        list.innerHTML = assignmentSubmissions.map(s => `
            <div class="item-card" onclick="viewAssignmentSubmission(${s.id})" style="cursor: pointer; transition: transform 0.2s;">
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
}

function viewAssignmentSubmission(submissionId) {
    const list = document.getElementById('assignmentSubmissionsList');
    const interface = document.getElementById('assignmentGradingInterface');

    // Elements to populate
    const studentNameEl = document.getElementById('agStudentName');
    const fileNameEl = document.getElementById('fileNameDisplay');
    const downloadBtn = document.getElementById('downloadFileBtn');
    const totalMarksEl = document.getElementById('agTotalMarks');
    const marksInput = document.getElementById('agMarks');
    const feedbackInput = document.getElementById('agFeedback');
    const submissionIdInput = document.getElementById('currentAgSubmissionId');

    const submissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]');
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
    const submission = submissions.find(s => s.id === submissionId);

    if (!submission) return;

    const assignment = assignments.find(a => a.id === submission.assignmentId);

    list.style.display = 'none';
    interface.style.display = 'block';

    studentNameEl.textContent = `${submission.studentName} (${submission.rollNumber})`;
    fileNameEl.textContent = submission.fileName || 'No filename';
    totalMarksEl.textContent = assignment ? assignment.marks : '-';
    submissionIdInput.value = submission.id;

    // Setup Download Link
    if (submission.fileData) {
        downloadBtn.href = submission.fileData;
        downloadBtn.download = submission.fileName || 'assignment_submission';
        downloadBtn.style.display = 'inline-block';
    } else {
        downloadBtn.style.display = 'none';
        fileNameEl.textContent = 'No file attached';
    }

    if (submission.status === 'Graded') {
        marksInput.value = submission.marksObtained;
        feedbackInput.value = submission.feedback;
    } else {
        marksInput.value = '';
        feedbackInput.value = '';
    }
}

function saveAssignmentGrade() {
    const submissionId = parseInt(document.getElementById('currentAgSubmissionId').value);
    const marks = document.getElementById('agMarks').value;
    const feedback = document.getElementById('agFeedback').value;

    if (!marks) {
        alert('Please enter marks.');
        return;
    }

    const submissions = JSON.parse(localStorage.getItem('assignmentSubmissions') || '[]');
    const submissionIndex = submissions.findIndex(s => s.id === submissionId);

    if (submissionIndex !== -1) {
        submissions[submissionIndex].marksObtained = marks;
        submissions[submissionIndex].feedback = feedback;
        submissions[submissionIndex].status = 'Graded';

        localStorage.setItem('assignmentSubmissions', JSON.stringify(submissions));

        alert('Grade saved successfully!');
        backToAssignmentSubmissions();

        // Refresh the list view by calling gradeAssignment again with the assignment ID
        // We need to look up the assignment ID again
        const assignmentId = submissions[submissionIndex].assignmentId;
        gradeAssignment(assignmentId);
    }
}

function backToAssignmentSubmissions() {
    document.getElementById('assignmentGradingInterface').style.display = 'none';
    document.getElementById('assignmentSubmissionsList').style.display = 'grid';
}
