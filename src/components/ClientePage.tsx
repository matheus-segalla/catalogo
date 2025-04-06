import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
    addDoc,
    collection,
    getDocs,
    Timestamp,
} from 'firebase/firestore';

interface Cliente {
    id?: string;
    nome: string;
    telefone: string;
    endereco: string;
    observacoes?: string;
    criadoEm?: Timestamp;
}

export function ClientePage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [filtro, setFiltro] = useState('');
    const [form, setForm] = useState<Cliente>({
        nome: '',
        telefone: '',
        endereco: '',
        observacoes: '',
    });
    const [mensagem, setMensagem] = useState('');

    // Carregar clientes do Firebase
    useEffect(() => {
        async function carregarClientes() {
            const snapshot = await getDocs(collection(db, 'clientes'));
            const lista = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Cliente[];
            setClientes(lista);
        }

        carregarClientes();
    }, []);

    const salvarCliente = async () => {
        if (!form.nome || !form.telefone || !form.endereco) {
            setMensagem('Preencha todos os campos obrigatórios!');
            setTimeout(() => setMensagem(''), 3000);
            return;
        }

        try {
            const docRef = await addDoc(collection(db, 'clientes'), {
                ...form,
                criadoEm: Timestamp.now(),
            });

            setClientes([...clientes, { ...form, id: docRef.id }]);
            setMensagem('Cliente cadastrado com sucesso!');
            setForm({ nome: '', telefone: '', endereco: '', observacoes: '' });

            setTimeout(() => setMensagem(''), 3000);
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            setMensagem('Erro ao salvar cliente.');
        }
    };

    const clientesFiltrados = clientes.filter((c) =>
        c.nome.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="bg-white p-4 rounded shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Cadastro de Clientes</h2>

            {mensagem && (
                <div className="mb-4 p-2 text-center text-sm rounded bg-blue-100 text-blue-700 shadow">
                    {mensagem}
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Nome"
                    className="border p-2 rounded"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Telefone"
                    className="border p-2 rounded"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Endereço"
                    className="border p-2 rounded col-span-full"
                    value={form.endereco}
                    onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                />
                <textarea
                    placeholder="Observações (opcional)"
                    className="border p-2 rounded col-span-full"
                    value={form.observacoes}
                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                />
            </div>

            <button
                onClick={salvarCliente}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition mb-6"
            >
                ➕ Salvar Cliente
            </button>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="border p-2 w-full rounded"
                />
            </div>

            <h3 className="text-xl font-semibold mb-2 text-gray-700">Lista de Clientes</h3>

            {clientesFiltrados.length === 0 ? (
                <p className="text-gray-500">Nenhum cliente encontrado.</p>
            ) : (
                <ul className="space-y-2">
                    {clientesFiltrados.map((c) => (
                        <li
                            key={c.id}
                            className="border p-3 rounded shadow flex justify-between items-center"
                        >
                            <div>
                                <p className="font-bold text-blue-800">{c.nome}</p>
                                <p className="text-sm text-gray-600">{c.telefone} – {c.endereco}</p>
                                {c.observacoes && (
                                    <p className="text-xs text-gray-400 italic mt-1">
                                        {c.observacoes}
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
