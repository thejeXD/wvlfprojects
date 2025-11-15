// ==================== THEME MANAGEMENT ====================
let currentTheme = localStorage.getItem('theme') || 'light';

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme();
    localStorage.setItem('theme', currentTheme);
}

function applyTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
    if (currentTheme === 'dark') {
        body.classList.add('dark-theme');
        themeIcon.innerHTML = `
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
        `;
    } else {
        body.classList.remove('dark-theme');
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    }
}

// Apply theme on load
window.addEventListener('DOMContentLoaded', applyTheme);

// ==================== INPUT MANAGEMENT ====================
const followingInput = document.getElementById('following-input');
const followersInput = document.getElementById('followers-input');
const followingCount = document.getElementById('following-count');
const followersCount = document.getElementById('followers-count');

// Update counts when typing
followingInput.addEventListener('input', () => updateCount('following'));
followersInput.addEventListener('input', () => updateCount('followers'));

function parseUsernames(text) {
    if (!text || !text.trim()) return [];
    
    const lines = text.trim().split('\n');
    const usernames = [];
    
    // Regular expressions for different patterns
    const urlPattern = /instagram\.com\/_u\/([a-zA-Z0-9._]+)/;
    const datePattern = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2}\s+(am|pm)$/i;
    const usernamePattern = /^[a-zA-Z0-9._]+$/;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Skip date/timestamp lines
        if (datePattern.test(line)) continue;
        
        // Extract username from Instagram URL
        const urlMatch = line.match(urlPattern);
        if (urlMatch) {
            usernames.push(urlMatch[1].toLowerCase());
            continue;
        }
        
        // Skip full URLs without username pattern
        if (line.includes('instagram.com') || line.includes('http://') || line.includes('https://')) {
            continue;
        }
        
        // Skip obvious non-username patterns (numbers that look like times/dates)
        if (/^\d+$/.test(line)) continue;
        
        // Check if it's a valid username
        if (usernamePattern.test(line)) {
            // Remove @ if present
            const username = line.startsWith('@') ? line.substring(1) : line;
            usernames.push(username.toLowerCase());
        }
    }
    
    // Remove duplicates while preserving order
    return [...new Set(usernames)];
}

function updateCount(type) {
    const input = type === 'following' ? followingInput : followersInput;
    const counter = type === 'following' ? followingCount : followersCount;
    
    const usernames = parseUsernames(input.value);
    counter.textContent = usernames.length;
}

function clearInput(type) {
    if (type === 'following') {
        followingInput.value = '';
        followingCount.textContent = '0';
    } else {
        followersInput.value = '';
        followersCount.textContent = '0';
    }
}

async function pasteFromClipboard(type) {
    try {
        const text = await navigator.clipboard.readText();
        if (type === 'following') {
            followingInput.value = text;
            updateCount('following');
        } else {
            followersInput.value = text;
            updateCount('followers');
        }
        
        Swal.fire({
            icon: 'success',
            title: 'Pasted!',
            text: 'Content pasted successfully',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Permission Denied',
            text: 'Please allow clipboard access or paste manually using Ctrl+V',
            confirmButtonColor: '#2563eb'
        });
    }
}

// ==================== COMPARISON LOGIC ====================
let comparisonResults = {
    mutual: [],
    notFollowingBack: [],
    notFollowingYou: []
};

let currentTab = 'not-following-back';
let followerCounts = {}; // Store follower counts
let fetchFollowersEnabled = false;
let influencerFilterEnabled = false;
let influencerMinimum = 45000;

// Settings functions
function toggleFollowersFetch() {
    fetchFollowersEnabled = document.getElementById('fetch-followers-toggle').checked;
    const influencerSetting = document.getElementById('influencer-setting');
    const fetchWarning = document.getElementById('fetch-warning');
    
    if (fetchFollowersEnabled) {
        influencerSetting.style.display = 'block';
        fetchWarning.style.display = 'flex';
    } else {
        influencerSetting.style.display = 'none';
        fetchWarning.style.display = 'none';
        document.getElementById('influencer-filter-toggle').checked = false;
        influencerFilterEnabled = false;
        document.getElementById('influencer-threshold').style.display = 'none';
    }
}

function toggleInfluencerFilter() {
    influencerFilterEnabled = document.getElementById('influencer-filter-toggle').checked;
    const threshold = document.getElementById('influencer-threshold');
    
    if (influencerFilterEnabled) {
        threshold.style.display = 'block';
        influencerMinimum = parseInt(document.getElementById('influencer-min').value) || 45000;
    } else {
        threshold.style.display = 'none';
    }
}

// Update influencer minimum when input changes
document.addEventListener('DOMContentLoaded', () => {
    const influencerMinInput = document.getElementById('influencer-min');
    if (influencerMinInput) {
        influencerMinInput.addEventListener('change', (e) => {
            influencerMinimum = parseInt(e.target.value) || 45000;
        });
    }
});

