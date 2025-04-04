import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Header from './components/Header';
import FeedingForm from './components/FeedingForm';
import FeedingList from './components/FeedingList';
import SkipToFeedingsButton from './components/SkipToFeedingsButton';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
    },
  },
});

function App() {
  // State to track the feeding being edited (null when not editing)
  const [editingFeeding, setEditingFeeding] = React.useState(null);

  const handleEditClick = (feeding) => {
    setEditingFeeding(feeding);
    // Scroll to form for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingFeeding(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className='app-container'>
        <Header />
        <SkipToFeedingsButton />
        <main className='app-content'>
          <FeedingForm
            feedingToEdit={editingFeeding}
            onCancelEdit={handleCancelEdit}
          />
          <FeedingList onEditFeeding={handleEditClick} />
        </main>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
