     const API_URL = 'http://localhost:3000/tasks'; // Backend server URL

        const taskForm = document.getElementById('task-form');
        const taskInput = document.getElementById('task-input');
        const taskList = document.getElementById('task-list');
        const loadingIndicator = document.getElementById('loading');
        const errorMessage = document.getElementById('error-message');

        // --- API Functions ---

        /**
         * Fetches all tasks from the server.
         */
        async function getTasks() {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const tasks = await response.json();
                return tasks;
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
                showError('Could not connect to the server to fetch tasks.');
                return [];
            }
        }

        /**
         * Adds a new task.
         * @param {string} text - The content of the task.
         */
        async function addTask(text) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                if (!response.ok) throw new Error('Failed to add task');
                return await response.json();
            } catch (error) {
                console.error('Failed to add task:', error);
                showError('Failed to add the new task. Please try again.');
                return null;
            }
        }

        /**
         * Updates a task's completion status.
         * @param {string} id - The ID of the task.
         * @param {boolean} completed - The new completion status.
         */
        async function updateTask(id, completed) {
             try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed })
                });
                if (!response.ok) throw new Error('Failed to update task');
                return await response.json();
            } catch (error) {
                console.error('Failed to update task:', error);
                showError('Could not update the task. Please refresh and try again.');
                return null;
            }
        }

        /**
         * Deletes a task from the server.
         * @param {string} id - The ID of the task to delete.
         */
        async function deleteTask(id) {
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Failed to delete task');
                return true;
            } catch (error) {
                console.error('Failed to delete task:', error);
                showError('Could not delete the task. Please refresh and try again.');
                return false;
            }
        }

        // --- DOM Manipulation ---
        
        /**
         * Renders the list of tasks to the DOM.
         * @param {Array} tasks - An array of task objects.
         */
        function renderTasks(tasks) {
            loadingIndicator.style.display = 'none';
            taskList.innerHTML = '';
            if (tasks.length === 0) {
                taskList.innerHTML = `<li class="text-center text-gray-500 bg-white rounded-lg shadow-md p-6">No tasks yet. Add one above!</li>`;
                return;
            }
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                taskList.appendChild(taskElement);
            });
        }
        
        /**
         * Creates an HTML element for a single task.
         * @param {object} task - The task object.
         */
        function createTaskElement(task) {
            const li = document.createElement('li');
            li.className = `task-item flex items-center justify-between bg-white p-4 rounded-lg shadow-md transition-all duration-300 ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            const taskText = document.createElement('span');
            taskText.textContent = task.text;
            taskText.className = 'flex-grow';

            const buttonWrapper = document.createElement('div');
            buttonWrapper.className = 'flex items-center gap-3';

            // Complete button
            const completeBtn = document.createElement('button');
            completeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>`;
            completeBtn.className = task.completed 
                ? 'text-green-500 hover:text-green-700' 
                : 'text-gray-400 hover:text-green-500';
            completeBtn.onclick = () => handleToggleComplete(task.id, !task.completed);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>`;
            deleteBtn.className = 'text-gray-400 hover:text-red-500';
            deleteBtn.onclick = () => handleDeleteTask(task.id);
            
            buttonWrapper.appendChild(completeBtn);
            buttonWrapper.appendChild(deleteBtn);
            li.appendChild(taskText);
            li.appendChild(buttonWrapper);

            return li;
        }

        /**
         * Shows an error message to the user.
         * @param {string} message - The error message to display.
         */
        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
            setTimeout(() => {
                errorMessage.classList.add('hidden');
            }, 5000);
        }

        // --- Event Handlers ---

        /**
         * Handles the form submission to add a new task.
         */
        async function handleAddTask(event) {
            event.preventDefault();
            const text = taskInput.value.trim();
            if (!text) return;
            
            const newTask = await addTask(text);
            if (newTask) {
                const taskElement = createTaskElement(newTask);
                // If this is the first task, clear the "No tasks" message
                if (taskList.querySelector('.text-center')) {
                    taskList.innerHTML = '';
                }
                taskList.appendChild(taskElement);
                taskInput.value = '';
            }
        }

        /**
         * Handles toggling the completion status of a task.
         */
        async function handleToggleComplete(id, newStatus) {
            const updatedTask = await updateTask(id, newStatus);
            if (updatedTask) {
                const taskElement = document.querySelector(`li[data-id='${id}']`);
                if (taskElement) {
                    taskElement.classList.toggle('completed', newStatus);
                    taskElement.querySelector('button').className = newStatus
                        ? 'text-green-500 hover:text-green-700' 
                        : 'text-gray-400 hover:text-green-500';
                }
            }
        }

        /**
         * Handles the deletion of a task.
         */
        async function handleDeleteTask(id) {
            const success = await deleteTask(id);
            if (success) {
                const taskElement = document.querySelector(`li[data-id='${id}']`);
                if(taskElement) {
                    taskElement.classList.add('opacity-0', 'scale-90');
                    setTimeout(() => {
                        taskElement.remove();
                        if (taskList.children.length === 0) {
                            renderTasks([]); // Show "No tasks" message
                        }
                    }, 300);
                }
            }
        }

        // --- Initial Load ---
        
        /**
         * Initializes the application.
         */
        async function init() {
            taskForm.addEventListener('submit', handleAddTask);
            const tasks = await getTasks();
            renderTasks(tasks);
        }

        document.addEventListener('DOMContentLoaded', init);