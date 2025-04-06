import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { NovoOrcamento } from './NovoOrcamento';

interface Item {
  precoTotal: number;
  precoUnitario: number;
  produto: string;
  quantidade: number;
}

interface Orcamento {
  id: string;
  cliente: string;
  data: string;
  telefone: string;
  endereco: string;
  itens: Item[];
}

export function OrcamentoPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [criando, setCriando] = useState(false);
  const [orcamentoEditando, setOrcamentoEditando] = useState<Orcamento | undefined>();
  const [orcamentoParaExcluir, setOrcamentoParaExcluir] = useState<Orcamento | undefined>();

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

  const excluirOrcamento = async () => {
    if (!orcamentoParaExcluir) return;
    await deleteDoc(doc(db, 'orcamentos', orcamentoParaExcluir.id));
    setOrcamentos((prev) =>
      prev.filter((o) => o.id !== orcamentoParaExcluir.id)
    );
    setOrcamentoParaExcluir(undefined);
  };

  if (criando || orcamentoEditando) {
    return (
      <NovoOrcamento
        onVoltar={() => {
          setCriando(false);
          setOrcamentoEditando(undefined);
        }}
        orcamentoExistente={orcamentoEditando}
        onSalvarAtualizacao={(atualizado) => {
          if (orcamentoEditando) {
            setOrcamentos((prev) =>
              prev.map((o) => (o.id === atualizado.id ? atualizado : o))
            );
          } else {
            setOrcamentos((prev) => [...prev, atualizado]);
          }
          setCriando(false);
          setOrcamentoEditando(undefined);
        }}
      />
    );
  }

  return (
    <div className="p-4">
      <button
        onClick={() => setCriando(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded mb-6 text-lg flex items-center gap-2 shadow hover:bg-blue-700"
      >
        <span className="text-2xl">＋</span>
        Novo orçamento
      </button>

      <h2 className="text-xl font-semibold mb-4 text-gray-700">Orçamentos salvos:</h2>

      {orcamentos.length === 0 ? (
        <p className="text-gray-500">Nenhum orçamento encontrado.</p>
      ) : (
        <ul className="space-y-3">
          {orcamentos.map((orc) => (
            <li
              key={orc.id}
              className="border rounded p-4 shadow bg-white flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-blue-700">{orc.cliente}</p>
                <p className="text-sm text-gray-500">{orc.data}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold text-green-600">
                  R$ {orc.itens?.reduce((soma, item) => soma + item.precoTotal, 0).toFixed(2)}
                </p>
                <div className="flex gap-2">
                  <button
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => setOrcamentoEditando(orc)}
                  >
                    ✏️
                  </button>
                  <button
                    className="text-red-600 hover:underline text-sm"
                    onClick={() => setOrcamentoParaExcluir(orc)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de confirmação */}
      {orcamentoParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar exclusão</h3>
              <button onClick={() => setOrcamentoParaExcluir(undefined)}>✖</button>
            </div>
            <p className="mb-6">Deseja realmente excluir este orçamento?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setOrcamentoParaExcluir(undefined)}
              >
                Não
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={excluirOrcamento}
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
