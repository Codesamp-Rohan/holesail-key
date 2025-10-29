import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

const HOLESAIL_KEYS_DIR = path.join(os.homedir(), './holesail')
const HOLESAIL_KEYS_FILE = path.join(HOLESAIL_KEYS_DIR, 'keys.json')
const HOLESAIL_MASTER_KEY_FILE = path.join(HOLESAIL_KEYS_DIR, 'master.key')

const IV_LENGTH = 16;

class HolesailKey {
    constructor() {
        this.keys = []
        this.masterKey = null
        this.#ensureDirectory()
        this.#initializeMasterKey()
        this.#loadKeys()
    }

    #ensureDirectory() {
        if(!fs.existsSync(HOLESAIL_KEYS_DIR)) {
            fs.mkdirSync(HOLESAIL_KEYS_DIR, { recursive: true, mode: 0o700 })
        }
    }

    #initializeMasterKey() {
        // Retrieve key if exists
        if(fs.existsSync(HOLESAIL_MASTER_KEY_FILE)){
            const keyContent = fs.readFileSync(HOLESAIL_MASTER_KEY_FILE, 'utf-8').trim()
            this.masterKey = Buffer.from(keyContent, 'hex')
            console.log('Master key already created at ', HOLESAIL_MASTER_KEY_FILE, Buffer.from(this.masterKey, 'hex').toString('hex'))
        } else {
        // Generate one if does not exists
            this.masterKey = crypto.randomBytes(32)
            fs.writeFileSync(HOLESAIL_MASTER_KEY_FILE, this.masterKey.toString('hex'), {
                mode: 0o600
            })
            console.log('Master key created at ', HOLESAIL_MASTER_KEY_FILE)
        }
    }

    #encrypt (text) {
        const iv = crypto.randomBytes(IV_LENGTH)
        const cipher = crypto.createCipheriv('aes-256-cbc', this.masterKey, iv)
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
        return iv.toString('hex') + ':' + encrypted.toString('hex')
    }

    #decrypt (encryptedText) {
        const [iv, encrypted] = encryptedText.split(':')
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.masterKey, Buffer.from(iv, 'hex'))
        const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()])
        return decrypted.toString()
    }

    #loadKeys() {
        if(fs.existsSync(HOLESAIL_KEYS_FILE)) {
            try {
                const data = fs.readFileSync(HOLESAIL_KEYS_FILE, 'utf-8')
                const parsed = JSON.parse(data)
                this.keys = parsed.keys.map(encryptedEntry => {
                    return {
                        ...JSON.parse(this.#decrypt(encryptedEntry.data)),
                        createdAt: new Date(encryptedEntry.createdAt)
                    }
                })
            } catch (e) {
                console.error('Error loading keys: ', e)
                this.keys = []
            }
        }
    }

    #saveKeys() {
        const encryptedKeys = this.keys.map(key => ({
            data: this.#encrypt(JSON.stringify(key)),
            createdAt: key.createdAt.toISOString()
        }))

        fs.writeFileSync(HOLESAIL_KEYS_FILE, JSON.stringify({
            keys: encryptedKeys
        }, null, 2), {
            mode: 0o600
        })
    }

    addKey(key) {
        const newKey = {
            key,
            createdAt: new Date()
        }
        this.keys.push(newKey)
        this.#saveKeys()
        return newKey
    }

    getKeys() {
        return this.keys
    }

    removeKey(key) {
        this.keys = this.keys.filter(k => k.key !== key)
        this.#saveKeys()
    }

    clear() {
        this.keys = []
        this.#saveKeys()
    }

    getSize() {
        return this.keys.length
    }
}

export default new HolesailKey()