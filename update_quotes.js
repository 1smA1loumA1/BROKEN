const fs = require('fs');
const path = require('path');

const quotesPath = path.join(__dirname, 'data', 'quotes.json');

const emojis = {
    'sad': ['🥀', '🖤', '🌧️', '💔', '🌑', '🕯️'],
    'healing': ['❤️‍🩹', '🌱', '🦋', '✨', '🩹', '🫂'],
    'late night': ['🌙', '🌌', '🦉', '🔭', '🌫️', '💭'],
    'motivation': ['💪', '🔥', '🌟', '🚀', '🏆', '⚡'],
    'love': ['❤️', '💖', '💌', '💞', '💘', '💝'],
    'humor': ['😂', '🤣', '😹', '😆', '😎', '🤡']
};

try {
    const rawData = fs.readFileSync(quotesPath, 'utf8');
    let quotes = JSON.parse(rawData);

    quotes = quotes.map(q => {
        const category = q.category?.toLowerCase() || 'sad';
        const categoryEmojis = emojis[category] || emojis['sad'];
        const alreadyHas = categoryEmojis.some(e => q.text.endsWith(e));
        if (!alreadyHas) {
            const randomEmoji = categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];
            q.text = `${q.text} ${randomEmoji}`;
        }
        return q;
    });

    fs.writeFileSync(quotesPath, JSON.stringify(quotes, null, 2), 'utf8');
    console.log(`Updated ${quotes.length} quotes with emojis.`);
} catch (err) { console.error('Error updating quotes:', err); }
