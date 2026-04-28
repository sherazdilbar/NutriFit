# Final Thesis Checklist

## Before Submitting to Dr. Chaman Verma

### Required Files
- ✅ `main.tex` - Main thesis file (updated with 4-chapter structure)
- ✅ `references.bib` - Bibliography file (exists)
- ⚠️ `images/topic-declaration.png` - **REQUIRED** - Official signed topic registration form (as image)
- ✅ All chapter files in `chapters/` directory
- ✅ All images in `images/` directory (23 images)
- ✅ All PlantUML diagrams in `diagrams/` directory (8 diagrams)

### Structure Verification
- ✅ Title page with "2026 year"
- ⚠️ Topic declaration page (needs image file: topic-declaration.png in images/ folder)
- ✅ Acknowledgements (Dr. Chaman Verma, correct department)
- ✅ Abstract with keywords
- ✅ Table of contents
- ✅ Chapter 1: Introduction (6 sections, 5 objectives)
- ✅ Chapter 2: User Documentation (5 sections with figures)
- ✅ Chapter 3: Developer Documentation (9 sections)
- ✅ Chapter 4: Summary (6 sections)
- ✅ Appendix A: Key Code Samples
- ✅ Appendix B: Database Schema
- ✅ Bibliography
- ✅ List of Figures
- ✅ List of Tables
- ✅ List of Codes
- ✅ List of Abbreviations

### Content Requirements
- ✅ Exactly 4 chapters (not 7)
- ✅ Maximum 5 objectives (not 7)
- ✅ All figures described in narrative paragraphs (no bullet points)
- ✅ All figures properly cited with `\ref{}` labels
- ✅ All tables properly cited with `\ref{}` labels
- ✅ All code samples properly cited with `\ref{}` labels
- ✅ No deployment content mentioned
- ✅ Supervisor: Dr. Chaman Verma, Assistant Professor
- ✅ Department: Dept. of Media and Educational Informatics
- ✅ Year format: "2026 year"

### Compilation Test
- [ ] Run `pdflatex main.tex` successfully
- [ ] Run `biber main` successfully
- [ ] Run `pdflatex main.tex` again successfully
- [ ] Run `pdflatex main.tex` final time successfully
- [ ] Verify `main.pdf` is generated
- [ ] Open and review the PDF

### PDF Review Checklist
- [ ] Title page displays correctly
- [ ] Topic declaration page appears (or is commented out)
- [ ] Acknowledgements page is correct
- [ ] Abstract page is correct
- [ ] Table of contents is complete and accurate
- [ ] All 4 chapters appear in correct order
- [ ] All figures display correctly
- [ ] All figure captions are correct
- [ ] All figure references work (no "??" in text)
- [ ] All appendices appear correctly
- [ ] Bibliography appears (even if empty)
- [ ] List of Figures is complete
- [ ] List of Tables is complete
- [ ] List of Codes is complete
- [ ] List of Abbreviations is complete
- [ ] Page numbers are correct
- [ ] No compilation errors or warnings

### Image Verification
All required images exist in `images/` directory:
- ✅ architecture-diagram.png
- ✅ register.png
- ✅ login.png
- ✅ dashboard.png
- ✅ health-profile-create.png
- ✅ health-profile-view.png
- ✅ diet-plan-view.png
- ✅ workout-plan-view.png
- ✅ food-catalog.png
- ✅ exercise-catalog.png
- ✅ log-meal.png
- ✅ log-exercise.png
- ✅ goals.png
- ✅ progress.png
- ✅ er-diagram.png
- ✅ class-diagram.png
- ✅ sequence-auth.png
- ✅ sequence-diet-plan.png
- ✅ use-case-diagram.png (referenced but may not be used in final version)
- ✅ component-diagram.png (referenced but may not be used in final version)
- ✅ activity-meal-logging.png (referenced but may not be used in final version)

### Final Steps

1. **Handle Topic Declaration**
   - Option A: Add `topic-declaration.png` to thesis/images/ directory
   - Option B: If using JPG, save as `topic-declaration.jpg` and update line 48 in main.tex
   - Option C: Comment out lines 47-52 in main.tex if not available yet:
     ```latex
     % \begin{figure}[p]
     % \centering
     % \includegraphics[width=\textwidth,height=\textheight,keepaspectratio]{topic-declaration.png}
     % \end{figure}
     % \cleardoublepage
     ```

2. **Compile the Thesis**
   ```bash
   cd thesis
   latexmk -pdf main.tex
   ```
   Or manually:
   ```bash
   pdflatex main.tex
   biber main
   pdflatex main.tex
   pdflatex main.tex
   ```

3. **Review the PDF**
   - Open `main.pdf`
   - Check all pages
   - Verify all figures appear
   - Check table of contents
   - Verify all references work

4. **Final Proofreading**
   - Read through all chapters
   - Check for typos
   - Verify technical accuracy
   - Ensure consistent formatting

5. **Submit to Supervisor**
   - Send `main.pdf` to Dr. Chaman Verma
   - Include any additional materials requested
   - Wait for feedback

## Quick Commands

### Compile:
```bash
cd thesis && latexmk -pdf main.tex
```

### Clean:
```bash
cd thesis && latexmk -c
```

### View PDF:
```bash
cd thesis && open main.pdf  # macOS
cd thesis && xdg-open main.pdf  # Linux
cd thesis && start main.pdf  # Windows
```

## Contact Information

**Supervisor:**
- Dr. Chaman Verma
- Assistant Professor
- Department of Media and Educational Informatics
- Faculty of Informatics
- Eötvös Loránd University
- Budapest, Hungary

**Student:**
- Sheraz Dilbar
- Computer Science BSc
- 2026

## Notes

- The thesis structure now fully complies with Dr. Chaman Verma's requirements
- All major feedback points have been addressed
- The document is ready for compilation and review
- Only the topic-declaration.pdf needs to be added or commented out

## Status: ✅ READY FOR COMPILATION

All structural changes are complete. The thesis can now be compiled and reviewed.
