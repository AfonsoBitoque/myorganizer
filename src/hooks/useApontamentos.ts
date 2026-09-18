import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import type { Cadeira, Aula } from '@/types';

function getDb(): Firestore {
  if (!db) throw new Error('Firebase não configurado');
  return db;
}

function userCollection(userId: string, name: string) {
  return collection(getDb(), 'users', userId, name);
}

function mapDoc<T>(id: string, data: DocumentData): T {
  return { id, ...data } as T;
}

export function useCadeiras() {
  const { user } = useAuth();
  const [cadeiras, setCadeiras] = useState<Cadeira[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCadeiras([]);
      setLoading(false);
      return;
    }

    const q = query(userCollection(user.uid, 'cadeiras'), orderBy('name', 'asc'));

    return onSnapshot(q, (snap) => {
      setCadeiras(snap.docs.map((d) => mapDoc<Cadeira>(d.id, d.data())));
      setLoading(false);
    });
  }, [user]);

  const addCadeira = async (data: Omit<Cadeira, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | undefined> => {
    if (!user) return;
    const now = Date.now();
    const ref = await addDoc(userCollection(user.uid, 'cadeiras'), { ...data, createdAt: now, updatedAt: now });
    return ref.id;
  };

  const updateCadeira = async (id: string, data: Partial<Cadeira>) => {
    if (!user) return;
    await updateDoc(doc(getDb(), 'users', user.uid, 'cadeiras', id), { ...data, updatedAt: Date.now() });
  };

  const deleteCadeira = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(getDb(), 'users', user.uid, 'cadeiras', id));
  };

  return { cadeiras, loading, addCadeira, updateCadeira, deleteCadeira };
}

export function useAulas(cadeiraId?: string) {
  const { user } = useAuth();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !cadeiraId) {
      setAulas([]);
      setLoading(false);
      return;
    }

    const q = query(
      userCollection(user.uid, 'aulas'),
      where('cadeiraId', '==', cadeiraId),
    );

    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => mapDoc<Aula>(d.id, d.data()));
      list.sort((a, b) => a.number - b.number);
      setAulas(list);
      setLoading(false);
    });
  }, [user, cadeiraId]);

  const addAula = async (data: Omit<Aula, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | undefined> => {
    if (!user) return;
    const now = Date.now();
    const ref = await addDoc(userCollection(user.uid, 'aulas'), {
      ...data,
      drawing: data.drawing ?? [],
      createdAt: now,
      updatedAt: now,
    });
    return ref.id;
  };

  const updateAula = async (id: string, data: Partial<Aula>) => {
    if (!user) return;
    await updateDoc(doc(getDb(), 'users', user.uid, 'aulas', id), { ...data, updatedAt: Date.now() });
  };

  const deleteAula = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(getDb(), 'users', user.uid, 'aulas', id));
  };

  return { aulas, loading, addAula, updateAula, deleteAula };
}
