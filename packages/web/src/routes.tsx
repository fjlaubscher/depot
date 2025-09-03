import { Routes, Route } from 'react-router-dom';

// pages
import NotFound from './pages/not-found';
import Home from './pages/home';
import Factions from './pages/factions';
import Faction from './pages/faction';
import Datasheet from './pages/datasheet';
import Settings from './pages/settings';

const AppRoutes = () => (
  <Routes>
    {/* Primary application routes */}
    <Route path="/" element={<Home />} />
    <Route path="/factions" element={<Factions />} />
    <Route path="/faction/:id" element={<Faction />} />
    <Route path="/faction/:factionId/datasheet/:id" element={<Datasheet />} />
    <Route path="/settings" element={<Settings />} />

    {/* Catch all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