// Fetch follower count for a username (using Instagram's public API)
async function fetchFollowerCount(username) {
    try {
        // Try multiple methods to get follower count
        
        // Method 1: Try Instagram's public API endpoint
        const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
            headers: {
                'x-ig-app-id': '936619743392459'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data?.data?.user?.edge_followed_by?.count || null;
        }
        
        // Method 2: Fallback - scrape from public page
        const pageResponse = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=dis`);
        if (pageResponse.ok) {
            const pageData = await pageResponse.json();
            return pageData?.graphql?.user?.edge_followed_by?.count || 
                   pageData?.user?.edge_followed_by?.count || null;
        }
        
        return null;
    } catch (error) {
        console.error(`Error fetching follower count for ${username}:`, error);
        return null;
    }
}

// Format follower count for display
function formatFollowerCount(count) {
    if (count === null) return 'N/A';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
}

// Fetch follower counts for all users with rate limiting
async function fetchAllFollowerCounts(usernames) {
    followerCounts = {};
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    let completed = 0;
    const total = usernames.length;
    
    // Update progress
    const updateProgress = () => {
        const progressText = `Fetching follower counts... ${completed}/${total}`;
        Swal.update({
            html: `
                <div style="text-align: center;">
                    <div style="margin-bottom: 1rem;">
                        <div style="width: 100%; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;">
                            <div style="width: ${(completed/total)*100}%; height: 100%; background: #2563eb; transition: width 0.3s;"></div>
                        </div>
                    </div>
                    <p style="margin: 0; color: #6c757d;">${progressText}</p>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #adb5bd;">This may take a few minutes...</p>
                </div>
            `
        });
    };
    
    // Show loading dialog
    Swal.fire({
        title: 'Fetching Follower Counts',
        html: `
            <div style="text-align: center;">
                <div style="margin-bottom: 1rem;">
                    <div style="width: 100%; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;">
                        <div style="width: 0%; height: 100%; background: #2563eb; transition: width 0.3s;"></div>
                    </div>
                </div>
                <p style="margin: 0; color: #6c757d;">Fetching follower counts... 0/${total}</p>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #adb5bd;">This may take a few minutes...</p>
            </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Fetch in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < usernames.length; i += batchSize) {
        const batch = usernames.slice(i, i + batchSize);
        const promises = batch.map(async (username) => {
            const count = await fetchFollowerCount(username);
            followerCounts[username] = count;
            completed++;
            updateProgress();
        });
        
        await Promise.all(promises);
        
        // Wait between batches to avoid rate limiting
        if (i + batchSize < usernames.length) {
            await delay(2000); // 2 second delay between batches
        }
    }
    
    Swal.close();
}

function compareUsers() {
    const followingText = followingInput.value;
    const followersText = followersInput.value;
    
    if (!followingText.trim() && !followersText.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'No Data',
            text: 'Please paste your following and followers lists',
            confirmButtonColor: '#2563eb'
        });
        return;
    }
    
    if (!followingText.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Data',
            text: 'Please paste your following list',
            confirmButtonColor: '#2563eb'
        });
        return;
    }
    
    if (!followersText.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Missing Data',
            text: 'Please paste your followers list',
            confirmButtonColor: '#2563eb'
        });
        return;
    }
    
    const following = parseUsernames(followingText);
    const followers = parseUsernames(followersText);
    
    if (following.length === 0 && followers.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'No Usernames Found',
            text: 'Could not find any valid usernames. Please check your input format.',
            confirmButtonColor: '#2563eb'
        });
        return;
    }
    
    // Remove duplicates
    const followingSet = new Set(following);
    const followersSet = new Set(followers);
    
    // Calculate results
    // People YOU follow but they DON'T follow you back (main focus!)
    comparisonResults.notFollowingBack = [...followingSet].filter(user => !followersSet.has(user));
    // Mutual followers
    comparisonResults.mutual = [...followingSet].filter(user => followersSet.has(user));
    // People who follow YOU but you DON'T follow them back
    comparisonResults.notFollowingYou = [...followersSet].filter(user => !followingSet.has(user));
    
    // Sort alphabetically
    comparisonResults.mutual.sort();
    comparisonResults.notFollowingBack.sort();
    comparisonResults.notFollowingYou.sort();
    
    displayResults();
}

