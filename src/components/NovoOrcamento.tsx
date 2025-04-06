import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface ItemOrcamento {
  quantidade: number;
  produto: string;
  precoUnitario: number;
  precoTotal: number;
}

interface Produto {
  id: string;
  name: string;
  price: number;
}

interface OrcamentoExistente {
  id?: string;
  cliente: string;
  telefone: string;
  data: string;
  endereco: string;
  itens: ItemOrcamento[];
}

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
}

interface NovoOrcamentoProps {
  onVoltar: () => void;
  orcamentoExistente?: OrcamentoExistente;
  onSalvarAtualizacao?: (orcamentoAtualizado: any) => void;
}

export function NovoOrcamento({ onVoltar, orcamentoExistente, onSalvarAtualizacao }: NovoOrcamentoProps) {
  const [cliente, setCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [data, setData] = useState('');
  const [endereco, setEndereco] = useState('');
  const [quantidade, setQuantidade] = useState<number>(0);
  const [produto, setProduto] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState<number>(0);
  const [itens, setItens] = useState<ItemOrcamento[]>([]);
  const [produtosCatalogo, setProdutosCatalogo] = useState<Produto[]>([]);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [clientesCadastrados, setClientesCadastrados] = useState<Cliente[]>([]);

  const totalGeral = itens.reduce((soma, item) => soma + item.precoTotal, 0);

  useEffect(() => {
    async function carregarProdutos() {
      const snapshot = await getDocs(collection(db, 'produtos'));
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Produto[];
      setProdutosCatalogo(lista);
    }

    carregarProdutos();
  }, []);

  useEffect(() => {
    async function carregarClientes() {
      const snapshot = await getDocs(collection(db, 'clientes'));
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Cliente[];
      setClientesCadastrados(lista);
    }

    carregarClientes();
  }, []);



  useEffect(() => {
    if (orcamentoExistente) {
      setCliente(orcamentoExistente.cliente);
      setTelefone(orcamentoExistente.telefone);
      setData(orcamentoExistente.data);
      setEndereco(orcamentoExistente.endereco);
      setItens(orcamentoExistente.itens || []);
    }
  }, [orcamentoExistente]);

  const adicionarItem = () => {
    if (!produto || quantidade <= 0 || precoUnitario <= 0) return;
    const precoTotal = quantidade * precoUnitario;
    const novoItem = { quantidade, produto, precoUnitario, precoTotal };
    setItens([...itens, novoItem]);
    setQuantidade(0);
    setProduto('');
    setPrecoUnitario(0);
  };

  const salvarOrcamento = async () => {
    if (!cliente || !telefone || !data || !endereco || itens.length === 0) {
      alert('Preencha todos os campos e adicione pelo menos um item.');
      return;
    }

    const orcamento = {
      cliente,
      telefone,
      data,
      endereco,
      itens,
      criadoEm: Timestamp.now(),
    };

    try {
      if (orcamentoExistente && orcamentoExistente.id) {
        const ref = doc(db, 'orcamentos', orcamentoExistente.id);
        await updateDoc(ref, orcamento);
        onSalvarAtualizacao?.({ ...orcamento, id: orcamentoExistente.id });
        setMensagemSucesso('Orçamento atualizado com sucesso!');
      } else {
        const docRef = await addDoc(collection(db, 'orcamentos'), orcamento);
        onSalvarAtualizacao?.({ ...orcamento, id: docRef.id });
        setMensagemSucesso('Orçamento salvo com sucesso!');
      }

      setTimeout(() => setMensagemSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      alert('Erro ao salvar orçamento.');
    }
  };

  return (
    <div className="p-4 bg-white min-h-screen">
      {mensagemSucesso && (
        <div className="bg-green-100 text-green-800 border border-green-400 px-4 py-2 rounded mb-4 text-center shadow">
          {mensagemSucesso}
        </div>
      )}
      <button
        onClick={onVoltar}
        className="text-blue-600 hover:text-blue-800 text-2xl mb-2"
      >
        ←
      </button>
      <div className="mt-6 flex justify-end">
        <button
          onClick={salvarOrcamento}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow"
        >
          {orcamentoExistente ? 'Salvar alterações' : 'Salvar orçamento e emitir pedido'}
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center mb-6">Benevis Materiais para Construção</h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <input type="text" placeholder="Nome do cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} className="border p-2 rounded w-full" />
        <input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="border p-2 rounded w-full" />
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="border p-2 rounded w-full" />
        <input type="text" placeholder="Endereço de entrega" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="border p-2 rounded w-full" />
        <div className="text-right text-lg font-bold text-blue-700 mb-4">
          Total do pedido: R$ {totalGeral.toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <input type="number" placeholder="Qtd" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} className="border p-2 rounded" />
        <div className="relative">
          <input type="text" placeholder="Produto" value={produto} onChange={(e) => {
            const nome = e.target.value;
            setProduto(nome);
            const encontrado = produtosCatalogo.find(p => p.name.toLowerCase() === nome.toLowerCase());
            if (encontrado) {
              setPrecoUnitario(encontrado.price);
            }
          }} list="lista-produtos" className="border p-2 rounded w-full" />
          <datalist id="lista-produtos">
            {produtosCatalogo.map((p) => (
              <option key={p.id} value={p.name} />
            ))}
          </datalist>
        </div>
        <input type="number" placeholder="Preço unitário" value={precoUnitario} onChange={(e) => setPrecoUnitario(Number(e.target.value))} className="border p-2 rounded" />
        <button onClick={adicionarItem} className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700">Adicionar</button>
      </div>

      <div className="mt-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Qtd</th>
              <th className="p-2 border">Produto</th>
              <th className="p-2 border">Preço Unit.</th>
              <th className="p-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, index) => (
              <tr key={index}>
                <td className="p-2 border">{item.quantidade}</td>
                <td className="p-2 border">{item.produto}</td>
                <td className="p-2 border">R$ {item.precoUnitario.toFixed(2)}</td>
                <td className="p-2 border">R$ {item.precoTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
