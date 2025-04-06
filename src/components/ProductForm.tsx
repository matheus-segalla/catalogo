import React, { useState } from 'react';
import { Product } from '../types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import InputMask from 'react-input-mask';

function formatarPreco(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function ProductForm({
  setProducts,
  tiposSugestao,
}: {
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  tiposSugestao: string[];
}) {
  const [form, setForm] = useState<Omit<Product, 'id'>>({
    name: '',
    category: '',
    price: 0,
    unit: '',
    image: '',
  });

  const [mensagem, setMensagem] = useState('');

  async function handleSubmit() {
    if (!form.name || !form.category || !form.unit || form.price <= 0) {
      setMensagem('⚠️ Preencha todos os campos corretamente.');
      return;
    }

    const docRef = await addDoc(collection(db, 'produtos'), form);
    setProducts((prev) => [...prev, { ...form, id: docRef.id }]);
    setMensagem('✅ Produto cadastrado com sucesso!');
    setForm({ name: '', category: '', price: 0, unit: '', image: '' });

    setTimeout(() => setMensagem(''), 3000);
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">Cadastrar Novo Produto</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nome"
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div className="relative">
          <input
            type="text"
            placeholder="Tipo"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            list="sugestoes-tipo"
          />
          <datalist id="sugestoes-tipo">
            {tiposSugestao.map((tipo, index) => (
              <option key={index} value={tipo} />
            ))}
          </datalist>
        </div>

        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Preço"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: parseFloat(e.target.value) || 0 })
          }
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />


        <select
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione a unidade</option>
          <option value="UN">UN</option>
          <option value="KG">KG</option>
          <option value="m">m</option>
          <option value="m²">m²</option>
          <option value="m³">m³</option>
          <option value="PC">PC</option>
          <option value="L">L</option>
          <option value="LATA (0,9L)">LATA (0,9L)</option>
          <option value="GALÃO (3,6L)">GALÃO (3,6L)</option>
          <option value="LATA (18L)">LATA (18L)</option>
          <option value="SACO (15KG)">SACO (15KG)</option>
          <option value="SACO (20KG)">SACO (20KG)</option>
          <option value="SACO (50KG)">SACO (50KG)</option>
        </select>


        <input
          type="text"
          placeholder="URL da Imagem (opcional)"
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-full"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow transition"
      >
        💾 Salvar Produto
      </button>

      {mensagem && (
        <div className="mt-3 text-sm text-green-600 font-medium">{mensagem}</div>
      )}
    </div>
  );
}
