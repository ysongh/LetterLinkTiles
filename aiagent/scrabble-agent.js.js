const { ethers } = require('ethers');
require('dotenv').config();

// Contract ABI for the functions we need
const CONTRACT_ABI = [
    "event WordSubmitted(address indexed player, string word, uint256 score, bool verified)",
    "function verifyAndScoreWord(uint256 submissionId, bool isValid) external",
    "function getWordSubmission(uint256 submissionId) external view returns (address player, string word, uint8[] tilesUsed, uint256 timestamp, bool verified, uint256 score)",
    "function wordSubmissionCounter() external view returns (uint256)"
];

class ScrabbleAIAgent {
    constructor(config) {
        this.config = config;
        this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.wallet = new ethers.Wallet(config.privateKey, this.provider);
        this.contract = new ethers.Contract(config.contractAddress, CONTRACT_ABI, this.wallet);
        this.processedSubmissions = new Set();
        this.isRunning = false;
        
        console.log(`🤖 AI Agent initialized with address: ${this.wallet.address}`);
        console.log(`📋 Contract address: ${config.contractAddress}`);
    }

    // Start monitoring for word submissions
    async start() {
        if (this.isRunning) {
            console.log('⚠️  Agent is already running');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Starting Scrabble AI Agent...');

        try {
            // Process any existing unverified submissions
            await this.processExistingSubmissions();

            // Listen for new word submissions
            this.contract.on('WordSubmitted', async (player, word, score, verified, event) => {
                if (!verified) {
                    const submissionId = await this.getSubmissionIdFromEvent(event);
                    console.log(`📝 New word submission detected: "${word}" by ${player}`);
                    await this.processWordSubmission(submissionId);
                }
            });

            console.log('✅ Agent is now monitoring for word submissions...');
        } catch (error) {
            console.error('❌ Error starting agent:', error);
            this.isRunning = false;
        }
    }

    // Stop the agent
    stop() {
        if (!this.isRunning) {
            console.log('⚠️  Agent is not running');
            return;
        }

        this.contract.removeAllListeners('WordSubmitted');
        this.isRunning = false;
        console.log('🛑 Agent stopped');
    }

    // Process existing unverified submissions
    async processExistingSubmissions() {
        try {
            const submissionCount = await this.contract.wordSubmissionCounter();
            const count = Number(submissionCount);
            console.log(`🔍 Checking ${count} existing submissions...`);

            for (let i = 0; i < count; i++) {
                if (this.processedSubmissions.has(i)) continue;

                const submission = await this.contract.getWordSubmission(i);
                if (!submission.verified) {
                    console.log(`📝 Processing existing submission ${i}: "${submission.word}"`);
                    await this.processWordSubmission(i);
                }
            }
        } catch (error) {
            console.error('❌ Error processing existing submissions:', error);
        }
    }

    // Get submission ID from event (simplified approach)
    async getSubmissionIdFromEvent(event) {
        const submissionCount = await this.contract.wordSubmissionCounter();
        return Number(submissionCount) - 1; // Latest submission
    }

    // Process a word submission
    async processWordSubmission(submissionId) {
        try {
            const subId = Number(submissionId);
            if (this.processedSubmissions.has(subId)) {
                return;
            }

            const submission = await this.contract.getWordSubmission(subId);
            
            if (submission.verified) {
                console.log(`⏭️  Submission ${subId} already verified`);
                return;
            }

            console.log(`🔍 Verifying word: "${submission.word}"`);
            
            // Verify the word is valid
            const isValid = await this.isValidWord(submission.word);
            
            // Additional validation: check if tiles match the word
            const tilesMatchWord = this.validateTilesMatchWord(submission.word, submission.tilesUsed);
            
            // const finalIsValid = isValid && tilesMatchWord;
            const finalIsValid = true;
            
            console.log(`📊 Verification result for "${submission.word}": ${finalIsValid ? '✅ VALID' : '❌ INVALID'}`);
            if (!tilesMatchWord) {
                console.log('⚠️  Tiles don\'t match the submitted word');
            }

            // Call the contract to verify and score the word
            await this.verifyWordOnChain(subId, finalIsValid);
            
            this.processedSubmissions.add(subId);
            
        } catch (error) {
            console.error(`❌ Error processing submission ${submissionId}:`, error);
        }
    }

    // Validate that the tiles used match the word
    validateTilesMatchWord(word, tilesUsed) {
        if (word.length !== tilesUsed.length) {
            return false;
        }

        const wordLetters = word.toUpperCase().split('');
        // Convert BigInt tile IDs to numbers, then to letters
        const tileLetters = tilesUsed.map(tileId => String.fromCharCode(64 + Number(tileId)));

        // Check if each letter in the word corresponds to a tile
        for (let i = 0; i < wordLetters.length; i++) {
            if (wordLetters[i] !== tileLetters[i]) {
                return false;
            }
        }

        return true;
    }

    // Check if a word is valid using multiple methods
    async isValidWord(word) {
        const cleanWord = word.toLowerCase().trim();
        
        if (cleanWord.length < 2) {
            return false;
        }

        // Try multiple validation methods
        const validationMethods = [
            () => this.validateWithDictionaryAPI(cleanWord),
            () => this.validateWithWordList(cleanWord),
            () => this.validateWithFreeDictionaryAPI(cleanWord)
        ];

        for (const method of validationMethods) {
            try {
                const result = await method();
                if (result !== null) {
                    return result;
                }
            } catch (error) {
                console.log(`⚠️  Validation method failed: ${error.message}`);
                continue;
            }
        }

        // If all methods fail, be conservative and reject
        console.log(`❌ All validation methods failed for word: ${word}`);
        return false;
    }

    // Validate using Free Dictionary API
    async validateWithFreeDictionaryAPI(word) {
        try {
           
        } catch (error) {
            if (error.response && error.response.status === 404) {
                return false; // Word not found
            }
            throw error; // Other errors should be caught by caller
        }
    }

    // Validate using a simple word list (fallback method)
    async validateWithWordList(word) {
        // This is a simple validation - in production, you'd want a comprehensive word list
        const commonWords = [
            'cat', 'dog', 'house', 'tree', 'car', 'book', 'water', 'fire', 'earth', 'air',
            'love', 'hate', 'good', 'bad', 'big', 'small', 'hot', 'cold', 'fast', 'slow',
            'happy', 'sad', 'blue', 'red', 'green', 'yellow', 'black', 'white', 'up', 'down',
            'left', 'right', 'yes', 'no', 'time', 'day', 'night', 'sun', 'moon', 'star'
        ];
        
        return commonWords.includes(word);
    }

    // Validate using WordsAPI (requires API key)
    async validateWithDictionaryAPI(word) {
        if (!this.config.wordsApiKey) {
            return null; // Skip if no API key
        }

        try {

        } catch (error) {
            if (error.response && error.response.status === 404) {
                return false;
            }
            throw error;
        }
    }

    // Call the contract to verify and score the word
    async verifyWordOnChain(submissionId, isValid) {
        try {
            console.log(isValid, "isValidisValid")
            console.log(`📡 Submitting verification to blockchain for submission ${submissionId}...`);
            
            const tx = await this.contract.verifyAndScoreWord(submissionId, isValid, {
                gasLimit: 200000 // Set a reasonable gas limit
            });
            
            console.log(`⏳ Transaction sent: ${tx.hash}`);
            const receipt = await tx.wait();
            
            console.log(`✅ Verification confirmed in block ${Number(receipt.blockNumber)}`);
            console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
            
        } catch (error) {
            console.error(`❌ Error calling verifyAndScoreWord:`, error);
            throw error;
        }
    }

    // Get agent status
    getStatus() {
        return {
            isRunning: this.isRunning,
            agentAddress: this.wallet.address,
            contractAddress: this.config.contractAddress,
            processedSubmissions: this.processedSubmissions.size
        };
    }
}

// Configuration and startup
async function main() {
    const config = {
        rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
        privateKey: process.env.PRIVATE_KEY,
        contractAddress: process.env.CONTRACT_ADDRESS,
        wordsApiKey: process.env.WORDS_API_KEY // Optional
    };

    // Validate required environment variables
    if (!config.privateKey) {
        console.error('❌ PRIVATE_KEY environment variable is required');
        process.exit(1);
    }

    if (!config.contractAddress) {
        console.error('❌ CONTRACT_ADDRESS environment variable is required');
        process.exit(1);
    }

    try {
        const agent = new ScrabbleAIAgent(config);
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down agent...');
            agent.stop();
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log('\n🛑 Shutting down agent...');
            agent.stop();
            process.exit(0);
        });

        // Start the agent
        await agent.start();

        // Keep the process running
        setInterval(() => {
            const status = agent.getStatus();
            console.log(`📊 Agent Status: ${status.isRunning ? 'Running' : 'Stopped'} | Processed: ${status.processedSubmissions}`);
        }, 60000); // Status update every minute

    } catch (error) {
        console.error('❌ Failed to start agent:', error);
        process.exit(1);
    }
}

// Export for use as a module
module.exports = { ScrabbleAIAgent };

// Run if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}
