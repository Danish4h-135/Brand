function addRow() {
  const table = document.getElementById("routineTable");
  const row = table.insertRow();
  const headerCount = table.rows[0].cells.length;
  for (let i = 0; i < headerCount; i++) {
    const cell = row.insertCell();
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter your text";
    cell.appendChild(input);
  }
}

function addColumn() {
  const table = document.getElementById("routineTable");
  for (let i = 0; i < table.rows.length; i++) {
    const cell = table.rows[i].insertCell();
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter your text";
    cell.appendChild(input);
  }
}


function deleteLastRow() {
  const table = document.getElementById("routineTable");
  if (table.rows.length > 2) table.deleteRow(-1);
}

function deleteLastColumn() {
  const table = document.getElementById("routineTable");
  const cols = table.rows[0].cells.length;
  if (cols > 1) {
    for (let i = 0; i < table.rows.length; i++) {
      table.rows[i].deleteCell(-1);
    }
  }
}

async function submitData() {
  const msg = document.getElementById("msg");
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  if (!name || !phone) { msg.innerText = "Enter name & phone."; return; }

  const table = document.getElementById("routineTable");
  const routine = [];
  for (let i = 0; i < table.rows.length; i++) {
    const row = [];
    const inputs = table.rows[i].querySelectorAll("input");
    inputs.forEach(inp => row.push(inp.value.trim()));
    if (row.some(v => v !== "")) routine.push(row);
  }

  if (!routine.length) { msg.innerText = "Add at least one entry."; return; }
  msg.innerText = "Submitting...";

  const payload = { name, phone, routine };
  const url = "/submit";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.ok) {
      msg.style.color = "green";
      msg.innerHTML = `Uploaded! <a href="${result.sheetUrl}" target="_blank">View Sheet</a>`;
    } else {
      msg.style.color = "red";
      msg.innerText = "Error: " + result.error;
    }
  } catch (err) {
    msg.style.color = "red";
    msg.innerText = "Submit failed.";
  }
}

// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize existing buttons
  document.getElementById("addRowBtn").onclick = addRow;
  document.getElementById("addColBtn").onclick = addColumn;
  document.getElementById("delRowBtn").onclick = deleteLastRow;
  document.getElementById("delColBtn").onclick = deleteLastColumn;
  document.getElementById("submitBtn").onclick = submitData;
  
  // Initialize theme
  initTheme();
  document.getElementById("themeToggle").onclick = toggleTheme;
});
