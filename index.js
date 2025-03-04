const CONF = './config/'
require('dotenv').config({ path: CONF + '.env' })

const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs').promises
const jose = require('jose')

const SD_PATH = process.argv.slice(2)[0] || CONF + 'self-description.json'
const selfDescription = require(SD_PATH)
const CURRENT_TIME = new Date().getTime()
const BASE_URL = process.env.BASE_URL || 'https://compliance.gaia-x.eu'
const API_VERSION = process.env.API_VERSION

const OUTPUT_DIR = process.argv.slice(2)[1] || './output/'
createOutputFolder(OUTPUT_DIR)

const TYPE_API_ATH = {
  ServiceOfferingExperimental: 'service-offering',
  LegalPerson: 'participant',
}

function getApiVersionedUrl() {
  return `${BASE_URL}${API_VERSION ? '/v'+ API_VERSION : ''}/api`
}

async function canonize(selfDescription) {
  const URL = `${getApiVersionedUrl()}/normalize`
  const { data } = await axios.post(URL, selfDescription)

  return data
}

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

async function sign(hash) {
  const algorithm = 'PS256'
  const rsaPrivateKey = await jose.importPKCS8(
    process.env.PRIVATE_KEY,
    algorithm
  )

  try {
    const jws = await new jose.CompactSign(new TextEncoder().encode(hash))
      .setProtectedHeader({ alg: 'PS256', b64: false, crit: ['b64'] })
      .sign(rsaPrivateKey)

    return jws
  } catch (error) {
    console.error(error)
  }
}

async function createProof(hash) {
  const proof = {
    type: 'JsonWebSignature2020',
    created: new Date(CURRENT_TIME).toISOString(),
    proofPurpose: 'assertionMethod',
    verificationMethod:
      process.env.VERIFICATION_METHOD ?? 'did:web:compliance.lab.gaia-x.eu',
    jws: await sign(hash),
  }

  return proof
}

async function verify(jws) {
  const algorithm = 'PS256'
  const x509 = await jose.importX509(process.env.CERTIFICATE, algorithm)
  const publicKeyJwk = await jose.exportJWK(x509)

  const pubkey = await jose.importJWK(publicKeyJwk, 'PS256')

  try {
    const result = await jose.compactVerify(jws, pubkey)

    return {
      protectedHeader: result.protectedHeader,
      content: new TextDecoder().decode(result.payload),
    }
  } catch (error) {
    return {}
  }
}

async function createSignedSdFile(selfDescription, proof) {
  const content = proof ? { ...selfDescription, proof } : selfDescription
  const status = proof ? 'self-signed' : 'complete'
  const type = proof
    ? selfDescription['type'].find((t) => t !== 'VerifiableCredential')
    : selfDescription.selfDescriptionCredential['type'].find(
        (t) => t !== 'VerifiableCredential'
      )
  const data = JSON.stringify(content, null, 2)
  const filename = `${OUTPUT_DIR}${CURRENT_TIME}_${status}_${type}.json`

  await fs.writeFile(filename, data)

  return filename
}

async function createDIDFile() {
  const algorithm = 'PS256'
  const x509 = await jose.importX509(process.env.CERTIFICATE, algorithm)
  const publicKeyJwk = await jose.exportJWK(x509)
  publicKeyJwk.alg = algorithm
  publicKeyJwk.x5u = process.env.X5U_URL

  const did = {
    '@context': ['https://www.w3.org/ns/did/v1'],
    id: process.env.VERIFICATION_METHOD,
    verificationMethod: [
      {
        '@context': 'https://w3c-ccg.github.io/lds-jws2020/contexts/v1/',
        id: process.env.VERIFICATION_METHOD,
        type: 'JsonWebKey2020',
        controller: process.env.CONTROLLER,
        publicKeyJwk,
      },
    ],
    assertionMethod: [process.env.VERIFICATION_METHOD + '#JWK2020-RSA'],
  }

  const data = JSON.stringify(did, null, 2)
  const filename = `${OUTPUT_DIR}${CURRENT_TIME}_did.json`

  await fs.writeFile(filename, data)

  return filename
}

function logger(...msg) {
  console.log(msg.join(' '))
}

async function signSd(selfDescription, proof) {
  const URL = `${getApiVersionedUrl()}/sign`
  const { data } = await axios.post(URL, { ...selfDescription, proof })

  return data
}

async function verifySelfDescription(selfDescription) {
  const credentialType = selfDescription.selfDescriptionCredential['type'].find(
    (el) => el !== 'VerifiableCredential'
  )
  const type = TYPE_API_ATH[credentialType] || TYPE_API_ATH.LegalPerson
  const URL = `${getApiVersionedUrl()}/${type}/verify/raw`
  const { data } = await axios.post(URL, selfDescription)

  return data
}

async function createOutputFolder(dir) {
  try {
    await fs.access(dir)
  } catch (e) {
    await fs.mkdir(dir)
  }
}

async function main() {
  logger(`📝 Loaded ${SD_PATH}`)

  try {
    const canonizedSD = await canonize(selfDescription)

    const hash = sha256(canonizedSD)
    logger(`📈 Hashed canonized SD ${hash}`)

    const proof = await createProof(hash)
    logger(
      proof
        ? '🔒 SD signed successfully (local)'
        : '❌ SD signing failed (local)'
    )

    const verificationResult = await verify(
      proof.jws.replace('..', `.${hash}.`)
    )
    logger(
      verificationResult?.content === hash
        ? '✅ Verification successful (local)'
        : '❌ Verification failed (local)'
    )

    const filenameSignedSd = await createSignedSdFile(selfDescription, proof)
    logger(`📁 ${filenameSignedSd} saved`)

    const filenameDid = await createDIDFile()
    logger(`📁 ${filenameDid} saved`, '\n')

    // the following code only works if you hosted your created did.json
    logger('🔍 Checking Self Description with the Compliance Service...')

    const complianceCredential = await signSd(selfDescription, proof)
    logger(
      complianceCredential
        ? '🔒 SD signed successfully (compliance service)'
        : '❌ SD signing failed (compliance service)'
    )

    if (complianceCredential) {
      const completeSd = {
        selfDescriptionCredential: { ...selfDescription, proof },
        complianceCredential: complianceCredential.complianceCredential,
      }

      const verificationResultRemote = await verifySelfDescription(completeSd)
      logger(
        verificationResultRemote?.conforms === true
          ? '✅ Verification successful (compliance service)'
          : `❌ Verification failed (compliance service): ${verificationResultRemote.conforms}`
      )

      const filenameCompleteSd = await createSignedSdFile(completeSd)
      logger(`📁 ${filenameCompleteSd} saved`)
    }
  } catch (error) {
    console.dir('Something went wrong:')
    console.dir(error?.response?.data, { depth: null, colors: true })
  }
}

main()
