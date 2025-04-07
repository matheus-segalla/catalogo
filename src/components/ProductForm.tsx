import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Product } from '../types';

interface ProductFormProps {
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  tiposSugestao?: string[];
  onClose?: () => void;
}

export function ProductForm({ setProducts, tiposSugestao = [], onClose }: ProductFormProps) {
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    unit: 'UN',
    image: '',
  });

  const [mensagem, setMensagem] = useState('');

  const unidades = [
    'UN', 'KG', 'm', 'm²', 'm³', 'PC', 'L',
    'LATA (0,9L)', 'GALÃO(3,6L)', 'LATA(18L)',
    'SACO(15KG)', 'SACO(20KG)', 'SACO(50KG)',
  ];

  const salvarProduto = async () => {
    if (!form.name || !form.category || !form.price || !form.unit) {
      setMensagem('Preencha todos os campos!');
      setTimeout(() => setMensagem(''), 3000);
      return;
    }

    const novoProduto = {
      ...form,
      price: parseFloat(form.price),
      criadoEm: Timestamp.now(),
    };

    try {
      const docRef = await addDoc(collection(db, 'produtos'), novoProduto);
      setProducts((prev) => [...prev, { ...novoProduto, id: docRef.id }]);
      setMensagem('Produto cadastrado com sucesso!');
      setForm({ name: '', category: '', price: '', unit: 'UN', image: '' });

      if (onClose) onClose();

      setTimeout(() => setMensagem(''), 3000);
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      setMensagem('Erro ao cadastrar produto.');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-blue-700">Cadastrar Produto</h2>

      {mensagem && (
        <div className="bg-blue-100 text-blue-700 text-sm px-4 py-2 rounded shadow">
          {mensagem}
        </div>
      )}

      <input
        type="text"
        placeholder="Nome do produto"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="text"
        list="sugestoes-tipo"
        placeholder="Tipo do produto"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      />
      <datalist id="sugestoes-tipo">
        {tiposSugestao.map((tipo, i) => (
          <option key={i} value={tipo} />
        ))}
      </datalist>

      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        placeholder="Preço (ex: 9.90)"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        className="w-full border px-3 py-2 rounded appearance-none"
      />

      <select
        value={form.unit}
        onChange={(e) => setForm({ ...form, unit: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      >
        {unidades.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="URL da imagem (opcional)"
        value={form.image}
        onChange={(e) => setForm({ ...form, image: e.target.value })}
        className="w-full border px-3 py-2 rounded"
      />

      <button
        onClick={salvarProduto}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
      >
        Salvar Produto
      </button>
    </div>
  );
}
