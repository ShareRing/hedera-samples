# Hedera Samples

Code samples to showcase Hedera integration, particularly how to request data from end-user with ShareRing Link and how to do some verifications against on-chain data.

The samples run on `testenv` in conjunction with a special test build.

## Backend

The backend server consists of a couple APIs:

`GET /sessions/:sessionId` to get data of a particular session.

`POST /sessions/webhook` acts as a webhook, capturing data shared from user. This must be set as `endpoint` in ShareRing Link dashboard.

> **Important!** The backend server is built on top of [Ts.ED](https://tsed.io/getting-started/) framework and requires Node >= 14, Express >= 4 and TypeScript >= 4.

Create an `.env` file following the `.env.example`:

```
PORT=8084
ONGO_URL=<mongodb connection string>
HEDERA_DID_CONTRACT_ADDRESS=<the DID contract address on hedera in 0x format>
HEDERA_OPERATOR_PRIVATE_KEY=<the operator private key in 0x format>
HEDERA_RELAY_API_ENDPOINT=<relayer endpoint e.g. https://testnet.hashio.io/api>
```

The verifications are done using [`ethers.js`](https://docs.ethers.org/v6/) on the backend (or so called the web3 way).

See `providers/hedera/services/HederaService.ts` for all sample codes to perform the verifications.

## Frontend

Frontend is a simple React webapp, bootstrapped with [Create React App](https://github.com/facebook/create-react-app). It does mainly two things:

One, generates a ShareRing Link QR code with some parameters.

Two, makes call to the backend API to get and display session data and verification results.

## Create ShareRing Link query

1. Get a subscription on ShareRing Link (testenv)
2. Create an endpoint pointing to the backend server `/sessions/webhook`. Can use the free [Webhook.site](https://webhook.site) and use [`whcli`](https://docs.webhook.site/cli.html) to receive data and forward to localhost.
3. Create a query, select the endpoint created above. Query must request the following information for verification purposes:

- `ShareLedger_Address`
- `Matic_Address` - this is the ethereum addess generated from the same seedphrase
- `VCT token ID` - the DID
- other information such as `name`, `date_of_birth`, etc.

## Run the servers

The repo uses `yarn` as package manager. Install it first. At root directory:

```sh
# install dependencies
$ yarn install

# start backend
$ yarn start:backend

# start frontend
$ yarn start:frontend
```

By default, the backend runs on port `:8084`, and the frontend `:3000`.
