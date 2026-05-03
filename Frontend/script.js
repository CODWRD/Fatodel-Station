const emailLogin = document.getElementById('login-email');
const passwordLogin = document.getElementById('login-password');
const loginForm = document.getElementById('login-form');
const container = document.querySelector('.container');
const body = document.querySelector('body');
const ownerDashboard = document.querySelector('.dashboard');

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailLogin.value;
  const password = passwordLogin.value;

  const res = await fetch('http://localhost:5000/api/v1/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  console.log(data);
  if (data.message === 'Login Successful') {
    emailLogin.value = passwordLogin.value = '';
    loginForm.classList.toggle('hidden');
    container.classList.toggle('hidden');
    ownerDashboard.classList.remove('hidden');
  } else {
    alert(data.message);
    emailLogin.value = passwordLogin.value = '';
  }
});

// Create account
createButton.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.toggle('hidden');
  createForm.classList.remove('hidden');
  createButton.classList.toggle('hidden');
});
