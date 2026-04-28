# NutriFit Thesis - LaTeX Documentation

This directory contains the complete LaTeX source code for the NutriFit thesis document.

## Structure

```
thesis/
├── main.tex                          # Main document file (uses ELTE template)
├── references.bib                    # Bibliography references
├── elteikthesis.cls                 # ELTE template class file (REQUIRED - download separately)
├── logo/                            # ELTE logos (REQUIRED - download separately)
│   └── elte_cimer_szines.pdf
├── chapters/
│   ├── 01-registration-form.tex     # Topic registration form page
│   ├── 02-acknowledgements.tex      # Acknowledgements
│   ├── 03-abstract.tex              # Abstract with keywords
│   ├── chapter1-introduction.tex    # Chapter 1: Introduction
│   ├── chapter2-user-documentation.tex      # Chapter 2: User Documentation
│   ├── chapter3-developer-documentation.tex # Chapter 3: Developer Documentation
│   ├── chapter4-summary.tex         # Chapter 4: Summary
│   └── abbreviations.tex            # List of Abbreviations
├── images/                          # All images and diagrams
│   └── README.md                    # Image requirements and guidelines
├── ELTE_TEMPLATE_SETUP.md           # ELTE template installation guide
└── README.md                        # This file
```

**Note:** Front page is generated automatically by ELTE template using `\maketitle` command.

## IMPORTANT: ELTE Template Required

This thesis uses the official ELTE thesis template (`elteikthesis` document class). You MUST install the template before compiling.

See `ELTE_TEMPLATE_SETUP.md` for detailed installation instructions.

## Quick Start for Overleaf

### Step 1: Get ELTE Template
1. Download from: https://github.com/ELTE-DH/elteikthesis
2. You need: `elteikthesis.cls` and `logo/` folder

### Step 2: Create Project in Overleaf
1. Go to [Overleaf](https://www.overleaf.com)
2. Click "New Project" → "Blank Project"
3. Name it "NutriFit Thesis"

### Step 3: Upload ELTE Template Files
1. Upload `elteikthesis.cls` to project root
2. Create `logo/` folder and upload ELTE logo files

### Step 4: Upload Thesis Files
1. Upload `main.tex` and `references.bib` to root
2. Create `chapters/` folder and upload all chapter files
3. Create `images/` folder (will add images later)

### Step 5: Configure and Compile
1. Click on "Menu" (top left)
2. Set "Compiler" to "pdfLaTeX"
3. Set "Main document" to "main.tex"
4. Click "Recompile" to generate the PDF

### Step 4: Add Images
1. Take screenshots of your application (see `images/README.md` for requirements)
2. Create required diagrams (ER diagram, class diagram, architecture, use case)
3. Upload all images to the `images/` folder in Overleaf
4. Recompile to see images in the document

## Required Actions Before Submission

### 1. Personal Information
Replace placeholder text in `main.tex`:
- `[Your Full Name]` → Your actual name
- `[Supervisor's Name]` → Your thesis supervisor's name
- `[Supervisor's Title]` → Supervisor's academic title
- Verify degree program is correct (Computer Science BSc)

### 2. Add Images
Upload all required images to the `images/` folder. See `images/README.md` for complete list:
- Framework diagram
- UI screenshots (login, register, dashboard, all features)
- Architecture diagrams
- ER diagram
- Class diagram
- Use case diagram
- Test results screenshots
- Topic registration form scan

### 3. Review Content
- Read through all chapters
- Verify all technical details are accurate
- Check that all figures, tables, and code listings are referenced in text
- Ensure page count is within 60-70 pages

### 4. Bibliography
- Add any additional references you used to `references.bib`
- Ensure all citations in text have corresponding entries in bibliography
- Use `\cite{key}` in text to reference bibliography entries

## Document Features

### Automatic Lists
The document automatically generates:
- Table of Contents
- List of Figures
- List of Tables
- List of Code Listings
- List of Abbreviations

### Cross-References
- Figures: `\ref{fig:label}`
- Tables: `\ref{tab:label}`
- Code: `\ref{code:label}`
- Chapters/Sections: `\ref{sec:label}`

### Adding New Content

#### Add a Figure
```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.8\textwidth]{images/your-image.png}
    \caption{Your caption here}
    \label{fig:your-label}
\end{figure}
```

#### Add a Table
```latex
\begin{table}[htbp]
    \centering
    \caption{Your caption here}
    \label{tab:your-label}
    \begin{tabular}{|l|l|}
        \hline
        Column 1 & Column 2 \\
        \hline
        Data 1 & Data 2 \\
        \hline
    \end{tabular}
\end{table}
```

#### Add Code Listing
```latex
\begin{lstlisting}[language=JavaScript, caption={Your caption}, label={code:your-label}]
// Your code here
\end{lstlisting}
```

## Troubleshooting

### Images Not Showing
- Verify image files are in `images/` folder
- Check filename matches exactly (case-sensitive)
- Ensure image format is supported (PNG, JPG, PDF)

### Compilation Errors
- Check for unmatched braces `{}` or brackets `[]`
- Verify all `\begin{}` have matching `\end{}`
- Look for special characters that need escaping: `& % $ # _ { } ~ ^`

### Bibliography Not Showing
- Ensure you've cited at least one reference using `\cite{}`
- Recompile multiple times (LaTeX needs 2-3 passes for bibliography)

### Page Count Too High
- Reduce image sizes
- Condense verbose sections
- Remove unnecessary whitespace
- Adjust margins (carefully, don't violate ELTE requirements)

## Tips for Success

1. **Compile Often**: Compile after every major change to catch errors early
2. **Use Comments**: Add `%` comments in LaTeX to explain complex sections
3. **Backup**: Download PDF regularly as backup
4. **Proofread**: Read the compiled PDF, not just the LaTeX source
5. **Get Feedback**: Share PDF with supervisor before final submission

## Current Status

✅ Document structure complete (ELTE template format)
✅ All 4 chapters written
✅ Front matter complete (registration form, acknowledgements, abstract)
✅ Bibliography file created with 12 references
✅ Abbreviations list created
✅ All supervisor feedback addressed
⚠️ ELTE template needs to be installed (elteikthesis.cls + logos)
⚠️ Images need to be added
⚠️ Personal information needs to be filled in
⚠️ Final proofreading needed

## Estimated Page Count

Based on current content:
- Front matter: ~5 pages
- Chapter 1: ~8 pages
- Chapter 2: ~20 pages (with images)
- Chapter 3: ~25 pages (with diagrams and code)
- Chapter 4: ~5 pages
- Back matter: ~5 pages
- **Total: ~68 pages** (within 60-70 target)

## Contact

If you encounter any issues with the LaTeX document, check:
1. Overleaf documentation: https://www.overleaf.com/learn
2. LaTeX Stack Exchange: https://tex.stackexchange.com
3. Your thesis supervisor

Good luck with your thesis! 🎓
