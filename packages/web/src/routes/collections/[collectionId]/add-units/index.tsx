import type { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AppLayout from '@/components/layout';
import { Loader, Alert } from '@/components/ui';
import AddUnitsView from '@/components/shared/add-units-view';
import { useToast } from '@/contexts/toast/context';
import useCollection from '@/hooks/use-collection';
import type { SelectedUnit } from '@/hooks/use-roster-unit-selection';
import { useDocumentTitle } from '@/hooks/use-document-title';
import {
  calculateCollectionPoints,
  createCollectionUnitFromDatasheet
} from '@depot/core/utils/collection';
import { COLLECTION_LABELS } from '@/utils/collection';

const AddCollectionUnitsView: FC<{ collectionId?: string }> = ({ collectionId }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const labels = COLLECTION_LABELS;
  const { collection, loading, error, save } = useCollection(collectionId);

  const factionSlug = collection?.faction?.slug ?? collection?.factionSlug ?? collection?.factionId;

  const pageTitle = collection
    ? `${collection.name} - Add Units`
    : `Add Units to ${labels.singularTitle}`;
  useDocumentTitle(pageTitle);

  if (loading) {
    return <Loader />;
  }

  if (error || !collection) {
    return (
      <Alert variant="error" title={`Unable to load ${labels.singular}`}>
        {error || `${labels.singularTitle} not found`}
      </Alert>
    );
  }

  const points = calculateCollectionPoints(collection);
  const factionLabel = collection.faction?.name || collection.factionSlug || 'Unknown faction';
  const subtitle = `${factionLabel} - ${points} point${points === 1 ? '' : 's'}`;

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
        title: 'Units Added',
        message: `Added ${selectedUnits.length} unit${selectedUnits.length === 1 ? '' : 's'}`
      });
      navigate(`/collections/${collection.id}`);
    } catch (err) {
      console.error('Failed to add units to collection entry', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: `Could not add units to this ${labels.singular}.`
      });
    }
  };

  return (
    <AddUnitsView
      factionSlug={factionSlug}
      backTo={`/collections/${collection.id}`}
      backLabel={`Back to ${labels.singularTitle}`}
      breadcrumbs={[
        { label: labels.pluralTitle, path: '/collections' },
        { label: collection.name, path: `/collections/${collection.id}` },
        { label: 'Add Units', path: `/collections/${collection.id}/add-units` }
      ]}
      title={collection.name}
      subtitle={subtitle}
      onConfirm={handleAddSelectedUnits}
    />
  );
};

const AddCollectionUnitsPage: FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const labels = COLLECTION_LABELS;

  return (
    <AppLayout title={`Add Units to ${labels.singularTitle}`}>
      <AddCollectionUnitsView collectionId={collectionId} />
    </AppLayout>
  );
};

export default AddCollectionUnitsPage;
