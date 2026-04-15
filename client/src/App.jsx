import { useState, useEffect } from 'react';
import Nav from './components/Nav.jsx';
import Home from './components/Home.jsx';
import PlanForm from './components/PlanForm.jsx';
import TripResult from './components/TripResult.jsx';
import TripLog from './components/TripLog.jsx';
import TripDetail from './components/TripDetail.jsx';
import SharedTrip from './components/SharedTrip.jsx';
import ProfileForm from './components/ProfileForm.jsx';
import TripStats from './components/TripStats.jsx';
import { getDogName, getDogNames } from './utils/profile.js';

function getSharedTrip() {
  try {
    const hash = window.location.hash;
    if (!hash.startsWith('#shared/')) return null;
    const encoded = hash.slice('#shared/'.length);
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return null;
  }
}

const TRIPS_KEY = 'basecamp_trips';

function loadTrips() {
  try {
    return JSON.parse(localStorage.getItem(TRIPS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTrips(trips) {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export default function App() {
  const sharedTrip = getSharedTrip();
  const [view, setView] = useState(sharedTrip ? 'shared' : 'home');
  const [trips, setTrips] = useState(loadTrips);
  const [currentTrip, setCurrentTrip] = useState(null); // { trip, constraints, id, date, status }
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [prefillConstraints, setPrefillConstraints] = useState(null);
  const [dogName, setDogName] = useState(() => getDogName(null));
  const [dogNames, setDogNames] = useState(() => getDogNames(null));

  useEffect(() => {
    saveTrips(trips);
  }, [trips]);

  function handleProfileSaved() {
    setDogName(getDogName(null));
    setDogNames(getDogNames(null));
  }

  function handlePlanComplete(trip, constraints) {
    const newEntry = {
      id: Date.now().toString(),
      trip,
      constraints,
      date: new Date().toISOString(),
      status: 'planned',
    };
    setCurrentTrip(newEntry);
    setView('result');
  }

  function handleSaveTrip(entry) {
    setTrips(prev => {
      const exists = prev.find(t => t.id === entry.id);
      if (exists) {
        return prev.map(t => t.id === entry.id ? entry : t);
      }
      return [entry, ...prev];
    });
  }

  function handleMarkDone(id) {
    setTrips(prev =>
      prev.map(t => t.id === id ? { ...t, status: 'done' } : t)
    );
    setCurrentTrip(prev => prev?.id === id ? { ...prev, status: 'done' } : prev);
  }

  function handleMarkPlanned(id) {
    setTrips(prev =>
      prev.map(t => t.id === id ? { ...t, status: 'planned' } : t)
    );
    setCurrentTrip(prev => prev?.id === id ? { ...prev, status: 'planned' } : prev);
  }

  function handleDeleteTrip(id) {
    setTrips(prev => prev.filter(t => t.id !== id));
  }

  function handleRateTrip(id, rating) {
    setTrips(prev =>
      prev.map(t => t.id === id ? { ...t, rating } : t)
    );
    setCurrentTrip(prev => prev?.id === id ? { ...prev, rating } : prev);
  }

  function handleUpdateNotes(id, notes) {
    setTrips(prev =>
      prev.map(t => t.id === id ? { ...t, notes } : t)
    );
    setCurrentTrip(prev => prev?.id === id ? { ...prev, notes } : prev);
  }

  function handleUpdatePhotos(id, photos) {
    setTrips(prev =>
      prev.map(t => t.id === id ? { ...t, photos } : t)
    );
    setCurrentTrip(prev => prev?.id === id ? { ...prev, photos } : prev);
  }

  function handleUpdateChecklist(id, checkedItems) {
    setTrips(prev =>
      prev.map(t => t.id === id ? { ...t, checkedItems } : t)
    );
    setCurrentTrip(prev => prev?.id === id ? { ...prev, checkedItems } : prev);
  }

  function handleUpdateConditionReport(id, conditionReport) {
    setTrips(prev =>
      prev.map(t => t.id === id ? { ...t, conditionReport } : t)
    );
    setCurrentTrip(prev => prev?.id === id ? { ...prev, conditionReport } : prev);
  }

  function handleRescheduleTrip(id, tripStartDate, tripEndDate, tripDates, tripLength) {
    setTrips(prev =>
      prev.map(t => t.id === id ? {
        ...t,
        constraints: { ...t.constraints, tripStartDate, tripEndDate, tripDates, tripLength },
      } : t)
    );
    setCurrentTrip(prev => prev?.id === id ? {
      ...prev,
      constraints: { ...prev.constraints, tripStartDate, tripEndDate, tripDates, tripLength },
    } : prev);
  }

  function handleReplan(tripOrConstraints, constraintsArg) {
    if (constraintsArg !== undefined) {
      // Called from ReplanModal with a freshly generated trip
      const newEntry = {
        id: Date.now().toString(),
        trip: tripOrConstraints,
        constraints: constraintsArg,
        date: new Date().toISOString(),
        status: 'planned',
      };
      setCurrentTrip(newEntry);
      nav('result');
    } else {
      // Fallback: prefill the plan form with original constraints
      setPrefillConstraints(tripOrConstraints);
      nav('plan');
    }
  }

  function handleViewTrip(id) {
    const trip = trips.find(t => t.id === id);
    if (trip) {
      setSelectedTripId(id);
      setCurrentTrip(trip);
      setView('detail');
    }
  }

  function nav(to) {
    setView(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f2ede0' }}>
      <Nav
        view={view}
        onNav={nav}
        tripCount={trips.length}
        hasProfile={!!localStorage.getItem('basecamp_profile')}
        dogName={dogName}
      />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px 80px' }}>
        {view === 'home' && (
          <Home
            trips={trips}
            onStartPlan={() => nav('plan')}
            onViewLog={() => nav('log')}
            onViewTrip={handleViewTrip}
            onNavProfile={() => nav('profile')}
            dogName={dogName}
            dogNames={dogNames}
          />
        )}

        {view === 'plan' && (
          <PlanForm
            onComplete={handlePlanComplete}
            onBack={() => nav('home')}
            prefill={prefillConstraints}
            onClearPrefill={() => setPrefillConstraints(null)}
          />
        )}

        {view === 'result' && currentTrip && (
          <TripResult
            entry={currentTrip}
            onSave={handleSaveTrip}
            onPlanAnother={() => nav('plan')}
            onViewLog={() => nav('log')}
          />
        )}

        {view === 'log' && (
          <TripLog
            trips={trips}
            onViewTrip={handleViewTrip}
            onMarkDone={handleMarkDone}
            onDelete={handleDeleteTrip}
            onStartPlan={() => nav('plan')}
            onReschedule={handleRescheduleTrip}
          />
        )}

        {view === 'detail' && currentTrip && (
          <TripDetail
            entry={currentTrip}
            onBack={() => nav('log')}
            onMarkDone={handleMarkDone}
            onMarkPlanned={handleMarkPlanned}
            onDelete={(id) => { handleDeleteTrip(id); nav('log'); }}
            onUpdateNotes={handleUpdateNotes}
            onUpdatePhotos={handleUpdatePhotos}
            onUpdateChecklist={handleUpdateChecklist}
            onUpdateConditionReport={handleUpdateConditionReport}
            onReplan={handleReplan}
            onRate={handleRateTrip}
          />
        )}

        {view === 'stats' && (
          <TripStats trips={trips} onStartPlan={() => nav('plan')} />
        )}

        {view === 'profile' && (
          <ProfileForm onBack={() => nav(view === 'profile' ? 'home' : view)} onSaved={handleProfileSaved} />
        )}

        {view === 'shared' && (
          <SharedTrip
            trip={sharedTrip}
            onPlanOwn={() => {
              window.location.hash = '';
              nav('plan');
            }}
            onSaveTrip={(trip) => {
              const newEntry = {
                id: Date.now().toString(),
                trip,
                constraints: {},
                date: new Date().toISOString(),
                status: 'planned',
              };
              handleSaveTrip(newEntry);
            }}
          />
        )}
      </main>
    </div>
  );
}
