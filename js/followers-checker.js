class FollowerCheckerApp {
    constructor() {
        this.comparisonResults = {
            mutual: [],
            notFollowingBack: [],
            notFollowingYou: []
        };
        this.currentTab = 'not-following-back';
        this.followerCounts = {};
        this.fetchFollowersEnabled = false;
        this.influencerFilterEnabled = false;
        this.influencerMinimum = 45000;

        this._cacheDOMElements();
        this._bindEventListeners();
        this._logInitialization();
    }

    _cacheDOMElements() {
        // Inputs
        this.followingInput = document.getElementById('following-input');
        this.followersInput = document.getElementById('followers-input');
        this.followingCount = document.getElementById('following-count');
        this.followersCount = document.getElementById('followers-count');

        // Buttons
        this.clearFollowingBtn = document.getElementById('clear-following-btn');
        this.pasteFollowingBtn = document.getElementById('paste-following-btn');
        this.clearFollowersBtn = document.getElementById('clear-followers-btn');
        this.pasteFollowersBtn = document.getElementById('paste-followers-btn');
        this.compareBtn = document.getElementById('compare-btn');
        this.copyListBtn = document.getElementById('copy-list-btn');
        this.downloadListBtn = document.getElementById('download-list-btn');

        // Settings
        this.fetchFollowersToggle = document.getElementById('fetch-followers-toggle');
        this.influencerSetting = document.getElementById('influencer-setting');
        this.fetchWarning = document.getElementById('fetch-warning');
        this.influencerFilterToggle = document.getElementById('influencer-filter-toggle');
        this.influencerThresholdContainer = document.getElementById('influencer-threshold');
        this.influencerMinInput = document.getElementById('influencer-min');

        // Results & Tabs
        this.resultsSection = document.getElementById('results-section');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.statCounters = {
            mutual: document.getElementById('mutual-count'),
            notFollowingBack: document.getElementById('not-following-back-count'),
            notFollowingYou: document.getElementById('not-following-you-count')
        };
        this.listContainers = {
            mutual: document.getElementById('mutual-list'),
            notFollowingBack: document.getElementById('not-following-back-list'),
            notFollowingYou: document.getElementById('not-following-you-list')
        };
        this.emptyStates = {
            mutual: document.getElementById('empty-mutual'),
            notFollowingBack: document.getElementById('empty-not-following-back'),
            notFollowingYou: document.getElementById('empty-not-following-you')
        };

        // Info Dropdowns
        this.infoDropdowns = document.querySelectorAll('.info-dropdowns .dropdown-btn');
    }

    _bindEventListeners() {
        // Input listeners
        this.followingInput.addEventListener('input', () => this.updateCount('following'));
        this.followersInput.addEventListener('input', () => this.updateCount('followers'));

        // Button listeners
        this.clearFollowingBtn.addEventListener('click', () => this.clearInput('following'));
        this.pasteFollowingBtn.addEventListener('click', () => this.pasteFromClipboard('following'));
        this.clearFollowersBtn.addEventListener('click', () => this.clearInput('followers'));
        this.pasteFollowersBtn.addEventListener('click', () => this.pasteFromClipboard('followers'));
        this.compareBtn.addEventListener('click', () => this.compareUsers());
        this.copyListBtn.addEventListener('click', () => this.copyList());
        this.downloadListBtn.addEventListener('click', () => this.downloadList());

        // Settings listeners
        this.fetchFollowersToggle.addEventListener('change', () => this.toggleFollowersFetch());
        this.influencerFilterToggle.addEventListener('change', () => this.toggleInfluencerFilter());
        this.influencerMinInput.addEventListener('change', (e) => {
            this.influencerMinimum = parseInt(e.target.value) || 45000;
        });

        // Tab listeners
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.id.replace('tab-', '');
                this.showTab(tabName);
            });
        });

        // Info dropdown listeners
        this.infoDropdowns.forEach(button => {
            button.addEventListener('click', () => {
                const dropdownId = button.dataset.dropdown;
                this.toggleDropdown(dropdownId);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.compareUsers();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.clearInput('following');
                this.clearInput('followers');
            }
        });

        // Dynamic event listener for user items
        document.getElementById('results-section').addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.view-profile-btn');
            const copyBtn = e.target.closest('.copy-username-btn');
            
            if (viewBtn) {
                this.openInstagramProfile(viewBtn.dataset.username);
            }
            if (copyBtn) {
                this.copyUsername(copyBtn.dataset.username);
            }
        });
    }

    parseUsernames(text) {
        if (!text || !text.trim()) return [];
        
        const lines = text.trim().split('\n');
        const usernames = [];
        
        const urlPattern = /instagram\.com\/_u\/([a-zA-Z0-9._]+)/;
        const datePattern = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2}\s+(am|pm)$/i;
        const usernamePattern = /^[a-zA-Z0-9._]+$/;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || datePattern.test(line)) continue;
            
            const urlMatch = line.match(urlPattern);
            if (urlMatch) {
                usernames.push(urlMatch[1].toLowerCase());
                continue;
            }
            
            if (line.includes('instagram.com') || line.includes('http')) continue;
            if (/^\d+$/.test(line)) continue;
            
            if (usernamePattern.test(line)) {
                const username = line.startsWith('@') ? line.substring(1) : line;
                usernames.push(username.toLowerCase());
            }
        }
        
        return [...new Set(usernames)];
    }

    updateCount(type) {
        const input = type === 'following' ? this.followingInput : this.followersInput;
        const counter = type === 'following' ? this.followingCount : this.followersCount;
        
        const usernames = this.parseUsernames(input.value);
        counter.textContent = usernames.length;
    }

    clearInput(type) {
        if (type === 'following') {
            this.followingInput.value = '';
            this.followingCount.textContent = '0';
        } else {
            this.followersInput.value = '';
            this.followersCount.textContent = '0';
        }
    }

    async pasteFromClipboard(type) {
        try {
            const text = await navigator.clipboard.readText();
            if (type === 'following') {
                this.followingInput.value = text;
                this.updateCount('following');
            } else {
                this.followersInput.value = text;
                this.updateCount('followers');
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

    toggleFollowersFetch() {
        this.fetchFollowersEnabled = this.fetchFollowersToggle.checked;
        
        if (this.fetchFollowersEnabled) {
            this.influencerSetting.style.display = 'block';
            this.fetchWarning.style.display = 'flex';
        } else {
            this.influencerSetting.style.display = 'none';
            this.fetchWarning.style.display = 'none';
            this.influencerFilterToggle.checked = false;
            this.influencerFilterEnabled = false;
            this.influencerThresholdContainer.style.display = 'none';
        }
    }

    toggleInfluencerFilter() {
        this.influencerFilterEnabled = this.influencerFilterToggle.checked;
        
        if (this.influencerFilterEnabled) {
            this.influencerThresholdContainer.style.display = 'block';
            this.influencerMinimum = parseInt(this.influencerMinInput.value) || 45000;
        } else {
            this.influencerThresholdContainer.style.display = 'none';
        }
    }

    async fetchFollowerCount(username) {
        try {
            const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
                headers: { 'x-ig-app-id': '936619743392459' }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data?.data?.user?.edge_followed_by?.count || null;
            }
            
            const pageResponse = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=dis`);
            if (pageResponse.ok) {
                const pageData = await pageResponse.json();
                return pageData?.graphql?.user?.edge_followed_by?.count || pageData?.user?.edge_followed_by?.count || null;
            }
            
            return null;
        } catch (error) {
            console.error(`Error fetching follower count for ${username}:`, error);
            return null;
        }
    }

    formatFollowerCount(count) {
        if (count === null) return 'N/A';
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    }

    async fetchAllFollowerCounts(usernames) {
        this.followerCounts = {};
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        let completed = 0;
        const total = usernames.length;
        
        const updateProgress = () => {
            const progressText = `Fetching follower counts... ${completed}/${total}`;
            Swal.update({
                html: `<div style="text-align: center;"><div style="margin-bottom: 1rem;"><div style="width: 100%; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;"><div style="width: ${(completed/total)*100}%; height: 100%; background: #2563eb; transition: width 0.3s;"></div></div></div><p style="margin: 0; color: #6c757d;">${progressText}</p><p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #adb5bd;">This may take a few minutes...</p></div>`
            });
        };
        
        Swal.fire({
            title: 'Fetching Follower Counts',
            html: `<div style="text-align: center;"><div style="margin-bottom: 1rem;"><div style="width: 100%; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;"><div style="width: 0%; height: 100%; background: #2563eb; transition: width 0.3s;"></div></div></div><p style="margin: 0; color: #6c757d;">Fetching follower counts... 0/${total}</p><p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #adb5bd;">This may take a few minutes...</p></div>`,
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });
        
        const batchSize = 5;
        for (let i = 0; i < usernames.length; i += batchSize) {
            const batch = usernames.slice(i, i + batchSize);
            const promises = batch.map(async (username) => {
                const count = await this.fetchFollowerCount(username);
                this.followerCounts[username] = count;
                completed++;
                updateProgress();
            });
            
            await Promise.all(promises);
            if (i + batchSize < usernames.length) await delay(2000);
        }
        
        Swal.close();
    }

    compareUsers() {
        const followingText = this.followingInput.value;
        const followersText = this.followersInput.value;
        
        if (!followingText.trim()) {
            return Swal.fire({ icon: 'warning', title: 'Missing Data', text: 'Please paste your following list', confirmButtonColor: '#2563eb' });
        }
        if (!followersText.trim()) {
            return Swal.fire({ icon: 'warning', title: 'Missing Data', text: 'Please paste your followers list', confirmButtonColor: '#2563eb' });
        }
        
        const following = this.parseUsernames(followingText);
        const followers = this.parseUsernames(followersText);
        
        if (following.length === 0 && followers.length === 0) {
            return Swal.fire({ icon: 'error', title: 'No Usernames Found', text: 'Could not find any valid usernames. Please check your input format.', confirmButtonColor: '#2563eb' });
        }
        
        const followingSet = new Set(following);
        const followersSet = new Set(followers);
        
        this.comparisonResults.notFollowingBack = [...followingSet].filter(user => !followersSet.has(user)).sort();
        this.comparisonResults.mutual = [...followingSet].filter(user => followersSet.has(user)).sort();
        this.comparisonResults.notFollowingYou = [...followersSet].filter(user => !followingSet.has(user)).sort();
        
        this.displayResults();
    }

    displayResults() {
        this.statCounters.mutual.textContent = this.comparisonResults.mutual.length;
        this.statCounters.notFollowingBack.textContent = this.comparisonResults.notFollowingBack.length;
        this.statCounters.notFollowingYou.textContent = this.comparisonResults.notFollowingYou.length;
        
        this.displayUserList('not-following-back', this.comparisonResults.notFollowingBack);
        this.displayUserList('not-following-you', this.comparisonResults.notFollowingYou);
        this.displayUserList('mutual', this.comparisonResults.mutual);
        
        this.resultsSection.style.display = 'block';
        setTimeout(() => {
            this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
        const notFollowingBackCount = this.comparisonResults.notFollowingBack.length;
        Swal.fire({
            icon: notFollowingBackCount > 0 ? 'info' : 'success',
            title: 'Comparison Complete!',
            html: `<div style="text-align: left; margin: 20px 0;"><p style="font-size: 16px; margin-bottom: 15px; font-weight: 600; color: #ef4444;">❌ You Follow, They Don't: ${this.comparisonResults.notFollowingBack.length}</p><p style="font-size: 14px; margin-bottom: 10px;">✅ Mutual Followers: ${this.comparisonResults.mutual.length}</p><p style="font-size: 14px;">⚠️ They Follow, You Don't: ${this.comparisonResults.notFollowingYou.length}</p></div>`,
            confirmButtonColor: '#2563eb'
        });
    }

    displayUserList(type, users) {
        const listContainer = this.listContainers[type];
        const emptyState = this.emptyStates[type];
        
        if (users.length === 0) {
            listContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        listContainer.style.display = 'grid';
        emptyState.style.display = 'none';
        
        const userHTML = users.map(username => {
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
                        <button class="icon-btn view-profile-btn" data-username="${username}" title="View on Instagram">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </button>
                        <button class="icon-btn copy-username-btn" data-username="${username}" title="Copy username">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        listContainer.innerHTML = userHTML;
    }

    openInstagramProfile(username) {
        window.open(`https://www.instagram.com/${username}/`, '_blank', 'noopener,noreferrer');
    }

    async copyUsername(username) {
        try {
            await navigator.clipboard.writeText(username);
            Swal.fire({ icon: 'success', title: 'Copied!', text: `@${username} copied to clipboard`, timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Copy Failed', text: 'Could not copy to clipboard', timer: 1500, showConfirmButton: false });
        }
    }

    showTab(tabName) {
        this.currentTab = tabName;
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        document.getElementById(`tab-${tabName}`).classList.add('active');
        this.tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-content`).classList.add('active');
    }

    async copyList() {
        const users = this.getCurrentTabUsers();
        if (users.length === 0) {
            return Swal.fire({ icon: 'info', title: 'No Users', text: 'No users to copy in this tab', confirmButtonColor: '#2563eb' });
        }
        
        try {
            await navigator.clipboard.writeText(users.join('\n'));
            Swal.fire({ icon: 'success', title: 'Copied!', text: `${users.length} usernames copied to clipboard`, timer: 2000, showConfirmButton: false });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Copy Failed', text: 'Could not copy to clipboard', confirmButtonColor: '#2563eb' });
        }
    }

    downloadList() {
        const users = this.getCurrentTabUsers();
        if (users.length === 0) {
            return Swal.fire({ icon: 'info', title: 'No Users', text: 'No users to download in this tab', confirmButtonColor: '#2563eb' });
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
        a.download = `instagram_${tabNames[this.currentTab]}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Swal.fire({ icon: 'success', title: 'Downloaded!', text: `${users.length} usernames downloaded`, timer: 2000, showConfirmButton: false });
    }

    getCurrentTabUsers() {
        return this.comparisonResults[this.currentTab] || [];
    }

    toggleDropdown(dropdownId) {
        const dropdown = document.getElementById(`${dropdownId}-dropdown`).parentElement;
        dropdown.classList.toggle('active');
    }

    _logInitialization() {
        console.log('Instagram Followers Checker loaded successfully!');
        console.log('Keyboard shortcuts:');
        console.log('  - Ctrl/Cmd + Enter: Compare lists');
        console.log('  - Ctrl/Cmd + K: Clear all inputs');
        console.log('');
        console.log('Supports Instagram export format:');
        console.log('  - URLs: https://www.instagram.com/_u/username');
        console.log('  - Plain usernames');
        console.log('  - Dates/timestamps automatically removed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FollowerCheckerApp();
});