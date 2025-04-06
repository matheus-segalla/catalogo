import React from 'react';

interface Props {
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDeleteModal({ onConfirm, onCancel }: Props) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg relative">
                {/* Botão fechar (X) */}
                <button
                    className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl"
                    onClick={onCancel}
                >
                    ×
                </button>

                <h2 className="text-lg font-semibold mb-4 text-center">
                    Tem certeza que deseja excluir este produto?
                </h2>

                <div className="flex justify-between mt-6">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                        Não
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                    >
                        Sim
                    </button>
                </div>
            </div>
        </div>
    );
}
