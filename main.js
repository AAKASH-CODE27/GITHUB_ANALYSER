import { fetchRepoData } from './api.js';
import { analyzeRepo } from './analyzer.js';

const urlInput = document.getElementById('repo-url');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingState = document.getElementById('loading-state');
const resultsContainer = document.getElementById('results-container');

analyzeBtn.addEventListener('click', handleAnalysis);

urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleAnalysis();
});

async function handleAnalysis() {
  const url = urlInput.value.trim();
  if (!url) return;

  // Reset UI
  resultsContainer.innerHTML = '';
  loadingState.style.display = 'block';
  analyzeBtn.disabled = true;

  try {
    const data = await fetchRepoData(url);
    const analysis = analyzeRepo(data);
    renderResults(analysis);
  } catch (error) {
    resultsContainer.innerHTML = `
      <div class="report-section glass animate-fade-in" style="border-color: #ef4444;">
        <h2 style="color: #ef4444;">Analysis Failed</h2>
        <p>${error.message}. Please check the URL and ensure the repository is public.</p>
      </div>
    `;
  } finally {
    loadingState.style.display = 'none';
    analyzeBtn.disabled = false;
  }
}

function renderResults(analysis) {
  resultsContainer.innerHTML = `
    <div id="results" class="animate-fade-in">
      <section class="report-section glass">
        <h2>📦 Project Overview</h2>
        <p style="font-size: 1.1rem; line-height: 1.6; color: var(--text-main);">${analysis.description}</p>
        <div style="display: flex; gap: 2rem; margin-top: 1.5rem; color: var(--text-dim);">
          <span>⭐ ${analysis.stats.stars.toLocaleString()} Stars</span>
          <span>🍴 ${analysis.stats.forks.toLocaleString()} Forks</span>
          <span>📅 Updated: ${analysis.stats.lastUpdate}</span>
        </div>
      </section>

      <section class="report-section glass">
        <h2>🛠️ Tech Stack</h2>
        <div class="tag-container">
          ${analysis.techStack.map(tech => `<span class="tag">${tech}</span>`).join('')}
        </div>
      </section>

      <section class="report-section glass">
        <h2>🔍 Quality Observations</h2>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem;">
          ${analysis.quality.map(obs => `<li style="display: flex; align-items: center; gap: 0.5rem;">${obs}</li>`).join('')}
        </ul>
      </section>

      <section class="report-section glass">
        <h2>💡 Suggested Improvements</h2>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 1rem;">
          ${analysis.suggestions.map(sug => `
            <li style="padding-left: 1.5rem; position: relative;">
              <span style="position: absolute; left: 0; color: var(--accent-primary);">→</span>
              ${sug}
            </li>
          `).join('')}
        </ul>
      </section>
    </div>
  `;
}
