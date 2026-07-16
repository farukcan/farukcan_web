import { parse } from "node-html-parser";

// Source of truth. The site rebuilds itself from this endpoint on every build.
const ORIGIN = "https://old.farukcan.dev";
const REMOTE_URL = `${ORIGIN}/api.json`;
const PROJECTS_DB_ID = "59410d89-1e49-4c5a-b22d-6a892432ee04";

export type Social = {
  label: string;
  href: string;
  handle: string;
};

export type SkillSection = {
  title: string;
  bodyHtml: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  statusColor: string;
  tags: { name: string; color: string }[];
  link: string | null;
  date: string | null;
  priority: number;
  icon: string | null;
  cover: string | null;
};

export type SiteData = {
  name: string;
  role: string;
  tagline: string;
  description: string;
  footer: string;
  siteUrl: string;
  twitterUsername: string;
  socials: Social[];
  skills: SkillSection[];
  techTags: string[];
  projects: Project[];
  categories: string[];
  stats: { value: string; label: string }[];
  generatedAt: string;
};

// Notion select/multi-select color names -> hex used across badges.
const NOTION_COLORS: Record<string, string> = {
  default: "#86868b",
  gray: "#86868b",
  brown: "#a2845e",
  orange: "#ff9500",
  yellow: "#ffd60a",
  green: "#34c759",
  blue: "#2997ff",
  purple: "#bf5af2",
  pink: "#ff2d55",
  red: "#ff453a",
};

function color(name: string | undefined): string {
  return NOTION_COLORS[name ?? "default"] ?? NOTION_COLORS.default;
}

// Notion assets are served as absolute paths on the origin.
function absUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return ORIGIN + url;
  return url;
}

async function loadRaw(): Promise<unknown> {
  const res = await fetch(REMOTE_URL);
  if (!res.ok) throw new Error(`api.json responded ${res.status}`);
  return await res.json();
}

const SOCIAL_MAP: { match: string; label: string }[] = [
  { match: "linkedin.com", label: "LinkedIn" },
  { match: "github.com", label: "GitHub" },
  { match: "gitlab.com", label: "GitLab" },
  { match: "hackerrank.com", label: "HackerRank" },
  { match: "npmjs.com", label: "NPM" },
  { match: "forms.gle", label: "Contact" },
];

function extractSocials(homeContent: string, twitter: string): Social[] {
  const root = parse(homeContent);
  const socials: Social[] = [];
  const seen = new Set<string>();
  for (const a of root.querySelectorAll("a")) {
    const href = a.getAttribute("href") ?? "";
    const entry = SOCIAL_MAP.find((s) => href.includes(s.match));
    if (!entry || seen.has(entry.label)) continue;
    seen.add(entry.label);
    socials.push({ label: entry.label, href, handle: a.text.trim() });
  }
  if (twitter) {
    socials.push({
      label: "Twitter",
      href: `https://twitter.com/${twitter}`,
      handle: `@${twitter}`,
    });
  }
  return socials;
}

function extractTagline(homeContent: string): string {
  const root = parse(homeContent);
  const callout = root.querySelector(".callout-parent-content");
  const text = callout ? callout.text : "";
  return text.replace(/\s+/g, " ").trim();
}

function extractSkills(homeContent: string): SkillSection[] {
  const root = parse(homeContent);
  const sections: SkillSection[] = [];
  for (const details of root.querySelectorAll("details")) {
    const summary = details.querySelector("summary");
    const title = summary ? summary.text.replace(/\s+/g, " ").trim() : "";
    if (!title) continue;
    if (summary) summary.remove();
    const bodyHtml = details.innerHTML.trim();
    sections.push({ title, bodyHtml });
  }
  return sections;
}

function mapProjects(list: any[]): Project[] {
  return list
    .map((row): Project => {
      const props = row.properties ?? {};
      const name = props.Name?.title?.[0]?.plain_text ?? "Untitled";
      const status = props.Status?.select?.name ?? "";
      const statusColor = color(props.Status?.select?.color);
      const tags = (props.Tags?.multi_select ?? []).map((t: any) => ({
        name: t.name,
        color: color(t.color),
      }));
      const description = (row.frontmatter?.firstParagraphs ?? "")
        .replace(/\s+/g, " ")
        .trim();
      return {
        id: row.id,
        name,
        description,
        status,
        statusColor,
        tags,
        link: props.Link?.url ?? null,
        date: props.Date?.date?.start ?? null,
        priority: props.Priority?.number ?? 0,
        icon: absUrl(row.iconURL),
        cover: absUrl(row.coverURL),
      };
    })
    .sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));
}

export async function getSiteData(): Promise<SiteData> {
  const raw = (await loadRaw()) as any;
  const config = raw.configuration ?? {};
  const homeContent: string = raw.homePage?.content ?? "";
  const projects = mapProjects(raw.databases?.[PROJECTS_DB_ID]?.list ?? []);

  const categories = Array.from(
    new Set(projects.flatMap((p) => p.tags.map((t) => t.name))),
  ).sort();

  const techTags = Array.from(
    new Set(projects.flatMap((p) => p.tags.map((t) => t.name))),
  );

  const gameCount = projects.filter((p) =>
    p.tags.some((t) => t.name === "Game"),
  ).length;

  const twitterUsername = (config.twitter_username ?? "").replace(/^@/, "");

  return {
    name: config.title ?? "Faruk Can",
    role: "Software Engineer",
    tagline: extractTagline(homeContent),
    description: config.description ?? "",
    footer: config.footer_description ?? "",
    siteUrl: config.site_url ?? "https://farukcan.dev",
    twitterUsername,
    socials: extractSocials(homeContent, twitterUsername),
    skills: extractSkills(homeContent),
    techTags,
    projects,
    categories,
    stats: [
      { value: "10+", label: "Years Experience" },
      { value: `${projects.length}`, label: "Projects" },
      { value: `${gameCount}+`, label: "Games Shipped" },
      { value: "6+", label: "Programming Languages" },
    ],
    generatedAt: new Date().toISOString(),
  };
}
