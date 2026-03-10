const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat, ExternalHyperlink,
        HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageNumber, PageBreak, TabStopType, TabStopPosition } = require('docx');

// Helpers
const spacer = (pts = 120) => new Paragraph({ spacing: { after: pts }, children: [] });
const hr = () => new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } },
  spacing: { after: 200 },
  children: []
});

const bold = (text) => new TextRun({ text, bold: true, font: "Arial", size: 22 });
const normal = (text) => new TextRun({ text, font: "Arial", size: 22 });
const italic = (text) => new TextRun({ text, italics: true, font: "Arial", size: 22 });
const small = (text) => new TextRun({ text, font: "Arial", size: 18, color: "666666" });
const link = (text, url) => new ExternalHyperlink({
  children: [new TextRun({ text, style: "Hyperlink", font: "Arial", size: 22 })],
  link: url,
});

const para = (...children) => new Paragraph({ spacing: { after: 120 }, children });
const heading1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 200 },
  children: [new TextRun({ text, bold: true, font: "Arial", size: 36, color: "1B3A5C" })]
});
const heading2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 240, after: 160 },
  children: [new TextRun({ text, bold: true, font: "Arial", size: 28, color: "2E75B6" })]
});

// Table helpers
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerShading = { fill: "1B3A5C", type: ShadingType.CLEAR };
const altShading = { fill: "F2F7FC", type: ShadingType.CLEAR };
const margins = { top: 60, bottom: 60, left: 100, right: 100 };

function tableRow(cells, isHeader = false, isAlt = false) {
  const colWidths = [2200, 4800, 2360];
  return new TableRow({
    children: cells.map((text, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: isHeader ? headerShading : (isAlt ? altShading : undefined),
      margins,
      verticalAlign: "center",
      children: [new Paragraph({
        children: [new TextRun({
          text,
          font: "Arial",
          size: 20,
          bold: isHeader,
          color: isHeader ? "FFFFFF" : "333333"
        })]
      })]
    }))
  });
}

function networkRow(cells, isHeader = false, isAlt = false) {
  const colWidths = [2800, 3000, 3560];
  return new TableRow({
    children: cells.map((text, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: isHeader ? headerShading : (isAlt ? altShading : undefined),
      margins,
      children: [new Paragraph({
        children: [new TextRun({
          text,
          font: "Arial",
          size: 20,
          bold: isHeader,
          color: isHeader ? "FFFFFF" : "333333"
        })]
      })]
    }))
  });
}

function evidenceRow(cells, isHeader = false, isAlt = false) {
  const colWidths = [2600, 3400, 3360];
  return new TableRow({
    children: cells.map((text, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: isHeader ? headerShading : (isAlt ? altShading : undefined),
      margins,
      children: [new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({
          text,
          font: "Arial",
          size: 18,
          bold: isHeader,
          color: isHeader ? "FFFFFF" : "333333"
        })]
      })]
    }))
  });
}

