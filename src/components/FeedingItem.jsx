import React from 'react';

function FeedingItem({ feeding }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <li className='feeding-item'>
      <div className='feeding-time'>{formatDate(feeding.timestamp)}</div>
      <div className='feeding-details'>
        <div className='feeding-type'>
          {feeding.feedingType === 'bottle'
            ? `Bottle (${feeding.bottleContents})`
            : feeding.feedingType}
        </div>
        <div className='feeding-amount'>
          {feeding.amount} {feeding.unit}
        </div>
      </div>
      {feeding.notes && <div className='feeding-notes'>{feeding.notes}</div>}
    </li>
  );
}

export default FeedingItem;
