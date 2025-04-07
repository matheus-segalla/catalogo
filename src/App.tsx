// App.tsx
import React, { useEffect, useState } from 'react';
import { Product } from './types';
import { db } from './firebase';
import {
  collection,
  getDocs,
  orderBy,
  query,
  startAfter,
  limit,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { ProductList } from './components/ProductList';
import { BottomNav } from './components/BottomNav';
import { OrcamentoPage } from './components/OrcamentoPage';
import { Header } from './components/Header';
import { useIsMobile } from './hooks/useIsMobile';
import { ClientePage } from './components/ClientePage';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'produtos' | 'orcamento' | 'clientes'>('produtos');
  const [tipos, setTipos] = useState<string[]>([]);
  const [ultimoDoc, setUltimoDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [temMais, setTemMais] = useState(true);

  const isMobile = useIsMobile();

  // Carregamento inicial
  useEffect(() => {
    if (products.length === 0) {
      carregarMaisProdutos();
    }
  }, []);

  const carregarMaisProdutos = async () => {
    if (carregando || !temMais) return;

    setCarregando(true);

    const ref = collection(db, 'produtos');
    const q = ultimoDoc
      ? query(ref, orderBy('name'), startAfter(ultimoDoc), limit(10))
      : query(ref, orderBy('name'), limit(10));

    const snapshot = await getDocs(q);
    const novos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    // ✅ Corrigido: impede duplicações com base nos IDs
    setProducts((prev) => {
      const idsExistentes = new Set(prev.map((p) => p.id));
      const novosFiltrados = novos.filter((p) => !idsExistentes.has(p.id));
      return [...prev, ...novosFiltrados];
    });

    setUltimoDoc(snapshot.docs[snapshot.docs.length - 1]);
    setTemMais(!snapshot.empty && snapshot.docs.length === 10);
    setCarregando(false);

    const tiposUnicos = Array.from(
      new Set([...products, ...novos].map((p) => p.category))
    );
    setTipos(tiposUnicos);
  };


  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {!isMobile && <Header activeTab={activeTab} setActiveTab={setActiveTab} />}

      <div className="px-4 py-6 sm:px-6 max-w-4xl mx-auto">
        {activeTab === 'produtos' && (
          <ProductList
            products={products}
            setProducts={setProducts}
            carregarMaisProdutos={carregarMaisProdutos}
            temMais={temMais}
          />
        )}
        {activeTab === 'orcamento' && <OrcamentoPage />}
        {activeTab === 'clientes' && <ClientePage />}
      </div>

      {isMobile && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}
