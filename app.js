/* ============================
   CONFIG (LINPEAS STYLE)
============================ */
const SEVERITY = {
  high: {
    class: "hl-high",
    words: [
      // ===== CREDENCIALES / PASSWORDS =====
      "password",
      "pwd",
      "pass",
      "plaintext",
      "cleartext",
      "reversible encryption",
      "stored credentials",
      "credential",
      "creds",

      // ===== CUENTAS DE SERVICIO =====
      "svc",
      "service",
      "service account",
      "sql",
      "backup",
      "oracle",
      "sap",
      "exchange",

      // ===== GRUPOS JUGOSOS =====
      "domain admins",
      "enterprise admins",
      "administrators",
      "backup operators",
      "account operators",
      "server operators",
      "dnsadmins",
      "print operators",
      "remote desktop users",

      // ===== MOVIMIENTO LATERAL =====
      "local administrator",
      "local admin",
      "admin$",
      "c$",
      "winrm",
      "psexec",
      "wmi",
      "rdp",

      // ===== KERBEROS / ABUSO =====
      "serviceprincipalname",
      "spn",
      "kerberoast",
      "as-rep",
      "preauth",
      "delegation",
      "trusted for delegation",

      // ===== PERMISOS / ACL =====
      "genericall",
      "genericwrite",
      "writeowner",
      "writedacl",
      "all extended rights",

      // ===== MALAS PRACTICAS =====
      "password never expires",
      "password not required",
      "dont require kerberos preauthentication",
      "preauth disabled",


      "admin",

      // ===== COSAS QUE SIEMPRE VALEN ORO =====
      "krbtgt",
      "gpo",
      "group policy",
      "trust",
      "sid"
    ]
  }
};


const searchInput = document.getElementById("search");
const clearBtn = document.getElementById("clear-button");
const filterSeverity = document.getElementById("severity-select");

/* ============================
   UTILS
============================ */
function normalize(t) {
  return t.toLowerCase();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isEmptyRow(row) {
  // Check if all table cells are empty or contain only whitespace
  return Array.from(row.querySelectorAll('td')).every(td => td.innerText.trim() === '');
}

/* ============================
   STEP 1: HIGHLIGHT + SEVERITY
============================ */
document.querySelectorAll("table tbody tr").forEach(row => {
  let rowSeverity = "none";
  let rowHasData = false; // Flag to check if row has data

  row.querySelectorAll("td").forEach(td => {
    let html = td.innerHTML;

    // Check if the cell contains any data
    if (html.trim()) {
      rowHasData = true;
    }

    for (const [level, cfg] of Object.entries(SEVERITY)) {
      cfg.words.forEach(word => {
        const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
        if (regex.test(html)) {
          // Apply highlighted styles similar to linpeas.sh
          html = html.replace(
            regex,
            `<span class="${cfg.class}">$&</span>`
          );
          rowSeverity = level;
        }
      });
    }

    td.innerHTML = html;
  });

  row.dataset.severity = rowSeverity;

  // If the row has no data, hide it
  if (!rowHasData) {
    row.style.display = "none";
  }
});

/* ============================
   STEP 2: SEARCH + FILTER
============================ */
function applyFilters() {
  const query = normalize(searchInput.value.trim());
  const severity = filterSeverity.value;
  const searchRegex = query
    ? new RegExp(escapeRegex(query), "i")
    : null;

  document.querySelectorAll("section").forEach(section => {
    let sectionVisible = false;

    section.querySelectorAll("tbody tr").forEach(row => {
      let visible = true;

      // 🔍 Search text filtering
      if (searchRegex && !searchRegex.test(row.innerText)) {
        visible = false;
      }

      // 🔥 Severity filtering
      if (
        severity &&
        severity !== "all" &&
        row.dataset.severity !== severity
      ) {
        visible = false;
      }

      // Hide rows that are empty
      if (isEmptyRow(row)) {
        visible = false;
      }

      row.style.display = visible ? "" : "none";
      if (visible) sectionVisible = true;
    });

    // 🚫 Ensure headers (th) are always visible, even when no rows are visible
    const sectionHeader = section.querySelector("thead");
    const sectionBody = section.querySelector("tbody");

    // Show header and ensure the body is visible only when there are matching rows
    sectionHeader.style.display = ""; // Ensure header is always shown
    sectionBody.style.display = sectionVisible ? "" : "none"; // Show body only if there's any visible row
  });
}

/* ============================
   EVENTS
============================ */
searchInput.addEventListener("input", applyFilters);
filterSeverity.addEventListener("change", applyFilters);

/* ============================
   CLEAR
============================ */
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterSeverity.value = "all";
  applyFilters();
});
