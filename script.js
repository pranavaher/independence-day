const $ = (id) => document.getElementById(id);

const form = $("quiz-form");
const nameInput = $("name");
const nameError = $("name-error");
const quizView = $("quiz-view");
const certView = $("cert-view");
const certificate = $("certificate");
const certName = $("cert-name");
const downloadBtn = $("download-btn");

// Native size of the certificate artwork.
const CERT_W = 1536;
const CERT_H = 1024;

// The blank rule the name is written on, in artwork pixels.
const NAME_MAX_WIDTH = 590;
const NAME_MAX_FONT = 38;

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
  // $("retake-btn").textContent = TEXT.retake;
  $("t-tip").textContent = TEXT.tip;

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
  const scale = Math.min(1, (stage.clientWidth - 32) / CERT_W);
  certificate.style.transform = `scale(${scale})`;
  stage.style.height = `${CERT_H * scale}px`;
}

// Long Marathi names must shrink rather than wrap — wrapping can split a
// consonant cluster away from its matra, and there is only one rule to
// write on. Measured on the inner span: the wrapper is a fixed-width flex
// box, so its own width says nothing about how wide the text is.
function fitName() {
  let size = NAME_MAX_FONT;
  certName.style.fontSize = `${size}px`;
  while (certName.offsetWidth > NAME_MAX_WIDTH && size > 18) {
    size -= 1;
    certName.style.fontSize = `${size}px`;
  }
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

  quizView.hidden = true;
  certView.hidden = false;

  // Measure only once the Devanagari face is available, otherwise fitName()
  // sizes against the fallback font's metrics.
  await document.fonts.ready;
  fitName();
  fitCertificate();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// $("retake-btn").addEventListener("click", () => {
//   form.reset();
//   certView.hidden = true;
//   quizView.hidden = false;
//   window.scrollTo({ top: 0, behavior: "smooth" });
// });

downloadBtn.addEventListener("click", async () => {
  downloadBtn.disabled = true;
  downloadBtn.textContent = TEXT.downloading;

  try {
    await document.fonts.ready;
    const dataUrl = await htmlToImage.toPng(certificate, {
      pixelRatio: 1,
      width: CERT_W,
      height: CERT_H,
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
