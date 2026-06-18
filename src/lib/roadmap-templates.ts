// Predefined roadmap templates per target role.
// No paid AI — hand-curated study paths.

export type Role = "Product Manager" | "Data Analyst";

export const ROLE_SKILLS: Record<Role, string[]> = {
  "Product Manager": ["Communication", "Leadership", "Product Thinking", "Analytics", "SQL", "User Research"],
  "Data Analyst": ["Excel", "SQL", "Statistics", "Visualization", "Python", "Communication"],
};

export interface TemplateMilestone {
  title: string;
  description: string;
  week_start: number;
  week_end: number;
  tasks: string[];
}

export const ROADMAP_TEMPLATES: Record<Role, TemplateMilestone[]> = {
  "Product Manager": [
    {
      title: "PM Fundamentals",
      description: "Understand the role, frameworks, and product lifecycle.",
      week_start: 1, week_end: 1,
      tasks: [
        "Read 'Cracking the PM Interview' chapters 1–4",
        "Study CIRCLES framework with one worked example",
        "Write a 1-page note on a product you use daily",
        "Map a product's user journey end-to-end",
      ],
    },
    {
      title: "Product Analysis",
      description: "Teardown popular apps and articulate decisions.",
      week_start: 2, week_end: 2,
      tasks: [
        "Pick an app and write a product teardown (~500 words)",
        "Propose 3 improvements with hypotheses",
        "Identify 3 metrics that matter for the product",
        "Share teardown with a peer for feedback",
      ],
    },
    {
      title: "Analytics Basics",
      description: "Learn core product metrics and SQL.",
      week_start: 3, week_end: 4,
      tasks: [
        "Learn AARRR / North Star metric frameworks",
        "Complete a SQL basics course (SELECT, JOIN, GROUP BY)",
        "Practice 10 SQL questions on a sample dataset",
        "Define metrics for a hypothetical feature",
      ],
    },
    {
      title: "User Research",
      description: "Talk to users and synthesize insights.",
      week_start: 5, week_end: 6,
      tasks: [
        "Read 'The Mom Test' chapters 1–3",
        "Conduct 3 user interviews and document findings",
        "Write a problem statement based on interviews",
        "Build a simple survey and share with 10 people",
      ],
    },
    {
      title: "Build a Portfolio Project",
      description: "Ship one end-to-end product case study.",
      week_start: 7, week_end: 9,
      tasks: [
        "Pick a problem space and write a PRD",
        "Wireframe the solution in Figma",
        "Define MVP scope and success metrics",
        "Write a polished case study (Notion / Medium)",
      ],
    },
    {
      title: "Resume & LinkedIn",
      description: "Position yourself for PM internships.",
      week_start: 10, week_end: 10,
      tasks: [
        "Rewrite resume with PM-style impact bullets",
        "Update LinkedIn headline and About section",
        "Collect 3 referrals or LinkedIn recommendations",
        "Get resume reviewed by a working PM",
      ],
    },
    {
      title: "Applications & Interviews",
      description: "Execute the search and crack interviews.",
      week_start: 11, week_end: 12,
      tasks: [
        "Apply to 20 PM internships across LinkedIn/Internshala",
        "Practice 5 product-design interview questions",
        "Practice 5 estimation / analytical questions",
        "Do 2 mock interviews and capture feedback",
      ],
    },
  ],
  "Data Analyst": [
    {
      title: "Excel Mastery",
      description: "Spreadsheet fluency for analysis.",
      week_start: 1, week_end: 1,
      tasks: [
        "Master VLOOKUP, INDEX/MATCH, XLOOKUP",
        "Build 3 pivot tables on a sample dataset",
        "Learn 10 common Excel formulas (IF, SUMIFS, …)",
        "Recreate a dashboard from a public example",
      ],
    },
    {
      title: "SQL Foundations",
      description: "Query and shape data confidently.",
      week_start: 2, week_end: 3,
      tasks: [
        "Complete SELECT, WHERE, GROUP BY, JOINs",
        "Practice 20 SQL questions on LeetCode/StrataScratch",
        "Learn window functions (RANK, ROW_NUMBER)",
        "Build one SQL report end-to-end",
      ],
    },
    {
      title: "Statistics Basics",
      description: "Reason about data correctly.",
      week_start: 4, week_end: 5,
      tasks: [
        "Learn mean/median/mode, variance, std-dev",
        "Understand distributions and the CLT",
        "Hypothesis testing — p-values and t-tests",
        "Apply stats to a real dataset and write a note",
      ],
    },
    {
      title: "Visualization",
      description: "Tell stories with charts.",
      week_start: 6, week_end: 7,
      tasks: [
        "Learn Tableau / Power BI basics",
        "Recreate 3 dashboards from public examples",
        "Build a portfolio dashboard from open data",
        "Write a 1-page insight memo from a chart",
      ],
    },
    {
      title: "Python for Analysis",
      description: "Pandas, numpy, and notebooks.",
      week_start: 8, week_end: 9,
      tasks: [
        "Learn pandas DataFrame essentials",
        "Clean a messy dataset in a Jupyter notebook",
        "Perform an EDA and write findings",
        "Plot results with matplotlib / seaborn",
      ],
    },
    {
      title: "Resume & Portfolio",
      description: "Package your work for recruiters.",
      week_start: 10, week_end: 10,
      tasks: [
        "Publish 2 projects on GitHub with READMEs",
        "Rewrite resume with quantified impact bullets",
        "Update LinkedIn and write one analysis post",
        "Get a portfolio review from a working analyst",
      ],
    },
    {
      title: "Applications & Interviews",
      description: "Land the interviews and convert.",
      week_start: 11, week_end: 12,
      tasks: [
        "Apply to 20 analyst internships",
        "Practice 10 SQL interview questions under time",
        "Practice 5 case / guesstimate questions",
        "Do 2 mock interviews and iterate",
      ],
    },
  ],
};

export const ROLES: Role[] = ["Product Manager", "Data Analyst"];
