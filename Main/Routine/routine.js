// Early theme initialization
(function initEarlyTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
})();

// Table controls
function addRow() {
  const table = document.getElementById("routineTable");
  if (!table || !table.rows.length) return;
  const row = table.insertRow();
  const colCount = table.rows[0].cells.length;
  for (let i = 0; i < colCount; i++) {
    const cell = row.insertCell();
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter your text";
    cell.appendChild(input);
  }
}

function addColumn() {
  const table = document.getElementById("routineTable");
  if (!table || !table.rows.length) return;

  const firstRow = table.rows[0];
  const hasTimeInFirstRow = !!firstRow.querySelector("input[type='time']");

  for (let r = 0; r < table.rows.length; r++) {
    const cell = table.rows[r].insertCell();
    const input = document.createElement("input");
    input.type = (r === 0 && hasTimeInFirstRow) ? "time" : "text";
    input.placeholder = "Enter your text";
    cell.appendChild(input);
  }
}

function deleteLastRow() {
  const table = document.getElementById("routineTable");
  if (!table) return;
  // keep at least 1 row
  if (table.rows.length > 1) table.deleteRow(-1);
}

function deleteLastColumn() {
  const table = document.getElementById("routineTable");
  if (!table || !table.rows.length) return;
  const cols = table.rows[0].cells.length;
  // keep at least 1 column
  if (cols > 1) {
    for (let r = 0; r < table.rows.length; r++) {
      table.rows[r].deleteCell(-1);
    }
  }
}

// Loading animation
let __loadingInterval = null;
function startLoading(el, baseText = "Submitting, please wait") {
  if (!el) return;
  stopLoading();
  el.textContent = baseText; // show immediately
  let dots = 0;
  __loadingInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    el.textContent = baseText + ".".repeat(dots);
  }, 500);
}
function stopLoading() {
  if (__loadingInterval !== null) {
    clearInterval(__loadingInterval);
    __loadingInterval = null;
  }
}

// Submit data
let submitting = false;
async function submitData() {
  if (submitting) return; // prevent double clicks
  const msg = document.getElementById("msg");
  const nameEl = document.getElementById("name");
  const phoneEl = document.getElementById("phone");
  const suggestionEl = document.getElementById("suggestion");
  const submitBtn = document.getElementById("submitBtn");

  const name = nameEl ? nameEl.value.trim() : "";
  const phone = phoneEl ? phoneEl.value.trim() : "";
  const suggestion = suggestionEl ? suggestionEl.value.trim() : "";

  if (!name || !phone) {
    if (msg) {
      msg.style.color = "red";
      msg.textContent = "Please enter name & phone.";
    }
    return;
  }

  const table = document.getElementById("routineTable");
  if (!table) {
    if (msg) {
      msg.style.color = "red";
      msg.textContent = "Table not found.";
    }
    return;
  }

  const routine = [];
  for (let i = 0; i < table.rows.length; i++) {
    const inputs = Array.from(table.rows[i].querySelectorAll("input"));
    const row = inputs.map(inp => (inp.value || "").trim());
    // Keep only non-empty rows
    if (row.some(v => v !== "")) routine.push(row);
  }

  if (!routine.length) {
    if (msg) {
      msg.style.color = "red";
      msg.textContent = "Add at least one entry.";
    }
    return;
  }

  if (msg) {
    msg.style.color = "";
    startLoading(msg, "Submitting, please wait");
  }
  if (submitBtn) submitBtn.disabled = true;
  submitting = true;

  const payload = { name, phone, routine, suggestion };
  const url = (window.location.hostname === "localhost")
    ? "http://localhost:5000/submit"
    : "https://ilmiq-backend.onrender.com/submit";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let result;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      result = await res.json();
    } else {
      const text = await res.text();
      try {
        result = JSON.parse(text);
      } catch {
        result = { ok: false, error: "Non-JSON response from server", raw: text };
      }
    }

    stopLoading();
    if (submitBtn) submitBtn.disabled = false;
    submitting = false;

    if (result.ok) {
      if (msg) {
        msg.style.color = "green";
        msg.innerHTML = "✅ Uploaded successfully! Our designer will contact you soon.";
      }
    } else {
      if (msg) {
        msg.style.color = "red";
        msg.textContent = "Error: " + (result.error || "Unknown error");
      }
    }
  } catch (err) {
    stopLoading();
    if (submitBtn) submitBtn.disabled = false;
    submitting = false;

    if (msg) {
      msg.style.color = "red";
      msg.textContent = "Submit failed. Please try again.";
    }
    console.error("Submit error:", err);
  }
}

// Theme management
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

document.addEventListener("DOMContentLoaded", () => {
  const addRowBtn = document.getElementById("addRowBtn");
  const addColBtn = document.getElementById("addColBtn");
  const delRowBtn = document.getElementById("delRowBtn");
  const delColBtn = document.getElementById("delColBtn");
  const submitBtn = document.getElementById("submitBtn");
  const themeToggleBtn = document.getElementById("themeToggle");

  if (addRowBtn) addRowBtn.onclick = addRow;
  if (addColBtn) addColBtn.onclick = addColumn;
  if (delRowBtn) delRowBtn.onclick = deleteLastRow;
  if (delColBtn) delColBtn.onclick = deleteLastColumn;
  if (submitBtn) submitBtn.onclick = submitData;
  if (themeToggleBtn) themeToggleBtn.onclick = toggleTheme;
});
