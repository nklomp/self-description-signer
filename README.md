<h1 align="center"> Self-Description-Signer</h1>

- [How To Use](#how-to-use)
- [How it Works](#how-it-works)

## How To Use

1. Update the self description in `self-description.json`, replace it with your own. See details in the [Architecture Document](https://gaia-x.gitlab.io/policy-rules-committee/trust-framework/participant/)
2. Create a new `.env` file with `PRIVATE_KEY`, `CERTIFICATE`, `VERIFICATION_METHOD` and `X5U_URL` as properties. Feel free to use the example file `example.env`.
3. Install dependencies `npm i` and execute the script `node index.js` (node@16 or higher required).
   - Alternatively, the script can be run with docker
     1. Build the container with `docker build -t self-description-signer .`
     2. Run the script with `docker run -it --mount src="$(pwd)/config",target=/usr/src/app/config,type=bind self-description-signer`
4. The given self description will be locally signed and a new file containing self description + proof called `{timestamp}_self-signed_{gx-type}.json` will be created.

   **Example self-signed Self Description:**

   ```json
   {
     "@context": [
       "https://www.w3.org/2018/credentials/v1",
       "http://w3id.org/gaia-x/participant",
       "https://registry.gaia-x.eu/v2206/api/shape/files?file=participant&type=ttl"
     ],
     "type": ["VerifiableCredential", "LegalPerson"],
     "id": "https://delta-dao.com/.well-known/participant.json",
     "issuer": "did:web:delta-dao.com",
     "issuanceDate": "2022-09-15T20:05:20.997Z",
     "credentialSubject": {
       "id": "did:web:delta-dao.com",
       "gx-participant:legalName": "deltaDAO AG",
       "gx-participant:registrationNumber": {
         "gx-participant:registrationNumberType": "leiCode",
         "gx-participant:registrationNumberNumber": "391200FJBNU0YW987L26"
       },
       "gx-participant:blockchainAccountId": "0x4C84a36fCDb7Bc750294A7f3B5ad5CA8F74C4A52",
       "gx-participant:headquarterAddress": {
         "gx-participant:addressCountryCode": "DE",
         "gx-participant:addressCode": "DE-HH",
         "gx-participant:streetAddress": "Geibelstraße 46b",
         "gx-participant:postalCode": "22303"
       },
       "gx-participant:legalAddress": {
         "gx-participant:addressCountryCode": "DE",
         "gx-participant:addressCode": "DE-HH",
         "gx-participant:streetAddress": "Geibelstraße 46b",
         "gx-participant:postalCode": "22303"
       },
       "gx-participant:termsAndConditions": "70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700"
     },
     "proof": {
       "type": "JsonWebSignature2020",
       "created": "2022-09-23T17:32:11.262Z",
       "proofPurpose": "assertionMethod",
       "verificationMethod": "did:web:compliance.lab.gaia-x.eu",
       "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..L7SO94T8OQgz7XeZVPaMBGqNP4KpCxog7IP2GNa9-lW5drQCglb4bL4phF10xqd1OdVFGWczbDSuEg0umazQWcTUzOG0jJWnHtMqGTAWy3rOcJXUv4C2Gkvq_dmBSy-wXwYPPRmDGWBBok-_o6-sZwMP5uycCyA5-Ss-IMyj08Q7MJ4AxL-iUCyo5dmlKfhL2gtlF1jDpUuBfygTOlaw6lllaNE19k0nkb7XNKGqZ-WRHKlayZI5oZRio6sMr9sLV4mec5ie_xtjgmrRPyQKnR4UgvplXT89jpWoBiCNfQV_ynUpmGJsznaJQxY179pWCRe65dyiF_2EkGgQ-A7f1A"
     }
   }
   ```

5. In addition, a `did.json` will be created based on the provided `CERTIFICATE` and `VERIFICATION_METHOD`

   **Example `did.json`:**

   ```json
   {
     "@context": ["https://www.w3.org/ns/did/v1"],
     "id": "did:web:compliance.lab.gaia-x.eu",
     "verificationMethod": [
       {
         "@context": "https://w3c-ccg.github.io/lds-jws2020/contexts/v1/",
         "id": "did:web:compliance.lab.gaia-x.eu",
         "type": "JsonWebKey2020",
         "controller": "did:web:compliance.gaia-x.eu#JWK2020-RSA",
         "publicKeyJwk": {
           "kty": "RSA",
           "n": "ulmXEa0nehbR338h6QaWLjMqfXE7mKA9PXoC_6_8d26xKQuBKAXa5k0uHhzQfNlAlxO-IpCDgf9cVzxIP-tkkefsjrXc8uvkdKNK6TY9kUxgUnOviiOLpHe88FB5dMTH6KUUGkjiPfq3P0F9fXHDEoQkGSpWui7eD897qSEdXFre_086ns3I8hSVCxoxlW9guXa_sRISIawCKT4UA3ZUKYyjtu0xRy7mRxNFh2wH0iSTQfqf4DWUUThX3S-jeRCRxqOGQdQlZoHym2pynJ1IYiiIOMO9L2IQrQl35kx94LGHiF8r8CRpLrgYXTVd9U17-nglrUmJmryECxW-555ppQ",
           "e": "AQAB",
           "alg": "PS256",
           "x5u": "https://compliance.lab.gaia-x.eu/.well-known/x509CertificateChain.pem"
         }
       }
     ],
     "assertionMethod": ["did:web:compliance.lab.gaia-x.eu#JWK2020-RSA"]
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
         "http://w3id.org/gaia-x/participant",
         "https://registry.gaia-x.eu/v2206/api/shape/files?file=participant&type=ttl"
       ],
       "type": ["VerifiableCredential", "LegalPerson"],
       "id": "https://delta-dao.com/.well-known/participant.json",
       "issuer": "did:web:delta-dao.com",
       "issuanceDate": "2022-09-15T20:05:20.997Z",
       "credentialSubject": {
         "id": "did:web:delta-dao.com",
         "gx-participant:legalName": "deltaDAO AG",
         "gx-participant:registrationNumber": {
           "gx-participant:registrationNumberType": "leiCode",
           "gx-participant:registrationNumberNumber": "391200FJBNU0YW987L26"
         },
         "gx-participant:blockchainAccountId": "0x4C84a36fCDb7Bc750294A7f3B5ad5CA8F74C4A52",
         "gx-participant:headquarterAddress": {
           "gx-participant:addressCountryCode": "DE",
           "gx-participant:addressCode": "DE-HH",
           "gx-participant:streetAddress": "Geibelstraße 46b",
           "gx-participant:postalCode": "22303"
         },
         "gx-participant:legalAddress": {
           "gx-participant:addressCountryCode": "DE",
           "gx-participant:addressCode": "DE-HH",
           "gx-participant:streetAddress": "Geibelstraße 46b",
           "gx-participant:postalCode": "22303"
         },
         "gx-participant:termsAndConditions": "70c1d713215f95191a11d38fe2341faed27d19e083917bc8732ca4fea4976700"
       },
       "proof": {
         "type": "JsonWebSignature2020",
         "created": "2022-09-23T17:32:11.262Z",
         "proofPurpose": "assertionMethod",
         "verificationMethod": "did:web:compliance.lab.gaia-x.eu",
         "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..L7SO94T8OQgz7XeZVPaMBGqNP4KpCxog7IP2GNa9-lW5drQCglb4bL4phF10xqd1OdVFGWczbDSuEg0umazQWcTUzOG0jJWnHtMqGTAWy3rOcJXUv4C2Gkvq_dmBSy-wXwYPPRmDGWBBok-_o6-sZwMP5uycCyA5-Ss-IMyj08Q7MJ4AxL-iUCyo5dmlKfhL2gtlF1jDpUuBfygTOlaw6lllaNE19k0nkb7XNKGqZ-WRHKlayZI5oZRio6sMr9sLV4mec5ie_xtjgmrRPyQKnR4UgvplXT89jpWoBiCNfQV_ynUpmGJsznaJQxY179pWCRe65dyiF_2EkGgQ-A7f1A"
       }
     },
     "complianceCredential": {
       "@context": ["https://www.w3.org/2018/credentials/v1"],
       "type": ["VerifiableCredential", "ParticipantCredential"],
       "id": "https://catalogue.gaia-x.eu/credentials/ParticipantCredential/1663954332409",
       "issuer": "did:web:compliance.lab.gaia-x.eu",
       "issuanceDate": "2022-09-23T17:32:12.409Z",
       "credentialSubject": {
         "id": "did:web:delta-dao.com",
         "hash": "3a72f5b49ec60f4f9b150d330c048740bd4d9a050696941d5b7f638e75088dcb"
       },
       "proof": {
         "type": "JsonWebSignature2020",
         "created": "2022-09-23T17:32:12.409Z",
         "proofPurpose": "assertionMethod",
         "jws": "eyJhbGciOiJQUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..I5sUraPpKC0pxPTPOARnwK-Ijiepx7UlCogprnKkTyT5xAI0JRrftqCZSZJyXfbDpWzTYGMaticOrfutv8Mxah_J5OgSoWX4rKs7CMR2q97FOOJjUeIYe4mKRL1V9WjgtXc_ire-Hyuz6KTanuUxDo3mog9tmumhjUcokGCmHoDXY-UaoleOWqgTaibEX0vajH0-3SCaTiGLIwwKYXjkxC5McV_j6cWhCGOWOe7Y6JMzNCu1SWO6d6pfvetq5DdoOAn4_LqMwL2Q6nEEN3ulZynaTD8kiB0swcCjUKoBtudtbF8VdCnFu7Jv4UI0zFpY4GdWpzgQYFO_YYxawpUcMA",
         "verificationMethod": "did:web:compliance.lab.gaia-x.eu"
       }
     }
   }
   ```

## How it Works

1. The given Self Description is canonized with [URDNA2015](https://json-ld.github.io/rdf-dataset-canonicalization/spec/)
2. Next the canonized output is hashed with [SHA256](https://json-ld.github.io/rdf-dataset-canonicalization/spec/#dfn-hash-algorithm).
3. That hash is then signed with the given private key and the proof is created using [JsonWebKey2020](https://w3c-ccg.github.io/lds-jws2020/#json-web-signature-2020).
