import React from 'react';
import { Routes, Route } from 'react-router-dom';

// routes
import Home from './pages/home';
import Datasheet from './pages/datasheet';
import Faction from './pages/faction';

import NotFound from './pages/not-found';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/faction/:id" element={<Faction />} />
    <Route path="/faction/:factionId/datasheet/:id" element={<Datasheet />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
