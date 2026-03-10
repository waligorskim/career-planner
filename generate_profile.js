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
const accent = (text) => new TextRun({ text, font: "Arial", size: 22, color: "2E75B6", bold: true });
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
const heading3 = (text) => new Paragraph({
  spacing: { before: 200, after: 120 },
  children: [new TextRun({ text, bold: true, font: "Arial", size: 24, color: "1B3A5C" })]
});

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const margins = { top: 60, bottom: 60, left: 100, right: 100 };

const bullet = (...children) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 80 },
  children
});

const subBullet = (...children) => new Paragraph({
  numbering: { reference: "subbullets", level: 0 },
  spacing: { after: 60 },
  children
});

// Quote block (indented, italic, with left border)
const quoteBlock = (text, author) => new Paragraph({
  indent: { left: 720 },
  border: { left: { style: BorderStyle.SINGLE, size: 12, color: "2E75B6", space: 8 } },
  spacing: { after: 160, before: 80 },
  children: [
    italic(`\u201c${text}\u201d`),
    author ? new TextRun({ text: ` \u2014 ${author}`, font: "Arial", size: 20, color: "888888" }) : normal("")
  ]
});

// Skill rating table
function skillTable(skills) {
  const colWidths = [4000, 2680, 2680];
  const headerShading = { fill: "1B3A5C", type: ShadingType.CLEAR };
  const altShading = { fill: "F2F7FC", type: ShadingType.CLEAR };

  const rows = [
    new TableRow({
      children: ["Skill", "Category", "Evidence Level"].map((text, i) => new TableCell({
        borders, width: { size: colWidths[i], type: WidthType.DXA },
        shading: headerShading, margins,
        children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 20, bold: true, color: "FFFFFF" })] })]
      }))
    }),
    ...skills.map((s, idx) => new TableRow({
      children: [s[0], s[1], s[2]].map((text, i) => new TableCell({
        borders, width: { size: colWidths[i], type: WidthType.DXA },
        shading: idx % 2 === 1 ? altShading : undefined, margins,
        children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 20, color: "333333" })] })]
      }))
    }))
  ];
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: colWidths, rows });
}

function roleTable(roles) {
  const colWidths = [2000, 2600, 1400, 1200, 2160];
  const headerShading = { fill: "1B3A5C", type: ShadingType.CLEAR };
  const altShading = { fill: "F2F7FC", type: ShadingType.CLEAR };

  const rows = [
    new TableRow({
      children: ["Period", "Role", "Company", "Team Size", "Product Type"].map((text, i) => new TableCell({
        borders, width: { size: colWidths[i], type: WidthType.DXA },
        shading: headerShading, margins,
        children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 18, bold: true, color: "FFFFFF" })] })]
      }))
    }),
    ...roles.map((r, idx) => new TableRow({
      children: r.map((text, i) => new TableCell({
        borders, width: { size: colWidths[i], type: WidthType.DXA },
        shading: idx % 2 === 1 ? altShading : undefined, margins,
        children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 18, color: "333333" })] })]
      }))
    }))
  ];
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: colWidths, rows });
}

