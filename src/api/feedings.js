import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  orderBy,
  limit,
  startAfter,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Fetches all feeding entries ordered by timestamp (newest first)
 */
export const fetchFeedings = async () => {
  const q = query(collection(db, 'feedings'), orderBy('timestamp', 'desc'));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate(),
    createdAt: doc.data().createdAt?.toDate() || null,
    updatedAt: doc.data().updatedAt?.toDate() || null,
  }));
};

/**
 * Fetches a page of feeding entries for pagination
 * @param {Object} options - The options object
 * @param {FirebaseFirestore.DocumentSnapshot} [options.pageParam] - The last document from previous query
 * @param {number} [options.pageSize=10] - Number of items per page
 */
export const fetchFeedingsPage = async ({
  pageParam = null,
  pageSize = 10,
}) => {
  let q;

  if (pageParam) {
    q = query(
      collection(db, 'feedings'),
      orderBy('timestamp', 'desc'),
      startAfter(pageParam),
      limit(pageSize)
    );
  } else {
    q = query(
      collection(db, 'feedings'),
      orderBy('timestamp', 'desc'),
      limit(pageSize)
    );
  }

  const querySnapshot = await getDocs(q);

  const feedings = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate(),
    createdAt: doc.data().createdAt?.toDate() || null,
    updatedAt: doc.data().updatedAt?.toDate() || null,
  }));

  const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

  return {
    feedings,
    nextCursor: querySnapshot.docs.length === pageSize ? lastDoc : undefined,
  };
};

/**
 * Adds a new feeding entry to Firestore
 * @param {Object} feedingData - The feeding data to add
 */
export const addFeeding = async (feedingData) => {
  // Convert input data to Firestore format
  const dataToSave = {
    timestamp: Timestamp.fromDate(new Date(feedingData.timestamp)),
    feedingType: feedingData.feedingType,
    ...(feedingData.feedingType === 'bottle' && {
      bottleContents: feedingData.bottleContents,
    }),
    amount: parseFloat(feedingData.amount) || 0,
    unit: feedingData.unit,
    notes: feedingData.notes || '',
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, 'feedings'), dataToSave);

  // Return the newly created feeding with proper date formats for the client
  return {
    id: docRef.id,
    ...dataToSave,
    timestamp: new Date(feedingData.timestamp),
    createdAt: new Date(),
  };
};

/**
 * Updates an existing feeding entry in Firestore
 * @param {Object} feedingData - The feeding data with id to update
 */
export const updateFeeding = async ({ id, ...feedingData }) => {
  const feedingRef = doc(db, 'feedings', id);

  // Get current document to properly handle field removal
  const docSnap = await getDoc(feedingRef);
  if (!docSnap.exists()) {
    throw new Error('Feeding not found');
  }

  // Prepare data for update
  const dataToUpdate = {
    timestamp: Timestamp.fromDate(new Date(feedingData.timestamp)),
    feedingType: feedingData.feedingType,
    amount: parseFloat(feedingData.amount) || 0,
    unit: feedingData.unit,
    notes: feedingData.notes || '',
    updatedAt: Timestamp.now(),
  };

  // Handle conditional fields based on feeding type
  if (feedingData.feedingType === 'bottle') {
    dataToUpdate.bottleContents = feedingData.bottleContents;
  } else if (docSnap.data().bottleContents) {
    // Remove bottleContents field if it exists and feeding type is not bottle
    dataToUpdate.bottleContents = deleteField();
  }

  await updateDoc(feedingRef, dataToUpdate);

  // Return the updated feeding with proper date formats for the client
  return {
    id,
    ...dataToUpdate,
    timestamp: new Date(feedingData.timestamp),
    updatedAt: new Date(),
    // Preserve createdAt from the original document
    createdAt: docSnap.data().createdAt?.toDate() || null,
  };
};

/**
 * Deletes a feeding entry from Firestore
 * @param {string} id - The ID of the feeding to delete
 */
export const deleteFeeding = async (id) => {
  const feedingRef = doc(db, 'feedings', id);
  await deleteDoc(feedingRef);
  return id;
};

/**
 * Gets a single feeding entry by ID
 * @param {string} id - The ID of the feeding to retrieve
 */
export const getFeeding = async (id) => {
  const feedingRef = doc(db, 'feedings', id);
  const docSnap = await getDoc(feedingRef);

  if (!docSnap.exists()) {
    throw new Error('Feeding not found');
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    timestamp: data.timestamp.toDate(),
    createdAt: data.createdAt?.toDate() || null,
    updatedAt: data.updatedAt?.toDate() || null,
  };
};
