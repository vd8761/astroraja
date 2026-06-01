const fs = require('fs');
let c = fs.readFileSync('src/pages/api/preview-pdf.ts', 'utf8');
c = c.replace(/'Outfit'/g, "'Inter'");
c = c.replace(/'Lora'/g, "'Haskoy'");
c = c.replace(/C\.saffron/g, "C.white");
c = c.replace(/C\.saffronDark/g, "C.muted");
c = c.replace(/—/g, "-");

// Replace AI phrases
c = c.replace(/A Message Before You Begin/g, "Executive Summary");
c = c.replace(/This report has been designed with that intention/g, "This analysis has been designed");
c = c.replace(/Our best wishes to you\./g, "Prepared for your review.");
c = c.replace(/A COMPLETE SOUL/g, "COMPREHENSIVE ANALYSIS");
c = c.replace(/The whole idea behind this report is not just to provide astrological guidance/g, "This document provides a structured evaluation and targeted advisory");

fs.writeFileSync('src/pages/api/preview-pdf.ts', c);
console.log("Replaced successfully!");
