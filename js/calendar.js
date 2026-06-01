let YEAR = 2026;

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const LONG_DAYS = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles',
  'Jueves', 'Viernes', 'Sábado'
];

const calendar = document.getElementById('calendar');

const modal = document.getElementById('date-modal');
const closeModal = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const modalExtra = document.getElementById('modal-extra');

const tooltip = document.getElementById('tooltip');
const tooltipTitle = document.getElementById('tooltip-title');
const tooltipSubtitle = document.getElementById('tooltip-subtitle');
const tooltipExtra = document.getElementById('tooltip-extra');

let selectedDay = null;
let tooltipTimeout = null;

function getISOWeek(date) {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = temp.getUTCDay() || 7;

  temp.setUTCDate(temp.getUTCDate() + 4 - dayNumber);

  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));

  return Math.ceil((((temp - yearStart) / 86400000) + 1) / 7);
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(date) {
  return `${LONG_DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function getDayInfo(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((selectedDate - today) / 86400000);
  const week = getISOWeek(selectedDate);

  let subtitle = '';

  if (diffDays === 0) {
    subtitle = 'hoy';
  } else if (diffDays > 0) {
    subtitle = `faltan ${diffDays} días`;
  } else {
    subtitle = `hace ${Math.abs(diffDays)} días`;
  }

  return {
    title: `${formatDate(selectedDate)}, Semana ${week}`,
    subtitle,
    extra: 'Puedes colocar aquí información del evento o festival.'
  };
}

function showTooltip(event, date) {
  clearTimeout(tooltipTimeout);

  const info = getDayInfo(date);

  tooltipTitle.textContent = info.title;
  tooltipSubtitle.textContent = info.subtitle;
  tooltipExtra.textContent = info.extra;

  tooltip.style.display = 'block';
  moveTooltip(event);
}

function moveTooltip(event) {
  const padding = 18;
  let left = event.clientX + padding;
  let top = event.clientY + padding;

  const rect = tooltip.getBoundingClientRect();

  if (left + rect.width > window.innerWidth) {
    left = event.clientX - rect.width - padding;
  }

  if (top + rect.height > window.innerHeight) {
    top = event.clientY - rect.height - padding;
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideTooltip() {
  tooltipTimeout = setTimeout(() => {
    tooltip.style.display = 'none';
  }, 80);
}

function openDateModal(cell, date) {
  if (selectedDay) selectedDay.classList.remove('selected');

  selectedDay = cell;
  selectedDay.classList.add('selected');

  const info = getDayInfo(date);

  modalTitle.textContent = info.title;
  modalSubtitle.textContent = info.subtitle;
  modalExtra.textContent = info.extra;

  modal.classList.remove('hidden');
}

function closeDateModal() {
  modal.classList.add('hidden');
}

function createMonth(monthIndex) {
  const month = document.createElement('article');
  month.className = `month month-${monthIndex + 1}`;

  const title = document.createElement('h2');
  title.className = 'month-title';
  title.innerHTML = `${MONTHS[monthIndex]} <span>${YEAR}</span>`;
  month.appendChild(title);

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const weekHeader = document.createElement('th');
  weekHeader.className = 'week-number';
  weekHeader.textContent = '';
  headerRow.appendChild(weekHeader);

  DAYS.forEach((day, index) => {
    const th = document.createElement('th');
    th.textContent = day;

    if (index === 0 || index === 6) {
      th.className = 'weekend';
    }

    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  const firstDay = new Date(YEAR, monthIndex, 1).getDay();
  const totalDays = daysInMonth(YEAR, monthIndex);

  let day = 1;

  while (day <= totalDays) {
    const row = document.createElement('tr');

    const weekCell = document.createElement('td');
    weekCell.className = 'week-number';
    weekCell.textContent = getISOWeek(new Date(YEAR, monthIndex, day));
    row.appendChild(weekCell);

    for (let i = 0; i < 7; i++) {
      const cell = document.createElement('td');

      if ((day === 1 && i < firstDay) || day > totalDays) {
        cell.className = 'empty';
        cell.textContent = ' ';
      } else {
        const date = new Date(YEAR, monthIndex, day);

        cell.className = 'day';

        if (i === 0) cell.classList.add('sunday');
        if (i === 6) cell.classList.add('saturday');

        const now = new Date();

        if (date.toDateString() === now.toDateString()) {
          cell.classList.add('today');
        }

        cell.textContent = day;

        cell.addEventListener('mouseenter', (event) => showTooltip(event, date));
        cell.addEventListener('mousemove', moveTooltip);
        cell.addEventListener('mouseleave', hideTooltip);
        cell.addEventListener('click', () => openDateModal(cell, date));

        day++;
      }

      row.appendChild(cell);
    }

    tbody.appendChild(row);
  }

  table.appendChild(tbody);
  month.appendChild(table);

  return month;
}

function renderYearButtons() {
  const container = document.getElementById('year-buttons');
  container.innerHTML = '';

  for (let year = 2024; year <= 2032; year++) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = year;

    if (year === YEAR) {
      button.classList.add('active');
    }

    button.addEventListener('click', () => {
      renderCalendar(year);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    container.appendChild(button);
  }
}

function renderCalendar(year = YEAR) {
  YEAR = year;

  document.getElementById('year-title').textContent = YEAR;

  if (selectedDay) {
    selectedDay.classList.remove('selected');
    selectedDay = null;
  }

  closeDateModal();
  hideTooltip();

  calendar.innerHTML = '';

  for (let month = 0; month < 12; month++) {
    calendar.appendChild(createMonth(month));
  }

  renderYearButtons();
}

closeModal.addEventListener('click', closeDateModal);

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeDateModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeDateModal();
    return;
  }

  if (event.key === 'ArrowLeft') {
    renderCalendar(YEAR - 1);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  if (event.key === 'ArrowRight') {
    renderCalendar(YEAR + 1);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
});

renderCalendar(2026);