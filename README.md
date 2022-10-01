<h1 align="center"> Self-Description-Signer</h1>

- [How To Use](#how-to-use)
- [How it Works](#how-it-works)

## How To Use

1. Update the self description in `self-description.json`, replace it with your own. See details in the [Architecture Document](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/participant/)
2. Create a new `.env` file in the `/config` directory with `PRIVATE_KEY`, `CERTIFICATE`, `CONTROLLER`, `VERIFICATION_METHOD` and `X5U_URL` as properties. Feel free to use the example file `example.env` located in the `/config` directory. You could quickly copy the file with the following command:

   ```sh
   cp config/example.env config/.env
   ```

   Make sure to provide your own values for the above mentioned properties in the newly created `.env` file.

   **IMPORTANT:** You need to create your own `CERTIFICATE` and `PRIVATE_KEY` and put it into the created `/config/.env` file. This certificate needs to be issued by a Gaia-X endorsed trust anchor. You can find the list of endorsed trust anchors here: https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/trust_anchors/

   **NOTE:** It is not sufficient to simply create create a new local key pair which is not issued by a trust anchor because verification will fail and the trust servcie won't sign your Self Description!

   > You can find more information on setting up your own certificate here:
   >
   > - https://gitlab.com/gaia-x/lab/compliance/gx-compliance#how-to-setup-certificates

   `X5U_URL` - You need to generate a `.pem` file with the certificate chain of your certificate and upload it to your server (make it accessible via URI). You can find an example here: https://www.delta-dao.com/.well-known/x509CertificateChain.pem

   You can use [whatsmychaincert.com](https://whatsmychaincert.com/) as a helper tool to generate your certificate chain using metadata from your certificate. Make sure to check "Include Root Certificate" checkbox.

   `VERIFICATION_METHOD` - The `did:web` has to resolve to the path of your `did.json`. It defaults to `your-domain.com/.well-known/did.json` if you enter `did:web:your-domain.com`. You can also specify a specific path, check the `did:web` [specifications](https://w3c-ccg.github.io/did-method-web/#optional-path-considerations) for this.

   > More info on x5u: https://www.rfc-editor.org/rfc/rfc7517#section-4.6

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
        "type": [
            "VerifiableCredential",
            "LegalPerson"
        ],
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
                "gx-participant:streetAddress": "Avenue des Arts 6-9",
                "gx-participant:postalCode": "1210"
            },
            "gx-participant:legalAddress": {
                "gx-participant:addressCountryCode": "BE",
                "gx-participant:addressCode": "BE-BRU",
                "gx-participant:streetAddress": "Avenue des Arts 6-9",
                "gx-participant:postalCode": "1210"
            },
            "gx-participant:termsAndConditions": "70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700"
        },
        "proof": {
            "type": "JsonWebSignature2020",
            "created": "2022-10-01T13:02:09.771Z",
            "proofPurpose": "assertionMethod",
            "verificationMethod": "did:web:compliance.gaia-x.eu",
            "jws": "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..XQqRvvuxW1xHUy_eRzOk4LwyjwlRofg0JBiO0nrWGHAjwMA87OVJ37mB6GylgEttEaUjXQV-QmbGfEnE-YQf5S7B-id9Lld-CC-vW8M-2EvXh3oQp3l5W35mvvdVQXBj16LLskQZpfZGRHM0hn7zGEw24fDc_tLaGoNR9LQ6UzmSrHMwFFVWz6XH3RoG-UY0aZDpnAxjpWxUWaa_Jzf65bfNlx2EdSv3kIKKYJLUlQTk0meuFDD23VrkGStQTGQ8GijY3BNo6QWw889tt5YKWtiSZjbDYYHsVCwMzPoKT0hVJ1wy2ve6pJ4MSYfhiMxoDq6YBOm-oYKYfBeN22fjqQ"
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
           "gx-participant:streetAddress": "Avenue des Arts 6-9",
           "gx-participant:postalCode": "1210"
         },
         "gx-participant:legalAddress": {
           "gx-participant:addressCountryCode": "BE",
           "gx-participant:addressCode": "BE-BRU",
           "gx-participant:streetAddress": "Avenue des Arts 6-9",
           "gx-participant:postalCode": "1210"
         },
         "gx-participant:termsAndConditions": "70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700"
       },
       "proof": {
         "type": "JsonWebSignature2020",
         "created": "2022-10-01T13:02:09.771Z",
         "proofPurpose": "assertionMethod",
         "verificationMethod": "did:web:compliance.gaia-x.eu",
         "jws": "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..XQqRvvuxW1xHUy_eRzOk4LwyjwlRofg0JBiO0nrWGHAjwMA87OVJ37mB6GylgEttEaUjXQV-QmbGfEnE-YQf5S7B-id9Lld-CC-vW8M-2EvXh3oQp3l5W35mvvdVQXBj16LLskQZpfZGRHM0hn7zGEw24fDc_tLaGoNR9LQ6UzmSrHMwFFVWz6XH3RoG-UY0aZDpnAxjpWxUWaa_Jzf65bfNlx2EdSv3kIKKYJLUlQTk0meuFDD23VrkGStQTGQ8GijY3BNo6QWw889tt5YKWtiSZjbDYYHsVCwMzPoKT0hVJ1wy2ve6pJ4MSYfhiMxoDq6YBOm-oYKYfBeN22fjqQ"
       }
     },
     "complianceCredential": {
       "@context": ["https://www.w3.org/2018/credentials/v1"],
       "type": ["VerifiableCredential", "ParticipantCredential"],
       "id": "https://catalogue.gaia-x.eu/credentials/ParticipantCredential/1664629337488",
       "issuer": "did:web:compliance.gaia-x.eu",
       "issuanceDate": "2022-10-01T13:02:17.489Z",
       "credentialSubject": {
         "id": "did:web:compliance.gaia-x.eu",
         "hash": "3280866b1b8509ce287850fb113dc76d1334959c759f82a57415164d7a3a4026"
       },
       "proof": {
         "type": "JsonWebSignature2020",
         "created": "2022-10-01T13:02:17.489Z",
         "proofPurpose": "assertionMethod",
         "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..YQAIjkqX6OL4U3efV0zumn8-l8c4wQo98SOSlzt53HOR8qlLu5L5lmwZJnAsR7gKW-6jv5GBT0X4ORQ1ozLvihFj6eaxxJNgzLFPoH5w9UEaEIO8mMGyeQ-YQYWBbET3IK1mcHm2VskEsvpLvQGnk6kYJCXJzmaHMRSF3WOjNq_JWN8g-SldiGhgfKsJvIkjCeRm3kCt_UVeHMX6SoLMFDjI8JVxD9d5AG-kbK-xb13mTMdtbcyBtBJ_ahQcbNaxH-CfSDTSN51szLJBG-Ok-OlMagHY_1dqViXAKl4T5ShoS9fjxQItJvFPGA14axkY6s00xKVCUusi31se6rxC9g",
         "verificationMethod": "did:web:compliance.gaia-x.eu"
       }
     }
   }
   ```

## How it Works

1. The given Self Description is canonized with [URDNA2015](https://json-ld.github.io/rdf-dataset-canonicalization/spec/)
2. Next the canonized output is hashed with [SHA256](https://json-ld.github.io/rdf-dataset-canonicalization/spec/#dfn-hash-algorithm).
3. That hash is then signed with the given private key and the proof is created using [JsonWebKey2020](https://w3c-ccg.github.io/lds-jws2020/#json-web-signature-2020).
