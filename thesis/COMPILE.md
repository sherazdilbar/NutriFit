# Quick Compilation Guide

## Before First Compilation

1. **Add topic declaration image**
   - Save your topic declaration form as: `thesis/images/topic-declaration.png`
   - Or if JPG: `thesis/images/topic-declaration.jpg` (and update line 48 in main.tex)
   - If not available yet, comment out lines 47-52 in main.tex:
     ```latex
     % \begin{figure}[p]
     % \centering
     % \includegraphics[width=\textwidth,height=\textheight,keepaspectratio]{topic-declaration.png}
     % \end{figure}
     % \cleardoublepage
     ```

2. **Ensure references.bib exists**
   - Create an empty file if needed:
     ```bash
     touch references.bib
     ```

## Compile Commands

### Option 1: Using latexmk (Recommended)
```bash
cd thesis
latexmk -pdf main.tex
```

### Option 2: Manual compilation
```bash
cd thesis
pdflatex main.tex
biber main
pdflatex main.tex
pdflatex main.tex
```

### Option 3: Using VS Code LaTeX Workshop
1. Open `main.tex` in VS Code
2. Press `Ctrl+Alt+B` (or `Cmd+Option+B` on Mac)
3. Or click the green play button in the top right

## Clean Build Files
```bash
cd thesis
latexmk -c
```

## Output
The compiled PDF will be: `thesis/main.pdf`

## Common Issues

### Error: File 'topic-declaration.png' not found
**Solution**: 
- Add the image to thesis/images/ directory, OR
- Comment out lines 47-52 in main.tex

### Error: Bibliography file not found
**Solution**: Create an empty references.bib file

### Error: Image not found
**Solution**: Check that all images exist in the images/ directory

### Error: Package not found
**Solution**: Install missing LaTeX packages using your TeX distribution's package manager

## Viewing the PDF

After successful compilation, open `main.pdf` with your PDF viewer.