function displayResults() {
    // Update stats
    document.getElementById('mutual-count').textContent = comparisonResults.mutual.length;
    document.getElementById('not-following-back-count').textContent = comparisonResults.notFollowingBack.length;
    document.getElementById('not-following-you-count').textContent = comparisonResults.notFollowingYou.length;
    
    // Display user lists
    displayUserList('not-following-back', comparisonResults.notFollowingBack);
    displayUserList('not-following-you', comparisonResults.notFollowingYou);
    displayUserList('mutual', comparisonResults.mutual);
    
    // Show results section with animation
    const resultsSection = document.getElementById('results-section');
    resultsSection.style.display = 'block';
    
    // Scroll to results
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    // Show success message with emphasis on "not following back"
    const notFollowingBackCount = comparisonResults.notFollowingBack.length;
    const message = notFollowingBackCount > 0 
        ? `Found ${notFollowingBackCount} ${notFollowingBackCount === 1 ? 'person' : 'people'} you follow who don't follow you back!`
        : 'Great news! Everyone you follow follows you back! 🎉';
    
    Swal.fire({
        icon: notFollowingBackCount > 0 ? 'info' : 'success',
        title: 'Comparison Complete!',
        html: `
            <div style="text-align: left; margin: 20px 0;">
                <p style="font-size: 16px; margin-bottom: 15px; font-weight: 600; color: #ef4444;">
                    ❌ You Follow, They Don't: ${comparisonResults.notFollowingBack.length}
                </p>
                <p style="font-size: 14px; margin-bottom: 10px;">
                    ✅ Mutual Followers: ${comparisonResults.mutual.length}
                </p>
                <p style="font-size: 14px;">
                    ⚠️ They Follow, You Don't: ${comparisonResults.notFollowingYou.length}
                </p>
            </div>
        `,
        confirmButtonColor: '#2563eb'
    });
}

function displayUserList(type, users) {
    const listContainer = document.getElementById(`${type}-list`);
    const emptyState = document.getElementById(`empty-${type}`);
    
    if (users.length === 0) {
        listContainer.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    listContainer.style.display = 'grid';
    emptyState.style.display = 'none';
    
    listContainer.innerHTML = users.map(username => {
        const initial = username.charAt(0).toUpperCase();
        const colors = ['#2563eb', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return `
            <div class="user-item">
                <div class="user-info">
                    <div class="user-avatar" style="background: ${color};">${initial}</div>
                    <div class="user-name">@${username}</div>
                </div>
                <div class="user-actions">
                    <button class="icon-btn" onclick="openInstagramProfile('${username}')" title="View on Instagram">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </button>
                    <button class="icon-btn" onclick="copyUsername('${username}')" title="Copy username">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openInstagramProfile(username) {
    window.open(`https://www.instagram.com/${username}/`, '_blank', 'noopener,noreferrer');
}

async function copyUsername(username) {
    try {
        await navigator.clipboard.writeText(username);
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: `@${username} copied to clipboard`,
            timer: 1500,
            showConfirmButton: false
        });
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Copy Failed',
            text: 'Could not copy to clipboard',
            timer: 1500,
            showConfirmButton: false
        });
    }
}

// ==================== TAB MANAGEMENT ====================
function showTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-content`).classList.add('active');
}

// ==================== EXPORT FUNCTIONALITY ====================
async function copyList() {
    const users = getCurrentTabUsers();
    
    if (users.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No Users',
            text: 'No users to copy in this tab',
            confirmButtonColor: '#2563eb'
        });
        return;
    }
    
    const text = users.join('\n');
    
    try {
        await navigator.clipboard.writeText(text);
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: `${users.length} usernames copied to clipboard`,
            timer: 2000,
            showConfirmButton: false
        });
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Copy Failed',
            text: 'Could not copy to clipboard',
            confirmButtonColor: '#2563eb'
        });
    }
}

function downloadList() {
    const users = getCurrentTabUsers();
    
    if (users.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No Users',
            text: 'No users to download in this tab',
            confirmButtonColor: '#2563eb'
        });
        return;
    }
    
    const text = users.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const tabNames = {
        'not-following-back': 'you_follow_they_dont',
        'not-following-you': 'they_follow_you_dont',
        'mutual': 'mutual_followers'
    };
    
    a.href = url;
    a.download = `instagram_${tabNames[currentTab]}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    Swal.fire({
        icon: 'success',
        title: 'Downloaded!',
        text: `${users.length} usernames downloaded`,
        timer: 2000,
        showConfirmButton: false
    });
}

function getCurrentTabUsers() {
    switch (currentTab) {
        case 'not-following-back':
            return comparisonResults.notFollowingBack;
        case 'not-following-you':
            return comparisonResults.notFollowingYou;
        case 'mutual':
            return comparisonResults.mutual;
        default:
            return [];
    }
}

// ==================== DROPDOWN MANAGEMENT ====================
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(`${dropdownId}-dropdown`).parentElement;
    dropdown.classList.toggle('active');
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to compare
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        compareUsers();
    }
    
    // Ctrl/Cmd + K to clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearInput('following');
        clearInput('followers');
    }
});

// ==================== INITIALIZATION ====================
console.log('Instagram Followers Checker loaded successfully!');
console.log('Keyboard shortcuts:');
console.log('  - Ctrl/Cmd + Enter: Compare lists');
console.log('  - Ctrl/Cmd + K: Clear all inputs');
console.log('');
console.log('Supports Instagram export format:');
console.log('  - URLs: https://www.instagram.com/_u/username');
console.log('  - Plain usernames');
console.log('  - Dates/timestamps automatically removed');