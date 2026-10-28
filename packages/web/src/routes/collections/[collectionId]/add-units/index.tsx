import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useNavigate } from '@/lib/navigation';

import AppLayout from '@/components/layout';
import { Loader, Alert } from '@/components/ui';
import AddUnitsView from '@/components/shared/add-units-view';
import { useToast } from '@/contexts/toast/context';
import useCollection from '@/hooks/use-collection';
import type { SelectedUnit } from '@/hooks/use-roster-unit-selection';
import {
  calculateCollectionPoints,
  createCollectionUnitFromDatasheet
} from '@depot/core/utils/collection';

const AddCollectionUnitsView: FC<{ collectionId?: string }> = ({ collectionId }) => {
  const { t, i18n } = useTranslation(['common', 'collections', 'rosters']);
  const { t: collectionT } = useTranslation('collections');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { collection, loading, error, save } = useCollection(collectionId);

  const factionSlug = collection?.faction?.slug ?? collection?.factionSlug ?? collection?.factionId;

  const pageTitle = collection
    ? collectionT('units.addTitle', { name: collection.name })
    : collectionT('units.addDocument');
  const back = { to: `/collections/${collectionId}`, label: t('navigation.collection') };

  if (loading) {
    return (
      <AppLayout title={pageTitle} back={back}>
        <Loader />
      </AppLayout>
    );
  }

  if (error || !collection) {
    return (
      <AppLayout title={pageTitle} back={back}>
        <Alert variant="error" title={collectionT('pages.loadCollectionFailed')}>
          {collectionT(error ? 'pages.collectionError' : 'pages.notFound')}
        </Alert>
      </AppLayout>
    );
  }

  const points = calculateCollectionPoints(collection);
  const factionLabel = collection.faction?.name || collection.factionSlug || collection.factionId;
  const subtitle = `${factionLabel} - ${t('form.totalPoints', { ns: 'rosters', points: points.toLocaleString(i18n.resolvedLanguage) })}`;

  const handleAddSelectedUnits = async (
    selectedUnits: SelectedUnit[],
    clearSelection: () => void
  ) => {
    if (!collection || selectedUnits.length === 0) return;

    const newUnits = selectedUnits.map(({ datasheet, modelCost }) =>
      createCollectionUnitFromDatasheet(datasheet, modelCost)
    );
    const updated = {
      ...collection,
      items: [...collection.items, ...newUnits]
    };

    try {
      await save(updated);
      clearSelection();
      showToast({
        type: 'success',
        title: t('notifications.unitsAdded', { ns: 'rosters' }),
        message: collectionT('notifications.unitsAddedMessage', { count: selectedUnits.length })
      });
      navigate(`/collections/${collection.id}`);
    } catch (err) {
      console.error('Failed to add units to collection entry', err);
      showToast({
        type: 'error',
        title: t('error.label'),
        message: collectionT('notifications.addError')
      });
    }
  };

  return (
    <AddUnitsView
      factionSlug={factionSlug}
      backTo={`/collections/${collection.id}`}
      backLabel={collection.name}
      documentTitle={pageTitle}
      title={t('units.add', { ns: 'rosters' })}
      subtitle={`${collection.name} · ${subtitle}`}
      onConfirm={handleAddSelectedUnits}
    />
  );
};

const AddCollectionUnitsPage: FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();

  return <AddCollectionUnitsView collectionId={collectionId} />;
};

export default AddCollectionUnitsPage;
