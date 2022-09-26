<h1 align="center"> Self-Description-Signer</h1>

- [How To Use](#how-to-use)
- [How it Works](#how-it-works)

## How To Use

1. Update the self description in `self-description.json`, replace it with your own. See details in the [Architecture Document](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/participant/)
2. Create a new `.env` file in the `/config` directory with `PRIVATE_KEY`, `CERTIFICATE`, `VERIFICATION_METHOD` and `X5U_URL` as properties. Feel free to use the example file `example.env` located in the `/config` directory. You could quickly copy the file with the following command:
```sh
cp config/example.env config/.env
```
Make sure to provide your own values for the above mentioned properties in the newly created `.env` file.

3. Install dependencies `npm i` and execute the script `node index.js` (node@16 or higher required).
   - Alternatively, the script can be run with docker
     1. Build the container with `docker build -t self-description-signer .`
     2. Run the script with `docker run -it --mount src="$(pwd)/config",target=/usr/src/app/config,type=bind self-description-signer`
4. The given self description will be locally signed and a new file containing self description + proof called `{timestamp}_self-signed_{gx-type}.json` will be created.

   **Example self-signed Self Description:**

   ```json
   {
     "selfDescriptionCredential": {
       "@context": [
         "https://www.w3.org/2018/credentials/v1",
         "https://registry.gaia-x.eu/v2206/api/shape"
       ],
       "type": ["VerifiableCredential", "LegalPerson"],
       "id": "https://compliance.gaia-x.eu/.well-known/participant.json",
       "issuer": "did:web:compliance.gaia-x.eu",
       "issuanceDate": "2022-09-23T23:23:23.235Z",
       "credentialSubject": {
         "id": "did:web:compliance.gaia-x.eu",
         "gx-participant:name": "Gaia-X AISBL",
         "gx-participant:legalName": "Gaia-X European Association for Data and Cloud AISBL",
         "gx-participant:registrationNumber": {
           "gx-participant:registrationNumberType": "local",
           "gx-participant:registrationNumberNumber": "0762747721"
         },
         "gx-participant:headquarterAddress": {
           "gx-participant:addressCountryCode": "BE",
           "gx-participant:addressCode": "BE-BRU",
           "gx-participant:street-address": "Avenue des Arts 6-9",
           "gx-participant:postal-code": "1210"
         },
         "gx-participant:legalAddress": {
           "gx-participant:addressCountryCode": "BE",
           "gx-participant:addressCode": "BE-BRU",
           "gx-participant:street-address": "Avenue des Arts 6-9",
           "gx-participant:postal-code": "1210"
         },
         "gx-participant:termsAndConditions": "70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700"
       },
       "proof": {
         "type": "JsonWebSignature2020",
         "created": "2022-09-25T22:28:48.408Z",
         "proofPurpose": "assertionMethod",
         "verificationMethod": "did:web:compliance.gaia-x.eu",
         "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..GpHT0twTcvRG11eH8YdGTzTgYf6jZYH2VncPIzOPnYaoRIB1tdYDHI0H8S1wU81ll-sYdDepWP5fbTN-ah_6SbD2J_QaCBt22hKtSrWumST6gaBXN_sntASwdnLaYmauNoePRDh-mZapjc40a4ckHVasaxgJ6NrnLhoUCDH33IGjWn5tC3qtntxhUpgiyCgxZvsDTmzoY4JdEp-9lG_xdFJOpUSIzEbuGYXa_Gmc0qmODELiZH7G9-AxmYh69vOopaQEAzUGrHcoHRtNN0iM8DcwmmZoWdGW5v_4qqnQvjB6bncHwFknC-L7UYV62uezA8HiS2T_9zrCiQW6U-GTAg"
       }
     }
   }
   ```

5. In addition, a `did.json` will be created based on the provided `CERTIFICATE` and `VERIFICATION_METHOD`

   **Example `did.json`:**

   ```json
   {
     "@context": ["https://www.w3.org/ns/did/v1"],
     "id": "did:web:compliance.gaia-x.eu",
     "verificationMethod": [
       {
         "@context": "https://w3c-ccg.github.io/lds-jws2020/contexts/v1/",
         "id": "did:web:compliance.gaia-x.eu",
         "type": "JsonWebKey2020",
         "controller": "did:web:compliance.gaia-x.eu#JWK2020-RSA",
         "publicKeyJwk": {
           "kty": "RSA",
           "n": "ulmXEa0nehbR338h6QaWLjMqfXE7mKA9PXoC_6_8d26xKQuBKAXa5k0uHhzQfNlAlxO-IpCDgf9cVzxIP-tkkefsjrXc8uvkdKNK6TY9kUxgUnOviiOLpHe88FB5dMTH6KUUGkjiPfq3P0F9fXHDEoQkGSpWui7eD897qSEdXFre_086ns3I8hSVCxoxlW9guXa_sRISIawCKT4UA3ZUKYyjtu0xRy7mRxNFh2wH0iSTQfqf4DWUUThX3S-jeRCRxqOGQdQlZoHym2pynJ1IYiiIOMO9L2IQrQl35kx94LGHiF8r8CRpLrgYXTVd9U17-nglrUmJmryECxW-555ppQ",
           "e": "AQAB",
           "alg": "PS256",
           "x5u": "https://compliance.gaia-x.eu/.well-known/x509CertificateChain.pem"
         }
       }
     ],
     "assertionMethod": ["did:web:compliance.gaia-x.eu#JWK2020-RSA"]
   }
   ```

6. Upload this did.json to your domain (e.g. `https://your_domain.com/.well-known/did.json`).

7. After uploading the did.json(important) re-run the script and finally, the compliance service compliance service is used to sign the locally signed self description. It signs it if the final result is successfully verified against the compliance service. The result is stored in a new file called `{timestamp}_complete_{gx-type}.json`

   **Complete Self-Description signed by the Compliance Service:**

   ```json
   {
     "selfDescriptionCredential": {
       "@context": [
         "https://www.w3.org/2018/credentials/v1",
         "https://registry.gaia-x.eu/v2206/api/shape"
       ],
       "type": ["VerifiableCredential", "LegalPerson"],
       "id": "https://compliance.gaia-x.eu/.well-known/participant.json",
       "issuer": "did:web:compliance.gaia-x.eu",
       "issuanceDate": "2022-09-23T23:23:23.235Z",
       "credentialSubject": {
         "id": "did:web:compliance.gaia-x.eu",
         "gx-participant:name": "Gaia-X AISBL",
         "gx-participant:legalName": "Gaia-X European Association for Data and Cloud AISBL",
         "gx-participant:registrationNumber": {
           "gx-participant:registrationNumberType": "local",
           "gx-participant:registrationNumberNumber": "0762747721"
         },
         "gx-participant:headquarterAddress": {
           "gx-participant:addressCountryCode": "BE",
           "gx-participant:addressCode": "BE-BRU",
           "gx-participant:street-address": "Avenue des Arts 6-9",
           "gx-participant:postal-code": "1210"
         },
         "gx-participant:legalAddress": {
           "gx-participant:addressCountryCode": "BE",
           "gx-participant:addressCode": "BE-BRU",
           "gx-participant:street-address": "Avenue des Arts 6-9",
           "gx-participant:postal-code": "1210"
         },
         "gx-participant:termsAndConditions": "70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700"
       },
       "proof": {
         "type": "JsonWebSignature2020",
         "created": "2022-09-25T22:28:48.408Z",
         "proofPurpose": "assertionMethod",
         "verificationMethod": "did:web:compliance.gaia-x.eu",
         "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..GpHT0twTcvRG11eH8YdGTzTgYf6jZYH2VncPIzOPnYaoRIB1tdYDHI0H8S1wU81ll-sYdDepWP5fbTN-ah_6SbD2J_QaCBt22hKtSrWumST6gaBXN_sntASwdnLaYmauNoePRDh-mZapjc40a4ckHVasaxgJ6NrnLhoUCDH33IGjWn5tC3qtntxhUpgiyCgxZvsDTmzoY4JdEp-9lG_xdFJOpUSIzEbuGYXa_Gmc0qmODELiZH7G9-AxmYh69vOopaQEAzUGrHcoHRtNN0iM8DcwmmZoWdGW5v_4qqnQvjB6bncHwFknC-L7UYV62uezA8HiS2T_9zrCiQW6U-GTAg"
       }
     },
     "complianceCredential": {
       "@context": ["https://www.w3.org/2018/credentials/v1"],
       "type": ["VerifiableCredential", "ParticipantCredential"],
       "id": "https://catalogue.gaia-x.eu/credentials/ParticipantCredential/1664144933260",
       "issuer": "did:web:compliance.gaia-x.eu",
       "issuanceDate": "2022-09-25T22:28:53.260Z",
       "credentialSubject": {
         "id": "did:web:compliance.gaia-x.eu",
         "hash": "44166d1e997147db7fcbb3a8d201af9bf830a291b1e8837954017f5440785ede"
       },
       "proof": {
         "type": "JsonWebSignature2020",
         "created": "2022-09-25T22:28:53.260Z",
         "proofPurpose": "assertionMethod",
         "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..s4rOWCaRZ9Ycc1N85vMo2PnHQJVGNM2xNVW2L1VksGzL8I3NQbZWpppwq1eGfbLGGGs0vS4IO-LpuVpCtJpnjdW98nmgxk1zugG-Y9sYqCk79mFDFNIdzMCYrl9IZU4jiOKzttd_5lkQdsPihJ7up4vuTiRfExK7CllMvEx8YIREPya_OxhpTy8JbRWfUXgJyxrRpCI1KWyp1ldRuiO0ApRVk_VGUWqCCrOAxnIBTIXuTdfd3xPjGVcG6HuKJ4I819WHCvG_fm1L6PrKYx4JTr9w9OzO0eGXPw4s8oMshJVS4kI39rcY5cLaf7b6sehLgJXGZkY1_zNM2EmSy1zj4w",
         "verificationMethod": "did:web:compliance.gaia-x.eu"
       }
     }
   }
   ```

## How it Works

1. The given Self Description is canonized with [URDNA2015](https://json-ld.github.io/rdf-dataset-canonicalization/spec/)
2. Next the canonized output is hashed with [SHA256](https://json-ld.github.io/rdf-dataset-canonicalization/spec/#dfn-hash-algorithm).
3. That hash is then signed with the given private key and the proof is created using [JsonWebKey2020](https://w3c-ccg.github.io/lds-jws2020/#json-web-signature-2020).
