"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PedidoVendaFromLead from "@/components/pedido-venda-from-lead"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"

interface PedidoVendaRapidoProps {
  isOpen: boolean
  onClose: () => void
}

// Helper function to format currency (assuming this is available elsewhere or needs to be defined)
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
};

export default function PedidoVendaRapido({ isOpen, onClose }: PedidoVendaRapidoProps) {
  const [codVendUsuario, setCodVendUsuario] = useState("0")
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [tiposNegociacao, setTiposNegociacao] = useState<any[]>([])
  const [tiposOperacao, setTiposOperacao] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      carregarDadosIniciais()
    }
  }, [isOpen])

  const carregarDadosIniciais = async () => {
    setIsLoadingData(true)
    try {
      await Promise.all([
        carregarVendedorUsuario(),
        carregarTiposNegociacao(),
        carregarTiposOperacao()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error)
      toast.error('Erro ao carregar dados. Tente novamente.')
    } finally {
      setIsLoadingData(false)
    }
  }

  const carregarTiposNegociacao = async () => {
    try {
      const response = await fetch('/api/sankhya/tipos-negociacao')
      const data = await response.json()
      setTiposNegociacao(data.tiposNegociacao || [])
    } catch (error) {
      console.error('Erro ao carregar tipos de negociação:', error)
    }
  }

  const carregarTiposOperacao = async () => {
    try {
      const response = await fetch('/api/sankhya/tipos-negociacao?tipo=operacao')
      const data = await response.json()
      setTiposOperacao(data.tiposOperacao || [])
    } catch (error) {
      console.error('Erro ao carregar tipos de operação:', error)
    }
  }

  const carregarVendedorUsuario = () => {
    try {
      const userStr = document.cookie
        .split('; ')
        .find(row => row.startsWith('user='))
        ?.split('=')[1]

      if (userStr) {
        const user = JSON.parse(decodeURIComponent(userStr))
        
        if (user.codVendedor) {
          setCodVendUsuario(String(user.codVendedor))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar vendedor do usuário:', error)
    }
  }

  const dadosIniciais = {
    CODEMP: "1",
    CODCENCUS: "0",
    NUNOTA: "",
    MODELO_NOTA: "",
    DTNEG: new Date().toISOString().split('T')[0],
    DTFATUR: "",
    DTENTSAI: "",
    CODPARC: "",
    CODTIPOPER: "974",
    TIPMOV: "P",
    CODTIPVENDA: "1",
    CODVEND: codVendUsuario,
    OBSERVACAO: "",
    VLOUTROS: 0,
    VLRDESCTOT: 0,
    VLRFRETE: 0,
    TIPFRETE: "S",
    ORDEMCARGA: "",
    CODPARCTRANSP: "0",
    PERCDESC: 0,
    CODNAT: "0",
    TIPO_CLIENTE: "PJ",
    CPF_CNPJ: "",
    IE_RG: "",
    RAZAO_SOCIAL: "",
    RAZAOSOCIAL: "",
    itens: []
  }

  // State for product search
  const [produtos, setProdutos] = useState<any[]>([])
  const [showProdutoModal, setShowProdutoModal] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)


  const buscarProdutos = async (search: string) => {
    // Só busca se tiver pelo menos 2 caracteres
    if (search.length < 2) {
      setProdutos([])
      return
    }
    setIsLoadingProducts(true)
    try {
      const response = await fetch(`/api/sankhya/produtos?searchName=${encodeURIComponent(search)}&pageSize=20`)
      const data = await response.json()
      setProdutos(data.produtos || [])
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      setProdutos([])
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const buscarProdutosComDebounce = (search: string) => {
    // Limpar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Criar novo timeout
    const timeout = setTimeout(() => {
      buscarProdutos(search)
    }, 500) // 500ms de delay

    setSearchTimeout(timeout)
  }


  const handlePedidoSucesso = () => {
    toast.success("Pedido criado com sucesso!")
    onClose()
  }

  const handleCancelar = () => {
    onClose()
  }

  // Placeholder for selecionarProduto, assuming it's defined in PedidoVendaFromLead or elsewhere
  const selecionarProduto = (produto: any) => {
    console.log("Selecionando produto:", produto);
    // This function should ideally be passed down or handled within PedidoVendaFromLead
    // For now, we'll just log it.
  };

  const abrirModalNovoItem = () => {
    setItemAtual({
      CODPROD: "",
      QTDNEG: 1,
      VLRUNIT: 0,
      PERCDESC: 0,
      CODLOCALORIG: "700",
      CONTROLE: "007",
      AD_QTDBARRA: 1,
      CODVOL: "UN",
      IDALIQICMS: "0"
    })
    setCurrentItemIndex(null)
    setShowItemModal(true)
  }

  // Dummy states and functions for compilation, assuming they are defined in PedidoVendaFromLead
  const [itemAtual, setItemAtual] = useState<any>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-4 md:px-6 py-3 md:py-4 border-b flex-shrink-0">
          <DialogTitle className="text-base md:text-lg">Criar Pedido de Venda Rápido</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Carregando dados...</p>
            </div>
          ) : (
            <PedidoVendaFromLead
              dadosIniciais={dadosIniciais}
              onSuccess={handlePedidoSucesso}
              onCancel={handleCancelar}
            />
          )}
        </div>
      </DialogContent>

      {/* Modal de Seleção de Produto */}
      <Dialog open={showProdutoModal} onOpenChange={setShowProdutoModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-base">Selecionar Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Digite pelo menos 2 caracteres para buscar..."
              onChange={(e) => buscarProdutosComDebounce(e.target.value)}
              className="text-sm"
            />
            <div className="max-h-96 overflow-y-auto space-y-2">
              {produtos.length === 0 && !isLoadingProducts ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Digite pelo menos 2 caracteres para buscar produtos
                </div>
              ) : isLoadingProducts ? (
                <div className="flex items-center justify-center gap-2 py-8">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  <span>Buscando produtos...</span>
                </div>
              ) : (
                produtos.map((produto) => (
                  <Card
                    key={produto.CODPROD}
                    className="cursor-pointer hover:bg-green-50 transition-colors"
                    onClick={() => selecionarProduto(produto)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{produto.DESCRPROD}</p>
                          <p className="text-xs text-muted-foreground">Cód: {produto.CODPROD}</p>
                        </div>
                        <p className="font-bold text-sm text-green-700">
                          {formatCurrency(parseFloat(produto.VLRCOMERC || 0))}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Item - assuming this is where itemAtual and showItemModal are used */}
      {/* This part is a placeholder as the original code did not include it, but it's implied by the existence of abrirModalNovoItem and related states */}
      {showItemModal && (
        <Dialog open={showItemModal} onOpenChange={setShowItemModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentItemIndex !== null ? "Editar Item" : "Novo Item"}</DialogTitle>
            </DialogHeader>
            {/* Add form for item editing here, using itemAtual and updating it via setItemAtual */}
            <p>Item editing form would go here.</p>
            <button onClick={() => setShowItemModal(false)}>Close</button>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}