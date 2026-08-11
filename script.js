const $ = (id) => document.getElementById(id);

const form = $("quiz-form");
const nameInput = $("name");
const nameError = $("name-error");
const quizView = $("quiz-view");
const certView = $("cert-view");
const certificate = $("certificate");
const certName = $("cert-name");
const downloadBtn = $("download-btn");

function renderContent() {
  $("t-title").textContent = TEXT.title;
  $("t-subtitle").textContent = TEXT.subtitle;
  $("t-name-label").textContent = TEXT.nameLabel;
  nameInput.placeholder = TEXT.namePlaceholder;
  $("t-name-hint").textContent = TEXT.nameHint;
  nameError.textContent = TEXT.nameError;
  $("t-submit").textContent = TEXT.submit;
  $("t-thanks").textContent = TEXT.thanks;
  downloadBtn.textContent = TEXT.download;
  $("retake-btn").textContent = TEXT.retake;
  $("t-tip").textContent = TEXT.tip;

  $("c-org").textContent = TEXT.certOrg;
  $("c-title").textContent = TEXT.certTitle;
  $("c-sub").textContent = TEXT.certSub;
  $("c-body").textContent = TEXT.certBody;
  $("c-date-label").textContent = TEXT.dateLabel;
  $("c-org-label").textContent = TEXT.organiserLabel;
  $("c-org-name").textContent = TEXT.organiserName;

  const list = $("questions");
  QUESTIONS.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "card";

    const q = document.createElement("p");
    q.className = "q";
    q.textContent = item.q;
    li.appendChild(q);

    item.options.forEach((opt, j) => {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `q${i + 1}`;
      radio.value = String(j);
      if (j === 0) radio.required = true;

      const span = document.createElement("span");
      span.textContent = opt;

      label.append(radio, span);
      li.appendChild(label);
    });

    list.appendChild(li);
  });
}

function fitCertificate() {
  const stage = certificate.parentElement;
  const scale = Math.min(1, stage.clientWidth / 1000);
  certificate.style.transform = `scale(${scale})`;
  stage.style.height = `${700 * scale}px`;
}

// Long Marathi names must shrink rather than wrap — wrapping can split a
// consonant cluster away from its matra.
function fitName() {
  const max = 860;
  let size = 52;
  certName.style.fontSize = `${size}px`;
  while (certName.scrollWidth > max && size > 22) {
    size -= 2;
    certName.style.fontSize = `${size}px`;
  }
}

function formatDate() {
  // Marathi month names with Latin digits, e.g. 15 ऑगस्ट 2026.
  // The mr locale inserts a comma before the year, which reads oddly on a
  // certificate, so drop it.
  return new Date()
    .toLocaleDateString("mr-IN-u-nu-latn", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(",", "");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim().replace(/\s+/g, " ");
  if (!name) {
    nameError.hidden = false;
    nameInput.focus();
    return;
  }
  nameError.hidden = true;

  certName.textContent = name;
  $("cert-date").textContent = formatDate();

  quizView.hidden = true;
  certView.hidden = false;

  // Measure only once the Devanagari face is available, otherwise fitName()
  // sizes against the fallback font's metrics.
  await document.fonts.ready;
  fitName();
  fitCertificate();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$("retake-btn").addEventListener("click", () => {
  form.reset();
  certView.hidden = true;
  quizView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

downloadBtn.addEventListener("click", async () => {
  downloadBtn.disabled = true;
  downloadBtn.textContent = TEXT.downloading;

  try {
    await document.fonts.ready;
    const dataUrl = await htmlToImage.toPng(certificate, {
      pixelRatio: 2,
      width: 1000,
      height: 700,
      backgroundColor: "#fffdf8",
      style: { transform: "none", margin: "0" },
    });
    const link = document.createElement("a");
    link.download = "certificate.png";
    link.href = dataUrl;
    link.click();
  } catch (err) {
    alert(TEXT.downloadFailed);
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.textContent = TEXT.download;
  }
});

window.addEventListener("resize", () => {
  if (!certView.hidden) {
    fitName();
    fitCertificate();
  }
});

renderContent();
