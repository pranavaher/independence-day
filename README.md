# स्वातंत्र्य दिन प्रश्नमंजुषा — सहभाग प्रमाणपत्र

A static Independence Day quiz page in Marathi for जि. प. प्राथमिक शाळा, मांडवे
बुद्रुक. The participant enters their name, answers a few questions, and the
school's certificate is shown with their name printed on it. They can download
it as a PNG or take a screenshot.

Everything runs client-side. No backend, no email, nothing is stored or sent
anywhere — the name never leaves the participant's browser.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure (form + certificate) |
| `content.js` | **All page text and questions — edit only this to change wording** |
| `styles.css` | Styling for the page, and the name's position on the artwork |
| `script.js` | Form handling, name fitting, PNG download |
| `certificate-bg.jpg` | The certificate artwork, 1536×1024 |
| `tools/prepare-artwork.py` | Regenerates the artwork from the original design |

## Editing the quiz

Open `content.js`. `TEXT` holds every string on the *page*; `QUESTIONS` is an
array of `{ q, options }`. Add, remove, or reword freely — the page rebuilds
itself from the array and the numbering follows.

Answers are not checked and no score is shown; this is a participation
certificate only. Numbers use Latin digits while all words are in Marathi.

Note that the certificate's own wording — the school name, the तालुका line, the
body text and दिनांक — is **part of the artwork image**, not text. Only the
participant's name is drawn on top. To change any of that wording you have to
edit the image.

## The certificate artwork

`certificate-bg.jpg` is generated from the original design by
`tools/prepare-artwork.py`, which makes two passes:

1. **Erases** the `इयत्ता:` line, the `स्थळ:` line, and both signature blocks
   (मुख्याध्यापक / स्पर्धा प्रमुख). `दिनांक: १५ ऑगस्ट २०२६` is kept.
2. **Slides the message block up 42px** to close the gap the removed `इयत्ता`
   row left between the name rule and the text below it. 42px is that row's
   line pitch, so the message lands exactly where it used to sit.

Erased areas are filled with the paper's own cream tone, sampled per row from
neighbouring pixels with a little grain, so no rectangle is visible. To rerun
it you need `artwork-source.png` (the untouched original) and Pillow:

```bash
python3 -m venv .venv && .venv/bin/pip install pillow
.venv/bin/python tools/prepare-artwork.py
```

### Where the name goes

The participant's name is absolutely positioned onto the `कु./कुमार:` rule.
Every coordinate in `.cert-name` is in the artwork's own pixel space:

| Landmark | Position |
| --- | --- |
| the rule | `y = 566`, from `x = 527` to `x = 1133` |
| printed line above it ends | `y = 529` |
| message below now starts | `y = 594` |
| name ink actually lands at | `y = 528` to `y = 571` |

The name is set in Noto Sans Devanagari **700** rather than the display face,
because Tiro Devanagari Marathi ships no bold and faux-bold smears conjuncts.
At 38px its descenders cross the rule by about 5px, which is what handwriting
on a ruled line looks like.

If you replace the artwork, re-measure those landmarks and update `.cert-name`
in `styles.css` plus `NAME_MAX_WIDTH` / `NAME_MAX_FONT` in `script.js`.

Long names shrink to fit rather than wrap, since wrapping would split a
Devanagari cluster and there is only one rule to write on. Note that the size
is measured on the inner `<span>`, not the `.cert-name` box — the box is a
fixed-width flex container, so its own width says nothing about how wide the
text is.

## Running locally

Because the page loads `content.js` and `script.js` as separate files, open it
through a local server rather than double-clicking the file:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Deploying to GitHub Pages

1. Commit and push to the repository.
2. Repository → **Settings** → **Pages**.
3. Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Save. The site goes live at `https://<username>.github.io/<repo>/`.

There is no build step and nothing to install.

## Marathi rendering notes

Devanagari breaks in ways Latin text does not, so a few things are deliberate
and should be preserved when editing the CSS:

- **No `letter-spacing`** on any Devanagari text. It splits conjuncts and
  detaches matras from their base characters, both on screen and in the export.
- **No `text-transform`** — meaningless for Devanagari and it interferes with
  shaping in some engines.
- **Generous `line-height`** on page text, otherwise matras above and below the
  line get clipped.
- **No `word-break: break-word`** on the name; long names shrink instead, since
  breaking mid-cluster produces broken glyphs.
- `font-synthesis: none` prevents faux-bold, which smears conjuncts.

The PNG export uses [html-to-image](https://github.com/bubkoo/html-to-image),
which renders through an SVG `foreignObject` so the browser's own text engine
shapes the Devanagari. This is why it is used instead of html2canvas, which
rasterises text character by character and mangles complex scripts.

The certificate is exported at the artwork's native 1536×1024 at `pixelRatio: 1`
— upscaling past that would only soften the artwork.

## Optional: use local fonts

The name is set in Tiro Devanagari Marathi, loaded from Google Fonts over CDN.
If the venue's network is unreliable, download the `.woff2` into a `fonts/`
folder and declare it with `@font-face` instead. This also makes the PNG export
faster and more reliable.
