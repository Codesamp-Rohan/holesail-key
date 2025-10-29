# Holesail Key Management

A secure, file-based key management system for the `Holesail P2P reverse tunneling platform`. This module provides encrypted storage and retrieval of cryptographic keys using AES-256-CBC encryption with a master key system.

## Features

- **Secure Storage**: Keys are encrypted using AES-256-CBC with a randomly generated 32-byte master key
- **Master Key Protection**: Master key is stored separately with restricted file permissions (0o600)
- **Automatic Initialization**: Directory and master key are automatically created on first use
- **Persistent Storage**: Keys are persisted to disk in encrypted JSON format
- **Type-Safe Operations**: Simple, straightforward API for key management
- **Error Handling**: Graceful error handling with fallback mechanisms for corrupted data

## Installation

```bash
npm install @holesail/holesail-key
```

## Usage

### Basic Operations

```javascript
import HolesailKey from '@holesail/holesail-key';

// Add a new key
const newKey = HolesailKey.addKey('holesail-key');
console.log(newKey); // { key: 'your-secret-key', createdAt: Date }

// Retrieve all keys
const allKeys = HolesailKey.getKeys();
console.log(allKeys); // Array of key objects with metadata

// Get the number of stored keys
const count = HolesailKey.getSize();

// Remove a specific key
HolesailKey.removeKey('your-holesail-key');

// Clear all keys
HolesailKey.clear();
```

## API Reference

### `addKey(key)`

Stores a new key in encrypted storage with a creation timestamp.

**Parameters:**
- `key` (string): The cryptographic key to store

**Returns:**
- Object: `{ key, createdAt }`

**Example:**
```javascript
const result = HolesailKey.addKey('holesail-key');
```

---

### `getKeys()`

Retrieves all stored keys in decrypted form.

**Returns:**
- Array: Array of key objects containing the key and metadata

**Example:**
```javascript
const keys = HolesailKey.getKeys();
keys.forEach(entry => {
  console.log(entry.key, entry.createdAt);
});
```

---

### `removeKey(key)`

Removes a specific key from storage by exact match.

**Parameters:**
- `key` (string): The key to remove

**Example:**
```javascript
HolesailKey.removeKey('holesail-key');
```

---

### `getSize()`

Returns the total number of stored keys.

**Returns:**
- Number: Count of stored keys

**Example:**
```javascript
const count = HolesailKey.getSize();
console.log(`Stored keys: ${count}`);
```

---

### `clear()`

Removes all keys from storage.

**Example:**
```javascript
HolesailKey.clear();
```

## Architecture

### Directory Structure

```
~/.holesail/
🔑 master.key      # 32-byte master encryption key (mode: 0o600)
📝 keys.json       # Encrypted key storage (mode: 0o600)
```

### Encryption Details

- **Algorithm**: AES-256-CBC
- **Key Size**: 256-bit (32 bytes)
- **IV**: 16-byte random initialization vector
- **Format**: `{IV_hex}:{encrypted_data_hex}`

### Data Structure

Keys are stored in encrypted JSON format:

```json
{
  "keys": [
    {
      "data": "encrypted_hex_string",
      "createdAt": "2025-10-29T10:42:00.000Z"
    }
  ]
}
```

## Security Considerations

- **File Permissions**: All sensitive files are created with restrictive permissions (0o600, readable/writable by owner only)
- **Master Key**: Generated once and persisted securely; ensure the `~/.holesail/master.key` file is backed up in a secure location
- **Encryption**: AES-256-CBC provides strong symmetric encryption for stored keys
- **IV Randomization**: A unique initialization vector is generated for each encrypted entry to prevent pattern recognition

## Error Handling

The module includes automatic error recovery:

- If `keys.json` is corrupted, the keys array is reset to empty and logged as an error
- Missing directories are created automatically
- Missing master key triggers automatic generation

## Requirements

- Node.js 14.x or higher
- ES modules support

## Environment

- Tested on macOS and Linux
- Uses standard Node.js `fs`, `path`, `crypto`, and `os` modules

## License

See LICENSE file in repository

## Contributing

Contributions are welcome! Please follow the existing code style and ensure all tests pass before submitting pull requests.

## Support

For issues, feature requests, or questions, please visit the [Holesail GitHub repository](https://github.com/holesail/holesail-key).