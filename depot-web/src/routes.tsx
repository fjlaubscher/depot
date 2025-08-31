import { Routes, Route } from 'react-router-dom';

// routes
import Home from './pages/home';
import Datasheet from './pages/datasheet';
import Faction from './pages/faction';
import Settings from './pages/settings';

import NotFound from './pages/not-found';

// v2 routes (Phase 2 rebuilt components)
import HomeNew from './pages/v2/home';
import FactionNew from './pages/v2/faction';

const AppRoutes = () => (
  <Routes>
    {/* Legacy routes */}
    <Route path="/" element={<Home />} />
    <Route path="/faction/:id" element={<Faction />} />
    <Route path="/faction/:factionId/datasheet/:id" element={<Datasheet />} />
    <Route path="/settings" element={<Settings />} />

    {/* V2 routes - Phase 2 rebuilt components */}
    <Route path="/v2" element={<HomeNew />} />
    <Route path="/v2/home" element={<HomeNew />} />
    <Route path="/v2/faction/:id" element={<FactionNew />} />
    <Route path="/v2/faction/:factionId/datasheet/:id" element={<Datasheet />} />

    {/* Catch all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
