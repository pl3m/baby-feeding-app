import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addFeeding, updateFeeding } from '../api/feedings';
import { format } from 'date-fns';

function FeedingForm({ feedingToEdit, onCancelEdit }) {
  // Define as a function to get fresh values when called
  const getInitialFormState = () => {
    const defaultType = 'bottle';
    return {
      // Format current date for datetime-local input
      timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      feedingType: defaultType,
      bottleContents: 'milk',
      amount: '',
      // Set the appropriate default unit based on feeding type
      unit:
        defaultType === 'breast' ? 'min' : defaultType === 'solid' ? 'g' : 'oz',
      notes: '',
    };
  };

  const [feedingData, setFeedingData] = useState(getInitialFormState());
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  // Reset form when editing feeding changes
  useEffect(() => {
    if (feedingToEdit) {
      // Format the timestamp for the datetime-local input
      const formattedDate = format(
        new Date(feedingToEdit.timestamp),
        "yyyy-MM-dd'T'HH:mm"
      );

      setFeedingData({
        ...feedingToEdit,
        timestamp: formattedDate,
        // Ensure all required fields exist
        bottleContents: feedingToEdit.bottleContents || 'milk',
      });
    } else {
      setFeedingData(getInitialFormState());
    }
  }, [feedingToEdit]);

  // Add feeding mutation
  const addMutation = useMutation({
    mutationFn: addFeeding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedings'] });
      setFeedingData(getInitialFormState());
      setError(null);
    },
    onError: (err) => {
      console.error('Error adding feeding:', err);
      setError('Failed to save feeding. Please try again.');
    },
  });

  // Update feeding mutation
  const updateMutation = useMutation({
    mutationFn: updateFeeding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedings'] });
      setFeedingData(getInitialFormState());
      setError(null);
      onCancelEdit(); // Exit edit mode
    },
    onError: (err) => {
      console.error('Error updating feeding:', err);
      setError('Failed to update feeding. Please try again.');
    },
  });

  // Combined mutation state
  const isSubmitting = addMutation.isPending || updateMutation.isPending;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeedingTypeChange = (e) => {
    const newType = e.target.value;

    // Set appropriate default unit based on feeding type
    let newUnit = feedingData.unit;
    if (newType === 'breast') {
      newUnit = 'min';
    } else if (newType === 'bottle') {
      newUnit = 'oz';
    } else if (newType === 'solid') {
      newUnit = 'g';
    }

    setFeedingData((prev) => ({
      ...prev,
      feedingType: newType,
      unit: newUnit,
      // Clear bottleContents if not bottle feeding
      bottleContents: newType === 'bottle' ? prev.bottleContents : null,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (feedingToEdit) {
        // Update existing feeding
        updateMutation.mutate(feedingData);
      } else {
        // Add new feeding
        addMutation.mutate(feedingData);
      }
    } catch {
      setError('Invalid form data. Please check your entries.');
    }
  };

  const handleCancel = () => {
    setFeedingData(getInitialFormState());
    setError(null);
    onCancelEdit();
  };

  return (
    <div className='feeding-form-container'>
      <h2>{feedingToEdit ? 'Edit Feeding Entry' : 'Add Feeding Entry'}</h2>

      {error && <div className='error-message'>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='timestamp'>Date & Time:</label>
          <input
            type='datetime-local'
            id='timestamp'
            name='timestamp'
            value={feedingData.timestamp}
            onChange={handleChange}
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='feedingType'>Type:</label>
          <select
            id='feedingType'
            name='feedingType'
            value={feedingData.feedingType}
            onChange={handleFeedingTypeChange}
          >
            <option value='bottle'>Bottle</option>
            <option value='breast'>Breast</option>
            <option value='solid'>Solid Food</option>
          </select>
        </div>

        {feedingData.feedingType === 'bottle' && (
          <div className='form-group'>
            <label htmlFor='bottleContents'>Bottle Contents:</label>
            <select
              id='bottleContents'
              name='bottleContents'
              value={feedingData.bottleContents}
              onChange={handleChange}
            >
              <option value='milk'>Milk</option>
              <option value='formula'>Formula</option>
            </select>
          </div>
        )}

        <div className='form-row'>
          <div className='form-group'>
            <label htmlFor='amount'>Amount:</label>
            <input
              type='number'
              id='amount'
              name='amount'
              value={feedingData.amount}
              onChange={handleChange}
              step='0.1'
              min='0'
              max={
                feedingData.feedingType === 'breast'
                  ? '60'
                  : feedingData.feedingType === 'bottle' &&
                    feedingData.unit === 'oz'
                  ? '12'
                  : feedingData.feedingType === 'bottle' &&
                    feedingData.unit === 'ml'
                  ? '325'
                  : feedingData.feedingType === 'solid' &&
                    feedingData.unit === 'g'
                  ? '300'
                  : '12'
              }
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='unit'>Unit:</label>
            <select
              id='unit'
              name='unit'
              value={feedingData.unit}
              onChange={handleChange}
            >
              {feedingData.feedingType === 'bottle' && (
                <>
                  <option value='oz'>oz</option>
                  <option value='ml'>ml</option>
                </>
              )}
              {feedingData.feedingType === 'breast' && (
                <option value='min'>minutes</option>
              )}
              {feedingData.feedingType === 'solid' && (
                <>
                  <option value='g'>grams</option>
                  <option value='oz'>oz</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className='form-group'>
          <label htmlFor='notes'>Notes:</label>
          <textarea
            id='notes'
            name='notes'
            value={feedingData.notes}
            onChange={handleChange}
            rows='3'
          ></textarea>
        </div>

        <div className='form-buttons'>
          {feedingToEdit && (
            <button
              type='button'
              onClick={handleCancel}
              className='cancel-button'
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}

          <button
            type='submit'
            className='submit-button'
            disabled={isSubmitting}
          >
            {isSubmitting
              ? feedingToEdit
                ? 'Updating...'
                : 'Saving...'
              : feedingToEdit
              ? 'Update Feeding'
              : 'Save Feeding'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FeedingForm;
