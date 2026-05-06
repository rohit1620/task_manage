// Sample Data
const employees = [
    { name: "Aman Sharma", task: "Auth Module", progress: 75, status: "Working" },
    { name: "Rahul Malav", task: "API Integration", progress: 40, status: "Working" },
    { name: "Priya Verma", task: "UI Testing", progress: 95, status: "Review" },
    { name: "Vikas Malav", task: "Database Design", progress: 60, status: "Working" }
];

// Table render function
function renderTable() {
    const tableBody = document.getElementById('employeeTableBody');
    tableBody.innerHTML = employees.map(emp => `
        <tr>
            <td><strong>${emp.name}</strong></td>
            <td>${emp.task}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${emp.progress}%"></div>
                </div>
                <span style="font-size: 10px; color: #94a3b8;">${emp.progress}%</span>
            </td>
            <td><span class="status-chip ${emp.status.toLowerCase()}">${emp.status}</span></td>
        </tr>
    `).join('');
}

// Handle Task Assignment
document.getElementById('assignTaskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('employeeSelect').value;
    const task = document.getElementById('taskTitle').value;

    if(name && task) {
        // Add new task to local array (Simulation)
        employees.unshift({
            name: name,
            task: task,
            progress: 0,
            status: "Working"
        });

        renderTable(); // Refresh table
        this.reset(); // Reset form
        alert("Task Assigned Successfully!");
    }
});

// Initial Render
renderTable();