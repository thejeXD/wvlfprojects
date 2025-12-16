// Data for all applications and games
const ALL_PROJECTS = [
    // 1. Web App
    {
        type: 'app',
        name: 'Grade Calculator',
        description: 'Instantly analyze grades and predict required scores. Track GWA across multiple subjects.',
        link: 'apps/grade-calculator.html',
        image: 'assets/thumb-calculator.png',
        tags: ['Education', 'Calculator', 'Student', 'Utility']
    },
    // 2. Web App
    {
        type: 'app',
        name: 'Randomizer Aguinaldo',
        description: 'A fun, probabilistic tool for holiday cash gift-giving with custom weighting.',
        link: 'apps/randomizer-aguinaldo.html',
        image: 'assets/thumb-randomizer.png',
        tags: ['Fun', 'Utility', 'Finance', 'Random']
    },
    // 3. Web App
    {
        type: 'app',
        name: 'Follower Checkers',
        description: 'Track social media follower status with ease and simplicity. (External API required)',
        link: 'apps/followers-checker.html',
        image: 'assets/thumb-instagram.png',
        tags: ['Utility', 'Social', 'API']
    },
    // 4. Web App
    {
        type: 'app',
        name: 'Instagram Mockup',
        description: 'Preview Instagram posts with verified badges, custom formats (Square, Portrait, Landscape), and dark mode.',
        link: 'apps/instagram-mockup.html',
        image: 'assets/thumb-mockup.png',
        tags: ['Social', 'Design', 'Utility', 'Mockup']
    },
    // 5. Web App
    {
        type: 'app',
        name: 'Instagram Mockup',
        description: 'Preview Instagram posts with verified badges, custom formats (Square, Portrait, Landscape), and dark mode.',
        link: 'apps/instagram-mockup.html',
        image: 'assets/thumb-mockup.png',
        tags: ['Social', 'Design', 'Utility', 'Mockup']
    },
    // 5. Roblox Game 1 (from your HTML)
    {
        type: 'game',
        name: 'Wolf Hangout V2',
        description: 'My main social hub on Roblox. A great place to chill and meet friends.',
        link: 'https://www.roblox.com/games/your-game-id-1',
        image: 'assets/asset1.png',
        tags: ['Roblox', 'Social', 'Hangout', 'Game Dev']
    },
    // 5. Roblox Game 2 (from your HTML)
    {
        type: 'game',
        name: 'The Wolf\'s Labyrinth',
        description: 'A challenging adventure/puzzle map focused on complex Lua scripting and environment interaction.',
        link: 'https://www.roblox.com/games/your-game-id-2',
        image: 'assets/asset2.png',
        tags: ['Roblox', 'Adventure', 'Puzzle', 'Game Dev']
    },
    // 6. Roblox Game 3 (from your HTML)
    {
        type: 'game',
        name: 'Racing Pro',
        description: 'High-speed racing game with custom cars, leaderboards, and detailed track modeling.',
        link: 'https://www.roblox.com/games/your-game-id-3',
        image: 'assets/asset5.png',
        tags: ['Roblox', 'Racing', 'Simulation', 'Game Dev']
    },
    // Add more apps or games here!
];

const appGrid = document.getElementById('app-grid');
const searchInput = document.getElementById('app-search');
const filterSelect = document.getElementById('tag-filter');
const noResultsMessage = document.getElementById('no-results');

// --- 1. Rendering Functions ---

// Map tags to their corresponding CSS classes for colors
const tagClassMapping = {
    'education': 'tag-keyword',
    'calculator': 'tag-func',
    'student': 'tag-keyword',
    'utility': 'tag-string',
    'fun': 'tag-var',
    'finance': 'tag-number',
    'random': 'tag-var',
    'social': 'tag-var',
    'api': 'tag-number',
    'roblox': 'tag-keyword',
    'hangout': 'tag-var',
    'adventure': 'tag-func',
    'puzzle': 'tag-func',
    'racing': 'tag-string',
    'simulation': 'tag-string',
    'gamedev': 'tag-keyword', // Default for game dev
};

function createTagHTML(tags) {
    return tags.map(tag => {
        const tagClass = tagClassMapping[tag.toLowerCase()] || 'tag-keyword'; // Default to keyword style
        return `<span class="tag ${tagClass}">${tag}</span>`;
    }).join('');
}

function renderCard(project) {
    return `
        <a href="${project.link}" class="app-card-link" ${project.link.startsWith('http') ? 'target="_blank"' : ''}>
            <div class="app-card">
                <img src="${project.image}" alt="${project.name} Thumbnail" class="app-thumbnail" />
                <h3 class="app-title">${project.name}</h3>
                <p class="app-description">${project.description}</p>
                <div class="app-tags">${createTagHTML(project.tags)}</div>
            </div>
        </a>
    `;
}

function renderGrid(projects) {
    appGrid.innerHTML = projects.map(renderCard).join('');
    if (projects.length === 0) {
        noResultsMessage.style.display = 'block';
    } else {
        noResultsMessage.style.display = 'none';
    }
}

// --- 2. Filter Setup ---

function populateFilters() {
    const allTags = new Set();
    ALL_PROJECTS.forEach(p => p.tags.forEach(tag => allTags.add(tag)));

    // Create options for the filter dropdown
    allTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag.toLowerCase();
        option.textContent = tag;
        filterSelect.appendChild(option);
    });
}

// --- 3. Filtering Logic ---

function filterProjects() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedTag = filterSelect.value;

    const filtered = ALL_PROJECTS.filter(project => {
        // Search by name
        const matchesSearch = project.name.toLowerCase().includes(searchTerm);
        
        // Filter by tag
        const matchesTag = selectedTag === 'all' || 
                           project.tags.map(t => t.toLowerCase()).includes(selectedTag);

        return matchesSearch && matchesTag;
    });

    renderGrid(filtered);
}

// --- 4. Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Populate the filter dropdown on load
    populateFilters(); 

    // Initial render of all projects
    renderGrid(ALL_PROJECTS); 

    // Attach event listeners
    searchInput.addEventListener('input', filterProjects);
    filterSelect.addEventListener('change', filterProjects);
});