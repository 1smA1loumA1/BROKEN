const QUOTES_URL = 'data/quotes.json';
const STORAGE_KEY = 'motivation_favorites';

const quoteTextEl = document.getElementById('quote-text');
const quoteAuthorEl = document.getElementById('quote-author');
const quoteContainer = document.getElementById('quote-container');
const newQuoteBtn = document.getElementById('new-quote-btn');
const categoryBtns = document.querySelectorAll('.category-btn');
const currentCategoryLabel = document.getElementById('current-category-label');
const favoriteBtn = document.getElementById('favorite-btn');
const favoriteIcon = document.getElementById('favorite-icon');
const showFavoritesBtn = document.getElementById('show-favorites-btn');
const closeFavoritesBtn = document.getElementById('close-favorites-btn');
const favoritesModal = document.getElementById('favorites-modal');
const favoritesList = document.getElementById('favorites-list');
const clearFavoritesBtn = document.getElementById('clear-favorites-btn');

let allQuotes = [];
let currentCategory = 'all';
let currentQuote = null;
let favorites = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    setupEventListeners();
    updateFavoriteIconState();
});

async function loadQuotes() {
    try {
        const response = await fetch(QUOTES_URL);
        if (!response.ok) throw new Error('Failed to load quotes');
        allQuotes = await response.json();
        showRandomQuote();
    } catch (error) {
        console.error(error);
        quoteTextEl.textContent = "Sometimes silence is the best answer...";
        quoteAuthorEl.textContent = "System Error";
    }
}

function setupEventListeners() {
    newQuoteBtn.addEventListener('click', () => {
        newQuoteBtn.classList.add('rotate-3');
        setTimeout(() => newQuoteBtn.classList.remove('rotate-3'), 200);
        showRandomQuote();
    });

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => {
                b.classList.remove('text-white', 'border-neutral-600', 'bg-neutral-800');
                b.classList.add('text-muted', 'border-neutral-800');
            });
            e.target.classList.remove('text-muted', 'border-neutral-800');
            e.target.classList.add('text-white', 'border-neutral-600', 'bg-neutral-800');

            currentCategory = e.target.dataset.category;
            currentCategoryLabel.textContent = currentCategory;
            showRandomQuote();
        });
    });

    favoriteBtn.addEventListener('click', toggleFavorite);
    showFavoritesBtn.addEventListener('click', openFavorites);
    closeFavoritesBtn.addEventListener('click', closeFavorites);
    favoritesModal.addEventListener('click', (e) => { if (e.target === favoritesModal) closeFavorites(); });
    clearFavoritesBtn.addEventListener('click', () => {
        if (confirm('Clear all favorites?')) {
            favorites = [];
            saveFavorites();
            renderFavoritesList();
            updateFavoriteIconState();
        }
    });
}

function getFilteredQuotes() {
    if (currentCategory === 'all') return allQuotes;
    return allQuotes.filter(q => q.category === currentCategory);
}

function getQuoteById(id) {
    return allQuotes.find(q => q.id === id);
}

function showRandomQuote() {
    const filtered = getFilteredQuotes();
    if (filtered.length === 0) {
        quoteTextEl.textContent = "No quotes found for this category.";
        quoteAuthorEl.textContent = "";
        return;
    }

    let nextQuote;
    do { nextQuote = filtered[Math.floor(Math.random() * filtered.length)]; }
    while (filtered.length > 1 && nextQuote === currentQuote);

    currentQuote = nextQuote;

    quoteContainer.classList.remove('blur-in-expand', 'animate-pop-in');
    quoteContainer.style.opacity = '0';
    quoteContainer.style.transform = 'translateY(10px) scale(0.98)';

    setTimeout(() => {
        renderQuote(currentQuote);
        quoteContainer.style.opacity = '1';
        quoteContainer.style.transform = 'translateY(0) scale(1)';

        void quoteContainer.offsetWidth;
        if (currentQuote.category === 'motivation') quoteContainer.classList.add('animate-pop-in');
        else quoteContainer.classList.add('blur-in-expand');

        updateFavoriteIconState();
    }, 200);
}

function renderQuote(quote) {
    quoteTextEl.textContent = `"${quote.text}"`;
    quoteAuthorEl.textContent = `— ${quote.author}`;
}

// Favorites Logic
function toggleFavorite() {
    if (!currentQuote) return;
    const index = favorites.findIndex(f => f.id === currentQuote.id);
    if (index === -1) { favorites.push(currentQuote); animateHeart(); }
    else { favorites.splice(index, 1); }
    saveFavorites();
    updateFavoriteIconState();
    if (!favoritesModal.classList.contains('pointer-events-none')) renderFavoritesList();
}

function saveFavorites() { localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)); }

function updateFavoriteIconState() {
    if (!currentQuote) return;
    const isFav = favorites.some(f => f.id === currentQuote.id);
    favoriteIcon.classList.toggle('fill-current', isFav);
    favoriteIcon.classList.toggle('text-red-500', isFav);
    favoriteIcon.classList.toggle('stroke-red-500', isFav);
}

function animateHeart() {
    favoriteBtn.classList.add('scale-125');
    setTimeout(() => favoriteBtn.classList.remove('scale-125'), 200);
}

// Modal
function openFavorites() {
    renderFavoritesList();
    favoritesModal.classList.remove('opacity-0', 'pointer-events-none');
    favoritesModal.querySelector('#favorites-content').classList.remove('scale-95');
    favoritesModal.querySelector('#favorites-content').classList.add('scale-100');
}
function closeFavorites() {
    favoritesModal.classList.add('opacity-0', 'pointer-events-none');
    favoritesModal.querySelector('#favorites-content').classList.remove('scale-100');
    favoritesModal.querySelector('#favorites-content').classList.add('scale-95');
}
function renderFavoritesList() {
    favoritesList.innerHTML = '';
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="text-center text-muted text-sm mt-10">No favorites yet.</p>';
        return;
    }
    favorites.slice().reverse().forEach(quote => {
        const item = document.createElement('div');
        item.className = 'p-4 bg-neutral-900/50 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors group relative';
        item.innerHTML = `
            <p class="text-amber-50/90 font-serif italic text-lg mb-2">"${quote.text}"</p>
            <div class="flex justify-between items-center">
                <span class="text-xs text-muted uppercase tracking-wider">— ${quote.author}</span>
                <span class="text-[10px] px-2 py-1 rounded bg-neutral-800 text-neutral-500 uppercase">${quote.category}</span>
            </div>
            <button class="delete-fav-btn absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-500 transition-all p-1" aria-label="Remove">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;
        item.querySelector('.delete-fav-btn').addEventListener('click', (e) => { e.stopPropagation(); removeFromFavorites(quote.id); });
        favoritesList.appendChild(item);
    });
}
function removeFromFavorites(id) {
    favorites = favorites.filter(f => f.id !== id);
    saveFavorites();
    renderFavoritesList();
    updateFavoriteIconState();
}
