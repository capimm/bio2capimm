const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database file paths
const DB_PATH = path.join(__dirname, 'database');
const USERS_FILE = path.join(DB_PATH, 'users.json');
const MESSAGES_FILE = path.join(DB_PATH, 'messages.json');
const RANKS_FILE = path.join(DB_PATH, 'ranks.json');
const ROULETTE_FILE = path.join(DB_PATH, 'roulette.json');

// Ensure database directory exists
if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH);
}

// Initialize database files if they don't exist
const initializeDatabase = () => {
    const defaultUsers = [];
    const defaultMessages = [];
    const defaultRanks = [
        { id: 1, name: 'Membro', minPoints: 0, color: '#00ff00' },
        { id: 2, name: 'Bronze', minPoints: 100, color: '#cd7f32' },
        { id: 3, name: 'Prata', minPoints: 250, color: '#c0c0c0' },
        { id: 4, name: 'Ouro', minPoints: 500, color: '#ffd700' },
        { id: 5, name: 'Diamante', minPoints: 1000, color: '#b9f2ff' },
        { id: 6, name: 'Mestre', minPoints: 2000, color: '#ff6b6b' }
    ];
    const defaultRoulette = {
        prizes: [
            { id: 1, name: '10 Moedas', value: 10, color: '#ff0000', probability: 30 },
            { id: 2, name: '25 Moedas', value: 25, color: '#00ff00', probability: 25 },
            { id: 3, name: '50 Moedas', value: 50, color: '#0000ff', probability: 20 },
            { id: 4, name: '100 Moedas', value: 100, color: '#ffff00', probability: 15 },
            { id: 5, name: 'Jackpot!', value: 500, color: '#ff00ff', probability: 8 },
            { id: 6, name: 'Tente novamente', value: 0, color: '#00ffff', probability: 2 }
        ]
    };

    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
    if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, JSON.stringify(defaultMessages, null, 2));
    if (!fs.existsSync(RANKS_FILE)) fs.writeFileSync(RANKS_FILE, JSON.stringify(defaultRanks, null, 2));
    if (!fs.existsSync(ROULETTE_FILE)) fs.writeFileSync(ROULETTE_FILE, JSON.stringify(defaultRoulette, null, 2));
};

// Helper functions
const readJSON = (filePath) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
};

const writeJSON = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
    }
};

// Initialize database
initializeDatabase();

// API Routes

// Users API
app.get('/api/users', (req, res) => {
    const users = readJSON(USERS_FILE);
    res.json(users);
});

app.get('/api/users/:id', (req, res) => {
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.id == req.params.id);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.post('/api/users', (req, res) => {
    const users = readJSON(USERS_FILE);
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
    }

    const newUser = {
        id: Date.now(),
        username,
        email,
        password, // In production, this should be hashed
        points: 0,
        rank: 'Membro',
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        status: 'online'
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);

    // Remove password from response
    const { password: _, ...userResponse } = newUser;
    res.status(201).json(userResponse);
});

app.post('/api/auth/login', (req, res) => {
    const users = readJSON(USERS_FILE);
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        user.status = 'online';
        writeJSON(USERS_FILE, users);

        // Remove password from response
        const { password: _, ...userResponse } = user;
        res.json({ success: true, user: userResponse });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.put('/api/users/:id', (req, res) => {
    const users = readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.id == req.params.id);

    if (userIndex !== -1) {
        const updatedUser = { ...users[userIndex], ...req.body };
        users[userIndex] = updatedUser;
        writeJSON(USERS_FILE, users);

        // Remove password from response
        const { password: _, ...userResponse } = updatedUser;
        res.json(userResponse);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Messages API
app.get('/api/messages', (req, res) => {
    const messages = readJSON(MESSAGES_FILE);
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const paginatedMessages = messages
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(offset, offset + limit);

    res.json({
        messages: paginatedMessages,
        total: messages.length,
        hasMore: offset + limit < messages.length
    });
});

app.post('/api/messages', (req, res) => {
    const messages = readJSON(MESSAGES_FILE);
    const { userId, text } = req.body;

    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.id == userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const newMessage = {
        id: Date.now(),
        userId: parseInt(userId),
        username: user.username,
        text,
        timestamp: new Date().toISOString(),
        avatar: user.avatar
    };

    messages.push(newMessage);
    writeJSON(MESSAGES_FILE, messages);

    res.status(201).json(newMessage);
});

// Ranks API
app.get('/api/ranks', (req, res) => {
    const ranks = readJSON(RANKS_FILE);
    res.json(ranks);
});

app.get('/api/ranks/user/:userId', (req, res) => {
    const users = readJSON(USERS_FILE);
    const ranks = readJSON(RANKS_FILE);
    const user = users.find(u => u.id == req.params.userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const userRank = ranks.find(r => r.name === user.rank) || ranks[0];
    res.json(userRank);
});

// Roulette API
app.get('/api/roulette', (req, res) => {
    const roulette = readJSON(ROULETTE_FILE);
    res.json(roulette);
});

app.post('/api/roulette/spin/:userId', (req, res) => {
    const users = readJSON(USERS_FILE);
    const roulette = readJSON(ROULETTE_FILE);
    const userIndex = users.findIndex(u => u.id == req.params.userId);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Simple weighted random selection
    const prizes = roulette.prizes;
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.probability, 0);
    let random = Math.random() * totalWeight;

    let selectedPrize = prizes[0];
    for (const prize of prizes) {
        random -= prize.probability;
        if (random <= 0) {
            selectedPrize = prize;
            break;
        }
    }

    // Update user points
    users[userIndex].points += selectedPrize.value;
    writeJSON(USERS_FILE, users);

    res.json({
        prize: selectedPrize,
        newPoints: users[userIndex].points
    });
});

// Stats API
app.get('/api/stats', (req, res) => {
    const users = readJSON(USERS_FILE);
    const messages = readJSON(MESSAGES_FILE);

    const stats = {
        totalUsers: users.length,
        totalMessages: messages.length,
        onlineUsers: users.filter(u => u.status === 'online').length,
        topUsers: users
            .sort((a, b) => b.points - a.points)
            .slice(0, 10)
            .map(u => ({ username: u.username, points: u.points, rank: u.rank }))
    };

    res.json(stats);
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
