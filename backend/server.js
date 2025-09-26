const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allows requests from the frontend's origin
app.use(express.json()); // Parses incoming JSON requests

// In-memory data store (replace with a database in a real application)
let tasks = [
    { id: '1', text: 'Install Node.js and run the backend', completed: true },
    { id: '2', text: 'Open the HTML file in a browser', completed: true },
    { id: '3', text: 'Add a new task using the form', completed: false },
];

// --- API Routes ---

// GET /tasks - Retrieve all tasks
app.get('/tasks', (req, res) => {
    console.log('GET /tasks - Responding with all tasks');
    res.json(tasks);
});

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Task text is required and must be a string.' });
    }

    const newTask = {
        id: crypto.randomUUID(),
        text: text.trim(),
        completed: false,
    };

    tasks.push(newTask);
    console.log(`POST /tasks - Created new task with ID: ${newTask.id}`);
    res.status(201).json(newTask);
});

// PUT /tasks/:id - Update a task's completion status
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: '`completed` field must be a boolean.' });
    }
    
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    tasks[taskIndex].completed = completed;
    console.log(`PUT /tasks/${id} - Updated task completion to: ${completed}`);
    res.json(tasks[taskIndex]);
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== id);

    if (tasks.length === initialLength) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    console.log(`DELETE /tasks/${id} - Deleted task.`);
    // A 204 No Content response is standard for successful deletions
    res.status(204).send(); 
});


// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
