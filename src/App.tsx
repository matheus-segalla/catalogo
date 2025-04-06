import React, { useEffect, useState } from 'react';
import { Product } from './types';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ProductForm } from './components/ProductForm';
import { ProductList } from './components/ProductList';
import { BottomNav } from './components/BottomNav';
import { OrcamentoPage } from './components/OrcamentoPage';
import { Header } from './components/Header';
import { useIsMobile } from './hooks/useIsMobile';
import { ClientePage } from './components/ClientePage';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'produtos' | 'adicionar' | 'orcamento' | 'clientes'>('produtos');
  const [tipos, setTipos] = useState<string[]>([]);
  const isMobile = useIsMobile();

  // Carrega os produtos e tipos únicos
  useEffect(() => {
    async function fetchProducts() {
      const snapshot = await getDocs(collection(db, 'produtos'));
      const lista: Product[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(lista);

      const tiposUnicos = Array.from(new Set(lista.map((p) => p.category)));
      setTipos(tiposUnicos);
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header só aparece em desktop */}
      {!isMobile && (
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Conteúdo principal */}
      <div className="px-4 py-6 sm:px-6 max-w-4xl mx-auto">
        {activeTab === 'produtos' && (
          <ProductList products={products} setProducts={setProducts} />
        )}

        {activeTab === 'adicionar' && (
          <ProductForm setProducts={setProducts} tiposSugestao={tipos} />
        )}

        {activeTab === 'orcamento' && <OrcamentoPage />}

        {activeTab === 'clientes' && <ClientePage />}
      </div>

      {/* Bottom navigation só aparece no mobile */}
      {isMobile && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}
