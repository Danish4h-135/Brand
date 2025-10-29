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

  const firstRow = table.rows[0];
  const isTimeRow = firstRow && firstRow.querySelector("input[type='time']");

  for (let i = 0; i < table.rows.length; i++) {
    const cell = table.rows[i].insertCell();
    const input = document.createElement("input");
    input.type = i === 0 && isTimeRow ? "time" : "text";
    input.placeholder = "Enter your text";
    cell.appendChild(input);
  }
}

// Loading dots animation helper
let __loadingInterval = null;
function startLoading(el, baseText = 'Submitting, please be patient') {
  if (!el) return;
  // ensure we don't start multiple intervals
  stopLoading();
  el.style.color = '';
  el.textContent = baseText;
  let dots = 0;
  __loadingInterval = setInterval(() => {
    dots = (dots + 1) % 4; // 0..3
    el.textContent = baseText + '.'.repeat(dots);
  }, 500);
}

function stopLoading() {
  if (__loadingInterval) {
    clearInterval(__loadingInterval);
    __loadingInterval = null;
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
  const suggestion = document.querySelector(".suggestions input").value.trim(); // 👈 added

  if (!name || !phone) {
    msg.innerText = "Enter name & phone.";
    return;
  }

  const table = document.getElementById("routineTable");
  const routine = [];
  for (let i = 0; i < table.rows.length; i++) {
    const row = [];
    const inputs = table.rows[i].querySelectorAll("input");
    inputs.forEach((inp) => row.push(inp.value.trim()));
    if (row.some((v) => v !== "")) routine.push(row);
  }

  if (!routine.length) {
    msg.innerText = "Add at least one entry.";
    return;
  }

  msg.style.color = '';
  startLoading(msg, 'Submitting, please be patient');

  const payload = { name, phone, routine, suggestion }; // 👈 include suggestion
  const url = window.location.hostname === "localhost"
    ? "http://localhost:5000/submit"
    : "https://ilmiq.onrender.com/submit";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    stopLoading();
    if (result.ok) {
      msg.style.color = "green";
      msg.innerHTML = `✅ Uploaded successfully! Our designer will contact you soon.`;
    } else {
      msg.style.color = "red";
      msg.innerText = "Error: " + result.error;
    }
  } catch (err) {
    stopLoading();
    msg.style.color = "red";
    msg.innerText = "Submit failed.";
  }
}


// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addRowBtn").onclick = addRow;
  document.getElementById("addColBtn").onclick = addColumn;
  document.getElementById("delRowBtn").onclick = deleteLastRow;
  document.getElementById("delColBtn").onclick = deleteLastColumn;
  document.getElementById("submitBtn").onclick = submitData;

  // Initialize theme
  initTheme();
  document.getElementById("themeToggle").onclick = toggleTheme;
});
