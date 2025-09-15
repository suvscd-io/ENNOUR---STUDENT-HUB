
document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();

  // Signup Form
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = signupForm.email.value;
      const password = signupForm.password.value;
      const statusDiv = document.getElementById('form-status');

      try {
        await auth.createUserWithEmailAndPassword(email, password);
        statusDiv.textContent = 'Account created successfully! Redirecting...';
        statusDiv.style.color = 'green';
        setTimeout(() => window.location.href = 'forum.html', 2000);
      } catch (error) {
        statusDiv.textContent = error.message;
        statusDiv.style.color = 'red';
      }
    });
  }

  // Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      const statusDiv = document.getElementById('form-status');

      try {
        await auth.signInWithEmailAndPassword(email, password);
        statusDiv.textContent = 'Logged in successfully! Redirecting...';
        statusDiv.style.color = 'green';
        setTimeout(() => window.location.href = 'forum.html', 2000);
      } catch (error) {
        statusDiv.textContent = error.message;
        statusDiv.style.color = 'red';
      }
    });
  }

  // Logout Button
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        await auth.signOut();
        window.location.href = 'index.html';
      } catch (error) {
        alert('Logout failed: ' + error.message);
      }
    });
  }
});
