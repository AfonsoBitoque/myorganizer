import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import type { DrawStroke } from '@/types/drawing';

function pathToDocId(githubPath: string): string {
  return githubPath.replace(/\//g, '__') || '_root';
}

export function useStudyDrawing(githubPath: string) {
  const { user } = useAuth();
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !githubPath || !db) {
      setStrokes([]);
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', user.uid, 'study_drawings', pathToDocId(githubPath));

    return onSnapshot(docRef, (snap) => {
      const data = snap.data();
      setStrokes(Array.isArray(data?.strokes) ? data.strokes : []);
      setLoading(false);
    });
  }, [user, githubPath]);

  const saveStrokes = async (newStrokes: DrawStroke[]) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid, 'study_drawings', pathToDocId(githubPath));
    await setDoc(docRef, {
      githubPath,
      strokes: newStrokes,
      updatedAt: Date.now(),
    });
  };

  return { strokes, loading, saveStrokes };
}
