const kdfAlgo = "PBKDF2";
const cipherAlgo = "AES-GCM";
const hashName = "SHA-256";

function strToBytes(str) {
  return new TextEncoder().encode(str);
}

function bytesToStr(buff) {
  return new TextDecoder().decode(buff);
}

function b64ToBytes(b64) {
  const str = atob(b64);
  const buff = new Uint8Array(str.length);
  for (let i = 0; i < buff.length; ++i) {
    buff[i] = str.charCodeAt(i);
  }
  return buff;
}

function bytesToB64(buff) {
  let str = '';
  for (let i = 0; i < buff.length; ++i) {
    str += String.fromCharCode(buff[i]);
  }
  return btoa(str);
}

async function pbkdf2(passphrase, salt, iterations, nBytes, hashname) {
  const passphraseKey = await crypto.subtle.importKey('raw', strToBytes(passphrase), { 'name': kdfAlgo }, false, ['deriveKey']);
  const kdAlgorithm = { 'name': kdfAlgo, 'salt': salt, 'iterations': iterations, 'hash': hashname };
  const aesAlgorithm = { 'name': cipherAlgo, 'length': nBytes * 8 };
  const operations = ['encrypt', 'decrypt'];
  return crypto.subtle.deriveKey(kdAlgorithm, passphraseKey, aesAlgorithm, false, operations);
}

function makeKey(password, salt) {
  return pbkdf2(password, salt, 4096, 32, hashName);
}

export async function encrypt(password, data) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await makeKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { 'name': cipherAlgo, 'iv': iv }, key, strToBytes(data));
  return ({
    'ct': bytesToB64(new Uint8Array(encrypted)),
    'iv': bytesToB64(iv),
    'salt': bytesToB64(salt)
  });
}

export async function decrypt(password, data) {
  const key = await makeKey(password, b64ToBytes(data['salt']));
  const decrypted = await crypto.subtle.decrypt(
    { 'name': cipherAlgo, 'iv': b64ToBytes(data['iv']) }, key, b64ToBytes(data['ct']));
  return bytesToStr(new Uint8Array(decrypted));
}
