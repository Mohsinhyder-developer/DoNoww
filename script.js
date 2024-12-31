const addTaskButton = document.getElementById('add-task-btn');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const notification = document.getElementById('notification');

// Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Function to display tasks
function renderTasks() {
  taskList.innerHTML = '';  // Clear the current list
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.classList.toggle('completed', task.completed);
    
    const taskText = document.createElement('span');
    taskText.textContent = task.text;
    
    // Show task time (start and end)
    const timeText = document.createElement('span');
    timeText.classList.add('task-time');
    timeText.textContent = `${task.startTime} - ${task.endTime}`;
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', () => deleteTask(index));

    li.appendChild(taskText);
    li.appendChild(timeText);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
  });
}

// Add a new task
function addTask() {
  const taskText = taskInput.value.trim();
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;
  
  if (taskText && startTime && endTime) {
    const newTask = {
      text: taskText,
      startTime: startTime,
      endTime: endTime,
      completed: false
    };
    tasks.push(newTask);
    taskInput.value = '';
    startTimeInput.value = '';
    endTimeInput.value = '';
    saveTasks();
    renderTasks();
  } else {
    alert('Please fill in all fields');
  }
}

// Delete a task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Show notification when task time arrives
function checkTasksTime() {
  const currentTime = new Date();
  tasks.forEach(task => {
    const [startHours, startMinutes] = task.startTime.split(':');
    const [endHours, endMinutes] = task.endTime.split(':');
    
    const taskStartTime = new Date(currentTime);
    taskStartTime.setHours(startHours, startMinutes, 0, 0); // Set the task start time
    
    const taskEndTime = new Date(currentTime);
    taskEndTime.setHours(endHours, endMinutes, 0, 0); // Set the task end time
    
    // Check if current time is between task start and end time
    if (currentTime >= taskStartTime && currentTime <= taskEndTime) {
      if (!task.completed) {
        // Notify user via app notification
        showNotification(`It's time for your task: ${task.text}`);
        
        // Optional: Notify using browser notification
        showBrowserNotification(`It's time for your task: ${task.text}`);
        
        task.completed = true; // Mark task as completed
        saveTasks();
        renderTasks();
      }
    }
  });
}

// Show notification in the app
function showNotification(message) {
  notification.textContent = message;
  notification.classList.add('show');
  
  // Set a timeout to hide notification after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 5000);
}

// Show browser notification
function showBrowserNotification(message) {
    if (Notification.permission === 'granted') {
      new Notification(message);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(message);
        } else {
          console.error('Notification permission denied');
        }
      });
    } else {
      console.error('Notification permission denied');
    }
}

// Event listeners
addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});

// Initial render
renderTasks();

// Check the task time every minute
setInterval(checkTasksTime, 60000); // Every minute
