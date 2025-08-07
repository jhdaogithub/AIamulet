// chat.js – Handles amulet generation from Step 1 to result

// Step 1 - Save DOB + gender
function saveStep1() {
  const dob = document.getElementById('dob').value;
  const gender = document.getElementById('gender').value;
  if (!dob || !gender) return alert('Please fill in all fields.');

  const userInput = {
    birthdate: dob,
    gender: gender,
    wishes: [],
    style: ""
  };

  localStorage.setItem('amuletInput', JSON.stringify(userInput));
  window.location.href = 'form_step2.html';
}

// Step 2 - Save wishes
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

// Step 3 - Save style
function saveStep3() {
  const selected = document.querySelector('input[name="style"]:checked');
  if (!selected) return alert('Please choose a style.');

  const saved = JSON.parse(localStorage.getItem('amuletInput')) || {};
  saved.style = selected.value;

  localStorage.setItem('amuletInput', JSON.stringify(saved));
  window.location.href = 'loading.html';
}

// Loading - Generate Amulet
async function generateAmulet() {
  const input = JSON.parse(localStorage.getItem('amuletInput'));
  if (!input || !input.birthdate || !input.gender || !input.wishes || !input.style) {
    localStorage.setItem('amuletResult', JSON.stringify({
      description: 'Missing input data.',
      imageUrl: ''
    }));
    window.location.href = 'result.html';
    return;
  }

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(errText || res.statusText);
    }

    const data = await res.json();
    const result = {
      description: data.description || 'No description returned.',
      imageUrl: data.imageUrl || ''
    };

    localStorage.setItem('amuletResult', JSON.stringify(result));
    window.location.href = 'result.html';

  } catch (err) {
    console.error('Amulet generation error:', err);
    localStorage.setItem('amuletResult', JSON.stringify({
      description: 'Failed to generate amulet.',
      imageUrl: ''
    }));
    window.location.href = 'result.html';
  }
}

// Result - Display image + description
function displayResult() {
  const { description, imageUrl } = JSON.parse(localStorage.getItem('amuletResult') || '{}');

  const textDiv = document.getElementById('result-text');
  const imgDiv = document.getElementById('result-image');

  if (description) {
    textDiv.innerText = description;
  }

  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Generated Amulet';
    img.style.width = '100%';
    img.style.borderRadius = '12px';
    imgDiv.appendChild(img);
  }
}

