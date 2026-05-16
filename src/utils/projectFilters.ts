type ProjectSearchItem = {
  name: string;
  type: string;
  focus: string;
  description: string;
  detail?: string;
  tags: string[];
};

export function getProjectTags(projects: ProjectSearchItem[]) {
  const tags = projects.flatMap((project) => project.tags || []);
  return ["Tous", ...Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b, "fr"))];
}

export function filterProjects<TProject extends ProjectSearchItem>(
  projects: TProject[],
  query: string,
  activeTag: string,
) {
  const normalizedQuery = normalizeSearchText(query);
  return projects.filter((project) => {
    const matchesTag = activeTag === "Tous" || project.tags.includes(activeTag);
    const haystack = normalizeSearchText([
      project.name,
      project.type,
      project.focus,
      project.description,
      project.detail || "",
      project.tags.join(" "),
    ].join(" "));
    return matchesTag && (!normalizedQuery || haystack.includes(normalizedQuery));
  });
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
