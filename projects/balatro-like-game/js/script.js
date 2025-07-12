document.addEventListener('DOMContentLoaded', () => {
    const handContainer = document.getElementById('hand-container');
    const deckCountSpan = document.getElementById('deck-count');
    const discardCountSpan = document.getElementById('discard-count');
    const scoreSpan = document.getElementById('score');
    const roundSpan = document.getElementById('round');
    const targetScoreSpan = document.getElementById('target-score');
    const playHandBtn = document.getElementById('play-hand-btn');
    const discardBtn = document.getElementById('discard-btn');
    const shopContainer = document.getElementById('shop-container');
    const boosterCardShop = document.getElementById('booster-card-shop');
    const continueGameBtn = document.getElementById('continue-game-btn');
    const lastHandTypeSpan = document.getElementById('last-hand-type');
    const lastScoreAddedSpan = document.getElementById('last-score-added');

    let deck = [];
    let hand = [];
    let discardPile = [];
    let selectedCards = [];
    let activeBoosters = [];

    const boosterCards = [
        {
            name: 'Lucky Charm',
            description: 'Adds 10 to hand score.',
            effect: (score) => score + 10
        },
        {
            name: 'Multiplier',
            description: 'Multiplies hand score by 1.5.',
            effect: (score) => score * 1.5
        },
        {
            name: 'High Roller',
            description: 'Adds 50 to Straight Flush score.',
            effect: (score, handType) => handType === 'Straight Flush' ? score + 50 : score
        },
        {
            name: 'Flush Bonus',
            description: 'Adds 20 to Flush score.',
            effect: (score, handType) => handType === 'Flush' ? score + 20 : score
        }
    ];

    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

    function createDeck() {
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({ suit, rank });
            }
        }
    }

    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function drawCards(num) {
        for (let i = 0; i < num; i++) {
            if (deck.length === 0) {
                // Reshuffle discard pile into deck
                deck = [...discardPile];
                discardPile = [];
                shuffleDeck();
            }
            if(deck.length > 0) {
                hand.push(deck.pop());
            }
        }
        updateUI();
    }

    function updateUI() {
        deckCountSpan.textContent = deck.length;
        discardCountSpan.textContent = discardPile.length;
        handContainer.innerHTML = '';
        hand.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.classList.add('card');
            cardEl.textContent = `${card.rank}${card.suit}`;
            if (card.suit === '♥' || card.suit === '♦') {
                cardEl.style.color = 'red';
            }
            cardEl.addEventListener('click', () => selectCard(card, cardEl));
            handContainer.appendChild(cardEl);
        });
    }

    function selectCard(card, cardEl) {
        const index = selectedCards.findIndex(c => c.rank === card.rank && c.suit === card.suit);
        if (index > -1) {
            selectedCards.splice(index, 1);
            cardEl.classList.remove('selected');
        } else {
            selectedCards.push(card);
            cardEl.classList.add('selected');
        }
    }

    function getRankValue(rank) {
        if (parseInt(rank)) return parseInt(rank);
        switch (rank) {
            case 'T': return 10;
            case 'J': return 11;
            case 'Q': return 12;
            case 'K': return 13;
            case 'A': return 14;
            default: return 0;
        }
    }

    function evaluateHand(cards) {
        if (cards.length < 5) return { type: 'Invalid Hand', score: 0 };

        const sortedCards = [...cards].sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank));
        const ranksCount = {};
        const suitsCount = {};
        const rankValues = sortedCards.map(card => getRankValue(card.rank));

        for (const card of sortedCards) {
            ranksCount[card.rank] = (ranksCount[card.rank] || 0) + 1;
            suitsCount[card.suit] = (suitsCount[card.suit] || 0) + 1;
        }

        const isFlush = Object.values(suitsCount).some(count => count >= 5);
        let isStraight = false;
        // Check for straight (including A-5 straight)
        for (let i = 0; i <= rankValues.length - 5; i++) {
            const slice = rankValues.slice(i, i + 5);
            const uniqueSlice = [...new Set(slice)];
            if (uniqueSlice.length === 5) {
                if (uniqueSlice[4] - uniqueSlice[0] === 4) {
                    isStraight = true;
                    break;
                }
                // Check for A-5 straight (A, 2, 3, 4, 5)
                if (uniqueSlice.includes(14) && uniqueSlice.includes(2) && uniqueSlice.includes(3) && uniqueSlice.includes(4) && uniqueSlice.includes(5)) {
                    isStraight = true;
                    break;
                }
            }
        }


        const pairs = Object.values(ranksCount).filter(count => count === 2).length;
        const threes = Object.values(ranksCount).filter(count => count === 3).length;
        const fours = Object.values(ranksCount).filter(count => count === 4).length;

        let handType = 'High Card';
        let score = 0;

        if (isStraight && isFlush) {
            if (rankValues.includes(14) && rankValues.includes(13) && rankValues.includes(12) && rankValues.includes(11) && rankValues.includes(10)) {
                handType = 'Royal Flush';
                score = 1000;
            } else {
                handType = 'Straight Flush';
                score = 500;
            }
        } else if (fours === 1) {
            handType = 'Four of a Kind';
            score = 250;
        } else if (threes === 1 && pairs === 1) {
            handType = 'Full House';
            score = 150;
        } else if (isFlush) {
            handType = 'Flush';
            score = 100;
        } else if (isStraight) {
            handType = 'Straight';
            score = 75;
        } else if (threes === 1) {
            handType = 'Three of a Kind';
            score = 50;
        } else if (pairs === 2) {
            handType = 'Two Pair';
            score = 25;
        } else if (pairs === 1) {
            handType = 'One Pair';
            score = 10;
        } else {
            // High Card - score based on highest card
            score = rankValues[rankValues.length - 1];
        }

        let finalScore = score;
        for (const booster of activeBoosters) {
            finalScore = booster.effect(finalScore, handType);
        }

        return { type: handType, score: finalScore };
    }

    function showShop() {
        shopContainer.style.display = 'block';
        document.getElementById('game-container').style.display = 'none';
        boosterCardShop.innerHTML = '';

        // Offer 3 random boosters
        const offeredBoosters = [];
        while (offeredBoosters.length < 3) {
            const randomBooster = boosterCards[Math.floor(Math.random() * boosterCards.length)];
            if (!offeredBoosters.includes(randomBooster)) {
                offeredBoosters.push(randomBooster);
            }
        }

        offeredBoosters.forEach(booster => {
            const boosterEl = document.createElement('div');
            boosterEl.classList.add('card'); // Reusing card styling for boosters
            boosterEl.innerHTML = `<h3>${booster.name}</h3><p>${booster.description}</p>`;
            boosterEl.addEventListener('click', () => buyBooster(booster));
            boosterCardShop.appendChild(boosterEl);
        });
    }

    function hideShop() {
        shopContainer.style.display = 'none';
        document.getElementById('game-container').style.display = 'grid';
    }

    function buyBooster(booster) {
        activeBoosters.push(booster);
        console.log(`Bought ${booster.name}. Active Boosters:`, activeBoosters);
        hideShop(); // Close shop after buying one for simplicity
        // In a real game, you'd have currency and a more complex shop interaction
    }

    continueGameBtn.addEventListener('click', () => {
        hideShop();
        // Reset for next round or continue game
    });

    let currentScore = 0;
    let currentRound = 1;
    let targetScore = 100;

    function updateGameInfo() {
        scoreSpan.textContent = currentScore;
        roundSpan.textContent = currentRound;
        targetScoreSpan.textContent = targetScore;
    }

    function startGame() {
        createDeck();
        shuffleDeck();
        drawCards(8); // Start with 8 cards in hand
        updateGameInfo();
    }

    playHandBtn.addEventListener('click', () => {
        if (selectedCards.length !== 5) {
            alert('Please select exactly 5 cards to play a hand.');
            return;
        }
        const { type, score } = evaluateHand(selectedCards);
        console.log(`Played: ${type} for ${score} points`);
        currentScore += score;
        lastHandTypeSpan.textContent = type;
        lastScoreAddedSpan.textContent = score;
        updateGameInfo();

        // Add selected cards to discard pile
        discardPile.push(...selectedCards);
        // Remove selected cards from hand
        hand = hand.filter(card => !selectedCards.find(c => c.rank === card.rank && c.suit === card.suit));
        selectedCards = [];
        drawCards(8 - hand.length); // Draw back up to 8 cards

        if (currentScore >= targetScore) {
            console.log('Round complete!');
            currentRound++;
            targetScore += 100; // Increase target score for next round
            currentScore = 0; // Reset score for next round
            updateGameInfo();
            showShop();
        }
    });

    discardBtn.addEventListener('click', () => {
        if (selectedCards.length < 1) {
            console.log('Please select at least one card to discard.');
            return;
        }
        console.log('Discarding:', selectedCards);
        // Add selected cards to discard pile
        discardPile.push(...selectedCards);
        // Remove selected cards from hand
        hand = hand.filter(card => !selectedCards.find(c => c.rank === card.rank && c.suit === card.suit));
        selectedCards = [];
        drawCards(8 - hand.length); // Draw back up to 8 cards
    });

    startGame();
});