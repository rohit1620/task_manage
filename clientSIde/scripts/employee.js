let currentProgress = 10; // Default Starting point
const maxProgress = 100;
const dashArray = 440; // SVG Circle circumference

function incrementProgress(value) {
    if (currentProgress + value <= maxProgress) {
        currentProgress += value;
        updateUI();
    } else if (currentProgress < 100) {
        currentProgress = 100;
        updateUI();
    }
}

function updateUI() {
    // 1. Update Text
    document.getElementById('percentDisplay').innerText = currentProgress + "%";
    
    // 2. Update SVG Circle
    const offset = dashArray - (dashArray * currentProgress) / 100;
    document.getElementById('progressCircle').style.strokeDashoffset = offset;
    
    // 3. Status Message
    const msg = document.getElementById('statusMsg');
    msg.innerText = `Progress updated to ${currentProgress}%! Keep going.`;
    msg.style.color = "#10b981";

    // 4. Milestone Highlighter
    if (currentProgress >= 50) {
        document.getElementById('step50').classList.add('active');
    }
    if (currentProgress >= 100) {
        document.getElementById('step100').classList.add('active');
        msg.innerText = "Task Completed! Waiting for Manager review.";
    }
}