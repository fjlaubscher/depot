import { Routes, Route } from 'react-router-dom';

// routes
import Settings from './pages/settings';
import NotFound from './pages/not-found';

// v2 routes (Phase 2 rebuilt components)
import HomeNew from './pages/v2/home';
import FactionNew from './pages/v2/faction';
import DatasheetNew from './pages/v2/datasheet';

const AppRoutes = () => (
  <Routes>
    {/* V2 routes - now primary routes */}
    <Route path="/" element={<HomeNew />} />
    <Route path="/faction/:id" element={<FactionNew />} />
    <Route path="/faction/:factionId/datasheet/:id" element={<DatasheetNew />} />
    <Route path="/settings" element={<Settings />} />

    {/* Catch all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
