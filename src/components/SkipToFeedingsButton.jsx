import React from 'react';

function SkipToFeedingsButton() {
  const scrollToFeedings = () => {
    document.getElementById('feeding-history')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <button
      className='mobile-skip-to-feedings'
      onClick={scrollToFeedings}
      aria-label='Skip to feeding history'
    >
      View Feeding History
    </button>
  );
}

export default SkipToFeedingsButton;
