export function analyzeRepo(data) {
  const { repoInfo, readme, tree, commits } = data;

  const analysis = {
    name: repoInfo.name,
    description: repoInfo.description || extractDescriptionFromReadme(readme),
    techStack: detectTechStack(tree),
    quality: assessQuality(tree, commits, readme),
    suggestions: generateSuggestions(tree, readme),
    stats: {
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      language: repoInfo.language,
      lastUpdate: new Date(repoInfo.updated_at).toLocaleDateString()
    }
  };

  return analysis;
}

function extractDescriptionFromReadme(readme) {
  if (!readme) return 'No description available.';
  // Simple extraction: take the first non-header line
  const lines = readme.split('\n').filter(l => l.trim() !== '' && !l.startsWith('#'));
  return lines[0] ? lines[0].substring(0, 200) + '...' : 'Analysis of README failed to yield description.';
}

function detectTechStack(tree) {
  const stack = new Set();
  const filePaths = tree.map(t => t.path);

  // File-based detection
  const patterns = {
    'React': ['src/App.jsx', 'src/App.tsx', 'package.json'],
    'Next.js': ['next.config.js', 'next.config.mjs'],
    'Vue': ['.vue', 'vue.config.js'],
    'Node.js': ['package.json'],
    'Python': ['requirements.txt', 'setup.py', 'pyproject.toml'],
    'Go': ['go.mod'],
    'Rust': ['Cargo.toml'],
    'Docker': ['Dockerfile', 'docker-compose.yml'],
    'TypeScript': ['.ts', '.tsx'],
    'Tailwind CSS': ['tailwind.config.js'],
    'Jest': ['jest.config.js'],
    'ESLint': ['.eslintrc', '.eslintrc.js', '.eslintrc.json'],
  };

  for (const [tech, files] of Object.entries(patterns)) {
    if (files.some(f => filePaths.some(path => path.includes(f)))) {
      stack.add(tech);
    }
  }

  // Extension-based detection
  const extensions = {
    'JavaScript': '.js',
    'TypeScript': '.ts',
    'Python': '.py',
    'Java': '.java',
    'C++': '.cpp',
    'Ruby': '.rb',
    'PHP': '.php',
    'CSS': '.css',
    'HTML': '.html'
  };

  for (const [lang, ext] of Object.entries(extensions)) {
    if (filePaths.some(p => p.endsWith(ext))) {
      stack.add(lang);
    }
  }

  return Array.from(stack);
}

function assessQuality(tree, commits, readme) {
  const observations = [];
  const filePaths = tree.map(t => t.path);

  // Check for tests
  const hasTests = filePaths.some(p => p.includes('test') || p.includes('spec'));
  observations.push(hasTests ? '✅ Comprehensive test suite detected.' : '❌ No obvious test suite found.');

  // Check for CI/CD
  const hasCI = filePaths.some(p => p.includes('.github/workflows'));
  observations.push(hasCI ? '✅ CI/CD workflows configured.' : '⚠️ CI/CD pipelines are missing.');

  // Check for documentation
  const hasDocs = filePaths.some(p => p.toLowerCase().includes('docs/')) || readme.length > 500;
  observations.push(hasDocs ? '✅ Well-documented codebase.' : '⚠️ Documentation could be improved.');

  // Commit history quality
  const recentCommits = commits.map(c => c.commit.message);
  const avgMessageLength = recentCommits.reduce((acc, msg) => acc + msg.length, 0) / recentCommits.length;
  if (avgMessageLength > 30) {
    observations.push('✅ Descriptive commit messages.');
  } else {
    observations.push('⚠️ Commit messages are brief/non-descriptive.');
  }

  return observations;
}

function generateSuggestions(tree, readme) {
  const suggestions = [];
  const filePaths = tree.map(t => t.path);

  if (!filePaths.some(p => p.includes('.github/workflows'))) {
    suggestions.push('Add GitHub Actions for automated testing and linting.');
  }
  if (!filePaths.some(p => p.includes('LICENSE'))) {
    suggestions.push('Add a LICENSE file to define usage terms.');
  }
  if (!filePaths.some(p => p.includes('CONTRIBUTING'))) {
    suggestions.push('Add a CONTRIBUTING.md file to help open-source contributors.');
  }
  if (readme.length < 300) {
    suggestions.push('Expand the README with setup instructions and architectural overview.');
  }
  if (!filePaths.some(p => p.includes('.gitignore'))) {
    suggestions.push('Ensure a .gitignore is present to prevent committing environment secrets.');
  }

  return suggestions;
}
