import React from 'react';

interface BottomNavProps {
  activeTab: 'produtos' | 'adicionar' | 'orcamento' | 'clientes';
  setActiveTab: (tab: 'produtos' | 'adicionar' | 'orcamento' | 'clientes') => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-50 flex justify-around py-2">
      <button
        className={`flex flex-col items-center text-sm ${activeTab === 'produtos' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}
        onClick={() => setActiveTab('produtos')}
      >
        🛒
        <span>Produtos</span>
      </button>
      <button
        className={`flex flex-col items-center text-sm ${activeTab === 'adicionar' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}
        onClick={() => setActiveTab('adicionar')}
      >
        ➕
        <span>Adicionar</span>
      </button>
      <button
        onClick={() => setActiveTab('orcamento')}
        className={`flex flex-col items-center ${activeTab === 'orcamento' ? 'text-blue-600' : 'text-gray-500'}`}
      >
        🧾
        <span className="text-xs">Orçamento</span>
      </button>
      <button
        onClick={() => setActiveTab('clientes')}
        className={`flex flex-col items-center ${activeTab === 'clientes' ? 'text-blue-600' : 'text-gray-500'}`}
      >
        👤
        <span className="text-xs">Clientes</span>
      </button>
    </nav>
  );
}
