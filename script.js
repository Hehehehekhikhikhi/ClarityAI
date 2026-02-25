// Get DOM elements
const inputText = document.getElementById('inputText');
const writingStyle = document.getElementById('writingStyle');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('resultsSection');
const featuresSection = document.getElementById('featuresSection');
const copyBtn = document.getElementById('copyBtn');

// Metric elements
const readabilityScore = document.getElementById('readabilityScore');
const scoreLabel = document.getElementById('scoreLabel');
const wordCount = document.getElementById('wordCount');
const sentenceCount = document.getElementById('sentenceCount');
const avgWords = document.getElementById('avgWords');
const complexWords = document.getElementById('complexWords');
const improvedText = document.getElementById('improvedText');
const suggestionsCard = document.getElementById('suggestionsCard');
const suggestionsList = document.getElementById('suggestionsList');

// Event listeners
analyzeBtn.addEventListener('click', analyzeText);
copyBtn.addEventListener('click', copyToClipboard);

function analyzeText() {
    const text = inputText.value.trim();
    
    if (!text) {
        alert('Please enter some text to analyze!');
        return;
    }

    // Show loading state
    analyzeBtn.innerHTML = `
        <div class="loading-spinner"></div>
        <span>Analyzing...</span>
    `;
    analyzeBtn.disabled = true;

    // Simulate processing time
    setTimeout(() => {
        const analysis = performAnalysis(text, writingStyle.value);
        displayResults(analysis);
        
        // Reset button
        analyzeBtn.innerHTML = `
            <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <span>Improve Writing</span>
        `;
        analyzeBtn.disabled = false;
    }, 1500);
}

function performAnalysis(text, style) {
    // Split text into sentences and words
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    const longWords = words.filter(w => w.length > 7).length;
    
    // Calculate readability score (simplified Flesch Reading Ease)
    const score = Math.max(0, Math.min(100, 
        100 - (avgWordsPerSentence * 1.5) - (longWords / words.length * 100)
    ));

    // Generate improved version
    const improved = generateImprovedText(text, style);
    
    // Generate suggestions
    const suggestions = generateSuggestions(text, style, avgWordsPerSentence);

    return {
        original: text,
        improved,
        readabilityScore: Math.round(score),
        metrics: {
            sentences: sentences.length,
            words: words.length,
            avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
            longWords
        },
        suggestions
    };
}

function generateImprovedText(text, style) {
    let improved = text;
    
    if (style === 'casual') {
        improved = text
            .replace(/\bhowever\b/gi, 'but')
            .replace(/\btherefore\b/gi, 'so')
            .replace(/\butilize\b/gi, 'use')
            .replace(/\bcommence\b/gi, 'start');
    } else if (style === 'academic') {
        improved = text
            .replace(/\bget\b/gi, 'obtain')
            .replace(/\bbut\b/gi, 'however')
            .replace(/\bso\b/gi, 'therefore')
            .replace(/\bstart\b/gi, 'commence');
    } else if (style === 'professional') {
        improved = text
            .replace(/\bkinda\b/gi, 'somewhat')
            .replace(/\bgonna\b/gi, 'going to')
            .replace(/\bwanna\b/gi, 'want to')
            .replace(/\blots of\b/gi, 'many');
    }
    
    return improved;
}

function generateSuggestions(text, style, avgWords) {
    const suggestions = [];
    
    if (avgWords > 25) {
        suggestions.push({
            type: 'Structure',
            issue: 'Long sentences detected',
            suggestion: 'Break complex sentences into shorter ones for better clarity. Aim for 15-20 words per sentence.',
            icon: '📏'
        });
    }
    
    if (text.split(/\s+/).filter(w => w.length > 10).length > 3) {
        suggestions.push({
            type: 'Vocabulary',
            issue: 'Complex words found',
            suggestion: 'Replace complex words with simpler alternatives where possible to improve readability.',
            icon: '📚'
        });
    }
    
    if (text.toLowerCase().includes('very') || text.toLowerCase().includes('really')) {
        suggestions.push({
            type: 'Precision',
            issue: 'Weak intensifiers used',
            suggestion: 'Replace "very" and "really" with stronger, more specific words. For example, "very good" can become "excellent".',
            icon: '🎯'
        });
    }
    
    if (!/[!?]/.test(text) && text.length > 100) {
        suggestions.push({
            type: 'Engagement',
            issue: 'Monotone punctuation',
            suggestion: 'Vary your punctuation. Consider using questions or exclamations to engage readers.',
            icon: '✨'
        });
    }

    const passiveIndicators = ['was', 'were', 'been', 'being'];
    const hasPassive = passiveIndicators.some(word => 
        text.toLowerCase().includes(` ${word} `)
    );
    
    if (hasPassive) {
        suggestions.push({
            type: 'Voice',
            issue: 'Passive voice detected',
            suggestion: 'Use active voice for stronger, clearer writing. For example, change "The ball was thrown" to "She threw the ball".',
            icon: '⚡'
        });
    }
    
    return suggestions;
}

function displayResults(analysis) {
    // Hide features, show results
    featuresSection.style.display = 'none';
    resultsSection.style.display = 'block';

    // Update metrics
    const score = analysis.readabilityScore;
    readabilityScore.textContent = score;
    readabilityScore.className = 'metric-value ' + getScoreColor(score);
    scoreLabel.textContent = getScoreLabel(score);

    wordCount.textContent = analysis.metrics.words;
    sentenceCount.textContent = `${analysis.metrics.sentences} sentences`;
    avgWords.textContent = analysis.metrics.avgWordsPerSentence;
    complexWords.textContent = analysis.metrics.longWords;

    // Update improved text
    improvedText.textContent = analysis.improved;

    // Update suggestions
    if (analysis.suggestions.length > 0) {
        suggestionsCard.style.display = 'block';
        suggestionsList.innerHTML = analysis.suggestions.map(s => `
            <div class="suggestion-item">
                <div class="suggestion-header">
                    <span class="suggestion-emoji">${s.icon}</span>
                    <div class="suggestion-tags">
                        <span class="suggestion-tag">${s.type}</span>
                        <span class="suggestion-issue">${s.issue}</span>
                    </div>
                </div>
                <p class="suggestion-text">${s.suggestion}</p>
            </div>
        `).join('');
    } else {
        suggestionsCard.style.display = 'none';
    }

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getScoreColor(score) {
    if (score >= 70) return 'metric-green';
    if (score >= 40) return 'metric-yellow';
    return 'metric-red';
}

function getScoreLabel(score) {
    if (score >= 70) return 'Excellent';
    if (score >= 40) return 'Good';
    return 'Needs Work';
}

function copyToClipboard() {
    const text = improvedText.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Copied!</span>
        `;
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    }).catch(err => {
        alert('Failed to copy text. Please copy manually.');
    });
}
