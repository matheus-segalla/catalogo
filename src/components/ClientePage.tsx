import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
    addDoc,
    collection,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    Timestamp,
    query,
    where,
} from 'firebase/firestore';
import { NovoOrcamento } from './NovoOrcamento';

interface Cliente {
    id: string;
    nome: string;
    telefone: string;
    endereco: string;
    observacoes?: string;
    criadoEm?: Timestamp;
}

interface Orcamento {
    id: string;
    cliente: string;
    telefone: string;
    data: string;
    endereco: string;
    itens: {
        quantidade: number;
        produto: string;
        precoUnitario: number;
        precoTotal: number;
    }[];
    criadoEm: Timestamp;
}

export function ClientePage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [filtro, setFiltro] = useState('');
    const [form, setForm] = useState<Partial<Cliente>>({
        nome: '',
        telefone: '',
        endereco: '',
        observacoes: '',
    });
    const [orcamentoParaExcluir, setOrcamentoParaExcluir] = useState<Orcamento | null>(null);
    const [mensagem, setMensagem] = useState('');
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<Orcamento | null>(null);

    const excluirOrcamento = async () => {
        if (!orcamentoParaExcluir) return;
        await deleteDoc(doc(db, 'orcamentos', orcamentoParaExcluir.id));
        setOrcamentos((prev) => prev.filter((o) => o.id !== orcamentoParaExcluir.id));
        setOrcamentoParaExcluir(null);
    };

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

    useEffect(() => {
        async function carregarOrcamentos() {
            const snapshot = await getDocs(collection(db, 'orcamentos'));
            const lista = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Orcamento[];
            setOrcamentos(lista);
        }

        carregarOrcamentos();
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

            setClientes([...clientes, { ...form, id: docRef.id } as Cliente]);
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

    const handleSalvarAtualizacao = (orcamentoAtualizado: Orcamento) => {
        setOrcamentoSelecionado(null);
        setOrcamentos((prev) =>
            prev.map((o) => (o.id === orcamentoAtualizado.id ? orcamentoAtualizado : o))
        );
    };

    if (orcamentoSelecionado) {
        return (
            <NovoOrcamento
                onVoltar={() => setOrcamentoSelecionado(null)}
                orcamentoExistente={orcamentoSelecionado}
                onSalvarAtualizacao={handleSalvarAtualizacao}
            />
        );
    }

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
                <ul className="space-y-4">
                    {clientesFiltrados.map((c) => {
                        const orcamentosDoCliente = orcamentos.filter(
                            (o) => o.cliente.toLowerCase() === c.nome.toLowerCase()
                        );

                        return (
                            <li
                                key={c.id}
                                className="border p-4 rounded shadow-sm bg-gray-50"
                            >
                                <div className="mb-2">
                                    <p className="font-bold text-blue-800">{c.nome}</p>
                                    <p className="text-sm text-gray-600">
                                        {c.telefone} – {c.endereco}
                                    </p>
                                    {c.observacoes && (
                                        <p className="text-xs text-gray-500 italic">
                                            {c.observacoes}
                                        </p>
                                    )}
                                </div>

                                {orcamentosDoCliente.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm font-semibold text-gray-700 mb-1">Orçamentos:</p>
                                        <ul className="space-y-1">
                                            {orcamentosDoCliente.map((o) => (
                                                <li
                                                    key={o.id}
                                                    onClick={() => setOrcamentoSelecionado(o)}
                                                    className="cursor-pointer bg-white border p-2 rounded hover:bg-blue-50 flex justify-between items-center"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span>{o.data}</span>
                                                        <span className="text-blue-700 font-medium">
                                                            R$ {o.itens.reduce((s, i) => s + i.precoTotal, 0).toFixed(2)}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOrcamentoParaExcluir(o);
                                                            }}
                                                            className="text-red-500 hover:text-red-700 text-sm"
                                                            title="Excluir orçamento"
                                                        >
                                                            🗑️
                                                        </button>

                                                    </div>

                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
            {orcamentoParaExcluir && (
                <ConfirmDeleteModal
                    onConfirm={excluirOrcamento}
                    onCancel={() => setOrcamentoParaExcluir(null)}
                />
            )}

        </div>

    );
}
