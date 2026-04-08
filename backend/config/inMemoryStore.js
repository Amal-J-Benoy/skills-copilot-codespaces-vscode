'use strict';

/**
 * In-memory implementations of the User and SensorData models.
 * These provide the same async API as the corresponding Mongoose models so
 * the controllers work unchanged when MongoDB is not available.
 *
 * NOTE: All data is stored in module-level arrays and is lost when the process
 * restarts.  This implementation is intended for development / testing only.
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function generateId() {
    return crypto.randomBytes(12).toString('hex');
}

// ── Users ──────────────────────────────────────────────────────────────────────

const _users = [];

/** Thenable wrapper for a single-user result (findOne / findById). */
class SingleUserQuery {
    constructor(user) {
        this._user = user;           // full user record (includes password hash)
        this._includePassword = false;
    }

    /**
     * Mirrors mongoose's .select() behaviour:
     *   select('+password')  → include the password field in the result
     *   select('-password')  → no-op (password is excluded by default)
     */
    select(fields) {
        if (typeof fields === 'string' && fields.includes('+password')) {
            this._includePassword = true;
        }
        return this;
    }

    _resolve() {
        if (!this._user) return null;
        const { password, matchPassword, ...rest } = this._user;
        // matchPassword is always available (same behaviour as a mongoose document)
        rest.matchPassword = matchPassword;
        if (this._includePassword) {
            rest.password = password;
        }
        return rest;
    }

    then(resolve, reject) {
        return Promise.resolve(this._resolve()).then(resolve, reject);
    }

    catch(fn) {
        return Promise.resolve(this._resolve()).catch(fn);
    }
}

/** Thenable wrapper for a multi-user result (find). */
class MultiUserQuery {
    constructor(users) {
        this._users = users;
        this._excludeFields = [];
    }

    /** select('-password') removes extra fields from every result. */
    select(fields) {
        if (typeof fields === 'string') {
            this._excludeFields = fields
                .split(/\s+/)
                .filter((p) => p.startsWith('-'))
                .map((p) => p.slice(1));
        }
        return this;
    }

    _resolve() {
        return this._users.map((u) => {
            // Never expose password or the internal matchPassword helper
            const { password, matchPassword, ...rest } = u;
            this._excludeFields.forEach((f) => delete rest[f]);
            return rest;
        });
    }

    then(resolve, reject) {
        return Promise.resolve(this._resolve()).then(resolve, reject);
    }

    catch(fn) {
        return Promise.resolve(this._resolve()).catch(fn);
    }
}

const InMemoryUserModel = {
    async create({ name, email, password, deviceId, role = 'worker' }) {
        const normalizedEmail = String(email).toLowerCase().trim();

        if (_users.some((u) => u.email === normalizedEmail)) {
            const err = new Error('E11000 duplicate key error – email');
            err.code = 11000;
            throw err;
        }
        if (_users.some((u) => u.deviceId === deviceId)) {
            const err = new Error('E11000 duplicate key error – deviceId');
            err.code = 11000;
            throw err;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash(password, salt);

        const user = {
            _id: generateId(),
            name,
            email: normalizedEmail,
            password: hashedPw,
            role,
            deviceId,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            // Arrow function closes over hashedPw so matchPassword works even
            // when the password field is not exposed.
            matchPassword: async (entered) => bcrypt.compare(entered, hashedPw),
        };

        _users.push(user);

        // Return without password field (mirrors mongoose select:false behaviour)
        const { password: _pw, ...result } = user;
        return result;
    },

    findOne(query) {
        let user = null;
        if (query.email !== undefined) {
            user =
                _users.find(
                    (u) => u.email === String(query.email).toLowerCase().trim()
                ) || null;
        } else if (query.deviceId !== undefined) {
            user = _users.find((u) => u.deviceId === query.deviceId) || null;
        }
        return new SingleUserQuery(user);
    },

    findById(id) {
        const user = _users.find((u) => u._id === String(id)) || null;
        return new SingleUserQuery(user);
    },

    find(query = {}) {
        let results = [..._users];
        if (query.role !== undefined) {
            results = results.filter((u) => u.role === query.role);
        }
        return new MultiUserQuery(results);
    },
};

// ── SensorData ─────────────────────────────────────────────────────────────────

const _sensorData = [];

/** Thenable wrapper for sensor-data queries (supports populate/sort/limit). */
class SensorDataQuery {
    constructor(items) {
        this._items = [...items];
    }

    /**
     * Mirrors mongoose's .populate(field, select).
     * Only 'userId' with a space-separated field list is implemented.
     */
    populate(field, select) {
        if (field === 'userId' && select) {
            const selectFields = select.split(/\s+/);
            this._items = this._items.map((item) => {
                const user = _users.find((u) => u._id === String(item.userId));
                if (!user) return item;
                const userInfo = { _id: user._id };
                selectFields.forEach((f) => {
                    if (user[f] !== undefined) userInfo[f] = user[f];
                });
                return { ...item, userId: userInfo };
            });
        }
        return this;
    }

    /** sort({ createdAt: -1 }) or sort({ createdAt: 1 }) */
    sort(opts) {
        const key = opts && Object.keys(opts)[0];
        if (key) {
            const dir = opts[key];
            this._items = [...this._items].sort((a, b) => {
                if (a[key] < b[key]) return dir === -1 ? 1 : -1;
                if (a[key] > b[key]) return dir === -1 ? -1 : 1;
                return 0;
            });
        }
        return this;
    }

    limit(n) {
        this._items = this._items.slice(0, n);
        return this;
    }

    then(resolve, reject) {
        return Promise.resolve(this._items).then(resolve, reject);
    }

    catch(fn) {
        return Promise.resolve(this._items).catch(fn);
    }
}

const InMemorySensorDataModel = {
    async create({ userId, deviceId, temperature, uvIndex, alerts = [], severity = 'SAFE' }) {
        const entry = {
            _id: generateId(),
            userId: String(userId),
            deviceId,
            temperature,
            uvIndex,
            alerts,
            severity,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        _sensorData.push(entry);
        return { ...entry };
    },

    find(query = {}) {
        let results = [..._sensorData];
        if (query.userId !== undefined) {
            results = results.filter(
                (d) => String(d.userId) === String(query.userId)
            );
        }
        return new SensorDataQuery(results);
    },
};

module.exports = { InMemoryUserModel, InMemorySensorDataModel };
