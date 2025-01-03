const countElement = document.getElementById('count');
const incrementButton = document.querySelectorAll('.increment');
const decrementButton = document.querySelectorAll('.decrement');
const calendarView = document.getElementById('calendar-view');
const listView = document.getElementById('list-view');


// Function to get the current date in YYYY-MM-DD format
function getCurrentDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Function to load swings from localStorage
function loadSwings() {
  const currentDate = getCurrentDate();
  const swings = localStorage.getItem(currentDate) || 0;
  countElement.textContent = swings;
}

// Function to save swings to localStorage
function saveSwings(count) {
  const currentDate = getCurrentDate();
  localStorage.setItem(currentDate, count);
}

// Event listeners for increment and decrement buttons
incrementButton.forEach(button => {
  button.addEventListener('click', (e) => {
    let count = parseInt(countElement.textContent);
    let amt = e.target.dataset.count || 1;
    count += parseInt(amt);
    countElement.textContent = count;
    saveSwings(count);
  });
});

decrementButton.forEach(button => {
  button.addEventListener('click', (e) => {
    let count = parseInt(countElement.textContent);
    let amt = e.target.dataset.count || 1;
    count = Math.max(0, count - parseInt(amt)); // Prevent negative counts
    countElement.textContent = count;
    saveSwings(count);
  });
});

// Load initial swings on page load
loadSwings();


let currentMonth = new Date().getMonth(); // Start with the current month
let currentYear = new Date().getFullYear();


// Function to generate the calendar grid
function generateCalendar(currentDate) {
  const [year, month, day] = currentDate.split('-').map(Number);
  currentMonth = month - 1; // Update the current month (adjust for 0-indexing)
  currentYear = year;

  const firstDay = (new Date(currentYear, currentMonth)).getDay();
  const daysInMonth = 32 - new Date(currentYear, currentMonth, 32).getDate();

  let table = '<table><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr><tr>';
  let totalSwingsCount = 0;

  let date = 1;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        table += '<td></td>';
      } else if (date > daysInMonth) {
        break;
      } else {
        const today = getCurrentDate();
        const displayDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
        const isToday = displayDate === today;
        const swings = localStorage.getItem(displayDate) || 0;
        table += `<td class="${isToday ? 'current-date' : ''}" data-date="${displayDate}"><span class="date-label">${date}</span> <span class="swings-count">${swings}</span></td>`;
        date++;
        totalSwingsCount += parseInt(swings);
      }
    }
    table += '</tr><tr>';
  }
  table += '</tr></table>';



  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthYearHeader = `${monthNames[currentMonth]} ${currentYear}`;
  calendarView.innerHTML = `<h3>${monthYearHeader}</h3>${table}`;

  totalswings.textContent = totalSwingsCount;
}

// Function to generate the list view
function generateListView(currentDate) {
  const swingData = Object.entries(localStorage)
    .sort((a, b) => b[0].localeCompare(a[0])); // Sort by date (descending)

  let list = '<ul data-stack>';
  swingData.forEach(([date, swings]) => {
    list += `<li data-cluster="between"><span>${date}:</span> <span>${swings} swings</span></li>`;
  });
  list += '</ul>';
  listView.innerHTML = list;
}

// Event listener for the toggle button
const toggleViewButton = document.getElementById('toggle-view');
toggleViewButton.addEventListener('click', () => {
  if (calendarView.style.display === 'none') {
    calendarView.style.display = 'block';
    listView.style.display = 'none';
    toggleViewButton.textContent = 'Switch to List View';
  } else {
    calendarView.style.display = 'none';
    listView.style.display = 'block';
    toggleViewButton.textContent = 'Switch to Calendar View';
  }
});

// Generate initial views
const currentDate = getCurrentDate();
generateCalendar(currentDate);
generateListView(currentDate);

// Event listeners for previous and next buttons
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');

prevMonthButton.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11; // Wrap around to December
    currentYear--;
  }
  const newDate = new Date(currentYear, currentMonth, 1);
  generateCalendar(newDate.toISOString().split('T')[0]);
});

nextMonthButton.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0; // Wrap around to January
    currentYear++;
  }
  const newDate = new Date(currentYear, currentMonth, 1);
  generateCalendar(newDate.toISOString().split('T')[0]);
});

// Generate initial view with the current date
generateCalendar(getCurrentDate());

// Function to generate the graph
function generateGraph() {
  const swingData = Object.entries(localStorage)
    .sort((a, b) => a[0].localeCompare(b[0])); // Sort by date (ascending)

  const labels = swingData.map(([date, _]) => date);
  const data = swingData.map(([_, swings]) => swings);

  const ctx = document.getElementById('swingChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Kettlebell Swings',
        data: data,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Generate the graph initially
generateGraph();



// Total swings calc
// get all days for month




// Sync Data
function syncUp() {
  const localData = JSON.stringify(localStorage);
  try {
    fetch('https://iowaztlan.com/dbsync/dbsync.php', {
        method: 'POST',
        body: localData
    })
    .then(response => response.json())
    .then(data => {
        alert(`Your sync code is: ${data.code}`);
    });
  } catch (error) {
    alert('Error syncing up: ' + error);
  }
}

function syncDown() {
  const code = prompt('Enter your sync code:');
  try {
    fetch(`https://iowaztlan.com/dbsync/dbsync.php?code=${code}`)
    .then(response => response.json())
    .then(data => {

      if (data.error) {
        alert(data.error + '. Please check your code and try again.');
        return;
      }

        Object.keys(data).forEach(key => {
            localStorage.setItem(key, data[key]);
        });
        alert('Sync completed successfully!');
        window.location.reload();
    });
  } catch (error) {
    alert('Invalid sync code. Please try again.');
  }
}


syncbutton.addEventListener('click', syncUp);
syncdownbutton.addEventListener('click', syncDown);
