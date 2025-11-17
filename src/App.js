import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, MapPin, BookOpen } from 'lucide-react';
import { eventsData } from './data';
import RecipeBook from './RecipeBook';
import RecipeDetail from './RecipeDetail';
import './App.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  
  // Determine active tab based on route
  const activeTab = location.pathname.startsWith('/recipes') ? 'recipes' : 'calendar';
  
  const handleTabChange = (tab) => {
    if (tab === 'calendar') {
      navigate('/');
    } else if (tab === 'recipes') {
      navigate('/recipes');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    setError('');
    
    // Filter out past events
    const now = new Date();
    const upcomingEvents = eventsData.filter(event => {
      let eventEndDate;
      
      if (event.end && event.end.date) {
        // All-day event
        eventEndDate = new Date(event.end.date);
        // For all-day events, consider them past if they ended yesterday
        eventEndDate.setDate(eventEndDate.getDate() + 1);
      } else if (event.end && event.end.dateTime) {
        // Event with specific time
        eventEndDate = new Date(event.end.dateTime);
      } else if (event.start.date) {
        // All-day event without end date
        eventEndDate = new Date(event.start.date);
        eventEndDate.setDate(eventEndDate.getDate() + 1);
      } else {
        // Event with specific time without end date
        eventEndDate = new Date(event.start.dateTime);
      }
      
      return eventEndDate > now;
    });
    
    setEvents(upcomingEvents);
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('bg-BG', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('bg-BG', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const formatEventTime = (event) => {
    // Check if this is a date-only event (all-day event)
    const isStartDateOnly = event.start.date && !event.start.dateTime;
    const isEndDateOnly = event.end && event.end.date && !event.end.dateTime;
    
    if (isStartDateOnly) {
      // Handle all-day events
      const startDate = new Date(event.start.date);
      const startFormatted = startDate.toLocaleDateString('bg-BG', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (event.end && event.end.date) {
        const endDate = new Date(event.end.date);
        const endFormatted = endDate.toLocaleDateString('bg-BG', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        // If same day, show just the date
        if (startFormatted === endFormatted) {
          return { single: startFormatted };
        } else {
          // If different days, show date range on separate rows
          return { 
            start: `От: ${startFormatted}`,
            end: `До: ${endFormatted}`
          };
        }
      }
      
      return { single: startFormatted };
    }
    
    // Handle events with specific times
    const startFormatted = formatDateTime(event.start.dateTime);
    
    if (event.end && event.end.dateTime) {
      const endFormatted = formatDateTime(event.end.dateTime);
      
      // If same day, show date once with time range on separate rows
      if (startFormatted.date === endFormatted.date) {
        return {
          start: `От: ${startFormatted.time}`,
          end: `До: ${endFormatted.time}`,
          date: startFormatted.date
        };
      } else {
        // If different days, show both dates on separate rows
        return {
          start: `От: ${startFormatted.date} ${startFormatted.time}`,
          end: `До: ${endFormatted.date} ${endFormatted.time}`
        };
      }
    }
    
    // Fallback to start time only if no end time
    return { single: `${startFormatted.date} в ${startFormatted.time}` };
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🌟 Група Звездичка</h1>
          <p>Календар със събития и книга със здравословни рецепти</p>
        </header>

        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => handleTabChange('calendar')}
          >
            <CalendarIcon size={20} />
            Календар
          </button>
          <button
            className={`nav-tab ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => handleTabChange('recipes')}
          >
            <BookOpen size={20} />
            Рецепти
          </button>
        </nav>

        <Routes>
          <Route path="/" element={
            <>
              {error && (
                <div className="error">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {events.length > 0 && (
                <div className="events-container">
                  <div className="events-header">
                    <h2 className="events-title">📅 Предстоящи събития</h2>
                    <span className="events-count">
                      {events.length} събити{events.length === 1 ? 'е' : events.length > 1 ? 'я' : 'я'}
                    </span>
                  </div>

                  <div className="events-grid">
                    {events.map((event) => {
                      const eventTime = formatEventTime(event);
                      return (
                        <div key={event.id} className="event-card">
                          <h3 className="event-title">{event.summary}</h3>
                          <div className="event-time">
                            <Clock size={16} />
                            <div className="event-time-content">
                              {eventTime.single ? (
                                <span>{eventTime.single}</span>
                              ) : (
                                <div className="event-time-range">
                                  {eventTime.date && (
                                    <div className="event-date">{eventTime.date}</div>
                                  )}
                                  <div className="event-start">{eventTime.start}</div>
                                  <div className="event-end">{eventTime.end}</div>
                                </div>
                              )}
                            </div>
                          </div>
                          {event.description && (
                            <div className="event-description">
                              {event.description.split('\n').map((line, index) => (
                                <p key={index}>
                                  {line.split(/(\*\*.*?\*\*)/).map((part, partIndex) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                      // Remove the ** markers and make bold
                                      const boldText = part.slice(2, -2);
                                      return <strong key={partIndex}>{boldText}</strong>;
                                    }
                                    return <span key={partIndex}>{part}</span>;
                                  })}
                                </p>
                              ))}
                            </div>
                          )}
                          {event.location && (
                            <div className="event-location">
                              <MapPin size={16} />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {events.length === 0 && !error && (
                <div className="no-events">
                  <div className="no-events-icon">📅</div>
                  <h3>Няма намерени събития</h3>
                  <p>В момента няма събития за показване.</p>
                </div>
              )}
            </>
          } />
          <Route path="/recipes" element={<RecipeBook />} />
          <Route path="/recipes/:slug" element={<RecipeDetail />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

