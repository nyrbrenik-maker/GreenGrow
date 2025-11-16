// Google Sheets API Integration with Service Account
const SheetsAPI = {
    serviceAccount: null,
    spreadsheetId: null,
    accessToken: null,
    tokenExpiry: null,
    cache: {},

    // Service Account Credentials - EMBEDDED (Security note: exposed in client code)
    EMBEDDED_CREDENTIALS: {
        "type": "service_account",
        "project_id": "greengrow-478417",
        "private_key_id": "31222aaa4d9dc55763a21a4589077da2a0e5edc7",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDprkP7jf3hmf2a\nJPUHuLclyY8LKIjE5GmiL5FhX83sy/BvnbSNAfIRCYJgXw+ihASIfboHI8GQZVzW\nhnluktum+Ynogm07QGzijxXRaGmtddQnYAktLosITFcODktiw//3ebHvx7JQxdzu\nHOqYfrdDI19TjpTpW1ja7CtmtBVTjtZGh6id4OZ5J95ILYSDN33+rq9h6sIEhVP4\pHIRQXPCBfmcbXF7v6N1t2WilmTawqj+NwS6Akq5U5b7ZA9Gf1kETbDZWX+lg5Qm\nlMhiFinKbTZ15IkSV7MdAVmR6h+cT/8VwTetWTPSbkE8M1Z9bKqqjCzIUIshBcnS\nyoDg3lpjAgMBAAECggEACf02j77KnwW3pwq0ZL+bKKTclgQGELCY6WNyKgDv6xLu\ntL6/lJWENQE8jwURRIezL+h79skrAZKrrMnzz+u8Mv+Qyx0kMTe4T9kA/EIj3lPe\nnU5IJiPKsrCcug+XXmH1g60yk4bsUvKaVp1q09j62YZeEVLTf8Q1YKpe0pWZIciw\n6h/hgWuQ9eoc4SbVyhnJb2P42+v2SvtsHwAPqFmNwoWsDeGHu0yUyo1/L3K9uymF\nQpmKFc4tonKJddDQjwwFwV4/rtOB0rvMafKKIeBAj33dNqpnwPuDLC+uNFb1d8zF\niwyw5rosNBD5F/DGaHjDlXO/x3iFjkPw73hOgjoe+QKBgQD7Ln55EYGcEc3gZGBF\nDNC1RviOEvIwY7Hmx7QvTBFFwKlikkCVbl67LVhabq1UHOp6eYWwOXloN9uy+xX5\nMMChazB+thAdEODwLcUrTULEyy4Ew/y7FEQb+nEuz9O87Ju4rIZ0R4WK/c8B6RlQ\n57RA01bSG6y9oEHpW0uV4NKqiwKBgQDuKdPx+gVt/3I55u9KzKgps2zSI0MdcbM0\nrhD11jYQTM1BC/MNOucXDoweK0ghJy6iSQpFcEpuq6uHT150Zr7fUAKN1Jdo3SJI\nzFvrcnRpRQWm4vcp7j5XhELqYR5mFuVE1AfqPddpkvMehvi6T6mDc/CR5Kx7PC9d\n2QV59eQCiQKBgGpLlK37YJQBXNR25d6Su8fbDthg4CjmJ6T4IiJZ2H1iOMxEBBy4\nplIjsF4ktCkCS6AkyRR4Xg5ihRDK/NOFdB9bUxxsQ4lpWSeK1wOqIHVTXlgZ8Fvj\nCaelZjxfKsWqg4O1TvjqQ3M8UVwHnvUD+N3uEbG8kG924C22utfkWoJdAoGBAK1t\nQgwjv05xRFGLq9axHwd2w5hl2xqW0CNdWbZarXXDJ3flZrDMori0fC3/4H9b0+aS\n/2q/MURTuA1JK4Phyb49ug5jr3nKBYwzXAAgkUqS22HCRq9+8GC0TDH2VLeMlpk/\nOSBGthUH0Af7yyWImuzBQX5LoZn/opJZVVaRSt7ZAoGAFWL4sC9+EojKkq+6BdXT\nsP0Ceov/ahI3tWO0ewZXB5vlBbzxoux+g516KfRvOKQfpYV1LEg4Hg8O5QBE1D02\n7gFK1TaQ42aaUOQQpqwxit45DvTIl3aSEbH/g5kG/YqInPu3IiegmD+b1iKebCVz\nGXf1RxWXORYcI/1bVPxC2Ls=\n-----END PRIVATE KEY-----\n",
        "client_email": "greengrow-app@greengrow-478417.iam.gserviceaccount.com",
        "client_id": "100427589950965854720",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "spreadsheet_id": "1c8PM_dUZMTdjqg8vPl2VAxVPIU3D9G4yOiKjip2GQP8"
    },

    // Initialize API
    init() {
        this.serviceAccount = this.EMBEDDED_CREDENTIALS;
        this.spreadsheetId = this.EMBEDDED_CREDENTIALS.spreadsheet_id;
        return true;
    },

    // Load credentials
    loadCredentials() {
        return this.init();
    },

    // Check if API is configured
    isConfigured() {
        return !!(this.serviceAccount && this.spreadsheetId);
    },

    // Get OAuth2 access token using service account
    async getAccessToken() {
        // Check if we have a valid token
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            // Create JWT assertion
            const now = Math.floor(Date.now() / 1000);
            const header = {
                alg: "RS256",
                typ: "JWT"
            };

            const claimSet = {
                iss: this.serviceAccount.client_email,
                scope: "https://www.googleapis.com/auth/spreadsheets",
                aud: "https://oauth2.googleapis.com/token",
                exp: now + 3600,
                iat: now
            };

            // Encode header and claim set
            const headerB64 = this.base64UrlEncode(JSON.stringify(header));
            const claimSetB64 = this.base64UrlEncode(JSON.stringify(claimSet));
            const signatureInput = `${headerB64}.${claimSetB64}`;

            // Sign with private key using SubtleCrypto
            const signature = await this.signJWT(signatureInput, this.serviceAccount.private_key);
            const jwt = `${signatureInput}.${signature}`;

            // Exchange JWT for access token
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: jwt
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get access token');
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early

            return this.accessToken;
        } catch (error) {
            console.error('Error getting access token:', error);
            throw error;
        }
    },

    // Base64 URL encoding
    base64UrlEncode(str) {
        const base64 = btoa(unescape(encodeURIComponent(str)));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    },

    // Sign JWT using SubtleCrypto
    async signJWT(data, privateKeyPem) {
        // Import private key
        const pemContents = privateKeyPem
            .replace('-----BEGIN PRIVATE KEY-----', '')
            .replace('-----END PRIVATE KEY-----', '')
            .replace(/\s/g, '');

        const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

        const key = await crypto.subtle.importKey(
            'pkcs8',
            binaryKey,
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: 'SHA-256'
            },
            false,
            ['sign']
        );

        // Sign the data
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const signatureBuffer = await crypto.subtle.sign(
            'RSASSA-PKCS1-v1_5',
            key,
            dataBuffer
        );

        // Convert signature to base64url
        const signatureArray = Array.from(new Uint8Array(signatureBuffer));
        const signatureBase64 = btoa(String.fromCharCode.apply(null, signatureArray));
        return signatureBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    },

    // Build API URL (no API key needed)
    buildUrl(range) {
        const encodedRange = encodeURIComponent(range);
        return `${CONFIG.SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodedRange}`;
    },

    // Get data from sheet
    async getSheetData(sheetName, useCache = true) {
        if (!this.isConfigured()) {
            throw new Error('Google Sheets API not configured');
        }

        // Check cache
        const cacheKey = `${CONFIG.STORAGE_KEYS.CACHE_PREFIX}${sheetName}`;
        const cached = this.cache[cacheKey];

        if (useCache && cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
            return cached.data;
        }

        try {
            const url = this.buildUrl(sheetName);
            const token = await this.getAccessToken();

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Sheet doesn't exist, return empty array
                    return [];
                }
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const result = await response.json();
            const rows = result.values || [];

            // Convert to objects using first row as headers
            if (rows.length === 0) {
                return [];
            }

            const headers = rows[0];
            const data = rows.slice(1).map(row => {
                const obj = { _rowIndex: rows.indexOf(row) + 2 }; // +2 for header and 1-indexing
                headers.forEach((header, index) => {
                    obj[header] = row[index] || '';
                });
                return obj;
            });

            // Update cache
            this.cache[cacheKey] = {
                data,
                timestamp: Date.now()
            };

            return data;
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            throw error;
        }
    },

    // Append data to sheet
    async appendData(sheetName, values) {
        if (!this.isConfigured()) {
            throw new Error('Google Sheets API not configured');
        }

        try {
            const token = await this.getAccessToken();
            const url = `${CONFIG.SHEETS_API_BASE}/${this.spreadsheetId}/values/${sheetName}:append?valueInputOption=USER_ENTERED`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [values]
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to append data: ${response.statusText}`);
            }

            // Clear cache for this sheet
            this.clearCache(sheetName);

            return await response.json();
        } catch (error) {
            console.error('Error appending data:', error);
            throw error;
        }
    },

    // Update data in sheet
    async updateData(sheetName, range, values) {
        if (!this.isConfigured()) {
            throw new Error('Google Sheets API not configured');
        }

        try {
            const token = await this.getAccessToken();
            const fullRange = `${sheetName}!${range}`;
            const url = `${CONFIG.SHEETS_API_BASE}/${this.spreadsheetId}/values/${encodeURIComponent(fullRange)}?valueInputOption=USER_ENTERED`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [values]
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to update data: ${response.statusText}`);
            }

            // Clear cache for this sheet
            this.clearCache(sheetName);

            return await response.json();
        } catch (error) {
            console.error('Error updating data:', error);
            throw error;
        }
    },

    // Clear cache for specific sheet or all
    clearCache(sheetName = null) {
        if (sheetName) {
            const cacheKey = `${CONFIG.STORAGE_KEYS.CACHE_PREFIX}${sheetName}`;
            delete this.cache[cacheKey];
        } else {
            this.cache = {};
        }
    },

    // Test connection
    async testConnection() {
        if (!this.isConfigured()) {
            throw new Error('API credentials not configured');
        }

        try {
            const token = await this.getAccessToken();
            const url = `${CONFIG.SHEETS_API_BASE}/${this.spreadsheetId}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Connection failed: ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                title: data.properties?.title || 'Unknown',
                sheets: data.sheets?.map(s => s.properties.title) || []
            };
        } catch (error) {
            console.error('Connection test failed:', error);
            throw error;
        }
    }
};

// Data access layer - provides clean interface to app data
const DataStore = {
    // Get all strains
    async getStrains() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.STRAINS);
        return data.map(strain => ({
            id: strain.id || Utils.generateId('STR'),
            name: strain.name || '',
            type: strain.type || 'Hybrid',
            vegDays: parseInt(strain.vegDays) || 30,
            flowerDays: parseInt(strain.flowerDays) || 60,
            thcPercent: parseFloat(strain.thcPercent) || 0,
            cbdPercent: parseFloat(strain.cbdPercent) || 0,
            effects: strain.effects ? strain.effects.split(',').map(e => e.trim()) : [],
            terpenes: strain.terpenes ? strain.terpenes.split(',').map(t => t.trim()) : [],
            useCases: strain.useCases ? strain.useCases.split(',').map(u => u.trim()) : [],
            notes: strain.notes || '',
            _rowIndex: strain._rowIndex
        }));
    },

    // Get all bays
    async getBays() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.BAYS);
        return data.map(bay => ({
            id: bay.id || Utils.generateId('BAY'),
            name: bay.name || '',
            temperature: parseFloat(bay.temperature) || 0,
            humidity: parseFloat(bay.humidity) || 0,
            location: bay.location || '',
            notes: bay.notes || '',
            _rowIndex: bay._rowIndex
        }));
    },

    // Get all trays
    async getTrays() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.TRAYS);
        return data.map(tray => ({
            id: tray.id || Utils.generateId('TRY'),
            name: tray.name || '',
            bayId: tray.bayId || '',
            strainIds: tray.strainIds ? tray.strainIds.split(',').map(s => s.trim()) : [],
            dateStarted: tray.dateStarted || '',
            status: tray.status || 'active',
            notes: tray.notes || '',
            _rowIndex: tray._rowIndex
        }));
    },

    // Get all plants
    async getPlants() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.PLANTS);
        return data.map(plant => ({
            id: plant.id || Utils.generateId('PLT'),
            trayId: plant.trayId || '',
            bayId: plant.bayId || '',
            strainId: plant.strainId || '',
            stage: plant.stage || 'seedling',
            datePlanted: plant.datePlanted || '',
            dateStageChanged: plant.dateStageChanged || '',
            notes: plant.notes || '',
            _rowIndex: plant._rowIndex
        }));
    },

    // Get effects
    async getEffects() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.EFFECTS);
        if (data.length === 0) {
            return CONFIG.DEFAULT_EFFECTS;
        }
        return data.map(e => e.name || e.effect || '').filter(Boolean);
    },

    // Get terpenes
    async getTerpenes() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.TERPENES);
        if (data.length === 0) {
            return CONFIG.DEFAULT_TERPENES;
        }
        return data.map(t => t.name || t.terpene || '').filter(Boolean);
    },

    // Get use cases
    async getUseCases() {
        const data = await SheetsAPI.getSheetData(CONFIG.SHEET_NAMES.USE_CASES);
        if (data.length === 0) {
            return CONFIG.DEFAULT_USE_CASES;
        }
        return data.map(u => u.name || u.useCase || '').filter(Boolean);
    },

    // Add strain
    async addStrain(strain) {
        const row = [
            strain.id || Utils.generateId('STR'),
            strain.name,
            strain.type,
            strain.vegDays,
            strain.flowerDays,
            strain.thcPercent,
            strain.cbdPercent,
            strain.effects.join(', '),
            strain.terpenes.join(', '),
            strain.useCases.join(', '),
            strain.notes || ''
        ];
        return await SheetsAPI.appendData(CONFIG.SHEET_NAMES.STRAINS, row);
    },

    // Add bay
    async addBay(bay) {
        const row = [
            bay.id || Utils.generateId('BAY'),
            bay.name,
            bay.temperature,
            bay.humidity,
            bay.location || '',
            bay.notes || ''
        ];
        return await SheetsAPI.appendData(CONFIG.SHEET_NAMES.BAYS, row);
    },

    // Add tray
    async addTray(tray) {
        const row = [
            tray.id || Utils.generateId('TRY'),
            tray.name,
            tray.bayId,
            tray.strainIds.join(', '),
            tray.dateStarted,
            tray.status,
            tray.notes || ''
        ];
        return await SheetsAPI.appendData(CONFIG.SHEET_NAMES.TRAYS, row);
    },

    // Add plant
    async addPlant(plant) {
        const row = [
            plant.id || Utils.generateId('PLT'),
            plant.trayId,
            plant.bayId,
            plant.strainId,
            plant.stage,
            plant.datePlanted,
            plant.dateStageChanged || plant.datePlanted,
            plant.notes || ''
        ];
        return await SheetsAPI.appendData(CONFIG.SHEET_NAMES.PLANTS, row);
    },

    // Bulk add plants
    async bulkAddPlants(plants) {
        const promises = plants.map(plant => this.addPlant(plant));
        return await Promise.all(promises);
    },

    // Update strain
    async updateStrain(strain) {
        const row = [
            strain.id,
            strain.name,
            strain.type,
            strain.vegDays,
            strain.flowerDays,
            strain.thcPercent,
            strain.cbdPercent,
            strain.effects.join(', '),
            strain.terpenes.join(', '),
            strain.useCases.join(', '),
            strain.notes || ''
        ];
        const range = `A${strain._rowIndex}:K${strain._rowIndex}`;
        return await SheetsAPI.updateData(CONFIG.SHEET_NAMES.STRAINS, range, row);
    },

    // Clear all caches
    clearCache() {
        SheetsAPI.clearCache();
    }
};
