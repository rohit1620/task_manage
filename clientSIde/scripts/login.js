function toggleForm(type) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    if (type === 'register') {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');
    } else {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
    }
}



const handleSubmit = async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    try {
        const response = await fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password,
                role
            })
        });

        const data = await response.json();

        console.log("data", data);

        if (!response.ok) {
            alert(data.msg);
            return;
        }

        alert("Registration Successful");
    document.getElementById("name").value="";
    document.getElementById("email").value="";
    document.getElementById("password").value="";
    document.getElementById("role").value="";

    } catch (error) {
        console.log(error);
    }
};

document.getElementById("registerForm").addEventListener("submit", handleSubmit);


const handleLogin = async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
              credentials: "include", 
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.msg);
            return;
        }

        // ✅ TOKEN STORE
        // localStorage.setItem("token", data.token);

        console.log("User:", data);

        alert("Login Successful");

        // ✅ redirect kar sakte ho
            if (data.role === "manager") {
        window.location.href = "/task_manage/clientSIde/dashbord.html";
        }
        if (data.role === "employee") {
        window.location.href = "/task_manage/clientSIde/employee.html";
        }
    } catch (error) {
        console.error("Login Error:", error);
    }
};

document.getElementById("loginForm").addEventListener("submit", handleLogin);