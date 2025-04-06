import React from 'react';

type Aba = 'produtos' | 'adicionar' | 'orcamento' | 'clientes';

export function Header({
  activeTab,
  setActiveTab,
}: {
  activeTab: Aba;
  setActiveTab: React.Dispatch<React.SetStateAction<Aba>>;
}) {
  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl sm:text-2xl font-bold">
        <span className="text-orange-600">BENEVIS </span>
        <span className="text-blue-600">Materiais para Construção</span>
      </h1>

      <nav className="flex gap-3">
        <button
          className={`px-4 py-2 rounded text-sm font-semibold border border-red-500 ${activeTab === 'produtos'
            ? 'bg-red-500 text-white'
            : 'text-red-600 hover:bg-red-50'
            }`}
          onClick={() => setActiveTab('produtos')}
        >
          Produtos
        </button>

        <button
          className={`px-4 py-2 rounded text-sm font-semibold border border-orange-500 ${activeTab === 'adicionar'
            ? 'bg-orange-500 text-white'
            : 'text-orange-600 hover:bg-orange-50'
            }`}
          onClick={() => setActiveTab('adicionar')}
        >
          Cadastrar
        </button>

        <button
          className={`px-4 py-2 rounded text-sm font-semibold border border-blue-500 ${activeTab === 'orcamento'
            ? 'bg-blue-600 text-white'
            : 'text-blue-600 hover:bg-blue-50'
            }`}
          onClick={() => setActiveTab('orcamento')}
        >
          Orçamento
        </button>

        <button
          className={`px-4 py-2 rounded text-sm font-semibold border border-green-500 ${activeTab === 'clientes'
            ? 'bg-green-600 text-white'
            : 'text-green-600 hover:bg-green-50'
            }`}
          onClick={() => setActiveTab('clientes')}
        >
          Clientes
        </button>
      </nav>
    </header>
  );
}
