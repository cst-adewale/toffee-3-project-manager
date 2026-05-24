import { useMemo, useState } from 'react';

function dateKey(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function monthLabel(date) {
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date);
}

function buildMonthDays(anchorDate) {
  const first = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function CalendarView({ issues, sprints, onSelectIssue, onSelectSprint }) {
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const days = useMemo(() => buildMonthDays(anchorDate), [anchorDate]);
  const currentMonth = anchorDate.getMonth();

  const itemsByDate = useMemo(() => {
    const groups = {};

    issues.forEach((issue) => {
      const key = dateKey(issue.dueDate);
      if (!key) return;
      groups[key] = groups[key] || [];
      groups[key].push({ type: 'issue', id: issue._id, label: `${issue.issueKey} ${issue.title}` });
    });

    sprints.forEach((sprint) => {
      const startKey = dateKey(sprint.startDate);
      const endKey = dateKey(sprint.endDate);

      if (startKey) {
        groups[startKey] = groups[startKey] || [];
        groups[startKey].push({ type: 'sprint', id: sprint._id, label: `${sprint.name} starts` });
      }

      if (endKey) {
        groups[endKey] = groups[endKey] || [];
        groups[endKey].push({ type: 'sprint', id: sprint._id, label: `${sprint.name} ends` });
      }
    });

    return groups;
  }, [issues, sprints]);

  const moveMonth = (offset) => {
    setAnchorDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <section className="calendar-view" aria-label="Planning calendar">
      <div className="calendar-header">
        <button type="button" onClick={() => moveMonth(-1)}>Prev</button>
        <h3>{monthLabel(anchorDate)}</h3>
        <button type="button" onClick={() => moveMonth(1)}>Next</button>
      </div>

      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="calendar-grid">
        {days.map((day) => {
          const key = dateKey(day);
          const items = itemsByDate[key] || [];

          return (
            <article className={day.getMonth() === currentMonth ? 'calendar-day' : 'calendar-day muted-day'} key={key}>
              <div className="calendar-day-number">{day.getDate()}</div>
              <div className="calendar-items">
                {items.map((item) => (
                  <button
                    className={item.type === 'issue' ? 'calendar-item issue-date' : 'calendar-item sprint-date'}
                    key={`${item.type}-${item.id}-${item.label}`}
                    type="button"
                    onClick={() => {
                      if (item.type === 'issue') onSelectIssue(item.id);
                      if (item.type === 'sprint') onSelectSprint(item.id);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default CalendarView;
