/**
 * InterviewReady - Vanilla JavaScript Implementation
 * Connects to the Express backend API (/api/feedback, /api/questions, etc.)
 */

document.addEventListener('DOMContentLoaded', () => {
  const introBtn = document.getElementById('btn-get-feedback');
  const introInput = document.getElementById('intro-textarea');
  const feedbackResult = document.getElementById('intro-feedback-result');

  if (introBtn && introInput && feedbackResult) {
    introBtn.addEventListener('click', async () => {
      const text = introInput.value.trim();
      if (!text) {
        feedbackResult.innerHTML = '<p style="color:#ef4444; font-size:0.85rem;">Please write an introduction first before requesting feedback.</p>';
        return;
      }

      introBtn.disabled = true;
      introBtn.textContent = 'Analyzing...';

      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'introduction',
            question: 'Tell me about yourself (4-5 sentences)',
            answer: text
          })
        });

        const data = await response.json();
        renderFeedback(data, feedbackResult);

        // Save progress to localStorage
        const saved = JSON.parse(localStorage.getItem('interviewready_vanilla') || '{}');
        saved.introCompleted = true;
        saved.introScore = data.score;
        localStorage.setItem('interviewready_vanilla', JSON.stringify(saved));
      } catch (err) {
        console.error(err);
        feedbackResult.innerHTML = `<p style="color:red">Error: Could not retrieve feedback.</p>`;
      } finally {
        introBtn.disabled = false;
        introBtn.textContent = 'Get Feedback';
      }
    });
  }

  // Login handler
  const loginBtn = document.getElementById('btn-login');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const loginStatus = document.getElementById('login-status');
  const demoStudentBtn = document.getElementById('btn-demo-student');
  const demoAnalystBtn = document.getElementById('btn-demo-analyst');

  async function performLogin(email, password) {
    if (!loginStatus) return;
    loginStatus.innerHTML = '<span style="color:#2563eb">Signing in...</span>';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      loginStatus.innerHTML = `<span style="color:#10b981; font-weight:600">✓ Welcome, ${data.user.name} (${data.user.targetRole})!</span>`;
      localStorage.setItem('interviewready_vanilla_user', JSON.stringify(data.user));
    } catch (err) {
      loginStatus.innerHTML = `<span style="color:#ef4444">${err.message}</span>`;
    }
  }

  // JSON Mode and handlers
  const toggleJsonBtn = document.getElementById('btn-toggle-json-mode');
  const standardFields = document.getElementById('standard-login-fields');
  const jsonFields = document.getElementById('json-login-fields');
  const jsonTextarea = document.getElementById('json-textarea');
  const submitJsonBtn = document.getElementById('btn-submit-json');
  const templateRegisterBtn = document.getElementById('btn-template-register');

  if (toggleJsonBtn && standardFields && jsonFields) {
    toggleJsonBtn.addEventListener('click', () => {
      const isJsonVisible = jsonFields.style.display !== 'none';
      jsonFields.style.display = isJsonVisible ? 'none' : 'block';
      standardFields.style.display = isJsonVisible ? 'block' : 'none';
      toggleJsonBtn.textContent = isJsonVisible ? 'Toggle JSON Mode' : 'Toggle Form Mode';
    });
  }

  if (templateRegisterBtn && jsonTextarea) {
    templateRegisterBtn.addEventListener('click', () => {
      jsonTextarea.value = JSON.stringify({
        name: 'Jordan Lee',
        email: 'jordan.lee@example.com',
        password: 'password123',
        targetRole: 'Full Stack Engineer'
      }, null, 2);
    });
  }

  if (submitJsonBtn && jsonTextarea && loginStatus) {
    submitJsonBtn.addEventListener('click', async () => {
      try {
        const parsed = JSON.parse(jsonTextarea.value);
        loginStatus.innerHTML = '<span style="color:#2563eb">Submitting JSON credentials...</span>';
        const res = await fetch('/api/auth/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'JSON Login failed');
        loginStatus.innerHTML = `<span style="color:#10b981; font-weight:600">✓ ${data.message || 'Authenticated successfully!'} (${data.user.name})</span>`;
        localStorage.setItem('interviewready_vanilla_user', JSON.stringify(data.user));
      } catch (err) {
        loginStatus.innerHTML = `<span style="color:#ef4444">JSON Error: ${err.message}</span>`;
      }
    });
  }
});

function renderFeedback(data, container) {
  container.innerHTML = `
    <div class="feedback-box">
      <h3>Communication Score: ${data.score}/10</h3>
      <p><strong>(a) Corrected Grammar:</strong> ${escapeHtml(data.correctedAnswer)}</p>
      <p><strong>(b) Better Word Choices:</strong> ${data.vocabularySuggestions?.map(v => `${v.originalWordOrPhrase} → <em>${v.betterAlternative}</em>`).join(', ')}</p>
      <p><strong>(c) Stronger Version:</strong> "${escapeHtml(data.improvedAnswer)}"</p>
      <p><strong>(d) Tips:</strong></p>
      <ul>${data.tips?.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
