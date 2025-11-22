import { Routes, Route } from 'react-router-dom';

// routes
import NotFound from './routes/not-found';
import Home from './routes/home';
import About from './routes/about';
import Factions from './routes/factions';
import Faction from './routes/factions/[factionSlug]';
import Datasheet from './routes/factions/[factionSlug]/datasheet/[datasheetSlug]';
import Settings from './routes/settings';
import Rosters from './routes/rosters';
import CreateRoster from './routes/rosters/create';
import EditRoster from './routes/rosters/[rosterId]/edit';
import RosterDetails from './routes/rosters/[rosterId]/details';
import ViewRoster from './routes/rosters/[rosterId]';
import AddRosterUnits from './routes/rosters/[rosterId]/add-units';
import EditRosterUnit from './routes/rosters/[rosterId]/units/[unitId]/edit';
import PrivacyPolicy from './routes/privacy';
import Collections from './routes/collections';
import CreateCollection from './routes/collections/create';
import CollectionView from './routes/collections/[collectionId]';
import AddCollectionUnits from './routes/collections/[collectionId]/add-units';
import EditCollectionUnit from './routes/collections/[collectionId]/units/[unitId]/edit';
import CollectionRosterSelect from './routes/collections/[collectionId]/new-roster';

const AppRoutes = () => (
  <Routes>
    {/* Primary application routes */}
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/factions" element={<Factions />} />
    <Route path="/faction/:factionSlug" element={<Faction />} />
    <Route path="/faction/:factionSlug/datasheet/:datasheetSlug" element={<Datasheet />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/collections" element={<Collections />} />
    <Route path="/collections/create" element={<CreateCollection />} />
    <Route path="/collections/:collectionId" element={<CollectionView />} />
    <Route path="/collections/:collectionId/add-units" element={<AddCollectionUnits />} />
    <Route path="/collections/:collectionId/new-roster" element={<CollectionRosterSelect />} />
    <Route path="/collections/:collectionId/units/:unitId/edit" element={<EditCollectionUnit />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/rosters" element={<Rosters />} />
    <Route path="/rosters/:rosterId/details" element={<RosterDetails />} />
    <Route path="/rosters/:rosterId/edit" element={<EditRoster />} />
    <Route path="/rosters/:rosterId/add-units" element={<AddRosterUnits />} />
    <Route path="/rosters/:rosterId/units/:unitId/edit" element={<EditRosterUnit />} />
    <Route path="/rosters/:rosterId" element={<ViewRoster />} />
    <Route path="/rosters/create" element={<CreateRoster />} />

    {/* Catch all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
