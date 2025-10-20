
import { NextResponse } from 'next/server';
import { criarPedidoVenda } from '@/lib/pedidos-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log("🔄 API Route - Recebendo requisição para criar pedido:", body);
    
    const resultado = await criarPedidoVenda(body);
    
    console.log("✅ API Route - Pedido criado com sucesso");
    
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('❌ API Route - Erro ao criar pedido:', {
      message: error.message
    });
    
    return NextResponse.json(
      { error: error.message || 'Erro ao criar pedido' },
      { status: 500 }
    );
  }
}
