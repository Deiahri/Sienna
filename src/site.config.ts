/**
 * Everything personal on the site, in one place. Components read from here, and nothing else holds
 * Sienna's name, links or copy.
 *
 * Marked TODO: a value we don't have yet. Marked DRAFT: wording to replace with hers.
 */

export const site = {
  name: { first: "Sienna", last: "Zhang" },
  /** The line under her name in the hero. */
  title: "Software Engineer",

  /**
   * The photo beside About, a path under /public (e.g. "/sienna.jpg"), or null for the placeholder.
   * TODO: her photo. Portrait crop, roughly 4:5.
   */
  photo: null as string | null,

  /**
   * DRAFT: the About text beside her photo: a large heading, then the body. In the body, `**…**`
   * is bold: the few things a skimming reader should catch.
   */
  about: {
    heading: "I'm Xinning (Sienna)",
    body: "I'm a software engineer studying at the **University of Houston**, graduating **May 2029**. Off the clock, I do **stand-up**.",
  },

  /** The compact list below Work. */
  also: [
    {
      heading: "Education",
      items: [{ main: "University of Houston", detail: "BSc Industrial Engineering · May\u00a02029 · GPA\u00a03.8" }],
    },
    {
      heading: "Awards",
      items: [
        { main: "Audience Choice Award, stand-up", detail: "Beijing Deadly Serious Comedy Club · 2026" },
        { main: "3rd place, software track", detail: "X Academy Hackathon · 2023" },
        { main: "Microsoft AI Training Camp", detail: "Certified · 2023" },
      ],
    },
    {
      heading: "Languages",
      items: [
        { main: "Mandarin", detail: "Native" },
        { main: "English", detail: "Fluent" },
      ],
    },
  ],

  connect: {
    /** DRAFT: from her current site's contact section. `**…**` is bold. */
    line: "I'm looking for **Summer 2027 internships** in industrial engineering, manufacturing operations, supply chain or data analytics.",
    /** The subject a "mailto:" link starts with. */
    mailSubject: "Hello from your portfolio",
  },

  /**
   * TODO: her personal address. A school address stops working after graduation. Until it's set,
   * the site uses `schoolEmail`.
   */
  personalEmail: "",
  schoolEmail: "xzhang117@cougarnet.uh.edu",

  linkedin: "https://www.linkedin.com/in/xinning-zhang-97233b430",
  github: "https://github.com/Ning-xxxnnn",
  /**
   * TODO: a link to her resume PDF hosted elsewhere (e.g. a Google Drive "anyone with the link"
   * share). Until it's set, the site shows "Resume (soon)" with nothing to click.
   */
  resumeUrl: "",

  description: "Sienna Zhang, industrial engineering student at the University of Houston: projects and how to reach her.",
} as const;

export const fullName = `${site.name.first} ${site.name.last}`;
export const email = site.personalEmail || site.schoolEmail;
export const mailto = `mailto:${email}?subject=${encodeURIComponent(site.connect.mailSubject)}`;
