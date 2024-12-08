# Bitcoin On-Chain Loyalty Program

## Goal Description

Startups and early-stage founders often struggle to build a thriving ecosystem due to a lack of a unified platform that attracts and engages users effectively. Despite the crucial role of early adopters—such as the first 100, 1,000, 2,000, or 5,000 users—in fostering community growth, these loyal contributors often go under-recognized and under-incentivized.

To address this gap, Loyal.market emerges as a platform where users can actively participate in the growth of startups and collections by engaging in activities outlined by the founders. In return, their loyalty and contributions are rewarded with significant incentives in the form of liquidity tokens. These tokens are purpose-bound, creating a meaningful and spendable value ecosystem that empowers both users and startups to grow together.

The **Bitcoin On-Chain Loyalty Program, Loyal.Market** is a decentralized application (DApp) that rewards users for their engagement with various social media platforms (like Twitter, Discord, etc.) through blockchain transactions. By utilizing Bitcoin's OP_RETURN output, the program tracks users' actions on-chain, making their interactions immutable and verifiable. Users accumulate loyalty points for each interaction, which can later be redeemed for rewards such as airdrops or special incentives.

### Key Features:

- **User Actions Tracking**: Tracks user interactions with social media content (tweets, posts, comments, etc.).
- **On-Chain Storage**: Stores user actions in OP_RETURN outputs on the Bitcoin blockchain.
- **Loyalty Points**: Converts interactions into loyalty points that accumulate over time.
- **PSBT Transactions**: Utilizes Partially Signed Bitcoin Transactions (PSBT) for secure and transparent transaction handling.
- **Immutable Data**: Ensures transparency and security by storing data directly on the Bitcoin blockchain.

## Technical Details

### 1. **Blockchain Integration**

The program uses the **Bitcoin blockchain** to store user actions in **OP_RETURN** outputs. OP_RETURN allows us to store up to 80 bytes of data per transaction, making it ideal for embedding user action metadata.

We leverage sCrypt, built on Fractal Bitcoin, to create smart contracts that dynamically interact with deployed collection/startup contracts. Using a commit-and-reveal mechanism, the system ensures secure and transparent updates.

To enhance flexibility and security, the platform generates Partially Signed Bitcoin Transactions (PSBTs), allowing multiple parties to collaboratively sign and validate transactions before they are broadcasted to the network. Additionally, the implementation of OP_CAT enables the concatenation of multiple complex loyalty operations into a single streamlined process, ensuring efficiency in handling intricate transactions.

This approach combines advanced contract functionality with robust security measures, fostering trust and scalability for both startups and their loyal user communities.

#### How OP_RETURN Works:

- The OP_RETURN output stores a hash of the user action.
- This transaction is then broadcasted to the Bitcoin network, ensuring the interaction is immutable and publicly verifiable.

### 2. **Transaction Structure**

The transaction is structured as follows:

- **Inputs**: Refers to the previous unspent outputs.
- **Outputs**:
  - The first output is the **OP_RETURN** output, which contains the user’s action metadata.
  - The second output is the **change output**, returning any unused Bitcoin back to the sender.
  - The last output can represent the loyalty points awarded for the interaction.

### 3. **Hashing User Actions**

Each user action (like liking a tweet, commenting on a post) is hashed and stored on-chain. The hash is created by combining the following:

- **Platform Code** (e.g., Twitter, Discord)
- **Action Type** (like, comment, retweet)
- **Timestamp** (time of interaction)
- **Action ID** (e.g., tweet ID or post ID)

This metadata is then hashed, and the hash is stored in the OP_RETURN field.

### 4. **PSBT (Partially Signed Bitcoin Transaction)**

The system generates **PSBTs** (Partially Signed Bitcoin Transactions) for greater flexibility and security. The use of PSBT ensures that multiple parties can sign and validate a transaction before it's broadcasted to the network.

- **Advantages of PSBT**:
  - Provides security by ensuring that the transaction is valid before broadcasting.
  - Offers flexibility for multiple participants (e.g., wallets or services) to interact with the transaction.
  - Allows users to verify the transactions before committing them.

### 5. **Generating Loyalty Points**

Each interaction is assigned a set number of loyalty points. The points system is designed to reward more significant actions:

- **Like on Twitter** = 10 points
- **Retweet** = 20 points
- **Comment** = 15 points
- **Share on Discord** = 25 points

These points accumulate over time and can be redeemed for rewards (airdrops, tokens, etc.).

### 6. **Decoding Transactions**

To decode the user actions, the OP_RETURN field in a transaction is retrieved. The metadata stored in the OP_RETURN is then converted back into a human-readable format, revealing the user’s action (e.g., platform, action type, action ID, and timestamp).

### 7. **Loyalty Code**

Each transaction includes a special **loyalty code** (`777`) to identify it as part of the loyalty program. This code is appended to the metadata to ensure that the transaction is associated with the loyalty program.

### 8. **Platform Code for Actions**

Each platform is identified by a unique code in the metadata:

- **P** = Twitter
- **D** = Discord
- **R** = Reddit
- etc.

This helps quickly identify the platform where the interaction occurred.

### 9. **Integration with Social Media**

The application interacts with social media APIs to track user interactions:

- **Twitter**: Track likes, retweets, and comments via the Twitter API.
- **Discord**: Track comments and shares using a custom Discord bot.

These interactions are then processed and hashed, ready to be stored on the Bitcoin blockchain.

### 10. **Future Expansion**

Future improvements may include:

- **Support for Additional Platforms**: Adding support for more platforms like Reddit, Instagram, Facebook, etc.
- **Enhanced Reward Systems**: Integration with decentralized finance (DeFi) protocols or tokenized rewards.
- **Community Engagement**: Rewarding users for community-building activities or content creation.

## Conclusion

The **Bitcoin On-Chain Loyalty Program** provides a decentralized, transparent, and secure method for tracking and rewarding user interactions. By utilizing Bitcoin's blockchain and OP_RETURN outputs, the system ensures that all data is immutable and verifiable. The use of PSBTs guarantees secure, flexible transaction handling, and the loyalty points system offers valuable incentives for users.

---

## Installation Instructions

### Prerequisites:

- Node.js (>= v16)
- TypeScript (>= v4.5)
- bitcoin-lib-js (for Bitcoin transaction building)
- Bitcoin full node or an API provider (e.g., Blockchair, Mempool.space)

### Installation Steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/bitcoin-loyalty-program.git
   cd bitcoin-loyalty-program
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables for the Bitcoin node or API:
   ```
   export BITCOIN_API_URL=your-bitcoin-node-api-url
   ```
4. Build and run the application:
   ```
   npm run build
   npm start
   ```
