import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { EditProductModal } from './EditProductModal';
import { ProductForm } from './ProductForm';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ProductListProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  carregarMaisProdutos: () => void;
  temMais: boolean;
}

export function ProductList({
  products,
  setProducts,
  carregarMaisProdutos,
  temMais,
}: ProductListProps) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Product | null>(null);
  const [busca, setBusca] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);

  // 🔄 Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      const pertoDoFim = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (pertoDoFim && temMais) {
        carregarMaisProdutos();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [carregarMaisProdutos, temMais]);

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

  const confirmarExclusaoProduto = async () => {
    if (!produtoParaExcluir || !produtoParaExcluir.id) return;

    await deleteDoc(doc(db, 'produtos', produtoParaExcluir.id));
    setProducts((prev) => prev.filter((p) => p.id !== produtoParaExcluir.id));
    setProdutoParaExcluir(null);
  };

  return (
    <div className="space-y-6">
      {/* Botão cadastrar + título */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-blue-700">Produtos</h2>
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow text-sm"
        >
          ➕ Cadastrar Produto
        </button>
      </div>

      {/* Campo de busca */}
      <input
        type="text"
        placeholder="Buscar por nome ou tipo..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Modal de formulário de cadastro */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
            <button
              onClick={() => setMostrarForm(false)}
              className="absolute top-2 right-3 text-gray-600 hover:text-red-600 text-xl"
            >
              ×
            </button>
            <ProductForm
              setProducts={setProducts}
              onClose={() => setMostrarForm(false)}
            />
          </div>
        </div>
      )}

      {/* Lista de produtos por tipo */}
      {Object.entries(grouped).length === 0 ? (
        <p className="text-gray-500 text-center">Nenhum produto encontrado.</p>
      ) : (
        Object.entries(grouped).map(([categoria, itens]) => (
          <div key={categoria}>
            <h3 className="text-xl font-bold text-blue-700 mb-2 border-b pb-1">{categoria}</h3>
            <div className="space-y-4">
              {itens.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border rounded p-4 bg-white shadow-sm hover:shadow transition"
                >
                  <div className="flex items-center gap-4">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded border text-gray-400 text-sm">
                        Sem imagem
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{p.name}</p>
                      <p className="text-sm text-gray-600">
                        R$ {p.price?.toFixed(2)} por {p.unit}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 ml-4">
                    <button
                      onClick={() => setEditing(p)}
                      className="text-blue-600 hover:text-blue-800 text-lg"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setProdutoParaExcluir(p)}
                      className="text-red-600 hover:text-red-800 text-lg"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal de exclusão */}
      {produtoParaExcluir && (
        <ConfirmDeleteModal
          onConfirm={confirmarExclusaoProduto}
          onCancel={() => setProdutoParaExcluir(null)}
        />
      )}

      {/* Modal de edição */}
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
    </div>
  );
}
