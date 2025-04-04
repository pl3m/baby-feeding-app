import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFeedings, deleteFeeding } from '../api/feedings';
import { format } from 'date-fns';

function FeedingList({ onEditFeeding }) {
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Query to fetch feedings
  const {
    data: feedings = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['feedings'],
    queryFn: fetchFeedings,
  });

  // Mutation for delete
  const deleteMutation = useMutation({
    mutationFn: deleteFeeding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedings'] });
      setDeleteConfirm(null);
    },
    onError: (err) => {
      console.error('Error deleting feeding:', err);
    },
  });

  const handleDeleteClick = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const formatDate = (timestamp) => {
    return format(new Date(timestamp), 'EEE, MMM d, h:mm a');
  };

  if (isLoading) {
    return <div className='loading-message'>Loading feedings...</div>;
  }

  if (isError) {
    return <div className='error-message'>Error: {error.message}</div>;
  }

  if (feedings.length === 0) {
    return (
      <div className='empty-state'>
        No feeding entries yet. Add your first one using the form above.
      </div>
    );
  }

  return (
    <div
      className='list-section'
      id='feeding-history'
    >
      <h2>Feeding History</h2>
      <ul className='feeding-list'>
        {feedings.map((feeding) => (
          <li
            key={feeding.id}
            className='feeding-item'
          >
            <div className='feeding-time'>{formatDate(feeding.timestamp)}</div>
            <div className='feeding-details'>
              <div
                className='feeding-type'
                data-type={feeding.feedingType}
              >
                {feeding.feedingType === 'bottle'
                  ? `bottle (${feeding.bottleContents})`
                  : feeding.feedingType}
              </div>
              <div className='feeding-amount'>
                {feeding.amount} {feeding.unit}
              </div>
            </div>

            {feeding.notes && (
              <div className='feeding-notes'>{feeding.notes}</div>
            )}

            <div className='feeding-actions'>
              <button
                className='edit-button'
                onClick={() => onEditFeeding(feeding)}
                disabled={deleteConfirm === feeding.id}
              >
                Edit
              </button>

              {deleteConfirm !== feeding.id ? (
                <button
                  className='delete-button'
                  onClick={() => handleDeleteClick(feeding.id)}
                >
                  Delete
                </button>
              ) : (
                <div className='delete-confirm'>
                  <div className='confirm-message'>Delete this feeding?</div>
                  <div className='confirm-buttons'>
                    <button
                      className='confirm-yes'
                      onClick={() => confirmDelete(feeding.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Yes'}
                    </button>
                    <button
                      className='confirm-no'
                      onClick={cancelDelete}
                      disabled={deleteMutation.isPending}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FeedingList;
