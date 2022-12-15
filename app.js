const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const SLOT_DELAY_MS = 100;
const ANIMATION_DURATION_MS = 200;
const ANIMATION_REPETITIONS = 5;

const STARTING_PLAER_TOKENS = 10;

class SlotMachine {
    constructor(slots, lever, tokenDisplay, gameOverScreen, startingTokens) {
        this.slots = slots;
        this.lever = lever;
        this.tokenDisplay = tokenDisplay;
        this.gameOverScreen = gameOverScreen;
        this.playerTokens = startingTokens;

        this.lever.addEventListener("click", this.pullLever.bind(this));

        this.tokenDisplay.innerText = this.playerTokens;

        this.gameOverScreen.style.display = 'none';

        this.outcomes = [
            { value: '🍒', probability: 6, prize: 5 },
            { value: '🍋', probability: 4, prize: 10 },
            { value: '🍑', probability: 3, prize: 25 },
            { value: '🍐', probability: 2, prize: 50 },
            { value: '🥝', probability: 1, prize: 100 }
        ];

        this.forEachSlot(slot => {
            slot.innerText = this.outcomes[0].value
        });

        this.totalProbability = this.outcomes.reduce((sum, outcome) => sum + outcome.probability, 0);

        this.calculateProbabilities();
    }

    // Select a random outcome based on its probability
    getOutcome() {
        let randomNumber = Math.random() * this.totalProbability;
        let currentProbability = 0;

        for (let outcome of this.outcomes) {
            currentProbability += outcome.probability;
            if (randomNumber <= currentProbability) {
                return outcome.value;
            }
        }
    }

    // Updates player token count
    updatePlayerTokens(add = null) {
        // Add tokens
        if (add !== null) {
            this.playerTokens += parseInt(add);
            this.tokenDisplay.innerText = this.playerTokens;
            if (this.playerTokens > 0) {
                this.lever.disabled = false;
            }
        }
        // Remove token
        else {
            if (this.playerTokens <= 0) {
                return false;
            } else {
                this.playerTokens--;
                this.tokenDisplay.innerText = this.playerTokens;
                return true;
            }
        }
    }

    // Run a function for each slot with a delay
    forEachSlot(fun) {
        this.slots.forEach((slot, index) => {
            setTimeout(() => {
                fun(slot);
            }, SLOT_DELAY_MS * index);
        });
    }

    pullLever() {
        // Check if player can spin the reels
        if (!this.updatePlayerTokens()) {
            return;
        }

        this.lever.disabled = true;

        // Start the initial animation
        this.forEachSlot(slot => {
            slot.classList.add("animate");
        });

        // Update the outcome of each slot regularly
        const interval = setInterval(() => {
            this.forEachSlot(slot => {
                slot.innerText = this.getOutcome();
            });
        }, ANIMATION_DURATION_MS);

        // Start the final animation
        setTimeout(() => {
            this.forEachSlot(slot => {
                slot.classList.remove("animate");
                slot.classList.add("animate-final");
            });
        }, ANIMATION_DURATION_MS * (ANIMATION_REPETITIONS - 1));

        // Stop the animation
        setTimeout(() => {
            clearInterval(interval);

            this.forEachSlot(slot => {
                slot.classList.remove("animate-final");
            });
        }, ANIMATION_DURATION_MS * ANIMATION_REPETITIONS)

        // Get the final outcome
        setTimeout(() => {
            this.getScore();

            if (this.playerTokens > 0) {
                this.lever.disabled = false;
            }
        }, ANIMATION_DURATION_MS * ANIMATION_REPETITIONS + SLOT_DELAY_MS * (this.slots.length - 1))
    }

    getScore() {
        const outcome = Array.from(this.slots).map(slot => slot.innerText);
        // Check if win
        if (outcome.every(element => element === outcome[0])) {
            // Get item
            const item = this.outcomes.find(i => i.value === outcome[0]);
            // Update token count
            this.updatePlayerTokens(item.prize);
        }
        // Check if game lost
        if (this.playerTokens === 0) {
            this.gameOverScreen.style.display = 'flex';
        }
    }

    // Console log probabilities of all outcomes
    calculateProbabilities() {
        let probabilities = [];
        this.outcomes.forEach(element => {
            const probability = Math.pow(element.probability / this.totalProbability, this.slots.length - 1)
            probabilities.push({value: element.value, probability: `${Math.round(probability * 1000) / 10}%`});
        });
        console.table(probabilities);
    }
}

const slotMachine = new SlotMachine(
    slots = $$('[data-slot]'),
    lever = $("#lever"),
    display = $('#score'),
    gameOverScreen = $('#game-over'),
    startingTokens = STARTING_PLAER_TOKENS
);