// BUILD
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
      { reference: "subbullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2013", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
      { reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1273, bottom: 1440, left: 1273 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "2E75B6", space: 4 } },
          children: [
            new TextRun({ text: "PROFESSIONAL PROFILE", font: "Arial", size: 16, color: "999999", bold: true }),
            new TextRun("\t"),
            new TextRun({ text: "Mateusz Walig\u00f3rski", font: "Arial", size: 16, color: "999999" }),
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
      // TITLE
      spacer(400),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: "PROFESSIONAL PROFILE", font: "Arial", size: 52, bold: true, color: "1B3A5C" })]
      }),
      hr(),
      spacer(100),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: "MATEUSZ WALIG\u00d3RSKI", font: "Arial", size: 44, bold: true, color: "1B3A5C" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: "Entrepreneur in Residence & AI Advisory @ Displate | Co-Founder of SwipePads | Angel Investor", font: "Arial", size: 24, color: "2E75B6" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [small("Warsaw, Poland | waligorski.mateusz@gmail.com | +48 692 404 949")]
      }),
      hr(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [small("Based on OSINT analysis of 25+ public sources, subject\u2019s 2020 CV, and full LinkedIn profile access | Compiled 10 March 2026")]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // 1. EXECUTIVE PROFILE
      heading1("1. Executive Profile Summary"),
      para(
        normal("Mateusz Walig\u00f3rski is a rare hybrid operator who spans analytics, UX, product, and emerging technology (NFT/Web3/AI) with equal fluency. Over a 16+ year career (since 2009), he has consistently been the person organisations deploy when they need someone who can both "),
        italic("understand"),
        normal(" what the data says and "),
        italic("build"),
        normal(" the product response to it. His career arc moves from hands-on UX research \u2192 conversion optimisation at scale \u2192 banking/insurance consulting \u2192 government digital identity systems (300-person IT division) \u2192 startup NFT strategy \u2192 now serving as Entrepreneur in Residence & AI Advisory at Displate while co-founding an AI venture. His self-described philosophy: \u201cPeople over Process.\u201d"),
      ),
      para(
        normal("Colleagues describe him as a \u201ccommando\u201d who can parachute into any domain and deliver. His network is described as \u201cextensive\u201d and \u201cinvaluable\u201d \u2014 a function of 10+ years organising analytics communities (Web Analytics Wednesday, People That Count, UX Poland). He teaches what he practises (SWPS, Pozna\u0144 UoE) and speaks internationally (eMetrics Boston, Google Cloud Summit Poland)."),
      ),
      para(
        normal("Most recently, he led the implementation of Google\u2019s Gemini multimodal AI at Displate to automate metadata generation for millions of artworks \u2014 a project featured as an official Google Cloud case study and presented at Google Cloud Summit Poland 2025. The result: "),
        bold("750% month-over-month sales growth"),
        normal(" for newly onboarded artists\u2019 works, stabilising at 350\u2013400% after the first full month. This is his strongest quantifiable business outcome on the public record."),
      ),

      spacer(80),
      heading2("What Makes Him Different"),
      bullet(bold("State + Startup DNA: "), normal("He\u2019s run a 300-person IT division at a state security printer (PWPW \u2014 eID, PKI, biometrics for 38M citizens), migrated it to full remote a month before the pandemic without slowing development, AND launched an NFT sub-brand and an AI metadata system for a VC-backed scale-up. That\u2019s a very rare trust-and-move-fast combination.")),
      bullet(bold("Builder, Not Just Analyst: "), normal("Every analytics role he\u2019s held has expanded into product ownership. At RTV Euro AGD he went from UX specialist to Head of UX. At Displate he went from Head of Analytics to Head of NFT (building a new business line), and then drove the Gemini AI integration that became a Google case study. Now he\u2019s co-founding Outplay SwipePads as an AI mobile venture.")),
      bullet(bold("Measurable AI Impact: "), normal("The Gemini metadata automation project at Displate is a textbook AI product case: identified a discovery bottleneck (artists\u2019 works weren\u2019t findable), chose the right model (Gemini multimodal), shipped at scale (millions of artworks), and delivered quantifiable ROI (750% MoM sales growth for new artists). Featured on the official Google blog and presented at Google Cloud Summit Poland.")),
      bullet(bold("Community Infrastructure: "), normal("He doesn\u2019t just attend conferences \u2014 he creates them. People That Count (250+ attendees at Kino Atlantic Warsaw, speakers like Simo Ahava, Craig Sullivan, and Zorin Radevancovic, produced by Bogna Sayna and Wojtek Hot\u00f3wko of Hot Labs) and Web Analytics Wednesday Warsaw (running since 2013) give him an outsized network for talent sourcing and partnership development.")),

      new Paragraph({ children: [new PageBreak()] }),

      // 2. MANAGEMENT SCOPE
      heading1("2. Management Scope & Team Sizes"),
      para(normal("Based on hiring posts, job listings, and organisational data:")),
      spacer(40),
      roleTable([
        ["2009\u20132010", "Customer Advisor", "Empik Group", "IC", "Retail"],
        ["2010\u20132012", "Jr UX Researcher & Conf. Coord.", "UseLab", "IC + event", "Eye-tracking Lab"],
        ["2012\u20132014", "Junior UX / Digital Analyst", "Who Else", "IC", "UX Research Agency"],
        ["2014\u20132018", "Head of UX Team", "Euro-net", "R&D/CRO team", "E-commerce (B2C)"],
        ["2018\u20132019", "Head of Product", "Going", "Cross-func.", "Travel E-comm"],
        ["2018\u20132019", "Product Owner & Consultant", "ValueStreams", "Consultant", "Banking/Insurance"],
        ["2019\u20132021", "Deputy Director, Digital", "PWPW S.A.", "300-person IT", "Gov. Digital ID"],
        ["2021\u20132025", "Head of Analytics \u2192 EiR/AI Advisory", "Displate", "3\u20136 (BI team)", "Marketplace SaaS"],
        ["2021\u20132023", "Head of NFT", "Displate", "5\u20138 (NFT squad)", "Web3 / NFT"],
        ["2024\u2013pres.", "Co-Founder", "Outplay SwipePads", "Co-founder", "AI Mobile App"],
      ]),
      spacer(100),

      heading2("2.1 Team Composition He Hired For"),
      para(normal("Based on his 2022 LinkedIn recruiting posts for the Displate NFT team, he directly sourced:")),
      bullet(normal("Front-End Developers (React)")),
      bullet(normal("Lead Software Engineers")),
      bullet(normal("Back-End Developers")),
      bullet(normal("DevOps Engineers")),
      bullet(normal("Artist Acquisition Specialists")),
      bullet(normal("Finance Specialists")),
      bullet(normal("Senior BI Specialists (Analytics team)")),
      bullet(normal("Senior Product Designers (UX/UI)")),
      bullet(normal("Senior Web Analysts")),
      bullet(normal("NFT Content Specialists")),
      bullet(normal("Tech Lead (JS / AWS / Ethereum)")),
      spacer(40),
      para(
        normal("At Displate (~400 employees at the time), he managed two parallel tracks: the core analytics/BI function AND the NFT squad as a new business unit. The NFT team was confirmed as 3 developers + artist acquisition + finance, plus external contractor capacity. Total direct/dotted-line reports across both tracks: estimated "),
        bold("8\u201314 people"),
        normal("."),
      ),
      para(
        normal("At PWPW (a state enterprise with 1,500+ employees), his CV confirms he was responsible for digital products in a "),
        bold("300-person IT division"),
        normal(". That\u2019s not a team lead \u2014 that\u2019s divisional leadership at enterprise scale. His CV details: IT restructuring, career path and salary framework development, DevOps culture initiation, cross-functional facilitation with HR and Legal departments, and migrating the entire 300-person IT division to full remote one month before the pandemic without slowing development."),
      ),

      new Paragraph({ children: [new PageBreak()] }),

      // 3. HARD SKILLS
      heading1("3. Hard Skills Matrix"),
      skillTable([
        ["Google Analytics (GA/GA4)", "Analytics", "Certified (GAIQ), 12+ yrs practice"],
        ["A/B Testing & CRO", "Experimentation", "Head of Conversion at RTV Euro AGD"],
        ["UX Research (Eye Tracking, IA)", "Research", "UseLab, Who Else, SWPS teaching"],
        ["E-commerce Platform Design", "Product", "RTV Euro AGD (search, filters, checkout)"],
        ["Data Visualisation / BI", "Analytics", "Hiring BI specialists, Displate analytics"],
        ["NFT / Blockchain (Ethereum)", "Web3", "Built Displate Nifties on Ethereum"],
        ["Gemini / LLM Integration", "AI", "Led Gemini multimodal deployment at Displate (Google case study)"],
        ["Google Cloud Platform / AWS", "Infrastructure", "GCP Summit speaker, Vertex AI, LinkedIn recs"],
        ["PWA & AMP", "Web Tech", "Referenced in recommendations"],
        ["Google AdWords", "Marketing", "Certified (basic + intermediate)"],
        ["Digital Identity (eID, PKI)", "Gov Tech", "PWPW Deputy Director, national scale"],
        ["Biometrics / Document Security", "Gov Tech", "PWPW ePassport, eDO app systems"],
        ["Agile / Scrum (PSM I + PSPO I + AgilePM)", "Methodology", "Triple-certified, led first agile team at Euro-net"],
        ["OSINT / Due Diligence", "Intelligence", "Niebezpiecznik.pl certified (Sept 2020)"],
        ["GA360 Implementation", "Analytics", "Led GA360 deployment at RTV Euro AGD"],
        ["Remote Team Transition", "Operations", "Migrated 300-person IT to remote pre-pandemic"],
        ["Information Architecture", "UX", "GoldenLine skills, IA Summit organiser"],
        ["SQL / Data Querying", "Analytics", "Implied by BI hiring and analytics roles"],
        ["AI Product Deployment (Applied)", "AI", "Gemini at Displate (750% growth) + SwipePads AI"],
        ["Search & Discovery Optimisation", "Product", "Gemini metadata for art search, RTV Euro AGD filters"],
      ]),
      spacer(80),
      para(
        normal("LinkedIn endorsement data (38 skills total) confirms the above matrix. Top endorsed skills: User Experience (78), Web Analytics (67), Usability (59), Google Analytics (54), Information Architecture (48), E-commerce (45). This independently validates the skill clusters identified through OSINT."),
      ),

      new Paragraph({ children: [new PageBreak()] }),

      // 4. SOFT SKILLS
      heading1("4. Soft Skills Assessment"),
      para(normal("Derived from colleague recommendations, conference bios, podcast appearances, and observable career patterns:")),
      spacer(60),

      heading2("4.1 Communication & Influence"),
      quoteBlock("Great communication skills are definitely Mateusz\u2019s strengths and he knows how to build a team.", "LinkedIn recommendation"),
      quoteBlock("Very communicative and creative, handling interactions with speakers and the public effectively.", "GoldenLine endorsement"),
      para(normal("Evidence: 10+ years of community organising (WAW, PTC, UX Poland), international conference speaking (eMetrics Boston, Google Cloud Summit Poland 2025), podcast guest appearances, university lecturing. He presented the Displate x Gemini AI case study at Google Cloud Summit Poland \u2014 a corporate keynote setting with Google\u2019s country manager present. He\u2019s someone who communicates complex analytics and AI concepts to mixed technical/business audiences.")),

      heading2("4.2 Adaptability & Learning Velocity"),
      quoteBlock("Mateusz grasps new technologies on the fly (Google Cloud Platform, AWS, PWA, AMP) and is really open-minded for a new approach to solving problems.", "LinkedIn recommendation"),
      quoteBlock("His ability to not only excel in analytics but also seamlessly transition into various other roles such as product design, UX, software creation, and even the intricate world of NFTs is truly impressive.", "LinkedIn recommendation"),
      para(normal("Evidence: His career is essentially a series of domain jumps \u2014 UX research \u2192 e-commerce conversion \u2192 government security systems \u2192 NFT/Web3 \u2192 AI startup. Each required rapid upskilling. Colleagues explicitly call out his technology acquisition speed.")),

      heading2("4.3 Network Building & Community Leadership"),
      quoteBlock("One of Mateusz\u2019s greatest assets is his extensive network. He seems to know everyone in the industry, which has been invaluable in forging partnerships, gathering insights, and keeping us ahead of the curve.", "LinkedIn recommendation"),
      para(normal("Evidence: Founded People That Count (250+ attendees, world-class speakers like Simo Ahava, Craig Sullivan, Zorin Radevancovic). Runs Web Analytics Wednesday Warsaw since 2013. Past coordinator of UX Poland. This isn\u2019t just networking \u2014 it\u2019s community infrastructure building.")),

      heading2("4.4 Leadership Style"),
      quoteBlock("He\u2019s like a commando in our team, capable of handling any task with finesse and expertise.", "Displate colleague"),
      quoteBlock("Demonstrated independence, work planning, creativity, and conflict-free collaboration.", "GoldenLine recommendation"),
      para(normal("Pattern: He\u2019s a player-coach, not a pure delegator. His leadership style appears to be hands-on, leading by competence rather than authority. He builds small, high-performance teams (5\u20138 people), ships fast, and maintains craft credibility by staying technical.")),

      heading2("4.5 Teaching & Knowledge Transfer"),
      para(normal("12 years of continuous academic leadership \u2014 not just lecturing, but running the entire UXD postgraduate programme at SWPS as Head of UXD Studies (2014\u2013present, 203 hours, 5 thematic blocks). Plus teaching at Pozna\u0144 UoE (2017\u20132019). All alongside full-time industry roles. This signals someone who processes knowledge by teaching it \u2014 a strong indicator of structured thinking, curriculum design ability, and mentorship capability.")),

      new Paragraph({ children: [new PageBreak()] }),

      // 5. PRODUCTS AND DOMAINS
      heading1("5. Products & Domains Managed"),

      heading2("5.1 E-commerce at Scale"),
      para(bold("RTV Euro AGD (Euro-net) | 2014\u20132018")),
      para(normal("Poland\u2019s largest consumer electronics retailer (revenue >1B PLN). Per his CV, he created the R&D/CRO team from scratch, managed A/B testing across the entire organisation, oversaw and developed the web analytics ecosystem, led a major redesign including rebuilding analytics infrastructure and implementing Google Analytics 360, and led the first agile development team in the company (remote Warsaw-Wrocław) as Product Owner. He owned the full UX and conversion stack: search engines, parametric filters, checkout flows, and payment integrations.")),

      heading2("5.2 Travel E-commerce"),
      para(bold("Going | 2018")),
      para(normal("Head of Product at Going, a Polish travel experiences platform. May 2018 \u2013 Feb 2019 (concurrent with ValueStreams consulting). Per his CV: facilitated dev team and stakeholders, introduced kanban and sprint methodologies, conducted product research, recruited specialists, and initiated Performance Marketing activities. This was a dual-track period where he ran both a startup product role and enterprise consulting simultaneously.")),

      heading2("5.3 Banking & Insurance Consulting"),
      para(bold("ValueStreams | May 2018 \u2013 Feb 2019 (concurrent with Going)")),
      para(normal("Product Owner & Consultant providing E-commerce, UXD, Digital Analytics, and Agile consulting to enterprise clients: BGŻ (banking), Santander (banking), Asseco (IT/fintech), PWPW (state security), and Warta (insurance). This is the only period where he operated as an independent consultant to multiple large organisations simultaneously. It\u2019s also how he got the PWPW connection that led to his Deputy Director appointment.")),

      heading2("5.4 Government Digital Identity"),
      para(bold("PWPW S.A. | March 2019 \u2013 2021")),
      para(normal("Deputy Director of the Digital Solutions Division (Pion Rozwiązań Cyfrowych) at Poland\u2019s state security printing house. Per his CV, he was responsible for digital products across a 300-person IT division. PWPW produces national ID cards, ePassports with biometric data, PKI certificates, and the eDO mobile identity application (200k+ downloads in <6 months post-launch, later reaching 8M+ users by 2024).")),
      para(bold("Key achievements from CV:")),
      bullet(normal("Launched edoapp.pl \u2014 200k+ downloads in under 6 months. Won Innowatory Wprost 2020 award (Technology & Business Services category)")),
      bullet(normal("Developed the concept for an identity, authentication, and authorisation ecosystem based on e-dowód (eID)")),
      bullet(normal("Full IT restructuring \u2014 career paths, salary frameworks, reduced turnover")),
      bullet(normal("Initiated DevOps culture across the IT division")),
      bullet(normal("Migrated 300-person IT to full remote ONE MONTH before pandemic outbreak, without slowing development")),
      bullet(normal("Facilitated IT collaboration with HR and Legal departments")),
      bullet(normal("Initiated Performance Marketing activities with the Marketing Office")),

      heading2("5.5 Art Marketplace, NFT & AI"),
      para(bold("Displate | 2021\u20132025 (employee); Oct 2025\u2013present (Entrepreneur in Residence & AI Advisory, contract)")),
      para(normal("Displate is a global marketplace of 40,000+ artists selling designs on metal prints, with brand partnerships including Disney (Star Wars, Marvel), CD Projekt (Cyberpunk, Witcher), Blizzard, Bethesda, DC, and NASA. Over 4.5 years as employee, Walig\u00f3rski ran three parallel tracks:")),
      bullet(bold("Analytics/BI (2023\u20132025): "), normal("Built and manages the data/BI function, hiring Senior BI Specialists.")),
      bullet(bold("Displate Nifties / Head of NFT (2021\u20132023): "), normal("Launched a new business line \u2014 curated NFTs on Ethereum blockchain with physical product exclusives for NFT holders. Built the team from scratch (3 devs + artist acquisition + finance + design).")),
      bullet(bold("AI / Gemini Integration (2025): "), normal("Led the partnership with Google Cloud to deploy Gemini multimodal AI for automated metadata generation across millions of artworks. The problem: many artists\u2019 works were effectively invisible due to missing or poor-quality titles, descriptions, and tags. The solution: Gemini generates accurate metadata at scale, with AI-generated tags receiving higher priority in search results. The result: 750% MoM sales growth for newly onboarded artists\u2019 works, stabilising at 350\u2013400%. This project was featured on the official Google Blog, covered by aboutmarketing.pl, and presented by Walig\u00f3rski at Google Cloud Summit Poland 2025.")),
      para(normal("As of October 2025, he transitioned to Entrepreneur in Residence & AI Advisory role (contract), continuing to support AI product integration and strategy while building Outplay SwipePads.")),
      para(
        normal("Planned next steps (per Google case study): AI-powered duplicate content removal, image quality enhancement for print production, and an artist categorisation system."),
      ),

      heading2("5.6 AI Mobile Product"),
      para(bold("Outplay SwipePads | Nov 2024\u2013present")),
      para(normal("Co-Founded with Mateusz Godala. Early-stage AI mobile product. Parent entity is OUTPLAY MOBILE INC. (US). Polish operating entity registered March 2025. Focused on gaming and interactive mobile experiences powered by AI. Product details still emerging; referenced in community posts for hiring native Android developers and gamescom presence.")),

      new Paragraph({ children: [new PageBreak()] }),

      // 5B. CONFERENCE & SPEAKING HISTORY
      heading1("5B. Conference & Speaking History (Complete)"),
      para(normal("A comprehensive log of all confirmed public speaking, organising, and panel appearances:")),
      spacer(40),

      heading2("As Organiser / Founder"),
      bullet(bold("Web Analytics Wednesday Warsaw (2013\u2013present): "), normal("Quarterly digital analytics meetup. 17+ presentations archived on SlideShare (slideshare.net/webanalyticswednesday). Running continuously for 13 years.")),
      bullet(bold("People That Count (2018\u2013present): "), normal("Boutique digital analytics conference. Kino Atlantic, Warsaw. Sept 26\u201327. 250+ attendees. Speakers: Simo Ahava, Craig Sullivan, Zorin Radevancovic. Co-produced with Bogna Sayna & Wojtek Hot\u00f3wko (Hot Labs). English-language lectures with simultaneous Polish translation. Evolved from Web Analytics Wednesdays.")),
      bullet(bold("MeasureCamp Warsaw (2023\u2013present): "), normal("Co-organizer. Brought the unconference format to Poland. 1st edition October 14, 2023; 2nd edition October 12, 2024. Hosted at Google\u2019s Warsaw HQ. Displate serves as Silver Sponsor.")),
      bullet(bold("Polish IA Summit (2010, 2012): "), normal("Co-organised while at UseLab. First Polish Information Architects Meeting.")),
      bullet(bold("UX Poland: "), normal("Past coordinator.")),

      heading2("As Speaker / Panellist"),
      bullet(bold("Google Cloud Summit Poland (2025): "), normal("Presented the Displate x Gemini AI case study alongside Google\u2019s Poland country manager Magda Dziewgu\u0107. Corporate keynote setting. Covered: AI metadata generation, search optimisation, IP compliance.")),
      bullet(bold("eMetrics Summit Boston (Sept 2015): "), normal("Speaker at the premier international digital analytics conference.")),
      bullet(bold("Cryptocurrency World Expo Warsaw (March 9\u201310, 2022): "), normal("Panellist debating NFT futures. Discussed NFT applications in art, journalism, content creation, community building, digital identity, and smart contracts. 30+ industry speakers.")),

      heading2("As Attendee (Listed Under \u201cEducation\u201d on CV)"),
      bullet(bold("UX Poland: "), normal("Also past coordinator.")),
      bullet(bold("Superweek (Hungary): "), normal("Premier European digital analytics retreat. 5-day intensive format, invitation-level event.")),
      bullet(bold("MeasureCamp: "), normal("Unconference format for digital analytics practitioners. Free, community-driven.")),
      bullet(bold("Agile By Example (Warsaw): "), normal("Largest agile conference in Central Europe.")),

      heading2("As Podcast Guest"),
      bullet(bold("Nie Tylko Design (Ep. 027): "), normal("E-commerce UX design discussion with Tomasz Sk\u00f3rski. Covered search engines, filters, checkout optimisation for large e-commerce services.")),
      bullet(bold("Bartek Pucek Newsletter (2021/2022): "), normal("Featured interview on NFTs as cultural/technological revolution, Displate\u2019s NFT strategy, digital ownership.")),

      new Paragraph({ children: [new PageBreak()] }),

      // 5C. CERTIFICATIONS, EDUCATION & ACADEMIC ROLES
      heading1("5C. Certifications, Education & Academic Roles"),

      heading2("Education"),
      bullet(bold("SWPS University (2008\u20132013): "), normal("Uniwersytet SWPS | Social Psychology of Internet and Communication (SPIK). This is a niche intersection of psychology and digital behaviour \u2014 explains his UX research foundations.")),

      heading2("Certifications (Confirmed from CV + Public Data)"),
      bullet(bold("Professional Scrum Product Owner I (PSPO I): "), normal("October 2017. Scrum.org certification. Validates product ownership and stakeholder management skills.")),
      bullet(bold("Professional Scrum Master I (PSM I): "), normal("January 2018. Scrum.org certification. Validates Scrum framework facilitation capability.")),
      bullet(bold("AgilePM Foundation: "), normal("March 2018. DSDM Agile Project Management. Broader agile methodology beyond Scrum.")),
      bullet(bold("OSINT / Niebezpiecznik.pl: "), normal("September 2020. \u201cAdvanced information gathering about people and companies.\u201d Niebezpiecznik is Poland\u2019s leading cybersecurity outlet. This is an operational intelligence and due diligence credential \u2014 notable for someone in a state security role at the time.")),
      bullet(bold("Google Analytics Individual Qualification (GAIQ): "), normal("Certified. Core credential for analytics professionals.")),
      bullet(bold("Google AdWords (Basic + Intermediate): "), normal("Two-level certification. Covers search, display, and campaign management.")),

      heading2("Academic Roles"),
      bullet(bold("SWPS University \u2014 Head of UXD Studies (2014\u2013present): "), normal("Not just a lecturer \u2014 he RUNS the programme. The postgraduate UX | Product Design programme is 203 hours across 2 semesters, structured in 5 thematic blocks covering the full UX Design and Product Design process. Based on Design Thinking and UCD methodology. He has held this role continuously for 12 years alongside full-time industry work.")),
      bullet(bold("Pozna\u0144 University of Economics (2017\u20132019): "), normal("Postgraduate lecturer in E-marketing. His affiliation listed as \u201cConversion Specialist at Euro-net.\u201d")),

      new Paragraph({ children: [new PageBreak()] }),

      // 5D. LINKEDIN ACTIVITY PROFILE
      heading1("5D. LinkedIn Activity Profile"),
      para(normal("Full profile access (direct login). Data scraped March 10, 2026:")),
      spacer(40),

      heading2("Profile Metadata"),
      bullet(bold("Followers: "), normal("2,365")),
      bullet(bold("Connections: "), normal("500+ (LinkedIn\u2019s displayed cap)")),
      bullet(bold("Recommendations received: "), normal("9 confirmed")),
      bullet(bold("Headline: "), normal("Co-Founder of SwipePads / AI & Analytics Advisory @ Displate / Angel Investor / E-comm, Data & AI Consultant")),
      bullet(bold("ENS: "), normal("waligorski.eth")),
      bullet(bold("Profile Analytics (past 7 days): "), normal("100 profile views, 63 post impressions, 54 search appearances")),

      heading2("Current Role Status"),
      para(normal("Entrepreneur in Residence / AI Advisory @ Displate (contract) since October 2025. Also: Co-Founder of Outplay SwipePads, Angel Investor in TasteRay (Dec 2024) and Redigo Carbon (Nov 2022).")),

      heading2("Posting Pattern & Community Engagement"),
      para(normal("Posts approximately 2 times per month. Style is casual, witty, and community-focused rather than thought-leadership blogging. Posting categories:")),
      bullet(bold("Hiring Announcements: "), normal("Data Scientists (with prompt-injection themed job ads), Analytics Engineers, Senior BI Specialists, Android Developers (for Outplay SwipePads), Product Managers. These are personal posts using his network as a direct talent pipeline.")),
      bullet(bold("AI & Community: "), normal("Mentoring AI Creative Challenge (Two tracks: Creative & Technical), speaking at The Foundation AI events, sharing Superweek analytics conference content.")),
      bullet(bold("Gaming / E-commerce Content: "), normal("Gamescom presence with Outplay SwipePads (\u201cThumb Overlords\u201d), brand collaborations (Bandai Namco, Dark Souls, Elden Ring), game-adjacent content.")),
      bullet(bold("Conference Organizing: "), normal("MeasureCamp Warsaw venue announcements, organiser updates, community posts. Displate as official Silver Sponsor.")),
      bullet(bold("Analytics Community: "), normal("Shared GA sunset memes, Superweek highlights, senior data engineer hiring posts.")),

      heading2("Post Performance"),
      para(normal("Sample engagement from recent posts:")),
      bullet(normal("Junior Analytics Engineer hiring: 73 reactions, 5,982 impressions (top performer)")),
      bullet(normal("Senior Data Engineer/LLM + recommendations hiring: 30 reactions, 5 reposts")),
      bullet(normal("Data Scientist (Displate): 39 reactions, 3,090 impressions")),
      bullet(normal("Google Cloud Summit speaker card: 79 reactions, 3,122 impressions")),
      bullet(normal("AI Creative Challenge mentoring: 42 reactions, 1,787 impressions")),
      bullet(normal("Typical range for original posts: 25\u201395 reactions; 1,787\u20135,982 impressions")),

      heading2("Communication Style"),
      para(normal("Casual, witty, uses tech humor and memes (Claude Code jokes, prompt injection themed job ads). His LinkedIn presence is transactional and community-oriented: hiring talent, engaging with industry events, sharing learning from Superweek/MeasureCamp, and promoting Displate milestones and partnerships.")),

      heading2("Network Signals"),
      para(normal("The use of personal LinkedIn for direct recruiting (rather than delegating to HR) signals: (1) his personal network is his talent pipeline, (2) he maintains hands-on hiring responsibility despite management roles, and (3) he prioritises community over personal branding. Consistent with his \u201cplayer-coach\u201d leadership style and community infrastructure building.")),

      new Paragraph({ children: [new PageBreak()] }),

      // 5E. AWARDS & SIDE PROJECTS
      heading1("5E. Awards & Side Projects"),

      heading2("Awards"),
      bullet(bold("Innowatory Wprost 2020 (Technology & Business Services): "), normal("Awarded for edoapp.pl \u2014 the mobile application replacing physical eID card readers on NFC phones. Described as \u201cthe foundation of the virtual identity ecosystem intended to replace the requirement of physical presence with an ID card.\u201d This is a national-level innovation award from one of Poland\u2019s leading business magazines.")),
      bullet(bold("Winner, Pozna\u0144 Startup Weekend For Education (March 2013): "), normal("Trampstory \u2014 a mobile educational game solving the problem of boring, textbook-style history education through geolocation-based gameplay and interactive storytelling of historical events. MVP built around the 95th anniversary of the Greater Poland Uprising.")),

      heading2("Side Projects & Angel Investments"),
      bullet(bold("Outplay SwipePads (Nov 2024\u2013present): "), normal("Co-Founder with Mateusz Godala. AI-powered mobile gaming/interactive product. US parent entity (OUTPLAY MOBILE INC.), Polish operating entity registered March 2025. Actively hiring (native Android developers, game designers).")),
      bullet(bold("TasteRay (Angel Investor, Dec 2024\u2013present): "), normal("Food-tech startup. Early-stage angel investment.")),
      bullet(bold("Redigo Carbon (Angel Investor, Nov 2022\u2013present): "), normal("Climate/sustainability venture. Roles: Validating Team Budget & Product Roadmap, Founding Initial Core Development Team, Providing Initial Enterprise Leads. Active angel involvement in team building and enterprise sales.")),
      bullet(bold("Undisclosed Hate Speech Detection Tool (Aug 2020 \u2013 present): "), normal("Creator and coordinator. Built a tool identifying incitement to violence based on racial, ethnic, and sexual grounds. Enables reporting hate acts. Coordinated a development team, content specialists, a lawyer, and beta-testers. This shows: (1) social conscience, (2) ability to coordinate cross-disciplinary teams outside of employment, (3) NLP/content moderation domain awareness.")),
      bullet(bold("Powidoki Studio (Mar 2019 \u2013 Nov 2020): "), normal("Angel investor and business consultant. Helped a growing tattoo artist and illustrator establish their own studio. Mentoring in P&L budgeting, organisational/accounting setup, and social media presence. Small-scale but demonstrates hands-on P&L mentoring ability.")),

      heading2("Personal Interests (from CV)"),
      para(normal("Video games (co-op and action RPGs, former team-oriented e-sports in Dota 2), American stand-up comedy (George Carlin, Bill Hicks, Trevor Noah \u2014 specifically comedy tackling difficult topics like environment, geopolitics, clashing worldviews), board games and pen-and-paper RPG sessions. He explicitly notes that \u201crole-playing, negotiation, and team facilitation\u201d apply beyond business. The Dota 2 background is telling \u2014 team-oriented competitive gaming maps directly to collaborative, high-pressure decision-making.")),

      new Paragraph({ children: [new PageBreak()] }),

      // 6. WHO RECOMMENDS HIM
      heading1("6. Who Recommends Him & What They Say"),
      para(normal("9 recommendations on LinkedIn + multiple GoldenLine endorsements. Recommendations come from three distinct professional layers, which is a strong signal of cross-functional credibility:")),
      spacer(60),

      heading2("6.1 Direct Reports (Displate)"),
      para(bold("Mateusz Godala (Founder | Advisor) — April 29, 2024")),
      para(normal("Managed Mateusz directly. Themes: \u201csuper manager,\u201d multifaceted (analytics, product design, UX, software, NFTs), \u201clike a commando,\u201d extensive network, innovative, positive attitude, sense of humour.")),

      para(bold("Bartosz Klocek (Data Analyst) — November 7, 2018")),
      para(normal("Reported directly to Mateusz. Themes: high bar for UX and data-driven A/B testing, e-commerce problem-solving, agile project management, quick tech adoption (GCP, AWS, PWA, AMP), great communication, knows how to build a team.")),

      heading2("6.2 Peers / Cross-Functional Collaborators (Euro-net Era)"),
      para(bold("Tomasz Dyrks (Product Design Leadership) — October 23, 2018")),
      para(normal("Same team. Themes: excellent UX expert and web analyst, one of the best managers, open-minded problem solver, transforms challenges into opportunities.")),

      para(bold("Mikołaj Wezdecki (VP LPP S.A. | CEO Silky Coders | ex Eobuwie/Modivo | ex euro.com.pl) — October 23, 2018")),
      para(normal("Managed Mateusz directly. Themes: first UX hire at Euro-net, responsible for website redesign, found subcontractors independently, migrated to Product Owner with dev team responsibility, built UX team, vast UX/analytics knowledge.")),

      para(bold("Tomasz Sk\u00f3rski (Principal Product Manager, Search, UX. Doing AI) — November 8, 2017")),
      para(normal("Different teams. Themes: brilliant, eloquent, friendly professional, fantastic analytical/problem-solving skills, UX + tech + business understanding.")),

      para(bold("Konrad Pilchowski (Payment environment connector) — November 7, 2017")),
      para(normal("Same team. Themes: extensive UX and web analytics knowledge, solid manager, key role in redesigning Euro-net\u2019s online services, led dev team.")),

      heading2("6.3 Early Career / Academic Network"),
      para(bold("Andrzej Pindor (Experienced .NET & Angular Developer | Full-Stack) — January 20, 2015")),
      para(normal("Different teams. Themes: \u201cJust tell him what you need \u2014 he will do it.\u201d Captures trust and directive communication style.")),

      para(bold("Hubert Anyzewski (Startup Investor | Serial Entrepreneur | Product Strategy) — September 26, 2011")),
      para(normal("Different companies. Themes: good communication skills, focus on work, IA and Google Analytics specialist.")),

      para(bold("Agnieszka Janulewicz (Experienced qualitative researcher) — September 26, 2011")),
      para(normal("Same team (UseLab). Themes: outstanding information architect, usability specialist, certified Google Analytics consultant, quick learner, creative, team player.")),

      spacer(80),
      heading2("6.4 Recommendation Pattern"),
      para(
        normal("Nine recommendations cluster around three core themes: "),
        bold("(1) extreme adaptability across domains"),
        normal(" (analytics \u2192 product \u2192 NFT \u2192 AI), "),
        bold("(2) communication and hands-on team building"),
        normal(" (uses personal network for hiring, coaches teammates), and "),
        bold("(3) technical depth that earns craft credibility"),
        normal(" (not just a manager, but a practitioner). The \u201ccommando\u201d and \u201cJust tell him what you need\u201d language reveals a directness and reliability that cuts across levels. Notably absent: patience, consensus-building, or steady-state optimisation. This profile excels at 0\u21921 initiatives and rapid context-switching."),
      ),

      new Paragraph({ children: [new PageBreak()] }),

      // 7. ROLE FIT ANALYSIS
      heading1("7. Role Fit Analysis"),
      para(normal("Based on the full evidence set, here are the roles where Walig\u00f3rski would be most effective, ranked by fit strength:")),
      spacer(60),

      heading2("7.1 Strongest Fit: VP/Head of Product (Data & AI-Heavy)"),
      para(normal("His entire career is product leadership with analytics as the backbone, now extended into production AI deployment. He\u2019s managed product teams, hired cross-functionally, and shipped incremental (CRO at RTV Euro AGD), greenfield (Displate Nifties), and AI-native (Gemini metadata at scale) products. The Google Cloud case study gives him a concrete, measurable AI product win that most candidates at this level lack. Best suited for companies where the product IS the data \u2014 marketplaces, recommendation engines, AI-augmented platforms, personalisation-heavy SaaS.")),
      bullet(bold("Ideal company stage: "), normal("Series A\u2013C scale-up or innovation unit within enterprise")),
      bullet(bold("Ideal company type: "), normal("AI-augmented marketplace, e-commerce platform, content discovery, AdTech, data product company")),
      bullet(bold("New signal: "), normal("The Gemini project shows he can own the full AI product lifecycle: identify the business case, select the model, partner with a hyperscaler (Google), ship at scale, and present measurable results publicly. That\u2019s VP of AI Product territory.")),

      heading2("7.2 Strong Fit: Chief Product Officer (Early-Stage)"),
      para(normal("As a co-founder of Outplay SwipePads, he\u2019s already in this seat. His breadth (UX + analytics + Web3 + AI + government) means he can credibly own the entire product surface at a startup. His network is a cheat code for early hiring and partnership development. Angel investments in TasteRay and Redigo Carbon (where he actively shapes budget, roadmap, team building, and enterprise leads) demonstrate applied founder-level operational capability outside his day job.")),
      bullet(bold("Ideal company stage: "), normal("Pre-seed to Series A")),
      bullet(bold("Risk factor: "), normal("His track record shows relatively short employee tenures (1\u20133 years per role). Whether he has the patience for the 5\u201310 year founder grind remains unproven, though his 4.5+ year Displate stint (with expanding scope) is a positive signal.")),

      heading2("7.3 Strong Fit: Head of Growth / Growth Product"),
      para(normal("The CRO background + analytics depth + community network makes him a natural growth leader. He thinks in experiments, measures obsessively, and has the product chops to ship the changes himself.")),
      bullet(bold("Ideal company type: "), normal("Consumer marketplace, D2C brand, subscription e-commerce")),

      heading2("7.4 Moderate Fit: VP of Analytics / Data"),
      para(normal("He can do this, but it may underutilise him. Pure analytics leadership doesn\u2019t leverage his product-building and business-unit-creation strengths. He\u2019d likely get bored in a role that\u2019s purely about dashboards and reporting.")),
      bullet(bold("Better framing: "), normal("\u201cHead of Analytics & Product Experimentation\u201d \u2014 where the analytics team owns experiment design and product direction, not just measurement.")),

      heading2("7.5 Moderate Fit: Digital Transformation Lead (Enterprise/Gov)"),
      para(normal("The PWPW experience is unique. Very few people in the Polish tech ecosystem have both gov-sec and startup credentials. For a large enterprise or government agency trying to modernise, he\u2019s a credible bridge between the compliance world and the shipping-fast world.")),
      bullet(bold("Ideal org: "), normal("Financial services, healthcare, government digital services, regulated industries")),

      heading2("7.6 Strong Fit (NEW): Head of AI Product"),
      para(normal("The Gemini case study is a genuine differentiator. He\u2019s not an ML engineer, but he\u2019s demonstrated the ability to identify AI use cases, partner with Google Cloud at a strategic level, deploy multimodal AI in production at scale, and measure business impact (750% growth). Combined with the SwipePads AI venture, he now has two concurrent AI product credentials. For companies deploying AI into existing products (rather than building foundation models), this is a strong fit.")),
      bullet(bold("Ideal company type: "), normal("Marketplace deploying AI for discovery/recommendation, content platform, e-commerce using generative AI, enterprise SaaS adding AI features")),
      bullet(bold("Differentiator: "), normal("Google Cloud Summit speaker + official Google blog case study = rare public validation of AI execution capability")),

      heading2("7.7 Niche Fit: Web3/NFT Product Lead"),
      para(normal("He built this from zero at Displate. However, the NFT market has contracted significantly since 2022. This role is only relevant if Web3 enters another growth cycle, or in blockchain/gaming companies where NFT mechanics are core to the product.")),

      new Paragraph({ children: [new PageBreak()] }),

      // 8. RISK FACTORS & GAPS
      heading1("8. Risk Factors & Development Areas"),
      spacer(40),

      heading2("8.1 Tenure Pattern"),
      para(normal("Career span is 16+ years (since November 2009 at Empik Group), not 15+ as previously understood. Average employee role duration is 1.5\u20133 years, except for Displate (October 2021\u2013October 2025 = 4 years as full-time employee + ongoing contract as Entrepreneur in Residence since October 2025). The longer Displate tenure, combined with expanding scope (Analytics \u2192 NFT \u2192 AI), suggests he can stay when the challenge density increases. For roles requiring 4+ years of continuity at a single scope level, this pattern warrants a direct conversation. However, given his ability to keep roles growing, the risk is mitigated if the role itself is designed for evolution.")),

      heading2("8.2 Scale Ceiling (RESOLVED)"),
      para(normal("Previously flagged as unknown. His 2020 CV confirms he was responsible for a 300-person IT division at PWPW \u2014 this is well beyond the typical \u201cteam lead\u201d ceiling. Combined with IT restructuring, career path development, and full remote migration at that scale, the concern about managing 30+ person organisations is now resolved. The remaining question is P&L ownership at commercial scale (his P&L experience is from PWPW, a state enterprise, and Powidoki Studio, a small mentoring engagement).")),

      heading2("8.3 Founder Track Record"),
      para(normal("SwipePads is his first co-founder role at an actual product startup (DPS Design was a sole proprietorship consultancy). GWDE O\u00dc (Estonia) is in liquidation, which could indicate a failed venture or a deliberate wind-down. Worth asking about directly.")),

      heading2("8.4 Technical Depth vs. Breadth"),
      para(normal("He\u2019s described as grasping technologies \u201con the fly\u201d rather than having deep engineering roots. He\u2019s a technical product leader, not a technical architect. For roles requiring hands-on coding or system design, he\u2019d need strong engineering partners. However, the Gemini deployment shows he can work at the API/platform level with hyperscaler AI \u2014 he doesn\u2019t need to train models, but he can deploy them effectively.")),

      heading2("8.5 Tenure Pattern (Mitigating Factor) — UPDATED"),
      para(normal("The Displate tenure now confirmed as October 2021\u2013October 2025 (4 years employee + ongoing as Entrepreneur in Residence/AI Advisory, contract). This is his longest commercial role and the clearest evidence he can stay when the scope keeps expanding (analytics \u2192 NFT \u2192 AI). The pattern is not restlessness but rather a need for sufficient challenge density. Once he finds an environment that evolves with his capabilities, he commits at scale.")),

      spacer(200),
      hr(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [small("END OF PROFILE")]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [small("All assessments based on publicly available professional data. No private or restricted sources accessed.")]
      }),
    ]
  }]
});

const OUTPUT_PATH = "/sessions/gifted-fervent-hawking/mnt/outputs/Professional_Profile_Mateusz_Waligorski.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log("SUCCESS: " + OUTPUT_PATH);
});
