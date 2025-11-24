// Student Management JavaScript

let currentPage = 1;
let currentFilters = {
    grade: '',
    section: '',
    archived: 'false',
    search: ''
};
let availableGrades = [];
let availableSections = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Require authentication
    if (!Auth.requireAuth()) {
        return;
    }
    setupEventListeners();
    loadStudents();
});

function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            Auth.logout();
        }
    });

    // Filters
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearchChange, 500));
    document.getElementById('gradeFilter').addEventListener('change', handleFilterChange);
    document.getElementById('sectionFilter').addEventListener('change', handleFilterChange);
    document.getElementById('statusFilter').addEventListener('change', handleFilterChange);

    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => changePage(currentPage - 1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(currentPage + 1));

    // Modal
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    document.getElementById('saveEdit').addEventListener('click', saveStudentEdit);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleSearchChange(e) {
    currentFilters.search = e.target.value;
    currentPage = 1;
    loadStudents();
}

function handleFilterChange() {
    currentFilters.grade = document.getElementById('gradeFilter').value;
    currentFilters.section = document.getElementById('sectionFilter').value;
    currentFilters.archived = document.getElementById('statusFilter').value === 'archived' ? 'true' : 'false';
    currentPage = 1;
    loadStudents();
}

function changePage(page) {
    currentPage = page;
    loadStudents();
}

async function loadStudents() {
    const loader = document.getElementById('studentsLoader');
    const table = document.getElementById('studentsTable');
    const error = document.getElementById('studentsError');
    const pagination = document.getElementById('pagination');

    loader.classList.remove('hidden');
    table.classList.add('hidden');
    error.classList.add('hidden');
    pagination.classList.add('hidden');

    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 20,
            archived: currentFilters.archived
        });

        if (currentFilters.grade) params.append('grade', currentFilters.grade);
        if (currentFilters.section) params.append('section', currentFilters.section);
        if (currentFilters.search) params.append('search', currentFilters.search);

        const response = await API.get(`/api/admin/students?${params}`);

        if (response.success) {
            displayStudents(response.data.students);
            updatePagination(response.data.pagination);
            updateFilters(response.data.filters);
            
            loader.classList.add('hidden');
            table.classList.remove('hidden');
            pagination.classList.remove('hidden');
        } else {
            throw new Error(response.message || 'Failed to load students');
        }
    } catch (err) {
        console.error('Error loading students:', err);
        loader.classList.add('hidden');
        error.classList.remove('hidden');
        error.querySelector('p').textContent = err.message || 'Failed to load students';
    }
}

function displayStudents(students) {
    const tbody = document.getElementById('studentsBody');
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                    No students found
                </td>
            </tr>
        `;
        return;
    }

    students.forEach(student => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${escapeHtml(student.studentId)}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${escapeHtml(student.name)}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(student.grade || '-')}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(student.section || '-')}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(student.email)}</td>
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onclick="editStudent(${student.id})" class="text-blue-600 hover:text-blue-900">Edit</button>
                ${student.isArchived 
                    ? `<button onclick="unarchiveStudent(${student.id}, '${escapeHtml(student.name)}')" class="text-green-600 hover:text-green-900">Unarchive</button>`
                    : `<button onclick="archiveStudent(${student.id}, '${escapeHtml(student.name)}')" class="text-red-600 hover:text-red-900">Archive</button>`
                }
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updatePagination(pagination) {
    document.getElementById('showingFrom').textContent = pagination.total === 0 ? 0 : ((pagination.page - 1) * pagination.limit + 1);
    document.getElementById('showingTo').textContent = Math.min(pagination.page * pagination.limit, pagination.total);
    document.getElementById('totalStudents').textContent = pagination.total;

    document.getElementById('prevPage').disabled = pagination.page === 1;
    document.getElementById('nextPage').disabled = pagination.page >= pagination.totalPages;
}

function updateFilters(filters) {
    availableGrades = filters.grades;
    availableSections = filters.sections;

    // Update grade filter
    const gradeFilter = document.getElementById('gradeFilter');
    const currentGrade = gradeFilter.value;
    gradeFilter.innerHTML = '<option value="">All Grades</option>';
    filters.grades.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade;
        option.textContent = grade;
        if (grade === currentGrade) option.selected = true;
        gradeFilter.appendChild(option);
    });

    // Update section filter
    const sectionFilter = document.getElementById('sectionFilter');
    const currentSection = sectionFilter.value;
    sectionFilter.innerHTML = '<option value="">All Sections</option>';
    filters.sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = section;
        if (section === currentSection) option.selected = true;
        sectionFilter.appendChild(option);
    });

    // Update datalists for edit modal
    updateDatalist('gradesList', filters.grades);
    updateDatalist('sectionsList', filters.sections);
}

function updateDatalist(id, options) {
    const datalist = document.getElementById(id);
    datalist.innerHTML = '';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        datalist.appendChild(opt);
    });
}

async function editStudent(studentId) {
    try {
        const response = await API.get(`/api/admin/students?search=&page=1&limit=100`);
        const student = response.data.students.find(s => s.id === studentId);

        if (!student) {
            alert('Student not found');
            return;
        }

        document.getElementById('editStudentId').value = student.id;
        document.getElementById('editName').value = student.name;
        document.getElementById('editEmail').value = student.email;
        document.getElementById('editGrade').value = student.grade || '';
        document.getElementById('editSection').value = student.section || '';
        document.getElementById('editPhone').value = student.phone || '';

        document.getElementById('editModal').classList.remove('hidden');
    } catch (err) {
        console.error('Error loading student:', err);
        alert('Failed to load student details');
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
}

async function saveStudentEdit() {
    const studentId = document.getElementById('editStudentId').value;
    const data = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        grade: document.getElementById('editGrade').value || null,
        section: document.getElementById('editSection').value || null,
        phone: document.getElementById('editPhone').value || null
    };

    try {
        const response = await API.put(`/api/admin/students/${studentId}`, data);

        if (response.success) {
            closeEditModal();
            loadStudents();
            showNotification('Student updated successfully', 'success');
        } else {
            throw new Error(response.message || 'Failed to update student');
        }
    } catch (err) {
        console.error('Error updating student:', err);
        alert(err.message || 'Failed to update student');
    }
}

async function archiveStudent(studentId, studentName) {
    if (!confirm(`Are you sure you want to archive ${studentName}? They will no longer be able to log in.`)) {
        return;
    }

    try {
        const response = await API.post(`/api/admin/students/${studentId}/archive`, {});

        if (response.success) {
            loadStudents();
            showNotification('Student archived successfully', 'success');
        } else {
            throw new Error(response.message || 'Failed to archive student');
        }
    } catch (err) {
        console.error('Error archiving student:', err);
        alert(err.message || 'Failed to archive student');
    }
}

async function unarchiveStudent(studentId, studentName) {
    if (!confirm(`Are you sure you want to unarchive ${studentName}?`)) {
        return;
    }

    try {
        const response = await API.post(`/api/admin/students/${studentId}/unarchive`, {});

        if (response.success) {
            loadStudents();
            showNotification('Student unarchived successfully', 'success');
        } else {
            throw new Error(response.message || 'Failed to unarchive student');
        }
    } catch (err) {
        console.error('Error unarchiving student:', err);
        alert(err.message || 'Failed to unarchive student');
    }
}

function showNotification(message, type = 'info') {
    // Simple notification - you can enhance this
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
