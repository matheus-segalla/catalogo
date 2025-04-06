import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { EditProductModal } from './EditProductModal';

export function ProductList({
  products,
  setProducts,
}: {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Product | null>(null);
  const [busca, setBusca] = useState('');
  const [ultimoDoc, setUltimoDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [temMais, setTemMais] = useState(true);

  useEffect(() => {
    carregarMaisProdutos();
  }, []);

  const carregarMaisProdutos = async () => {
    if (carregando || !temMais) return;

    setCarregando(true);
    const ref = collection(db, 'produtos');
    const q = ultimoDoc
      ? query(ref, orderBy('name'), startAfter(ultimoDoc), limit(10))
      : query(ref, orderBy('name'), limit(10));

    const snapshot = await getDocs(q);
    const novos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];

    setProducts((prev) => [...prev, ...novos]);
    setUltimoDoc(snapshot.docs[snapshot.docs.length - 1]);
    setTemMais(!snapshot.empty && snapshot.docs.length === 10);
    setCarregando(false);
  };

  const produtosFiltrados = products.filter((p) =>
    p.name.toLowerCase().includes(busca.toLowerCase()) ||
    p.category.toLowerCase().includes(busca.toLowerCase())
  );

  const grouped = produtosFiltrados.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Product[]>);

  Object.keys(grouped).forEach((categoria) => {
    grouped[categoria].sort((a, b) => a.name.localeCompare(b.name));
  });

  async function excluirProduto(id?: string) {
    if (!id) return;
    await deleteDoc(doc(db, 'produtos', id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-8">
      {editing && (
        <EditProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onUpdate={(updated) =>
            setProducts((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            )
          }
        />
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou tipo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {Object.entries(grouped).length === 0 ? (
        <p className="text-gray-500">Nenhum produto encontrado.</p>
      ) : (
        Object.entries(grouped).map(([tipo, itens]) => (
          <div key={tipo}>
            <h3 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-1">
              {tipo}
            </h3>
            <div className="space-y-4">
              {itens.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-row items-center gap-4 border border-gray-200 rounded-xl px-2.5 py-2.5 sm:px-4 sm:py-4 bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="w-24 h-24 flex-shrink-0">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover rounded-md border border-gray-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center text-gray-400 text-sm">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex justify-between items-end">
                    <div className="w-full text-center">
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{p.name}</p>
                      <p className="text-lg sm:text-xl text-gray-700 mt-1">
                        R$ {(p.price ?? 0).toFixed(2)} por {p.unit}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-2 ml-4">
                      <button
                        onClick={() => setEditing(p)}
                        className="text-blue-600 hover:text-blue-800 text-xl"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setProdutoParaExcluir(p)}
                        className="text-red-600 hover:text-red-800 text-xl"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {temMais && (
        <div className="text-center mt-4">
          <button
            onClick={carregarMaisProdutos}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 text-sm rounded"
            disabled={carregando}
          >
            {carregando ? 'Carregando...' : 'Carregar mais produtos'}
          </button>
        </div>
      )}
    </div>
  );
}
