const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Temporary data storage
const users = [];
const tasks = [];

// Generate unique ID
function generateId() {
    return crypto.randomUUID();
}

// ============================
// HOME
// ============================

app.get("/", (req, res) => {
    res.json({
        message: "Task Management API is running"
    });
});

// ============================
// REGISTER USER
// ============================

app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const existingUser = users.find(
        user => user.email === email
    );

    if (existingUser) {
        return res.status(400).json({
            message: "User already exists"
        });
    }

    const newUser = {
        id: generateId(),
        name,
        email,
        password
    };

    users.push(newUser);

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }
    });
});

// ============================
// LOGIN
// ============================

app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    const user = users.find(
        user =>
            user.email === email &&
            user.password === password
    );

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    res.json({
        message: "Login successful",
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

// ============================
// CREATE TASK
// ============================

app.post("/api/tasks", (req, res) => {
    const {
        userId,
        title,
        description,
        priority,
        dueDate
    } = req.body;

    if (!userId || !title) {
        return res.status(400).json({
            message: "User ID and task title are required"
        });
    }

    const newTask = {
        id: generateId(),
        userId,
        title,
        description: description || "",
        priority: priority || "medium",
        status: "pending",
        dueDate: dueDate || null,
        createdAt: new Date(),
        completedAt: null
    };

    tasks.push(newTask);

    res.status(201).json({
        message: "Task created successfully",
        task: newTask
    });
});

// ============================
// GET ALL TASKS
// ============================

app.get("/api/tasks/:userId", (req, res) => {
    const { userId } = req.params;

    const userTasks = tasks.filter(
        task => task.userId === userId
    );

    res.json({
        totalTasks: userTasks.length,
        tasks: userTasks
    });
});

// ============================
// GET SINGLE TASK
// ============================

app.get("/api/tasks/task/:id", (req, res) => {
    const { id } = req.params;

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.json(task);
});

// ============================
// UPDATE TASK
// ============================

app.put("/api/tasks/:id", (req, res) => {
    const { id } = req.params;

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const {
        title,
        description,
        priority,
        dueDate
    } = req.body;

    task.title = title || task.title;
    task.description =
        description ?? task.description;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;

    res.json({
        message: "Task updated successfully",
        task
    });
});

// ============================
// COMPLETE TASK
// ============================

app.patch("/api/tasks/:id/complete", (req, res) => {
    const { id } = req.params;

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    task.status = "completed";
    task.completedAt = new Date();

    res.json({
        message: "Task completed successfully",
        task
    });
});

// ============================
// REOPEN TASK
// ============================

app.patch("/api/tasks/:id/reopen", (req, res) => {
    const { id } = req.params;

    const task = tasks.find(
        task => task.id === id
    );

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    task.status = "pending";
    task.completedAt = null;

    res.json({
        message: "Task reopened successfully",
        task
    });
});

// ============================
// DELETE TASK
// ============================

app.delete("/api/tasks/:id", (req, res) => {
    const { id } = req.params;

    const taskIndex = tasks.findIndex(
        task => task.id === id
    );

    if (taskIndex === -1) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    tasks.splice(taskIndex, 1);

    res.json({
        message: "Task deleted successfully"
    });
});

// ============================
// TASK STATISTICS
// ============================

app.get("/api/tasks/:userId/statistics", (req, res) => {
    const { userId } = req.params;

    const userTasks = tasks.filter(
        task => task.userId === userId
    );

    const total = userTasks.length;

    const completed = userTasks.filter(
        task => task.status === "completed"
    ).length;

    const pending = userTasks.filter(
        task => task.status === "pending"
    ).length;

    const highPriority = userTasks.filter(
        task => task.priority === "high"
    ).length;

    res.json({
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: pending,
        highPriorityTasks: highPriority
    });
});

// ============================
// START SERVER
// ============================

app.listen(PORT, () => {
    console.log(
        `Task Management server running at http://localhost:${PORT}`
    );
});
