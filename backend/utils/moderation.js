/**
 * Advanced content moderation utilities for filtering inappropriate content
 */

// Comprehensive list of words to filter
const filteredWords = [
    // Profanity
    'badword1', 'badword2', 'badword3',
    
    // Slurs
    'slur1', 'slur2', 'slur3',
    
    // Sexual content
    'sexual1', 'sexual2', 'sexual3',
    
    // Violence
    'violence1', 'violence2', 'violence3',
    
    // Personal information patterns
    'phone', 'address', 'email', 'ssn', 'social security',
    
    // Social media
    'facebook', 'instagram', 'twitter', 'tiktok', 'snapchat', 'discord',
    
    // Contact methods
    'whatsapp', 'telegram', 'signal', 'kik', 'skype',
    
    // In a real production environment, this list would be much more extensive
    // and potentially loaded from an external source or database
];

// Regular expression to match any of the filtered words
const filterRegex = new RegExp(`\\b(${filteredWords.join('|')})\\b`, 'gi');

// Regular expressions for detecting common patterns
const patterns = {
    // Email pattern
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    
    // Phone number patterns (multiple formats)
    phone: /(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/g,
    
    // URL patterns
    url: /(https?:\/\/[^\s]+)/g,
    
    // Social media handles
    socialMedia: /(@[a-zA-Z0-9_]{2,})/g,
    
    // Numbers that might be identifiers
    identifiers: /\b\d{8,}\b/g
};

/**
 * Filter inappropriate content from a message
 * @param {string} message - Original message
 * @returns {object} - Contains filtered message and flag indicating if content was filtered
 */
function filterMessage(message) {
    if (!message || typeof message !== 'string') {
        return { 
            filtered: '', 
            wasFiltered: false,
            reasons: []
        };
    }

    const originalMessage = message;
    let filteredMessage = message;
    const reasons = [];
    
    // Check for word-based filters
    if (filterRegex.test(message)) {
        filteredMessage = filteredMessage.replace(filterRegex, '***');
        reasons.push('inappropriate language');
    }
    
    // Check for pattern-based filters
    for (const [patternName, pattern] of Object.entries(patterns)) {
        if (pattern.test(message)) {
            filteredMessage = filteredMessage.replace(pattern, '[filtered]');
            reasons.push(`personal information (${patternName})`);
        }
    }
    
    // Check for numeric sequences (potential contact info)
    const numericSequences = message.match(/\d{6,}/g);
    if (numericSequences && numericSequences.length > 0) {
        filteredMessage = filteredMessage.replace(/\d{6,}/g, '[filtered]');
        reasons.push('numeric sequence');
    }
    
    const wasFiltered = originalMessage !== filteredMessage;
    
    return {
        filtered: filteredMessage,
        wasFiltered: wasFiltered,
        reasons: wasFiltered ? [...new Set(reasons)] : []
    };
}

/**
 * Check if a message contains inappropriate content
 * @param {string} message - Message to check
 * @returns {object} - Contains flag and reasons
 */
function containsInappropriateContent(message) {
    if (!message || typeof message !== 'string') {
        return {
            inappropriate: false,
            reasons: []
        };
    }
    
    const reasons = [];
    
    // Check for filtered words
    if (filterRegex.test(message)) {
        reasons.push('inappropriate language');
    }
    
    // Check for pattern-based filters
    for (const [patternName, pattern] of Object.entries(patterns)) {
        if (pattern.test(message)) {
            reasons.push(`personal information (${patternName})`);
        }
    }
    
    // Check for numeric sequences (potential contact info)
    const numericSequences = message.match(/\d{6,}/g);
    if (numericSequences && numericSequences.length > 0) {
        reasons.push('numeric sequence');
    }
    
    return {
        inappropriate: reasons.length > 0,
        reasons: [...new Set(reasons)]
    };
}

/**
 * Check message length and content
 * @param {string} message - Message to validate
 * @returns {object} - Contains validity and error message if invalid
 */
function validateMessage(message) {
    if (!message || typeof message !== 'string') {
        return { 
            isValid: false, 
            error: 'Message cannot be empty',
            reasons: ['empty message']
        };
    }

    if (message.length > 1000) {
        return {
            isValid: false,
            error: 'Message is too long (maximum 1000 characters)',
            reasons: ['message too long']
        };
    }

    const contentCheck = containsInappropriateContent(message);
    if (contentCheck.inappropriate) {
        return {
            isValid: false,
            error: 'Message contains inappropriate content',
            reasons: contentCheck.reasons
        };
    }

    return {
        isValid: true,
        error: null,
        reasons: []
    };
}

/**
 * Validates a question for Question Mode
 * @param {string} question - Question to validate
 * @returns {object} - Contains validity and error message if invalid
 */
function validateQuestion(question) {
    // Basic validation
    if (!question || typeof question !== 'string') {
        return { 
            isValid: false, 
            error: 'Question cannot be empty',
            reasons: ['empty question']
        };
    }

    // Length validation
    if (question.length < 10) {
        return {
            isValid: false,
            error: 'Question is too short (minimum 10 characters)',
            reasons: ['question too short']
        };
    }

    if (question.length > 200) {
        return {
            isValid: false,
            error: 'Question is too long (maximum 200 characters)',
            reasons: ['question too long']
        };
    }

    // Content validation
    const contentCheck = containsInappropriateContent(question);
    if (contentCheck.inappropriate) {
        return {
            isValid: false,
            error: 'Question contains inappropriate content',
            reasons: contentCheck.reasons
        };
    }

    // Check if it's actually a question
    if (!question.includes('?')) {
        return {
            isValid: false,
            error: 'Your input must be a question ending with a question mark',
            reasons: ['not a question']
        };
    }

    return {
        isValid: true,
        error: null,
        reasons: []
    };
}

module.exports = {
    filterMessage,
    containsInappropriateContent,
    validateMessage,
    validateQuestion
};
