import React, { useState } from 'react';
import { Product } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Props {
    product: Product;
    onClose: () => void;
    onUpdate: (updated: Product) => void;
}
function formatarPreco(valor: number) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    });
}

export function EditProductModal({ product, onClose, onUpdate }: Props) {
    const [form, setForm] = useState({ ...product });

    const handleUpdate = async () => {
        const ref = doc(db, 'produtos', form.id!);
        await updateDoc(ref, form);
        onUpdate(form);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Editar Produto</h2>

                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Nome"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border rounded p-2"
                    />
                    <input
                        type="text"
                        placeholder="Tipo"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full border rounded p-2"
                    />
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


                    <input
                        type="text"
                        placeholder="Unidade"
                        value={form.unit}
                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        className="w-full border rounded p-2"
                    />
                    <input
                        type="text"
                        placeholder="URL da imagem"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        className="w-full border rounded p-2"
                    />
                </div>

                <div className="mt-4 flex justify-between">
                    <button
                        onClick={onClose}
                        className="text-sm px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}
