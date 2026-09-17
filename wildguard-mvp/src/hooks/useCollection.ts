"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  type QueryConstraint,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";

interface UseCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  /** true when this data is coming from local mock/demo fallback, not Firestore */
  isMock: boolean;
}

/**
 * Subscribes to a Firestore collection in realtime. If Firebase isn't
 * configured yet (no env vars), falls back to the provided mock data so the
 * UI stays fully browsable during early development / offline demos.
 */
export function useCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  mockFallback: T[] = []
): UseCollectionResult<T> {
  const [data, setData] = useState<T[]>(mockFallback);
  const [loading, setLoading] = useState(!isFirebaseConfigured ? false : true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }
    const q = query(collection(db, collectionName), ...constraints);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setData(mockFallback);
        setLoading(false);
      }
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(constraints.map(String))]);

  return { data, loading, error, isMock: !isFirebaseConfigured };
}
