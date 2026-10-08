# EarthChain ECTEST — two-device start guide

This is a valueless test exchange. It has no redemption, no monetary value, and no real network settlement.

## iPhone setup

Open the approved HTTPS page in Safari, tap **Share → Add to Home Screen**, then launch EarthChain from the new icon. Keep the page installed on both phones. Safari’s Share sheet can send the public proposal/receipt file directly to your friend; the app never asks for a private key or password.

## Before you begin

- Use the same approved HTTPS static page on two separate devices or browser profiles.
- Never paste a seed phrase, private key, wallet password, or encrypted backup into chat.
- Each person creates and protects their own wallet locally.
- Exchange only the public `ec_...` receiving address and the public session files.

## Exchange sequence

1. Both people open `no-server.html` and create a fresh wallet with a unique 16+ character password.
2. Each downloads the encrypted backup, stores it privately, locks the wallet, and tests local recovery.
3. Compare the two public addresses and the full `EARTHCHAIN_TEST_...` network identifier through a trusted channel.
4. Choose one shared public journal file. The owner proposes the 100-point faucet allocation and sends the public proposal file to the friend.
5. The friend imports the proposal, verifies the amount, recipient, network, and previous head, then signs the proposal locally and returns the public signed file.
6. The owner imports the co-signed allocation and verifies the opening balance.
7. The owner proposes 5 ECTEST to the friend's verified address, signs locally, and sends the public proposal file.
8. The friend independently verifies and signs it, then returns the signed file. Both import the resulting journal.
9. The friend proposes 2 ECTEST back, following the same review and signing process.
10. Both export the final public journal/checkpoint and compare the entry count, head hash, addresses, balances, and zero fee.

Expected balances after the round trip are 97 ECTEST for the owner and 3 ECTEST for the friend, assuming only the owner used the 100-point faucet allocation.

## Stop conditions

Stop if the network identifier, participant addresses, previous head, amount, recipient, or entry count differs between devices. Do not retry a timed-out submission until history has been inspected; a signed action may already have been accepted.

The final evidence proves mutually signed arithmetic and replay protection. It does not prove distributed consensus, validator operation, monetary value, or human identity.