// BUILD DOCUMENT
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "1B3A5C" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "2E75B6" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1273, bottom: 1440, left: 1273 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "2E75B6", space: 4 } },
          children: [
            new TextRun({ text: "OSINT DOSSIER", font: "Arial", size: 16, color: "999999", bold: true }),
            new TextRun("\t"),
            new TextRun({ text: "CONFIDENTIAL \u2014 Professional Use Only", font: "Arial", size: 16, color: "999999" }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", font: "Arial", size: 16, color: "999999" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "999999" }),
          ]
        })]
      })
    },
    children: [
      // TITLE PAGE
      spacer(600),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: "OSINT INVESTIGATION DOSSIER", font: "Arial", size: 52, bold: true, color: "1B3A5C" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "Advanced Multi-Stage Open Source Intelligence Report", font: "Arial", size: 26, color: "2E75B6" })]
      }),
      hr(),
      spacer(200),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: "MATEUSZ WALIG\u00d3RSKI", font: "Arial", size: 44, bold: true, color: "1B3A5C" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [normal("Warsaw, Poland")]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [small("Analytics Leader | UX Strategist | NFT/Web3 Pioneer | Conference Organiser")]
      }),
      hr(),
      spacer(100),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [small("Report Date: 10 March 2026  |  Classification: Professional / Public Sources Only")]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [small("Compiled via OSINT methodology across 15+ sources")]
      }),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 1: EXECUTIVE SUMMARY
      heading1("1. Executive Summary"),
      para(
        normal("Mateusz Walig\u00f3rski is a Warsaw-based analytics and digital product leader with a 12+ year career spanning UX research, e-commerce optimisation, government digital identity systems, analytics community building, and NFT/Web3 strategy. His trajectory shows a consistent pattern of moving between high-security state systems (PWPW) and high-growth commercial ventures (Displate, OUTPLAY/SwipePads), bringing a unique hybrid perspective of data privacy rigour and startup agility."),
      ),
      para(
        normal("Most recently, he holds the title of Co-Founder at SwipePads (under OUTPLAY Sp. z o.o.), and maintains an Estonian company (GWDE O\u00dc) currently in liquidation. He continues to lecture on UX at SWPS University and has a strong conference-organising footprint through People That Count and Web Analytics Wednesday Warsaw."),
      ),

      // SECTION 2: SUBJECT IDENTIFIERS
      heading1("2. Subject Identifiers"),
      para(bold("Full Name: "), normal("Mateusz Walig\u00f3rski")),
      para(bold("Email: "), normal("waligorski.mateusz@gmail.com")),
      para(bold("Phone: "), normal("+48 692 404 949")),
      para(bold("Location: "), normal("Warsaw, Poland")),
      para(bold("Education: "), normal("SWPS University (2008\u20132013) \u2014 Social Psychology of Internet and Communication (SPIK)")),
      para(bold("Web3 Handle: "), normal("waligorski.eth (@waligorski on X)")),
      para(bold("About.me: "), link("about.me/waligorski", "https://about.me/waligorski")),

      // SECTION 3: CAREER TIMELINE
      heading1("3. Reconstructed Career Timeline (2012\u20132026)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2200, 4800, 2360],
        rows: [
          tableRow(["Period", "Role / Organisation", "Key Details"], true),
          tableRow(["2012\u20132014", "Junior UX Specialist \u2014 Who Else Poland", "Web analytics, UX research, A/B testing"], false, false),
          tableRow(["~2012", "UseLab \u2014 Research Department", "Eye-tracking, IA Summit 2012 organiser"], false, true),
          tableRow(["2013\u2013present", "Web Analytics Wednesday Warsaw (Organiser)", "Quarterly digital analytics meetup"], false, false),
          tableRow(["2014\u20132018", "Head of UX / Conversion Specialist \u2014 Euro-net (RTV Euro AGD)", "E-commerce UX, search, filters, checkout optimisation"], false, true),
          tableRow(["2014\u2013present", "Lecturer \u2014 SWPS University", "Postgraduate UX Design programme"], false, false),
          tableRow(["2015", "Speaker \u2014 eMetrics Summit Boston", "International analytics conference"], false, true),
          tableRow(["2017\u20132019", "Lecturer \u2014 Pozna\u0144 Univ. of Economics", "Postgraduate E-marketing programme"], false, false),
          tableRow(["2018", "Head of Product \u2014 Going", "Travel e-commerce platform"], false, true),
          tableRow(["2018\u2013present", "Founder \u2014 DPS Design (sole proprietorship)", "Digital product studio, Warsaw"], false, false),
          tableRow(["2018", "Founder \u2014 People That Count", "Boutique digital analytics conference (250+ attendees)"], false, true),
          tableRow(["2019\u20132021", "Deputy Director, Digital Solutions \u2014 PWPW S.A.", "State security printing, digital identity (eID, PKI, biometrics)"], false, false),
          tableRow(["2021\u2013present", "Head of Analytics (interim) / Head of NFT \u2014 Displate", "Analytics leadership + NFT sub-brand launch"], false, true),
          tableRow(["Apr 2022", "Board Member \u2014 GWDE O\u00dc (Estonia)", "E-commerce entity, \u20ac100k capital, currently in liquidation"], false, false),
          tableRow(["Mar 2025", "Board Member \u2014 OUTPLAY Sp. z o.o.", "Co-Founder of SwipePads (with Mateusz Szymon Godala)"], false, true),
          tableRow(["2025\u2013present", "Co-Founder \u2014 SwipePads / AI", "Current LinkedIn headline"], false, false),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 4: CORPORATE REGISTRY
      heading1("4. Corporate & Registry Findings"),

      heading2("4.1 OUTPLAY Sp. z o.o. (KRS 1161461)"),
      para(bold("Registered: "), normal("14 March 2025")),
      para(bold("Address: "), normal("ul. Czysta 16, 96-100 Skierniewice")),
      para(bold("Share Capital: "), normal("5,000 PLN")),
      para(bold("Board: "), normal("Mateusz Szymon Godala (Prezes Zarz\u0105du), Mateusz Walig\u00f3rski (Cz\u0142onek Zarz\u0105du)")),
      para(bold("Shareholder: "), normal("OUTPLAY MOBILE INC.")),
      para(bold("Product: "), normal("SwipePads \u2014 appears to be an AI-related mobile product")),
      para(bold("Sources: "), link("Rejestr.io", "https://rejestr.io/krs/1161461/outplay"), normal(", "), link("ALEO", "https://aleo.com/pl/firma/outplay-spolka-z-ograniczona-odpowiedzialnoscia"), normal(", "), link("Northdata", "https://www.northdata.de/Outplay%20sp%C2%B7%20z%20o%C2%B7o%C2%B7,%20Skierniewice/KRS0001161461")),

      heading2("4.2 GWDE O\u00dc (Estonia, Reg. 16487412)"),
      para(bold("Registered: "), normal("25 April 2022")),
      para(bold("Address: "), normal("P\u00e4rnu mnt 139e/2-8, Tallinn, Harju County")),
      para(bold("Share Capital: "), normal("\u20ac100,000")),
      para(bold("VAT ID: "), normal("EE102500440 (from 31 May 2022)")),
      para(bold("Status: "), normal("Currently in LIQUIDATION")),
      para(bold("Financials (2024): "), normal("Turnover \u20ac852, Balance sheet \u20ac301,783")),
      para(bold("Contact: "), normal("waligorski.mateusz@gmail.com")),
      para(bold("Sources: "), link("Inforegister.ee", "https://www.inforegister.ee/en/16487412-GWDE-OU/"), normal(", "), link("e-\u00c4riregister", "https://ariregister.rik.ee/eng/company/16487412/GWDE-O%C3%9C")),

      heading2("4.3 DPS Design (Sole Proprietorship)"),
      para(bold("Active since: "), normal("2018")),
      para(bold("Location: "), normal("Warsaw")),
      para(bold("Source: "), link("GoWork.pl", "https://www.gowork.pl/dps-design-mateusz-waligorski,24828443/dane-kontaktowe-firmy")),

      heading2("4.4 HOMEBOX"),
      para(italic("No KRS or registry results found linking Mateusz Walig\u00f3rski to a company named HOMEBOX. This association could not be confirmed through public registry searches. Further investigation with direct registry access (ekrs.ms.gov.pl) recommended.")),

      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 5: ACADEMIC & THOUGHT LEADERSHIP
      heading1("5. Academic & Thought Leadership"),

      heading2("5.1 University Teaching"),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 80 },
        children: [bold("SWPS University (2014\u2013present): "), normal("Postgraduate lecturer in User Experience Design. SWPS runs Poland\u2019s first comprehensive UX programme (est. 2010, 203 hours). Faculty profile confirmed at swps.pl.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 80 },
        children: [bold("Pozna\u0144 University of Economics (2017\u20132019): "), normal("Postgraduate lecturer in E-marketing. Listed as \u201cConversion Specialist at Euro-net\u201d during that tenure.")]
      }),

      heading2("5.2 Conference Speaking & Organising"),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 80 },
        children: [bold("People That Count (Founded 2018): "), normal("A boutique digital analytics conference in Warsaw, targeting 250+ specialists from performance marketing agencies and data companies in Central Europe. Focus: implementation techniques, out-of-the-box solutions, advanced analytics.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 80 },
        children: [bold("Web Analytics Wednesday Warsaw (2013\u2013present): "), normal("Quarterly meetup for digital analytics practitioners. Organiser since inception.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 80 },
        children: [bold("eMetrics Summit Boston (Sept 2015): "), normal("Speaker at the premier international analytics conference.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 80 },
        children: [bold("UX Poland: "), normal("Past coordinator.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 80 },
        children: [bold("Polish IA Summit 2012: "), normal("Organised while at UseLab.")]
      }),

      heading2("5.3 Podcast & Media Appearances"),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 80 },
        children: [bold("Nie Tylko Design (Ep. 027): "), normal("Guest on Tomasz Sk\u00f3rski\u2019s podcast discussing e-commerce design: search engines, filters, banners, ordering processes, and optimisation of large e-commerce services. Referenced work at RTV Euro AGD and Going.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 80 },
        children: [bold("Bartek Pucek Newsletter (2021): "), normal("Featured interview discussing NFTs as a cultural and technological revolution, Displate\u2019s NFT sub-brand strategy, and the intersection of art and digital ownership.")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 6: DIGITAL FOOTPRINT
      heading1("6. Digital Footprint"),

      heading2("6.1 Social & Professional Profiles"),
      para(bold("LinkedIn: "), link("linkedin.com/in/mateuszwaligorski", "https://www.linkedin.com/in/mateuszwaligorski/"), normal(" \u2014 Current headline: Co-Founder of SwipePads / AI")),
      para(bold("X (Twitter): "), link("@waligorski", "https://x.com/waligorski"), normal(" \u2014 waligorski.eth handle, Web3-oriented presence")),
      para(bold("GoldenLine: "), link("goldenline.pl/mateusz-waligorski", "https://www.goldenline.pl/mateusz-waligorski/"), normal(" \u2014 Polish professional network, early career details + endorsements")),
      para(bold("Crunchbase: "), link("crunchbase.com/person/mateusz-walig\u00f3rski", "https://www.crunchbase.com/person/mateusz-walig%C3%B3rski"), normal(" \u2014 Listed as Head of NFT @ Displate")),
      para(bold("The Org: "), link("theorg.com/org/displate/.../mateusz-waligorski", "https://theorg.com/org/displate/org-chart/mateusz-waligorski"), normal(" \u2014 Org chart position + career history")),
      para(bold("About.me: "), link("about.me/waligorski", "https://about.me/waligorski")),
      para(bold("Google+: "), link("plus.google.com/+MateuszWaligorski", "https://plus.google.com/+MateuszWaligorski"), normal(" (archived/legacy)")),
      para(bold("Facebook: "), link("facebook.com/mateusz.waligorski.3", "https://www.facebook.com/mateusz.waligorski.3/")),
      para(bold("RocketReach: "), link("rocketreach.co listing", "https://rocketreach.co/mateusz-waligorski-email_7940346")),

      heading2("6.2 Technical Skills (per GoldenLine & public profiles)"),
      para(normal("Eye Tracking, Google Analytics, Human-Computer Interaction, Information Architecture, Mobile Design, Online Marketing, A/B Testing, UX Research, Conversion Optimisation, Digital Product Development")),

      heading2("6.3 GitHub / Medium"),
      para(italic("No public GitHub profile or Medium blog found under the subject\u2019s known handles (waligorski, mateuszwaligorski, waligorski.mateusz). His technical contributions appear to be proprietary/commercial rather than open-source.")),

      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 7: PROFESSIONAL NETWORK
      heading1("7. Professional Network Map"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 3000, 3560],
        rows: [
          networkRow(["Person", "Connection", "Context"], true),
          networkRow(["Mateusz Szymon Godala", "Co-founder / Board", "OUTPLAY Sp. z o.o. (SwipePads), Prezes Zarz\u0105du"], false, false),
          networkRow(["Tomasz Dyrks", "Colleague at Displate", "NFT Team, referenced in LinkedIn recruiting posts"], false, true),
          networkRow(["Tomasz Sk\u00f3rski", "Podcast host", "Nie Tylko Design podcast (Ep. 027)"], false, false),
          networkRow(["Bartek Pucek", "Newsletter/interviewer", "Featured NFT interview in Pucek\u2019s newsletter"], false, true),
          networkRow(["UseLab team", "Early career", "Research department collaboration, IA Summit 2012"], false, false),
        ]
      }),

      spacer(200),

      // SECTION 8: REFERENCE VALIDATION QUESTIONS
      heading1("8. Reference Validation Questions"),
      para(italic("These questions are designed for structured reference checks with former colleagues or the subject himself.")),
      spacer(80),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        spacing: { after: 120 },
        children: [bold("Pivot Management: "), normal("\u201cHow did Mateusz lead the transition from traditional analytics to the NFT/Web3 strategy at Displate during the 2022 market shift?\u201d")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        spacing: { after: 120 },
        children: [bold("State vs. Tech: "), normal("\u201cHow did his experience in high-security state systems (PWPW) influence his approach to user data privacy in a commercial scale-up?\u201d")]
      }),
      new Paragraph({
        numbering: { reference: "numbers", level: 0 },
        spacing: { after: 120 },
        children: [bold("Conflict Resolution: "), normal("\u201cDescribe a time his data findings contradicted a senior stakeholder\u2019s vision. How did he navigate that conflict?\u201d")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 9: EVIDENCE LOG
      heading1("9. Evidence Log \u2014 Confirmed URLs"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2600, 3400, 3360],
        rows: [
          evidenceRow(["Source", "URL", "Data Obtained"], true),
          evidenceRow(["Rejestr.io (OUTPLAY)", "rejestr.io/krs/1161461/outplay", "Board members, registration date, capital"], false, false),
          evidenceRow(["ALEO (OUTPLAY)", "aleo.com/pl/firma/outplay-...", "Shareholders (OUTPLAY MOBILE INC.), board ages"], false, true),
          evidenceRow(["Northdata (OUTPLAY)", "northdata.de/Outplay...", "Board composition, capital, registration"], false, false),
          evidenceRow(["KRS-Pobierz (OUTPLAY)", "krs-pobierz.pl/outplay-...", "Last update date, board members confirmed"], false, true),
          evidenceRow(["Inforegister.ee (GWDE)", "inforegister.ee/en/16487412-GWDE-OU/", "Email, turnover, capital, liquidation status"], false, false),
          evidenceRow(["e-\u00c4riregister (GWDE)", "ariregister.rik.ee/eng/.../16487412/GWDE-OU", "Official Estonian registry entry"], false, true),
          evidenceRow(["Crunchbase", "crunchbase.com/person/mateusz-walig\u00f3rski", "Head of NFT @ Displate confirmed"], false, false),
          evidenceRow(["The Org", "theorg.com/.../mateusz-waligorski", "Full career history, education, dual roles at Displate"], false, true),
          evidenceRow(["LinkedIn", "linkedin.com/in/mateuszwaligorski", "Current title: Co-Founder SwipePads, NFT recruiting posts"], false, false),
          evidenceRow(["GoldenLine", "goldenline.pl/mateusz-waligorski", "Early career (Who Else), skills, UseLab endorsement"], false, true),
          evidenceRow(["SWPS Faculty Page", "swps.pl/.../14486-waligorski-mateusz", "Lecturer confirmation"], false, false),
          evidenceRow(["Pozna\u0144 UoE", "ue.poznan.pl/.../mateusz-waligorski...", "E-marketing lecturer, \u201cConversion Specialist at Euro-net\u201d"], false, true),
          evidenceRow(["People That Count", "peoplethatcount.online", "Conference founder, format, audience details"], false, false),
          evidenceRow(["Crossweb (PTC)", "crossweb.pl/en/.../people-that-count...", "Sept 2019 event listing"], false, true),
          evidenceRow(["Nie Tylko Design", "nietylko.design/027-projektowanie-ecommerce", "Podcast Ep. 027 guest, e-commerce UX discussion"], false, false),
          evidenceRow(["Bartek Pucek", "pucek.com/newsletter/nft-moda-...", "NFT interview, Displate strategy details"], false, true),
          evidenceRow(["GoWork (DPS Design)", "gowork.pl/dps-design-mateusz-waligorski...", "DPS Design entity confirmation, Warsaw"], false, false),
          evidenceRow(["X/Twitter", "x.com/waligorski", "waligorski.eth Web3 identity"], false, true),
          evidenceRow(["RocketReach", "rocketreach.co/mateusz-waligorski-email...", "Head of NFT + contact info confirmation"], false, false),
          evidenceRow(["eMetrics/Bizzabo", "events.bizzabo.com/eMetrics/agenda/speakers/...", "Speaker at eMetrics Summit Boston 2015"], false, true),
          evidenceRow(["SlideShare (WAW)", "slideshare.net/webanalyticswednesday", "Web Analytics Wednesday presentations archive"], false, false),
          evidenceRow(["About.me", "about.me/waligorski", "Personal profile hub"], false, true),
          evidenceRow(["Facebook", "facebook.com/mateusz.waligorski.3", "Personal social profile"], false, false),
        ]
      }),

      spacer(200),

      // SECTION 10: GAPS & RECOMMENDATIONS
      heading1("10. Gaps & Recommendations for Further Investigation"),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 100 },
        children: [bold("HOMEBOX connection: "), normal("No public registry link found. Recommend direct KRS portal search (ekrs.ms.gov.pl) or asking the subject directly.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 100 },
        children: [bold("Robert Trela association: "), normal("No co-board membership found in any discovered entities. May be connected via a different legal entity not surfaced in this search.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 100 },
        children: [bold("GWDE O\u00dc liquidation details: "), normal("Company is in liquidation with minimal 2024 revenue (\u20ac852) but significant balance sheet (\u20ac301k). Nature of assets/liabilities unclear from public data.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 100 },
        children: [bold("Wayback Machine / archive.org: "), normal("Displate.com and dps.pl team page archives from 2019\u20132022 could not be directly accessed due to egress restrictions. Recommend manual browser search.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 100 },
        children: [bold("SwipePads product details: "), normal("The product is very new (March 2025 KRS registration). Minimal public information available. Monitor app store listings and LinkedIn for launch announcements.")]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        spacing: { after: 100 },
        children: [bold("OUTPLAY MOBILE INC. (shareholder): "), normal("Appears to be a US-incorporated parent entity. Jurisdiction and registration details not confirmed in this search round.")]
      }),

      spacer(300),
      hr(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [small("END OF REPORT")]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [small("All information sourced from publicly available registries, professional platforms, and web archives. No private or restricted databases were accessed.")]
      }),
    ]
  }]
});

const OUTPUT_PATH = "/sessions/gifted-fervent-hawking/mnt/outputs/OSINT_Dossier_Mateusz_Waligorski.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log("SUCCESS: " + OUTPUT_PATH);
});
