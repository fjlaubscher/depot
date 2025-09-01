import { Routes, Route } from 'react-router-dom';

// routes
import NotFound from './pages/not-found';

// v2 routes (Phase 2 rebuilt components)
import Home from './pages/v2/home';
import Faction from './pages/v2/faction';
import Datasheet from './pages/v2/datasheet';
import Settings from './pages/v2/settings';

const AppRoutes = () => (
  <Routes>
    {/* V2 routes - now primary routes */}
    <Route path="/" element={<Home />} />
    <Route path="/faction/:id" element={<Faction />} />
    <Route path="/faction/:factionId/datasheet/:id" element={<Datasheet />} />
    <Route path="/settings" element={<Settings />} />

    {/* Catch all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
