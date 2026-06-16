export const GITHUB_API_BASE = 'https://api.github.com';

export async function fetchRepoData(url) {
  try {
    const { owner, repo } = parseGitHubUrl(url);
    
    // Fetch base repo info
    const repoResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);
    if (!repoResponse.ok) throw new Error('Repository not found or private');
    const repoInfo = await repoResponse.json();

    // Fetch README
    const readmeResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`);
    let readme = '';
    if (readmeResponse.ok) {
      const readmeData = await readmeResponse.json();
      readme = atob(readmeData.content); // Decode base64
    }

    // Fetch File Tree (recursive)
    const treeResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${repoInfo.default_branch}?recursive=1`);
    let tree = [];
    if (treeResponse.ok) {
      const treeData = await treeResponse.json();
      tree = treeData.tree;
    }

    // Fetch Commits
    const commitsResponse = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=5`);
    let commits = [];
    if (commitsResponse.ok) {
      commits = await commitsResponse.json();
    }

    return {
      repoInfo,
      readme,
      tree,
      commits
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

function parseGitHubUrl(url) {
  const regex = /github\.com\/([^/]+)\/([^/]+)/;
  const match = url.match(regex);
  if (!match) throw new Error('Invalid GitHub URL');
  
  let repo = match[2];
  if (repo.endsWith('.git')) repo = repo.slice(0, -4);
  
  return {
    owner: match[1],
    repo: repo
  };
}
