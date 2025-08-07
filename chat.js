// chat.js – Handles amulet generation interaction

let userInput = {
  birthdate: '',
  gender: '',
  wishes: [],
  style: ''
};

// Called in form_step1.html
function saveStep1() {
  const dob = document.getElementById('dob').value;
  const gender = document.getElementById('gender').value;
  if (!dob || !gender) return alert('Please fill in all fields.');

  userInput.birthdate = dob;
  userInput.gender = gender;
  localStorage.setItem('amuletInput', JSON.stringify(userInput));
  window.location.href = 'form_step2.html';
}

// Called in form_step2.html
function saveStep2() {
  const wish1 = document.getElementById('wish1').value.trim();
  const wish2 = document.getElementById('wish2').value.trim();
  const wish3 = document.getElementById('wish3').value.trim();

  const saved = JSON.parse(localStorage.getItem('amuletInput')) || {};
  saved.wishes = [wish1, wish2, wish3].filter(w => w);
  if (saved.wishes.length === 0) return alert('Enter at least one wish.');

  localStorage.setItem('amuletInput', JSON.stringify(saved));
  window.location.href = 'form_step3.html';
}

// Called in form_step3.html
function saveStep3() {
  const selected = document.querySelector('input[name="style"]:checked');
  if (!selected) return alert('Please choose a style.');

  const saved = JSON.parse(localStorage.getItem('amuletInput')) || {};
  saved.style = selected.value;

  localStorage.setItem('amuletInput', JSON.stringify(saved));
  window.location.href = 'loading.html';
}

// Called in loading.html
async function generateAmulet() {
  const input = JSON.parse(localStorage.getItem('amuletInput'));
  if (!input) return alert('Missing input data.');

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    const data = await res.json();
    localStorage.setItem('amuletResult', data.result);
    window.location.href = 'result.html';
  } catch (err) {
    alert('Failed to generate amulet.');
    console.error(err);
  }
}

// Called in result.html
function displayResult() {
  const result = localStorage.getItem('amuletResult') || 'No result.';
  document.getElementById('result-text').innerText = result;
}
